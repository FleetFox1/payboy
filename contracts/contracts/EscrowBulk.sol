// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// --- OpenZeppelin security modules ---
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title EscrowBulk Contract for PayBoy
/// @notice Handles batch escrows with payer, payee, arbiter, and optional platform fee
/// @dev Inherits OpenZeppelin Ownable, Pausable, ReentrancyGuard for security
contract EscrowBulk is Ownable, Pausable, ReentrancyGuard {
    struct Escrow {
        address token;
        address payer;
        address payee;
        address arbiter;
        uint256 amount;
        uint256 deadline;
        uint8 status; // 0:Created, 1:Funded, 2:Released, 3:Refunded, 4:Disputed, 5:Resolved
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;

    address public platform;
    uint256 public platformFeeBps; // e.g. 100 = 1%

    event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed payee, uint256 amount);
    event Funded(uint256 indexed escrowId, address indexed payer, uint256 amount);
    event Released(uint256 indexed escrowId, address indexed payee, uint256 amount);
    event Refunded(uint256 indexed escrowId, address indexed payer, uint256 amount);
    event Disputed(uint256 indexed escrowId, address indexed by, string reason);
    event Resolved(uint256 indexed escrowId, bool released);

    // --- Dev Notes ---
    // - Only payer can fund. Only payee or arbiter can release. Refund allowed by payer, arbiter, or after deadline.
    // - Platform fee (if set) is sent to platform address on release.
    // - Contract can be paused by owner (platform) in emergencies.
    // - ReentrancyGuard prevents double-spend bugs.

    constructor(address _platform, uint256 _platformFeeBps) Ownable(_platform) {
        platform = _platform;
        platformFeeBps = _platformFeeBps;
    }

    function createEscrow(
        address token,
        address payer,
        address payee,
        uint256 amount,
        uint256 deadline,
        address arbiter
    ) external returns (uint256 escrowId) {
        escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow(token, payer, payee, arbiter, amount, deadline, 0);
        emit EscrowCreated(escrowId, payer, payee, amount);
    }

    function fund(uint256 escrowId) external whenNotPaused nonReentrant {
        Escrow storage e = escrows[escrowId];
        require(e.status == 0, "Not fundable");
        require(msg.sender == e.payer, "Only payer");
        e.status = 1;
        require(IERC20(e.token).transferFrom(msg.sender, address(this), e.amount), "Transfer failed");
        emit Funded(escrowId, msg.sender, e.amount);
    }

    function release(uint256 escrowId) external whenNotPaused nonReentrant {
        Escrow storage e = escrows[escrowId];
        require(e.status == 1, "Not funded");
        require(msg.sender == e.payee || msg.sender == e.arbiter, "Not allowed");
        e.status = 2;
        uint256 fee = (e.amount * platformFeeBps) / 10000;
        uint256 payout = e.amount - fee;
        if (fee > 0 && platform != address(0)) {
            require(IERC20(e.token).transfer(platform, fee), "Fee transfer failed");
        }
        require(IERC20(e.token).transfer(e.payee, payout), "Transfer failed");
        emit Released(escrowId, e.payee, payout);
    }

    function refund(uint256 escrowId) external whenNotPaused nonReentrant {
        Escrow storage e = escrows[escrowId];
        require(e.status == 1, "Not funded");
        require(
            msg.sender == e.payer || msg.sender == e.arbiter || block.timestamp > e.deadline,
            "Not allowed"
        );
        e.status = 3;
        require(IERC20(e.token).transfer(e.payer, e.amount), "Transfer failed");
        emit Refunded(escrowId, e.payer, e.amount);
    }

    function openDispute(uint256 escrowId, string calldata reason) external whenNotPaused {
        Escrow storage e = escrows[escrowId];
        require(e.status == 1, "Not funded");
        require(msg.sender == e.payer || msg.sender == e.payee, "Not allowed");
        e.status = 4;
        emit Disputed(escrowId, msg.sender, reason);
    }

    function arbiterResolve(uint256 escrowId, bool _release) external whenNotPaused nonReentrant {
        Escrow storage e = escrows[escrowId];
        require(msg.sender == e.arbiter, "Not arbiter");
        require(e.status == 4, "Not disputed");
        e.status = 5;
        if (_release) {
            uint256 fee = (e.amount * platformFeeBps) / 10000;
            uint256 payout = e.amount - fee;
            if (fee > 0 && platform != address(0)) {
                require(IERC20(e.token).transfer(platform, fee), "Fee transfer failed");
            }
            require(IERC20(e.token).transfer(e.payee, payout), "Transfer failed");
            emit Released(escrowId, e.payee, payout);
            emit Resolved(escrowId, true);
        } else {
            require(IERC20(e.token).transfer(e.payer, e.amount), "Transfer failed");
            emit Refunded(escrowId, e.payer, e.amount);
            emit Resolved(escrowId, false);
        }
    }

    /// @notice Pause contract (owner only)
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause contract (owner only)
    function unpause() external onlyOwner {
        _unpause();
    }
}

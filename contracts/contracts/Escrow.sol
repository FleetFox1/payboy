// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


// --- OpenZeppelin security modules ---
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Escrow Contract for PayBoy
/// @notice Handles escrowed payments with payer, payee, arbiter, and optional platform fee
/// @dev Inherits OpenZeppelin Ownable, Pausable, ReentrancyGuard for security
contract Escrow is Ownable, Pausable, ReentrancyGuard {
    address public token;
    address public payer;
    address public payee;
    address public arbiter;
    uint256 public amount;
    uint256 public deadline;
    address public platform;
    uint256 public platformFeeBps; // e.g. 100 = 1%
    enum Status { Created, Funded, Released, Refunded, Disputed, Resolved }
    Status public status;

    event Funded(address indexed payer, uint256 amount);
    event Released(address indexed payee, uint256 amount);
    event Refunded(address indexed payer, uint256 amount);
    event Disputed(address indexed by, string reason);
    event Resolved(bool released);

    // --- Dev Notes ---
    // - Only payer can fund. Only payee or arbiter can release. Refund allowed by payer, arbiter, or after deadline.
    // - Platform fee (if set) is sent to platform address on release.
    // - Contract can be paused by owner (platform) in emergencies.
    // - ReentrancyGuard prevents double-spend bugs.


    constructor(
        address _token,
        address _payer,
        address _payee,
        uint256 _amount,
        uint256 _deadline,
        address _arbiter,
        address _platform,
        uint256 _platformFeeBps
    ) Ownable(_platform) {
        token = _token;
        payer = _payer;
        payee = _payee;
        amount = _amount;
        deadline = _deadline;
        arbiter = _arbiter;
        platform = _platform;
        platformFeeBps = _platformFeeBps;
        status = Status.Created;
    }


    /// @notice Fund the escrow (payer only)
    function fund() external whenNotPaused nonReentrant {
        require(status == Status.Created, "Not fundable");
        require(msg.sender == payer, "Only payer");
        status = Status.Funded;
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Funded(msg.sender, amount);
    }


    /// @notice Release funds to payee (payee or arbiter)
    function release() external whenNotPaused nonReentrant {
        require(status == Status.Funded, "Not funded");
        require(msg.sender == payee || msg.sender == arbiter, "Not allowed");
        status = Status.Released;
        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 payout = amount - fee;
        if (fee > 0 && platform != address(0)) {
            require(IERC20(token).transfer(platform, fee), "Fee transfer failed");
        }
        require(IERC20(token).transfer(payee, payout), "Transfer failed");
        emit Released(payee, payout);
    }


    /// @notice Refund funds to payer (payer, arbiter, or after deadline)
    function refund() external whenNotPaused nonReentrant {
        require(status == Status.Funded, "Not funded");
        require(
            msg.sender == payer || msg.sender == arbiter || block.timestamp > deadline,
            "Not allowed"
        );
        status = Status.Refunded;
        require(IERC20(token).transfer(payer, amount), "Transfer failed");
        emit Refunded(payer, amount);
    }


    /// @notice Open a dispute (payer or payee)
    function openDispute(string calldata reason) external whenNotPaused {
        require(status == Status.Funded, "Not funded");
        require(msg.sender == payer || msg.sender == payee, "Not allowed");
        status = Status.Disputed;
        emit Disputed(msg.sender, reason);
    }


    /// @notice Arbiter resolves dispute (releases or refunds)
    function arbiterResolve(bool _release) external whenNotPaused nonReentrant {
        require(msg.sender == arbiter, "Not arbiter");
        require(status == Status.Disputed, "Not disputed");
        status = Status.Resolved;
        if (_release) {
            uint256 fee = (amount * platformFeeBps) / 10000;
            uint256 payout = amount - fee;
            if (fee > 0 && platform != address(0)) {
                require(IERC20(token).transfer(platform, fee), "Fee transfer failed");
            }
            require(IERC20(token).transfer(payee, payout), "Transfer failed");
            emit Released(payee, payout);
            emit Resolved(true);
        } else {
            require(IERC20(token).transfer(payer, amount), "Transfer failed");
            emit Refunded(payer, amount);
            emit Resolved(false);
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

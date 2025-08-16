// --- Dev Notes ---
// - This contract is intended to be deployed via a factory and initialized once.
// - Only payer can fund. Only payee or arbiter can release. Refund allowed by payer, arbiter, or after deadline.
// - Consider adding OpenZeppelin Ownable/Pausable/ReentrancyGuard for production security.
// - Platform fee logic can be added if needed (see Escrow.sol for example).

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EscrowVault {
    enum Status { Created, Funded, Released, Refunded, Disputed, Resolved }

    address public factory;
    address public token;
    address public payer;
    address public payee;
    address public arbiter;
    uint256 public amount;
    uint256 public deadline;
    Status public status;

    event Funded(address indexed payer, uint256 amount);
    event Released(address indexed payee, uint256 amount);
    event Refunded(address indexed payer, uint256 amount);
    event Disputed(address indexed by, string reason);
    event Resolved(bool released);

    modifier onlyPayer() { require(msg.sender == payer, "Not payer"); _; }
    modifier onlyPayee() { require(msg.sender == payee, "Not payee"); _; }
    modifier onlyArbiter() { require(msg.sender == arbiter, "Not arbiter"); _; }
    modifier onlyFactory() { require(msg.sender == factory, "Not factory"); _; }

    constructor() { factory = msg.sender; }

    function initialize(
        address _token,
        address _payer,
        address _payee,
        uint256 _amount,
        uint256 _deadline,
        address _arbiter
    ) external onlyFactory {
        require(token == address(0), "Already initialized");
        token = _token;
        payer = _payer;
        payee = _payee;
        amount = _amount;
        deadline = _deadline;
        arbiter = _arbiter;
        status = Status.Created;
    }

    function fund() external {
        require(status == Status.Created, "Not fundable");
        require(msg.sender == payer, "Only payer");
        status = Status.Funded;
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Funded(msg.sender, amount);
    }

    function release() external {
        require(status == Status.Funded, "Not funded");
        require(msg.sender == payee || msg.sender == arbiter, "Not allowed");
        status = Status.Released;
        require(IERC20(token).transfer(payee, amount), "Transfer failed");
        emit Released(payee, amount);
    }

    function refund() external {
        require(status == Status.Funded, "Not funded");
        require(
            msg.sender == payer || msg.sender == arbiter || block.timestamp > deadline,
            "Not allowed"
        );
        status = Status.Refunded;
        require(IERC20(token).transfer(payer, amount), "Transfer failed");
        emit Refunded(payer, amount);
    }

    function openDispute(string calldata reason) external {
        require(status == Status.Funded, "Not funded");
        require(msg.sender == payer || msg.sender == payee, "Not allowed");
        status = Status.Disputed;
        emit Disputed(msg.sender, reason);
    }

    function arbiterResolve(bool _release) external onlyArbiter {
        require(status == Status.Disputed, "Not disputed");
        status = Status.Resolved;
        if (_release) {
            require(IERC20(token).transfer(payee, amount), "Transfer failed");
            emit Released(payee, amount);
            emit Resolved(true);
        } else {
            require(IERC20(token).transfer(payer, amount), "Transfer failed");
            emit Refunded(payer, amount);
            emit Resolved(false);
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EscrowBulk {
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

    event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed payee, uint256 amount);
    event Funded(uint256 indexed escrowId, address indexed payer, uint256 amount);
    event Released(uint256 indexed escrowId, address indexed payee, uint256 amount);
    event Refunded(uint256 indexed escrowId, address indexed payer, uint256 amount);
    event Disputed(uint256 indexed escrowId, address indexed by, string reason);
    event Resolved(uint256 indexed escrowId, bool released);

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

    function fund(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.status == 0, "Not fundable");
        require(msg.sender == e.payer, "Only payer");
        e.status = 1;
        require(IERC20(e.token).transferFrom(msg.sender, address(this), e.amount), "Transfer failed");
        emit Funded(escrowId, msg.sender, e.amount);
    }

    function release(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.status == 1, "Not funded");
        require(msg.sender == e.payee || msg.sender == e.arbiter, "Not allowed");
        e.status = 2;
        require(IERC20(e.token).transfer(e.payee, e.amount), "Transfer failed");
        emit Released(escrowId, e.payee, e.amount);
    }

    function refund(uint256 escrowId) external {
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

    function openDispute(uint256 escrowId, string calldata reason) external {
        Escrow storage e = escrows[escrowId];
        require(e.status == 1, "Not funded");
        require(msg.sender == e.payer || msg.sender == e.payee, "Not allowed");
        e.status = 4;
        emit Disputed(escrowId, msg.sender, reason);
    }

    function arbiterResolve(uint256 escrowId, bool _release) external {
        Escrow storage e = escrows[escrowId];
        require(msg.sender == e.arbiter, "Not arbiter");
        require(e.status == 4, "Not disputed");
        e.status = 5;
        if (_release) {
            require(IERC20(e.token).transfer(e.payee, e.amount), "Transfer failed");
            emit Released(escrowId, e.payee, e.amount);
            emit Resolved(escrowId, true);
        } else {
            require(IERC20(e.token).transfer(e.payer, e.amount), "Transfer failed");
            emit Refunded(escrowId, e.payer, e.amount);
            emit Resolved(escrowId, false);
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./EscrowVault.sol";

contract EscrowFactory {
    address public vaultImpl;
    event EscrowCreated(address indexed escrow, address indexed token, address indexed payer, address payee, uint256 amount);

    constructor(address _vaultImpl) {
        vaultImpl = _vaultImpl;
    }

    function createEscrow(
        address token,
        address payer,
        address payee,
        uint256 amount,
        uint256 autoReleaseAfter,
        address arbiter
    ) external returns (address escrow) {
        bytes32 salt = keccak256(abi.encode(token, payer, payee, amount, autoReleaseAfter, arbiter, block.timestamp));
        bytes memory bytecode = type(EscrowVault).creationCode;
        assembly {
            escrow := create2(0, add(bytecode, 32), mload(bytecode), salt)
            if iszero(extcodesize(escrow)) { revert(0, 0) }
        }
        EscrowVault(escrow).initialize(token, payer, payee, amount, autoReleaseAfter, arbiter);
        emit EscrowCreated(escrow, token, payer, payee, amount);
    }
}

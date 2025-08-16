// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// --- OpenZeppelin security modules ---
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MerchantRegistry Contract for PayBoy
/// @notice Handles merchant registration and updates
/// @dev Inherits OpenZeppelin Ownable for admin control
contract MerchantRegistry is Ownable {
    struct Merchant {
        address owner;
        uint256 feeBps;
        uint256 chainPref;
        bool exists;
    }

    mapping(address => Merchant) public merchants;
    event MerchantCreated(address indexed owner, uint256 feeBps, uint256 chainPref);
    event MerchantUpdated(address indexed owner, uint256 feeBps, uint256 chainPref);

    // --- Dev Notes ---
    // - Only the merchant (msg.sender) can create or update their own record.
    // - Only the contract owner (platform) can add admin features if needed.

    function createMerchant(uint256 feeBps, uint256 chainPref) external {
        require(!merchants[msg.sender].exists, "Already registered");
        merchants[msg.sender] = Merchant(msg.sender, feeBps, chainPref, true);
        emit MerchantCreated(msg.sender, feeBps, chainPref);
    }

    function updateMerchant(uint256 feeBps, uint256 chainPref) external {
        require(merchants[msg.sender].exists, "Not registered");
        merchants[msg.sender].feeBps = feeBps;
        merchants[msg.sender].chainPref = chainPref;
        emit MerchantUpdated(msg.sender, feeBps, chainPref);
    }

    function getMerchant(address owner) external view returns (Merchant memory) {
        require(merchants[owner].exists, "Not registered");
        return merchants[owner];
    }

    /// @notice (Optional) Add admin-only functions here using onlyOwner modifier
}

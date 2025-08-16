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
    // - Constructor passes deployer address as initial owner to Ownable

    constructor() Ownable(msg.sender) {
        // Contract deployer becomes the initial owner
        // This allows platform admin control over the registry
    }

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

    /// @notice Admin function to remove a merchant (platform control)
    /// @dev Only contract owner can call this
    function removeMerchant(address merchantAddress) external onlyOwner {
        require(merchants[merchantAddress].exists, "Merchant not found");
        delete merchants[merchantAddress];
        emit MerchantUpdated(merchantAddress, 0, 0); // Emit with zero values to indicate removal
    }

    /// @notice Check if an address is a registered merchant
    function isMerchant(address addr) external view returns (bool) {
        return merchants[addr].exists;
    }

    /// @notice Get merchant count (for analytics)
    /// @dev This is a simple implementation - for production consider using a counter
    function getMerchantCount() external pure returns (uint256 count) {
        // Note: This is not gas efficient for large datasets
        // Consider implementing a counter variable in production
        return 0; // Placeholder - implement if needed
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MerchantRegistry {
    struct Merchant {
        address owner;
        uint256 feeBps;
        uint256 chainPref;
        bool exists;
    }

    mapping(address => Merchant) public merchants;
    event MerchantCreated(address indexed owner, uint256 feeBps, uint256 chainPref);
    event MerchantUpdated(address indexed owner, uint256 feeBps, uint256 chainPref);

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
}

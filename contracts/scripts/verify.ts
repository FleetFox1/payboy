// --- Dev Notes ---
// This script verifies deployed contracts on Etherscan/Arbiscan using Hardhat's verify task.
// Usage:
//   pnpm hardhat verify --network <network> <contractAddress> <constructorArgs...>
// You may need to set ETHERSCAN_API_KEY or ARBISCAN_API_KEY in your .env file.
//
// Example for EscrowFactory:
//   pnpm hardhat verify --network arbitrumSepolia 0xFactoryAddress 0xVaultImplAddress
//
// You can also automate verification here if you deploy multiple contracts in a script.

import { run } from "hardhat";

async function main() {
	// Example: verify EscrowFactory
	// await run("verify:verify", {
	//   address: "0xFactoryAddress",
	//   constructorArguments: ["0xVaultImplAddress"]
	// });
}

main().catch((e) => { console.error(e); process.exit(1); });

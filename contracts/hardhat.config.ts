import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    arbitrumSepolia: {
    url: process.env.ARB_SEPOLIA_RPC || "",
    accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
    type: "http",
    },
    arbitrumOne: {
    url: process.env.ARB_ONE_RPC || "",
    accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
    type: "http",
    },
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
    },
  },
};

export default config;

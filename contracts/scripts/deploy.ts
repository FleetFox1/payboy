import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Vault = await ethers.getContractFactory("EscrowVault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("EscrowVault impl:", vaultAddr);

  const Factory = await ethers.getContractFactory("EscrowFactory");
  const factory = await Factory.deploy(vaultAddr);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log("EscrowFactory:", factoryAddr);
}

main().catch((e) => { console.error(e); process.exit(1); });

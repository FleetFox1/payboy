import { ethers } from "hardhat";

/**
 * Assumptions from your repo:
 * - EscrowFactory has a function like: createEscrow(address buyer, address seller)
 * - It emits an event with the new escrow address (often EscrowCreated(address escrow, ...))
 * - EscrowVault supports deposit (payable) and release (seller gets paid)
 *
 * If your actual function or event names differ, this script tries to decode the
 * new escrow address from any event that has an address param that looks like an escrow.
 */

async function main() {
  // --------- CONFIG: PUT YOUR FACTORY ADDRESS HERE ----------
  const FACTORY_ADDR = "0xREPLACE_WITH_YOUR_FACTORY_ADDRESS";
  // ----------------------------------------------------------

  if (!ethers.isAddress(FACTORY_ADDR)) {
    throw new Error("FACTORY_ADDR is not a valid address. Replace it at the top of this script.");
  }

  // Get 3 signers for demo: deployer, buyer, seller
  // (If your RPC only exposes one funded key, you can reuse the deployer as buyer/seller)
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const buyer = signers[1] ?? deployer;
  const seller = signers[2] ?? deployer;

  console.log("Deployer:", deployer.address);
  console.log("Buyer   :", buyer.address);
  console.log("Seller  :", seller.address);

  // Attach to the factory
  const factory = await ethers.getContractAt("EscrowFactory", FACTORY_ADDR);

  // --- 1) CREATE A NEW ESCROW ---
  console.log("\nCreating a new escrow from factory...");
  // try common signatures; adjust if your factory uses a different one
  let createTx;
  try {
    // Most likely shape
    createTx = await (factory as any).createEscrow(buyer.address, seller.address);
  } catch (e) {
    // Fallback: if your factory expects different args, adjust here
    throw new Error(
      "Factory.createEscrow(...) call failed. Check the function signature on your EscrowFactory."
    );
  }
  const createRcpt = await createTx.wait();
  console.log("createEscrow tx:", createRcpt?.hash);

  // Try to extract the new escrow address from logs using the factory's interface
  let newEscrowAddress: string | undefined;
  try {
    const factoryIface = (factory as any).interface;
    for (const log of createRcpt!.logs) {
      try {
        const parsed = factoryIface.parseLog(log);
        // Common event names you might have:
        // - "EscrowCreated(address escrow, address buyer, address seller)"
        // - or similar shape where first arg is the escrow address
        if (
          parsed?.name?.toLowerCase().includes("escrow") &&
          parsed?.args &&
          parsed.args.length > 0 &&
          ethers.isAddress(parsed.args[0])
        ) {
          newEscrowAddress = parsed.args[0];
          break;
        }
      } catch {
        // not a factory event, ignore
      }
    }
  } catch {
    // ignore; we'll fallback below
  }

  // Fallback: if event parsing didn’t work, ask you to paste the address manually
  if (!newEscrowAddress) {
    throw new Error(
      "Could not parse the new escrow address from the factory event logs. " +
        "Open your EscrowFactory and confirm the event name/args in createEscrow; " +
        "then update the parsing logic above accordingly."
    );
  }

  console.log("New Escrow deployed at:", newEscrowAddress);

  // Attach to the new escrow (EscrowVault)
  const escrow = await ethers.getContractAt("EscrowVault", newEscrowAddress);

  // --- 2) DEPOSIT FUNDS ---
  console.log("\nDepositing 0.05 ETH into escrow from buyer...");
  // Try common method names: deposit() or fund() (payable)
  const amount = ethers.parseEther("0.05");

  // Prefer 'deposit' if it exists, else try 'fund'
  let depositTx;
  try {
    depositTx = await (escrow as any).connect(buyer).deposit({ value: amount });
  } catch (e1) {
    try {
      depositTx = await (escrow as any).connect(buyer).fund({ value: amount });
    } catch (e2) {
      throw new Error(
        "Neither escrow.deposit nor escrow.fund worked. Check your EscrowVault payable deposit method name."
      );
    }
  }
  const depositRcpt = await depositTx.wait();
  console.log("Deposit tx:", depositRcpt?.hash);

  // --- 3) RELEASE FUNDS ---
  console.log("\nReleasing funds to seller...");
  // Try common method names: release(), releaseToSeller(), payout()
  let releaseTx;
  try {
    releaseTx = await (escrow as any).connect(deployer).release();
  } catch (e1) {
    try {
      releaseTx = await (escrow as any).connect(deployer).releaseToSeller();
    } catch (e2) {
      try {
        releaseTx = await (escrow as any).connect(deployer).payout();
      } catch (e3) {
        throw new Error(
          "Could not find a release method (release / releaseToSeller / payout). Check your EscrowVault function names."
        );
      }
    }
  }
  const releaseRcpt = await releaseTx.wait();
  console.log("Release tx:", releaseRcpt?.hash);

  // Optional: show escrow balance after
  const bal = await ethers.provider.getBalance(newEscrowAddress);
  console.log("Escrow balance after release:", ethers.formatEther(bal), "ETH");

  console.log("\n✅ Escrow flow complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

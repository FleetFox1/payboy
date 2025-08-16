import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const outDir = resolve("src/lib/abi");
await mkdir(outDir, { recursive: true });

await cp("contracts/artifacts/contracts/EscrowFactory.sol/EscrowFactory.json", resolve(outDir, "EscrowFactory.json"));
await cp("contracts/artifacts/contracts/EscrowVault.sol/EscrowVault.json", resolve(outDir, "EscrowVault.json"));

console.log("✅ ABIs copied to src/lib/abi");

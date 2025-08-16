import { NextRequest, NextResponse } from "next/server";
// import { getDb } from "@/src/lib/db";
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  // const db = await getDb();
  // const { rows } = await db.query("select token_addr, amount, address from escrows where id=$1", [params.id]);
  // if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // const { token_addr, amount, address: escrowAddr } = rows[0];
  // TODO: if no escrowAddr yet, return calldata to Factory.createEscrow + fund()
  return NextResponse.json({
    needsApproval: true,
    approve: { to: "0xToken", data: "0x" }, // fill via ABI encode
    fund: { to: "0xEscrowOrFactory", data: "0x" },
    amount: "1000000",
    token: { address: "0xToken", symbol: "PYUSD", decimals: 6 }
  });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// import { getDb } from "@/src/lib/db";

const Schema = z.object({
  tokenAddr: z.string().min(42),
  amount: z.string().regex(/^[0-9]+$/),
  payer: z.string().optional(),
  payee: z.string(),
  rule: z.object({ type: z.enum(["delivery", "deadline"]), days: z.number().int().positive().optional() })
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = Schema.parse(body);
  // const db = await getDb();
  const id = crypto.randomUUID();
  // await db.query(
  //   `insert into escrows (id, chain_id, token_addr, amount, payee, status, rule)
  //    values ($1,$2,$3,$4,$5,$6,$7)`,
  //   [id, 421614, data.tokenAddr, data.amount, data.payee, "created", data.rule]
  // );
  return NextResponse.json({ id, escrowAddress: null, chainId: 421614, checkoutUrl: `/checkout/${id}` });
}

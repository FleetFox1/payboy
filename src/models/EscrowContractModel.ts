// EscrowContractModel.ts
export interface EscrowContract {
  id: string;
  address: string;
  chain_id: number;
  token_addr: string;
  token_symbol: string;
  token_decimals: number;
  amount: string;
  payer: string;
  payee: string;
  arbiter: string;
  status: string;
  rule: any;
  tx_funded?: string;
  tx_release?: string;
  tx_refund?: string;
  created_at: Date;
}

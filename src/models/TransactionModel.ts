// TransactionModel.ts
export interface Transaction {
  id: string;
  escrow_id: string;
  from: string;
  to: string;
  amount: string;
  token_addr: string;
  txhash: string;
  type: string;
  created_at: Date;
}

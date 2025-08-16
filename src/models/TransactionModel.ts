// TransactionModel.ts
export interface Transaction {
  id: string;
  escrowId: string; // Changed from escrow_id to camelCase
  fromAddress: string; // Changed from 'from' (reserved keyword)
  toAddress: string; // Changed from 'to' (reserved keyword)
  amount: string;
  tokenAddress: string; // Changed from token_addr to camelCase
  txHash: string; // Changed from txhash to camelCase
  type: 'fund' | 'release' | 'refund' | 'dispute'; // More specific types
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  createdAt: Date; // Changed from created_at to camelCase
  updatedAt: Date;
}

export interface CreateTransactionRequest {
  escrowId: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  tokenAddress: string;
  txHash: string;
  type: 'fund' | 'release' | 'refund' | 'dispute';
}
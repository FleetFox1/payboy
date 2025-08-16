// EventModel.ts
export interface EventLog {
  id: number;
  escrow_addr: string;
  type: string;
  block: number;
  txhash: string;
  raw: any;
  seen_at: Date;
}

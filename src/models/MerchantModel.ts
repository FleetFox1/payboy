// MerchantModel.ts
export interface Merchant {
  id: string;
  user_id: string;
  fee_bps: number;
  chain_pref: number;
}

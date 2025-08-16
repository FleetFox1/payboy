// UserModel.ts
export interface User {
  id: string;
  email: string;
  address: string;
  ens?: string;
  avatar?: string;
  created_at: Date;
}

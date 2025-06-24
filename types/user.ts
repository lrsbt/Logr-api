export interface User {
  id: number;
  username: string;
  password_hash: string;
  api_key: string;
  created_at?: string;
}

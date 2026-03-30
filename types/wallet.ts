import { Currency } from './index';

export interface Wallet {
  id: string;
  user_id: string;
  currency: Currency;
  balance: number;
  country_code: string;
  created_at: string;
  updated_at: string;
}

export interface WalletBalanceHistory {
  date: string;
  balance: number;
}

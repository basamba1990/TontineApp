import { Currency } from './index';

export type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'tontine_payment' | 'tontine_payout';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  receiver_id?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  country_code: string;
  preferred_currency: string;
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

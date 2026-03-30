import { Currency } from '../types';

export const CURRENCY_CONFIG: Record<Currency, { symbol: string; name: string; locale: string }> = {
  XOF: { symbol: 'CFA', name: 'Franc CFA', locale: 'fr-FR' },
  EUR: { symbol: '€', name: 'Euro', locale: 'fr-FR' },
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.XOF;
  
  // Custom formatting for CFA since Intl.NumberFormat might not be perfect on all platforms
  if (currency === 'XOF') {
    return `${amount.toLocaleString(config.locale)} ${config.symbol}`;
  }

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const convertCurrency = async (amount: number, from: Currency, to: Currency): Promise<number> => {
  if (from === to) return amount;
  
  // In a real app, this would call an exchange rate API or Supabase Edge Function
  // Mock conversion rates for now
  const rates: Record<string, number> = {
    'EUR_XOF': 655.957,
    'XOF_EUR': 1 / 655.957,
    'USD_XOF': 600,
    'XOF_USD': 1 / 600,
    'EUR_USD': 1.08,
    'USD_EUR': 1 / 1.08,
  };

  const pair = `${from}_${to}`;
  if (rates[pair]) return amount * rates[pair];
  
  // Default to 1:1 if rate not found
  return amount;
};

export * from './wallet';
export * from './transaction';
export * from './user';

export type Currency = 'XOF' | 'EUR' | 'USD' | 'CAD' | 'GBP';

export interface AppTheme {
  isDark: boolean;
  colors: {
    bg: string;
    card: string;
    text: string;
    primary: string;
    secondary: string;
    success: string;
    error: string;
    warning: string;
    border: string;
    muted: string;
  };
}

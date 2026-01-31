export type Id = string;

export type Money = {
  currency: string; // "usd", "usdc", etc.
  amount: number; // minor units for fiat (cents), whole units for crypto in MVP
};


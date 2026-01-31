export const formatCurrency = (
  amountCents?: number,
  currency: string = "USD",
): string => {
  if (typeof amountCents !== "number") {
    return "TBD";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
};

export const formatCrypto = (amount?: number, symbol: string = "USDC"): string => {
  if (typeof amount !== "number") {
    return "TBD";
  }
  return `${amount.toFixed(4)} ${symbol}`;
};

export const formatDate = (value: string): string => {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const clampText = (value: string, max = 120): string =>
  value.length > max ? `${value.slice(0, max)}...` : value;

export const ensureArray = <T,>(value: T[] | undefined): T[] => value ?? [];

export const randomBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

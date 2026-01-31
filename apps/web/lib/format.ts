export function formatMoney(amount: number | null | undefined, currency: string | null | undefined) {
  const c = (currency ?? "usd").toUpperCase();
  const a = amount ?? 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c,
    }).format(a / 100);
  } catch {
    return `${c} ${(a / 100).toFixed(2)}`;
  }
}


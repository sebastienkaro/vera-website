export function formatMoney(money: { amount: number; currencyCode: string }): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
    maximumFractionDigits: 0,
  }).format(money.amount);
}

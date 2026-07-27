export function formatMoney(money: { amount: number; currencyCode: string }): string {
  // Equipment is priced in round numbers and reads better without ".00", but
  // Shopify prices don't have to be whole — show cents only when there are any,
  // so a $129.99 accessory isn't advertised as $130.
  const hasCents = Math.round(money.amount * 100) % 100 !== 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(money.amount);
}

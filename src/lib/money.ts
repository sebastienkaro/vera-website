export function formatMoney(money: { amount: number; currencyCode: string }): string {
  // Machines and grinders are priced in whole dollars and read better without
  // a trailing ".00". Spare parts are priced to the cent — a $0.50 snap ring
  // or a $2.13 nut rounds to a wrong, and faintly absurd, whole dollar — so
  // cents are shown whenever there are any.
  const hasCents = !Number.isInteger(money.amount);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(money.amount);
}

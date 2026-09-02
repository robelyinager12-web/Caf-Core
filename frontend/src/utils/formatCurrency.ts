export function formatCurrency(amount: number): string {
  // Intl.NumberFormat's ETB currency support varies by browser/locale
  // (some render "ETB", others "Br", spacing differs) — formatting
  // manually here guarantees consistent output everywhere in the app
  // regardless of the user's browser locale.
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `Br ${formattedNumber}`;
}
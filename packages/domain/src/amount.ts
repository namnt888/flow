/**
 * Convert amount (stored as value * 100) to human-readable VND string.
 * Example: 15000000 → "150,000"
 */
export function formatAmount(amount: number): string {
  const num = amount / 100;
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

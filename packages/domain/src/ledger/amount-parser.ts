/**
 * Parse a math expression string into a positive rounded number.
 *
 * Supports +, -, *, / operators and parentheses.
 *
 * Examples:
 *   "5*10"      → 50
 *   "1000+200"  → 1200
 *   "500/2"     → 250
 *   "-100"      → throws (negative)
 *   "10/0"      → throws (division by zero)
 */
export function parseAmountExpression(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Amount expression is empty');
  }

  // Strip thousand separators (commas, dots, spaces) before validation
  const sanitized = trimmed.replace(/[,.\s]/g, '');
  if (!/^[\d+\-*/().]+$/.test(sanitized)) {
    throw new Error('Invalid characters in amount expression');
  }

  // Block division by zero
  if (sanitized.includes('/0')) {
    throw new Error('Division by zero is not allowed');
  }

  let result: number;
  try {
    result = new Function(`"use strict"; return (${sanitized})`)();
  } catch {
    throw new Error('Invalid mathematical expression');
  }

  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error('Invalid calculation result');
  }
  if (result < 0) {
    throw new Error('Amount cannot be negative');
  }

  return Math.round(result);
}

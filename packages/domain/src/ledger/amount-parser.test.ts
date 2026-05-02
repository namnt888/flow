import { describe, it, expect } from 'vitest';
import { parseAmountExpression } from './amount-parser';

describe('parseAmountExpression', () => {
  // --- Happy path ---
  it('should multiply: "5*10" → 50', () => {
    expect(parseAmountExpression('5*10')).toBe(50);
  });

  it('should add: "1000+200" → 1200', () => {
    expect(parseAmountExpression('1000+200')).toBe(1200);
  });

  it('should divide: "500/2" → 250', () => {
    expect(parseAmountExpression('500/2')).toBe(250);
  });

  it('should respect operator precedence: "10+5*2" → 20', () => {
    expect(parseAmountExpression('10+5*2')).toBe(20);
  });

  it('should respect parentheses: "(10+5)*2" → 30', () => {
    expect(parseAmountExpression('(10+5)*2')).toBe(30);
  });

  it('should return same number for plain integer: "1000" → 1000', () => {
    expect(parseAmountExpression('1000')).toBe(1000);
  });

  // --- Thousand separators ---
  it('should strip commas: "1,500" → 1500', () => {
    expect(parseAmountExpression('1,500')).toBe(1500);
  });

  it('should strip dots: "1.500" → 1500', () => {
    expect(parseAmountExpression('1.500')).toBe(1500);
  });

  // --- Edge cases ---
  it('should round decimal result: "10/3" → 3', () => {
    expect(parseAmountExpression('10/3')).toBe(3);
  });

  it('should throw for negative expression: "-500"', () => {
    expect(() => parseAmountExpression('-500')).toThrow('Amount cannot be negative');
  });

  it('should throw for division by zero: "10/0"', () => {
    expect(() => parseAmountExpression('10/0')).toThrow('Division by zero');
  });

  it('should throw for empty input: ""', () => {
    expect(() => parseAmountExpression('')).toThrow('Amount expression is empty');
  });

  it('should throw for whitespace-only input: "   "', () => {
    expect(() => parseAmountExpression('   ')).toThrow('Amount expression is empty');
  });

  it('should throw for invalid characters: "abc"', () => {
    expect(() => parseAmountExpression('abc')).toThrow('Invalid characters');
  });

  it('should throw for invalid expression: "5***10"', () => {
    expect(() => parseAmountExpression('5***10')).toThrow('Invalid mathematical expression');
  });

  it('should handle whitespace in expression: "5 * 10" → 50', () => {
    expect(parseAmountExpression('5 * 10')).toBe(50);
  });

  it('should handle complex expression: "100+50*2+25" → 225', () => {
    expect(parseAmountExpression('100+50*2+25')).toBe(225);
  });
});

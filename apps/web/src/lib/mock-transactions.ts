export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface MockTransaction {
  id: string;
  amount: bigint;
  type: TransactionType;
  date: Date;
  categoryName: string;
  accountName: string;
  notes: string;
}

export const mockTransactions: MockTransaction[] = [
  {
    id: 'txn-001',
    amount: BigInt(15000000),
    type: 'INCOME',
    date: new Date('2026-05-02'),
    categoryName: 'Lương',
    accountName: 'Techcombank',
    notes: 'Lương tháng 5',
  },
  {
    id: 'txn-002',
    amount: BigInt(3500000),
    type: 'EXPENSE',
    date: new Date('2026-05-01'),
    categoryName: 'Ăn uống',
    accountName: 'VIB',
    notes: 'Ăn tối cùng bạn',
  },
  {
    id: 'txn-003',
    amount: BigInt(5000000),
    type: 'TRANSFER',
    date: new Date('2026-04-30'),
    categoryName: 'Chuyển khoản',
    accountName: 'Techcombank',
    notes: 'Chuyển sang tài khoản tiết kiệm',
  },
  {
    id: 'txn-004',
    amount: BigInt(20000000),
    type: 'INCOME',
    date: new Date('2026-04-28'),
    categoryName: 'Lương',
    accountName: 'Techcombank',
    notes: 'Thưởng dự án Q1',
  },
  {
    id: 'txn-005',
    amount: BigInt(1200000),
    type: 'EXPENSE',
    date: new Date('2026-04-27'),
    categoryName: 'Di chuyển',
    accountName: 'VIB',
    notes: 'Đổ xăng',
  },
  {
    id: 'txn-006',
    amount: BigInt(2500000),
    type: 'EXPENSE',
    date: new Date('2026-04-26'),
    categoryName: 'Mua sắm',
    accountName: 'VIB',
    notes: 'Mua áo khoác',
  },
  {
    id: 'txn-007',
    amount: BigInt(800000),
    type: 'EXPENSE',
    date: new Date('2026-04-25'),
    categoryName: 'Giải trí',
    accountName: 'VIB',
    notes: 'Xem phim và ăn tối',
  },
  {
    id: 'txn-008',
    amount: BigInt(3000000),
    type: 'INCOME',
    date: new Date('2026-04-24'),
    categoryName: 'Freelance',
    accountName: 'Techcombank',
    notes: 'Thiết kế website',
  },
  {
    id: 'txn-009',
    amount: BigInt(4500000),
    type: 'EXPENSE',
    date: new Date('2026-04-23'),
    categoryName: 'Hoá đơn',
    accountName: 'Techcombank',
    notes: 'Tiền điện và nước',
  },
  {
    id: 'txn-010',
    amount: BigInt(10000000),
    type: 'TRANSFER',
    date: new Date('2026-04-22'),
    categoryName: 'Chuyển khoản',
    accountName: 'VIB',
    notes: 'Trả nợ thẻ tín dụng',
  },
];

/**
 * Convert bigint amount (stored as value * 100) to human-readable VND string.
 * Example: BigInt(15000000) → "150,000"
 */
export function formatAmount(amount: bigint): string {
  const num = Number(amount) / 100;
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

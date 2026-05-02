export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface TransactionRow {
  id: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  categoryName: string | null;
  accountName: string | null;
  notes: string | null;
}

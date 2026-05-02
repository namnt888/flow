'use server';

import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db, transactions, categories, accounts } from '@flow/db';

const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  notes: z.string().optional(),
  accountId: z.string().uuid('Invalid account'),
  categoryId: z.string().uuid('Invalid category').optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export async function getTransactions() {
  const rows = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      transactionDate: transactions.transactionDate,
      notes: transactions.notes,
      categoryName: categories.name,
      accountName: accounts.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .orderBy(desc(transactions.transactionDate));

  return rows.map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    type: row.type,
    transactionDate: row.transactionDate,
    notes: row.notes,
    categoryName: row.categoryName,
    accountName: row.accountName,
  }));
}

export async function createTransaction(data: CreateTransactionInput) {
  const parsed = createTransactionSchema.parse(data);

  const absoluteAmount = Math.abs(parsed.amount);

  await db.insert(transactions).values({
    accountId: parsed.accountId,
    categoryId: parsed.categoryId ?? null,
    type: parsed.type,
    amount: BigInt(Math.round(absoluteAmount * 100)),
    transactionDate: parsed.transactionDate,
    notes: parsed.notes ?? null,
  });
}

export async function getAccounts() {
  return db
    .select({ id: accounts.id, name: accounts.name })
    .from(accounts)
    .where(eq(accounts.isActive, true));
}

export async function getCategories() {
  return db
    .select({ id: categories.id, name: categories.name, kind: categories.kind })
    .from(categories)
    .where(eq(categories.isActive, true));
}

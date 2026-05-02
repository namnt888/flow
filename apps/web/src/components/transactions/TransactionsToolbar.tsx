'use client';

import { AddTransactionDialog } from './AddTransactionDialog';

export function TransactionsToolbar() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your income, expenses, and transfers.
        </p>
      </div>
      <AddTransactionDialog />
    </div>
  );
}

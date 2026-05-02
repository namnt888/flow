import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TransactionTable } from '@/components/transactions/TransactionTable';

export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your income, expenses, and transfers.
          </p>
        </div>
        <Button>
          <Plus className="mr-1.5 size-4" />
          Add Transaction
        </Button>
      </div>
      <TransactionTable />
    </div>
  );
}

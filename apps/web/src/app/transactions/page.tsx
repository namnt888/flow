import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionsToolbar } from '@/components/transactions/TransactionsToolbar';
import { getTransactions } from '@/actions/transaction.actions';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <TransactionsToolbar />
      <TransactionTable data={transactions} />
    </div>
  );
}

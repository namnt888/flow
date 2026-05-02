'use client';
/* eslint-disable react-hooks/incompatible-library -- react-hook-form's watch() is non-memoizable by design */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createTransaction,
  getAccounts,
  getCategories,
  type CreateTransactionInput,
} from '@/actions/transaction.actions';

const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  transactionDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  kind: 'INCOME' | 'EXPENSE';
}

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      type: 'EXPENSE',
      transactionDate: new Date().toISOString().split('T')[0],
      notes: '',
      accountId: '',
      categoryId: '',
    },
  });

  const selectedType = form.watch('type');

  useEffect(() => {
    async function load() {
      const [accts, cats] = await Promise.all([
        getAccounts(),
        getCategories(),
      ]);
      setAccounts(accts);
      setCategories(cats);
    }
    load();
  }, []);

  const filteredCategories = categories.filter(
    (cat) => cat.kind === (selectedType === 'TRANSFER' ? 'EXPENSE' : selectedType),
  );

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setError(null);

    try {
      const input: CreateTransactionInput = {
        amount: values.amount,
        type: values.type,
        transactionDate: values.transactionDate,
        notes: values.notes || undefined,
        accountId: values.accountId,
        categoryId: values.categoryId || undefined,
      };

      await createTransaction(input);

      setOpen(false);
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button><Plus className="mr-1.5 size-4" />Add Transaction</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Create a new income, expense, or transfer entry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={form.watch('type')}
              onValueChange={(val) => { if (val !== null) form.setValue('type', val as FormValues['type']) }}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="100000"
              {...form.register('amount')}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionDate">Date</Label>
            <Input
              id="transactionDate"
              type="date"
              {...form.register('transactionDate')}
            />
            {form.formState.errors.transactionDate && (
              <p className="text-xs text-destructive">
                {form.formState.errors.transactionDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountId">Account</Label>
            <Select
              value={form.watch('accountId')}
              onValueChange={(val) => { if (val !== null) form.setValue('accountId', val) }}
            >
              <SelectTrigger id="accountId">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acct) => (
                  <SelectItem key={acct.id} value={acct.id}>
                    {acct.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.accountId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.accountId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              value={form.watch('categoryId') || ''}
              onValueChange={(val) => form.setValue('categoryId', val === null || val === 'none' ? '' : val)}
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="No category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes..."
              className="resize-y"
              {...form.register('notes')}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

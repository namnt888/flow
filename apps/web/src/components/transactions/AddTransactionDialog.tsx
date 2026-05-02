'use client';
/* eslint-disable react-hooks/incompatible-library -- react-hook-form's watch() is non-memoizable by design */

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Store } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
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
  getShops,
  type CreateTransactionInput,
} from '@/actions/transaction.actions';
import { parseAmountExpression } from '@flow/domain';

const formSchema = z
  .object({
    amount: z.coerce.number().positive('Amount must be positive'),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
    transactionDate: z.string().min(1, 'Date is required'),
    notes: z.string().optional(),
    accountId: z.string().min(1, 'Account is required'),
    categoryId: z.string().optional(),
    destinationAccountId: z.string().optional(),
    shopId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'TRANSFER') {
      if (!data.destinationAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Destination account is required for transfers',
          path: ['destinationAccountId'],
        });
      }
      if (data.destinationAccountId === data.accountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Destination account must be different from source account',
          path: ['destinationAccountId'],
        });
      }
    }
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

interface Shop {
  id: string;
  name: string;
  iconUrl: string | null;
}

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
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
      destinationAccountId: '',
      shopId: '',
    },
  });

  const selectedType = form.watch('type');

  const handleAmountBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (!raw) return;
      try {
        const parsed = parseAmountExpression(raw);
        form.setValue('amount', parsed, { shouldValidate: true });
      } catch {
        // silent — form validation will catch it
      }
    },
    [form],
  );

  const getAccountName = (id: string | undefined) => (id ? accounts.find((a) => a.id === id)?.name ?? id : '');
  const getCategoryName = (id: string | undefined) => (id ? categories.find((c) => c.id === id)?.name ?? id : '');

  useEffect(() => {
    async function load() {
      const [accts, cats, shopList] = await Promise.all([
        getAccounts(),
        getCategories(),
        getShops(),
      ]);
      setAccounts(accts);
      setCategories(cats);
      setShops(shopList);
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
        categoryId: values.type === 'TRANSFER' ? undefined : (values.categoryId || undefined),
        destinationAccountId: values.type === 'TRANSFER' ? (values.destinationAccountId || undefined) : undefined,
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

  const defaultAccountIdValue = form.watch('accountId');
  const availableDestAccounts = accounts.filter((a) => a.id !== defaultAccountIdValue);

  const amountValue = form.watch('amount');
  const parsedForBadges = !Number.isNaN(Number(amountValue)) && Number(amountValue) > 0 ? Number(amountValue) : null;

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
          {/* Type selector */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={form.watch('type')}
              onValueChange={(val) => { if (val !== null) form.setValue('type', val as FormValues['type']) }}
            >
              <SelectTrigger id="type" className="w-full">
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

          {/* Date + Amount — grid row */}
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="text"
                inputMode="text"
                placeholder="100000"
                {...form.register('amount')}
                onBlur={handleAmountBlur}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              )}
              {parsedForBadges !== null && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[1, 10, 100].map((multiplier) => {
                    const val = parsedForBadges * multiplier;
                    return (
                      <Badge
                        key={multiplier}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent transition-colors text-xs"
                        onClick={() => form.setValue('amount', val, { shouldValidate: true })}
                      >
                        {val.toLocaleString('vi-VN')}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Source Account */}
          <div className="space-y-2">
            <Label htmlFor="accountId">{selectedType === 'TRANSFER' ? 'Source Account' : 'Account'}</Label>
            <Combobox
              items={accounts.map((a) => ({ value: a.id, label: a.name }))}
              value={form.watch('accountId')}
              onValueChange={(val) => {
                form.setValue('accountId', val, { shouldValidate: true });
                if (form.getValues('destinationAccountId') === val) {
                  form.setValue('destinationAccountId', '', { shouldValidate: true });
                }
              }}
              placeholder="Select account"
            />
            {form.formState.errors.accountId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.accountId.message}
              </p>
            )}
          </div>

          {/* Destination Account — only for TRANSFER */}
          {selectedType === 'TRANSFER' && (
            <div className="space-y-2">
              <Label htmlFor="destinationAccountId">Destination Account</Label>
              <Combobox
                items={availableDestAccounts.map((a) => ({ value: a.id, label: a.name }))}
                value={form.watch('destinationAccountId') ?? ''}
                onValueChange={(val) => form.setValue('destinationAccountId', val, { shouldValidate: true })}
                placeholder="Select destination"
              />
              {form.formState.errors.destinationAccountId && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.destinationAccountId.message}
                </p>
              )}
            </div>
          )}

          {/* Category — hidden for TRANSFER */}
          {selectedType !== 'TRANSFER' && (
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Combobox
                items={[
                  { value: '', label: 'No category' },
                  ...filteredCategories.map((cat) => ({ value: cat.id, label: cat.name })),
                ]}
                value={form.watch('categoryId') || ''}
                onValueChange={(val) => form.setValue('categoryId', val, { shouldValidate: true })}
                placeholder="Select category"
              />
            </div>
          )}

          {/* Shop */}
          <div className="space-y-2">
            <Label htmlFor="shopId">Shop</Label>
            <Combobox
              items={[
                { value: '', label: 'No shop', iconUrl: null },
                ...shops.map((shop) => ({
                  value: shop.id,
                  label: shop.name,
                  iconUrl: shop.iconUrl,
                })),
              ]}
              value={form.watch('shopId') || ''}
              onValueChange={(val) => form.setValue('shopId', val, { shouldValidate: true })}
              placeholder="Select shop"
            />
          </div>

          {/* Notes */}
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

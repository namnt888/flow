'use client';
/* eslint-disable react-hooks/incompatible-library -- TanStack Table's useReactTable returns non-memoizable functions by design */

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { TransactionRow, TransactionType } from '@/lib/transactions';
import { formatAmount } from '@flow/domain';

const badgeLabel: Record<TransactionType, string> = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
  TRANSFER: 'Transfer',
};

const badgeVariant: Record<TransactionType, 'default' | 'destructive' | 'secondary'> = {
  INCOME: 'default',
  EXPENSE: 'destructive',
  TRANSFER: 'secondary',
};

const columnHelper = createColumnHelper<TransactionRow>();

const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
        onCheckedChange={(checked) =>
          table.toggleAllPageRowsSelected(!!checked)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor('transactionDate', {
    header: ({ column }) => (
      <SortHeader
        label="Date"
        sorted={column.getIsSorted()}
        onToggle={() => column.toggleSorting()}
      />
    ),
    cell: ({ getValue }) => {
      const date = getValue();
      return <span className="text-muted-foreground">{format(new Date(date), 'dd/MM/yyyy')}</span>;
    },
  }),
  columnHelper.accessor('categoryName', {
    header: ({ column }) => (
      <SortHeader
        label="Category"
        sorted={column.getIsSorted()}
        onToggle={() => column.toggleSorting()}
      />
    ),
    cell: ({ getValue }) => {
      const category = getValue();
      return <span className="font-medium">{category || '—'}</span>;
    },
  }),
  columnHelper.accessor('notes', {
    header: 'Notes',
    cell: ({ getValue }) => {
      const notes = getValue();
      return (
        <span className="text-muted-foreground max-w-[240px] truncate block">
          {notes || '—'}
        </span>
      );
    },
  }),
  columnHelper.accessor('type', {
    header: 'Type',
    cell: ({ getValue }) => {
      const type = getValue();
      return (
        <Badge variant={badgeVariant[type]}>{badgeLabel[type]}</Badge>
      );
    },
  }),
  columnHelper.accessor('amount', {
    header: ({ column }) => (
      <div className="text-right">
        <SortHeader
          label="Amount"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      </div>
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      const amount = row.original.amount;
      const formatted = formatAmount(amount);

      if (type === 'EXPENSE') {
        return (
          <span className="text-red-500 font-medium tabular-nums">
            -{formatted}
          </span>
        );
      }

      if (type === 'INCOME') {
        return (
          <span className="text-green-500 font-medium tabular-nums">
            +{formatted}
          </span>
        );
      }

      return (
        <span className="font-medium tabular-nums">
          {formatted}
        </span>
      );
    },
  }),
];

function SortHeader({
  label,
  sorted,
  onToggle,
}: {
  label: string;
  sorted: 'asc' | 'desc' | false;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      {sorted === 'asc' ? (
        <ChevronUp className="size-3.5" />
      ) : sorted === 'desc' ? (
        <ChevronDown className="size-3.5" />
      ) : (
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

export function TransactionTable({ data }: { data: TransactionRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

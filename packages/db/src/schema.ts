import {
  pgTable,
  pgEnum,
  uuid,
  text,
  bigint,
  boolean,
  timestamp,
  date,
  index,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

/* ========== ENUMS ========== */

export const accountTypeEnum = pgEnum('account_type', ['BANK', 'CASH', 'CREDIT_CARD']);
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE', 'TRANSFER']);
export const categoryKindEnum = pgEnum('category_kind', ['INCOME', 'EXPENSE']);

/* ========== ACCOUNTS ========== */

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    type: accountTypeEnum('type').notNull(),
    balance: bigint('balance', { mode: 'bigint' }).notNull().default(sql`'0'`),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('accounts_type_idx').on(table.type)],
);

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions, { relationName: 'account_transactions' }),
  outgoingTransfers: many(transactions, { relationName: 'source_transfers' }),
  incomingTransfers: many(transactions, { relationName: 'destination_transfers' }),
}));

/* ========== CATEGORIES ========== */

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    kind: categoryKindEnum('kind').notNull(),
    parentId: uuid('parent_id'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('categories_parent_id_idx').on(table.parentId),
    index('categories_kind_idx').on(table.kind),
  ],
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'category_children',
  }),
  children: many(categories, { relationName: 'category_children' }),
  transactions: many(transactions),
}));

/* ========== PEOPLE ========== */

export const people = pgTable(
  'people',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    phone: text('phone'),
    email: text('email'),
    note: text('note'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('people_name_idx').on(table.name)],
);

export const peopleRelations = relations(people, ({ many }) => ({
  transactions: many(transactions),
}));

/* ========== TRANSACTIONS (Core Ledger) ========== */

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id),
    categoryId: uuid('category_id').references(() => categories.id),
    personId: uuid('person_id').references(() => people.id),
    destinationAccountId: uuid('destination_account_id').references(() => accounts.id),
    type: transactionTypeEnum('type').notNull(),
    amount: bigint('amount', { mode: 'bigint' }).notNull(),
    transactionDate: date('transaction_date').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('transactions_account_id_idx').on(table.accountId),
    index('transactions_transaction_date_idx').on(table.transactionDate),
    index('transactions_type_idx').on(table.type),
    index('transactions_category_id_idx').on(table.categoryId),
    index('transactions_person_id_idx').on(table.personId),
    index('transactions_account_date_idx').on(table.accountId, table.transactionDate),
  ],
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
    relationName: 'account_transactions',
  }),
  sourceAccount: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
    relationName: 'source_transfers',
  }),
  destinationAccount: one(accounts, {
    fields: [transactions.destinationAccountId],
    references: [accounts.id],
    relationName: 'destination_transfers',
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  person: one(people, {
    fields: [transactions.personId],
    references: [people.id],
  }),
}));

# Sprint 5: Smart UI, Combobox & Mở rộng DB (Shop Entity)

**Sprint:** 5 — Smart UI, Combobox & Shop Entity
**Tác giả:** Claude Plan
**Ngày:** 2026-05-02
**Trạng thái:** Chờ duyệt

---

## 1. Hiện trạng (Current State)

### 1.1 DB Schema
- **File:** `packages/db/src/schema.ts`
- Đã có bảng: `accounts`, `categories`, `people`, `transactions`.
- `transactions` hiện tại có `amount` (bigint), `type` (enum), `accountId`, `destinationAccountId`, `categoryId`, `personId`, `transactionDate`, `notes`.
- **Thiếu:** Bảng `shops` chưa tồn tại. `transactions` thiếu cột `shop_id`, `sync_status`, `metadata`.

### 1.2 Domain Package
- **File:** `packages/domain/src/amount.ts`
- Chỉ có hàm `formatAmount()` — chưa có parser cho biểu thức toán học nhập từ UI.
- `packages/domain/package.json` chưa có `vitest` trong devDependencies.

### 1.3 UI — AddTransactionDialog
- **File:** `apps/web/src/components/transactions/AddTransactionDialog.tsx`
- Amount input dùng `<Input type="number">` thuần — không có smart parsing, không có badge gợi ý.
- Account, Category fields dùng `<Select>` (shadcn/ui) — không searchable, không dùng được khi có nhiều item.
- **Thiếu:** Shop field hoàn toàn chưa có.

### 1.4 UI Components
- `apps/web/src/components/ui/` có: `select.tsx`, `badge.tsx`, `button.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`, `table.tsx`, `checkbox.tsx`, `dropdown-menu.tsx`.
- **Thiếu:** `command.tsx`, `popover.tsx` — cần để build Combobox từ shadcn/ui.

---

## 2. Kế hoạch thực hiện (Step-by-step)

### Bước 1: Cập nhật Database Schema

**File:** `packages/db/src/schema.ts`

#### 1a. Tạo bảng `shops`

```typescript
export const shops = pgTable('shops', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  iconUrl: text('icon_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
```

#### 1b. Tạo sync_status enum + thêm cột vào `transactions`

```typescript
export const syncStatusEnum = pgEnum('sync_status', ['PENDING', 'SYNCED', 'IGNORED']);

// Trong bảng transactions, thêm 3 cột:
shopId: uuid('shop_id').references(() => shops.id),
syncStatus: syncStatusEnum('sync_status').notNull().default('PENDING'),
metadata: jsonb('metadata'),
```

- `shop_id` là FK optional → `references(() => shops.id)`.
- `sync_status` có DEFAULT `'PENDING'`, NOT NULL.
- `metadata` là `jsonb`, nullable.

#### 1c. Tạo relations cho `shops`

```typescript
export const shopsRelations = relations(shops, ({ many }) => ({
  transactions: many(transactions),
}));
```

Cập nhật `transactionsRelations` để thêm relation `shop`.

#### 1d. Generate migration

```bash
cd packages/db && pnpm db:generate
```

---

### Bước 2: Domain Logic — parseAmountExpression

#### 2a. Thêm file parser

**Tạo file:** `packages/domain/src/ledger/amount-parser.ts`

```typescript
/**
 * Parse a math expression string into a positive number.
 * Supports +, -, *, / operators and parentheses.
 *
 * Examples:
 *   "5*10"      → 50
 *   "1000+200"  → 1200
 *   "500/2"     → 250
 *   "-100"      → throws (negative not allowed)
 *   "10/0"      → throws (division by zero)
 */
export function parseAmountExpression(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) throw new Error('Amount expression is empty');

  // Chỉ cho phép digits, operators + - * /, parentheses, dấu chấm, dấu phẩy, khoảng trắng
  const sanitized = trimmed.replace(/[,.\s]/g, '');
  if (!/^[\d+\-*/().]+$/.test(sanitized)) {
    throw new Error('Invalid characters in amount expression');
  }

  // Chặn divide by zero
  if (/\/0(?!\d)/.test(sanitized)) {
    throw new Error('Division by zero is not allowed');
  }

  const result = new Function(`"use strict"; return (${sanitized})`)();

  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error('Invalid calculation result');
  }

  if (result < 0) {
    throw new Error('Amount cannot be negative');
  }

  return Math.round(result);
}
```

#### 2b. Export từ index

**File:** `packages/domain/src/index.ts`

```typescript
export { formatAmount } from './amount';
export { parseAmountExpression } from './ledger/amount-parser';
```

---

### Bước 3: Unit Test — amount-parser (BẮT BUỘC)

#### 3a. Cấu hình Vitest cho domain package

**Tạo file:** `packages/domain/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

**Sửa file:** `packages/domain/package.json` — thêm scripts và devDependencies

#### 3b. Tạo file test

**Tạo file:** `packages/domain/src/ledger/amount-parser.test.ts`

**Test cases:**

| # | Input | Expected | Mô tả |
|---|-------|----------|-------|
| 1 | `"5*10"` | `50` | Nhân cơ bản |
| 2 | `"1000+200"` | `1200` | Cộng cơ bản |
| 3 | `"500/2"` | `250` | Chia cơ bản |
| 4 | `"10+5*2"` | `20` | Operator precedence (nhân trước) |
| 5 | `"(10+5)*2"` | `30` | Parentheses override precedence |
| 6 | `"1000"` | `1000` | Số thuần, không expression |
| 7 | `"-500"` | `throw` | Số âm bị chặn |
| 8 | `"10/0"` | `throw` | Chia 0 bị chặn |
| 9 | `""` | `throw` | Empty input |
| 10 | `"abc"` | `throw` | Ký tự không hợp lệ |
| 11 | `"1,500"` | `1500` | Dấu phẩy phân cách ngàn bị loại bỏ |
| 12 | `"1.5"` | `2` | Số thập phân được làm tròn |

---

### Bước 4: Smart Amount Input UI

**File:** `apps/web/src/components/transactions/AddTransactionDialog.tsx`

#### 4a. Áp dụng parser khi blur

- Thêm `onBlur` handler vào `<Input id="amount">`.
- Khi user blur, gọi `parseAmountExpression(value)`.
- Nếu parse thành công, `form.setValue('amount', parsedValue)`.
- Nếu parse thất bại, KHÔNG tự động set — để user sửa.

#### 4b. Badge gợi ý nhanh (Quick-amount badges)

Thêm 3 badge phía dưới input Amount, hiển thị đề xuất theo giá trị hiện tại:
- Badge 1: `{value} × 1` = `{value}` (giữ nguyên)
- Badge 2: `{value} × 10` = `{value * 10}` (format VND)
- Badge 3: `{value} × 100` = `{value * 100}` (format VND)

Nếu input rỗng hoặc không phải số, ẩn badges.
Khi click badge, set giá trị đó vào form.

**Lưu ý quan trọng:** Đổi `<Input type="number">` → `<Input type="text" inputMode="numeric">` để cho phép nhập biểu thức "5*10".

---

### Bước 5: Smart Combobox (thay thế Select)

#### 5a. Cài đặt dependencies

```bash
cd apps/web && pnpm add cmdk
```

#### 5b. Tạo components shadcn/ui

1. `apps/web/src/components/ui/command.tsx` — dùng `cmdk`
2. `apps/web/src/components/ui/popover.tsx` — shadcn Popover

#### 5c. Tạo component `<Combobox>` wrapper

**Tạo file:** `apps/web/src/components/ui/combobox.tsx`

```typescript
interface ComboboxProps<T> {
  items: T[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  renderItem: (item: T) => { label: string; value: string; icon?: string };
  emptyText?: string;
}
```

- `renderItem` trả về `{ label, value, icon }` — nếu có `icon`, render icon cạnh label.
- Icon mapping từ string → `lucide-react` component, fallback `<Store />`.

#### 5d. Thay thế trong AddTransactionDialog

- Account: `Select` → `Combobox` (items: accounts, không icon)
- Category: `Select` → `Combobox` (items: filteredCategories, không icon)
- Destination Account: `Select` → `Combobox` (items: availableDestAccounts, không icon)
- Shop: **Thêm mới** `Combobox` (items: shops, có icon từ `iconUrl`, fallback `<Store />`)

---

### Bước 6: Server Action cho Shop

**File:** `apps/web/src/actions/transaction.actions.ts`

```typescript
import { shops } from '@flow/db';

export async function getShops() {
  return db
    .select({ id: shops.id, name: shops.name, iconUrl: shops.iconUrl })
    .from(shops);
}
```

---

## 3. Danh sách file thay đổi

| # | File | Thao tác | Mô tả |
|---|------|----------|-------|
| 1 | `packages/db/src/schema.ts` | Sửa | Thêm bảng `shops`, enum `sync_status`, cột `shopId`/`syncStatus`/`metadata`, relations |
| 2 | `packages/db/drizzle/` | Tạo mới | Migration files sau `db:generate` |
| 3 | `packages/domain/src/ledger/amount-parser.ts` | **Tạo mới** | Hàm `parseAmountExpression` |
| 4 | `packages/domain/src/ledger/amount-parser.test.ts` | **Tạo mới** | Unit Test (12 test cases) |
| 5 | `packages/domain/src/index.ts` | Sửa | Export `parseAmountExpression` |
| 6 | `packages/domain/package.json` | Sửa | Thêm `vitest` devDep + `test` script |
| 7 | `packages/domain/vitest.config.ts` | **Tạo mới** | Cấu hình Vitest |
| 8 | `apps/web/src/components/ui/command.tsx` | **Tạo mới** | shadcn Command (cần `cmdk`) |
| 9 | `apps/web/src/components/ui/popover.tsx` | **Tạo mới** | shadcn Popover |
| 10 | `apps/web/src/components/ui/combobox.tsx` | **Tạo mới** | Wrapper Combobox component |
| 11 | `apps/web/src/components/transactions/AddTransactionDialog.tsx` | Sửa | Amount parser + badges + Combobox thay Select + Shop field |
| 12 | `apps/web/src/actions/transaction.actions.ts` | Sửa | Thêm `getShops()` server action |

---

## 4. Edge cases & Rủi ro

| # | Vấn đề | Giải pháp |
|---|--------|-----------|
| 1 | `parseAmountExpression("10/0")` throw error | Bắt trong onBlur, không crash form |
| 2 | User nhập ký tự đặc biệt | Regex whitelist chặn, throw error |
| 3 | Combobox Popover bị cắt bởi Dialog | Popover dùng portal, không bị ảnh hưởng |
| 4 | Conflict giữa `type="number"` và expression input | Đổi sang `type="text"` + `inputMode="numeric"` |
| 5 | Không có `icon_url` trong seed data shops | Fallback `<Store />` icon từ lucide-react |
| 6 | Expression quá dài gây performance issue | `Function` constructor xử lý nhanh, không đáng kể |

---

## 5. Test Checklist (sau khi code)

- [ ] `parseAmountExpression` — 12 test cases pass
- [ ] `pnpm test` tại `packages/domain` — PASS
- [ ] Migration tạo bảng `shops` + cột mới thành công
- [ ] Amount input: "5*10" + blur → tự động thành 50
- [ ] Amount input: "-100" + blur → không set, báo lỗi
- [ ] Badge: nhập 5 → hiển thị [5] [50] [500], click set đúng
- [ ] Badge: input rỗng → ẩn badges
- [ ] Account Combobox: search filter đúng
- [ ] Category Combobox: filter theo type, search được
- [ ] Shop Combobox: hiển thị icon + name
- [ ] Destination Account Combobox: loại trừ account nguồn
- [ ] Tạo transaction có shop → lưu đúng shop_id
- [ ] `sync_status` mặc định là 'PENDING'
- [ ] Build TypeScript không lỗi (`pnpm build`)

---

Kế hoạch này đã chuẩn chưa? Nếu bạn OK, hãy gõ **Approve** để tôi bắt đầu viết code.

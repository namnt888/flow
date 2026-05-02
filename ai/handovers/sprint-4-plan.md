# 📋 Plan: Fix Transactions Query JOIN & Dynamic Transfer Form

**Sprint:** 4 — Real DB Integration
**Tác giả:** Claude Plan
**Ngày:** 2026-05-02
**Trạng thái:** Chờ duyệt

---

## 1. Hiện trạng (Current State)

### 1.1 `getTransactions()` — Query JOIN
- File: `apps/web/src/actions/transaction.actions.ts` (dòng 18-43)
- Query hiện tại đã JOIN `categories` (lấy `categoryName`) và `accounts` (lấy `accountName`) từ `accountId`.
- **Thiếu:** KHÔNG JOIN `accounts` lần 2 để lấy `destinationAccountName` cho giao dịch `TRANSFER`.
- `TransactionRow` type (`apps/web/src/lib/transactions.ts`) chỉ có `accountName` — thiếu `sourceAccountName`, `destinationAccountName`.
- `TransactionTable.tsx` KHÔNG có cột hiển thị Account Name — chỉ có Date, Category, Notes, Type, Amount.

### 1.2 `AddTransactionDialog.tsx` — Form
- File: `apps/web/src/components/transactions/AddTransactionDialog.tsx`
- Zod schema KHÔNG có trường `destinationAccountId`.
- Form KHÔNG hiển thị dropdown "Destination Account" khi chọn type = "TRANSFER".
- Server Action `createTransaction()` không nhận/handle `destinationAccountId`.
- Form fields đang xếp dọc (`space-y-4`), không có grid layout.

### 1.3 DB Schema (Reference)
- `packages/db/src/schema.ts`: Bảng `transactions` đã có cột `destination_account_id` (FK → `accounts.id`).
- DB sẵn sàng, chỉ cần sửa Query + Form + Action.

---

## 2. Kế hoạch thực hiện (Step-by-step)

### Bước 1: Cập nhật `TransactionRow` type — phân biệt source/destination account name

**File:** `apps/web/src/lib/transactions.ts`

- Thay `accountName: string | null` bằng 2 trường:
  - `sourceAccountName: string | null` — tên tài khoản nguồn (từ `accountId`)
  - `destinationAccountName: string | null` — tên tài khoản đích (từ `destinationAccountId`), chỉ có ý nghĩa với TRANSFER.
- Giải thích: Với TRANSFER, cần hiển thị "A → B", không thể gộp chung 1 cột `accountName`.

### Bước 2: Sửa `getTransactions()` — JOIN 2 lần bảng `accounts`

**File:** `apps/web/src/actions/transaction.actions.ts`

```typescript
.select({
  id: transactions.id,
  amount: transactions.amount,
  type: transactions.type,
  transactionDate: transactions.transactionDate,
  notes: transactions.notes,
  categoryName: categories.name,
  sourceAccountName: sourceAccount.name,         // JOIN lần 1
  destinationAccountName: destinationAccount.name, // JOIN lần 2
})
.from(transactions)
.leftJoin(categories, eq(transactions.categoryId, categories.id))
.leftJoin(sourceAccount, eq(transactions.accountId, sourceAccount.id))              // alias cho accounts lần 1
.leftJoin(destinationAccount, eq(transactions.destinationAccountId, destinationAccount.id)) // alias cho accounts lần 2
```

- Dùng Drizzle's **aliased table**: `const sourceAccount = alias(accounts, 'source'); const destinationAccount = alias(accounts, 'destination');`
- Import `alias` từ `drizzle-orm/pg-core`.

### Bước 3: Sửa `TransactionTable.tsx` — thêm cột Account

**File:** `apps/web/src/components/transactions/TransactionTable.tsx`

- **Sửa column accessor:** `accountName` → `sourceAccountName`.
- **Đổi header:** "Account" → "Source Account".
- **Cell logic:**
  - Nếu type = `TRANSFER`: hiển thị `{sourceAccountName} → {destinationAccountName}`
  - Nếu type = `INCOME`/`EXPENSE`: hiển thị `sourceAccountName`
- Nên thêm cột Account ngay sau cột Category (trước Notes).

### Bước 4: Sửa Zod schema + Form — Dynamic Transfer Field

**File:** `apps/web/src/components/transactions/AddTransactionDialog.tsx`

#### 4a. Zod Schema:
```typescript
const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  transactionDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().optional(),
  destinationAccountId: z.string().optional(), // THÊM MỚI
}).superRefine((data, ctx) => {
  // Nếu type = TRANSFER, bắt buộc phải có destinationAccountId
  if (data.type === 'TRANSFER' && !data.destinationAccountId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Destination account is required for transfers',
      path: ['destinationAccountId'],
    });
  }
  // Nếu INCOME/EXPENSE, destinationAccountId phải là empty string (gửi null lên server)
});
```

#### 4b. Form UI — Destination Account dropdown (conditional):
- Sử dụng `form.watch('type')` để theo dõi type (đã có sẵn).
- Khi type === 'TRANSFER': hiển thị `<Select>` field "Destination Account" giống hệt Account field, nhưng:
  - Lọc ra khỏi danh sách account hiện tại (không cho chọn account nguồn làm đích) — nice-to-have.
  - Label: "Destination Account".

#### 4c. Layout Grid (Date + Amount cùng hàng):
- Nhóm `transactionDate` và `amount` vào 1 hàng ngang: `<div className="grid grid-cols-2 gap-4">`.
- Date bên trái, Amount bên phải (hoặc ngược lại).
- Các field còn lại (type, account, category, notes) giữ nguyên 1 field/hàng.

### Bước 5: Sửa `createTransaction()` Server Action — nhận `destinationAccountId`

**File:** `apps/web/src/actions/transaction.actions.ts`

#### 5a. Schema (Server-side Zod):
```typescript
const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)'),
  notes: z.string().optional(),
  accountId: z.string().uuid('Invalid account'),
  categoryId: z.string().uuid('Invalid category').optional(),
  destinationAccountId: z.string().uuid('Invalid destination account').optional(),
}).superRefine(...); // logic giống client schema
```

#### 5b. Insert:
```typescript
await db.insert(transactions).values({
  accountId: parsed.accountId,
  destinationAccountId: parsed.destinationAccountId ?? null, // THÊM
  categoryId: parsed.categoryId ?? null,
  type: parsed.type,
  amount: BigInt(Math.round(absoluteAmount * 100)),
  transactionDate: parsed.transactionDate,
  notes: parsed.notes ?? null,
});
```

---

## 3. Data Flow (TRANSFER scenario)

```
User chọn type="TRANSFER"
  → Form hiện thêm dropdown "Destination Account" (ẩn/hiện động)
  → User chọn Source Account + Destination Account
  → Submit → Zod validate (superRefine: bắt buộc destinationAccountId)
  → Server Action nhận:
      { accountId, destinationAccountId, amount, type: "TRANSFER", ... }
  → INSERT vào DB:
      account_id = source, destination_account_id = dest, amount = absolute value
  → getTransactions() query:
      LEFT JOIN accounts AS source ON account_id
      LEFT JOIN accounts AS destination ON destination_account_id
  → Table hiển thị: "My Wallet → Savings Account"
```

---

## 4. Danh sách file thay đổi

| # | File | Thao tác | Mô tả |
|---|------|----------|-------|
| 1 | `apps/web/src/lib/transactions.ts` | Sửa | Đổi `accountName` → `sourceAccountName`, thêm `destinationAccountName` |
| 2 | `apps/web/src/actions/transaction.actions.ts` | Sửa | Thêm alias JOIN lần 2, thêm `destinationAccountId` vào schema + insert |
| 3 | `apps/web/src/components/transactions/TransactionTable.tsx` | Sửa | Sửa column accountName → sourceAccountName, hiển thị "A → B" cho TRANSFER |
| 4 | `apps/web/src/components/transactions/AddTransactionDialog.tsx` | Sửa | Thêm destinationAccountId schema/field, grid layout cho Date+Amount, superRefine |

---

## 5. Rủi ro & Lưu ý

- **Drizzle `alias`:** Import từ `drizzle-orm/pg-core`, không phải `drizzle-orm`. Cần kiểm tra.
- **BigInt→Number:** `getTransactions()` đang `Number(row.amount)` — nếu amount quá lớn (overflow), cần xử lý. Tuy nhiên với VND × 100 trong `bigint` thì an toàn.
- **Transfer không có category:** Với type = TRANSFER, user không cần chọn category (domain-ledger.md không yêu cầu category cho transfer). Form nên ẩn/disable category field khi type = TRANSFER, hoặc cho phép null.

---

## 6. Test Checklist (sau khi code)

- [ ] `getTransactions()` trả về `sourceAccountName` và `destinationAccountName` (không phải UUID)
- [ ] Table hiển thị account name thay vì UUID
- [ ] Type TRANSFER → hiển thị "Tài khoản A → Tài khoản B"
- [ ] Form: chọn type = "TRANSFER" → hiển thị dropdown "Destination Account"
- [ ] Form: chọn type = "INCOME"/"EXPENSE" → ẩn dropdown "Destination Account"
- [ ] Form: Date + Amount nằm ngang trên cùng 1 hàng (grid-cols-2)
- [ ] Submit TRANSFER thiếu destination → Zod báo lỗi
- [ ] Submit TRANSFER đầy đủ → tạo transaction thành công trong DB
- [ ] Submit INCOME/EXPENSE → không cần destination, vẫn tạo được
- [ ] Server Action insert đúng destinationAccountId vào DB

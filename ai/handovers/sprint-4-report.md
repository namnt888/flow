# Sprint 4 Report: Kết nối UI Transactions với Database thật

**Date:** 2026-05-02
**Branch:** `sprint-4-real-db-integration-may-02`

---

## Đã làm được

1. **Server Components & Actions:**
   - `transactions/page.tsx`: Chuyển thành Server Component async, gọi `getTransactions()` để fetch dữ liệu thật từ DB.
   - Thêm `export const dynamic = 'force-dynamic'` để tránh lỗi prerender tại build time.
   - Dùng `TransactionsToolbar` component thay vì inline toolbar.

2. **TransactionTable (Client Component):**
   - Nhận `data: TransactionRow[]` từ props thay vì dùng mock data nội bộ.
   - Cập nhật column definitions: `transactionDate` (string) thay `date` (Date), handle nullable fields (`categoryName`, `notes`).
   - Dùng `formatAmount` từ `@flow/domain` thay vì từ `mock-transactions.ts`.

3. **Xử lý BigInt theo chuẩn GEMINI.md:**
   - Server Actions đã ép amount * 100 thành `BigInt` trước khi insert.
   - `getTransactions()` trả về `amount` dạng `number` (chia 100) — an toàn cho Client do React không serialize được BigInt.

4. **AddTransactionDialog:**
   - Đã hoạt động đúng: gọi `createTransaction()`, `getAccounts()`, `getCategories()` qua server actions.
   - Fix type issue với base-ui Select's `onValueChange` (nhận `string | null`).

5. **Dependencies:**
   - Thêm `react-hook-form`, `zod`, `@hookform/resolvers` — cho form validation.
   - Thêm `@flow/db`, `@flow/domain`, `drizzle-orm` vào `apps/web` dependencies.

6. **Cleanup:**
   - Xóa `apps/web/src/lib/mock-transactions.ts` (mock data cũ).
   - Export `db` từ `@flow/db` (thêm vào `packages/db/src/index.ts`).

## DB Tables ảnh hưởng

- `transactions` — Select + Insert qua Server Actions.
- `accounts` — Select (cho form dropdown).
- `categories` — Select (cho form dropdown).

## Cách test

1. Chạy `pnpm dev` tại `apps/web`.
2. Truy cập `/transactions`.
3. Kiểm tra: bảng hiển thị dữ liệu từ DB (không còn mock data).
4. Bấm "Add Transaction" → điền form → Save → kiểm tra dòng mới xuất hiện.
5. Kiểm tra sorting các cột.

## Build

- `pnpm build` — **PASS**
- `npx tsc --noEmit` — **PASS** (0 errors)

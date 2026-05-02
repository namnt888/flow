🛠️ Năng lực: Core Ledger Domain (Sổ cái)

Tài liệu này quy định cấu trúc cốt lõi của sổ cái và các giao dịch. ĐỌC KỸ TRƯỚC KHI TẠO BẢNG TRANSACTIONS.

1. Định dạng Tiền tệ (CRITICAL)

Tuyệt đối không dùng Float hay Decimal để lưu tiền.

Bắt buộc dùng bigint (Drizzle: bigint('amount', { mode: 'bigint' })).

Giá trị lưu trữ = Số tiền thực tế × 100.

Cột amount LUÔN LÀ SỐ DƯƠNG.

2. Các Bảng Cốt Lõi (Core Tables)

accounts: Bảng tài khoản (Ví/Thẻ/Ngân hàng). Các cột tối thiểu: id (uuid, default random), name (text), type (enum: cash, bank, credit), currency (text, default 'VND'), created_at.

categories: Bảng phân loại. Cột tối thiểu: id, name, type (enum: income, expense, transfer), created_at.

transactions: Sổ cái giao dịch. Cột tối thiểu: id, account_id (fk), category_id (fk), amount (bigint), type (enum: income, expense, transfer), date (timestamp), notes (text), created_at.

3. Chuyển đổi Dữ liệu (Domain Logic)

Trong packages/domain: Cần có hàm convert giữa Input UI (ví dụ chuỗi "1,234.56") sang DB (BigInt 123456n) và ngược lại.
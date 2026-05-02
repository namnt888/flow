🛠️ Năng lực: Core Ledger Domain (Giao dịch cốt lõi)

Tài liệu này quy định cấu trúc cốt lõi của sổ cái (Ledger) và các giao dịch cơ bản. BẮT BUỘC đọc khi thay đổi cấu trúc bảng transactions hoặc accounts.

1. Định dạng Tiền tệ (Absolute Amount Rule)

Để tránh sai số dấu phẩy động (Floating point precision) trong tài chính:

Dưới Database (packages/db), mọi cột liên quan đến tiền (amount, balance) BẮT BUỘC phải là kiểu bigint.

Giá trị lưu trữ là giá trị thực tế nhân với 100 (Ví dụ: 10,000 VNĐ -> lưu là 1000000).

Dữ liệu amount lưu xuống DB LUÔN LÀ SỐ DƯƠNG.

2. Chiều dòng tiền (Transaction Type)

Việc xác định dòng tiền tăng hay giảm phụ thuộc vào Enum Type, KHÔNG phụ thuộc vào dấu của Amount.

INCOME: Tiền đi vào Account (+).

EXPENSE: Tiền đi ra khỏi Account (-).

TRANSFER: Tiền đi ra từ account_id và đi vào một destination_account_id.

3. Database Schema Guidelines (Supabase/Drizzle)

Luôn sử dụng uuid (mặc định là gen_random_uuid()) cho Primary Keys.

Luôn có 2 cột tracking mặc định: created_at (default now) và updated_at.

Phải có index trên các trường thường xuyên query (ví dụ: account_id, transaction_date).
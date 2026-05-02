🛠️ Năng lực: Quản lý Nợ, Split Bill & Subscriptions

Mục tiêu: Xử lý chính xác các giao dịch vay mượn, chia tiền, chốt nợ (roll-over) và các khoản thu định kỳ.

1. Tách biệt Dòng tiền thực và ảo

Tiền thực (Real Ledger): Ghi nhận trên các thẻ/tài khoản ngân hàng (transactions).

Nợ ảo (Virtual Ledger): Phân bổ nghĩa vụ nợ giữa User và Người khác (People).

Rule: Trả tiền Split Bill hoặc gom nợ KHÔNG ĐƯỢC sinh ra giao dịch trừ tiền ở tài khoản thực nếu không có dòng tiền thực sự di chuyển ở ngân hàng.

2. Nghiệp vụ Roll-over (Gom/Chuyển nợ giữa các tháng)

Nợ được quản lý theo Chu kỳ (Cycles - ví dụ: Tháng A, Tháng B).

Cuối mỗi chu kỳ, khi đối soát, số tiền một người (ví dụ: An) trả có thể:

Khớp: Xóa nợ chu kỳ.

Thiếu (Deficit): Khoản thiếu phải được tạo thành một bản ghi nợ mang sang (carry-forward / gộp) vào chu kỳ tiếp theo (Tháng B).

Dư (Surplus): Khoản dư được ghi nhận là Credit (Trừ vào tổng nợ của chu kỳ tiếp theo - Tháng B).

Bảng debt_cycles (hoặc logic tính toán tương đương) cần tính được số dư chuyển tiếp này. Công thức: Nợ đầu kỳ (từ tháng trước mang sang) + Phát sinh trong kỳ - Đã trả = Nợ cuối kỳ.

3. Quản lý Đăng ký định kỳ (Subscriptions) & Cron

Hệ thống hỗ trợ tự động tạo giao dịch (auto-txn) vào ngày 1 hàng tháng cho các khoản đăng ký chung (iCloud, YouTube, Spotify, v.v.).

Rule nhân hệ số (Multiplier): Dựa vào số lượng slot subscribe của một người để nhân tiền.

Ví dụ: An dùng 2 slot iCloud. Hệ thống cron chỉ cần tạo 1 transaction duy nhất với amount = đơn_giá_1_slot * 2.

Thiết kế DB cần có bảng subscriptions (hoặc data JSON) mapping giữa Person -> Service -> Multiplier (số lượng).
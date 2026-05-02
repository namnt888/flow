🛠️ Năng lực: Quy tắc Repo & Conventions

Tài liệu này định nghĩa cách làm việc với Git, cấu trúc PR và các quy tắc giao diện cốt lõi. Bất kỳ Agent nào tạo branch hay code UI đều phải đọc file này.

1. Branch Naming Convention (BẮT BUỘC)

Khi bắt đầu một tác vụ, Agent phải tạo branch mới theo chuẩn:
sprint-[số]-[tên-chủ-đề-có-chủ-vị]-[mmm-dd]

Ví dụ:

Tính năng tạo bảng giao dịch vào ngày 01 tháng 05: sprint-1-create-transaction-table-may-01

Sửa lỗi UI form vào ngày 12 tháng 05: sprint-2-fix-expense-icon-color-may-12

2. Pull Request & Commit Rules

Mọi Pull Request (PR) phải chứa mô tả rõ ràng để human review dễ dàng.

Tiêu đề PR/Commit: Bắt buộc có cấu trúc "Chủ ngữ + Vị ngữ" rõ ràng.

❌ Sai: update db hoặc fix bugs

✅ Đúng: Database bổ sung bảng Staging cho Batch Transfer hoặc UI sửa lỗi màu sắc icon Expense

Nội dung PR (PR Body): Phải trả lời được 3 ý sau:

Mục tiêu: PR này giải quyết vấn đề gì?

Impact: Bảng DB nào bị ảnh hưởng? Component nào thay đổi?

Test: Hướng dẫn User các bước test trên giao diện hoặc chạy lệnh test nào.

3. UI/UX & Data Display Conventions

Màu sắc & Format tiền tệ: - Luôn format số tiền theo chuẩn VNĐ (ngăn cách ngàn bằng dấu phẩy hoặc chấm, vd: 100,000).

Giao dịch giảm tiền (Expense, Lending, Fee): Icon và text số tiền dùng màu text-red-500, prefix dấu -.

Giao dịch tăng tiền (Income, Repayment, Cashback): Icon và text số tiền dùng màu text-green-500, prefix dấu +.

Data Grids: Mọi danh sách lớn (Transactions, Accounts) phải ưu tiên layout dạng bảng (Table) thay vì Cards để tận dụng không gian (data-dense). Có hỗ trợ checkbox multi-select.
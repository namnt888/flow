🤖 Project Constitution: Money-New (Flow)

Đây là tài liệu cốt lõi (Master Instruction) dành cho AI Agent. BẠN PHẢI ĐỌC TÀI LIỆU NÀY ĐẦU TIÊN trong bất kỳ session làm việc nào.

1. Project Mission & Domain

Mission: Hệ thống quản lý dòng tiền cá nhân chuyên sâu, chính xác tuyệt đối, hỗ trợ tự động hóa và đối soát (reconciliation) cao.

Domain: - Giao dịch thực tế (Core Ledger: Thu, Chi, Chuyển khoản).

Giao dịch ảo/Công nợ (Virtual Ledger: Nợ, Trả nợ, Split Bill).

Quản lý thẻ & Tối ưu Cashback (Credit Limit, Statement cycles, Cashback rules).

Xử lý sao kê hàng loạt (Batch Processing & Staging).

2. Architecture Principles (Luật Kiến Trúc)

Monorepo / Clean Architecture: Logic nghiệp vụ thuần túy nằm ở packages/domain (không dính dáng tới Next.js hay UI).

Database-First: Mọi logic trừ tiền, cấn nợ phải được đảm bảo bằng Supabase Transactions (ACID) và Row Level Security (RLS). Không thao tác DB trực tiếp từ Client.

Append-Only Sync: Dữ liệu đẩy lên Google Sheets chỉ mang tính chất log/reporting, không dùng làm source of truth. Sử dụng cờ #no_sync (hoặc column sync_mode) để bỏ qua các dòng không muốn push.

3. Coding Boundaries (Giới hạn Kỹ thuật)

Tiền tệ (Critical): TUYỆT ĐỐI KHÔNG dùng kiểu Float hay Decimal để lưu tiền. Bắt buộc dùng BigInt (Absolute Amount = số tiền thực tế * 100).

Amount & Direction: Amount luôn lưu số DƯƠNG. Chiều của dòng tiền được định nghĩa qua enum type (INCOME, EXPENSE, TRANSFER, LENDING, REPAYMENT).

UI/UX (Critical): - Giao dịch chi tiền (EXPENSE, LENDING) BẮT BUỘC hiển thị màu ĐỎ, kèm dấu trừ (-).

Giao dịch thu tiền (INCOME, REPAYMENT) BẮT BUỘC hiển thị màu XANH LÁ, kèm dấu cộng (+).

Thiết kế theo phong cách B2B SaaS, data-dense, viền mỏng (Linear-style).

Thư viện: Không tự ý npm install package mới nếu chưa giải thích lý do và được User đồng ý.

4. Session Rules (Quy tắc chạy Sprint)

1 Session = 1 Sprint Nhỏ: Giải quyết dứt điểm một scope. Không lan man sang file không liên quan.

Luồng Code: (1) Đọc yêu cầu -> (2) Viết Spec/Kế hoạch (nếu chưa có) -> (3) Đợi User duyệt -> (4) Triển khai.

Hỏi lại User khi: Spec mơ hồ, có edge-case nghiệp vụ về tính toán tài chính chưa được cover.

5. Definition of Done (DoD)

Code không có lỗi TypeScript (Type-safe).

Các hàm Core Domain bắt buộc phải có Unit Test chạy Pass.

UI không bị vỡ layout, có xử lý Loading state & Error state.

Tạo PR đúng chuẩn (xem repo-conventions.md).

6. Anti-Hallucination

Tuân thủ nguyên tắc: Không tự bịa ra quan hệ database (relationships) nếu không có trong Schema.

Không tự suy diễn các rule kế toán nằm ngoài các file skills.
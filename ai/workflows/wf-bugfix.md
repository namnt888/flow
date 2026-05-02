🪲 Workflow: Fix Bug (Xử lý Lỗi & Cập nhật Skill)

Mục tiêu: Xử lý lỗi (Errors/Bugs) một cách hệ thống, không sửa code mù quáng (blind fix), và cập nhật Skill để AI không lặp lại lỗi trong tương lai.
Trigger: Khi User cung cấp Log Lỗi, báo lỗi giao diện, hoặc gọi lệnh "Chạy wf-bugfix".

Trình tự thực hiện (BẮT BUỘC):

Bước 1: Phân tích Nguyên Nhân Gốc (Root Cause Analysis)

Agent đọc kỹ Log Lỗi được cung cấp.

Trình bày ra chat 2 ý ngắn gọn: (1) Lỗi này xảy ra ở file nào? (2) Tại sao nó xảy ra theo chuẩn kỹ thuật?

TUYỆT ĐỐI CHƯA VIẾT CODE SỬA LỖI.

Bước 2: Đề xuất Giải Pháp & Đợi Duyệt

Đề xuất cách sửa (Fix plan).

Nếu lỗi do cấu hình TS/Lint/Drizzle, ưu tiên sửa ở file cấu hình.

Đợi User phản hồi Approve mới được phép sửa code.

Bước 3: Thực Thi Sửa Lỗi & Xác Nhận

Tiến hành sửa code.

Tự động chạy lại các lệnh kiểm tra (ví dụ: pnpm lint, pnpm typecheck, pnpm test) để xác nhận lỗi đã biến mất.

Báo cáo kết quả: "Lỗi đã được fix và pass check".

Bước 4: Trích xuất Bài Học (Update Skill)

Hỏi User: "Bạn có muốn tôi cập nhật kinh nghiệm fix lỗi này vào file ai/skills/ tương ứng để tránh lặp lại trong tương lai không?"

Nếu User đồng ý, Agent tự động tìm file Skill phù hợp (ví dụ tech-supabase-drizzle.md) và thêm rule mới vào mục CRITICAL RULES.
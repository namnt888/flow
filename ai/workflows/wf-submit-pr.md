🔄 Workflow: Submit Pull Request (Đóng gói Task)

Mục tiêu: Hướng dẫn Agent tự động kiểm tra code, tạo branch chuẩn, commit và tạo Pull Request.
Trigger: User ra lệnh: "Submit PR", "Tạo PR cho code vừa rồi", hoặc "Hoàn thành task".

Trình tự thực hiện (Bắt buộc Agent làm theo):

Bước 1: Self-Check & Testing

Chạy lệnh linter (nếu có cấu hình).

Chạy lệnh test (pnpm test). Dừng ngay workflow nếu có bất kỳ test case nào FAILED và báo cáo User.

Bước 2: Xử lý Git Branch

Kiểm tra nhánh hiện tại (git branch --show-current).

Nếu đang ở main hoặc nhánh sai chuẩn, Agent tạo nhánh mới theo ai/skills/repo-conventions.md.

Format: sprint-[số]-[tên-chủ-đề]-[mmm-dd]. (Ví dụ: sprint-1-setup-drizzle-may-01).

Bước 3: Commit & Push

Lên danh sách các file đã thay đổi: git status.

Stage file: git add .

Commit với message chuẩn (Chủ ngữ + Vị ngữ). Ví dụ: Domain thêm logic tính cashback dựa trên MCC.

Push code: git push -u origin <tên-nhánh>.

Bước 4: Tạo Pull Request (Github CLI)

Dùng lệnh: gh pr create --title "<Message_Commit>" --body "..."

Nội dung Body bắt buộc có:

Vấn đề giải quyết: Tóm tắt logic vừa code.

Bảng DB ảnh hưởng: Liệt kê tên bảng (nếu có thay đổi schema).

Sprint & Date: Ghi rõ thông tin.

Test: Output của lệnh pnpm test (PASS).

Tiêu chí dừng: Agent trả về đường link PR trên Github cho User vào review.
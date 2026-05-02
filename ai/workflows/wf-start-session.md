🚀 Workflow: Start New Session (Gatekeeper)

Mục tiêu: Thiết lập context, tạo nhánh và lên kế hoạch (Plan) TRƯỚC KHI viết code. Tránh tình trạng Agent hallucinate hoặc tự ý code sai hướng.
Trigger: Khi bắt đầu một phiên chat mới hoặc làm một task mới.

Trình tự thực hiện (BẮT BUỘC):

Bước 1: Nạp Ngữ Cảnh (Context Loading)

Agent đọc thầm GEMINI.md để nhớ Hiến pháp.

Agent đọc thầm PROGRESS.md để biết vị trí dự án.

Agent đọc thầm các file ai/skills/ được User chỉ định trong prompt.

Bước 2: Xử lý Git Branch

Lấy tên task từ User, chuyển thành dạng format: sprint-[số]-[tên-chủ-đề]-[mmm-dd].

Chạy lệnh tạo và checkout sang nhánh mới.

Bước 3: Lập Kế Hoạch (Plan & Spec) - KHÔNG VIẾT CODE

Dựa vào yêu cầu của User, Agent phân tích và in ra màn hình chat một Implementation Plan ngắn gọn gồm:

Các bảng DB cần tạo/sửa (nếu có).

Các file cần tạo/sửa.

Edge cases nghiệp vụ phát hiện được.

Cuối plan, Agent BẮT BUỘC in ra câu hỏi: "Kế hoạch này đã chuẩn chưa? Nếu bạn OK, hãy gõ Approve để tôi bắt đầu viết code."

TIÊU CHÍ DỪNG: Dừng hoàn toàn mọi hành động, KHÔNG sinh file code .ts/.tsx, chỉ chờ User trả lời Approve mới được phép đi tiếp sang Workflow Code.
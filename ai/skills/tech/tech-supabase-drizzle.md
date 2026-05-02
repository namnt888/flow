🛠️ Skill: Supabase & Drizzle ORM

Mục tiêu: Thiết kế Schema và tương tác DB đảm bảo ACID và Type-safety.

Rules Bắt buộc (CRITICAL):

Thư mục chứa Database:

Mọi schema, types, migrations của DB đều phải nằm gọn trong packages/db. KHÔNG rải rác code DB sang apps/web.

Schema Design:

Primary keys luôn dùng uuid (hoặc varchar lưu CUID) sinh tự động.

Luôn có cột created_at và updated_at.

Cột lưu tiền (Amount) bắt buộc dùng bigint (hoặc integer lớn), lưu giá trị tuyệt đối (Cent/VND * 100).

Khi dùng Drizzle `bigint({ mode: 'bigint' })`, hàm `.default()` phải dùng syntax `sql\`'0'\`` hoặc literal `0n`, tuyệt đối không truyền string `'0'` (TypeScript sẽ báo lỗi vì default() chỉ nhận kiểu `bigint | SQL<unknown>`).

Database Transactions:

Mọi luồng tiền dính đến nhiều bảng (VD: Tạo Transaction thật + Tạo Nợ ảo Split Bill) BẮT BUỘC phải dùng db.transaction(async (tx) => {...}) của Drizzle để đảm bảo nếu lỗi 1 chỗ thì Rollback toàn bộ.
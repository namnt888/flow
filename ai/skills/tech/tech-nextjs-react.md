🛠️ Skill: Next.js (App Router) & React

Mục tiêu: Viết code Frontend an toàn, tách biệt Server/Client rõ ràng.

Rules Bắt buộc (CRITICAL):

Server vs Client Components:

Mặc định mọi component là Server Component.

CHỈ dùng "use client" ở những file thực sự cần state (useState, hooks) hoặc event listeners (onClick). Cố gắng đẩy "use client" xuống các leaf components (component lá).

Data Fetching & Mutations:

Client Component KHÔNG BAO GIỜ được gọi trực tiếp Supabase DB/Drizzle.

Việc mutate data (thêm/sửa/xóa) phải thông qua Server Actions (đặt trong src/actions/ hoặc chung file với "use server").

UI Libraries:

Sử dụng Tailwind CSS để style.

Sử dụng thư viện shadcn/ui làm base.
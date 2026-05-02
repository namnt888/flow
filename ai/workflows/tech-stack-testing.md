🛠️ Năng lực: Tech Stack & Testing Strategy

Tài liệu này quy định công nghệ được sử dụng và chiến lược kiểm thử (testing).

1. Tech Stack

Core Framework: Next.js (App Router). Cố gắng phân tách rõ "use client" và Server Components.

Database ORM: Drizzle ORM kết nối với Supabase PostgreSQL.

UI: Tailwind CSS + shadcn/ui + lucide-react (cho icons).

State Management: React Hook Form + Zod (cho forms), Zustand (chỉ dùng cho global client state nếu thực sự cần).

2. Chiến lược Kiểm thử (Testing Pyramid)

Do UI có thể thay đổi nhanh ở Phase 1, chiến lược kiểm thử ưu tiên bảo vệ logic cốt lõi.

Lớp 1: Unit Test (BẮT BUỘC)

Công cụ: Vitest.

Phạm vi: Thư mục packages/domain và các hàm tiện ích (utils).

Yêu cầu: Bất kỳ hàm nào xử lý tính toán tiền bạc (cộng trừ balance, chia tiền split bill, tính % cashback, parsing file excel) PHẢI có file test tương ứng (VD: cashback-calc.test.ts).

Quy tắc (TDD): Ưu tiên viết Test Cases trước khi viết Logic Function. Lệnh pnpm test phải PASS mới được tính là hoàn thành task.

Lớp 2: E2E Test (Hoãn lại cho Phase 2)

Công cụ: Playwright.

Phạm vi: tests/e2e/.

Quy tắc: Chỉ viết Playwright test cho các luồng cốt lõi (Critical paths) khi giao diện UI đã thực sự chốt (Ví dụ: Luồng End-to-End User đăng nhập và lưu thành công 1 giao dịch).
🛠️ Skill: Unit Testing & TDD (Vitest)

Mục tiêu: Viết Unit Test cho Business Logic và Database Queries để đảm bảo không gãy đổ khi refactor.
Khi nào dùng: Bắt buộc sử dụng khi code các logic nằm trong packages/domain hoặc các queries phức tạp trong packages/db.

Rules Bắt buộc (CRITICAL):

Framework: Sử dụng Vitest. Syntax giống hệt Jest.

Naming Convention: File test phải nằm cùng thư mục với file code, đuôi là .test.ts. (Ví dụ: balance-calc.test.ts).

Phạm vi Test (What to test):

Happy Path: Luồng thành công (VD: Thu 100k + Thu 50k = Balance 150k).

Edge Cases: Xử lý số âm, số 0, null/undefined, thiếu ID.

BigInt Handling: Đảm bảo test kịch bản tính toán với BigInt (Amount * 100) không bị lỗi sai số.

Mocking:

KHÔNG gọi DB thật trong Unit Test của Domain layer.

Phải mock các hàm interact với DB (dùng vi.mock() hoặc truyền dependency injection).

Workflow TDD: Nếu User yêu cầu "Áp dụng TDD", Agent BẮT BUỘC phải sinh file .test.ts chứa các test cases rỗng (fails) để User xem trước, sau đó mới viết logic implementation.
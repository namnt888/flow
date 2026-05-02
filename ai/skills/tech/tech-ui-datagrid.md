🛠️ Skill: Advanced DataGrid UI (TanStack Table)

Mục tiêu: Build màn hình quản lý (Transactions, Accounts) tối ưu không gian, tốc độ cao.
Khi nào dùng: Khi render danh sách dữ liệu > 10 dòng.

Rules Bắt buộc:

Thư viện: Mặc định sử dụng @tanstack/react-table kết hợp với shadcn/ui table component.

Hiệu năng: Khuyến khích sử dụng Virtualization nếu list có khả năng dài lên hàng ngàn dòng (vd: @tanstack/react-virtual).

Tương tác:

Phải có Checkbox ở cột đầu tiên để Multi-select.

Khi có dòng được select, phải hiển thị một Floating Bottom Bar (Thanh nổi ở dưới đáy màn hình) để sum (cộng tổng) cột amount của các dòng được chọn.

Style: Data-dense. Row height thấp (padding nhỏ p-2 hoặc p-1), font text cỡ text-sm. Đường viền (border) mờ để giống giao diện Excel/Notion.
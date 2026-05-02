🛠️ Skill: Domain Subscriptions (Thanh toán định kỳ)

Mục tiêu: Xử lý các khoản phí trả trước/định kỳ (VD: Netflix, iCloud, Youtube Premium) và tự động chia tiền cho các thành viên.

Rules Bắt buộc (CRITICAL):

Base Amount & Multiplier:

Một dịch vụ (Subscription) có giá gốc: base_amount.

Một người có thể dùng nhiều slot của dịch vụ đó. Phải quản lý qua hệ số nhân multiplier.

Tiền một người phải trả = base_amount * multiplier.

Ví dụ: An dùng 2 slot iCloud (Gói 19k). Multiplier của An = 2. Giao dịch sinh ra cho An có amount = 38,000.

Cronjob Auto-Generation:

Giao dịch định kỳ KHÔNG ghi đè lên nhau. Mỗi tháng (hoặc chu kỳ) trôi qua, hệ thống (Cron) sẽ insert các rows mới vào bảng transactions với type là EXPENSE và gán nợ (Split Bill) cho những người tương ứng.
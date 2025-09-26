// Sample news data for security updates
class NewsData {
  static List<Map<String, dynamic>> getSampleNews() {
    return [
      {
        'id': '1',
        'title': 'Cảnh báo: Mã độc Pegasus 2.0 tấn công thiết bị iOS',
        'summary': 'Phát hiện phiên bản mới của mã độc Pegasus có khả năng xâm nhập vào iPhone mà không cần người dùng tương tác.',
        'content': '''
Các nhà nghiên cứu bảo mật vừa phát hiện phiên bản mới của mã độc Pegasus với khả năng tấn công "zero-click" vào thiết bị iOS.

**Đặc điểm của Pegasus 2.0:**
- Không cần người dùng click vào link hay mở file đính kèm
- Có thể truy cập tin nhắn, cuộc gọi, và dữ liệu cá nhân
- Hoạt động âm thầm không để lại dấu vết

**Cách phòng chống:**
1. Cập nhật iOS lên phiên bản mới nhất
2. Tắt tính năng iMessage từ số lạ
3. Không jailbreak thiết bị
4. Sử dụng ứng dụng bảo mật để quét định kỳ

**Dấu hiệu nhận biết:**
- Thiết bị chạy chậm bất thường
- Pin tiêu thụ nhanh
- Dữ liệu mobile tăng đột ngột
        ''',
        'category': 'Mã độc mới',
        'timestamp': DateTime.now().subtract(const Duration(hours: 2)),
        'isImportant': true,
        'source': 'Kaspersky Lab',
        'tags': ['iOS', 'Malware', 'Zero-click', 'Pegasus'],
      },
      {
        'id': '2',
        'title': 'Lỗ hổng nghiêm trọng trong WhatsApp cho phép đọc tin nhắn',
        'summary': 'Lỗ hổng CVE-2024-21234 trong WhatsApp Web có thể bị khai thác để đọc trộm tin nhắn người dùng.',
        'content': '''
Facebook vừa phát hành bản vá khẩn cấp cho lỗ hổng bảo mật nghiêm trọng trong WhatsApp Web.

**Chi tiết lỗ hổng:**
- Mã CVE: CVE-2024-21234
- CVSS Score: 9.1 (Critical)
- Ảnh hưởng: WhatsApp Web versions < 2.2412.50

**Cách thức tấn công:**
Kẻ tấn công có thể gửi tin nhắn chứa code JavaScript độc hại, khi nạn nhân mở WhatsApp Web, code sẽ thực thi và đọc trộm toàn bộ tin nhắn.

**Khuyến nghị:**
1. Cập nhật WhatsApp mobile app ngay lập tức
2. Đăng xuất và đăng nhập lại WhatsApp Web
3. Không click vào link lạ trong tin nhắn
        ''',
        'category': 'Lỗ hổng bảo mật',
        'timestamp': DateTime.now().subtract(const Duration(hours: 5)),
        'isImportant': true,
        'source': 'Facebook Security Team',
        'tags': ['WhatsApp', 'XSS', 'Web Security', 'Critical'],
      },
      {
        'id': '3',
        'title': 'Chiến dịch phishing giả mạo ngân hàng Vietcombank',
        'summary': 'Phát hiện hàng nghìn email giả mạo Vietcombank yêu cầu khách hàng cập nhật thông tin tài khoản.',
        'content': '''
Vietcombank cảnh báo về chiến dịch phishing quy mô lớn nhắm vào khách hàng của ngân hàng.

**Đặc điểm email lừa đảo:**
- Tiêu đề: "Cập nhật thông tin bảo mật tài khoản"
- Người gửi: giả mạo địa chỉ @vietcombank.com.vn
- Nội dung: yêu cầu click link để "xác thực tài khoản"

**Website giả mạo:**
- URL: vietcombank-secure.com (KHÔNG PHẢI website chính thức)
- Giao diện: copy y hệt website thật
- Mục đích: đánh cắp username, password, OTP

**Cách nhận biết:**
1. Kiểm tra URL chính xác: vietcombank.com.vn
2. Ngân hàng không bao giờ yêu cầu nhập mật khẩu qua email
3. Liên hệ hotline 1900545413 để kiểm tra
        ''',
        'category': 'Phishing',
        'timestamp': DateTime.now().subtract(const Duration(hours: 8)),
        'isImportant': true,
        'source': 'Vietcombank',
        'tags': ['Banking', 'Phishing', 'Email', 'Vietnam'],
      },
      {
        'id': '4',
        'title': '5 cách bảo vệ điện thoại khỏi mã độc hiệu quả nhất',
        'summary': 'Hướng dẫn chi tiết các biện pháp bảo vệ smartphone khỏi virus, malware và các mối đe dọa khác.',
        'content': '''
Smartphone ngày càng trở thành mục tiêu hấp dẫn của cybercriminals. Dưới đây là 5 cách bảo vệ hiệu quả nhất:

**1. Cập nhật hệ điều hành thường xuyên**
- Bật tự động cập nhật
- Cài đặt bản vá bảo mật ngay khi có

**2. Chỉ tải ứng dụng từ store chính thức**
- App Store (iOS) và Google Play (Android)
- Tránh APK từ nguồn không rõ
- Đọc review trước khi cài

**3. Sử dụng ứng dụng bảo mật**
- Cài đặt antivirus mobile
- Quét định kỳ
- Bật tính năng chống phishing

**4. Cẩn thận với quyền ứng dụng**
- Chỉ cấp quyền cần thiết
- Rà soát quyền định kỳ
- Gỡ ứng dụng không dùng

**5. Sao lưu dữ liệu thường xuyên**
- Backup tự động lên cloud
- Kiểm tra backup định kỳ
- Mã hóa dữ liệu nhạy cảm
        ''',
        'category': 'Giải pháp bảo mật',
        'timestamp': DateTime.now().subtract(const Duration(days: 1)),
        'isImportant': false,
        'source': 'ViSecure Security Team',
        'tags': ['Mobile Security', 'Tips', 'Prevention', 'Best Practices'],
      },
      {
        'id': '5',
        'title': 'Microsoft phát hành bản vá khẩn cấp cho Windows Defender',
        'summary': 'Lỗ hổng trong Windows Defender có thể bị khai thác để bypass bảo vệ và cài đặt malware.',
        'content': '''
Microsoft vừa phát hành bản cập nhật khẩn cấp KB5034441 để vá lỗ hổng nghiêm trọng trong Windows Defender.

**Thông tin lỗ hổng:**
- CVE: CVE-2024-21302
- CVSS: 8.8 (High)
- Ảnh hưởng: Windows 10, Windows 11

**Cách thức khai thác:**
Attacker có thể gửi file malware đã được craft đặc biệt để bypass Windows Defender và thực thi code độc hại.

**Cách cập nhật:**
1. Mở Windows Update
2. Click "Check for updates"
3. Cài đặt KB5034441
4. Restart máy tính

**Khuyến nghị bổ sung:**
- Bật Windows Defender Real-time Protection
- Cập nhật định nghĩa virus định kỳ
- Sử dụng thêm antivirus thứ 3 nếu cần
        ''',
        'category': 'Cập nhật bảo mật',
        'timestamp': DateTime.now().subtract(const Duration(days: 2)),
        'isImportant': false,
        'source': 'Microsoft Security Response Center',
        'tags': ['Windows', 'Defender', 'Update', 'Microsoft'],
      },
      {
        'id': '6',
        'title': 'Ransomware mới "CryptoLocker 3.0" tấn công doanh nghiệp Việt Nam',
        'summary': 'Phát hiện biến thể mới của CryptoLocker nhắm vào các doanh nghiệp nhỏ và vừa tại Việt Nam.',
        'content': '''
Các chuyên gia an ninh mạng cảnh báo về sự xuất hiện của CryptoLocker 3.0 tại Việt Nam.

**Đặc điểm của CryptoLocker 3.0:**
- Mã hóa file với thuật toán AES-256
- Yêu cầu tiền chuộc bằng Bitcoin
- Tự động lan truyền qua mạng LAN
- Xóa shadow copy và backup

**Vector tấn công:**
1. Email phishing với file đính kèm .docx, .pdf
2. RDP brute-force attack
3. Exploit lỗ hổng SMB
4. USB malware

**Dấu hiệu nhiễm bệnh:**
- File bị đổi extension thành .crypto3
- Xuất hiện file README_DECRYPT.txt
- Hệ thống chạy chậm
- Không thể mở các file quan trọng

**Biện pháp phòng chống:**
1. Backup dữ liệu offline thường xuyên
2. Cập nhật hệ điều hành và ứng dụng
3. Đào tạo nhân viên về email phishing
4. Sử dụng endpoint protection solution
        ''',
        'category': 'Mã độc mới',
        'timestamp': DateTime.now().subtract(const Duration(days: 3)),
        'isImportant': true,
        'source': 'Vietnam Computer Emergency Response Team',
        'tags': ['Ransomware', 'Vietnam', 'Enterprise', 'CryptoLocker'],
      },
    ];
  }
  
  static List<Map<String, dynamic>> getNewsByCategory(String category) {
    return getSampleNews()
        .where((news) => news['category'] == category)
        .toList();
  }
  
  static List<Map<String, dynamic>> getImportantNews() {
    return getSampleNews()
        .where((news) => news['isImportant'] == true)
        .toList();
  }
  
  static List<Map<String, dynamic>> getRecentNews({int days = 7}) {
    final cutoff = DateTime.now().subtract(Duration(days: days));
    return getSampleNews()
        .where((news) => (news['timestamp'] as DateTime).isAfter(cutoff))
        .toList();
  }
}
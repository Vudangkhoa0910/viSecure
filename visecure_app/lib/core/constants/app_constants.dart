class AppConstants {
  // App Info
  static const String appName = 'ViSecure';
  static const String appSlogan = 'Bảo mật toàn diện, An tâm tuyệt đối';
  static const String appVersion = '1.0.0';
  
  // API Configuration
  static const String geminiApiKey = 'AIzaSyAtC25EM1Z-kmDIQ792Dfp8v_SCTHwuRq4';
  static const String geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  
  // Local Storage Keys
  static const String userDataKey = 'user_data';
  static const String settingsKey = 'app_settings';
  static const String secureDataKey = 'secure_data';
  static const String newsDataKey = 'news_data';
  static const String scanHistoryKey = 'scan_history';
  
  // Security
  static const String encryptionKey = 'visecure_encryption_key';
  static const int biometricTimeoutSeconds = 30;
  static const int maxLoginAttempts = 3;
  
  // Malicious Link Detection
  static const List<String> maliciousDomains = [
    'phishing-site.com',
    'fake-bank.com',
    'malware-download.com',
    'scam-website.org',
    // Thêm các domain độc hại khác
  ];
  
  static const List<String> suspiciousKeywords = [
    'urgent',
    'click here now',
    'congratulations',
    'you have won',
    'free money',
    'verify account',
    'suspended account',
    // Thêm các từ khóa đáng nghi khác
  ];
  
  // UI Constants
  static const double borderRadius = 12.0;
  static const double cardElevation = 4.0;
  static const double paddingSmall = 8.0;
  static const double paddingMedium = 16.0;
  static const double paddingLarge = 24.0;
  
  // Animation Duration
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration splashDuration = Duration(seconds: 3);
  
  // News Categories
  static const List<String> newsCategories = [
    'Lỗ hổng bảo mật',
    'Mã độc mới',
    'Phishing',
    'Giải pháp bảo mật',
    'Cập nhật bảo mật',
    'Cảnh báo an toàn',
  ];
}
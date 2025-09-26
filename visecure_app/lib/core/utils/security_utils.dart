// Malicious URL detection utilities
class SecurityUtils {
  static const List<String> maliciousDomains = [
    'phishing-site.com',
    'fake-bank.com',
    'malware-download.com',
    'scam-website.org',
    'suspicious-link.net',
    'dangerous-download.com',
  ];
  
  static const List<String> suspiciousKeywords = [
    'urgent',
    'click here now',
    'congratulations',
    'you have won',
    'free money',
    'verify account',
    'suspended account',
    'confirm identity',
    'act now',
    'limited time',
  ];
  
  static const List<String> phishingIndicators = [
    'secure-bank',
    'bank-verify',
    'account-suspended',
    'urgent-action',
    'verify-now',
    'security-alert',
  ];
  
  static SecurityLevel checkUrlSecurity(String url) {
    if (url.isEmpty) return SecurityLevel.unknown;
    
    final lowerUrl = url.toLowerCase();
    
    // Check for malicious domains
    for (final domain in maliciousDomains) {
      if (lowerUrl.contains(domain)) {
        return SecurityLevel.malicious;
      }
    }
    
    // Check for suspicious keywords
    int suspiciousCount = 0;
    for (final keyword in suspiciousKeywords) {
      if (lowerUrl.contains(keyword)) {
        suspiciousCount++;
      }
    }
    
    // Check for phishing indicators
    for (final indicator in phishingIndicators) {
      if (lowerUrl.contains(indicator)) {
        suspiciousCount += 2; // Higher weight for phishing indicators
      }
    }
    
    // Check URL structure for suspicious patterns
    if (_hasSubdomainSpoofing(lowerUrl)) {
      suspiciousCount += 2;
    }
    
    if (_hasUrlShortener(lowerUrl)) {
      suspiciousCount += 1;
    }
    
    if (_hasIPAddress(lowerUrl)) {
      suspiciousCount += 2;
    }
    
    // Determine security level based on suspicious count
    if (suspiciousCount >= 3) {
      return SecurityLevel.malicious;
    } else if (suspiciousCount >= 1) {
      return SecurityLevel.suspicious;
    } else if (_isKnownSafeDomain(lowerUrl)) {
      return SecurityLevel.safe;
    } else {
      return SecurityLevel.unknown;
    }
  }
  
  static bool _hasSubdomainSpoofing(String url) {
    // Check for common subdomain spoofing patterns
    final spoofingPatterns = [
      'secure-',
      'safe-',
      'official-',
      'verify-',
      'account-',
    ];
    
    return spoofingPatterns.any((pattern) => url.contains(pattern));
  }
  
  static bool _hasUrlShortener(String url) {
    final shorteners = [
      'bit.ly',
      'tinyurl.com',
      't.co',
      'short.link',
      'tiny.cc',
    ];
    
    return shorteners.any((shortener) => url.contains(shortener));
  }
  
  static bool _hasIPAddress(String url) {
    // Simple regex to check if URL contains IP address
    final ipPattern = RegExp(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b');
    return ipPattern.hasMatch(url);
  }
  
  static bool _isKnownSafeDomain(String url) {
    final safeDomains = [
      'google.com',
      'facebook.com',
      'apple.com',
      'microsoft.com',
      'amazon.com',
      'github.com',
      'stackoverflow.com',
      'wikipedia.org',
    ];
    
    return safeDomains.any((domain) => url.contains(domain));
  }
  
  static String getSecurityMessage(SecurityLevel level) {
    switch (level) {
      case SecurityLevel.safe:
        return 'Link này được xác định là an toàn';
      case SecurityLevel.suspicious:
        return 'Link này có dấu hiệu đáng nghi, hãy cẩn thận';
      case SecurityLevel.malicious:
        return 'CẢNH BÁO: Link này có thể độc hại, không nên truy cập';
      case SecurityLevel.unknown:
        return 'Không thể xác định mức độ an toàn của link này';
    }
  }
}

enum SecurityLevel {
  safe,
  suspicious,
  malicious,
  unknown,
}
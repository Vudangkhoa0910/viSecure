import 'package:local_auth/local_auth.dart';
import 'package:flutter/services.dart';

class BiometricService {
  static final BiometricService _instance = BiometricService._internal();
  factory BiometricService() => _instance;
  BiometricService._internal();
  
  static BiometricService get instance => _instance;
  
  late LocalAuthentication _localAuth;
  bool _isInitialized = false;
  
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      _localAuth = LocalAuthentication();
      _isInitialized = true;
      print('BiometricService initialized successfully');
    } catch (e) {
      print('Error initializing BiometricService: $e');
      rethrow;
    }
  }
  
  Future<bool> isDeviceSupported() async {
    try {
      return await _localAuth.isDeviceSupported();
    } catch (e) {
      print('Error checking device support: $e');
      return false;
    }
  }
  
  Future<bool> canCheckBiometrics() async {
    try {
      return await _localAuth.canCheckBiometrics;
    } catch (e) {
      print('Error checking biometrics availability: $e');
      return false;
    }
  }
  
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } catch (e) {
      print('Error getting available biometrics: $e');
      return [];
    }
  }
  
  Future<bool> authenticate({
    required String localizedReason,
    bool useErrorDialogs = true,
    bool stickyAuth = false,
    bool sensitiveTransaction = true,
    bool biometricOnly = false,
  }) async {
    try {
      // Check if biometrics are available
      final isAvailable = await canCheckBiometrics();
      if (!isAvailable) {
        throw BiometricException('Biometric authentication not available');
      }
      
      // Get available biometrics
      final availableBiometrics = await getAvailableBiometrics();
      if (availableBiometrics.isEmpty) {
        throw BiometricException('No biometric methods configured');
      }
      
      // Perform authentication
      final result = await _localAuth.authenticate(
        localizedReason: localizedReason,

        options: AuthenticationOptions(
          useErrorDialogs: useErrorDialogs,
          stickyAuth: stickyAuth,
          sensitiveTransaction: sensitiveTransaction,
          biometricOnly: biometricOnly,
        ),
      );
      
      return result;
    } on PlatformException catch (e) {
      print('Platform exception during authentication: $e');
      throw BiometricException(_mapPlatformException(e));
    } catch (e) {
      print('Error during authentication: $e');
      throw BiometricException('Authentication failed: $e');
    }
  }
  
  Future<bool> authenticateForLogin() async {
    return await authenticate(
      localizedReason: 'Xác thực để đăng nhập vào ViSecure',
      useErrorDialogs: true,
      stickyAuth: true,
      sensitiveTransaction: true,
      biometricOnly: false,
    );
  }
  
  Future<bool> authenticateForSecureAccess() async {
    return await authenticate(
      localizedReason: 'Xác thực để truy cập dữ liệu bảo mật',
      useErrorDialogs: true,
      stickyAuth: true,
      sensitiveTransaction: true,
      biometricOnly: true,
    );
  }
  
  Future<bool> authenticateForTransaction() async {
    return await authenticate(
      localizedReason: 'Xác thực để thực hiện giao dịch bảo mật',
      useErrorDialogs: true,
      stickyAuth: false,
      sensitiveTransaction: true,
      biometricOnly: true,
    );
  }
  
  Future<BiometricStatus> getBiometricStatus() async {
    try {
      final isSupported = await isDeviceSupported();
      if (!isSupported) {
        return BiometricStatus.notSupported;
      }
      
      final canCheck = await canCheckBiometrics();
      if (!canCheck) {
        return BiometricStatus.notAvailable;
      }
      
      final availableBiometrics = await getAvailableBiometrics();
      if (availableBiometrics.isEmpty) {
        return BiometricStatus.notEnrolled;
      }
      
      return BiometricStatus.available;
    } catch (e) {
      print('Error getting biometric status: $e');
      return BiometricStatus.error;
    }
  }
  
  String getBiometricStatusMessage(BiometricStatus status) {
    switch (status) {
      case BiometricStatus.available:
        return 'Xác thực sinh trắc học có sẵn';
      case BiometricStatus.notSupported:
        return 'Thiết bị không hỗ trợ xác thực sinh trắc học';
      case BiometricStatus.notAvailable:
        return 'Xác thực sinh trắc học không khả dụng';
      case BiometricStatus.notEnrolled:
        return 'Chưa thiết lập phương thức xác thực sinh trắc học';
      case BiometricStatus.error:
        return 'Lỗi xác thực sinh trắc học';
    }
  }
  
  Future<List<String>> getBiometricTypeNames() async {
    try {
      final biometrics = await getAvailableBiometrics();
      return biometrics.map((type) => _getBiometricTypeName(type)).toList();
    } catch (e) {
      print('Error getting biometric type names: $e');
      return [];
    }
  }
  
  String _getBiometricTypeName(BiometricType type) {
    switch (type) {
      case BiometricType.face:
        return 'Face ID';
      case BiometricType.fingerprint:
        return 'Vân tay';
      case BiometricType.iris:
        return 'Iris';
      case BiometricType.weak:
        return 'Xác thực yếu';
      case BiometricType.strong:
        return 'Xác thực mạnh';
    }
  }
  
  String _mapPlatformException(PlatformException e) {
    switch (e.code) {
      case 'NotAvailable':
        return 'Xác thực sinh trắc học không khả dụng trên thiết bị này';
      case 'NotEnrolled':
        return 'Chưa thiết lập phương thức xác thực sinh trắc học';
      case 'LockedOut':
        return 'Xác thực sinh trắc học bị khóa do quá nhiều lần thử';
      case 'PermanentlyLockedOut':
        return 'Xác thực sinh trắc học bị khóa vĩnh viễn';
      case 'BiometricOnlyNotSupported':
        return 'Thiết bị không hỗ trợ xác thực sinh trắc học độc lập';
      case 'UserCancel':
        return 'Người dùng đã hủy xác thực';
      case 'UserFallback':
        return 'Người dùng chọn phương thức xác thực khác';
      case 'SystemCancel':
        return 'Hệ thống đã hủy xác thực';
      case 'InvalidContext':
        return 'Ngữ cảnh xác thực không hợp lệ';
      case 'NotInteractive':
        return 'Xác thực không thể thực hiện trong chế độ không tương tác';
      default:
        return 'Lỗi xác thực sinh trắc học: ${e.message}';
    }
  }
  
  Future<void> stopAuthentication() async {
    try {
      await _localAuth.stopAuthentication();
    } catch (e) {
      print('Error stopping authentication: $e');
    }
  }
}

enum BiometricStatus {
  available,
  notSupported,
  notAvailable,
  notEnrolled,
  error,
}

class BiometricException implements Exception {
  final String message;
  BiometricException(this.message);
  
  @override
  String toString() => 'BiometricException: $message';
}
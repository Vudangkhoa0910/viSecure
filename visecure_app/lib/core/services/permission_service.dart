import 'package:permission_handler/permission_handler.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'dart:io';

class PermissionService {
  static final PermissionService _instance = PermissionService._internal();
  factory PermissionService() => _instance;
  PermissionService._internal();
  
  static PermissionService get instance => _instance;
  
  late DeviceInfoPlugin _deviceInfo;
  bool _isInitialized = false;
  
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      _deviceInfo = DeviceInfoPlugin();
      _isInitialized = true;
      print('PermissionService initialized successfully');
    } catch (e) {
      print('Error initializing PermissionService: $e');
      rethrow;
    }
  }
  
  Future<void> requestPermissions() async {
    try {
      final permissions = await _getRequiredPermissions();
      
      // Request all permissions at once
      final statuses = await permissions.request();
      
      // Log permission statuses
      for (final entry in statuses.entries) {
        print('Permission ${entry.key}: ${entry.value}');
      }
      
      // Handle denied permissions
      await _handleDeniedPermissions(statuses);
      
    } catch (e) {
      print('Error requesting permissions: $e');
      rethrow;
    }
  }
  
  Future<List<Permission>> _getRequiredPermissions() async {
    final permissions = <Permission>[];
    
    // Camera permission for QR scanning and photo capture
    permissions.add(Permission.camera);
    
    // Storage permissions for saving scan results and cache
    if (Platform.isAndroid) {
      final androidInfo = await _deviceInfo.androidInfo;
      if (androidInfo.version.sdkInt <= 32) {
        permissions.add(Permission.storage);
      } else {
        permissions.add(Permission.photos);
        permissions.add(Permission.videos);
      }
    } else if (Platform.isIOS) {
      permissions.add(Permission.photos);
    }
    
    // Microphone permission for voice assistant
    permissions.add(Permission.microphone);
    
    // Location permission for security context (optional)
    permissions.add(Permission.locationWhenInUse);
    
    // Notification permission for security alerts
    if (Platform.isAndroid) {
      final androidInfo = await _deviceInfo.androidInfo;
      if (androidInfo.version.sdkInt >= 33) {
        permissions.add(Permission.notification);
      }
    } else if (Platform.isIOS) {
      permissions.add(Permission.notification);
    }
    
    return permissions;
  }
  
  Future<void> _handleDeniedPermissions(Map<Permission, PermissionStatus> statuses) async {
    final deniedPermissions = <Permission>[];
    final permanentlyDeniedPermissions = <Permission>[];
    
    for (final entry in statuses.entries) {
      if (entry.value.isDenied) {
        deniedPermissions.add(entry.key);
      } else if (entry.value.isPermanentlyDenied) {
        permanentlyDeniedPermissions.add(entry.key);
      }
    }
    
    if (deniedPermissions.isNotEmpty) {
      print('Denied permissions: ${deniedPermissions.map((p) => p.toString()).join(', ')}');
    }
    
    if (permanentlyDeniedPermissions.isNotEmpty) {
      print('Permanently denied permissions: ${permanentlyDeniedPermissions.map((p) => p.toString()).join(', ')}');
      // Could show dialog to open app settings
    }
  }
  
  Future<bool> hasPermission(Permission permission) async {
    try {
      final status = await permission.status;
      return status.isGranted;
    } catch (e) {
      print('Error checking permission ${permission}: $e');
      return false;
    }
  }
  
  Future<PermissionStatus> getPermissionStatus(Permission permission) async {
    try {
      return await permission.status;
    } catch (e) {
      print('Error getting permission status ${permission}: $e');
      return PermissionStatus.denied;
    }
  }
  
  Future<bool> requestSinglePermission(Permission permission) async {
    try {
      final status = await permission.request();
      return status.isGranted;
    } catch (e) {
      print('Error requesting permission ${permission}: $e');
      return false;
    }
  }
  
  Future<bool> hasCameraPermission() async {
    return await hasPermission(Permission.camera);
  }
  
  Future<bool> requestCameraPermission() async {
    return await requestSinglePermission(Permission.camera);
  }
  
  Future<bool> hasMicrophonePermission() async {
    return await hasPermission(Permission.microphone);
  }
  
  Future<bool> requestMicrophonePermission() async {
    return await requestSinglePermission(Permission.microphone);
  }
  
  Future<bool> hasStoragePermission() async {
    if (Platform.isAndroid) {
      final androidInfo = await _deviceInfo.androidInfo;
      if (androidInfo.version.sdkInt <= 32) {
        return await hasPermission(Permission.storage);
      } else {
        return await hasPermission(Permission.photos);
      }
    } else if (Platform.isIOS) {
      return await hasPermission(Permission.photos);
    }
    return false;
  }
  
  Future<bool> requestStoragePermission() async {
    if (Platform.isAndroid) {
      final androidInfo = await _deviceInfo.androidInfo;
      if (androidInfo.version.sdkInt <= 32) {
        return await requestSinglePermission(Permission.storage);
      } else {
        return await requestSinglePermission(Permission.photos);
      }
    } else if (Platform.isIOS) {
      return await requestSinglePermission(Permission.photos);
    }
    return false;
  }
  
  Future<bool> hasLocationPermission() async {
    return await hasPermission(Permission.locationWhenInUse);
  }
  
  Future<bool> requestLocationPermission() async {
    return await requestSinglePermission(Permission.locationWhenInUse);
  }
  
  Future<bool> hasNotificationPermission() async {
    return await hasPermission(Permission.notification);
  }
  
  Future<bool> requestNotificationPermission() async {
    return await requestSinglePermission(Permission.notification);
  }
  
  Future<Map<Permission, PermissionStatus>> getAllPermissionStatuses() async {
    try {
      final permissions = await _getRequiredPermissions();
      final statuses = <Permission, PermissionStatus>{};
      
      for (final permission in permissions) {
        statuses[permission] = await permission.status;
      }
      
      return statuses;
    } catch (e) {
      print('Error getting all permission statuses: $e');
      return {};
    }
  }
  
  Future<List<Permission>> getMissingPermissions() async {
    try {
      final allStatuses = await getAllPermissionStatuses();
      return allStatuses.entries
          .where((entry) => !entry.value.isGranted)
          .map((entry) => entry.key)
          .toList();
    } catch (e) {
      print('Error getting missing permissions: $e');
      return [];
    }
  }
  
  Future<bool> areAllPermissionsGranted() async {
    try {
      final missingPermissions = await getMissingPermissions();
      return missingPermissions.isEmpty;
    } catch (e) {
      print('Error checking if all permissions granted: $e');
      return false;
    }
  }
  
  Future<bool> openAppSettings() async {
    try {
      return await openAppSettings();
    } catch (e) {
      print('Error opening app settings: $e');
      return false;
    }
  }
  
  String getPermissionName(Permission permission) {
    switch (permission) {
      case Permission.camera:
        return 'Camera';
      case Permission.microphone:
        return 'Microphone';
      case Permission.storage:
        return 'Storage';
      case Permission.photos:
        return 'Photos';
      case Permission.videos:
        return 'Videos';
      case Permission.locationWhenInUse:
        return 'Location';
      case Permission.notification:
        return 'Notifications';
      default:
        return permission.toString().split('.').last;
    }
  }
  
  String getPermissionDescription(Permission permission) {
    switch (permission) {
      case Permission.camera:
        return 'Cần thiết để quét QR code và chụp ảnh phân tích';
      case Permission.microphone:
        return 'Cần thiết cho tính năng trợ lý AI bằng giọng nói';
      case Permission.storage:
      case Permission.photos:
      case Permission.videos:
        return 'Cần thiết để lưu trữ và truy cập ảnh để phân tích';
      case Permission.locationWhenInUse:
        return 'Giúp cung cấp thông tin bảo mật theo vị trí (tùy chọn)';
      case Permission.notification:
        return 'Cần thiết để gửi cảnh báo bảo mật quan trọng';
      default:
        return 'Quyền này cần thiết cho ứng dụng hoạt động bình thường';
    }
  }
  
  Future<bool> shouldShowRequestPermissionRationale(Permission permission) async {
    try {
      if (Platform.isAndroid) {
        return await permission.shouldShowRequestRationale;
      }
      return false;
    } catch (e) {
      print('Error checking should show rationale for ${permission}: $e');
      return false;
    }
  }
}
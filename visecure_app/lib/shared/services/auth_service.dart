import 'package:flutter/foundation.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';

class AuthService extends ChangeNotifier {
  final LocalAuthentication _localAuth = LocalAuthentication();
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  
  bool _isAuthenticated = false;
  bool _isBiometricAvailable = false;
  String? _userId;
  
  bool get isAuthenticated => _isAuthenticated;
  bool get isBiometricAvailable => _isBiometricAvailable;
  String? get userId => _userId;
  
  AuthService() {
    _initializeAuth();
  }
  
  Future<void> _initializeAuth() async {
    await _checkBiometricAvailability();
    await _checkAuthenticationStatus();
  }
  
  Future<void> _checkBiometricAvailability() async {
    try {
      final isAvailable = await _localAuth.canCheckBiometrics;
      final isDeviceSupported = await _localAuth.isDeviceSupported();
      _isBiometricAvailable = isAvailable && isDeviceSupported;
      notifyListeners();
    } catch (e) {
      print('Error checking biometric availability: $e');
      _isBiometricAvailable = false;
    }
  }
  
  Future<void> _checkAuthenticationStatus() async {
    try {
      final authToken = await _secureStorage.read(key: 'auth_token');
      final userId = await _secureStorage.read(key: 'user_id');
      
      if (authToken != null && userId != null) {
        _isAuthenticated = true;
        _userId = userId;
        notifyListeners();
      }
    } catch (e) {
      print('Error checking authentication status: $e');
    }
  }
  
  Future<bool> authenticateWithBiometric() async {
    try {
      if (!_isBiometricAvailable) {
        return false;
      }
      
      final isAuthenticated = await _localAuth.authenticate(
        localizedReason: 'Xác thực sinh trắc học để truy cập ViSecure',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );
      
      if (isAuthenticated) {
        await _setAuthenticatedState();
      }
      
      return isAuthenticated;
    } catch (e) {
      print('Error during biometric authentication: $e');
      return false;
    }
  }
  
  Future<bool> authenticateWithPassword(String password) async {
    try {
      final storedPasswordHash = await _secureStorage.read(key: 'password_hash');
      
      if (storedPasswordHash == null) {
        return false;
      }
      
      final passwordHash = _hashPassword(password);
      
      if (passwordHash == storedPasswordHash) {
        await _setAuthenticatedState();
        return true;
      }
      
      return false;
    } catch (e) {
      print('Error during password authentication: $e');
      return false;
    }
  }
  
  Future<bool> registerWithPassword(String password) async {
    try {
      final passwordHash = _hashPassword(password);
      final userId = _generateUserId();
      
      await _secureStorage.write(key: 'password_hash', value: passwordHash);
      await _secureStorage.write(key: 'user_id', value: userId);
      
      await _setAuthenticatedState();
      return true;
    } catch (e) {
      print('Error during registration: $e');
      return false;
    }
  }
  
  Future<void> _setAuthenticatedState() async {
    try {
      final authToken = _generateAuthToken();
      final userId = await _secureStorage.read(key: 'user_id') ?? _generateUserId();
      
      await _secureStorage.write(key: 'auth_token', value: authToken);
      await _secureStorage.write(key: 'user_id', value: userId);
      
      _isAuthenticated = true;
      _userId = userId;
      notifyListeners();
    } catch (e) {
      print('Error setting authenticated state: $e');
    }
  }
  
  Future<void> logout() async {
    try {
      await _secureStorage.delete(key: 'auth_token');
      
      _isAuthenticated = false;
      _userId = null;
      notifyListeners();
    } catch (e) {
      print('Error during logout: $e');
    }
  }
  
  Future<bool> changePassword(String oldPassword, String newPassword) async {
    try {
      final isValid = await authenticateWithPassword(oldPassword);
      
      if (!isValid) {
        return false;
      }
      
      final newPasswordHash = _hashPassword(newPassword);
      await _secureStorage.write(key: 'password_hash', value: newPasswordHash);
      
      return true;
    } catch (e) {
      print('Error changing password: $e');
      return false;
    }
  }
  
  Future<bool> hasRegisteredUser() async {
    try {
      final passwordHash = await _secureStorage.read(key: 'password_hash');
      return passwordHash != null;
    } catch (e) {
      print('Error checking registered user: $e');
      return false;
    }
  }
  
  String _hashPassword(String password) {
    final bytes = utf8.encode(password + 'visecure_salt');
    final digest = sha256.convert(bytes);
    return digest.toString();
  }
  
  String _generateAuthToken() {
    final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
    final bytes = utf8.encode(timestamp + 'visecure_token');
    final digest = sha256.convert(bytes);
    return digest.toString();
  }
  
  String _generateUserId() {
    final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
    final bytes = utf8.encode(timestamp + 'visecure_user');
    final digest = sha256.convert(bytes);
    return digest.toString().substring(0, 16);
  }
}
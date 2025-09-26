import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:crypto/crypto.dart';
import 'package:encrypt/encrypt.dart';
import 'dart:convert';
import 'dart:typed_data';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();
  
  static StorageService get instance => _instance;
  
  late FlutterSecureStorage _secureStorage;
  late Box _userPreferencesBox;
  late Box _secureDataBox;
  late Box _scanHistoryBox;
  late Box _newsDataBox;
  late Encrypter _encrypter;
  late IV _iv;
  
  bool _isInitialized = false;
  
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Initialize secure storage
      const secureStorageOptions = AndroidOptions(
        encryptedSharedPreferences: true,
      );
      _secureStorage = const FlutterSecureStorage(
        aOptions: secureStorageOptions,
      );
      
      // Initialize encryption
      await _initializeEncryption();
      
      // Initialize Hive boxes
      await _initializeHiveBoxes();
      
      _isInitialized = true;
      print('StorageService initialized successfully');
    } catch (e) {
      print('Error initializing StorageService: $e');
      rethrow;
    }
  }
  
  Future<void> _initializeEncryption() async {
    try {
      // Get or generate encryption key
      String? keyString = await _secureStorage.read(key: 'encryption_key');
      if (keyString == null) {
        final key = Key.fromSecureRandom(32);
        keyString = key.base64;
        await _secureStorage.write(key: 'encryption_key', value: keyString);
      }
      
      final key = Key.fromBase64(keyString);
      _encrypter = Encrypter(AES(key));
      _iv = IV.fromSecureRandom(16);
      
      print('Encryption initialized successfully');
    } catch (e) {
      print('Error initializing encryption: $e');
      rethrow;
    }
  }
  
  Future<void> _initializeHiveBoxes() async {
    try {
      _userPreferencesBox = await Hive.openBox('user_preferences');
      _secureDataBox = await Hive.openBox('secure_data');
      _scanHistoryBox = await Hive.openBox('scan_history');
      _newsDataBox = await Hive.openBox('news_data');
      
      print('Hive boxes initialized successfully');
    } catch (e) {
      print('Error initializing Hive boxes: $e');
      rethrow;
    }
  }
  
  // Secure Storage Methods
  Future<void> writeSecure(String key, String value) async {
    try {
      final encrypted = _encrypter.encrypt(value, iv: _iv);
      await _secureStorage.write(key: key, value: encrypted.base64);
    } catch (e) {
      print('Error writing secure data: $e');
      rethrow;
    }
  }
  
  Future<String?> readSecure(String key) async {
    try {
      final encryptedValue = await _secureStorage.read(key: key);
      if (encryptedValue == null) return null;
      
      final encrypted = Encrypted.fromBase64(encryptedValue);
      return _encrypter.decrypt(encrypted, iv: _iv);
    } catch (e) {
      print('Error reading secure data: $e');
      return null;
    }
  }
  
  Future<void> deleteSecure(String key) async {
    try {
      await _secureStorage.delete(key: key);
    } catch (e) {
      print('Error deleting secure data: $e');
      rethrow;
    }
  }
  
  Future<void> clearAllSecure() async {
    try {
      await _secureStorage.deleteAll();
    } catch (e) {
      print('Error clearing secure storage: $e');
      rethrow;
    }
  }
  
  // User Preferences Methods
  Future<void> setUserPreference(String key, dynamic value) async {
    try {
      await _userPreferencesBox.put(key, value);
    } catch (e) {
      print('Error setting user preference: $e');
      rethrow;
    }
  }
  
  T? getUserPreference<T>(String key, {T? defaultValue}) {
    try {
      return _userPreferencesBox.get(key, defaultValue: defaultValue) as T?;
    } catch (e) {
      print('Error getting user preference: $e');
      return defaultValue;
    }
  }
  
  Future<void> removeUserPreference(String key) async {
    try {
      await _userPreferencesBox.delete(key);
    } catch (e) {
      print('Error removing user preference: $e');
      rethrow;
    }
  }
  
  // Secure Data Methods
  Future<void> saveSecureData(String key, Map<String, dynamic> data) async {
    try {
      final jsonString = jsonEncode(data);
      final encrypted = _encrypter.encrypt(jsonString, iv: _iv);
      await _secureDataBox.put(key, encrypted.base64);
    } catch (e) {
      print('Error saving secure data: $e');
      rethrow;
    }
  }
  
  Future<Map<String, dynamic>?> getSecureData(String key) async {
    try {
      final encryptedValue = _secureDataBox.get(key);
      if (encryptedValue == null) return null;
      
      final encrypted = Encrypted.fromBase64(encryptedValue);
      final decryptedString = _encrypter.decrypt(encrypted, iv: _iv);
      return jsonDecode(decryptedString) as Map<String, dynamic>;
    } catch (e) {
      print('Error getting secure data: $e');
      return null;
    }
  }
  
  Future<void> deleteSecureData(String key) async {
    try {
      await _secureDataBox.delete(key);
    } catch (e) {
      print('Error deleting secure data: $e');
      rethrow;
    }
  }
  
  // Scan History Methods
  Future<void> saveScanResult(Map<String, dynamic> scanResult) async {
    try {
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      scanResult['timestamp'] = timestamp;
      scanResult['id'] = _generateId();
      
      await _scanHistoryBox.put(scanResult['id'], scanResult);
      
      // Keep only last 100 scans
      await _cleanupScanHistory();
    } catch (e) {
      print('Error saving scan result: $e');
      rethrow;
    }
  }
  
  List<Map<String, dynamic>> getScanHistory({int? limit}) {
    try {
      final results = _scanHistoryBox.values
          .cast<Map<String, dynamic>>()
          .toList()
        ..sort((a, b) => (b['timestamp'] as int).compareTo(a['timestamp'] as int));
      
      if (limit != null && results.length > limit) {
        return results.take(limit).toList();
      }
      
      return results;
    } catch (e) {
      print('Error getting scan history: $e');
      return [];
    }
  }
  
  Future<void> deleteScanResult(String id) async {
    try {
      await _scanHistoryBox.delete(id);
    } catch (e) {
      print('Error deleting scan result: $e');
      rethrow;
    }
  }
  
  Future<void> clearScanHistory() async {
    try {
      await _scanHistoryBox.clear();
    } catch (e) {
      print('Error clearing scan history: $e');
      rethrow;
    }
  }
  
  Future<void> _cleanupScanHistory() async {
    try {
      final allResults = getScanHistory();
      if (allResults.length > 100) {
        final toDelete = allResults.skip(100).toList();
        for (final result in toDelete) {
          await _scanHistoryBox.delete(result['id']);
        }
      }
    } catch (e) {
      print('Error cleaning up scan history: $e');
    }
  }
  
  // News Data Methods
  Future<void> saveNewsData(List<Map<String, dynamic>> newsData) async {
    try {
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      await _newsDataBox.put('news_data', {
        'data': newsData,
        'timestamp': timestamp,
      });
    } catch (e) {
      print('Error saving news data: $e');
      rethrow;
    }
  }
  
  List<Map<String, dynamic>>? getNewsData() {
    try {
      final storedData = _newsDataBox.get('news_data');
      if (storedData == null) return null;
      
      final timestamp = storedData['timestamp'] as int;
      final now = DateTime.now().millisecondsSinceEpoch;
      
      // Check if data is older than 1 hour
      if (now - timestamp > 3600000) {
        return null; // Data is stale
      }
      
      return (storedData['data'] as List).cast<Map<String, dynamic>>();
    } catch (e) {
      print('Error getting news data: $e');
      return null;
    }
  }
  
  // Utility Methods
  String _generateId() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final random = (timestamp % 1000).toString().padLeft(3, '0');
    return '${timestamp}_$random';
  }
  
  Future<void> exportData() async {
    try {
      final userData = {
        'preferences': _userPreferencesBox.toMap(),
        'scanHistory': _scanHistoryBox.toMap(),
        'exportTimestamp': DateTime.now().millisecondsSinceEpoch,
      };
      
      final jsonString = jsonEncode(userData);
      final encrypted = _encrypter.encrypt(jsonString, iv: _iv);
      
      // This would typically save to a file or upload to cloud
      print('Data exported successfully');
    } catch (e) {
      print('Error exporting data: $e');
      rethrow;
    }
  }
  
  Future<void> importData(String encryptedData) async {
    try {
      final encrypted = Encrypted.fromBase64(encryptedData);
      final decryptedString = _encrypter.decrypt(encrypted, iv: _iv);
      final userData = jsonDecode(decryptedString) as Map<String, dynamic>;
      
      // Import preferences
      final preferences = userData['preferences'] as Map<String, dynamic>;
      for (final entry in preferences.entries) {
        await _userPreferencesBox.put(entry.key, entry.value);
      }
      
      // Import scan history
      final scanHistory = userData['scanHistory'] as Map<String, dynamic>;
      for (final entry in scanHistory.entries) {
        await _scanHistoryBox.put(entry.key, entry.value);
      }
      
      print('Data imported successfully');
    } catch (e) {
      print('Error importing data: $e');
      rethrow;
    }
  }
  
  Future<void> dispose() async {
    try {
      await _userPreferencesBox.close();
      await _secureDataBox.close();
      await _scanHistoryBox.close();
      await _newsDataBox.close();
      _isInitialized = false;
    } catch (e) {
      print('Error disposing StorageService: $e');
    }
  }
}
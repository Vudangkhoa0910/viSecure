import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:encrypt/encrypt.dart' as encrypt;
import 'dart:convert';

class StorageService extends ChangeNotifier {
  static const String _boxName = 'visecure_data';
  static const String _secureBoxName = 'visecure_secure';
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage();
  
  late Box _box;
  late Box _secureBox;
  late encrypt.Encrypter _encrypter;
  late encrypt.IV _iv;
  
  bool _isInitialized = false;
  bool get isInitialized => _isInitialized;
  
  static Future<void> init() async {
    final service = StorageService();
    await service._initialize();
  }
  
  Future<void> _initialize() async {
    try {
      // Initialize encryption
      await _initializeEncryption();
      
      // Open Hive boxes
      _box = await Hive.openBox(_boxName);
      _secureBox = await Hive.openBox(_secureBoxName);
      
      _isInitialized = true;
      notifyListeners();
    } catch (e) {
      print('Error initializing storage service: $e');
      _isInitialized = false;
    }
  }
  
  Future<void> _initializeEncryption() async {
    try {
      // Get or generate encryption key
      String? keyString = await _secureStorage.read(key: 'encryption_key');
      
      if (keyString == null) {
        final encryptionKey = encrypt.Key.fromSecureRandom(32);
        keyString = encryptionKey.base64;
        await _secureStorage.write(key: 'encryption_key', value: keyString);
      }
      
      final key = encrypt.Key.fromBase64(keyString);
      _encrypter = encrypt.Encrypter(encrypt.AES(key));
      _iv = encrypt.IV.fromSecureRandom(16);
    } catch (e) {
      print('Error initializing encryption: $e');
      rethrow;
    }
  }
  
  // General data storage methods
  Future<void> saveData(String key, dynamic value) async {
    try {
      if (!_isInitialized) await _initialize();
      await _box.put(key, value);
      notifyListeners();
    } catch (e) {
      print('Error saving data: $e');
    }
  }
  
  T? getData<T>(String key, {T? defaultValue}) {
    try {
      if (!_isInitialized) return defaultValue;
      return _box.get(key, defaultValue: defaultValue);
    } catch (e) {
      print('Error getting data: $e');
      return defaultValue;
    }
  }
  
  Future<void> deleteData(String key) async {
    try {
      if (!_isInitialized) await _initialize();
      await _box.delete(key);
      notifyListeners();
    } catch (e) {
      print('Error deleting data: $e');
    }
  }
  
  // Secure data storage methods
  Future<void> saveSecureData(String key, dynamic value) async {
    try {
      if (!_isInitialized) await _initialize();
      
      final jsonString = json.encode(value);
      final encrypted = _encrypter.encrypt(jsonString, iv: _iv);
      
      await _secureBox.put(key, {
        'data': encrypted.base64,
        'iv': _iv.base64,
      });
      
      notifyListeners();
    } catch (e) {
      print('Error saving secure data: $e');
    }
  }
  
  T? getSecureData<T>(String key, {T? defaultValue}) {
    try {
      if (!_isInitialized) return defaultValue;
      
      final encryptedData = _secureBox.get(key);
      if (encryptedData == null) return defaultValue;
      
      final encrypted = encrypt.Encrypted.fromBase64(encryptedData['data']);
      final iv = encrypt.IV.fromBase64(encryptedData['iv']);
      
      final decrypted = _encrypter.decrypt(encrypted, iv: iv);
      final decodedValue = json.decode(decrypted);
      
      return decodedValue as T?;
    } catch (e) {
      print('Error getting secure data: $e');
      return defaultValue;
    }
  }
  
  Future<void> deleteSecureData(String key) async {
    try {
      if (!_isInitialized) await _initialize();
      await _secureBox.delete(key);
      notifyListeners();
    } catch (e) {
      print('Error deleting secure data: $e');
    }
  }
  
  // Scan history methods
  Future<void> saveScanResult(Map<String, dynamic> scanResult) async {
    try {
      final scanHistory = getScanHistory();
      scanResult['timestamp'] = DateTime.now().toIso8601String();
      scanResult['id'] = DateTime.now().millisecondsSinceEpoch.toString();
      
      scanHistory.insert(0, scanResult);
      
      // Keep only last 100 scan results
      if (scanHistory.length > 100) {
        scanHistory.removeRange(100, scanHistory.length);
      }
      
      await saveSecureData('scan_history', scanHistory);
    } catch (e) {
      print('Error saving scan result: $e');
    }
  }
  
  List<Map<String, dynamic>> getScanHistory() {
    try {
      final history = getSecureData<List>('scan_history', defaultValue: []);
      return history?.cast<Map<String, dynamic>>() ?? [];
    } catch (e) {
      print('Error getting scan history: $e');
      return [];
    }
  }
  
  Future<void> clearScanHistory() async {
    try {
      await deleteSecureData('scan_history');
    } catch (e) {
      print('Error clearing scan history: $e');
    }
  }
  
  // News data methods
  Future<void> saveNewsData(List<Map<String, dynamic>> newsData) async {
    try {
      await saveData('news_data', newsData);
      await saveData('news_last_updated', DateTime.now().toIso8601String());
    } catch (e) {
      print('Error saving news data: $e');
    }
  }
  
  List<Map<String, dynamic>> getNewsData() {
    try {
      final news = getData<List>('news_data', defaultValue: []);
      return news?.cast<Map<String, dynamic>>() ?? [];
    } catch (e) {
      print('Error getting news data: $e');
      return [];
    }
  }
  
  DateTime? getNewsLastUpdated() {
    try {
      final dateString = getData<String>('news_last_updated');
      return dateString != null ? DateTime.parse(dateString) : null;
    } catch (e) {
      print('Error getting news last updated: $e');
      return null;
    }
  }
  
  // Settings methods
  Future<void> saveSetting(String key, dynamic value) async {
    try {
      final settings = getSettings();
      settings[key] = value;
      await saveData('app_settings', settings);
    } catch (e) {
      print('Error saving setting: $e');
    }
  }
  
  T? getSetting<T>(String key, {T? defaultValue}) {
    try {
      final settings = getSettings();
      return settings[key] as T? ?? defaultValue;
    } catch (e) {
      print('Error getting setting: $e');
      return defaultValue;
    }
  }
  
  Map<String, dynamic> getSettings() {
    try {
      final settings = getData<Map>('app_settings', defaultValue: {});
      return settings?.cast<String, dynamic>() ?? {};
    } catch (e) {
      print('Error getting settings: $e');
      return {};
    }
  }
  
  // Backup and restore methods
  Future<Map<String, dynamic>> createBackup() async {
    try {
      final backup = {
        'timestamp': DateTime.now().toIso8601String(),
        'version': '1.0.0',
        'data': {
          'settings': getSettings(),
          'scan_history': getScanHistory(),
          'news_data': getNewsData(),
        }
      };
      
      return backup;
    } catch (e) {
      print('Error creating backup: $e');
      return {};
    }
  }
  
  Future<bool> restoreFromBackup(Map<String, dynamic> backup) async {
    try {
      final data = backup['data'] as Map<String, dynamic>;
      
      if (data['settings'] != null) {
        await saveData('app_settings', data['settings']);
      }
      
      if (data['scan_history'] != null) {
        await saveSecureData('scan_history', data['scan_history']);
      }
      
      if (data['news_data'] != null) {
        await saveNewsData(data['news_data'].cast<Map<String, dynamic>>());
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      print('Error restoring from backup: $e');
      return false;
    }
  }
  
  // Clear all data
  Future<void> clearAllData() async {
    try {
      await _box.clear();
      await _secureBox.clear();
      notifyListeners();
    } catch (e) {
      print('Error clearing all data: $e');
    }
  }
}
/**
 * ViSecure Cross-Platform Storage Manager
 * Hỗ trợ đồng bộ dữ liệu giữa các thiết bị iOS, macOS, Android, Windows
 */

export interface SyncConfig {
  enabled: boolean
  method: 'webrtc' | 'qr' | 'file' | 'manual'
  encryptionEnabled: boolean
  autoSync: boolean
  syncInterval: number // in minutes
}

export interface DeviceInfo {
  id: string
  name: string
  type: 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'web'
  lastSync: Date
  isOnline: boolean
}

export interface SyncData {
  deviceId: string
  timestamp: Date
  version: string
  vault: any[]
  settings: Record<string, any>
  checksum: string
}

class CrossPlatformStorageManager {
  private deviceId: string
  private syncConfig: SyncConfig
  private connectedDevices: Map<string, DeviceInfo> = new Map()

  constructor() {
    this.deviceId = this.generateDeviceId()
    this.syncConfig = {
      enabled: false,
      method: 'qr',
      encryptionEnabled: true,
      autoSync: false,
      syncInterval: 30, // 30 minutes
    }
  }

  // Device Management
  private generateDeviceId(): string {
    const stored = localStorage.getItem('visecure_device_id')
    if (stored) return stored

    const deviceId = crypto.randomUUID()
    localStorage.setItem('visecure_device_id', deviceId)
    return deviceId
  }

  private detectDeviceType(): DeviceInfo['type'] {
    const userAgent = navigator.userAgent.toLowerCase()
    const platform = navigator.platform.toLowerCase()

    // iOS Detection
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
    if (platform.includes('mac') && 'ontouchend' in document) return 'ios'
    
    // macOS Detection
    if (platform.includes('mac')) return 'macos'
    
    // Android Detection
    if (/android/.test(userAgent)) return 'android'
    
    // Windows Detection
    if (platform.includes('win')) return 'windows'
    
    // Linux Detection
    if (platform.includes('linux')) return 'linux'
    
    return 'web'
  }

  getCurrentDevice(): DeviceInfo {
    return {
      id: this.deviceId,
      name: this.getDeviceName(),
      type: this.detectDeviceType(),
      lastSync: new Date(),
      isOnline: true,
    }
  }

  private getDeviceName(): string {
    const stored = localStorage.getItem('visecure_device_name')
    if (stored) return stored

    const deviceType = this.detectDeviceType()
    const defaultNames = {
      ios: 'iPhone của tôi',
      android: 'Android của tôi',
      macos: 'Mac của tôi',
      windows: 'PC của tôi',
      linux: 'Linux của tôi',
      web: 'Trình duyệt của tôi',
    }

    const deviceName = defaultNames[deviceType] || 'Thiết bị của tôi'
    localStorage.setItem('visecure_device_name', deviceName)
    return deviceName
  }

  // QR Code Sync
  async generateSyncQR(masterPassword: string): Promise<string> {
    try {
      const { storageManager } = await import('../utils/storage')
      const { encryptionManager } = await import('../utils/encryption')
      
      // Get all data
      const vault = await storageManager.getVaultItems()
      const settings = await storageManager.getAllSettings()
      
      const syncData: SyncData = {
        deviceId: this.deviceId,
        timestamp: new Date(),
        version: '1.0.0',
        vault,
        settings,
        checksum: ''
      }

      // Create checksum
      const dataString = JSON.stringify({ vault, settings })
      syncData.checksum = await this.createChecksum(dataString)

      // Encrypt the sync data
      const encryptedData = await encryptionManager.encrypt(
        JSON.stringify(syncData),
        masterPassword
      )

      // Return base64 encoded data (for QR code)
      return btoa(encryptedData)
    } catch (error) {
      console.error('Failed to generate sync QR:', error)
      throw new Error('Không thể tạo mã QR đồng bộ')
    }
  }

  async importFromQR(qrData: string, masterPassword: string): Promise<void> {
    try {
      const { storageManager } = await import('../utils/storage')
      const { encryptionManager } = await import('../utils/encryption')

      // Decode and decrypt
      const encryptedData = atob(qrData)
      const decryptedData = await encryptionManager.decrypt(encryptedData, masterPassword)
      const syncData: SyncData = JSON.parse(decryptedData)

      // Verify checksum
      const dataString = JSON.stringify({ 
        vault: syncData.vault, 
        settings: syncData.settings 
      })
      const expectedChecksum = await this.createChecksum(dataString)
      
      if (syncData.checksum !== expectedChecksum) {
        throw new Error('Dữ liệu bị hỏng hoặc không hợp lệ')
      }

      // Import vault items
      for (const item of syncData.vault) {
        await storageManager.saveVaultItem(item)
      }

      // Import settings
      for (const [key, value] of Object.entries(syncData.settings)) {
        await storageManager.saveSetting(key, value)
      }

      // Update device info
      const deviceInfo: DeviceInfo = {
        id: syncData.deviceId,
        name: `Thiết bị nhập từ QR`,
        type: 'web',
        lastSync: syncData.timestamp,
        isOnline: false,
      }
      this.connectedDevices.set(syncData.deviceId, deviceInfo)

    } catch (error) {
      console.error('Failed to import from QR:', error)
      throw new Error('Không thể nhập dữ liệu từ mã QR')
    }
  }

  // File-based Sync
  async exportToFile(masterPassword: string): Promise<Blob> {
    try {
      const qrData = await this.generateSyncQR(masterPassword)
      const exportData = {
        type: 'visecure_backup',
        version: '1.0.0',
        device: this.getCurrentDevice(),
        data: qrData,
        exported: new Date(),
      }

      return new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
    } catch (error) {
      console.error('Failed to export to file:', error)
      throw new Error('Không thể xuất file backup')
    }
  }

  async importFromFile(file: File, masterPassword: string): Promise<void> {
    try {
      const text = await file.text()
      const importData = JSON.parse(text)

      if (importData.type !== 'visecure_backup') {
        throw new Error('File không phải là backup ViSecure hợp lệ')
      }

      await this.importFromQR(importData.data, masterPassword)
    } catch (error) {
      console.error('Failed to import from file:', error)
      throw new Error('Không thể nhập dữ liệu từ file')
    }
  }

  // WebRTC P2P Sync (for future implementation)
  async startP2PSync(): Promise<void> {
    // Implementation for WebRTC-based sync between devices
    // This would allow real-time sync between devices on same network
    console.log('P2P sync will be implemented in future version')
  }

  // Utility Methods
  private async createChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Configuration
  getSyncConfig(): SyncConfig {
    return { ...this.syncConfig }
  }

  updateSyncConfig(config: Partial<SyncConfig>): void {
    this.syncConfig = { ...this.syncConfig, ...config }
    localStorage.setItem('visecure_sync_config', JSON.stringify(this.syncConfig))
  }

  getConnectedDevices(): DeviceInfo[] {
    return Array.from(this.connectedDevices.values())
  }

  // Platform-specific optimizations
  getStorageCapabilities() {
    const deviceType = this.detectDeviceType()
    
    return {
      hasFileSystem: deviceType !== 'web',
      hasQRCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      hasWebRTC: 'RTCPeerConnection' in window,
      hasNotifications: 'Notification' in window,
      hasClipboard: 'clipboard' in navigator,
      maxStorageSize: this.getMaxStorageSize(deviceType),
      recommendedSyncMethod: this.getRecommendedSyncMethod(deviceType),
    }
  }

  private getMaxStorageSize(deviceType: DeviceInfo['type']): number {
    // Estimated storage limits in MB
    const limits = {
      ios: 50,      // Safari iOS has strict limits
      android: 100, // Chrome Android more generous
      macos: 200,   // Desktop browsers more space
      windows: 200,
      linux: 200,
      web: 50,      // Conservative estimate for web
    }
    
    return limits[deviceType] || 50
  }

  private getRecommendedSyncMethod(deviceType: DeviceInfo['type']): SyncConfig['method'] {
    // Recommend best sync method based on device type
    if (deviceType === 'ios' || deviceType === 'android') {
      return 'qr' // Mobile devices prefer QR codes
    }
    
    if (deviceType === 'macos' || deviceType === 'windows' || deviceType === 'linux') {
      return 'file' // Desktop prefers file import/export
    }
    
    return 'qr' // Default to QR for web
  }
}

export const crossPlatformStorage = new CrossPlatformStorageManager()

/**
 * ViSecure Backup Manager
 * Quản lý backup và transfer dữ liệu giữa thiết bị
 */

import { storageManager, VaultItem, ScanResult, BackupMetadata } from './storage'
import { encryptionManager } from './encryption'

export interface BackupData {
  version: string
  timestamp: Date
  vault: VaultItem[]
  scanHistory: ScanResult[]
  settings: Record<string, any>
  checksum: string
}

export interface TransferSession {
  id: string
  status: 'pending' | 'active' | 'completed' | 'failed'
  type: 'export' | 'import'
  progress: number
  message?: string
}

class BackupManager {
  // Tạo backup hoàn chỉnh
  async createFullBackup(masterPassword: string): Promise<string> {
    try {
      // Lấy tất cả dữ liệu
      const vault = await storageManager.getVaultItems()
      const scanHistory = await storageManager.getScanHistory()
      const settings = await storageManager.getAllSettings()

      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date(),
        vault,
        scanHistory,
        settings,
        checksum: ''
      }

      // Tạo checksum cho integrity verification
      const dataString = JSON.stringify({
        vault: backupData.vault,
        scanHistory: backupData.scanHistory,
        settings: backupData.settings
      })
      
      backupData.checksum = await encryptionManager.createChecksum(dataString)

      // Mã hóa toàn bộ backup
      const encryptedBackup = await encryptionManager.encrypt(
        JSON.stringify(backupData), 
        masterPassword
      )
      
      // Lưu metadata
      const metadata: BackupMetadata = {
        id: Date.now().toString(),
        timestamp: backupData.timestamp,
        size: encryptedBackup.length,
        itemCount: vault.length,
        encrypted: true
      }
      
      await storageManager.saveBackupMetadata(metadata)
      
      return encryptedBackup
    } catch (error) {
      throw new Error(`Backup failed: ${error}`)
    }
  }

  // Khôi phục từ backup
  async restoreFromBackup(encryptedBackup: string, masterPassword: string): Promise<void> {
    try {
      // Giải mã backup
      const decryptedData = await encryptionManager.decrypt(encryptedBackup, masterPassword)
      const backupData: BackupData = JSON.parse(decryptedData)
      
      // Xác minh checksum
      const dataString = JSON.stringify({
        vault: backupData.vault,
        scanHistory: backupData.scanHistory,
        settings: backupData.settings
      })
      
      const currentChecksum = await encryptionManager.createChecksum(dataString)
      
      if (currentChecksum !== backupData.checksum) {
        throw new Error('Backup integrity check failed')
      }

      // Xác nhận với người dùng
      const confirmReplace = confirm(
        `This will replace all current data with backup from ${new Date(backupData.timestamp).toLocaleDateString()}. Continue?`
      )
      
      if (!confirmReplace) {
        throw new Error('Backup restoration cancelled')
      }

      // Xóa dữ liệu hiện tại
      await storageManager.clearAllData()
      
      // Khôi phục dữ liệu
      for (const item of backupData.vault) {
        await storageManager.saveVaultItem(item)
      }
      
      for (const scan of backupData.scanHistory) {
        await storageManager.saveScanResult(scan)
      }
      
      for (const [key, value] of Object.entries(backupData.settings)) {
        await storageManager.saveSetting(key, value)
      }

      console.log('✅ Backup restored successfully')
    } catch (error) {
      throw new Error(`Restore failed: ${error}`)
    }
  }

  // Export ra file
  async exportToFile(masterPassword: string, selectedItemIds?: string[]): Promise<Blob> {
    try {
      let backupData: string
      
      if (selectedItemIds && selectedItemIds.length > 0) {
        // Backup chỉ các items được chọn
        const selectedItems: VaultItem[] = []
        for (const id of selectedItemIds) {
          const item = await storageManager.getVaultItem(id)
          if (item) selectedItems.push(item)
        }
        
        const partialBackup = {
          version: '1.0.0',
          timestamp: new Date(),
          vault: selectedItems,
          scanHistory: [],
          settings: {},
          checksum: await encryptionManager.createChecksum(JSON.stringify(selectedItems))
        }
        
        backupData = await encryptionManager.encrypt(
          JSON.stringify(partialBackup), 
          masterPassword
        )
      } else {
        // Backup toàn bộ
        backupData = await this.createFullBackup(masterPassword)
      }
      
      return new Blob([backupData], { type: 'application/octet-stream' })
    } catch (error) {
      throw new Error(`Export failed: ${error}`)
    }
  }

  // Import từ file
  async importFromFile(file: File, masterPassword: string): Promise<void> {
    try {
      const content = await file.text()
      await this.restoreFromBackup(content, masterPassword)
    } catch (error) {
      throw new Error(`Import failed: ${error}`)
    }
  }

  // Generate QR code cho việc chia sẻ nhỏ
  async generateQRData(itemIds: string[], masterPassword: string): Promise<string> {
    try {
      const items: VaultItem[] = []
      for (const id of itemIds) {
        const item = await storageManager.getVaultItem(id)
        if (item) items.push(item)
      }
      
      if (items.length === 0) {
        throw new Error('No items selected')
      }
      
      // Giới hạn data cho QR (tối đa ~2KB)
      const limitedData = {
        v: '1.0',
        t: Date.now(),
        d: items.slice(0, 5) // Tối đa 5 items
      }
      
      const encrypted = await encryptionManager.encrypt(
        JSON.stringify(limitedData),
        masterPassword
      )
      
      // Compress data nếu cần
      return encrypted.slice(0, 2000) // Giới hạn cho QR code
    } catch (error) {
      throw new Error(`QR generation failed: ${error}`)
    }
  }

  // Import từ QR data
  async importFromQR(qrData: string, masterPassword: string): Promise<void> {
    try {
      const decrypted = await encryptionManager.decrypt(qrData, masterPassword)
      const data = JSON.parse(decrypted)
      
      if (data.d && Array.isArray(data.d)) {
        for (const item of data.d) {
          // Generate new ID to avoid conflicts
          item.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          item.title = `${item.title} (Imported)`
          item.updatedAt = new Date()
          
          await storageManager.saveVaultItem(item)
        }
        console.log(`✅ Imported ${data.d.length} items from QR`)
      }
    } catch (error) {
      throw new Error(`QR import failed: ${error}`)
    }
  }

  // Lấy thống kê backup
  async getBackupStats(): Promise<{
    lastBackup?: Date
    totalBackups: number
    databaseSize: number
    itemCount: number
  }> {
    const backupHistory = await storageManager.getBackupHistory()
    const vaultItems = await storageManager.getVaultItems()
    const databaseSize = await storageManager.getDatabaseSize()
    
    return {
      lastBackup: backupHistory[0]?.timestamp,
      totalBackups: backupHistory.length,
      databaseSize,
      itemCount: vaultItems.length
    }
  }

  // Cleanup old backups
  async cleanupOldBackups(keepCount = 10): Promise<void> {
    const backupHistory = await storageManager.getBackupHistory()
    
    if (backupHistory.length > keepCount) {
      const toDelete = backupHistory.slice(keepCount)
      // Implementation for cleanup would go here
      console.log(`Would cleanup ${toDelete.length} old backups`)
    }
  }
}

export const backupManager = new BackupManager()

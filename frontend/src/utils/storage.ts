/**
 * ViSecure Local Storage Manager
 * Quản lý IndexedDB cho storage local hoàn toàn offline
 */

export interface VaultItem {
  id: string
  type: 'password' | 'note' | 'file'
  title: string
  data: string // Encrypted JSON string
  folder?: string
  createdAt: Date
  updatedAt: Date
  encrypted: boolean
}

export interface ScanResult {
  id: string
  type: 'url' | 'image'
  target: string
  status: 'safe' | 'warning' | 'danger'
  result?: any
  timestamp: Date
}

export interface AppSettings {
  key: string
  value: any
}

export interface BackupMetadata {
  id: string
  timestamp: Date
  size: number
  itemCount: number
  encrypted: boolean
}

class LocalStorageManager {
  private dbName = 'ViSecureDB'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Vault storage
        if (!db.objectStoreNames.contains('vault')) {
          const vaultStore = db.createObjectStore('vault', { keyPath: 'id' })
          vaultStore.createIndex('type', 'type', { unique: false })
          vaultStore.createIndex('folder', 'folder', { unique: false })
          vaultStore.createIndex('createdAt', 'createdAt', { unique: false })
        }
        
        // Scan history
        if (!db.objectStoreNames.contains('scanHistory')) {
          const scanStore = db.createObjectStore('scanHistory', { keyPath: 'id' })
          scanStore.createIndex('type', 'type', { unique: false })
          scanStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
        
        // App settings
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
        
        // Backup metadata
        if (!db.objectStoreNames.contains('backups')) {
          const backupStore = db.createObjectStore('backups', { keyPath: 'id' })
          backupStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  // Vault operations
  async saveVaultItem(item: VaultItem): Promise<void> {
    const transaction = this.db!.transaction(['vault'], 'readwrite')
    const store = transaction.objectStore('vault')
    await store.put(item)
  }

  async getVaultItems(): Promise<VaultItem[]> {
    const transaction = this.db!.transaction(['vault'], 'readonly')
    const store = transaction.objectStore('vault')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getVaultItem(id: string): Promise<VaultItem | undefined> {
    const transaction = this.db!.transaction(['vault'], 'readonly')
    const store = transaction.objectStore('vault')
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteVaultItem(id: string): Promise<void> {
    const transaction = this.db!.transaction(['vault'], 'readwrite')
    const store = transaction.objectStore('vault')
    await store.delete(id)
  }

  // Scan history operations
  async saveScanResult(result: ScanResult): Promise<void> {
    const transaction = this.db!.transaction(['scanHistory'], 'readwrite')
    const store = transaction.objectStore('scanHistory')
    await store.put(result)
  }

  async getScanHistory(limit = 100): Promise<ScanResult[]> {
    const transaction = this.db!.transaction(['scanHistory'], 'readonly')
    const store = transaction.objectStore('scanHistory')
    const index = store.index('timestamp')
    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev')
      const results: ScanResult[] = []
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor && results.length < limit) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clearScanHistory(): Promise<void> {
    const transaction = this.db!.transaction(['scanHistory'], 'readwrite')
    const store = transaction.objectStore('scanHistory')
    await store.clear()
  }

  // Settings operations
  async saveSetting(key: string, value: any): Promise<void> {
    const transaction = this.db!.transaction(['settings'], 'readwrite')
    const store = transaction.objectStore('settings')
    await store.put({ key, value })
  }

  async getSetting(key: string): Promise<any> {
    const transaction = this.db!.transaction(['settings'], 'readonly')
    const store = transaction.objectStore('settings')
    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result?.value)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllSettings(): Promise<Record<string, any>> {
    const transaction = this.db!.transaction(['settings'], 'readonly')
    const store = transaction.objectStore('settings')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const settings: Record<string, any> = {}
        request.result.forEach((item: AppSettings) => {
          settings[item.key] = item.value
        })
        resolve(settings)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Backup metadata operations
  async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const transaction = this.db!.transaction(['backups'], 'readwrite')
    const store = transaction.objectStore('backups')
    await store.put(metadata)
  }

  async getBackupHistory(): Promise<BackupMetadata[]> {
    const transaction = this.db!.transaction(['backups'], 'readonly')
    const store = transaction.objectStore('backups')
    const index = store.index('timestamp')
    return new Promise((resolve, reject) => {
      const request = index.getAll()
      request.onsuccess = () => resolve(request.result.reverse())
      request.onerror = () => reject(request.error)
    })
  }

  // Database maintenance
  async clearAllData(): Promise<void> {
    const transaction = this.db!.transaction(['vault', 'scanHistory', 'settings'], 'readwrite')
    await Promise.all([
      transaction.objectStore('vault').clear(),
      transaction.objectStore('scanHistory').clear(),
      transaction.objectStore('settings').clear()
    ])
  }

  async getDatabaseSize(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return estimate.usage || 0
    }
    return 0
  }
}

export const storageManager = new LocalStorageManager()

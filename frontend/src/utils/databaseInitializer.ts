/**
 * ViSecure Database Initialization
 * Đảm bảo IndexedDB được khởi tạo đúng cách trên mọi platform
 */

export interface DatabaseConfig {
  name: string
  version: number
  stores: {
    name: string
    keyPath?: string
    autoIncrement?: boolean
    indexes?: Array<{
      name: string
      keyPath: string
      unique?: boolean
    }>
  }[]
}

class DatabaseInitializer {
  private static instance: DatabaseInitializer
  private databases: Map<string, IDBDatabase> = new Map()
  private closedDatabases: Set<string> = new Set()

  static getInstance(): DatabaseInitializer {
    if (!DatabaseInitializer.instance) {
      DatabaseInitializer.instance = new DatabaseInitializer()
    }
    return DatabaseInitializer.instance
  }

  private isDatabaseClosed(name: string): boolean {
    return this.closedDatabases.has(name)
  }

  private markDatabaseClosed(name: string): void {
    this.closedDatabases.add(name)
  }

  private markDatabaseOpen(name: string): void {
    this.closedDatabases.delete(name)
  }

  async initializeDatabase(config: DatabaseConfig): Promise<IDBDatabase> {
    const existingDb = this.databases.get(config.name)
    if (existingDb && !this.isDatabaseClosed(config.name)) {
      // Verify all required stores exist
      const allStoresExist = config.stores.every(store => 
        existingDb.objectStoreNames.contains(store.name)
      )
      if (allStoresExist) {
        return existingDb
      } else {
        // Database structure doesn't match, need to recreate
        console.log('Database structure mismatch, deleting and recreating...')
        existingDb.close()
        await this.deleteDatabase(config.name)
      }
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(config.name, config.version)
      let upgradeCompleted = false

      request.onerror = () => {
        console.error(`Failed to open database ${config.name}:`, request.error)
        reject(request.error)
      }

      request.onblocked = () => {
        console.warn(`Database ${config.name} is blocked. Please close other tabs.`)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = (event.target as IDBOpenDBRequest).transaction!
        
        console.log(`Upgrading database ${config.name} to version ${config.version}`)

        // Delete all existing stores first (in case of structure change)
        const existingStoreNames = Array.from(db.objectStoreNames)
        for (const storeName of existingStoreNames) {
          console.log(`Deleting old store: ${storeName}`)
          db.deleteObjectStore(storeName)
        }

        // Create object stores
        for (const storeConfig of config.stores) {
          console.log(`Creating object store: ${storeConfig.name}`)
          const store = db.createObjectStore(storeConfig.name, {
            keyPath: storeConfig.keyPath,
            autoIncrement: storeConfig.autoIncrement
          })

          // Create indexes
          if (storeConfig.indexes) {
            for (const indexConfig of storeConfig.indexes) {
              if (!store.indexNames.contains(indexConfig.name)) {
                store.createIndex(
                  indexConfig.name,
                  indexConfig.keyPath,
                  { unique: indexConfig.unique }
                )
              }
            }
          }
        }

        // Wait for upgrade transaction to complete
        transaction.oncomplete = () => {
          upgradeCompleted = true
          console.log(`Database ${config.name} upgrade completed`)
        }

        transaction.onerror = () => {
          console.error(`Database ${config.name} upgrade failed:`, transaction.error)
          reject(transaction.error)
        }
      }

      request.onsuccess = () => {
        const db = request.result
        
        // If we had an upgrade, wait for it to complete
        if (request.transaction && !upgradeCompleted) {
          request.transaction.oncomplete = () => {
            this.finalizeDatabase(db, config.name)
            resolve(db)
          }
        } else {
          this.finalizeDatabase(db, config.name)
          resolve(db)
        }
      }
    })
  }

  private finalizeDatabase(db: IDBDatabase, name: string): void {
    this.databases.set(name, db)
    this.markDatabaseOpen(name)

    // Handle version change
    db.onversionchange = () => {
      console.log(`Database ${name} version changed, closing connection`)
      db.close()
      this.markDatabaseClosed(name)
      this.databases.delete(name)
    }

    db.onerror = (event) => {
      console.error(`Database ${name} error:`, event)
    }
    
    console.log(`Database ${name} ready with stores:`, Array.from(db.objectStoreNames))
  }

  async getDatabase(name: string): Promise<IDBDatabase | null> {
    const db = this.databases.get(name)
    if (db && !this.isDatabaseClosed(name)) {
      return db
    }
    return null
  }

  closeDatabase(name: string): void {
    const db = this.databases.get(name)
    if (db && !this.isDatabaseClosed(name)) {
      db.close()
      this.markDatabaseClosed(name)
    }
  }

  closeAllDatabases(): void {
    for (const [dbName, db] of this.databases) {
      if (!this.isDatabaseClosed(dbName)) {
        db.close()
        this.markDatabaseClosed(dbName)
      }
    }
    this.databases.clear()
  }

  async deleteDatabase(name: string): Promise<void> {
    this.closeDatabase(name)
    
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(name)
      
      deleteRequest.onerror = () => reject(deleteRequest.error)
      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onblocked = () => {
        console.warn(`Delete database ${name} is blocked`)
        // Force close all connections and retry
        setTimeout(() => {
          const retryRequest = indexedDB.deleteDatabase(name)
          retryRequest.onsuccess = () => resolve()
          retryRequest.onerror = () => reject(retryRequest.error)
        }, 1000)
      }
    })
  }

  // Platform-specific optimizations
  getPlatformOptimizations() {
    const userAgent = navigator.userAgent.toLowerCase()
    const platform = navigator.platform.toLowerCase()

    return {
      useWebSQL: false, // Deprecated, always false
      maxTransactionSize: this.getMaxTransactionSize(userAgent),
      preferBatchOperations: /safari|webkit/.test(userAgent), // Safari benefits from batching
      useAutoCommit: /chrome|firefox/.test(userAgent), // Modern browsers handle auto-commit well
      recommendedChunkSize: this.getRecommendedChunkSize(platform),
    }
  }

  private getMaxTransactionSize(userAgent: string): number {
    // Conservative limits based on browser
    if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
      return 50 // Safari iOS has strict limits
    }
    if (/firefox/.test(userAgent)) {
      return 100
    }
    return 200 // Chrome and others
  }

  private getRecommendedChunkSize(platform: string): number {
    // Optimal chunk sizes for different platforms
    if (platform.includes('iphone') || platform.includes('ipad')) {
      return 10 // iOS devices
    }
    if (platform.includes('android')) {
      return 20 // Android devices
    }
    return 50 // Desktop platforms
  }
}

// Database configurations
export const AUTH_DB_CONFIG: DatabaseConfig = {
  name: 'ViSecureDB',
  version: 2, // Increment version to force upgrade
  stores: [
    {
      name: 'auth',
      autoIncrement: false
    },
    {
      name: 'vault',
      keyPath: 'id',
      indexes: [
        { name: 'type', keyPath: 'type' },
        { name: 'title', keyPath: 'title' },
        { name: 'createdAt', keyPath: 'createdAt' },
        { name: 'updatedAt', keyPath: 'updatedAt' }
      ]
    },
    {
      name: 'scanHistory',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'type', keyPath: 'type' },
        { name: 'status', keyPath: 'status' }
      ]
    },
    {
      name: 'settings',
      autoIncrement: false
    },
    {
      name: 'backupMetadata',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' }
      ]
    }
  ]
}

export const dbInitializer = DatabaseInitializer.getInstance()

// Utility functions for safe database operations
export const withDatabase = async <T>(
  operation: (db: IDBDatabase) => Promise<T>
): Promise<T> => {
  const db = await dbInitializer.initializeDatabase(AUTH_DB_CONFIG)
  try {
    return await operation(db)
  } catch (error) {
    console.error('Database operation failed:', error)
    throw error
  }
}

export const withTransaction = async <T>(
  storeNames: string | string[],
  mode: IDBTransactionMode,
  operation: (transaction: IDBTransaction, stores: IDBObjectStore | IDBObjectStore[]) => Promise<T>
): Promise<T> => {
  return withDatabase(async (db) => {
    const transaction = db.transaction(storeNames, mode)
    
    return new Promise<T>((resolve, reject) => {
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(new Error('Transaction aborted'))
      
      try {
        const stores = Array.isArray(storeNames)
          ? storeNames.map(name => transaction.objectStore(name))
          : transaction.objectStore(storeNames as string)
          
        operation(transaction, stores).then(resolve).catch(reject)
      } catch (error) {
        reject(error)
      }
    })
  })
}

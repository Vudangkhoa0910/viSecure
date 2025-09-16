/**
 * Local Authentication Manager
 * Handles all authentication locally without server dependencies
 */

interface AuthConfig {
  hash: number[]
  salt: number[]
  setupDate: string
  deviceFingerprint: string
  failedAttempts: number
  lockedUntil?: number
}

interface SessionData {
  id: string
  expiresAt: number
  lastActivity: number
  isAuthenticated: boolean
}

export class LocalAuthManager {
  private static readonly PBKDF2_ITERATIONS = 600000
  private static readonly SALT_LENGTH = 32
  private static readonly SESSION_TIMEOUT = 15 * 60 * 1000 // 15 minutes
  private static readonly MAX_FAILED_ATTEMPTS = 3
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes

  // Master Password Management
  async setupMasterPassword(password: string): Promise<boolean> {
    try {
      if (!this.validatePasswordStrength(password)) {
        throw new Error('Password does not meet strength requirements')
      }

      const salt = crypto.getRandomValues(new Uint8Array(LocalAuthManager.SALT_LENGTH))
      const hash = await this.hashPassword(password, salt)
      const deviceFingerprint = await this.getDeviceFingerprint()

      const authConfig: AuthConfig = {
        hash: Array.from(hash),
        salt: Array.from(salt),
        setupDate: new Date().toISOString(),
        deviceFingerprint,
        failedAttempts: 0
      }

      await this.saveToStorage('visecure_auth', authConfig)
      return true
    } catch (error) {
      console.error('Failed to setup master password:', error)
      return false
    }
  }

  async verifyMasterPassword(password: string): Promise<boolean> {
    try {
      const authConfig = await this.getFromStorage<AuthConfig>('visecure_auth')
      if (!authConfig) {
        throw new Error('No auth configuration found')
      }

      // Check if account is locked
      if (authConfig.lockedUntil && Date.now() < authConfig.lockedUntil) {
        const remainingTime = Math.ceil((authConfig.lockedUntil - Date.now()) / 60000)
        throw new Error(`Account locked. Try again in ${remainingTime} minutes`)
      }

      const hash = await this.hashPassword(password, new Uint8Array(authConfig.salt))
      const isValid = this.constantTimeCompare(hash, new Uint8Array(authConfig.hash))

      if (isValid) {
        // Reset failed attempts on successful login
        authConfig.failedAttempts = 0
        delete authConfig.lockedUntil
        await this.saveToStorage('visecure_auth', authConfig)
        await this.createSession()
        return true
      } else {
        // Increment failed attempts
        authConfig.failedAttempts++
        if (authConfig.failedAttempts >= LocalAuthManager.MAX_FAILED_ATTEMPTS) {
          authConfig.lockedUntil = Date.now() + LocalAuthManager.LOCKOUT_DURATION
        }
        await this.saveToStorage('visecure_auth', authConfig)
        return false
      }
    } catch (error) {
      console.error('Password verification failed:', error)
      return false
    }
  }

  async changeMasterPassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Verify current password
      const isCurrentValid = await this.verifyMasterPassword(currentPassword)
      if (!isCurrentValid) {
        throw new Error('Current password is incorrect')
      }

      // Setup new password
      return await this.setupMasterPassword(newPassword)
    } catch (error) {
      console.error('Failed to change master password:', error)
      return false
    }
  }

  // Session Management
  async createSession(): Promise<string> {
    const sessionId = crypto.randomUUID()
    const now = Date.now()
    
    const sessionData: SessionData = {
      id: sessionId,
      expiresAt: now + LocalAuthManager.SESSION_TIMEOUT,
      lastActivity: now,
      isAuthenticated: true
    }

    await this.saveToStorage('visecure_session', sessionData)
    return sessionId
  }

  async validateSession(): Promise<boolean> {
    try {
      const session = await this.getFromStorage<SessionData>('visecure_session')
      if (!session || !session.isAuthenticated) {
        return false
      }

      const now = Date.now()
      
      // Check if session expired
      if (now > session.expiresAt) {
        await this.clearSession()
        return false
      }

      // Auto-extend session if user is active
      if (now - session.lastActivity < 5 * 60 * 1000) { // 5 minutes
        session.expiresAt = now + LocalAuthManager.SESSION_TIMEOUT
        session.lastActivity = now
        await this.saveToStorage('visecure_session', session)
      }

      return true
    } catch (error) {
      console.error('Session validation failed:', error)
      return false
    }
  }

  async clearSession(): Promise<void> {
    await this.removeFromStorage('visecure_session')
  }

  async extendSession(): Promise<void> {
    const session = await this.getFromStorage<SessionData>('visecure_session')
    if (session) {
      const now = Date.now()
      session.expiresAt = now + LocalAuthManager.SESSION_TIMEOUT
      session.lastActivity = now
      await this.saveToStorage('visecure_session', session)
    }
  }

  // Device Management
  async getDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Device fingerprint', 2, 2)
    }

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      canvas: canvas.toDataURL(),
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      timestamp: Date.now()
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify(fingerprint))
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async verifyDevice(): Promise<boolean> {
    try {
      const authConfig = await this.getFromStorage<AuthConfig>('visecure_auth')
      if (!authConfig) return false

      const currentFingerprint = await this.getDeviceFingerprint()
      return authConfig.deviceFingerprint === currentFingerprint
    } catch (error) {
      console.error('Device verification failed:', error)
      return false
    }
  }

  // Utility Methods
  private async hashPassword(password: string, salt: Uint8Array): Promise<Uint8Array> {
    const encoder = new TextEncoder()
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )

    // Convert to ArrayBuffer for crypto API compatibility
    const saltBuffer = new Uint8Array(salt).buffer

    const hash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: LocalAuthManager.PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      passwordKey,
      256
    )

    return new Uint8Array(hash)
  }

  private constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false
    
    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i]
    }
    
    return result === 0
  }

  private validatePasswordStrength(password: string): boolean {
    if (password.length < 12) return false
    if (!/[a-z]/.test(password)) return false
    if (!/[A-Z]/.test(password)) return false
    if (!/[0-9]/.test(password)) return false
    if (!/[^a-zA-Z0-9]/.test(password)) return false
    return true
  }

  // Storage Helpers
  private async saveToStorage<T>(key: string, data: T): Promise<void> {
    try {
      // Use IndexedDB for secure storage
      const request = indexedDB.open('ViSecureDB', 1)
      
      return new Promise((resolve, reject) => {
        request.onerror = () => reject(request.error)
        
        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains('auth')) {
            db.createObjectStore('auth')
          }
        }
        
        request.onsuccess = () => {
          const db = request.result
          const transaction = db.transaction(['auth'], 'readwrite')
          const store = transaction.objectStore('auth')
          
          store.put(data, key)
          
          transaction.oncomplete = () => {
            db.close()
            resolve()
          }
          
          transaction.onerror = () => reject(transaction.error)
        }
      })
    } catch (error) {
      console.error('Failed to save to storage:', error)
      throw error
    }
  }

  private async getFromStorage<T>(key: string): Promise<T | null> {
    try {
      const request = indexedDB.open('ViSecureDB', 1)
      
      return new Promise((resolve, reject) => {
        request.onerror = () => reject(request.error)
        
        request.onsuccess = () => {
          const db = request.result
          
          if (!db.objectStoreNames.contains('auth')) {
            db.close()
            resolve(null)
            return
          }
          
          const transaction = db.transaction(['auth'], 'readonly')
          const store = transaction.objectStore('auth')
          const getRequest = store.get(key)
          
          getRequest.onsuccess = () => {
            db.close()
            resolve(getRequest.result || null)
          }
          
          getRequest.onerror = () => {
            db.close()
            reject(getRequest.error)
          }
        }
      })
    } catch (error) {
      console.error('Failed to get from storage:', error)
      return null
    }
  }

  private async removeFromStorage(key: string): Promise<void> {
    try {
      const request = indexedDB.open('ViSecureDB', 1)
      
      return new Promise((resolve, reject) => {
        request.onerror = () => reject(request.error)
        
        request.onsuccess = () => {
          const db = request.result
          
          if (!db.objectStoreNames.contains('auth')) {
            db.close()
            resolve()
            return
          }
          
          const transaction = db.transaction(['auth'], 'readwrite')
          const store = transaction.objectStore('auth')
          
          store.delete(key)
          
          transaction.oncomplete = () => {
            db.close()
            resolve()
          }
          
          transaction.onerror = () => reject(transaction.error)
        }
      })
    } catch (error) {
      console.error('Failed to remove from storage:', error)
      throw error
    }
  }

  // Check if auth is set up
  async isSetup(): Promise<boolean> {
    const authConfig = await this.getFromStorage<AuthConfig>('visecure_auth')
    return authConfig !== null
  }

  // Get auth status
  async getAuthStatus(): Promise<{
    isSetup: boolean
    isAuthenticated: boolean
    deviceTrusted: boolean
    failedAttempts: number
    lockedUntil?: number
  }> {
    const authConfig = await this.getFromStorage<AuthConfig>('visecure_auth')
    const isAuthenticated = await this.validateSession()
    const deviceTrusted = await this.verifyDevice()

    return {
      isSetup: authConfig !== null,
      isAuthenticated,
      deviceTrusted,
      failedAttempts: authConfig?.failedAttempts || 0,
      lockedUntil: authConfig?.lockedUntil
    }
  }
}

// Export singleton instance
export const localAuth = new LocalAuthManager()

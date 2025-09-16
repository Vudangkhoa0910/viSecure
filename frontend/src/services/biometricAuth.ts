/**
 * Biometric Authentication Manager
 * Handles WebAuthn biometric authentication
 */

interface BiometricCredential {
  credentialId: number[]
  enabled: boolean
  setupDate: string
  lastUsed?: string
}

export class BiometricAuthManager {
  private static readonly RP_NAME = 'ViSecure'
  private static readonly RP_ID = window.location.hostname

  // Check if biometric authentication is available
  async isAvailable(): Promise<boolean> {
    try {
      if (!('credentials' in navigator) || !('create' in navigator.credentials)) {
        return false
      }

      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      return available
    } catch (error) {
      console.error('Error checking biometric availability:', error)
      return false
    }
  }

  // Setup biometric authentication
  async setupBiometric(): Promise<boolean> {
    try {
      if (!await this.isAvailable()) {
        throw new Error('Biometric authentication not available')
      }

      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const userId = crypto.getRandomValues(new Uint8Array(64))

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: BiometricAuthManager.RP_NAME,
            id: BiometricAuthManager.RP_ID
          },
          user: {
            id: userId,
            name: 'ViSecure User',
            displayName: 'ViSecure User'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred'
          },
          timeout: 60000,
          attestation: 'none'
        }
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('Failed to create credential')
      }

      // Save credential information
      const biometricConfig: BiometricCredential = {
        credentialId: Array.from(new Uint8Array(credential.rawId)),
        enabled: true,
        setupDate: new Date().toISOString()
      }

      await this.saveToStorage('visecure_biometric', biometricConfig)
      return true
    } catch (error) {
      console.error('Failed to setup biometric authentication:', error)
      return false
    }
  }

  // Authenticate using biometrics
  async authenticate(): Promise<boolean> {
    try {
      const biometricConfig = await this.getFromStorage<BiometricCredential>('visecure_biometric')
      if (!biometricConfig?.enabled) {
        throw new Error('Biometric authentication not configured')
      }

      const challenge = crypto.getRandomValues(new Uint8Array(32))

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{
            id: new Uint8Array(biometricConfig.credentialId),
            type: 'public-key',
            transports: ['internal']
          }],
          userVerification: 'required',
          timeout: 60000
        }
      }) as PublicKeyCredential

      if (!assertion) {
        return false
      }

      // Update last used timestamp
      biometricConfig.lastUsed = new Date().toISOString()
      await this.saveToStorage('visecure_biometric', biometricConfig)

      return true
    } catch (error) {
      console.error('Biometric authentication failed:', error)
      return false
    }
  }

  // Disable biometric authentication
  async disableBiometric(): Promise<boolean> {
    try {
      await this.removeFromStorage('visecure_biometric')
      return true
    } catch (error) {
      console.error('Failed to disable biometric authentication:', error)
      return false
    }
  }

  // Check if biometric is configured
  async isConfigured(): Promise<boolean> {
    const biometricConfig = await this.getFromStorage<BiometricCredential>('visecure_biometric')
    return biometricConfig?.enabled === true
  }

  // Get biometric status
  async getStatus(): Promise<{
    available: boolean
    configured: boolean
    lastUsed?: string
  }> {
    const available = await this.isAvailable()
    const biometricConfig = await this.getFromStorage<BiometricCredential>('visecure_biometric')

    return {
      available,
      configured: biometricConfig?.enabled === true,
      lastUsed: biometricConfig?.lastUsed
    }
  }

  // Storage Helpers (similar to LocalAuthManager)
  private async saveToStorage<T>(key: string, data: T): Promise<void> {
    try {
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
}

// Export singleton instance
export const biometricAuth = new BiometricAuthManager()

/**
 * Biometric Authentication Manager
 * Handles WebAuthn biometric authentication
 */

import { withTransaction } from '../utils/databaseInitializer'

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
      // Check basic WebAuthn support
      if (!('credentials' in navigator) || !('create' in navigator.credentials)) {
        console.log('WebAuthn not supported in this browser')
        return false
      }

      // Check if PublicKeyCredential is available
      if (!window.PublicKeyCredential) {
        console.log('PublicKeyCredential not available')
        return false
      }

      // Check platform authenticator availability
      let platformAvailable = false
      try {
        platformAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      } catch (error) {
        console.log('Platform authenticator check failed:', error)
        platformAvailable = false
      }

      // Additional checks for different platforms
      const userAgent = navigator.userAgent.toLowerCase()
      const isMac = /macintosh|mac os x/.test(userAgent)
      const isWindows = /windows/.test(userAgent)
      const isLinux = /linux/.test(userAgent)

      // On macOS, Touch ID should be available
      if (isMac && !platformAvailable) {
        console.log('macOS detected but Touch ID may not be available')
        // Try a more generous check for macOS
        platformAvailable = true // Allow macOS users to try
      }

      // On Windows, Windows Hello should be available
      if (isWindows && !platformAvailable) {
        console.log('Windows detected, checking for Windows Hello')
        // Windows Hello might be available even if initial check fails
        platformAvailable = true // Allow Windows users to try
      }

      console.log('Biometric availability check:', {
        webAuthnSupported: true,
        platformAvailable,
        userAgent: userAgent.substring(0, 50) + '...',
        platform: isMac ? 'macOS' : isWindows ? 'Windows' : isLinux ? 'Linux' : 'Other'
      })

      return platformAvailable
    } catch (error) {
      console.error('Error checking biometric availability:', error)
      return false
    }
  }

  // Setup biometric authentication
  async setupBiometric(): Promise<boolean> {
    try {
      const available = await this.isAvailable()
      if (!available) {
        console.error('Biometric authentication not available on this device')
        throw new Error('Biometric authentication not available on this device')
      }

      console.log('Starting biometric setup...')
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const userId = crypto.getRandomValues(new Uint8Array(64))

      const createOptions = {
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
            { alg: -7, type: 'public-key' as const }, // ES256
            { alg: -257, type: 'public-key' as const } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform' as const,
            userVerification: 'required' as const,
            residentKey: 'preferred' as const
          },
          timeout: 60000,
          attestation: 'none' as const
        }
      }

      console.log('Creating WebAuthn credential with options:', createOptions)

      const credential = await navigator.credentials.create(createOptions) as PublicKeyCredential

      if (!credential) {
        throw new Error('Failed to create credential - no credential returned')
      }

      console.log('Biometric credential created successfully')

      // Save credential information
      const biometricConfig: BiometricCredential = {
        credentialId: Array.from(new Uint8Array(credential.rawId)),
        enabled: true,
        setupDate: new Date().toISOString()
      }

      await this.saveToStorage('visecure_biometric', biometricConfig)
      console.log('Biometric configuration saved')
      return true
    } catch (error: any) {
      console.error('Failed to setup biometric authentication:', error)
      
      // Provide more specific error messages
      if (error.name === 'NotSupportedError') {
        throw new Error('Biometric authentication is not supported on this device')
      } else if (error.name === 'NotAllowedError') {
        throw new Error('Biometric authentication was cancelled or not allowed')
      } else if (error.name === 'SecurityError') {
        throw new Error('Security error: Please ensure you are using HTTPS')
      } else if (error.name === 'AbortError') {
        throw new Error('Biometric setup was aborted')
      } else {
        throw new Error(`Biometric setup failed: ${error.message}`)
      }
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

  // Storage Helpers
  private async saveToStorage<T>(key: string, data: T): Promise<void> {
    return withTransaction('auth', 'readwrite', async (_, store) => {
      return new Promise<void>((resolve, reject) => {
        const objectStore = store as IDBObjectStore
        const request = objectStore.put(data, key)
        
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    })
  }

  private async getFromStorage<T>(key: string): Promise<T | null> {
    return withTransaction('auth', 'readonly', async (_, store) => {
      return new Promise<T | null>((resolve, reject) => {
        const objectStore = store as IDBObjectStore
        const request = objectStore.get(key)
        
        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
      })
    }).catch((error) => {
      console.error('Failed to get from storage:', error)
      return null
    })
  }

  private async removeFromStorage(key: string): Promise<void> {
    return withTransaction('auth', 'readwrite', async (_, store) => {
      return new Promise<void>((resolve, reject) => {
        const objectStore = store as IDBObjectStore
        const request = objectStore.delete(key)
        
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    })
  }
}

// Export singleton instance
export const biometricAuth = new BiometricAuthManager()

/**
 * ViSecure Encryption Manager
 * Quản lý mã hóa client-side sử dụng WebCrypto API
 */

class EncryptionManager {
  private encoder = new TextEncoder()
  private decoder = new TextDecoder()

  // Generate key từ master password
  async generateKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
  }

  // Mã hóa dữ liệu
  async encrypt(data: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const key = await this.generateKey(password, salt)

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      this.encoder.encode(data)
    )

    // Combine salt + iv + encrypted data
    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
    result.set(salt, 0)
    result.set(iv, salt.length)
    result.set(new Uint8Array(encrypted), salt.length + iv.length)

    return btoa(String.fromCharCode(...result))
  }

  // Giải mã dữ liệu
  async decrypt(encryptedData: string, password: string): Promise<string> {
    const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)))
    
    const salt = data.slice(0, 16)
    const iv = data.slice(16, 28)
    const encrypted = data.slice(28)

    const key = await this.generateKey(password, salt)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    )

    return this.decoder.decode(decrypted)
  }

  // Tạo hash để verify password
  async hashPassword(password: string): Promise<string> {
    const hash = await crypto.subtle.digest('SHA-256', this.encoder.encode(password))
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const currentHash = await this.hashPassword(password)
    return currentHash === hash
  }

  // Generate secure random string
  generateSecureString(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => chars[byte % chars.length]).join('')
  }

  // Create checksum cho integrity check
  async createChecksum(data: string): Promise<string> {
    const hash = await crypto.subtle.digest('SHA-256', this.encoder.encode(data))
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
}

export const encryptionManager = new EncryptionManager()

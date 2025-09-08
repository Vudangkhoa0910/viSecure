/**
 * ViSecure Auth Hook
 * Quản lý authentication state với master password
 */

import { useState, useEffect } from 'react'
import { storageManager } from '../utils/storage'
import { encryptionManager } from '../utils/encryption'

export interface AuthState {
  isUnlocked: boolean
  isLoading: boolean
  isFirstTime: boolean
  error: string | null
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isUnlocked: false,
    isLoading: true,
    isFirstTime: false,
    error: null
  })
  
  const [masterPassword, setMasterPassword] = useState<string>('')

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const storedHash = await storageManager.getSetting('masterPasswordHash')
      const isFirstTime = !storedHash
      
      setState({
        isUnlocked: false,
        isLoading: false,
        isFirstTime,
        error: null
      })
    } catch (error) {
      setState({
        isUnlocked: false,
        isLoading: false,
        isFirstTime: false,
        error: error instanceof Error ? error.message : 'Auth check failed'
      })
    }
  }

  const setupMasterPassword = async (password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const hash = await encryptionManager.hashPassword(password)
      await storageManager.saveSetting('masterPasswordHash', hash)
      
      setMasterPassword(password)
      setState({
        isUnlocked: true,
        isLoading: false,
        isFirstTime: false,
        error: null
      })
      
      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Setup failed'
      }))
      return false
    }
  }

  const unlock = async (password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const storedHash = await storageManager.getSetting('masterPasswordHash')
      
      if (!storedHash) {
        throw new Error('No master password set')
      }
      
      const isValid = await encryptionManager.verifyPassword(password, storedHash)
      
      if (!isValid) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Incorrect master password'
        }))
        return false
      }
      
      setMasterPassword(password)
      setState({
        isUnlocked: true,
        isLoading: false,
        isFirstTime: false,
        error: null
      })
      
      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unlock failed'
      }))
      return false
    }
  }

  const lock = () => {
    setMasterPassword('')
    setState(prev => ({
      ...prev,
      isUnlocked: false,
      error: null
    }))
  }

  const changeMasterPassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Verify old password
      const storedHash = await storageManager.getSetting('masterPasswordHash')
      const isOldValid = await encryptionManager.verifyPassword(oldPassword, storedHash)
      
      if (!isOldValid) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Current password is incorrect'
        }))
        return false
      }
      
      // Re-encrypt all vault items with new password
      const vaultItems = await storageManager.getVaultItems()
      
      for (const item of vaultItems) {
        if (item.encrypted) {
          // Decrypt with old password and re-encrypt with new password
          const decrypted = await encryptionManager.decrypt(item.data, oldPassword)
          const reencrypted = await encryptionManager.encrypt(decrypted, newPassword)
          
          item.data = reencrypted
          item.updatedAt = new Date()
          
          await storageManager.saveVaultItem(item)
        }
      }
      
      // Update master password hash
      const newHash = await encryptionManager.hashPassword(newPassword)
      await storageManager.saveSetting('masterPasswordHash', newHash)
      
      setMasterPassword(newPassword)
      setState(prev => ({ ...prev, isLoading: false }))
      
      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password change failed'
      }))
      return false
    }
  }

  return {
    ...state,
    masterPassword,
    setupMasterPassword,
    unlock,
    lock,
    changeMasterPassword,
    checkAuthStatus
  }
}

import { useState, useEffect, useCallback } from 'react'
import { localAuth } from '../services/localAuth'
import { biometricAuth } from '../services/biometricAuth'

interface AuthState {
  isAuthenticated: boolean
  isSetup: boolean
  isLoading: boolean
  deviceTrusted: boolean
  failedAttempts: number
  lockedUntil?: number
  biometricAvailable: boolean
  biometricConfigured: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isSetup: false,
    isLoading: true,
    deviceTrusted: false,
    failedAttempts: 0,
    biometricAvailable: false,
    biometricConfigured: false,
  })

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const authStatus = await localAuth.getAuthStatus()
      const biometricStatus = await biometricAuth.getStatus()
      
      setAuthState({
        isAuthenticated: authStatus.isAuthenticated,
        isSetup: authStatus.isSetup,
        isLoading: false,
        deviceTrusted: authStatus.deviceTrusted,
        failedAttempts: authStatus.failedAttempts,
        lockedUntil: authStatus.lockedUntil,
        biometricAvailable: biometricStatus.available,
        biometricConfigured: biometricStatus.configured,
      })
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Setup master password
  const setupMasterPassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      const success = await localAuth.setupMasterPassword(password)
      if (success) {
        await initializeAuth()
      }
      return success
    } catch (error) {
      console.error('Failed to setup master password:', error)
      return false
    }
  }, [initializeAuth])

  // Login with master password
  const loginWithPassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      const success = await localAuth.verifyMasterPassword(password)
      if (success) {
        await initializeAuth()
      }
      return success
    } catch (error) {
      console.error('Failed to login with password:', error)
      return false
    }
  }, [initializeAuth])

  // Login with biometric
  const loginWithBiometric = useCallback(async (): Promise<boolean> => {
    try {
      if (!authState.biometricConfigured) {
        throw new Error('Biometric not configured')
      }
      
      const success = await biometricAuth.authenticate()
      if (success) {
        await localAuth.createSession()
        await initializeAuth()
      }
      return success
    } catch (error) {
      console.error('Failed to login with biometric:', error)
      return false
    }
  }, [authState.biometricConfigured, initializeAuth])

  // Setup biometric
  const setupBiometric = useCallback(async (): Promise<boolean> => {
    try {
      const success = await biometricAuth.setupBiometric()
      if (success) {
        await initializeAuth()
      }
      return success
    } catch (error) {
      console.error('Failed to setup biometric:', error)
      return false
    }
  }, [initializeAuth])

  // Disable biometric
  const disableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      const success = await biometricAuth.disableBiometric()
      if (success) {
        await initializeAuth()
      }
      return success
    } catch (error) {
      console.error('Failed to disable biometric:', error)
      return false
    }
  }, [initializeAuth])

  // Change master password
  const changeMasterPassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const success = await localAuth.changeMasterPassword(currentPassword, newPassword)
      if (success) {
        await initializeAuth()
      }
      return success
    } catch (error) {
      console.error('Failed to change master password:', error)
      return false
    }
  }, [initializeAuth])

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      await localAuth.clearSession()
      await initializeAuth()
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }, [initializeAuth])

  // Extend session
  const extendSession = useCallback(async (): Promise<void> => {
    try {
      await localAuth.extendSession()
    } catch (error) {
      console.error('Failed to extend session:', error)
    }
  }, [])

  // Validate session
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const isValid = await localAuth.validateSession()
      if (!isValid && authState.isAuthenticated) {
        await initializeAuth()
      }
      return isValid
    } catch (error) {
      console.error('Failed to validate session:', error)
      return false
    }
  }, [authState.isAuthenticated, initializeAuth])

  // Auto-validate session on mount and periodically
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Auto-validate session every 5 minutes
  useEffect(() => {
    if (!authState.isAuthenticated) return

    const interval = setInterval(async () => {
      await validateSession()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [authState.isAuthenticated, validateSession])

  // Extend session on user activity
  useEffect(() => {
    if (!authState.isAuthenticated) return

    const handleActivity = () => {
      extendSession()
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [authState.isAuthenticated, extendSession])

  return {
    // State
    ...authState,
    
    // Actions
    setupMasterPassword,
    loginWithPassword,
    loginWithBiometric,
    setupBiometric,
    disableBiometric,
    changeMasterPassword,
    logout,
    extendSession,
    validateSession,
    refresh: initializeAuth,
  }
}

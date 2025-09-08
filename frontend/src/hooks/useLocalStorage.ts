/**
 * ViSecure Local Storage Hook
 * React hook để quản lý local storage state
 */

import { useState, useEffect } from 'react'
import { storageManager } from '../utils/storage'

export interface StorageState {
  isInitialized: boolean
  isLoading: boolean
  error: string | null
}

export const useLocalStorage = () => {
  const [state, setState] = useState<StorageState>({
    isInitialized: false,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const initStorage = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))
        await storageManager.init()
        setState({
          isInitialized: true,
          isLoading: false,
          error: null
        })
        console.log('✅ Local storage initialized')
      } catch (error) {
        console.error('❌ Failed to initialize storage:', error)
        setState({
          isInitialized: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Storage initialization failed'
        })
      }
    }

    initStorage()
  }, [])

  const retryInit = async () => {
    const initStorage = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))
        await storageManager.init()
        setState({
          isInitialized: true,
          isLoading: false,
          error: null
        })
      } catch (error) {
        setState({
          isInitialized: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Storage initialization failed'
        })
      }
    }
    await initStorage()
  }

  return {
    ...state,
    storageManager,
    retryInit
  }
}

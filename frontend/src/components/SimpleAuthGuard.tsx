import React, { ReactNode, useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material'
import { Visibility, VisibilityOff, Fingerprint, Security } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

interface SimpleAuthGuardProps {
  children: ReactNode
}

const SimpleAuthGuard: React.FC<SimpleAuthGuardProps> = ({ children }) => {
  const {
    isAuthenticated,
    isSetup,
    isLoading,
    failedAttempts,
    lockedUntil,
    biometricAvailable,
    biometricConfigured,
    setupMasterPassword,
    loginWithPassword,
    loginWithBiometric,
    setupBiometric,
    refresh,
  } = useAuth()

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSetupMode, setIsSetupMode] = useState(false)
  const [enableBiometric, setEnableBiometric] = useState(false)

  // Determine if we should show setup or login
  useEffect(() => {
    setIsSetupMode(!isSetup)
    setEnableBiometric(biometricAvailable)
  }, [isSetup, biometricAvailable])

  // Reset error when password changes
  useEffect(() => {
    setError('')
  }, [password])

  // Loading screen
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Đang khởi tạo ViSecure...
        </Typography>
      </Box>
    )
  }

  // Show authenticated content
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Check if account is locked
  if (lockedUntil && Date.now() < lockedUntil) {
    const remainingTime = Math.ceil((lockedUntil - Date.now()) / 60000)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 2,
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Security sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="error">
              Tài khoản bị khóa
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Quá nhiều lần nhập sai mật khẩu. Vui lòng thử lại sau {remainingTime} phút.
            </Typography>
            <Alert severity="warning">
              Lần thử: {failedAttempts}/3
            </Alert>
          </CardContent>
        </Card>
      </Box>
    )
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      if (isSetupMode) {
        // Setup mode
        const success = await setupMasterPassword(password)
        if (success) {
          // Setup biometric if enabled
          if (enableBiometric && biometricAvailable) {
            await setupBiometric()
          }
          // Login immediately after setup
          await loginWithPassword(password)
          refresh()
        } else {
          setError('Thiết lập mật khẩu thất bại')
        }
      } else {
        // Login mode
        const success = await loginWithPassword(password)
        if (!success) {
          setError('Mật khẩu không đúng')
        }
      }
    } catch (err) {
      setError(isSetupMode ? 'Có lỗi xảy ra khi thiết lập' : 'Có lỗi xảy ra khi đăng nhập')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle biometric login
  const handleBiometricLogin = async () => {
    if (!biometricConfigured) return

    setIsSubmitting(true)
    setError('')

    try {
      const success = await loginWithBiometric()
      if (!success) {
        setError('Xác thực sinh trắc học thất bại')
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi xác thực sinh trắc học')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              ViSecure
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isSetupMode ? 'Thiết lập mật khẩu chính' : 'Đăng nhập vào ứng dụng'}
            </Typography>
          </Box>

          {/* Biometric login option (only in login mode) */}
          {!isSetupMode && biometricConfigured && (
            <>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<Fingerprint />}
                onClick={handleBiometricLogin}
                disabled={isSubmitting}
                sx={{ mb: 2 }}
              >
                Đăng nhập bằng sinh trắc học
              </Button>
              <Divider sx={{ my: 2 }}>hoặc</Divider>
            </>
          )}

          {/* Password input */}
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Mật khẩu chính"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            disabled={isSubmitting}
            helperText={isSetupMode ? 'Mật khẩu này sẽ bảo vệ tất cả dữ liệu của bạn' : ''}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Biometric setup option (only in setup mode) */}
          {isSetupMode && biometricAvailable && (
            <FormControlLabel
              control={
                <Switch
                  checked={enableBiometric}
                  onChange={(e) => setEnableBiometric(e.target.checked)}
                />
              }
              label="Kích hoạt xác thực sinh trắc học"
              sx={{ mt: 1, mb: 1 }}
            />
          )}

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Submit button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting || !password.trim()}
            sx={{ mt: 3, py: 1.5 }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : isSetupMode ? (
              'Thiết lập & Bắt đầu'
            ) : (
              'Đăng nhập'
            )}
          </Button>

          {/* Info */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 3 }}
          >
            {isSetupMode
              ? 'Lần đầu sử dụng? Hãy tạo mật khẩu chính để bảo vệ dữ liệu.'
              : `Lần thử: ${failedAttempts}/3`}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SimpleAuthGuard

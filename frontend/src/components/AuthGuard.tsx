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
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Visibility, VisibilityOff, Fingerprint } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
}

const passwordStrengthCriteria = [
  { label: 'Ít nhất 12 ký tự', test: (pwd: string) => pwd.length >= 12 },
  { label: 'Có chữ thường (a-z)', test: (pwd: string) => /[a-z]/.test(pwd) },
  { label: 'Có chữ hoa (A-Z)', test: (pwd: string) => /[A-Z]/.test(pwd) },
  { label: 'Có số (0-9)', test: (pwd: string) => /[0-9]/.test(pwd) },
  { label: 'Có ký tự đặc biệt (!@#$%)', test: (pwd: string) => /[^a-zA-Z0-9]/.test(pwd) },
]

const getPasswordStrengthColor = (score: number, total: number) => {
  const percentage = (score / total) * 100
  if (percentage < 20) return '#d32f2f' // red
  if (percentage < 40) return '#f57c00' // orange
  if (percentage < 60) return '#fbc02d' // amber
  if (percentage < 80) return '#388e3c' // green
  return '#1976d2' // blue (excellent)
}

const getPasswordStrengthLabel = (score: number, total: number) => {
  const percentage = (score / total) * 100
  if (percentage < 20) return 'Rất yếu'
  if (percentage < 40) return 'Yếu'
  if (percentage < 60) return 'Trung bình'
  if (percentage < 80) return 'Mạnh'
  return 'Xuất sắc'
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
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

  const [currentStep, setCurrentStep] = useState(0)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBiometricDialog, setShowBiometricDialog] = useState(false)

  // Reset form when step changes
  useEffect(() => {
    setPassword('')
    setConfirmPassword('')
    setError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }, [currentStep])

  // Check password strength
  const getPasswordStrength = (pwd: string) => {
    const passedCriteria = passwordStrengthCriteria.filter(criteria => criteria.test(pwd))
    return {
      score: passedCriteria.length,
      total: passwordStrengthCriteria.length,
      criteria: passwordStrengthCriteria.map(criteria => ({
        ...criteria,
        passed: criteria.test(pwd)
      }))
    }
  }

  const passwordStrength = getPasswordStrength(password)
  const isPasswordStrong = passwordStrength.score === passwordStrength.total

  // Handle setup flow
  const handleSetup = async () => {
    if (!isPasswordStrong) {
      setError('Mật khẩu chưa đủ mạnh')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const success = await setupMasterPassword(password)
      if (success) {
        // After successful password setup, show biometric dialog if available
        if (biometricAvailable) {
          setShowBiometricDialog(true)
        } else {
          // No biometric available, complete setup directly
          await completeSetup()
        }
      } else {
        setError('Thiết lập mật khẩu thất bại')
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi thiết lập mật khẩu')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle login
  const handleLogin = async () => {
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const success = await loginWithPassword(password)
      if (!success) {
        setError('Mật khẩu không đúng')
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle biometric login
  const handleBiometricLogin = async () => {
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

  // Handle biometric setup
  const handleBiometricSetup = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const success = await setupBiometric()
      if (success) {
        setShowBiometricDialog(false)
        // Complete setup and authenticate user
        await completeSetup()
      } else {
        setError('Thiết lập sinh trắc học thất bại')
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi thiết lập sinh trắc học')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Skip biometric setup
  const skipBiometricSetup = async () => {
    setShowBiometricDialog(false)
    // Complete setup without biometric
    await completeSetup()
  }

  // Complete setup process
  const completeSetup = async () => {
    console.log('🔄 Starting setup completion...')
    try {
      // Authenticate user after setup
      const success = await loginWithPassword(password)
      console.log('🔐 Login after setup:', success)
      if (success) {
        console.log('✅ Login successful, refreshing auth state...')
        // Force refresh auth state to show main app
        await refresh()
        console.log('🔄 Auth state refreshed')
        // Clear local state to prevent any rendering conflicts
        setCurrentStep(0)
        setPassword('')
        setConfirmPassword('')
        setError('')
        console.log('🧹 Local state cleared')
      } else {
        setError('Không thể đăng nhập sau khi thiết lập')
      }
    } catch (err) {
      console.error('Failed to complete setup:', err)
      setError('Có lỗi xảy ra khi hoàn tất thiết lập')
    }
  }

  // Show loading screen
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

  // Setup flow
  if (!isSetup) {
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
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom textAlign="center">
              Chào mừng đến với ViSecure
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
              Thiết lập mật khẩu chính để bảo vệ dữ liệu của bạn
            </Typography>

            <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
              <Step>
                <StepLabel>Mật khẩu chính</StepLabel>
              </Step>
              <Step>
                <StepLabel>Sinh trắc học</StepLabel>
              </Step>
              <Step>
                <StepLabel>Hoàn tất</StepLabel>
              </Step>
            </Stepper>

            {currentStep === 0 && (
              <>
                <TextField
                  label="Mật khẩu chính"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  margin="normal"
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

                <TextField
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ mt: 2, mb: 3 }}>
                  {/* Header với tiêu đề và score */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      Độ mạnh mật khẩu
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: getPasswordStrengthColor(passwordStrength.score, passwordStrength.total),
                        fontSize: '0.875rem'
                      }}
                    >
                      {getPasswordStrengthLabel(passwordStrength.score, passwordStrength.total)}
                    </Typography>
                  </Box>
                  
                  {/* Progress bar đẹp hơn */}
                  <Box sx={{ mb: 3 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(passwordStrength.score / passwordStrength.total) * 100}
                      sx={{ 
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(0,0,0,0.08)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getPasswordStrengthColor(passwordStrength.score, passwordStrength.total),
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="text.disabled">Yếu</Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                        {passwordStrength.score}/{passwordStrength.total}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">Mạnh</Typography>
                    </Box>
                  </Box>
                  
                  {/* Requirements checklist - thiết kế đơn giản và chuyên nghiệp */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 'medium' }}>
                      Yêu cầu mật khẩu:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                      {passwordStrength.criteria.map((criterion, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.2,
                            py: 0.3,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              backgroundColor: criterion.passed ? 'success.main' : 'grey.200',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              flexShrink: 0
                            }}
                          >
                            <Typography 
                              sx={{ 
                                color: criterion.passed ? 'white' : 'grey.500',
                                fontSize: '11px', 
                                lineHeight: 1,
                                fontWeight: 'bold'
                              }}
                            >
                              {criterion.passed ? '✓' : ''}
                            </Typography>
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: criterion.passed ? 'text.primary' : 'text.secondary',
                              fontWeight: criterion.passed ? 500 : 400,
                              fontSize: '0.875rem',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {criterion.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSetup}
                  disabled={isSubmitting || !isPasswordStrong || password !== confirmPassword}
                  sx={{ mt: 2 }}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Thiết lập mật khẩu'}
                </Button>
              </>
            )}

            {currentStep === 1 && (
              <>
                <Typography variant="h6" gutterBottom textAlign="center">
                  Thiết lập sinh trắc học
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                  Bật xác thực sinh trắc học để đăng nhập nhanh chóng và an toàn
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={skipBiometricSetup}
                  >
                    Bỏ qua
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setShowBiometricDialog(true)}
                    disabled={!biometricAvailable}
                    startIcon={<Fingerprint />}
                  >
                    Thiết lập
                  </Button>
                </Box>

                {!biometricAvailable && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Thiết bị không hỗ trợ xác thực sinh trắc học
                  </Alert>
                )}
              </>
            )}

            {currentStep === 2 && (
              <>
                <Typography variant="h6" gutterBottom textAlign="center" color="success.main">
                  Thiết lập hoàn tất!
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                  ViSecure đã sẵn sàng để bảo vệ dữ liệu của bạn
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={async () => {
                    // Re-initialize auth to refresh state
                    await refresh()
                  }}
                >
                  Bắt đầu sử dụng
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Biometric Setup Dialog */}
        <Dialog open={showBiometricDialog} onClose={() => setShowBiometricDialog(false)}>
          <DialogTitle>Thiết lập sinh trắc học</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Sử dụng vân tay, Face ID hoặc PIN thiết bị để đăng nhập nhanh chóng
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowBiometricDialog(false)}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleBiometricSetup}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <Fingerprint />}
            >
              Thiết lập
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }

  // Login flow
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
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom textAlign="center">
            ViSecure
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            Nhập mật khẩu chính để tiếp tục
          </Typography>

          {/* Biometric Login Option */}
          {biometricConfigured && (
            <Button
              variant="outlined"
              fullWidth
              onClick={handleBiometricLogin}
              disabled={isSubmitting}
              startIcon={<Fingerprint />}
              sx={{ mb: 2 }}
            >
              Xác thực sinh trắc học
            </Button>
          )}

          <TextField
            label="Mật khẩu chính"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLogin()
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

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {failedAttempts > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Lần thử: {failedAttempts}/3
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            disabled={isSubmitting || !password.trim()}
            sx={{ mt: 3 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Đăng nhập'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AuthGuard

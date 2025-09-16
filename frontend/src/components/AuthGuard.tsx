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
  Chip,
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
  { label: 'Chữ thường', test: (pwd: string) => /[a-z]/.test(pwd) },
  { label: 'Chữ hoa', test: (pwd: string) => /[A-Z]/.test(pwd) },
  { label: 'Số', test: (pwd: string) => /[0-9]/.test(pwd) },
  { label: 'Ký tự đặc biệt', test: (pwd: string) => /[^a-zA-Z0-9]/.test(pwd) },
]

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
        setCurrentStep(1) // Move to biometric setup
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
        setCurrentStep(2) // Setup complete
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
  const skipBiometricSetup = () => {
    setShowBiometricDialog(false)
    setCurrentStep(2)
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
                  <Typography variant="body2" gutterBottom>
                    Độ mạnh mật khẩu:
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(passwordStrength.score / passwordStrength.total) * 100}
                    color={passwordStrength.score < 3 ? 'error' : passwordStrength.score < 5 ? 'warning' : 'success'}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {passwordStrength.criteria.map((criterion, index) => (
                      <Chip
                        key={index}
                        label={criterion.label}
                        size="small"
                        color={criterion.passed ? 'success' : 'default'}
                        variant={criterion.passed ? 'filled' : 'outlined'}
                      />
                    ))}
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
                  onClick={() => window.location.reload()}
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

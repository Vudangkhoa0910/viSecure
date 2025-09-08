import React, { useState, useEffect, memo } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Switch,
  Button,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Chip,
  InputAdornment,
} from '@mui/material'

interface UserProfile {
  name: string
  email: string
  phone: string
  hasAppPassword: boolean
  isFirstTime: boolean
}

interface AppSettings {
  notifications: boolean
  biometric: boolean
  autoLock: boolean
  autoBackup: boolean
  darkMode: boolean
}

const ProfilePage: React.FC = memo(() => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    hasAppPassword: false,
    isFirstTime: true,
  })

  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    biometric: false,
    autoLock: true,
    autoBackup: false,
    darkMode: false,
  })

  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [tempProfile, setTempProfile] = useState<UserProfile>(userProfile)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('visecure_profile')
    const savedSettings = localStorage.getItem('visecure_settings')
    
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      setUserProfile(profile)
      setTempProfile(profile)
    }
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Check if first time user
  useEffect(() => {
    if (userProfile.isFirstTime && userProfile.name === '') {
      setShowProfileDialog(true)
    }
  }, [userProfile])

  const handleSettingChange = (key: keyof AppSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('visecure_settings', JSON.stringify(newSettings))
    showSnackbar('Cài đặt đã được cập nhật', 'success')
  }

  const handleSaveProfile = () => {
    if (!tempProfile.name.trim()) {
      showSnackbar('Vui lòng nhập họ tên', 'error')
      return
    }

    const updatedProfile = {
      ...tempProfile,
      isFirstTime: false,
    }
    
    setUserProfile(updatedProfile)
    localStorage.setItem('visecure_profile', JSON.stringify(updatedProfile))
    setShowProfileDialog(false)
    showSnackbar('Thông tin cá nhân đã được cập nhật', 'success')
  }

  const handlePasswordSave = () => {
    if (userProfile.hasAppPassword && !passwords.current) {
      showSnackbar('Vui lòng nhập mật khẩu hiện tại', 'error')
      return
    }

    if (!passwords.new || passwords.new.length < 6) {
      showSnackbar('Mật khẩu mới phải có ít nhất 6 ký tự', 'error')
      return
    }

    if (passwords.new !== passwords.confirm) {
      showSnackbar('Mật khẩu xác nhận không khớp', 'error')
      return
    }

    // Save password to localStorage (in real app, should be encrypted)
    localStorage.setItem('visecure_app_password', passwords.new)
    
    const updatedProfile = { ...userProfile, hasAppPassword: true }
    setUserProfile(updatedProfile)
    localStorage.setItem('visecure_profile', JSON.stringify(updatedProfile))
    
    setPasswords({ current: '', new: '', confirm: '' })
    setShowPasswordDialog(false)
    showSnackbar(
      userProfile.hasAppPassword ? 'Mật khẩu đã được thay đổi' : 'Mật khẩu đã được thiết lập', 
      'success'
    )
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Hồ sơ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý tài khoản và cài đặt bảo mật
        </Typography>
      </Box>

      {/* User Profile Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mr: 2,
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
              }}
            >
              {userProfile.name ? getInitials(userProfile.name) : 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">
                {userProfile.name || 'Chưa cập nhật'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userProfile.email || 'Chưa cập nhật email'}
              </Typography>
              {userProfile.phone && (
                <Typography variant="body2" color="text.secondary">
                  {userProfile.phone}
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              onClick={() => {
                setTempProfile(userProfile)
                setShowProfileDialog(true)
              }}
            >
              Chỉnh sửa
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={userProfile.hasAppPassword ? 'Có mật khẩu ứng dụng' : 'Chưa có mật khẩu ứng dụng'}
              color={userProfile.hasAppPassword ? 'success' : 'warning'}
              size="small"
            />
            <Chip
              label={userProfile.isFirstTime ? 'Người dùng mới' : 'Đã cấu hình'}
              color={userProfile.isFirstTime ? 'info' : 'default'}
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bảo mật
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Mật khẩu ứng dụng"
                secondary={userProfile.hasAppPassword ? 'Đã thiết lập mật khẩu bảo vệ ứng dụng' : 'Chưa thiết lập mật khẩu bảo vệ'}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPasswordDialog(true)}
              >
                {userProfile.hasAppPassword ? 'Đổi' : 'Thiết lập'}
              </Button>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Thông báo"
                secondary="Nhận cảnh báo bảo mật"
              />
              <Switch
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Sinh trắc học"
                secondary="Mở khóa bằng vân tay/FaceID"
              />
              <Switch
                checked={settings.biometric}
                onChange={(e) => handleSettingChange('biometric', e.target.checked)}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Tự động khóa"
                secondary="Khóa ứng dụng khi không sử dụng"
              />
              <Switch
                checked={settings.autoLock}
                onChange={(e) => handleSettingChange('autoLock', e.target.checked)}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Sao lưu tự động"
                secondary="Đồng bộ dữ liệu an toàn"
              />
              <Switch
                checked={settings.autoBackup}
                onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thông tin ứng dụng
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Về ViSecure"
                secondary="Phiên bản 1.0.0"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Trung tâm trợ giúp"
                secondary="Hướng dẫn sử dụng và hỗ trợ"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Đăng xuất"
                secondary="Xóa dữ liệu cục bộ và thoát"
              />
              <Button
                color="error"
                variant="outlined"
                size="small"
                onClick={() => {
                  localStorage.clear()
                  window.location.reload()
                }}
              >
                Đăng xuất
              </Button>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {userProfile.isFirstTime ? 'Thiết lập thông tin cá nhân' : 'Chỉnh sửa thông tin'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {userProfile.isFirstTime 
              ? 'Vui lòng cập nhật thông tin cá nhân để bắt đầu sử dụng ViSecure'
              : 'Cập nhật thông tin cá nhân của bạn'
            }
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Họ và tên"
            type="text"
            fullWidth
            variant="outlined"
            value={tempProfile.name}
            onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={tempProfile.email}
            onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Số điện thoại"
            type="tel"
            fullWidth
            variant="outlined"
            value={tempProfile.phone}
            onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          {!userProfile.isFirstTime && (
            <Button onClick={() => setShowProfileDialog(false)}>Hủy</Button>
          )}
          <Button onClick={handleSaveProfile} variant="contained">
            {userProfile.isFirstTime ? 'Bắt đầu' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Setup Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {userProfile.hasAppPassword ? 'Thay đổi mật khẩu ứng dụng' : 'Thiết lập mật khẩu ứng dụng'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mật khẩu ứng dụng giúp bảo vệ dữ liệu của bạn khỏi truy cập trái phép
          </Typography>
          
          {userProfile.hasAppPassword && (
            <TextField
              margin="dense"
              label="Mật khẩu hiện tại"
              type="password"
              fullWidth
              variant="outlined"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}
          
          <TextField
            margin="dense"
            label="Mật khẩu mới"
            type="password"
            fullWidth
            variant="outlined"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="caption" color="text.secondary">
                    ≥ 6 ký tự
                  </Typography>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Xác nhận mật khẩu mới"
            type="password"
            fullWidth
            variant="outlined"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Hủy</Button>
          <Button onClick={handlePasswordSave} variant="contained">
            {userProfile.hasAppPassword ? 'Thay đổi' : 'Thiết lập'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
})

ProfilePage.displayName = 'ProfilePage'

export default ProfilePage

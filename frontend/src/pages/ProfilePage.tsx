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
} from '@mui/material'
import {
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
  Backup as BackupIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  Info as InfoIcon,
  ExitToApp as ExitIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material'

interface AppSettings {
  notifications: boolean
  biometric: boolean
  autoLock: boolean
  autoBackup: boolean
  darkMode: boolean
}

const ProfilePage: React.FC = memo(() => {
  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    biometric: true,
    autoLock: true,
    autoBackup: true,
    darkMode: false,
  })

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
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

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('visecure_settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSettingChange = (key: keyof AppSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('visecure_settings', JSON.stringify(newSettings))
    showSnackbar('Cài đặt đã được cập nhật', 'success')
  }

  const handlePasswordSave = () => {
    if (!passwords.new || !passwords.confirm) {
      showSnackbar('Vui lòng nhập đầy đủ thông tin', 'error')
      return
    }

    if (passwords.new !== passwords.confirm) {
      showSnackbar('Mật khẩu xác nhận không khớp', 'error')
      return
    }

    if (passwords.new.length < 8) {
      showSnackbar('Mật khẩu phải có ít nhất 8 ký tự', 'error')
      return
    }

    // Save password logic here
    setShowPasswordDialog(false)
    setPasswords({ current: '', new: '', confirm: '' })
    showSnackbar('Mật khẩu đã được cập nhật', 'success')
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleLogout = () => {
    // Clear all local data
    localStorage.clear()
    // Reload to trigger authentication
    window.location.reload()
  }

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: 'primary.main',
            fontSize: '2rem',
          }}
        >
          <AccountIcon sx={{ fontSize: '2.5rem' }} />
        </Avatar>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Hồ sơ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý tài khoản và cài đặt bảo mật
        </Typography>
      </Box>

      {/* Security Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Bảo mật
            </Typography>
          </Box>
          <List disablePadding>
            <ListItem>
              <ListItemText
                primary="Thay đổi mật khẩu chính"
                secondary="Cập nhật mật khẩu bảo vệ ứng dụng"
              />
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setShowPasswordDialog(true)}
              >
                Thay đổi
              </Button>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Xác thực sinh trắc học"
                secondary="Sử dụng vân tay hoặc Face ID để đăng nhập nhanh"
              />
              <Switch
                checked={settings.biometric}
                onChange={(e) => handleSettingChange('biometric', e.target.checked)}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Settings Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Cài đặt
            </Typography>
          </Box>
          <List disablePadding>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationsIcon sx={{ mr: 1, fontSize: 20 }} />
                    Thông báo
                  </Box>
                }
                secondary="Nhận thông báo về hoạt động bảo mật"
              />
              <Switch
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LockIcon sx={{ mr: 1, fontSize: 20 }} />
                    Khóa tự động
                  </Box>
                }
                secondary="Tự động khóa ứng dụng khi không sử dụng"
              />
              <Switch
                checked={settings.autoLock}
                onChange={(e) => handleSettingChange('autoLock', e.target.checked)}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BackupIcon sx={{ mr: 1, fontSize: 20 }} />
                    Sao lưu tự động
                  </Box>
                }
                secondary="Tự động sao lưu dữ liệu quan trọng"
              />
              <Switch
                checked={settings.autoBackup}
                onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DarkModeIcon sx={{ mr: 1, fontSize: 20 }} />
                    Chế độ tối
                  </Box>
                }
                secondary="Chuyển đổi giao diện tối"
              />
              <Switch
                checked={settings.darkMode}
                onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Thông tin ứng dụng
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2">Phiên bản:</Typography>
            <Chip label="1.0.0" size="small" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2">Cập nhật cuối:</Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date().toLocaleDateString('vi-VN')}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            ViSecure - Ứng dụng bảo mật cá nhân privacy-first
          </Typography>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Card>
        <CardContent>
          <List disablePadding>
            <ListItem>
              <ListItemText
                primary="Đăng xuất"
                secondary="Xóa tất cả dữ liệu và đăng xuất khỏi ứng dụng"
              />
              <Button
                color="error"
                variant="outlined"
                startIcon={<ExitIcon />}
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thay đổi mật khẩu chính</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mật khẩu chính giúp bảo vệ tất cả dữ liệu của bạn trong ViSecure
          </Typography>
          
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
          
          <TextField
            margin="dense"
            label="Mật khẩu mới"
            type="password"
            fullWidth
            variant="outlined"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
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
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
})

ProfilePage.displayName = 'ProfilePage'

export default ProfilePage

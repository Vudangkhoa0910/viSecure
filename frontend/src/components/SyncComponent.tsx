import React, { useState, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Divider,
} from '@mui/material'
import {
  QrCode2 as QrCodeIcon,
  CameraAlt as CameraIcon,
  GetApp as DownloadIcon,
  Publish as UploadIcon,
  Devices as DevicesIcon,
} from '@mui/icons-material'
import { QRCodeSVG } from 'qrcode.react'
import { crossPlatformStorage, DeviceInfo } from '../utils/crossPlatformStorage'
import { useAuth } from '../hooks/useAuth'

interface SyncComponentProps {
  open: boolean
  onClose: () => void
}

const SyncComponent: React.FC<SyncComponentProps> = ({ open, onClose }) => {
  const { isAuthenticated } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [qrData, setQrData] = useState<string>('')
  const [importQrData, setImportQrData] = useState<string>('')
  const [masterPassword, setMasterPassword] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [connectedDevices, setConnectedDevices] = useState<DeviceInfo[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentDevice = crossPlatformStorage.getCurrentDevice()
  const storageCapabilities = crossPlatformStorage.getStorageCapabilities()

  // Generate QR Code for export
  const handleGenerateQR = async () => {
    if (!masterPassword) {
      setError('Vui lòng nhập Master Password')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const qrData = await crossPlatformStorage.generateSyncQR(masterPassword)
      setQrData(qrData)
      setSuccess('Tạo mã QR thành công! Quét mã này trên thiết bị khác để đồng bộ.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo mã QR')
    } finally {
      setLoading(false)
    }
  }

  // Import from QR Code
  const handleImportQR = async () => {
    if (!importQrData || !masterPassword) {
      setError('Vui lòng nhập dữ liệu QR và Master Password')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await crossPlatformStorage.importFromQR(importQrData, masterPassword)
      setSuccess('Nhập dữ liệu thành công!')
      setImportQrData('')
      updateConnectedDevices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể nhập dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  // Export to file
  const handleExportFile = async () => {
    if (!masterPassword) {
      setError('Vui lòng nhập Master Password')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const blob = await crossPlatformStorage.exportToFile(masterPassword)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `visecure-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setSuccess('Xuất file thành công!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xuất file')
    } finally {
      setLoading(false)
    }
  }

  // Import from file
  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !masterPassword) {
      setError('Vui lòng chọn file và nhập Master Password')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await crossPlatformStorage.importFromFile(file, masterPassword)
      setSuccess('Nhập file thành công!')
      updateConnectedDevices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể nhập file')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const updateConnectedDevices = () => {
    setConnectedDevices(crossPlatformStorage.getConnectedDevices())
  }

  const getDeviceIcon = (type: DeviceInfo['type']) => {
    const icons = {
      ios: '📱',
      android: '🤖',
      macos: '💻',
      windows: '🖥️',
      linux: '🐧',
      web: '🌐',
    }
    return icons[type] || '📱'
  }

  const resetForm = () => {
    setQrData('')
    setImportQrData('')
    setMasterPassword('')
    setError('')
    setSuccess('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DevicesIcon />
          Đồng bộ thiết bị
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Device Info */}
        <Card sx={{ mb: 3, backgroundColor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Thiết bị hiện tại
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span style={{ fontSize: '1.5rem' }}>{getDeviceIcon(currentDevice.type)}</span>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {currentDevice.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {currentDevice.id.slice(0, 8)}...
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Master Password */}
        <TextField
          label="Master Password"
          type="password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
          fullWidth
          margin="normal"
          helperText="Cần thiết để mã hóa/giải mã dữ liệu đồng bộ"
        />

        {/* Tabs */}
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mt: 2 }}>
          <Tab label="Xuất QR" icon={<QrCodeIcon />} />
          <Tab label="Nhập QR" icon={<CameraIcon />} />
          <Tab label="File" icon={<DownloadIcon />} />
          <Tab label="Thiết bị" icon={<DevicesIcon />} />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {/* Export QR Tab */}
          {tabValue === 0 && (
            <Box>
              <Button
                variant="contained"
                onClick={handleGenerateQR}
                disabled={loading || !masterPassword}
                fullWidth
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Tạo mã QR'}
              </Button>
              
              {qrData && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <QRCodeSVG
                    value={qrData}
                    size={200}
                    level="M"
                    includeMargin
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Quét mã QR này trên thiết bị khác để đồng bộ dữ liệu
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Import QR Tab */}
          {tabValue === 1 && (
            <Box>
              <TextField
                label="Dữ liệu QR"
                multiline
                rows={4}
                value={importQrData}
                onChange={(e) => setImportQrData(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Dán dữ liệu từ mã QR vào đây..."
              />
              <Button
                variant="contained"
                onClick={handleImportQR}
                disabled={loading || !masterPassword || !importQrData}
                fullWidth
                sx={{ mt: 1 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Nhập dữ liệu'}
              </Button>
            </Box>
          )}

          {/* File Tab */}
          {tabValue === 2 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportFile}
                    disabled={loading || !masterPassword}
                    fullWidth
                  >
                    Xuất File
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || !masterPassword}
                    fullWidth
                  >
                    Nhập File
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Devices Tab */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Khả năng thiết bị
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip 
                  label={`Camera QR: ${storageCapabilities.hasQRCamera ? 'Có' : 'Không'}`}
                  color={storageCapabilities.hasQRCamera ? 'success' : 'default'}
                  size="small"
                />
                <Chip 
                  label={`File System: ${storageCapabilities.hasFileSystem ? 'Có' : 'Không'}`}
                  color={storageCapabilities.hasFileSystem ? 'success' : 'default'}
                  size="small"
                />
                <Chip 
                  label={`Storage: ${storageCapabilities.maxStorageSize}MB`}
                  color="info"
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Thiết bị đã kết nối ({connectedDevices.length})
              </Typography>
              {connectedDevices.length === 0 ? (
                <Typography color="text.secondary">
                  Chưa có thiết bị nào được đồng bộ
                </Typography>
              ) : (
                <Box>
                  {connectedDevices.map((device) => (
                    <Card key={device.id} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{getDeviceIcon(device.type)}</span>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {device.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Đồng bộ lần cuối: {device.lastSync.toLocaleDateString('vi-VN')}
                            </Typography>
                          </Box>
                          <Chip
                            label={device.isOnline ? 'Online' : 'Offline'}
                            size="small"
                            color={device.isOnline ? 'success' : 'default'}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SyncComponent

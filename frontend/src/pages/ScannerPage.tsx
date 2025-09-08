import React, { useState, useRef, useCallback, memo } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import { ScanResult } from '../types'

const ScannerPage: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState(0)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }, [])

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    
    // Simulate OCR and URL scanning
    setTimeout(() => {
      const mockResults: ScanResult[] = [
        {
          url: 'https://example.com',
          status: 'safe',
          reason: 'URL an toàn',
          timestamp: new Date(),
        },
        {
          url: 'http://suspicious.example',
          status: 'warning',
          reason: 'URL có thể không an toàn',
          timestamp: new Date(),
        },
      ]
      setScanResults(mockResults)
      setIsScanning(false)
    }, 2000)
  }, [])

  const handleUrlScan = useCallback((url: string) => {
    setIsScanning(true)
    
    // Simulate URL scanning
    setTimeout(() => {
      const result: ScanResult = {
        url,
        status: url.includes('https') ? 'safe' : 'warning',
        reason: url.includes('https') ? 'HTTPS được sử dụng' : 'Không có HTTPS',
        timestamp: new Date(),
      }
      setScanResults(prev => [result, ...prev])
      setIsScanning(false)
    }, 1000)
  }, [])

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'safe':
        return <span style={{ color: 'green', fontWeight: 'bold' }}>✓</span>
      case 'warning':
        return <span style={{ color: 'orange', fontWeight: 'bold' }}>!</span>
      case 'danger':
        return <span style={{ color: 'red', fontWeight: 'bold' }}>✗</span>
      default:
        return <span style={{ color: 'green', fontWeight: 'bold' }}>✓</span>
    }
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'safe':
        return 'success' as const
      case 'warning':
        return 'warning' as const
      case 'danger':
        return 'error' as const
      default:
        return 'default' as const
    }
  }, [])

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Security Scanner
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
            <Tab label="QR Code" />
            <Tab label="Hình ảnh" />
            <Tab label="URL" />
          </Tabs>
        </CardContent>
      </Card>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quét QR Code
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Tính năng quét QR Code sẽ được cập nhật trong phiên bản tiếp theo
            </Alert>
            <Button
              variant="contained"
              disabled
              fullWidth
            >
              Mở camera quét QR
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quét hình ảnh
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              <Button
                variant="contained"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                fullWidth
              >
                {isScanning ? 'Đang quét...' : 'Chọn hình ảnh'}
              </Button>
            </Box>
            {isScanning && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Kiểm tra URL
            </Typography>
            <Button
              variant="contained"
              onClick={() => handleUrlScan('https://example.com')}
              disabled={isScanning}
              fullWidth
              sx={{ mb: 2 }}
            >
              {isScanning ? 'Đang kiểm tra...' : 'Test URL an toàn'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleUrlScan('http://suspicious.example')}
              disabled={isScanning}
              fullWidth
            >
              {isScanning ? 'Đang kiểm tra...' : 'Test URL nghi ngờ'}
            </Button>
          </CardContent>
        </Card>
      )}

      {scanResults.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Kết quả quét ({scanResults.length})
            </Typography>
            <List>
              {scanResults.map((result, index) => (
                <ListItem key={index} divider>
                  <Box sx={{ mr: 2 }}>
                    {getStatusIcon(result.status)}
                  </Box>
                  <ListItemText
                    primary={result.url}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {result.reason}
                        </Typography>
                        <Chip
                          label={result.status.toUpperCase()}
                          color={getStatusColor(result.status)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  )
})

ScannerPage.displayName = 'ScannerPage'

export default ScannerPage

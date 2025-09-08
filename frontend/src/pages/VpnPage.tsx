import React, { useState, memo } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { VpnServer, VpnConnection } from '../types'

const VpnPage: React.FC = memo(() => {
  const [vpnConnection, setVpnConnection] = useState<VpnConnection>({
    isConnected: false,
    bytesReceived: 0,
    bytesSent: 0,
  })

  const [autoConnect, setAutoConnect] = useState(false)
  const [killSwitch, setKillSwitch] = useState(false)
  const [selectedServer, setSelectedServer] = useState<VpnServer | null>(null)
  const [showServerDialog, setShowServerDialog] = useState(false)

  const [servers] = useState<VpnServer[]>([
    {
      id: '1',
      name: 'Vietnam - Ho Chi Minh',
      country: 'VN',
      city: 'Ho Chi Minh City',
      ping: 15,
      load: 65,
      isPremium: false,
    },
    {
      id: '2',
      name: 'Vietnam - Hanoi',
      country: 'VN',
      city: 'Hanoi',
      ping: 25,
      load: 45,
      isPremium: false,
    },
    {
      id: '3',
      name: 'Singapore',
      country: 'SG',
      city: 'Singapore',
      ping: 35,
      load: 30,
      isPremium: true,
    },
    {
      id: '4',
      name: 'Japan - Tokyo',
      country: 'JP',
      city: 'Tokyo',
      ping: 85,
      load: 55,
      isPremium: true,
    },
  ])

  const handleConnect = () => {
    if (vpnConnection.isConnected) {
      // Disconnect
      setVpnConnection({
        isConnected: false,
        bytesReceived: 0,
        bytesSent: 0,
      })
    } else {
      // Connect
      const server = selectedServer || servers[0]
      setVpnConnection({
        isConnected: true,
        server,
        connectionTime: new Date(),
        bytesReceived: 0,
        bytesSent: 0,
      })
      
      // Simulate data transfer
      const interval = setInterval(() => {
        setVpnConnection((prev: VpnConnection) => ({
          ...prev,
          bytesReceived: prev.bytesReceived + Math.random() * 1000000,
          bytesSent: prev.bytesSent + Math.random() * 500000,
        }))
      }, 1000)

      // Store interval ID for cleanup
      setTimeout(() => clearInterval(interval), 10000)
    }
  }

  const handleServerSelect = (server: VpnServer) => {
    setSelectedServer(server)
    setShowServerDialog(false)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getServerLoad = (load: number) => {
    if (load < 30) return { color: 'success', label: 'Thấp' }
    if (load < 70) return { color: 'warning', label: 'Trung bình' }
    return { color: 'error', label: 'Cao' }
  }

  const currentServer = vpnConnection.server || selectedServer || servers[0]

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          VPN Mini
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kết nối nhanh và an toàn
        </Typography>
      </Box>

      {/* Connection Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: `4px solid ${vpnConnection.isConnected ? '#4caf50' : '#9e9e9e'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                backgroundColor: vpnConnection.isConnected ? 'success.light' : 'grey.100',
                transition: 'all 0.3s ease',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: vpnConnection.isConnected ? 'success.dark' : 'grey.500',
              }}
            >
              {vpnConnection.isConnected ? 'ON' : 'OFF'}
            </Box>
          </Box>
          
          <Typography variant="h5" gutterBottom>
            {vpnConnection.isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
          </Typography>
          
          {vpnConnection.isConnected && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Kết nối tới: {currentServer.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                IP được bảo vệ • Dữ liệu được mã hóa
              </Typography>
            </Box>
          )}

          <Button
            variant={vpnConnection.isConnected ? 'outlined' : 'contained'}
            color={vpnConnection.isConnected ? 'error' : 'primary'}
            size="large"
            onClick={handleConnect}
            sx={{ minWidth: 150 }}
          >
            {vpnConnection.isConnected ? 'Ngắt kết nối' : 'Kết nối'}
          </Button>
        </CardContent>
      </Card>

      {/* Server Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Máy chủ hiện tại
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="body1">{currentServer.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                Ping: {currentServer.ping}ms • Tải: {currentServer.load}%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentServer.isPremium && (
                <Chip label="Premium" color="warning" size="small" />
              )}
              <Chip
                label={getServerLoad(currentServer.load).label}
                color={getServerLoad(currentServer.load).color as 'success' | 'warning' | 'error'}
                size="small"
              />
            </Box>
          </Box>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setShowServerDialog(true)}
            disabled={vpnConnection.isConnected}
          >
            Chọn máy chủ khác
          </Button>
        </CardContent>
      </Card>

      {/* Connection Stats */}
      {vpnConnection.isConnected && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Thống kê kết nối
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="success.main">
                  {formatBytes(vpnConnection.bytesReceived)}
                </Typography>
                <Typography variant="caption">Đã tải xuống</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="info.main">
                  {formatBytes(vpnConnection.bytesSent)}
                </Typography>
                <Typography variant="caption">Đã tải lên</Typography>
              </Box>
            </Box>
            {vpnConnection.connectionTime && (
              <Typography variant="caption" color="text.secondary">
                Thời gian kết nối: {new Date().getTime() - vpnConnection.connectionTime.getTime() < 60000 
                  ? Math.floor((new Date().getTime() - vpnConnection.connectionTime.getTime()) / 1000) + 's'
                  : Math.floor((new Date().getTime() - vpnConnection.connectionTime.getTime()) / 60000) + 'm'
                }
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cài đặt
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Tự động kết nối"
                secondary="Tự động kết nối VPN khi vào WiFi công cộng"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={autoConnect}
                  onChange={(e) => setAutoConnect(e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Kill Switch"
                secondary="Chặn internet nếu VPN bị ngắt kết nối"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={killSwitch}
                  onChange={(e) => setKillSwitch(e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert severity="info">
        <Typography variant="body2">
          VPN Mini sử dụng giao thức WireGuard để đảm bảo kết nối nhanh và an toàn.
          Dữ liệu của bạn được mã hóa AES-256.
        </Typography>
      </Alert>

      {/* Server Selection Dialog */}
      <Dialog open={showServerDialog} onClose={() => setShowServerDialog(false)} fullWidth>
        <DialogTitle>Chọn máy chủ VPN</DialogTitle>
        <DialogContent>
          <List>
            {servers.map((server) => (
              <ListItem
                key={server.id}
                button
                onClick={() => handleServerSelect(server)}
                selected={selectedServer?.id === server.id}
              >
                <ListItemText
                  primary={server.name}
                  secondary={
                    <Box>
                      <Typography variant="caption">
                        Ping: {server.ping}ms • Tải: {server.load}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={server.load}
                        color={getServerLoad(server.load).color as any}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {server.isPremium && (
                    <Chip label="Premium" color="warning" size="small" />
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowServerDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
})

VpnPage.displayName = 'VpnPage'

export default VpnPage

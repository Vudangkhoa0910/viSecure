import React, { memo } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Fade,
  useTheme,
} from '@mui/material'
import {
  TrendingUp as TrendingIcon,
  Notifications as NotificationIcon,
  ChevronRight as ChevronRightIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const HomePage: React.FC = memo(() => {
  const theme = useTheme()
  const navigate = useNavigate()

  const quickActions = [
    {
      title: 'Secure Vault',
      description: 'Quản lý mật khẩu an toàn',
      color: '#10b981',
      path: '/vault',
    },
    {
      title: 'Security Scanner',
      description: 'Quét mã độc và URL',
      color: '#3b82f6',
      path: '/scanner',
    },
    {
      title: 'VPN Guide',
      description: 'Hướng dẫn VPN tốt nhất',
      color: '#8b5cf6',
      path: '/vpn',
    },
    {
      title: 'Profile',
      description: 'Cài đặt cá nhân',
      color: '#f59e0b',
      path: '/profile',
    },
  ]

  const recentNews = [
    {
      id: '1',
      title: 'Cảnh báo: Thủ đoạn lừa đảo mới qua Zalo',
      summary: 'Hacker đang sử dụng tin nhắn giả mạo từ ngân hàng...',
      priority: 'high',
      time: '2 giờ trước',
    },
    {
      id: '2',
      title: 'Mẹo: Tạo mật khẩu mạnh và dễ nhớ',
      summary: 'Học cách tạo mật khẩu vừa an toàn vừa dễ nhớ...',
      priority: 'medium',
      time: '1 ngày trước',
    },
    {
      id: '3',
      title: 'Cập nhật: Lỗ hổng bảo mật mới trong Chrome',
      summary: 'Google vừa phát hành bản vá cho lỗ hổng nghiêm trọng...',
      priority: 'high',
      time: '2 ngày trước',
    },
  ]

  const securityStatus = [
    { label: 'Vault được mã hóa', status: 'success', value: 'Kích hoạt' },
    { label: 'Sao lưu tự động', status: 'warning', value: 'Chưa thiết lập' },
    { label: 'Quét bảo mật', status: 'success', value: 'Cập nhật' },
    { label: 'VPN kết nối', status: 'error', value: 'Chưa kết nối' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return theme.palette.success.main
      case 'warning': return theme.palette.warning.main
      case 'error': return theme.palette.error.main
      default: return theme.palette.text.secondary
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckIcon sx={{ color: theme.palette.success.main }} />
      case 'warning': return <WarningIcon sx={{ color: theme.palette.warning.main }} />
      case 'error': return <WarningIcon sx={{ color: theme.palette.error.main }} />
      default: return <CheckIcon />
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header với gradient background */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          borderRadius: 3,
          p: 3,
          mb: 3,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Chào mừng đến ViSecure!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Giải pháp bảo mật toàn diện cho người Việt
          </Typography>
        </Box>
        
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
          }}
        />
      </Box>

      {/* Quick Actions */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
        Truy cập nhanh
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={6} sm={3} key={action.title}>
            <Fade in timeout={300 + index * 100}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
                  },
                }}
                onClick={() => navigate(action.path)}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}dd 100%)`,
                      margin: '0 auto 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 20px -5px ${action.color}40`,
                    }}
                  >
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {action.title.charAt(0)}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Security Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TimelineIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Tình trạng bảo mật
                </Typography>
              </Box>
              <List>
                {securityStatus.map((item, index) => (
                  <ListItem key={index} divider={index < securityStatus.length - 1}>
                    <ListItemIcon>
                      {getStatusIcon(item.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={
                        <Chip
                          label={item.value}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(item.status),
                            color: 'white',
                            mt: 0.5,
                          }}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Security News */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <NotificationIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Tin tức bảo mật
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ChevronRightIcon />}
                  onClick={() => navigate('/news')}
                >
                  Xem tất cả
                </Button>
              </Box>
              <List>
                {recentNews.map((news, index) => (
                  <ListItem
                    key={news.id}
                    divider={index < recentNews.length - 1}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="medium">
                            {news.title}
                          </Typography>
                          {news.priority === 'high' && (
                            <Chip
                              label="Quan trọng"
                              size="small"
                              color="error"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {news.summary}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {news.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Security Tip */}
      <Alert
        severity="info"
        sx={{
          mt: 3,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        }}
        icon={<TrendingIcon />}
      >
        <Typography variant="body2" fontWeight="medium">
          💡 Mẹo bảo mật hôm nay: Luôn cập nhật ứng dụng và hệ điều hành để có được các bản vá bảo mật mới nhất!
        </Typography>
      </Alert>
    </Container>
  )
})

HomePage.displayName = 'HomePage'

export default HomePage

import React, { useState, memo, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  Tabs,
  Tab,
  Alert,
  Avatar,
} from '@mui/material'
import { NewsArticle } from '../types'

const NewsPage: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState(0)
  const [articles, setArticles] = useState<NewsArticle[]>([
    {
      id: '1',
      title: 'Cảnh báo: Thủ đoạn lừa đảo mới qua Zalo',
      summary: 'Các hacker đang sử dụng tin nhắn giả mạo từ ngân hàng để đánh cắp thông tin...',
      category: 'scam',
      priority: 'high',
      publishedAt: new Date(2025, 8, 4),
      readTime: 3,
      isRead: false,
    },
    {
      id: '2',
      title: 'Mẹo: Tạo mật khẩu mạnh và dễ nhớ',
      summary: 'Học cách tạo mật khẩu vừa an toàn vừa dễ nhớ với phương pháp passphrase...',
      category: 'tips',
      priority: 'medium',
      publishedAt: new Date(2025, 8, 3),
      readTime: 5,
      isRead: false,
    },
    {
      id: '3',
      title: 'Bản vá bảo mật quan trọng cho Android',
      summary: 'Google phát hành bản vá khắc phục lỗ hổng nghiêm trọng cho hệ điều hành Android...',
      category: 'security',
      priority: 'high',
      publishedAt: new Date(2025, 8, 2),
      readTime: 4,
      isRead: true,
    },
    {
      id: '4',
      title: 'Cách nhận biết email lừa đảo',
      summary: 'Những dấu hiệu điển hình của email phishing và cách bảo vệ bản thân...',
      category: 'tips',
      priority: 'medium',
      publishedAt: new Date(2025, 8, 1),
      readTime: 6,
      isRead: false,
    },
  ])

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }, [])

  const markAsRead = useCallback((id: string) => {
    setArticles(prev => prev.map((article: NewsArticle) => 
      article.id === id ? { ...article, isRead: true } : article
    ))
  }, [])

  const getCategoryIcon = useCallback((category: string) => {
    switch (category) {
      case 'security':
        return null
      case 'scam':
        return null
      case 'tips':
        return null
      default:
        return null
    }
  }, [])

  const getCategoryLabel = useCallback((category: string) => {
    switch (category) {
      case 'security':
        return 'Bảo mật'
      case 'scam':
        return 'Lừa đảo'
      case 'tips':
        return 'Mẹo hay'
      default:
        return 'Tin tức'
    }
  }, [])

  const getCategoryColor = useCallback((category: string) => {
    switch (category) {
      case 'security':
        return 'primary' as const
      case 'scam':
        return 'error' as const
      case 'tips':
        return 'success' as const
      default:
        return 'default' as const
    }
  }, [])

  const filterArticles = () => {
    switch (activeTab) {
      case 1:
        return articles.filter((article: NewsArticle) => article.category === 'security')
      case 2:
        return articles.filter((article: NewsArticle) => article.category === 'scam')
      case 3:
        return articles.filter((article: NewsArticle) => article.category === 'tips')
      default:
        return articles
    }
  }

  const unreadCount = articles.filter((article: NewsArticle) => !article.isRead).length

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tin tức & Cảnh báo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cập nhật tin tức bảo mật và mẹo hay
        </Typography>
        {unreadCount > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Bạn có {unreadCount} tin tức chưa đọc
          </Alert>
        )}
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" sx={{ mb: 3 }}>
        <Tab label="Tất cả" />
        <Tab label="Bảo mật" />
        <Tab label="Lừa đảo" />
        <Tab label="Mẹo hay" />
      </Tabs>

      {/* Articles List */}
      <List>
        {filterArticles().map((article: NewsArticle) => (
          <Card 
            key={article.id} 
            sx={{ 
              mb: 2,
              opacity: article.isRead ? 0.7 : 1,
              border: article.priority === 'high' ? '2px solid #f44336' : 'none'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ bgcolor: getCategoryColor(article.category) + '.main' }}>
                  {getCategoryIcon(article.category)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={getCategoryLabel(article.category)}
                      color={getCategoryColor(article.category) as 'primary' | 'error' | 'success'}
                      size="small"
                    />
                    {article.priority === 'high' && (
                      <Chip
                        label="Quan trọng"
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {!article.isRead && (
                      <Chip
                        label="Mới"
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom
                    sx={{ fontWeight: article.isRead ? 400 : 600 }}
                  >
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {article.summary}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {article.readTime} phút đọc
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {article.publishedAt.toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => markAsRead(article.id)}
                disabled={article.isRead}
              >
                {article.isRead ? 'Đã đọc' : 'Đọc'}
              </Button>
            </CardActions>
          </Card>
        ))}
      </List>

      {filterArticles().length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Không có tin tức nào trong danh mục này
          </Typography>
        </Box>
      )}

      {/* Daily Tip */}
      <Card sx={{ mt: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="h6">
              Mẹo bảo mật hôm nay
            </Typography>
          </Box>
          <Typography variant="body2">
            <strong>Luôn kiểm tra URL trước khi nhập thông tin:</strong> Hãy chắc chắn rằng 
            trang web sử dụng HTTPS (có ổ khóa) và tên miền chính xác trước khi nhập 
            mật khẩu hoặc thông tin cá nhân.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
})

NewsPage.displayName = 'NewsPage'

export default NewsPage

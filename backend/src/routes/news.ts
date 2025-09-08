import { Router, Request, Response } from 'express'

const router = Router()

// @desc    Get security news
// @route   GET /api/news
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, page = 1, limit = 10 } = req.query

    const mockNews = [
      {
        id: '1',
        title: 'Cảnh báo: Thủ đoạn lừa đảo mới qua Zalo',
        summary: 'Các hacker đang sử dụng tin nhắn giả mạo từ ngân hàng để đánh cắp thông tin...',
        content: 'Nội dung chi tiết về thủ đoạn lừa đảo...',
        category: 'scam',
        priority: 'high',
        publishedAt: new Date(2025, 8, 4),
        readTime: 3,
        tags: ['zalo', 'phishing', 'banking'],
        author: 'ViSecure Security Team',
      },
      {
        id: '2',
        title: 'Mẹo: Tạo mật khẩu mạnh và dễ nhớ',
        summary: 'Học cách tạo mật khẩu vừa an toàn vừa dễ nhớ với phương pháp passphrase...',
        content: 'Hướng dẫn chi tiết về tạo mật khẩu...',
        category: 'tips',
        priority: 'medium',
        publishedAt: new Date(2025, 8, 3),
        readTime: 5,
        tags: ['password', 'security', 'tips'],
        author: 'ViSecure Security Team',
      },
      {
        id: '3',
        title: 'Bản vá bảo mật quan trọng cho Android',
        summary: 'Google phát hành bản vá khắc phục lỗ hổng nghiêm trọng cho hệ điều hành Android...',
        content: 'Chi tiết về bản vá bảo mật...',
        category: 'security',
        priority: 'high',
        publishedAt: new Date(2025, 8, 2),
        readTime: 4,
        tags: ['android', 'patch', 'vulnerability'],
        author: 'ViSecure Security Team',
      },
      {
        id: '4',
        title: 'Cách nhận biết email lừa đảo',
        summary: 'Những dấu hiệu điển hình của email phishing và cách bảo vệ bản thân...',
        content: 'Hướng dẫn nhận biết email lừa đảo...',
        category: 'tips',
        priority: 'medium',
        publishedAt: new Date(2025, 8, 1),
        readTime: 6,
        tags: ['email', 'phishing', 'awareness'],
        author: 'ViSecure Security Team',
      },
    ]

    // Filter by category if provided
    let filteredNews = mockNews
    if (category && category !== 'all') {
      filteredNews = mockNews.filter(article => article.category === category)
    }

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit)
    const endIndex = startIndex + Number(limit)
    const paginatedNews = filteredNews.slice(startIndex, endIndex)

    res.status(200).json({
      success: true,
      data: {
        articles: paginatedNews,
        pagination: {
          current: Number(page),
          total: Math.ceil(filteredNews.length / Number(limit)),
          count: paginatedNews.length,
          totalCount: filteredNews.length,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch news',
      },
    })
  }
})

// @desc    Get single article
// @route   GET /api/news/:id
// @access  Public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Mock article details
    const mockArticle = {
      id,
      title: 'Cảnh báo: Thủ đoạn lừa đảo mới qua Zalo',
      summary: 'Các hacker đang sử dụng tin nhắn giả mạo từ ngân hàng để đánh cắp thông tin...',
      content: `
        <h2>Thủ đoạn mới của tin tặc</h2>
        <p>Gần đây, các chuyên gia bảo mật đã phát hiện một thủ đoạn lừa đảo mới...</p>
        
        <h3>Dấu hiệu nhận biết</h3>
        <ul>
          <li>Tin nhắn từ số điện thoại lạ</li>
          <li>Yêu cầu cung cấp thông tin cá nhân</li>
          <li>Link đáng ngờ</li>
        </ul>
        
        <h3>Cách phòng tránh</h3>
        <p>Không bao giờ cung cấp thông tin cá nhân qua tin nhắn...</p>
      `,
      category: 'scam',
      priority: 'high',
      publishedAt: new Date(2025, 8, 4),
      readTime: 3,
      tags: ['zalo', 'phishing', 'banking'],
      author: 'ViSecure Security Team',
      views: 1250,
      relatedArticles: [
        {
          id: '2',
          title: 'Mẹo: Tạo mật khẩu mạnh và dễ nhớ',
          summary: 'Học cách tạo mật khẩu vừa an toàn vừa dễ nhớ...',
        },
      ],
    }

    res.status(200).json({
      success: true,
      data: {
        article: mockArticle,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch article',
      },
    })
  }
})

// @desc    Get daily security tip
// @route   GET /api/news/daily-tip
// @access  Public
router.get('/tips/daily', async (req: Request, res: Response) => {
  try {
    const dailyTips = [
      'Luôn kiểm tra URL trước khi nhập thông tin cá nhân',
      'Sử dụng mật khẩu khác nhau cho mỗi tài khoản',
      'Bật xác thực 2 lớp cho các tài khoản quan trọng',
      'Cập nhật phần mềm thường xuyên',
      'Không kết nối WiFi công cộng cho các giao dịch quan trọng',
    ]

    const today = new Date().getDate()
    const tip = dailyTips[today % dailyTips.length]

    res.status(200).json({
      success: true,
      data: {
        tip,
        date: new Date().toISOString().split('T')[0],
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch daily tip',
      },
    })
  }
})

export default router

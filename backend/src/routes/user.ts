import { Router, Request, Response } from 'express'

const router = Router()

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const mockUser = {
      id: '1',
      name: 'Nguyễn Văn A',
      email: 'user@example.com',
      avatar: null,
      createdAt: new Date(2024, 0, 15),
      lastLogin: new Date(),
      settings: {
        notifications: true,
        biometric: true,
        autoLock: true,
        autoBackup: false,
        darkMode: false,
        language: 'vi',
      },
      subscription: {
        plan: 'free',
        expiresAt: null,
        features: ['basic_vault', 'url_scanner', 'free_vpn'],
      },
    }

    res.status(200).json({
      success: true,
      data: {
        user: mockUser,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch user profile',
      },
    })
  }
})

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body

    const updatedUser = {
      id: '1',
      name: name || 'Nguyễn Văn A',
      email: email || 'user@example.com',
      avatar: null,
      updatedAt: new Date(),
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update profile',
      },
    })
  }
})

// @desc    Update user settings
// @route   PUT /api/user/settings
// @access  Private
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const updatedSettings = {
      ...req.body,
      updatedAt: new Date(),
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: updatedSettings,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update settings',
      },
    })
  }
})

// @desc    Get security checkup
// @route   GET /api/user/security-checkup
// @access  Private
router.get('/security-checkup', async (req: Request, res: Response) => {
  try {
    const mockSecurityChecks = [
      {
        id: '1',
        name: 'Mật khẩu mạnh',
        description: 'Sử dụng mật khẩu chính đủ mạnh',
        status: 'good',
        score: 95,
        recommendations: [
          'Mật khẩu hiện tại đã đủ mạnh',
          'Hãy thay đổi mật khẩu định kỳ 3-6 tháng',
        ],
      },
      {
        id: '2',
        name: 'Xác thực 2 lớp',
        description: 'Bật xác thực sinh trắc học',
        status: 'good',
        score: 100,
        recommendations: [
          'Sinh trắc học đã được kích hoạt',
          'Đảm bảo thiết bị hỗ trợ Face ID/Touch ID',
        ],
      },
      {
        id: '3',
        name: 'Cập nhật ứng dụng',
        description: 'Phiên bản mới nhất đã được cài đặt',
        status: 'good',
        score: 100,
        recommendations: [
          'Ứng dụng đã được cập nhật',
          'Bật tự động cập nhật để nhận bản vá bảo mật',
        ],
      },
      {
        id: '4',
        name: 'Sao lưu dữ liệu',
        description: 'Chưa thiết lập sao lưu tự động',
        status: 'warning',
        score: 60,
        recommendations: [
          'Hãy bật sao lưu tự động trong cài đặt',
          'Đảm bảo dữ liệu được mã hóa khi sao lưu',
        ],
      },
    ]

    const totalScore = Math.round(
      mockSecurityChecks.reduce((sum, check) => sum + check.score, 0) / mockSecurityChecks.length
    )

    res.status(200).json({
      success: true,
      data: {
        checks: mockSecurityChecks,
        overallScore: totalScore,
        lastCheckAt: new Date(),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch security checkup',
      },
    })
  }
})

// @desc    Get usage statistics
// @route   GET /api/user/stats
// @access  Private
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const mockStats = {
      vault: {
        totalItems: 15,
        passwords: 8,
        notes: 5,
        files: 2,
        lastUpdated: new Date(Date.now() - 86400000), // 1 day ago
      },
      scanner: {
        totalScans: 42,
        urlScans: 28,
        imageScans: 14,
        threatsDetected: 3,
        lastScan: new Date(Date.now() - 3600000), // 1 hour ago
      },
      vpn: {
        totalSessions: 15,
        totalDataUsed: 1024 * 1024 * 500, // 500 MB
        averageSessionDuration: 2.5, // hours
        lastConnection: new Date(Date.now() - 1800000), // 30 minutes ago
      },
      general: {
        accountAge: Math.floor((Date.now() - new Date(2024, 0, 15).getTime()) / (1000 * 60 * 60 * 24)), // days
        loginStreak: 7,
        securityScore: 89,
      },
    }

    res.status(200).json({
      success: true,
      data: {
        stats: mockStats,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch user statistics',
      },
    })
  }
})

export default router

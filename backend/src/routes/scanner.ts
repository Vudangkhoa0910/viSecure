import { Router, Request, Response } from 'express'
import multer from 'multer'

const router = Router()

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('File type not allowed'))
    }
  },
})

// @desc    Scan image for text and URLs
// @route   POST /api/scanner/image
// @access  Private
router.post('/image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No image file provided',
        },
      })
    }

    // Mock OCR results and URL scanning
    const mockResults = [
      {
        url: 'https://example.com',
        status: 'safe' as const,
        reason: 'Domain verified as safe',
        timestamp: new Date(),
      },
      {
        url: 'http://suspicious-site.xyz',
        status: 'warning' as const,
        reason: 'Suspicious domain, no HTTPS',
        timestamp: new Date(),
      },
    ]

    res.status(200).json({
      success: true,
      message: 'Image scanned successfully',
      data: {
        results: mockResults,
        extractedText: 'Sample extracted text from image...',
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Image scanning failed',
      },
    })
  }
})

// @desc    Scan URL for safety
// @route   POST /api/scanner/url
// @access  Private
router.post('/url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'URL is required',
        },
      })
    }

    // Mock URL scanning logic
    const isHttps = url.startsWith('https')
    const isSuspicious = url.includes('suspicious') || url.includes('.tk') || url.includes('.ml')
    
    let status: 'safe' | 'warning' | 'danger' = 'safe'
    let reason = 'URL appears to be safe'

    if (isSuspicious) {
      status = 'danger'
      reason = 'Potentially malicious domain detected'
    } else if (!isHttps) {
      status = 'warning'
      reason = 'No HTTPS encryption'
    }

    const result = {
      url,
      status,
      reason,
      timestamp: new Date(),
      checks: {
        https: isHttps,
        malware: false,
        phishing: isSuspicious,
        reputation: status === 'safe' ? 'good' : 'poor',
      },
    }

    res.status(200).json({
      success: true,
      message: 'URL scanned successfully',
      data: {
        result,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'URL scanning failed',
      },
    })
  }
})

// @desc    Get scan history
// @route   GET /api/scanner/history
// @access  Private
router.get('/history', async (req: Request, res: Response) => {
  try {
    const mockHistory = [
      {
        id: '1',
        type: 'url',
        target: 'https://example.com',
        status: 'safe',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        id: '2',
        type: 'image',
        target: 'image_scan_123.jpg',
        status: 'warning',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      },
    ]

    res.status(200).json({
      success: true,
      data: {
        history: mockHistory,
        total: mockHistory.length,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch scan history',
      },
    })
  }
})

export default router

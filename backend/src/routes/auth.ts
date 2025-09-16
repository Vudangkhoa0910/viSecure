import { Router, Request, Response } from 'express'

const router = Router()

// @desc    Health check for auth service
// @route   GET /api/auth/health
// @access  Public
// Note: ViSecure uses local authentication - no server-side auth required
router.get('/health', async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Auth service healthy - Local authentication in use',
    data: {
      authType: 'local',
      serverRequired: false,
      features: ['master-password', 'biometric', 'device-binding'],
    },
  })
})

// @desc    Get auth configuration
// @route   GET /api/auth/config
// @access  Public
router.get('/config', async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      authType: 'local',
      biometricSupported: true,
      sessionTimeout: 15 * 60 * 1000, // 15 minutes
      maxFailedAttempts: 3,
      lockoutDuration: 30 * 60 * 1000, // 30 minutes
    },
  })
})

export default router

import { Router, Request, Response } from 'express'
import { body } from 'express-validator'

const router = Router()

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
], async (req: Request, res: Response) => {
  try {
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: '1',
          email: req.body.email,
          name: req.body.name,
        },
        token: 'sample-jwt-token',
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Registration failed',
      },
    })
  }
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          email: req.body.email,
          name: 'User Name',
        },
        token: 'sample-jwt-token',
      },
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid credentials',
      },
    })
  }
})

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'User Name',
          createdAt: new Date(),
        },
      },
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Not authorized',
      },
    })
  }
})

export default router

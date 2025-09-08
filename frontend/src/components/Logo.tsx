import React, { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { Shield as ShieldIcon } from '@mui/icons-material'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  animated?: boolean
}

const Logo: React.FC<LogoProps> = memo(({ 
  size = 'medium', 
  showText = true,
  animated = false 
}) => {
  const sizes = {
    small: { icon: 24, text: '1.2rem' },
    medium: { icon: 32, text: '1.5rem' },
    large: { icon: 48, text: '2rem' },
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': animated ? {
          transform: 'scale(1.05)',
        } : {},
      }}
    >
      {/* Logo Icon với gradient và hiệu ứng */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: sizes[size].icon + 8,
          height: sizes[size].icon + 8,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
          border: '2px solid #10b981',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
          animation: animated ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            },
            '50%': {
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
            },
            '100%': {
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            },
          },
        }}
      >
        <ShieldIcon
          sx={{
            fontSize: sizes[size].icon,
            color: '#10b981',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />
        
        {/* Decoration dots */}
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            animation: animated ? 'blink 1.5s infinite' : 'none',
            '@keyframes blink': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.3 },
            },
          }}
        />
      </Box>

      {/* App Name */}
      {showText && (
        <Typography
          variant="h6"
          sx={{
            fontSize: sizes[size].text,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            letterSpacing: '-0.02em',
          }}
        >
          ViSecure
        </Typography>
      )}
    </Box>
  )
})

Logo.displayName = 'Logo'

export default Logo

import React, { memo } from 'react'
import { Box, CircularProgress, Typography, keyframes } from '@mui/material'
import { Security as SecurityIcon } from '@mui/icons-material'

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

interface PreloaderProps {
  message?: string
  size?: number
}

const Preloader: React.FC<PreloaderProps> = memo(({ 
  message = 'Đang tải...', 
  size = 40 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
        animation: `${fadeIn} 0.3s ease-in-out`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress 
          size={size + 20} 
          thickness={2}
          sx={{
            color: 'primary.main',
            position: 'absolute',
            animation: `${rotate} 1s linear infinite`,
          }}
        />
        <SecurityIcon 
          sx={{ 
            fontSize: size,
            color: 'primary.main',
            zIndex: 1,
          }} 
        />
      </Box>
      
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{
          textAlign: 'center',
          fontWeight: 500,
          animation: `${fadeIn} 0.5s ease-in-out 0.2s both`,
        }}
      >
        {message}
      </Typography>
    </Box>
  )
})

Preloader.displayName = 'Preloader'

export default Preloader

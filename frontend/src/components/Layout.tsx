import React, { memo } from 'react'
import { Box, Container } from '@mui/material'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        paddingBottom: '80px', // Space for floating bottom navigation
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          padding: 0,
          margin: 0,
          width: '100%',
          maxWidth: '100% !important',
        }}
      >
        {children}
      </Container>
    </Box>
  )
})

Layout.displayName = 'Layout'

export default Layout

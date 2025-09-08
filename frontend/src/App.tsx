import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Box, BottomNavigation, BottomNavigationAction, useTheme } from '@mui/material'
import {
  Security as VaultIcon,
  QrCodeScanner as ScannerIcon,
  Home as HomeIcon,
  VpnLock as VpnIcon,
  Person as ProfileIcon,
} from '@mui/icons-material'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const VaultPage = lazy(() => import('./pages/VaultPage'))
const ScannerPage = lazy(() => import('./pages/ScannerPage'))
const VpnPage = lazy(() => import('./pages/VpnPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
import Layout from './components/Layout'
import Preloader from './components/Preloader'
import { performanceMonitor } from './utils/performance'

const navigationItems = [
  { label: 'Home', value: '/', icon: HomeIcon },
  { label: 'Vault', value: '/vault', icon: VaultIcon },
  { label: 'Scanner', value: '/scanner', icon: ScannerIcon },
  { label: 'VPN', value: '/vpn', icon: VpnIcon },
  { label: 'Profile', value: '/profile', icon: ProfileIcon },
]

function App() {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState(location.pathname)

  // Sync navigation với location changes
  useEffect(() => {
    setCurrentTab(location.pathname)
    performanceMonitor.markStart('page_navigation')
    // Mark navigation end after a brief delay
    setTimeout(() => performanceMonitor.markEnd('page_navigation'), 100)
  }, [location.pathname])

  // Initialize performance monitoring
  useEffect(() => {
    performanceMonitor.init()
  }, [])

  // Memoize navigation items để tránh re-render
  const memoizedNavigationItems = useMemo(() => navigationItems, [])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    if (newValue !== currentTab) {
      setCurrentTab(newValue)
      navigate(newValue, { replace: false })
    }
  }

  return (
    <Layout>
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        transition: 'all 0.2s ease-in-out',
      }}>
        <Suspense fallback={<Preloader message="Đang tải trang..." />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/vault" element={<VaultPage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/vpn" element={<VpnPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </Box>
      
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 1.5,
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        <BottomNavigation
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            borderRadius: '16px',
            mx: 1,
            height: 60,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 20px -5px rgb(0 0 0 / 0.15)',
            pointerEvents: 'all',
            transition: 'all 0.2s ease-in-out',
            '& .MuiBottomNavigationAction-root': {
              transition: 'all 0.2s ease-in-out',
              borderRadius: '12px',
              margin: '2px 1px',
              minWidth: 'auto',
              padding: '6px 8px',
              fontSize: '0.75rem',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 500,
                marginTop: '4px',
              },
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                transform: 'scale(1.05)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.8rem',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
              },
            },
          }}
        >
        {memoizedNavigationItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={<item.icon />}
          />
        ))}
      </BottomNavigation>
    </Box>
    </Layout>
  )
}

export default App

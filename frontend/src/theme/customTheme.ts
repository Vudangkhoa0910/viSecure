import { createTheme } from '@mui/material/styles'

// Định nghĩa palette màu gradient xanh lá cây và đen bạc
export const customTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#10b981', // Emerald 500
      light: '#34d399', // Emerald 400
      dark: '#047857', // Emerald 700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#374151', // Gray 700
      light: '#6b7280', // Gray 500
      dark: '#1f2937', // Gray 800
      contrastText: '#ffffff',
    },
    background: {
      default: '#f9fafb', // Gray 50
      paper: '#ffffff',
    },
    text: {
      primary: '#111827', // Gray 900
      secondary: '#6b7280', // Gray 500
    },
    divider: '#e5e7eb', // Gray 200
    success: {
      main: '#059669', // Emerald 600
      light: '#10b981', // Emerald 500
      dark: '#047857', // Emerald 700
    },
    warning: {
      main: '#d97706', // Amber 600
      light: '#f59e0b', // Amber 500
      dark: '#92400e', // Amber 700
    },
    error: {
      main: '#dc2626', // Red 600
      light: '#ef4444', // Red 500
      dark: '#991b1b', // Red 700
    },
    info: {
      main: '#2563eb', // Blue 600
      light: '#3b82f6', // Blue 500
      dark: '#1d4ed8', // Blue 700
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          border: '1px solid #e5e7eb',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 -2px 4px -2px rgb(0 0 0 / 0.1)',
          border: 'none',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            color: '#10b981',
            transform: 'scale(1.1)',
          },
          '&:hover': {
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          '&:hover': {
            background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
})

export default customTheme

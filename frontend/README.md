3# ViSecure Frontend

React + TypeScript + Vite application for ViSecure mobile security solution.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
App will be available at http://localhost:3000

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📱 Features

- **Responsive Design**: Optimized for mobile devices
- **PWA Support**: Installable as a mobile app
- **Material-UI**: Modern and accessible components
- **TypeScript**: Type-safe development
- **Vite**: Fast build and hot reload

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Application pages
├── hooks/              # Custom React hooks
├── services/           # API service functions
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point
```

## 🎨 UI Components

- **Layout**: Main app layout with bottom navigation
- **VaultPage**: Password and data management
- **ScannerPage**: URL and image scanning
- **NewsPage**: Security news and tips
- **VpnPage**: VPN connection management
- **ProfilePage**: User profile and settings

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```bash
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ViSecure
```

### PWA Configuration
PWA settings in `vite.config.ts`:
- Service worker registration
- Manifest configuration
- Offline support

## 🚀 Deployment

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in Netlify dashboard

### Build Command
```bash
npm run build
```

### Environment Variables for Production
```bash
VITE_API_URL=https://your-backend-url.com/api
```

## 📱 Mobile Features

- Bottom navigation for easy thumb navigation
- Touch-friendly interface
- Responsive breakpoints
- iOS/Android specific styling
- Offline capability with service worker

## 🧪 Development

### Code Style
- ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting

### Component Development
- Functional components with hooks
- Material-UI components
- Responsive design patterns
- Accessibility best practices

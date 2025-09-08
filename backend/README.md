# ViSecure Backend

Node.js + Express + TypeScript backend API for ViSecure mobile security solution.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm or yarn

### Installation
```bash
npm install
```

### Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Development
```bash
npm run dev
```
Server will be available at http://localhost:5000

### Production Build
```bash
npm run build
npm start
```

## 🏗️ Project Structure

```
src/
├── controllers/        # Route controllers
├── middleware/         # Express middleware
├── models/            # Database models
├── routes/            # API routes
├── services/          # Business logic
├── utils/             # Utility functions
├── types/             # TypeScript types
└── server.ts          # Application entry point
```

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Vault Management
- `GET /api/vault` - Get vault items
- `POST /api/vault` - Create vault item
- `PUT /api/vault/:id` - Update vault item
- `DELETE /api/vault/:id` - Delete vault item

### Security Scanner
- `POST /api/scanner/image` - Scan image for URLs
- `POST /api/scanner/url` - Scan URL for safety
- `GET /api/scanner/history` - Get scan history

### News & Security Tips
- `GET /api/news` - Get security news
- `GET /api/news/:id` - Get specific article
- `GET /api/news/tips/daily` - Get daily security tip

### VPN Management
- `GET /api/vpn/servers` - Get VPN servers
- `POST /api/vpn/connect` - Connect to VPN
- `POST /api/vpn/disconnect` - Disconnect VPN
- `GET /api/vpn/status` - Get connection status

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/settings` - Update settings
- `GET /api/user/security-checkup` - Security analysis

## 🔒 Security Features

### Authentication & Authorization
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes middleware

### API Security
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- MongoDB injection protection

### Data Protection
- AES-256 encryption for sensitive data
- Secure file upload handling
- Environment variable protection

## 🗄️ Database

### MongoDB Collections
- `users` - User accounts
- `vaultItems` - Encrypted vault data
- `scanHistory` - URL/image scan results
- `news` - Security news articles
- `vpnSessions` - VPN connection logs

### Database Schema
```javascript
// User Schema
{
  email: String,
  password: String (hashed),
  name: String,
  settings: Object,
  createdAt: Date
}

// Vault Item Schema
{
  userId: ObjectId,
  type: String, // 'password', 'note', 'file'
  title: String,
  encryptedData: String,
  folder: String,
  createdAt: Date
}
```

## 🚀 Deployment

### Render Deployment
1. Connect GitHub repository
2. Set environment variables
3. Deploy with: `npm start`

### Environment Variables
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
VIRUSTOTAL_API_KEY=your-api-key
CORS_ORIGIN=https://your-frontend.netlify.app
```

### Health Check
- `GET /health` - Server health status

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## 📊 Monitoring

### Logging
- Morgan HTTP request logging
- Error logging with stack traces
- Environment-based log levels

### Error Handling
- Global error handler middleware
- Graceful shutdown handling
- Unhandled promise rejection handling

## 🔧 Development

### Code Quality
- ESLint with TypeScript rules
- Prettier code formatting
- Pre-commit hooks with husky

### Database Development
- MongoDB connection with retry logic
- Database seeding scripts
- Migration utilities

## 🌐 External APIs

### Security APIs
- VirusTotal API for URL/file scanning
- Google Safe Browsing API
- Custom threat intelligence feeds

### VPN Integration
- WireGuard configuration generation
- OpenVPN server management
- Real-time connection monitoring

## 📈 Performance

### Optimization
- Compression middleware
- Response caching strategies
- Database query optimization
- Image processing optimization

### Scaling
- Horizontal scaling ready
- Stateless architecture
- Database connection pooling
- Load balancer compatible

export interface VaultItem {
  id: string
  type: 'password' | 'note' | 'file'
  title: string
  username?: string
  password?: string
  url?: string
  note?: string
  folder: string
  createdAt: Date
}

export interface ScanResult {
  url: string
  status: 'safe' | 'warning' | 'danger'
  reason: string
  timestamp: Date
}

export interface NewsArticle {
  id: string
  title: string
  summary: string
  category: 'security' | 'scam' | 'tips'
  priority: 'low' | 'medium' | 'high'
  publishedAt: Date
  readTime: number
  isRead: boolean
}

export interface VpnServer {
  id: string
  name: string
  country: string
  city: string
  ping: number
  load: number
  isPremium: boolean
}

export interface VpnConnection {
  isConnected: boolean
  server?: VpnServer
  connectionTime?: Date
  bytesReceived: number
  bytesSent: number
}

export interface SecurityCheck {
  id: string
  name: string
  description: string
  status: 'good' | 'warning' | 'danger'
  score: number
}

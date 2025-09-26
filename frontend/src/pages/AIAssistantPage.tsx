import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Fab,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Send as SendIcon,
  Psychology as AiIcon,
  Person as UserIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  lastActivity: Date
}

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Load conversations from storage
  useEffect(() => {
    const savedConversations = localStorage.getItem('ai-conversations')
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations)
      setConversations(parsed)
      if (parsed.length > 0) {
        setCurrentConversationId(parsed[0].id)
        setMessages(parsed[0].messages)
      }
    }
  }, [])

  // Save conversations to storage
  const saveConversations = (convs: Conversation[]) => {
    localStorage.setItem('ai-conversations', JSON.stringify(convs))
    setConversations(convs)
  }

  // Create new conversation
  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'Cuộc trò chuyện mới',
      messages: [],
      lastActivity: new Date(),
    }
    const updated = [newConv, ...conversations]
    saveConversations(updated)
    setCurrentConversationId(newConv.id)
    setMessages([])
  }

  // Simulate AI response (replace with actual AI API call)
  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Simple response simulation based on keywords
    const message = userMessage.toLowerCase()
    
    if (message.includes('bảo mật') || message.includes('security')) {
      return 'Tôi có thể giúp bạn về các vấn đề bảo mật. ViSecure cung cấp nhiều tính năng để bảo vệ thông tin cá nhân của bạn như mã hóa dữ liệu, xác thực sinh trắc học, và lưu trữ an toàn.'
    }
    
    if (message.includes('mật khẩu') || message.includes('password')) {
      return 'Để tạo mật khẩu mạnh, hãy sử dụng ít nhất 12 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt. Tránh sử dụng thông tin cá nhân dễ đoán.'
    }
    
    if (message.includes('backup') || message.includes('sao lưu')) {
      return 'ViSecure hỗ trợ sao lưu dữ liệu tự động. Bạn có thể tạo bản sao lưu thủ công hoặc thiết lập sao lưu tự động để đảm bảo không mất dữ liệu quan trọng.'
    }
    
    if (message.includes('scan') || message.includes('quét')) {
      return 'Tính năng quét của ViSecure có thể giúp bạn kiểm tra QR codes, phát hiện các mối đe dọa bảo mật, và kiểm tra tính toàn vẹn của files.'
    }
    
    return 'Tôi là AI Assistant của ViSecure. Tôi có thể giúp bạn về các vấn đề bảo mật, quản lý mật khẩu, sao lưu dữ liệu và sử dụng các tính năng của ứng dụng. Bạn có thể hỏi tôi bất cứ điều gì!'
  }

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const aiResponse = await getAIResponse(userMessage.content)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      }

      const updatedMessages = [...newMessages, aiMessage]
      setMessages(updatedMessages)

      // Update conversation
      if (currentConversationId) {
        const updatedConvs = conversations.map(conv => 
          conv.id === currentConversationId 
            ? { 
                ...conv, 
                messages: updatedMessages,
                title: updatedMessages.length === 2 ? userMessage.content.slice(0, 30) + '...' : conv.title,
                lastActivity: new Date()
              }
            : conv
        )
        saveConversations(updatedConvs)
      }
    } catch (error) {
      console.error('AI response error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Clear conversation
  const clearConversation = () => {
    setMessages([])
    if (currentConversationId) {
      const updatedConvs = conversations.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: [] }
          : conv
      )
      saveConversations(updatedConvs)
    }
    setMenuAnchor(null)
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AiIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold">
            AI Assistant
          </Typography>
        </Box>
        
        <IconButton
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          size="large"
        >
          <MoreIcon />
        </IconButton>
        
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={createNewConversation}>
            <SettingsIcon sx={{ mr: 1 }} /> Cuộc trò chuyện mới
          </MenuItem>
          <MenuItem onClick={clearConversation}>
            <DeleteIcon sx={{ mr: 1 }} /> Xóa cuộc trò chuyện
          </MenuItem>
        </Menu>
      </Box>

      {/* Welcome message */}
      {messages.length === 0 && (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card sx={{ maxWidth: 400, textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <AiIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Chào mừng bạn đến với AI Assistant!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tôi có thể giúp bạn về bảo mật, quản lý mật khẩu, và sử dụng các tính năng của ViSecure.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip 
                  label="Bảo mật dữ liệu" 
                  variant="outlined" 
                  size="small"
                  onClick={() => setInput('Làm thế nào để bảo mật dữ liệu?')}
                />
                <Chip 
                  label="Tạo mật khẩu mạnh" 
                  variant="outlined" 
                  size="small"
                  onClick={() => setInput('Cách tạo mật khẩu mạnh?')}
                />
                <Chip 
                  label="Sao lưu dữ liệu" 
                  variant="outlined" 
                  size="small"
                  onClick={() => setInput('Cách sao lưu dữ liệu?')}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  maxWidth: '80%',
                  flexDirection: message.isUser ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.isUser ? 'primary.main' : 'secondary.main',
                    width: 32,
                    height: 32,
                  }}
                >
                  {message.isUser ? <UserIcon /> : <AiIcon />}
                </Avatar>
                
                <Card
                  sx={{
                    bgcolor: message.isUser ? 'primary.main' : 'background.paper',
                    color: message.isUser ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="body2">
                      {message.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.7,
                        display: 'block',
                        mt: 1,
                        fontSize: '0.7rem',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          ))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  <AiIcon />
                </Avatar>
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2">
                      Đang suy nghĩ...
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
      )}

      {/* Input */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          ref={inputRef}
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          disabled={isLoading}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            },
          }}
        />
        
        <Fab
          color="primary"
          size="medium"
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          sx={{ minWidth: 56 }}
        >
          <SendIcon />
        </Fab>
      </Box>
    </Box>
  )
}

export default AIAssistantPage

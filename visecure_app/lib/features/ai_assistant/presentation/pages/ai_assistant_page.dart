import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_theme.dart';

class AIAssistantPage extends StatefulWidget {
  const AIAssistantPage({super.key});

  @override
  State<AIAssistantPage> createState() => _AIAssistantPageState();
}

class _AIAssistantPageState extends State<AIAssistantPage> with TickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final List<ChatMessage> _messages = [];
  
  bool _isListening = false;
  bool _isProcessing = false;
  bool _showChat = false;
  
  AnimationController? _voiceAnimationController;
  AnimationController? _pulseAnimationController;
  Animation<double>? _voiceAnimation;
  Animation<double>? _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _voiceAnimationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _pulseAnimationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    
    _voiceAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _voiceAnimationController!,
      curve: Curves.easeInOut,
    ));
    
    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.1, 
    ).animate(CurvedAnimation(
      parent: _pulseAnimationController!,
      curve: Curves.easeInOut,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header Block with Logo
            Container(
              margin: const EdgeInsets.fromLTRB(8, 8, 8, 16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF1E3A8A),
                    Color(0xFF1D4ED8),
                  ],
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1E3A8A).withOpacity(0.25),
                    blurRadius: 15,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    // Logo ViSecure
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text(
                        'Vi',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E3A8A),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'AI Assistant',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Trợ lý thông minh ViSecure',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.white.withOpacity(0.8),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Status indicator
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Beta',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            // Main Content Area
            Expanded(
              child: _showChat 
                  ? _buildChatArea()
                  : _buildVoiceInterface(),
            ),
            
            // Control Area
            _buildControlArea(),
            
            // Chat Input (only when in chat mode)
            _buildChatInput(),
            
            // Bottom padding for floating navigation
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildVoiceInterface() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const SizedBox(height: 60),
          
          // Voice Interface Center
          _buildVoiceButton(),
          
          const SizedBox(height: 32),
          
          const SizedBox(height: 40),
          
          Text(
            _getVoiceStatusText(),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
            textAlign: TextAlign.center,
          ),
          
          const SizedBox(height: 12),
          
          Text(
            _getVoiceSubtitleText(),
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          
          const SizedBox(height: 40),
          
          // Voice Commands Guide
          _buildVoiceCommandsGuide(),
        ],
      ),
    );
  }

  Widget _buildFeatureCards() {
    final features = [
      {
        'icon': Icons.security,
        'title': 'Tư vấn bảo mật',
        'desc': 'Hướng dẫn bảo mật tài khoản',
      },
      {
        'icon': Icons.help_outline,
        'title': 'Hỗ trợ sử dụng',
        'desc': 'Giải đáp về tính năng',
      },
      {
        'icon': Icons.tips_and_updates,
        'title': 'Mẹo hữu ích',
        'desc': 'Chia sẻ kinh nghiệm',
      },
    ];

    return Column(
      children: features.map((feature) {
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFF1E3A8A).withOpacity(0.15),
                      const Color(0xFF1D4ED8).withOpacity(0.08),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  feature['icon'] as IconData,
                  color: const Color(0xFF1E3A8A),
                  size: 20,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      feature['title'] as String,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      feature['desc'] as String,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Bắt đầu trò chuyện:',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _buildQuickActionChip('Làm thế nào để bảo mật tài khoản?'),
            _buildQuickActionChip('Hướng dẫn sử dụng tính năng quét'),
            _buildQuickActionChip('Cách sao lưu dữ liệu an toàn'),
            _buildQuickActionChip('Tính năng nào mới nhất?'),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionChip(String text) {
    return GestureDetector(
      onTap: () {
        _messageController.text = text;
        _sendMessage();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF1E3A8A).withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: const Color(0xFF1E3A8A).withOpacity(0.2),
            width: 1,
          ),
        ),
        child: Text(
          text,
          style: const TextStyle(
            fontSize: 12,
            color: Color(0xFF1E3A8A),
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildChatArea() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _messages.length,
      itemBuilder: (context, index) {
        return _buildMessageBubble(_messages[index]);
      },
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    final isUser = message.isUser;
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1E3A8A), Color(0xFF1D4ED8)],
                ),
                shape: BoxShape.circle,
              ),
              child: Icon(
                message.isVoice ? Icons.record_voice_over : Icons.psychology,
                color: Colors.white,
                size: 16,
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isUser 
                    ? const Color(0xFF1E3A8A)
                    : Colors.grey[100],
                borderRadius: BorderRadius.circular(16),
                border: message.isVoice 
                    ? Border.all(
                        color: const Color(0xFF1E3A8A).withOpacity(0.3),
                        width: 1,
                      )
                    : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (message.isVoice) ...[
                    Icon(
                      Icons.mic,
                      size: 14,
                      color: isUser ? Colors.white70 : const Color(0xFF1E3A8A),
                    ),
                    const SizedBox(width: 6),
                  ],
                  Flexible(
                    child: Text(
                      message.text,
                      style: TextStyle(
                        color: isUser ? Colors.white : const Color(0xFF1F2937),
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: 8),
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                shape: BoxShape.circle,
              ),
              child: Icon(
                message.isVoice ? Icons.mic : Icons.person,
                color: Colors.grey,
                size: 16,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildVoiceButton() {
    return GestureDetector(
      onTap: _toggleVoiceListening,
      child: AnimatedBuilder(
        animation: _pulseAnimationController ?? Listenable.merge([]),
        builder: (context, child) {
          return Transform.scale(
            scale: _isListening ? (_pulseAnimation?.value ?? 1.0) : 1.0,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: _isListening
                      ? [
                          Colors.red[400]!,
                          Colors.red[600]!,
                        ]
                      : _isProcessing
                          ? [
                              Colors.orange[400]!,
                              Colors.orange[600]!,
                            ]
                          : [
                              const Color(0xFF1E3A8A),
                              const Color(0xFF1D4ED8),
                            ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: (_isListening 
                        ? Colors.red[400]! 
                        : _isProcessing 
                            ? Colors.orange[400]!
                            : const Color(0xFF1E3A8A)).withOpacity(0.4),
                    blurRadius: _isListening ? 30 : 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: AnimatedBuilder(
                animation: _voiceAnimationController ?? Listenable.merge([]),
                builder: (context, child) {
                  return Transform.scale(
                    scale: _isListening ? (_voiceAnimation?.value ?? 1.0) : 1.0,
                    child: Icon(
                      _isListening 
                          ? Icons.mic 
                          : _isProcessing 
                              ? Icons.psychology 
                              : Icons.mic_none,
                      size: 80,
                      color: Colors.white,
                    ),
                  );
                },
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildVoiceCommandsGuide() {
    final commands = [
      'Nhấn và giữ để nói chuyện',
      'Hỏi về tính năng bảo mật',
      'Yêu cầu hướng dẫn sử dụng',
      'Tìm hiểu về ViSecure',
    ];

    return Column(
      children: [
        const Text(
          'Hướng dẫn sử dụng:',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 16),
        ...commands.map((command) {
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF1E3A8A).withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: const Color(0xFF1E3A8A).withOpacity(0.1),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.volume_up,
                  color: const Color(0xFF1E3A8A).withOpacity(0.7),
                  size: 16,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    command,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildControlArea() {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          // Voice Button (Main)
          Expanded(
            flex: 3,
            child: GestureDetector(
              onLongPressStart: (_) => _startVoiceListening(),
              onLongPressEnd: (_) => _stopVoiceListening(),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: _isListening
                        ? [Colors.red[400]!, Colors.red[600]!]
                        : [const Color(0xFF1E3A8A), const Color(0xFF1D4ED8)],
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: (_isListening ? Colors.red[400]! : const Color(0xFF1E3A8A)).withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      _isListening ? Icons.mic : Icons.mic_none,
                      color: Colors.white,
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _isListening ? 'Đang nghe...' : 'Nhấn giữ để nói',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          const SizedBox(width: 12),
          
          // Chat Toggle Button
          GestureDetector(
            onTap: () {
              setState(() {
                _showChat = !_showChat;
              });
              HapticFeedback.lightImpact();
            },
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _showChat 
                    ? const Color(0xFF1E3A8A)
                    : Colors.grey[200],
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(
                Icons.chat_bubble_outline,
                color: _showChat ? Colors.white : Colors.grey[600],
                size: 24,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Chat input when in chat mode
  Widget _buildChatInput() {
    if (!_showChat) return const SizedBox.shrink();
    
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              decoration: const InputDecoration(
                hintText: 'Nhập tin nhắn...',
                border: InputBorder.none,
                hintStyle: TextStyle(color: Colors.grey, fontSize: 14),
              ),
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _sendMessage,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1E3A8A), Color(0xFF1D4ED8)],
                ),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.send,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getVoiceStatusText() {
    if (_isListening) return 'Đang nghe...';
    if (_isProcessing) return 'Đang xử lý...';
    return 'ViSecure AI Assistant';
  }

  String _getVoiceSubtitleText() {
    if (_isListening) return 'Hãy nói những gì bạn muốn hỏi';
    if (_isProcessing) return 'Đang phân tích câu hỏi của bạn...';
    return 'Nhấn giữ nút bên dưới để bắt đầu trò chuyện bằng giọng nói';
  }

  void _toggleVoiceListening() {
    if (_isListening) {
      _stopVoiceListening();
    } else {
      _startVoiceListening();
    }
  }

  void _startVoiceListening() {
    setState(() {
      _isListening = true;
      _isProcessing = false;
    });
    
    _voiceAnimationController?.repeat(reverse: true);
    _pulseAnimationController?.repeat(reverse: true);
    HapticFeedback.lightImpact();
    
    // Simulate voice recognition
    // In real implementation, this would start speech recognition
  }

  void _stopVoiceListening() {
    setState(() {
      _isListening = false;
      _isProcessing = true;
    });
    
    _voiceAnimationController?.stop();
    _pulseAnimationController?.stop();
    HapticFeedback.mediumImpact();
    
    // Simulate processing
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        _isProcessing = false;
      });
      
      // Add voice message to chat if chat is enabled
      if (_showChat) {
        _messages.add(ChatMessage(
          text: 'Bạn vừa nói: "Xin chào ViSecure, tôi cần hỗ trợ về bảo mật"',
          isUser: true,
          timestamp: DateTime.now(),
          isVoice: true,
        ));
        
        // AI response
        Future.delayed(const Duration(milliseconds: 1000), () {
          setState(() {
            _messages.add(ChatMessage(
              text: 'Xin chào! Tôi là AI Assistant của ViSecure. Tôi có thể hỗ trợ bạn về các vấn đề bảo mật như: cài đặt xác thực 2 lớp, tạo mật khẩu mạnh, hướng dẫn sử dụng tính năng quét bảo mật. Bạn cần hỗ trợ gì cụ thể?',
              isUser: false,
              timestamp: DateTime.now(),
              isVoice: true,
            ));
          });
        });
      }
    });
  }

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;
    
    setState(() {
      _messages.add(ChatMessage(
        text: _messageController.text.trim(),
        isUser: true,
        timestamp: DateTime.now(),
      ));
    });
    
    _messageController.clear();
    HapticFeedback.lightImpact();
    
    // Simulate AI response
    Future.delayed(const Duration(milliseconds: 1000), () {
      setState(() {
        _messages.add(ChatMessage(
          text: 'Cảm ơn bạn đã sử dụng chat! Để có trải nghiệm tốt nhất, hãy thử tính năng voice bằng cách nhấn giữ nút mic bên dưới. Tôi có thể hiểu và phản hồi bằng giọng nói một cách tự nhiên hơn!',
          isUser: false,
          timestamp: DateTime.now(),
        ));
      });
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _voiceAnimationController?.dispose();
    _pulseAnimationController?.dispose();
    super.dispose();
  }
}

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final bool isVoice;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.isVoice = false,
  });
}
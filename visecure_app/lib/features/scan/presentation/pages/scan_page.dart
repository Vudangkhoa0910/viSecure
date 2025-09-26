import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/theme/app_theme.dart';

class ScanPage extends StatefulWidget {
  const ScanPage({super.key});

  @override
  State<ScanPage> createState() => _ScanPageState();
}

class _ScanPageState extends State<ScanPage>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  int _selectedScanType = 0;
  final TextEditingController _textController = TextEditingController();

  final List<ScanType> _scanTypes = [
    ScanType(
      title: 'Quét QR Code',
      subtitle: 'Sử dụng camera để quét mã QR',
      icon: Icons.qr_code_scanner,
      color: AppColors.primary,
    ),
    ScanType(
      title: 'Chụp ảnh',
      subtitle: 'Chụp ảnh để trích xuất liên kết',
      icon: Icons.camera_alt,
      color: AppColors.secondary,
    ),
    ScanType(
      title: 'Chọn từ thư viện',
      subtitle: 'Chọn ảnh từ thư viện ảnh',
      icon: Icons.photo_library,
      color: AppColors.accent,
    ),
    ScanType(
      title: 'Nhập liên kết',
      subtitle: 'Nhập URL hoặc số điện thoại',
      icon: Icons.edit,
      color: AppColors.accentDark,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: Column(
            children: [
              // Header
              _buildHeader(),
              
              // Scan Options
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: const Text(
                          'Chọn phương thức quét',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Scan Type Grid
                      SizedBox(
                        height: _selectedScanType == 3 ? 180 : 240,
                        child: GridView.builder(
                          physics: const NeverScrollableScrollPhysics(),
                          padding: EdgeInsets.zero,
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 10,
                            mainAxisSpacing: 10,
                            childAspectRatio: 1.2,
                          ),
                          itemCount: _scanTypes.length,
                          itemBuilder: (context, index) {
                            return _buildScanTypeCard(_scanTypes[index], index);
                          },
                        ),
                      ),
                      
                      // Manual Input Section with Animation
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 300),
                        child: _selectedScanType == 3
                            ? Column(
                                key: const ValueKey('manual_input'),
                                children: [
                                  const SizedBox(height: 16),
                                  _buildManualInputSection(),
                                ],
                              )
                            : const SizedBox.shrink(
                                key: ValueKey('empty'),
                              ),
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Action Button
                      _buildActionButton(),
                      
                      // Extra padding for floating navigation
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 16, 12, 16),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
      decoration: const BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.all(Radius.circular(20)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.qr_code_scanner,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Quét bảo mật',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Kiểm tra tính an toàn của liên kết và QR code',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Stats Row
          Row(
            children: [
              Expanded(child: _buildStatChip('24 lần quét', Icons.qr_code_scanner)),
              const SizedBox(width: 8),
              Expanded(child: _buildStatChip('3 mối đe dọa', Icons.warning)),
              const SizedBox(width: 8),
              Expanded(child: _buildStatChip('21 an toàn', Icons.verified)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip(String text, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: Colors.white, size: 14),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              text,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScanTypeCard(ScanType scanType, int index) {
    final isSelected = _selectedScanType == index;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedScanType = index;
        });
        HapticFeedback.lightImpact();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        decoration: BoxDecoration(
          gradient: isSelected 
              ? LinearGradient(
                  colors: [
                    scanType.color.withOpacity(0.15),
                    scanType.color.withOpacity(0.05),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : LinearGradient(
                  colors: [
                    Colors.white,
                    Colors.grey.withOpacity(0.02),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected 
                ? scanType.color.withOpacity(0.3)
                : Colors.grey.withOpacity(0.15),
            width: isSelected ? 2 : 0.5,
          ),
          boxShadow: [
            BoxShadow(
              color: isSelected 
                  ? scanType.color.withOpacity(0.2)
                  : Colors.black.withOpacity(0.04),
              blurRadius: isSelected ? 12 : 6,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isSelected 
                        ? [scanType.color, scanType.color.withOpacity(0.7)]
                        : [scanType.color.withOpacity(0.15), scanType.color.withOpacity(0.08)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: scanType.color.withOpacity(isSelected ? 0.3 : 0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Icon(
                  scanType.icon,
                  color: isSelected ? Colors.white : scanType.color,
                  size: 22,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                scanType.title,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? scanType.color : const Color(0xFF1E293B),
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                scanType.subtitle,
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.grey[600],
                  height: 1.2,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildManualInputSection() {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(horizontal: 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _scanTypes[3].color.withOpacity(0.2),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: _scanTypes[3].color.withOpacity(0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: _scanTypes[3].color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.edit,
                  size: 16,
                  color: _scanTypes[3].color,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'Nhập liên kết hoặc số điện thoại',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _textController,
            decoration: InputDecoration(
              hintText: 'Nhập URL hoặc số điện thoại...',
              hintStyle: TextStyle(
                fontSize: 14,
                color: Colors.grey[500],
              ),
              prefixIcon: Icon(
                Icons.link,
                size: 20,
                color: _scanTypes[3].color,
              ),
              filled: true,
              fillColor: Colors.grey[50],
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: _scanTypes[3].color,
                  width: 2,
                ),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
            ),
            style: const TextStyle(fontSize: 14),
            maxLines: 3,
            minLines: 1,
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton() {
    return Container(
      width: double.infinity,
      height: 52,
      margin: const EdgeInsets.symmetric(horizontal: 0),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            _scanTypes[_selectedScanType].color,
            _scanTypes[_selectedScanType].color.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: _scanTypes[_selectedScanType].color.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: () => _handleScanAction(),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.white,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(_scanTypes[_selectedScanType].icon, size: 20),
            const SizedBox(width: 8),
            Text(
              _getActionButtonText(),
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getActionButtonText() {
    switch (_selectedScanType) {
      case 0:
        return 'Bắt đầu quét QR';
      case 1:
        return 'Chụp ảnh';
      case 2:
        return 'Chọn từ thư viện';
      case 3:
        return 'Kiểm tra';
      default:
        return 'Bắt đầu';
    }
  }

  void _handleScanAction() async {
    HapticFeedback.mediumImpact();
    
    try {
      switch (_selectedScanType) {
        case 0:
          await _startQRScan();
          break;
        case 1:
          await _takePhoto();
          break;
        case 2:
          await _pickFromGallery();
          break;
        case 3:
          await _checkManualInput();
          break;
      }
    } catch (e) {
      _showErrorDialog('Lỗi', 'Đã xảy ra lỗi: $e');
    }
  }

  Future<void> _startQRScan() async {
    // Navigate to QR scanner page
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('QR Scanner'),
        content: const Text('Chức năng quét QR sẽ được triển khai.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  Future<void> _takePhoto() async {
    final ImagePicker picker = ImagePicker();
    final XFile? photo = await picker.pickImage(source: ImageSource.camera);
    
    if (photo != null) {
      _showScanResult('Đã chụp ảnh thành công', 'Đang phân tích ảnh...');
    }
  }

  Future<void> _pickFromGallery() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    
    if (image != null) {
      _showScanResult('Đã chọn ảnh thành công', 'Đang phân tích ảnh...');
    }
  }

  Future<void> _checkManualInput() async {
    if (_textController.text.trim().isEmpty) {
      _showErrorDialog('Lỗi', 'Vui lòng nhập liên kết hoặc số điện thoại.');
      return;
    }
    
    _showScanResult('Đang kiểm tra...', _textController.text.trim());
  }

  void _showScanResult(String title, String content) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(content),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }
}

// Models
class ScanType {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;

  ScanType({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
  });
}
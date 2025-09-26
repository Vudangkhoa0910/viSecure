import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_theme.dart';

class StorePage extends StatefulWidget {
  const StorePage({super.key});

  @override
  State<StorePage> createState() => _StorePageState();
}

class _StorePageState extends State<StorePage>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  
  int _selectedCategory = 0;
  final List<SecureItem> _secureItems = [
    SecureItem(
      id: '1',
      title: 'Thông tin ngân hàng',
      subtitle: 'Thẻ tín dụng Techcombank',
      category: SecureItemCategory.banking,
      lastAccessed: DateTime.now().subtract(const Duration(days: 2)),
    ),
    SecureItem(
      id: '2',
      title: 'Mật khẩu Email',
      subtitle: 'user@gmail.com',
      category: SecureItemCategory.password,
      lastAccessed: DateTime.now().subtract(const Duration(hours: 5)),
    ),
    SecureItem(
      id: '3',
      title: 'CMND/CCCD',
      subtitle: '123456789012',
      category: SecureItemCategory.identity,
      lastAccessed: DateTime.now().subtract(const Duration(days: 7)),
    ),
    SecureItem(
      id: '4',
      title: 'Ghi chú bảo mật',
      subtitle: 'Thông tin quan trọng',
      category: SecureItemCategory.note,
      lastAccessed: DateTime.now().subtract(const Duration(days: 1)),
    ),
  ];

  final List<SecureCategory> _categories = [
    SecureCategory(
      type: SecureItemCategory.all,
      name: 'Tất cả',
      icon: Icons.all_inclusive,
      color: const Color(0xFF6B7280),
    ),
    SecureCategory(
      type: SecureItemCategory.password,
      name: 'Mật khẩu',
      icon: Icons.password,
      color: const Color(0xFF3B82F6),
    ),
    SecureCategory(
      type: SecureItemCategory.banking,
      name: 'Ngân hàng',
      icon: Icons.credit_card,
      color: const Color(0xFF10B981),
    ),
    SecureCategory(
      type: SecureItemCategory.identity,
      name: 'Giấy tờ',
      icon: Icons.badge,
      color: const Color(0xFFF59E0B),
    ),
    SecureCategory(
      type: SecureItemCategory.note,
      name: 'Ghi chú',
      icon: Icons.note,
      color: const Color(0xFF8B5CF6),
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
              
              // Categories
              _buildCategories(),
              
              // Items List
              Expanded(
                child: _buildItemsList(),
              ),
              
              // Bottom padding for floating navigation
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
      floatingActionButton: Container(
        margin: const EdgeInsets.only(bottom: 80), // Đẩy lên cao hơn bottom navigation
        child: FloatingActionButton(
          onPressed: _addNewItem,
          backgroundColor: AppColors.accent,
          child: const Icon(Icons.add, color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 16, 12, 16),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
      decoration: const BoxDecoration(
        gradient: AppColors.cardGradient,
        borderRadius: BorderRadius.all(Radius.circular(20)),
      ),
      child: Column(
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
                  Icons.security,
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
                      'Kho bảo mật',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Lưu trữ thông tin cá nhân an toàn',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: _showSecurityInfo,
                icon: const Icon(
                  Icons.info_outline,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Storage Stats
          Row(
            children: [
              Flexible(
                child: _buildStatChip('${_secureItems.length} mục', Icons.inventory),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: _buildStatChip('AES-256', Icons.lock),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: _buildStatChip('Sinh trắc học', Icons.fingerprint),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip(String text, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
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
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategories() {
    return Container(
      height: 70,
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final category = _categories[index];
          final isSelected = _selectedCategory == index;
          
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedCategory = index;
              });
              HapticFeedback.lightImpact();
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.only(right: 10),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                gradient: isSelected 
                    ? LinearGradient(
                        colors: [category.color, category.color.withOpacity(0.8)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : LinearGradient(
                        colors: [Colors.white, Colors.grey.withOpacity(0.02)],
                      ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected 
                      ? category.color.withOpacity(0.3) 
                      : Colors.grey.withOpacity(0.15),
                  width: isSelected ? 1.5 : 0.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: isSelected 
                        ? category.color.withOpacity(0.25)
                        : Colors.black.withOpacity(0.04),
                    blurRadius: isSelected ? 10 : 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    category.icon,
                    size: 16,
                    color: isSelected ? Colors.white : category.color,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    category.name,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? Colors.white : category.color,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildItemsList() {
    final filteredItems = _getFilteredItems();
    
    if (filteredItems.isEmpty) {
      return _buildEmptyState();
    }
    
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: filteredItems.length,
      itemBuilder: (context, index) {
        return _buildItemCard(filteredItems[index]);
      },
    );
  }

  Widget _buildItemCard(SecureItem item) {
    final category = _categories.firstWhere(
      (cat) => cat.type == item.category,
      orElse: () => _categories[0],
    );
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.all(16),
          leading: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: category.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              category.icon,
              color: category.color,
              size: 24,
            ),
          ),
          title: Text(
            item.title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1E293B),
            ),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 4),
              Text(
                item.subtitle,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Truy cập: ${_formatLastAccessed(item.lastAccessed)}',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[500],
                ),
              ),
            ],
          ),
          trailing: PopupMenuButton<String>(
            onSelected: (value) => _handleItemAction(item, value),
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'view',
                child: ListTile(
                  leading: Icon(Icons.visibility),
                  title: Text('Xem'),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const PopupMenuItem(
                value: 'edit',
                child: ListTile(
                  leading: Icon(Icons.edit),
                  title: Text('Chỉnh sửa'),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const PopupMenuItem(
                value: 'delete',
                child: ListTile(
                  leading: Icon(Icons.delete, color: Colors.red),
                  title: Text('Xóa', style: TextStyle(color: Colors.red)),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
          onTap: () => _viewItem(item),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.security,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Chưa có dữ liệu bảo mật',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Thêm thông tin cá nhân để lưu trữ an toàn',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _addNewItem,
            icon: const Icon(Icons.add),
            label: const Text('Thêm mục mới'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF9800),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<SecureItem> _getFilteredItems() {
    if (_selectedCategory == 0) {
      return _secureItems;
    }
    
    final selectedCategory = _categories[_selectedCategory].type;
    return _secureItems.where((item) => item.category == selectedCategory).toList();
  }

  String _formatLastAccessed(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} ngày trước';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} giờ trước';
    } else {
      return '${difference.inMinutes} phút trước';
    }
  }

  void _addNewItem() {
    // Show add new item dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Thêm mục mới'),
        content: const Text('Chức năng thêm mục bảo mật sẽ được triển khai.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  void _viewItem(SecureItem item) {
    // Require biometric authentication
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(item.title),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Loại: ${_getCategoryName(item.category)}'),
            const SizedBox(height: 8),
            Text('Nội dung: ${item.subtitle}'),
            const SizedBox(height: 8),
            Text('Cập nhật: ${_formatLastAccessed(item.lastAccessed)}'),
            const SizedBox(height: 16),
            const Text(
              '🔒 Cần xác thực sinh trắc học để xem chi tiết',
              style: TextStyle(
                fontSize: 12,
                color: Colors.orange,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(context);
              // Implement biometric authentication
            },
            icon: const Icon(Icons.fingerprint),
            label: const Text('Xác thực'),
          ),
        ],
      ),
    );
  }

  void _handleItemAction(SecureItem item, String action) {
    switch (action) {
      case 'view':
        _viewItem(item);
        break;
      case 'edit':
        _editItem(item);
        break;
      case 'delete':
        _deleteItem(item);
        break;
    }
  }

  void _editItem(SecureItem item) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Chỉnh sửa'),
        content: const Text('Chức năng chỉnh sửa sẽ được triển khai.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  void _deleteItem(SecureItem item) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa mục'),
        content: Text('Bạn có chắc chắn muốn xóa "${item.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _secureItems.removeWhere((i) => i.id == item.id);
              });
              Navigator.pop(context);
              HapticFeedback.mediumImpact();
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Xóa', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showSecurityInfo() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Bảo mật kho lưu trữ'),
        content: const Text(
          'Thông tin được bảo vệ bằng:\n\n'
          '• Mã hóa AES-256\n'
          '• Xác thực sinh trắc học\n'
          '• Lưu trữ cục bộ an toàn\n'
          '• Không đồng bộ với cloud\n'
          '• Tự động khóa sau 15 phút',
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

  String _getCategoryName(SecureItemCategory category) {
    return _categories.firstWhere((cat) => cat.type == category).name;
  }
}

// Models
class SecureItem {
  final String id;
  final String title;
  final String subtitle;
  final SecureItemCategory category;
  final DateTime lastAccessed;

  SecureItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.category,
    required this.lastAccessed,
  });
}

class SecureCategory {
  final SecureItemCategory type;
  final String name;
  final IconData icon;
  final Color color;

  SecureCategory({
    required this.type,
    required this.name,
    required this.icon,
    required this.color,
  });
}

enum SecureItemCategory {
  all,
  password,
  banking,
  identity,
  note,
}
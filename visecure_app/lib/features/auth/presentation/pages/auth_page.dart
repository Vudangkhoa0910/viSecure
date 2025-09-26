import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../shared/services/auth_service.dart';

class AuthPage extends StatefulWidget {
  const AuthPage({super.key});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  final TextEditingController _passwordController = TextEditingController();
  bool _isObscure = true;
  bool _isLoading = false;
  bool _isRegistering = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // App Logo and Title
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.security,
                  size: 64,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 24),
              
              Text(
                AppConstants.appName,
                style: AppTextStyles.headline1,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              
              Text(
                AppConstants.appSlogan,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              
              // Authentication Form
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        _isRegistering ? 'Tạo mật khẩu' : 'Nhập mật khẩu',
                        style: AppTextStyles.headline3,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      
                      // Password Field
                      TextFormField(
                        controller: _passwordController,
                        obscureText: _isObscure,
                        decoration: InputDecoration(
                          labelText: 'Mật khẩu',
                          prefixIcon: const Icon(Icons.lock),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _isObscure ? Icons.visibility : Icons.visibility_off,
                            ),
                            onPressed: () {
                              setState(() {
                                _isObscure = !_isObscure;
                              });
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      // Action Button
                      ElevatedButton(
                        onPressed: _isLoading ? null : _handleAuthentication,
                        child: _isLoading
                            ? const CircularProgressIndicator()
                            : Text(_isRegistering ? 'Tạo tài khoản' : 'Đăng nhập'),
                      ),
                      const SizedBox(height: 16),
                      
                      // Biometric Authentication Button
                      Consumer<AuthService>(
                        builder: (context, authService, child) {
                          if (!authService.isBiometricAvailable || _isRegistering) {
                            return const SizedBox.shrink();
                          }
                          
                          return OutlinedButton.icon(
                            onPressed: _isLoading ? null : _handleBiometricAuth,
                            icon: const Icon(Icons.fingerprint),
                            label: const Text('Xác thực sinh trắc học'),
                          );
                        },
                      ),
                      
                      // Toggle between login and register
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _isRegistering = !_isRegistering;
                            _passwordController.clear();
                          });
                        },
                        child: Text(
                          _isRegistering
                              ? 'Đã có tài khoản? Đăng nhập'
                              : 'Tạo tài khoản mới',
                        ),
                      ),
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

  Future<void> _handleAuthentication() async {
    if (_passwordController.text.isEmpty) {
      _showSnackBar('Vui lòng nhập mật khẩu');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final authService = Provider.of<AuthService>(context, listen: false);
    bool success = false;

    try {
      if (_isRegistering) {
        success = await authService.registerWithPassword(_passwordController.text);
        if (success) {
          _showSnackBar('Tạo tài khoản thành công!');
        } else {
          _showSnackBar('Lỗi tạo tài khoản');
        }
      } else {
        success = await authService.authenticateWithPassword(_passwordController.text);
        if (!success) {
          _showSnackBar('Mật khẩu không chính xác');
        }
      }
    } catch (e) {
      _showSnackBar('Có lỗi xảy ra: $e');
    }

    setState(() {
      _isLoading = false;
    });

    if (!success) {
      _passwordController.clear();
    }
  }

  Future<void> _handleBiometricAuth() async {
    setState(() {
      _isLoading = true;
    });

    final authService = Provider.of<AuthService>(context, listen: false);

    try {
      final success = await authService.authenticateWithBiometric();
      if (!success) {
        _showSnackBar('Xác thực sinh trắc học thất bại');
      }
    } catch (e) {
      _showSnackBar('Có lỗi xảy ra: $e');
    }

    setState(() {
      _isLoading = false;
    });
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  void initState() {
    super.initState();
    _checkIfUserExists();
  }

  Future<void> _checkIfUserExists() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    final hasUser = await authService.hasRegisteredUser();
    setState(() {
      _isRegistering = !hasUser;
    });
  }

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }
}
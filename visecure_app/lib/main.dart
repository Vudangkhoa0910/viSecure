import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';


// Core imports
import 'core/theme/app_theme.dart';
import 'core/constants/app_constants.dart';
import 'core/services/storage_service.dart';
import 'core/services/biometric_service.dart';
import 'core/services/permission_service.dart';

// Feature imports
import 'features/auth/presentation/blocs/auth_bloc.dart';
import 'features/auth/presentation/pages/auth_page.dart';
import 'features/home/presentation/pages/home_page.dart';
import 'features/scan/presentation/pages/scan_page.dart';
import 'features/ai_assistant/presentation/pages/ai_assistant_page.dart';
import 'features/store/presentation/pages/store_page.dart';
import 'features/settings/presentation/pages/settings_page.dart';

// Shared imports
import 'shared/widgets/bottom_navigation_widget.dart';
import 'shared/widgets/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  
  // Initialize secure storage
  await StorageService.instance.initialize();
  
  // Initialize biometric authentication
  await BiometricService.instance.initialize();
  
  // Request necessary permissions
  await PermissionService.instance.requestPermissions();
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  
  runApp(const ViSecureApp());
}

class ViSecureApp extends StatelessWidget {
  const ViSecureApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Global providers
        ChangeNotifierProvider(create: (_) => ThemeNotifier()),
        ChangeNotifierProvider(create: (_) => LocalizationNotifier()),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc()..add(AuthInitializeEvent()),
          ),
        ],
        child: Consumer<ThemeNotifier>(
          builder: (context, themeNotifier, child) {
            return MaterialApp(
              title: AppConstants.appName,
              debugShowCheckedModeBanner: false,
              
              // Theme configuration
              theme: AppTheme.lightTheme,
              darkTheme: AppTheme.darkTheme,
              themeMode: themeNotifier.themeMode,
              
              // Localization
              supportedLocales: const [
                Locale('vi', 'VN'), // Vietnamese
                Locale('en', 'US'), // English
              ],
              
              // Initial route
              initialRoute: '/',
              
              // Route configuration
              routes: {
                '/': (context) => const SplashScreen(),
                '/auth': (context) => const AuthPage(),
                '/main': (context) => const MainNavigationPage(),
                '/home': (context) => const HomePage(),
                '/scan': (context) => const ScanPage(),
                '/ai-assistant': (context) => const AIAssistantPage(),
                '/store': (context) => const StorePage(),
                '/settings': (context) => const SettingsPage(),
              },
              
              // Error handling
              builder: (context, child) {
                return MediaQuery(
                  data: MediaQuery.of(context).copyWith(
                    textScaler: TextScaler.linear(1.0), // Prevent text scaling
                  ),
                  child: child!,
                );
              },
            );
          },
        ),
      ),
    );
  }
}

class MainNavigationPage extends StatefulWidget {
  const MainNavigationPage({super.key});

  @override
  State<MainNavigationPage> createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends State<MainNavigationPage>
    with TickerProviderStateMixin {
  int _currentIndex = 0;
  late PageController _pageController;
  late AnimationController _animationController;

  final List<Widget> _pages = [
    const HomePage(),
    const ScanPage(),
    const AIAssistantPage(),
    const StorePage(),
    const SettingsPage(),
  ];



  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _onTabTapped(int index) {
    if (_currentIndex != index) {
      // Fast state update
      setState(() {
        _currentIndex = index;
      });
      
      // Instant page switch for better performance
      _pageController.jumpToPage(index);
      
      // Haptic feedback
      HapticFeedback.selectionClick();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          PageView(
            controller: _pageController,
            physics: const NeverScrollableScrollPhysics(), // Disable swipe for faster switching
            onPageChanged: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            children: _pages,
          ),
          BottomNavigationWidget(
            currentIndex: _currentIndex,
            onTap: _onTabTapped,
          ),
        ],
      ),
    );
  }
}

// Theme Notifier for dynamic theme switching
class ThemeNotifier extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;
  
  ThemeMode get themeMode => _themeMode;
  
  void setThemeMode(ThemeMode themeMode) {
    _themeMode = themeMode;
    notifyListeners();
  }
  
  void toggleTheme() {
    _themeMode = _themeMode == ThemeMode.light 
        ? ThemeMode.dark 
        : ThemeMode.light;
    notifyListeners();
  }
}

// Localization Notifier for language switching
class LocalizationNotifier extends ChangeNotifier {
  Locale _locale = const Locale('vi', 'VN');
  
  Locale get locale => _locale;
  
  void setLocale(Locale locale) {
    _locale = locale;
    notifyListeners();
  }
}

// Navigation Item Model
class NavigationItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final Color color;

  NavigationItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.color,
  });
}

// App Colors (will be moved to theme file)
class AppColors {
  static const Color primary = Color(0xFF2196F3);
  static const Color scan = Color(0xFF4CAF50);
  static const Color aiAssistant = Color(0xFF9C27B0);
  static const Color store = Color(0xFFFF9800);
  static const Color settings = Color(0xFF607D8B);
  
  static const Color background = Color(0xFFF5F5F5);
  static const Color surface = Colors.white;
  static const Color error = Color(0xFFE53935);
  static const Color success = Color(0xFF43A047);
  static const Color warning = Color(0xFFFF8F00);
  static const Color info = Color(0xFF1976D2);
  
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textDisabled = Color(0xFFBDBDBD);
}
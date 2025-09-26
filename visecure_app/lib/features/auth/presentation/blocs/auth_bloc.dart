import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

// Events
abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object> get props => [];
}

class AuthInitializeEvent extends AuthEvent {}

class AuthLoginEvent extends AuthEvent {
  final String username;
  final String password;
  final bool useBiometric;

  const AuthLoginEvent({
    required this.username,
    required this.password,
    this.useBiometric = false,
  });

  @override
  List<Object> get props => [username, password, useBiometric];
}

class AuthBiometricLoginEvent extends AuthEvent {}

class AuthLogoutEvent extends AuthEvent {}

class AuthRegisterEvent extends AuthEvent {
  final String username;
  final String password;
  final String confirmPassword;

  const AuthRegisterEvent({
    required this.username,
    required this.password,
    required this.confirmPassword,
  });

  @override
  List<Object> get props => [username, password, confirmPassword];
}

// States
abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object> get props => [];
}

class AuthInitialState extends AuthState {}

class AuthLoadingState extends AuthState {}

class AuthAuthenticatedState extends AuthState {
  final User user;

  const AuthAuthenticatedState(this.user);

  @override
  List<Object> get props => [user];
}

class AuthUnauthenticatedState extends AuthState {}

class AuthErrorState extends AuthState {
  final String message;

  const AuthErrorState(this.message);

  @override
  List<Object> get props => [message];
}

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitialState()) {
    on<AuthInitializeEvent>(_onInitialize);
    on<AuthLoginEvent>(_onLogin);
    on<AuthBiometricLoginEvent>(_onBiometricLogin);
    on<AuthLogoutEvent>(_onLogout);
    on<AuthRegisterEvent>(_onRegister);
  }

  void _onInitialize(AuthInitializeEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoadingState());
    
    try {
      // Check if user is already logged in
      await Future.delayed(const Duration(seconds: 1)); // Simulate loading
      
      // For now, assume user is not logged in
      emit(AuthUnauthenticatedState());
    } catch (e) {
      emit(AuthErrorState('Initialization failed: $e'));
    }
  }

  void _onLogin(AuthLoginEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoadingState());
    
    try {
      // Simulate login process
      await Future.delayed(const Duration(seconds: 2));
      
      // Simple validation
      if (event.username.isEmpty || event.password.isEmpty) {
        emit(const AuthErrorState('Username and password are required'));
        return;
      }
      
      // Create mock user
      final user = User(
        id: '1',
        username: event.username,
        email: '${event.username}@example.com',
      );
      
      emit(AuthAuthenticatedState(user));
    } catch (e) {
      emit(AuthErrorState('Login failed: $e'));
    }
  }

  void _onBiometricLogin(AuthBiometricLoginEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoadingState());
    
    try {
      // Simulate biometric authentication
      await Future.delayed(const Duration(seconds: 1));
      
      // Create mock user for biometric login
      final user = User(
        id: '1',
        username: 'biometric_user',
        email: 'user@example.com',
      );
      
      emit(AuthAuthenticatedState(user));
    } catch (e) {
      emit(AuthErrorState('Biometric login failed: $e'));
    }
  }

  void _onLogout(AuthLogoutEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoadingState());
    
    try {
      // Simulate logout process
      await Future.delayed(const Duration(milliseconds: 500));
      
      emit(AuthUnauthenticatedState());
    } catch (e) {
      emit(AuthErrorState('Logout failed: $e'));
    }
  }

  void _onRegister(AuthRegisterEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoadingState());
    
    try {
      // Simulate registration process
      await Future.delayed(const Duration(seconds: 2));
      
      // Simple validation
      if (event.username.isEmpty || event.password.isEmpty) {
        emit(const AuthErrorState('Username and password are required'));
        return;
      }
      
      if (event.password != event.confirmPassword) {
        emit(const AuthErrorState('Passwords do not match'));
        return;
      }
      
      // Create new user
      final user = User(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        username: event.username,
        email: '${event.username}@example.com',
      );
      
      emit(AuthAuthenticatedState(user));
    } catch (e) {
      emit(AuthErrorState('Registration failed: $e'));
    }
  }
}

// User Model
class User extends Equatable {
  final String id;
  final String username;
  final String email;
  final String? fullName;
  final String? avatarUrl;
  final DateTime? createdAt;

  const User({
    required this.id,
    required this.username,
    required this.email,
    this.fullName,
    this.avatarUrl,
    this.createdAt,
  });

  @override
  List<Object?> get props => [id, username, email, fullName, avatarUrl, createdAt];

  User copyWith({
    String? id,
    String? username,
    String? email,
    String? fullName,
    String? avatarUrl,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'fullName': fullName,
      'avatarUrl': avatarUrl,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      fullName: json['fullName'],
      avatarUrl: json['avatarUrl'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }
}
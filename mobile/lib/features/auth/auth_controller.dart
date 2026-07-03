import 'dart:async';

import 'package:flutter/foundation.dart';

import '../../core/storage/token_storage.dart';
import 'auth_repository.dart';
import 'data/user_profile.dart';

enum AuthStatus { loading, unauthenticated, authenticated }

class AuthController extends ChangeNotifier {
  AuthController(this._repository, this._tokenStorage) {
    unawaited(bootstrap());
  }

  final AuthRepository _repository;
  final TokenStorage _tokenStorage;

  AuthStatus status = AuthStatus.loading;
  UserProfile? user;
  String? errorMessage;

  bool get isAuthenticated => status == AuthStatus.authenticated && user != null;
  bool get isBusy => status == AuthStatus.loading;

  Future<void> bootstrap() async {
    status = AuthStatus.loading;
    notifyListeners();

    final token = await _tokenStorage.readToken();
    if (token == null || token.isEmpty) {
      status = AuthStatus.unauthenticated;
      notifyListeners();
      return;
    }

    try {
      user = await _repository.me();
      status = AuthStatus.authenticated;
    } catch (_) {
      await logout();
    }
    notifyListeners();
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    errorMessage = null;
    status = AuthStatus.loading;
    notifyListeners();

    try {
      final session = await _repository.login(email: email, password: password);
      await _tokenStorage.writeToken(session.token);
      user = await _repository.me();
      status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } catch (error) {
      await _tokenStorage.clearToken();
      user = null;
      errorMessage = _friendlyMessage(error);
      status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required int batch,
    required String accountType,
  }) async {
    errorMessage = null;
    status = AuthStatus.loading;
    notifyListeners();

    try {
      final session = await _repository.register(
        name: name,
        email: email,
        password: password,
        batch: batch,
        accountType: accountType,
      );
      await _tokenStorage.writeToken(session.token);
      user = await _repository.me();
      status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } catch (error) {
      await _tokenStorage.clearToken();
      user = null;
      errorMessage = _friendlyMessage(error);
      status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  void replaceUser(UserProfile updatedUser) {
    user = updatedUser;
    notifyListeners();
  }

  Future<void> logout() async {
    await _tokenStorage.clearToken();
    user = null;
    errorMessage = null;
    status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  String _friendlyMessage(Object error) {
    final text = error.toString();
    if (text.contains('401')) return 'Invalid credentials.';
    if (text.contains('400')) return 'Please check the submitted details.';
    if (text.contains('403')) return 'Your account is not allowed to access this screen.';
    if (text.contains('SocketException') || text.contains('DioException')) {
      return 'Cannot reach the backend. Check the API URL and network.';
    }
    return 'Something went wrong.';
  }
}

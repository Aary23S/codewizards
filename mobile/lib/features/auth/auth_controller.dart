import 'dart:async';

import 'package:flutter/foundation.dart';

import '../../core/config/app_config.dart';
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
    required String programName,
    required int programDurationYears,
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
        programName: programName,
        programDurationYears: programDurationYears,
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
    // Best-effort — invalidates this user's token server-side, but local logout
    // must succeed even if the request fails (e.g. offline, or token already expired).
    try {
      await _repository.logout();
    } catch (_) {}
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
      if (AppConfig.apiBaseUrl.contains('10.0.2.2') || AppConfig.apiBaseUrl.contains('localhost')) {
        return 'This APK is still pointed at a local emulator API host. Rebuild with a reachable backend URL using CODEWIZARDS_API_BASE_URL.';
      }
      return 'Cannot reach the backend. Check the API URL and network.';
    }
    return 'Something went wrong.';
  }
}

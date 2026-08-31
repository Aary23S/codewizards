import '../../core/network/api_client.dart';
import 'data/auth_session.dart';
import 'data/user_profile.dart';

class AuthRepository {
  AuthRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final data = await _apiClient.postData(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
    );
    return _parseSession(data);
  }

  Future<AuthSession> register({
    required String name,
    required String email,
    required String password,
    required int batch,
    required String programName,
    required int programDurationYears,
  }) async {
    final data = await _apiClient.postData(
      '/auth/register',
      data: {
        'name': name,
        'email': email,
        'password': password,
        'batch': batch,
        'programName': programName,
        'programDurationYears': programDurationYears,
      },
    );
    return _parseSession(data);
  }

  Future<UserProfile> me() async {
    final data = await _apiClient.getData('/auth/me');
    return UserProfile.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<void> logout() async {
    await _apiClient.postData('/auth/logout');
  }

  Future<void> forgotPassword(String email) async {
    await _apiClient.postData('/auth/forgot-password', data: {'email': email});
  }

  AuthSession _parseSession(dynamic data) {
    final map = Map<String, dynamic>.from(data as Map);
    final token = map['token']?.toString() ?? '';
    return AuthSession(
      user: UserProfile.fromJson(Map<String, dynamic>.from(map)),
      token: token,
    );
  }
}

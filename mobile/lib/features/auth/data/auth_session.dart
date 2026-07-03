import 'user_profile.dart';

class AuthSession {
  AuthSession({
    required this.user,
    required this.token,
  });

  final UserProfile user;
  final String token;
}

class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'CODEWIZARDS_API_BASE_URL',
    defaultValue: 'https://codewizards-mu2a.onrender.com/api/v1',
  );
}

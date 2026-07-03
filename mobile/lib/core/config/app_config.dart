class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'CODEWIZARDS_API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5000/api/v1',
  );
}

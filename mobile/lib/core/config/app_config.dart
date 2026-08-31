import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kDebugMode;

class AppConfig {
  static const String _override = String.fromEnvironment(
    'CODEWIZARDS_API_BASE_URL',
  );

  static const String _prodApiBaseUrl =
      'https://codewizards-mu2a.onrender.com/api/v1';

  // Mirrors the web client's localhost-vs-production auto-switch: mobile has no
  // hostname to sniff, so it uses the debug/release build mode instead. An
  // explicit --dart-define always wins, so CI/release builds are unaffected.
  static String get apiBaseUrl {
    if (_override.isNotEmpty) return _override;
    if (kDebugMode) {
      return Platform.isAndroid
          ? 'http://10.0.2.2:5000/api/v1'
          : 'http://localhost:5000/api/v1';
    }
    return _prodApiBaseUrl;
  }
}

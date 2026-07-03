import 'package:flutter/material.dart';

ThemeData buildAppTheme() {
  const background = Color(0xFF050505);
  const surface = Color(0xFF121212);
  const border = Color(0x1AFFFFFF);
  const textPrimary = Color(0xFFF8FAFC);
  const textSecondary = Color(0x99FFFFFF);
  const accent = Color(0xFFF5B14C);

  final colorScheme = ColorScheme.fromSeed(
    seedColor: accent,
    brightness: Brightness.dark,
    surface: surface,
  ).copyWith(
    primary: accent,
    secondary: const Color(0xFF5CC8FF),
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: background,
    appBarTheme: const AppBarTheme(
      backgroundColor: background,
      foregroundColor: textPrimary,
      elevation: 0,
      centerTitle: false,
    ),
    cardTheme: CardThemeData(
      color: surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: border),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFF151515),
      hintStyle: const TextStyle(color: textSecondary),
      labelStyle: const TextStyle(color: textSecondary),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: const BorderSide(color: border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: const BorderSide(color: border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: const BorderSide(color: accent, width: 1.2),
      ),
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(color: textPrimary, fontWeight: FontWeight.w700),
      headlineMedium: TextStyle(color: textPrimary, fontWeight: FontWeight.w700),
      titleLarge: TextStyle(color: textPrimary, fontWeight: FontWeight.w600),
      titleMedium: TextStyle(color: textPrimary, fontWeight: FontWeight.w600),
      bodyLarge: TextStyle(color: textPrimary),
      bodyMedium: TextStyle(color: textSecondary),
      bodySmall: TextStyle(color: textSecondary),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: textPrimary,
        side: const BorderSide(color: border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: const Color(0xFF0B0B0B),
      indicatorColor: Colors.white,
      labelTextStyle: WidgetStateProperty.all(
        const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
      ),
    ),
  );
}

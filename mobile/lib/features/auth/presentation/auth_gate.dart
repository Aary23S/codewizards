import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../auth_controller.dart';
import '../../shell/app_shell.dart';
import 'login_screen.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();

    switch (auth.status) {
      case AuthStatus.loading:
        return const _SplashScreen();
      case AuthStatus.unauthenticated:
        return const LoginScreen();
      case AuthStatus.authenticated:
        return const AppShell();
    }
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 68,
              width: 68,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                gradient: const LinearGradient(
                  colors: [Color(0xFFF5B14C), Color(0xFF5CC8FF)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              alignment: Alignment.center,
              child: const Icon(Icons.auto_awesome, color: Colors.black, size: 34),
            ),
            const SizedBox(height: 18),
            Text('CodeWizards', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            const SizedBox(
              height: 24,
              width: 24,
              child: CircularProgressIndicator(strokeWidth: 2.5),
            ),
          ],
        ),
      ),
    );
  }
}

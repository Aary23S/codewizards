import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../auth_controller.dart';
import '../../shell/app_shell.dart';
import '../../admin/presentation/admin_panel_screen.dart';
import 'login_screen.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  AuthController? _authController;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final auth = Provider.of<AuthController>(context);
    if (_authController != auth) {
      _authController?.removeListener(_onAuthChanged);
      _authController = auth;
      _authController?.addListener(_onAuthChanged);
    }
  }

  @override
  void dispose() {
    _authController?.removeListener(_onAuthChanged);
    super.dispose();
  }

  void _onAuthChanged() {
    if (_authController?.status == AuthStatus.unauthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        Navigator.of(context, rootNavigator: true).popUntil((route) => route.isFirst);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();

    switch (auth.status) {
      case AuthStatus.loading:
        return const _SplashScreen();
      case AuthStatus.unauthenticated:
        return const LoginScreen();
      case AuthStatus.authenticated:
        if (auth.user?.role == 'admin') {
          return AdminBootstrapGate(child: const AppShell());
        }
        return const AppShell();
    }
  }
}

class AdminBootstrapGate extends StatefulWidget {
  const AdminBootstrapGate({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  State<AdminBootstrapGate> createState() => _AdminBootstrapGateState();
}

class _AdminBootstrapGateState extends State<AdminBootstrapGate> {
  bool _openedPanel = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_openedPanel) return;
    _openedPanel = true;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const AdminPanelScreen()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
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
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.asset(
                'assets/logo.jpeg',
                height: 68,
                width: 68,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 18),
            Text('Code Wizards', style: Theme.of(context).textTheme.titleLarge),
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

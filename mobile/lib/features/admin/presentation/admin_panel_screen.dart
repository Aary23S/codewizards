import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../auth/auth_controller.dart';
import '../data/admin_repository.dart';

class AdminPanelScreen extends StatefulWidget {
  const AdminPanelScreen({super.key});

  @override
  State<AdminPanelScreen> createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> {
  Future<AdminOverview>? _future;
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= context.read<AdminRepository>().fetchOverview();
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = context.read<AdminRepository>().fetchOverview();
    });

    try {
      await _future;
    } catch (error) {
      if (!mounted) return;
      setState(() => _errorMessage = _friendlyError(error));
    }
  }

  Future<void> _logout() async {
    await context.read<AuthController>().logout();
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthController>().user;

    if (user == null) {
      return const SizedBox.shrink();
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Control Panel'),
        actions: [
          TextButton.icon(
            onPressed: _logout,
            icon: const Icon(Icons.logout_rounded, size: 18),
            label: const Text('Logout'),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: FutureBuilder<AdminOverview>(
            future: _future,
            builder: (context, snapshot) {
              final loading = snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData;

              if (snapshot.hasError || _errorMessage != null) {
                return ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  children: [
                    _ErrorPanel(
                      message: _errorMessage ?? _friendlyError(snapshot.error),
                      onRetry: _refresh,
                    ),
                  ],
                );
              }

              final overview = snapshot.data;

              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: [
                  _HeroPanel(userName: user.name, role: user.role),
                  const SizedBox(height: 16),
                  _SectionHeader(
                    eyebrow: 'Admin',
                    title: 'Manage the club from one console.',
                    description: 'This control panel mirrors the web hierarchy while staying mobile-first and compact.',
                  ),
                  const SizedBox(height: 16),
                  if (loading)
                    const _LoadingPanel()
                  else if (overview == null)
                    const _EmptyPanel(message: 'No admin metrics available.')
                  else
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 1.55,
                      children: [
                        for (final metric in overview.metrics)
                          _MetricCard(label: metric.label, value: metric.value),
                      ],
                    ),
                  const SizedBox(height: 16),
                  _ShortcutBlock(
                    onUsersTap: () => _showHint(context, 'User management is available from the web admin console and can be surfaced here next.'),
                    onContentTap: () => _showHint(context, 'Content controls are wired to the shared backend resources.'),
                    onExploreTap: () => _showHint(context, 'Explore sections remain available in the main app shell.'),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  void _showHint(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}

class _HeroPanel extends StatelessWidget {
  const _HeroPanel({
    required this.userName,
    required this.role,
  });

  final String userName;
  final String role;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        gradient: const LinearGradient(
          colors: [Color(0xFF151515), Color(0xFF090909)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'ADMIN',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3.2,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 12),
          Text(
            'Control Panel',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 34),
          ),
          const SizedBox(height: 10),
          Text(
            'Manage club users, content, and communication from a single mobile view.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _Chip(text: userName),
              _Chip(text: _displayRole(role)),
              _Chip(text: 'Admin access'),
            ],
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.eyebrow,
    required this.title,
    required this.description,
  });

  final String eyebrow;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          eyebrow.toUpperCase(),
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                letterSpacing: 3,
                color: Colors.white54,
              ),
        ),
        const SizedBox(height: 8),
        Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 24)),
        const SizedBox(height: 6),
        Text(description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
  });

  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value.toString(),
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 4),
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 2,
                  color: Colors.white54,
                ),
          ),
        ],
      ),
    );
  }
}

class _ShortcutBlock extends StatelessWidget {
  const _ShortcutBlock({
    required this.onUsersTap,
    required this.onContentTap,
    required this.onExploreTap,
  });

  final VoidCallback onUsersTap;
  final VoidCallback onContentTap;
  final VoidCallback onExploreTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Quick actions',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _ActionButton(label: 'Users', onTap: onUsersTap),
              _ActionButton(label: 'Content', onTap: onContentTap),
              _ActionButton(label: 'Explore', onTap: onExploreTap),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.label,
    required this.onTap,
  });

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          color: Colors.white.withAlpha(12),
          border: Border.all(color: Colors.white.withAlpha(24)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
        child: Text(
          label.toUpperCase(),
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                letterSpacing: 2,
                color: Colors.white70,
              ),
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: Colors.white70,
              letterSpacing: 0.6,
            ),
      ),
    );
  }
}

class _LoadingPanel extends StatelessWidget {
  const _LoadingPanel();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 180,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      child: const Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
    );
  }
}

class _EmptyPanel extends StatelessWidget {
  const _EmptyPanel({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(18),
      child: Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
    );
  }
}

class _ErrorPanel extends StatelessWidget {
  const _ErrorPanel({
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Unable to load admin metrics', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
          const SizedBox(height: 14),
          OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}

String _displayRole(String role) {
  final text = role.trim();
  if (text.isEmpty) return 'Admin';
  return text[0].toUpperCase() + text.substring(1);
}

String _friendlyError(Object? error) {
  final text = error.toString();
  if (text.contains('401')) return 'Your session expired. Please sign in again.';
  if (text.contains('SocketException') || text.contains('DioException')) {
    return 'Cannot reach the backend. Check the API URL and network.';
  }
  return 'Something went wrong while loading the control panel.';
}

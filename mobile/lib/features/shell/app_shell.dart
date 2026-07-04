import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../admin/presentation/admin_panel_screen.dart';
import '../auth/auth_controller.dart';
import '../about/presentation/about_screen.dart';
import '../home/presentation/home_screen.dart';
import '../events/presentation/events_screen.dart';
import '../explore/presentation/explore_screen.dart';
import '../profile/profile_screen.dart';
import '../team/presentation/team_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => AppShellState();
}

class AppShellState extends State<AppShell> {
  int _index = 0;

  final _pages = const [
    HomeScreen(),
    AboutScreen(),
    TeamScreen(),
    EventsScreen(),
    ExploreScreen(),
    ProfileScreen(),
  ];

  void selectIndex(int index) {
    setState(() => _index = index);
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = context.watch<AuthController>().user;
    final isAdmin = currentUser?.role == 'admin';

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 20,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 30,
              width: 30,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: Colors.white.withAlpha(30)),
                color: Colors.white.withAlpha(8),
              ),
              alignment: Alignment.center,
              child: const Text(
                'CW',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(width: 10),
            Text(
              'CodeWizards',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
          ],
        ),
        actions: [
          if (isAdmin)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: TextButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const AdminPanelScreen()),
                  );
                },
                icon: const Icon(Icons.admin_panel_settings_outlined, size: 16),
                label: const Text('Admin'),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.white,
                  backgroundColor: Colors.white.withAlpha(12),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                ),
              ),
            ),
        ],
      ),
      body: IndexedStack(index: _index, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.info_outline), selectedIcon: Icon(Icons.info), label: 'About'),
          NavigationDestination(icon: Icon(Icons.groups_outlined), selectedIcon: Icon(Icons.groups), label: 'Team'),
          NavigationDestination(icon: Icon(Icons.event_outlined), selectedIcon: Icon(Icons.event), label: 'Events'),
          NavigationDestination(icon: Icon(Icons.explore_outlined), selectedIcon: Icon(Icons.explore), label: 'Explore'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

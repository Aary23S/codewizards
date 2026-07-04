import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../auth/auth_controller.dart';
import '../../shell/app_shell.dart';
import '../data/announcement_item.dart';
import '../data/event_item.dart';
import '../data/home_repository.dart';
import '../data/project_item.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Future<_HomeSnapshot>? _future;
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= _load();
  }

  Future<_HomeSnapshot> _load() async {
    final repo = context.read<HomeRepository>();
    final results = await Future.wait([
      repo.fetchAnnouncements(),
      repo.fetchFeaturedProjects(),
      repo.fetchEvents(),
    ]);

    return _HomeSnapshot(
      announcements: results[0] as List<AnnouncementItem>,
      projects: results[1] as List<ProjectItem>,
      events: results[2] as List<EventItem>,
    );
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = _load();
    });

    try {
      await _future;
    } catch (error) {
      if (!mounted) return;
      setState(() => _errorMessage = _friendlyError(error));
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthController>().user;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<_HomeSnapshot>(
          future: _future,
          builder: (context, snapshot) {
            final loading = snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData;
            final data = snapshot.data;

            if (snapshot.hasError || _errorMessage != null) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: [
                  _ErrorPanel(message: _errorMessage ?? _friendlyError(snapshot.error), onRetry: _refresh),
                ],
              );
            }

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                _HeroSection(user: user),
                const SizedBox(height: 18),
                _StatGrid(
                  members: 400,
                  founded: 2023,
                  projects: data?.projects.length ?? 0,
                  events: data?.events.length ?? 0,
                ),
                const SizedBox(height: 22),
                _SectionHeader(
                  eyebrow: 'Announcements',
                  title: 'What the club needs to know',
                  description: 'Short updates, important notices, and operational alerts.',
                ),
                const SizedBox(height: 12),
                if (loading)
                  const _LoadingBlock()
                else if ((data?.announcements.isEmpty ?? true))
                  const _EmptyBlock(message: 'No announcements found.')
                else
                  ...data!.announcements.mapIndexed(
                    (announcement, index) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _AnnouncementCard(announcement: announcement, index: index),
                    ),
                  ),
                const SizedBox(height: 20),
                _SectionHeader(
                  eyebrow: 'Featured projects',
                  title: 'Built by the club',
                  description: 'Selected projects that show what students are shipping across different domains.',
                  action: _SectionAction(label: 'View all', onTap: () => _jumpTo(4)),
                ),
                const SizedBox(height: 12),
                if (loading)
                  const _LoadingBlock()
                else if ((data?.projects.isEmpty ?? true))
                  const _EmptyBlock(message: 'No featured projects yet.')
                else
                  ...data!.projects.take(2).mapIndexed(
                    (project, index) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _ProjectCard(project: project, index: index),
                    ),
                  ),
                const SizedBox(height: 20),
                _SectionHeader(
                  eyebrow: 'Events',
                  title: 'Recent and upcoming events',
                  description: 'A compact view of the latest workshops, seminars, and activity around the club.',
                  action: _SectionAction(label: 'View all', onTap: () => _jumpTo(4)),
                ),
                const SizedBox(height: 12),
                if (loading)
                  const _LoadingBlock()
                else if ((data?.events.isEmpty ?? true))
                  const _EmptyBlock(message: 'No events found.')
                else
                  ...data!.events.take(3).mapIndexed(
                    (event, index) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _EventCard(event: event, index: index),
                    ),
                  ),
                const SizedBox(height: 18),
                _ConnectSection(onBrowseTap: () => _jumpTo(2)),
              ],
            );
          },
        ),
      ),
    );
  }

  void _jumpTo(int index) {
    context.findAncestorStateOfType<AppShellState>()?.selectIndex(index);
  }
}

class _HomeSnapshot {
  _HomeSnapshot({
    required this.announcements,
    required this.projects,
    required this.events,
  });

  final List<AnnouncementItem> announcements;
  final List<ProjectItem> projects;
  final List<EventItem> events;
}

// Reuse the same mobile-first visual language already introduced in the app.
class _HeroSection extends StatelessWidget {
  const _HeroSection({required this.user});

  final dynamic user;

  @override
  Widget build(BuildContext context) {
    final name = user?.name ?? 'there';
    final role = _displayRole(user?.role);
    final batch = user?.batch?.toString() ?? 'N/A';

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        gradient: const LinearGradient(
          colors: [Color(0xFF141414), Color(0xFF090909)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'D.Y. Patil Agriculture & Technical University, Talsande',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 2.4,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 12),
          Text(
            'Code.\nBuild.\nGrow.',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 44, height: 0.95),
          ),
          const SizedBox(height: 12),
          Text(
            'CodeWizards is the official coding club connecting students with seniors, projects, and opportunities that matter.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.6),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _HeroPill(text: 'Welcome, $name'),
              _HeroPill(text: role),
              _HeroPill(text: 'Batch $batch'),
            ],
          ),
          const SizedBox(height: 18),
          const _HeroVisual(),
          const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                  onPressed: () => context.findAncestorStateOfType<AppShellState>()?.selectIndex(4),
                  child: const Text('Find a mentor'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => context.findAncestorStateOfType<AppShellState>()?.selectIndex(3),
                  child: const Text('View Events'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroVisual extends StatelessWidget {
  const _HeroVisual();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 190,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.black.withAlpha(64),
      ),
      padding: const EdgeInsets.all(14),
      child: Stack(
        children: const [
          Align(alignment: Alignment.topRight, child: _MiniChip(text: 'Python')),
          Center(child: _CodeFrame()),
          Align(alignment: Alignment.bottomLeft, child: _MiniChip(text: 'AI')),
          Align(alignment: Alignment.bottomRight, child: _MiniChip(text: 'Wizard')),
        ],
      ),
    );
  }
}

class _CodeFrame extends StatelessWidget {
  const _CodeFrame();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 210,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(8),
      ),
      padding: const EdgeInsets.all(14),
      child: const Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _TerminalBar(),
          SizedBox(height: 12),
          Text(
            'const magic = () => {\n  return "CodeWizards";\n}',
            style: TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace', height: 1.5),
          ),
        ],
      ),
    );
  }
}

class _TerminalBar extends StatelessWidget {
  const _TerminalBar();

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        _Dot(Color(0xFFF87171)),
        SizedBox(width: 5),
        _Dot(Color(0xFFF5B14C)),
        SizedBox(width: 5),
        _Dot(Color(0xFF34D399)),
      ],
    );
  }
}

class _Dot extends StatelessWidget {
  const _Dot(this.color);

  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 7,
      height: 7,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}

class _HeroPill extends StatelessWidget {
  const _HeroPill({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
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

class _StatGrid extends StatelessWidget {
  const _StatGrid({
    required this.members,
    required this.founded,
    required this.projects,
    required this.events,
  });

  final int members;
  final int founded;
  final int projects;
  final int events;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.95,
      children: [
        _StatCard(value: '$members+', label: 'Active members'),
        _StatCard(value: '$founded', label: 'Founded'),
        _StatCard(value: '$projects+', label: 'Projects built'),
        _StatCard(value: '$events+', label: 'Events conducted'),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(10),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(value, style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 2.2,
                  color: Colors.white.withAlpha(115),
                ),
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
    this.action,
  });

  final String eyebrow;
  final String title;
  final String description;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                eyebrow.toUpperCase(),
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      letterSpacing: 2.6,
                      color: Colors.white54,
                    ),
              ),
              const SizedBox(height: 6),
              Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 24)),
              const SizedBox(height: 6),
              Text(description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
            ],
          ),
        ),
        if (action != null) ...[
          const SizedBox(width: 10),
          action!,
        ],
      ],
    );
  }
}

class _SectionAction extends StatelessWidget {
  const _SectionAction({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return TextButton(onPressed: onTap, child: Text(label));
  }
}

class _AnnouncementCard extends StatelessWidget {
  const _AnnouncementCard({required this.announcement, required this.index});

  final AnnouncementItem announcement;
  final int index;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: announcement.important ? Colors.amber.withAlpha(51) : Colors.white.withAlpha(20)),
        color: announcement.important ? Colors.white.withAlpha(13) : Colors.white.withAlpha(10),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 40,
            width: 40,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withAlpha(20)),
              color: Colors.black.withAlpha(32),
            ),
            child: Text('${index + 1}'.padLeft(2, '0'), style: Theme.of(context).textTheme.labelSmall),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _StatusPill(
                  label: announcement.important ? 'Important' : 'Update',
                  accent: announcement.important ? const Color(0xFFF59E0B) : const Color(0xFF5CC8FF),
                ),
                const SizedBox(height: 10),
                Text(announcement.title, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 6),
                Text(announcement.body, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProjectCard extends StatelessWidget {
  const _ProjectCard({required this.project, required this.index});

  final ProjectItem project;
  final int index;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(10),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (project.featured) const _StatusPill(label: 'Featured', accent: Color(0xFFF5B14C)),
          if (project.featured) const SizedBox(height: 10),
          Text(project.title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 6),
          Text(project.description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
          if (project.techStack.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: project.techStack.take(4).map((tech) => _MiniChip(text: tech)).toList(),
            ),
          ],
        ],
      ),
    );
  }
}

class _EventCard extends StatelessWidget {
  const _EventCard({required this.event, required this.index});

  final EventItem event;
  final int index;

  @override
  Widget build(BuildContext context) {
    final dateText = event.date == null ? 'Date TBA' : _formatDate(event.date!);
    final eventType = event.type?.toUpperCase() ?? 'OTHER';

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(10),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _StatusPill(label: eventType, accent: const Color(0xFF5CC8FF)),
                    _StatusPill(
                      label: event.status.toUpperCase(),
                      accent: event.status == 'upcoming' ? Colors.white : const Color(0xFF5CC8FF),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(event.title, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 6),
                Text(event.description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
                const SizedBox(height: 10),
                Text(
                  '$dateText${event.venue != null ? ' · ${event.venue}' : ''}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                if (event.featured) ...[
                  const SizedBox(height: 10),
                  const _MiniChip(text: 'Featured'),
                ],
                if (event.status == 'upcoming' && event.registrationLink != null) ...[
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () {},
                    child: const Text('Register'),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 10),
          Text(
            '${index + 1}',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 2.4,
                  color: Colors.white38,
                ),
          ),
        ],
      ),
    );
  }
}

class _ConnectSection extends StatelessWidget {
  const _ConnectSection({required this.onBrowseTap});

  final VoidCallback onBrowseTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(10),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        children: [
          Text(
            'CONNECT',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 2.6,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 10),
          Text('Ready to connect?', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(
            'Find seniors who can guide you in your domain or explore the club’s work.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () => context.findAncestorStateOfType<AppShellState>()?.selectIndex(4),
                  child: const Text('Browse Seniors'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniChip extends StatelessWidget {
  const _MiniChip({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(10),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      child: Text(text, style: Theme.of(context).textTheme.labelSmall),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.label, required this.accent});

  final String label;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: accent.withAlpha(51)),
        color: accent.withAlpha(26),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 0.8,
              color: Colors.white,
            ),
      ),
    );
  }
}

class _LoadingBlock extends StatelessWidget {
  const _LoadingBlock();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(10),
      ),
      child: const Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
    );
  }
}

class _EmptyBlock extends StatelessWidget {
  const _EmptyBlock({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(10),
      ),
      padding: const EdgeInsets.all(16),
      child: Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
    );
  }
}

class _ErrorPanel extends StatelessWidget {
  const _ErrorPanel({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(10),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Unable to load home data', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
          const SizedBox(height: 14),
          OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}

String _displayRole(String? role) {
  final value = role?.trim() ?? '';
  if (value.isEmpty) return 'Student';
  return value[0].toUpperCase() + value.substring(1);
}

String _friendlyError(Object? error) {
  final text = error.toString();
  if (text.contains('401')) return 'Your session expired. Please sign in again.';
  if (text.contains('SocketException') || text.contains('DioException')) {
    return 'Cannot reach the backend. Check the API URL and network.';
  }
  return 'Something went wrong while loading the home feed.';
}

String _formatDate(DateTime date) {
  return '${date.day.toString().padLeft(2, '0')} ${_monthName(date.month)} ${date.year}';
}

String _monthName(int month) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  if (month < 1 || month > 12) return '';
  return months[month - 1];
}

extension _IterableIndex<T> on Iterable<T> {
  Iterable<R> mapIndexed<R>(R Function(T item, int index) transform) sync* {
    var index = 0;
    for (final item in this) {
      yield transform(item, index++);
    }
  }
}

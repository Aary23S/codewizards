import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../auth/auth_controller.dart';
import '../data/event_repository.dart';
import '../../home/data/event_item.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  Future<_EventsSnapshot>? _future;
  String _filter = 'all';
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= _load();
  }

  Future<_EventsSnapshot> _load() async {
    final repo = context.read<EventRepository>();
    final auth = context.read<AuthController>();
    final events = await repo.fetchEvents();
    final registrations = auth.user?.role == 'student'
        ? await repo.fetchMyRegistrations()
        : <String>{};
    return _EventsSnapshot(events: events, registrations: registrations);
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

  Future<void> _register(String id) async {
    final repo = context.read<EventRepository>();
    try {
      await repo.register(id);
      if (!mounted) return;
      setState(() {
        final data = _future;
        if (data != null) {
          _future = data.then((snapshot) => snapshot.copyWith(registrations: {...snapshot.registrations, id}));
        }
      });
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_friendlyError(error))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthController>().user;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<_EventsSnapshot>(
          future: _future,
          builder: (context, snapshot) {
            final loading = snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData;

            if (snapshot.hasError || _errorMessage != null) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: [
                  _ErrorPanel(message: _errorMessage ?? _friendlyError(snapshot.error), onRetry: _refresh),
                ],
              );
            }

            final data = snapshot.data;
            final events = data?.events ?? const <EventItem>[];
            final registrations = data?.registrations ?? <String>{};
            final filtered = _filter == 'all' ? events : events.where((event) => event.status == _filter).toList();

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                _HeroSection(),
                const SizedBox(height: 16),
                _FilterBar(
                  filter: _filter,
                  onChanged: (value) => setState(() => _filter = value),
                ),
                const SizedBox(height: 16),
                if (loading)
                  const _LoadingBlock()
                else if (filtered.isEmpty)
                  _EmptyBlock(message: 'No $_filter events found.')
                else
                  ...filtered.mapIndexed(
                    (event, index) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _EventCard(
                        event: event,
                        index: index,
                        currentUser: user,
                        registered: registrations.contains(event.id),
                        onRegister: () => _register(event.id),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _EventsSnapshot {
  _EventsSnapshot({
    required this.events,
    required this.registrations,
  });

  final List<EventItem> events;
  final Set<String> registrations;

  _EventsSnapshot copyWith({
    List<EventItem>? events,
    Set<String>? registrations,
  }) {
    return _EventsSnapshot(
      events: events ?? this.events,
      registrations: registrations ?? this.registrations,
    );
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection();

  @override
  Widget build(BuildContext context) {
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
            "WHAT'S HAPPENING",
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3.2,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 12),
          Text(
            'Events with a cleaner, editorial layout.',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 36),
          ),
          const SizedBox(height: 12),
          Text(
            'Everything still behaves the same. The presentation just feels less flat and more deliberate.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.6),
          ),
        ],
      ),
    );
  }
}

class _FilterBar extends StatelessWidget {
  const _FilterBar({
    required this.filter,
    required this.onChanged,
  });

  final String filter;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final value in const ['all', 'upcoming', 'completed'])
          _FilterChip(
            label: value.toUpperCase(),
            selected: filter == value,
            onTap: () => onChanged(value),
          ),
      ],
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: selected ? Colors.white : Colors.white.withAlpha(20)),
          color: selected ? Colors.white : Colors.white.withAlpha(10),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: selected ? Colors.black : Colors.white70,
                letterSpacing: 1.6,
              ),
        ),
      ),
    );
  }
}

class _EventCard extends StatelessWidget {
  const _EventCard({
    required this.event,
    required this.index,
    required this.currentUser,
    required this.registered,
    required this.onRegister,
  });

  final EventItem event;
  final int index;
  final dynamic currentUser;
  final bool registered;
  final VoidCallback onRegister;

  @override
  Widget build(BuildContext context) {
    final canRegister = event.status == 'upcoming' && currentUser?.role == 'student';
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
                const SizedBox(height: 12),
                if (canRegister)
                  registered
                      ? const _MiniChip(text: 'Already registered')
                      : OutlinedButton(onPressed: onRegister, child: const Text('Register'))
                else if (currentUser != null && currentUser.role != 'student' && event.status == 'upcoming')
                  Text(
                    'Only students can register for events',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
              ],
            ),
          ),
        ],
      ),
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

class _LoadingBlock extends StatelessWidget {
  const _LoadingBlock();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 180,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
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
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(10),
      ),
      padding: const EdgeInsets.all(18),
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
          Text('Unable to load events', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
          const SizedBox(height: 14),
          OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}

String _friendlyError(Object? error) {
  final text = error.toString();
  if (text.contains('401')) return 'Your session expired. Please sign in again.';
  if (text.contains('SocketException') || text.contains('DioException')) {
    return 'Cannot reach the backend. Check the API URL and network.';
  }
  return 'Something went wrong while loading the events.';
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

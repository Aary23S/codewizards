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
    final registrations = auth.user != null && auth.user!.role != 'admin'
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
          _future = data.then((snapshot) {
            final updatedEvents = snapshot.events.map((e) {
              if (e.id == id) {
                return EventItem(
                  id: e.id,
                  title: e.title,
                  description: e.description,
                  status: e.status,
                  type: e.type,
                  date: e.date,
                  venue: e.venue,
                  featured: e.featured,
                  registrationLink: e.registrationLink,
                  imageUrl: e.imageUrl,
                  isRegistered: true,
                  registeredCount: e.registeredCount + 1,
                );
              }
              return e;
            }).toList();
            return snapshot.copyWith(
              events: updatedEvents,
              registrations: {...snapshot.registrations, id},
            );
          });
        }
      });
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(_friendlyError(error))));
    }
  }

  Future<void> _cancelRegistration(String id) async {
    final repo = context.read<EventRepository>();
    try {
      await repo.cancelRegistration(id);
      if (!mounted) return;
      setState(() {
        final data = _future;
        if (data != null) {
          _future = data.then((snapshot) {
            final updatedEvents = snapshot.events.map((e) {
              if (e.id == id) {
                return EventItem(
                  id: e.id,
                  title: e.title,
                  description: e.description,
                  status: e.status,
                  type: e.type,
                  date: e.date,
                  venue: e.venue,
                  featured: e.featured,
                  registrationLink: e.registrationLink,
                  imageUrl: e.imageUrl,
                  isRegistered: false,
                  registeredCount: e.registeredCount > 0
                      ? e.registeredCount - 1
                      : 0,
                );
              }
              return e;
            }).toList();
            return snapshot.copyWith(
              events: updatedEvents,
              registrations: snapshot.registrations
                  .where((x) => x != id)
                  .toSet(),
            );
          });
        }
      });
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(_friendlyError(error))));
    }
  }

  Future<void> _verifyOtp(String eventId, String code) async {
    final repo = context.read<EventRepository>();
    try {
      final res = await repo.verifyOtp(eventId, code);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            res['message']?.toString() ?? 'Attendance verified successfully',
          ),
        ),
      );
      _refresh();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(_friendlyError(error))));
    }
  }

  Future<void> _generateOtp(String eventId) async {
    final repo = context.read<EventRepository>();
    try {
      final res = await repo.generateOtp(eventId);
      if (!mounted) return;
      final otp = res['data']?['otpCode']?.toString() ?? '';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('OTP Generated successfully: $otp')),
      );
      _refresh();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(_friendlyError(error))));
    }
  }

  void _showCertificate(EventItem event, dynamic user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF151515),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(28),
          side: const BorderSide(color: Color(0xFFFBBF24), width: 1.5),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 64,
              width: 64,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFFFBBF24), Color(0xFFD97706)],
                ),
              ),
              child: const Icon(
                Icons.school_rounded,
                color: Colors.black,
                size: 32,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'CERTIFICATE OF ATTENDANCE',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Color(0xFFFBBF24),
                fontWeight: FontWeight.bold,
                fontSize: 14,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Presented to',
              style: TextStyle(
                color: Colors.white.withAlpha(120),
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              user?.name ?? 'Member',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'for successfully participating in\n"${event.title}"\nheld on ${event.date != null ? '${event.date!.day}/${event.date!.month}/${event.date!.year}' : 'TBA'}.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white.withAlpha(200),
                fontSize: 13,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: Colors.white.withAlpha(6),
              ),
              child: Column(
                children: [
                  const Text(
                    'VERIFICATION HASH',
                    style: TextStyle(
                      color: Colors.white30,
                      fontSize: 9,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 4),
                  SelectableText(
                    event.certificateHash ?? 'CW-VERIFIED-ATTENDANCE',
                    style: const TextStyle(
                      color: Color(0xFFFBBF24),
                      fontFamily: 'monospace',
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close', style: TextStyle(color: Colors.white70)),
          ),
        ],
      ),
    );
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
            final loading =
                snapshot.connectionState == ConnectionState.waiting &&
                !snapshot.hasData;

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

            final data = snapshot.data;
            final events = data?.events ?? const <EventItem>[];
            final registrations = data?.registrations ?? <String>{};
            final filtered = _filter == 'all'
                ? events
                : events.where((event) => event.status == _filter).toList();

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
                        onCancel: () => _cancelRegistration(event.id),
                        onVerifyOtp: (code) => _verifyOtp(event.id, code),
                        onGenerateOtp: () => _generateOtp(event.id),
                        onViewCertificate: () => _showCertificate(event, user),
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
  _EventsSnapshot({required this.events, required this.registrations});

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
            style: Theme.of(
              context,
            ).textTheme.headlineMedium?.copyWith(fontSize: 36),
          ),
          const SizedBox(height: 12),
          Text(
            'Everything still behaves the same. The presentation just feels less flat and more deliberate.',
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(height: 1.6),
          ),
        ],
      ),
    );
  }
}

class _FilterBar extends StatelessWidget {
  const _FilterBar({required this.filter, required this.onChanged});

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
          border: Border.all(
            color: selected ? Colors.white : Colors.white.withAlpha(20),
          ),
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

class _EventCard extends StatefulWidget {
  const _EventCard({
    required this.event,
    required this.index,
    required this.currentUser,
    required this.registered,
    required this.onRegister,
    required this.onCancel,
    required this.onVerifyOtp,
    required this.onGenerateOtp,
    required this.onViewCertificate,
  });

  final EventItem event;
  final int index;
  final dynamic currentUser;
  final bool registered;
  final VoidCallback onRegister;
  final VoidCallback onCancel;
  final ValueChanged<String> onVerifyOtp;
  final VoidCallback onGenerateOtp;
  final VoidCallback onViewCertificate;

  @override
  State<_EventCard> createState() => _EventCardState();
}

class _EventCardState extends State<_EventCard> {
  bool _expanded = false;
  final _otpController = TextEditingController();

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final canRegister =
        widget.event.status == 'upcoming' &&
        widget.currentUser?.role != 'admin';
    final dateText = widget.event.date == null
        ? 'Date TBA'
        : _formatDate(widget.event.date!);
    final eventType = widget.event.type?.toUpperCase() ?? 'OTHER';
    final hasLongDescription = widget.event.description.length > 120;
    final isAttended = widget.event.registrationStatus == 'attended';
    final isRegistered =
        widget.event.registrationStatus == 'registered' || widget.registered;
    final isAdmin = widget.currentUser?.role == 'admin';

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
          if (widget.event.imageUrl != null &&
              widget.event.imageUrl!.isNotEmpty) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network(
                widget.event.imageUrl!,
                height: 160,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    const SizedBox.shrink(),
              ),
            ),
            const SizedBox(height: 12),
          ],
          Row(
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
                child: Text(
                  '${widget.index + 1}'.padLeft(2, '0'),
                  style: Theme.of(context).textTheme.labelSmall,
                ),
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
                        _StatusPill(
                          label: eventType,
                          accent: const Color(0xFF5CC8FF),
                        ),
                        _StatusPill(
                          label: widget.event.status.toUpperCase(),
                          accent: widget.event.status == 'upcoming'
                              ? Colors.white
                              : const Color(0xFF5CC8FF),
                        ),
                        _StatusPill(
                          label: '${widget.event.registeredCount} REGISTERED',
                          accent: const Color(0xFF34D399),
                        ),
                        if (isAttended)
                          const _StatusPill(
                            label: '✓ ATTENDED',
                            accent: Color(0xFFFBBF24),
                          ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      widget.event.title,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      widget.event.description,
                      maxLines: _expanded ? null : 3,
                      overflow: _expanded
                          ? TextOverflow.visible
                          : TextOverflow.ellipsis,
                      style: Theme.of(
                        context,
                      ).textTheme.bodyMedium?.copyWith(height: 1.5),
                    ),
                    if (hasLongDescription) ...[
                      const SizedBox(height: 4),
                      GestureDetector(
                        onTap: () => setState(() => _expanded = !_expanded),
                        child: Text(
                          _expanded ? 'Show Less' : 'Show More',
                          style: const TextStyle(
                            color: Color(0xFF5CC8FF),
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 10),
                    Text(
                      '$dateText${widget.event.venue != null ? ' · ${widget.event.venue}' : ''}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    if (widget.event.featured) ...[
                      const SizedBox(height: 10),
                      const _MiniChip(text: 'Featured'),
                    ],
                    const SizedBox(height: 12),

                    // Admin flow
                    if (isAdmin && widget.event.status == 'upcoming') ...[
                      Row(
                        children: [
                          OutlinedButton(
                            onPressed: widget.onGenerateOtp,
                            child: const Text('Generate OTP'),
                          ),
                          if (widget.event.otpCode != null) ...[
                            const SizedBox(width: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                color: const Color(0xFFFBBF24).withAlpha(30),
                                border: Border.all(
                                  color: const Color(0xFFFBBF24).withAlpha(60),
                                ),
                              ),
                              child: Text(
                                'OTP: ${widget.event.otpCode}',
                                style: const TextStyle(
                                  color: Color(0xFFFBBF24),
                                  fontFamily: 'monospace',
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],

                    // Student/Non-Admin flow
                    if (!isAdmin && widget.currentUser != null) ...[
                      if (isAttended)
                        ElevatedButton.icon(
                          onPressed: widget.onViewCertificate,
                          icon: const Icon(Icons.school, size: 16),
                          label: const Text('View Certificate'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFFBBF24),
                            foregroundColor: Colors.black,
                          ),
                        )
                      else if (isRegistered &&
                          widget.event.status == 'upcoming')
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const _MiniChip(text: '✓ Registered'),
                                const SizedBox(width: 8),
                                OutlinedButton(
                                  onPressed: widget.onCancel,
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 6,
                                    ),
                                  ),
                                  child: const Text(
                                    'Cancel',
                                    style: TextStyle(fontSize: 11),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                SizedBox(
                                  width: 120,
                                  height: 36,
                                  child: TextField(
                                    controller: _otpController,
                                    maxLength: 6,
                                    keyboardType: TextInputType.number,
                                    decoration: const InputDecoration(
                                      hintText: 'Enter OTP',
                                      counterText: '',
                                      contentPadding: EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 0,
                                      ),
                                      border: OutlineInputBorder(),
                                    ),
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                ElevatedButton(
                                  onPressed: () {
                                    final val = _otpController.text.trim();
                                    if (val.length == 6) {
                                      widget.onVerifyOtp(val);
                                    }
                                  },
                                  child: const Text(
                                    'Verify Attendance',
                                    style: TextStyle(fontSize: 11),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        )
                      else if (canRegister)
                        OutlinedButton(
                          onPressed: widget.onRegister,
                          child: const Text('Register'),
                        ),
                    ],

                    if (isAdmin && widget.event.status == 'completed')
                      const Text(
                        'Event completed',
                        style: TextStyle(color: Colors.white38, fontSize: 12),
                      ),
                  ],
                ),
              ),
            ],
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
      child: Text(
        message,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
      ),
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
          Text(
            'Unable to load events',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(height: 1.5),
          ),
          const SizedBox(height: 14),
          OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}

String _friendlyError(Object? error) {
  final text = error.toString();
  if (text.contains('401')) {
    return 'Your session expired. Please sign in again.';
  }
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

// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../auth/auth_controller.dart';
import '../../auth/data/user_profile.dart';
import '../../../core/widgets/safe_network_image.dart';
import '../data/coding_profile_item.dart';
import '../data/profile_repository.dart';
import '../../events/data/event_repository.dart';
import '../../home/data/event_item.dart';

class PublicProfileScreen extends StatefulWidget {
  const PublicProfileScreen({super.key, required this.userId});

  final String userId;

  @override
  State<PublicProfileScreen> createState() => _PublicProfileScreenState();
}

class _PublicProfileScreenState extends State<PublicProfileScreen> {
  Future<_PublicProfileSnapshot>? _future;
  String? _errorMessage;
  final _requestController = TextEditingController();
  bool _submittingRequest = false;
  String? _selectedTopic;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= _load();
  }

  Future<_PublicProfileSnapshot> _load() async {
    final repo = context.read<ProfileRepository>();
    final profile = await repo.fetchProfile(widget.userId);

    final results = await Future.wait([
      repo.fetchCodingProfilePublic(widget.userId).catchError((_) => null),
      context
          .read<EventRepository>()
          .fetchEvents(studentId: widget.userId)
          .catchError((_) => <EventItem>[]),
    ]);

    final codingProfile = results[0] as CodingProfileItem?;
    final allEvents = results[1] as List<EventItem>;
    final registered = allEvents.where((e) => e.isRegistered).toList();

    return _PublicProfileSnapshot(
      profile: profile,
      codingProfile: codingProfile,
      registeredEvents: registered,
    );
  }

  @override
  void dispose() {
    _requestController.dispose();
    super.dispose();
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

  Future<void> _sendRequest(UserProfile profile) async {
    final body = _requestController.text.trim();
    if (body.isEmpty || _submittingRequest) return;

    final topicPrefix = _selectedTopic != null ? '[Mentorship Topic: $_selectedTopic]\n\n' : '';
    final message = '$topicPrefix$body';

    setState(() => _submittingRequest = true);
    try {
      await context.read<ProfileRepository>().createMentorshipRequest(
        mentorId: profile.id,
        message: message,
      );
      if (!mounted) return;
      _requestController.clear();
      setState(() => _selectedTopic = null);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Mentorship request sent.')));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(_friendlyError(error))));
    } finally {
      if (mounted) setState(() => _submittingRequest = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = context.watch<AuthController>().user;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: FutureBuilder<_PublicProfileSnapshot>(
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
              if (data == null) {
                return const SizedBox.shrink();
              }
              final profile = data.profile;

              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: [
                  _SectionBlock(
                    eyebrow: 'Profile',
                    title: profile.name,
                    description:
                        'A public profile view aligned with the mobile dashboard theme.',
                    child: loading
                        ? const _LoadingBlock()
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _HeroCard(profile: profile),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  Expanded(
                                    child: _MetricCard(
                                      label: 'Role',
                                      value: _displayRole(profile.role),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: _MetricCard(
                                      label: 'Batch',
                                      value: profile.displayBatch ?? 'N/A',
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              _MetricCard(label: 'Email', value: profile.email),
                              const SizedBox(height: 12),
                              _InfoBlock(profile: profile),
                              if ((profile.designation != null && profile.designation!.trim().isNotEmpty) ||
                                  (profile.currentCompany != null && profile.currentCompany!.trim().isNotEmpty) ||
                                  (profile.professionalExperience != null && profile.professionalExperience!.trim().isNotEmpty)) ...[
                                const SizedBox(height: 12),
                                _ProfessionalCareerCard(profile: profile),
                              ],
                              const SizedBox(height: 12),
                              if (profile.domain.isNotEmpty)
                                _DomainsBlock(profile: profile),
                              if (profile.domain.isNotEmpty)
                                const SizedBox(height: 12),
                              if (profile.socialLinks.links.isNotEmpty)
                                _LinksBlock(profile: profile),
                              if (profile.socialLinks.links.isNotEmpty)
                                const SizedBox(height: 12),
                              if (data.codingProfile?.hasAnyData ?? false)
                                _CodingBlock(
                                  codingProfile: data.codingProfile!,
                                ),
                              if (data.codingProfile?.hasAnyData ?? false)
                                const SizedBox(height: 12),
                              _MyEventsBlock(events: data.registeredEvents),
                              const SizedBox(height: 12),
                              if (profile.isMentor &&
                                  currentUser != null &&
                                  currentUser.id != profile.id)
                                _RequestBlock(
                                  profile: profile,
                                  controller: _requestController,
                                  submitting: _submittingRequest,
                                  selectedTopic: _selectedTopic,
                                  onTopicChanged: (val) => setState(() => _selectedTopic = val),
                                  onSend: () => _sendRequest(profile),
                                ),
                            ],
                          ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _PublicProfileSnapshot {
  const _PublicProfileSnapshot({
    required this.profile,
    required this.codingProfile,
    required this.registeredEvents,
  });

  final UserProfile profile;
  final CodingProfileItem? codingProfile;
  final List<EventItem> registeredEvents;
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [Color(0xFF151515), Color(0xFF090909)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Avatar(profile: profile),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile.name,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 4),
                Text(
                  _profileSubtitle(profile),
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(height: 1.4),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (profile.isMentor)
                      const _Badge(
                        text: 'OPEN TO MENTOR',
                        color: Color(0xFF34D399),
                      ),
                    if (profile.domain.isNotEmpty)
                      _Badge(
                        text: profile.domain.first,
                        color: const Color(0xFF5CC8FF),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoBlock extends StatelessWidget {
  const _InfoBlock({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'About',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 3,
              color: Colors.white54,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            profile.hasBio ? profile.bio! : 'No bio provided.',
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(height: 1.55),
          ),
        ],
      ),
    );
  }
}

class _DomainsBlock extends StatelessWidget {
  const _DomainsBlock({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Domains',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 3,
              color: Colors.white54,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: profile.domain
                .map(
                  (domain) =>
                      _Badge(text: domain, color: const Color(0xFFF5B14C)),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _LinksBlock extends StatelessWidget {
  const _LinksBlock({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Links',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 3,
              color: Colors.white54,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: profile.socialLinks.links
                .map(
                  (link) => _LinkBadge(
                    label: link.label,
                    url: profile.socialLinks.urlFor(link.label),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _CodingBlock extends StatelessWidget {
  const _CodingBlock({required this.codingProfile});

  final CodingProfileItem codingProfile;

  @override
  Widget build(BuildContext context) {
    final leet = codingProfile.leetcode;
    final cf = codingProfile.codeforces;
    final gh = codingProfile.github;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Coding contributions',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 3,
              color: Colors.white54,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  label: 'LeetCode',
                  value: _displayCount(leet.totalSolved),
                  subvalue: _leetcodeSubtitle(leet),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _StatCard(
                  label: 'Codeforces',
                  value: _displayCount(cf.rating),
                  subvalue: _codeforcesSubtitle(cf),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  label: 'GitHub',
                  value: _displayCount(gh.contributions),
                  subvalue: _githubSubtitle(gh),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _StatCard(
                  label: 'Sync',
                  value: _formatSyncDate(
                    codingProfile.github.lastSyncedAt ??
                        codingProfile.codeforces.lastSyncedAt ??
                        codingProfile.leetcode.lastSyncedAt,
                  ),
                  subvalue: 'Last updated',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (leet.recentSubmissions.isNotEmpty) ...[
            Text(
              'Recent submissions',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                letterSpacing: 2,
                color: Colors.white54,
              ),
            ),
            const SizedBox(height: 8),
            ...leet.recentSubmissions
                .take(3)
                .map(
                  (item) => _ActivityRow(
                    title: item.problem.isNotEmpty ? item.problem : item.title,
                    subtitle: item.verdict.isNotEmpty
                        ? item.verdict
                        : item.language,
                  ),
                ),
          ] else if (cf.recentSubmissions.isNotEmpty) ...[
            Text(
              'Recent submissions',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                letterSpacing: 2,
                color: Colors.white54,
              ),
            ),
            const SizedBox(height: 8),
            ...cf.recentSubmissions
                .take(3)
                .map(
                  (item) => _ActivityRow(
                    title: item.problem.isNotEmpty ? item.problem : item.title,
                    subtitle: item.verdict.isNotEmpty
                        ? item.verdict
                        : item.language,
                  ),
                ),
          ] else if (gh.recentActivity.isNotEmpty) ...[
            Text(
              'Recent activity',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                letterSpacing: 2,
                color: Colors.white54,
              ),
            ),
            const SizedBox(height: 8),
            ...gh.recentActivity
                .take(3)
                .map(
                  (item) => _ActivityRow(
                    title: item.problem.isNotEmpty ? item.problem : item.title,
                    subtitle: item.verdict.isNotEmpty
                        ? item.verdict
                        : item.language,
                  ),
                ),
          ],
        ],
      ),
    );
  }
}

class _RequestBlock extends StatelessWidget {
  const _RequestBlock({
    required this.profile,
    required this.controller,
    required this.submitting,
    required this.selectedTopic,
    required this.onTopicChanged,
    required this.onSend,
  });

  final UserProfile profile;
  final TextEditingController controller;
  final bool submitting;
  final String? selectedTopic;
  final ValueChanged<String?> onTopicChanged;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Request mentorship'.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 2,
              color: Colors.white38,
            ),
          ),
          const SizedBox(height: 12),
          // Availability info sub-box
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.black.withAlpha(40),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withAlpha(8)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Response time:', style: TextStyle(color: Colors.white60, fontSize: 11)),
                    Text(profile.typicalResponseTime, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Student limit:', style: TextStyle(color: Colors.white60, fontSize: 11)),
                    Text(profile.maxActiveStudents.toString(), style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Preferred Connection:', style: TextStyle(color: Colors.white60, fontSize: 11)),
                    Text(
                      profile.preferredContactMethod.toUpperCase(),
                      style: const TextStyle(color: Color(0xFF5CC8FF), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (profile.canHelpWith != null && profile.canHelpWith!.isNotEmpty) ...[
            const SizedBox(height: 14),
            DropdownButtonFormField<String>(
              initialValue: selectedTopic,
              decoration: const InputDecoration(
                labelText: 'Select guidance topic',
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              dropdownColor: Colors.grey[900],
              items: [
                const DropdownMenuItem<String>(value: null, child: Text('Choose a topic...')),
                ...(profile.canHelpWith ?? const []).map((t) => DropdownMenuItem(value: t, child: Text(t))),
              ],
              onChanged: onTopicChanged,
            ),
          ],
          const SizedBox(height: 14),
          TextField(
            controller: controller,
            maxLines: 4,
            minLines: 2,
            decoration: const InputDecoration(
              hintText: 'Introduce yourself and what you would like guidance on...',
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: submitting ? null : onSend,
              child: submitting
                  ? const Text('Sending...')
                  : const Text('Send request'),
            ),
          ),
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    final initial = profile.name.isNotEmpty
        ? profile.name.trim()[0].toUpperCase()
        : 'U';

    return Container(
      height: 64,
      width: 64,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: const Color(0xFF5CC8FF),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      clipBehavior: Clip.antiAlias,
      child: SafeNetworkImage(
        imageUrl: profile.imageUrl,
        fit: BoxFit.cover,
        placeholder: Center(
          child: Text(
            initial,
            style: const TextStyle(
              color: Colors.black,
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.label, required this.value});

  final String label;
  final String value;

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
        children: [
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 2.2,
              color: Colors.white54,
            ),
          ),
          const SizedBox(height: 8),
          Text(value, style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    required this.subvalue,
  });

  final String label;
  final String value;
  final String subvalue;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: Colors.black.withAlpha(35),
        border: Border.all(color: Colors.white.withAlpha(16)),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 2,
              color: Colors.white54,
            ),
          ),
          const SizedBox(height: 8),
          Text(value, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 4),
          Text(
            subvalue,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(
              context,
            ).textTheme.bodySmall?.copyWith(color: Colors.white54),
          ),
        ],
      ),
    );
  }
}

class _ActivityRow extends StatelessWidget {
  const _ActivityRow({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: Colors.black.withAlpha(28),
        border: Border.all(color: Colors.white.withAlpha(16)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: Theme.of(
              context,
            ).textTheme.bodySmall?.copyWith(color: Colors.white54),
          ),
        ],
      ),
    );
  }
}

class _SectionBlock extends StatelessWidget {
  const _SectionBlock({
    required this.eyebrow,
    required this.title,
    required this.description,
    required this.child,
  });

  final String eyebrow;
  final String title;
  final String description;
  final Widget child;

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
            eyebrow.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 3,
              color: Colors.white54,
            ),
          ),
          const SizedBox(height: 8),
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 6),
          Text(
            description,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(height: 1.5),
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
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
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      child: const Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
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
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Unable to load profile',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 10),
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

class _Badge extends StatelessWidget {
  const _Badge({required this.text, required this.color});

  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: color.withAlpha(26),
        border: Border.all(color: color.withAlpha(51)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      child: Text(
        text,
        style: Theme.of(
          context,
        ).textTheme.labelSmall?.copyWith(color: color, letterSpacing: 1),
      ),
    );
  }
}

class _LinkBadge extends StatelessWidget {
  const _LinkBadge({required this.label, required this.url});

  final String label;
  final String? url;

  Future<void> _openLink(BuildContext context) async {
    final link = url?.trim();
    if (link == null || link.isEmpty) return;
    final uri = Uri.tryParse(link);
    if (uri == null) return;
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } on MissingPluginException {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Link launching is initializing. Please fully restart the app once.',
          ),
        ),
      );
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to open the link right now.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final enabled = url != null && url!.trim().isNotEmpty;

    return InkWell(
      onTap: enabled ? () => _openLink(context) : null,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          color: enabled
              ? const Color(0xFF5CC8FF).withAlpha(26)
              : Colors.white.withAlpha(8),
          border: Border.all(
            color: enabled
                ? const Color(0xFF5CC8FF).withAlpha(60)
                : Colors.white.withAlpha(20),
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: enabled ? const Color(0xFF5CC8FF) : Colors.white54,
                letterSpacing: 1,
              ),
            ),
            if (enabled) ...[
              const SizedBox(width: 6),
              const Icon(
                Icons.open_in_new_rounded,
                size: 14,
                color: Color(0xFF5CC8FF),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

String _profileSubtitle(UserProfile profile) {
  final parts = <String>[_displayRole(profile.role)];
  if (profile.displayBatch != null) {
    parts.add('Batch ${profile.displayBatch}');
  }
  return parts.join(' • ');
}

String _displayRole(String role) {
  switch (role.toLowerCase()) {
    case 'student':
      return 'Student';
    case 'mentor':
      return 'Mentor';
    case 'alumni':
      return 'Alumni';
    case 'senior':
      return 'Senior';
    case 'admin':
      return 'Admin';
    default:
      return role.isEmpty
          ? 'Member'
          : role[0].toUpperCase() + role.substring(1);
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
  return 'Something went wrong while loading the profile.';
}

String _displayCount(int? value) => value == null ? 'N/A' : value.toString();

String _leetcodeSubtitle(CodingLeetCodeStats stats) {
  final parts = <String>[];
  if (stats.easySolved != null) parts.add('Easy ${stats.easySolved}');
  if (stats.mediumSolved != null) parts.add('Med ${stats.mediumSolved}');
  if (stats.hardSolved != null) parts.add('Hard ${stats.hardSolved}');
  return parts.isEmpty ? 'No sync yet' : parts.join(' • ');
}

String _codeforcesSubtitle(CodingCodeforcesStats stats) {
  final parts = <String>[];
  if (stats.rank != null && stats.rank!.isNotEmpty) parts.add(stats.rank!);
  if (stats.solvedCount != null) parts.add('Solved ${stats.solvedCount}');
  return parts.isEmpty ? 'No sync yet' : parts.join(' • ');
}

String _githubSubtitle(CodingGitHubStats stats) {
  final parts = <String>[];
  if (stats.projects != null) parts.add('Repos ${stats.projects}');
  if (stats.publicRepos != null) parts.add('Public ${stats.publicRepos}');
  return parts.isEmpty ? 'No sync yet' : parts.join(' • ');
}

String _formatSyncDate(DateTime? date) {
  if (date == null) return 'Never';
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

class _MyEventsBlock extends StatelessWidget {
  const _MyEventsBlock({required this.events});

  final List<EventItem> events;

  @override
  Widget build(BuildContext context) {
    final upcoming = events.where((e) => e.status == 'upcoming').toList();
    final attended = events.where((e) => e.status == 'completed').toList();

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'MY EVENTS',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 2,
                  color: Colors.white38,
                ),
              ),
              const Icon(
                Icons.event_available_rounded,
                size: 16,
                color: Color(0xFF34D399),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'UPCOMING EVENTS',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Colors.white70,
            ),
          ),
          const SizedBox(height: 8),
          if (upcoming.isEmpty)
            const Text(
              'No upcoming events registered.',
              style: TextStyle(fontSize: 12, color: Colors.white38),
            )
          else
            ...upcoming.map(
              (event) => Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: Colors.white.withAlpha(6),
                  border: Border.all(color: Colors.white.withAlpha(12)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            event.title,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            event.date != null
                                ? '${event.date!.day}/${event.date!.month}/${event.date!.year}'
                                : 'TBA',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Colors.white38,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      Icons.check_circle_outline_rounded,
                      color: Color(0xFF34D399),
                      size: 18,
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 16),
          const Text(
            'ATTENDED EVENTS',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Colors.white70,
            ),
          ),
          const SizedBox(height: 8),
          if (attended.isEmpty)
            const Text(
              'No past events attended yet.',
              style: TextStyle(fontSize: 12, color: Colors.white38),
            )
          else
            ...attended.map(
              (event) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: Colors.white.withAlpha(4),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        event.title,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.white60,
                        ),
                      ),
                    ),
                    Text(
                      event.date != null
                          ? '${event.date!.day}/${event.date!.month}/${event.date!.year}'
                          : '',
                      style: const TextStyle(
                        fontSize: 10,
                        color: Colors.white30,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ProfessionalCareerCard extends StatelessWidget {
  const _ProfessionalCareerCard({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        color: Colors.white.withAlpha(8),
        border: Border.all(color: Colors.white.withAlpha(16)),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Professional Career'.toUpperCase(),
                style: TextStyle(
                  color: Colors.white.withAlpha(100),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              if (profile.isVerified == true)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF5CC8FF).withAlpha(30),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF5CC8FF).withAlpha(50)),
                  ),
                  child: const Text(
                    '✓ Verified',
                    style: TextStyle(
                      color: Color(0xFF5CC8FF),
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          if (profile.headline != null && profile.headline!.trim().isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              profile.headline!,
              style: const TextStyle(
                color: Color(0xFF5CC8FF),
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          const SizedBox(height: 12),
          if ((profile.designation != null && profile.designation!.trim().isNotEmpty) || 
              (profile.currentCompany != null && profile.currentCompany!.trim().isNotEmpty)) ...[
            Text(
              '${profile.designation?.trim().isNotEmpty == true ? profile.designation : 'Professional'}${profile.currentCompany?.trim().isNotEmpty == true ? ' @ ${profile.currentCompany}' : ''}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
          ],
          // Employment info & start date & location
          Row(
            children: [
              Expanded(
                child: Text(
                  [
                    if (profile.employmentType != null && profile.employmentType!.trim().isNotEmpty) profile.employmentType,
                    if (profile.workMode != null && profile.workMode!.trim().isNotEmpty) profile.workMode,
                    if (profile.startDateText != null && profile.startDateText!.trim().isNotEmpty) 'Started ${profile.startDateText}',
                    if (profile.location != null && profile.location!.trim().isNotEmpty) '📍 ${profile.location}',
                  ].join(' · '),
                  style: TextStyle(
                    color: Colors.white.withAlpha(120),
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
          if (profile.professionalExperience != null && profile.professionalExperience!.trim().isNotEmpty) ...[
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black.withAlpha(50),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withAlpha(10)),
              ),
              child: Text(
                profile.professionalExperience!,
                style: TextStyle(
                  color: Colors.white.withAlpha(180),
                  fontSize: 12,
                  height: 1.5,
                ),
              ),
            ),
          ],
          if (profile.canHelpWith != null && profile.canHelpWith!.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              'I Can Help With'.toUpperCase(),
              style: TextStyle(
                color: Colors.white.withAlpha(100),
                fontSize: 9,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.0,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: (profile.canHelpWith ?? const []).map((topic) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF34D399).withAlpha(15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF34D399).withAlpha(30)),
                  ),
                  child: Text(
                    topic,
                    style: const TextStyle(
                      color: Color(0xFF34D399),
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }
}

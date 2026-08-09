import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../auth/auth_controller.dart';
import '../auth/data/user_profile.dart';
import '../../core/widgets/safe_network_image.dart';
import '../shell/app_shell.dart';
import 'data/coding_profile_item.dart';
import 'data/mentorship_request_item.dart';
import 'data/profile_repository.dart';
import 'presentation/profile_edit_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Future<_ProfileDashboardSnapshot>? _future;
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= _load();
  }

  Future<_ProfileDashboardSnapshot> _load() async {
    final auth = context.read<AuthController>();
    final profileRepository = context.read<ProfileRepository>();
    final currentUser = auth.user;

    if (currentUser == null || currentUser.id.isEmpty) {
      throw StateError('No authenticated user found.');
    }

    try {
      final results = await Future.wait([
        profileRepository.fetchProfile(currentUser.id),
        profileRepository.fetchMyRequests(),
        profileRepository.fetchMyCodingProfile().catchError((_) => null),
      ]);

      return _ProfileDashboardSnapshot(
        profile: results[0] as UserProfile,
        requests: results[1] as List<MentorshipRequestItem>,
        codingProfile: results[2] as CodingProfileItem?,
      );
    } catch (error) {
      if (error.toString().contains('401')) {
        await auth.logout();
      }
      rethrow;
    }
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
      setState(() {
        _errorMessage = _friendlyError(error);
      });
    }
  }

  Future<void> _openEditProfile(UserProfile profile) async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ProfileEditScreen(initialProfile: profile),
      ),
    );

    if (!mounted) return;
    await _refresh();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final currentUser = auth.user;

    if (currentUser == null) {
      return const SizedBox.shrink();
    }

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<_ProfileDashboardSnapshot>(
          future: _future,
          builder: (context, snapshot) {
            final loading = snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData;

            if (loading) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: const [
                  _LoadingPanel(),
                ],
              );
            }

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

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                _HeroPanel(profile: data.profile),
                const SizedBox(height: 16),
                _MetricCard(
                  label: 'Role',
                  value: _displayRole(data.profile.role),
                ),
                const SizedBox(height: 12),
                _MetricCard(
                  label: 'Email',
                  value: _displayValue(data.profile.email),
                ),
                const SizedBox(height: 12),
                _MetricCard(
                  label: 'Batch',
                  value: _displayValue(data.profile.displayBatch),
                ),
                const SizedBox(height: 16),
                _ProfileSnapshotBlock(
                  profile: data.profile,
                  onEdit: () => _openEditProfile(data.profile),
                  onLogout: () => context.read<AuthController>().logout(),
                ),
                const SizedBox(height: 16),
                _QuickLinksBlock(
                  onHomeTap: () => _jumpToTab(0),
                  onTeamTap: () => _jumpToTab(2),
                  onEditTap: () => _openEditProfile(data.profile),
                ),
                const SizedBox(height: 16),
                if (data.profile.socialLinks.links.isNotEmpty)
                  _SocialLinksBlock(profile: data.profile),
                if (data.profile.socialLinks.links.isNotEmpty) const SizedBox(height: 16),
                if (data.codingProfile != null && data.codingProfile!.hasAnyData)
                  _CodingSnapshotBlock(codingProfile: data.codingProfile!),
                if (data.codingProfile != null && data.codingProfile!.hasAnyData) const SizedBox(height: 16),
                _MentorshipBlock(
                  profile: data.profile,
                  requests: data.requests,
                  onRefresh: _refresh,
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  void _jumpToTab(int index) {
    final shellState = context.findAncestorStateOfType<AppShellState>();
    shellState?.selectIndex(index);
  }
}

class _ProfileDashboardSnapshot {
  const _ProfileDashboardSnapshot({
    required this.profile,
    required this.requests,
    required this.codingProfile,
  });

  final UserProfile profile;
  final List<MentorshipRequestItem> requests;
  final CodingProfileItem? codingProfile;
}

class _HeroPanel extends StatelessWidget {
  const _HeroPanel({required this.profile});

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
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Student dashboard',
            style: TextStyle(
              color: Color(0xFF7DD3FC),
              fontSize: 11,
              letterSpacing: 3.2,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Welcome back, ${_firstName(profile.name)}',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 30),
          ),
          const SizedBox(height: 10),
          Text(
            'Manage your profile, mentorship activity, and role-specific actions from one consistent workspace.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 2.6,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 12),
          Text(value, style: Theme.of(context).textTheme.titleLarge),
        ],
      ),
    );
  }
}

class _ProfileSnapshotBlock extends StatelessWidget {
  const _ProfileSnapshotBlock({
    required this.profile,
    required this.onEdit,
    required this.onLogout,
  });

  final UserProfile profile;
  final VoidCallback onEdit;
  final VoidCallback onLogout;

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
            'Profile snapshot',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _Avatar(profile: profile),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(profile.name, style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 4),
                    Text(
                      _profileSubtitle(profile),
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 10),
                    if (profile.isMentor)
                      _Badge(
                        text: 'Open to mentor',
                        color: const Color(0xFF34D399),
                      ),
                  ],
                ),
              ),
            ],
          ),
          if (profile.hasBio) ...[
            const SizedBox(height: 16),
            Text(
              profile.bio!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.55),
            ),
          ],
          const SizedBox(height: 16),
          Text(
            'Domains',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 10),
          if (profile.hasDomains)
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: profile.domain
                  .map(
                    (domain) => _Badge(
                      text: domain,
                      color: const Color(0xFF5CC8FF),
                    ),
                  )
                  .toList(),
            )
          else
            Text(
              'No domains listed',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              ElevatedButton(
                onPressed: onEdit,
                child: const Text('Edit profile'),
              ),
              OutlinedButton(
                onPressed: onLogout,
                child: const Text('Logout'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickLinksBlock extends StatelessWidget {
  const _QuickLinksBlock({
    required this.onHomeTap,
    required this.onTeamTap,
    required this.onEditTap,
  });

  final VoidCallback onHomeTap;
  final VoidCallback onTeamTap;
  final VoidCallback onEditTap;

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
            'Quick links',
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
              _ActionPill(label: 'Home', onTap: onHomeTap),
              _ActionPill(label: 'Team', onTap: onTeamTap),
              _ActionPill(label: 'Edit', onTap: onEditTap),
            ],
          ),
        ],
      ),
    );
  }
}

class _SocialLinksBlock extends StatelessWidget {
  const _SocialLinksBlock({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    final links = profile.socialLinks.links;
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
            'Public links',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: links
                .map(
                  (link) => _LinkChip(
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

class _CodingSnapshotBlock extends StatelessWidget {
  const _CodingSnapshotBlock({required this.codingProfile});

  final CodingProfileItem codingProfile;

  @override
  Widget build(BuildContext context) {
    final leet = codingProfile.leetcode;
    final cf = codingProfile.codeforces;
    final gh = codingProfile.github;

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
            'Coding contributions',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(child: _StatCard(label: 'LeetCode', value: _count(leet.totalSolved), subtitle: _leetcodeLabel(leet))),
              const SizedBox(width: 10),
              Expanded(child: _StatCard(label: 'Codeforces', value: _count(cf.rating), subtitle: _codeforcesLabel(cf))),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _StatCard(label: 'GitHub', value: _count(gh.contributions), subtitle: _githubLabel(gh))),
              const SizedBox(width: 10),
              Expanded(child: _StatCard(label: 'Sync', value: _formatSyncDate(gh.lastSyncedAt ?? cf.lastSyncedAt ?? leet.lastSyncedAt), subtitle: 'Last updated')),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    required this.subtitle,
  });

  final String label;
  final String value;
  final String subtitle;

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
          Text(label.toUpperCase(), style: Theme.of(context).textTheme.labelSmall?.copyWith(letterSpacing: 2, color: Colors.white54)),
          const SizedBox(height: 8),
          Text(value, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 4),
          Text(subtitle, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white54)),
        ],
      ),
    );
  }
}

class _MentorshipBlock extends StatelessWidget {
  const _MentorshipBlock({
    required this.profile,
    required this.requests,
    required this.onRefresh,
  });

  final UserProfile profile;
  final List<MentorshipRequestItem> requests;
  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context) {
    final incoming = requests.where((r) => r.mentor?.id == profile.id).toList();
    final outgoing = requests.where((r) => r.student?.id == profile.id).toList();

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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'MENTORSHIP',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      letterSpacing: 3,
                      color: Colors.white54,
                    ),
              ),
              Text(
                '${requests.length} total',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      letterSpacing: 2,
                      color: Colors.white54,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text('Mentorship requests', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 20),
          if (requests.isEmpty)
            Text(
              'No mentorship requests yet. Send a request to a mentor in the directory to get started.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
            )
          else ...[
            if (incoming.isNotEmpty) ...[
              Text(
                'INCOMING REQUESTS (AS MENTOR)',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      letterSpacing: 2,
                      color: const Color(0xFF5CC8FF).withAlpha(180),
                    ),
              ),
              const SizedBox(height: 10),
              ...incoming.map(
                (request) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _MentorshipRequestCard(
                    request: request,
                    profile: profile,
                    onRefresh: onRefresh,
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
            if (outgoing.isNotEmpty) ...[
              Text(
                'SENT REQUESTS (AS STUDENT)',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      letterSpacing: 2,
                      color: const Color(0xFF5CC8FF).withAlpha(180),
                    ),
              ),
              const SizedBox(height: 10),
              ...outgoing.map(
                (request) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _MentorshipRequestCard(
                    request: request,
                    profile: profile,
                    onRefresh: onRefresh,
                  ),
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }
}

class _MentorshipRequestCard extends StatefulWidget {
  const _MentorshipRequestCard({
    required this.request,
    required this.profile,
    required this.onRefresh,
  });

  final MentorshipRequestItem request;
  final UserProfile profile;
  final VoidCallback onRefresh;

  @override
  State<_MentorshipRequestCard> createState() => _MentorshipRequestCardState();
}

class _MentorshipRequestCardState extends State<_MentorshipRequestCard> {
  bool _updating = false;

  Future<void> _updateStatus(String status) async {
    setState(() => _updating = true);
    try {
      await context.read<ProfileRepository>().updateMentorshipStatus(
            widget.request.id,
            status,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Request $status successfully.')),
        );
        widget.onRefresh();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().contains('403')
                ? 'Failed to update: unauthorized'
                : 'Failed to update request status.'),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _updating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isMentorCard = widget.request.mentor?.id == widget.profile.id;
    final counterpart = isMentorCard ? widget.request.student : widget.request.mentor;
    final showActions = isMentorCard && widget.request.status == 'pending';

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: Colors.black.withAlpha(46),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isMentorCard
                          ? (counterpart?.name ?? 'Student')
                          : 'To Mentor: ${counterpart?.name ?? 'Mentor'}',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      counterpart == null
                          ? 'Mentorship request'
                          : counterpart.batch != null
                              ? 'Batch ${counterpart.batch}'
                              : counterpart.domain.isNotEmpty
                                  ? counterpart.domain.join(' • ')
                                  : counterpart.email,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              _StatusBadge(status: widget.request.status),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            widget.request.message,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
          ),
          if (widget.request.createdAt != null) ...[
            const SizedBox(height: 10),
            Text(
              _formatDate(widget.request.createdAt!),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white38),
            ),
          ],
          if (showActions) ...[
            const SizedBox(height: 12),
            const Divider(color: Colors.white10),
            const SizedBox(height: 8),
            _updating
                ? const Center(
                    child: SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : Row(
                    children: [
                      ElevatedButton(
                        onPressed: () => _updateStatus('accepted'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text('Accept', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 10),
                      OutlinedButton(
                        onPressed: () => _updateStatus('rejected'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: BorderSide(color: Colors.white.withAlpha(40)),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text('Reject', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
          ],
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
    final initial = profile.name.isNotEmpty ? profile.name.trim()[0].toUpperCase() : 'C';
    final imageUrl = profile.imageUrl;

    return Container(
      height: 64,
      width: 64,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: const Color(0xFFF5B14C),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      clipBehavior: Clip.antiAlias,
      child: SafeNetworkImage(
        imageUrl: imageUrl,
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

class _ActionPill extends StatelessWidget {
  const _ActionPill({
    required this.label,
    required this.onTap,
  });

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          color: Colors.white.withAlpha(13),
          border: Border.all(color: Colors.white.withAlpha(26)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
        child: Text(
          label.toUpperCase(),
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                letterSpacing: 2.2,
                color: Colors.white70,
              ),
        ),
      ),
    );
  }
}

class _LinkChip extends StatelessWidget {
  const _LinkChip({
    required this.label,
    required this.url,
  });

  final String label;
  final String? url;

  Future<void> _openLink(BuildContext context) async {
    final link = url?.trim();
    if (link == null || link.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No link available for this profile.')),
      );
      return;
    }

    final uri = Uri.tryParse(link);
    if (uri == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('This link is not valid.')),
      );
      return;
    }

    try {
      final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!opened && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to open the link right now.')),
        );
      }
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
          color: enabled ? Colors.white.withAlpha(18) : Colors.white.withAlpha(13),
          border: Border.all(color: enabled ? Colors.white.withAlpha(40) : Colors.white.withAlpha(26)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: enabled ? Colors.white : Colors.white70,
                  ),
            ),
            if (enabled) ...[
              const SizedBox(width: 6),
              const Icon(Icons.open_in_new_rounded, size: 14, color: Colors.white70),
            ],
          ],
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({
    required this.text,
    required this.color,
  });

  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: color.withAlpha(31),
        border: Border.all(color: color.withAlpha(51)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 2,
              color: color.withAlpha(242),
            ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      'accepted' => const Color(0xFF34D399),
      'rejected' => const Color(0xFFF87171),
      'completed' => const Color(0xFF60A5FA),
      _ => const Color(0xFFF5B14C),
    };

    return _Badge(
      text: status,
      color: color,
    );
  }
}

class _LoadingPanel extends StatelessWidget {
  const _LoadingPanel();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 260,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      child: const Center(child: CircularProgressIndicator(strokeWidth: 2.5)),
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
          Text('Unable to load profile', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 10),
          Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
          const SizedBox(height: 14),
          OutlinedButton(
            onPressed: onRetry,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

String _displayRole(String role) {
  if (role.trim().isEmpty) return 'N/A';
  return role[0].toUpperCase() + role.substring(1);
}

String _displayValue(String? value, {String placeholder = 'N/A'}) {
  final text = value?.trim();
  if (text == null || text.isEmpty) return placeholder;
  return text;
}

String _profileSubtitle(UserProfile profile) {
  final parts = <String>[_displayRole(profile.role)];
  if (profile.displayBatch != null) {
    parts.add('Batch ${profile.displayBatch}');
  }
  return parts.join(' • ');
}

String _firstName(String name) {
  final trimmed = name.trim();
  if (trimmed.isEmpty) return 'there';
  final parts = trimmed.split(RegExp(r'\s+'));
  return parts.first;
}

String _friendlyError(Object? error) {
  final text = error.toString();
  if (text.contains('401')) return 'Your session expired. Please sign in again.';
  if (text.contains('SocketException') || text.contains('DioException')) {
    return 'Cannot reach the backend. Check the API URL and network.';
  }
  return 'Something went wrong while loading your profile.';
}

String _count(int? value) => value == null ? 'N/A' : value.toString();

String _leetcodeLabel(CodingLeetCodeStats stats) {
  final parts = <String>[];
  if (stats.easySolved != null) parts.add('Easy ${stats.easySolved}');
  if (stats.mediumSolved != null) parts.add('Med ${stats.mediumSolved}');
  if (stats.hardSolved != null) parts.add('Hard ${stats.hardSolved}');
  return parts.isEmpty ? 'No sync yet' : parts.join(' • ');
}

String _codeforcesLabel(CodingCodeforcesStats stats) {
  final parts = <String>[];
  if (stats.rank != null && stats.rank!.isNotEmpty) parts.add(stats.rank!);
  if (stats.solvedCount != null) parts.add('Solved ${stats.solvedCount}');
  return parts.isEmpty ? 'No sync yet' : parts.join(' • ');
}

String _githubLabel(CodingGitHubStats stats) {
  final parts = <String>[];
  if (stats.projects != null) parts.add('Repos ${stats.projects}');
  if (stats.publicRepos != null) parts.add('Public ${stats.publicRepos}');
  return parts.isEmpty ? 'No sync yet' : parts.join(' • ');
}

String _formatSyncDate(DateTime? date) {
  if (date == null) return 'Never';
  return _formatDate(date);
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


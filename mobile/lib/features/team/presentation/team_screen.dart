import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/widgets/safe_network_image.dart';
import '../data/team_member_item.dart';
import '../data/team_repository.dart';

class TeamScreen extends StatefulWidget {
  const TeamScreen({super.key});

  @override
  State<TeamScreen> createState() => _TeamScreenState();
}

class _TeamScreenState extends State<TeamScreen> {
  Future<List<TeamMemberItem>>? _future;
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= context.read<TeamRepository>().fetchTeam();
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = context.read<TeamRepository>().fetchTeam();
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

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<TeamMemberItem>>(
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

            final members = snapshot.data ?? const <TeamMemberItem>[];
            final groups = _groupMembers(members);
            final totalMembers = groups.fold<int>(0, (sum, group) => sum + group.members.length);

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                _HeroSection(
                  groupCount: groups.length,
                  memberCount: totalMembers,
                ),
                const SizedBox(height: 18),
                _StatGrid(
                  members: totalMembers,
                  years: groups.length,
                  founders: members.where((item) => item.category == 'founder').length,
                  faculty: members.where((item) => item.category == 'faculty').length,
                ),
                const SizedBox(height: 22),
                if (loading)
                  const _LoadingBlock()
                else if (groups.isEmpty)
                  const _EmptyBlock(message: 'Team info coming soon.')
                else ...[
                  _SectionHeader(
                    eyebrow: 'The people',
                    title: 'Our team, organized by year.',
                    description:
                        'Founders and faculty stay fixed in About. This page shows the evolving annual teams, grouped by the year they belong to.',
                  ),
                  const SizedBox(height: 16),
                  ...groups.map(
                    (group) => Padding(
                      padding: const EdgeInsets.only(bottom: 20),
                      child: _YearSection(group: group),
                    ),
                  ),
                ],
              ],
            );
          },
        ),
      ),
    );
  }
}

class _YearGroup {
  _YearGroup({
    required this.year,
    required this.members,
  });

  final String year;
  final List<TeamMemberItem> members;
}

List<_YearGroup> _groupMembers(List<TeamMemberItem> members) {
  final grouped = <String, List<TeamMemberItem>>{};

  for (final member in members) {
    if (member.category == 'founder' || member.category == 'faculty') {
      continue;
    }

    final year = member.teamYear != 0
        ? member.teamYear.toString()
        : (member.batch?.toString() ?? 'Unassigned');
    grouped.putIfAbsent(year, () => []).add(member);
  }

  final groups = grouped.entries.map((entry) {
    final sortedMembers = List<TeamMemberItem>.from(entry.value)
      ..sort((a, b) {
        final orderCompare = a.order.compareTo(b.order);
        if (orderCompare != 0) return orderCompare;
        return a.name.compareTo(b.name);
      });

    return _YearGroup(year: entry.key, members: sortedMembers);
  }).toList();

  groups.sort((a, b) {
    final aYear = int.tryParse(a.year);
    final bYear = int.tryParse(b.year);
    if (aYear != null && bYear != null) return bYear.compareTo(aYear);
    if (aYear != null) return -1;
    if (bYear != null) return 1;
    return b.year.compareTo(a.year);
  });

  return groups;
}

class _HeroSection extends StatelessWidget {
  const _HeroSection({
    required this.groupCount,
    required this.memberCount,
  });

  final int groupCount;
  final int memberCount;

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
        boxShadow: const [
          BoxShadow(color: Color(0x33000000), blurRadius: 40, offset: Offset(0, 18)),
        ],
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'THE PEOPLE',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3.2,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 12),
          Text(
            'Our team, organized by year.',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontSize: 38,
                  height: 1.0,
                ),
          ),
          const SizedBox(height: 12),
          Text(
            'Founders and faculty stay fixed in About. This page shows the evolving annual teams, grouped by the year they belong to.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.6),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _HeroPill(text: '$groupCount years'),
              _HeroPill(text: '$memberCount members'),
              _HeroPill(text: 'Live backend'),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatGrid extends StatelessWidget {
  const _StatGrid({
    required this.members,
    required this.years,
    required this.founders,
    required this.faculty,
  });

  final int members;
  final int years;
  final int founders;
  final int faculty;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.9,
      children: [
        _StatCard(value: '$members+', label: 'Team members'),
        _StatCard(value: '$years', label: 'Year groups'),
        _StatCard(value: '$founders', label: 'Founders'),
        _StatCard(value: '$faculty', label: 'Faculty'),
      ],
    );
  }
}

class _YearSection extends StatelessWidget {
  const _YearSection({required this.group});

  final _YearGroup group;

  @override
  Widget build(BuildContext context) {
    final columns = MediaQuery.of(context).size.width >= 700 ? 2 : 1;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'TEAM YEAR',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        letterSpacing: 3,
                        color: Colors.white54,
                      ),
                ),
                const SizedBox(height: 6),
                Text(group.year, style: Theme.of(context).textTheme.headlineSmall),
              ],
            ),
            Text(
              '${group.members.length} members',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    letterSpacing: 2.2,
                    color: Colors.white54,
                  ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: columns,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: columns == 1 ? 1.0 : 1.35,
          children: group.members.map(_MemberCard.new).toList(),
        ),
      ],
    );
  }
}

class _MemberCard extends StatelessWidget {
  const _MemberCard(this.member);

  final TeamMemberItem member;

  @override
  Widget build(BuildContext context) {
    final badgeColor = switch (member.category) {
      'mentor' => const Color(0xFFF87171),
      'faculty' => const Color(0xFF60A5FA),
      'founder' => const Color(0xFFF5B14C),
      _ => const Color(0xFF34D399),
    };

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
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _Avatar(member: member),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(member.name, style: Theme.of(context).textTheme.titleMedium),
                        _CategoryBadge(text: member.category, color: badgeColor),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(member.role, style: Theme.of(context).textTheme.bodyMedium),
                    if (_displaySubtitle(member).isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(_displaySubtitle(member), style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (member.teamYear != 0) _MiniChip(text: 'Team ${member.teamYear}'),
              if (member.batch != null) _MiniChip(text: 'Batch ${member.batch}'),
              ...member.domain.take(3).map((domain) => _MiniChip(text: domain)),
              if (member.domain.isEmpty) const _MiniChip(text: 'Team'),
            ],
          ),
          const Spacer(),
          if (member.github != null || member.linkedin != null)
            Wrap(
              spacing: 12,
              children: [
                if (member.github != null)
                  _LinkText(label: 'GitHub', url: member.github!),
                if (member.linkedin != null)
                  _LinkText(label: 'LinkedIn', url: member.linkedin!),
              ],
            ),
        ],
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.member});

  final TeamMemberItem member;

  @override
  Widget build(BuildContext context) {
    final initial = member.name.isNotEmpty ? member.name[0].toUpperCase() : 'C';
    final imageUrl = member.imageUrl;

    return Container(
      height: 66,
      width: 66,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: const Color(0xFF3B4A63),
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
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

class _CategoryBadge extends StatelessWidget {
  const _CategoryBadge({
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
        border: Border.all(color: color.withAlpha(51)),
        color: color.withAlpha(26),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      child: Text(
        text.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 0.9,
              color: color,
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
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      child: Text(text, style: Theme.of(context).textTheme.labelSmall),
    );
  }
}

class _LinkText extends StatelessWidget {
  const _LinkText({
    required this.label,
    required this.url,
  });

  final String label;
  final String url;

  @override
  Widget build(BuildContext context) {
    final parsed = Uri.tryParse(url);
    final host = parsed?.host ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: Colors.white70,
                decoration: TextDecoration.underline,
                decorationColor: Colors.white38,
              ),
        ),
        const SizedBox(height: 2),
        Text(
          host.isNotEmpty ? host : url,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: Colors.white38,
              ),
        ),
      ],
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
                letterSpacing: 2.6,
                color: Colors.white54,
              ),
        ),
        const SizedBox(height: 6),
        Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 24)),
        const SizedBox(height: 6),
        Text(
          description,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
        ),
      ],
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
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(10),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Unable to load team data', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
          const SizedBox(height: 14),
          OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
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

String _displaySubtitle(TeamMemberItem member) {
  return member.subtitle?.trim() ?? '';
}

String _friendlyError(Object? error) {
  final text = error.toString();
  if (text.contains('401')) return 'Your session expired. Please sign in again.';
  if (text.contains('SocketException') || text.contains('DioException')) {
    return 'Cannot reach the backend. Check the API URL and network.';
  }
  return 'Something went wrong while loading the team.';
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/widgets/safe_network_image.dart';
import '../../team/data/team_member_item.dart';
import '../../team/data/team_repository.dart';

class AboutScreen extends StatefulWidget {
  const AboutScreen({super.key});

  @override
  State<AboutScreen> createState() => _AboutScreenState();
}

class _AboutScreenState extends State<AboutScreen> {
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
      setState(() => _errorMessage = _friendlyError(error));
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
                  _ErrorPanel(message: _errorMessage ?? _friendlyError(snapshot.error), onRetry: _refresh),
                ],
              );
            }

            final members = snapshot.data ?? const <TeamMemberItem>[];
            final founders = members.where((m) => m.category == 'founder').toList();
            final faculty = members.where((m) => m.category == 'faculty').toList();

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                _HeroSection(),
                const SizedBox(height: 18),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final stacked = constraints.maxWidth < 700;
                    if (stacked) {
                      return const Column(
                        children: [
                          _InfoCard(title: 'Mission', body: 'To build a strong technical community where every student, regardless of background, gets access to guidance, projects, and opportunities through peer mentorship and collaboration.'),
                          SizedBox(height: 10),
                          _InfoCard(title: 'Vision', body: 'To make CodeWizards the most impactful student-led technical club in Maharashtra, producing developers, researchers, and innovators who give back to the community.'),
                        ],
                      );
                    }
                    return const Row(
                      children: [
                        Expanded(child: _InfoCard(title: 'Mission', body: 'To build a strong technical community where every student, regardless of background, gets access to guidance, projects, and opportunities through peer mentorship and collaboration.')),
                        SizedBox(width: 10),
                        Expanded(child: _InfoCard(title: 'Vision', body: 'To make CodeWizards the most impactful student-led technical club in Maharashtra, producing developers, researchers, and innovators who give back to the community.')),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 18),
                if (loading)
                  const _LoadingBlock()
                else ...[
                  _SectionHeader(title: 'Founders', count: founders.length, tone: 'FOUNDER'),
                  const SizedBox(height: 12),
                  if (founders.isEmpty)
                    const _EmptyBlock(message: 'No founders found.')
                  else
                    ...founders.map((member) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _MemberCard(member: member),
                        )),
                  const SizedBox(height: 10),
                  _SectionHeader(title: 'Faculty coordinators', count: faculty.length, tone: 'FACULTY'),
                  const SizedBox(height: 12),
                  if (faculty.isEmpty)
                    const _EmptyBlock(message: 'No faculty coordinators found.')
                  else
                    ...faculty.map((member) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _MemberCard(member: member),
                        )),
                ],
              ],
            );
          },
        ),
      ),
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
            'WHO WE ARE',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3.2,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 12),
          Text(
            'About CodeWizards',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 38),
          ),
          const SizedBox(height: 12),
          Text(
            'We are building a student-led technical community with shared visibility, clear ownership, and admin-managed team profiles that can evolve with the club.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.6),
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(10),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 2.6,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 10),
          Text(body, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.6)),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.title,
    required this.count,
    required this.tone,
  });

  final String title;
  final int count;
  final String tone;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title.toUpperCase(),
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    letterSpacing: 3,
                    color: Colors.white54,
                  ),
            ),
            const SizedBox(height: 6),
            Text(title, style: Theme.of(context).textTheme.titleLarge),
          ],
        ),
        Text(
          '$count members',
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                letterSpacing: 2.2,
                color: Colors.white54,
              ),
        ),
      ],
    );
  }
}

class _MemberCard extends StatelessWidget {
  const _MemberCard({required this.member});

  final TeamMemberItem member;

  @override
  Widget build(BuildContext context) {
    final isFounder = member.category == 'founder';
    final isFaculty = member.category == 'faculty';
    final accent = isFounder ? const Color(0xFFF5B14C) : const Color(0xFF5CC8FF);

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
                    _Badge(text: member.category.toUpperCase(), color: accent),
                  ],
                ),
                const SizedBox(height: 4),
                Text(member.role, style: Theme.of(context).textTheme.bodyMedium),
                if ((member.subtitle ?? '').isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(member.subtitle!, style: Theme.of(context).textTheme.bodySmall),
                ],
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (member.batch != null) _MiniChip(text: 'Batch ${member.batch}'),
                    if (isFounder) const _MiniChip(text: 'Founding Team'),
                    if (isFaculty) const _MiniChip(text: 'Computer Science & Engineering'),
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

class _Avatar extends StatelessWidget {
  const _Avatar({required this.member});

  final TeamMemberItem member;

  @override
  Widget build(BuildContext context) {
    final initial = member.name.isNotEmpty ? member.name[0].toUpperCase() : 'C';

    return Container(
      height: 64,
      width: 64,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: const Color(0xFF3B4A63),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      clipBehavior: Clip.antiAlias,
      child: SafeNetworkImage(
        imageUrl: member.imageUrl,
        fit: BoxFit.cover,
        placeholder: Center(child: Text(initial, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700))),
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
        border: Border.all(color: color.withAlpha(51)),
        color: color.withAlpha(26),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      child: Text(
        text,
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
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withAlpha(20)),
        color: Colors.white.withAlpha(10),
      ),
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
          Text('Unable to load about data', style: Theme.of(context).textTheme.titleLarge),
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
  return 'Something went wrong while loading the about section.';
}

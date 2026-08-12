// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../auth/data/user_profile.dart';
import '../data/coding_profile_item.dart';

class ContributionsScreen extends StatelessWidget {
  const ContributionsScreen({
    super.key,
    required this.profile,
    this.codingProfile,
  });

  final UserProfile profile;
  final CodingProfileItem? codingProfile;

  Future<void> _openLink(BuildContext context, String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Unable to open link.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final github = profile.socialLinks.github;
    final linkedin = profile.socialLinks.linkedin;
    final leetcode = profile.leetcodeUsername;
    final codeforces = profile.codeforcesHandle;

    final hasGithub = github != null && github.isNotEmpty;
    final hasLinkedin = linkedin != null && linkedin.isNotEmpty;
    final hasLeetcode = leetcode != null && leetcode.isNotEmpty;
    final hasCodeforces = codeforces != null && codeforces.isNotEmpty;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text('Public links & contributions'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const Text(
              'Public links',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 13,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                color: Colors.white.withAlpha(8),
                border: Border.all(color: Colors.white.withAlpha(12)),
              ),
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Column(
                children: [
                  _LinkRow(
                    icon: Icons.code_rounded,
                    label: 'GitHub',
                    value: hasGithub ? github : 'github.com/username',
                    onTap: hasGithub ? () => _openLink(context, github) : null,
                  ),
                  const Divider(color: Colors.white10),
                  _LinkRow(
                    icon: Icons.link_rounded,
                    label: 'LinkedIn',
                    value: hasLinkedin ? linkedin : 'linkedin.com/in/username',
                    onTap: hasLinkedin
                        ? () => _openLink(context, linkedin)
                        : null,
                  ),
                  const Divider(color: Colors.white10),
                  _LinkRow(
                    icon: Icons.terminal_rounded,
                    label: 'LeetCode',
                    value: hasLeetcode ? 'leetcode.com/$leetcode' : 'leetcode.com/username',
                    onTap: hasLeetcode ? () => _openLink(context, 'https://leetcode.com/$leetcode') : null,
                  ),
                  const Divider(color: Colors.white10),
                  _LinkRow(
                    icon: Icons.analytics_outlined,
                    label: 'Codeforces',
                    value: hasCodeforces ? 'codeforces.com/profile/$codeforces' : 'codeforces.com/profile/username',
                    onTap: hasCodeforces ? () => _openLink(context, 'https://codeforces.com/profile/$codeforces') : null,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Coding contributions',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: Colors.white.withAlpha(8),
                    border: Border.all(color: Colors.white.withAlpha(12)),
                  ),
                  child: Row(
                    children: const [
                      Text(
                        'Last 30 days',
                        style: TextStyle(color: Colors.white60, fontSize: 10),
                      ),
                      SizedBox(width: 4),
                      Icon(
                        Icons.keyboard_arrow_down_rounded,
                        color: Colors.white60,
                        size: 14,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.35,
              children: [
                _StatBlock(
                  color: const Color(0xFF34D399),
                  value: profile.leetcodeUsername != null && profile.leetcodeUsername!.isNotEmpty
                      ? (codingProfile?.leetcode.totalSolved?.toString() ?? '0')
                      : 'N/A',
                  label: 'LeetCode Solved',
                  sub: profile.leetcodeUsername != null && profile.leetcodeUsername!.isNotEmpty
                      ? 'Easy ${codingProfile?.leetcode.easySolved ?? 0} · Med ${codingProfile?.leetcode.mediumSolved ?? 0} · Hard ${codingProfile?.leetcode.hardSolved ?? 0}'
                      : 'Account not linked',
                  icon: Icons.check_circle_outline_rounded,
                ),
                _StatBlock(
                  color: const Color(0xFF5CC8FF),
                  value: profile.codeforcesHandle != null && profile.codeforcesHandle!.isNotEmpty
                      ? (codingProfile?.codeforces.rating?.toString() ?? '0')
                      : 'N/A',
                  label: 'Codeforces Rating',
                  sub: profile.codeforcesHandle != null && profile.codeforcesHandle!.isNotEmpty
                      ? 'Max ${codingProfile?.codeforces.maxRating ?? 0} · ${codingProfile?.codeforces.rank ?? "Unrated"}'
                      : 'Account not linked',
                  icon: Icons.trending_up_rounded,
                ),
                _StatBlock(
                  color: const Color(0xFF8B5CF6),
                  value: profile.githubUsername != null && profile.githubUsername!.isNotEmpty
                      ? (codingProfile?.github.contributions?.toString() ?? '0')
                      : 'N/A',
                  label: 'GitHub Contributions',
                  sub: profile.githubUsername != null && profile.githubUsername!.isNotEmpty
                      ? 'Repos: ${codingProfile?.github.publicRepos ?? 0} · Followers: ${codingProfile?.github.followers ?? 0}'
                      : 'Account not linked',
                  icon: Icons.code_rounded,
                ),
                _StatBlock(
                  color: const Color(0xFFFBBF24),
                  value: codingProfile != null && codingProfile!.hasAnyData ? 'Active' : 'N/A',
                  label: 'Profile Sync',
                  sub: codingProfile != null && codingProfile!.hasAnyData
                      ? 'Platform Sync Connected'
                      : 'Sync profiles in Settings',
                  icon: Icons.sync_rounded,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _LinkRow extends StatelessWidget {
  const _LinkRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final String value;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        height: 36,
        width: 36,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          color: Colors.white.withAlpha(8),
        ),
        child: Icon(icon, color: Colors.white70, size: 18),
      ),
      title: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.bold,
        ),
      ),
      subtitle: Text(
        value,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(color: Colors.white.withAlpha(120), fontSize: 11),
      ),
      trailing: onTap != null
          ? const Icon(
              Icons.arrow_outward_rounded,
              color: Colors.white60,
              size: 16,
            )
          : null,
      onTap: onTap,
    );
  }
}

class _StatBlock extends StatelessWidget {
  const _StatBlock({
    required this.color,
    required this.value,
    required this.label,
    required this.sub,
    required this.icon,
  });

  final Color color;
  final String value;
  final String label;
  final String sub;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: Colors.white.withAlpha(8),
        border: Border.all(color: Colors.white.withAlpha(12)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                value,
                style: TextStyle(
                  color: color,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Icon(icon, color: color.withAlpha(180), size: 18),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            sub,
            style: TextStyle(color: Colors.white.withAlpha(100), fontSize: 8),
          ),
        ],
      ),
    );
  }
}

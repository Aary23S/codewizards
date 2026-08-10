import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../auth/data/user_profile.dart';
import '../../home/data/project_item.dart';
import '../../explore/data/explore_repository.dart';
import '../data/coding_profile_item.dart';
import '../data/mentorship_request_item.dart';
import '../data/profile_repository.dart';

class GrowthInsightsWidget extends StatefulWidget {
  const GrowthInsightsWidget({
    super.key,
    required this.profile,
    required this.requests,
    required this.codingProfile,
  });

  final UserProfile profile;
  final List<MentorshipRequestItem> requests;
  final CodingProfileItem? codingProfile;

  @override
  State<GrowthInsightsWidget> createState() => _GrowthInsightsWidgetState();
}

class _GrowthInsightsWidgetState extends State<GrowthInsightsWidget> {
  bool _loading = true;
  List<Map<String, dynamic>> _connections = [];
  List<Map<String, dynamic>> _goals = [];
  List<ProjectItem> _projects = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final profileRepo = context.read<ProfileRepository>();
    final exploreRepo = context.read<ExploreRepository>();

    try {
      final results = await Future.wait([
        profileRepo.fetchMyMentors().catchError((_) => <Map<String, dynamic>>[]),
        profileRepo.fetchMyMentees().catchError((_) => <Map<String, dynamic>>[]),
        exploreRepo.fetchProjects().catchError((_) => <ProjectItem>[]),
      ]);

      final mentors = results[0] as List<Map<String, dynamic>>;
      final mentees = results[1] as List<Map<String, dynamic>>;
      final projectsList = results[2] as List<ProjectItem>;

      final activeConn = [...mentors, ...mentees];

      List<Map<String, dynamic>> goalsList = [];
      if (activeConn.isNotEmpty) {
        final connId = (activeConn[0]['_id'] ?? activeConn[0]['id'] ?? '') as String;
        goalsList = await profileRepo.fetchGoals(connId).catchError((_) => <Map<String, dynamic>>[]);
      }

      if (mounted) {
        setState(() {
          _connections = activeConn;
          _projects = projectsList;
          _goals = goalsList;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 40.0),
          child: CircularProgressIndicator(),
        ),
      );
    }

    // Calculations using coding profile directly
    final leetcodeSolved = widget.codingProfile?.leetcode.totalSolved ?? 0;
    final githubContribs = widget.codingProfile?.github.contributions ?? 0;
    final codeforcesRating = widget.codingProfile?.codeforces.rating ?? 0;

    final myProjectsCount = _projects.where((p) => p.contributors.contains(widget.profile.name)).length;

    // Mentor Recommendations
    final activeGoal = _goals.isNotEmpty ? _goals[0] : null;
    final activeGoalTasks = activeGoal != null ? List<Map<String, dynamic>>.from((activeGoal['tasks'] as List? ?? const []).map((e) => Map<String, dynamic>.from(e as Map))) : <Map<String, dynamic>>[];
    final completedTasks = activeGoalTasks.where((t) => t['isCompleted'] == true).length;
    final totalTasks = activeGoalTasks.length;
    final goalProgress = totalTasks > 0 ? completedTasks / totalTasks : 0.0;

    // Rule-Based Learning Focus using nested social links
    final focusItems = <Map<String, String>>[];
    if (widget.profile.socialLinks.github == null || widget.profile.socialLinks.github!.isEmpty) {
      focusItems.add({
        'emoji': '🐙',
        'title': 'Connect GitHub profile',
        'desc': 'Showcase your repositories and contributions to highlight coding consistency.',
      });
    }
    if (leetcodeSolved < 50) {
      focusItems.add({
        'emoji': '🏆',
        'title': 'Improve DSA consistency',
        'desc': 'Aim to solve 3-5 daily LeetCode problems to improve logic building skills.',
      });
    }
    if (myProjectsCount < 2) {
      focusItems.add({
        'emoji': '💻',
        'title': 'Complete a React/Node project',
        'desc': 'You have the coding basics. Build a project to master real-world skills.',
      });
    }
    if (widget.profile.socialLinks.linkedin == null || widget.profile.socialLinks.linkedin!.isEmpty) {
      focusItems.add({
        'emoji': '💼',
        'title': 'Connect LinkedIn profile',
        'desc': 'Update your profile to connect with professional mentors and recruiters.',
      });
    }
    if (focusItems.isEmpty) {
      focusItems.add({
        'emoji': '🚀',
        'title': 'All baseline focus items complete',
        'desc': 'Focus on advanced mock interviews and system design topics with your mentor.',
      });
    }

    // Placement Readiness Checklist using nested social links
    final hasResume = widget.profile.socialLinks.portfolio != null && widget.profile.socialLinks.portfolio!.isNotEmpty;
    final hasGithub = widget.profile.socialLinks.github != null && widget.profile.socialLinks.github!.isNotEmpty;
    final hasLinkedin = widget.profile.socialLinks.linkedin != null && widget.profile.socialLinks.linkedin!.isNotEmpty;
    final hasProjectsMilestone = myProjectsCount >= 2;
    final hasMentorship = _connections.isNotEmpty;
    final hasMockInterview = _goals.any((g) => (g['tasks'] as List? ?? const []).any((t) => (t['title'] as String).toLowerCase().contains('interview') && t['isCompleted'] == true));

    final checklist = [
      {'label': 'Resume Added', 'completed': hasResume},
      {'label': 'GitHub Connected', 'completed': hasGithub},
      {'label': 'LinkedIn Connected', 'completed': hasLinkedin},
      {'label': '2+ Projects Added', 'completed': hasProjectsMilestone},
      {'label': 'Mentor Connected', 'completed': hasMentorship},
      {'label': 'Mock Interview Completed', 'completed': hasMockInterview},
    ];

    final completedChecksCount = checklist.where((c) => c['completed'] == true).length;
    final readinessPercentage = ((completedChecksCount / checklist.length) * 100).round();

    // Timeline compiler
    final timeline = <Map<String, dynamic>>[
      {
        'type': 'PROFILE',
        'title': 'Updated Profile Details',
        'date': DateTime.now(),
        'color': const Color(0xFF5CC8FF),
      }
    ];

    if (hasMentorship && _connections[0]['startedAt'] != null) {
      timeline.add({
        'type': 'MENTORSHIP',
        'title': 'Joined Mentorship Connection',
        'date': DateTime.tryParse(_connections[0]['startedAt'] ?? '') ?? DateTime.now(),
        'color': const Color(0xFF34D399),
      });
    }

    for (final p in _projects.where((p) => p.contributors.contains(widget.profile.name))) {
      timeline.add({
        'type': 'PROJECT',
        'title': 'Contributed to ${p.title}',
        'date': p.createdAt ?? DateTime.now(),
        'color': const Color(0xFFF5B14C),
      });
    }

    for (final g in _goals) {
      for (final t in List<Map<String, dynamic>>.from((g['tasks'] as List? ?? const []).map((e) => Map<String, dynamic>.from(e as Map)))) {
        if (t['isCompleted'] == true && t['completedAt'] != null) {
          timeline.add({
            'type': 'TASK',
            'title': 'Completed: ${t['title']}',
            'date': DateTime.tryParse(t['completedAt'] ?? '') ?? DateTime.now(),
            'color': const Color(0xFFA78BFA),
          });
        }
      }
    }

    timeline.sort((a, b) => (b['date'] as DateTime).compareTo(a['date'] as DateTime));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Coding Summary
        _buildSectionHeader('1. Coding Profile Summary'),
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            color: Colors.white.withAlpha(10),
            border: Border.all(color: Colors.white.withAlpha(20)),
          ),
          padding: const EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildCodingStatCard('LeetCode', '$leetcodeSolved', const Color(0xFF34D399)),
              _buildCodingStatCard('GitHub', '$githubContribs', const Color(0xFF5CC8FF)),
              _buildCodingStatCard('Codeforces', '$codeforcesRating', const Color(0xFFA78BFA)),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // 2. Mentor Recommendations
        _buildSectionHeader('2. Mentor Recommendations'),
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            color: Colors.white.withAlpha(10),
            border: Border.all(color: Colors.white.withAlpha(20)),
          ),
          padding: const EdgeInsets.all(16),
          child: !hasMentorship
              ? const Text('No active mentorship connections found.', style: TextStyle(color: Colors.white60))
              : activeGoal == null
                  ? const Text('No active mentorship goals set yet.', style: TextStyle(color: Colors.white60))
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          activeGoal['title'] ?? 'Goal',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Progress: ${(goalProgress * 100).round()}%', style: const TextStyle(fontSize: 11, color: Colors.white38)),
                            Text('$completedTasks / $totalTasks completed', style: const TextStyle(fontSize: 11, color: Colors.white38)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(99),
                          child: LinearProgressIndicator(
                            value: goalProgress,
                            backgroundColor: Colors.white10,
                            color: const Color(0xFF34D399),
                            minHeight: 4,
                          ),
                        ),
                        if (activeGoalTasks.isNotEmpty) ...[
                          const SizedBox(height: 12),
                          ...activeGoalTasks.take(3).map((t) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4.0),
                                child: Row(
                                  children: [
                                    Icon(
                                      t['isCompleted'] == true ? Icons.check_circle_outline_rounded : Icons.radio_button_unchecked_rounded,
                                      size: 14,
                                      color: t['isCompleted'] == true ? const Color(0xFF34D399) : Colors.white38,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        t['title'] ?? 'Task',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: t['isCompleted'] == true ? Colors.white38 : Colors.white70,
                                          decoration: t['isCompleted'] == true ? TextDecoration.lineThrough : null,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              )),
                        ],
                      ],
                    ),
        ),
        const SizedBox(height: 24),

        // 3. Learning Focus
        _buildSectionHeader('3. Learning Focus'),
        ...focusItems.map((item) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: Colors.white.withAlpha(6),
                border: Border.all(color: Colors.white.withAlpha(10)),
              ),
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item['emoji'] ?? '💡', style: const TextStyle(fontSize: 20)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item['title'] ?? '', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                        const SizedBox(height: 4),
                        Text(item['desc'] ?? '', style: TextStyle(fontSize: 11, color: Colors.white.withAlpha(150), height: 1.4)),
                      ],
                    ),
                  ),
                ],
              ),
            )),
        const SizedBox(height: 24),

        // 4. Placement Readiness
        _buildSectionHeader('4. Placement Readiness'),
        Container(
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
                  const Text('Overall Readiness', style: TextStyle(fontSize: 13, color: Colors.white60)),
                  Text('$readinessPercentage% Ready', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF5CC8FF))),
                ],
              ),
              const SizedBox(height: 16),
              ...checklist.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6.0),
                    child: Row(
                      children: [
                        Container(
                          height: 16,
                          width: 16,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: item['completed'] == true ? const Color(0xFF34D399).withAlpha(30) : Colors.white.withAlpha(10),
                            border: Border.all(color: item['completed'] == true ? const Color(0xFF34D399).withAlpha(60) : Colors.white10),
                          ),
                          child: item['completed'] == true
                              ? const Center(child: Icon(Icons.check, size: 10, color: Color(0xFF34D399)))
                              : null,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          item['label'] as String,
                          style: TextStyle(
                            fontSize: 13,
                            color: item['completed'] == true ? Colors.white : Colors.white38,
                          ),
                        ),
                      ],
                    ),
                  )),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // 5. Recent Activity
        _buildSectionHeader('5. Recent Activity Timeline'),
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            color: Colors.white.withAlpha(10),
            border: Border.all(color: Colors.white.withAlpha(20)),
          ),
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 20),
          child: timeline.isEmpty
              ? const Text('No activities recorded.', style: TextStyle(color: Colors.white38))
              : ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: timeline.length,
                  itemBuilder: (context, idx) {
                    final item = timeline[idx];
                    final color = item['color'] as Color;
                    final type = item['type'] as String;
                    final title = item['title'] as String;
                    final date = item['date'] as DateTime;

                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Column(
                          children: [
                            Container(
                              height: 10,
                              width: 10,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: color,
                                border: Border.all(color: Colors.black, width: 2),
                              ),
                            ),
                            if (idx < timeline.length - 1)
                              Container(
                                height: 40,
                                width: 1,
                                color: Colors.white10,
                              ),
                          ],
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(type, style: TextStyle(fontSize: 9, color: Colors.white38, letterSpacing: 1, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 2),
                              Text(title, style: const TextStyle(fontSize: 12, color: Colors.white70)),
                              const SizedBox(height: 2),
                              Text(
                                '${date.day}/${date.month}/${date.year}',
                                style: const TextStyle(fontSize: 10, color: Colors.white30),
                              ),
                              const SizedBox(height: 12),
                            ],
                          ),
                        ),
                      ],
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontSize: 10,
          letterSpacing: 2,
          fontWeight: FontWeight.bold,
          color: Colors.white38,
        ),
      ),
    );
  }

  Widget _buildCodingStatCard(String platform, String score, Color accent) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: Colors.white.withAlpha(6),
          border: Border.all(color: Colors.white.withAlpha(10)),
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Text(platform, style: const TextStyle(fontSize: 10, color: Colors.white38)),
            const SizedBox(height: 6),
            Text(
              score,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: accent),
            ),
          ],
        ),
      ),
    );
  }
}

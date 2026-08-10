// ignore_for_file: use_build_context_synchronously, unused_import

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../auth/auth_controller.dart';
import '../../auth/data/user_profile.dart';
import '../../../core/widgets/safe_network_image.dart';
import '../data/profile_repository.dart';

class ConnectionsScreen extends StatefulWidget {
  const ConnectionsScreen({super.key});

  @override
  State<ConnectionsScreen> createState() => _ConnectionsScreenState();
}

class _ConnectionsScreenState extends State<ConnectionsScreen> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _mentors = [];
  List<Map<String, dynamic>> _mentees = [];

  final Set<String> _expandedIds = {};
  final Map<String, Map<String, dynamic>> _contacts = {};
  final Set<String> _loadingContacts = {};

  final Map<String, List<Map<String, dynamic>>> _goals = {};
  final Set<String> _loadingGoals = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final user = context.read<AuthController>().user;
    final repo = context.read<ProfileRepository>();

    try {
      if (user?.role == 'student') {
        final mentorsList = await repo.fetchMyMentors();
        if (mounted) {
          setState(() {
            _mentors = mentorsList;
            _mentees = [];
          });
        }
      } else {
        final results = await Future.wait([
          repo.fetchMyMentors().catchError((_) => <Map<String, dynamic>>[]),
          repo.fetchMyMentees().catchError((_) => <Map<String, dynamic>>[]),
        ]);
        if (mounted) {
          setState(() {
            _mentors = results[0];
            _mentees = results[1];
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error =
              'Failed to load mentorship connections. Check your connection.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _toggleExpand(String connId) async {
    if (_expandedIds.contains(connId)) {
      setState(() {
        _expandedIds.remove(connId);
      });
      return;
    }

    setState(() {
      _expandedIds.add(connId);
    });

    final repo = context.read<ProfileRepository>();

    // Fetch contact details if not loaded
    if (!_contacts.containsKey(connId)) {
      setState(() {
        _loadingContacts.add(connId);
      });
      try {
        final contactData = await repo.fetchMentorshipContact(connId);
        if (mounted) {
          setState(() {
            _contacts[connId] = contactData;
          });
        }
      } catch (e) {
        debugPrint('Failed to load contact: $e');
      } finally {
        if (mounted) {
          setState(() {
            _loadingContacts.remove(connId);
          });
        }
      }
    }

    // Fetch goals if not loaded
    if (!_goals.containsKey(connId)) {
      setState(() {
        _loadingGoals.add(connId);
      });
      try {
        final goalsData = await repo.fetchGoals(connId);
        if (mounted) {
          setState(() {
            _goals[connId] = goalsData;
          });
        }
      } catch (e) {
        debugPrint('Failed to load goals: $e');
      } finally {
        if (mounted) {
          setState(() {
            _loadingGoals.remove(connId);
          });
        }
      }
    }
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.tryParse(url.trim());
    if (uri == null) return;
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }

  Widget _buildAvatar(Map<String, dynamic> userMap) {
    final name = (userMap['name'] as String?) ?? 'Member';
    final initial = name.isNotEmpty ? name.trim()[0].toUpperCase() : 'U';
    final imageUrl = userMap['imageUrl'] as String?;

    return Container(
      height: 52,
      width: 52,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: const Color(0xFF5CC8FF).withAlpha(40),
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
              color: Colors.white70,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildConnectionCard(Map<String, dynamic> conn, bool isMentorCard) {
    final connId = (conn['_id'] ?? conn['id'] ?? '') as String;
    final targetUserMap = Map<String, dynamic>.from(
      (isMentorCard ? conn['mentorId'] : conn['studentId']) as Map? ?? const {},
    );

    final name = (targetUserMap['name'] as String?) ?? 'Member';
    final bio = targetUserMap['bio'] as String?;
    final domains = List<String>.from(
      targetUserMap['domain'] as List? ?? const [],
    );
    final batch = targetUserMap['batch'] as int?;

    final isExpanded = _expandedIds.contains(connId);
    final loadingContact = _loadingContacts.contains(connId);
    final contactDetails = _contacts[connId] ?? const {};

    final loadingGoal = _loadingGoals.contains(connId);
    final connGoals = _goals[connId] ?? [];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                _buildAvatar(targetUserMap),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${isMentorCard ? 'Mentor' : 'Student'}${batch != null ? ' • Batch $batch' : ''}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white.withAlpha(140),
                        ),
                      ),
                    ],
                  ),
                ),
                TextButton(
                  onPressed: () => _toggleExpand(connId),
                  style: TextButton.styleFrom(
                    foregroundColor: const Color(0xFF5CC8FF),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: Text(isExpanded ? 'Hide' : 'View'),
                ),
              ],
            ),
          ),
          if (isExpanded) ...[
            const Divider(height: 1, color: Colors.white10),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (bio != null && bio.trim().isNotEmpty) ...[
                    const Text(
                      'BIOGRAPHY',
                      style: TextStyle(
                        fontSize: 9,
                        letterSpacing: 2,
                        fontWeight: FontWeight.w600,
                        color: Colors.white38,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      bio,
                      style: TextStyle(
                        fontSize: 13,
                        height: 1.5,
                        color: Colors.white.withAlpha(200),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  if (domains.isNotEmpty) ...[
                    const Text(
                      'DOMAINS',
                      style: TextStyle(
                        fontSize: 9,
                        letterSpacing: 2,
                        fontWeight: FontWeight.w600,
                        color: Colors.white38,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: domains
                          .map(
                            (d) => Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(999),
                                color: const Color(0xFFF5B14C).withAlpha(20),
                                border: Border.all(
                                  color: const Color(0xFFF5B14C).withAlpha(40),
                                ),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              child: Text(
                                d,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFFF5B14C),
                                ),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 16),
                  ],
                  const Text(
                    'CONTACT CHANNEL',
                    style: TextStyle(
                      fontSize: 9,
                      letterSpacing: 2,
                      fontWeight: FontWeight.w600,
                      color: Colors.white38,
                    ),
                  ),
                  const SizedBox(height: 8),
                  if (loadingContact)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8.0),
                      child: SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                  else if (contactDetails.isEmpty)
                    Text(
                      'No contact channels are currently shared by this user.',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withAlpha(120),
                      ),
                    )
                  else
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        if (contactDetails['email'] != null)
                          _buildContactChip(
                            icon: Icons.email_rounded,
                            label: 'Email',
                            onTap: () =>
                                _launchUrl('mailto:${contactDetails['email']}'),
                          ),
                        if (contactDetails['phone'] != null)
                          _buildContactChip(
                            icon: Icons.phone_rounded,
                            label: 'Call',
                            onTap: () =>
                                _launchUrl('tel:${contactDetails['phone']}'),
                          ),
                        if (contactDetails['whatsapp'] != null)
                          _buildContactChip(
                            icon: Icons.chat_bubble_rounded,
                            label: 'WhatsApp',
                            onTap: () {
                              final phoneClean =
                                  (contactDetails['whatsapp'] as String)
                                      .replaceAll(RegExp(r'\D'), '');
                              _launchUrl('https://wa.me/$phoneClean');
                            },
                          ),
                        if (contactDetails['discord'] != null)
                          _buildContactChip(
                            icon: Icons.discord,
                            label: 'Discord',
                            onTap: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    'Discord ID copied: ${contactDetails['discord']}',
                                  ),
                                ),
                              );
                            },
                          ),
                      ],
                    ),
                  const SizedBox(height: 24),
                  const Divider(color: Colors.white10),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'MENTORSHIP GOALS',
                        style: TextStyle(
                          fontSize: 9,
                          letterSpacing: 2,
                          fontWeight: FontWeight.w600,
                          color: Colors.white38,
                        ),
                      ),
                      if (!isMentorCard) // If logged in user is the mentor
                        TextButton.icon(
                          onPressed: () => _showAddGoalDialog(connId),
                          icon: const Icon(Icons.add, size: 14),
                          label: const Text(
                            'Add Goal',
                            style: TextStyle(fontSize: 12),
                          ),
                          style: TextButton.styleFrom(
                            foregroundColor: const Color(0xFF5CC8FF),
                            padding: EdgeInsets.zero,
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (loadingGoal)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8.0),
                      child: SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                  else if (connGoals.isEmpty)
                    Text(
                      'No goals set for this connection yet.',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withAlpha(120),
                      ),
                    )
                  else
                    ...connGoals.map(
                      (g) => _buildGoalItem(connId, g, !isMentorCard),
                    ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildGoalItem(
    String connId,
    Map<String, dynamic> goal,
    bool isMentor,
  ) {
    final goalId = goal['_id'] as String;
    final title = (goal['title'] as String?) ?? 'Goal';
    final description = goal['description'] as String?;
    final tasksList = List<Map<String, dynamic>>.from(
      (goal['tasks'] as List? ?? const []).map(
        (e) => Map<String, dynamic>.from(e as Map),
      ),
    );

    final completedCount = tasksList
        .where((t) => t['isCompleted'] == true)
        .length;
    final totalCount = tasksList.length;
    final progress = totalCount > 0 ? completedCount / totalCount : 0.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Colors.white.withAlpha(6),
        border: Border.all(color: Colors.white.withAlpha(10)),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              if (isMentor)
                IconButton(
                  onPressed: () => _deleteGoal(connId, goalId),
                  icon: const Icon(
                    Icons.delete_outline,
                    size: 18,
                    color: Colors.redAccent,
                  ),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
            ],
          ),
          if (description != null && description.trim().isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              description,
              style: TextStyle(
                fontSize: 12,
                color: Colors.white.withAlpha(120),
              ),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Progress: ${(progress * 100).round()}%',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.white.withAlpha(150),
                ),
              ),
              Text(
                '$completedCount / $totalCount completed',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.white.withAlpha(150),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(99),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.white.withAlpha(10),
              color: const Color(0xFF5CC8FF),
              minHeight: 4,
            ),
          ),
          if (tasksList.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Divider(color: Colors.white10),
            ...tasksList.map((task) {
              final taskId = task['_id'] as String;
              final isCompleted = task['isCompleted'] == true;
              return InkWell(
                onTap: () =>
                    _toggleTask(connId, goalId, taskId, isCompleted, tasksList),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6.0),
                  child: Row(
                    children: [
                      Icon(
                        isCompleted
                            ? Icons.check_box
                            : Icons.check_box_outline_blank,
                        size: 18,
                        color: isCompleted
                            ? const Color(0xFF34D399)
                            : Colors.white38,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          (task['title'] as String?) ?? 'Task',
                          style: TextStyle(
                            fontSize: 13,
                            color: isCompleted
                                ? Colors.white38
                                : Colors.white70,
                            decoration: isCompleted
                                ? TextDecoration.lineThrough
                                : null,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ],
      ),
    );
  }

  Future<void> _toggleTask(
    String connId,
    String goalId,
    String taskId,
    bool currentVal,
    List<Map<String, dynamic>> currentTasks,
  ) async {
    final updatedTasks = currentTasks.map((t) {
      if (t['_id'] == taskId) {
        return {...t, 'isCompleted': !currentVal};
      }
      return t;
    }).toList();

    setState(() {
      _goals[connId] = _goals[connId]!.map((g) {
        if (g['_id'] == goalId) {
          return {...g, 'tasks': updatedTasks};
        }
        return g;
      }).toList();
    });

    try {
      await context.read<ProfileRepository>().updateGoal(goalId, {
        'tasks': updatedTasks,
      });
    } catch (e) {
      // Revert on error
      _loadGoalsFor(connId);
    }
  }

  Future<void> _deleteGoal(String connId, String goalId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF151515),
        title: const Text('Delete Goal?'),
        content: const Text(
          'Are you sure you want to delete this mentorship goal?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text(
              'Delete',
              style: TextStyle(color: Colors.redAccent),
            ),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      await context.read<ProfileRepository>().deleteGoal(goalId);
      setState(() {
        _goals[connId] = _goals[connId]!
            .where((g) => g['_id'] != goalId)
            .toList();
      });
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Failed to delete goal.')));
    }
  }

  Future<void> _showAddGoalDialog(String connId) async {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    final tasksControllers = [TextEditingController()];

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF151515),
          title: const Text(
            'Add Goal',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(
                    labelText: 'Goal Title',
                    hintText: 'e.g. Solve 20 DSA problems',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descController,
                  decoration: const InputDecoration(
                    labelText: 'Description (Optional)',
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Tasks',
                  style: TextStyle(fontSize: 12, color: Colors.white38),
                ),
                const SizedBox(height: 8),
                ...tasksControllers.asMap().entries.map((entry) {
                  final idx = entry.key;
                  final controller = entry.value;
                  return Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: controller,
                          decoration: InputDecoration(
                            hintText: 'Task ${idx + 1}',
                          ),
                        ),
                      ),
                      if (tasksControllers.length > 1)
                        IconButton(
                          onPressed: () {
                            setDialogState(() {
                              tasksControllers.removeAt(idx);
                            });
                          },
                          icon: const Icon(
                            Icons.remove_circle_outline,
                            color: Colors.redAccent,
                          ),
                        ),
                    ],
                  );
                }),
                TextButton(
                  onPressed: () {
                    setDialogState(() {
                      tasksControllers.add(TextEditingController());
                    });
                  },
                  child: const Text('+ Add Task Field'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                final title = titleController.text.trim();
                if (title.isEmpty) return;

                final tasks = tasksControllers
                    .map((c) => c.text.trim())
                    .where((t) => t.isNotEmpty)
                    .map((t) => {'title': t})
                    .toList();

                try {
                  final newGoal = await context
                      .read<ProfileRepository>()
                      .createGoal(connId, {
                        'title': title,
                        'description': descController.text.trim(),
                        'tasks': tasks,
                      });
                  setState(() {
                    _goals[connId] = [...(_goals[connId] ?? []), newGoal];
                  });
                  if (ctx.mounted) Navigator.of(ctx).pop();
                } catch (e) {
                  if (ctx.mounted) {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      const SnackBar(content: Text('Failed to create goal.')),
                    );
                  }
                }
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _loadGoalsFor(String connId) async {
    try {
      final goalsData = await context.read<ProfileRepository>().fetchGoals(
        connId,
      );
      if (mounted) {
        setState(() {
          _goals[connId] = goalsData;
        });
      }
    } catch (_) {}
  }

  Widget _buildContactChip({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: Colors.white.withAlpha(8),
          border: Border.all(color: Colors.white.withAlpha(20)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: const Color(0xFF5CC8FF)),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(fontSize: 12, color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final hasConnections = _mentors.isNotEmpty || _mentees.isNotEmpty;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          'My Connections',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        elevation: 0,
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
              ? ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    Text(
                      _error!,
                      style: const TextStyle(color: Colors.redAccent),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _load,
                      child: const Text('Retry'),
                    ),
                  ],
                )
              : ListView(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 30),
                  children: [
                    const Text(
                      'Review active mentorship connections. Click on any contact card to reveal shared communication channels like Email, Phone, WhatsApp, and Discord.',
                      style: TextStyle(
                        fontSize: 13,
                        height: 1.5,
                        color: Colors.white60,
                      ),
                    ),
                    const SizedBox(height: 24),
                    if (!hasConnections)
                      Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(28),
                          color: Colors.white.withAlpha(10),
                          border: Border.all(color: Colors.white.withAlpha(20)),
                        ),
                        padding: const EdgeInsets.all(24),
                        child: const Column(
                          children: [
                            Icon(
                              Icons.people_outline_rounded,
                              size: 48,
                              color: Colors.white30,
                            ),
                            SizedBox(height: 16),
                            Text(
                              'No active connections found.',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white70,
                              ),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Active connections will appear here once incoming requests are approved or when your sent requests are accepted.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.white30,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      )
                    else ...[
                      if (_mentors.isNotEmpty) ...[
                        Text(
                          'MY MENTORS (${_mentors.length})',
                          style: const TextStyle(
                            fontSize: 10,
                            letterSpacing: 2,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF5CC8FF),
                          ),
                        ),
                        const SizedBox(height: 12),
                        ..._mentors.map((c) => _buildConnectionCard(c, true)),
                        const SizedBox(height: 16),
                      ],
                      if (_mentees.isNotEmpty) ...[
                        Text(
                          'MY MENTEES (${_mentees.length})',
                          style: const TextStyle(
                            fontSize: 10,
                            letterSpacing: 2,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF5CC8FF),
                          ),
                        ),
                        const SizedBox(height: 12),
                        ..._mentees.map((c) => _buildConnectionCard(c, false)),
                      ],
                    ],
                  ],
                ),
        ),
      ),
    );
  }
}

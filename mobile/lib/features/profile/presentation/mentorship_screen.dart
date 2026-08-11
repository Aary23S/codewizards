import 'package:flutter/material.dart';
import '../../auth/data/user_profile.dart';
import '../data/mentorship_request_item.dart';
import '../data/profile_repository.dart';
import 'package:provider/provider.dart';

class MentorshipScreen extends StatefulWidget {
  const MentorshipScreen({
    super.key,
    required this.profile,
    required this.requests,
    required this.onRefresh,
  });

  final UserProfile profile;
  final List<MentorshipRequestItem> requests;
  final VoidCallback onRefresh;

  @override
  State<MentorshipScreen> createState() => _MentorshipScreenState();
}

class _MentorshipScreenState extends State<MentorshipScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _handleAction(MentorshipRequestItem request, String status) async {
    final repo = context.read<ProfileRepository>();
    try {
      await repo.updateMentorshipStatus(request.id, status);
      widget.onRefresh();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Request $status successfully!')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update request.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text('Mentorship'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF34D399),
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white38,
          tabs: [
            Tab(text: 'Requests (${widget.requests.length})'),
            const Tab(text: 'My Mentors'),
          ],
        ),
      ),
      body: SafeArea(
        child: TabBarView(
          controller: _tabController,
          children: [
            // Tab 1: Requests
            _buildRequestsList(),

            // Tab 2: My Mentors
            _buildMentorsList(),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestsList() {
    if (widget.requests.isEmpty) {
      return const Center(child: Text('No incoming requests found.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: widget.requests.length,
      itemBuilder: (context, index) {
        final req = widget.requests[index];
        final student = req.student;
        final name = student?.name ?? 'Student';
        final batch = student?.batch?.toString() ?? 'N/A';
        final isPending = req.status == 'pending';

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            color: Colors.white.withAlpha(8),
            border: Border.all(color: Colors.white.withAlpha(12)),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.white24,
                    child: Text(name.isEmpty ? 'U' : name[0].toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text(
                          'B.Tech CSE · Batch $batch',
                          style: TextStyle(color: Colors.white.withAlpha(120), fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  _StatusIndicator(status: req.status),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                req.message.isNotEmpty ? req.message : 'Hello! I would like to request mentorship for placement/project preparation.',
                style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.45),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '12 Aug 2026',
                    style: TextStyle(color: Colors.white.withAlpha(80), fontSize: 10),
                  ),
                  if (isPending)
                    Row(
                      children: [
                        TextButton(
                          onPressed: () => _handleAction(req, 'rejected'),
                          child: const Text('Decline', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: () => _handleAction(req, 'accepted'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF34D399),
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('Accept', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMentorsList() {
    return const Center(
      child: Text('No mentors assigned yet.'),
    );
  }
}

class _StatusIndicator extends StatelessWidget {
  const _StatusIndicator({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final color = status == 'accepted'
        ? const Color(0xFF34D399)
        : status == 'pending'
            ? const Color(0xFFFBBF24)
            : Colors.white30;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: color.withAlpha(20),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold),
      ),
    );
  }
}

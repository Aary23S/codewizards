import 'package:flutter/material.dart';
import '../../auth/data/user_profile.dart';

class AboutScreen extends StatefulWidget {
  const AboutScreen({super.key, required this.profile});

  final UserProfile profile;

  @override
  State<AboutScreen> createState() => _AboutScreenState();
}

class _AboutScreenState extends State<AboutScreen> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final hasLongBio = (widget.profile.bio ?? '').length > 140;
    final displayBio = widget.profile.bio ?? 'No biography details provided yet.';

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text('About'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            child: Chip(
              label: const Text('ADMIN', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10)),
              backgroundColor: const Color(0xFF5CC8FF),
              padding: EdgeInsets.zero,
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Centered profile header
            Center(
              child: Column(
                children: [
                  Stack(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white24, width: 2),
                        ),
                        child: CircleAvatar(
                          radius: 54,
                          backgroundImage: widget.profile.imageUrl != null && widget.profile.imageUrl!.isNotEmpty
                              ? NetworkImage(widget.profile.imageUrl!)
                              : const AssetImage('assets/avatar_placeholder.png') as ImageProvider,
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          height: 32,
                          width: 32,
                          decoration: const BoxDecoration(
                            color: Color(0xFF5CC8FF),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.edit, color: Colors.black, size: 16),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    widget.profile.name,
                    style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _BadgePill(text: widget.profile.role.toUpperCase(), color: const Color(0xFF5CC8FF)),
                      const SizedBox(width: 8),
                      _BadgePill(text: 'Batch ${widget.profile.displayBatch}', color: Colors.white30),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Metadata Lines
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                color: Colors.white.withAlpha(8),
                border: Border.all(color: Colors.white.withAlpha(12)),
              ),
              padding: const EdgeInsets.all(18),
              child: Column(
                children: [
                  _ContactRow(icon: Icons.code_rounded, text: widget.profile.domain.join(' + ')),
                  const SizedBox(height: 12),
                  const _ContactRow(icon: Icons.location_on_outlined, text: 'Pune, Maharashtra'),
                  const SizedBox(height: 12),
                  _ContactRow(icon: Icons.mail_outline_rounded, text: widget.profile.email),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // About Me Text Block
            const Text(
              'About me',
              style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                color: Colors.white.withAlpha(8),
                border: Border.all(color: Colors.white.withAlpha(12)),
              ),
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    displayBio,
                    maxLines: _expanded ? null : 3,
                    overflow: _expanded ? TextOverflow.visible : TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.5),
                  ),
                  if (hasLongBio) ...[
                    const SizedBox(height: 6),
                    GestureDetector(
                      onTap: () => setState(() => _expanded = !_expanded),
                      child: Text(
                        _expanded ? 'Read Less' : 'Read More',
                        style: const TextStyle(color: Color(0xFF5CC8FF), fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Skills section
            const Text(
              'Skills',
              style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'JavaScript', 'React', 'Node.js', 'MongoDB', 'C++', 'Python', 'Git & GitHub', 'UI/UX'
              ].map((skill) => _TagChip(text: skill)).toList(),
            ),
            const SizedBox(height: 20),

            // Interests section
            const Text(
              'Interests',
              style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'Competitive Programming', 'Open Source', 'AI/ML', 'Web Development'
              ].map((interest) => _TagChip(text: interest)).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _BadgePill extends StatelessWidget {
  const _BadgePill({required this.text, required this.color});

  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: color.withAlpha(20),
        border: Border.all(color: color.withAlpha(40)),
      ),
      child: Text(
        text,
        style: TextStyle(color: color.withAlpha(220), fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  const _ContactRow({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.white54),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
        ),
      ],
    );
  }
}

class _TagChip extends StatelessWidget {
  const _TagChip({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: Colors.white.withAlpha(8),
        border: Border.all(color: Colors.white.withAlpha(12)),
      ),
      child: Text(
        text,
        style: const TextStyle(color: Colors.white70, fontSize: 11),
      ),
    );
  }
}

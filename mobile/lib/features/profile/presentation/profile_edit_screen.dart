import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../auth/auth_controller.dart';
import '../../auth/data/user_profile.dart';
import '../data/profile_repository.dart';

class ProfileEditScreen extends StatefulWidget {
  const ProfileEditScreen({
    super.key,
    required this.initialProfile,
  });

  final UserProfile initialProfile;

  @override
  State<ProfileEditScreen> createState() => _ProfileEditScreenState();
}

class _ProfileEditScreenState extends State<ProfileEditScreen> {
  static const _domainOptions = [
    'Web',
    'AI',
    'Machine Learning',
    'Flutter',
    'Backend',
    'Cyber Security',
    'Competitive Programming',
    'Research',
    'Open Source',
    'App Dev',
  ];

  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _batchController;
  late final TextEditingController _bioController;
  late final TextEditingController _githubController;
  late final TextEditingController _linkedinController;
  late final TextEditingController _leetcodeController;
  late final TextEditingController _codeforcesController;
  late final TextEditingController _portfolioController;
  late List<String> _selectedDomains;
  late bool _isMentor;
  bool _saving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _hydrate(widget.initialProfile);
  }

  void _hydrate(UserProfile profile) {
    _nameController = TextEditingController(text: profile.name);
    _batchController = TextEditingController(text: profile.batch?.toString() ?? '');
    _bioController = TextEditingController(text: profile.bio ?? '');
    _githubController = TextEditingController(text: profile.socialLinks.github ?? '');
    _linkedinController = TextEditingController(text: profile.socialLinks.linkedin ?? '');
    _leetcodeController = TextEditingController(text: profile.socialLinks.leetcode ?? '');
    _codeforcesController = TextEditingController(text: profile.socialLinks.codeforces ?? '');
    _portfolioController = TextEditingController(text: profile.socialLinks.portfolio ?? '');
    _selectedDomains = List<String>.from(profile.domain);
    _isMentor = profile.isMentor;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _batchController.dispose();
    _bioController.dispose();
    _githubController.dispose();
    _linkedinController.dispose();
    _leetcodeController.dispose();
    _codeforcesController.dispose();
    _portfolioController.dispose();
    super.dispose();
  }

  void _toggleDomain(String domain) {
    setState(() {
      if (_selectedDomains.contains(domain)) {
        _selectedDomains.remove(domain);
      } else {
        _selectedDomains.add(domain);
      }
    });
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _saving = true;
      _errorMessage = null;
    });

    final profileRepository = context.read<ProfileRepository>();
    final authController = context.read<AuthController>();

    try {
      final updated = await profileRepository.updateProfile(
        widget.initialProfile.id,
        {
          'name': _nameController.text.trim(),
          'batch': _parseIntOrNull(_batchController.text),
          'bio': _nullIfBlank(_bioController.text),
          'domain': _selectedDomains,
          'isMentor': _isMentor,
          'github': _nullIfBlank(_githubController.text),
          'linkedin': _nullIfBlank(_linkedinController.text),
          'leetcode': _nullIfBlank(_leetcodeController.text),
          'codeforces': _nullIfBlank(_codeforcesController.text),
          'portfolio': _nullIfBlank(_portfolioController.text),
        },
      );

      authController.replaceUser(updated);

      if (!mounted) return;
      Navigator.of(context).pop();
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = _friendlyError(error);
      });
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit profile'),
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            children: [
              _Header(profile: widget.initialProfile),
              const SizedBox(height: 16),
              _SectionCard(
                title: 'Identity',
                subtitle: 'Update the public profile details stored in the backend.',
                child: Column(
                  children: [
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(labelText: 'Full name'),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Enter your name';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _batchController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Batch year'),
                      validator: (value) {
                        final text = value?.trim() ?? '';
                        if (text.isEmpty) return null;
                        final batch = int.tryParse(text);
                        if (batch == null) return 'Enter a valid year';
                        if (batch < 1950) return 'Enter a valid year';
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _bioController,
                      maxLines: 4,
                      decoration: const InputDecoration(labelText: 'Bio'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              _SectionCard(
                title: 'Domains',
                subtitle: 'Choose the areas that best represent your work.',
                child: Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: _domainOptions
                      .map(
                        (domain) => FilterChip(
                          selected: _selectedDomains.contains(domain),
                          label: Text(domain),
                          onSelected: (_) => _toggleDomain(domain),
                        ),
                      )
                      .toList(),
                ),
              ),
              const SizedBox(height: 16),
              _SectionCard(
                title: 'Mentorship',
                subtitle: 'Keep your mentor availability aligned with the web dashboard.',
                child: SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _isMentor,
                  onChanged: (value) => setState(() => _isMentor = value),
                  title: const Text("I'm open to mentoring juniors"),
                ),
              ),
              const SizedBox(height: 16),
              _SectionCard(
                title: 'Public links',
                subtitle: 'Social URLs that should appear on the profile view.',
                child: Column(
                  children: [
                    _LinkField(controller: _githubController, label: 'GitHub URL', placeholder: 'https://github.com/username'),
                    const SizedBox(height: 14),
                    _LinkField(controller: _linkedinController, label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/username'),
                    const SizedBox(height: 14),
                    _LinkField(controller: _leetcodeController, label: 'LeetCode URL', placeholder: 'https://leetcode.com/username'),
                    const SizedBox(height: 14),
                    _LinkField(controller: _codeforcesController, label: 'Codeforces URL', placeholder: 'https://codeforces.com/profile/username'),
                    const SizedBox(height: 14),
                    _LinkField(controller: _portfolioController, label: 'Portfolio URL', placeholder: 'https://yourportfolio.com'),
                  ],
                ),
              ),
              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    color: Colors.white.withAlpha(10),
                    border: Border.all(color: Colors.white.withAlpha(20)),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    _errorMessage!,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFFFCA5A5)),
                  ),
                ),
              ],
              const SizedBox(height: 18),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  ElevatedButton(
                    onPressed: _saving ? null : _save,
                    child: Text(_saving ? 'Saving...' : 'Save changes'),
                  ),
                  OutlinedButton(
                    onPressed: _saving ? null : () => Navigator.of(context).pop(),
                    child: const Text('Cancel'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withAlpha(20)),
        gradient: const LinearGradient(
          colors: [Color(0xFF171717), Color(0xFF0A0A0A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Update your profile',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 10),
          Text(
            'These values are written back to the same backend record used by the web dashboard.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
          ),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String title;
  final String subtitle;
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
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 4),
          Text(subtitle, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.45)),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

class _LinkField extends StatelessWidget {
  const _LinkField({
    required this.controller,
    required this.label,
    required this.placeholder,
  });

  final TextEditingController controller;
  final String label;
  final String placeholder;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.url,
      decoration: InputDecoration(
        labelText: label,
        hintText: placeholder,
      ),
    );
  }
}

String? _nullIfBlank(String value) {
  final text = value.trim();
  if (text.isEmpty) return null;
  return text;
}

int? _parseIntOrNull(String value) {
  final text = value.trim();
  if (text.isEmpty) return null;
  return int.tryParse(text);
}

String _friendlyError(Object error) {
  final text = error.toString();
  if (text.contains('401')) return 'Your session expired. Please sign in again.';
  if (text.contains('400')) return 'Please check the submitted details.';
  if (text.contains('SocketException') || text.contains('DioException')) {
    return 'Cannot reach the backend. Check the API URL and network.';
  }
  return 'Something went wrong while saving your profile.';
}


import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';

import '../../auth/auth_controller.dart';
import '../../auth/data/user_profile.dart';
import '../../../core/widgets/safe_network_image.dart';
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
  late final TextEditingController _leetcodeUsernameController;
  late final TextEditingController _codeforcesHandleController;
  late final TextEditingController _githubUsernameController;
  late final TextEditingController _designationController;
  late final TextEditingController _currentCompanyController;
  late final TextEditingController _professionalExperienceController;
  late List<String> _selectedDomains;
  late bool _isMentor;
  String? _currentImageUrl;
  Uint8List? _pickedImageBytes;
  String? _pickedImageName;
  bool _saving = false;
  bool _syncingCoding = false;
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
    _leetcodeUsernameController = TextEditingController(text: profile.leetcodeUsername ?? '');
    _codeforcesHandleController = TextEditingController(text: profile.codeforcesHandle ?? '');
    _githubUsernameController = TextEditingController(text: profile.githubUsername ?? '');
    _designationController = TextEditingController(text: profile.designation ?? '');
    _currentCompanyController = TextEditingController(text: profile.currentCompany ?? '');
    _professionalExperienceController = TextEditingController(text: profile.professionalExperience ?? '');
    _selectedDomains = List<String>.from(profile.domain);
    _isMentor = profile.isMentor;
    _currentImageUrl = profile.imageUrl;
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
    _leetcodeUsernameController.dispose();
    _codeforcesHandleController.dispose();
    _githubUsernameController.dispose();
    _designationController.dispose();
    _currentCompanyController.dispose();
    _professionalExperienceController.dispose();
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

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
      maxWidth: 1600,
    );
    if (file == null) return;

    final bytes = await file.readAsBytes();
    if (!mounted) return;

    setState(() {
      _pickedImageBytes = bytes;
      _pickedImageName = file.name;
    });
  }

  void _clearPickedImage() {
    setState(() {
      _pickedImageBytes = null;
      _pickedImageName = null;
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
      final payload = FormData.fromMap({
        'name': _nameController.text.trim(),
        'batch': _parseIntOrNull(_batchController.text),
        'bio': _nullIfBlank(_bioController.text),
        'designation': _nullIfBlank(_designationController.text),
        'currentCompany': _nullIfBlank(_currentCompanyController.text),
        'professionalExperience': _nullIfBlank(_professionalExperienceController.text),
        'domain': _selectedDomains.join(', '),
        'isMentor': _isMentor.toString(),
        'github': _nullIfBlank(_githubController.text),
        'linkedin': _nullIfBlank(_linkedinController.text),
        'leetcode': _nullIfBlank(_leetcodeController.text),
        'codeforces': _nullIfBlank(_codeforcesController.text),
        'portfolio': _nullIfBlank(_portfolioController.text),
        'leetcodeUsername': _nullIfBlank(_leetcodeUsernameController.text),
        'codeforcesHandle': _nullIfBlank(_codeforcesHandleController.text),
        'githubUsername': _nullIfBlank(_githubUsernameController.text),
      }..removeWhere((key, value) => value == null));

      if (_pickedImageBytes != null) {
        payload.files.add(
          MapEntry(
            'image',
            MultipartFile.fromBytes(
              _pickedImageBytes!,
              filename: _pickedImageName ?? 'profile.jpg',
            ),
          ),
        );
      }

      final updated = await profileRepository.updateProfile(
        widget.initialProfile.id,
        payload,
      );

      try {
        await profileRepository.connectCodingProfile({
          'leetcodeUsername': _nullIfBlank(_leetcodeUsernameController.text),
          'codeforcesHandle': _nullIfBlank(_codeforcesHandleController.text),
          'githubUsername': _nullIfBlank(_githubUsernameController.text),
        });
      } catch (_) {}

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

  Future<void> _syncCodingProfiles() async {
    setState(() {
      _syncingCoding = true;
      _errorMessage = null;
    });

    try {
      await context.read<ProfileRepository>().connectCodingProfile({
        'leetcodeUsername': _nullIfBlank(_leetcodeUsernameController.text),
        'codeforcesHandle': _nullIfBlank(_codeforcesHandleController.text),
        'githubUsername': _nullIfBlank(_githubUsernameController.text),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Coding profiles synced.')),
      );
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = _friendlyError(error);
      });
    } finally {
      if (mounted) {
        setState(() {
          _syncingCoding = false;
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
                    _ImageField(
                      name: widget.initialProfile.name,
                      currentImageUrl: _currentImageUrl,
                      pickedImageBytes: _pickedImageBytes,
                      onPickImage: _pickImage,
                      onClearImage: _clearPickedImage,
                    ),
                    const SizedBox(height: 14),
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
                title: 'Professional Career',
                subtitle: 'Share your current company, designation, and professional background.',
                child: Column(
                  children: [
                    TextFormField(
                      controller: _designationController,
                      decoration: const InputDecoration(labelText: 'Current designation (e.g. Software Engineer II)'),
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _currentCompanyController,
                      decoration: const InputDecoration(labelText: 'Current company (e.g. Google)'),
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _professionalExperienceController,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        labelText: 'Professional experience summary',
                        hintText: 'Share a summary of your internships, work history, tech stacks, or guidance topics.',
                      ),
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
              const SizedBox(height: 16),
              _SectionCard(
                title: 'Coding profiles',
                subtitle: 'Store the usernames that power contribution stats and leaderboard syncing.',
                child: Column(
                  children: [
                    _LinkField(
                      controller: _leetcodeUsernameController,
                      label: 'LeetCode username',
                      placeholder: 'your_username',
                      keyboardType: TextInputType.text,
                    ),
                    const SizedBox(height: 14),
                    _LinkField(
                      controller: _codeforcesHandleController,
                      label: 'Codeforces handle',
                      placeholder: 'tourist',
                      keyboardType: TextInputType.text,
                    ),
                    const SizedBox(height: 14),
                    _LinkField(
                      controller: _githubUsernameController,
                      label: 'GitHub username',
                      placeholder: 'octocat',
                      keyboardType: TextInputType.text,
                    ),
                    const SizedBox(height: 14),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: OutlinedButton(
                        onPressed: _syncingCoding ? null : _syncCodingProfiles,
                        child: Text(_syncingCoding ? 'Syncing...' : 'Sync coding stats'),
                      ),
                    ),
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

class _ImageField extends StatelessWidget {
  const _ImageField({
    required this.name,
    required this.currentImageUrl,
    required this.pickedImageBytes,
    required this.onPickImage,
    required this.onClearImage,
  });

  final String name;
  final String? currentImageUrl;
  final Uint8List? pickedImageBytes;
  final Future<void> Function() onPickImage;
  final VoidCallback onClearImage;

  @override
  Widget build(BuildContext context) {
    final initial = name.isNotEmpty ? name.trim()[0].toUpperCase() : 'U';
    final hasPreview = pickedImageBytes != null || (currentImageUrl?.trim().isNotEmpty ?? false);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Profile image',
          style: Theme.of(context).textTheme.labelLarge?.copyWith(letterSpacing: 1.2),
        ),
        const SizedBox(height: 10),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 72,
              width: 72,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: Colors.white.withAlpha(20)),
                color: Colors.white.withAlpha(8),
              ),
              clipBehavior: Clip.antiAlias,
              child: pickedImageBytes != null
                  ? Image.memory(pickedImageBytes!, fit: BoxFit.cover)
                  : (currentImageUrl?.trim().isNotEmpty ?? false)
                      ? SafeNetworkImage(
                          imageUrl: currentImageUrl,
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
                        )
                      : Center(
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
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  OutlinedButton.icon(
                    onPressed: () => onPickImage(),
                    icon: const Icon(Icons.upload_rounded, size: 18),
                    label: const Text('Upload from device'),
                  ),
                  if (hasPreview) ...[
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: pickedImageBytes != null ? onClearImage : null,
                      child: const Text('Use current image'),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ],
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
    this.keyboardType = TextInputType.url,
  });

  final TextEditingController controller;
  final String label;
  final String placeholder;
  final TextInputType keyboardType;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
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


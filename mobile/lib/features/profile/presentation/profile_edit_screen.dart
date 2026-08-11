import 'dart:typed_data';
import 'dart:convert';

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

  static const _helpTopicOptions = [
    'DSA & Competitive Programming',
    'Web Development',
    'App Development',
    'AI/ML',
    'Backend Development',
    'Project Guidance',
    'Resume Review',
    'Interview Preparation',
    'Internship Preparation',
    'Career Guidance',
    'Higher Studies',
    'Entrepreneurship'
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
  late final TextEditingController _headlineController;
  late final TextEditingController _locationController;
  late final TextEditingController _startDateTextController;
  late final TextEditingController _typicalResponseTimeController;
  late final TextEditingController _maxActiveStudentsController;

  String? _selectedEmploymentType;
  String? _selectedWorkMode;
  String? _selectedMentorshipAvailability;
  String? _selectedPreferredContactMethod;
  late List<String> _selectedHelpTopics;
  late List<WorkExperience> _experiences;
  late List<EducationItem> _education;
  late List<CertificationItem> _certifications;

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
    _headlineController = TextEditingController(text: profile.headline ?? '');
    _locationController = TextEditingController(text: profile.location ?? '');
    _startDateTextController = TextEditingController(text: profile.startDateText ?? '');
    _typicalResponseTimeController = TextEditingController(text: profile.typicalResponseTime);
    _maxActiveStudentsController = TextEditingController(text: profile.maxActiveStudents.toString());

    _selectedEmploymentType = profile.employmentType?.trim().isNotEmpty == true ? profile.employmentType : null;
    _selectedWorkMode = profile.workMode?.trim().isNotEmpty == true ? profile.workMode : null;
    _selectedMentorshipAvailability = profile.mentorshipAvailability;
    _selectedPreferredContactMethod = profile.preferredContactMethod;
    _selectedHelpTopics = List<String>.from(profile.canHelpWith ?? const []);

    _selectedDomains = List<String>.from(profile.domain);
    _experiences = List<WorkExperience>.from(profile.experiences);
    _education = List<EducationItem>.from(profile.education);
    _certifications = List<CertificationItem>.from(profile.certifications);
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
    _headlineController.dispose();
    _locationController.dispose();
    _startDateTextController.dispose();
    _typicalResponseTimeController.dispose();
    _maxActiveStudentsController.dispose();
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
        'headline': _nullIfBlank(_headlineController.text),
        'location': _nullIfBlank(_locationController.text),
        'startDateText': _nullIfBlank(_startDateTextController.text),
        'employmentType': _selectedEmploymentType,
        'workMode': _selectedWorkMode,
        'mentorshipAvailability': _selectedMentorshipAvailability,
        'preferredContactMethod': _selectedPreferredContactMethod,
        'typicalResponseTime': _typicalResponseTimeController.text.trim(),
        'maxActiveStudents': int.tryParse(_maxActiveStudentsController.text.trim()) ?? 3,
        'canHelpWith': _selectedHelpTopics.join(', '),
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
        'experiences': jsonEncode(_experiences.map((e) => e.toJson()).toList()),
        'education': jsonEncode(_education.map((e) => e.toJson()).toList()),
        'certifications': jsonEncode(_certifications.map((e) => e.toJson()).toList()),
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
                      controller: _headlineController,
                      decoration: const InputDecoration(labelText: 'Professional headline (e.g. Full-Stack Developer)'),
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _locationController,
                      decoration: const InputDecoration(labelText: 'Location (e.g. Pune, India)'),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _designationController,
                            decoration: const InputDecoration(labelText: 'Designation'),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: TextFormField(
                            controller: _currentCompanyController,
                            decoration: const InputDecoration(labelText: 'Company'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            initialValue: _selectedEmploymentType,
                            decoration: const InputDecoration(labelText: 'Employment Type'),
                            items: ['Full-time', 'Part-time', 'Internship', 'Contract']
                                .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                                .toList(),
                            onChanged: (val) => setState(() => _selectedEmploymentType = val),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            initialValue: _selectedWorkMode,
                            decoration: const InputDecoration(labelText: 'Work Mode'),
                            items: ['Remote', 'Hybrid', 'On-site']
                                .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                                .toList(),
                            onChanged: (val) => setState(() => _selectedWorkMode = val),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _startDateTextController,
                      decoration: const InputDecoration(labelText: 'Start Date (e.g. Aug 2026)'),
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
                title: 'Mentorship Settings',
                subtitle: 'Keep your mentor availability, topics, and connection preferences aligned.',
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      value: _isMentor,
                      onChanged: (value) => setState(() => _isMentor = value),
                      title: const Text("I'm open to mentoring juniors"),
                    ),
                    if (_isMentor) ...[
                      const SizedBox(height: 14),
                      DropdownButtonFormField<String>(
                        initialValue: _selectedMentorshipAvailability,
                        decoration: const InputDecoration(labelText: 'Availability Status'),
                        items: const [
                          DropdownMenuItem(value: 'open', child: Text('🟢 Open for mentorship')),
                          DropdownMenuItem(value: 'limited', child: Text('🟡 Limited availability')),
                          DropdownMenuItem(value: 'unavailable', child: Text('⚪ Currently unavailable')),
                        ],
                        onChanged: (val) => setState(() => _selectedMentorshipAvailability = val ?? 'open'),
                      ),
                      const SizedBox(height: 14),
                      DropdownButtonFormField<String>(
                        initialValue: _selectedPreferredContactMethod,
                        decoration: const InputDecoration(labelText: 'Preferred Contact Method (visible to accepted mentees)'),
                        items: const [
                          DropdownMenuItem(value: 'linkedin', child: Text('LinkedIn Profile')),
                          DropdownMenuItem(value: 'email', child: Text('Professional Email')),
                          DropdownMenuItem(value: 'whatsapp', child: Text('WhatsApp Chat')),
                          DropdownMenuItem(value: 'discord', child: Text('Discord Server/DM')),
                        ],
                        onChanged: (val) => setState(() => _selectedPreferredContactMethod = val ?? 'linkedin'),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _typicalResponseTimeController,
                              decoration: const InputDecoration(labelText: 'Typical Response Time'),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: TextFormField(
                              controller: _maxActiveStudentsController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(labelText: 'Max Active Students'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'I Can Help With',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _helpTopicOptions
                            .map(
                              (topic) => FilterChip(
                                selected: _selectedHelpTopics.contains(topic),
                                label: Text(topic),
                                onSelected: (selected) {
                                  setState(() {
                                    if (selected) {
                                      _selectedHelpTopics.add(topic);
                                    } else {
                                      _selectedHelpTopics.remove(topic);
                                    }
                                  });
                                },
                              ),
                            )
                            .toList(),
                      ),
                    ],
                  ],
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
              const SizedBox(height: 16),

              // Work Experience Card
              _SectionCard(
                title: 'Work Experience',
                subtitle: 'Add details of internships, part-time, or full-time roles.',
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _experiences.length,
                      itemBuilder: (context, index) {
                        final exp = _experiences[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          color: Colors.white.withAlpha(5),
                          child: ListTile(
                            title: Text(exp.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('${exp.company} · ${exp.startDate} - ${exp.endDate}'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit, size: 18),
                                  onPressed: () => _showExperienceDialog(existing: exp, index: index),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete, size: 18, color: Colors.redAccent),
                                  onPressed: () => setState(() => _experiences.removeAt(index)),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                    if (_experiences.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8.0),
                        child: Text('No experience records added yet.', style: TextStyle(color: Colors.white38, fontSize: 13)),
                      ),
                    OutlinedButton.icon(
                      onPressed: () => _showExperienceDialog(),
                      icon: const Icon(Icons.add, size: 16),
                      label: const Text('Add experience'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Education Card
              _SectionCard(
                title: 'Education',
                subtitle: 'Share details of your schools, degrees, and graduation years.',
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _education.length,
                      itemBuilder: (context, index) {
                        final edu = _education[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          color: Colors.white.withAlpha(5),
                          child: ListTile(
                            title: Text(edu.school, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('${edu.degree} · ${edu.startDate} - ${edu.endDate}'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit, size: 18),
                                  onPressed: () => _showEducationDialog(existing: edu, index: index),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete, size: 18, color: Colors.redAccent),
                                  onPressed: () => setState(() => _education.removeAt(index)),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                    if (_education.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8.0),
                        child: Text('No education records added yet.', style: TextStyle(color: Colors.white38, fontSize: 13)),
                      ),
                    OutlinedButton.icon(
                      onPressed: () => _showEducationDialog(),
                      icon: const Icon(Icons.add, size: 16),
                      label: const Text('Add education'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Certifications Card
              _SectionCard(
                title: 'Licenses & Certifications',
                subtitle: 'List your courses, badges, or verify credentials.',
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _certifications.length,
                      itemBuilder: (context, index) {
                        final cert = _certifications[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          color: Colors.white.withAlpha(5),
                          child: ListTile(
                            title: Text(cert.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('${cert.issuer} · ${cert.issueDate}'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit, size: 18),
                                  onPressed: () => _showCertificationDialog(existing: cert, index: index),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete, size: 18, color: Colors.redAccent),
                                  onPressed: () => setState(() => _certifications.removeAt(index)),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                    if (_certifications.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8.0),
                        child: Text('No certifications added yet.', style: TextStyle(color: Colors.white38, fontSize: 13)),
                      ),
                    OutlinedButton.icon(
                      onPressed: () => _showCertificationDialog(),
                      icon: const Icon(Icons.add, size: 16),
                      label: const Text('Add certification'),
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

  void _showExperienceDialog({WorkExperience? existing, int? index}) {
    final titleCtrl = TextEditingController(text: existing?.title ?? '');
    final companyCtrl = TextEditingController(text: existing?.company ?? '');
    final locationCtrl = TextEditingController(text: existing?.location ?? '');
    final startCtrl = TextEditingController(text: existing?.startDate ?? '');
    final endCtrl = TextEditingController(text: existing?.endDate ?? '');
    final descCtrl = TextEditingController(text: existing?.description ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(existing == null ? 'Add Experience' : 'Edit Experience'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Title / Role')),
              TextField(controller: companyCtrl, decoration: const InputDecoration(labelText: 'Company')),
              TextField(controller: locationCtrl, decoration: const InputDecoration(labelText: 'Location')),
              TextField(controller: startCtrl, decoration: const InputDecoration(labelText: 'Start Date (e.g. May 2026)')),
              TextField(controller: endCtrl, decoration: const InputDecoration(labelText: 'End Date (e.g. Aug 2026)')),
              TextField(
                controller: descCtrl,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Description / Achievements'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final exp = WorkExperience(
                title: titleCtrl.text.trim(),
                company: companyCtrl.text.trim(),
                location: locationCtrl.text.trim(),
                startDate: startCtrl.text.trim(),
                endDate: endCtrl.text.trim(),
                description: descCtrl.text.trim(),
              );
              setState(() {
                if (index == null) {
                  _experiences.add(exp);
                } else {
                  _experiences[index] = exp;
                }
              });
              Navigator.of(ctx).pop();
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showEducationDialog({EducationItem? existing, int? index}) {
    final schoolCtrl = TextEditingController(text: existing?.school ?? '');
    final degreeCtrl = TextEditingController(text: existing?.degree ?? '');
    final fieldCtrl = TextEditingController(text: existing?.fieldOfStudy ?? '');
    final startCtrl = TextEditingController(text: existing?.startDate ?? '');
    final endCtrl = TextEditingController(text: existing?.endDate ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(existing == null ? 'Add Education' : 'Edit Education'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: schoolCtrl, decoration: const InputDecoration(labelText: 'School / University')),
              TextField(controller: degreeCtrl, decoration: const InputDecoration(labelText: 'Degree')),
              TextField(controller: fieldCtrl, decoration: const InputDecoration(labelText: 'Field of Study')),
              TextField(controller: startCtrl, decoration: const InputDecoration(labelText: 'Start Year')),
              TextField(controller: endCtrl, decoration: const InputDecoration(labelText: 'End Year')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final edu = EducationItem(
                school: schoolCtrl.text.trim(),
                degree: degreeCtrl.text.trim(),
                fieldOfStudy: fieldCtrl.text.trim(),
                startDate: startCtrl.text.trim(),
                endDate: endCtrl.text.trim(),
              );
              setState(() {
                if (index == null) {
                  _education.add(edu);
                } else {
                  _education[index] = edu;
                }
              });
              Navigator.of(ctx).pop();
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showCertificationDialog({CertificationItem? existing, int? index}) {
    final nameCtrl = TextEditingController(text: existing?.name ?? '');
    final issuerCtrl = TextEditingController(text: existing?.issuer ?? '');
    final dateCtrl = TextEditingController(text: existing?.issueDate ?? '');
    final urlCtrl = TextEditingController(text: existing?.credentialUrl ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(existing == null ? 'Add Certification' : 'Edit Certification'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Certification Name')),
              TextField(controller: issuerCtrl, decoration: const InputDecoration(labelText: 'Issuer')),
              TextField(controller: dateCtrl, decoration: const InputDecoration(labelText: 'Issue Date (e.g. Aug 2026)')),
              TextField(controller: urlCtrl, decoration: const InputDecoration(labelText: 'Credential URL')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final cert = CertificationItem(
                name: nameCtrl.text.trim(),
                issuer: issuerCtrl.text.trim(),
                issueDate: dateCtrl.text.trim(),
                credentialUrl: urlCtrl.text.trim(),
              );
              setState(() {
                if (index == null) {
                  _certifications.add(cert);
                } else {
                  _certifications[index] = cert;
                }
              });
              Navigator.of(ctx).pop();
            },
            child: const Text('Save'),
          ),
        ],
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


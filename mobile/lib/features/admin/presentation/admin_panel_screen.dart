import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../auth/auth_controller.dart';
import '../../auth/presentation/login_screen.dart';
import '../../explore/presentation/explore_screen.dart' show BlogDetailScreen;
import '../../../shared/widgets/brand_logo.dart';
import '../data/admin_repository.dart';
import 'admin_crud_page.dart';

const Set<String> _protectedAdminEmails = {
  'aary.s@codewizards.com',
  'satardekaraary@gmail.com',
};

const String _primaryAdminEmail = 'aary.s@codewizards.com';

class AdminPanelScreen extends StatefulWidget {
  const AdminPanelScreen({super.key});

  @override
  State<AdminPanelScreen> createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> {
  Future<AdminOverview>? _future;
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= context.read<AdminRepository>().fetchOverview();
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = context.read<AdminRepository>().fetchOverview();
    });

    try {
      await _future;
    } catch (error) {
      if (!mounted) return;
      setState(() => _errorMessage = _friendlyError(error));
    }
  }

  Future<void> _logout() async {
    await context.read<AuthController>().logout();
    if (!mounted) return;
    Navigator.of(context, rootNavigator: true).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthController>().user;

    if (user == null) {
      return const SizedBox.shrink();
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const BrandLogo(size: 30, showLabel: true),
        actions: [
          TextButton.icon(
            onPressed: _logout,
            icon: const Icon(Icons.logout_rounded, size: 18),
            label: const Text('Logout'),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: FutureBuilder<AdminOverview>(
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

              final overview = snapshot.data;

              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: [
                  _HeroPanel(userName: user.name, role: user.role),
                  const SizedBox(height: 16),
                  _SectionHeader(
                    eyebrow: 'Admin',
                    title: 'Manage the club from one console.',
                    description: 'This control panel mirrors the web hierarchy while staying mobile-first and compact.',
                  ),
                  const SizedBox(height: 16),
                  if (loading)
                    const _LoadingPanel()
                  else if (overview == null)
                    const _EmptyPanel(message: 'No admin metrics available.')
                  else
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 1.55,
                      children: [
                        for (final metric in overview.metrics)
                          _MetricCard(label: metric.label, value: metric.value),
                      ],
                    ),
                  const SizedBox(height: 16),
                  _AdminSectionsBlock(
                    onSectionTap: (section) => _openSection(section),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  void _openSection(AdminSection section) {
    Widget page;
    switch (section) {
      case AdminSection.users:
        page = _usersCrudPage();
        break;
      case AdminSection.projects:
        page = _projectsCrudPage();
        break;
      case AdminSection.events:
        page = _eventsCrudPage();
        break;
      case AdminSection.announcements:
        page = _announcementsCrudPage();
        break;
      case AdminSection.timeline:
        page = _timelineCrudPage();
        break;
      case AdminSection.gallery:
        page = _galleryCrudPage();
        break;
      case AdminSection.doubts:
        page = _doubtsCrudPage();
        break;
      case AdminSection.blogs:
        page = _blogsCrudPage();
        break;
      case AdminSection.opportunities:
        page = _opportunitiesCrudPage();
        break;
      case AdminSection.resources:
        page = _resourcesCrudPage();
        break;
      case AdminSection.team:
        page = _teamCrudPage();
        break;
      case AdminSection.contact:
        page = const AdminContactPage();
        break;
      case AdminSection.points:
        page = const AdminPointsPage();
        break;
    }

    Navigator.of(context).push(MaterialPageRoute(builder: (_) => page));
  }

  Widget _usersCrudPage() {
    final repo = context.read<AdminRepository>();
    return AdminCrudPage(
      config: AdminCrudConfig(
        title: 'Users',
        eyebrow: 'Users',
        description: 'Manage access, mentor status, and user profiles in sync with the backend.',
        createButtonLabel: 'Add User',
        formTitle: 'Create user',
        loader: () => repo.fetchList('/users'),
        create: (payload) => repo.createUser(_normalizeUserPayload(payload, creating: true)),
        update: (id, payload) => repo.updateUser(id, _normalizeUserPayload(payload, creating: false)),
        delete: repo.deleteUser,
        extraAction: (item) async {
          if (_isProtectedAdmin(item)) return;
          if (_isAdminRole(item)) return;
          final id = _id(item);
          if (id == null) return;
          final suspended = _boolLabel(item['isSuspended']);
          await repo.suspendUser(
            id,
            isSuspended: !suspended,
            suspendedReason: suspended ? null : _string(item['suspendedReason'], fallback: 'Suspended by admin'),
          );
        },
        secondaryAction: (item) async {
          final id = _id(item);
          if (id == null) return;
          final currentRole = _string(item['role'], fallback: 'student').toLowerCase();
          final isPrimary = _isPrimaryAdmin(item);
          final targetRole = currentRole == 'admin' ? 'student' : 'admin';
          if (isPrimary && targetRole != 'admin') return;
          await repo.updateUser(id, {'role': targetRole});
        },
        fields: const [
          AdminFieldSpec(key: 'name', label: 'Name'),
          AdminFieldSpec(key: 'email', label: 'Email'),
          AdminFieldSpec(key: 'password', label: 'Password', required: false, hintText: 'Leave blank to keep current password'),
          AdminFieldSpec(
            key: 'role',
            label: 'Role',
            type: AdminFieldType.dropdown,
            options: ['student', 'mentor', 'senior', 'alumni', 'admin'],
          ),
          AdminFieldSpec(key: 'batch', label: 'Batch', type: AdminFieldType.number, required: false),
          AdminFieldSpec(key: 'domain', label: 'Domains', hintText: 'Comma separated domains, e.g. Web, Flutter'),
          AdminFieldSpec(key: 'bio', label: 'Bio', type: AdminFieldType.multiline, required: false),
          AdminFieldSpec(key: 'imageUrl', label: 'Image URL', required: false),
          AdminFieldSpec(key: 'isMentor', label: 'Open to mentor', type: AdminFieldType.boolean, required: false),
          AdminFieldSpec(key: 'githubUrl', label: 'GitHub URL', required: false),
          AdminFieldSpec(key: 'linkedinUrl', label: 'LinkedIn URL', required: false),
          AdminFieldSpec(key: 'leetcodeUrl', label: 'LeetCode URL', required: false),
          AdminFieldSpec(key: 'codeforcesUrl', label: 'Codeforces URL', required: false),
          AdminFieldSpec(key: 'portfolioUrl', label: 'Portfolio URL', required: false),
          AdminFieldSpec(key: 'isSuspended', label: 'Suspended', type: AdminFieldType.boolean, required: false),
          AdminFieldSpec(key: 'suspendedReason', label: 'Suspended Reason', type: AdminFieldType.multiline, required: false),
        ],
        cardData: (item) {
          final name = _string(item['name'], fallback: 'Unnamed user');
          final email = _string(item['email'], fallback: 'No email');
          final batch = _string(item['batch'], fallback: 'N/A');
          final isProtected = _isProtectedAdmin(item);
          final isPrimary = _isPrimaryAdmin(item);
          final role = _string(item['role'], fallback: 'student').toLowerCase();
          final badges = <String>[
            _displayRole(_string(item['role'], fallback: 'student')),
            if (_boolLabel(item['isMentor'])) 'Mentor',
            if (_boolLabel(item['isSuspended'])) 'Suspended',
            if (isPrimary) 'Super Admin',
          ];
          return AdminRecordCardData(
            title: name,
            subtitle: '$email • Batch $batch',
            badges: badges,
            canDelete: !isProtected,
            extraActionLabel: isProtected || role == 'admin' ? null : (_boolLabel(item['isSuspended']) ? 'Unsuspend' : 'Suspend'),
            secondaryActionLabel: isPrimary ? null : (role == 'admin' ? 'Demote Admin' : 'Promote Admin'),
          );
        },
      ),
    );
  }

  Widget _projectsCrudPage() {
    final repo = context.read<AdminRepository>();
    return AdminCrudPage(
      config: AdminCrudConfig(
        title: 'Projects',
        eyebrow: 'Projects',
        description: 'Create, review, and remove public project entries.',
        createButtonLabel: 'Add Project',
        formTitle: 'Add project',
        loader: () => repo.fetchList('/projects'),
        create: (payload) => repo.createObject('/projects', _normalizeProjectPayload(payload)),
        update: (id, payload) => repo.updateObject('/projects/$id', _normalizeProjectPayload(payload)),
        delete: (id) => repo.deleteObject('/projects/$id'),
        fields: const [
          AdminFieldSpec(key: 'title', label: 'Title'),
          AdminFieldSpec(key: 'description', label: 'Description', type: AdminFieldType.multiline),
          AdminFieldSpec(key: 'techStack', label: 'Tech Stack', hintText: 'Comma separated, e.g. React, Node.js'),
          AdminFieldSpec(key: 'contributors', label: 'Contributors', required: false, hintText: 'Comma separated names'),
          AdminFieldSpec(key: 'githubUrl', label: 'GitHub URL', required: false),
          AdminFieldSpec(key: 'demoUrl', label: 'Demo URL', required: false),
          AdminFieldSpec(key: 'imageUrl', label: 'Image URL', required: false),
          AdminFieldSpec(key: 'featured', label: 'Featured', type: AdminFieldType.boolean, required: false),
        ],
        cardData: (item) {
          final tech = _csvItems(item['techStack']).take(3).join(' · ');
          return AdminRecordCardData(
            title: _string(item['title'], fallback: 'Untitled project'),
            subtitle: _excerpt(_string(item['description']), 110),
            badges: [
              if (tech.isNotEmpty) tech,
              if (_boolLabel(item['featured'])) 'Featured',
            ],
          );
        },
      ),
    );
  }

  Widget _eventsCrudPage() {
    final repo = context.read<AdminRepository>();
    return AdminCrudPage(
      config: AdminCrudConfig(
        title: 'Events',
        eyebrow: 'Events',
        description: 'Post new events and keep past entries visible.',
        createButtonLabel: 'Add Event',
        formTitle: 'Add event',
        loader: () => repo.fetchList('/events'),
        create: (payload) => repo.createObject('/events', _normalizeEventPayload(payload)),
        update: (id, payload) => repo.updateObject('/events/$id', _normalizeEventPayload(payload)),
        delete: (id) => repo.deleteObject('/events/$id'),
        fields: const [
          AdminFieldSpec(key: 'title', label: 'Title'),
          AdminFieldSpec(
            key: 'type',
            label: 'Type',
            type: AdminFieldType.dropdown,
            options: ['workshop', 'hackathon', 'seminar', 'meetup', 'other'],
          ),
          AdminFieldSpec(key: 'description', label: 'Description', type: AdminFieldType.multiline),
          AdminFieldSpec(key: 'date', label: 'Date', hintText: 'YYYY-MM-DD'),
          AdminFieldSpec(key: 'venue', label: 'Venue', required: false),
          AdminFieldSpec(key: 'imageUrl', label: 'Image URL', required: false),
          AdminFieldSpec(key: 'registrationLink', label: 'Registration Link', required: false),
          AdminFieldSpec(
            key: 'status',
            label: 'Status',
            type: AdminFieldType.dropdown,
            options: ['upcoming', 'completed'],
          ),
          AdminFieldSpec(key: 'featured', label: 'Featured', type: AdminFieldType.boolean, required: false),
        ],
        cardData: (item) {
          return AdminRecordCardData(
            title: _string(item['title'], fallback: 'Untitled event'),
            subtitle: '${_displayRole(_string(item['type'], fallback: 'event'))} • ${_string(item['date'], fallback: 'No date')}',
            badges: [
              _string(item['status'], fallback: 'upcoming'),
              if (_boolLabel(item['featured'])) 'Featured',
            ],
          );
        },
      ),
    );
  }

  Widget _announcementsCrudPage() {
    final repo = context.read<AdminRepository>();
    return AdminCrudPage(
      config: AdminCrudConfig(
        title: 'Announcements',
        eyebrow: 'Announcements',
        description: 'Pin important updates for the community.',
        createButtonLabel: 'Post Announcement',
        formTitle: 'Post announcement',
        loader: () => repo.fetchList('/announcements'),
        create: (payload) => repo.createObject('/announcements', payload),
        update: (id, payload) => repo.updateObject('/announcements/$id', payload),
        delete: (id) => repo.deleteObject('/announcements/$id'),
        fields: const [
          AdminFieldSpec(key: 'title', label: 'Title'),
          AdminFieldSpec(key: 'body', label: 'Body', type: AdminFieldType.multiline),
          AdminFieldSpec(key: 'important', label: 'Mark as important', type: AdminFieldType.boolean, required: false),
        ],
        cardData: (item) => AdminRecordCardData(
          title: _string(item['title'], fallback: 'Untitled announcement'),
          subtitle: _excerpt(_string(item['body']), 120),
          badges: [
            if (_boolLabel(item['important'])) 'Important',
          ],
        ),
      ),
    );
  }

  Widget _timelineCrudPage() {
    final repo = context.read<AdminRepository>();
    return AdminCrudPage(
      config: AdminCrudConfig(
        title: 'Timeline',
        eyebrow: 'Timeline',
        description: 'Build the public legacy timeline.',
        createButtonLabel: 'Add Milestone',
        formTitle: 'Add milestone',
        loader: () => repo.fetchList('/timeline'),
        create: (payload) => repo.createObject('/timeline', payload),
        update: (id, payload) => repo.updateObject('/timeline/$id', payload),
        delete: (id) => repo.deleteObject('/timeline/$id'),
        fields: const [
          AdminFieldSpec(key: 'year', label: 'Year', type: AdminFieldType.number),
          AdminFieldSpec(key: 'month', label: 'Month', required: false),
          AdminFieldSpec(key: 'title', label: 'Title'),
          AdminFieldSpec(key: 'description', label: 'Description', type: AdminFieldType.multiline),
          AdminFieldSpec(key: 'imageUrl', label: 'Image URL', required: false),
        ],
        cardData: (item) => AdminRecordCardData(
          title: _string(item['title'], fallback: 'Timeline item'),
          subtitle: '${_string(item['month'], fallback: 'Month')} ${_string(item['year'], fallback: '')}'.trim(),
          badges: [
            if (_string(item['year']).isNotEmpty) _string(item['year']),
          ],
        ),
      ),
    );
  }

  Widget _galleryCrudPage() {
    final repo = context.read<AdminRepository>();
    return AdminCrudPage(
      config: AdminCrudConfig(
        title: 'Gallery',
        eyebrow: 'Gallery',
        description: 'Upload or link gallery content.',
        createButtonLabel: 'Add Photo',
        formTitle: 'Add photo',
        loader: () => repo.fetchList('/gallery'),
        create: (payload) => repo.createObject('/gallery', payload),
        update: (id, payload) => repo.updateObject('/gallery/$id', payload),
        delete: (id) => repo.deleteObject('/gallery/$id'),
        fields: const [
          AdminFieldSpec(key: 'title', label: 'Title'),
          AdminFieldSpec(key: 'imageUrl', label: 'Image URL'),
          AdminFieldSpec(
            key: 'category',
            label: 'Category',
            type: AdminFieldType.dropdown,
            options: ['event', 'poster', 'team', 'other'],
          ),
          AdminFieldSpec(key: 'eventRef', label: 'Event Reference', required: false),
        ],
        cardData: (item) => AdminRecordCardData(
          title: _string(item['title'], fallback: 'Untitled photo'),
          subtitle: _string(item['category'], fallback: 'gallery'),
          badges: [
            if (_string(item['eventRef']).isNotEmpty) 'Event linked',
          ],
        ),
      ),
    );
  }

  Widget _doubtsCrudPage() {
    final repo = context.read<AdminRepository>();
    return AdminCrudPage(
      config: AdminCrudConfig(
        title: 'Doubts',
        eyebrow: 'Doubts',
        description: 'Moderate forum questions and resolve issue threads.',
        canCreate: false,
        createButtonLabel: 'Add Question',
        formTitle: 'Edit question',
        loader: () => repo.fetchList('/doubts'),
        create: (payload) => repo.createObject('/doubts', payload),
        update: (id, payload) => repo.updateObject('/doubts/$id', payload),
        delete: (id) => repo.deleteObject('/doubts/$id'),
        fields: const [
          AdminFieldSpec(key: 'title', label: 'Title'),
          AdminFieldSpec(key: 'body', label: 'Body', type: AdminFieldType.multiline),
          AdminFieldSpec(key: 'domain', label: 'Domain', required: false),
          AdminFieldSpec(key: 'resolved', label: 'Resolved', type: AdminFieldType.boolean, required: false),
        ],
        cardData: (item) => AdminRecordCardData(
          title: _string(item['title'], fallback: 'Untitled question'),
          subtitle: _excerpt(_string(item['body']), 120),
          badges: [
            _string(item['domain'], fallback: 'general'),
            if (_boolLabel(item['resolved'])) 'Resolved',
            if (_string(item['upvotes']).isNotEmpty) '${_string(item['upvotes'])} upvotes',
          ],
        ),
      ),
    );
  }

  Widget _blogsCrudPage() {
    final repo = context.read<AdminRepository>();
    return AdminCrudPage(
      config: AdminCrudConfig(
        title: 'Blogs',
        eyebrow: 'Blogs',
        description: 'Create and manage blog posts.',
        createButtonLabel: 'Add Blog',
        formTitle: 'Add blog',
        loader: () => repo.fetchList('/blogs'),
        create: (payload) => repo.createObject('/blogs', _normalizeBlogPayload(payload)),
        update: (id, payload) => repo.updateObject('/blogs/$id', _normalizeBlogPayload(payload)),
        delete: (id) => repo.deleteObject('/blogs/$id'),
        onItemTap: (item) async {
          final id = _id(item);
          if (id == null || !mounted) return;
          await Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => BlogDetailScreen(blogId: id),
            ),
          );
        },
        fields: const [
          AdminFieldSpec(key: 'title', label: 'Title'),
          AdminFieldSpec(key: 'content', label: 'Content', type: AdminFieldType.multiline),
          AdminFieldSpec(key: 'coverImage', label: 'Cover Image URL', required: false),
          AdminFieldSpec(key: 'tags', label: 'Tags', required: false, hintText: 'Comma separated tags'),
          AdminFieldSpec(key: 'published', label: 'Published', type: AdminFieldType.boolean, required: false),
        ],
        cardData: (item) => AdminRecordCardData(
          title: _string(item['title'], fallback: 'Untitled blog'),
          subtitle: _excerpt(_string(item['content']), 100),
          badges: [
            ..._csvItems(item['tags']).take(3),
            if (_boolLabel(item['published'])) 'Published',
          ],
        ),
      ),
    );
  }

  Widget _opportunitiesCrudPage() {
    final repo = context.read<AdminRepository>();
    return AdminCrudPage(
      config: AdminCrudConfig(
        title: 'Opportunities',
        eyebrow: 'Opportunities',
        description: 'Publish and moderate opportunities with a cleaner editor.',
        createButtonLabel: 'Add Opportunity',
        formTitle: 'Add opportunity',
        loader: () => repo.fetchList('/opportunities'),
        create: (payload) => repo.createObject('/opportunities', _normalizeOpportunityPayload(payload)),
        update: (id, payload) => repo.updateObject('/opportunities/$id', _normalizeOpportunityPayload(payload)),
        delete: (id) => repo.deleteObject('/opportunities/$id'),
        fields: const [
          AdminFieldSpec(key: 'title', label: 'Title'),
          AdminFieldSpec(key: 'company', label: 'Company'),
          AdminFieldSpec(
            key: 'type',
            label: 'Type',
            type: AdminFieldType.dropdown,
            options: ['internship', 'job', 'freelance', 'open_source'],
          ),
          AdminFieldSpec(key: 'domain', label: 'Domain', required: false),
          AdminFieldSpec(key: 'applyLink', label: 'Apply Link'),
          AdminFieldSpec(key: 'deadline', label: 'Deadline', required: false, hintText: 'YYYY-MM-DD'),
          AdminFieldSpec(key: 'description', label: 'Description', type: AdminFieldType.multiline, required: false),
          AdminFieldSpec(key: 'isActive', label: 'Active', type: AdminFieldType.boolean, required: false),
        ],
        cardData: (item) => AdminRecordCardData(
          title: _string(item['title'], fallback: 'Untitled opportunity'),
          subtitle: _string(item['company'], fallback: 'Company not set'),
          badges: [
            _string(item['type'], fallback: 'opportunity'),
            if (_string(item['domain']).isNotEmpty) _string(item['domain']),
            if (_boolLabel(item['isActive'])) 'Active',
          ],
        ),
      ),
    );
  }

  Widget _resourcesCrudPage() {
    final repo = context.read<AdminRepository>();
    return AdminCrudPage(
      config: AdminCrudConfig(
        title: 'Resources',
        eyebrow: 'Resources',
        description: 'Publish learning materials, guides, and references for the community.',
        createButtonLabel: 'Add Resource',
        formTitle: 'Add resource',
        loader: () => repo.fetchList('/resources'),
        create: (payload) => repo.createObject('/resources', payload),
        update: (id, payload) => repo.updateObject('/resources/$id', payload),
        delete: (id) => repo.deleteObject('/resources/$id'),
        fields: const [
          AdminFieldSpec(key: 'title', label: 'Title'),
          AdminFieldSpec(key: 'url', label: 'URL'),
          AdminFieldSpec(
            key: 'category',
            label: 'Category',
            type: AdminFieldType.dropdown,
            options: ['PDF', 'GitHub', 'YouTube', 'Docs', 'Other'],
          ),
          AdminFieldSpec(key: 'domain', label: 'Domain', required: false),
          AdminFieldSpec(key: 'description', label: 'Description', type: AdminFieldType.multiline, required: false),
        ],
        cardData: (item) => AdminRecordCardData(
          title: _string(item['title'], fallback: 'Untitled resource'),
          subtitle: _string(item['url'], fallback: 'No URL'),
          badges: [
            _string(item['category'], fallback: 'resource'),
            if (_string(item['domain']).isNotEmpty) _string(item['domain']),
          ],
        ),
        onItemTap: (item) async {
          final url = _string(item['url']);
          if (url.isEmpty) return;
          await _openExternal(url);
        },
      ),
    );
  }

  Widget _teamCrudPage() {
    final repo = context.read<AdminRepository>();
    return AdminCrudPage(
      config: AdminCrudConfig(
        title: 'Team',
        eyebrow: 'Team',
        description: 'Manage founders, faculty, core teams, and yearly groups.',
        createButtonLabel: 'Add Member',
        formTitle: 'Add team member',
        loader: () => repo.fetchList('/team'),
        create: (payload) => repo.createObject('/team', _normalizeTeamPayload(payload)),
        update: (id, payload) => repo.updateObject('/team/$id', _normalizeTeamPayload(payload)),
        delete: (id) => repo.deleteObject('/team/$id'),
        fields: const [
          AdminFieldSpec(key: 'name', label: 'Name'),
          AdminFieldSpec(key: 'role', label: 'Role'),
          AdminFieldSpec(key: 'subtitle', label: 'Subtitle / Department / Batch note', required: false),
          AdminFieldSpec(key: 'teamYear', label: 'Team Year', required: false),
          AdminFieldSpec(
            key: 'category',
            label: 'Category',
            type: AdminFieldType.dropdown,
            options: ['founder', 'faculty', 'core', 'mentor'],
          ),
          AdminFieldSpec(key: 'batch', label: 'Batch', required: false),
          AdminFieldSpec(key: 'domain', label: 'Domains', required: false, hintText: 'Comma separated domains'),
          AdminFieldSpec(key: 'imageUrl', label: 'Image URL', required: false),
          AdminFieldSpec(key: 'linkedinUrl', label: 'LinkedIn URL', required: false),
          AdminFieldSpec(key: 'githubUrl', label: 'GitHub URL', required: false),
          AdminFieldSpec(key: 'order', label: 'Order', type: AdminFieldType.number, required: false),
        ],
        cardData: (item) => AdminRecordCardData(
          title: _string(item['name'], fallback: 'Unnamed member'),
          subtitle: _string(item['role'], fallback: 'Team member'),
          badges: [
            _string(item['category'], fallback: 'team'),
            if (_string(item['batch']).isNotEmpty) 'Batch ${_string(item['batch'])}',
            if (_string(item['teamYear']).isNotEmpty) 'Year ${_string(item['teamYear'])}',
          ],
        ),
      ),
    );
  }
}

class _HeroPanel extends StatelessWidget {
  const _HeroPanel({
    required this.userName,
    required this.role,
  });

  final String userName;
  final String role;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        gradient: const LinearGradient(
          colors: [Color(0xFF151515), Color(0xFF090909)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'ADMIN',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3.2,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 12),
          Text(
            'Control Panel',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 34),
          ),
          const SizedBox(height: 10),
          Text(
            'Manage club users, content, and communication from a single mobile view.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _Chip(text: userName),
              _Chip(text: _displayRole(role)),
              _Chip(text: 'Admin access'),
            ],
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
                letterSpacing: 3,
                color: Colors.white54,
              ),
        ),
        const SizedBox(height: 8),
        Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 24)),
        const SizedBox(height: 6),
        Text(description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
  });

  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value.toString(),
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 4),
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 2,
                  color: Colors.white54,
                ),
          ),
        ],
      ),
    );
  }
}

class _LoadingPanel extends StatelessWidget {
  const _LoadingPanel();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 180,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      child: const Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
    );
  }
}

class _EmptyPanel extends StatelessWidget {
  const _EmptyPanel({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(18),
      child: Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
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
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Unable to load admin metrics', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
          const SizedBox(height: 14),
          OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}

String _displayRole(String role) {
  final text = role.trim();
  if (text.isEmpty) return 'Admin';
  return text[0].toUpperCase() + text.substring(1);
}

String _friendlyError(Object? error) {
  final text = error.toString();
  if (text.contains('401')) return 'Your session expired. Please sign in again.';
  if (text.contains('SocketException') || text.contains('DioException')) {
    return 'Cannot reach the backend. Check the API URL and network.';
  }
  return 'Something went wrong while loading the control panel.';
}

Future<void> _openExternal(String value) async {
  final uri = Uri.tryParse(value.trim());
  if (uri == null) return;
  try {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  } catch (_) {
    // Ignore launcher failures so admin CRUD stays usable offline or on misconfigured platforms.
  }
}

enum AdminSection {
  users,
  projects,
  events,
  announcements,
  timeline,
  gallery,
  doubts,
  blogs,
  opportunities,
  resources,
  team,
  contact,
  points,
}

class _AdminSectionsBlock extends StatelessWidget {
  const _AdminSectionsBlock({
    required this.onSectionTap,
  });

  final ValueChanged<AdminSection> onSectionTap;

  @override
  Widget build(BuildContext context) {
    final sections = const [
      (AdminSection.users, 'Users', 'Manage access'),
      (AdminSection.projects, 'Projects', 'Review content'),
      (AdminSection.events, 'Events', 'Edit listings'),
      (AdminSection.announcements, 'Announcements', 'Broadcast notices'),
      (AdminSection.timeline, 'Timeline', 'Update milestones'),
      (AdminSection.gallery, 'Gallery', 'Curate media'),
      (AdminSection.doubts, 'Doubts', 'Moderate forum'),
      (AdminSection.blogs, 'Blogs', 'Manage posts'),
      (AdminSection.opportunities, 'Opportunities', 'Career feed'),
      (AdminSection.resources, 'Resources', 'Learning library'),
      (AdminSection.team, 'Team', 'Staff profiles'),
      (AdminSection.contact, 'Contact', 'Update links'),
      (AdminSection.points, 'Points', 'Adjust rules'),
    ];

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
          Text(
            'Admin sections',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 14),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.5,
            children: [
              for (final entry in sections)
                _AdminSectionTile(
                  title: entry.$2,
                  subtitle: entry.$3,
                  onTap: () => onSectionTap(entry.$1),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AdminSectionTile extends StatelessWidget {
  const _AdminSectionTile({
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: Colors.black.withAlpha(36),
          border: Border.all(color: Colors.white.withAlpha(20)),
        ),
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title.toUpperCase(),
              style: Theme.of(context).textTheme.titleMedium,
            ),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white60),
            ),
          ],
        ),
      ),
    );
  }
}

class AdminListPage extends StatefulWidget {
  const AdminListPage({
    super.key,
    required this.title,
    required this.eyebrow,
    required this.description,
    required this.loader,
    required this.itemBuilder,
  });

  final String title;
  final String eyebrow;
  final String description;
  final Future<List<Map<String, dynamic>>> Function() loader;
  final Widget Function(BuildContext context, Map<String, dynamic> item) itemBuilder;

  @override
  State<AdminListPage> createState() => _AdminListPageState();
}

class _AdminListPageState extends State<AdminListPage> {
  Future<List<Map<String, dynamic>>>? _future;
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= widget.loader();
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = widget.loader();
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
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(title: Text(widget.title)),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: FutureBuilder<List<Map<String, dynamic>>>(
            future: _future,
            builder: (context, snapshot) {
              final loading = snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData;
              final items = snapshot.data ?? const <Map<String, dynamic>>[];

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

              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: [
                  _SectionHeader(
                    eyebrow: widget.eyebrow,
                    title: widget.title,
                    description: widget.description,
                  ),
                  const SizedBox(height: 16),
                  if (loading)
                    const _LoadingPanel()
                  else if (items.isEmpty)
                    const _EmptyPanel(message: 'No records found.')
                  else
                    ...items.asMap().entries.map(
                      (entry) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: widget.itemBuilder(context, entry.value),
                      ),
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _ListTileCard extends StatelessWidget {
  const _ListTileCard({
    required this.item,
    required this.title,
    required this.subtitle,
    required this.trailingLabel,
    this.onTap,
  });

  final Map<String, dynamic> item;
  final String title;
  final String subtitle;
  final String trailingLabel;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 6),
                      Text(subtitle, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.4)),
                    ],
                  ),
                ),
                if (trailingLabel.isNotEmpty)
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      color: Colors.white.withAlpha(10),
                      border: Border.all(color: Colors.white.withAlpha(20)),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    child: Text(
                      trailingLabel,
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(color: Colors.white70),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class AdminContactPage extends StatefulWidget {
  const AdminContactPage({super.key});

  @override
  State<AdminContactPage> createState() => _AdminContactPageState();
}

class _AdminContactPageState extends State<AdminContactPage> {
  Future<Map<String, dynamic>>? _future;
  String? _errorMessage;
  final _emailController = TextEditingController();
  final _locationController = TextEditingController();
  final _departmentController = TextEditingController();
  final _githubController = TextEditingController();
  final _linkedinController = TextEditingController();
  final _instagramController = TextEditingController();
  final _twitterController = TextEditingController();
  bool _saving = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= context.read<AdminRepository>().fetchContact();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _locationController.dispose();
    _departmentController.dispose();
    _githubController.dispose();
    _linkedinController.dispose();
    _instagramController.dispose();
    _twitterController.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = context.read<AdminRepository>().fetchContact();
    });
    try {
      await _future;
    } catch (error) {
      if (!mounted) return;
      setState(() => _errorMessage = _friendlyError(error));
    }
  }

  Future<void> _save() async {
    if (_saving) return;
    setState(() => _saving = true);
    try {
      final payload = <String, dynamic>{
        'email': _emailController.text.trim(),
        'location': _locationController.text.trim(),
        'department': _departmentController.text.trim(),
        'github': _githubController.text.trim(),
        'linkedin': _linkedinController.text.trim(),
        'instagram': _instagramController.text.trim(),
        'twitter': _twitterController.text.trim(),
      }..removeWhere((key, value) => value == null || value.toString().trim().isEmpty);

      await context.read<AdminRepository>().updateContact(payload);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Contact updated.')));
      await _refresh();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_friendlyError(error))));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _fillControllers(Map<String, dynamic> data) {
    _emailController.text = _string(data['email']);
    _locationController.text = _string(data['location']);
    _departmentController.text = _string(data['department']);
    _githubController.text = _string(data['github']);
    _linkedinController.text = _string(data['linkedin']);
    _instagramController.text = _string(data['instagram']);
    _twitterController.text = _string(data['twitter']);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(title: const Text('Contact')),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: FutureBuilder<Map<String, dynamic>>(
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

              final data = snapshot.data;
              if (data != null && !_saving && _emailController.text.isEmpty) {
                _fillControllers(data);
              }

              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: [
                  const _SectionHeader(
                    eyebrow: 'Reach out',
                    title: 'Contact, managed from the same backend record.',
                    description: 'Edit official contact details and social links here.',
                  ),
                  const SizedBox(height: 16),
                  if (loading)
                    const _LoadingPanel()
                  else
                    _AdminFormPanel(
                      children: [
                        _AdminTextField(controller: _emailController, label: 'Email'),
                        _AdminTextField(controller: _locationController, label: 'Location'),
                        _AdminTextField(controller: _departmentController, label: 'Department'),
                        _AdminTextField(controller: _githubController, label: 'GitHub'),
                        _AdminTextField(controller: _linkedinController, label: 'LinkedIn'),
                        _AdminTextField(controller: _instagramController, label: 'Instagram'),
                        _AdminTextField(controller: _twitterController, label: 'Twitter'),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          onPressed: _saving ? null : _save,
                          child: _saving ? const Text('Saving...') : const Text('Save contact'),
                        ),
                      ],
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class AdminPointsPage extends StatefulWidget {
  const AdminPointsPage({super.key});

  @override
  State<AdminPointsPage> createState() => _AdminPointsPageState();
}

class _AdminPointsPageState extends State<AdminPointsPage> {
  Future<List<Map<String, dynamic>>>? _future;
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= context.read<AdminRepository>().fetchPointRules();
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = context.read<AdminRepository>().fetchPointRules();
    });
    try {
      await _future;
    } catch (error) {
      if (!mounted) return;
      setState(() => _errorMessage = _friendlyError(error));
    }
  }

  Future<void> _editRule(Map<String, dynamic> rule) async {
    final flatPointsController = TextEditingController(text: _string(rule['flatPoints']));
    final repo = context.read<AdminRepository>();
    try {
      final saved = await showDialog<bool>(
        context: context,
        builder: (dialogContext) {
          return AlertDialog(
            title: const Text('Edit point rule'),
            content: TextField(
              controller: flatPointsController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Flat points'),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.of(dialogContext).pop(false), child: const Text('Cancel')),
              ElevatedButton(onPressed: () => Navigator.of(dialogContext).pop(true), child: const Text('Save')),
            ],
          );
        },
      );

      if (saved != true || !mounted) return;
      final id = _id(rule);
      if (id == null) return;
      await repo.updatePointRule(
            id,
            {'flatPoints': int.tryParse(flatPointsController.text.trim()) ?? 0},
          );
      await _refresh();
    } finally {
      flatPointsController.dispose();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(title: const Text('Points')),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: FutureBuilder<List<Map<String, dynamic>>>(
            future: _future,
            builder: (context, snapshot) {
              final loading = snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData;
              final items = snapshot.data ?? const <Map<String, dynamic>>[];

              if (snapshot.hasError || _errorMessage != null) {
                return ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  children: [
                    _ErrorPanel(message: _errorMessage ?? _friendlyError(snapshot.error), onRetry: _refresh),
                  ],
                );
              }

              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: [
                  const _SectionHeader(
                    eyebrow: 'Rewards',
                    title: 'Point rules and scoring configuration.',
                    description: 'Review and update admin-managed point rules.',
                  ),
                  const SizedBox(height: 16),
                  if (loading)
                    const _LoadingPanel()
                  else if (items.isEmpty)
                    const _EmptyPanel(message: 'No point rules found.')
                  else
                    ...items.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _ListTileCard(
                          item: item,
                          title: _string(item['key'], fallback: 'Rule'),
                          subtitle: 'Flat points: ${_string(item['flatPoints'], fallback: '0')}',
                          trailingLabel: 'Edit',
                          onTap: () => _editRule(item),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _AdminFormPanel extends StatelessWidget {
  const _AdminFormPanel({required this.children});

  final List<Widget> children;

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
        children: children,
      ),
    );
  }
}

class _AdminTextField extends StatelessWidget {
  const _AdminTextField({
    required this.controller,
    required this.label,
  });

  final TextEditingController controller;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(labelText: label),
      ),
    );
  }
}

String _string(dynamic value, {String fallback = ''}) {
  final text = value?.toString().trim();
  if (text == null || text.isEmpty) return fallback;
  return text;
}

String? _id(Map<String, dynamic> item) {
  final value = item['_id'] ?? item['id'];
  final text = value?.toString().trim();
  if (text == null || text.isEmpty) return null;
  return text;
}

bool _boolLabel(dynamic value) {
  if (value is bool) return value;
  final text = value?.toString().toLowerCase();
  return text == 'true' || text == '1' || text == 'yes';
}

List<String> _csvItems(dynamic value) {
  if (value is List) {
    return value.map((item) => item.toString().trim()).where((item) => item.isNotEmpty).toList();
  }
  final text = value?.toString().trim();
  if (text == null || text.isEmpty) return const [];
  return text.split(',').map((item) => item.trim()).where((item) => item.isNotEmpty).toList();
}

String _excerpt(String value, [int maxLength = 96]) {
  final text = value.trim();
  if (text.length <= maxLength) return text;
  return '${text.substring(0, maxLength).trimRight()}...';
}

Map<String, dynamic> _normalizeUserPayload(Map<String, dynamic> payload, {required bool creating}) {
  final data = Map<String, dynamic>.from(payload);
  data['domain'] = _csvItems(data['domain']);
  if (_string(data['password']).isEmpty) {
    data.remove('password');
  }
  if (_isPrimaryAdminEmail(_string(data['email']))) {
    data['role'] = 'admin';
  }
  if (!creating && !_boolLabel(data['isSuspended'])) {
    data.remove('suspendedReason');
  }
  return data;
}

Map<String, dynamic> _normalizeProjectPayload(Map<String, dynamic> payload) {
  final data = Map<String, dynamic>.from(payload);
  data['techStack'] = _csvItems(data['techStack']);
  data['contributors'] = _csvItems(data['contributors']);
  return data;
}

Map<String, dynamic> _normalizeBlogPayload(Map<String, dynamic> payload) {
  final data = Map<String, dynamic>.from(payload);
  data['tags'] = _csvItems(data['tags']);
  return data;
}

Map<String, dynamic> _normalizeOpportunityPayload(Map<String, dynamic> payload) {
  final data = Map<String, dynamic>.from(payload);
  if (_string(data['domain']).isEmpty) {
    data.remove('domain');
  }
  if (_string(data['description']).isEmpty) {
    data.remove('description');
  }
  return data;
}

Map<String, dynamic> _normalizeTeamPayload(Map<String, dynamic> payload) {
  final data = Map<String, dynamic>.from(payload);
  data['domain'] = _csvItems(data['domain']);
  return data;
}

Map<String, dynamic> _normalizeEventPayload(Map<String, dynamic> payload) {
  final data = Map<String, dynamic>.from(payload);
  if (_string(data['venue']).isEmpty) {
    data.remove('venue');
  }
  if (_string(data['registrationLink']).isEmpty) {
    data.remove('registrationLink');
  }
  if (_string(data['imageUrl']).isEmpty) {
    data.remove('imageUrl');
  }
  return data;
}

bool _isPrimaryAdminEmail(String email) {
  return email.toLowerCase() == _primaryAdminEmail;
}

bool _isProtectedAdmin(Map<String, dynamic> item) {
  final email = _string(item['email']).toLowerCase();
  return _protectedAdminEmails.contains(email);
}

bool _isPrimaryAdmin(Map<String, dynamic> item) {
  final email = _string(item['email']).toLowerCase();
  return email == _primaryAdminEmail;
}

bool _isAdminRole(Map<String, dynamic> item) {
  return _string(item['role']).toLowerCase() == 'admin';
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../auth/auth_controller.dart';
import '../../auth/data/user_profile.dart';
import '../../../core/widgets/safe_network_image.dart';
import '../../home/data/project_item.dart';
import '../../profile/data/profile_repository.dart';
import '../../profile/presentation/public_profile_screen.dart';
import '../data/blog_item.dart';
import '../data/contact_info_item.dart';
import '../data/doubt_item.dart';
import '../data/explore_repository.dart';
import '../data/gallery_item.dart';
import '../data/leaderboard_item.dart';
import '../data/opportunity_item.dart';
import '../data/timeline_item.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        children: [
          const _HeroSection(),
          const SizedBox(height: 18),
          _ExploreTileGrid(
            onTapIndex: (index) {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => switch (index) {
                    0 => const ProjectsExplorePage(),
                    1 => const GalleryExplorePage(),
                    2 => const OpportunitiesExplorePage(),
                    3 => const LegacyExplorePage(),
                    4 => const ForumExplorePage(),
                  5 => const LeaderboardExplorePage(),
                  6 => const BlogExplorePage(),
                  7 => const ContactExplorePage(),
                  8 => const ConnectExplorePage(),
                  _ => const ProjectsExplorePage(),
                },
              ),
            );
          },
          ),
          const SizedBox(height: 20),
          const _SectionBlock(
            eyebrow: 'Explore',
            title: 'Open a section',
            description: 'Each card opens a dedicated page that mirrors the web subcategory structure.',
            child: _ExploreHint(),
          ),
        ],
      ),
    );
  }
}

class ProjectsExplorePage extends StatelessWidget {
  const ProjectsExplorePage({super.key});

  @override
  Widget build(BuildContext context) {
    return _SectionDataPage<ProjectItem>(
      title: 'Projects',
      eyebrow: 'What we built',
      description: 'Same backend data, presented on a dedicated mobile page.',
      loader: (repo) => repo.fetchProjects(),
      emptyMessage: 'No featured projects yet.',
      itemBuilder: (context, project, index) => _ProjectCard(project: project),
    );
  }
}

class GalleryExplorePage extends StatefulWidget {
  const GalleryExplorePage({super.key});

  @override
  State<GalleryExplorePage> createState() => _GalleryExplorePageState();
}

class _GalleryExplorePageState extends State<GalleryExplorePage> {
  Future<List<GalleryItem>>? _future;
  String? _errorMessage;
  String _selectedCategory = 'all';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= context.read<ExploreRepository>().fetchGallery();
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = context.read<ExploreRepository>().fetchGallery();
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
    final categories = const [
      ('all', 'All'),
      ('event', 'Event'),
      ('poster', 'Poster'),
      ('team', 'Team'),
      ('other', 'Other'),
    ];

    return _SectionScaffold(
      title: 'Gallery',
      eyebrow: 'Moments',
      description: 'Gallery items are shown as a visual grid with the same backend data used on web.',
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<GalleryItem>>(
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

            final items = snapshot.data ?? const <GalleryItem>[];
            final filtered = _selectedCategory == 'all'
                ? items
                : items.where((item) => item.category.toLowerCase() == _selectedCategory).toList();

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                _SectionBlock(
                  eyebrow: 'Gallery',
                  title: 'Gallery, presented as a visual grid.',
                  description: 'Same gallery data, clearer media presentation, better spacing, and a more premium feel.',
                  child: loading
                      ? const _LoadingBlock()
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: categories
                                  .map(
                                    (category) => ChoiceChip(
                                      label: Text(category.$2.toUpperCase()),
                                      selected: _selectedCategory == category.$1,
                                      onSelected: (_) {
                                        setState(() => _selectedCategory = category.$1);
                                      },
                                    ),
                                  )
                                  .toList(),
                            ),
                            const SizedBox(height: 14),
                            if (filtered.isEmpty)
                              const _EmptyBlock(message: 'No gallery items found for this category.')
                            else
                              GridView.count(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                crossAxisCount: 1,
                                mainAxisSpacing: 12,
                                childAspectRatio: 1.18,
                                children: filtered.map((item) => _GalleryCard(item: item)).toList(),
                              ),
                          ],
                        ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class OpportunitiesExplorePage extends StatefulWidget {
  const OpportunitiesExplorePage({super.key});

  @override
  State<OpportunitiesExplorePage> createState() => _OpportunitiesExplorePageState();
}

class _OpportunitiesExplorePageState extends State<OpportunitiesExplorePage> {
  Future<List<OpportunityItem>>? _future;
  String? _errorMessage;
  String _selectedType = 'all';
  String _selectedDomain = 'all';
  static const List<String> _defaultTypes = ['all', 'internship', 'full-time job', 'freelance', 'open source'];
  static const List<String> _defaultDomains = [
    'all',
    'web',
    'ai',
    'machine learning',
    'flutter',
    'backend',
    'cyber security',
    'competitive programming',
    'research',
    'app dev',
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= context.read<ExploreRepository>().fetchOpportunities();
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = context.read<ExploreRepository>().fetchOpportunities();
    });

    try {
      await _future;
    } catch (error) {
      if (!mounted) return;
      setState(() => _errorMessage = _friendlyError(error));
    }
  }

  Future<void> _openTypeFilter(List<OpportunityItem> items) async {
    final types = <String>{
      ..._defaultTypes,
      ...items.map((item) => item.type.toLowerCase()),
    }.where((value) => value.isNotEmpty).toList();

    final result = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      isDismissible: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _OpportunityFilterSheet(
        title: 'Type',
        subtitle: 'Choose an opportunity type.',
        options: types,
        selectedValue: _selectedType,
      ),
    );

    if (!mounted || result == null) return;
    setState(() => _selectedType = result);
  }

  Future<void> _openDomainFilter(List<OpportunityItem> items) async {
    final domains = <String>{
      ..._defaultDomains,
      ...items.map((item) => item.domain?.toLowerCase()).whereType<String>(),
    }.where((value) => value.isNotEmpty).toList();

    final result = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      isDismissible: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _OpportunityFilterSheet(
        title: 'Domain',
        subtitle: 'Choose an opportunity domain.',
        options: domains,
        selectedValue: _selectedDomain,
      ),
    );

    if (!mounted || result == null) return;
    setState(() => _selectedDomain = result);
  }

  @override
  Widget build(BuildContext context) {
    return _SectionScaffold(
      title: 'Opportunities',
      eyebrow: 'Grow your career',
      description: 'A cleaner opportunity feed with easier filters and the same backend data as web.',
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<OpportunityItem>>(
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

            final items = snapshot.data ?? const <OpportunityItem>[];
            final filtered = items.where((item) {
              final typeOk = _selectedType == 'all' || item.type.toLowerCase() == _selectedType;
              final domain = item.domain?.toLowerCase();
              final domainOk = _selectedDomain == 'all' || domain == _selectedDomain;
              return typeOk && domainOk;
            }).toList();

            final activeCount = filtered.where((item) => item.isActive).length;
            final inactiveCount = filtered.length - activeCount;
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                _SectionBlock(
                  eyebrow: 'Opportunities',
                  title: 'Opportunities in a cleaner, premium feed.',
                  description: 'Filters are lighter to use on mobile and the same posting data is still sourced from the backend.',
                  child: loading
                      ? const _LoadingBlock()
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: _SummaryCard(label: 'Visible', value: '${filtered.length}'),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _SummaryCard(label: 'Active', value: '$activeCount'),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _SummaryCard(label: 'Closed', value: '$inactiveCount'),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Row(
                              children: [
                                Expanded(
                                  child: _FilterPill(
                                    label: 'Type: ${_prettyFilterLabel(_selectedType)}',
                                    onTap: () => _openTypeFilter(items),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _FilterPill(
                                    label: 'Domain: ${_prettyFilterLabel(_selectedDomain)}',
                                    onTap: () => _openDomainFilter(items),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            if (filtered.isEmpty)
                              const _EmptyBlock(message: 'No opportunities found. Check back soon.')
                            else
                              Column(
                                children: filtered
                                    .map((opportunity) => Padding(
                                          padding: const EdgeInsets.only(bottom: 12),
                                          child: _OpportunityCard(opportunity: opportunity),
                                        ))
                                    .toList(),
                              ),
                          ],
                        ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class LegacyExplorePage extends StatefulWidget {
  const LegacyExplorePage({super.key});

  @override
  State<LegacyExplorePage> createState() => _LegacyExplorePageState();
}

class _LegacyExplorePageState extends State<LegacyExplorePage> {
  Future<List<TimelineItem>>? _future;
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= context.read<ExploreRepository>().fetchLegacy();
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = context.read<ExploreRepository>().fetchLegacy();
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
    return _SectionScaffold(
      title: 'Legacy',
      eyebrow: 'Our journey',
      description: 'Milestones, achievements, and turning points in a cleaner timeline.',
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<TimelineItem>>(
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

            final items = snapshot.data ?? const <TimelineItem>[];
            final sorted = [...items]..sort((a, b) {
              final yearCompare = a.year.compareTo(b.year);
              if (yearCompare != 0) return yearCompare;
              return (a.month ?? '').compareTo(b.month ?? '');
            });

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                _SectionBlock(
                  eyebrow: 'Legacy',
                  title: 'Club legacy, presented like a living timeline.',
                  description: 'Same backend data, cleaner mobile spacing, and a more deliberate narrative.',
                  child: loading
                      ? const _LoadingBlock()
                      : sorted.isEmpty
                          ? const _EmptyBlock(message: 'No legacy milestones found.')
                          : _TimelineRail(items: sorted),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class ForumExplorePage extends StatefulWidget {
  const ForumExplorePage({super.key});

  @override
  State<ForumExplorePage> createState() => _ForumExplorePageState();
}

class _ForumExplorePageState extends State<ForumExplorePage> {
  Future<List<DoubtItem>>? _future;
  String? _errorMessage;
  String _statusFilter = 'all';
  String _domainFilter = 'all';

  static const List<String> _defaultDomains = [
    'all',
    'web',
    'ai',
    'machine learning',
    'flutter',
    'backend',
    'cyber security',
    'competitive programming',
    'research',
    'app dev',
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= _load();
  }

  Future<List<DoubtItem>> _load() async {
    final repo = context.read<ExploreRepository>();
    final resolved = switch (_statusFilter) {
      'open' => false,
      'resolved' => true,
      _ => null,
    };
    return repo.fetchForum(
      domain: _domainFilter,
      resolved: resolved,
    );
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = _load();
    });

    try {
      await _future;
    } catch (error) {
      if (!mounted) return;
      setState(() => _errorMessage = _friendlyError(error));
    }
  }

  Future<void> _reload() async {
    setState(() {
      _future = _load();
    });
    await _future;
  }

  Future<void> _createQuestion() async {
    final draft = await showModalBottomSheet<_ForumDraft>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const _NewForumQuestionSheet(),
    );
    if (draft == null || !mounted) return;

    final repo = context.read<ExploreRepository>();
    try {
      await repo.createForumQuestion(
        title: draft.title,
        body: draft.body,
        domain: draft.domain,
      );
      await _reload();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_friendlyError(error))),
      );
    }
  }

  Future<void> _editFilters(List<DoubtItem> items) async {
    final domains = <String>{
      ..._defaultDomains,
      ...items.map((item) => item.domain?.toLowerCase()).whereType<String>(),
    }.where((value) => value.isNotEmpty).toList();

    final result = await showModalBottomSheet<_ForumFilterSelection>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _ForumFilterSheet(
        domains: domains,
        selectedStatus: _statusFilter,
        selectedDomain: _domainFilter,
      ),
    );

    if (result == null || !mounted) return;
    setState(() {
      _statusFilter = result.status;
      _domainFilter = result.domain;
      _future = _load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = context.watch<AuthController>().user;
    final isAdmin = currentUser?.role == 'admin';

    return _SectionScaffold(
      title: 'Forum',
      eyebrow: 'Ask anything',
      description: 'Doubt forum, restyled without changing the flow.',
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<DoubtItem>>(
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

            final items = snapshot.data ?? const <DoubtItem>[];
            final filtered = items;
            final resolvedCount = filtered.where((item) => item.resolved).length;
            final openCount = filtered.length - resolvedCount;

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                _SectionBlock(
                  eyebrow: 'Forum',
                  title: 'Doubt forum, restyled without changing the flow.',
                  description: 'Users can post questions, answer threads, upvote posts, and the author can mark a question resolved.',
                  child: loading
                      ? const _LoadingBlock()
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(child: _SummaryCard(label: 'All', value: '${filtered.length}')),
                                const SizedBox(width: 10),
                                Expanded(child: _SummaryCard(label: 'Open', value: '$openCount')),
                                const SizedBox(width: 10),
                                Expanded(child: _SummaryCard(label: 'Resolved', value: '$resolvedCount')),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Text('Filters', style: Theme.of(context).textTheme.titleSmall),
                            const SizedBox(height: 6),
                            Text(
                              'Choose a status and domain. Apply once to refresh the feed.',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(height: 1.5),
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 10,
                              runSpacing: 10,
                              children: [
                                SizedBox(
                                  width: 152,
                                  child: _FilterPill(
                                    label: 'Status: ${_prettyFilterLabel(_statusFilter)}',
                                    onTap: () => _editFilters(items),
                                  ),
                                ),
                                SizedBox(
                                  width: 152,
                                  child: _FilterPill(
                                    label: 'Domain: ${_prettyFilterLabel(_domainFilter)}',
                                    onTap: () => _editFilters(items),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Align(
                              alignment: Alignment.centerRight,
                              child: ElevatedButton.icon(
                                onPressed: _createQuestion,
                                icon: const Icon(Icons.add),
                                label: const Text('Ask a Question'),
                              ),
                            ),
                            const SizedBox(height: 14),
                            if (filtered.isEmpty)
                              const _EmptyBlock(message: 'No forum posts yet. Start the first question.'),
                            for (final doubt in filtered) ...[
                              _ForumCard(
                                doubt: doubt,
                                currentUserId: currentUser?.id,
                                isAdmin: isAdmin,
                                onToggleUpvote: () async {
                                  await context.read<ExploreRepository>().toggleForumUpvote(doubt.id);
                                  await _reload();
                                },
                                onToggleResolve: () async {
                                  await context.read<ExploreRepository>().toggleForumResolve(doubt.id);
                                  await _reload();
                                },
                                onDeleteQuestion: () async {
                                  await context.read<ExploreRepository>().deleteForumQuestion(doubt.id);
                                  await _reload();
                                },
                                onReply: (body) async {
                                  await context.read<ExploreRepository>().addForumReply(
                                    doubtId: doubt.id,
                                    body: body,
                                  );
                                  await _reload();
                                },
                                onDeleteReply: (replyId) async {
                                  await context.read<ExploreRepository>().deleteForumReply(
                                    doubtId: doubt.id,
                                    replyId: replyId,
                                  );
                                  await _reload();
                                },
                              ),
                              const SizedBox(height: 12),
                            ],
                          ],
                        ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class LeaderboardExplorePage extends StatelessWidget {
  const LeaderboardExplorePage({super.key});

  @override
  Widget build(BuildContext context) {
    return _SectionDataPage<LeaderboardItem>(
      title: 'Leaderboard',
      eyebrow: 'Top contributors',
      description: 'Ranked by points from the live leaderboard endpoint.',
      loader: (repo) => repo.fetchLeaderboard(),
      emptyMessage: 'No leaderboard data yet.',
      itemBuilder: (context, student, index) => InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => PublicProfileScreen(userId: student.id),
            ),
          );
        },
        child: _LeaderboardCard(rank: index + 1, student: student),
      ),
    );
  }
}

class BlogExplorePage extends StatelessWidget {
  const BlogExplorePage({super.key});

  @override
  Widget build(BuildContext context) {
    return _SectionDataPage<BlogItem>(
      title: 'Blog',
      eyebrow: 'Ideas and learnings',
      description: 'Fresh posts from the blog feed.',
      loader: (repo) => repo.fetchBlogs(),
      emptyMessage: 'No blog posts yet.',
      itemBuilder: (context, blog, index) => _BlogCard(blog: blog),
    );
  }
}

class ContactExplorePage extends StatelessWidget {
  const ContactExplorePage({super.key});

  @override
  Widget build(BuildContext context) {
    return _SectionSinglePage<ContactInfoItem>(
      title: 'Contact',
      eyebrow: 'Reach the club',
      description: 'Direct contact data from the backend.',
      loader: (repo) => repo.fetchContact(),
      builder: (context, info) => _ContactCard(info: info),
    );
  }
}

class ConnectExplorePage extends StatefulWidget {
  const ConnectExplorePage({super.key});

  @override
  State<ConnectExplorePage> createState() => _ConnectExplorePageState();
}

class _ConnectExplorePageState extends State<ConnectExplorePage> {
  Future<List<UserProfile>>? _future;
  String? _errorMessage;
  String _selectedRole = 'all';
  String _selectedDomain = 'all';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= context.read<ProfileRepository>().fetchUsers();
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = context.read<ProfileRepository>().fetchUsers();
    });

    try {
      await _future;
    } catch (error) {
      if (!mounted) return;
      setState(() => _errorMessage = _friendlyError(error));
    }
  }

  Future<void> _openProfile(UserProfile profile) async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PublicProfileScreen(userId: profile.id),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final roleOptions = const ['all', 'student', 'mentor', 'alumni', 'senior', 'admin'];

    return _SectionScaffold(
      title: 'Connect',
      eyebrow: 'Find your guide',
      description: 'Browse students, seniors, alumni, and mentors in a dedicated directory that keeps the same mobile theme.',
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<UserProfile>>(
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

            final items = snapshot.data ?? const <UserProfile>[];
            final domains = <String>{
              'all',
              ...items.expand((user) => user.domain).map((domain) => domain.toLowerCase()),
            }.toList();

            final filtered = items.where((user) {
              final role = user.role.toLowerCase();
              final roleOk = _selectedRole == 'all' ||
                  (_selectedRole == 'mentor' ? user.isMentor : role == _selectedRole);
              final domainOk = _selectedDomain == 'all' || user.domain.map((d) => d.toLowerCase()).contains(_selectedDomain);
              return roleOk && domainOk;
            }).toList();

            final mentorCount = items.where((user) => user.isMentor).length;

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                _SectionBlock(
                  eyebrow: 'Directory',
                  title: 'Connect, presented as a clean directory.',
                  description: 'Same users data, clearer layout, and direct profile navigation.',
                  child: loading
                      ? const _LoadingBlock()
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(child: _SummaryCard(label: 'Users', value: '${items.length}')),
                                const SizedBox(width: 10),
                                Expanded(child: _SummaryCard(label: 'Mentors', value: '$mentorCount')),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Text('Role', style: Theme.of(context).textTheme.titleSmall),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: roleOptions
                                  .map(
                                    (role) => ChoiceChip(
                                      label: Text(_prettyFilterLabel(role)),
                                      selected: _selectedRole == role,
                                      onSelected: (_) => setState(() => _selectedRole = role),
                                    ),
                                  )
                                  .toList(),
                            ),
                            const SizedBox(height: 14),
                            Text('Domain', style: Theme.of(context).textTheme.titleSmall),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: domains
                                  .map(
                                    (domain) => ChoiceChip(
                                      label: Text(_prettyFilterLabel(domain)),
                                      selected: _selectedDomain == domain,
                                      onSelected: (_) => setState(() => _selectedDomain = domain),
                                    ),
                                  )
                                  .toList(),
                            ),
                            const SizedBox(height: 16),
                            if (filtered.isEmpty)
                              const _EmptyBlock(message: 'No users found for these filters.')
                            else
                              Column(
                                children: filtered
                                    .map(
                                      (user) => Padding(
                                        padding: const EdgeInsets.only(bottom: 12),
                                        child: _DirectoryCard(
                                          profile: user,
                                          onTap: () => _openProfile(user),
                                        ),
                                      ),
                                    )
                                    .toList(),
                              ),
                          ],
                        ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _SectionDataPage<T> extends StatefulWidget {
  const _SectionDataPage({
    required this.title,
    required this.eyebrow,
    required this.description,
    required this.loader,
    required this.emptyMessage,
    required this.itemBuilder,
  });

  final String title;
  final String eyebrow;
  final String description;
  final Future<List<T>> Function(ExploreRepository repo) loader;
  final String emptyMessage;
  final Widget Function(BuildContext context, T item, int index) itemBuilder;

  @override
  State<_SectionDataPage<T>> createState() => _SectionDataPageState<T>();
}

class _SectionDataPageState<T> extends State<_SectionDataPage<T>> {
  Future<List<T>>? _future;
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= _load();
  }

  Future<List<T>> _load() async {
    return widget.loader(context.read<ExploreRepository>());
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = _load();
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
    return _SectionScaffold(
      title: widget.title,
      eyebrow: widget.eyebrow,
      description: widget.description,
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<T>>(
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

            final items = snapshot.data ?? <T>[];
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                _SectionBlock(
                  eyebrow: widget.eyebrow,
                  title: widget.title,
                  description: widget.description,
                  child: loading
                      ? const _LoadingBlock()
                      : items.isEmpty
                          ? _EmptyBlock(message: widget.emptyMessage)
                          : Column(
                              children: items
                                  .asMap()
                                  .entries
                                  .map(
                                    (entry) => Padding(
                                      padding: const EdgeInsets.only(bottom: 12),
                                      child: widget.itemBuilder(context, entry.value, entry.key),
                                    ),
                                  )
                                  .toList(),
                            ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _SectionSinglePage<T> extends StatefulWidget {
  const _SectionSinglePage({
    required this.title,
    required this.eyebrow,
    required this.description,
    required this.loader,
    required this.builder,
  });

  final String title;
  final String eyebrow;
  final String description;
  final Future<T> Function(ExploreRepository repo) loader;
  final Widget Function(BuildContext context, T item) builder;

  @override
  State<_SectionSinglePage<T>> createState() => _SectionSinglePageState<T>();
}

class _SectionSinglePageState<T> extends State<_SectionSinglePage<T>> {
  Future<T>? _future;
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= widget.loader(context.read<ExploreRepository>());
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = widget.loader(context.read<ExploreRepository>());
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
    return _SectionScaffold(
      title: widget.title,
      eyebrow: widget.eyebrow,
      description: widget.description,
      child: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<T>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.hasError || _errorMessage != null) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: [
                  _ErrorPanel(message: _errorMessage ?? _friendlyError(snapshot.error), onRetry: _refresh),
                ],
              );
            }

            if (!snapshot.hasData) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: const [_LoadingBlock()],
              );
            }

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [widget.builder(context, snapshot.data as T)],
            );
          },
        ),
      ),
    );
  }
}

class _SectionScaffold extends StatelessWidget {
  const _SectionScaffold({
    required this.title,
    required this.eyebrow,
    required this.description,
    required this.child,
  });

  final String title;
  final String eyebrow;
  final String description;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: _SectionIntro(eyebrow: eyebrow, title: title, description: description),
            ),
            Expanded(child: child),
          ],
        ),
      ),
    );
  }
}

class _SectionIntro extends StatelessWidget {
  const _SectionIntro({
    required this.eyebrow,
    required this.title,
    required this.description,
  });

  final String eyebrow;
  final String title;
  final String description;

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
            eyebrow.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 2.6,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 12),
          Text(title, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 36, height: 1.05)),
          const SizedBox(height: 12),
          Text(description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.6)),
        ],
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
            'WHAT WE BUILT',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3.2,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 12),
          Text(
            'Projects, gallery, and more as separate sections.',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 36),
          ),
          const SizedBox(height: 12),
          Text(
            'Tap a category to open its own page and keep the same web-inspired visual language on mobile.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.6),
          ),
        ],
      ),
    );
  }
}

class _ExploreTileGrid extends StatelessWidget {
  const _ExploreTileGrid({required this.onTapIndex});

  final ValueChanged<int> onTapIndex;

  @override
  Widget build(BuildContext context) {
    final items = const [
      ('Projects', 0),
      ('Gallery', 1),
      ('Opportunities', 2),
      ('Legacy', 3),
      ('Forum', 4),
      ('Leaderboard', 5),
      ('Blog', 6),
      ('Contact', 7),
      ('Connect', 8),
    ];

    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 2.9,
      children: items
          .map(
            (item) => InkWell(
              borderRadius: BorderRadius.circular(18),
              onTap: () => onTapIndex(item.$2),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(18),
                  color: Colors.white.withAlpha(10),
                  border: Border.all(color: Colors.white.withAlpha(20)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    item.$1,
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: Colors.white70,
                          letterSpacing: 1.2,
                        ),
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _SectionBlock extends StatelessWidget {
  const _SectionBlock({
    required this.eyebrow,
    required this.title,
    required this.description,
    required this.child,
  });

  final String eyebrow;
  final String title;
  final String description;
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
          Text(
            eyebrow.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 3,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 8),
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 6),
          Text(description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _ExploreHint extends StatelessWidget {
  const _ExploreHint();

  @override
  Widget build(BuildContext context) {
    return const Text(
      'Projects, gallery, opportunities, legacy, forum, leaderboard, blog, and contact are each available as their own page.',
    );
  }
}

class _ProjectCard extends StatelessWidget {
  const _ProjectCard({required this.project});

  final ProjectItem project;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: Colors.black.withAlpha(46),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (project.featured) const _Badge(text: 'FEATURED', color: Color(0xFF34D399)),
          if (project.featured) const SizedBox(height: 8),
          Text(project.title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 6),
          Text(project.description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
          if (project.techStack.isNotEmpty) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: project.techStack.take(4).map((tech) => _MiniChip(text: tech)).toList(),
            ),
          ],
        ],
      ),
    );
  }
}

class _GalleryCard extends StatelessWidget {
  const _GalleryCard({required this.item});

  final GalleryItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(26),
        color: Colors.black.withAlpha(46),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: SafeNetworkImage(
              imageUrl: item.imageUrl,
              fit: BoxFit.cover,
              placeholder: Container(color: Colors.white.withAlpha(8)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _Badge(text: item.category.toUpperCase(), color: const Color(0xFF5CC8FF)),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  item.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                if (item.eventRef != null && item.eventRef!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    item.eventRef!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BlogCard extends StatelessWidget {
  const _BlogCard({required this.blog});

  final BlogItem blog;

  @override
  Widget build(BuildContext context) {
    final published = blog.createdAt?.toLocal();
    final publishedText = published?.toIso8601String().split('T').first ?? '';
    final excerpt = blog.content.length > 170 ? '${blog.content.substring(0, 170)}...' : blog.content;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: Colors.black.withAlpha(46),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (blog.coverImage != null && blog.coverImage!.isNotEmpty)
            AspectRatio(
              aspectRatio: 16 / 9,
              child: SafeNetworkImage(
                imageUrl: blog.coverImage,
                fit: BoxFit.cover,
                placeholder: Container(color: Colors.white.withAlpha(8)),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (blog.authorName != null && blog.authorName!.isNotEmpty)
                      _Badge(text: blog.authorName!.toUpperCase(), color: const Color(0xFF5CC8FF)),
                    if (publishedText.isNotEmpty) _Badge(text: publishedText, color: const Color(0xFF34D399)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(blog.title, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 6),
                Text(excerpt, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
                if (blog.tags.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: blog.tags.take(3).map((tag) => _MiniChip(text: tag)).toList(),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OpportunityCard extends StatelessWidget {
  const _OpportunityCard({required this.opportunity});

  final OpportunityItem opportunity;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: Colors.black.withAlpha(46),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _Badge(text: opportunity.type.toUpperCase(), color: const Color(0xFF5CC8FF)),
              if (opportunity.domain != null && opportunity.domain!.isNotEmpty)
                _Badge(text: opportunity.domain!.toUpperCase(), color: const Color(0xFF34D399)),
            ],
          ),
          const SizedBox(height: 8),
          Text(opportunity.title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 4),
          Text(opportunity.company, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 6),
          Text(
            opportunity.description ?? 'Open this opportunity for more details.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
          ),
          const SizedBox(height: 8),
          Text(
            opportunity.applyLink.isNotEmpty ? opportunity.applyLink : 'Application link unavailable',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

class _TimelineCard extends StatelessWidget {
  const _TimelineCard({required this.milestone});

  final TimelineItem milestone;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: Colors.black.withAlpha(46),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            milestone.month == null || milestone.month!.isEmpty ? '${milestone.year}' : '${milestone.month} ${milestone.year}',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 2.4,
                  color: Colors.white54,
                ),
          ),
          const SizedBox(height: 8),
          Text(milestone.title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 6),
          Text(milestone.description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
        ],
      ),
    );
  }
}

class _TimelineRail extends StatelessWidget {
  const _TimelineRail({required this.items});

  final List<TimelineItem> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: items
          .asMap()
          .entries
          .map(
            (entry) => Padding(
              padding: EdgeInsets.only(bottom: entry.key == items.length - 1 ? 0 : 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(top: 16),
                    child: Column(
                      children: [
                        Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFFF5B14C).withAlpha(70),
                            border: Border.all(color: const Color(0xFFF5B14C).withAlpha(130)),
                          ),
                        ),
                        if (entry.key != items.length - 1)
                          Container(
                            width: 2,
                            height: 112,
                            color: Colors.white.withAlpha(18),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: _TimelineCard(milestone: entry.value)),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}

class _ForumDraft {
  const _ForumDraft({
    required this.title,
    required this.body,
    required this.domain,
  });

  final String title;
  final String body;
  final String domain;
}

class _ForumFilterSheet extends StatefulWidget {
  const _ForumFilterSheet({
    required this.domains,
    required this.selectedStatus,
    required this.selectedDomain,
  });

  final List<String> domains;
  final String selectedStatus;
  final String selectedDomain;

  @override
  State<_ForumFilterSheet> createState() => _ForumFilterSheetState();
}

class _ForumFilterSheetState extends State<_ForumFilterSheet> {
  late String _status = widget.selectedStatus;
  late String _domain = widget.selectedDomain;

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return SafeArea(
      top: false,
      child: FractionallySizedBox(
        heightFactor: 0.9,
        child: Material(
          color: const Color(0xFF0D0D0D),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          child: Padding(
            padding: EdgeInsets.fromLTRB(20, 14, 20, 20 + bottomInset),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 42,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text('Forum Filters', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 6),
                  Text(
                    'Choose a post status and domain.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
                  ),
                  const SizedBox(height: 18),
                  Text('Status', style: Theme.of(context).textTheme.labelMedium),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: const ['all', 'open', 'resolved']
                        .map(
                          (status) => ChoiceChip(
                            label: Text(_prettyFilterLabel(status)),
                            selected: _status == status,
                            onSelected: (_) => setState(() => _status = status),
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 18),
                  Text('Domain', style: Theme.of(context).textTheme.labelMedium),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: widget.domains
                        .map(
                          (domain) => ChoiceChip(
                            label: Text(_prettyFilterLabel(domain)),
                            selected: _domain == domain,
                            onSelected: (_) => setState(() => _domain = domain),
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.of(context).pop(const _ForumFilterSelection(status: 'all', domain: 'all')),
                          child: const Text('Reset'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => Navigator.of(context).pop(_ForumFilterSelection(status: _status, domain: _domain)),
                          child: const Text('Apply'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NewForumQuestionSheet extends StatefulWidget {
  const _NewForumQuestionSheet();

  @override
  State<_NewForumQuestionSheet> createState() => _NewForumQuestionSheetState();
}

class _NewForumQuestionSheetState extends State<_NewForumQuestionSheet> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _bodyController = TextEditingController();
  final _domainController = TextEditingController();

  @override
  void dispose() {
    _titleController.dispose();
    _bodyController.dispose();
    _domainController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    Navigator.of(context).pop(
      _ForumDraft(
        title: _titleController.text.trim(),
        body: _bodyController.text.trim(),
        domain: _domainController.text.trim(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return SafeArea(
      top: false,
      child: FractionallySizedBox(
        heightFactor: 0.9,
        child: Material(
          color: const Color(0xFF0D0D0D),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          child: Padding(
            padding: EdgeInsets.fromLTRB(20, 14, 20, 20 + bottomInset),
            child: Form(
              key: _formKey,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 42,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.white24,
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text('Ask a Question', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(labelText: 'Title'),
                      validator: (value) => (value == null || value.trim().isEmpty) ? 'Enter a title' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _bodyController,
                      decoration: const InputDecoration(labelText: 'Body'),
                      maxLines: 5,
                      validator: (value) => (value == null || value.trim().isEmpty) ? 'Enter a body' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _domainController,
                      decoration: const InputDecoration(labelText: 'Domain'),
                      validator: (value) => (value == null || value.trim().isEmpty) ? 'Enter a domain' : null,
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => Navigator.of(context).pop(),
                            child: const Text('Cancel'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _submit,
                            child: const Text('Post'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _OpportunityFilterSheet extends StatefulWidget {
  const _OpportunityFilterSheet({
    required this.title,
    required this.subtitle,
    required this.options,
    required this.selectedValue,
  });

  final String title;
  final String subtitle;
  final List<String> options;
  final String selectedValue;

  @override
  State<_OpportunityFilterSheet> createState() => _OpportunityFilterSheetState();
}

class _OpportunityFilterSheetState extends State<_OpportunityFilterSheet> {
  late String _selectedValue = widget.selectedValue;

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return SafeArea(
      top: false,
      child: FractionallySizedBox(
        heightFactor: 0.9,
        child: Material(
          color: const Color(0xFF0D0D0D),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          child: Padding(
            padding: EdgeInsets.fromLTRB(20, 14, 20, 20 + bottomInset),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 42,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text('${widget.title} Filter', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 6),
                  Text(
                    widget.subtitle,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
                  ),
                  const SizedBox(height: 18),
                  Text(widget.title, style: Theme.of(context).textTheme.labelMedium),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: widget.options
                        .map(
                          (option) => ChoiceChip(
                            label: Text(_prettyFilterLabel(option)),
                            selected: _selectedValue == option,
                            onSelected: (_) => setState(() => _selectedValue = option),
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.of(context).pop('all'),
                          child: const Text('Reset'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => Navigator.of(context).pop(_selectedValue),
                          child: const Text('Apply'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ForumFilterSelection {
  const _ForumFilterSelection({required this.status, required this.domain});

  final String status;
  final String domain;
}

String _prettyFilterLabel(String value) {
  if (value == 'all') return 'All';
  return value
      .split(RegExp(r'[\s_-]+'))
      .where((part) => part.isNotEmpty)
      .map((part) => part[0].toUpperCase() + part.substring(1))
      .join(' ');
}

String _initialOf(String value) {
  final trimmed = value.trim();
  if (trimmed.isEmpty) return 'U';
  return trimmed[0].toUpperCase();
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 4),
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 1.8,
                  color: Colors.white54,
                ),
          ),
        ],
      ),
    );
  }
}

class _FilterPill extends StatelessWidget {
  const _FilterPill({
    required this.label,
    required this.onTap,
  });

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          color: Colors.white.withAlpha(10),
          border: Border.all(color: Colors.white.withAlpha(20)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Expanded(
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.labelMedium,
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.tune, size: 18, color: Colors.white70),
          ],
        ),
      ),
    );
  }
}

class _ForumCard extends StatefulWidget {
  const _ForumCard({
    required this.doubt,
    required this.currentUserId,
    required this.isAdmin,
    required this.onToggleUpvote,
    required this.onToggleResolve,
    required this.onDeleteQuestion,
    required this.onReply,
    required this.onDeleteReply,
  });

  final DoubtItem doubt;
  final String? currentUserId;
  final bool isAdmin;
  final Future<void> Function() onToggleUpvote;
  final Future<void> Function() onToggleResolve;
  final Future<void> Function() onDeleteQuestion;
  final Future<void> Function(String body) onReply;
  final Future<void> Function(String replyId) onDeleteReply;

  @override
  State<_ForumCard> createState() => _ForumCardState();
}

class _ForumCardState extends State<_ForumCard> {
  final _replyController = TextEditingController();
  bool _isSubmittingReply = false;
  bool _isBusy = false;

  @override
  void dispose() {
    _replyController.dispose();
    super.dispose();
  }

  bool get _canManageQuestion {
    final authorId = widget.doubt.authorId;
    return widget.isAdmin || (authorId != null && authorId == widget.currentUserId);
  }

  bool _canDeleteReply(DoubtReplyItem reply) {
    final authorId = reply.authorId;
    return widget.isAdmin || (authorId != null && authorId == widget.currentUserId);
  }

  Future<void> _runAction(Future<void> Function() action) async {
    if (_isBusy) return;
    setState(() => _isBusy = true);
    try {
      await action();
    } finally {
      if (mounted) setState(() => _isBusy = false);
    }
  }

  Future<void> _submitReply() async {
    final body = _replyController.text.trim();
    if (body.isEmpty || _isSubmittingReply) return;

    setState(() => _isSubmittingReply = true);
    try {
      await widget.onReply(body);
      _replyController.clear();
    } finally {
      if (mounted) setState(() => _isSubmittingReply = false);
    }
  }

  String _nameLabel(String? name) {
    final value = name?.trim();
    return value == null || value.isEmpty ? 'User' : value;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authorName = _nameLabel(widget.doubt.authorName);
    final authorRole = widget.doubt.authorRole?.trim();
    final created = widget.doubt.createdAt?.toLocal();
    final createdText = created == null
        ? ''
        : '${created.month.toString().padLeft(2, '0')}/${created.day.toString().padLeft(2, '0')}/${created.year}';

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.black.withAlpha(54),
        border: Border.all(
          color: widget.doubt.resolved ? const Color(0xFF34D399).withAlpha(80) : Colors.white.withAlpha(20),
        ),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              if (widget.doubt.resolved) const _Badge(text: 'RESOLVED', color: Color(0xFF34D399)),
              if (!widget.doubt.resolved) const _Badge(text: 'OPEN', color: Color(0xFFF59E0B)),
              if (widget.doubt.domain != null && widget.doubt.domain!.isNotEmpty)
                _Badge(text: widget.doubt.domain!.toUpperCase(), color: const Color(0xFFF5B14C)),
              if (createdText.isNotEmpty)
                Text(
                  createdText,
                  style: theme.textTheme.bodySmall?.copyWith(color: Colors.white54),
                ),
              const SizedBox(width: 4),
              if (_canManageQuestion)
                IconButton(
                  visualDensity: VisualDensity.compact,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints.tightFor(width: 32, height: 32),
                  onPressed: _isBusy ? null : () => _runAction(widget.onDeleteQuestion),
                  icon: const Icon(Icons.delete_outline, size: 18),
                  tooltip: 'Delete question',
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(widget.doubt.title, style: theme.textTheme.titleLarge?.copyWith(height: 1.15)),
          const SizedBox(height: 10),
          Text(
            widget.doubt.body,
            style: theme.textTheme.bodyMedium?.copyWith(height: 1.6, color: Colors.white.withAlpha(220)),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withAlpha(12),
                  border: Border.all(color: Colors.white.withAlpha(18)),
                ),
                child: Center(
                  child: Text(
                    _initialOf(authorName),
                    style: theme.textTheme.labelLarge,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(authorName, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                    if (authorRole != null && authorRole.isNotEmpty)
                      Text(
                        authorRole,
                        style: theme.textTheme.bodySmall?.copyWith(color: Colors.white54),
                      ),
                  ],
                ),
              ),
              Text(
                '${widget.doubt.upvotes} upvotes',
                style: theme.textTheme.bodySmall?.copyWith(color: Colors.white70),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              OutlinedButton.icon(
                onPressed: _isBusy ? null : () => _runAction(widget.onToggleUpvote),
                icon: const Icon(Icons.arrow_upward_rounded, size: 18),
                label: Text('Upvote (${widget.doubt.upvotes})'),
              ),
              if (_canManageQuestion)
                OutlinedButton.icon(
                  onPressed: _isBusy ? null : () => _runAction(widget.onToggleResolve),
                  icon: Icon(widget.doubt.resolved ? Icons.radio_button_checked : Icons.radio_button_off, size: 18),
                  label: Text(widget.doubt.resolved ? 'Mark open' : 'Mark resolved'),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Divider(color: Colors.white.withAlpha(20), height: 1),
          const SizedBox(height: 14),
          Text(
            widget.doubt.replies.isEmpty ? 'Replies' : 'Replies (${widget.doubt.replies.length})',
            style: theme.textTheme.titleSmall,
          ),
          const SizedBox(height: 10),
          if (widget.doubt.replies.isEmpty)
            Text(
              'No replies yet. Add the first answer below.',
              style: theme.textTheme.bodySmall?.copyWith(color: Colors.white54, height: 1.5),
            )
          else
            Column(
              children: widget.doubt.replies
                  .map(
                    (reply) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _ReplyTile(
                        reply: reply,
                        currentUserId: widget.currentUserId,
                        isAdmin: widget.isAdmin,
                        onDelete: _canDeleteReply(reply) && !_isBusy ? () => _runAction(() => widget.onDeleteReply(reply.id)) : null,
                      ),
                    ),
                  )
                  .toList(),
            ),
          const SizedBox(height: 6),
          TextField(
            controller: _replyController,
            maxLines: 4,
            minLines: 1,
            textInputAction: TextInputAction.newline,
            decoration: const InputDecoration(
              hintText: 'Write a reply...',
            ),
          ),
          const SizedBox(height: 10),
          Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton.icon(
              onPressed: _isBusy || _isSubmittingReply ? null : _submitReply,
              icon: _isSubmittingReply
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                    )
                  : const Icon(Icons.send_rounded, size: 18),
              label: const Text('Reply'),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReplyTile extends StatelessWidget {
  const _ReplyTile({
    required this.reply,
    required this.currentUserId,
    required this.isAdmin,
    required this.onDelete,
  });

  final DoubtReplyItem reply;
  final String? currentUserId;
  final bool isAdmin;
  final VoidCallback? onDelete;

  bool get _canDelete {
    final authorId = reply.authorId;
    return isAdmin || (authorId != null && authorId == currentUserId);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final author = (reply.authorName?.trim().isNotEmpty ?? false) ? reply.authorName!.trim() : 'User';
    final role = reply.authorRole?.trim();
    final created = reply.createdAt?.toLocal();
    final createdText = created == null
        ? ''
        : '${created.month.toString().padLeft(2, '0')}/${created.day.toString().padLeft(2, '0')}/${created.year}';

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        color: Colors.white.withAlpha(6),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withAlpha(12),
                ),
                child: Center(
                  child: Text(
                    _initialOf(author),
                    style: theme.textTheme.labelMedium,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(author, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                    if (role != null && role.isNotEmpty)
                      Text(
                        role,
                        style: theme.textTheme.bodySmall?.copyWith(color: Colors.white54),
                      ),
                  ],
                ),
              ),
              if (createdText.isNotEmpty) ...[
                Text(createdText, style: theme.textTheme.bodySmall?.copyWith(color: Colors.white54)),
                const SizedBox(width: 8),
              ],
              if (_canDelete && onDelete != null)
                IconButton(
                  visualDensity: VisualDensity.compact,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints.tightFor(width: 32, height: 32),
                  onPressed: onDelete,
                  icon: const Icon(Icons.delete_outline, size: 18),
                  tooltip: 'Delete reply',
                ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            reply.body,
            style: theme.textTheme.bodyMedium?.copyWith(height: 1.55),
          ),
          if (reply.upvotes > 0) ...[
            const SizedBox(height: 8),
            Text(
              '${reply.upvotes} upvotes',
              style: theme.textTheme.bodySmall?.copyWith(color: Colors.white54),
            ),
          ],
        ],
      ),
    );
  }
}

class _LeaderboardCard extends StatelessWidget {
  const _LeaderboardCard({
    required this.rank,
    required this.student,
  });

  final int rank;
  final LeaderboardItem student;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: Colors.black.withAlpha(46),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          _RankBadge(rank: rank),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(student.name, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(_leaderboardSubtitle(student), style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          Text('${student.points}', style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }
}

class _ContactCard extends StatelessWidget {
  const _ContactCard({required this.info});

  final ContactInfoItem info;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: Colors.black.withAlpha(46),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (info.email != null) Text(info.email!, style: Theme.of(context).textTheme.bodyMedium),
          if (info.location != null) ...[
            const SizedBox(height: 6),
            Text(info.location!, style: Theme.of(context).textTheme.bodyMedium),
          ],
          if (info.department != null) ...[
            const SizedBox(height: 6),
            Text(info.department!, style: Theme.of(context).textTheme.bodyMedium),
          ],
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (info.github != null) const _MiniChip(text: 'GitHub'),
              if (info.linkedin != null) const _MiniChip(text: 'LinkedIn'),
              if (info.instagram != null) const _MiniChip(text: 'Instagram'),
              if (info.twitter != null) const _MiniChip(text: 'Twitter'),
            ],
          ),
        ],
      ),
    );
  }
}

String _memberSubtitle(UserProfile profile) {
  final parts = <String>[_displayRole(profile.role)];
  if (profile.displayBatch != null) {
    parts.add('Batch ${profile.displayBatch}');
  }
  return parts.join(' • ');
}

String _leaderboardSubtitle(LeaderboardItem student) {
  return student.batch != null ? 'Batch ${student.batch}' : 'Student';
}

String _displayRole(String role) {
  switch (role.toLowerCase()) {
    case 'student':
      return 'Student';
    case 'mentor':
      return 'Mentor';
    case 'alumni':
      return 'Alumni';
    case 'senior':
      return 'Senior';
    case 'admin':
      return 'Admin';
    default:
      return role.isEmpty ? 'Member' : role[0].toUpperCase() + role.substring(1);
  }
}

class _DirectoryCard extends StatelessWidget {
  const _DirectoryCard({
    required this.profile,
    required this.onTap,
  });

  final UserProfile profile;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final domains = profile.domain.take(3).toList();
    final initial = _initialOf(profile.name);

    return InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(22),
          color: Colors.black.withAlpha(46),
          border: Border.all(color: Colors.white.withAlpha(20)),
        ),
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              height: 56,
              width: 56,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                color: const Color(0xFF5CC8FF),
                border: Border.all(color: Colors.white.withAlpha(20)),
              ),
              alignment: Alignment.center,
              child: Text(
                initial,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.black),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(profile.name, style: Theme.of(context).textTheme.titleMedium),
                      ),
                      if (profile.isMentor) const _Badge(text: 'MENTOR', color: Color(0xFF34D399)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _memberSubtitle(profile),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white70),
                  ),
                  if (profile.hasBio) ...[
                    const SizedBox(height: 8),
                    Text(
                      profile.bio!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.45),
                    ),
                  ],
                  if (domains.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: domains.map((domain) => _MiniChip(text: domain)).toList(),
                    ),
                  ],
                  const SizedBox(height: 12),
                  Align(
                    alignment: Alignment.centerRight,
                    child: OutlinedButton(
                      onPressed: onTap,
                      child: const Text('View profile'),
                    ),
                  ),
                ],
              ),
            ),
          ],
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
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      child: Text(text, style: Theme.of(context).textTheme.labelSmall),
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
        color: color.withAlpha(26),
        border: Border.all(color: color.withAlpha(51)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(color: color, letterSpacing: 1),
      ),
    );
  }
}

class _RankBadge extends StatelessWidget {
  const _RankBadge({required this.rank});

  final int rank;

  @override
  Widget build(BuildContext context) {
    final colors = {
      1: const Color(0xFFFACC15),
      2: const Color(0xFFD1D5DB),
      3: const Color(0xFFB45309),
    };
    final color = colors[rank] ?? const Color(0xFF3B4A63);
    return Container(
      height: 36,
      width: 36,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withAlpha(48),
        border: Border.all(color: color.withAlpha(85)),
      ),
      child: Text(
        '$rank',
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class _LoadingBlock extends StatelessWidget {
  const _LoadingBlock();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 160,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
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
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(16),
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
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Unable to load section', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 10),
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
  return 'Something went wrong while loading the section.';
}

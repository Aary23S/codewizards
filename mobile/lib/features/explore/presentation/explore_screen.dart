import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/widgets/safe_network_image.dart';
import '../../home/data/project_item.dart';
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

class GalleryExplorePage extends StatelessWidget {
  const GalleryExplorePage({super.key});

  @override
  Widget build(BuildContext context) {
    return _SectionDataPage<GalleryItem>(
      title: 'Gallery',
      eyebrow: 'Visual archive',
      description: 'Images are loaded from the live gallery endpoint.',
      loader: (repo) => repo.fetchGallery(),
      emptyMessage: 'No gallery items found.',
      itemBuilder: (context, item, index) => _GalleryCard(item: item),
    );
  }
}

class OpportunitiesExplorePage extends StatelessWidget {
  const OpportunitiesExplorePage({super.key});

  @override
  Widget build(BuildContext context) {
    return _SectionDataPage<OpportunityItem>(
      title: 'Opportunities',
      eyebrow: 'Openings and calls',
      description: 'Internships, jobs, and open-source opportunities from the backend.',
      loader: (repo) => repo.fetchOpportunities(),
      emptyMessage: 'No opportunities found.',
      itemBuilder: (context, opportunity, index) => _OpportunityCard(opportunity: opportunity),
    );
  }
}

class LegacyExplorePage extends StatelessWidget {
  const LegacyExplorePage({super.key});

  @override
  Widget build(BuildContext context) {
    return _SectionDataPage<TimelineItem>(
      title: 'Legacy',
      eyebrow: 'Club timeline',
      description: 'Milestones and key turning points as a mobile timeline.',
      loader: (repo) => repo.fetchLegacy(),
      emptyMessage: 'No legacy milestones found.',
      itemBuilder: (context, milestone, index) => _TimelineCard(milestone: milestone),
    );
  }
}

class ForumExplorePage extends StatelessWidget {
  const ForumExplorePage({super.key});

  @override
  Widget build(BuildContext context) {
    return _SectionDataPage<DoubtItem>(
      title: 'Forum',
      eyebrow: 'Questions and replies',
      description: 'Community doubts surfaced directly from the backend.',
      loader: (repo) => repo.fetchForum(),
      emptyMessage: 'No forum posts yet.',
      itemBuilder: (context, doubt, index) => _ForumCard(doubt: doubt),
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
      itemBuilder: (context, student, index) => _LeaderboardCard(rank: index + 1, student: student),
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
        borderRadius: BorderRadius.circular(22),
        color: Colors.black.withAlpha(46),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 16 / 10,
            child: SafeNetworkImage(
              imageUrl: item.imageUrl,
              fit: BoxFit.cover,
              placeholder: Container(color: Colors.white.withAlpha(8)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.title, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(item.category, style: Theme.of(context).textTheme.bodySmall),
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

class _ForumCard extends StatelessWidget {
  const _ForumCard({required this.doubt});

  final DoubtItem doubt;

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
              if (doubt.resolved) const _Badge(text: 'RESOLVED', color: Color(0xFF34D399)),
              if (doubt.domain != null && doubt.domain!.isNotEmpty)
                _Badge(text: doubt.domain!.toUpperCase(), color: const Color(0xFFF5B14C)),
            ],
          ),
          const SizedBox(height: 8),
          Text(doubt.title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 4),
          Text(
            doubt.body,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
          ),
          const SizedBox(height: 8),
          Text('${doubt.upvotes} upvotes · ${doubt.repliesCount} replies', style: Theme.of(context).textTheme.bodySmall),
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
                Text(student.batch != null ? 'Batch ${student.batch}' : 'Student', style: Theme.of(context).textTheme.bodySmall),
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

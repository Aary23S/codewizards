import '../../../core/network/api_client.dart';

class AdminRepository {
  AdminRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<AdminOverview> fetchOverview() async {
    final results = await Future.wait([
      _count('/users'),
      _count('/projects'),
      _count('/events'),
      _count('/announcements'),
      _count('/timeline'),
      _count('/gallery'),
      _count('/doubts'),
      _count('/blogs'),
      _count('/opportunities'),
      _count('/team'),
      _count('/resources'),
    ]);

    return AdminOverview(
      users: results[0],
      projects: results[1],
      events: results[2],
      announcements: results[3],
      timeline: results[4],
      gallery: results[5],
      doubts: results[6],
      blogs: results[7],
      opportunities: results[8],
      team: results[9],
      resources: results[10],
    );
  }

  Future<int> _count(String path) async {
    final data = await _apiClient.getData(path);
    if (data is List) return data.length;
    if (data is Map && data['data'] is List) return (data['data'] as List).length;
    return 0;
  }
}

class AdminOverview {
  const AdminOverview({
    required this.users,
    required this.projects,
    required this.events,
    required this.announcements,
    required this.timeline,
    required this.gallery,
    required this.doubts,
    required this.blogs,
    required this.opportunities,
    required this.team,
    required this.resources,
  });

  final int users;
  final int projects;
  final int events;
  final int announcements;
  final int timeline;
  final int gallery;
  final int doubts;
  final int blogs;
  final int opportunities;
  final int team;
  final int resources;

  List<AdminMetric> get metrics => [
        AdminMetric(label: 'Users', value: users),
        AdminMetric(label: 'Projects', value: projects),
        AdminMetric(label: 'Events', value: events),
        AdminMetric(label: 'Announcements', value: announcements),
        AdminMetric(label: 'Timeline', value: timeline),
        AdminMetric(label: 'Gallery', value: gallery),
        AdminMetric(label: 'Doubts', value: doubts),
        AdminMetric(label: 'Blogs', value: blogs),
        AdminMetric(label: 'Opportunities', value: opportunities),
        AdminMetric(label: 'Team', value: team),
        AdminMetric(label: 'Resources', value: resources),
      ];
}

class AdminMetric {
  const AdminMetric({
    required this.label,
    required this.value,
  });

  final String label;
  final int value;
}

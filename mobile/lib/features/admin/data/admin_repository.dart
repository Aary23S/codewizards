import '../../../core/network/api_client.dart';

class AdminRepository {
  AdminRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<Map<String, dynamic>>> fetchList(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    final data = await _apiClient.getData(path, queryParameters: queryParameters);
    final list = data is List ? data : const [];
    return list
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }

  Future<Map<String, dynamic>> fetchObject(String path) async {
    final data = await _apiClient.getData(path);
    return Map<String, dynamic>.from(data as Map);
  }

  Future<Map<String, dynamic>> updateObject(String path, Map<String, dynamic> payload) async {
    final data = await _apiClient.patchData(path, data: payload);
    return Map<String, dynamic>.from(data as Map);
  }

  Future<Map<String, dynamic>> createObject(String path, Map<String, dynamic> payload) async {
    final data = await _apiClient.postData(path, data: payload);
    return Map<String, dynamic>.from(data as Map);
  }

  Future<void> deleteObject(String path) async {
    await _apiClient.deleteData(path);
  }

  Future<Map<String, dynamic>> fetchContact() async {
    return fetchObject('/contact');
  }

  Future<Map<String, dynamic>> updateContact(Map<String, dynamic> payload) async {
    return updateObject('/contact', payload);
  }

  Future<List<Map<String, dynamic>>> fetchPointRules() async {
    return fetchList('/point-rules');
  }

  Future<Map<String, dynamic>> updatePointRule(String id, Map<String, dynamic> payload) async {
    return updateObject('/point-rules/$id', payload);
  }

  Future<Map<String, dynamic>> createUser(Map<String, dynamic> payload) async {
    return createObject('/users', payload);
  }

  Future<Map<String, dynamic>> updateUser(String id, Map<String, dynamic> payload) async {
    return updateObject('/users/$id', payload);
  }

  Future<void> deleteUser(String id) async {
    await deleteObject('/users/$id');
  }

  Future<Map<String, dynamic>> suspendUser(String id, {required bool isSuspended, String? suspendedReason}) async {
    final payload = <String, dynamic>{
      'isSuspended': isSuspended,
      if (suspendedReason != null && suspendedReason.trim().isNotEmpty) 'suspendedReason': suspendedReason.trim(),
    };
    final data = await _apiClient.patchData('/users/$id/suspend', data: payload);
    return Map<String, dynamic>.from(data as Map);
  }

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

import '../../../core/network/api_client.dart';
import 'announcement_item.dart';
import 'event_item.dart';
import 'project_item.dart';

class HomeRepository {
  HomeRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<AnnouncementItem>> fetchAnnouncements() async {
    final data = await _apiClient.getData('/announcements');
    return _mapList(data, AnnouncementItem.fromJson);
  }

  Future<List<ProjectItem>> fetchFeaturedProjects() async {
    final data = await _apiClient.getData('/projects', queryParameters: {'featured': true});
    return _mapList(data, ProjectItem.fromJson);
  }

  Future<List<EventItem>> fetchEvents() async {
    final data = await _apiClient.getData('/events');
    final events = _mapList(data, EventItem.fromJson);
    events.sort((a, b) => (a.date ?? DateTime(1900)).compareTo(b.date ?? DateTime(1900)));
    return events;
  }

  List<T> _mapList<T>(dynamic data, T Function(Map<String, dynamic>) builder) {
    final list = (data as List? ?? const []);
    return list
        .whereType<Map>()
        .map((item) => builder(Map<String, dynamic>.from(item)))
        .toList();
  }
}

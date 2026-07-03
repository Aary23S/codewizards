import '../../../core/network/api_client.dart';
import '../../home/data/event_item.dart';

class EventRepository {
  EventRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<EventItem>> fetchEvents({String? status}) async {
    final data = await _apiClient.getData(
      '/events',
      queryParameters: status == null ? null : {'status': status},
    );
    final events = _mapList(data, EventItem.fromJson);
    events.sort((a, b) => (b.date ?? DateTime(1900)).compareTo(a.date ?? DateTime(1900)));
    return events;
  }

  Future<Set<String>> fetchMyRegistrations() async {
    final data = await _apiClient.getData('/events/my-registrations');
    final list = data as List? ?? const [];
    return list.map((item) => item.toString()).toSet();
  }

  Future<void> register(String eventId) async {
    await _apiClient.postData('/events/$eventId/register');
  }

  List<T> _mapList<T>(dynamic data, T Function(Map<String, dynamic>) builder) {
    final list = (data as List? ?? const []);
    return list
        .whereType<Map>()
        .map((item) => builder(Map<String, dynamic>.from(item)))
        .toList();
  }
}

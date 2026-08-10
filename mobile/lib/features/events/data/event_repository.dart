import '../../../core/network/api_client.dart';
import '../../home/data/event_item.dart';

class EventRepository {
  EventRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<EventItem>> fetchEvents({String? status, String? studentId}) async {
    final params = <String, dynamic>{};
    if (status != null) params['status'] = status;
    if (studentId != null) params['studentId'] = studentId;

    final data = await _apiClient.getData(
      '/events',
      queryParameters: params.isEmpty ? null : params,
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

  Future<void> cancelRegistration(String eventId) async {
    await _apiClient.deleteData('/events/$eventId/register');
  }

  Future<Map<String, dynamic>> verifyOtp(String eventId, String code) async {
    final res = await _apiClient.postData('/events/$eventId/verify', data: {'code': code});
    return Map<String, dynamic>.from(res as Map);
  }

  Future<Map<String, dynamic>> generateOtp(String eventId) async {
    final res = await _apiClient.postData('/events/$eventId/otp');
    return Map<String, dynamic>.from(res as Map);
  }

  List<T> _mapList<T>(dynamic data, T Function(Map<String, dynamic>) builder) {
    final list = (data as List? ?? const []);
    return list
        .whereType<Map>()
        .map((item) => builder(Map<String, dynamic>.from(item)))
        .toList();
  }
}

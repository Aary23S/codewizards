import '../../../core/network/api_client.dart';
import '../../auth/data/user_profile.dart';
import 'mentorship_request_item.dart';

class ProfileRepository {
  ProfileRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<UserProfile> fetchProfile(String id) async {
    final data = await _apiClient.getData('/users/$id');
    return UserProfile.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<UserProfile> updateProfile(String id, Map<String, dynamic> updates) async {
    final data = await _apiClient.patchData(
      '/users/$id',
      data: updates,
    );
    return UserProfile.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<List<MentorshipRequestItem>> fetchMyRequests() async {
    final data = await _apiClient.getData('/mentorship/my-requests');
    final list = data is List ? data : const [];
    return list
        .whereType<Map>()
        .map((item) => MentorshipRequestItem.fromJson(Map<String, dynamic>.from(item)))
        .toList();
  }
}

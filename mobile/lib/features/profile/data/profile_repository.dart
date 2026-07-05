import '../../../core/network/api_client.dart';
import '../../auth/data/user_profile.dart';
import 'coding_profile_item.dart';
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

  Future<CodingProfileItem> connectCodingProfile(Map<String, dynamic> data) async {
    final response = await _apiClient.postData(
      '/coding/connect',
      data: data,
    );
    return CodingProfileItem.fromJson(Map<String, dynamic>.from(response as Map));
  }

  Future<CodingProfileItem?> fetchMyCodingProfile() async {
    final data = await _apiClient.getData('/coding/profile/me');
    if (data == null) return null;
    return CodingProfileItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<CodingProfileItem> syncCodingProfile() async {
    final data = await _apiClient.postData('/coding/sync');
    return CodingProfileItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<CodingProfileItem?> fetchCodingProfilePublic(String id) async {
    final data = await _apiClient.getData('/coding/public/$id');
    if (data == null) return null;
    return CodingProfileItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<List<UserProfile>> fetchUsers({
    String? role,
    String? domain,
    bool? isMentor,
  }) async {
    final queryParameters = <String, dynamic>{};
    if (role != null && role.isNotEmpty && role != 'all') {
      queryParameters['role'] = role;
    }
    if (domain != null && domain.isNotEmpty && domain != 'all') {
      queryParameters['domain'] = domain;
    }
    if (isMentor != null) {
      queryParameters['isMentor'] = isMentor.toString();
    }

    final data = await _apiClient.getData('/users', queryParameters: queryParameters.isEmpty ? null : queryParameters);
    final list = data is List ? data : const [];
    return list
        .whereType<Map>()
        .map((item) => UserProfile.fromJson(Map<String, dynamic>.from(item)))
        .toList();
  }

  Future<MentorshipRequestItem> createMentorshipRequest({
    required String mentorId,
    required String message,
  }) async {
    final data = await _apiClient.postData(
      '/mentorship/request',
      data: {
        'mentorId': mentorId,
        'message': message,
      },
    );
    return MentorshipRequestItem.fromJson(Map<String, dynamic>.from(data as Map));
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

import '../../../core/network/api_client.dart';
import '../../home/data/project_item.dart';
import 'blog_item.dart';
import 'contact_info_item.dart';
import 'doubt_item.dart';
import 'gallery_item.dart';
import 'leaderboard_item.dart';
import 'opportunity_item.dart';
import 'timeline_item.dart';

class ExploreRepository {
  ExploreRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<ProjectItem>> fetchProjects() async {
    final data = await _apiClient.getData('/projects', queryParameters: {'featured': true});
    return _mapList(data, ProjectItem.fromJson);
  }

  Future<List<GalleryItem>> fetchGallery() async {
    final data = await _apiClient.getData('/gallery');
    return _mapList(data, GalleryItem.fromJson);
  }

  Future<List<OpportunityItem>> fetchOpportunities() async {
    final data = await _apiClient.getData('/opportunities');
    return _mapList(data, OpportunityItem.fromJson);
  }

  Future<List<TimelineItem>> fetchLegacy() async {
    final data = await _apiClient.getData('/timeline');
    return _mapList(data, TimelineItem.fromJson);
  }

  Future<List<DoubtItem>> fetchForum({String? domain, bool? resolved}) async {
    final queryParameters = <String, dynamic>{};
    if (domain != null && domain.isNotEmpty && domain != 'all') {
      queryParameters['domain'] = domain;
    }
    if (resolved != null) {
      queryParameters['resolved'] = resolved;
    }

    final data = await _apiClient.getData('/doubts', queryParameters: queryParameters.isEmpty ? null : queryParameters);
    return _mapList(data, DoubtItem.fromJson);
  }

  Future<DoubtItem> fetchForumThread(String id) async {
    final data = await _apiClient.getData('/doubts/$id');
    return DoubtItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<DoubtItem> createForumQuestion({
    required String title,
    required String body,
    String? domain,
  }) async {
    final payload = <String, dynamic>{
      'title': title,
      'body': body,
      if (domain != null && domain.isNotEmpty) 'domain': domain,
    };
    final data = await _apiClient.postData('/doubts', data: payload);
    return DoubtItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<DoubtItem> addForumReply({
    required String doubtId,
    required String body,
  }) async {
    final data = await _apiClient.postData('/doubts/$doubtId/reply', data: {'body': body});
    return DoubtItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<DoubtItem> toggleForumResolve(String doubtId) async {
    final data = await _apiClient.patchData('/doubts/$doubtId/resolve');
    return DoubtItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<int> toggleForumUpvote(String doubtId) async {
    final data = await _apiClient.patchData('/doubts/$doubtId/upvote');
    final map = Map<String, dynamic>.from(data as Map);
    return (map['upvotes'] is List) ? (map['upvotes'] as List).length : (map['upvotes'] as int? ?? 0);
  }

  Future<void> deleteForumQuestion(String doubtId) async {
    await _apiClient.deleteData('/doubts/$doubtId');
  }

  Future<void> deleteForumReply({
    required String doubtId,
    required String replyId,
  }) async {
    await _apiClient.deleteData('/doubts/$doubtId/replies/$replyId');
  }

  Future<List<LeaderboardItem>> fetchLeaderboard() async {
    final data = await _apiClient.getData('/leaderboard');
    return _mapList(data, LeaderboardItem.fromJson);
  }

  Future<List<BlogItem>> fetchBlogs() async {
    final data = await _apiClient.getData('/blogs');
    return _mapList(data, BlogItem.fromJson);
  }

  Future<BlogItem> fetchBlog(String id) async {
    final data = await _apiClient.getData('/blogs/$id');
    return BlogItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<BlogItem> createBlog({
    required String title,
    required String content,
    String? coverImage,
    List<String>? tags,
  }) async {
    final payload = <String, dynamic>{
      'title': title,
      'content': content,
      if (coverImage != null && coverImage.isNotEmpty) 'coverImage': coverImage,
      if (tags != null && tags.isNotEmpty) 'tags': tags,
    };
    final data = await _apiClient.postData('/blogs', data: payload);
    return BlogItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<void> deleteBlog(String id) async {
    await _apiClient.deleteData('/blogs/$id');
  }

  Future<ContactInfoItem> fetchContact() async {
    final data = await _apiClient.getData('/contact');
    return ContactInfoItem.fromJson(Map<String, dynamic>.from(data as Map));
  }

  List<T> _mapList<T>(dynamic data, T Function(Map<String, dynamic>) builder) {
    final list = (data as List? ?? const []);
    return list
        .whereType<Map>()
        .map((item) => builder(Map<String, dynamic>.from(item)))
        .toList();
  }
}

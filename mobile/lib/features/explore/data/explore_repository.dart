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

  Future<List<DoubtItem>> fetchForum() async {
    final data = await _apiClient.getData('/doubts');
    return _mapList(data, DoubtItem.fromJson);
  }

  Future<List<LeaderboardItem>> fetchLeaderboard() async {
    final data = await _apiClient.getData('/leaderboard');
    return _mapList(data, LeaderboardItem.fromJson);
  }

  Future<List<BlogItem>> fetchBlogs() async {
    final data = await _apiClient.getData('/blogs');
    return _mapList(data, BlogItem.fromJson);
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

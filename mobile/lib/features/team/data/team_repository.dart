import '../../../core/network/api_client.dart';
import 'team_member_item.dart';

class TeamRepository {
  TeamRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<TeamMemberItem>> fetchTeam() async {
    final data = await _apiClient.getData('/team');
    final members = (data as List? ?? const []);
    return members
        .whereType<Map>()
        .map((item) => TeamMemberItem.fromJson(Map<String, dynamic>.from(item)))
        .toList()
      ..sort((a, b) {
        final yearCompare = b.teamYear.compareTo(a.teamYear);
        if (yearCompare != 0) return yearCompare;
        final orderCompare = a.order.compareTo(b.order);
        if (orderCompare != 0) return orderCompare;
        return a.name.compareTo(b.name);
      });
  }
}

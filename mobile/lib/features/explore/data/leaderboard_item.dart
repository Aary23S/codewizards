import '../../../core/utils/json_helpers.dart';

class LeaderboardItem {
  LeaderboardItem({
    required this.id,
    required this.name,
    required this.points,
    this.batch,
    this.domain = const [],
  });

  final String id;
  final String name;
  final int points;
  final int? batch;
  final List<String> domain;

  factory LeaderboardItem.fromJson(Map<String, dynamic> json) {
    return LeaderboardItem(
      id: readString(json['_id'] ?? json['id']),
      name: readString(json['name']),
      points: readInt(json['points']) ?? 0,
      batch: readInt(json['batch']),
      domain: readStringList(json['domain']),
    );
  }
}

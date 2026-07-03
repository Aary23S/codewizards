import '../../../core/utils/json_helpers.dart';

class DoubtItem {
  DoubtItem({
    required this.id,
    required this.title,
    required this.body,
    required this.resolved,
    required this.upvotes,
    required this.repliesCount,
    this.domain,
    this.createdAt,
    this.authorName,
    this.authorRole,
  });

  final String id;
  final String title;
  final String body;
  final bool resolved;
  final int upvotes;
  final int repliesCount;
  final String? domain;
  final DateTime? createdAt;
  final String? authorName;
  final String? authorRole;

  factory DoubtItem.fromJson(Map<String, dynamic> json) {
    final author = json['author'];
    final authorMap = author is Map ? author : null;
    return DoubtItem(
      id: readString(json['_id'] ?? json['id']),
      title: readString(json['title']),
      body: readString(json['body']),
      resolved: readBool(json['resolved']),
      upvotes: (json['upvotes'] is List) ? (json['upvotes'] as List).length : readInt(json['upvotes']) ?? 0,
      repliesCount: (json['replies'] is List) ? (json['replies'] as List).length : 0,
      domain: json['domain']?.toString(),
      createdAt: readDateTime(json['createdAt']),
      authorName: authorMap?['name']?.toString(),
      authorRole: authorMap?['role']?.toString(),
    );
  }
}

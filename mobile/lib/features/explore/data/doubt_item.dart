import '../../../core/utils/json_helpers.dart';

class DoubtItem {
  DoubtItem({
    required this.id,
    required this.title,
    required this.body,
    required this.resolved,
    required this.upvotes,
    required this.repliesCount,
    required this.replies,
    this.domain,
    this.createdAt,
    this.authorName,
    this.authorRole,
    this.authorId,
  });

  final String id;
  final String title;
  final String body;
  final bool resolved;
  final int upvotes;
  final int repliesCount;
  final List<DoubtReplyItem> replies;
  final String? domain;
  final DateTime? createdAt;
  final String? authorName;
  final String? authorRole;
  final String? authorId;

  factory DoubtItem.fromJson(Map<String, dynamic> json) {
    final author = json['author'];
    final authorMap = author is Map ? author : null;
    final replies = (json['replies'] is List ? json['replies'] as List : const [])
        .whereType<Map>()
        .map((item) => DoubtReplyItem.fromJson(Map<String, dynamic>.from(item)))
        .toList();
    return DoubtItem(
      id: readString(json['_id'] ?? json['id']),
      title: readString(json['title']),
      body: readString(json['body']),
      resolved: readBool(json['resolved']),
      upvotes: (json['upvotes'] is List) ? (json['upvotes'] as List).length : readInt(json['upvotes']) ?? 0,
      repliesCount: replies.length,
      replies: replies,
      domain: json['domain']?.toString(),
      createdAt: readDateTime(json['createdAt']),
      authorName: authorMap?['name']?.toString(),
      authorRole: authorMap?['role']?.toString(),
      authorId: authorMap?['_id']?.toString() ?? authorMap?['id']?.toString(),
    );
  }
}

class DoubtReplyItem {
  DoubtReplyItem({
    required this.id,
    required this.body,
    required this.createdAt,
    required this.upvotes,
    this.authorId,
    this.authorName,
    this.authorRole,
  });

  final String id;
  final String body;
  final DateTime? createdAt;
  final int upvotes;
  final String? authorId;
  final String? authorName;
  final String? authorRole;

  factory DoubtReplyItem.fromJson(Map<String, dynamic> json) {
    final author = json['author'];
    final authorMap = author is Map ? author : null;
    return DoubtReplyItem(
      id: readString(json['_id'] ?? json['id']),
      body: readString(json['body']),
      createdAt: readDateTime(json['createdAt']),
      upvotes: (json['upvotes'] is List) ? (json['upvotes'] as List).length : readInt(json['upvotes']) ?? 0,
      authorId: authorMap?['_id']?.toString() ?? authorMap?['id']?.toString(),
      authorName: authorMap?['name']?.toString(),
      authorRole: authorMap?['role']?.toString(),
    );
  }
}

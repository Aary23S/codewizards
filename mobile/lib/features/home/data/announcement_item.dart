import '../../../core/utils/json_helpers.dart';

class AnnouncementItem {
  AnnouncementItem({
    required this.id,
    required this.title,
    required this.body,
    required this.important,
    this.createdAt,
  });

  final String id;
  final String title;
  final String body;
  final bool important;
  final DateTime? createdAt;

  factory AnnouncementItem.fromJson(Map<String, dynamic> json) {
    return AnnouncementItem(
      id: readString(json['_id'] ?? json['id']),
      title: readString(json['title']),
      body: readString(json['body']),
      important: readBool(json['important']),
      createdAt: readDateTime(json['createdAt']),
    );
  }
}

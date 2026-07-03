import '../../../core/utils/json_helpers.dart';

class BlogItem {
  BlogItem({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    this.coverImage,
    this.tags = const [],
    this.authorName,
  });

  final String id;
  final String title;
  final String content;
  final DateTime? createdAt;
  final String? coverImage;
  final List<String> tags;
  final String? authorName;

  factory BlogItem.fromJson(Map<String, dynamic> json) {
    final author = json['author'];
    final authorName = author is Map ? author['name']?.toString() : null;
    return BlogItem(
      id: readString(json['_id'] ?? json['id']),
      title: readString(json['title']),
      content: readString(json['content']),
      createdAt: readDateTime(json['createdAt']),
      coverImage: readHttpUrl(json['coverImage']),
      tags: readStringList(json['tags']),
      authorName: authorName,
    );
  }
}

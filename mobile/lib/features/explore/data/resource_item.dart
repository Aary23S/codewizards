import '../../../core/utils/json_helpers.dart';

class ResourceItem {
  ResourceItem({
    required this.id,
    required this.title,
    required this.url,
    required this.category,
    this.domain,
    this.description,
  });

  final String id;
  final String title;
  final String url;
  final String category;
  final String? domain;
  final String? description;

  factory ResourceItem.fromJson(Map<String, dynamic> json) {
    return ResourceItem(
      id: readString(json['_id'] ?? json['id']),
      title: readString(json['title']),
      url: readHttpUrl(json['url']) ?? '',
      category: readString(json['category']),
      domain: json['domain']?.toString(),
      description: json['description']?.toString(),
    );
  }
}

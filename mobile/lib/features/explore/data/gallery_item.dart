import '../../../core/utils/json_helpers.dart';

class GalleryItem {
  GalleryItem({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.category,
    this.eventRef,
  });

  final String id;
  final String title;
  final String imageUrl;
  final String category;
  final String? eventRef;

  factory GalleryItem.fromJson(Map<String, dynamic> json) {
    return GalleryItem(
      id: readString(json['_id'] ?? json['id']),
      title: readString(json['title']),
      imageUrl: readHttpUrl(json['imageUrl']) ?? '',
      category: readString(json['category'], fallback: 'event'),
      eventRef: json['eventRef']?.toString(),
    );
  }
}

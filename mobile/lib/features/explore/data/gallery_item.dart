import '../../../core/utils/json_helpers.dart';

class GalleryItem {
  GalleryItem({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.category,
    this.eventRef,
    this.imageUrls = const [],
  });

  final String id;
  final String title;
  final String imageUrl;
  final String category;
  final String? eventRef;
  final List<String> imageUrls;

  factory GalleryItem.fromJson(Map<String, dynamic> json) {
    final list = json['imageUrls'] as List?;
    final parsedUrls = list != null
        ? list.map((e) => readHttpUrl(e)).whereType<String>().toList()
        : <String>[];
    return GalleryItem(
      id: readString(json['_id'] ?? json['id']),
      title: readString(json['title']),
      imageUrl: readHttpUrl(json['imageUrl']) ?? '',
      category: readString(json['category'], fallback: 'event'),
      eventRef: json['eventRef']?.toString(),
      imageUrls: parsedUrls,
    );
  }
}

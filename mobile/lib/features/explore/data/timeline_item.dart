import '../../../core/utils/json_helpers.dart';

class TimelineItem {
  TimelineItem({
    required this.id,
    required this.year,
    required this.title,
    required this.description,
    this.month,
  });

  final String id;
  final int year;
  final String? month;
  final String title;
  final String description;

  factory TimelineItem.fromJson(Map<String, dynamic> json) {
    return TimelineItem(
      id: readString(json['_id'] ?? json['id']),
      year: readInt(json['year']) ?? 0,
      month: json['month']?.toString(),
      title: readString(json['title']),
      description: readString(json['description']),
    );
  }
}

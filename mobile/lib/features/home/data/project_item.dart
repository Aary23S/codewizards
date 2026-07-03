import '../../../core/utils/json_helpers.dart';

class ProjectItem {
  ProjectItem({
    required this.id,
    required this.title,
    required this.description,
    required this.featured,
    this.techStack = const [],
  });

  final String id;
  final String title;
  final String description;
  final bool featured;
  final List<String> techStack;

  factory ProjectItem.fromJson(Map<String, dynamic> json) {
    return ProjectItem(
      id: readString(json['_id'] ?? json['id']),
      title: readString(json['title']),
      description: readString(json['description']),
      featured: readBool(json['featured']),
      techStack: readStringList(json['techStack']),
    );
  }
}

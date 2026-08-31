import '../../../core/utils/json_helpers.dart';

class ProjectItem {
  ProjectItem({
    required this.id,
    required this.title,
    required this.description,
    required this.featured,
    this.techStack = const [],
    this.contributors = const [],
    this.createdAt,
    this.githubUrl,
    this.demoUrl,
    this.imageUrl,
  });

  final String id;
  final String title;
  final String description;
  final bool featured;
  final List<String> techStack;
  final List<String> contributors;
  final DateTime? createdAt;
  final String? githubUrl;
  final String? demoUrl;
  final String? imageUrl;

  factory ProjectItem.fromJson(Map<String, dynamic> json) {
    return ProjectItem(
      id: readString(json['_id'] ?? json['id']),
      title: readString(json['title']),
      description: readString(json['description']),
      featured: readBool(json['featured']),
      techStack: readStringList(json['techStack']),
      contributors: readStringList(json['contributors']),
      createdAt: readDateTime(json['createdAt']),
      githubUrl: readHttpUrl(json['githubUrl']),
      demoUrl: readHttpUrl(json['demoUrl']),
      imageUrl: readHttpUrl(json['imageUrl']),
    );
  }
}

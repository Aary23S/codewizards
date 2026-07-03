import '../../../core/utils/json_helpers.dart';

class TeamMemberItem {
  TeamMemberItem({
    required this.id,
    required this.name,
    required this.role,
    required this.category,
    required this.teamYear,
    required this.order,
    this.batch,
    this.subtitle,
    this.domain = const [],
    this.imageUrl,
    this.linkedin,
    this.github,
  });

  final String id;
  final String name;
  final String role;
  final String category;
  final int teamYear;
  final int order;
  final int? batch;
  final String? subtitle;
  final List<String> domain;
  final String? imageUrl;
  final String? linkedin;
  final String? github;

  String? get title => subtitle;

  factory TeamMemberItem.fromJson(Map<String, dynamic> json) {
    return TeamMemberItem(
      id: readString(json['_id'] ?? json['id']),
      name: readString(json['name']),
      role: readString(json['role'], fallback: 'member'),
      category: readString(json['category'], fallback: 'core'),
      teamYear: readInt(json['teamYear']) ?? readInt(json['batch']) ?? 0,
      order: readInt(json['order']) ?? 0,
      batch: readInt(json['batch']),
      subtitle: _readNullableText(json['subtitle']),
      domain: readStringList(json['domain']),
      imageUrl: readHttpUrl(json['imageUrl']),
      linkedin: readHttpUrl(json['linkedin']),
      github: readHttpUrl(json['github']),
    );
  }
}

String? _readNullableText(dynamic value) {
  final text = value?.toString().trim();
  if (text == null || text.isEmpty) return null;
  return text;
}

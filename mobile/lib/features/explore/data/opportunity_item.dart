import '../../../core/utils/json_helpers.dart';

class OpportunityItem {
  OpportunityItem({
    required this.id,
    required this.title,
    required this.company,
    required this.type,
    required this.applyLink,
    required this.isActive,
    this.domain,
    this.description,
    this.deadline,
  });

  final String id;
  final String title;
  final String company;
  final String type;
  final String applyLink;
  final bool isActive;
  final String? domain;
  final String? description;
  final DateTime? deadline;

  factory OpportunityItem.fromJson(Map<String, dynamic> json) {
    return OpportunityItem(
      id: readString(json['_id'] ?? json['id']),
      title: readString(json['title']),
      company: readString(json['company']),
      type: readString(json['type']),
      applyLink: readHttpUrl(json['applyLink']) ?? '',
      isActive: readBool(json['isActive']),
      domain: json['domain']?.toString(),
      description: json['description']?.toString(),
      deadline: readDateTime(json['deadline']),
    );
  }
}

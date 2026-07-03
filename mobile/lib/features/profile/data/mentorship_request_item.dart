import '../../../core/utils/json_helpers.dart';

class MentorshipRequestItem {
  MentorshipRequestItem({
    required this.id,
    required this.message,
    required this.status,
    this.createdAt,
    this.student,
    this.mentor,
  });

  final String id;
  final String message;
  final String status;
  final DateTime? createdAt;
  final ProfileSummary? student;
  final ProfileSummary? mentor;

  factory MentorshipRequestItem.fromJson(Map<String, dynamic> json) {
    return MentorshipRequestItem(
      id: readString(json['_id'] ?? json['id']),
      message: readString(json['message']),
      status: readString(json['status']),
      createdAt: readDateTime(json['createdAt']),
      student: _readSummary(json['studentId']),
      mentor: _readSummary(json['mentorId']),
    );
  }

  ProfileSummary? counterpartFor(String role) {
    return role == 'student' ? mentor : student;
  }
}

class ProfileSummary {
  ProfileSummary({
    required this.id,
    required this.name,
    required this.email,
    this.batch,
    this.domain = const [],
  });

  final String id;
  final String name;
  final String email;
  final int? batch;
  final List<String> domain;

  factory ProfileSummary.fromJson(Map<String, dynamic> json) {
    return ProfileSummary(
      id: readString(json['_id'] ?? json['id']),
      name: readString(json['name']),
      email: readString(json['email']),
      batch: readInt(json['batch']),
      domain: readStringList(json['domain']),
    );
  }
}

ProfileSummary? _readSummary(dynamic value) {
  if (value is Map<String, dynamic>) {
    return ProfileSummary.fromJson(value);
  }
  if (value is Map) {
    return ProfileSummary.fromJson(Map<String, dynamic>.from(value));
  }
  return null;
}

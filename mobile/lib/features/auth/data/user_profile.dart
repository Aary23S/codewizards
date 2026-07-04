import '../../../core/utils/json_helpers.dart';

class UserProfile {
  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.batch,
    this.programName,
    this.programDurationYears,
    this.domain = const [],
    this.bio,
    this.imageUrl,
    this.isMentor = false,
    this.socialLinks = const ProfileSocialLinks(),
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final int? batch;
  final String? programName;
  final int? programDurationYears;
  final List<String> domain;
  final String? bio;
  final String? imageUrl;
  final bool isMentor;
  final ProfileSocialLinks socialLinks;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: readString(json['_id'] ?? json['id']),
      name: readString(json['name']),
      email: readString(json['email']),
      role: readString(json['role']),
      batch: readInt(json['batch']),
      programName: _readNullableText(json['programName']),
      programDurationYears: readInt(json['programDurationYears']),
      domain: readStringList(json['domain']),
      bio: _readNullableText(json['bio']),
      imageUrl: readHttpUrl(json['imageUrl']),
      isMentor: readBool(json['isMentor']),
      socialLinks: ProfileSocialLinks.fromJson(json),
    );
  }

  String? get displayBatch => batch?.toString();
  bool get hasBio => bio != null && bio!.trim().isNotEmpty;
  bool get hasDomains => domain.isNotEmpty;
}

class ProfileSocialLinks {
  const ProfileSocialLinks({
    this.github,
    this.linkedin,
    this.leetcode,
    this.codeforces,
    this.portfolio,
  });

  final String? github;
  final String? linkedin;
  final String? leetcode;
  final String? codeforces;
  final String? portfolio;

  factory ProfileSocialLinks.fromJson(Map<String, dynamic> json) {
    return ProfileSocialLinks(
      github: readHttpUrl(json['github']),
      linkedin: readHttpUrl(json['linkedin']),
      leetcode: readHttpUrl(json['leetcode']),
      codeforces: readHttpUrl(json['codeforces']),
      portfolio: readHttpUrl(json['portfolio']),
    );
  }

  List<ProfileLink> get links => [
        if (github != null) const ProfileLink(label: 'GitHub'),
        if (linkedin != null) const ProfileLink(label: 'LinkedIn'),
        if (leetcode != null) const ProfileLink(label: 'LeetCode'),
        if (codeforces != null) const ProfileLink(label: 'Codeforces'),
        if (portfolio != null) const ProfileLink(label: 'Portfolio'),
      ];

  String? urlFor(String label) {
    switch (label) {
      case 'GitHub':
        return github;
      case 'LinkedIn':
        return linkedin;
      case 'LeetCode':
        return leetcode;
      case 'Codeforces':
        return codeforces;
      case 'Portfolio':
        return portfolio;
    }
    return null;
  }
}

class ProfileLink {
  const ProfileLink({required this.label});

  final String label;
}

String? _readNullableText(dynamic value) {
  final text = value?.toString().trim();
  if (text == null || text.isEmpty) return null;
  return text;
}

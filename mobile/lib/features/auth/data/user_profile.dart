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
    this.leetcodeUsername,
    this.codeforcesHandle,
    this.githubUsername,
    this.socialLinks = const ProfileSocialLinks(),
    this.currentCompany,
    this.designation,
    this.professionalExperience,
    this.location,
    this.headline,
    this.isVerified = false,
    this.employmentType,
    this.workMode,
    this.startDateText,
    this.canHelpWith = const [],
    this.mentorshipAvailability = "open",
    this.maxActiveStudents = 3,
    this.typicalResponseTime = "1-3 days",
    this.preferredContactMethod = "linkedin",
    this.experiences = const [],
    this.education = const [],
    this.certifications = const [],
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
  final String? leetcodeUsername;
  final String? codeforcesHandle;
  final String? githubUsername;
  final ProfileSocialLinks socialLinks;
  final String? currentCompany;
  final String? designation;
  final String? professionalExperience;
  final String? location;
  final String? headline;
  final bool? isVerified;
  final String? employmentType;
  final String? workMode;
  final String? startDateText;
  final List<String>? canHelpWith;
  final String mentorshipAvailability;
  final int maxActiveStudents;
  final String typicalResponseTime;
  final String preferredContactMethod;
  final List<WorkExperience> experiences;
  final List<EducationItem> education;
  final List<CertificationItem> certifications;

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
      leetcodeUsername: _readNullableText(json['leetcodeUsername']),
      codeforcesHandle: _readNullableText(json['codeforcesHandle']),
      githubUsername: _readNullableText(json['githubUsername']),
      socialLinks: ProfileSocialLinks.fromJson(json),
      currentCompany: _readNullableText(json['currentCompany']),
      designation: _readNullableText(json['designation']),
      professionalExperience: _readNullableText(json['professionalExperience']),
      location: _readNullableText(json['location']),
      headline: _readNullableText(json['headline']),
      isVerified: readBool(json['isVerified']),
      employmentType: _readNullableText(json['employmentType']),
      workMode: _readNullableText(json['workMode']),
      startDateText: _readNullableText(json['startDateText']),
      canHelpWith: readStringList(json['canHelpWith']),
      mentorshipAvailability: readString(json['mentorshipAvailability'] ?? 'open'),
      maxActiveStudents: readInt(json['maxActiveStudents']) ?? 3,
      typicalResponseTime: readString(json['typicalResponseTime'] ?? '1-3 days'),
      preferredContactMethod: readString(json['preferredContactMethod'] ?? 'linkedin'),
      experiences: (json['experiences'] as List?)
              ?.map((e) => WorkExperience.fromJson(Map<String, dynamic>.from(e)))
              .toList() ??
          const [],
      education: (json['education'] as List?)
              ?.map((e) => EducationItem.fromJson(Map<String, dynamic>.from(e)))
              .toList() ??
          const [],
      certifications: (json['certifications'] as List?)
              ?.map((e) => CertificationItem.fromJson(Map<String, dynamic>.from(e)))
              .toList() ??
          const [],
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

class WorkExperience {
  WorkExperience({
    required this.title,
    required this.company,
    required this.location,
    required this.startDate,
    required this.endDate,
    required this.description,
  });

  final String title;
  final String company;
  final String location;
  final String startDate;
  final String endDate;
  final String description;

  factory WorkExperience.fromJson(Map<String, dynamic> json) {
    return WorkExperience(
      title: readString(json['title']),
      company: readString(json['company']),
      location: readString(json['location']),
      startDate: readString(json['startDate']),
      endDate: readString(json['endDate']),
      description: readString(json['description']),
    );
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'company': company,
        'location': location,
        'startDate': startDate,
        'endDate': endDate,
        'description': description,
      };
}

class EducationItem {
  EducationItem({
    required this.school,
    required this.degree,
    required this.fieldOfStudy,
    required this.startDate,
    required this.endDate,
  });

  final String school;
  final String degree;
  final String fieldOfStudy;
  final String startDate;
  final String endDate;

  factory EducationItem.fromJson(Map<String, dynamic> json) {
    return EducationItem(
      school: readString(json['school']),
      degree: readString(json['degree']),
      fieldOfStudy: readString(json['fieldOfStudy']),
      startDate: readString(json['startDate']),
      endDate: readString(json['endDate']),
    );
  }

  Map<String, dynamic> toJson() => {
        'school': school,
        'degree': degree,
        'fieldOfStudy': fieldOfStudy,
        'startDate': startDate,
        'endDate': endDate,
      };
}

class CertificationItem {
  CertificationItem({
    required this.name,
    required this.issuer,
    required this.issueDate,
    required this.credentialUrl,
  });

  final String name;
  final String issuer;
  final String issueDate;
  final String credentialUrl;

  factory CertificationItem.fromJson(Map<String, dynamic> json) {
    return CertificationItem(
      name: readString(json['name']),
      issuer: readString(json['issuer']),
      issueDate: readString(json['issueDate']),
      credentialUrl: readString(json['credentialUrl']),
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'issuer': issuer,
        'issueDate': issueDate,
        'credentialUrl': credentialUrl,
      };
}

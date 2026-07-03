class ContactInfoItem {
  const ContactInfoItem({
    this.email,
    this.location,
    this.department,
    this.github,
    this.linkedin,
    this.instagram,
    this.twitter,
  });

  final String? email;
  final String? location;
  final String? department;
  final String? github;
  final String? linkedin;
  final String? instagram;
  final String? twitter;

  factory ContactInfoItem.fromJson(Map<String, dynamic> json) {
    return ContactInfoItem(
      email: json['email']?.toString(),
      location: json['location']?.toString(),
      department: json['department']?.toString(),
      github: json['github']?.toString(),
      linkedin: json['linkedin']?.toString(),
      instagram: json['instagram']?.toString(),
      twitter: json['twitter']?.toString(),
    );
  }
}

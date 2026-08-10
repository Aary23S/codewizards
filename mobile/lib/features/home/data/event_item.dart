import '../../../core/utils/json_helpers.dart';

class EventItem {
  EventItem({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    this.type,
    this.date,
    this.venue,
    this.featured = false,
    this.registrationLink,
    this.imageUrl,
    this.isRegistered = false,
    this.registeredCount = 0,
    this.registrationStatus,
    this.certificateHash,
    this.otpCode,
  });

  final String id;
  final String title;
  final String description;
  final String status;
  final String? type;
  final DateTime? date;
  final String? venue;
  final bool featured;
  final String? registrationLink;
  final String? imageUrl;
  final bool isRegistered;
  final int registeredCount;
  final String? registrationStatus;
  final String? certificateHash;
  final String? otpCode;

  factory EventItem.fromJson(Map<String, dynamic> json) {
    final reg = json['registration'] as Map?;
    return EventItem(
      id: readString(json['_id'] ?? json['id']),
      title: readString(json['title']),
      description: readString(json['description']),
      status: readString(json['status']),
      type: json['type']?.toString(),
      date: readDateTime(json['date']),
      venue: json['venue']?.toString(),
      featured: readBool(json['featured']),
      registrationLink: readHttpUrl(json['registrationLink']),
      imageUrl: readHttpUrl(json['imageUrl']),
      isRegistered: reg != null ? readBool(reg['isRegistered']) : false,
      registeredCount: reg != null ? (readInt(reg['registeredCount']) ?? 0) : 0,
      registrationStatus: reg != null ? reg['status']?.toString() : null,
      certificateHash: reg != null ? reg['certificateHash']?.toString() : null,
      otpCode: json['otpCode']?.toString(),
    );
  }
}

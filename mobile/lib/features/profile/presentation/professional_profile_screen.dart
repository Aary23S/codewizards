import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../auth/data/user_profile.dart';

class ProfessionalProfileScreen extends StatelessWidget {
  const ProfessionalProfileScreen({super.key, required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text(
          'Professional Dashboard',
          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.black,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Card
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(28),
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E1E1E), Color(0xFF121212)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border.all(color: Colors.white.withAlpha(15)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        profile.role.toUpperCase(),
                        style: TextStyle(
                          color: Colors.white.withAlpha(100),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                        ),
                      ),
                      if (profile.isVerified == true)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF5CC8FF).withAlpha(35),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFF5CC8FF).withAlpha(50)),
                          ),
                          child: const Text(
                            '✓ Verified',
                            style: TextStyle(
                              color: Color(0xFF5CC8FF),
                              fontSize: 8,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    profile.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (profile.headline != null && profile.headline!.trim().isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      profile.headline!,
                      style: const TextStyle(
                        color: Color(0xFF5CC8FF),
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                  if (profile.location != null && profile.location!.trim().isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      '📍 ${profile.location}',
                      style: TextStyle(
                        color: Colors.white.withAlpha(120),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Current Role Card
            if ((profile.designation != null && profile.designation!.trim().isNotEmpty) || 
                (profile.currentCompany != null && profile.currentCompany!.trim().isNotEmpty))
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  color: Colors.white.withAlpha(8),
                  border: Border.all(color: Colors.white.withAlpha(12)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Current Role'.toUpperCase(),
                      style: TextStyle(
                        color: Colors.white.withAlpha(100),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '${profile.designation?.trim().isNotEmpty == true ? profile.designation : 'Professional'}${profile.currentCompany?.trim().isNotEmpty == true ? ' @ ${profile.currentCompany}' : ''}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      [
                        if (profile.employmentType != null && profile.employmentType!.trim().isNotEmpty) profile.employmentType,
                        if (profile.workMode != null && profile.workMode!.trim().isNotEmpty) profile.workMode,
                        if (profile.startDateText != null && profile.startDateText!.trim().isNotEmpty) 'Started ${profile.startDateText}',
                      ].join(' · '),
                      style: TextStyle(
                        color: Colors.white.withAlpha(120),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 20),

            // Experience Card
            if (profile.professionalExperience != null && profile.professionalExperience!.trim().isNotEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  color: Colors.white.withAlpha(8),
                  border: Border.all(color: Colors.white.withAlpha(12)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Work History & Experience'.toUpperCase(),
                      style: TextStyle(
                        color: Colors.white.withAlpha(100),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      profile.professionalExperience!,
                      style: TextStyle(
                        color: Colors.white.withAlpha(180),
                        fontSize: 13,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 20),

            // Experiences timeline list
            if (profile.experiences.isNotEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  color: Colors.white.withAlpha(8),
                  border: Border.all(color: Colors.white.withAlpha(12)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Detailed Experience'.toUpperCase(),
                      style: TextStyle(
                        color: Colors.white.withAlpha(100),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ...profile.experiences.map((exp) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              margin: const EdgeInsets.only(top: 4),
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: Color(0xFF5CC8FF),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    exp.title,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    exp.company,
                                    style: const TextStyle(
                                      color: Color(0xFF5CC8FF),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Text(
                                    '${exp.startDate} – ${exp.endDate.isNotEmpty ? exp.endDate : "Present"}${exp.location.isNotEmpty ? " · ${exp.location}" : ""}',
                                    style: TextStyle(
                                      color: Colors.white.withAlpha(120),
                                      fontSize: 11,
                                    ),
                                  ),
                                  if (exp.description.isNotEmpty) ...[
                                    const SizedBox(height: 6),
                                    Text(
                                      exp.description,
                                      style: TextStyle(
                                        color: Colors.white.withAlpha(180),
                                        fontSize: 12,
                                        height: 1.45,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Education timeline list
            if (profile.education.isNotEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  color: Colors.white.withAlpha(8),
                  border: Border.all(color: Colors.white.withAlpha(12)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Education History'.toUpperCase(),
                      style: TextStyle(
                        color: Colors.white.withAlpha(100),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ...profile.education.map((edu) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 14.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              margin: const EdgeInsets.only(top: 4),
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: Colors.indigoAccent,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    edu.school,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    '${edu.degree}${edu.fieldOfStudy.isNotEmpty ? " in ${edu.fieldOfStudy}" : ""}',
                                    style: TextStyle(
                                      color: Colors.white.withAlpha(180),
                                      fontSize: 12,
                                    ),
                                  ),
                                  Text(
                                    '${edu.startDate} – ${edu.endDate}',
                                    style: TextStyle(
                                      color: Colors.white.withAlpha(120),
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Certifications list
            if (profile.certifications.isNotEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  color: Colors.white.withAlpha(8),
                  border: Border.all(color: Colors.white.withAlpha(12)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Licenses & Certifications'.toUpperCase(),
                      style: TextStyle(
                        color: Colors.white.withAlpha(100),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ...profile.certifications.map((cert) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(4),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withAlpha(8)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    cert.name,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    cert.issuer,
                                    style: TextStyle(
                                      color: Colors.white.withAlpha(180),
                                      fontSize: 12,
                                    ),
                                  ),
                                  Text(
                                    'Issued ${cert.issueDate}',
                                    style: TextStyle(
                                      color: Colors.white.withAlpha(120),
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (cert.credentialUrl.isNotEmpty)
                              IconButton(
                                icon: const Icon(Icons.open_in_new, color: Color(0xFF5CC8FF), size: 18),
                                onPressed: () async {
                                  final uri = Uri.tryParse(cert.credentialUrl);
                                  if (uri != null && await canLaunchUrl(uri)) {
                                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                                  }
                                },
                              ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Help Topics Card
            if (profile.canHelpWith != null && profile.canHelpWith!.isNotEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  color: Colors.white.withAlpha(8),
                  border: Border.all(color: Colors.white.withAlpha(12)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Topics I Can Assist With'.toUpperCase(),
                      style: TextStyle(
                        color: Colors.white.withAlpha(100),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: (profile.canHelpWith ?? const []).map((topic) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF34D399).withAlpha(15),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFF34D399).withAlpha(30)),
                          ),
                          child: Text(
                            topic,
                            style: const TextStyle(
                              color: Color(0xFF34D399),
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 20),

            // Mentorship Preferences Card
            if (profile.isMentor)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  color: Colors.white.withAlpha(8),
                  border: Border.all(color: Colors.white.withAlpha(12)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Mentorship Details'.toUpperCase(),
                      style: TextStyle(
                        color: Colors.white.withAlpha(100),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _buildPrefRow('Availability status', profile.mentorshipAvailability.toUpperCase()),
                    const SizedBox(height: 8),
                    _buildPrefRow('Typical response time', profile.typicalResponseTime),
                    const SizedBox(height: 8),
                    _buildPrefRow('Max student limit', profile.maxActiveStudents.toString()),
                    const SizedBox(height: 8),
                    _buildPrefRow('Preferred contact method', profile.preferredContactMethod.toUpperCase()),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPrefRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white60, fontSize: 12)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

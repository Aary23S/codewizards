import '../../../core/utils/json_helpers.dart';

class CodingProfileItem {
  CodingProfileItem({
    required this.userId,
    this.leetcodeUsername,
    this.codeforcesHandle,
    this.githubUsername,
    this.leetcode = const CodingLeetCodeStats(),
    this.codeforces = const CodingCodeforcesStats(),
    this.github = const CodingGitHubStats(),
  });

  final String userId;
  final String? leetcodeUsername;
  final String? codeforcesHandle;
  final String? githubUsername;
  final CodingLeetCodeStats leetcode;
  final CodingCodeforcesStats codeforces;
  final CodingGitHubStats github;

  factory CodingProfileItem.fromJson(Map<String, dynamic> json) {
    return CodingProfileItem(
      userId: readString(json['userId'] ?? json['_id']),
      leetcodeUsername: _readNullableText(json['leetcodeUsername']),
      codeforcesHandle: _readNullableText(json['codeforcesHandle']),
      githubUsername: _readNullableText(json['githubUsername']),
      leetcode: CodingLeetCodeStats.fromJson(Map<String, dynamic>.from((json['leetcode'] as Map?) ?? {})),
      codeforces: CodingCodeforcesStats.fromJson(Map<String, dynamic>.from((json['codeforces'] as Map?) ?? {})),
      github: CodingGitHubStats.fromJson(Map<String, dynamic>.from((json['github'] as Map?) ?? {})),
    );
  }

  bool get hasAnyData =>
      leetcode.hasAnyData ||
      codeforces.hasAnyData ||
      github.hasAnyData ||
      (leetcodeUsername?.isNotEmpty ?? false) ||
      (codeforcesHandle?.isNotEmpty ?? false) ||
      (githubUsername?.isNotEmpty ?? false);
}

class CodingSubmissionItem {
  CodingSubmissionItem({
    required this.title,
    required this.problem,
    required this.contestName,
    required this.verdict,
    required this.language,
    required this.url,
    this.solvedAt,
  });

  final String title;
  final String problem;
  final String contestName;
  final String verdict;
  final String language;
  final String url;
  final DateTime? solvedAt;

  factory CodingSubmissionItem.fromJson(Map<String, dynamic> json) {
    return CodingSubmissionItem(
      title: readString(json['title']),
      problem: readString(json['problem']),
      contestName: readString(json['contestName']),
      verdict: readString(json['verdict']),
      language: readString(json['language']),
      url: readString(json['url']),
      solvedAt: readDateTime(json['solvedAt']),
    );
  }
}

class CodingContestItem {
  CodingContestItem({
    required this.contestName,
    this.contestId,
    this.oldRating,
    this.newRating,
    this.rank,
    this.ratingUpdateTimeSeconds,
  });

  final int? contestId;
  final String contestName;
  final int? oldRating;
  final int? newRating;
  final int? rank;
  final int? ratingUpdateTimeSeconds;

  factory CodingContestItem.fromJson(Map<String, dynamic> json) {
    return CodingContestItem(
      contestId: readInt(json['contestId']),
      contestName: readString(json['contestName']),
      oldRating: readInt(json['oldRating']),
      newRating: readInt(json['newRating']),
      rank: readInt(json['rank']),
      ratingUpdateTimeSeconds: readInt(json['ratingUpdateTimeSeconds']),
    );
  }
}

class CodingLeetCodeStats {
  const CodingLeetCodeStats({
    this.totalSolved,
    this.easySolved,
    this.mediumSolved,
    this.hardSolved,
    this.ranking,
    this.recentSubmissions = const [],
    this.lastSyncedAt,
    this.verified = false,
  });

  final int? totalSolved;
  final int? easySolved;
  final int? mediumSolved;
  final int? hardSolved;
  final int? ranking;
  final List<CodingSubmissionItem> recentSubmissions;
  final DateTime? lastSyncedAt;
  final bool verified;

  factory CodingLeetCodeStats.fromJson(Map<String, dynamic> json) {
    return CodingLeetCodeStats(
      totalSolved: readInt(json['totalSolved']),
      easySolved: readInt(json['easySolved']),
      mediumSolved: readInt(json['mediumSolved']),
      hardSolved: readInt(json['hardSolved']),
      ranking: readInt(json['ranking']),
      recentSubmissions: _readSubmissions(json['recentSubmissions']),
      lastSyncedAt: readDateTime(json['lastSyncedAt']),
      verified: readBool(json['verified']),
    );
  }

  bool get hasAnyData =>
      totalSolved != null ||
      easySolved != null ||
      mediumSolved != null ||
      hardSolved != null ||
      ranking != null ||
      recentSubmissions.isNotEmpty;
}

class CodingCodeforcesStats {
  const CodingCodeforcesStats({
    this.handle,
    this.rating,
    this.maxRating,
    this.rank,
    this.maxRank,
    this.solvedCount,
    this.recentSubmissions = const [],
    this.contestHistory = const [],
    this.lastSyncedAt,
    this.verified = false,
  });

  final String? handle;
  final int? rating;
  final int? maxRating;
  final String? rank;
  final String? maxRank;
  final int? solvedCount;
  final List<CodingSubmissionItem> recentSubmissions;
  final List<CodingContestItem> contestHistory;
  final DateTime? lastSyncedAt;
  final bool verified;

  factory CodingCodeforcesStats.fromJson(Map<String, dynamic> json) {
    return CodingCodeforcesStats(
      handle: _readNullableText(json['handle']),
      rating: readInt(json['rating']),
      maxRating: readInt(json['maxRating']),
      rank: _readNullableText(json['rank']),
      maxRank: _readNullableText(json['maxRank']),
      solvedCount: readInt(json['solvedCount']),
      recentSubmissions: _readSubmissions(json['recentSubmissions']),
      contestHistory: _readContests(json['contestHistory']),
      lastSyncedAt: readDateTime(json['lastSyncedAt']),
      verified: readBool(json['verified']),
    );
  }

  bool get hasAnyData =>
      rating != null ||
      maxRating != null ||
      solvedCount != null ||
      recentSubmissions.isNotEmpty ||
      contestHistory.isNotEmpty;
}

class CodingGitHubStats {
  const CodingGitHubStats({
    this.username,
    this.contributions,
    this.projects,
    this.followers,
    this.following,
    this.publicRepos,
    this.recentActivity = const [],
    this.lastSyncedAt,
    this.verified = false,
  });

  final String? username;
  final int? contributions;
  final int? projects;
  final int? followers;
  final int? following;
  final int? publicRepos;
  final List<CodingSubmissionItem> recentActivity;
  final DateTime? lastSyncedAt;
  final bool verified;

  factory CodingGitHubStats.fromJson(Map<String, dynamic> json) {
    return CodingGitHubStats(
      username: _readNullableText(json['username']),
      contributions: readInt(json['contributions']),
      projects: readInt(json['projects']),
      followers: readInt(json['followers']),
      following: readInt(json['following']),
      publicRepos: readInt(json['publicRepos']),
      recentActivity: _readSubmissions(json['recentActivity']),
      lastSyncedAt: readDateTime(json['lastSyncedAt']),
      verified: readBool(json['verified']),
    );
  }

  bool get hasAnyData =>
      contributions != null ||
      projects != null ||
      followers != null ||
      following != null ||
      publicRepos != null ||
      recentActivity.isNotEmpty;
}

List<CodingSubmissionItem> _readSubmissions(dynamic value) {
  if (value is! List) return const [];
  return value
      .whereType<Map>()
      .map((item) => CodingSubmissionItem.fromJson(Map<String, dynamic>.from(item)))
      .toList();
}

List<CodingContestItem> _readContests(dynamic value) {
  if (value is! List) return const [];
  return value
      .whereType<Map>()
      .map((item) => CodingContestItem.fromJson(Map<String, dynamic>.from(item)))
      .toList();
}

String? _readNullableText(dynamic value) {
  final text = value?.toString().trim();
  if (text == null || text.isEmpty) return null;
  return text;
}

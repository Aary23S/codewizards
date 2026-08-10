import { Link } from "react-router-dom";

const shellCard =
  "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.22)]";

const ProfileGrowthInsights = ({ profile, codingProfile, connections, goals, projects }) => {
  // 1. Coding Summary values
  const leetcodeSolved = codingProfile?.leetcode?.totalSolved ?? profile.externalStats?.leetcodeSolveScore ?? 0;
  const githubContribs = codingProfile?.github?.contributions ?? profile.externalStats?.githubContributions ?? 0;
  const codeforcesRating = codingProfile?.codeforces?.rating ?? profile.externalStats?.codeforcesRating ?? 0;

  // 2. Project counts
  const matchesProjects = projects.filter(p => p.contributors && p.contributors.includes(profile.name)).length;

  // 3. Goals and recommendations
  const activeGoal = goals && goals.length > 0 ? goals[0] : null;
  const completedTasksCount = activeGoal ? activeGoal.tasks.filter(t => t.isCompleted).length : 0;
  const totalTasksCount = activeGoal ? activeGoal.tasks.length : 0;
  const progressPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // 4. Learning Focus rule-based items
  const learningFocusItems = [];
  if (!profile.github) {
    learningFocusItems.push({
      emoji: "🐙",
      title: "Connect GitHub profile",
      description: "Showcase your repositories and contributions to highlight coding consistency."
    });
  }
  if (leetcodeSolved < 50) {
    learningFocusItems.push({
      emoji: "🏆",
      title: "Improve DSA consistency",
      description: "Aim to solve 3-5 daily LeetCode problems to improve logic building skills."
    });
  }
  if (matchesProjects < 2) {
    learningFocusItems.push({
      emoji: "💻",
      title: "Complete a React/Node project",
      description: "You have the coding basics. Build a project to master real-world skills."
    });
  }
  if (!profile.linkedin) {
    learningFocusItems.push({
      emoji: "💼",
      title: "Connect LinkedIn profile",
      description: "Update your profile to connect with professional mentors and recruiters."
    });
  }
  if (learningFocusItems.length === 0) {
    learningFocusItems.push({
      emoji: "🚀",
      title: "All baseline focus items complete",
      description: "Focus on advanced mock interviews and system design topics with your mentor."
    });
  }

  // 5. Placement Readiness Checklist
  const hasResume = !!profile.portfolio;
  const hasGithub = !!profile.github;
  const hasLinkedin = !!profile.linkedin;
  const hasProjectsMilestone = matchesProjects >= 2;
  const hasMentorship = connections && connections.length > 0;
  const hasMockInterview = goals && goals.some(g => g.tasks && g.tasks.some(t => t.title.toLowerCase().includes("interview") && t.isCompleted));

  const checklist = [
    { label: "Resume Added", completed: hasResume },
    { label: "GitHub Connected", completed: hasGithub },
    { label: "LinkedIn Connected", completed: hasLinkedin },
    { label: "2+ Projects Added", completed: hasProjectsMilestone },
    { label: "Mentor Connected", completed: hasMentorship },
    { label: "Mock Interview Completed", completed: hasMockInterview }
  ];

  const readinessScore = Math.round((checklist.filter(c => c.completed).length / checklist.length) * 100);

  // 6. Recent Activity compilation
  const activities = [
    {
      type: "profile",
      title: "Updated Profile Details",
      date: new Date(profile.updatedAt),
      color: "bg-cyan-400"
    }
  ];

  if (hasMentorship && connections[0]) {
    activities.push({
      type: "mentorship",
      title: `Joined Active Mentorship with ${connections[0].mentorId?.name || "Mentor"}`,
      date: new Date(connections[0].createdAt),
      color: "bg-emerald-400"
    });
  }

  projects
    .filter(p => p.contributors && p.contributors.includes(profile.name))
    .forEach(project => {
      activities.push({
        type: "project",
        title: `Contributed to project: ${project.title}`,
        date: new Date(project.updatedAt || project.createdAt),
        color: "bg-indigo-400"
      });
    });

  if (goals) {
    goals.flatMap(g => g.tasks || []).filter(t => t.isCompleted && t.completedAt).forEach(task => {
      activities.push({
        type: "task",
        title: `Completed Task: ${task.title}`,
        date: new Date(task.completedAt),
        color: "bg-amber-400"
      });
    });
  }

  // Sort activities newest first
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Coding Profile Summary */}
        <div className={`${shellCard} p-6 md:p-7`}>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/45 mb-4">1. Coding Profile Summary</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">LeetCode</p>
              <p className="text-xl font-bold mt-1 text-emerald-400">{leetcodeSolved || "N/A"}</p>
              <p className="text-[10px] text-white/50 mt-1">Solved</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">GitHub</p>
              <p className="text-xl font-bold mt-1 text-cyan-400">{githubContribs || "N/A"}</p>
              <p className="text-[10px] text-white/50 mt-1">Contributions</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Codeforces</p>
              <p className="text-xl font-bold mt-1 text-indigo-400">{codeforcesRating || "N/A"}</p>
              <p className="text-[10px] text-white/50 mt-1">Rating</p>
            </div>
          </div>
        </div>

        {/* Mentor Recommendations */}
        <div className={`${shellCard} p-6 md:p-7`}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">2. Mentor Recommendations</p>
            <Link to="/connections" className="text-xs text-cyan-300 hover:underline">View all</Link>
          </div>
          {!hasMentorship ? (
            <p className="text-sm text-white/45">No active mentors found. Go to the directory to connect with a mentor.</p>
          ) : !activeGoal ? (
            <p className="text-sm text-white/45">No active mentorship goals set yet.</p>
          ) : (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">{activeGoal.title}</h4>
              <div className="flex items-center justify-between text-[11px] text-white/55">
                <span>Progress: {progressPct}%</span>
                <span>{completedTasksCount}/{totalTasksCount} Completed</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
              </div>
              <div className="mt-3 space-y-1.5">
                {activeGoal.tasks.slice(0, 4).map((task) => (
                  <div key={task._id} className="flex items-center gap-2 text-xs text-white/70">
                    <span className={`h-1.5 w-1.5 rounded-full ${task.isCompleted ? "bg-emerald-400" : "bg-white/20"}`}></span>
                    <span className={task.isCompleted ? "line-through text-white/40" : ""}>{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Learning Focus */}
        <div className={`${shellCard} p-6 md:p-7`}>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/45 mb-4">3. Learning Focus</p>
          <div className="space-y-3">
            {learningFocusItems.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start rounded-2xl border border-white/5 bg-white/5 p-4">
                <span className="text-xl">{item.emoji}</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-white/50 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Placement Readiness */}
        <div className={`${shellCard} p-6 md:p-7`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">4. Placement Readiness</p>
            <span className="text-lg font-bold text-cyan-400">{readinessScore}% Ready</span>
          </div>
          <div className="space-y-4">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${item.completed ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30" : "bg-white/5 text-white/30 border border-white/10"
                  }`}>
                  {item.completed ? "✓" : "○"}
                </span>
                <span className={`text-sm ${item.completed ? "text-white" : "text-white/50"}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline
      <div className={`${shellCard} p-6 md:p-7`}>
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/45 mb-4">5. Recent Activity Timeline</p>
        {activities.length === 0 ? (
          <p className="text-sm text-white/40">No recent activities recorded.</p>
        ) : (
          <div className="relative border-l border-white/10 pl-6 ml-3 space-y-6">
            {activities.map((act, idx) => (
              <div key={idx} className="relative">
                <span className={`absolute -left-[30px] top-1.5 h-3.5 w-3.5 rounded-full border-4 border-black ${act.color}`}></span>
                <div className="text-xs text-white/40 uppercase tracking-wider">{act.type}</div>
                <div className="text-sm font-semibold mt-1">{act.title}</div>
                <div className="text-xs text-white/35 mt-1">{act.date.toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
};

export default ProfileGrowthInsights;

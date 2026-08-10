// codewizards/client/src/pages/Collaborations.js
import React from "react";

const partnersData = [
  {
    name: "GeeksforGeeks",
    type: "Campus Partner",
    description: "GeeksforGeeks provides resources for computer science students to master data structures, algorithms, and technical interview preparation.",
    website: "https://geeksforgeeks.org",
    logoText: "GFG",
    representatives: [
      {
        name: "Omkar Patil",
        role: "GFG Campus Lead",
        avatar: "OP",
        avatarColor: "from-emerald-400 to-teal-600",
      },
    ],
  },
  {
    name: "Algozenith",
    type: "Club Partner",
    description: "Master competitive programming and DSA. Building problem-solving foundations through structured coding camps and contests.",
    website: "https://algozenith.com",
    logoText: "AZ",
    representatives: [
      {
        name: "Shivam Giri",
        role: "Campus Lead",
        avatar: "SG",
        avatarColor: "from-blue-400 to-indigo-600",
      },
      {
        name: "Shivendra Ghatage",
        role: "Tech Lead",
        avatar: "SG",
        avatarColor: "from-purple-400 to-pink-600",
      },
      {
        name: "Yash Sagpal",
        role: "Content & Design Lead",
        avatar: "YS",
        avatarColor: "from-orange-400 to-red-600",
      },
      {
        name: "Nandan Gaikwad",
        role: "Media & Outreach Lead",
        avatar: "NG",
        avatarColor: "from-sky-400 to-blue-600",
      },
    ],
  },
  {
    name: "LetsUpgrade",
    type: "Education Partner",
    description: "An interactive learning community and upskilling platform providing industry-aligned tech courses and projects for students.",
    website: "https://letsupgrade.in",
    logoText: "LU",
    representatives: [
      {
        name: "Omkar Patil",
        role: "LetsUpgrade Lead",
        avatar: "OP",
        avatarColor: "from-amber-400 to-orange-600",
      },
    ],
  },
  {
    name: "Gemini",
    type: "AI Partner",
    description: "Supercharging development with advanced generative AI, assisting students in coding, brainstorming, and software building.",
    website: "https://deepmind.google/technologies/gemini/",
    logoText: "G",
    representatives: [
      {
        name: "Anish",
        role: "Google Ambassador",
        avatar: "A",
        avatarColor: "from-blue-500 via-purple-500 to-pink-500",
      },
    ],
  },
];

const Collaborations = () => {
  return (
    <div className="relative mx-auto max-w-6xl px-4 py-24 text-white">
      {/* Background glow effects */}
      <div className="absolute left-1/4 top-16 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute right-1/4 top-40 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      {/* Hero Header */}
      <div className="relative mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
          Our Partners
        </h1>
        <p className="mt-4 text-sm md:text-base leading-relaxed text-white/60">
          Collaborating with industry leaders to bring the best opportunities, hackathons, outreach programs, and learning tracks to our developer community.
        </p>
      </div>

      {/* Grid of Partners */}
      <div className="grid gap-8 md:grid-cols-2">
        {partnersData.map((partner, index) => (
          <div
            key={partner.name}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/8"
          >
            {/* Soft decorative corner glow */}
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-cyan-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/5 text-lg font-bold text-white tracking-wider group-hover:scale-105 transition-transform">
                      {partner.logoText}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-cyan-400 transition-colors">
                        {partner.name}
                      </h3>
                      <span className="text-[10px] uppercase tracking-widest text-cyan-400/80 font-semibold">
                        {partner.type}
                      </span>
                    </div>
                  </div>
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/15 hover:text-white"
                  >
                    Visit Website ↗
                  </a>
                </div>

                <p className="text-sm leading-relaxed text-white/70 mb-6">
                  {partner.description}
                </p>
              </div>

              {/* Signatories / Representatives */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3 font-semibold">
                  Student Representatives
                </p>
                <div className="flex flex-col gap-3">
                  {partner.representatives.map((rep) => (
                    <div key={rep.name} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${rep.avatarColor} text-xs font-bold text-white shadow-sm`}>
                        {rep.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/90">{rep.name}</p>
                        <p className="text-[10px] text-white/50">{rep.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Block */}
      <div className="relative mt-20 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-blue-900/20 via-black/40 to-indigo-900/20 p-8 text-center shadow-xl md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-indigo-500/5" />
        <h2 className="relative text-2xl font-bold md:text-3xl text-white">
          Partner With Us
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-sm text-white/60">
          Connect with our vibrant developer community of 500+ student engineers. Reach out to discuss sponsorship, seminars, and collaboration opportunities.
        </p>
        <div className="relative mt-6">
          <a
            href="/contact"
            className="inline-block rounded-full bg-cyan-500 px-6 py-2.5 text-xs font-bold text-black transition hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
          >
            Become a Partner →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Collaborations;

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Project = require("./models/Project");
const Event = require("./models/Event");
const Timeline = require("./models/Timeline");
const Gallery = require("./models/Gallery");
const Announcement = require("./models/Announcement");
const User = require("./models/User");

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("DB connected");

  // Clear existing data
  await Promise.all([
    Project.deleteMany(),
    Event.deleteMany(),
    Timeline.deleteMany(),
    Gallery.deleteMany(),
    Announcement.deleteMany(),
    User.deleteMany(),
  ]);
  console.log("Cleared existing data");

  // Users
  await User.create([
    {
      name: "Aary Satardekar",
      email: "aary.s@codewizards.com",
      password: "test1234",
      role: "admin",
      batch: 2026,
      domain: ["Web", "AI"],
      bio: "Co-founder of CodeWizards. Full-stack developer.",
      github: "https://github.com/aary",
      linkedin: "https://linkedin.com/in/aary",
      isMentor: true,
    },
    {
      name: "Aary Dalal",
      email: "aary.d@codewizards.com",
      password: "test1234",
      role: "admin",
      batch: 2026,
      domain: ["Flutter", "Backend"],
      bio: "Co-founder of CodeWizards. Mobile and backend developer.",
      github: "https://github.com/aarydalal",
      isMentor: true,
    },
    {
      name: "Riya Patil",
      email: "riya@codewizards.com",
      password: "test1234",
      role: "senior",
      batch: 2025,
      domain: ["AI", "Machine Learning"],
      bio: "ML enthusiast. Open to mentoring juniors in AI/ML.",
      isMentor: true,
    },
    {
      name: "Rohit Desai",
      email: "rohit@codewizards.com",
      password: "test1234",
      role: "senior",
      batch: 2025,
      domain: ["Competitive Programming", "Backend"],
      bio: "Codeforces Specialist. Love solving algorithmic problems.",
      isMentor: true,
    },
    {
      name: "Sneha More",
      email: "sneha@codewizards.com",
      password: "test1234",
      role: "student",
      batch: 2027,
      domain: ["Web"],
      bio: "Learning React and Node. Excited to build real projects.",
      isMentor: false,
    },
  ]);
  console.log("Users seeded");

  // Projects
  await Project.create([
    {
      title: "CodeWizards Platform",
      description: "Official club website built with MERN stack. Showcases projects, events, and connects juniors with seniors.",
      techStack: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
      contributors: ["Arya Satardekar", "Arya Dalal"],
      githubUrl: "https://github.com/codewizards/platform",
      featured: true,
    },
    {
      title: "AI Resume Reviewer",
      description: "Upload a resume and get structured AI-generated feedback on content, formatting, and gaps.",
      techStack: ["Python", "Flask", "OpenAI API", "React"],
      contributors: ["Riya Patil"],
      githubUrl: "https://github.com/codewizards/ai-resume",
      featured: true,
    },
    {
      title: "Contest Tracker",
      description: "Aggregates upcoming competitive programming contests from Codeforces, LeetCode, and HackerEarth.",
      techStack: ["React", "Node.js", "Cron Jobs"],
      contributors: ["Rohit Desai"],
      githubUrl: "https://github.com/codewizards/contest-tracker",
      featured: false,
    },
  ]);
  console.log("Projects seeded");

  // Events
  await Event.create([
    {
      title: "Web Dev Bootcamp",
      type: "workshop",
      description: "A 2-day intensive workshop covering HTML, CSS, React, and Node.js fundamentals.",
      date: new Date("2024-09-10"),
      venue: "CSE Seminar Hall",
      status: "completed",
      featured: true,
    },
    {
      title: "HackWizard 2024",
      type: "hackathon",
      description: "24-hour internal hackathon. Teams of 3 build a working prototype from scratch.",
      date: new Date("2024-11-20"),
      venue: "Main Auditorium",
      status: "completed",
      featured: true,
    },
    {
      title: "DSA Crash Course",
      type: "workshop",
      description: "Covers arrays, linked lists, trees, graphs, and dynamic programming with practice problems.",
      date: new Date("2025-08-15"),
      venue: "CSE Lab 2",
      status: "upcoming",
      featured: true,
    },
  ]);
  console.log("Events seeded");

  // Timeline
  await Timeline.create([
    {
      year: 2023,
      month: "June",
      title: "CodeWizards Founded",
      description: "Club officially founded on 9 June 2023 by Arya Satardekar and Arya Dalal at DY Patil Agriculture & Technical University.",
    },
    {
      year: 2023,
      month: "September",
      title: "First Workshop",
      description: "Conducted the club's first workshop on Web Development basics with 60+ student attendees.",
    },
    {
      year: 2024,
      month: "February",
      title: "Reached 200 Members",
      description: "Club community crossed 200 active members across all batches.",
    },
    {
      year: 2024,
      month: "November",
      title: "HackWizard 2024",
      description: "Organized the first internal 24-hour hackathon with 15 teams competing.",
    },
    {
      year: 2025,
      month: "January",
      title: "Reached 400+ Members",
      description: "Club grew to 400–500 active students. Launched mentorship program.",
    },
  ]);
  console.log("Timeline seeded");

  // Gallery
  await Gallery.create([
    {
      title: "Web Dev Bootcamp 2024",
      imageUrl: "https://placehold.co/800x500?text=Web+Dev+Bootcamp",
      category: "event",
      eventRef: "Web Dev Bootcamp",
    },
    {
      title: "HackWizard 2024",
      imageUrl: "https://placehold.co/800x500?text=HackWizard+2024",
      category: "event",
      eventRef: "HackWizard 2024",
    },
    {
      title: "Core Team 2024",
      imageUrl: "https://placehold.co/800x500?text=Core+Team+2024",
      category: "team",
    },
  ]);
  console.log("Gallery seeded");

  // Announcements
  await Announcement.create([
    {
      title: "DSA Crash Course Registration Open",
      body: "Register now for the upcoming DSA Crash Course on 15 August 2025. Limited seats available.",
      important: true,
    },
    {
      title: "Welcome New Members!",
      body: "Welcome to all freshers who joined CodeWizards this year. Explore the platform and connect with seniors.",
      important: false,
    },
  ]);
  console.log("Announcements seeded");

  console.log("✅ All seed data inserted successfully");
  process.exit();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
import { useEffect, useState } from "react";
import { getProjects } from "../services/api";

const ProjectCard = ({ project, index }) => (
  <div
    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
    style={{ transitionDelay: `${index * 60}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative flex h-full flex-col gap-4">
      {project.featured && (
        <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-200">
          Featured
        </span>
      )}
      <h3 className="text-xl font-semibold text-white">{project.title}</h3>
      <p className="flex-1 text-sm leading-7 text-white/60">{project.description}</p>
      <div className="flex flex-wrap gap-2">
        {project.techStack?.map((tech) => (
          <span key={tech} className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">
            {tech}
          </span>
        ))}
      </div>
      {project.contributors?.length > 0 && (
        <p className="text-xs text-white/40">By {project.contributors.join(", ")}</p>
      )}
      <div className="flex gap-3 pt-1">
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white">
            GitHub
          </a>
        )}
        {project.demoUrl && (
          <a href={project.demoUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/12 px-4 py-2 text-xs font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white">
            Live Demo
          </a>
        )}
      </div>
    </div>
  </div>
);

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then((res) => setProjects(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-20">
      <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mb-14 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">What We Built</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Projects with a sharper presentation layer.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
          Same project data, cleaner visual structure, better hierarchy, and softer motion.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-white/45">Loading...</p>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project._id} project={project} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/55">
          No projects found.
        </div>
      )}
    </div>
  );
};

export default Projects;

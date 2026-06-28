import { useEffect, useState } from "react";
import { getProjects } from "../services/api";

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
    <div className="max-w-7xl mx-auto px-4 py-20">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">What We've Built</p>
      <h1 className="text-4xl font-bold text-white mb-12">Projects</h1>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p._id}
              className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-3 hover:border-gray-600 transition-colors">
              {p.featured && (
                <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full font-semibold w-fit">
                  Featured
                </span>
              )}
              <h3 className="text-white font-semibold text-lg">{p.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed flex-1">{p.description}</p>
              <div className="flex flex-wrap gap-2">
                {p.techStack?.map((tech) => (
                  <span key={tech} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">
                    {tech}
                  </span>
                ))}
              </div>
              {p.contributors?.length > 0 && (
                <p className="text-xs text-gray-600">By {p.contributors.join(", ")}</p>
              )}
              <div className="flex gap-3 mt-1">
                {p.githubUrl && (
                  <a href={p.githubUrl} target="_blank" rel="noreferrer"
                    className="text-xs border border-gray-700 text-gray-300 hover:text-white hover:border-white px-3 py-1 rounded-lg transition-colors">
                    GitHub
                  </a>
                )}
                {p.demoUrl && (
                  <a href={p.demoUrl} target="_blank" rel="noreferrer"
                    className="text-xs border border-gray-700 text-gray-300 hover:text-white hover:border-white px-3 py-1 rounded-lg transition-colors">
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
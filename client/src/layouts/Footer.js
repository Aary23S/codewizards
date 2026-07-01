import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="mt-16 border-t border-white/10 bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <img src={logo} alt="CodeWizards" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-lg font-semibold">CodeWizards</span>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/55">
            Official coding club of D.Y. Patil Agriculture & Technical University, Talsande.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-white/35">Founded: 9 June 2023</p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.28em] text-white/45">
            {user ? "Quick Links" : "Locked Access"}
          </h4>
          {user ? (
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              {[
                { name: "About", path: "/about" },
                { name: "Projects", path: "/projects" },
                { name: "Events", path: "/events" },
                { name: "Legacy", path: "/legacy" },
                { name: "Team", path: "/team" },
                { name: "Contact", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/55">
              Sign in to access the community sections and role-based features.
            </p>
          )}
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.28em] text-white/45">Connect</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/60">
            <li>
              <a href="mailto:codewizards@dypatil.edu" className="transition-colors hover:text-white">
                codewizards@dypatil.edu
              </a>
            </li>
            <li>
              <a href="https://github.com/codewizards" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                GitHub
              </a>
            </li>
            <li>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs tracking-[0.2em] text-white/35">
        © {new Date().getFullYear()} CodeWizards — D.Y. Patil Agriculture & Technical University
      </div>
    </footer>
  );
};

export default Footer;

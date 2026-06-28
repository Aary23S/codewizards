import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 mt-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img src={logo} alt="CodeWizards" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-lg font-bold text-white">CodeWizards</span>
          </div>
          <p className="text-sm leading-relaxed">
            Official coding club of D.Y. Patil Agriculture & Technical University, Talsande.
          </p>
          <p className="text-xs mt-2 text-gray-600">Founded: 9 June 2023</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-3 uppercase text-xs tracking-widest">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              { name: "About", path: "/about" },
              { name: "Projects", path: "/projects" },
              { name: "Events", path: "/events" },
              { name: "Legacy", path: "/legacy" },
              { name: "Team", path: "/team" },
              { name: "Contact", path: "/contact" },
            ].map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="hover:text-white transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-3 uppercase text-xs tracking-widest">Connect</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="mailto:codewizards@dypatil.edu" className="hover:text-white transition-colors">
                codewizards@dypatil.edu
              </a>
            </li>
            <li>
              <a href="https://github.com/codewizards" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                GitHub
              </a>
            </li>
            <li>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-gray-700 py-4 border-t border-gray-800">
        © {new Date().getFullYear()} CodeWizards — D.Y. Patil Agriculture & Technical University
      </div>
    </footer>
  );
};

export default Footer;
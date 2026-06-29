import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg"; // adjust extension if needed
import { getDashboardPath } from "../utils/getDashboardPath";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Legacy", path: "/legacy" },
  { name: "Projects", path: "/projects" },
  { name: "Events", path: "/events" },
  { name: "Gallery", path: "/gallery" },
  { name: "Team", path: "/team" },
  { name: "Contact", path: "/contact" },
  { name: "Opportunities", path: "/opportunities" },
  { name: "Forum", path: "/doubts" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-black text-white sticky top-0 z-50 shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="CodeWizards" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-lg font-bold tracking-wide text-white">CodeWizards</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`transition-colors hover:text-white ${
                  pathname === link.path
                    ? "text-white border-b-2 border-white pb-1"
                    : "text-gray-400"
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

          {user ? (
  <>
    <Link to={getDashboardPath(user.role)} className="text-sm text-gray-400 hover:text-white transition-colors">
      {user.name?.split(" ")[0]}
    </Link>
    <button
      onClick={logout}
      className="border border-gray-700 text-gray-300 hover:border-white hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
    >
      Logout
    </button>
  </>
) : (
  <Link to="/login"
    className="border border-white text-white hover:bg-white hover:text-black px-4 py-2 rounded-lg text-sm font-medium transition-all">
    Login
  </Link>
)}

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-950 px-4 pb-4 border-t border-gray-800">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm border-b border-gray-800 ${
                pathname === link.path ? "text-white" : "text-gray-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="block mt-3 border border-white text-white text-center py-2 rounded-lg text-sm"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

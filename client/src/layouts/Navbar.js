import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { getDashboardPath } from "../utils/getDashboardPath";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Team", path: "/team" },
  { name: "Legacy", path: "/legacy" },
  { name: "Projects", path: "/projects" },
  { name: "Events", path: "/events" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact", path: "/contact" },
  { name: "Opportunities", path: "/opportunities" },
  { name: "Forum", path: "/doubts" },
  { name: "Leaderboard", path: "/leaderboard" },
  { name: "Blog", path: "/blogs" },
  { name: "About", path: "/about" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const activeLink = useMemo(() => navLinks.find((link) => link.path === pathname), [pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/85 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="group flex items-center gap-3">
          <div className="overflow-hidden rounded-full border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <img src={logo} alt="CodeWizards" className="h-10 w-10 object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">CodeWizards</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-5 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.path} className="relative">
                <Link
                  to={link.path}
                  className={`transition-colors hover:text-white ${
                    pathname === link.path ? "text-white" : "text-white/55"
                  }`}
                >
                  {link.name}
                </Link>
                {pathname === link.path && (
                  <span className="absolute -bottom-2 left-0 h-px w-full bg-white" />
                )}
              </li>
            ))}
          </ul>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to={getDashboardPath(user.role)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/25 hover:text-white">
                {user.name?.split(" ")[0]}
              </Link>
              <button onClick={logout} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:border-white/25 hover:text-white">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/90">
              Login
            </Link>
          )}
        </div>

        <button
          className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-white/25 hover:text-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-white/10 bg-black/95 md:hidden transition-all duration-300 ${
          menuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-4">
          {activeLink && (
            <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-white/35">
              {activeLink.name}
            </p>
          )}
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`rounded-2xl border px-4 py-3 text-sm transition-colors ${
                  pathname === link.path
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="mt-4">
            {user ? (
              <div className="flex gap-3">
                <Link
                  to={getDashboardPath(user.role)}
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white/70"
                >
                  {user.name?.split(" ")[0]}
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="rounded-full bg-white px-4 py-3 text-sm font-medium text-black"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-full bg-white px-4 py-3 text-center text-sm font-medium text-black"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

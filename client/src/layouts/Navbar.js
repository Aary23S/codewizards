import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";
const primaryLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Team", path: "/team" },
  { name: "Events", path: "/events" },
];

const exploreLinks = [
  { name: "Projects", path: "/projects" },
  { name: "Gallery", path: "/gallery" },
  { name: "Legacy", path: "/legacy" },
  { name: "Opportunities", path: "/opportunities" },
  { name: "Forum", path: "/doubts" },
  { name: "Leaderboard", path: "/leaderboard" },
  { name: "Blog", path: "/blogs" },
  { name: "Contact", path: "/contact" },
  { name: "Resources", path: "/resources" },
];

const utilityLinks = [
  { name: "Connect", path: "/connect" },
  { name: "Resources", path: "/resources" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navbarRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setExploreOpen(false);
    navigate("/login", { replace: true });
  };

  const activeLink = useMemo(
    () => [...primaryLinks, ...exploreLinks, ...utilityLinks].find((link) => link.path === pathname),
    [pathname]
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setExploreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <nav ref={navbarRef} className="sticky top-0 z-50 border-b border-white/10 bg-black/80 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="group flex items-center gap-3">
          <div className="overflow-hidden rounded-full border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <img src={logo} alt="CodeWizards" className="h-10 w-10 object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">CodeWizards</span>
        </Link>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex max-w-[72rem] flex-wrap items-center justify-center gap-2">
            {primaryLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
                  pathname === link.path
                    ? "border-white bg-white text-black shadow-[0_8px_28px_rgba(255,255,255,0.1)]"
                    : "border-white/10 bg-white/5 text-white/60 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => setExploreOpen((open) => !open)}
                className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
                  exploreLinks.some((link) => pathname === link.path)
                    ? "border-white bg-white text-black shadow-[0_8px_28px_rgba(255,255,255,0.1)]"
                    : "border-white/10 bg-white/5 text-white/60 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                Explore
              </button>

              {exploreOpen && (
                <div className="absolute left-1/2 top-[calc(100%+0.9rem)] z-50 w-[28rem] -translate-x-1/2 rounded-3xl border border-white/10 bg-black/95 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
                  <div className="grid grid-cols-2 gap-2">
                    {exploreLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setExploreOpen(false)}
                        className={`rounded-2xl border px-4 py-3 text-sm transition-colors ${
                          pathname === link.path
                            ? "border-white bg-white text-black"
                            : "border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-cyan-300/15"
                >
                  Admin
                </Link>
              )}
              <Link
                to={`/profile/${user._id}`}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:text-white"
              >
                {user.name?.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:text-white"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/90"
              >
                Login
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-white/25 hover:text-white lg:hidden"
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
        className={`overflow-hidden border-t border-white/10 bg-black/95 lg:hidden transition-all duration-300 ${
          menuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-4">
          {activeLink && (
            <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-white/35">
              {activeLink.name}
            </p>
          )}
          <div className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {primaryLinks.map((link) => (
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

            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-white/35">Explore</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {exploreLinks.map((link) => (
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
            </div>

            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-white/35">Quick Access</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {utilityLinks.map((link) => (
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
            </div>

            {user && (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-white/35">Workspace</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Link
                    to={`/profile/${user._id}`}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-2xl border px-4 py-3 text-sm transition-colors ${
                      pathname === `/profile/${user._id}`
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    Profile
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className={`rounded-2xl border px-4 py-3 text-sm transition-colors ${
                        pathname === "/admin"
                          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
                          : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      Admin panel
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            {user ? (
              <div className="flex gap-3">
                <Link
                  to={`/profile/${user._id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white/70"
                >
                  {user.name?.split(" ")[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-white px-4 py-3 text-sm font-medium text-black"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white/70"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-full bg-white px-4 py-3 text-center text-sm font-medium text-black"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

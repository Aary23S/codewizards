// codewizards/client/src/pages/NotFound.js
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center text-white">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Page not found</h1>
      <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 md:text-base">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
      >
        Back to home
      </Link>
    </div>
  );
};

export default NotFound;

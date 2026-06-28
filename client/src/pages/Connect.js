import { Link } from "react-router-dom";

const Connect = () => (
  <div className="max-w-2xl mx-auto px-4 py-32 text-center">
    <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Mentorship</p>
    <h1 className="text-4xl font-bold text-white mb-6">Coming in Phase 2</h1>
    <p className="text-gray-400 leading-relaxed mb-10">
      We're building a way for you to browse seniors and alumni by domain and
      connect directly for mentorship. This feature is on the way — check back soon.
    </p>
    <Link
      to="/"
      className="border border-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:border-white transition-colors"
    >
      Back to Home
    </Link>
  </div>
);

export default Connect;
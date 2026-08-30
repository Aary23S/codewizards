// codewizards/client/src/components/ErrorBoundary.js
import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#050816] px-4 text-center text-white">
          <p className="text-2xl font-semibold">Something went wrong</p>
          <p className="max-w-md text-sm text-white/60">
            This page hit an unexpected error. Reloading usually fixes it — if it keeps happening, let us know.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

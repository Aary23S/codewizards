import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./layouts/Navbar";
import Footer from "./layouts/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { getDashboardPath } from "./utils/getDashboardPath";

import Home from "./pages/Home";
import About from "./pages/About";
import Legacy from "./pages/Legacy";
import Projects from "./pages/Projects";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Connect from "./pages/Connect";
import Dashboard from "./pages/Dashboard";
import ProfileView from "./pages/ProfileView";
import ProfileEdit from "./pages/ProfileEdit";
import Resources from "./pages/Resources";
import Admin from "./pages/Admin";
import Opportunities from "./pages/Opportunities";
import Doubts from "./pages/Doubts";
import Leaderboard from "./pages/Leaderboard";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";

const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center text-gray-500 py-32">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
};

const OwnProfileEditRoute = () => {
  const { user, loading } = useAuth();
  const { id } = useParams();

  if (loading) {
    return <div className="text-center text-gray-500 py-32">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user._id !== id) {
    return <Navigate to="/" replace />;
  }

  return <ProfileEdit />;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/legacy" element={<Legacy />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/resources" element={<Resources />} />

          {/* Protected */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute roles={["student"]}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/senior-dashboard" element={
            <ProtectedRoute roles={["senior"]}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/alumni-dashboard" element={
            <ProtectedRoute roles={["alumni"]}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          } />

          <Route path="/profile/:id" element={<ProfileView />} />
          <Route path="/profile/:id/edit" element={<OwnProfileEditRoute />} />

          <Route path="/opportunities" element={<Opportunities />} />

          <Route path="/doubts" element={<Doubts />} />

          <Route path="/leaderboard" element={<Leaderboard />} />

          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogPost />} />

        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

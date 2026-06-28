import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents, registerForEvent } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    getEvents()
      .then((res) => setEvents(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? events : events.filter((e) => e.status === filter);

  const handleRegister = async (eventId) => {
    setMessage("");
    setRegisteringId(eventId);
    try {
      await registerForEvent(eventId);
      setMessage("Registration successful.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">What's Happening</p>
      <h1 className="text-4xl font-bold text-white mb-8">Events</h1>

      <div className="flex gap-3 mb-10">
        {["all", "upcoming", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors capitalize ${
              filter === f
                ? "bg-white text-black border-white font-semibold"
                : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-gray-300 mb-6">{message}</p>}

      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : (
        <div className="flex flex-col gap-5">
          {filtered.map((e) => (
            <div
              key={e._id}
              className="border border-gray-800 rounded-xl p-6 bg-gray-900 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs uppercase tracking-widest text-gray-500">{e.type}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        e.status === "upcoming"
                          ? "bg-white text-black font-semibold"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {e.status}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{e.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{e.description}</p>
                  <p className="text-gray-600 text-xs mt-3">
                    {new Date(e.date).toDateString()} {e.venue && `· ${e.venue}`}
                  </p>
                  {e.status === "upcoming" && user && (
                    <button
                      onClick={() => handleRegister(e._id)}
                      disabled={registeringId === e._id}
                      className="mt-4 bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {registeringId === e._id ? "Registering..." : "Register"}
                    </button>
                  )}
                  {e.status === "upcoming" && !user && (
                    <p className="text-gray-500 text-xs mt-3">
                      <Link to="/login" className="text-white hover:underline">
                        Login
                      </Link>{" "}
                      to register.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-gray-600 text-sm">No {filter} events found.</p>}
        </div>
      )}
    </div>
  );
};

export default Events;

import { useEffect, useState } from "react";
import { getEvents, registerForEvent, getMyRegistrations } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState({});  // eventId → true
  const [regError, setRegError] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const evtRes = await getEvents();
        setEvents(evtRes.data.data);

        // If student, preload which events they already registered for
        if (user?.role === "student") {
          const regRes = await getMyRegistrations();
          const alreadyRegistered = {};
          regRes.data.data.forEach((id) => { alreadyRegistered[id] = true; });
          setRegistered(alreadyRegistered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleRegister = async (eventId) => {
    setRegError((prev) => ({ ...prev, [eventId]: "" }));
    try {
      await registerForEvent(eventId);
      setRegistered((prev) => ({ ...prev, [eventId]: true }));
    } catch (err) {
      setRegError((prev) => ({
        ...prev,
        [eventId]: err.response?.data?.message || "Registration failed",
      }));
    }
  };

  const filtered = filter === "all" ? events : events.filter((e) => e.status === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">What's Happening</p>
      <h1 className="text-4xl font-bold text-white mb-8">Events</h1>

      <div className="flex gap-3 mb-10">
        {["all", "upcoming", "completed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors capitalize ${
              filter === f
                ? "bg-white text-black border-white font-semibold"
                : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : (
        <div className="flex flex-col gap-5">
          {filtered.map((e) => (
            <div key={e._id}
              className="border border-gray-800 rounded-xl p-6 bg-gray-900 hover:border-gray-600 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs uppercase tracking-widest text-gray-500">{e.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      e.status === "upcoming"
                        ? "bg-white text-black font-semibold"
                        : "bg-gray-800 text-gray-400"
                    }`}>{e.status}</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{e.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{e.description}</p>
                  <p className="text-gray-600 text-xs mt-3">
                    {new Date(e.date).toDateString()} {e.venue && `· ${e.venue}`}
                  </p>

                  {/* Only show for upcoming events */}
                  {e.status === "upcoming" && (
                    <div className="mt-4">
                      {user?.role === "student" ? (
                        registered[e._id] ? (
                          // Already registered — show badge, no button
                          <span className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-semibold">
                            ✓ Already Registered
                          </span>
                        ) : (
                          // Not yet registered — show button
                          <>
                            <button onClick={() => handleRegister(e._id)}
                              className="text-xs border border-gray-700 text-gray-300 hover:border-white hover:text-white px-4 py-2 rounded-lg transition-colors">
                              Register
                            </button>
                            {regError[e._id] && (
                              <p className="text-red-400 text-xs mt-2">{regError[e._id]}</p>
                            )}
                          </>
                        )
                      ) : user ? (
                        // Logged in but not a student
                        <p className="text-gray-600 text-xs">Only students can register for events</p>
                      ) : (
                        // Not logged in
                        <p className="text-gray-600 text-xs">
                          <a href="/login" className="text-gray-400 hover:text-white underline">Login</a> as a student to register
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-600 text-sm">No {filter} events found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;
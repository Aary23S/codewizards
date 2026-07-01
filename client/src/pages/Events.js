import { useEffect, useState } from "react";
import { getEvents, registerForEvent, getMyRegistrations } from "../services/api";
import { useAuth } from "../context/AuthContext";

const EventCard = ({ event, user, registered, regError, onRegister, index }) => (
  <div
    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
    style={{ transitionDelay: `${index * 60}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.28em] text-white/40">{event.type}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
            event.status === "upcoming" ? "bg-white text-black" : "bg-white/8 text-white/55"
          }`}>
            {event.status}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-white">{event.title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/60">{event.description}</p>
        <p className="mt-4 text-xs text-white/40">
          {new Date(event.date).toDateString()} {event.venue && `· ${event.venue}`}
        </p>
        {event.status === "upcoming" && (
          <div className="mt-5">
            {user?.role === "student" ? (
              registered[event._id] ? (
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black">
                  ✓ Already Registered
                </span>
              ) : (
                <>
                  <button
                    onClick={() => onRegister(event._id)}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
                  >
                    Register
                  </button>
                  {regError[event._id] && <p className="mt-2 text-xs text-red-400">{regError[event._id]}</p>}
                </>
              )
            ) : user ? (
              <p className="text-xs text-white/40">Only students can register for events</p>
            ) : (
              <p className="text-xs text-white/40">
                <a href="/login" className="text-white underline underline-offset-4">Login</a> as a student to register
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState({});
  const [regError, setRegError] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const evtRes = await getEvents();
        setEvents(evtRes.data.data);

        if (user?.role === "student") {
          const regRes = await getMyRegistrations();
          const alreadyRegistered = {};
          regRes.data.data.forEach((id) => {
            alreadyRegistered[id] = true;
          });
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

  const filtered = filter === "all" ? events : events.filter((event) => event.status === filter);

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-20">
      <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mb-10 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">What's Happening</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Events with a cleaner, editorial layout.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
          Everything still behaves the same. The presentation just feels less flat and more deliberate.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {["all", "upcoming", "completed"].map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${
              filter === value
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-white/45">Loading...</p>
      ) : filtered.length > 0 ? (
        <div className="flex flex-col gap-5">
          {filtered.map((event, index) => (
            <EventCard
              key={event._id}
              event={event}
              user={user}
              registered={registered}
              regError={regError}
              onRegister={handleRegister}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/55">
          No {filter} events found.
        </div>
      )}
    </div>
  );
};

export default Events;

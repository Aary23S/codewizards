// codewizards/client/src/pages/Events.js
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getEvents,
  registerForEvent,
  cancelEventRegistration,
  generateEventOTP,
  verifyEventOTP,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

const CertificateModal = ({ event, user, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const attendedDateStr = event.registration?.attendedAt
    ? new Date(event.registration.attendedAt).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#181206] to-[#0a0804] p-8 shadow-[0_0_80px_rgba(245,158,11,0.15)] text-center md:p-12 print:border-none print:bg-white print:text-black">
        {/* Certificate Frame */}
        <div className="absolute inset-4 rounded-2xl border border-amber-500/10 pointer-events-none print:hidden" />
        <div className="absolute inset-5 rounded-2xl border border-amber-500/5 pointer-events-none print:hidden" />

        {/* Certificate Content */}
        <div className="relative">
          {/* Logo / Emblem */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-amber-500/20 bg-black shadow-lg shadow-amber-500/10">
            <img src={logo} alt="CodeWizards Logo" className="h-full w-full object-cover" />
          </div>

          <p className="mt-8 font-serif text-xs uppercase tracking-[0.45em] text-amber-400">
            CodeWizards verified certificate
          </p>

          <h2 className="mt-4 font-serif text-3xl font-bold tracking-wide text-white print:text-black md:text-4xl">
            Certificate of Attendance
          </h2>

          <p className="mt-6 text-sm text-white/60 print:text-black/60">This is proudly presented to</p>

          <h3 className="mt-3 text-2xl font-semibold text-amber-200 print:text-black md:text-3xl">
            {user?.name || "Member"}
          </h3>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-white/70 print:text-black/70">
            for successfully participating in the CodeWizards event
            <span className="block mt-1 font-semibold text-white print:text-black">"{event.title}"</span>
            held on {new Date(event.date).toLocaleDateString()}.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-8 print:border-black/10">
            <div>
              <p className="font-serif text-sm font-semibold text-white/80 print:text-black/85">Mr. Somanath Salunkhe</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40 print:text-black/40">Faculty Co-ordinator</p>
            </div>
            <div>
              <p className="font-serif text-sm font-semibold text-white/80 print:text-black/85">Dr. Sangram Patil</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40 print:text-black/40">Director of Academics</p>
            </div>
          </div>

          <div className="mt-8 border-t border-amber-500/20 pt-6">
            <p className="text-[9px] text-white/35 print:text-black/35">
              Verified on {attendedDateStr}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="rounded-full bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventCard = ({
  event,
  user,
  onRegister,
  onCancel,
  onVerifyOtp,
  onGenerateOtp,
  index,
}) => {
  const [otpVal, setOtpVal] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [err, setErr] = useState("");

  const registrationStatus = event.registration?.status;
  const isRegistered = event.registration?.isRegistered;
  const registeredCount = event.registration?.registeredCount || 0;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otpVal.trim()) return;
    setVerifying(true);
    setErr("");
    try {
      await onVerifyOtp(event._id, otpVal);
    } catch (error) {
      setErr(error.response?.data?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const isUpcoming = event.status === "upcoming";

  return (
    <div
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex flex-col md:flex-row gap-6 items-start justify-between">
        {event.imageUrl && (
          <div className="h-40 w-full md:w-56 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.28em] text-white/40">{event.type}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${isUpcoming ? "bg-white text-black" : "bg-white/8 text-white/55"
                }`}
            >
              {event.status}
            </span>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              {registeredCount} Registered
            </span>
            {registrationStatus === "attended" && (
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                ✓ Attended
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-white line-clamp-2">{event.title}</h3>
          <p className="mt-3 text-sm leading-6 text-white/60 line-clamp-4">{event.description}</p>
          <p className="mt-4 text-xs text-white/40">
            {new Date(event.date).toDateString()} {event.venue && `· ${event.venue}`}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            {/* Admin Options */}
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-3 w-full">
                {isUpcoming && (
                  <button
                    onClick={() => onGenerateOtp(event._id)}
                    className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-400"
                  >
                    Generate Attendance OTP
                  </button>
                )}
                {isUpcoming && event.otpCode && (
                  <span className="rounded-2xl border border-dashed border-amber-500/50 bg-amber-500/10 px-3.5 py-2 text-xs font-mono text-amber-200">
                    OTP: {event.otpCode}
                  </span>
                )}
                <Link
                  to={`/events/${event._id}/registrations`}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  View Registrations
                </Link>
              </div>
            )}

            {/* Non-Admin User flows */}
            {!isAdmin && user && (
              <>
                {isUpcoming && (
                  <>
                    {registrationStatus === "registered" && (
                      <div className="flex flex-wrap items-center gap-4 w-full">
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-white/10 border border-white/5 px-3.5 py-2 text-xs font-semibold text-white">
                            ✓ Registered
                          </span>
                          <button
                            onClick={() => onCancel(event._id)}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>

                        {/* OTP attendance verification form */}
                        <form onSubmit={handleVerify} className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter Event OTP"
                            value={otpVal}
                            onChange={(e) => setOtpVal(e.target.value)}
                            className="w-32 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-center text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-500/50"
                          />
                          <button
                            type="submit"
                            disabled={verifying || otpVal.trim().length !== 6}
                            className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-400 disabled:opacity-50"
                          >
                            {verifying ? "Checking..." : "Verify Attendance"}
                          </button>
                          {err && <p className="text-xs text-rose-400 mt-1">{err}</p>}
                        </form>
                      </div>
                    )}

                    {registrationStatus === "attended" && (
                      <button
                        onClick={() => event.onViewCertificate(event)}
                        className="rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-2.5 text-xs font-bold text-black transition hover:brightness-110"
                      >
                        🎓 View Certificate
                      </button>
                    )}

                    {(registrationStatus === "cancelled" || !isRegistered) && (
                      <button
                        onClick={() => onRegister(event._id)}
                        className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                      >
                        Register
                      </button>
                    )}
                  </>
                )}

                {!isUpcoming && (
                  <>
                    {registrationStatus === "attended" ? (
                      <button
                        onClick={() => event.onViewCertificate(event)}
                        className="rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-2.5 text-xs font-bold text-black transition hover:brightness-110"
                      >
                        🎓 View Certificate
                      </button>
                    ) : (
                      <p className="text-xs text-white/35">Event has ended</p>
                    )}
                  </>
                )}
              </>
            )}

            {!user && isUpcoming && (
              <p className="text-xs text-white/40">
                <a href="/login" className="text-white underline underline-offset-4">Login</a> to register & verify attendance.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [activeCertEvent, setActiveCertEvent] = useState(null);

  const fetchAllEvents = async () => {
    try {
      const evtRes = await getEvents();
      setEvents(evtRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, [user]);

  const handleRegister = async (eventId) => {
    try {
      await registerForEvent(eventId);
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? {
              ...e,
              registration: {
                ...e.registration,
                isRegistered: true,
                status: "registered",
                registeredCount: (e.registration?.registeredCount || 0) + 1,
              },
            }
            : e
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleCancel = async (eventId) => {
    try {
      await cancelEventRegistration(eventId);
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? {
              ...e,
              registration: {
                ...e.registration,
                isRegistered: false,
                status: "cancelled",
                registeredCount: Math.max(0, (e.registration?.registeredCount || 1) - 1),
              },
            }
            : e
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed");
    }
  };

  const handleVerifyOtp = async (eventId, code) => {
    const res = await verifyEventOTP(eventId, code);
    alert("✓ Attendance Verified! Your certificate is now available and points have been awarded.");
    setEvents((prev) =>
      prev.map((e) =>
        e._id === eventId
          ? {
            ...e,
            registration: {
              ...e.registration,
              status: "attended",
              certificateHash: res.data.data.certificateHash,
              attendedAt: res.data.data.attendedAt,
            },
          }
          : e
      )
    );
  };

  const handleGenerateOtp = async (eventId) => {
    try {
      const res = await generateEventOTP(eventId);
      const { otpCode } = res.data.data;
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? {
              ...e,
              otpCode,
            }
            : e
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate OTP");
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
          Events with verified certification.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
          Attend workshops, verify your presence with OTP check-ins, and secure cryptographically verified certificates.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {["all", "upcoming", "completed"].map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${filter === value
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
          {filtered.map((event, index) => {
            // Bind view certificate action
            const eventWithAction = {
              ...event,
              onViewCertificate: (evt) => setActiveCertEvent(evt),
            };
            return (
              <EventCard
                key={event._id}
                event={eventWithAction}
                user={user}
                onRegister={handleRegister}
                onCancel={handleCancel}
                onVerifyOtp={handleVerifyOtp}
                onGenerateOtp={handleGenerateOtp}
                index={index}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-white/45">No events found.</p>
      )}

      {/* Certificate Modal Overlay */}
      {activeCertEvent && (
        <CertificateModal
          event={activeCertEvent}
          user={user}
          onClose={() => setActiveCertEvent(null)}
        />
      )}
    </div>
  );
};

export default Events;

// codewizards/client/src/pages/EventRegistrations.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEvent, getEventRegistrations } from "../services/api";

const EventRegistrations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [eventRes, regRes] = await Promise.all([
          getEvent(id),
          getEventRegistrations(id),
        ]);
        if (cancelled) return;
        setEvent(eventRes.data.data);
        setRegistrations(regRes.data.data || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) alert("Failed to load registrations or event info.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleExportCSV = () => {
    if (!event) return;
    const headers = ["Name", "Email", "Batch", "Status"];
    const rows = registrations.map((r) => [
      r.studentId?.name || "N/A",
      r.studentId?.email || "N/A",
      r.studentId?.batch || "N/A",
      r.status || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `registrations_${event.title.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredRegs = registrations.filter((r) => {
    const s = searchQuery.toLowerCase();
    const name = (r.studentId?.name || "").toLowerCase();
    const email = (r.studentId?.email || "").toLowerCase();
    const batch = String(r.studentId?.batch || "").toLowerCase();
    return name.includes(s) || email.includes(s) || batch.includes(s);
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-white/45">Loading registration details...</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-24 text-white">
      {/* Glow backgrounds */}
      <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <button
            onClick={() => navigate("/events")}
            className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-white/45 hover:text-white transition"
          >
            ← Back to Events
          </button>
          <span className="block text-xs uppercase tracking-[0.3em] text-cyan-400 font-semibold mb-2">
            Admin Management
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            {event?.title || "Event Registrations"}
          </h1>
          <p className="mt-3 text-sm text-white/60">
            {event ? `${new Date(event.date).toDateString()} · ${event.venue || "Online"}` : ""}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="Search by name, email, batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-full border border-white/10 bg-black/40 px-5 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 w-full sm:w-64"
          />
          <button
            onClick={handleExportCSV}
            disabled={registrations.length === 0}
            className="rounded-full bg-cyan-500 hover:bg-cyan-400 px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 disabled:shadow-none"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-[10px] uppercase tracking-widest text-white/45 font-semibold">Total Registered</p>
          <p className="text-2xl font-bold mt-1">{registrations.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-[10px] uppercase tracking-widest text-white/45 font-semibold">Checked-In</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">
            {registrations.filter((r) => r.status === "attended").length}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-[10px] uppercase tracking-widest text-white/45 font-semibold">Pending</p>
          <p className="text-2xl font-bold mt-1 text-sky-400">
            {registrations.filter((r) => r.status === "registered").length}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-[10px] uppercase tracking-widest text-white/45 font-semibold">Cancelled</p>
          <p className="text-2xl font-bold mt-1 text-white/30">
            {registrations.filter((r) => r.status === "cancelled").length}
          </p>
        </div>
      </div>

      {/* Table grid */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
        {filteredRegs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-white/80">
              <thead>
                <tr className="border-b border-white/10 bg-white/8 text-[10px] uppercase tracking-wider text-white/50">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Batch</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegs.map((reg) => (
                  <tr key={reg._id} className="border-b border-white/5 hover:bg-white/8 transition">
                    <td className="px-6 py-4 font-semibold text-white">{reg.studentId?.name || "N/A"}</td>
                    <td className="px-6 py-4 text-white/60">{reg.studentId?.email || "N/A"}</td>
                    <td className="px-6 py-4 text-white/60">{reg.studentId?.batch || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-bold ${
                        reg.status === "attended"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : reg.status === "registered"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "bg-white/5 text-white/45 border border-white/10"
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm text-white/45">No student registrations match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrations;

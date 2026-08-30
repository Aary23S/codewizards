// codewizards/client/src/pages/Contact.js
import { useEffect, useState } from "react";
import { getContact, sendContactMessage } from "../services/api";

const Contact = () => {
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  useEffect(() => {
    getContact().then((res) => setInfo(res.data.data)).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("sending");
    try {
      await sendContactMessage(form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err.response?.data?.message || "Could not send your message. Please try again.");
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-20">
      <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mb-12 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Get In Touch</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Contact, with the same visual system.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
          Contact details stay data-driven, while the layout gets a cleaner hierarchy and softer motion.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="group rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Reach Us</p>
          <ul className="mt-5 space-y-4 text-sm text-white/65">
            {info?.email && (
              <li>
                <a href={`mailto:${info.email}`} className="transition-colors hover:text-white">
                  {info.email}
                </a>
              </li>
            )}
            {info?.location && <li>{info.location}</li>}
            {info?.department && <li>{info.department}</li>}
          </ul>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Follow Us</p>
          <ul className="mt-5 space-y-4 text-sm">
            {info?.github && (
              <li>
                <a href={info.github} target="_blank" rel="noreferrer" className="text-white/65 transition-colors hover:text-white">
                  GitHub →
                </a>
              </li>
            )}
            {info?.linkedin && (
              <li>
                <a href={info.linkedin} target="_blank" rel="noreferrer" className="text-white/65 transition-colors hover:text-white">
                  LinkedIn →
                </a>
              </li>
            )}
            {info?.instagram && (
              <li>
                <a href={info.instagram} target="_blank" rel="noreferrer" className="text-white/65 transition-colors hover:text-white">
                  Instagram →
                </a>
              </li>
            )}
            {info?.twitter && (
              <li>
                <a href={info.twitter} target="_blank" rel="noreferrer" className="text-white/65 transition-colors hover:text-white">
                  Twitter →
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Send a Message</p>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />
          <textarea
            rows={5}
            name="message"
            placeholder="Your message..."
            value={form.message}
            onChange={handleChange}
            required
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none resize-none"
          />

          {status === "sent" && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              Message sent — we'll get back to you soon.
            </div>
          )}
          {status === "error" && (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-fit rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/90 disabled:opacity-50"
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;

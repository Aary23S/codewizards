const FormInput = ({ label, error, className = "", ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-[11px] uppercase tracking-[0.35em] text-white/50">
        {label}
      </label>
    )}
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition duration-200 ease-out focus:border-cyan-300/60 focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)] ${className}`}
    />
    {error && <p className="text-red-300 text-xs">{error}</p>}
  </div>
);

export default FormInput;

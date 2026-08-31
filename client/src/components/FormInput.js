import { useState } from "react";

const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
    {open ? (
      <>
        <path
          fill="currentColor"
          d="M12 5c5.25 0 9.7 3.24 11.49 7.79.12.31.12.65 0 .96C21.7 18.3 17.25 21.5 12 21.5S2.3 18.3.51 13.75a1.11 1.11 0 0 1 0-.96C2.3 8.24 6.75 5 12 5Zm0 2C7.93 7 4.33 9.45 2.74 12c1.59 2.55 5.19 5 9.26 5s7.67-2.45 9.26-5C19.67 9.45 16.07 7 12 7Zm0 1.8A3.2 3.2 0 1 1 12 15.2a3.2 3.2 0 0 1 0-6.4Zm0 2A1.2 1.2 0 1 0 12 13.2a1.2 1.2 0 0 0 0-2.4Z"
        />
      </>
    ) : (
      <>
        <path
          fill="currentColor"
          d="M4.22 3.28a1 1 0 0 0-1.44 1.44l2.02 2.02C2.44 8.87 1.2 11.4.51 13.15a1.11 1.11 0 0 0 0 .85C2.3 18.55 6.75 21.75 12 21.75c2.12 0 4.08-.43 5.82-1.18l1.96 1.96a1 1 0 1 0 1.44-1.44L4.22 3.28ZM12 7.25c4.07 0 7.67 2.45 9.26 5-1 1.59-2.68 3.27-4.9 4.28l-1.57-1.57A3.2 3.2 0 0 0 9.04 9.19L7.7 7.84A10.25 10.25 0 0 1 12 7.25ZM6.12 10.88l2.2 2.2A3.2 3.2 0 0 0 12 16.12c.38 0 .75-.07 1.09-.2l1.48 1.48c-1.04.24-2.28.35-3.57.35-4.07 0-7.67-2.45-9.26-5 .61-.98 1.51-2.04 2.38-2.87Z"
        />
      </>
    )}
  </svg>
);

const FormInput = ({ label, error, className = "", type = "text", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] uppercase tracking-[0.35em] text-white/50">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none transition duration-200 ease-out focus:border-cyan-300/60 focus:bg-white/8 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)] ${
            isPassword ? "pr-12" : ""
          } ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
};

export default FormInput;

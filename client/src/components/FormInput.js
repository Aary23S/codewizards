const FormInput = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs uppercase tracking-widest text-gray-500">{label}</label>
    )}
    <input
      {...props}
      className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
    />
    {error && <p className="text-red-400 text-xs">{error}</p>}
  </div>
);

export default FormInput;
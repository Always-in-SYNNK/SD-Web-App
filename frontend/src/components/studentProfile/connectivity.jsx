export function ConnectivitySection({ formData }) {
  return (
    <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm">
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-[#1b1c1c] mb-2">Connectivity</h3>
        <p className="text-gray-400 text-sm">Where should opportunities find you?</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
          <input
            type="email"
            value={formData.email ?? ""}
            readOnly
            placeholder="Loaded from your Google account"
            className="w-full bg-gray-100 border-none rounded-lg p-4 pl-12 text-gray-400 cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-gray-300">Email is set from your Google account and cannot be changed.</p>
      </div>
    </section>
  );
}
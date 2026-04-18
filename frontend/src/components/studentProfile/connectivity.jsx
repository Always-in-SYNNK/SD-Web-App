export function ConnectivitySection() {
  return (
    <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm">
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-[#1b1c1c] mb-2">Connectivity</h3>
        <p className="text-gray-400 text-sm">Where should opportunities find you?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
            <input
              type="email"
              placeholder="enter your email"
              className="w-full bg-gray-50 border-none rounded-lg p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Mobile Number</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
            <input
              type="tel"
              placeholder="enter your number"
              className="w-full bg-gray-50 border-none rounded-lg p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
            />
          </div>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">LinkedIn Profile URL</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔗</span>
            <input
              type="url"
              placeholder="linkedin.com/in/yourname"
              className="w-full bg-gray-50 border-none rounded-lg p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
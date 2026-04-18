export function PersonalInfoSection() {
  return (
    <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#3174b7]" />

      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <div className="relative group">
          <div className="w-32 h-32 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white">
            <span className="text-4xl">👤</span>
          </div>
          <button className="absolute -bottom-2 -right-2 bg-[#035b9d] text-white p-2 rounded-lg shadow-lg hover:scale-105 transition-transform text-xs">
            📷
          </button>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-[#1b1c1c] mb-2">Personal Identity</h3>
          <p className="text-gray-400 text-sm">Set the tone of your professional narrative. Your bio should reflect your ambition.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">First Name</label>
          <input
            type="text"
            placeholder="enter your first name"
            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Surname</label>
          <input
            type="text"
            placeholder="enter your surname"
            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Professional Headline</label>
          <input
            type="text"
            placeholder="e.g. Aspiring UI Architect & Tech Innovator"
            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Personal Bio</label>
          <textarea
            rows={4}
            placeholder="Tell us about your journey, your resilient spirit, and where you want to go..."
            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
          />
        </div>
      </div>
    </section>
  );
}
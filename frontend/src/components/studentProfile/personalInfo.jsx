export function PersonalInfoSection({ formData, setFormData }) {
  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#3174b7]" />

      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-[#1b1c1c] mb-2">Personal Identity</h3>
          <p className="text-gray-400 text-sm">Set the tone of your professional narrative.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">First Name</label>
          <input
            type="text"
            value={formData.full_name}
            onChange={set("full_name")}
            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Surname</label>
          <input
            type="text"
            value={formData.surname}
            onChange={set("surname")}
            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Personal Bio</label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={set("bio")}
            placeholder="Tell us about your journey..."
            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={set("location")}
            placeholder="e.g. Cape Town, Western Cape"
            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
          />
        </div>
      </div>
    </section>
  );
}
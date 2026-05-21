const LOCATION = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
  "Remote/Other",
];

export function PersonalInfoSection({ formData, setFormData }) {
  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#3174b7]" />

      <header className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <section className="flex-1">
          <h3 className="text-2xl font-bold text-[#1b1c1c] mb-2">Personal Identity</h3>
          <p className="text-gray-400 text-sm">Set the tone of your professional narrative.</p>
        </section>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400">First Name</legend>
          <input
            type="text"
            value={formData.full_name}
            onChange={set("full_name")}
            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
          />
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400">Surname</legend>
          <input
            type="text"
            value={formData.surname}
            onChange={set("surname")}
            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
          />
        </fieldset>
        <fieldset className="md:col-span-2 space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400">Personal Bio</legend>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={set("bio")}
            placeholder="Tell us about your journey..."
            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
          />
        </fieldset>
        <fieldset className="md:col-span-2 space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400">Location</legend>
          <label className="relative block">
            <select
              className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
              value={formData.location}
              onChange={set("location")}
            >
              <option value="">Select location...</option>
              {LOCATION.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </fieldset>
      </section>
    </section>
  );
}
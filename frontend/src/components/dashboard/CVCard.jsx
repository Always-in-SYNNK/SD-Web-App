export function CVCard({ cvUrl }) {
  if (!cvUrl) {
    return (
      <article className="bg-white p-8 rounded-xl shadow-sm flex items-center justify-between">
        <section className="flex items-center gap-4">
          <figure className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
            📄
          </figure>
          <figcaption>
            <h5 className="font-bold text-gray-900">CV / Resume currently uploaded</h5>
            <p className="text-sm text-gray-400">No CV uploaded yet</p>
          </figcaption>
        </section>
        <a
          href="/profile/edit"
          className="px-5 py-2 bg-[#035b9d] text-white rounded-full font-bold text-sm hover:opacity-90 transition"
        >
          Upload CV
        </a>
      </article>
    );
  }

  return (
    <article className="bg-white p-8 rounded-xl shadow-sm flex items-center justify-between">
      <section className="flex items-center gap-4">
        <figure className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">
          📄
        </figure>
        <figcaption>
          <h5 className="font-bold text-gray-900">CV / Resume</h5>
          <p className="text-sm text-green-600 font-semibold">✓ CV uploaded</p>
        </figcaption>
      </section>
      <a
        href={cvUrl}
        target="_blank"
        rel="noreferrer"
        className="px-5 py-2 bg-[#035b9d] text-white rounded-full font-bold text-sm hover:opacity-90 transition"
      >
        View CV
      </a>
    </article>
  );
}
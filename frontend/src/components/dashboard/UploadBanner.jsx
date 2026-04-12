export function UploadBanner() {
  return (
    <section className="bg-[#035b9d] text-white p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
      <article className="max-w-2xl">
        <h2 className="text-2xl font-bold mb-3">Expand Your Stage</h2>
        <p className="text-blue-100 text-sm leading-relaxed">
          Upload your latest NQF certifications or skill badges for rapid verification and portal
          indexing. Verified credentials enhance your matching score for premium opportunities.
        </p>
      </article>
      <label className="cursor-pointer w-full md:w-auto">
        <input type="file" className="hidden" />
        <aside className="px-8 py-6 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center space-y-2 hover:bg-blue-800 transition min-w-[240px]">
          <i className="text-3xl">📤</i>
          <strong className="font-bold text-sm">Drop PDF or Click to Upload</strong>
        </aside>
      </label>
    </section>
  );
}
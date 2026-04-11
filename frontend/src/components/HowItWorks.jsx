export function HowItWorks() {
  return (
    <section className="py-24 px-8 bg-gray-50 border-t border-gray-200">
      <article className="max-w-screen-xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-16">Engineered for Success</h2>
        <section className="grid md:grid-cols-4 gap-6">
          <article className="md:col-span-2 md:row-span-2 bg-white rounded-3xl border border-gray-200 p-10 flex flex-col justify-end min-h-[240px]">
            <small className="text-xs font-bold text-[#035b9d] uppercase tracking-widest">Step 01</small>
            <h3 className="text-2xl font-bold mt-2">Discovery & Audit</h3>
            <p className="text-gray-500 mt-2 leading-relaxed">
              We assess talent and ensure cultural and technical fit before any placement begins.
            </p>
          </article>
          <article className="bg-[#035b9d] text-white rounded-3xl p-8">
            <small className="text-xs uppercase opacity-60 tracking-widest">Step 02</small>
            <h3 className="text-lg font-bold mt-3">Accredited Upskilling</h3>
          </article>
          <article className="bg-green-600 text-white rounded-3xl p-8">
            <small className="text-xs uppercase opacity-60 tracking-widest">Step 03</small>
            <h3 className="text-lg font-bold mt-3">Verified Placement</h3>
          </article>
          <article className="md:col-span-2 bg-white rounded-3xl border border-gray-200 p-8 flex items-center gap-6">
            <i className="text-3xl">📊</i>
            <section>
              <h3 className="text-xl font-bold">Continuous Monitoring</h3>
              <p className="text-gray-500 mt-1">Ongoing support for long-term growth.</p>
            </section>
          </article>
        </section>
      </article>
    </section>
  );
}
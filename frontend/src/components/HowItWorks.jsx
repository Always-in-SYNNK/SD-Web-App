export function HowItWorks() {
  return (
    <section className="py-24 px-8 bg-gray-50 border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-16">Engineered for Success</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-2 md:row-span-2 bg-white rounded-3xl border border-gray-200 p-10 flex flex-col justify-end min-h-[240px]">
            <span className="text-xs font-bold text-[#035b9d] uppercase tracking-widest">Step 01</span>
            <h3 className="text-2xl font-bold mt-2">Discovery & Audit</h3>
            <p className="text-gray-500 mt-2 leading-relaxed">
              We assess talent and ensure cultural and technical fit before any placement begins.
            </p>
          </div>
          <div className="bg-[#035b9d] text-white rounded-3xl p-8">
            <span className="text-xs uppercase opacity-60 tracking-widest">Step 02</span>
            <h3 className="text-lg font-bold mt-3">Accredited Upskilling</h3>
          </div>
          <div className="bg-green-600 text-white rounded-3xl p-8">
            <span className="text-xs uppercase opacity-60 tracking-widest">Step 03</span>
            <h3 className="text-lg font-bold mt-3">Verified Placement</h3>
          </div>
          <div className="md:col-span-2 bg-white rounded-3xl border border-gray-200 p-8 flex items-center gap-6">
            <div className="text-3xl">📊</div>
            <div>
              <h3 className="text-xl font-bold">Continuous Monitoring</h3>
              <p className="text-gray-500 mt-1">Ongoing support for long-term growth.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
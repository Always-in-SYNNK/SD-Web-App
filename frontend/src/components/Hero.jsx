export function Hero() {
  return (
    <section className="px-8 pt-20 pb-32 max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-7 space-y-8">
        <div className="inline-flex px-4 py-2 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-widest">
          The Resilient Architect
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Designing the future of{" "}
          <span className="text-[#035b9d] italic">South African</span> potential.
        </h1>
        <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
          Tackling youth unemployment through architectural precision. We connect resilient talent
          with top-tier employers through a SETA-accredited ecosystem.
        </p>
        <div className="flex gap-4">
          <button className="px-8 py-3 rounded-full bg-[#035b9d] text-white font-semibold hover:opacity-90 transition">
            Start Your Journey
          </button>
          <button className="px-8 py-3 rounded-full border border-gray-300 font-semibold hover:bg-gray-50 transition">
            View Opportunities
          </button>
        </div>
      </div>
      <div className="lg:col-span-5">
        <img
          className="rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-300"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVZbDyZFaarIbwGTe-8mY4mAY2DZeTVFcSoEQ4tLwzuIX1ZGvwfAPDla0OwEnba-ycqWIt4ab5Sn3D-TVfE2trN85mro9SCfBpOtJkFl4T2EAo3BFN714WUvegHGIQGtUuHaiNSkjZoyMhQieuXXRnfKnb-PckK-X7TRoKwEZp2c34zAYvdJ24uMkVS9JSmofO6XlbiRD7lLIoaHS1llcecRXvV8inyyRZHYt6yG9AXUWoE28sdYNgHpa2tXwwuihR_fw-wGYim_8p"
          alt="professional"
        />
      </div>
    </section>
  );
}
//SD-Web-App/frontend/src/pages/Home.jsx
// frontend/src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// import SAMap from "../components/home/SAMap"; // Commented out - map section disabled

export default function Home() {
  const navigate = useNavigate();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const testimonials = [
    {
      name: "Thato Moloi",
      role: "Software Engineering Graduate",
      quote: "Through GrowthStageSA, I found an IT learnership that turned into a full-time role at a leading tech company in Cape Town. The platform changed my life!",
      rating: 5,
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    },
    {
      name: "Josh De Witt",
      role: "Finance Professional",
      quote: "The platform made it easy to find SETA-accredited finance programmes. I'm now a qualified accountant at a top firm in Johannesburg.",
      rating: 5,
      image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    },
    {
      name: "Naledi Khumalo",
      role: "Engineering Apprentice",
      quote: "Found a verified employer within weeks. The matching system actually works and helped me start my engineering career in Durban.",
      rating: 4,
      image: "https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    }
  ];

  return (
    <main className="bg-[#faf9f8] min-h-screen">
      {/* Navigation Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-50 h-20 flex items-center">
        <section className="flex justify-between items-center w-full px-8 h-20 max-w-[1280px] mx-auto">
          <p className="text-2xl font-extrabold text-[#004377]">GrowthStageSA</p>
          <nav className="hidden md:flex gap-8 items-center">
            <a href="/opportunities" className="text-[#414750] hover:text-[#f59e0b] transition-colors duration-200">Opportunities</a>
            <a href="/app-login" className="text-[#414750] hover:text-[#f59e0b] transition-colors duration-200">For Applicants</a>
            <a href="/prov-login" className="text-[#414750] hover:text-[#f59e0b] transition-colors duration-200">For Employers</a>
          </nav>
          <section className="flex gap-4">
            <button onClick={() => navigate("/app-login")} className="px-6 py-2 rounded-full text-sm font-semibold text-[#004377] border border-[#004377] hover:bg-[#d2e4ff] transition-colors">Login</button>
            <button onClick={() => navigate("/app-login")} className="px-6 py-2 rounded-full text-sm font-semibold bg-[#f59e0b] text-white hover:brightness-110 transition-all">Sign Up</button>
          </section>
        </section>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#fff7ed] to-white relative overflow-hidden">
        <section className="py-20 px-4 md:px-8 max-w-[1280px] mx-auto">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
            <section className="flex flex-col gap-4 relative">
              <section className="flex flex-wrap gap-2 mb-2">
                <p className="bg-white text-[#f59e0b] px-3 py-1 rounded-full text-xs font-semibold border border-[#f59e0b]/20 shadow-sm">SETA Accredited</p>
                <p className="bg-white text-[#f59e0b] px-3 py-1 rounded-full text-xs font-semibold border border-[#f59e0b]/20 shadow-sm">Verified Employers</p>
                <p className="bg-white text-[#f59e0b] px-3 py-1 rounded-full text-xs font-semibold border border-[#f59e0b]/20 shadow-sm">Growing Together</p>
              </section>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#004377] leading-tight">
                Your Gateway to Accredited <em className="text-[#f59e0b] not-italic">Learnerships</em> in South Africa
              </h1>
              <p className="text-lg text-[#414750] max-w-xl">Connect with SETA-accredited opportunities, build your skills, and launch your career. Employers, find verified talent ready to grow.</p>
              <section className="flex flex-wrap gap-4 mt-4">
                <button onClick={() => navigate("/opportunities")} className="px-8 py-4 rounded-full bg-[#004377] text-white font-semibold shadow-lg hover:brightness-110 transition-all hover:scale-105 transform duration-200">Find Opportunities</button>
                <button onClick={() => navigate("/prov-login")} className="px-8 py-4 rounded-full bg-[#f59e0b] text-white font-semibold shadow-lg hover:brightness-110 transition-all hover:scale-105 transform duration-200">Post a Learnership</button>
              </section>
            </section>
            <figure className="relative group">
              <section className="absolute inset-0 bg-[#f59e0b] rounded-xl rotate-3 scale-105 opacity-10 group-hover:rotate-1 transition-transform duration-500"></section>
              <img alt="South African professionals collaborating" className="relative w-full h-auto rounded-xl shadow-2xl object-cover border-4 border-white group-hover:scale-105 transition-transform duration-500" src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" />
            </figure>
          </section>
          <section className="mt-16 bg-white/80 backdrop-blur-sm rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center shadow-md border border-[#f59e0b]/10 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200">
            <section className="border-b md:border-b-0 md:border-r border-[#f59e0b]/10 pb-6 md:pb-0 hover:scale-105 transition-transform">
              <p className="text-3xl font-extrabold text-[#004377]">5,000+</p>
              <p className="text-sm font-semibold text-[#414750]">Active Learners</p>
            </section>
            <section className="border-b md:border-b-0 md:border-r border-[#f59e0b]/10 pb-6 md:pb-0 hover:scale-105 transition-transform">
              <p className="text-3xl font-extrabold text-[#f59e0b]">200+</p>
              <p className="text-sm font-semibold text-[#414750]">Employers</p>
            </section>
            <section className="hover:scale-105 transition-transform">
              <p className="text-3xl font-extrabold text-[#004377]">50+</p>
              <p className="text-sm font-semibold text-[#414750]">Accredited Partners</p>
            </section>
          </section>
        </section>
      </section>

      {/* What We Offer - Only 2 cards (Learners & Employers, no Partners) */}
      <section className="py-20 px-4 md:px-8 max-w-[1280px] mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">Find Your <strong className="text-[#f59e0b]">Path</strong> to Success</h2>
        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-100">Whether you're starting your career or building your team, we have the right solution for you.</p>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* For Learners */}
          <article className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center border border-[#004377]/10 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200">
            <section className="w-20 h-20 bg-[#d2e4ff] rounded-2xl flex items-center justify-center text-[#004377] mb-6 shadow-sm"><i className="material-symbols-outlined not-italic text-4xl">school</i></section>
            <h3 className="text-xl font-bold mb-4 text-[#004377]">For Learners</h3>
            <p className="text-gray-600 mb-8 flex-grow">Find your learnership from accredited options across various industries in South Africa.</p>
            <button onClick={() => navigate("/opportunities")} className="w-full py-3 rounded-full border-2 border-[#004377] text-[#004377] font-bold hover:bg-[#004377] hover:text-white transition-all hover:scale-105 transform">Browse Opportunities</button>
          </article>

          {/* For Employers */}
          <article className="bg-[#fff7ed] p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center border border-[#f59e0b]/10 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-300">
            <section className="w-20 h-20 bg-[#f59e0b] rounded-2xl flex items-center justify-center text-white mb-6 shadow-md"><i className="material-symbols-outlined not-italic text-4xl">corporate_fare</i></section>
            <h3 className="text-xl font-bold mb-4 text-[#004377]">For Employers</h3>
            <p className="text-gray-600 mb-8 flex-grow">Post learnership opportunities and find verified, ready-to-work South African talent.</p>
            <button onClick={() => navigate("/prov-login")} className="w-full py-3 rounded-full bg-[#f59e0b] text-white font-bold shadow-md hover:brightness-110 transition-all hover:scale-105 transform">Post a Learnership</button>
          </article>
        </section>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#fff7ed] px-4 md:px-8">
        <section className="max-w-[1280px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-[#004377] animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">What Our <strong className="text-[#f59e0b]">Community Says</strong></h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-100">Real stories from South Africans who transformed their careers</p>
          <section className="relative max-w-3xl mx-auto">
            <section className="bg-white rounded-2xl p-8 shadow-xl animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200">
              <section className="flex flex-col items-center text-center">
                <figure className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-[#f59e0b]"><img src={testimonials[activeTestimonial].image} alt={testimonials[activeTestimonial].name} className="w-full h-full object-cover" /></figure>
                <section className="flex gap-1 mb-3">{[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (<p key={i} className="text-[#f59e0b] text-xl">★</p>))}</section>
                <p className="text-gray-600 italic text-lg mb-6">"{testimonials[activeTestimonial].quote}"</p>
                <h3 className="font-bold text-xl text-[#004377]">{testimonials[activeTestimonial].name}</h3>
                <p className="text-[#f59e0b] text-sm">{testimonials[activeTestimonial].role}</p>
              </section>
            </section>
            <button onClick={() => setActiveTestimonial((activeTestimonial - 1 + testimonials.length) % testimonials.length)} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full p-2 shadow-lg hover:bg-[#f59e0b] hover:text-white transition-all"><i className="material-symbols-outlined">chevron_left</i></button>
            <button onClick={() => setActiveTestimonial((activeTestimonial + 1) % testimonials.length)} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full p-2 shadow-lg hover:bg-[#f59e0b] hover:text-white transition-all"><i className="material-symbols-outlined">chevron_right</i></button>
            <section className="flex justify-center gap-2 mt-6">{testimonials.map((_, index) => (<button key={index} onClick={() => setActiveTestimonial(index)} className={`w-2 h-2 rounded-full transition-all ${activeTestimonial === index ? "w-6 bg-[#f59e0b]" : "bg-gray-300"}`} />))}</section>
          </section>
        </section>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white px-4 md:px-8 relative">
        <section className="max-w-[1280px] mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-[#004377] animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">How <strong className="text-[#f59e0b]">GrowthStageSA</strong> Works</h2>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="flex flex-col items-center text-center animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-100">
              <section className="w-14 h-14 bg-[#f59e0b] text-white rounded-full flex items-center justify-center font-extrabold mb-6 shadow-lg border-4 border-white hover:scale-110 transition-transform">1</section>
              <h3 className="text-xl font-bold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">Sign up and build your profile. Add your NQF level, skills, and location.</p>
            </article>
            <article className="flex flex-col items-center text-center animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200">
              <section className="w-14 h-14 bg-[#004377] text-white rounded-full flex items-center justify-center font-extrabold mb-6 shadow-lg border-4 border-white hover:scale-110 transition-transform">2</section>
              <h3 className="text-xl font-bold mb-2">Discover Opportunities</h3>
              <p className="text-gray-600">Browse learnerships, internships, and apprenticeships that match your profile.</p>
            </article>
            <article className="flex flex-col items-center text-center animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-300">
              <section className="w-14 h-14 bg-[#f59e0b] text-white rounded-full flex items-center justify-center font-extrabold mb-6 shadow-lg border-4 border-white hover:scale-110 transition-transform">3</section>
              <h3 className="text-xl font-bold mb-2">Apply &amp; Track</h3>
              <p className="text-gray-600">Submit applications, track status, and receive notifications about deadlines.</p>
            </article>
          </section>
        </section>
      </section>

      {/* Trust Banner */}
      <section className="py-6 border-y border-gray-200 px-4 md:px-8 bg-white">
        <section className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center gap-4 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
          <p className="font-bold text-sm text-[#414750] shrink-0">Trusted by Leading Organisations Across South Africa:</p>
          <section className="flex flex-wrap justify-center gap-3">
            <p className="px-4 py-2 bg-white border border-[#f59e0b]/20 rounded-lg font-extrabold text-[#004377] shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">SETA</p>
            <p className="px-4 py-2 bg-white border border-[#f59e0b]/20 rounded-lg font-extrabold text-[#004377] shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">QCTO</p>
            <p className="px-4 py-2 bg-white border border-[#f59e0b]/20 rounded-lg font-extrabold text-[#004377] shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">DHET</p>
            <p className="px-4 py-2 bg-white border border-[#f59e0b]/20 rounded-lg font-extrabold text-[#004377] shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">MICT</p>
            <p className="px-4 py-2 bg-white border border-[#f59e0b]/20 rounded-lg font-extrabold text-[#004377] shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">Services SETA</p>
            <p className="px-4 py-2 bg-white border border-[#f59e0b]/20 rounded-lg font-extrabold text-[#004377] shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">FP&amp;M SETA</p>
          </section>
        </section>
      </section>

      {/* Stats Impact */}
      <section className="py-20 bg-[#004377] text-white px-4 md:px-8 relative overflow-hidden">
        <section className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 0)", backgroundSize: "24px 24px" }}></section>
        <section className="max-w-[1280px] mx-auto relative z-10">
          <header className="text-center mb-16 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Making a Difference in <strong className="text-[#f59e0b]">South Africa</strong></h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">Our contribution to national skills development and economic growth.</p>
          </header>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <article className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:scale-105 transition-all duration-300 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-100">
              <p className="text-3xl md:text-4xl mb-2 font-extrabold text-[#f59e0b]">25,000+</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Learners Placed</p>
            </article>
            <article className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:scale-105 transition-all duration-300 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200">
              <p className="text-3xl md:text-4xl mb-2 font-extrabold">500+</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Active Learnerships</p>
            </article>
            <article className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:scale-105 transition-all duration-300 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-300">
              <p className="text-3xl md:text-4xl mb-2 font-extrabold text-[#f59e0b]">200+</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Employer Partners</p>
            </article>
            <article className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:scale-105 transition-all duration-300 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-400">
              <p className="text-3xl md:text-4xl mb-2 font-extrabold">85%</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Learner Satisfaction</p>
            </article>
          </section>
        </section>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 md:px-8">
        <section className="max-w-[1000px] mx-auto bg-gradient-to-r from-[#004377] to-[#035b9d] rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
          <section className="absolute top-0 right-0 w-80 h-80 bg-[#f59e0b]/10 rounded-full -mr-40 -mt-40 blur-3xl"></section>
          <section className="absolute bottom-0 left-0 w-64 h-64 bg-[#d2e4ff]/10 rounded-full -ml-32 -mb-32 blur-3xl"></section>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 relative z-10">Ready to Start Your Journey?</h2>
          <p className="text-lg mb-8 opacity-90 relative z-10 max-w-2xl mx-auto">Join thousands of South Africans who have transformed their careers through GrowthStageSA.</p>
          <section className="flex flex-wrap gap-4 justify-center relative z-10">
            <button onClick={() => navigate("/opportunities")} className="px-8 py-4 rounded-full bg-[#f59e0b] text-white font-bold hover:brightness-110 transition-all hover:scale-105 transform shadow-lg">Find Opportunities</button>
            <button onClick={() => navigate("/prov-login")} className="px-8 py-4 rounded-full bg-white text-[#004377] font-bold hover:bg-gray-100 transition-all hover:scale-105 transform shadow-lg">Post a Learnership</button>
          </section>
        </section>
      </section>

      {showScrollButton && (
        <button onClick={scrollToTop} className="fixed bottom-8 right-8 bg-[#f59e0b] text-white p-3 rounded-full shadow-lg hover:bg-[#ea580c] transition-all z-50">
          <i className="material-symbols-outlined">arrow_upward</i>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-[#001c37] pt-12 pb-8 border-t-4 border-[#f59e0b]">
        <section className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full px-4 md:px-8 max-w-[1280px] mx-auto text-white">
          <section className="col-span-1 flex flex-col gap-4">
            <p className="text-xl font-extrabold text-white">GrowthStageSA</p>
            <p className="text-sm opacity-80">Connecting ambition with opportunity across South Africa.</p>
            <section className="flex gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f59e0b] transition-colors"><i className="material-symbols-outlined not-italic text-sm">public</i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f59e0b] transition-colors"><i className="material-symbols-outlined not-italic text-sm">share</i></a>
            </section>
          </section>
          <section>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-[#f59e0b]">Opportunities</h4>
            <ul className="flex flex-col gap-3 text-sm opacity-80">
              <li><a href="/opportunities" className="hover:text-[#f59e0b] transition-colors">Learnerships</a></li>
              <li><a href="/opportunities" className="hover:text-[#f59e0b] transition-colors">Skills Programs</a></li>
              <li><a href="/opportunities" className="hover:text-[#f59e0b] transition-colors">Internships</a></li>
              <li><a href="/opportunities" className="hover:text-[#f59e0b] transition-colors">Bursaries</a></li>
            </ul>
          </section>
          <section>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-[#f59e0b]">Employers</h4>
            <ul className="flex flex-col gap-3 text-sm opacity-80">
              <li><a href="/prov-login" className="hover:text-[#f59e0b] transition-colors">Partner With Us</a></li>
              <li><a href="/prov-login" className="hover:text-[#f59e0b] transition-colors">Employer FAQ</a></li>
              <li><a href="/prov-login" className="hover:text-[#f59e0b] transition-colors">Post a Learnership</a></li>
              <li><a href="#" className="hover:text-[#f59e0b] transition-colors">Success Stories</a></li>
            </ul>
          </section>
          <section>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-[#f59e0b]">Resources</h4>
            <ul className="flex flex-col gap-3 text-sm opacity-80">
              <li><a href="#" className="hover:text-[#f59e0b] transition-colors">Resource Library</a></li>
              <li><a href="#" className="hover:text-[#f59e0b] transition-colors">CV Guide</a></li>
              <li><a href="#" className="hover:text-[#f59e0b] transition-colors">Career Advice</a></li>
              <li><a href="#" className="hover:text-[#f59e0b] transition-colors">SETA Information</a></li>
            </ul>
          </section>
          <section>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-[#f59e0b]">Company</h4>
            <ul className="flex flex-col gap-3 text-sm opacity-80">
              <li><a href="#" className="hover:text-[#f59e0b] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#f59e0b] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#f59e0b] transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-[#f59e0b] transition-colors">POPIA Compliance</a></li>
            </ul>
          </section>
        </section>
        <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-6 border-t border-white/10 mt-6 text-center text-xs opacity-60">
          <p>© 2025 GrowthStageSA. All rights reserved. POPIA Compliant. Proudly South African. 🇿🇦</p>
        </section>
      </footer>
    </main>
  );
}
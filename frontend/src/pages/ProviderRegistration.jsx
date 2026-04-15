/**
 * ProviderRegistration
 * Step 2 of provider signup - collects company details after email verification
 * Uses same AuthLayout + AuthHeroPanel + AuthFormPanel as login
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeroPanel from "../components/auth/AuthHeroPanel";
import AuthFormPanel from "../components/auth/AuthFormPanel";

const HERO_IMAGE_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuDxNPyShfIjVGSg0JRX5t6gMdYfWSad3-JBDqPllih_qCrvQI6gj0CkdUZ6FgGjkbWALsM8D8lnpJO1k3L3CKiApnRUHx53SVp-w0qKYzGb0PiezwFvCvQAeJltcACD3F_sFQytmH-BXopRUBDOUUVkz1hGSOOgrpHiHmDCITIhPQiEUhAbAT-czEzzxCJDgArueKQb7uYLuYJEeNx5F4nfdPkhKG36Nyxhajn-jkyO7wFtuj5646YpTAbsvwzASsMdGHvTMJABHVqA";

export default function ProviderRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    regNumber: "",
    industry: "",
    contactPerson: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const checkPendingRegistration = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/auth/provider/pending-registration", {
          credentials: "include",
        });
        const data = await response.json();

        if (!data.success) {
          navigate("/prov-login");
          return;
        }

        setPendingEmail(data.data.email);
      } catch {
        navigate("/prov-login");
      }
    };

    checkPendingRegistration();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/auth/provider/complete-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          companyName: formData.companyName,
          industry: formData.industry,
          contactPerson: formData.contactPerson,
          phoneNumber: formData.phoneNumber,
          regNumber: formData.regNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("provider_user", JSON.stringify(data.user));
        navigate("/pipeline");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heroPanel={
        <AuthHeroPanel
          headline="Complete Your"
          accentLine="Employer Profile."
          backgroundImageUrl={HERO_IMAGE_URL}
          badges={[
            { icon: "verified", label: "VERIFIED EMAIL" },
            { icon: "business", label: "EMPLOYER REGISTRATION" },
          ]}
        />
      }
      formPanel={
        <AuthFormPanel onBack={() => navigate("/")}>
          <header className="text-center mb-8">
            <p className="text-sky-600 text-sm font-bold uppercase tracking-wider mb-2">
              Registration Phase 02
            </p>
            <h1 className="text-blue-950 text-3xl font-bold mb-2">
              Secure Your Professional Footprint
            </h1>
            <p className="text-slate-500 font-medium">
              Complete your employer profile
            </p>
          </header>

          {error && (
            <p className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center mb-6">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="max-w-md mx-auto w-full space-y-5">
            <section className="grid grid-cols-2 gap-4">
              <label className="block">
                <strong className="text-sm font-semibold text-slate-700 block mb-1">
                  Company Name <small className="text-red-500">*</small>
                </strong>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </label>

              <label className="block">
                <strong className="text-sm font-semibold text-slate-700 block mb-1">
                  Registration Number
                </strong>
                <input
                  type="text"
                  name="regNumber"
                  value={formData.regNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </label>
            </section>

            <label className="block">
              <strong className="text-sm font-semibold text-slate-700 block mb-1">
                Industry <small className="text-red-500">*</small>
              </strong>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-colors bg-white"
              >
                <option value="">Select industry...</option>
                <option value="technology">Technology & IT</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="finance">Finance & Banking</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education & Training</option>
                <option value="construction">Construction</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </label>

            <section className="grid grid-cols-2 gap-4">
              <label className="block">
                <strong className="text-sm font-semibold text-slate-700 block mb-1">
                  Contact Person <small className="text-red-500">*</small>
                </strong>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </label>

              <label className="block">
                <strong className="text-sm font-semibold text-slate-700 block mb-1">
                  Phone Number <small className="text-red-500">*</small>
                </strong>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </label>
            </section>

            <label className="block">
              <strong className="text-sm font-semibold text-slate-700 block mb-1">
                Work Email
              </strong>
              <input
                type="email"
                value={pendingEmail}
                readOnly
                disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
              />
            </label>

            <label className="flex items-start gap-3 mt-6">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <small className="text-xs text-slate-600 leading-relaxed">
                I agree to the <a href="/terms" className="text-sky-600 hover:underline">Terms and Conditions</a> and the processing of corporate data as defined in the <a href="/privacy" className="text-sky-600 hover:underline">Privacy Policy</a>.
              </small>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Register and Continue →"}
            </button>
          </form>
        </AuthFormPanel>
      }
    />
  );
}
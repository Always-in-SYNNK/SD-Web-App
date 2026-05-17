import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeroPanel from "../components/auth/AuthHeroPanel";
import AuthFormPanel from "../components/auth/AuthFormPanel";
import { getAllCountries } from "../services/countryService";

const HERO_IMAGE_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuDxNPyShfIjVGSg0JRX5t6gMdYfWSad3-JBDqPllih_qCrvQI6gj0CkdUZ6FgGjkbWALsM8D8lnpJO1k3L3CKiApnRUHx53SVp-w0qKYzGb0PiezwFvCvQAeJltcACD3F_sFQytmH-BXopRUBDOUUVkz1hGSOOgrpHiHmDCITIhPQiEUhAbAT-czEzzxCJDgArueKQb7uYLuYJEeNx5F4nfdPkhKG36Nyxhajn-jkyO7wFtuj5646YpTAbsvwzASsMdGHvTMJABHVqA";
const API_URL = import.meta.env.VITE_API_URL;

const ORGANISATION_TYPES = [
  "Private Company",
  "Training Organisation",
  "TVET College",
  "University",
  "NGO",
  "Government Department",
  "Other",
];

export default function ProviderRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [touched, setTouched] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    companyName: "",
    regNumber: "",
    organisationType: "",
    contactPerson: "",
    phoneNumber: "",
    countryCode: ""
  });

  const [errors, setErrors] = useState({});

  // Fetch countries from external API on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await getAllCountries();
        setCountries(countriesData);
        // Set default country to South Africa
        const southAfrica = countriesData.find(c => c.code === 'ZA');
        if (southAfrica) {
          setFormData(prev => ({ ...prev, countryCode: southAfrica.code }));
        }
      } catch (err) {
        console.error('Failed to load countries:', err);
      } finally {
        setCountriesLoading(false);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    const checkPendingRegistration = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/provider/pending-registration`, {
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

  const getSelectedCountry = () => {
    return countries.find(c => c.code === formData.countryCode);
  };

  // Validation Functions
  const validateCompanyName = (value) => {
    if (!value || !value.trim()) return "Company name is required";
    if (value.length < 2) return "Company name must be at least 2 characters";
    if (value.length > 100) return "Company name must be less than 100 characters";
    const validPattern = /^[a-zA-Z0-9\s&\-.''’]+$/;
    if (!validPattern.test(value)) return "Company name can only contain letters, numbers, spaces, &, -, ., '";
    return "";
  };

  const validateContactPerson = (value) => {
    if (!value || !value.trim()) return "Contact person name is required";
    if (value.length < 2) return "Name must be at least 2 characters";
    if (value.length > 50) return "Name must be less than 50 characters";
    const lettersOnly = /^[a-zA-Z\s\-'’]+$/;
    if (!lettersOnly.test(value)) return "Contact person name can only contain letters, spaces, hyphens, and apostrophes";
    return "";
  };

  const validatePhoneNumber = (value, country) => {
    if (!value || !value.trim()) return "Phone number is required";
    
    const numericOnly = value.replace(/\D/g, '');
    
    if (!country) return "Please select a country";
    
    if (numericOnly.length === 0) return "Phone number is required";
    
    // Most countries use 9-11 digits
    if (numericOnly.length < 8) {
      return `Phone number must have at least 8 digits (currently ${numericOnly.length})`;
    }
    if (numericOnly.length > 12) {
      return `Phone number must have at most 12 digits (currently ${numericOnly.length})`;
    }
    
    return "";
  };

  const validateOrganisationType = (value) => {
    if (!value) return "Organisation type selection is required";
    return "";
  };

  // Format phone number (add spaces every 3 digits)
  const formatPhoneNumber = (value) => {
    const numericOnly = value.replace(/\D/g, '');
    return numericOnly.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === "phoneNumber") {
      newValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let error = "";
    switch (field) {
      case "companyName":
        error = validateCompanyName(formData.companyName);
        break;
      case "contactPerson":
        error = validateContactPerson(formData.contactPerson);
        break;
      case "phoneNumber":
        error = validatePhoneNumber(formData.phoneNumber, getSelectedCountry());
        break;
      case "organisationType":
        error = validateOrganisationType(formData.organisationType);
        break;
      default:
        break;
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const getAllErrors = () => {
    const selectedCountry = getSelectedCountry();
    return {
      companyName: validateCompanyName(formData.companyName),
      contactPerson: validateContactPerson(formData.contactPerson),
      phoneNumber: validatePhoneNumber(formData.phoneNumber, selectedCountry),
      organisationType: validateOrganisationType(formData.organisationType)
    };
  };

  const isFormValid = () => {
    const validationErrors = getAllErrors();
    const hasErrors = Object.values(validationErrors).some(error => error);
    const hasRequiredFields = formData.companyName && formData.contactPerson && formData.phoneNumber && formData.organisationType && formData.countryCode;
    const isTermsAccepted = termsAccepted;
    
    return !hasErrors && hasRequiredFields && isTermsAccepted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    
    setTouched({
      companyName: true,
      contactPerson: true,
      phoneNumber: true,
      organisationType: true
    });
    
    const validationErrors = getAllErrors();
    setErrors(validationErrors);
    
    if (!isFormValid()) {
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setLoading(true);
    setError(null);

    const selectedCountry = getSelectedCountry();

    try {
      const response = await fetch(`${API_URL}/api/auth/provider/complete-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          companyName: formData.companyName,
          organisationType: formData.organisationType,
          contactPerson: formData.contactPerson,
          phoneNumber: formData.phoneNumber.replace(/\D/g, ''),
          countryCode: selectedCountry?.phone_code || '+27',
          countryName: selectedCountry?.name,
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

  if (countriesLoading) {
    return (
      <AuthLayout
        heroPanel={<AuthHeroPanel headline="Complete Your" accentLine="Employer Profile." backgroundImageUrl={HERO_IMAGE_URL} badges={[]} />}
        formPanel={
          <AuthFormPanel onBack={() => navigate("/")}>
            <p className="text-center py-12 text-gray-500">Loading countries...</p>
          </AuthFormPanel>
        }
      />
    );
  }

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

          <form onSubmit={handleSubmit} className="max-w-md mx-auto w-full" noValidate>
            <section className="grid grid-cols-2 gap-4 mb-4">
              <label className="block">
                <strong className="text-sm font-semibold text-slate-700 block mb-1">
                  Company Name <small className="text-red-500">*</small>
                </strong>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  onBlur={() => handleBlur("companyName")}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    touched.companyName && errors.companyName
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-sky-500"
                  } focus:outline-none focus:ring-2 focus:ring-sky-100`}
                />
                {touched.companyName && errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                )}
              </label>

              <label className="block">
                <strong className="text-sm font-semibold text-slate-700 block mb-1">
                  Registration Number <small className="text-gray-400">(optional)</small>
                </strong>
                <input
                  type="text"
                  name="regNumber"
                  value={formData.regNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </label>
            </section>

            <label className="block mb-4">
              <strong className="text-sm font-semibold text-slate-700 block mb-1">
                Organisation Type <small className="text-red-500">*</small>
              </strong>
              <select
                name="organisationType"
                value={formData.organisationType}
                onChange={handleChange}
                onBlur={() => handleBlur("organisationType")}
                className={`w-full px-4 py-3 rounded-xl border ${
                  touched.organisationType && errors.organisationType
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-sky-500"
                } focus:outline-none focus:ring-2 focus:ring-sky-100 bg-white`}
              >
                <option value="">Select organisation type...</option>
                {ORGANISATION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {touched.organisationType && errors.organisationType && (
                <p className="text-red-500 text-xs mt-1">{errors.organisationType}</p>
              )}
            </label>

            <label className="block mb-4">
              <strong className="text-sm font-semibold text-slate-700 block mb-1">
                Contact Person <small className="text-red-500">*</small>
              </strong>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                onBlur={() => handleBlur("contactPerson")}
                className={`w-full px-4 py-3 rounded-xl border ${
                  touched.contactPerson && errors.contactPerson
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-sky-500"
                } focus:outline-none focus:ring-2 focus:ring-sky-100`}
                placeholder="John Doe"
              />
              {touched.contactPerson && errors.contactPerson && (
                <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>
              )}
            </label>

            <section className="grid grid-cols-2 gap-4 mb-4">
              <label className="block">
                <strong className="text-sm font-semibold text-slate-700 block mb-1">
                  Country <small className="text-red-500">*</small>
                </strong>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 bg-white"
                >
                  <option value="">Select country...</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.phone_code})
                    </option>
                  ))}
                </select>
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
                  onBlur={() => handleBlur("phoneNumber")}
                  placeholder="Enter phone number"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    touched.phoneNumber && errors.phoneNumber
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-sky-500"
                  } focus:outline-none focus:ring-2 focus:ring-sky-100`}
                />
                {touched.phoneNumber && errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                )}
              </label>
            </section>

            <label className="block mb-4">
              <strong className="text-sm font-semibold text-slate-700 block mb-1">
                Work Email
              </strong>
              <input
                type="email"
                value={pendingEmail}
                readOnly
                disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-gray-400 text-xs mt-1">
                Email is verified and cannot be changed
              </p>
            </label>

            <label className="flex items-start gap-3 mt-6 mb-6">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <small className="text-xs text-slate-600 leading-relaxed">
                I agree to the <a href="/terms" className="text-sky-600 hover:underline">Terms and Conditions</a> and the processing of corporate data as defined in the <a href="/privacy" className="text-sky-600 hover:underline">Privacy Policy</a>. <small className="text-red-500">*</small>
              </small>
            </label>

            {attemptedSubmit && !termsAccepted && (
              <p className="text-red-500 text-xs text-center -mt-4 mb-4">
                You must agree to the Terms and Conditions to register
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Register and Continue →"}
            </button>
          </form>
        </AuthFormPanel>
      }
    />
  );
}
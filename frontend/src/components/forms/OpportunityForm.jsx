import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const OpportunityForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Get the logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    // 2. Get their profile row (profiles table)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      setError("Could not find your profile.");
      setLoading(false);
      return;
    }

    // 3. Get their provider_profile row (provider_profiles table)
    const { data: providerProfile, error: providerError } = await supabase
      .from("provider_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (providerError || !providerProfile) {
      setError("Only providers can post opportunities.");
      setLoading(false);
      return;
    }

    // 4. Insert into opportunities — status starts as 'pending' (pending admin approval)
    const { error: insertError } = await supabase
      .from("opportunities")
      .insert({
        provider_id: providerProfile.id,
        title: formData.title,
        location: formData.location,
        description: `[${formData.type}] ${formData.description}`, // type embedded until you add a column
        status: "pending", // ← matches your CHECK constraint
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg space-y-4 max-w-xl">
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-600">Submitted! Status: Pending Admin Approval</p>}

      <input name="title" placeholder="Job Title" onChange={handleChange}
        className="w-full border p-3 rounded" required />
      <input name="location" placeholder="Location" onChange={handleChange}
        className="w-full border p-3 rounded" />
      <select name="type" onChange={handleChange} className="w-full border p-3 rounded">
        <option>Full-time</option>
        <option>Part-time</option>
        <option>Hybrid</option>
      </select>
      <textarea name="description" placeholder="Job Description" onChange={handleChange}
        className="w-full border p-3 rounded" />

      <button type="submit" disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50">
        {loading ? "Submitting..." : "Submit Opportunity"}
      </button>
    </form>
  );
};

export default OpportunityForm;
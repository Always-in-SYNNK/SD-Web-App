// src/components/requirements/RequirementsForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import RoleSection from "../requirements/RoleSection";
import EducationSection, { NQF_MAP } from "../requirements/EducationSection";
import SkillsSection from "../requirements/SkillsSection";

const RequirementsForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formState, setFormState] = useState({
    role: "",
    objective: "",
    education: "Bachelors",
    skills: [],
  });

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const submitOpportunity = async () => {
    if (!formState.role.trim()) {
      setError("Role title is required.");
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Get logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    // 2. Get their profile
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

    // 3. Get their provider_profile
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

    // 4. Build description — include skills so they aren't lost
    const skillsText =
      formState.skills.length > 0
        ? `\n\nRequired Skills: ${formState.skills.join(", ")}`
        : "";
    const fullDescription = `${formState.objective}${skillsText}`;

    // 5. Insert the opportunity
    const { data: opportunity, error: oppError } = await supabase
      .from("opportunities")
      .insert({
        provider_id: providerProfile.id,
        title: formState.role,
        description: fullDescription,
        status: "pending",
      })
      .select()
      .single();

    if (oppError) {
      setError(oppError.message);
      setLoading(false);
      return;
    }

    // 6. Link qualifications that match the chosen NQF level
    const nqfLevel = NQF_MAP[formState.education];

    const { data: matchingQuals } = await supabase
      .from("qualifications")
      .select("qual_id")
      .eq("nqf_level", nqfLevel)
      .limit(5);

    if (matchingQuals && matchingQuals.length > 0) {
      const qualLinks = matchingQuals.map((q) => ({
        opportunity_id: opportunity.id,
        qualification_id: q.qual_id,
      }));
      await supabase.from("opportunity_qualifications").insert(qualLinks);
    }

    navigate("/pipeline");
    setLoading(false);
  };

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        submitOpportunity();
      }}
    >
      {error && (
        <p className="text-red-500 bg-red-50 p-3 rounded">{error}</p>
      )}

      <RoleSection
        role={formState.role}
        objective={formState.objective}
        onChange={handleChange}
      />
      <EducationSection value={formState.education} onChange={handleChange} />
      <SkillsSection skills={formState.skills} onChange={handleChange} />

      <nav className="flex justify-between bg-gray-100 p-6 rounded-lg">
        {/* Save Draft — inserts with status "pending" same as submit for now */}
        <button
          type="button"
          onClick={submitOpportunity}
          disabled={loading}
          className="text-gray-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Draft"}
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Initialize Pipeline"}
        </button>
      </nav>
    </form>
  );
};

export default RequirementsForm;
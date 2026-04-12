// src/components/requirements/RequirementsForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import RoleSection from "./RoleSection";
import EducationSection, { NQF_MAP } from "./EducationSection";
import SkillsSection from "./SkillsSection";

const RequirementsForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // All form state lifted here — passed down as props
  const [formState, setFormState] = useState({
    role: "",
    objective: "",
    education: "Bachelors",
    skills: [],
  });

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const submitOpportunity = async (asDraft = false) => {
    setLoading(true);
    setError(null);

    // Get logged-in user → profile → provider_profile (same chain as OpportunityForm)
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles").select("id").eq("user_id", user.id).single();
    const { data: providerProfile } = await supabase
      .from("provider_profiles").select("id").eq("profile_id", profile.id).single();

    if (!providerProfile) {
      setError("Provider profile not found.");
      setLoading(false);
      return;
    }

    const nqfLevel = NQF_MAP[formState.education];

    // Insert the opportunity — 'pending' means "pending admin approval"
    const { data: opportunity, error: oppError } = await supabase
      .from("opportunities")
      .insert({
        provider_id: providerProfile.id,
        title: formState.role,
        description: formState.objective,
        status: "pending",
      })
      .select()  // returns the created row with its new id
      .single();

    if (oppError) {
      setError(oppError.message);
      setLoading(false);
      return;
    }

    // Find a qualification that matches the NQF level selected
    // This links opportunity_qualifications → qualifications table
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

    // Navigate to validation pipeline after submit
    navigate("/validation-pipeline");
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {error && <p className="text-red-500">{error}</p>}

      <RoleSection
        role={formState.role}
        objective={formState.objective}
        onChange={handleChange}
      />
      <EducationSection value={formState.education} onChange={handleChange} />
      <SkillsSection skills={formState.skills} onChange={handleChange} />

      <div className="flex justify-between bg-gray-100 p-6 rounded-lg">
        <button
          onClick={() => submitOpportunity(true)}
          disabled={loading}
          className="text-gray-500 disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => submitOpportunity(false)}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Initialize Pipeline"}
        </button>
      </div>
    </div>
  );
};

export default RequirementsForm;
import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";

// Array of predefined fields/categories for skill selection
const FIELDS = [
  "Human and Social Studies",
  "Physical, Mathematical, Computer and Life Sciences",
  "Law, Military Science and Security",
  "Culture and Arts",
  "Manufacturing, Engineering and Technology",
  "Services",
  "Health Sciences and Social Services",
  "Business, Commerce and Management Studies",
  "Physical Planning and Construction",
  "Agriculture and Nature Conservation",
  "Education, Training and Development",
  "Communication Studies and Language",
];

// Main component for managing user skills
export function SkillsSection() {
  const { token } = useAuth();
  const API = import.meta.env.VITE_API_URL;

  // States
  const [selectedField, setSelectedField] = useState("");
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const fetchExistingSkills = async () => {
      try {
        //Fetch user profile
        const res = await fetch(`${API}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.profile?.applicant_profile_id) {
          // Fetch skills associated with the user's profile
          const skillsRes = await fetch(
            `${API}/api/skills/applicant/${data.profile.applicant_profile_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const skillsData = await skillsRes.json();
          if (skillsData.success && skillsData.applicantSkills) {
            // Transform skill data to consistent format
            const shaped = skillsData.applicantSkills.map((s) => ({
              id: s.skills_id ?? s.id,
              name: s.name ?? s.skill_name ?? `Skill ${s.skills_id}`,
            }));
            setSelectedSkills(shaped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch existing skills:", err);
      }
    };
    if (token) fetchExistingSkills();
  }, [API, token]);

  //fetch available skills when selected field changes
  useEffect(() => {
    if (!selectedField) {
      setAvailableSkills([]);
      return;
    }
    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        // Fetch skills for the selected field
        const res = await fetch(
          `${API}/api/skills/field/${encodeURIComponent(selectedField)}`
        );
        const data = await res.json();
        if (data.success) setAvailableSkills(data.data || []);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, [API, selectedField]);

  //add skill to skills list
  const addSkill = (skill) => {
    // check if skill is already in selected skills
    if (!selectedSkills.find((s) => s.id === skill.id)) {
      // add skill to the list
      setSelectedSkills((prev) => [...prev, skill]);
    }
  };

  //remove skill from skills list by filtering it out
  const removeSkill = (skillId) => {
    // filter out the skill with matching id
    setSelectedSkills((prev) => prev.filter((s) => s.id !== skillId));
  };

  //save selected skills to backend
  const saveSkills = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      //update user skills via API call
      const res = await fetch(`${API}/api/skills/applicant/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skillIds: selectedSkills.map((s) => s.id) }),
      });
      const data = await res.json();
      // check if save was successful
      if (data.success) {
        setSaveMessage("Skills saved successfully!");
      } else {
        setSaveMessage("Failed to save skills.");
      }
    } catch (err) {
      console.error("Failed to save skills:", err);
      setSaveMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm">
      <header className="mb-10">
        <h3 className="text-2xl font-bold text-[#1b1c1c] mb-2">Skills Vault</h3>
        <p className="text-gray-400 text-sm">
          Tag your core competencies and soft skills to stand out.
        </p>
      </header>

      <div className="space-y-8">

        {/* Display all skills that user has selected */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-4">
            Your Skills
          </label>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {/* show empty message if no skills, otherwise display them */}
            {selectedSkills.length === 0 ? (
              <p className="text-gray-300 text-sm">No skills added yet.</p>
            ) : (
              selectedSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-4 py-2 bg-blue-50 text-[#035b9d] font-bold rounded-full text-sm flex items-center gap-2"
                >
                  {skill.name}
                  {/* button to remove this skill */}
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="text-blue-300 hover:text-blue-600 text-xs"
                  >
                    ✕
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Field dropdown */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
            Browse by Field
          </label>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg text-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select a field...</option>
            {FIELDS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Available skills from selected field */}
        {selectedField && (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-4">
              Available Skills
            </label>
            {loadingSkills ? (
              <p className="text-gray-400 text-sm">Loading skills...</p>
            ) : availableSkills.length === 0 ? (
              <p className="text-gray-300 text-sm">No skills found for this field.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => {
                  // check if this skill is already selected
                  const already = selectedSkills.find((s) => s.id === skill.id);
                  // button is disabled if skill already selected, shows checkmark or plus sign
                  return (
                    <button
                      key={skill.id}
                      onClick={() => addSkill(skill)}
                      disabled={!!already}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        already
                          ? "bg-blue-50 text-[#035b9d] font-bold cursor-default"
                          : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
                      }`}
                    >
                      {skill.name} {already ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Save button */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={saveSkills}
            disabled={saving}
            className="px-6 py-2 bg-[#035b9d] text-white font-bold rounded-full text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Skills"}
          </button>
          {saveMessage && (
            <p className={`text-sm font-medium ${saveMessage.includes("success") ? "text-green-600" : "text-red-500"}`}>
              {saveMessage}
            </p>
          )}
        </div>

      </div>
    </section>
  );
}
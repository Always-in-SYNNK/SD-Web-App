import { useState } from "react";

const SKILLS = ["Python", "Public Speaking", "Data Analysis", "Leadership"];

export function SkillsSection() {
  const [skills, setSkills] = useState(["UI/UX Design", "Critical Thinking", "Project Management"]);

  const removeSkill = (skill) => setSkills((prev) => prev.filter((s) => s !== skill));
  const addSkill = (skill) => { if (!skills.includes(skill)) setSkills((prev) => [...prev, skill]); };

  return (
    <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm">
      <header className="mb-10">
        <h3 className="text-2xl font-bold text-[#1b1c1c] mb-2">Skills Vault</h3>
        <p className="text-gray-400 text-sm">Tag your core competencies and soft skills to stand out.</p>
      </header>

      <div className="space-y-8">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-4">Core Competencies</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="px-4 py-2 bg-blue-50 text-[#035b9d] font-bold rounded-full text-sm flex items-center gap-2">
                {skill}
                <button onClick={() => removeSkill(skill)} className="text-blue-300 hover:text-blue-600 text-xs">✕</button>
              </span>
            ))}
            <button className="px-4 py-2 border-2 border-dashed border-gray-200 text-gray-300 font-bold rounded-full text-sm hover:border-[#035b9d] hover:text-[#035b9d] transition-colors flex items-center gap-1">
              + Add Skill
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-4">Skills</label>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                className="px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm hover:bg-green-100 hover:text-green-700 transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
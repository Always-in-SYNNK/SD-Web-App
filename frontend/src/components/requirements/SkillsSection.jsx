import { useState } from "react";

const SkillsSection = () => {
  const [skills, setSkills] = useState([]);

  const addSkill = () => {
    const newSkill = prompt("Enter skill");
    if (newSkill) {
      setSkills([...skills, newSkill]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg">

      <h2 className="font-bold text-xl mb-4">Technical Skills</h2>

      {skills.map((skill, i) => (
        <div key={i} className="p-2 border rounded mb-2">
          {skill}
        </div>
      ))}

      <button onClick={addSkill} className="mt-4 border px-4 py-2 rounded">
        Add Skill
      </button>

      {/* 🔴 BACKEND:
          Save array of required skills
      */}
    </div>
  );
};

export default SkillsSection;
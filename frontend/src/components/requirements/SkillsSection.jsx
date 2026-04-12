// src/components/requirements/SkillsSection.jsx
import { useState } from "react";

const SkillsSection = ({ skills, onChange }) => {
  const [input, setInput] = useState("");

  const addSkill = () => {
    if (input.trim()) {
      onChange("skills", [...skills, input.trim()]);
      setInput("");
    }
  };

  const removeSkill = (i) => {
    onChange("skills", skills.filter((_, idx) => idx !== i));
  };

  return (
    <section className="bg-white p-6 rounded-lg">

      <h2 className="font-bold text-xl mb-4">Technical Skills</h2>
      {skills.map((skill, i) => (
        <article key={i} className="p-2 border rounded mb-2">
          {skill}
        </article>
      ))}
      <div className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
          placeholder="Type a skill and press Enter"
          className="flex-1 border p-2 rounded"
        />
        <button onClick={addSkill} className="border px-4 py-2 rounded">Add</button>
      </div>
    </section>
  );
};

export default SkillsSection;
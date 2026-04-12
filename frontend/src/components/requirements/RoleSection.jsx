// src/components/requirements/RoleSection.jsx
const RoleSection = ({ role, objective, onChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="font-bold text-xl mb-4">Role Architecture</h2>
      <input
        placeholder="Role Title"
        className="w-full border p-3 rounded mb-4"
        value={role}
        onChange={(e) => onChange("role", e.target.value)}
      />
      <textarea
        placeholder="Strategic Objective"
        className="w-full border p-3 rounded"
        value={objective}
        onChange={(e) => onChange("objective", e.target.value)}
      />
    </div>
  );
};

export default RoleSection;
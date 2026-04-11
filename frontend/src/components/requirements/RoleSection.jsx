import { useState } from "react";

const RoleSection = () => {
  const [role, setRole] = useState("");

  return (
    <div className="bg-white p-6 rounded-lg">

      <h2 className="font-bold text-xl mb-4">Role Architecture</h2>

      <input
        placeholder="Role Title"
        className="w-full border p-3 rounded mb-4"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      <textarea
        placeholder="Strategic Objective"
        className="w-full border p-3 rounded"
      />

      {/* 🔴 BACKEND NOTE:
          This data should be saved as part of job draft */}
    </div>
  );
};

export default RoleSection;
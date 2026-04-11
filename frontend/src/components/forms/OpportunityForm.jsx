import { useState } from "react";

const OpportunityForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Submitting:", formData);

    // 🔴 BACKEND NEEDED HERE
    // Send POST request to API
    // Example:
    // fetch("/api/opportunities", {
    //   method: "POST",
    //   body: JSON.stringify(formData)
    // })

    // 🔴 AFTER SUBMIT:
    // status should be "Pending Admin Approval"
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg space-y-4 max-w-xl">

      <input
        name="title"
        placeholder="Job Title"
        onChange={handleChange}
        className="w-full border p-3 rounded"
      />

      <input
        name="location"
        placeholder="Location"
        onChange={handleChange}
        className="w-full border p-3 rounded"
      />

      <select
        name="type"
        onChange={handleChange}
        className="w-full border p-3 rounded"
      >
        <option>Full-time</option>
        <option>Part-time</option>
        <option>Hybrid</option>
      </select>

      <textarea
        name="description"
        placeholder="Job Description"
        onChange={handleChange}
        className="w-full border p-3 rounded"
      />

      <button className="bg-blue-600 text-white px-6 py-2 rounded">
        Submit Opportunity
      </button>
    </form>
  );
};

export default OpportunityForm;
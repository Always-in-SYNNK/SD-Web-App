import RoleSection from "../requirements/RoleSection";
import EducationSection from "../requirements/EducationSection";
import SkillsSection from "../requirements/SkillsSection";

const RequirementsForm = () => {

  const handleSubmit = () => {
    // 🔴 BACKEND NEEDED HERE
    // POST /api/requirements
    // This should create a "draft opportunity"

    // 🔴 After submit:
    // Redirect to Validation Pipeline
  };

  return (
    <form className="space-y-8">

      <RoleSection />
      <EducationSection />
      <SkillsSection />

      <nav className="flex justify-between bg-gray-100 p-6 rounded-lg">
        <button className="text-gray-500">Save Draft</button>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Initialize Pipeline
        </button>
      </div>

    </div>
  );
};

export default RequirementsForm;
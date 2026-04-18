import { PersonalInfoSection } from "./personalInfo";
import { EducationSection } from "./education";
import { SkillsSection } from "./skills";
import { ConnectivitySection } from "./connectivity";
import { CVUploadSection } from "./cvUpload";

export function ProfileForm() {
  const handleSave = () => {
    // wire up your supabase save here
  };

  return (
    <div className="space-y-8">
      <PersonalInfoSection />
      <EducationSection />
      <SkillsSection />
      <ConnectivitySection />
      <CVUploadSection />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8">
        <button className="text-gray-400 font-bold hover:text-[#1b1c1c] transition-colors flex items-center gap-2">
          ← Save & Exit
        </button>
        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-12 py-5 bg-gradient-to-br from-[#035b9d] to-[#3174b7] text-white rounded-full font-bold text-lg shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Complete Profile
        </button>
      </div>
    </div>
  );
}
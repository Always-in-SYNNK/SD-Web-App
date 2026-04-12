// src/components/requirements/EducationSection.jsx
// NQF mapping matches your qualifications table's nqf_level column
const NQF_MAP = {
  "National Senior Certificate/ National Certificate Vocational": 4,
  "Higher Certificate /": 5,
  "Diploma": 6,
  "Bachelors": 7,
  
};

const EducationSection = ({ value, onChange }) => {
  return (
    <section className="bg-white p-6 rounded-lg">
      <h2 className="font-bold text-xl mb-4">Academic & Professional Standards</h2>
      <select
        className="w-full border p-3 rounded"
        value={value}
        onChange={(e) => onChange("education", e.target.value)}
      >
        <option value="National Senior Certificate">National Senior Certificate/NCV (NQF 4)</option>
        <option value="Higher Certificate">Higher Certificate (NQF 5)</option>
        <option value="Diploma">Diploma (NQF 6)</option>
        <option value="Bachelors">Bachelors (NQF 7)</option>
       
      </select>
    </section>
  );
};

export { NQF_MAP };
export default EducationSection;
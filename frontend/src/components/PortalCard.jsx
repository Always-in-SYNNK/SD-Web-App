import { useNavigate } from "react-router-dom";

export function PortalCard({ title, description, items, buttonText, accentColor }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (title === "Employer Portal") {
      navigate("/pipeline"); //provider login
    } else if (title === "Applicant Portal") {
      navigate("/app-login");
    }
  };

  return (
    <article className={`bg-white rounded-3xl border border-gray-200 border-t-4 p-10 flex flex-col justify-between shadow-sm ${accentColor}`}>
      
      <section>
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-gray-500 mb-6">{description}</p>

        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
              <strong className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                ✓
              </strong>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <button
        onClick={handleClick}
       className="mt-8 bg-[#035b9d] text-white py-3 rounded-full font-semibold hover:opacity-90 transition"
      >
        {buttonText}
      </button>

    </article>
  );
}
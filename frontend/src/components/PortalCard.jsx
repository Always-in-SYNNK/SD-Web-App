import { useNavigate } from "react-router-dom";

export function PortalCard({ title, description, items, buttonText, accentColor }) {
  const navigate = useNavigate(); // 🔑 navigation hook

  const handleClick = () => {
    // 👇 Only employer portal should navigate
    if (title === "Employer Portal") {
      navigate("/pipeline"); // goes to your system
    }

    // 🔴 BACKEND / FUTURE:
    // Could check user role here (student/employer)
  };

  return (
    <article className={`bg-white rounded-3xl border border-gray-200 border-t-4 p-10 flex flex-col justify-between shadow-sm ${accentColor}`}>
      <section>
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-gray-500 mb-6">{description}</p>

        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <button className="mt-8 bg-[#035b9d] text-white py-3 rounded-full font-semibold hover:opacity-90 transition">
        {buttonText}
      </button>
    </article>
  );
}
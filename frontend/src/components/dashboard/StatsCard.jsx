const StatsCard = ({ title, value, icon }) => {
  return (
    <article className="bg-gray-100 p-6 rounded-lg">
      <span className="material-symbols-outlined text-3xl">{icon}</span>
      <p className="text-sm mt-2">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </article>
  );
};

export default StatsCard;
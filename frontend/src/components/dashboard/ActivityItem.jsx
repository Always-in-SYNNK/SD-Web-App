const ActivityItem = ({ title, subtitle }) => {
  return (
    <article className="flex gap-3">
      <span className="w-2 h-2 bg-green-500 rounded-full mt-2"></span>
      <section>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </section>
    </article>
  );
};

export default ActivityItem;
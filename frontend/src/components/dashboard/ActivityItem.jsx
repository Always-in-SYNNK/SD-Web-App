const ActivityItem = ({ title, subtitle }) => {
  return (
    <article className="flex gap-3">
      <i className="w-2 h-2 bg-green-500 rounded-full mt-2 block"></i>
      <section>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </section>
    </article>
  );
};

export default ActivityItem;
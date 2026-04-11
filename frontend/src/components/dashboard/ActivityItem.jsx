const ActivityItem = ({ title, subtitle }) => {
  return (
    <div className="flex gap-3">
      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
      <div>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
};

export default ActivityItem;
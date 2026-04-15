export function OpportunityRow({ item }) {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-100 flex justify-between items-center hover:shadow-sm transition">
      <div className="flex-1">
        <h4 className="font-bold text-gray-900">{item.title}</h4>
        <p className="text-sm text-gray-500">{item.provider}</p>
      </div>
      <span className="text-sm text-gray-500 w-32 text-center">{item.type}</span>
      <span className={`text-sm font-semibold w-24 text-center ${
        item.status === "Live" ? "text-green-600" : "text-red-500"
      }`}>
        {item.status}
      </span>
      <div className="flex gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition font-bold">Edit</button>
        <button className="p-2 hover:bg-red-50 rounded-lg transition font-bold">Remove</button>
      </div>
    </div>
  );
}
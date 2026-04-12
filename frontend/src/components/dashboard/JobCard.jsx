const JobCard = ({ title, location, status }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow flex justify-between">
      
      <div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-gray-500">{location}</p>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold">{status}</p>
        <button className="mt-2 px-3 py-1 bg-blue-100 rounded">
          Manage
        </button>
      </div>

    </div>
  );
};

export default JobCard;
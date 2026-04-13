const JobCard = ({ title, location, status }) => {
  return (
    <article className="p-6 bg-white rounded-lg shadow flex justify-between">

      <section>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-gray-500">{location}</p>
      </section>

      <section className="text-right">
        <p className="text-sm font-bold">{status}</p>
        <button className="mt-2 px-3 py-1 bg-blue-100 rounded">
          Manage
        </button>
      </section>

    </article> 
  );
};

export default JobCard;
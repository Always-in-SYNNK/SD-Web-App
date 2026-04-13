const Topbar = () => {
  return (
    <header className="ml-72 h-16 flex items-center justify-between px-6 bg-white shadow">
      
      <input
        className="border rounded-full px-4 py-2 w-96"
        placeholder="Search roles..."
      />

      <section className="flex items-center gap-4">
        <i className="material-symbols-outlined">notifications</i>
        <i className="material-symbols-outlined">chat_bubble</i>

        <section>
          <p className="font-bold">Alex Thompson</p>
          <p className="text-xs text-gray-500">Talent Lead</p>
        </section>
      </section>
    </header>
  );
};

export default Topbar;
const Topbar = () => {
  return (
    <header className="ml-72 h-16 flex items-center justify-between px-6 bg-white shadow">
      
      <input
        className="border rounded-full px-4 py-2 w-96"
        placeholder="Search roles..."
      />

      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined">notifications</span>
        <span className="material-symbols-outlined">chat_bubble</span>

        <div>
          <p className="font-bold">Alex Thompson</p>
          <p className="text-xs text-gray-500">Talent Lead</p>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
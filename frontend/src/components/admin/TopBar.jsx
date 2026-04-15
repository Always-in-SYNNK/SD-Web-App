export function TopBar() {
  return (
    <header className="flex justify-between items-center px-8 py-4 w-full fixed top-0 left-0 bg-white z-40">
      <h1 className="text-xl font-bold">Editorial Empowerment</h1>
      <div className="flex gap-4 items-center">
        <input
          placeholder="Search live opportunities..."
          className="bg-gray-100 px-4 py-2 rounded-lg text-sm"
        />
        <button>🔔</button>
        <button>⚙️</button>
      </div>
    </header>
  );
}
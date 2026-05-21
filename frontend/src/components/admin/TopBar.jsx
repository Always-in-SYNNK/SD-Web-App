export function TopBar() {
  return (
    <header className="flex justify-between items-center px-8 py-4 w-full fixed top-0 left-0 bg-white z-40">
      <h1 className="text-xl font-bold">Editorial Empowerment</h1>
      <nav className="flex gap-4 items-center" aria-label="User tools">
        <label className="sr-only" htmlFor="search-input">Search live opportunities</label>
        <input
          id="search-input"
          type="search"
          placeholder="Search live opportunities..."
          className="bg-gray-100 px-4 py-2 rounded-lg text-sm"
        />
        <button aria-label="Notifications">🔔</button>
        <button aria-label="Settings">⚙️</button>
      </nav>
    </header>
  );
}
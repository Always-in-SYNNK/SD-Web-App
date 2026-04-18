// src/components/TestLogin.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ Correct import

export default function TestLogin() {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("Test123456!");
  const { signIn, signOut, user, profile, loading, isAdmin } = useAuth();

  const handleLogin = async () => {
    const { error } = await signIn(email, password);
    if (error) alert("Login failed: " + error.message);
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <aside className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 z-50">
        <p className="font-bold mb-2">Test Login Panel</p>
        <p className="text-sm text-gray-500">Loading...</p>
      </aside>
    );
  }

  return (
    <aside className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 z-50 min-w-[250px]">
      <h3 className="font-bold mb-2 text-sm">🛠 Test Login Panel</h3>

      {!user ? (
        <section className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border p-2 w-full rounded text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border p-2 w-full rounded text-sm"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full text-sm"
          >
            Login
          </button>
        </section>
      ) : (
        <section className="space-y-1">
          <p className="text-xs"><strong>Logged in as:</strong></p>
          <p className="text-xs text-gray-600">{user?.email || user?.email}</p>
          <p className="text-xs text-gray-600">
            Role: <strong>{profile?.role || role}</strong> | Admin:{" "}
            <strong>{isAdmin ? "✅ Yes" : "❌ No"}</strong>
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded w-full text-sm mt-2"
          >
            Logout
          </button>
        </section>
      )}
    </aside>
  );
}
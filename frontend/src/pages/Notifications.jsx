import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { Sidebar } from "../components/dashboard/Sidebar";
import { NotificationDropdown } from "../components/notifications/notificationDropdown";

export default function Notifications() {
  const { token } = useAuth();
  const API = import.meta.env.VITE_API_URL;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchNotifications();
  }, [token]);

  const markRead = async (id) => {
    try {
      await fetch(`${API}/api/notifications/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => markRead(n.id)));
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/notifications" />
      <section className="ml-64 min-h-screen w-full">

        <nav className="sticky top-0 z-50 flex items-center justify-between px-12 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <section className="flex items-center gap-6 text-sm font-medium">
            <a href="/" className="text-gray-400 hover:text-[#035b9d]">Home</a>
            <a href="/dashboard" className="text-gray-400 hover:text-[#035b9d]">Dashboard</a>
            <span className="text-[#035b9d] font-bold border-b-2 border-[#035b9d] pb-0.5">Notifications</span>
          </section>
          <section className="flex items-center gap-3">
            <NotificationDropdown />
            <button className="p-2 hover:bg-gray-100 rounded-full">❓</button>
          </section>
        </nav>

        <section className="p-12">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <small className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">Inbox</small>
              <h1 className="text-4xl font-extrabold text-[#1b1c1c] tracking-tight mt-1">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-6 py-2.5 border-2 border-[#035b9d] text-[#035b9d] rounded-full font-bold text-sm hover:bg-[#035b9d] hover:text-white transition"
              >
                Mark all as read
              </button>
            )}
          </header>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <section className="text-center py-24">
              <p className="text-4xl mb-4">🔔</p>
              <p className="text-gray-400 font-medium">No notifications yet</p>
              <p className="text-gray-300 text-sm mt-1">We'll let you know when something happens.</p>
            </section>
          ) : (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`flex gap-4 p-6 rounded-xl cursor-pointer border transition-all ${
                    !n.is_read
                      ? "bg-blue-50/50 border-blue-100 hover:bg-white hover:shadow-sm"
                      : "bg-white border-gray-100 hover:shadow-sm"
                  }`}
                >
                  <figure className="mt-1.5 shrink-0">
                    {!n.is_read
                      ? <mark className="w-2.5 h-2.5 rounded-full bg-[#035b9d] block not-italic" />
                      : <mark className="w-2.5 h-2.5 rounded-full bg-gray-200 block not-italic" />
                    }
                  </figure>
                  <section className="flex-1 min-w-0">
                    <strong className={`text-sm ${!n.is_read ? "font-bold text-[#1b1c1c]" : "font-medium text-gray-500"}`}>
                      {n.title}
                    </strong>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">{n.message}</p>
                    <time
                      dateTime={n.created_at}
                      className="text-xs text-gray-300 mt-2 uppercase tracking-wider font-semibold block"
                    >
                      {formatTime(n.created_at)}
                    </time>
                  </section>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
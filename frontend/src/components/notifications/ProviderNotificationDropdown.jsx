// src/components/ProviderNotificationDropdown.jsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

export function ProviderNotificationDropdown() {
  const { token } = useAuth() ?? {};
  const API = import.meta.env.VITE_API_URL;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Fetch notifications
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
  }, [token, API]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
      console.error("Failed to mark notification as read:", err);
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

  return (
    <section className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
      >
        🔔
        {unreadCount > 0 && (
          <mark className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#035b9d] text-white text-[10px] font-bold rounded-full flex items-center justify-center not-italic">
            {unreadCount}
          </mark>
        )}
      </button>

      {open && (
        <article className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-[#1b1c1c] text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#035b9d] font-semibold hover:underline"
              >
                Mark all as read
              </button>
            )}
          </header>

          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <li className="px-4 py-8 text-center text-gray-400 text-sm">
                Loading...
              </li>
            ) : notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-400 text-sm">
                No notifications yet
              </li>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !n.is_read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <figure className="mt-1.5 shrink-0">
                    {!n.is_read ? (
                      <mark className="w-2 h-2 rounded-full bg-[#035b9d] block not-italic" />
                    ) : (
                      <mark className="w-2 h-2 rounded-full bg-transparent block not-italic" />
                    )}
                  </figure>
                  <section className="flex-1 min-w-0">
                    <strong
                      className={`text-sm ${
                        !n.is_read
                          ? "font-bold text-[#1b1c1c]"
                          : "font-medium text-gray-500"
                      }`}
                    >
                      {n.title}
                    </strong>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <time
                      dateTime={n.created_at}
                      className="text-[10px] text-gray-300 mt-1 uppercase tracking-wider font-semibold block"
                    >
                      {formatTime(n.created_at)}
                    </time>
                  </section>
                </li>
              ))
            )}
          </ul>

          <footer className="px-4 py-3 border-t border-gray-100 text-center">
            <button
              onClick={() => {
                setOpen(false);
                navigate("/provider/notifications"); // adjust to your provider notifications page
              }}
              className="text-xs text-[#035b9d] font-semibold hover:underline"
            >
              View all notifications
            </button>
          </footer>
        </article>
      )}
    </section>
  );
}
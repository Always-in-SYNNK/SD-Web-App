// frontend/src/components/chat/AIChatWidget.jsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/useAuth";

export default function AIChatWidget() {
  const { user, token } = useAuth();  // ← Get token from useAuth
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log("🔵 AIChatWidget mounted, user:", user?.email);
    console.log("🔵 Token exists:", !!token);
  }, [user, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          role: "assistant", 
          content: "👋 Hi there! I'm GrowthStageSA's AI assistant. I can help you with:\n\n• Finding learnerships and internships\n• Understanding the application process\n• Navigating the platform\n• Answering questions about different industries\n\nWhat would you like to know?" 
        }
      ]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    console.log("🔵 Sending message:", input);
    console.log("🔵 Token available:", !!token);

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Use the token from useAuth instead of localStorage
      const authToken = token || localStorage.getItem("token");
      
      // CHANGED THIS LINE - Full URL instead of relative path
      console.log("🔵 Fetching: https://sd-web-app-ivao.onrender.com/api/chat/ask");
      
      // CHANGED THIS LINE - Full URL instead of relative path
      const response = await fetch("https://sd-web-app-ivao.onrender.com/api/chat/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ question: input })
      });

      console.log("🔵 Response status:", response.status);

      const data = await response.json();
      console.log("🔵 Response data:", data);
      
      if (data.success) {
        setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `Sorry, I'm having trouble right now. Error: ${data.error || "Unknown error"}` 
        }]);
      }
    } catch (error) {
      console.error("🔴 Chat fetch error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, something went wrong. Please check your connection and try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // For testing - remove the user check temporarily
  // if (!user) return null;

  return (
    <section className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <section className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 h-[520px] flex flex-col overflow-hidden border border-gray-200">
          <header className="bg-gradient-to-r from-[#035b9d] to-[#024a82] text-white p-4 flex justify-between items-center">
            <section>
              <h3 className="font-bold text-lg">GrowthStageSA Assistant</h3>
              <p className="text-xs opacity-80">Powered by AI • Always here to help</p>
            </section>
            <button onClick={() => setIsOpen(false)} className="text-white hover:opacity-80 transition">
              <i className="material-symbols-outlined">close</i>
            </button>
          </header>

          <section className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <article key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <section className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.role === "user" 
                    ? "bg-[#035b9d] text-white rounded-br-sm" 
                    : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </section>
              </article>
            ))}
            {isLoading && (
              <article className="flex justify-start">
                <section className="bg-white p-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <section className="flex gap-1">
                    <section className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></section>
                    <section className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></section>
                    <section className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></section>
                  </section>
                </section>
              </article>
            )}
            <section ref={messagesEndRef} />
          </section>

          <footer className="border-t border-gray-200 p-3 bg-white">
            <section className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[#035b9d] focus:ring-1 focus:ring-[#035b9d] text-sm"
                disabled={isLoading}
              />
              <button 
                onClick={sendMessage} 
                disabled={isLoading || !input.trim()}
                className="bg-[#035b9d] text-white p-2 rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#024a82] transition"
              >
                <i className="material-symbols-outlined text-sm">send</i>
              </button>
            </section>
            <p className="text-xs text-gray-400 mt-2 text-center">
              AI may make mistakes. Check important info.
            </p>
          </footer>
        </section>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-[#035b9d] to-[#024a82] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
        >
          <i className="material-symbols-outlined group-hover:scale-110 transition">chat</i>
          <span className="hidden md:inline text-sm font-medium">Ask AI</span>
        </button>
      )}
    </section>
  );
}
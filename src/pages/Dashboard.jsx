import { useState, useEffect, useRef, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { logout, user } = useContext(AuthContext);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("FORMAL");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);



  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await api.get("/threads");
        console.log("Threads response:", res.data);

        const threadsArray = Array.isArray(res.data) ? res.data : res.data.threads;

        const fetchedThreads = threadsArray.map(t => ({
          id: t.id,
          title: t.title,
          messages: t.messages.map(m => ({
            id: m.id,
            sender: (m.sender || "").trim().toUpperCase(),
            content: m.content
          }))
        }));

        setThreads(fetchedThreads);
        if (fetchedThreads.length > 0) setActiveThreadId(fetchedThreads[0].id);

      } catch (err) {
        console.error("Error fetching threads:", err);
      }
    };

    fetchThreads();
  }, [user]);

  const activeThread = threads.find(t => t.id === activeThreadId);
  const messages = activeThread?.messages || [];

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const createNewThread = async () => {
    try {
      const res = await api.post("/threads", { title: "New Thread" });
      const newThread = { id: res.data.id || Date.now(), title: "New Thread", messages: [] };
      setThreads(prev => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
    } catch (err) {
      console.error("Error creating thread:", err);
    }
  };

  const deleteThread = async (id) => {
    try {
      await api.delete(`/threads/${id}`);

      setThreads(prev => prev.filter(t => t.id !== id));

      if (id === activeThreadId && threads.length > 0) {
        setActiveThreadId(threads[0].id);
      }
    } catch (err) {
      console.error("Error deleting thread:", err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeThreadId) return;

    const userMessage = { id: Date.now(), sender: "USER", content: input };
    setThreads(prev =>
      prev.map(t =>
        t.id === activeThreadId
          ? { ...t, messages: [...t.messages, userMessage] }
          : t
      )
    );

    setInput("");
    setLoading(true);

    try {
      const res = await api.post(`/threads/${activeThreadId}/messages`, {
        threadId: activeThreadId,
        content: input,
        tone
      });

      console.log("API Response:", res.data);

      const aiContent = typeof res.data === "string" ? res.data : (res.data?.content || res.data?.message || "");
      const aiResponse = { id: Date.now() + 1, sender: "AI", content: aiContent };

      setThreads(prev =>
        prev.map(t =>
          t.id === activeThreadId
            ? { ...t, messages: [...t.messages, aiResponse] }
            : t
        )
      );

      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">


      <div className="w-72 bg-gray-800 text-white flex flex-col">
        <div className="p-3 border-b">
          <button onClick={createNewThread} className="bg-green-600 w-full p-2 rounded">
            + New Thread
          </button>
        </div>

        <div className="grow overflow-auto">
          {threads.map(thread => (
            <div
              key={thread.id}
              className={`p-3 flex justify-between items-center border-b cursor-pointer ${activeThreadId === thread.id ? "bg-gray-700" : ""}`}
            >
              <span onClick={() => setActiveThreadId(thread.id)} className="grow">
                {thread.title}
              </span>
              <button onClick={() => deleteThread(thread.id)} className="text-amber-50 ms-2">✕</button>
            </div>
          ))}
        </div>

        <button onClick={handleLogout} className="bg-red-700 m-3 p-2 rounded">
          Logout
        </button>
      </div>


      <div className="flex-1 flex flex-col text-white bg-gray-950">
        <h2 className="text-center p-3">AI Email Assistant</h2>


        <div className="grow p-4 overflow-auto">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex mb-4 ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[65%] shadow
          ${msg.sender === "USER"
                    ? "bg-green-600 text-white "
                    : "bg-blue-700 text-gray-100"
                  }`}
              >
                {(msg.content || "").split("\n").map((line, i) => (
                  <p key={i} className="text-sm leading-relaxed">{line}</p>
                ))}

                {msg.sender === "AI" && (
                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="btn btn-sm mt-3"
                    style={{ fontSize: "12px", cursor: "pointer", backgroundColor: "lightblue", color: "black" }}
                  >
                    {copiedId === msg.id ? " Copied " : "Copy to Clipboard"}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && <p>AI is generating...</p>}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t flex gap-2">
          <select className="form-select w-auto" value={tone} onChange={e => setTone(e.target.value)}>
            <option value="FORMAL">Formal</option>
            <option value="CASUAL">Concise</option>
            <option value="FRIENDLY">Friendly</option>
            <option value="EMPATHEIC">Empathetic</option>
            <option value="ENTHUSIASTIC">Enthusiastic</option>
            <option value="PROFESSIONAL">Professional</option>
          </select>

          <input
            type="text"
            className="form-control"
            placeholder="Type message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />

          <button onClick={sendMessage} disabled={loading} className="btn btn-primary">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
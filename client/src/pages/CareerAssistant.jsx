
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/ai";
const CHATS_URL = "http://localhost:5000/api/chats";

const welcomeMessage = {
  role: "assistant",
  content:
    "Hi! 👋 I'm your CareerPilot Career Assistant. I can help you explore career paths, learn technical skills, prepare for interviews, and plan your next steps. What would you like help with?",
};

const suggestions = [
  "How can I become a frontend developer?",
  "Help me prepare for a job interview.",
  "Create a roadmap to learn full-stack development.",
  "How can I improve my resume and skills?",
];

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.detail || "The request failed."
    );
  }

  return data;
}

export default function CareerAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([welcomeMessage]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [switchingChat, setSwitchingChat] = useState(false);
  const [error, setError] = useState("");

  // Load the user's saved conversations when the page opens.
  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const data = await apiRequest(CHATS_URL);
        const savedChats = data.chats || [];

        if (cancelled) return;

        setChats(savedChats);

        if (savedChats.length > 0) {
          const firstChat = await apiRequest(
            `${CHATS_URL}/${savedChats[0]._id}`
          );

          if (cancelled) return;

          setActiveChatId(firstChat.chat._id);
          setMessages(
            firstChat.chat.messages?.length
              ? firstChat.chat.messages
              : [welcomeMessage]
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Could not load chat history. Please log in again if needed."
          );
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshChats() {
    const data = await apiRequest(CHATS_URL);
    setChats(data.chats || []);
  }

  async function startNewChat() {
    if (loading || initializing || switchingChat) return;

    setError("");
    setSwitchingChat(true);

    try {
      const data = await apiRequest(CHATS_URL, {
        method: "POST",
        body: JSON.stringify({ title: "New Career Chat" }),
      });

      setActiveChatId(data.chat._id);
      setMessages([welcomeMessage]);
      await refreshChats();
    } catch (err) {
      setError(err.message || "Could not create a new chat.");
    } finally {
      setSwitchingChat(false);
    }
  }

  async function openChat(chatId) {
    if (
      loading ||
      initializing ||
      switchingChat ||
      chatId === activeChatId
    ) {
      return;
    }

    setError("");
    setSwitchingChat(true);

    try {
      const data = await apiRequest(`${CHATS_URL}/${chatId}`);

      setActiveChatId(data.chat._id);
      setMessages(
        data.chat.messages?.length
          ? data.chat.messages
          : [welcomeMessage]
      );
    } catch (err) {
      setError(err.message || "Could not open this conversation.");
    } finally {
      setSwitchingChat(false);
    }
  }

  async function deleteChat(chatId) {
    if (loading || switchingChat) return;

    const confirmed = window.confirm(
      "Delete this conversation permanently?"
    );

    if (!confirmed) return;

    setError("");

    try {
      await apiRequest(`${CHATS_URL}/${chatId}`, {
        method: "DELETE",
      });

      const remainingChats = chats.filter(
        (chat) => chat._id !== chatId
      );

      setChats(remainingChats);

      if (activeChatId === chatId) {
        if (remainingChats.length > 0) {
          await openChat(remainingChats[0]._id);
        } else {
          setActiveChatId(null);
          setMessages([welcomeMessage]);
        }
      }
    } catch (err) {
      setError(err.message || "Could not delete this conversation.");
    }
  }

  async function sendMessage(event) {
    event?.preventDefault();

    const text = question.trim();

    if (!text || loading || initializing || switchingChat) return;

    setError("");
    setQuestion("");
    setLoading(true);

    const previousMessages = messages;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: text },
    ]);

    let chatId = activeChatId;

    try {
      // Create a database conversation when the first message is sent.
      if (!chatId) {
        const created = await apiRequest(CHATS_URL, {
          method: "POST",
          body: JSON.stringify({ title: text.slice(0, 100) }),
        });

        chatId = created.chat._id;
        setActiveChatId(chatId);
      }

      // Keep the existing Gemini-powered assistant endpoint.
      const data = await apiRequest(`${API_URL}/chat`, {
        method: "POST",
        body: JSON.stringify({
          message: text,
          history: previousMessages.map((item) => ({
            role: item.role,
            content: item.content,
          })),
        }),
      });

      const reply =
        data.reply ||
        data.response ||
        data.answer ||
        data.message;

      if (typeof reply !== "string" || !reply.trim()) {
        throw new Error("The assistant returned an empty response.");
      }

      // Display the answer, then persist the complete exchange.
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: reply },
      ]);

      try {
        await apiRequest(`${CHATS_URL}/${chatId}/messages`, {
          method: "POST",
          body: JSON.stringify({
            userMessage: text,
            assistantMessage: reply,
          }),
        });

        await refreshChats();
      } catch (saveError) {
        setError(
          `Your AI reply was generated, but saving failed: ${saveError.message}`
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the assistant. Please try again."
      );

      // Remove the unsent user message if the AI request failed.
      setMessages((previous) =>
        previous.filter(
          (item, index) =>
            !(index === previous.length - 1 &&
              item.role === "user" &&
              item.content === text)
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link to="/dashboard" className="text-xl font-bold sm:text-2xl">
            Career<span className="text-teal-400">Pilot</span>
          </Link>

          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-purple-400">
            Your personal career guide
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            AI Career Assistant
          </h1>

          <p className="mt-3 text-slate-400">
            Ask questions about careers, technical skills, learning roadmaps,
            resumes, and interviews.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Saved conversation history */}
          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-semibold">Chat history</h2>

              <button
                type="button"
                onClick={startNewChat}
                disabled={loading || initializing || switchingChat}
                className="rounded-lg bg-purple-500 px-3 py-2 text-sm font-semibold hover:bg-purple-400 disabled:opacity-50"
              >
                + New
              </button>
            </div>

            {initializing ? (
              <p className="text-sm text-slate-400">
                Loading conversations...
              </p>
            ) : chats.length === 0 ? (
              <p className="text-sm leading-6 text-slate-400">
                No saved conversations yet. Send a message to start one.
              </p>
            ) : (
              <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`flex items-start gap-2 rounded-xl border p-2 ${
                      activeChatId === chat._id
                        ? "border-purple-400/60 bg-purple-400/10"
                        : "border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openChat(chat._id)}
                      disabled={loading || switchingChat}
                      className="min-w-0 flex-1 break-words py-1 text-left text-sm text-slate-200 disabled:opacity-50"
                    >
                      {chat.title || "New Career Chat"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteChat(chat._id)}
                      disabled={loading || switchingChat}
                      aria-label={`Delete ${chat.title || "conversation"}`}
                      title="Delete conversation"
                      className="rounded px-2 py-1 text-slate-500 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {switchingChat && (
              <p className="mt-3 text-xs text-purple-300">
                Opening conversation...
              </p>
            )}
          </aside>

          {/* Existing AI assistant */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-800 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-400/10 text-xl text-purple-400">
                ✦
              </div>

              <div>
                <h2 className="font-semibold">CareerPilot Assistant</h2>
                <p className="text-xs text-emerald-400">
                  AI career guidance · Saved chat history
                </p>
              </div>
            </div>

            <div
              className="flex min-h-80 max-h-[55vh] flex-col gap-4 overflow-y-auto p-4 sm:p-6"
              aria-live="polite"
            >
              {messages.map((message, index) => (
                <div
                  key={`${message._id || message.role}-${index}`}
                  className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[80%] ${
                    message.role === "user"
                      ? "self-end bg-teal-500 text-slate-950"
                      : "self-start border border-slate-700 bg-slate-800 text-slate-100"
                  }`}
                >
                  {message.content}
                </div>
              ))}

              {loading && (
                <div className="self-start rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-purple-300">
                  Thinking...
                </div>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="mx-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <div className="border-t border-slate-800 p-4 sm:p-6">
              <p className="mb-3 text-xs font-medium text-slate-400">
                TRY ASKING
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={loading || initializing || switchingChat}
                    onClick={() => setQuestion(suggestion)}
                    className="rounded-full border border-slate-700 px-3 py-2 text-left text-xs text-slate-300 transition hover:border-purple-400 hover:text-purple-300 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  maxLength={10000}
                  placeholder="Ask about your career..."
                  aria-label="Your career question"
                  disabled={initializing || switchingChat}
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-purple-400 disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    initializing ||
                    switchingChat ||
                    !question.trim()
                  }
                  className="rounded-xl bg-purple-500 px-4 py-3 font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </form>

              <p className="mt-3 text-xs text-slate-500">
                Career guidance is informational. Verify important career
                decisions with trusted sources.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

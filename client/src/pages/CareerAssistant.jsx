
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai`;
const CHATS_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/chats`;

const welcomeMessage = {
  role: "assistant",
  content:
    "Hi! 👋 I'm your CareerPilot Career Assistant. I can help you explore career paths, learn technical skills, prepare for interviews, and plan your next steps. What would you like help with?",
};

const suggestions = [
  {
    title: "Become a frontend developer",
    description: "Build a learning roadmap",
    icon: "⌘",
    prompt: "How can I become a frontend developer?",
  },
  {
    title: "Prepare for interviews",
    description: "Practice common questions",
    icon: "✦",
    prompt: "Help me prepare for a job interview.",
  },
  {
    title: "Learn full-stack development",
    description: "Plan your technical skills",
    icon: "⌘",
    prompt: "Create a roadmap to learn full-stack development.",
  },
  {
    title: "Improve my resume",
    description: "Strengthen your profile",
    icon: "↗",
    prompt: "How can I improve my resume and skills?",
  },
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
    throw new Error(data.message || data.detail || "The request failed.");
  }

  return data;
}

function Icon({ name, className = "h-5 w-5" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    chat: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="m19 6-1 14H6L5 6" />
        <path d="M10 11v5M14 11v5" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" />
        <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      </>
    ),
    arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
    back: <path d="m15 18-6-6 6-6" />,
    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.sparkles}</svg>;
}

function AssistantAvatar({ small = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-500/20 to-sky-400/10 text-violet-200 ${
        small ? "h-8 w-8 rounded-xl" : "h-11 w-11"
      }`}
    >
      <Icon
        name="sparkles"
        className={small ? "h-4 w-4" : "h-5 w-5"}
      />
    </div>
  );
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const questionInputRef = useRef(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

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
      setSidebarOpen(false);
      questionInputRef.current?.focus();
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
      setSidebarOpen(false);
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
          const nextChat = await apiRequest(
            `${CHATS_URL}/${remainingChats[0]._id}`
          );

          setActiveChatId(nextChat.chat._id);
          setMessages(
            nextChat.chat.messages?.length
              ? nextChat.chat.messages
              : [welcomeMessage]
          );
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

    if (!text || loading || initializing || switchingChat) {
      return;
    }

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
      if (!chatId) {
        const created = await apiRequest(CHATS_URL, {
          method: "POST",
          body: JSON.stringify({ title: text.slice(0, 100) }),
        });

        chatId = created.chat._id;
        setActiveChatId(chatId);
      }

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

      setMessages((previous) => {
        const lastMessage = previous[previous.length - 1];

        if (
          lastMessage?.role === "user" &&
          lastMessage.content === text
        ) {
          return previous.slice(0, -1);
        }

        return previous;
      });

      setQuestion(text);
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || initializing || switchingChat;

  return (
    <div className="min-h-screen bg-[#080b16] text-white">
      <main className="mx-auto max-w-[1600px] px-4 pt-2 pb-5 sm:px-6 sm:pt-3 sm:pb-7 lg:px-8">
      
{/* Back to Dashboard — visible on all screen sizes */}
<div className="mb-3 flex justify-end">
  <Link
    to="/dashboard"
    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/50"
  >
    <Icon name="back" className="h-4 w-4" />
    Back to Dashboard
  </Link>
</div>

        {/* Page title */}
        <div className="mb-5">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Your personal career guide
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            AI Career Assistant
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Get guidance on career paths, technical skills, learning
            roadmaps, resumes, and interviews — all in one place.
          </p>
        </div>

        <div className="relative grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Mobile sidebar backdrop */}
          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close chat history"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            />
          )}

          {/* Conversation sidebar */}
          <aside
            className={`${
              sidebarOpen
                ? "fixed inset-y-0 left-0 z-40 flex"
                : "hidden"
            } top-auto h-full max-h-screen w-[min(85vw,320px)] flex-col overflow-hidden border-r border-white/[0.08] bg-[#0d1120] p-4 lg:sticky lg:top-24 lg:flex lg:h-[calc(100vh-190px)] lg:max-h-[850px] lg:w-auto lg:rounded-2xl lg:border lg:bg-gradient-to-b lg:from-[#14192a] lg:to-[#0e1220]`}
          >
            <div className="mb-5 flex items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-white">Your conversations</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Private chat history
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close chat history"
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white lg:hidden"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={startNewChat}
                  disabled={busy}
                  title="Start a new chat"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name="plus" className="h-4 w-4" />
                  New
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
              <Icon name="clock" className="h-4 w-4 text-slate-500" />
              <span className="text-xs text-slate-400">
                {chats.length} saved {chats.length === 1 ? "chat" : "chats"}
              </span>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {initializing ? (
                <div className="space-y-3 py-3">
                  <div className="h-12 animate-pulse rounded-xl bg-white/[0.05]" />
                  <div className="h-12 animate-pulse rounded-xl bg-white/[0.05]" />
                  <div className="h-12 animate-pulse rounded-xl bg-white/[0.05]" />
                </div>
              ) : chats.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/[0.08] text-violet-300">
                    <Icon name="chat" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">
                    No conversations yet
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Start chatting to build your personal career history.
                  </p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`group flex items-center gap-2 rounded-xl border p-2 transition ${
                      activeChatId === chat._id
                        ? "border-violet-400/30 bg-violet-400/[0.09]"
                        : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.035]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openChat(chat._id)}
                      disabled={busy}
                      className="min-w-0 flex-1 py-2 text-left disabled:opacity-50"
                    >
                      <span className="block truncate text-sm font-medium text-slate-200">
                        {chat.title || "New Career Chat"}
                      </span>

                      {chat.updatedAt && (
                        <span className="mt-1 block text-[10px] text-slate-500">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteChat(chat._id)}
                      disabled={busy}
                      aria-label={`Delete ${chat.title || "conversation"}`}
                      title="Delete conversation"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-40 lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {switchingChat && (
              <p className="mt-3 text-xs font-medium text-violet-300">
                Loading conversation...
              </p>
            )}

            <div className="mt-4 rounded-xl border border-white/[0.06] bg-gradient-to-br from-violet-500/[0.09] to-sky-400/[0.04] p-3">
              <div className="flex items-center gap-2">
                <AssistantAvatar small />
                <span className="text-xs font-bold text-slate-200">
                  CareerPilot AI
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Keep learning, keep building, and take your next career step.
              </p>
            </div>
          </aside>

          {/* Main chat panel */}
          <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#14192a] to-[#0e1220] shadow-xl shadow-black/10">
            {/* Chat header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <AssistantAvatar />

                <div className="min-w-0">
                  <h2 className="truncate font-bold text-white">
                    CareerPilot Assistant
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <p className="text-xs text-slate-400">
                      Career guidance assistant
                    </p>
                  </div>
                </div>
              </div>

              <span className="hidden rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-slate-400 sm:inline-flex">
                {activeChatId ? "Saved conversation" : "New conversation"}
              </span>
            </div>

            {/* Messages */}
            <div
              className="flex min-h-[350px] max-h-[60vh] flex-1 flex-col gap-5 overflow-y-auto p-4 sm:min-h-[420px] sm:p-6 lg:max-h-[650px]"
              aria-live="polite"
            >
              {initializing ? (
                <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 h-9 w-9 animate-spin rounded-full border-2 border-violet-400/20 border-t-violet-400" />
                  <p className="text-sm text-slate-400">
                    Loading your career conversations...
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isUser = message.role === "user";

                    return (
                      <div
                        key={`${message._id || message.role}-${index}`}
                        className={`flex w-full items-start gap-3 ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isUser && <AssistantAvatar small />}

                        <div
                          className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3.5 text-sm leading-7 sm:max-w-[80%] sm:px-5 ${
                            isUser
                              ? "rounded-tr-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-950/20"
                              : "rounded-tl-md border border-white/[0.07] bg-[#1a2032] text-slate-200"
                          }`}
                        >
                          {message.content}
                        </div>

                        {isUser && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-sky-300/15 bg-sky-300/[0.08] text-xs font-bold text-sky-200">
                            You
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex items-start gap-3">
                      <AssistantAvatar small />
                      <div className="rounded-2xl rounded-tl-md border border-white/[0.07] bg-[#1a2032] px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300 [animation-delay:-0.3s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300 [animation-delay:-0.15s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300" />
                          <span className="ml-1 text-xs text-slate-400">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mx-4 mb-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-3 text-sm leading-6 text-rose-200 sm:mx-6">
                <div className="flex items-start gap-2">
                  <span className="font-bold">!</span>
                  <span className="min-w-0 flex-1 break-words">{error}</span>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    aria-label="Dismiss error"
                    className="rounded p-1 text-rose-200/70 hover:text-white"
                  >
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Prompt suggestions */}
            <div className="border-t border-white/[0.07] px-4 pt-4 sm:px-6">
              <div className="mb-3 flex items-center gap-2">
                <Icon
                  name="sparkles"
                  className="h-4 w-4 text-violet-300"
                />
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Try asking
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.prompt}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setQuestion(suggestion.prompt);
                      questionInputRef.current?.focus();
                    }}
                    className="group flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-left transition hover:border-violet-400/25 hover:bg-violet-400/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/[0.08] text-lg text-violet-300 transition group-hover:bg-violet-400/[0.14]">
                      {suggestion.icon}
                    </span>

                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-slate-200 sm:text-sm">
                        {suggestion.title}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {suggestion.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message input */}
            <div className="p-4 pt-4 sm:p-6">
              <form
                onSubmit={sendMessage}
                className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#090d19] p-2 transition focus-within:border-violet-400/40 focus-within:ring-4 focus-within:ring-violet-400/[0.06] sm:gap-3 sm:p-3"
              >
                <textarea
                  ref={questionInputRef}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      if (question.trim() && !busy) {
                        sendMessage(event);
                      }
                    }
                  }}
                  maxLength={10000}
                  rows={1}
                  placeholder="Ask anything about your career..."
                  aria-label="Your career question"
                  disabled={initializing || switchingChat}
                  className="max-h-36 min-h-11 min-w-0 flex-1 resize-y bg-transparent px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 disabled:opacity-50 sm:px-2"
                />

                <button
                  type="submit"
                  disabled={busy || !question.trim()}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-950/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
                >
                  <span className="hidden sm:inline">
                    {loading ? "Thinking" : "Send"}
                  </span>
                  <Icon name="send" className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
                <p className="text-[11px] leading-5 text-slate-500">
                  Press Enter to send · Shift + Enter for a new line
                </p>
                <p className="text-[11px] text-slate-500">
                  {question.length.toLocaleString()}/10,000
                </p>
              </div>
            </div>
          </section>
        </div>

        <footer className="py-7 text-center">
          <p className="text-xs leading-6 text-slate-500">
            CareerPilot · Your career journey, one step at a time.
          </p>
        </footer>
      </main>
    </div>
  );
}

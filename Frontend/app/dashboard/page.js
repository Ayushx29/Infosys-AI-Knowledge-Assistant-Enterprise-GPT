"use client";

// React hooks
import { useEffect, useMemo, useRef, useState } from "react";

// Next.js router for navigation
import { useRouter } from "next/navigation";

// Backend API URL
const API_URL = "http://127.0.0.1:8000";

export default function ChatPage() {

  // ==============================
  // Chat Messages State Stores all messages exchanged between user and AI assistant.
  // ==============================
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      text: "Hello! I’m Enterprise AI, your workplace knowledge assistant. Ask me about company policies, HR documents, procedures, or uploaded files.",
      citations: [],
    },
  ]);

  // Reference to the last message.
  // Used for automatic scrolling.
  const messagesEndRef = useRef(null);

  // =====================================
  // Auto-scroll to the latest message whenever a new message is added.
  // =====================================
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, [messages]);

  // User Input State Stores the current text entered in the chat input field
  const [input, setInput] = useState("");

  // Indicates whether the AI is currently generating a response.
  const [typing, setTyping] = useState(false);

  // Controls light/dark theme.
  const [darkMode, setDarkMode] = useState(false);

  // Stores the uploaded document.
  const [file, setFile] = useState(null);

  // Stores all previous chat sessions shown in the sidebar.
  const [chatHistory, setChatHistory] = useState([]);

  // Stores the currently selected chat conversation ID.
  const [currentChatId, setCurrentChatId] = useState(null);

  // Stores the search text used  to filter chat history.
  const [search, setSearch] = useState("");

  // Logged-in user
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("Employee");
  const [userEmail, setUserEmail] = useState("");

  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

    useEffect(() => {
      const storedName =
        localStorage.getItem("userName") ||
        localStorage.getItem("name");

      const storedRole =
        localStorage.getItem("userRole") ||
        localStorage.getItem("role");

      const storedEmail =
        localStorage.getItem("userEmail") ||
        localStorage.getItem("email");

      const storedUserId = localStorage.getItem("userId");

      if (storedName) setUserName(storedName);
      if (storedRole) setUserRole(storedRole);
      if (storedEmail) setUserEmail(storedEmail);

      if (storedUserId) {
        loadChats(Number(storedUserId));
      }
    }, []);

  // =====================================================
  // LOAD CHAT
  // =====================================================

    async function loadChats(userId) {
      try {
        const res = await fetch(
          `${API_URL}/api/chat/list/${userId}`
        );

        const chats = await res.json();

        setChatHistory(chats);
      } catch (err) {
        console.error(err);
      }
    }

  // =====================================================
  // GET INITIALS
  // =====================================================

    function getInitials(name) {
      if (!name || name.trim() === "") {
        return "U";
      }

      const words = name.trim().split(/\s+/);

      if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
      }

      return (
        words[0][0] +
        words[words.length - 1][0]
      ).toUpperCase();
    }

  // =====================================================
  // SEND MESSAGE TO BACKEND
  // =====================================================

    async function sendMessage(text = input) {
    const question = text.trim();

    // First validate
    if (!question || typing) {
      return;
    }

    // Then create/update the conversation
    let activeChatId = currentChatId;

    if (!activeChatId) {

    const userId = localStorage.getItem("userId");

    const res = await fetch(`${API_URL}/api/chat/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: question,
        user_id: Number(userId),
      }),
    });

    const chat = await res.json();

    activeChatId = chat.id;

    setCurrentChatId(chat.id);

    loadChats(userId);
  }

    // Move active chat to top
    setChatHistory((prev) => {
      const chats = [...prev];

      const index = chats.findIndex(
        (chat) => chat.id === activeChatId
      );

      if (index !== -1) {
        const active = chats[index];

        chats.splice(index, 1);

        chats.unshift({
          ...active,
          updatedAt: new Date(),
        });
      }

      return chats;
    });


      

      // Add user message immediately
      const userMessage = {
        id: Date.now(),
        type: "user",
        text: question,
      };

      setMessages((oldMessages) => [
        ...oldMessages,
        userMessage,
      ]);

      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, userMessage],
              }
            : chat
        )
      );

      setInput("");
      setTyping(true);

      try {
        // Get latest user information
        const currentDesignation =
          localStorage.getItem("designation") ||
          "Software Engineer";

        // Send request to FastAPI
        const response = await fetch(
          `${API_URL}/api/chat/message`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              chat_id: activeChatId,
              message: question,
              designation: currentDesignation,
            }),
          }
        );

        // Check response type
        const contentType =
          response.headers.get("content-type") || "";

        let data;

        if (contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const textResponse = await response.text();

          throw new Error(
            textResponse ||
              `Backend returned status ${response.status}`
          );
        }

        // Backend error
        if (!response.ok) {
          throw new Error(
            data?.detail ||
              data?.message ||
              `Request failed with status ${response.status}`
          );
        }

        // Get actual AI answer
      const formattedMessages = data.messages.map((msg, index) => ({
    id: index + 1,
    type: msg.role,
    text: msg.content,
    citations: msg.citations || [],
  }));

  setMessages(formattedMessages);

  // Reload sidebar
  const userId = localStorage.getItem("userId");

  if (userId) {
    loadChats(Number(userId));
  }


      } catch (error) {
        console.error(
          "Chat API Error:",
          error
        );

        const errorMessage = {
          id: Date.now() + 1,
          type: "assistant",
          text:
            "Unable to connect to the AI server. Please make sure the FastAPI backend is running.",
          citations: [],
        };

        setMessages((oldMessages) => [
          ...oldMessages,
          errorMessage,
        ]);
      } finally {
        setTyping(false);
      }
    }

  // =====================================================
  // NEW CHAT
  // =====================================================

    async function startNewChat() {
    try {
      const userId = localStorage.getItem("userId");

      const res = await fetch(`${API_URL}/api/chat/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "New Chat",
          user_id: Number(userId),
        }),
      });

      const chat = await res.json();

      setCurrentChatId(chat.id);

      // Reload sidebar
      await loadChats(userId);

      // Reset chat window
      setMessages([
        {
          id: Date.now(),
          type: "assistant",
          text: "Hello! I’m Enterprise AI. How can I help you today?",
          citations: [],
        },
      ]);

      setInput("");
      setFile(null);

    } catch (err) {
      console.error("New chat error:", err);
    }
    }

    async function deleteChat(chatId) {
      try {
        const res = await fetch(`${API_URL}/api/chat/${chatId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete chat");
        }

        // Remove from sidebar
        setChatHistory((prev) =>
          prev.filter((chat) => chat.id !== chatId)
        );

        // If the deleted chat was open
        if (currentChatId === chatId) {
          setCurrentChatId(null);

          setMessages([
            {
              id: 1,
              type: "assistant",
              text: "Hello! I'm Enterprise AI. How can I help you today?",
              citations: [],
            },
          ]);
        }

      } catch (err) {
        console.error("Delete chat failed:", err);
      }
    }
  
  // =====================================================
  // FILE SELECTION
  // =====================================================

    function handleFile(event) {
      const selectedFile =
        event.target.files?.[0];

      if (selectedFile) {
        setFile(selectedFile.name);
      }
    }

  // =====================================================
  // REMOVE FILE
  // =====================================================

    function removeFile() {
      setFile(null);
    }

  // =====================================================
  // COPY MESSAGE
  // =====================================================

    async function copyMessage(text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error(
          "Copy failed:",
          error
        );
      }
    }

  // =====================================================
  // LOGOUT
  // =====================================================

    function logout() {
      localStorage.removeItem("userName");
      localStorage.removeItem("name");

      localStorage.removeItem("userRole");
      localStorage.removeItem("role");

      localStorage.removeItem("userEmail");
      localStorage.removeItem("email");

      localStorage.removeItem("userId");
      localStorage.removeItem("department");
      localStorage.removeItem("designation");

      window.location.href = "/login";
    }

    const filteredChats = chatHistory.filter((chat) =>
    chat.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div
        className={
          darkMode
            ? "app dark"
            : "app"
        }
      >

      {/* =================================================
        SIDEBAR
      ================================================= */}

        <aside className="sidebar">

        {/* LOGO */}

        <div className="logo-area">

          <div className="logo-icon">
            ✦
          </div>

          <div>

            <div className="logo-title">
              Enterprise AI
            </div>

            <div className="logo-subtitle">
              Knowledge Assistant
            </div>

          </div>

        </div>

        {/* NEW CHAT */}

        <button
          className="new-chat-button"
          onClick={startNewChat}
        >
          + New Chat
        </button>

        <div className="search-box">

          <span>
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* RECENT CHATS */}

        <div className="sidebar-title">
          RECENT CHATS
        </div>

        {filteredChats.length === 0 ? (
        <div
          style={{
            color: "#888",
            padding: "12px",
            fontSize: "14px",
          }}
        >
          No chats yet
        </div>
      ) : (
        filteredChats.map((chat) => (
          <div
            key={chat.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <button
              className="history-item"
              style={{ flex: 1 }}
              onClick={async () => {
                setCurrentChatId(chat.id);

                try {
                  const res = await fetch(
                    `${API_URL}/api/chat/${chat.id}`
                  );

                  if (!res.ok) {
                    throw new Error("Failed to load chat");
                  }

                  const data = await res.json();

                  setMessages(
                    (data.messages || []).map((msg, index) => ({
                      id: index + 1,
                      type: msg.role,
                      text: msg.content,
                      citations: msg.citations || [],
                    }))
                  );

                } catch (err) {
                  console.error("Error loading chat:", err);
                }
              }}
            >
              💬 {chat.title}
            </button>

            <button
              onClick={() => deleteChat(chat.id)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "16px",
                marginLeft: "8px",
              }}
            >
              🗑️
            </button>
          </div>
        ))
      )}

        </aside>

      {/* =================================================
        MAIN
      ================================================= */}

        <main className="main">

        {/* HEADER */}

        <header className="header">
          <div>
            <h1>
              AI Assistant
            </h1>

            <div className="online-status">
              <span className="green-dot"></span>
              Enterprise knowledge is ready
            </div>
          </div>

          <div className="header-actions">

            {/* DARK MODE BUTTON */}
            <button
              className="theme-button"
              onClick={() =>
                setDarkMode(
                  !darkMode
                )
              }
            >
              {darkMode
                ? "☀"
                : "☾"}
            </button>

            <div
              style={{
                position: "relative",
              }}
            >

            <div
              className="header-avatar"
              onClick={() =>
              setShowProfileMenu(!showProfileMenu)
              }
              style={{
                cursor: "pointer",
              }}
            >
                {getInitials(userName)}
            </div>

              {showProfileMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "45px",
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 4px 10px rgba(0,0,0,.15)",
                    minWidth: "140px",
                    zIndex: 1000,
                  }}
                >
                  <button
                    onClick={logout}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>

        </header>

      {/* =================================================
        CHAT CONTAINER
      ================================================= */}

      <section className="chat-container">

        {/* WELCOME */}

        {messages.length === 1 && (
          <div className="welcome">
            <div className="ai-icon">
              ✦
            </div>

            <div>
              <h2>
                How can I help you today?
              </h2>

              <p>
                Ask questions about your
                organizations Documents
                and Policies.
              </p>
            </div>
          </div>
        )}   

        {/* =================================================
          MESSAGES
        ================================================= */}

          <div className="messages">
            {messages.map(
              (message) => (
                <div
                  key={message.id}
                  className={
                    message.type === "user"
                      ? "message user-message"
                      : "message"
                  }
                >

                  {/* AVATAR */}

                  <div
                    className={
                      message.type === "user"
                        ? "message-avatar user-avatar"
                        : "message-avatar ai-avatar"
                    }
                  >
                    {message.type === "user"
                      ? getInitials(userName)
                      : "✦"}
                  </div>

                  {/* CONTENT */}

                  <div className="message-content">

                    <div className="message-name">

                      {message.type === "user"
                        ? "You"
                        : "Enterprise AI"}

                    </div>

                    {/* ANSWER */}

                    <div
                      className={
                        message.type === "user"
                          ? "message-bubble user-bubble"
                          : "message-bubble"
                      }
                    >
                      {message.text}
                    </div>

                    {/* CITATIONS */}

                    {message.type ===
                      "assistant" &&
                      message.citations &&
                      message.citations.length >
                        0 && (

                        <div className="citations">

                          <strong>
                            Sources
                          </strong>

                          {message.citations.map(
                            (
                              citation,
                              index
                            ) => (

                              <div
                                key={index}
                                className="citation"
                              >
                                📄{" "}
                                {citation}
                              </div>

                            )
                          )}

                        </div>

                      )}

                    {/* ACTIONS */}

                    {message.type ===
                      "assistant" && (

                      <div className="message-actions">

                        <button
                          onClick={() =>
                            copyMessage(
                              message.text
                            )
                          }
                        >
                          Copy
                        </button>

                        <button>
                          👍
                        </button>

                        <button>
                          👎
                        </button>

                      </div>

                    )}

                  </div>

                </div>
              )
            )}

        {/* =================================================
          TYPING
        ================================================= */}

          {typing && (
              <div className="message">
                <div className="message-avatar ai-avatar">
                  ✦
                </div>

                <div>
                  <div className="message-name">
                    Enterprise AI
                  </div>

                  <div className="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
          )}

          <div ref={messagesEndRef} />
          </div>

        {/* =================================================
          ATTACHED FILE
        ================================================= */}

          {file && (
              <div className="attached-file">
                📄 {file}

                <button
                  onClick={removeFile}
                >
                  ×
                </button>

              </div>
          )}

        {/* =================================================
          INPUT
        ================================================= */}

          <div className="input-area">

              {/* INQUIREY BOX */}

              <input
                type="text"
                value={input}
                placeholder="Ask anything about your company..."
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {

                  if (
                    event.key ===
                      "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    sendMessage();
                  }

                }}
                disabled={typing}
              />

                {/* FILE */}

              <label className="attach-button">

                📎

                <input
                  type="file"
                  hidden
                  onChange={handleFile}
                />

              </label>

                {/* SEND BUTTON */}

              <button
                className="send-button"
                onClick={() =>
                  sendMessage()
                }
                disabled={
                  !input.trim() ||
                  typing
                }
              >
                ↑
              </button>

          </div>

          {/* DISCLAIMER */}

          <div className="disclaimer">
            Information is based on company
          </div>
      </section>
    </main>
    </div>
  );
}
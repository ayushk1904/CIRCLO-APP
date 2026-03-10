import { useEffect, useRef, useState } from "react";
import {
  getMessages,
  sendMessage,
  sendFileMessage,
} from "../../services/message.service";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import "../../styles/chatBox.css";
import { askAI } from "../../services/ai.service";
import { Bot } from "lucide-react";

/* ================= FILE BASE ================= */
const FILE_BASE =
  process.env.REACT_APP_FILE_URL || "http://localhost:5000";

/* ================= AI HELPER ================= */
const isAIMessage = (text = "") =>
  text.startsWith("/ai") ||
  text.startsWith("@ai") ||
  text.startsWith("@bot");

/* fake typing delay helper */


function ChatBox({ circleId, onOnlineUsers }) {
  const { user } = useAuth();
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [replyTo, setReplyTo] = useState(null);

  const bottomRef = useRef(null);
  const joinedRef = useRef(false);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);

  /* ================= LOAD HISTORY ================= */
  useEffect(() => {
    if (!circleId) return;

    getMessages(circleId).then((res) => {
      if (Array.isArray(res.data)) {
        setMessages(res.data);
        setUnreadCount(0);
      }
    });
  }, [circleId]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!socket || !user || !circleId) return;

    if (!joinedRef.current) {
      socket.emit("join-circle", {
        circleId,
        userId: user._id,
      });
      joinedRef.current = true;
    }

    socket.on("new-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.sender?._id !== user._id) {
        setUnreadCount((c) => c + 1);
      }
    });

    socket.on("typing", ({ userName }) => setTypingUser(userName));
    socket.on("stop-typing", () => setTypingUser(null));
    socket.on("online-users", ({ users }) =>
      onOnlineUsers?.(users)
    );

    return () => {
      socket.off("new-message");
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("online-users");
    };
  }, [socket, user, circleId, onOnlineUsers]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  /* ================= SEND ================= */
  const handleSend = async () => {
    if (!text.trim()) return;

    if (isAIMessage(text)) {
  const cleanText = text.replace(/^\/ai|@ai|@bot/i, "").trim();

  // 1️⃣ Save user message (REST)
  const userRes = await sendMessage(circleId, text);
  if (userRes?.data) {
    setMessages((prev) => [...prev, userRes.data]);
  }

  // 2️⃣ DO NOT emit socket manually here ❌
  // Socket message will come automatically from backend

  setText("");
  setTypingUser("Circlo AI");

  // 3️⃣ Call AI (backend will emit socket event)
  try {
    await askAI(cleanText, circleId);
  } catch (err) {
    console.error("AI error:", err);
  } finally {
    setTypingUser(null);
  }
  return;
}


    const res = await sendMessage(circleId, text);

if (res?.data) {
  // ✅ ADD THIS LINE
  setMessages((prev) => [...prev, res.data]);

  socket.emit("send-message", {
    circleId,
    message: res.data,
  });
}


    setReplyTo(null);
    socket.emit("stop-typing", { circleId });
    setText("");
  };

  /* ================= FILE ================= */
  const handleFileUpload = async (file) => {
    if (!file) return;

    const res = await sendFileMessage(circleId, file);
    if (res?.data) {
  setMessages((prev) => [...prev, res.data]);

  socket.emit("send-message", {
    circleId,
    message: res.data,
  });
}


    fileInputRef.current.value = "";
  };

  /* ================= HELPERS ================= */
  const isImageFile = (url = "") =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  const getFileSrc = (fileUrl) =>
    fileUrl ? `${FILE_BASE}${fileUrl}` : null;

  /* ================= UI HELPERS ================= */
  const toggleReaction = (id, emoji) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === id
          ? {
              ...m,
              reactions: {
                ...(m.reactions || {}),
                [emoji]: (m.reactions?.[emoji] || 0) + 1,
              },
            }
          : m
      )
    );
  };

  const deleteMessageUI = (id) =>
    setMessages((prev) => prev.filter((m) => m._id !== id));

  const editMessageUI = (id) => {
    const newText = prompt("Edit message");
    if (!newText) return;
    setMessages((prev) =>
      prev.map((m) =>
        m._id === id ? { ...m, content: newText } : m
      )
    );
  };

  /* ================= UI ================= */
  return (
    <div className="chatbox">
      {unreadCount > 0 && (
        <div className="unread-indicator">
          {unreadCount} new message
        </div>
      )}

      <div className="messages">
        {messages.map((msg) => {
          const isMine = msg.sender?._id === user._id;
          const isAI =
            msg.isAI === true ||
            msg.sender === null ||
            msg.sender?.name === "Circlo AI";

          const fileSrc = getFileSrc(msg.fileUrl);

          return (
            <div
              key={msg._id}
              className={`message-row ${
                isAI ? "ai" : isMine ? "mine" : "other"
              }`}
            >
              {isAI && (
                <div className="bot-avatar">
                  <Bot size={22} strokeWidth={2} />
                </div>
              )}

              {!isMine && !isAI && (
                <div className="avatar">
                  {msg.sender?.name?.charAt(0) || "U"}
                </div>
              )}

              <div className="bubble-wrapper">
                {!isMine && (
                  <div className={`sender-name ${isAI ? "ai" : ""}`}>
                    {isAI ? (
                      <>
                        Circlo AI <span className="ai-badge">AI</span>
                      </>
                    ) : (
                      msg.sender?.name
                    )}
                  </div>
                )}

                <div
                  className={`bubble ${
                    isAI ? "ai" : isMine ? "mine" : ""
                  }`}
                >
                  {!msg.fileUrl && msg.content}

                  {fileSrc && isImageFile(fileSrc) && (
                    <img
                      src={fileSrc}
                      alt="chat"
                      className="chat-image"
                    />
                  )}

                  {msg.fileUrl && !isImageFile(fileSrc) && (
                    <a href={fileSrc} target="_blank" rel="noreferrer">
                      📎 {msg.fileName}
                    </a>
                  )}

                  <div className="reactions">
                    {["👍", "❤️", "😂"].map((e) => (
                      <span
                        key={e}
                        onClick={() => toggleReaction(msg._id, e)}
                      >
                        {e} {msg.reactions?.[e] || ""}
                      </span>
                    ))}
                  </div>

                  <div className="message-actions">
                    <span onClick={() => setReplyTo(msg)}>↩</span>
                    {isMine && (
                      <>
                        <span onClick={() => editMessageUI(msg._id)}>
                          ✏️
                        </span>
                        <span onClick={() => deleteMessageUI(msg._id)}>
                          🗑️
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {typingUser && (
          <div className="typing-indicator">
            {typingUser} is typing…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {replyTo && (
        <div className="reply-bar">
          <div>
            Replying to <strong>{replyTo.sender?.name}</strong>
            <div className="reply-text">{replyTo.content}</div>
          </div>
          <span onClick={() => setReplyTo(null)}>✖</span>
        </div>
      )}

      <div className="chat-input">
        <button onClick={() => fileInputRef.current.click()}>📎</button>

        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            socket.emit("typing", {
              circleId,
              userName: user.name,
            });
            clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(
              () => socket.emit("stop-typing", { circleId }),
              800
            );
          }}
          placeholder="Type a message…"
        />

        <button onClick={handleSend}>Send</button>

        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={(e) =>
            handleFileUpload(e.target.files[0])
          }
        />
      </div>
    </div>
  );
}

export default ChatBox;

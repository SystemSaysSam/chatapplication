import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";
import "./chatwindow.css";

export function ChatWindow({ roomCode }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [roomFull, setRoomFull] = useState(false);
  const [hasLeft, setHasLeft] = useState(false);

  const messagesEndRef = useRef(null);
  const joinedRoomRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!roomCode) {
      navigate("/");
      return;
    }

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "incoming",
          text: message,
        },
      ]);
    };

    const handleConnectedUsers = (numberOfUsers) => {
      setConnectedUsers(numberOfUsers);
    };

    const handleRoomJoined = (joinedCode) => {
      joinedRoomRef.current = joinedCode;
      setHasLeft(false);
      setRoomFull(false);
    };

    const handleRoomFull = () => {
      setRoomFull(true);
      alert("Room is full. Only 2 users are allowed.");
      navigate("/");
    };

    const handleInvalidRoom = () => {
      alert("Invalid room code.");
      navigate("/");
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("connected-users", handleConnectedUsers);
    socket.on("room-joined", handleRoomJoined);
    socket.on("room-full", handleRoomFull);
    socket.on("invalid-room", handleInvalidRoom);

    // Join only if this ChatWindow has not already joined this room
    if (joinedRoomRef.current !== roomCode) {
      socket.emit("join-room", roomCode);
    }

    return () => {
      // Important:
      // Do NOT emit leave-room here.
      // React can run cleanup during rerenders/dev mode and wrongly leave old rooms.
      socket.off("receive-message", handleReceiveMessage);
      socket.off("connected-users", handleConnectedUsers);
      socket.off("room-joined", handleRoomJoined);
      socket.off("room-full", handleRoomFull);
      socket.off("invalid-room", handleInvalidRoom);
    };
  }, [roomCode, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue || roomFull || hasLeft) return;

    socket.emit("send-message", {
      roomCode,
      message: trimmedValue,
    });

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        type: "outgoing",
        text: trimmedValue,
      },
    ]);

    setInputValue("");
  };

  const handleLeaveChat = () => {
    socket.emit("leave-room", roomCode);

    joinedRoomRef.current = null;
    setMessages([]);
    setConnectedUsers(0);
    setHasLeft(true);

    navigate("/");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-window-page">
      <div className="chat-container">
        <header className="chat-header">
          <div className="chat-header-info">
            <span className="room-code">Room: {roomCode}</span>

            <span className="connected-users">
              {roomFull
                ? "Room full"
                : hasLeft
                ? "Left room"
                : `${connectedUsers} connected`}
            </span>

            <button className="leave-button" onClick={handleLeaveChat}>
              Leave
            </button>
          </div>
        </header>

        <main className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${
                message.type === "incoming"
                  ? "message-incoming"
                  : "message-outgoing"
              }`}
            >
              <p className="message-text">{message.text}</p>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </main>

        <footer className="chat-input-bar">
          <input
            type="text"
            className="chat-input"
            placeholder={
              roomFull
                ? "Room is full..."
                : hasLeft
                ? "You left the room..."
                : "Type a message..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={roomFull || hasLeft}
          />

          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={roomFull || hasLeft}
          >
            Send
          </button>
        </footer>
      </div>
    </div>
  );
}

export default ChatWindow;
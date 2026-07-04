import React, { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import "./roomentry.css";

export function RoomEntry({ onRoomReady }) {
  const [roomCode, setRoomCode] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [newRoomCode, setNewRoomCode] = useState("");

  useEffect(() => {
    const handleRoomCreated = (createdCode) => {
      alert("Room created successfully");

      setShowOverlay(false);
      setNewRoomCode("");

      onRoomReady(createdCode);
    };

    const handleRoomValid = (validCode) => {
      alert("Room found successfully");
      onRoomReady(validCode);
    };

    const handleRoomCodeExists = () => {
      alert("This room code already exists. Try another code.");
    };

    const handleInvalidRoom = () => {
      alert("Invalid room code. This room does not exist.");
    };

    const handleRoomFull = () => {
      alert("Room is full. Only 2 users are allowed.");
    };

    socket.on("room-created", handleRoomCreated);
    socket.on("room-valid", handleRoomValid);
    socket.on("room-code-exists", handleRoomCodeExists);
    socket.on("invalid-room", handleInvalidRoom);
    socket.on("room-full", handleRoomFull);

    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("room-valid", handleRoomValid);
      socket.off("room-code-exists", handleRoomCodeExists);
      socket.off("invalid-room", handleInvalidRoom);
      socket.off("room-full", handleRoomFull);
    };
  }, [onRoomReady]);

  const handleCreateRoom = () => {
    setShowOverlay(true);
  };

  const handleConfirmCreate = () => {
    const trimmedCode = newRoomCode.trim();

    if (!trimmedCode) {
      alert("Please enter a room code.");
      return;
    }

    socket.emit("create-room", trimmedCode);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setNewRoomCode("");
  };

  const handleJoinRoom = () => {
    const trimmedCode = roomCode.trim();

    if (!trimmedCode) {
      alert("Please enter a room code.");
      return;
    }

    // Important:
    // RoomEntry only checks if the room exists.
    // Actual joining happens inside ChatWindow.
    socket.emit("check-room", trimmedCode);
  };

  return (
    <div className="room-entry-page">
      <div className="room-entry-card">
        <h1 className="app-title">ChatRoom</h1>
        <p className="app-subtitle">
          Create a new room or join one with a code
        </p>

        <button className="btn btn-primary" onClick={handleCreateRoom}>
          Create Room
        </button>

        <div className="divider">
          <span className="divider-line" />
          <span className="divider-text">or</span>
          <span className="divider-line" />
        </div>

        <div className="form-group">
          <input
            type="text"
            className="room-code-input"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />

          <button className="btn btn-secondary" onClick={handleJoinRoom}>
            Join Room
          </button>
        </div>

        <p className="helper-text">
          Room codes are case-sensitive and shared by the room creator
        </p>
      </div>

      {showOverlay && (
        <div className="overlay-backdrop" onClick={handleCloseOverlay}>
          <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="overlay-title">Create a code</h2>

            <input
              type="text"
              className="room-code-input"
              placeholder="Enter a code for your room"
              value={newRoomCode}
              onChange={(e) => setNewRoomCode(e.target.value)}
            />

            <button className="btn btn-primary" onClick={handleConfirmCreate}>
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomEntry;
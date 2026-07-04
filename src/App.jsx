import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import RoomEntry from "./components/RoomEntry";
import ChatWindow from "./components/ChatWindow";

function AppContent() {
  const [activeRoomCode, setActiveRoomCode] = useState("");
  const navigate = useNavigate();

  const handleRoomReady = (code) => {
    setActiveRoomCode(code);
    navigate("/chat");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<RoomEntry onRoomReady={handleRoomReady} />}
      />

      <Route
        path="/chat"
        element={
          activeRoomCode ? (
            <ChatWindow roomCode={activeRoomCode} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppContent />;
}
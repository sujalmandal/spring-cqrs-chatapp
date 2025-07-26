import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080/api/1.0.0";

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [sender, setSender] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  function fetchRooms() {
    fetch(`${API_BASE}/room`)
      .then((res) => res.json())
      .then(setRooms);
  }

  function createRoom() {
    if (!newRoom) return;
    fetch(`${API_BASE}/room/${newRoom}`, { method: "POST" })
      .then(() => {
        setNewRoom("");
        fetchRooms();
      });
  }

  function selectRoom(room) {
    setSelectedRoom(room);
    fetch(`${API_BASE}/room/${room}/message`)
      .then((res) => res.json())
      .then(setMessages);
  }

  function sendMessage() {
    if (!sender || !content || !selectedRoom) return;
    fetch(`${API_BASE}/room/${selectedRoom}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, content }),
    })
      .then(() => {
        setContent("");
        selectRoom(selectedRoom);
      });
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Chat Rooms</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room}>
            <button onClick={() => selectRoom(room)} style={{ fontWeight: room === selectedRoom ? "bold" : "normal" }}>{room}</button>
          </li>
        ))}
      </ul>
      <input
        placeholder="New room name"
        value={newRoom}
        onChange={(e) => setNewRoom(e.target.value)}
      />
      <button onClick={createRoom}>Create Room</button>

      {selectedRoom && (
        <div style={{ marginTop: 30 }}>
          <h3>Room: {selectedRoom}</h3>
          <div style={{ border: "1px solid #ccc", padding: 10, minHeight: 100 }}>
            {messages.length === 0 && <div>No messages yet.</div>}
            {messages.map((msg, i) => (
              typeof msg === 'object' && msg !== null && 'sender' in msg && 'content' in msg ? (
                <div key={i}>
                  <b>{msg.sender}:</b> {msg.content}
                </div>
              ) : (
                <div key={i}>{msg}</div>
              )
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Your name"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              style={{ width: 120 }}
            />
            <input
              placeholder="Message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: 300, marginLeft: 10 }}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} style={{ marginLeft: 10 }}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

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
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: 8, marginBottom: 18 }}>Chat Rooms</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {rooms.map((room) => (
          <button
            key={room}
            onClick={() => selectRoom(room)}
            style={{
              fontWeight: room === selectedRoom ? "bold" : "normal",
              background: room === selectedRoom ? '#e6f7ff' : '#f7f7f7',
              border: '1px solid #bbb',
              borderRadius: 16,
              padding: '4px 14px',
              cursor: 'pointer',
              minWidth: 0,
              fontSize: 15,
              color: '#222',
              marginBottom: 2
            }}
          >
            #{room}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          placeholder="New room name"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          style={{ flex: 1, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button onClick={createRoom} style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #bbb', background: '#f7f7f7', cursor: 'pointer' }}>Create Room</button>
      </div>

      {selectedRoom && (
        <div style={{ marginTop: 30 }}>
          <h3 style={{ marginBottom: 10, color: '#333' }}>Room: <span style={{ color: '#0074d9' }}>{selectedRoom}</span></h3>
          <div style={{ border: "1px solid #ccc", background: '#fafbfc', borderRadius: 6, padding: 14, minHeight: 120, marginBottom: 10, fontSize: 15, lineHeight: 1.6 }}>
            {messages.length === 0 && <div style={{ color: '#aaa' }}>No messages yet.</div>}
            {messages.map((msg, i) => (
              typeof msg === 'object' && msg !== null && 'sender' in msg && 'content' in msg ? (
                <div key={i} style={{ marginBottom: 6 }}>
                  <span style={{ color: '#0074d9', fontWeight: 500 }}>{msg.sender}:</span> <span>{msg.content}</span>
                </div>
              ) : (
                <div key={i} style={{ marginBottom: 6, color: '#222' }}>{msg}</div>
              )
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Your name"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              style={{ flex: '0 0 120px', padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <input
              placeholder="Message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ flex: 1, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} style={{ padding: '4px 16px', borderRadius: 4, border: '1px solid #bbb', background: '#e6f7ff', cursor: 'pointer' }}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

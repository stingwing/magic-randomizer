import React, { useState } from "react";
import NameForm from "./NameForm.jsx";

export default function NameForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [names, setNames] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!name.trim()) {
      setMessage("Please enter a name.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/api/names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        setNames(data.names);
        setMessage("Name added!");
        setName("");
      } else {
        setMessage(data.error || "Error adding name.");
      }
    } catch (err) {
      setMessage("Server error.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Add a Name</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          placeholder="Enter name"
          onChange={e => setName(e.target.value)}
          style={{ width: "100%", marginBottom: "1rem" }}
        />
        <button type="submit">Submit</button>
      </form>
      {message && <div style={{ marginTop: "1rem" }}>{message}</div>}
      {names.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Names List:</h3>
          <ul>
            {names.map((n, idx) => (
              <li key={idx}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
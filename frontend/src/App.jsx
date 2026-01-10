import React, { useState, useEffect } from "react";
import './App.css';

const API_URL = "http://127.0.0.1:8000";

export default function App() {
  const [view, setView] = useState("home");
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", password: "", email: "" });

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/users`);
    const data = await res.json();
    setUsers(data);
  };

  const handleAction = async (path, body, nextView) => {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        if (path === "/login") {
          data.is_admin ? setView("admin-dashboard") : alert("Login Successful");
        } else {
          alert(data.message);
          setView(nextView);
        }
      } else { alert(data.detail || "Error"); }
    } catch (e) { alert("Server is offline"); }
  };

  const updateStatus = async (userId, newStatus) => {
    await fetch(`${API_URL}/users/${userId}/status?status=${newStatus}`, { method: "PATCH" });
    fetchUsers();
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const res = await fetch(`${API_URL}/users/${userId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchUsers(); // Refresh the list after deletion
        }
      } catch (error) {
        alert("Error deleting user");
      }
    }
  };

  useEffect(() => {
    if (view === "admin-dashboard") fetchUsers();
  }, [view]);

  return (
    <div className="container">
      {view === "home" && (
        <div className="card">
          <h1>Student Portal</h1>
          <button onClick={() => setView("register")}>Interested? Register</button>
          <button className="secondary-btn" onClick={() => setView("login")}>Admin Login</button>
        </div>
      )}

      {(view === "register" || view === "login") && (
        <div className="card">
          <h2>{view === "register" ? "Registration" : "Admin Login"}</h2>
          <input placeholder="Username" onChange={e => setForm({ ...form, username: e.target.value })} />
          {view === "register" && <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />}
          <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
          <button onClick={() => handleAction(view === "register" ? "/register" : "/login", form, "home")}>Submit</button>
          <button className="secondary-btn" onClick={() => setView("home")}>Back</button>
        </div>
      )}

      {view === "admin-dashboard" && (
        <div className="admin-card">
          <h2>Admin Dashboard</h2>
          <table className="admin-table">
            <thead>
              <tr><th>User</th><th>Status</th><th>Edit Status</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td><span className={`badge ${u.status.toLowerCase()}`}>{u.status}</span></td>
                  <td>
                    {!u.is_admin && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <select value={u.status} onChange={(e) => updateStatus(u.id, e.target.value)}>
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        <button
                          onClick={() => deleteUser(u.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setView("home")}>Logout</button>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import './App.css';

const API_URL = "http://127.0.0.1:8000";

export default function App() {
  const [view, setView] = useState("home");
  const [users, setUsers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [form, setForm] = useState({ username: "", password: "", email: "" });

  // New state for Enquiry Form with validation-ready defaults
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    phone_no: "",
    email: "",
    program: "BCA Cyber Security"
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (e) { console.error("Failed to fetch users"); }
  };

  const fetchEnquiries = async () => {
    try {
      const res = await fetch(`${API_URL}/enquiries`);
      const data = await res.json();
      setEnquiries(data);
    } catch (e) { console.error("Failed to fetch enquiries"); }
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
          alert(data.message || "Success!");
          setView(nextView);
        }
      } else {
        // Logic to show specific Pydantic validation errors
        if (Array.isArray(data.detail)) {
          const errorMsg = data.detail.map(err => `${err.loc[1]}: ${err.msg}`).join("\n");
          alert("Validation Error:\n" + errorMsg);
        } else {
          alert(data.detail || "Error processing request");
        }
      }
    } catch (e) { alert("Server is offline"); }
  };

  const updateStatus = async (userId, newStatus) => {
    await fetch(`${API_URL}/users/${userId}/status?status=${newStatus}`, { method: "PATCH" });
    fetchUsers();
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const res = await fetch(`${API_URL}/users/${userId}`, { method: "DELETE" });
        if (res.ok) fetchUsers();
      } catch (error) { alert("Error deleting user"); }
    }
  };

  useEffect(() => {
    if (view === "admin-dashboard") {
      fetchUsers();
      fetchEnquiries();
    }
  }, [view]);

  return (
    <div className="container">
      {/* HOME VIEW */}
      {view === "home" && (
        <div className="card">
          <h1>Student Portal</h1>
          <button onClick={() => setView("enquire")}>Enquire Now</button>
          <button className="secondary-btn" onClick={() => setView("register")}>Student Registration</button>
          <button className="text-btn" onClick={() => setView("login")}>Admin Login</button>
        </div>
      )}

      {/* ENQUIRY FORM VIEW WITH VALIDATION */}
      {view === "enquire" && (
        <div className="card">
          <h2>Enquire Now</h2>
          <form onSubmit={(e) => {
            e.preventDefault(); // Standard form submission prevention
            handleAction("/enquire", enquiryForm, "home");
          }}>
            <input
              placeholder="Full Name"
              required
              minLength="2"
              onChange={e => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone Number (10 digits)"
              required
              pattern="[0-9]{10}" // Frontend regex validation
              title="Please enter a 10-digit phone number"
              onChange={e => setEnquiryForm({ ...enquiryForm, phone_no: e.target.value })}
            />
            <input
              type="email" // Built-in email validation
              placeholder="Email Address"
              required
              onChange={e => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
            />
            <select onChange={e => setEnquiryForm({ ...enquiryForm, program: e.target.value })}>
              <option>BCA Cyber Security</option>
              <option>BCA Data Science</option>
              <option>BCA Cloud Computing</option>
              <option>BCA Software Development</option>
              <option>BCA IoT</option>
              <option>BCA Blockchain</option>
            </select>
            <button type="submit">Submit Enquiry</button>
            <button type="button" className="secondary-btn" onClick={() => setView("home")}>Back</button>
          </form>
        </div>
      )}

      {/* REGISTER & LOGIN VIEWS */}
      {(view === "register" || view === "login") && (
        <div className="card">
          <h2>{view === "register" ? "Registration" : "Admin Login"}</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAction(view === "register" ? "/register" : "/login", form, "home");
          }}>
            <input placeholder="Username" required onChange={e => setForm({ ...form, username: e.target.value })} />
            {view === "register" && (
              <input type="email" placeholder="Email" required onChange={e => setForm({ ...form, email: e.target.value })} />
            )}
            <input type="password" placeholder="Password" required onChange={e => setForm({ ...form, password: e.target.value })} />
            <button type="submit">Submit</button>
            <button type="button" className="secondary-btn" onClick={() => setView("home")}>Back</button>
          </form>
        </div>
      )}

      {/* ADMIN DASHBOARD VIEW */}
      {view === "admin-dashboard" && (
        <div className="admin-card">
          <h2>Admin Dashboard</h2>

          <h3>Student Registrations</h3>
          <table className="admin-table">
            <thead>
              <tr><th>User</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td><span className={`badge ${u.status.toLowerCase()}`}>{u.status}</span></td>
                  <td>
                    {!u.is_admin && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <select value={u.status} onChange={(e) => updateStatus(u.id, e.target.value)}>
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <button onClick={() => deleteUser(u.id)} className="delete-btn">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginTop: '40px' }}>Course Enquiries</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Phone</th><th>Program</th><th>Date</th></tr>
              </thead>
              <tbody>
                {enquiries.length > 0 ? enquiries.map(enq => (
                  <tr key={enq.id}>
                    <td>{enq.name}</td>
                    <td>{enq.phone_no}</td>
                    <td>{enq.program}</td>
                    <td>{new Date(enq.created_at).toLocaleDateString()}</td>
                  </tr>
                )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No enquiries yet.</td></tr>}
              </tbody>
            </table>
          </div>

          <button style={{ marginTop: '20px' }} onClick={() => setView("home")}>Logout</button>
        </div>
      )}
    </div>
  );
}
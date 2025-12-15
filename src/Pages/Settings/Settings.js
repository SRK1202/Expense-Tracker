import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../page.css";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
    } else {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <h1>Settings</h1>
          <p>Manage your account and preferences</p>
        </div>

        <div className="page-content">
          <div className="settings-section">
            <h2>Account</h2>
            <div className="settings-item">
              <label>Name</label>
              <p>{user?.name || "User"}</p>
            </div>
            <div className="settings-item">
              <label>Email</label>
              <p>{user?.email || "user@example.com"}</p>
            </div>
          </div>

          <div className="settings-section">
            <h2>Security</h2>
            <button className="btn btn-secondary">Change Password</button>
          </div>

          <div className="settings-section danger-zone">
            <h2>Danger Zone</h2>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;

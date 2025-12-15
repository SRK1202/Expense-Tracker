import React from "react";
import "./sidebar.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide sidebar on login/register/setAvatar pages
  const authPages = ["/login", "/register", "/setAvatar"];
  const user = localStorage.getItem("user");
  
  if (authPages.includes(location.pathname) || !user) {
    return null;
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { id: "categories", label: "Categories", icon: <CategoryIcon />, path: "/categories" },
    { id: "settings", label: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar-dark">
      <div className="sidebar-content">
        <h1 className="sidebar-title">Expense Tracker</h1>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

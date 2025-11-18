import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="header-nav">
      {role === "admin" ? (
        <NavLink to="/upload" className="nav-link">Upload Questions</NavLink>
      ) : (
        <>
          <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
          <NavLink to="/formulas" className="nav-link">Formulas</NavLink>
          <NavLink to="/question-bank" className="nav-link">Question Bank</NavLink>
        </>
      )}
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Header;

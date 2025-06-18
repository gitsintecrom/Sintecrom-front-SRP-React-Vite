// src/components/Navbar.jsx (Versión Final Completa)

import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useLayout } from "../context/LayoutContext";
import userImage from "../assets/img/usuario.png";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const { toggleDesktopSidebar, toggleMobileSidebar } = useLayout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 992) {
      toggleMobileSidebar();
    } else {
      toggleDesktopSidebar();
    }
  };

  return (
    <nav className={`main-header navbar navbar-expand ${theme === 'dark' ? 'navbar-dark' : 'navbar-white navbar-light'}`}>
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" onClick={handleToggleSidebar} href="#" role="button">
            <i className="fas fa-bars"></i>
          </a>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <Link to="/" className="nav-link">Home</Link>
        </li>
      </ul>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <a className="nav-link" href="#" role="button" onClick={toggleTheme}>
            {theme === "light" ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
          </a>
        </li>
        {user && (
          <li className="nav-item dropdown user-menu">
            <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown">
              <img src={userImage} className="user-image img-circle elevation-2" alt="User" />
              <span className="d-none d-md-inline">{user.nombre}</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
              <li className="user-header bg-primary">
                <img src={userImage} className="img-circle elevation-2" alt="User" />
                <p>{user.nombre}<small>{user.email}</small></p>
              </li>
              <li className="user-footer">
                <button onClick={handleLogout} className="btn btn-default btn-flat float-right">Cerrar sesión</button>
              </li>
            </ul>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
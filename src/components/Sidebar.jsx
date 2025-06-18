// src/components/Sidebar.jsx

import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLayout } from "../context/LayoutContext";
import menuItems from "../data/menu.json";
import logo from "../assets/img/Logo.png";
import userImage from "../assets/img/usuario.png";

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const { closeMobileSidebar } = useLayout(); // Obtener la función de cierre

  useEffect(() => {
    const parentMenu = menuItems.find((item) =>
      item.children?.some((child) => child.path === location.pathname)
    );
    if (parentMenu) {
      setOpenMenu(parentMenu.id);
    } else {
      setOpenMenu(null);
    }
  }, [location.pathname]);

  const handleMenuClick = (menuId) => {
    setOpenMenu(openMenu === menuId ? null : menuId);
  };

  const renderMenuItems = (items) => {
    return items
      .filter((item) => !item.permiso || hasPermission(item.permiso))
      .map((item) => {
        if (item.children) {
          return (
            <li key={item.id} className={`nav-item ${openMenu === item.id ? "menu-open" : ""}`}>
              <a href="#" className="nav-link" onClick={() => handleMenuClick(item.id)}>
                <i className={`nav-icon ${item.icon}`}></i>
                <p>{item.text}<i className="right fas fa-angle-left"></i></p>
              </a>
              <ul className="nav nav-treeview">{renderMenuItems(item.children)}</ul>
            </li>
          );
        }
        return (
          <li key={item.id} className="nav-item">
            <NavLink to={item.path} className="nav-link" onClick={closeMobileSidebar}>
              <i className={`nav-icon ${item.icon}`}></i>
              <p>{item.text}</p>
            </NavLink>
          </li>
        );
      });
  };

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      <NavLink to="/" className="brand-link" onClick={closeMobileSidebar}>
        <img src={logo} alt="Mi App Logo" className="brand-image img-circle elevation-3 app-logo" style={{ opacity: ".8" }}/>
        <span className="brand-text font-weight-light">{import.meta.env.VITE_APP_NAME}</span>
      </NavLink>
      <div className="sidebar">
        {user && (
          <div className="user-panel mt-3 pb-3 mb-3 d-flex">
            <div className="image">
              <img src={userImage} className="img-circle elevation-2" alt="User" />
            </div>
            <div className="info">
              <a href="#" className="d-block">{user.nombre}</a>
            </div>
          </div>
        )}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" role="menu" data-accordion="false">
            {renderMenuItems(menuItems)}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
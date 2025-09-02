// src/components/Sidebar.jsx (VERSIÓN COMPLETA Y CORREGIDA)

import React, { useState, useEffect } from "react";
import { NavLink, useLocation, Link } from "react-router-dom"; // Importa Link
import { useAuth } from "../context/AuthContext";
import { useLayout } from "../context/LayoutContext";
import menuItems from "../data/menu.json";
import logo from "../assets/img/Logo.png";
import userImage from "../assets/img/usuario.png";
import './Sidebar.css'; // Importamos un CSS específico para el Sidebar

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const { closeMobileSidebar } = useLayout();

  // Encuentra el menú padre de la ruta activa para mantenerlo abierto
  useEffect(() => {
    const activeParent = menuItems.find(item => 
      item.children?.some(child => location.pathname.startsWith(child.path))
    );
    if (activeParent) {
      setOpenMenu(activeParent.id);
    }
  }, [location.pathname]);

  const handleMenuClick = (menuId) => {
    setOpenMenu(openMenu === menuId ? null : menuId);
  };

  const renderMenuItems = (items) => {
    return items
      .filter((item) => !item.permiso || hasPermission(item.permiso))
      .map((item) => {
        const isParentActive = openMenu === item.id;
        
        if (item.children) {
          return (
            <li key={item.id} className={`nav-item ${isParentActive ? "menu-open" : ""}`}>
              <a href="#" className="nav-link" onClick={() => handleMenuClick(item.id)}>
                <i className={`nav-icon ${item.icon}`}></i>
                <p>{item.text}<i className="right fas fa-angle-left"></i></p>
              </a>
              <ul className="nav nav-treeview">{renderMenuItems(item.children)}</ul>
            </li>
          );
        }
        
        // ===== LÓGICA CORREGIDA PARA EL ENLACE INDIVIDUAL =====
        return (
          <li key={item.id} className="nav-item">
            <NavLink 
              to={item.path} 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={closeMobileSidebar}
            >
              <i className={`nav-icon ${item.icon}`}></i>
              <p>{item.text}</p>
            </NavLink>
          </li>
        );
      });
  };

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      <Link to="/" className="brand-link" onClick={closeMobileSidebar}>
        <img src={logo} alt="Mi App Logo" className="brand-image img-circle elevation-3 app-logo" style={{ opacity: ".8" }}/>
        <span className="brand-text font-weight-light">{import.meta.env.VITE_APP_NAME}</span>
      </Link>
      <div className="sidebar">
        {user && (
          <div className="user-panel mt-3 pb-3 mb-3 d-flex">
            <div className="image">
              <img src={userImage} className="img-circle elevation-2" alt="User" />
            </div>
            <div className="info">
              {/* Usamos un div en lugar de <a> para evitar el subrayado */}
              <div className="d-block" style={{color: '#c2c7d0', cursor: 'default'}}>{user.nombre}</div>
            </div>
          </div>
        )}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            {renderMenuItems(menuItems)}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
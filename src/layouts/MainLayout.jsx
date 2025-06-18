// src/layouts/MainLayout.jsx

import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useLayout } from '../context/LayoutContext';
import { Tooltip } from 'react-tooltip';

const MainLayout = () => {
  const { isDesktopCollapsed, isMobileOpen, closeMobileSidebar } = useLayout();
  const location = useLocation();

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname]);

  // Aplica las clases de layout al <body>
  useEffect(() => {
    const body = document.body;
    body.classList.add('sidebar-mini', 'layout-fixed');

    // Lógica de escritorio
    if (isDesktopCollapsed) {
      body.classList.add('sidebar-collapse');
    } else {
      body.classList.remove('sidebar-collapse');
    }
    
    // Lógica de móvil
    if (isMobileOpen) {
      body.classList.add('sidebar-open');
    } else {
      body.classList.remove('sidebar-open');
    }

    // Función de limpieza al desmontar el layout
    return () => {
      body.classList.remove('sidebar-mini', 'layout-fixed', 'sidebar-collapse', 'sidebar-open');
    };
  }, [isDesktopCollapsed, isMobileOpen]);

  return (
    <>
      {/* Overlay para cerrar el menú en móvil */}
      <div className="sidebar-overlay" onClick={closeMobileSidebar}></div>

      <div className="wrapper">
        <Navbar />
        <Sidebar />
        <div className="content-wrapper">
          <Outlet />
        </div>
        <Footer />
        <Tooltip id="my-tooltip" />
      </div>
    </>
  );
};

export default MainLayout;
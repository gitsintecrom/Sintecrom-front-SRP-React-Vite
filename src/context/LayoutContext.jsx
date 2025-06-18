// src/context/LayoutContext.jsx

import React, { createContext, useState, useContext } from 'react';

const LayoutContext = createContext();
export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({ children }) => {
  // Estado para el colapso en escritorio
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);
  // Estado para la apertura en móvil
  const [isMobileOpen, setMobileOpen] = useState(false);

  // Funciones específicas para cada modo
  const toggleDesktopSidebar = () => {
    setDesktopCollapsed(prev => !prev);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(prev => !prev);
  };
  
  // Cierra el menú móvil (usado al cambiar de página o al hacer clic fuera)
  const closeMobileSidebar = () => {
    if (isMobileOpen) {
      setMobileOpen(false);
    }
  };

  const value = { 
    isDesktopCollapsed, 
    isMobileOpen, 
    toggleDesktopSidebar,
    toggleMobileSidebar,
    closeMobileSidebar 
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};
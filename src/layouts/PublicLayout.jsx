// src/layouts/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  // Este useEffect aplica la clase SOLO cuando este layout está activo.
  React.useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  return (
    // Outlet renderizará Login o Register
    <Outlet /> 
  );
};

export default PublicLayout;
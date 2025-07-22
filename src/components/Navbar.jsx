// /src/components/Navbar.jsx (Versión Final Completa)

import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import axiosInstance from "../api/axiosInstance"; // <-- Asegúrate de importar tu instancia de axios
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

  // --- FUNCIÓN NUEVA PARA CAMBIAR CONTRASEÑA ---
  const handleChangePassword = () => {
    Swal.fire({
      title: 'Cambiar Contraseña',
      html: `
        <input type="password" id="swal-current-password" class="swal2-input" placeholder="Contraseña Actual" autocomplete="current-password">
        <input type="password" id="swal-new-password" class="swal2-input" placeholder="Nueva Contraseña" autocomplete="new-password">
        <input type="password" id="swal-confirm-password" class="swal2-input" placeholder="Confirmar Nueva Contraseña" autocomplete="new-password">
      `,
      confirmButtonText: 'Cambiar',
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const currentPassword = document.getElementById('swal-current-password').value;
        const newPassword = document.getElementById('swal-new-password').value;
        const confirmPassword = document.getElementById('swal-confirm-password').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
          Swal.showValidationMessage('Por favor, complete todos los campos.');
          return false;
        }
        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('Las nuevas contraseñas no coinciden.');
          return false;
        }
        if (newPassword.length < 6) {
          Swal.showValidationMessage('La nueva contraseña debe tener al menos 6 caracteres.');
          return false;
        }

        return { currentPassword, newPassword };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { currentPassword, newPassword } = result.value;
        try {
          Swal.fire({ title: 'Cambiando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
          
          // Llamada al nuevo endpoint del backend
          await axiosInstance.post('/users/change-password', { currentPassword, newPassword });
          
          Swal.close();
          Swal.fire({
            title: '¡Éxito!',
            text: 'Tu contraseña ha sido cambiada.',
            icon: 'success',
          });
        } catch (error) {
          Swal.close();
          Swal.fire({
            title: 'Error',
            text: error.response?.data?.error || 'No se pudo cambiar la contraseña.',
            icon: 'error',
          });
        }
      }
    });
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
                {/* --- BOTÓN NUEVO --- */}
                <button onClick={handleChangePassword} className="btn btn-default btn-flat">Cambiar Pass</button>
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
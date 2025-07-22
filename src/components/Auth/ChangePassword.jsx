// /src/pages/ChangePassword.jsx (VERSIÓN FINAL AUTÓNOMA)

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { passwordChanged } = useAuth();
  const navigate = useNavigate();

  // ESTE USEEFFECT ES LA CLAVE DE TODO EL ESTILO
  useEffect(() => {
    document.body.classList.add("login-page"); // Añade la clase al montar
    return () => {
      document.body.classList.remove("login-page"); // La quita al desmontar
    };
  }, []); // El array vacío asegura que solo se ejecute una vez

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);

    try {
      await axiosInstance.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      passwordChanged();
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Contraseña actualizada. Serás redirigido.',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      navigate('/abastecimiento');
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Hubo un error al cambiar la contraseña.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <a href="#" className="h1"><b>Sintecrom</b></a>
        </div>
        <div className="card-body">
          <p className="login-box-msg">Debes establecer una nueva contraseña para continuar</p>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="input-group mb-3">
              <input type="password" name="currentPassword" placeholder="Contraseña Actual" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="form-control" required autoComplete="current-password" />
              <div className="input-group-append"><div className="input-group-text"><span className="fas fa-lock"></span></div></div>
            </div>
            <div className="input-group mb-3">
              <input type="password" name="newPassword" placeholder="Nueva Contraseña" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="form-control" required autoComplete="new-password" />
              <div className="input-group-append"><div className="input-group-text"><span className="fas fa-lock"></span></div></div>
            </div>
            <div className="input-group mb-3">
              <input type="password" name="confirmPassword" placeholder="Confirmar Nueva Contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-control" required autoComplete="new-password" />
              <div className="input-group-append"><div className="input-group-text"><span className="fas fa-lock"></span></div></div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Cambiar Contraseña'}
            </button>
            {error && <p className="text-danger mt-2">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
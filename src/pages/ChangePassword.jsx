import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import axiosInstance from '../api/axiosInstance';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post('/users/change-password', {
        currentPassword,
        newPassword,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.message === "Contraseña actualizada exitosamente.") {
        const updatedUser = { ...user, cambioPassword: false };
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Ajusta según tu implementación
        navigate('/abastecimiento');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Hubo un error al cambiar la contraseña.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <h3>Cambiar Contraseña</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña Actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Nueva Contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                'Cambiar Contraseña'
              )}
            </button>
            {error && <p className="text-danger mt-2">{error}</p>}
          </form>
        </div>
      </div>
      <style>
        {`
          .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100vh;
            margin: 0;
            background-color: #ffffff; /* Fondo blanco completo */
          }
          .card {
            width: 100%;
            max-width: 400px; /* Ancho máximo del card */
          }
        `}
      </style>
    </div>
  );
};

export default ChangePassword;
// /src/components/Auth/Login.jsx (Versión Final con Estilos Corregidos)

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import axiosInstance from '../../api/axiosInstance';

const Login = () => {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // useEffect para gestionar la clase del <body> y asegurar el estilo correcto
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', {
        nombre,
        password,
      });

      const data = response.data;

      if (data.success && data.token) {
        login(data.token, data.user);
        
        if (data.user.cambioPassword === 1 || data.user.cambioPassword === true) {
          navigate('/change-password');
        } else {
          navigate('/abastecimiento');
        }
      } else {
        setError(data.message || "Credenciales incorrectas.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Hubo un error al iniciar sesión.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          {/* Título como en ChangePassword */}
          <a href="#" className="h1"><b>Sintecrom</b></a> 
        </div>
        <div className="card-body">
          {/* Mensaje de bienvenida */}
          <p className="login-box-msg">Inicia sesión para comenzar</p> 
          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Input de usuario con ícono */}
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre de Usuario"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                disabled={loading}
                autoComplete="username"
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-user"></span>
                </div>
              </div>
            </div>
            {/* Input de contraseña con ícono */}
            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-lock"></span>
                </div>
              </div>
            </div>
            {/* Botón dentro de una fila para ocupar todo el ancho */}
            <div className="row">
                <div className="col-12">
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                        'Iniciar Sesión'
                    )}
                    </button>
                </div>
            </div>
            {/* Mensaje de error centrado */}
            {error && <p className="text-danger mt-3 text-center">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
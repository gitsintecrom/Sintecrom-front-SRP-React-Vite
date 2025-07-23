// /src/context/AuthContext.jsx (VERSIÓN FINAL Y CORRECTA)

import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

// 1. Crear el contexto (no se exporta)
const AuthContext = createContext(null);

// 2. Crear y EXPORTAR el hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

// 3. Crear y EXPORTAR el Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        if (decodedToken.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(decodedToken);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };
  
  const passwordChanged = () => {
    if (user) {
      const updatedUser = { ...user, cambioPassword: 0 };
      setUser(updatedUser);
    }
  };

  const hasPermission = (permisoClave) => {
    if (!user || !user.permisos) return false;
    return user.permisos.includes(permisoClave);
  };

  const value = { user, token, loading, login, logout, hasPermission, passwordChanged };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
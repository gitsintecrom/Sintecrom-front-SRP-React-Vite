import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // --- LÓGICA DE INACTIVIDAD ---
  
  // 1. Leer el valor en minutos desde las variables de entorno.
  // Usamos el operador '||' para tener un valor por defecto (15) si no está definido.
  const inactivityMinutes = parseInt(import.meta.env.VITE_INACTIVITY_MINUTES) || 15;

  // 2. Convertir los minutos a milisegundos.
  const INACTIVITY_TIMEOUT = inactivityMinutes * 60 * 1000;
  
  useEffect(() => {
    // No iniciar el timer si no hay usuario logueado
    if (!user) {
      return;
    }

    let inactivityTimer;

    const handleLogout = () => {
      console.log("Cerrando sesión por inactividad.");
      logout();
    };

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    };

    // Eventos que consideraremos como "actividad"
    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll'
    ];

    // Añadir los event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Iniciar el temporizador por primera vez
    resetInactivityTimer();

    // Función de limpieza que se ejecuta cuando el usuario se desloguea o el componente se desmonta
    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [user]); // Este efecto depende del estado 'user'. Se activa cuando el usuario se loguea y se limpia cuando se desloguea.

  // --- FIN DE LÓGICA DE INACTIVIDAD ---


  useEffect(() => {
    // ... (El useEffect de inicialización de token al cargar la página se mantiene igual)
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          const decodedToken = jwtDecode(storedToken);
          if (decodedToken.exp * 1000 < Date.now()) {
            logout();
          } else {
            setUser(decodedToken);
            setToken(storedToken);
          }
        }
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);
  
  useEffect(() => {
    // ... (El useEffect de verificación periódica de token se mantiene igual)
    if (!token) return;
    const checkTokenExpiration = () => {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          console.log("Token ha expirado. Cerrando sesión...");
          logout();
        }
      } catch (error) {
        logout();
      }
    };
    const interval = setInterval(checkTokenExpiration, 10000);
    return () => clearInterval(interval);
  }, [token]);

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

  const hasPermission = (permisoClave) => {
    if (!user || !user.permisos) return false;
    return user.permisos.includes(permisoClave);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
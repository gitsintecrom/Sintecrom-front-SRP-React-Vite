// /src/utils/ProtectedRoute.jsx (VERSIÓN FINAL Y CORRECTA)

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // <-- La importación vuelve a ser la original
import MainLayout from "../layouts/MainLayout";

const ProtectedRoute = () => {
  const { user, token, loading } = useAuth();

  // 1. Mientras el contexto está verificando el token, mostramos un loader.
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }

  // 2. Si después de cargar no hay token, redirigimos al login.
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // 3. Si hay token y usuario, pero se requiere cambio de contraseña, a la página de cambio.
  if (user && user.cambioPassword === 1) {
      return <Navigate to="/change-password" replace />;
  }

  // 4. Si todo está en orden, mostramos la aplicación.
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default ProtectedRoute;
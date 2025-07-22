// /src/main.jsx (Versión Final Corregida)

import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importar proveedores de contexto y rutas protegidas
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { LayoutProvider } from "./context/LayoutContext";
import ProtectedRoute from "./utils/ProtectedRoute";

import "./index.css";

// --- PÁGINAS DE CARGA NORMAL (RÁPIDA) ---
// Quitamos PublicLayout porque ya no se usa
import MainLayout from "./layouts/MainLayout"; 
import NotFoundPage from "./pages/NotFoundPage";
import Login from "./components/Auth/Login";
import ChangePassword from "./pages/ChangePassword";

// --- PÁGINAS DE CARGA PEREZOSA (LAZY) ---
const Abastecimiento = lazy(() => import("./pages/Abastecimiento"));
const Programacion = lazy(() => import("./pages/Programacion"));
const Registracion = lazy(() => import("./pages/Registracion"));
const Calidad = lazy(() => import("./pages/Calidad"));
const Ingreso = lazy(() => import("./pages/Ingreso"));
const Comercial = lazy(() => import("./pages/Comercial"));
const Parametros = lazy(() => import("./pages/Parametros"));
const Operaciones = lazy(() => import("./pages/Operaciones"));
const ListadoUsuarios = lazy(() => import('./pages/usuarios/ListadoUsuarios'));
const CrearUsuario = lazy(() => import('./pages/usuarios/CrearUsuario'));
const VerUsuario = lazy(() => import('./pages/usuarios/VerUsuario'));
const EditarUsuario = lazy(() => import('./pages/usuarios/EditarUsuario'));
const ListadoPermisos = lazy(() => import('./pages/permisos/ListadoPermisos'));
const CrearPermiso = lazy(() => import('./pages/permisos/CrearPermiso'));
const VerPermiso = lazy(() => import('./pages/permisos/VerPermiso'));
const EditarPermiso = lazy(() => import('./pages/permisos/EditarPermiso'));
const ListadoRoles = lazy(() => import('./pages/roles/ListadoRoles'));
const CrearRol = lazy(() => import('./pages/roles/CrearRol'));
const VerRol = lazy(() => import('./pages/roles/VerRol'));
const EditarRol = lazy(() => import('./pages/roles/EditarRol'));
const AsignarPermisos = lazy(() => import('./pages/roles/AsignarPermisos'));
const Resecuenciar = lazy(() => import('./pages/programacion/Resecuenciar'));
const RechazoCalidad = lazy(() => import('./pages/programacion/RechazoCalidad'));
const ParadasAutomaticas = lazy(() => import('./pages/programacion/ParadasAutomaticas'));

// Componente visual de carga para mostrar mientras se descarga el componente perezoso
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
      <span className="sr-only">Cargando...</span>
    </div>
  </div>
);

// --- RENDERIZADO DE LA APLICACIÓN ---
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <LayoutProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* ===== INICIO DE LA CORRECCIÓN ===== */}
                {/* RUTAS PÚBLICAS (AUTÓNOMAS) */}
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ChangePassword />} />
                {/* ===== FIN DE LA CORRECCIÓN ===== */}

                {/* Rutas protegidas */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Navigate to="/abastecimiento" replace />} />
                    <Route path="abastecimiento" element={<Abastecimiento />} />
                    <Route path="programacion/:codigoMaquina" element={<Resecuenciar />} />
                    <Route path="programacion/rechazo" element={<RechazoCalidad />} />
                    <Route path="programacion/paradas" element={<ParadasAutomaticas />} />
                    <Route path="registracion" element={<Registracion />} />
                    <Route path="calidad" element={<Calidad />} />
                    <Route path="ingreso" element={<Ingreso />} />
                    <Route path="comercial" element={<Comercial />} />
                    <Route path="parametros" element={<Parametros />} />
                    <Route path="operaciones" element={<Operaciones />} />
                    <Route path="usuarios/listado" element={<ListadoUsuarios />} />
                    <Route path="usuarios/crear" element={<CrearUsuario />} />
                    <Route path="usuarios/ver/:id" element={<VerUsuario />} />
                    <Route path="usuarios/editar/:id" element={<EditarUsuario />} />
                    <Route path="permisos/listado" element={<ListadoPermisos />} />
                    <Route path="permisos/crear" element={<CrearPermiso />} />
                    <Route path="permisos/ver/:id" element={<VerPermiso />} />
                    <Route path="permisos/editar/:id" element={<EditarPermiso />} />
                    <Route path="roles/listado" element={<ListadoRoles />} />
                    <Route path="roles/crear" element={<CrearRol />} /> 
                    <Route path="roles/ver/:id" element={<VerRol />} />
                    <Route path="roles/editar/:id" element={<EditarRol />} />
                    <Route path="roles/asignar-permisos/:id" element={<AsignarPermisos />} />
                  </Route>
                </Route>

                {/* Ruta para páginas no encontradas */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </LayoutProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
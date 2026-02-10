// /src/main.jsx (Versión Final Completa y Corregida)

import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importar proveedores de contexto y rutas protegidas
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LayoutProvider } from "./context/LayoutContext";
import ProtectedRoute from "./utils/ProtectedRoute";

import "./index.css";

import 'bootstrap/dist/css/bootstrap.min.css';

// --- PÁGINAS DE CARGA NORMAL (RÁPIDA) ---
import Login from "./components/Auth/Login";
import ChangePassword from "./pages/ChangePassword";
import NotFoundPage from "./pages/NotFoundPage";

// --- PÁGINAS DE CARGA PEREZOSA (LAZY) ---
const Abastecimiento = lazy(() => import("./pages/Abastecimiento"));
const Programacion = lazy(() => import("./pages/Programacion"));
const Registracion = lazy(() => import("./pages/Registracion"));
const Calidad = lazy(() => import("./pages/Calidad"));
const Ingreso = lazy(() => import("./pages/Ingreso"));
const Comercial = lazy(() => import("./pages/Comercial"));
const Parametros = lazy(() => import("./pages/Parametros"));
const Operaciones = lazy(() => import("./pages/Operaciones"));
// 👇 AÑADE ESTAS TRES LÍNEAS 👇
const OperacionesSlitter = lazy(() => import("./pages/OperacionesSlitter"));
const OperacionesEmbalaje = lazy(() => import("./pages/OperacionesEmbalaje"));
const OperacionesPlancha = lazy(() => import("./pages/OperacionesPlancha"));

const DetalleOperacion = lazy(() => import("./pages/DetalleOperacion")); // 1. Importar el nuevo componente
const EditarOperacion = lazy(() => import("./pages/EditarOperacion"));
const InspeccionSlitter = lazy(() => import("./pages/InspeccionSlitter"));
const FichaTecnica = lazy(() => import("./pages/FichaTecnica"));
const FichaTecnicaDetalle = lazy(() => import("./pages/FichaTecnicaDetalle"));

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

// Componente visual de carga
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
      <span className="sr-only">Cargando...</span>
    </div>
  </div>
);

// Componente para manejar la redirección desde la raíz
const RootRedirect = () => {
  const { token, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return token ? <Navigate to="/abastecimiento" replace /> : <Navigate to="/login" replace />;
};

// --- RENDERIZADO DE LA APLICACIÓN ---
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.VITE_PUBLIC_BASE_PATH}>
      <AuthProvider>
        <ThemeProvider>
          <LayoutProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ChangePassword />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="abastecimiento" element={<Abastecimiento />} />
                  <Route path="programacion" element={<Programacion />} />
                  <Route path="programacion/:codigoMaquina" element={<Resecuenciar />} />
                  <Route path="programacion/rechazo" element={<RechazoCalidad />} />
                  <Route path="programacion/paradas" element={<ParadasAutomaticas />} />
                  
                  <Route path="registracion" element={<Registracion />} />
                  <Route path="registracion/operaciones/:maquinaId" element={<Operaciones />} />
                  <Route path="registracion/detalle/:operacionId" element={<DetalleOperacion />} />
                  <Route path="registracion/editar/:operacionId" element={<EditarOperacion />} />
                  <Route path="registracion/inspeccion/:operacionId/:loteId" element={<InspeccionSlitter />} />
                  <Route path="registracion/fichatecnica/:operacionId" element={<FichaTecnica />} />
                  <Route path="registracion/fichatecnica/detalle/:codProd" element={<FichaTecnicaDetalle />} />

                  {/* NUEVAS RUTAS ESPECÍFICAS */}
                  <Route path="registracion/operaciones/slitter/:maquinaId" element={<OperacionesSlitter />} />
                  <Route path="registracion/operaciones/embalaje/:maquinaId" element={<OperacionesEmbalaje />} />
                  <Route path="registracion/operaciones/plancha/:maquinaId" element={<OperacionesPlancha />} />

                  <Route path="calidad" element={<Calidad />} />
                  <Route path="ingreso" element={<Ingreso />} />
                  <Route path="comercial" element={<Comercial />} />
                  <Route path="parametros" element={<Parametros />} />
                  <Route path="operaciones" element={<Operaciones />} />

                  {/* Resto de tus rutas */}
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
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </LayoutProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
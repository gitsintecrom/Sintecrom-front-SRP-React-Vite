// src/main.jsx (corregido con lazy loading para tu nueva estructura)

import React, { Suspense, lazy } from "react"; // 1. IMPORTAR Suspense y lazy
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importar proveedores de contexto y rutas protegidas
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { LayoutProvider } from "./context/LayoutContext";
import ProtectedRoute from "./utils/ProtectedRoute";

import "./index.css";

// --- PÁGINAS DE CARGA NORMAL (RÁPIDA) ---
import MainLayout from "./layouts/MainLayout";
import PublicLayout from "./layouts/PublicLayout"; 

import Dashboard from "./pages/Dashboard"; // Aunque no lo uses en las rutas, puede que lo necesites después
import Abastecimiento from "./pages/Abastecimiento";
import Programacion from "./pages/Programacion";
import Registracion from "./pages/Registracion";
import Calidad from "./pages/Calidad";
import Ingreso from "./pages/Ingreso";
import Comercial from "./pages/Comercial";
import Parametros from "./pages/Parametros";
import Operaciones from "./pages/Operaciones";

import CrearUsuario from './pages/usuarios/CrearUsuario';
import VerUsuario from './pages/usuarios/VerUsuario';
import EditarUsuario from './pages/usuarios/EditarUsuario';

import NotFoundPage from "./pages/NotFoundPage";
import Login from "./components/Auth/Login";

// --- PÁGINA DE CARGA PEREZOSA (LAZY) ---
// La página con DataTables es la que cargaremos de forma perezosa
const ListadoUsuarios = lazy(() => import('./pages/usuarios/ListadoUsuarios'));

// Componente visual de carga para mostrar mientras se descarga el componente perezoso
const LoadingSpinner = () => (
  <div className="content-wrapper d-flex justify-content-center align-items-center">
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
            {/* 2. ENVOLVER LAS RUTAS CON SUSPENSE */}
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* RUTAS PÚBLICAS */}
                <Route element={<PublicLayout />}>
                  <Route path="/login" element={<Login />} />
                </Route>

                {/* Rutas protegidas */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<MainLayout />}>
                    {/* Redirección inicial a /abastecimiento */}
                    <Route index element={<Navigate to="/abastecimiento" replace />} />
                    
                    {/* Rutas de las páginas */}
                    <Route path="abastecimiento" element={<Abastecimiento />} />
                    <Route path="programacion" element={<Programacion />} />
                    <Route path="registracion" element={<Registracion />} />
                    <Route path="calidad" element={<Calidad />} />
                    <Route path="ingreso" element={<Ingreso />} />
                    <Route path="comercial" element={<Comercial />} />
                    <Route path="parametros" element={<Parametros />} />
                    <Route path="operaciones" element={<Operaciones />} />

                    {/* 3. RUTA QUE USA EL COMPONENTE PEREZOSO */}
                    <Route path="usuarios/listado" element={<ListadoUsuarios />} />
                    <Route path="usuarios/crear" element={<CrearUsuario />} />
                    <Route path="usuarios/ver/:id" element={<VerUsuario />} />
                    <Route path="usuarios/editar/:id" element={<EditarUsuario />} />
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
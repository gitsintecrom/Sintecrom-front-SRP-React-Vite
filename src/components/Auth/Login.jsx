// // src/components/Auth/Login.jsx (Versión Final con manejo de clases del body)

// import React, { useState, useEffect } from "react"; // 1. IMPORTAR useEffect
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from "../../context/AuthContext";
// import axiosInstance from '../../api/axiosInstance';

// const Login = () => {
//   const [nombre, setNombre] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { login } = useAuth();
//   const navigate = useNavigate();

//   // 2. AÑADIR ESTE useEffect PARA MANEJAR LAS CLASES DEL BODY
//   useEffect(() => {
//     const body = document.body;
//     // Añade SOLO la clase que necesita
//     body.classList.add('login-page');

//     // La función de limpieza se asegura de quitarla al salir
//     return () => {
//       body.classList.remove('login-page');
//     };
//   }, []); // Se ejecuta solo al montar/desmontar

//   const handleSubmit = async (e) => {
//     // ... (la lógica de handleSubmit no cambia)
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await axiosInstance.post('/auth/login', { nombre, password });
//       const data = response.data;
//       if (data.success && data.token) {
//         login(data.token, data.user);
//         navigate('/abastecimiento');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || "Hubo un error al iniciar sesión.";
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // En el return, ya no necesitamos el div con la clase 'login-page'
//   // porque la clase ahora está en el body, como AdminLTE espera.
//   return (
//     <div className="login-box">
//       <div className="card card-outline card-primary">
//         <div className="card-header text-center">
//           <h3>{import.meta.env.VITE_APP_NAME}</h3>
//         </div>
//         <div className="card-body">
//           {/* Añadir autoComplete="off" al formulario */}
//           <form onSubmit={handleSubmit} autoComplete="off">
//             <div className="input-group mb-3">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Nombre de Usuario"
//                 value={nombre}
//                 onChange={(e) => setNombre(e.target.value)}
//                 required
//                 disabled={loading}
//                 autoComplete="new-password" // <-- Truco para desactivar
//               />
//             </div>
//             <div className="input-group mb-3">
//               <input
//                 type="password"
//                 className="form-control"
//                 placeholder="Contraseña"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 disabled={loading}
//                 autoComplete="new-password" // <-- Truco para desactivar
//               />
//             </div>
//             <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
//               {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Iniciar Sesión'}
//             </button>
//             {error && <p className="text-danger mt-2">{error}</p>}
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;




// src/components/Auth/Login.jsx

import React, { useState } from "react";
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

  // Ya NO es necesario el useEffect aquí. PublicLayout lo maneja.

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
        navigate('/abastecimiento'); // Redirección con el hook de React Router
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
    // El div exterior con clase 'login-page' se ha quitado.
    // El layout 'PublicLayout' ahora añade la clase al <body>.
    <div className="login-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <h3>{import.meta.env.VITE_APP_NAME}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre de Usuario"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
            {error && <p className="text-danger mt-2">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
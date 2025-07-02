// import React from "react";
// import { Link } from "react-router-dom";

// // 1. Importa la imagen de la página 404 desde tu carpeta de assets
// import notFoundImage from "../assets/img/404.png"; // <-- ¡Ajusta el nombre del archivo si es diferente!

// const NotFoundPage = () => {
//   return (
//     <>
//       {/* DESPUÉS */}
//       <div className="content-header">
//         <div className="container-fluid">
//           <div className="row mb-2">
//             {/* Hacemos que la columna ocupe todo el ancho y centramos el texto */}
//             <div className="col-12 text-center mt-5">
//               <br />
//               <h1
//                 className="m-0"
//                 style={{
//                   color: "red",
//                   marginTop: "20px", // <-- AÑADIMOS MARGEN SUPERIOR
//                   marginBottom: "20px", // <-- AÑADIMOS MARGEN INFERIOR (opcional, para separar de la imagen)
//                 }}
//               >
//                 404 - Página no encontrada
//               </h1>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="content">
//         <div className="container-fluid">
//           <div
//             className="error-page"
//             style={{
//               width: "100%",
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               textAlign: "center",
//               marginTop: "50px",
//             }}
//           >
//             {/* 2. Usa la imagen importada */}
//             <img
//               src={notFoundImage}
//               alt="Página no encontrada"
//               style={{ maxWidth: "400px", marginBottom: "20px" }}
//             />

//             <div className="error-content">
//               <h3>
//                 <i className="fas fa-exclamation-triangle text-warning"></i> No
//                 se ha podido encontrar la página.
//               </h3>
//               <p>
//                 Por favor, contacte al administrador del sistema si cree que es
//                 un error. Mientras tanto, puede regresar al panel principal.
//               </p>

//               {/* 3. El botón para regresar */}
//               <Link to="/" className="btn btn-primary">
//                 Regresar
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default NotFoundPage;







// src/pages/NotFoundPage.jsx (Versión Final con Tema Dinámico)

import React, { useContext } from 'react'; // 1. Importar useContext
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext'; // 2. Importar el contexto del tema
import notFoundImage from '../assets/img/404.png';

const NotFoundPage = () => {
  const { theme } = useContext(ThemeContext); // 3. Obtener el tema actual

  // Definimos los colores dinámicamente
  const textColor = theme === 'dark' ? 'text-white' : '';
  const titleColor = theme === 'dark' ? '#ff8a8a' : 'red'; // Un rojo más suave para el modo oscuro

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-12 text-center mt-4">
              <h1 className="m-0" style={{ color: titleColor }}>
                404 - Página no encontrada
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="container-fluid">
          <div 
            className="error-page"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <img
              src={notFoundImage}
              alt="Página no encontrada"
              style={{ maxWidth: "400px", marginBottom: "20px" }}
            />

            {/* 4. Aplicar la clase de color de texto dinámico */}
            <div className={`error-content ${textColor}`}>
              <h3>
                <i className="fas fa-exclamation-triangle text-warning"></i> No se ha podido encontrar la página.
              </h3>
              <p className="mt-3">
                Por favor, contacte al administrador del sistema si cree que es un error.
                <br/>
                Mientras tanto, puede regresar al panel principal.
              </p>
              
              <Link to="/" className="btn btn-primary mt-2">
                Regresar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
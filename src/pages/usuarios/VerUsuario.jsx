// src/pages/usuarios/VerUsuario.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const VerUsuario = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); // Hook de React Router para obtener el ID de la URL

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await axiosInstance.get(`/users/${id}`);
        setUsuario(response.data);
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
        Swal.fire('Error', 'No se pudo cargar la información del usuario.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsuario();
  }, [id]); // El efecto se ejecuta cada vez que el ID de la URL cambie

  if (loading) {
    return (
      <div className="content-wrapper d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }
  
  if (!usuario) {
    return (
      <div className="content-wrapper">
         <div className="content-header">
            <div className="container-fluid"><h1>Usuario no encontrado</h1></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"><h1><b>Detalles del Usuario</b></h1><hr/></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="row d-flex justify-content-center">
            <div className="col-md-6">
              <div className="card card-outline card-primary">
                <div className="card-header"><h3 className="card-title">Información de {usuario.name}</h3></div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-4">ID de Usuario</dt>
                    <dd className="col-sm-8">{usuario.id}</dd>

                    <dt className="col-sm-4">Nombre</dt>
                    <dd className="col-sm-8">{usuario.name}</dd>

                    <dt className="col-sm-4">Email</dt>
                    <dd className="col-sm-8">{usuario.email || 'No especificado'}</dd>

                    <dt className="col-sm-4">Rol</dt>
                    <dd className="col-sm-8">
                      <span className={`badge ${usuario.rol === 'Administrador' ? 'badge-danger' : 'badge-info'}`}>
                        {usuario.rol}
                      </span>
                    </dd>
                  </dl>
                </div>
                <div className="card-footer">
                  <Link to="/usuarios/listado" className="btn btn-secondary"><i className="fas fa-reply"></i> Volver</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerUsuario;
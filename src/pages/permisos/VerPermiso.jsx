// src/pages/permisos/VerPermiso.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const VerPermiso = () => {
  const [permiso, setPermiso] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchPermiso = async () => {
      try {
        const response = await axiosInstance.get(`/permisos/${id}`);
        setPermiso(response.data);
      } catch (error) {
        Swal.fire('Error', 'No se pudo cargar la información del permiso.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPermiso();
  }, [id]);

  if (loading) {
    return <div className="content-wrapper d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"></div></div>;
  }
  
  if (!permiso) {
    return <div className="content-wrapper"><div className="content-header"><h1>Permiso no encontrado</h1></div></div>;
  }

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"><h1><b>Detalles del Permiso</b></h1><hr/></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="row d-flex justify-content-center">
            <div className="col-md-6">
              <div className="card card-outline card-primary">
                <div className="card-header"><h3 className="card-title">Información de: {permiso.nombre}</h3></div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-4">ID de Permiso</dt>
                    <dd className="col-sm-8">{permiso.id}</dd>
                    <dt className="col-sm-4">Nombre</dt>
                    <dd className="col-sm-8">{permiso.nombre}</dd>
                    <dt className="col-sm-4">Clave</dt>
                    <dd className="col-sm-8"><code>{permiso.clave}</code></dd>
                  </dl>
                </div>
                <div className="card-footer">
                  <Link to="/permisos/listado" className="btn btn-secondary"><i className="fas fa-reply"></i> Volver</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerPermiso;
// src/pages/roles/VerRol.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const VerRol = () => {
  const [rol, setRol] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchRolData = async () => {
      try {
        // Hacemos dos llamadas en paralelo para obtener el rol y TODOS los permisos
        const [rolRes, permisosRes] = await Promise.all([
          axiosInstance.get(`/roles/${id}`),
          axiosInstance.get('/permisos')
        ]);
        
        setRol(rolRes.data);

        // Filtramos la lista completa de permisos para mostrar solo los que tiene el rol
        const permisosAsignados = permisosRes.data.filter(p => rolRes.data.permisos.includes(p.id));
        setPermisos(permisosAsignados);

      } catch (error) {
        Swal.fire('Error', 'No se pudo cargar la información del rol.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchRolData();
  }, [id]);

  if (loading) {
    return <div className="content-wrapper d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"></div></div>;
  }
  
  if (!rol) {
    return <div className="content-wrapper"><div className="content-header"><h1>Rol no encontrado</h1></div></div>;
  }

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"><h1><b>Detalles del Rol</b></h1><hr/></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6">
              <div className="card card-outline card-primary">
                <div className="card-header"><h3 className="card-title">Información de: {rol.nombre}</h3></div>
                <div className="card-body">
                  <dl className="row">
                    <dt className="col-sm-4">ID de Rol</dt>
                    <dd className="col-sm-8">{rol.id}</dd>
                    <dt className="col-sm-4">Nombre</dt>
                    <dd className="col-sm-8">{rol.nombre}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card card-outline card-info">
                <div className="card-header"><h3 className="card-title">Permisos Asignados</h3></div>
                <div className="card-body">
                  {permisos.length > 0 ? (
                    <ul className="list-group">
                      {permisos.map(p => (
                        <li key={p.id} className="list-group-item">{p.nombre}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Este rol no tiene permisos asignados.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
              <div className="col-12 mt-3">
                  <Link to="/roles/listado" className="btn btn-secondary"><i className="fas fa-reply"></i> Volver</Link>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerRol;
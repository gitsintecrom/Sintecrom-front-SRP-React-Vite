// src/pages/permisos/EditarPermiso.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const EditarPermiso = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [clave, setClave] = useState('');
  const [initialNombre, setInitialNombre] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermiso = async () => {
      try {
        const response = await axiosInstance.get(`/permisos/${id}`);
        const permisoData = response.data;
        setNombre(permisoData.nombre);
        setInitialNombre(permisoData.nombre); // Para el título
        setClave(permisoData.clave);
      } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los datos del permiso.', 'error');
        navigate('/permisos');
      } finally {
        setLoading(false);
      }
    };
    fetchPermiso();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!nombre) newErrors.nombre = 'El nombre es requerido.';
    if (!clave) newErrors.clave = 'La clave es requerida.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await axiosInstance.put(`/permisos/${id}`, { nombre, clave });

      Swal.fire({
        icon: 'success',
        title: '¡Permiso Actualizado!',
        text: 'El permiso ha sido modificado con éxito.',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        willClose: () => {
          navigate('/permisos');
        }
      });

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'No se pudo actualizar el permiso.';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  if (loading) {
    return <div className="content-wrapper d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"><h1><b>Editar Permiso</b></h1><hr/></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="row d-flex justify-content-center">
            <div className="col-md-6">
              <div className="card card-outline card-primary">
                <div className="card-header"><h3 className="card-title">Modificar datos de: {initialNombre}</h3></div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre del Permiso</label>
                      <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} />
                      {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="clave">Clave del Permiso</label>
                      <input type="text" id="clave" value={clave} onChange={(e) => setClave(e.target.value)} className={`form-control ${errors.clave ? 'is-invalid' : ''}`} />
                      {errors.clave && <small className="text-danger">{errors.clave}</small>}
                    </div>
                    <hr/>
                    <div className="d-flex justify-content-between">
                      <Link to="/permisos" className="btn btn-secondary"><i className="fas fa-reply"></i> Volver</Link>
                      <button type="submit" className="btn btn-primary"><i className="far fa-save"></i> Guardar Cambios</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditarPermiso;
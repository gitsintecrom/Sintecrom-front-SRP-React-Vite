// src/pages/permisos/CrearPermiso.jsx

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const CrearPermiso = () => {
  const [nombre, setNombre] = useState('');
  const [clave, setClave] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

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
      await axiosInstance.post('/permisos', { nombre, clave });

      Swal.fire({
        icon: 'success',
        title: '¡Permiso Creado!',
        text: 'El nuevo permiso se ha registrado con éxito.',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        willClose: () => {
          navigate('/permisos');
        }
      });

    } catch (error) {
      console.error("Error al crear permiso:", error);
      const errorMessage = error.response?.data?.error || 'No se pudo registrar el permiso.';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"><h1><b>Registro de un nuevo permiso</b></h1><hr /></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="row d-flex justify-content-center">
            <div className="col-md-6"> {/* Hacemos el formulario más pequeño */}
              <div className="card card-outline card-primary">
                <div className="card-header"><h3 className="card-title">Ingrese los datos del permiso</h3></div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre del Permiso</label>
                      <input 
                        type="text" 
                        id="nombre" 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)} 
                        className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} 
                        placeholder="Ej: Ver Dashboard"
                      />
                      {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="clave">Clave del Permiso</label>
                      <input 
                        type="text" 
                        id="clave" 
                        value={clave} 
                        onChange={(e) => setClave(e.target.value)} 
                        className={`form-control ${errors.clave ? 'is-invalid' : ''}`} 
                        placeholder="Ej: ver_dashboard (sin espacios, en minúsculas)"
                      />
                      {errors.clave && <small className="text-danger">{errors.clave}</small>}
                      <small className="form-text text-muted">Esta clave se usa en el código y no debe tener espacios.</small>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <Link to="/permisos" className="btn btn-secondary"><i className="fas fa-reply"></i> Volver</Link>
                      <button type="submit" className="btn btn-primary"><i className="far fa-save"></i> Registrar</button>
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

export default CrearPermiso;
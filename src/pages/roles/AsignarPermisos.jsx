// src/pages/roles/AsignarPermisos.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import { ThemeContext } from '../../context/ThemeContext';

const AsignarPermisos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [rol, setRol] = useState(null);
  const [allPermisos, setAllPermisos] = useState([]);
  // Usaremos un objeto para manejar los checkboxes de forma más eficiente
  const [assignedPermisos, setAssignedPermisos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolRes, permisosRes] = await Promise.all([
          axiosInstance.get(`/roles/${id}`),
          axiosInstance.get('/permisos')
        ]);

        setRol(rolRes.data);
        setAllPermisos(permisosRes.data);

        // Crear el estado inicial de los checkboxes
        const initialAssigned = rolRes.data.permisos.reduce((acc, permisoId) => {
          acc[permisoId] = true;
          return acc;
        }, {});
        setAssignedPermisos(initialAssigned);

      } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los datos.', 'error');
        navigate('/roles');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleCheckboxChange = (permisoId) => {
    setAssignedPermisos(prev => ({
      ...prev,
      [permisoId]: !prev[permisoId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertir el objeto de checkboxes de vuelta a un array de IDs
      const permisosIds = Object.keys(assignedPermisos).filter(key => assignedPermisos[key]);

      const payload = {
        nombre: rol.nombre, // No cambiamos el nombre aquí, solo los permisos
        permisos: permisosIds
      };

      await axiosInstance.put(`/roles/${id}`, payload);
      Swal.fire({
        icon: 'success', title: '¡Permisos Actualizados!', text: 'La asignación de permisos se ha guardado con éxito.', timer: 2000, timerProgressBar: true, showConfirmButton: false,
        willClose: () => navigate('/roles/listado')
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la asignación de permisos.', 'error');
    }
  };
  
  if (loading) {
    return <div className="content-wrapper d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <h1><b>Asignar Permisos al Rol:</b> <span className="text-primary">{rol?.nombre}</span></h1>
          <hr />
        </div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="card card-outline card-primary">
            <div className="card-header"><h3 className="card-title">Seleccione los permisos a asignar</h3></div>
            <form onSubmit={handleSubmit}>
              <div className="card-body">
                <div className="row">
                  {allPermisos.map(permiso => (
                    <div key={permiso.id} className="col-md-4 col-sm-6">
                      <div className="form-group">
                        <div className="custom-control custom-checkbox">
                          <input 
                            className="custom-control-input" 
                            type="checkbox" 
                            id={`permiso-${permiso.id}`}
                            checked={!!assignedPermisos[permiso.id]}
                            onChange={() => handleCheckboxChange(permiso.id)}
                          />
                          <label htmlFor={`permiso-${permiso.id}`} className="custom-control-label">{permiso.nombre}</label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-footer">
                <div className="d-flex justify-content-between">
                  <Link to="/roles/listado" className="btn btn-secondary"><i className="fas fa-reply"></i> Volver</Link>
                  <button type="submit" className="btn btn-primary"><i className="far fa-save"></i> Guardar Asignación</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AsignarPermisos;
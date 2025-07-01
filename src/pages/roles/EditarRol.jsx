// src/pages/roles/EditarRol.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { ThemeContext } from '../../context/ThemeContext';

const EditarRol = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [nombre, setNombre] = useState('');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [permisosOptions, setPermisosOptions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [permisosRes, rolRes] = await Promise.all([
          axiosInstance.get('/permisos'),
          axiosInstance.get(`/roles/${id}`)
        ]);

        const allPermisosFormatted = permisosRes.data.map(p => ({ value: p.id, label: p.nombre }));
        setPermisosOptions(allPermisosFormatted);

        const rolData = rolRes.data;
        setNombre(rolData.nombre);
        
        // Filtrar los permisos completos para encontrar los que tiene el rol
        const currentPermisos = allPermisosFormatted.filter(option => 
          rolData.permisos.includes(option.value)
        );
        setPermisosSeleccionados(currentPermisos);

      } catch (error) {
        Swal.fire('Error', 'No se pudieron cargar los datos del rol.', 'error');
        navigate('/roles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) {
      setError('El nombre del rol es requerido.');
      return;
    }

    try {
      const payload = {
        nombre,
        permisos: permisosSeleccionados.map(p => p.value)
      };
      await axiosInstance.put(`/roles/${id}`, payload);

      Swal.fire({
        icon: 'success', title: '¡Rol Actualizado!', text: 'El rol ha sido modificado con éxito.', timer: 2500, timerProgressBar: true, showConfirmButton: false,
        willClose: () => navigate('/roles')
      });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'No se pudo actualizar el rol.';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const customSelectStyles = { /* ... (copia los estilos de CrearUsuario.jsx) ... */ };

  if (loading) {
    return <div className="content-wrapper d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"><h1><b>Editar Rol</b></h1><hr/></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="row d-flex justify-content-center">
            <div className="col-md-8">
              {/* El JSX es idéntico al de CrearRol, solo cambia el texto del botón */}
              <div className="card card-outline card-primary">
                <div className="card-header"><h3 className="card-title">Modificar Rol: {nombre}</h3></div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} autoComplete="off">
                    {/* ... (Copia el contenido del form de CrearRol.jsx) ... */}
                    <div className="d-flex justify-content-between">
                      <Link to="/roles" className="btn btn-secondary"><i className="fas fa-reply"></i> Volver</Link>
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

export default EditarRol;
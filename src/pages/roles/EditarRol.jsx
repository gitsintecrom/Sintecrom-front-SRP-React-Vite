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
    setError(''); // Clear previous errors
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

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
      borderColor: theme === 'dark' ? '#6c757d' : '#ced4da',
      color: theme === 'dark' ? '#fff' : '#495057',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(38,143,255,.25)' : null,
      '&:hover': {
        borderColor: theme === 'dark' ? '#6c757d' : '#ced4da',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#fff' : '#495057',
    }),
    input: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#fff' : '#495057',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#ced4da' : '#6c757d',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
      border: `1px solid ${theme === 'dark' ? '#495057' : '#ced4da'}`,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? (theme === 'dark' ? '#007bff' : '#e2e6ea')
        : (state.isSelected ? (theme === 'dark' ? '#0056b3' : '#007bff') : (theme === 'dark' ? '#343a40' : '#fff')),
      color: state.isFocused
        ? (theme === 'dark' ? '#fff' : '#000')
        : (state.isSelected ? '#fff' : (theme === 'dark' ? '#fff' : '#000')),
      '&:active': {
        backgroundColor: theme === 'dark' ? '#0056b3' : '#007bff',
        color: '#fff',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#007bff' : '#e9ecef',
      color: theme === 'dark' ? '#fff' : '#495057',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#fff' : '#495057',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#fff' : '#495057',
      '&:hover': {
        backgroundColor: theme === 'dark' ? '#dc3545' : '#dc3545',
        color: 'white',
      },
    }),
  };

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
              <div className="card card-outline card-primary">
                <div className="card-header"><h3 className="card-title">Modificar Rol: {nombre}</h3></div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                      <label htmlFor="nombreRol">Nombre del Rol</label>
                      <input
                        type="text"
                        className={`form-control ${theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}`}
                        id="nombreRol"
                        placeholder="Ingrese el nombre del rol"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                      />
                      {error && <small className="text-danger">{error}</small>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="permisos">Permisos</label>
                      <Select
                        id="permisos"
                        isMulti
                        options={permisosOptions}
                        value={permisosSeleccionados}
                        onChange={setPermisosSeleccionados}
                        placeholder="Seleccione uno o más permisos"
                        classNamePrefix="react-select"
                        styles={customSelectStyles}
                        noOptionsMessage={() => "No hay más permisos disponibles"}
                      />
                    </div>
                    <div className="d-flex justify-content-between">
                      <Link to="/roles/listado" className="btn btn-secondary"><i className="fas fa-reply"></i> Volver</Link>
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
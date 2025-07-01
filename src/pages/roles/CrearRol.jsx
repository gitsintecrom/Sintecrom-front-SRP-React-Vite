// src/pages/roles/CrearRol.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { ThemeContext } from '../../context/ThemeContext';

const CrearRol = () => {
  const [nombre, setNombre] = useState('');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]); // Array para el multi-select
  const [permisosOptions, setPermisosOptions] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  // Cargar todos los permisos disponibles para el selector
  useEffect(() => {
    axiosInstance.get('/permisos')
      .then(response => {
        const formattedPermisos = response.data.map(p => ({ value: p.id, label: p.nombre }));
        setPermisosOptions(formattedPermisos);
      })
      .catch(err => Swal.fire('Error', 'No se pudieron cargar los permisos.', 'error'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) {
      setError('El nombre del rol es requerido.');
      return;
    }

    try {
      const payload = {
        nombre,
        // Mapeamos los objetos seleccionados para enviar solo un array de IDs
        permisos: permisosSeleccionados.map(p => p.value)
      };
      await axiosInstance.post('/roles', payload);

      Swal.fire({
        icon: 'success', title: '¡Rol Creado!', text: 'El nuevo rol se ha registrado con éxito.', timer: 2500, timerProgressBar: true, showConfirmButton: false,
        willClose: () => navigate('/roles/listado')
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'No se pudo registrar el rol.';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const customSelectStyles = { /* ... (copia los estilos de CrearUsuario.jsx) ... */ };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"><h1><b>Registro de un nuevo Rol</b></h1><hr /></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="row d-flex justify-content-center">
            <div className="col-md-8">
              <div className="card card-outline card-primary">
                <div className="card-header"><h3 className="card-title">Ingrese los datos del Rol</h3></div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre del Rol</label>
                      <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className={`form-control ${error ? 'is-invalid' : ''}`} />
                      {error && <small className="text-danger">{error}</small>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="permisos">Permisos</label>
                      <Select
                        id="permisos"
                        isMulti // <-- ¡LA CLAVE PARA LA SELECCIÓN MÚLTIPLE!
                        options={permisosOptions}
                        value={permisosSeleccionados}
                        onChange={setPermisosSeleccionados}
                        placeholder="Seleccione uno o más permisos"
                        noOptionsMessage={() => "No hay permisos disponibles"}
                        styles={customSelectStyles}
                      />
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <Link to="/roles/listado" className="btn btn-secondary"><i className="fas fa-reply"></i> Volver</Link>
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

export default CrearRol;
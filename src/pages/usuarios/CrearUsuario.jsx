// src/pages/usuarios/CrearUsuario.jsx (Versión Final Corregida)

import React, { useState, useEffect, useContext } from 'react'; // <-- IMPORTACIÓN CORREGIDA
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { ThemeContext } from '../../context/ThemeContext';

const CrearUsuario = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [rol, setRol] = useState(null);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    axiosInstance.get('/roles')
      .then(response => {
        const formattedRoles = response.data.map(r => ({ value: r.idRol, label: r.nombre }));
        setRolesOptions(formattedRoles);
      })
      .catch(error => {
        Swal.fire('Error', 'No se pudieron cargar los roles.', 'error');
      });
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!nombre) newErrors.nombre = 'El nombre es requerido.';
    if (!rol) newErrors.rol = 'Debe seleccionar un rol.';
    if (!password) newErrors.password = 'La contraseña es requerida.';
    if (password !== passwordConfirmation) newErrors.passwordConfirmation = 'Las contraseñas no coinciden.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await axiosInstance.post('/users', { nombre, email, password, idRol: rol.value });
      Swal.fire({
        icon: 'success', title: '¡Usuario Registrado!', text: 'El nuevo usuario ha sido creado con éxito.', timer: 2500, timerProgressBar: true, showConfirmButton: false,
        willClose: () => { navigate('/usuarios/listado'); }
      });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'No se pudo registrar el usuario.';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const customSelectStyles = {
    control: (p, s) => ({ ...p, backgroundColor: theme==='dark'?'#454d55':'#fff', borderColor: theme==='dark'?'#6c757d':'#ced4da', '&:hover':{borderColor: '#80bdff'} }),
    singleValue: p => ({...p, color: theme==='dark'?'#fff':'#495057'}),
    placeholder: p => ({...p, color: theme==='dark'?'#adb5bd':'#6c757d'}),
    menu: p => ({...p, backgroundColor: theme==='dark'?'#343a40':'#fff'}),
    option: (p, s) => ({...p, backgroundColor: s.isSelected?'#007bff':s.isFocused?(theme==='dark'?'#495057':'#e9ecef'):'transparent', color: s.isSelected?'#fff':(theme==='dark'?'#dee2e6':'#212529')}),
    input: p => ({...p, color: theme==='dark'?'#fff':'#495057'}),
  };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"><h1><b>Registro de un nuevo usuario</b></h1><hr /></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="row d-flex justify-content-center">
            <div className="col-md-9">
              <div className="card card-outline card-primary">
                <div className="card-header"><h3 className="card-title">Ingrese los datos</h3></div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="rol">Rol</label>
                          <Select id="rol" options={rolesOptions} value={rol} onChange={setRol} placeholder="Seleccione un rol" noOptionsMessage={() => "Cargando roles..."} className={errors.rol ? 'is-invalid' : ''} styles={customSelectStyles} />
                          {errors.rol && <small className="text-danger">{errors.rol}</small>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="nombre">Nombre</label>
                          <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} autoComplete="new-password" />
                          {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="email">Email <small>(Opcional)</small></label>
                          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`form-control ${errors.email ? 'is-invalid' : ''}`} autoComplete="new-password" />
                          {errors.email && <small className="text-danger">{errors.email}</small>}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="password">Contraseña</label>
                          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`form-control ${errors.password ? 'is-invalid' : ''}`} autoComplete="new-password" />
                          {errors.password && <small className="text-danger">{errors.password}</small>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="password_confirmation">Confirmar Contraseña</label>
                          <input type="password" id="password_confirmation" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className={`form-control ${errors.passwordConfirmation ? 'is-invalid' : ''}`} autoComplete="new-password" />
                          {errors.passwordConfirmation && <small className="text-danger">{errors.passwordConfirmation}</small>}
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-12 d-flex justify-content-between">
                        <Link to="/usuarios/listado" className="btn btn-secondary"><i className="fas fa-reply"></i> Volver</Link>
                        <button type="submit" className="btn btn-primary"><i className="far fa-save"></i> Registrar</button>
                      </div>
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

export default CrearUsuario;  
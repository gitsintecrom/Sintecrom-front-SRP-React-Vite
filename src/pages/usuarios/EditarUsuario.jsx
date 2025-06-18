// // src/pages/usuarios/EditarUsuario.jsx

// import React, { useState, useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import Select from 'react-select';

// const EditarUsuario = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   // Estados para los campos del formulario
//   const [nombre, setNombre] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState(''); // Dejar vacío por seguridad
//   const [passwordConfirmation, setPasswordConfirmation] = useState('');
//   const [rol, setRol] = useState(null);
//   const [rolesOptions, setRolesOptions] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(true);

//   // Cargar roles y datos del usuario al montar el componente
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Cargar roles y datos del usuario en paralelo
//         const [rolesRes, userRes] = await Promise.all([
//           axiosInstance.get('/roles'),
//           axiosInstance.get(`/users/${id}`)
//         ]);

//         // Formatear roles para react-select
//         const formattedRoles = rolesRes.data.map(r => ({ value: r.idRol, label: r.nombre }));
//         setRolesOptions(formattedRoles);

//         // Rellenar el formulario con los datos del usuario
//         const userData = userRes.data;
//         setNombre(userData.name);
//         setEmail(userData.email || '');
        
//         // Encontrar y establecer el rol actual del usuario en el select
//         const currentRol = formattedRoles.find(r => r.label === userData.rol);
//         setRol(currentRol);

//       } catch (error) {
//         console.error("Error al cargar datos para editar:", error);
//         Swal.fire('Error', 'No se pudieron cargar los datos del usuario.', 'error');
//         navigate('/usuarios/listado');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id, navigate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validación
//     const newErrors = {};
//     if (!nombre) newErrors.nombre = 'El nombre es requerido.';
//     if (!rol) newErrors.rol = 'Debe seleccionar un rol.';
//     if (password && password !== passwordConfirmation) {
//       newErrors.passwordConfirmation = 'Las contraseñas no coinciden.';
//     }
    
//     if (Object.keys(newErrors).length > 0) {
//         setErrors(newErrors);
//         return;
//     }

//     try {
//       const payload = {
//         nombre,
//         email,
//         idRol: rol.value,
//       };

//       // Solo incluir la contraseña en el payload si el usuario la ha escrito
//       if (password) {
//         payload.password = password;
//       }

//       await axiosInstance.put(`/users/${id}`, payload);

//       Swal.fire({
//         icon: 'success',
//         title: '¡Usuario Actualizado!',
//         text: 'El usuario ha sido actualizado con éxito.',
//         timer: 2500,
//         timerProgressBar: true,
//         showConfirmButton: false,
//         willClose: () => {
//           navigate('/usuarios/listado'); // Redirigir al finalizar
//         }
//       });

//     } catch (error) {
//       console.error("Error al actualizar usuario:", error);
//       const errorMessage = error.response?.data?.error || 'No se pudo actualizar el usuario.';
//       Swal.fire('Error', errorMessage, 'error');
//     }
//   };

//   if (loading) {
//     return <div className="content-wrapper d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"><span className="sr-only">Cargando...</span></div></div>;
//   }

//   return (
//     <>
//       <div className="content-header">
//         <div className="container-fluid"><h1><b>Editar Usuario</b></h1><hr/></div>
//       </div>
//       <div className="content">
//         <div className="container-fluid">
//           <div className="row d-flex justify-content-center">
//             <div className="col-md-9">
//               <div className="card card-outline card-primary">
//                 <div className="card-header"><h3 className="card-title">Ingrese los datos</h3></div>
//                 <div className="card-body">
//                   <form onSubmit={handleSubmit}>
//                     <div className="row">
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="rol">Rol</label>
//                           <Select
//                             id="rol"
//                             options={rolesOptions}
//                             value={rol}
//                             onChange={setRol}
//                             placeholder="Seleccione un rol"
//                             noOptionsMessage={() => "Cargando roles..."}
//                             className={errors.rol ? 'is-invalid' : ''}
//                           />
//                           {errors.rol && <small className="text-danger">{errors.rol}</small>}
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="nombre">Nombre</label>
//                           <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} />
//                           {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="email">Email <small>(Opcional)</small></label>
//                           <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`form-control ${errors.email ? 'is-invalid' : ''}`} />
//                           {errors.email && <small className="text-danger">{errors.email}</small>}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="row">
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="password">Contraseña</label>
//                           <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`form-control ${errors.password ? 'is-invalid' : ''}`} />
//                           {errors.password && <small className="text-danger">{errors.password}</small>}
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="password_confirmation">Confirmar Contraseña</label>
//                           <input type="password" id="password_confirmation" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className={`form-control ${errors.passwordConfirmation ? 'is-invalid' : ''}`} />
//                           {errors.passwordConfirmation && <small className="text-danger">{errors.passwordConfirmation}</small>}
//                         </div>
//                       </div>
//                     </div>
//                     <hr />
//                     <div className="row">
//                       <div className="col-md-12 d-flex justify-content-between">
//                         <Link to="/usuarios/listado" className="btn btn-secondary"><i className="fas fa-reply"></i> Volver</Link>
//                         <button type="submit" className="btn btn-primary"><i className="far fa-save"></i> Registrar</button>
//                       </div>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default EditarUsuario;






// src/pages/usuarios/EditarUsuario.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { ThemeContext } from '../../context/ThemeContext';

const EditarUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [rol, setRol] = useState(null);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [initialNombre, setInitialNombre] = useState(''); // Para mostrar en el título
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, userRes] = await Promise.all([
          axiosInstance.get('/roles'),
          axiosInstance.get(`/users/${id}`)
        ]);

        const formattedRoles = rolesRes.data.map(r => ({ value: r.idRol, label: r.nombre }));
        setRolesOptions(formattedRoles);

        const userData = userRes.data;
        setNombre(userData.name);
        setInitialNombre(userData.name); // Guardamos el nombre original
        setEmail(userData.email || '');
        
        const currentRol = formattedRoles.find(r => r.label === userData.rol);
        setRol(currentRol);

      } catch (error) {
        console.error("Error al cargar datos para editar:", error);
        Swal.fire('Error', 'No se pudieron cargar los datos del usuario.', 'error');
        navigate('/usuarios/listado');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!nombre) newErrors.nombre = 'El nombre es requerido.';
    if (!rol) newErrors.rol = 'Debe seleccionar un rol.';
    if (password && password !== passwordConfirmation) {
      newErrors.passwordConfirmation = 'Las contraseñas no coinciden.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        nombre,
        email,
        idRol: rol.value,
      };

      if (password) {
        payload.password = password;
      }

      await axiosInstance.put(`/users/${id}`, payload);

      Swal.fire({
        icon: 'success',
        title: '¡Usuario Actualizado!',
        text: 'Los datos del usuario han sido modificados con éxito.',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        willClose: () => {
          navigate('/usuarios/listado');
        }
      });

    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      const errorMessage = error.response?.data?.error || 'No se pudo actualizar el usuario.';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#454d55' : '#fff',
      borderColor: theme === 'dark' ? '#6c757d' : '#ced4da',
      '&:hover': { borderColor: '#80bdff' }
    }),
    singleValue: (provided) => ({ ...provided, color: theme === 'dark' ? '#fff' : '#495057' }),
    placeholder: (provided) => ({ ...provided, color: theme === 'dark' ? '#adb5bd' : '#6c757d' }),
    menu: (provided) => ({ ...provided, backgroundColor: theme === 'dark' ? '#343a40' : '#fff' }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#007bff' : (state.isFocused ? (theme === 'dark' ? '#495057' : '#e9ecef') : 'transparent'),
      color: state.isSelected ? '#fff' : (theme === 'dark' ? '#dee2e6' : '#212529')
    }),
    input: (provided) => ({ ...provided, color: theme === 'dark' ? '#fff' : '#495057' }),
  };

  if (loading) {
    return <div className="content-wrapper d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"><span className="sr-only">Cargando...</span></div></div>;
  }

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"><h1><b>Editar Usuario</b></h1><hr/></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="row d-flex justify-content-center">
            <div className="col-md-9">
              <div className="card card-outline card-primary">
                <div className="card-header"><h3 className="card-title">Modificar datos de: {initialNombre}</h3></div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="rol">Rol</label>
                          <Select
                            id="rol"
                            options={rolesOptions}
                            value={rol}
                            onChange={setRol}
                            placeholder="Seleccione un rol"
                            noOptionsMessage={() => "Cargando roles..."}
                            className={errors.rol ? 'is-invalid' : ''}
                            styles={customSelectStyles}
                          />
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
                          <label htmlFor="password">Nueva Contraseña <small>(Opcional)</small></label>
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
                        <button type="submit" className="btn btn-primary"><i className="far fa-save"></i> Guardar Cambios</button>
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

export default EditarUsuario;
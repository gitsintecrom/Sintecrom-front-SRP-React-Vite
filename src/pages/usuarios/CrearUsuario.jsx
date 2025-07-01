// src/pages/usuarios/CrearUsuario.jsx (Versión Final Corregida)

// import React, { useState, useEffect, useContext } from 'react'; // <-- IMPORTACIÓN CORREGIDA
// import { Link, useNavigate } from 'react-router-dom';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import Select from 'react-select';
// import { ThemeContext } from '../../context/ThemeContext';

// const CrearUsuario = () => {
//   const [nombre, setNombre] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [passwordConfirmation, setPasswordConfirmation] = useState('');
//   const [rol, setRol] = useState(null);
//   const [rolesOptions, setRolesOptions] = useState([]);
//   const [errors, setErrors] = useState({});
//   const navigate = useNavigate();
//   const { theme } = useContext(ThemeContext);

//   useEffect(() => {
//     axiosInstance.get('/roles')
//       .then(response => {
//         const formattedRoles = response.data.map(r => ({ value: r.idRol, label: r.nombre }));
//         setRolesOptions(formattedRoles);
//       })
//       .catch(error => {
//         Swal.fire('Error', 'No se pudieron cargar los roles.', 'error');
//       });
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Limpiar errores previos para una nueva validación
//     setErrors({});

//     const newErrors = {};
//     if (!nombre) newErrors.nombre = 'El nombre es requerido.';
//     if (!rol) { // <-- ¡LA VALIDACIÓN CLAVE! Comprobar si 'rol' es null
//       newErrors.rol = 'Debe seleccionar un rol.';
//     }
//     if (!password) newErrors.password = 'La contraseña es requerida.';
//     if (password !== passwordConfirmation) {
//       newErrors.passwordConfirmation = 'Las contraseñas no coinciden.';
//     }

//     if (Object.keys(newErrors).length > 0) {
//         setErrors(newErrors);
//         return; // Detener el envío del formulario si hay errores
//     }

//     try {
//       const payload = {
//         nombre,
//         email,
//         password,
//         // Ahora estamos seguros de que 'rol' no es null, por lo que 'rol.value' funcionará
//         idRol: rol.value
//       };

//       console.log("Enviando este payload al backend:", payload);

//       await axiosInstance.post('/users', payload);

//       Swal.fire({
//         icon: 'success',
//         title: '¡Usuario Registrado!',
//         text: 'El nuevo usuario ha sido creado con éxito.',
//         timer: 2500,
//         timerProgressBar: true,
//         showConfirmButton: false,
//         willClose: () => { navigate('/usuarios/listado'); }
//       });

//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'No se pudo registrar el usuario.';
//       Swal.fire('Error', errorMessage, 'error');
//     }
//   };

//   const customSelectStyles = {
//     control: (p, s) => ({ ...p, backgroundColor: theme==='dark'?'#454d55':'#fff', borderColor: theme==='dark'?'#6c757d':'#ced4da', '&:hover':{borderColor: '#80bdff'} }),
//     singleValue: p => ({...p, color: theme==='dark'?'#fff':'#495057'}),
//     placeholder: p => ({...p, color: theme==='dark'?'#adb5bd':'#6c757d'}),
//     menu: p => ({...p, backgroundColor: theme==='dark'?'#343a40':'#fff'}),
//     option: (p, s) => ({...p, backgroundColor: s.isSelected?'#007bff':s.isFocused?(theme==='dark'?'#495057':'#e9ecef'):'transparent', color: s.isSelected?'#fff':(theme==='dark'?'#dee2e6':'#212529')}),
//     input: p => ({...p, color: theme==='dark'?'#fff':'#495057'}),
//   };

//   return (
//     <>
//       <div className="content-header">
//         <div className="container-fluid"><h1><b>Registro de un nuevo usuario</b></h1><hr /></div>
//       </div>
//       <div className="content">
//         <div className="container-fluid">
//           <div className="row d-flex justify-content-center">
//             <div className="col-md-9">
//               <div className="card card-outline card-primary">
//                 <div className="card-header"><h3 className="card-title">Ingrese los datos</h3></div>
//                 <div className="card-body">
//                   <form onSubmit={handleSubmit} autoComplete="off">
//                     <div className="row">
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="rol">Rol</label>
//                           <Select id="rol" options={rolesOptions} value={rol} onChange={setRol} placeholder="Seleccione un rol" noOptionsMessage={() => "Cargando roles..."} className={errors.rol ? 'is-invalid' : ''} styles={customSelectStyles} />
//                           {errors.rol && <small className="text-danger">{errors.rol}</small>}
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="nombre">Nombre</label>
//                           <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} autoComplete="new-password" />
//                           {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="email">Email <small>(Opcional)</small></label>
//                           <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`form-control ${errors.email ? 'is-invalid' : ''}`} autoComplete="new-password" />
//                           {errors.email && <small className="text-danger">{errors.email}</small>}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="row">
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="password">Contraseña</label>
//                           <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`form-control ${errors.password ? 'is-invalid' : ''}`} autoComplete="new-password" />
//                           {errors.password && <small className="text-danger">{errors.password}</small>}
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="password_confirmation">Confirmar Contraseña</label>
//                           <input type="password" id="password_confirmation" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className={`form-control ${errors.passwordConfirmation ? 'is-invalid' : ''}`} autoComplete="new-password" />
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

// export default CrearUsuario;





// import React, { useState, useEffect, useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import Select from 'react-select';
// import { ThemeContext } from '../../context/ThemeContext';

// const CrearUsuario = () => {
//   // Usar un solo estado para todos los datos del formulario
//   const [formData, setFormData] = useState({
//     nombre: '',
//     email: '',
//     password: '',
//     passwordConfirmation: '',
//     rol: null, // El estado para el objeto del rol completo
//   });

//   const [rolesOptions, setRolesOptions] = useState([]);
//   const [errors, setErrors] = useState({});
//   const navigate = useNavigate();
//   const { theme } = useContext(ThemeContext);

//   useEffect(() => {
//     axiosInstance.get('/roles')
//       .then(response => {
//         const formattedRoles = response.data.map(r => ({ value: r.idRol, label: r.nombre }));
//         setRolesOptions(formattedRoles);
//       })
//       .catch(error => {
//         Swal.fire('Error', 'No se pudieron cargar los roles.', 'error');
//       });
//   }, []);

//   // Función para manejar cambios en los inputs de texto
//   const handleInputChange = (e) => {
//     const { id, value } = e.target;
//     setFormData(prev => ({ ...prev, [id]: value }));
//     // Limpiar el error de este campo cuando el usuario empieza a escribir
//     if (errors[id]) {
//       setErrors(prev => ({ ...prev, [id]: null }));
//     }
//   };

//   // Función específica para manejar el cambio en el Select
//   const handleRolChange = (selectedOption) => {
//     setFormData(prev => ({ ...prev, rol: selectedOption }));
//     // Limpiar el error del rol cuando se selecciona uno
//     if (errors.rol) {
//       setErrors(prev => ({ ...prev, rol: null }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validar antes de enviar
//     const newErrors = {};
//     if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido.';
//     if (!formData.rol) newErrors.rol = 'Debe seleccionar un rol.';
//     if (!formData.password) newErrors.password = 'La contraseña es requerida.';
//     if (formData.password !== formData.passwordConfirmation) newErrors.passwordConfirmation = 'Las contraseñas no coinciden.';

//     setErrors(newErrors);
//     if (Object.keys(newErrors).length > 0) {
//       return;
//     }

//     try {
//       const payload = {
//         nombre: formData.nombre,
//         email: formData.email,
//         password: formData.password,
//         idRol: formData.rol.value, // Ahora estamos seguros de que formData.rol tiene un valor
//       };

//       await axiosInstance.post('/users', payload);

//       Swal.fire({
//         icon: 'success', title: '¡Usuario Registrado!', text: 'El nuevo usuario ha sido creado con éxito.',
//         timer: 2500, timerProgressBar: true, showConfirmButton: false,
//         willClose: () => navigate('/usuarios/listado'),
//       });

//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'No se pudo registrar el usuario.';
//       Swal.fire('Error', errorMessage, 'error');
//     }
//   };

//   const customSelectStyles = {
//     control: (provided, state) => ({ ...provided, backgroundColor: theme === 'dark' ? '#454d55' : '#fff', borderColor: state.isFocused ? '#80bdff' : (theme === 'dark' ? '#6c757d' : '#ced4da'), boxShadow: state.isFocused ? '0 0 0 .2rem rgba(0,123,255,.25)' : 'none', '&:hover': { borderColor: '#80bdff' } }),
//     singleValue: provided => ({ ...provided, color: theme === 'dark' ? '#fff' : '#495057' }),
//     placeholder: provided => ({ ...provided, color: theme === 'dark' ? '#adb5bd' : '#6c757d' }),
//     menu: provided => ({ ...provided, backgroundColor: theme === 'dark' ? '#343a40' : '#fff', border: '1px solid #6c757d' }),
//     option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#007bff' : (state.isFocused ? (theme === 'dark' ? '#495057' : '#e9ecef') : 'transparent'), color: state.isSelected ? '#fff' : (theme === 'dark' ? '#dee2e6' : '#212529') }),
//     input: provided => ({ ...provided, color: theme === 'dark' ? '#fff' : '#495057' }),
//   };

//   return (
//     <>
//       <div className="content-header">
//         <div className="container-fluid"><h1><b>Registro de un nuevo usuario</b></h1><hr /></div>
//       </div>
//       <div className="content">
//         <div className="container-fluid">
//           <div className="row d-flex justify-content-center">
//             <div className="col-md-9">
//               <div className="card card-outline card-primary">
//                 <div className="card-header"><h3 className="card-title">Ingrese los datos</h3></div>
//                 <div className="card-body">
//                   <form onSubmit={handleSubmit} autoComplete="off">
//                     <div className="row">
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="rol">Rol</label>
//                           <Select id="rol" options={rolesOptions} value={formData.rol} onChange={handleRolChange} placeholder="Seleccione un rol" noOptionsMessage={() => "Cargando roles..."} classNamePrefix={errors.rol ? 'is-invalid' : ''} styles={customSelectStyles} />
//                           {errors.rol && <small className="text-danger">{errors.rol}</small>}
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="nombre">Nombre</label>
//                           <input type="text" id="nombre" value={formData.nombre} onChange={handleInputChange} className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} autoComplete="new-password" />
//                           {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="email">Email <small>(Opcional)</small></label>
//                           <input type="email" id="email" value={formData.email} onChange={handleInputChange} className={`form-control ${errors.email ? 'is-invalid' : ''}`} autoComplete="new-password" />
//                         </div>
//                       </div>
//                     </div>
//                     <div className="row">
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="password">Contraseña</label>
//                           <input type="password" id="password" value={formData.password} onChange={handleInputChange} className={`form-control ${errors.password ? 'is-invalid' : ''}`} autoComplete="new-password" />
//                           {errors.password && <small className="text-danger">{errors.password}</small>}
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="password_confirmation">Confirmar Contraseña</label>
//                           <input type="password" id="passwordConfirmation" value={formData.passwordConfirmation} onChange={handleInputChange} className={`form-control ${errors.passwordConfirmation ? 'is-invalid' : ''}`} autoComplete="new-password" />
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

// export default CrearUsuario;

// src/pages/usuarios/CrearUsuario.jsx (Versión Final y Robusta)

import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { ThemeContext } from '../../context/ThemeContext';

const CrearUsuario = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    rol: null,
  });
  
  const [rolesOptions, setRolesOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    axiosInstance.get('/roles')
      .then(response => {
        const formattedRoles = response.data.map(r => ({ value: r.id, label: r.nombre }));
        setRolesOptions(formattedRoles);
      })
      .catch(error => {
        Swal.fire('Error', 'No se pudieron cargar los roles.', 'error');
      });
  }, []);
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleRolChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, rol: selectedOption }));
    if (errors.rol) {
      setErrors(prev => ({ ...prev, rol: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido.';
    if (!formData.rol) newErrors.rol = 'Debe seleccionar un rol.';
    if (!formData.password) newErrors.password = 'La contraseña es requerida.';
    if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Las contraseñas no coinciden.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const payload = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        idRol: formData.rol ? formData.rol.value : null, // Manejo seguro de idRol
      };

      console.log("Payload que se está enviando:", payload); // Log para depuración final

      await axiosInstance.post('/users', payload);
      
      Swal.fire({
        icon: 'success', title: '¡Usuario Registrado!', text: 'El nuevo usuario ha sido creado con éxito.',
        timer: 2500, timerProgressBar: true, showConfirmButton: false,
        willClose: () => navigate('/usuarios/listado'),
      });

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'No se pudo registrar el usuario.';
      Swal.fire('Error', errorMessage, 'error');
    }
  };
  const customSelectStyles = {
    control: (provided, state) => ({ ...provided, backgroundColor: theme === 'dark' ? '#454d55' : '#fff', borderColor: state.isFocused ? '#80bdff' : (theme === 'dark' ? '#6c757d' : '#ced4da'), boxShadow: state.isFocused ? '0 0 0 .2rem rgba(0,123,255,.25)' : 'none', '&:hover': { borderColor: '#80bdff' } }),
    singleValue: provided => ({ ...provided, color: theme === 'dark' ? '#fff' : '#495057' }),
    placeholder: provided => ({ ...provided, color: theme === 'dark' ? '#adb5bd' : '#6c757d' }),
    menu: provided => ({ ...provided, backgroundColor: theme === 'dark' ? '#343a40' : '#fff', border: '1px solid #6c757d' }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#007bff' : (state.isFocused ? (theme === 'dark' ? '#495057' : '#e9ecef') : 'transparent'), color: state.isSelected ? '#fff' : (theme === 'dark' ? '#dee2e6' : '#212529') }),
    input: provided => ({ ...provided, color: theme === 'dark' ? '#fff' : '#495057' }),
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
                          <Select
                            id="rol"
                            options={rolesOptions}
                            value={formData.rol}
                            onChange={handleRolChange}
                            placeholder="Seleccione un rol"
                            noOptionsMessage={() => "Cargando roles..."}
                            classNamePrefix={errors.rol ? 'is-invalid' : ''}
                            styles={customSelectStyles}
                          />
                          {errors.rol && <small className="text-danger">{errors.rol}</small>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="nombre">Nombre</label>
                          <input type="text" id="nombre" value={formData.nombre} onChange={handleInputChange} className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} autoComplete="new-password" />
                          {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="email">Email <small>(Opcional)</small></label>
                          <input type="email" id="email" value={formData.email} onChange={handleInputChange} className={`form-control ${errors.email ? 'is-invalid' : ''}`} autoComplete="new-password" />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="password">Contraseña</label>
                          <input type="password" id="password" value={formData.password} onChange={handleInputChange} className={`form-control ${errors.password ? 'is-invalid' : ''}`} autoComplete="new-password" />
                          {errors.password && <small className="text-danger">{errors.password}</small>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="passwordConfirmation">Confirmar Contraseña</label> {/* ID CORREGIDO */}
                          <input type="password" id="passwordConfirmation" value={formData.passwordConfirmation} onChange={handleInputChange} className={`form-control ${errors.passwordConfirmation ? 'is-invalid' : ''}`} autoComplete="new-password" />
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






// // src/pages/usuarios/CrearUsuario.jsx (Versión Final Simplificada)

// import React, { useState, useEffect, useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import Select from 'react-select';
// import { ThemeContext } from '../../context/ThemeContext';

// const CrearUsuario = () => {
//   const [nombre, setNombre] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [passwordConfirmation, setPasswordConfirmation] = useState('');
//   const [rol, setRol] = useState(null);
//   const [rolesOptions, setRolesOptions] = useState([]);
//   const navigate = useNavigate();
//   const { theme } = useContext(ThemeContext);

//   useEffect(() => {
//     axiosInstance.get('/roles')
//       .then(response => {
//         const formattedRoles = response.data.map(r => ({ value: r.id, label: r.nombre }));
//         setRolesOptions(formattedRoles);
//       })
//       .catch(error => Swal.fire('Error', 'No se pudieron cargar los roles.', 'error'));
//   }, []);
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validamos directamente las variables de estado
//     if (!nombre || !password || !rol) {
//       Swal.fire('Error', 'Nombre, contraseña y rol son requeridos.', 'error');
//       return;
//     }
//     if (password !== passwordConfirmation) {
//       Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
//       return;
//     }

//      console.log('Datos a enviar:', { nombre, email, password, idRol: rol.value });
    
//     try {
//       // Construimos el payload aquí mismo, sin variables intermedias.
//       console.log('Datos a enviar:', {
//         nombre: nombre,
//         email: email,
//         password: password,
//         idRol: rol.value,
//       });
//       // await axiosInstance.post('/users', {
//       //   nombre: nombre,
//       //   email: email,
//       //   password: password,
//       //   idRol: rol.value, // Extraemos el valor del estado 'rol' en el momento
//       // });
      
//       Swal.fire({
//         icon: 'success', title: '¡Usuario Registrado!', text: 'El nuevo usuario ha sido creado con éxito.',
//         timer: 2500, timerProgressBar: true, showConfirmButton: false,
//         willClose: () => navigate('/usuarios/listado'),
//       });

//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'No se pudo registrar el usuario.';
//       Swal.fire('Error', errorMessage, 'error');
//     }
//   };

//   const customSelectStyles = { /* tus estilos */ };

//   return (
//     <>
//       <div className="content-header">
//         <div className="container-fluid"><h1><b>Registro de un nuevo usuario</b></h1><hr /></div>
//       </div>
//       <div className="content">
//         <div className="container-fluid">
//           <div className="row d-flex justify-content-center">
//             <div className="col-md-9">
//               <div className="card card-outline card-primary">
//                 <div className="card-header"><h3 className="card-title">Ingrese los datos</h3></div>
//                 <div className="card-body">
//                   <form onSubmit={handleSubmit} autoComplete="off">
//                     <div className="row">
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="rol">Rol</label>
//                           {/* <Select
//                             id="rol"
//                             options={rolesOptions}
//                             value={rol}
//                             onChange={(selectedOption) => setRol(selectedOption)}
//                             placeholder="Seleccione un rol"
//                             styles={customSelectStyles}
//                           /> */}
//                           <Select
//                             id="rol"
//                             options={rolesOptions}
//                             value={rol} // <-- Estado actual
//                             onChange={(selectedOption) => {
//                               console.log("Opción seleccionada:", selectedOption); // <-- Debug aquí
//                               setRol(selectedOption);
//                             }}
//                             placeholder="Seleccione un rol"
//                             styles={customSelectStyles}
//                             isSearchable
//                           />
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="nombre">Nombre</label>
//                           <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="form-control" required />
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="email">Email <small>(Opcional)</small></label>
//                           <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" />
//                         </div>
//                       </div>
//                     </div>
//                     <div className="row">
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="password">Contraseña</label>
//                           <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" required />
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="form-group">
//                           <label htmlFor="password_confirmation">Confirmar Contraseña</label>
//                           <input type="password" id="password_confirmation" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="form-control" required />
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

// export default CrearUsuario;
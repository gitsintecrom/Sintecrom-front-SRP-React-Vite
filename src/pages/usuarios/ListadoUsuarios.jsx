// // src/pages/usuarios/ListadoUsuarios.jsx (Versión Final Corregida)

// import React, { useEffect, useState, useMemo, useContext } from 'react';
// import { Link } from 'react-router-dom'; // No necesitamos useNavigate aquí
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { ThemeContext } from '../../context/ThemeContext';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faKey } from '@fortawesome/free-solid-svg-icons';

// // Crear y registrar tema oscuro personalizado para la tabla
// createTheme('adminLteDark', {
//   text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//   background: { default: '#343a40' },
//   context: { background: '#007bff', text: '#FFFFFF' },
//   divider: { default: '#454d55' },
//   action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//   striped: { default: '#3a4047', text: '#FFFFFF' },
//   highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// const FilterComponent = ({ filterText, onFilter }) => (
//   <input id="search" type="text" placeholder="Buscar..." className="form-control" value={filterText} onChange={onFilter} />
// );

// const ListadoUsuarios = () => {
//   const [usuarios, setUsuarios] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filterText, setFilterText] = useState('');
//   const { theme } = useContext(ThemeContext);

//   useEffect(() => {
//     axiosInstance.get('/users')
//       .then(response => {
//         setUsuarios(response.data);
//       })
//       .catch(error => {
//         console.error("Error al obtener usuarios:", error);
//         Swal.fire('Error', 'No se pudieron cargar los datos de los usuarios.', 'error');
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   // --- FUNCIÓN NUEVA PARA BLANQUEAR CONTRASEÑA ---
//   const handleResetPassword = (id, nombre) => {
//     Swal.fire({
//       title: `¿Blanquear contraseña de ${nombre}?`,
//       text: "Se establecerá una contraseña por defecto y se le pedirá al usuario que la cambie en su próximo inicio de sesión.",
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonColor: '#ffc107', // Color amarillo para advertencia
//       confirmButtonText: 'Sí, blanquear',
//       cancelButtonText: 'Cancelar'
//     }).then(async (result) => {
//         if (result.isConfirmed) {
//             try {
//                 Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
//                 await axiosInstance.post(`/users/reset-password/${id}`);
//                 Swal.close();
//                 Swal.fire('¡Éxito!', `La contraseña de ${nombre} ha sido blanqueada.`, 'success');
//                 // No es necesario recargar la tabla, ya que no cambia nada visualmente.
//             } catch (error) {
//                 Swal.close();
//                 const errorMessage = error.response?.data?.error || 'No se pudo blanquear la contraseña.';
//                 Swal.fire('Error', errorMessage, 'error');
//             }
//         }
//     });
//   };

//   const handleDelete = (id, nombre) => {
//     Swal.fire({
//       title: `¿Estás seguro de eliminar a ${nombre}?`,
//       text: "¡No podrás revertir esto!",
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: '¡Sí, bórralo!',
//       cancelButtonText: 'Cancelar'
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await axiosInstance.delete(`/users/${id}`);
//           // La actualización del estado es suficiente para que React re-renderice la tabla
//           setUsuarios(prevUsuarios => prevUsuarios.filter(u => u.id !== id));
          
//           // La alerta de éxito ya no necesita redirigir, la tabla se actualiza sola.
//           Swal.fire({
//             icon: 'success',
//             title: '¡Usuario Eliminado!',
//             text: 'El usuario ha sido eliminado con éxito.',
//             timer: 2500,
//             timerProgressBar: true,
//             showConfirmButton: false,
//             willClose: () => {
//               navigate('/usuarios/listado'); // Redirigir al finalizar
//             }
//           });
//         } catch (error) {
//           const errorMessage = error.response?.data?.error || 'No se pudo eliminar el usuario.';
//           Swal.fire('Error', errorMessage, 'error');
//         }
//       }
//     });
//   };

//   // Usamos useMemo para las columnas para optimizar el rendimiento.
//   // Es importante pasar `handleDelete` como dependencia si lo usas dentro.
//   const columns = useMemo(() => [
//     { name: 'Nro.', selector: (row, i) => i + 1, sortable: true, width: '80px', center: true },
//     { name: 'Nombre', selector: row => row.name, sortable: true },
//     { name: 'Email', selector: row => row.email, sortable: true },
//     {
//       name: 'Acciones',
//       cell: row => (
//         <div className="btn-group" role="group">
//           <Link to={`/usuarios/ver/${row.id}`} className="btn btn-info btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Ver Usuario"><i className="fas fa-eye"></i></Link>
//           <Link to={`/usuarios/editar/${row.id}`} className="btn btn-success btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Editar Usuario"><i className="fas fa-pencil-alt"></i></Link>
//           {/* --- BOTÓN NUEVO --- */}
//           <button onClick={() => handleResetPassword(row.id, row.name)} className="btn btn-warning btn-sm" title="Blanquear Contraseña">
//             <FontAwesomeIcon icon={faKey} />
//           </button>
//           <button onClick={() => handleDelete(row.id, row.name)} className="btn btn-danger btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Eliminar Usuario"><i className="fas fa-trash"></i></button>
//         </div>
//       ),
//       center: true,
//       ignoreRowClick: true,
//     },
//   ], [usuarios]); // Depender de 'usuarios' asegura que handleDelete tenga el scope correcto

//   const filteredItems = usuarios.filter(
//     item => (item.name && item.name.toLowerCase().includes(filterText.toLowerCase())) ||
//            (item.email && item.email.toLowerCase().includes(filterText.toLowerCase()))
//   );

//   const subHeaderComponentMemo = useMemo(() => (
//     <div style={{ width: '250px' }}><FilterComponent onFilter={e => setFilterText(e.target.value)} filterText={filterText} /></div>
//   ), [filterText]);

//   return (
//     <>
//       <div className="content-header">
//         <div className="container-fluid"><h1><b>Listado de Usuarios</b></h1><hr /></div>
//       </div>
//       <div className="content">
//         <div className="container-fluid">
//           <div className="card card-outline card-primary">
//             <div className="card-header">
//               <h3 className="card-title my-1">Usuarios registrados</h3>
//               <div className="card-tools">
//                 <Link to="/usuarios/crear" className="btn btn-primary btn-sm"><i className="fa fa-plus"></i> Crear nuevo</Link>
//               </div>
//             </div>
//             <div className="card-body p-0">
//               <DataTable
//                 columns={columns}
//                 data={filteredItems}
//                 pagination
//                 paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
//                 paginationPerPage={5}
//                 paginationRowsPerPageOptions={[5, 10, 20, 30, 50]}
//                 subHeader
//                 subHeaderComponent={subHeaderComponentMemo}
//                 subHeaderAlign="right"
//                 progressPending={loading}
//                 progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" role="status"><span className="sr-only">Cargando...</span></div></div>}
//                 noDataComponent="No hay registros para mostrar"
//                 striped
//                 highlightOnHover
//                 pointerOnHover
//                 theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ListadoUsuarios;








// src/pages/usuarios/ListadoUsuarios.jsx (VERSIÓN COMPLETA Y CORRECTA)

import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable, { createTheme } from 'react-data-table-component';
import { ThemeContext } from '../../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';

createTheme('adminLteDark', {
  text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
  background: { default: '#343a40' },
  context: { background: '#007bff', text: '#FFFFFF' },
  divider: { default: '#454d55' },
  action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
  striped: { default: '#3a4047', text: '#FFFFFF' },
  highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
}, 'dark');

const FilterComponent = ({ filterText, onFilter }) => (
  <input id="search" type="text" placeholder="Buscar..." className="form-control" value={filterText} onChange={onFilter} />
);

const ListadoUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/users')
      .then(response => {
        setUsuarios(response.data);
      })
      .catch(error => {
        console.error("Error al obtener usuarios:", error);
        Swal.fire('Error', 'No se pudieron cargar los datos de los usuarios.', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleResetPassword = (id, nombre) => {
    Swal.fire({
      title: `¿Blanquear contraseña de ${nombre}?`,
      text: "Se establecerá una contraseña por defecto y se le pedirá al usuario que la cambie en su próximo inicio de sesión.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      confirmButtonText: 'Sí, blanquear',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                await axiosInstance.post(`/users/reset-password/${id}`);
                Swal.close();
                Swal.fire('¡Éxito!', `La contraseña de ${nombre} ha sido blanqueada.`, 'success');
            } catch (error) {
                Swal.close();
                const errorMessage = error.response?.data?.error || 'No se pudo blanquear la contraseña.';
                Swal.fire('Error', errorMessage, 'error');
            }
        }
    });
  };

  const handleDelete = (id, nombre) => {
    Swal.fire({
      title: `¿Estás seguro de eliminar a ${nombre}?`,
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: '¡Sí, bórralo!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/users/${id}`);
          setUsuarios(prevUsuarios => prevUsuarios.filter(u => u.id !== id));
          Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'No se pudo eliminar el usuario.';
          Swal.fire('Error', errorMessage, 'error');
        }
      }
    });
  };
  
  const columns = useMemo(() => [
    { name: 'Nro.', selector: (row, i) => i + 1, sortable: true, width: '80px', center: true },
    { name: 'Nombre', selector: row => row.name, sortable: true },
    { name: 'Email', selector: row => row.email, sortable: true },
    {
      name: 'Acciones',
      cell: row => (
        <div className="btn-group" role="group">
          <Link to={`/usuarios/ver/${row.id}`} className="btn btn-info btn-sm" data-tooltip-id="tooltip-acciones" data-tooltip-content="Ver Usuario"><i className="fas fa-eye"></i></Link>
          <Link to={`/usuarios/editar/${row.id}`} className="btn btn-success btn-sm" data-tooltip-id="tooltip-acciones" data-tooltip-content="Editar Usuario"><i className="fas fa-pencil-alt"></i></Link>
          <button onClick={() => handleResetPassword(row.id, row.name)} className="btn btn-warning btn-sm" data-tooltip-id="tooltip-acciones" data-tooltip-content="Blanquear Contraseña">
            <FontAwesomeIcon icon={faKey} />
          </button>
          <button onClick={() => handleDelete(row.id, row.name)} className="btn btn-danger btn-sm" data-tooltip-id="tooltip-acciones" data-tooltip-content="Eliminar Usuario"><i className="fas fa-trash"></i></button>
        </div>
      ),
      center: true,
      ignoreRowClick: true,
    },
  ], []);

  const filteredItems = usuarios.filter(
    item => (item.name && item.name.toLowerCase().includes(filterText.toLowerCase())) ||
           (item.email && item.email.toLowerCase().includes(filterText.toLowerCase()))
  );

  const subHeaderComponentMemo = useMemo(() => (
    <div style={{ width: '250px' }}><FilterComponent onFilter={e => setFilterText(e.target.value)} filterText={filterText} /></div>
  ), [filterText]);

  return (
    <>
      <Tooltip id="tooltip-acciones" />
      <div className="content-header">
        <div className="container-fluid"><h1><b>Listado de Usuarios</b></h1><hr /></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="card card-outline card-primary">
            <div className="card-header">
              <h3 className="card-title my-1">Usuarios registrados</h3>
              <div className="card-tools">
                <Link to="/usuarios/crear" className="btn btn-primary btn-sm"><i className="fa fa-plus"></i> Crear nuevo</Link>
              </div>
            </div>
            <div className="card-body p-0">
              <DataTable
                columns={columns}
                data={filteredItems}
                pagination
                paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
                paginationPerPage={5}
                paginationRowsPerPageOptions={[5, 10, 20, 30, 50]}
                subHeader
                subHeaderComponent={subHeaderComponentMemo}
                subHeaderAlign="right"
                progressPending={loading}
                progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" role="status"><span className="sr-only">Cargando...</span></div></div>}
                noDataComponent="No hay registros para mostrar"
                striped
                highlightOnHover
                pointerOnHover
                theme={theme === 'dark' ? 'adminLteDark' : 'default'}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListadoUsuarios;
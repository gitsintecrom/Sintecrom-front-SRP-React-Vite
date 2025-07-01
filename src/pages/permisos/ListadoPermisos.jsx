// // src/pages/permisos/ListadoPermisos.jsx

// import React, { useEffect, useState, useMemo, useContext } from 'react';
// import { Link } from 'react-router-dom';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { ThemeContext } from '../../context/ThemeContext';

// // Registrar el tema oscuro para la tabla (se puede mover a un archivo central si se usa en muchos sitios)
// createTheme('adminLteDark', {
//   text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//   background: { default: '#343a40' },
//   divider: { default: '#454d55' },
//   // ... otros estilos del tema ...
// }, 'dark');

// const FilterComponent = ({ filterText, onFilter }) => (
//   <input id="search" type="text" placeholder="Buscar..." className="form-control" value={filterText} onChange={onFilter} />
// );

// const ListadoPermisos = () => {
//   const [permisos, setPermisos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filterText, setFilterText] = useState('');
//   const { theme } = useContext(ThemeContext);

//   useEffect(() => {
//     axiosInstance.get('/permisos') // Llamar al nuevo endpoint
//       .then(response => {
//         setPermisos(response.data);
//       })
//       .catch(error => {
//         console.error("Error al obtener permisos:", error);
//         Swal.fire('Error', 'No se pudieron cargar los datos de los permisos.', 'error');
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);
  
//   const filteredItems = permisos.filter(
//     item => (item.nombre && item.nombre.toLowerCase().includes(filterText.toLowerCase())) ||
//            (item.clave && item.clave.toLowerCase().includes(filterText.toLowerCase()))
//   );

//   // Definir las columnas para la tabla de permisos
//   const columns = useMemo(() => [
//     { name: 'ID', selector: row => row.id, sortable: true, width: '80px' },
//     { name: 'Nombre del Permiso', selector: row => row.nombre, sortable: true },
//     { name: 'Clave', selector: row => row.clave, sortable: true },
//     {
//       name: 'Acciones',
//       cell: row => (
//         <div className="btn-group" role="group">
//           <Link to={`/permisos/ver/${row.id}`} className="btn btn-info btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Ver Permiso">
//             <i className="fas fa-eye"></i>
//           </Link>  
//           <Link to={`/permisos/editar/${row.id}`} className="btn btn-success btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Editar Permiso">
//             <i className="fas fa-pencil-alt"></i>
//           </Link>
//           <button onClick={() => alert(`Eliminar permiso ${row.id}`)} className="btn btn-danger btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Eliminar Permiso">
//             <i className="fas fa-trash"></i>
//           </button>
//         </div>
//       ),
//       center: true,
//     },
//   ], []);

//   const subHeaderComponentMemo = useMemo(() => (
//     <div style={{ width: '250px' }}><FilterComponent onFilter={e => setFilterText(e.target.value)} filterText={filterText} /></div>
//   ), [filterText]);

//   return (
//     <>
//       <div className="content-header">
//         <div className="container-fluid"><h1><b>Listado de Permisos</b></h1><hr /></div>
//       </div>
//       <div className="content">
//         <div className="container-fluid">
//           <div className="card card-outline card-primary">
//             <div className="card-header">
//               <h3 className="card-title my-1">Permisos del Sistema</h3>
//               <div className="card-tools">
//                 <Link to="/permisos/crear" className="btn btn-primary btn-sm"><i className="fa fa-plus"></i> Crear nuevo</Link>
//               </div>
//             </div>
//             <div className="card-body p-0">
//               <DataTable
//                 columns={columns}
//                 data={filteredItems}
//                 pagination
//                 paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
//                 paginationPerPage={10}
//                 paginationRowsPerPageOptions={[10, 20, 30, 50]}
//                 subHeader
//                 subHeaderComponent={subHeaderComponentMemo}
//                 subHeaderAlign="right"
//                 progressPending={loading}
//                 progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>}
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

// export default ListadoPermisos;



import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable, { createTheme } from 'react-data-table-component';
import { ThemeContext } from '../../context/ThemeContext';

// Registrar el tema oscuro para la tabla
createTheme('adminLteDark', {
  text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
  background: { default: '#343a40' },
  divider: { default: '#454d55' },
  action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
  striped: { default: '#3a4047', text: '#FFFFFF' },
  highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
}, 'dark');

const FilterComponent = ({ filterText, onFilter }) => (
  <input id="search" type="text" placeholder="Buscar..." className="form-control" value={filterText} onChange={onFilter} />
);

const ListadoPermisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    axiosInstance.get('/permisos')
      .then(response => {
        setPermisos(response.data);
      })
      .catch(error => {
        console.error("Error al obtener permisos:", error);
        Swal.fire('Error', 'No se pudieron cargar los datos de los permisos.', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = (id, nombre) => {
    Swal.fire({
      title: `¿Estás seguro de eliminar el permiso "${nombre}"?`,
      text: "¡No podrás revertir esto! Asegúrate de que ningún rol esté usando este permiso.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, bórralo!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/permisos/${id}`);
          setPermisos(prevPermisos => prevPermisos.filter(p => p.id !== id));
          Swal.fire('¡Eliminado!', 'El permiso ha sido eliminado.', 'success');
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'No se pudo eliminar el permiso.';
          Swal.fire('Error', errorMessage, 'error');
        }
      }
    });
  };
  
  const filteredItems = permisos.filter(
    item => (item.nombre && item.nombre.toLowerCase().includes(filterText.toLowerCase())) ||
           (item.clave && item.clave.toLowerCase().includes(filterText.toLowerCase()))
  );

  const columns = useMemo(() => [
    { name: 'ID', selector: row => row.id, sortable: true, width: '80px', center: true },
    { name: 'Nombre del Permiso', selector: row => row.nombre, sortable: true },
    { name: 'Clave', selector: row => row.clave, sortable: true },
    {
      name: 'Acciones',
      cell: row => (
        <div className="btn-group" role="group">
          <Link to={`/permisos/ver/${row.id}`} className="btn btn-info btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Ver Permiso">
            <i className="fas fa-eye"></i>
          </Link>  
          <Link to={`/permisos/editar/${row.id}`} className="btn btn-success btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Editar Permiso">
            <i className="fas fa-pencil-alt"></i>
          </Link>
          <button onClick={() => handleDelete(row.id, row.nombre)} className="btn btn-danger btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Eliminar Permiso">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
      center: true,
    },
  ], [permisos]); // Depender de 'permisos' es importante para que handleDelete tenga la lista actualizada

  const subHeaderComponentMemo = useMemo(() => (
    <div style={{ width: '250px' }}><FilterComponent onFilter={e => setFilterText(e.target.value)} filterText={filterText} /></div>
  ), [filterText]);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"><h1><b>Listado de Permisos</b></h1><hr /></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="card card-outline card-primary">
            <div className="card-header">
              <h3 className="card-title my-1">Permisos del Sistema</h3>
              <div className="card-tools">
                <Link to="/permisos/crear" className="btn btn-primary btn-sm"><i className="fa fa-plus"></i> Crear nuevo</Link>
              </div>
            </div>
            <div className="card-body p-0">
              <DataTable
                columns={columns}
                data={filteredItems}
                pagination
                paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 30, 50]}
                subHeader
                subHeaderComponent={subHeaderComponentMemo}
                subHeaderAlign="right"
                progressPending={loading}
                progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>}
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

export default ListadoPermisos;
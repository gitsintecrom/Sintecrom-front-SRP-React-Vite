// src/pages/roles/ListadoRoles.jsx

import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable, { createTheme } from 'react-data-table-component';
import { ThemeContext } from '../../context/ThemeContext';

// Registrar el tema oscuro para la tabla
createTheme('adminLteDark', { /* ... (copia la definición del tema desde otro listado) ... */ }, 'dark');

const ListadoRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);

  // Cargar roles desde la API
  useEffect(() => {
    axiosInstance.get('/roles')
      .then(response => {
        setRoles(response.data);
      })
      .catch(error => {
        Swal.fire('Error', 'No se pudieron cargar los roles.', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  const handleDelete = (id, nombre) => {
    Swal.fire({
      title: `¿Estás seguro de eliminar el rol "${nombre}"?`,
      text: "¡Esta acción no se puede revertir!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/roles/${id}`);
          setRoles(prevRoles => prevRoles.filter(r => r.id !== id));
          Swal.fire('¡Eliminado!', 'El rol ha sido eliminado.', 'success');
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'No se pudo eliminar el rol.';
          Swal.fire('Error', errorMessage, 'error');
        }
      }
    });
  };
  
  const columns = useMemo(() => [
    { name: 'ID', selector: row => row.id, sortable: true, width: '80px', center: true },
    { name: 'Nombre del Rol', selector: row => row.nombre, sortable: true },
    {
      name: 'Acciones',
      cell: row => (
        <div className="btn-group" role="group">
          <Link to={`/roles/ver/${row.id}`} className="btn btn-info btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Ver Rol">
           <i className="fas fa-eye"></i>
          </Link>
          <Link to={`/roles/editar/${row.id}`} className="btn btn-success btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Editar Rol">
            <i className="fas fa-pencil-alt"></i>
          </Link>
          <Link to={`/roles/asignar-permisos/${row.id}`} className="btn btn-warning btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Asignar Permisos">
      <i className="fas fa-key"></i>
    </Link>
          <button onClick={() => handleDelete(row.id, row.nombre)} className="btn btn-danger btn-sm" data-tooltip-id="my-tooltip" data-tooltip-content="Eliminar Rol">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
      center: true,
    },
  ], [roles]);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"><h1><b>Listado de Roles</b></h1><hr /></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="card card-outline card-primary">
            <div className="card-header">
              <h3 className="card-title my-1">Roles del Sistema</h3>
              <div className="card-tools">
                <Link to="/roles/crear" className="btn btn-primary btn-sm"><i className="fa fa-plus"></i> Crear nuevo</Link>
              </div>
            </div>
            <div className="card-body p-0">
              <DataTable
                columns={columns}
                data={roles}
                pagination
                paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 30, 50]}
                progressPending={loading}
                progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>}
                noDataComponent="No hay roles para mostrar"
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

export default ListadoRoles;
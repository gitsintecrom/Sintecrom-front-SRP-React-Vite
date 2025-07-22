// /src/pages/programacion/RechazoCalidad.jsx (Versión Final con Columna Oculta)

import React, { useState, useMemo, useContext, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable, { createTheme } from 'react-data-table-component';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

createTheme('SintecromDark', {
  text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
  background: { default: 'transparent' },
  divider: { default: '#555555' },
}, 'dark');

const RechazoCalidad = () => {
  const [rechazos, setRechazos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRechazos = () => {
    setLoading(true);
    axiosInstance.get('/rechazos')
      .then(response => {
        setRechazos(response.data);
      })
      .catch(error => Swal.fire('Error', 'No se pudieron cargar los rechazos.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRechazos();
  }, []);

  const handleReprogramarClick = (row) => {
    Swal.fire({
      title: 'Confirmar Operación',
      text: "Se marcará como ya REPROGRAMADO. ¿CONFIRMA?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
          
          // Ahora `row.LoteIDS` sí debería tener el valor correcto
          const loteIdToSend = row.LoteIDS || null;
          const sobranteValue = Array.isArray(row.Sobrante) ? row.Sobrante[0] : row.Sobrante;

          const payload = { 
            operacionId: row.Operacion_ID,
            loteIDS: loteIdToSend,
            sobrante: sobranteValue,
            codigo: row.Codigo
          };
          
          await axiosInstance.post('/rechazos/reprogramar', payload);

          Swal.close();
          Swal.fire('¡Éxito!', 'La operación ha sido marcada.', 'success');
          
          // Refrescamos desde la fuente de verdad (la DB) que ahora sí debería estar actualizada.
          fetchRechazos();

        } catch (error) {
          Swal.close();
          const errorMessage = error.response?.data?.error || error.message || 'No se pudo completar la operación.';
          Swal.fire('Error', errorMessage, 'error');
        }
      }
    });
  };

  const columns = useMemo(() => [
    {
        name: 'Reprog',
        width: '70px',
        style: { justifyContent: 'center' },
        cell: (row) => (
            <button className="btn btn-link p-0" onClick={() => handleReprogramarClick(row)} title="Marcar como Reprogramado">
                <FontAwesomeIcon icon={faCheckCircle} size="2x" color="limegreen" />
            </button>
        ),
    },
    { name: 'Serie-Lote', selector: row => row.SerieLote ? row.SerieLote.substring(0, 11) : '', sortable: true },
    { name: 'Máq.', selector: row => row.Maquina, sortable: true, width: '70px' },
    { name: 'Tarea', selector: row => row.Tarea, sortable: true },
    { name: 'Batch', selector: row => row.NroBatch, sortable: true },
    { name: 'Cód.Producto', selector: row => row.Codigo_Producto, sortable: true, grow: 1.5 },
    { name: 'Cód.Prod.Saliente', selector: row => row.Codigo_ProductoS, sortable: true, grow: 1.5 },
    { name: 'Kgs. SO', selector: row => parseFloat(row.Kilos_Sobreorden || 0), format: row => parseFloat(row.Kilos_Sobreorden || 0).toFixed(3), sortable: true, style: { justifyContent: 'flex-end' } },
    { name: 'Kgs. Cal.', selector: row => parseFloat(row.Kilos_Calidad || 0), format: row => parseFloat(row.Kilos_Calidad || 0).toFixed(3), sortable: true, style: { justifyContent: 'flex-end' } },
    { name: 'Kgs.Bruto', selector: row => parseFloat(row.Kilos_Bruto || 0), format: row => parseFloat(row.Kilos_Bruto || 0).toFixed(3), sortable: true, style: { justifyContent: 'flex-end' } },
    { name: 'Clientes', selector: row => row.Clientes, sortable: true },
    { name: 'Familia', selector: row => row.Familia, sortable: true },
    { name: 'Problema', selector: row => row.Codigo, sortable: true },
    // ===== INICIO DE LA CORRECCIÓN =====
    // Añadimos la columna oculta para asegurar que el dato esté disponible en `row`
    {
        name: 'LoteIDS',
        selector: row => row.LoteIDS,
        omit: true, // Esta propiedad oculta la columna de la vista
    },
    // ===== FIN DE LA CORRECCIÓN =====
  ], []);

  return (
    <div style={{ backgroundColor: '#FFFFFF', width: '100%', height: 'calc(100vh - 57px)', padding: '10px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
            <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>
                REGISTRACION - Operaciones cerradas
            </h1>
            <span style={{ fontSize: '1.1rem' }}>
                Usuario: {user?.nombre || 'pmorrone'}
            </span>
            <span className="badge bg-danger" style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}>
                Rechazos de Calidad - Operaciones Cerradas
            </span>
        </div>

        <div style={{ flexGrow: 1, overflow: 'auto' }}>
            <DataTable
                columns={columns}
                data={rechazos}
                progressPending={loading}
                progressComponent={<div className="py-5 text-center d-flex justify-content-center align-items-center" style={{height: '100%', color: 'white'}}><div className="spinner-border" role="status" style={{width: '3rem', height: '3rem'}}></div></div>}
                noDataComponent={<div style={{ padding: '24px', color: 'white', fontSize: '1.2rem' }}>No se encontraron rechazos.</div>}
                theme="SintecromDark"
                customStyles={{
                    table: { style: { height: '100%' } },
                    headRow: { style: { backgroundColor: '#c0c0c0', color: 'black', fontWeight: 'bold', minHeight: '40px' } },
                    rows: { 
                        style: { 
                            backgroundColor: 'white',
                            color: 'black',
                            borderBottom: '1px solid #555',
                            minHeight: '35px',
                        },
                    },
                    pagination: { style: { backgroundColor: '#c0c0c0', color: 'black', borderTop: 'none', flexShrink: 0 } }
                }}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 50, 100]}
                dense
            />
        </div>
    </div>
  );
};

export default RechazoCalidad;
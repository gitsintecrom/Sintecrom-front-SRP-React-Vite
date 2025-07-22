// /src/pages/programacion/Resecuenciar.jsx (Versión Final - Solo Consulta)

import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable, { createTheme } from 'react-data-table-component';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import maquinas from '../../data/maquinas.json';

createTheme('SintecromDark', {
  text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
  background: { default: 'transparent' },
  context: { background: '#cb4b16', text: '#FFFFFF' },
  divider: { default: '#555555' },
  action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
}, 'dark');


const Resecuenciar = () => {
  const { codigoMaquina } = useParams();
  const [operaciones, setOperaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();

  const maquinaMapping = { hornos: 'HOR', embalaje: 'EMB' };
  const maquinaSPCode = maquinaMapping[codigoMaquina];
  const maquinaActual = useMemo(() => maquinas.find(m => m.id === maquinaSPCode), [maquinaSPCode]);

  const fetchOperaciones = () => {
    if (!maquinaSPCode) return;
    setLoading(true);
    axiosInstance.get(`/secuenciamiento?maquina=${maquinaSPCode}`)
      .then(response => {
        const sortedData = response.data.sort((a, b) => {
            const seqA = a.Secuencia === 0 || a.Secuencia === 99999 ? Infinity : a.Secuencia;
            const seqB = b.Secuencia === 0 || b.Secuencia === 99999 ? Infinity : b.Secuencia;
            if (seqA === seqB) return new Date(a.Operacion_Fecha_Temprana) - new Date(b.Operacion_Fecha_Temprana);
            return seqA - seqB;
        });
        setOperaciones(sortedData);
      })
      .catch(error => Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOperaciones();
  }, [codigoMaquina]);

  // ===== INICIO DE LA MODIFICACIÓN =====
  // Se elimina la columna "Acciones"
  const columns = useMemo(() => [
    { name: 'Secuencia', selector: row => (row.Secuencia === 99999 || row.Secuencia === 0 ? 0 : row.Secuencia), sortable: true, width: '90px', style: { justifyContent: 'center' } },
    { name: 'Nº Operación', selector: row => row.NumeroDocumento, sortable: true, width: '150px' },
    { name: 'Serie/Lote', selector: row => row.Origen_Lote ? row.Origen_Lote.substring(0, 11) : '', sortable: true, width: '120px' },
    { name: 'Prog.', selector: row => parseFloat(row.KilosProgramadosEntrantes || 0), format: row => parseFloat(row.KilosProgramadosEntrantes || 0).toFixed(2), sortable: true, width: '100px', style: { justifyContent: 'flex-end' } },
    { name: 'Stock', selector: row => parseFloat(row.Stock || 0), format: row => parseFloat(row.Stock || 0).toFixed(2), sortable: true, width: '100px', style: { justifyContent: 'flex-end' } },
    { name: 'Batch', selector: row => row.NroBatch, sortable: true, width: '80px' },
    { name: 'Fecha Inicio', selector: row => row.Operacion_Fecha_Temprana, format: row => {
        const d = row.Operacion_Fecha_Temprana; if (!d) return ''; return `${d.substring(6,8)}/${d.substring(4,6)}/${d.substring(0,4)}`;}, sortable: true, width: '130px' 
    },
    { name: 'Balanza', selector: row => parseFloat(row.Kilos_Balanza || 0), format: row => parseFloat(row.Kilos_Balanza || 0).toFixed(2), sortable: true, width: '90px', style: { justifyContent: 'flex-end' } },
    { name: 'Abas', selector: row => row.Abastecida === '0' ? 'OK' : '', width: '60px', style: { justifyContent: 'center' } },
    { name: 'OpAnt', selector: row => {
        if (row.EstadoOperacionAnterior === '2') return 'OK';
        if (row.EstadoOperacionAnterior === null) return 'OK-R';
        return '';
      }, width: '70px', style: { justifyContent: 'center' } },
    { name: 'Clientes', selector: row => row.Clientes, sortable: true, grow: 2 },
    { name: 'Tarea', selector: row => row.Tarea, sortable: true, grow: 1 },
  ], [maquinaSPCode]);
  // ===== FIN DE LA MODIFICACIÓN =====
  
  const conditionalRowStyles = [
    { 
      when: row => row.Estado === '0' && row.Abastecida === '0' && (row.EstadoOperacionAnterior === '2' || row.EstadoOperacionAnterior === null) && parseFloat(row.Stock || 0) > 0, 
      style: { backgroundColor: '#28a745', color: 'white', fontWeight: 'bold' } 
    },
    { when: row => row.Estado === '1', style: { backgroundColor: '#a52a2a', color: 'white' } },
    { when: row => row.Estado === '2', style: { backgroundColor: '#6c757d', color: 'white' } },
  ];

  if (loading) {
    return (
        <div style={{ backgroundColor: '#800000', width: '100%', height: 'calc(100vh - 57px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="spinner-border text-light" role="status" style={{width: '4rem', height: '4rem'}}>
                <span className="sr-only">Cargando...</span>
            </div>
        </div>
    )
  }

  if (!maquinaActual) {
      return (
          <div className="content-wrapper d-flex justify-content-center align-items-center">
              <div className="alert alert-danger">Configuración de máquina no encontrada para la ruta: {codigoMaquina}</div>
          </div>
      )
  }
  
  return (
    <div style={{
        backgroundColor: '#FFFFFF', 
        width: '100%', 
        height: 'calc(100vh - 57px)',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <div style={{ 
            backgroundColor: '#6c757d', color: 'white', padding: '10px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            marginBottom: '10px', flexShrink: 0
        }}>
            <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>
                REGISTRACION - Operaciones pendientes
            </h1>
            <span style={{ fontSize: '1.1rem' }}>
                Usuario: {user?.nombre || 'pmorrone'}
            </span>
            <span className="badge bg-danger" style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}>
                {maquinaActual.nombre}
            </span>
        </div>

        <div style={{ flexGrow: 1, overflow: 'auto' }}>
            <DataTable
                columns={columns}
                data={operaciones}
                noDataComponent={<div style={{ padding: '24px', color: 'white', fontSize: '1.2rem' }}>No hay operaciones pendientes para {maquinaActual.nombre}.</div>}
                theme="SintecromDark"
                customStyles={{
                    table: { style: { height: '100%' } },
                    headRow: { style: { backgroundColor: '#c0c0c0', color: 'black', fontWeight: 'bold', minHeight: '40px' } },
                    rows: { 
                        style: { 
                            backgroundColor: '#add8e6', 
                            color: 'black',
                            borderBottom: '1px solid #555',
                            minHeight: '35px',
                            // Ya no se necesita el cursor pointer
                        },
                    },
                    pagination: { style: { backgroundColor: '#c0c0c0', color: 'black', borderTop: 'none', flexShrink: 0 } }
                }}
                conditionalRowStyles={conditionalRowStyles}
                // ===== SE ELIMINAN LAS PROPS onRowClicked y highlightOnHover =====
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 15, 30, 50]}
            />
        </div>
    </div>
  );
};

export default Resecuenciar;
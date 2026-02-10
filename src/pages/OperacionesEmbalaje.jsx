// src/pages/OperacionesEmbalaje.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import { ThemeContext } from '../context/ThemeContext';

// Icono de Calidad (igual que en Plancha)
const CaliIcon = ({ iconType }) => {
  const styles = {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    color: 'white',
    fontSize: '14px'
  };
  switch (iconType) {
    case 'rojo-fondo': return <div style={{...styles, backgroundColor: 'red'}}></div>;
    case 'verde-fondo': return <div style={{...styles, backgroundColor: 'green'}}></div>;
    case 'gris-fondo': return <div style={{...styles, backgroundColor: 'gray'}}></div>;
    case 'amarillo-fondo': return <div style={{...styles, backgroundColor: 'yellow', color: 'black'}}></div>;
    case 'rojo-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-times-circle text-danger"></i></div>;
    case 'verde-tilde-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-check-circle text-success"></i></div>;
    default: return <div style={{...styles, backgroundColor: 'transparent'}}></div>;
  }
};

const OperacionesEmbalaje = () => {
  const { maquinaId } = useParams();
  const navigate = useNavigate();
  const { theme } = React.useContext(ThemeContext);

  const [operaciones, setOperaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!maquinaId) return;
    setLoading(true);
    // ✅ Usa el endpoint correcto
    axiosInstance.get(`/registracion/operaciones/${maquinaId}`)
      .then(res => {
        setOperaciones(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error');
        setOperaciones([]);
      })
      .finally(() => setLoading(false));
  }, [maquinaId]);

  const handleRowClicked = (row) => {
    const { status, Operacion_ID, Kilos_Balanza, Stock } = row;

    const hasDiscrepancy = () => {
      const stock = parseFloat(Stock) || 0;
      const balanza = parseFloat(Kilos_Balanza) || 0;
      if (stock === 0 && balanza === 0) return false;
      const diff = Math.abs(stock - balanza);
      const pct = (diff / (stock || 1)) * 100;
      return pct >= 1;
    };

    switch (status) {
      case 'EN_PROCESO':
        navigate(`/registracion/editar/${Operacion_ID}`, { state: { operationStatus: status } });
        break;
      case 'TOLERANCIA_EXCEDIDA':
        navigate(`/registracion/pesada/${Operacion_ID}`);
        break;
      case 'LISTA':
        if (hasDiscrepancy()) {
          navigate(`/registracion/pesada/${Operacion_ID}`);
        }
        break;
      case 'SUSPENDIDA':
        if (hasDiscrepancy()) {
          navigate(`/registracion/pesada/${Operacion_ID}`);
        } else {
          navigate(`/registracion/editar/${Operacion_ID}`, { state: { operationStatus: status } });
        }
        break;
      case 'BLOQUEADA':
        // No hacer nada
        break;
      default:
        navigate(`/registracion/detalle/${Operacion_ID}`, { state: { operationStatus: status } });
        break;
    }
  };

  const formatCustomDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string' || dateString.length < 12) return 'N/A';
    try {
      const year = dateString.substring(0, 4); 
      const month = dateString.substring(4, 6); 
      const day = dateString.substring(6, 8);
      const hour = dateString.substring(8, 10); 
      const minute = dateString.substring(10, 12);
      const second = dateString.length >= 14 ? dateString.substring(12, 14) : '00';
      return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    } catch (e) {
      return 'Fecha Inválida';
    }
  };

  const columns = useMemo(() => [
    { name: 'Nº Op.', selector: row => row.NumeroDocumento || '', sortable: true, width: '150px' },
    { name: 'Serie/Lote', selector: row => (row.Origen_Lote || '').substring(0, 11), width: '130px' },
    { name: 'Nro.Pedido', selector: row => row.NumeroPedido || '', width: '90px' },
    { name: 'Nro.Item', selector: row => row.NumeroItem || '', width: '70px' },
    { name: 'Nro. MultiOp.', selector: row => row.NumeroMultiOperacion || '', width: '100px' },
    { name: 'Prog', selector: row => {
        const value = parseFloat(row.KilosProgramadosEntrantes) || 0;
        return value.toFixed(0);
      }, sortable: true, right: true, width: '60px' },
    { name: 'Stock', selector: row => {
        const value = parseFloat(row.Stock) || 0;
        return value.toFixed(0);
      }, sortable: true, right: true, width: '60px' },
    { name: 'Batch', selector: row => row.NroBatch || '', sortable: true, width: '70px' },
    { name: 'Balanza', selector: row => {
        const value = parseFloat(row.Kilos_Balanza) || 0;
        return value.toFixed(0);
      }, sortable: true, right: true, width: '70px' },
    { name: 'Abas', cell: row => row.Abastecida === '0' ? 'OK' : '', width: '50px', align: 'center' },
    { name: 'Op.Ant.', cell: row => row.OpAnterior || '', width: '60px', align: 'center' },
    { name: 'Cali', cell: row => <CaliIcon iconType={row.caliIcon} />, width: '50px', align: 'center' },
    { name: 'Ancho', selector: row => {
        const value = parseFloat(row.Operacion_TotalAncho) || 0;
        return value.toFixed(0);
      }, sortable: true, right: true, width: '60px' },
    { name: 'Flia.', selector: row => row.Familia || '', sortable: true, width: '50px', align: 'center' },
    { name: 'Esp.', selector: row => {
        const value = parseFloat(row.Espesor) || 0;
        return value.toFixed(3);
      }, sortable: true, right: true, width: '50px' },
    { name: 'Fecha Inicio', selector: row => row.batch_FechaInicio || 'N/A', format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, width: '150px' },
    {
      name: 'Consulta',
      cell: row => (
        <button
          className="btn btn-sm btn-info"
          onClick={e => {
            e.stopPropagation();
            navigate(`/registracion/detalle/${row.Operacion_ID}`);
          }}
        >
          Ver
        </button>
      ),
      ignoreRowClick: true,
      align: 'center',
      width: '80px'
    },
    { name: 'Tarea', selector: row => row.Tarea || '', width: '120px' },
    { name: 'Paq/Ata', selector: row => row.CantidadPaquetes || '0', width: '80px', align: 'center' },
    { name: 'Hoj/Roll', selector: row => row.CantidadRollos || '0', width: '80px', align: 'center' },
    { name: 'Clientes', selector: row => row.Clientes || '', width: '150px' },
  ], [navigate]);

  const conditionalRowStyles = [
    { when: row => row.status === 'BLOQUEADA', style: { backgroundColor: '#dc3545', color: 'white' } },
    { when: row => row.status === 'LISTA', style: { backgroundColor: '#28a745', color: 'white' } },
    { when: row => row.status === 'EN_PROCESO', style: { backgroundColor: '#6c757d', color: 'white' } },
    { when: row => ['EN_CALIDAD', 'CALIDAD_DICTAMINADA', 'TOLERANCIA_EXCEDIDA'].includes(row.status),
      style: { backgroundColor: '#ffc107', color: 'black' } },
    { when: row => row.status === 'SUSPENDIDA', style: { backgroundColor: '#e9ecef', color: 'black' } },
  ];

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>SRP - Operaciones Pendientes Embalaje</h1>
          <button className="btn btn-secondary" onClick={() => navigate('/registracion')}>
            <i className="fas fa-arrow-left mr-2"></i>Volver
          </button>
        </div>

        <div className="card card-primary card-outline">
          <div className="card-body p-0">
            <DataTable
              columns={columns}
              data={operaciones}
              progressPending={loading}
              pagination
              highlightOnHover
              striped
              onRowClicked={handleRowClicked}
              conditionalRowStyles={conditionalRowStyles}
              theme={theme === 'dark' ? 'dark' : 'default'}
              noDataComponent={<div className="py-4 text-center">No hay operaciones</div>}
            />
          </div>
        </div>

        {/* Botón PROCESAR (igual que en el WinForm) */}
        <div className="text-right mt-3">
          <button className="btn btn-success btn-lg">
            <i className="fas fa-play mr-2"></i>PROCESAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperacionesEmbalaje;
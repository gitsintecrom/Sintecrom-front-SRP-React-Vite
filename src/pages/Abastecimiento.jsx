// src/pages/Abastecimiento.jsx

import React, { useState, useMemo, useContext, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable, { createTheme } from 'react-data-table-component';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import maquinas from '../data/maquinas.json';

createTheme('adminLteDark', {
  text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
  background: { default: '#343a40' },
  divider: { default: '#454d55' },
  action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
  striped: { default: '#3a4047', text: '#FFFFFF' },
  highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
}, 'dark');

const Abastecimiento = () => {
  const [operaciones, setOperaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();

  const [filtroPendiente, setFiltroPendiente] = useState(true);
  const [filtroSuplyChain, setFiltroSuplyChain] = useState(true);
  const [filtroProduccion, setFiltroProduccion] = useState(true);
  const [filtroConStock, setFiltroConStock] = useState(true);

  useEffect(() => {
    if (!maquinaSeleccionada) return;
    setLoading(true);
    setOperaciones([]);
    axiosInstance.get(`/abastecimiento?maquina=${maquinaSeleccionada.id}`)
      .then(response => setOperaciones(response.data))
      .catch(error => Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error'))
      .finally(() => setLoading(false));
  }, [maquinaSeleccionada]);

  const filteredItems = useMemo(() => {
    return operaciones.filter(op => {
      if (filtroPendiente && op.Abastecida === '0') return false;
      if (filtroConStock && (!op.Stock || parseFloat(op.Stock) <= 0)) return false;
      return true;
    });
  }, [operaciones, filtroPendiente, filtroConStock]);

  const formatCustomDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string' || dateString.length < 12) return 'N/A';
    try {
      const year = dateString.substring(0, 4); const month = dateString.substring(4, 6); const day = dateString.substring(6, 8);
      const hour = dateString.substring(8, 10); const minute = dateString.substring(10, 12);
      return `${day}/${month}/${year} ${hour}:${minute}`;
    } catch (e) { return 'Fecha Inválida'; }
  };

  const handleAbastecer = (row) => {
    Swal.fire({
      title: '¿Confirmas el abastecimiento?', text: `Serie/Lote: ${row.Origen_Lote}`, icon: 'question', showCancelButton: true, confirmButtonColor: '#28a745', confirmButtonText: 'Sí, abastecer', cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.post('/abastecimiento/abastecer', { operacionId: row.Operacion_ID, estado: '0' });
          setOperaciones(prev => prev.map(op => op.Operacion_ID === row.Operacion_ID ? { ...op, Abastecida: '0' } : op));
          Swal.fire('¡Éxito!', 'Operación marcada como abastecida.', 'success');
        } catch (error) {
          Swal.fire('Error', error.response?.data?.error || 'No se pudo completar la operación.', 'error');
        }
      }
    });
  };

  const handlePesarClick = (row) => {
    if (parseFloat(row.Kilos_Balanza || 0) > 0) {
      askForSupervisor(row);
    } else {
      showPesadaForm(row);
    }
  };

  const askForSupervisor = (row) => {
    Swal.fire({
      title: 'Se requiere autorización de Supervisor',
      html: `<input type="text" id="swal-user" class="swal2-input" placeholder="Usuario Supervisor" autocomplete="off"><input type="password" id="swal-pass" class="swal2-input" placeholder="Contraseña" autocomplete="new-password">`,
      confirmButtonText: 'Autorizar',
      focusConfirm: false,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const nombre = document.getElementById('swal-user').value;
        const password = document.getElementById('swal-pass').value;
        if (!nombre || !password) { Swal.showValidationMessage(`Por favor, ingrese usuario y contraseña`); return false; }
        try {
          const response = await axiosInstance.post('/auth/verify-supervisor', { nombre, password });
          return response.data.success;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Error de autorización';
          Swal.showValidationMessage(errorMessage);
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        showPesadaForm(row);
      }
    });
  };

  const showPesadaForm = (row) => {
    const pesadasAcumuladas = [];
    let pollingInterval = null;

    const updateTotalDisplay = () => {
      const total = pesadasAcumuladas.reduce((sum, val) => sum + val, 0);
      const totalElement = Swal.getHtmlContainer()?.querySelector('#swal-total-display');
      if (totalElement) totalElement.textContent = total.toFixed(3);
    };

    Swal.fire({
      title: 'Registrar Pesada',
      width: '600px',
      html: `
        <div class="text-left p-2">
          <p class="mb-1"><strong>Operación:</strong> ${row.NumeroDocumento}</p>
          <p><strong>Serie/Lote:</strong> ${row.Origen_Lote ? row.Origen_Lote.substring(0, 11) : ''}</p><hr/>
          <div class="form-group row align-items-center">
            <label for="swal-pesada" class="col-sm-3 col-form-label text-right">Balanza:</label>
            <div class="col-sm-9">
              <input type="number" id="swal-pesada" class="swal2-input m-0" placeholder="Esperando lectura..." step="0.001" readonly>
            </div>
          </div>
          <div class="form-group row align-items-center">
            <label class="col-sm-3 col-form-label text-right">Total:</label>
            <div class="col-sm-9 d-flex justify-content-start">
              <strong id="swal-total-display" style="font-size: 1.5rem; padding-left: 10px;">0.000</strong>
            </div>
          </div>
          <hr/>
          <div class="d-flex justify-content-center">
            <button id="btn-limpiar-ultimo" class="btn btn-warning mx-2">Limpia Últ.</button>
            <button id="btn-limpiar-todo" class="btn btn-danger mx-2">Limpia Todo</button>
          </div>
        </div>`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '<i class="far fa-save"></i> Guardar',
      denyButtonText: '<i class="fas fa-plus"></i> Acumular',
      cancelButtonText: 'Cancelar',

      didOpen: () => {
        const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
        const pesadaInput = document.getElementById('swal-pesada');
        
        pollingInterval = setInterval(async () => {
          try {
            const response = await axios.get(`${agenteUrl}/peso`);
            if (response.data?.success && pesadaInput) {
              pesadaInput.value = response.data.peso;
            }
          } catch (error) {
            if (pesadaInput) pesadaInput.placeholder = "Error Conexión";
            clearInterval(pollingInterval);
          }
        }, 1200);

        document.getElementById('btn-limpiar-ultimo')?.addEventListener('click', () => {
          if (pesadasAcumuladas.length > 0) { pesadasAcumuladas.pop(); updateTotalDisplay(); }
        });
        document.getElementById('btn-limpiar-todo')?.addEventListener('click', () => {
          pesadasAcumuladas.length = 0; updateTotalDisplay();
        });
      },
      
      willClose: () => {
        clearInterval(pollingInterval);
      },
      
      preDeny: () => {
        const pesadaInput = Swal.getHtmlContainer()?.querySelector('#swal-pesada');
        if (!pesadaInput) return false;
        const valorActual = parseFloat(pesadaInput.value) || 0;
        if (valorActual > 0) {
          pesadasAcumuladas.push(valorActual);
          updateTotalDisplay();
          pesadaInput.value = '0.000';
        }
        return false;
      },
      
      preConfirm: () => {
        clearInterval(pollingInterval);
        const pesadaInput = Swal.getHtmlContainer()?.querySelector('#swal-pesada');
        const valorActual = parseFloat(pesadaInput.value) || 0;
        const totalAcumulado = pesadasAcumuladas.reduce((sum, val) => sum + val, 0);
        return (totalAcumulado + valorActual).toFixed(3);
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const kilosFinales = parseFloat(result.value);
        if (kilosFinales <= 0) {
          Swal.fire('Atención', 'El peso a registrar debe ser mayor a cero.', 'warning');
          return;
        }
        try {
          await axiosInstance.post('/abastecimiento/pesar', { operacionId: row.Operacion_ID, kilosBalanza: kilosFinales });
          setOperaciones(prev => prev.map(op => op.Operacion_ID === row.Operacion_ID ? { ...op, Kilos_Balanza: kilosFinales } : op));
          Swal.fire('¡Guardado!', `Se han registrado ${kilosFinales} Kg.`, 'success');
        } catch (error) {
          Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar la pesada.', 'error');
        }
      }
    });
  };
  
  const columns = useMemo(() => [
    {
      name: 'Abastecido',
      cell: (row) => {
        const isAbastecida = row.Abastecida === '0';
        return <button className={`btn btn-sm ${isAbastecida ? 'btn-success' : 'btn-outline-primary'}`} disabled={isAbastecida} onClick={() => handleAbastecer(row)}>{isAbastecida ? 'Abastecida' : 'Abastecer'}</button>;
      },
      width: '120px', center: true,
    },
    { name: 'Nº Operación', selector: row => row.NumeroDocumento, sortable: true, wrap: true, width: '150px' },
    { name: 'Serie/Lote', selector: row => { const v = row.Origen_Lote; return v ? v.substring(0, v.length > 10 ? 11 : 10) : ''; }, sortable: true },
    { name: 'Tarea', selector: row => row.Tarea, sortable: true, width: '130px' },
    { name: 'Stock', selector: row => parseFloat(row.Stock || 0), format: row => parseFloat(row.Stock || 0).toFixed(3), sortable: true, right: true },
    { name: 'Nro.Matching', selector: row => row.Nro_Matching, sortable: true },
    { name: 'Nro.Batch', selector: row => row.NroBatch, sortable: true },
    { name: 'Fecha/Hora Inicio', selector: row => row.batch_FechaInicio, format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, wrap: true, width: '150px' },
    { name: 'Fec/Hora Finalización', selector: row => row.batch_FechaFin, format: row => formatCustomDate(row.batch_FechaFin), sortable: true, wrap: true, width: '160px' },
    { name: 'Tipo Operación', selector: row => row.UltimaOperacion === 0 ? 'Raíz' : 'Intermedia', sortable: true },
    { name: 'Kg.Balanza', selector: row => parseFloat(row.Kilos_Balanza || 0), format: row => parseFloat(row.Kilos_Balanza || 0).toFixed(3), sortable: true, right: true },
    { name: 'Balanza', cell: row => <button className="btn btn-sm btn-secondary" onClick={() => handlePesarClick(row)}>Pesar</button>, center: true },
    { name: 'Familia', selector: row => row.Codigo_Producto ? row.Codigo_Producto.substring(8, 10) : '', sortable: true },
    { name: 'Espesor', selector: row => row.Codigo_Producto ? (parseFloat(row.Codigo_Producto.substring(14, 18)) / 1000).toFixed(3) : '', sortable: true, right: true },
    { name: 'Ancho', selector: row => row.Operacion_TotalAncho, sortable: true, right: true },
  ], [operaciones]);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"><h1><b>Abastecimiento</b></h1></div>
      </div>
      <div className="content">
        <div className="container-fluid">
          <div className="card card-primary card-outline">
            <div className="card-header"><h3 className="card-title">Seleccione una Máquina</h3></div>
            <div className="card-body d-flex flex-wrap" style={{ gap: '0.5rem' }}>
              {maquinas.map(m => (
                <button key={m.id} onClick={() => setMaquinaSeleccionada(m)} className={`btn ${maquinaSeleccionada?.id === m.id ? m.color.replace('outline-', '') : `btn-outline-${m.color.split('-')[1]}`}`}>
                  {m.nombre}
                </button>
              ))}
            </div>
          </div>
          {maquinaSeleccionada && (
            <div className="card card-primary card-outline mt-3">
              <div className="card-header"><h3 className="card-title">Operaciones Pendientes de: <span className='font-weight-bold'>{maquinaSeleccionada.nombre}</span></h3></div>
              <div className="card-body p-0">
                <DataTable
                  columns={columns}
                  data={filteredItems}
                  progressPending={loading}
                  progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div>}
                  noDataComponent={<div className='py-5 text-center text-muted'>No hay operaciones pendientes para esta máquina con los filtros aplicados.</div>}
                  pagination
                  paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
                  theme={theme === 'dark' ? 'adminLteDark' : 'default'}
                  striped
                  highlightOnHover
                />
              </div>
              <div className="card-footer d-flex flex-wrap" style={{ gap: '1.5rem' }}>
                <div className="custom-control custom-checkbox">
                  <input type="checkbox" className="custom-control-input" id="chkPendiente" checked={filtroPendiente} onChange={e => setFiltroPendiente(e.target.checked)} />
                  <label className="custom-control-label" htmlFor="chkPendiente">Ocultar ya Abastecidas</label>
                </div>
                <div className="custom-control custom-checkbox">
                  <input type="checkbox" className="custom-control-input" id="chkSuply" checked={filtroSuplyChain} onChange={e => setFiltroSuplyChain(e.target.checked)} />
                  <label className="custom-control-label" htmlFor="chkSuply">Sólo Suply Chain</label>
                </div>
                <div className="custom-control custom-checkbox">
                  <input type="checkbox" className="custom-control-input" id="chkProd" checked={filtroProduccion} onChange={e => setFiltroProduccion(e.target.checked)} />
                  <label className="custom-control-label" htmlFor="chkProd">Sólo Producción</label>
                </div>
                <div className="custom-control custom-checkbox">
                  <input type="checkbox" className="custom-control-input" id="chkStock" checked={filtroConStock} onChange={e => setFiltroConStock(e.target.checked)} />
                  <label className="custom-control-label" htmlFor="chkStock">Ocultar sin Stock</label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Abastecimiento;
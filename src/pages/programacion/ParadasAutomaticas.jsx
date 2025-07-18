// /src/pages/programacion/ParadasAutomaticas.jsx

import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const ParadasAutomaticas = () => {
  const { user } = useAuth();
  const [paradas, setParadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maquinas, setMaquinas] = useState([]);

  // Formulario de creación
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [tipo, setTipo] = useState('Turno Noche');
  const [maquinaCreacion, setMaquinaCreacion] = useState(0);
  const [observaciones, setObservaciones] = useState('');

  // Filtros de la tabla
  const [fechaDesde, setFechaDesde] = useState(new Date().toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);

  const fetchParadas = () => {
    setLoading(true);
    const maquinasAFiltrar = maquinas.filter(m => m.value !== 0).map(m => m.value);
    if (maquinasAFiltrar.length === 0) {
        setLoading(false);
        setParadas([]);
        return;
    }
    const promises = maquinasAFiltrar.map(cod => 
        axiosInstance.get(`/paradas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&codMaquina=${cod}`)
    );
    Promise.all(promises)
        .then(results => {
            const allParadas = results.flatMap(res => res.data);
            setParadas(allParadas);
        })
        .catch(() => Swal.fire('Error', 'No se pudieron cargar las paradas.', 'error'))
        .finally(() => setLoading(false));
  };
  
  useEffect(() => {
    axiosInstance.get('/paradas/combo/maquinas')
      .then(res => {
          setMaquinas(res.data);
      })
      .catch(() => Swal.fire('Error', 'No se pudo cargar la lista de máquinas.', 'error'));
  }, []);

  useEffect(() => {
    if (maquinas.length > 0) {
        fetchParadas();
    }
  }, [maquinas]);

  const handleCrearParadas = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: '¿Confirmar Creación?',
      text: `Se crearán paradas para ${maquinaCreacion === 0 ? 'TODAS las máquinas' : maquinas.find(m=>m.value===maquinaCreacion)?.label} del tipo "${tipo}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                await axiosInstance.post('/paradas', {
                    fecha,
                    tipo,
                    codMaquina: maquinaCreacion,
                    observaciones,
                    usuario: user?.nombre || 'desconocido'
                });
                Swal.close();
                Swal.fire('¡Éxito!', 'Las paradas han sido creadas.', 'success');
                fetchParadas();
            } catch (error) {
                Swal.close();
                Swal.fire('Error', error.response?.data?.error || 'No se pudo completar la operación.', 'error');
            }
        }
    });
  };

  const handleEliminarParada = (row) => {
    if (row.CodigoParada !== 'PRG') {
        Swal.fire('Atención', 'Solo se pueden eliminar paradas programadas (PRG).', 'warning');
        return;
    }
    
    Swal.fire({
      title: '¿Confirmar Borrado?',
      text: `Se eliminará la parada de la máquina ${maquinaLabelMap[row.Cod_Maquina]} a las ${row.HoraInicio.substring(11, 16)}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if(result.isConfirmed) {
            try {
                await axiosInstance.delete(`/paradas/${row.ID_Parada}`);
                Swal.fire('¡Eliminada!', 'La parada ha sido borrada.', 'success');
                fetchParadas();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.error || 'No se pudo eliminar la parada.', 'error');
            }
        }
    });
  };
  
  const maquinaLabelMap = useMemo(() => {
    const map = {};
    if (maquinas) {
        maquinas.forEach(m => map[m.value] = m.label);
    }
    return map;
  }, [maquinas]);


  const columns = useMemo(() => [
    { name: 'Máquina', selector: row => maquinaLabelMap[row.Cod_Maquina] || row.Cod_Maquina, sortable: true },
    // ===== INICIO DE LA CORRECCIÓN DE FECHA =====
    { 
        name: 'Fecha', 
        selector: row => {
            if (!row.Fecha) return '';
            // Tomamos el string de fecha (ej: "2025-07-18T03:00:00.000Z") y cortamos solo la parte de la fecha.
            const datePart = row.Fecha.substring(0, 10); // Resultado: "2025-07-18"
            const [year, month, day] = datePart.split('-'); // Resultado: ["2025", "07", "18"]
            return `${day}/${month}/${year}`; // Resultado: "18/07/2025"
        }, 
        sortable: true 
    },
    // ===== FIN DE LA CORRECCIÓN DE FECHA =====
    { name: 'Hora Inicio', selector: row => row.HoraInicio.substring(11, 16), sortable: true },
    { name: 'Hora Fin', selector: row => row.HoraFin.substring(11, 16), sortable: true },
    { name: 'Cód. Parada', selector: row => row.CodigoParada, sortable: true },
    { name: 'Descripción', selector: row => row.DescripcionParada, sortable: true, grow: 2 },
    { name: 'Tipo', selector: row => row.Descripcion, sortable: true },
    { name: 'Observaciones', selector: row => row.Observacion, sortable: true, grow: 3 },
    {
        name: 'Borrar',
        button: true,
        width: '80px',
        cell: (row) => (
          <button className="btn btn-danger btn-sm" onClick={() => handleEliminarParada(row)} disabled={row.CodigoParada !== 'PRG'}>
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        ),
    }
  ], [maquinaLabelMap]);
  
  return (
    <div style={{ 
        height: 'calc(100vh - 57px)',
        width: '100%', 
        padding: '1rem',
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    }}>
        <h3 className="mb-3"><b>REGISTRACION DE PARADAS AUTOMATICAS</b></h3>

        <div className="card card-primary card-outline">
            <div className="card-body">
                <form onSubmit={handleCrearParadas}>
                    <div className="row align-items-end">
                        <div className="col-md-2 form-group mb-0">
                            <label className="font-weight-bold">Fecha:</label>
                            <input type="date" className="form-control" value={fecha} onChange={e => setFecha(e.target.value)} required />
                        </div>
                        <div className="col-md-2 form-group mb-0">
                            <label className="font-weight-bold">Tipo:</label>
                            <select className="form-control" value={tipo} onChange={e => setTipo(e.target.value)}>
                                <option>Turno Noche</option>
                                <option>Sábado</option>
                                <option>Domingo/Feriado</option>
                            </select>
                        </div>
                        <div className="col-md-2 form-group mb-0">
                            <label className="font-weight-bold">Máquina:</label>
                            <select className="form-control" value={maquinaCreacion} onChange={e => setMaquinaCreacion(parseInt(e.target.value))}>
                                {maquinas.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4 form-group mb-0">
                            <label className="font-weight-bold">Observaciones</label>
                            <input type="text" className="form-control" value={observaciones} onChange={e => setObservaciones(e.target.value)} />
                        </div>
                        <div className="col-md-2 form-group mb-0">
                            <button type="submit" className="btn btn-primary w-100 font-weight-bold">Confirma</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div className="card card-secondary card-outline mt-3" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="card-body" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
                <div className="row align-items-end mb-2">
                    <div className="col-md-3 form-group">
                        <label className="font-weight-bold">Fecha Desde:</label>
                        <input type="date" className="form-control" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
                    </div>
                     <div className="col-md-3 form-group">
                        <label className="font-weight-bold">Fecha Hasta:</label>
                        <input type="date" className="form-control" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
                    </div>
                    <div className="col-md-2 form-group">
                         <button type="button" className="btn btn-info w-100 font-weight-bold" onClick={fetchParadas}>Actualiza</button>
                    </div>
                </div>
                <div style={{ flexGrow: 1 }}>
                    <DataTable
                        columns={columns}
                        data={paradas}
                        progressPending={loading}
                        pagination
                        paginationPerPage={5}
                        paginationRowsPerPageOptions={[5, 10, 20, 50, 100]}                        
                        dense
                        highlightOnHover
                        striped
                        fixedHeader
                        fixedHeaderScrollHeight="100%" 
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default ParadasAutomaticas;
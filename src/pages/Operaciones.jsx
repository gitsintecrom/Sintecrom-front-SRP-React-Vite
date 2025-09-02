// src/pages/Operaciones.jsx

import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable, { createTheme } from 'react-data-table-component';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import maquinas from '../data/maquinas.json';

// ... (tu createTheme y CaliIcon existentes) ...
createTheme('adminLteDark', {
  text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
  background: { default: '#343a40' },
  divider: { default: '#454d55' },
  action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
  striped: { default: '#3a4047', text: '#FFFFFF' },
  highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
}, 'dark');

// Componente para el icono de Calidad
const CaliIcon = ({ iconType }) => {
    const styles = {
        width: '24px', height: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '4px', color: 'white'
    };
    switch (iconType) {
        case 'rojo-fondo': return <div style={{...styles, backgroundColor: 'red'}}></div>;
        case 'verde-fondo': return <div style={{...styles, backgroundColor: 'green'}}></div>;
        case 'gris-fondo': return <div style={{...styles, backgroundColor: 'grey'}}></div>;
        case 'amarillo-fondo': return <div style={{...styles, backgroundColor: 'yellow'}}></div>; 
        case 'blanco-fondo': return <div style={{...styles, backgroundColor: 'white'}}></div>;
        case 'rojo-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-times-circle text-danger"></i></div>;
        case 'verde-tilde-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-check-circle text-success"></i></div>;
        default: return null;
    }
};


const Operaciones = () => {
    const { maquinaId } = useParams();
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const { user } = useAuth();

    const [operaciones, setOperaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [toggleCleared, setToggleCleared] = useState(false);

    const maquinaInfo = useMemo(() => maquinas.find(m => m.id === maquinaId) || { nombre: 'Desconocida' }, [maquinaId]);

    const fetchOperaciones = async () => {
        if (!maquinaId) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/registracion/operaciones/${maquinaId}`);
            setOperaciones(response.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error');
            setOperaciones([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchOperaciones();
        const interval = setInterval(fetchOperaciones, 300000); // Refresca cada 5 minutos
        return () => clearInterval(interval);
    }, [maquinaId]);

    const handleRowSelected = React.useCallback(state => {
        setSelectedRows(state.selectedRows);
    }, []);
    
        const handleProcesar = async () => {
        // Depuración inicial
        console.log('>>> Iniciando handleProcesar');
        console.log('State - selectedRows:', selectedRows);
        console.log('State - operaciones:', operaciones);
        console.log('Params - maquinaId:', maquinaId);
        console.log('Button disabled check:', { selectedRowsLength: selectedRows.length, loading });

        if (selectedRows.length === 0 || loading) {
            console.log('Bloqueo por selección o carga:', { selectedRowsLength: selectedRows.length, loading });
            if (selectedRows.length === 0) {
                return Swal.fire('Atención', 'Debe seleccionar al menos una operación para procesar.', 'warning');
            }
            return;
        }

        // Validar mismo lote para SL
        if (maquinaId && maquinaId.startsWith('SL')) {
            console.log('Validando lote para SL');
            const firstSerieLote = selectedRows[0]?.Origen_Lote?.substring(0, 11) || 'N/A';
            const loteValido = selectedRows.every(row => row?.Origen_Lote?.substring(0, 11) === firstSerieLote);
            console.log('Lote check:', { firstSerieLote, loteValido });
            if (!loteValido) {
                return Swal.fire('Error de Validación', 'Para Slitter, todas las operaciones seleccionadas deben ser de la misma SERIE/LOTE.', 'error');
            }
        }

        // Contar operaciones activas (solo EN_PROCESO)
        const operacionesActivas = operaciones.filter(op => op.status === 'EN_PROCESO');
        console.log('Operaciones Activas (EN_PROCESO):', operacionesActivas);
        
        const hayActiva = operacionesActivas.length > 0;

        // Obtener los números de multioperación distintos de las operaciones activas
        const multiOpActivasNumeros = [...new Set(operacionesActivas.map(op => op.NumeroMultiOperacion))].filter(n => n !== null && n !== '' && n !== undefined);
        console.log('MultiOp Activas Numeros Distintos:', multiOpActivasNumeros);

        // Contar las operaciones por cada numero de multioperacion distinto
        const countMultiOps = multiOpActivasNumeros.map(num => ({
            numero: num,
            count: operacionesActivas.filter(op => op.NumeroMultiOperacion === num).length
        }));
        console.log('Conteo por MultiOp Activa:', countMultiOps);

        // Validación de múltiples operaciones activas con multiops distintos o más de 2 operaciones en un solo multiop
        if (hayActiva) {
            console.log('Hay operaciones activas, validando secuencia');

            // Condición 1: Hay más de un número de multioperación distinto
            const masDeUnMultiOpDistinto = multiOpActivasNumeros.length > 1;

            // Condición 2: Hay un solo número de multioperación distinto, pero tiene más de 2 operaciones asociadas
            const unSoloMultiOpConMasDeDosOps = multiOpActivasNumeros.length === 1 && countMultiOps[0] && countMultiOps[0].count > 2;

            if (masDeUnMultiOpDistinto || unSoloMultiOpConMasDeDosOps) {
                console.log('Múltiples multioperaciones distintos o más de 2 activas en un solo multiop detectadas');
                return Swal.fire('Fuera de Secuencia', 'Hay múltiples operaciones en proceso con distintos números de multioperación, o más de 2 operaciones en un mismo multioperación. Resuelva antes de continuar.', 'error');
            }

            const nroMultiActiva = multiOpActivasNumeros[0]; // Usamos el primer numero distinto si solo hay uno
            console.log('MultiOp Activa (para validación de selección):', nroMultiActiva);

            const seleccionInvalida = selectedRows.some(row => {
                const rowMultiOp = row.NumeroMultiOperacion;
                console.log('Row MultiOp:', rowMultiOp);
                // Invalida si la seleccion tiene un multiop diferente y no es null/undefined
                return rowMultiOp && rowMultiOp !== nroMultiActiva;
            });
            if (seleccionInvalida) {
                console.log('Secuencia inválida detectada: la selección incluye un multiop diferente al activo.');
                return Swal.fire('Fuera de Secuencia', 'La operación seleccionada no pertenece al lote activo.', 'error');
            }
        } else {
            console.log('No hay operaciones activas, saltando validación de secuencia');
        }

        // Confirmación
        console.log('Llegó a la confirmación');
        const operacionesNombres = selectedRows.map(r => r.NumeroDocumento).join(' / ') || 'Sin nombre';
        const result = await Swal.fire({
            title: 'Confirma MULTIOPERACION',
            html: `Se abrirán las Operaciones:<br>${operacionesNombres}<br>CONFIRMA?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });

        if (result.isConfirmed) {
            console.log('Confirmación aceptada, procediendo sin solicitar Nro. Batch.');
            // // Se envía un valor vacío para nroBatch, esperando que el SP lo maneje o que no sea crítico.
            // // Si tu SP necesita un valor específico o autogenerado, la lógica debe estar en el SP o en el backend.
            // const nroBatch = ''; 

            // const operacionesData = selectedRows.map(r => ({
            //     id: r.Operacion_ID,
            //     nroBatch: nroBatch 
            // }));

             // === CAMBIO CLAVE AQUÍ ===
            // Mapeamos las filas seleccionadas para extraer Operacion_ID y NroBatch
            const operacionesData = selectedRows.map(row => ({
                id: row.Operacion_ID, // Ya está bien
                nroBatch: row.NroBatch // ¡Tomamos el NroBatch directamente de la fila seleccionada!
            }));
            // =========================

            try {
                console.log('Enviando solicitud al backend:', operacionesData);
                Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                const response = await axiosInstance.post('/registracion/operaciones/procesar', { operacionesData });
                Swal.close();
                await Swal.fire('Éxito', `Multi-Operación #${response.data.multiOperacionId} creada.`, 'success');
                fetchOperaciones(); // Refresca la tabla
                setToggleCleared(!toggleCleared); // Limpiar la selección de filas
            } catch (error) {
                console.log('Error en el backend:', error);
                Swal.fire('Error', error.response?.data?.error || 'No se pudo procesar la selección.', 'error');
            }
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
        } catch (e) { return 'Fecha Inválida'; }
    };

    const columns = useMemo(() => [
        { name: 'Nº Op.', selector: row => row.NumeroDocumento, sortable: true, width: '150px', wrap: true },
        { name: 'Serie/Lote', selector: row => row.Origen_Lote.substring(0, 11), sortable: true, width: '110px' },
        { name: 'Nro. MultiOp', selector: row => row.NumeroMultiOperacion, sortable: true, width: '110px' },
        { 
            name: 'Cortes', 
            selector: row => row.Operacion_Cuchillas, 
            width: '150px',
            style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } 
        },
        { name: 'Prog', selector: row => parseFloat(row.KilosProgramadosEntrantes || 0).toFixed(0), sortable: true, right: true, width: '80px' },
        { name: 'Stock', selector: row => parseFloat(row.Stock || 0).toFixed(0), sortable: true, right: true, width: '80px' },
        { name: 'Batch', selector: row => row.NroBatch, sortable: true, width: '90px' },
        { name: 'Balanza', selector: row => parseFloat(row.Kilos_Balanza || 0).toFixed(0), sortable: true, right: true, width: '90px' },
        { name: 'Abas', cell: row => row.Abastecida === '0' ? 'OK' : '', width: '70px', center: true },
        { name: 'Op.Ant.', cell: row => row.OpAnterior.startsWith('OK') ? row.OpAnterior : '', width: '80px', center: true },
        { name: 'Cali', cell: row => <CaliIcon iconType={row.caliIcon} />, width: '60px', center: true },
        { name: 'Ancho', selector: row => row.Ancho, sortable: true, width: '80px', right: true },
        { name: 'Flia.', selector: row => row.Familia, sortable: true, width: '70px', center: true },
        { name: 'Esp.', selector: row => row.Espesor, sortable: true, width: '70px', right: true },
        { name: 'Fecha Inicio', selector: row => row.batch_FechaInicio, format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, width: '170px' },
        { name: 'Consulta', cell: row => <button className="btn btn-sm btn-info" onClick={() => navigate(`/registracion/detalle/${row.Operacion_ID}`)}>Ver</button>, ignoreRowClick: true, center: true },
        { name: 'Tarea', selector: row => row.Tarea, sortable: true, wrap: true },
        { name: 'Paq/Ata', selector: row => row.Paquetes, sortable: true, width: '80px', center: true },
        { name: 'Hoj/Roll', selector: row => row.Rollos, sortable: true, width: '80px', center: true },
    ], [navigate]);

    // Estilos condicionales de fila (ACTUALIZADOS)
    const conditionalRowStyles = [
        {
            when: row => row.status === 'BLOQUEADA',
            style: { backgroundColor: '#dc3545', color: 'white' }
        },
        {
            when: row => row.status === 'LISTA',
            style: { backgroundColor: '#28a745', color: 'white' }
        },
        {
            when: row => row.status === 'EN_PROCESO',
            style: { backgroundColor: '#6c757d', color: 'white' }
        },
        {
            // AÑADIDO 'TOLERANCIA_EXCEDIDA' A LA CONDICIÓN
            when: row => row.status === 'EN_CALIDAD' || row.status === 'CALIDAD_DICTAMINADA' || row.status === 'TOLERANCIA_EXCEDIDA',
            style: { backgroundColor: '#ffc107', color: 'black' }
        },
        {
            when: row => row.status === 'SUSPENDIDA',
            style: { backgroundColor: '#e9ecef', color: 'black' }
        }
    ];

    // Función para determinar si una fila está deshabilitada para selección
    const selectableRowDisabled = React.useCallback(row => row.status !== 'LISTA', []);

    return (
        <>
            <div className="content-header">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1><b>SRP - Operaciones Pendientes {maquinaInfo.nombre}</b></h1>
                        <button className="btn btn-secondary" onClick={() => navigate('/registracion')}>
                            <i className="fas fa-arrow-left mr-2"></i>Volver a Máquinas
                        </button>
                    </div>
                </div>
            </div>
            <div className="content">
                <div className="container-fluid">
                    <div className="card card-primary card-outline">
                        <div className="card-body p-0">
                            <DataTable
                                columns={columns}
                                data={operaciones}
                                progressPending={loading}
                                progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div>}
                                noDataComponent={<div className='py-5 text-center text-muted'>No hay operaciones pendientes para esta máquina.</div>}
                                pagination
                                paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
                                striped
                                highlightOnHover
                                selectableRows
                                onSelectedRowsChange={handleRowSelected}
                                clearSelectedRows={toggleCleared}
                                conditionalRowStyles={conditionalRowStyles}
                                theme={theme === 'dark' ? 'adminLteDark' : 'default'}
                                selectableRowDisabled={selectableRowDisabled}
                            />
                        </div>
                        <div className="card-footer text-right">
                           <button className="btn btn-primary btn-lg" onClick={handleProcesar} disabled={selectedRows.length === 0 || loading}>
                                PROCESAR
                           </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Operaciones;
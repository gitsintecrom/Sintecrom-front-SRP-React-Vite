// src/pages/Operaciones.jsx

import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importar axios para la comunicación con el agente de balanza
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable, { createTheme } from 'react-data-table-component';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import maquinas from '../data/maquinas.json';

// Configuración del tema
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
    };
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
        console.log("MaquinaId.....", maquinaId);
        
        return () => clearInterval(interval);
    }, [maquinaId]);

    const handleRowSelected = React.useCallback(state => {
        setSelectedRows(state.selectedRows);
    }, []);

    // Función auxiliar para calcular la discrepancia
    const hasDiscrepancy = (stock, kilosBalanza) => {
        const stockFloat = parseFloat(stock || 0);
        const balanzaFloat = parseFloat(kilosBalanza || 0);

        // Si ambos son cero, no hay discrepancia
        if (stockFloat === 0 && balanzaFloat === 0) return false;
        // Si el stock es cero, pero la balanza no, hay discrepancia
        if (stockFloat === 0) return balanzaFloat !== 0;
        
        const difference = Math.abs(stockFloat - balanzaFloat);
        const percentage = (difference / stockFloat) * 100;
        return percentage >= 0.5;
    };

    // Funciones del modal de pesaje
    const handlePesarClick = (row) => {
        // Siempre solicitar credenciales del supervisor
        askForSupervisor(row);
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
                if (!nombre || !password) { 
                    Swal.showValidationMessage(`Por favor, ingrese usuario y contraseña`);
                    return false; 
                }
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
                        <div class="col-sm-9"><input type="number" id="swal-pesada" class="swal2-input m-0" placeholder="Esperando lectura..." step="0.001" readonly></div>
                    </div>
                    <div class="form-group row align-items-center">
                        <label class="col-sm-3 col-form-label text-right">Total:</label>
                        <div class="col-sm-9 d-flex justify-content-start"><strong id="swal-total-display" style="font-size: 1.5rem; padding-left: 10px;">0.000</strong></div>
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
                console.log("PesadaInput: ", pesadaInput);
                
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
                    pesadaInput.value = '';
                    pesadaInput.placeholder = '0.000';
                }
                return false;
            },
            preConfirm: () => {
                clearInterval(pollingInterval);
                const pesadaInput = Swal.getHtmlContainer()?.querySelector('#swal-pesada');
                const valorActual = parseFloat(pesadaInput.value) || 0;
                const totalAcumulado = pesadasAcumuladas.reduce((sum, val) => sum + val, 0);
                
                return (totalAcumulado).toFixed(3);
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
                    
                    // Actualizar el estado de operaciones para reflejar el nuevo Kilos_Balanza
                    setOperaciones(prev => prev.map(op => op.Operacion_ID === row.Operacion_ID ? { ...op, Kilos_Balanza: kilosFinales.toString() } : op));
                    Swal.fire('¡Guardado!', `Se han registrado ${kilosFinales} Kg.`, 'success');

                    // Refrescar la grilla para ver el cambio
                    await fetchOperaciones();
                } catch (error) {
                    console.error('Error al registrar la pesada:', error); // Log para depuración
                    Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar la pesada.', 'error');
                }
            }
        });
    };
    // Fin de funciones del modal de pesaje

    const handleProcesar = async () => {
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

        if (maquinaId && maquinaId.startsWith('SL')) {
            console.log('Validando lote para SL');
            const firstSerieLote = selectedRows[0]?.Origen_Lote?.substring(0, 11) || 'N/A';
            const loteValido = selectedRows.every(row => row?.Origen_Lote?.substring(0, 11) === firstSerieLote);
            console.log('Lote check:', { firstSerieLote, loteValido });
            if (!loteValido) {
                return Swal.fire('Error de Validación', 'Para Slitter, todas las operaciones seleccionadas deben ser de la misma SERIE/LOTE.', 'error');
            }
        }

        const operacionesActivas = operaciones.filter(op => op.status === 'EN_PROCESO');
        console.log('Operaciones Activas (EN_PROCESO):', operacionesActivas);
        
        const hayActiva = operacionesActivas.length > 0;

        const multiOpActivasNumeros = [...new Set(operacionesActivas.map(op => op.NumeroMultiOperacion))].filter(n => n !== null && n !== '' && n !== undefined);
        console.log('MultiOp Activas Numeros Distintos:', multiOpActivasNumeros);

        const countMultiOps = multiOpActivasNumeros.map(num => ({
            numero: num,
            count: operacionesActivas.filter(op => op.NumeroMultiOperacion === num).length
        }));
        console.log('Conteo por MultiOp Activa:', countMultiOps);

        if (hayActiva) {
            console.log('Hay operaciones activas, validando secuencia');

            const masDeUnMultiOpDistinto = multiOpActivasNumeros.length > 1;
            const unSoloMultiOpConMasDeDosOps = multiOpActivasNumeros.length === 1 && countMultiOps[0] && countMultiOps[0].count > 2;

            if (masDeUnMultiOpDistinto || unSoloMultiOpConMasDeDosOps) {
                console.log('Múltiples multioperaciones distintos o más de 2 activas en un solo multiop detectadas');
                return Swal.fire('Fuera de Secuencia', 'Hay múltiples operaciones en proceso con distintos números de multioperación, o más de 2 operaciones en un mismo multioperación. Resuelva antes de continuar.', 'error');
            }

            const nroMultiActiva = multiOpActivasNumeros[0];
            console.log('MultiOp Activa (para validación de selección):', nroMultiActiva);

            const seleccionInvalida = selectedRows.some(row => {
                const rowMultiOp = row.NumeroMultiOperacion;
                console.log('Row MultiOp:', rowMultiOp);
                return rowMultiOp && rowMultiOp !== nroMultiActiva;
            });
            if (seleccionInvalida) {
                console.log('Secuencia inválida detectada: la selección incluye un multiop diferente al activo.');
                return Swal.fire('Fuera de Secuencia', 'La operación seleccionada no pertenece al lote activo.', 'error');
            }
        } else {
            console.log('No hay operaciones activas, saltando validación de secuencia');
        }

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
            const operacionesData = selectedRows.map(row => ({
                id: row.Operacion_ID,
                nroBatch: row.NroBatch
            }));
            try {
                console.log('Enviando solicitud al backend:', operacionesData);
                Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                const response = await axiosInstance.post('/registracion/operaciones/procesar', { operacionesData });
                Swal.close();
                await Swal.fire('Éxito', `Multi-Operación #${response.data.multiOperacionId} creada.`, 'success');
                fetchOperaciones();
                setToggleCleared(!toggleCleared);
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

    const handleRowClicked = (row) => {
        console.log('Row clicked:', row.Operacion_ID, row.status, 'Stock:', row.Stock, 'Balanza:', row.Kilos_Balanza);
        const { status, Stock, Kilos_Balanza, Operacion_ID, maquinaId } = row;

        switch (status) {
            case 'EN_PROCESO':
                navigate(`/registracion/editar/${Operacion_ID}`, { state: { operationStatus: status } });
                break;
            case 'TOLERANCIA_EXCEDIDA':
                handlePesarClick(row); // Ir al modal de pesaje
                break;
            case 'LISTA':
                if (hasDiscrepancy(Stock, Kilos_Balanza)) {
                    handlePesarClick(row); // Ir al modal de pesaje
                }
                // Si no hay discrepancia, no hace nada (según el requisito)
                break;
            case 'SUSPENDIDA':
                if (hasDiscrepancy(Stock, Kilos_Balanza)) {
                    handlePesarClick(row); // Ir al modal de pesaje
                } else {
                    navigate(`/registracion/editar/${Operacion_ID}`, { state: { operationStatus: status } });
                }
                break;
            case 'BLOQUEADA':
                // No hace nada
                break;
            default:
                // Por defecto, si no coincide con los estados anteriores o si es un estado que no tiene una acción específica
                navigate(`/registracion/detalle/${Operacion_ID}`, { state: { operationStatus: status } });
                break;
        }
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
        { 
            name: 'Consulta', 
            cell: row => (
                <button 
                    className="btn btn-sm btn-info" 
                    onClick={(e) => {
                        e.stopPropagation(); // Evita que el clic en el botón active onRowClicked
                        navigate(`/registracion/detalle/${row.Operacion_ID}`, { state: { operationStatus: row.status } });
                    }}
                >
                    Ver
                </button>
            ), 
            ignoreRowClick: true, 
            center: true 
        },
        { name: 'Tarea', selector: row => row.Tarea, sortable: true, wrap: true },
        { name: 'Paq/Ata', selector: row => row.Paquetes, sortable: true, width: '80px', center: true },
        { name: 'Hoj/Roll', selector: row => row.Rollos, sortable: true, width: '80px', center: true },
    ], [navigate]);

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
            when: row => row.status === 'EN_CALIDAD' || row.status === 'CALIDAD_DICTAMINADA' || row.status === 'TOLERANCIA_EXCEDIDA',
            style: { backgroundColor: '#ffc107', color: 'black' }
        },
        {
            when: row => row.status === 'SUSPENDIDA',
            style: { backgroundColor: '#e9ecef', color: 'black' }
        }
    ];

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
                                onRowClicked={handleRowClicked} // Añadido para manejar el clic en la fila
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
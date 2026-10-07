// src/pages/OperacionesEmbalaje.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Icono de Calidad cuadrado como en el original
const CaliIcon = ({ iconType }) => {
    const styles = {
        width: '18px', height: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '0px', border: '1px solid #333'
    };
    switch (iconType) {
        case 'rojo-fondo': return <div style={{...styles, backgroundColor: 'red'}}></div>;
        case 'verde-fondo': return <div style={{...styles, backgroundColor: 'green'}}></div>;
        case 'gris-fondo': return <div style={{...styles, backgroundColor: 'grey'}}></div>;
        case 'amarillo-fondo': return <div style={{...styles, backgroundColor: 'yellow'}}></div>; 
        case 'blanco-fondo': return <div style={{...styles, backgroundColor: 'white', border: '1px solid #ccc'}}></div>;
        case 'rojo-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-times-circle text-danger" style={{fontSize: '12px'}}></i></div>;
        case 'verde-tilde-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-check-circle text-success" style={{fontSize: '12px'}}></i></div>;
        default: return null;
    };
};

// LÓGICA DE COLORES IDÉNTICA AL VB.NET
const calcularEstadoYColorVB = (row) => {
    const tieneStock = row.Stock && parseFloat(row.Stock) > 0;
    const estaAbastecida = row.Abastecida === '0';
    const estadoOp = row.Estado;
    const estaSuspendida = row.Suspendida == 1;
    const estadoAnterior = row.EstadoAnterior;
    const suspendidaAnterior = row.SuspendidaAnterior == 1;
    const tieneCalidad = row.TieneCalidad;
    const dictamenCalidad = row.DictamenCalidad;
    
    let fueraTolerancia = false;
    if (estadoOp === '0' && tieneStock && row.Kilos_Balanza > 0) {
        const stock = parseFloat(row.Stock);
        const pesada = parseFloat(row.Kilos_Balanza);
        const opAnteriorOk = row.OpAnteriorStatus === 'OK' || row.OpAnteriorStatus === 'OK-R';
        const toleranciaPorcentaje = opAnteriorOk && row.OpAnteriorStatus === 'OK-R' ? 0.05 : 0.01;
        let margenTolerancia = stock * toleranciaPorcentaje;
        if (margenTolerancia < 1) margenTolerancia = 1;
        
        if (pesada > stock + margenTolerancia || pesada < stock - margenTolerancia) {
            fueraTolerancia = true;
        }
    }

    // ✅ CASO 1: Suspendida
    if (estaSuspendida) {
        return { 
            backgroundColor: '#FFFFFF', 
            color: 'black', 
            caliIcon: 'blanco-fondo',
            seleccionable: false,
            preembalajeText: ''
        };
    }
    
    // ✅ CASO 2: En condiciones normales (tiene stock, abastecida, op anterior OK)
    if (tieneStock && estaAbastecida && (row.OpAnteriorStatus === 'OK' || row.OpAnteriorStatus === 'OK-R')) {
        if (estadoOp === '1' && tieneCalidad) {
            // Abierta y en calidad
            if (!dictamenCalidad || dictamenCalidad === 0) {
                // Sin dictamen = AMARILLO con icono ROJO
                return { 
                    backgroundColor: '#FFFF00', 
                    color: 'black', 
                    caliIcon: 'rojo-icono',
                    seleccionable: false,
                    preembalajeText: ''
                };
            } else if (dictamenCalidad === 1 || dictamenCalidad === 2) {
                // ✅ CON dictamen = PALE GOLDENROD con icono VERDE
                return { 
                    backgroundColor: '#EEE8AA', 
                    color: 'black', 
                    caliIcon: 'verde-tilde-icono',
                    seleccionable: true,
                    preembalajeText: ''
                };
            }
        }
        
        if (estadoOp === '1' && !tieneCalidad) {
            // Abierta sin calidad = GRIS
            return { 
                backgroundColor: '#808080', 
                color: 'white', 
                caliIcon: 'gris-fondo',
                seleccionable: true,
                preembalajeText: ''
            };
        }
        
        if (estadoOp === '0') {
            // Cerrada
            if (fueraTolerancia) {
                return { 
                    backgroundColor: '#FFFF00', 
                    color: 'black', 
                    caliIcon: 'amarillo-fondo',
                    seleccionable: false,
                    preembalajeText: ''
                };
            } else {
                return { 
                    backgroundColor: '#00FF00', 
                    color: 'black', 
                    caliIcon: 'verde-fondo',
                    seleccionable: true,
                    preembalajeText: ''
                };
            }
        }
    }
    
    // ✅ CASO 3: NO está en condiciones normales - LÓGICA ESPECIAL (como VB.NET)
    // Si la operación anterior está CERRADA (EstadoAnterior != '0') y no suspendida
    if (estadoAnterior !== '0' && !suspendidaAnterior) {
        if (estadoOp === '1' && tieneCalidad) {
            // ✅ Abierta y en calidad CON dictamen = PALE GOLDENROD
            if (dictamenCalidad === 1 || dictamenCalidad === 2) {
                return { 
                    backgroundColor: '#EEE8AA', 
                    color: 'black', 
                    caliIcon: 'verde-tilde-icono',
                    seleccionable: true,
                    preembalajeText: ''
                };
            }
            // Abierta y en calidad SIN dictamen = AMARILLO
            if (!dictamenCalidad || dictamenCalidad === 0) {
                return { 
                    backgroundColor: '#FFFF00', 
                    color: 'black', 
                    caliIcon: 'rojo-icono',
                    seleccionable: false,
                    preembalajeText: ''
                };
            }
        }
        
        if (estadoOp === '1' && !tieneCalidad) {
            // Abierta sin calidad = GRIS CLARO (Preembalaje)
            return { 
                backgroundColor: '#E0E0E0', 
                color: 'black', 
                caliIcon: 'gris-fondo',
                seleccionable: true,
                preembalajeText: '+ PESO'
            };
        }
        
        // Cerrada = LAWN GREEN
        return { 
            backgroundColor: '#7CFC00', 
            color: 'black', 
            caliIcon: 'verde-fondo',
            seleccionable: true,
            preembalajeText: ''
        };
    }
    
    // ✅ CASO 4: Bloqueada (operación anterior abierta o suspendida) = ROJO
    return { 
        backgroundColor: '#FF0000', 
        color: 'white', 
        caliIcon: 'rojo-fondo',
        seleccionable: false,
        preembalajeText: ''
    };
};

const OperacionesEmbalaje = () => {
    const { maquinaId } = useParams();
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const { user } = useAuth();

    const [operaciones, setOperaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);

    const fetchOperaciones = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/registracion/operaciones/embalaje/${maquinaId}`);
            setOperaciones(response.data);
        } catch (error) {
            console.error("Error al cargar operaciones:", error);
            Swal.fire('Error', 'Error al cargar datos.', 'error');
            setOperaciones([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOperaciones();
        const interval = setInterval(fetchOperaciones, 30000);
        return () => clearInterval(interval);
    }, [maquinaId]);

    const formatNumber = (num) => {
        if (num == null || num === '') return '0';
        const parsed = parseFloat(num);
        return parsed.toLocaleString('es-AR', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        });
    };

    const formatCustomDate = (dateString) => {
        if (!dateString || typeof dateString !== 'string' || dateString.length < 8) return 'N/A';
        try {
            const year = dateString.substring(0, 4); 
            const month = dateString.substring(4, 6); 
            const day = dateString.substring(6, 8);
            return `${day}/${month}/${year}`;
        } catch (e) { 
            return 'Fecha Inválida'; 
        }
    };

    const handleRowClicked = (row) => {
        const estado = calcularEstadoYColorVB(row);
        const bg = estado.backgroundColor;
        
        // ✅ SOLO permitir click en estos colores específicos:
        const coloresPermitidos = [
            '#808080',   // Gris: Abierta sin calidad (en proceso normal)
            '#E0E0E0',   // Gris claro: Preembalaje abierta
            '#FFFF00',   // Amarillo: En calidad SIN dictamen o fuera de tolerancia
            '#EEE8AA'    // PaleGoldenrod: Calidad CON dictamen (por compatibilidad con VB original)
        ];
        
        if (!coloresPermitidos.includes(bg)) {
            return; // Bloquear click para verdes, rojos, blancos, etc.
        }
        
        // ✅ Navegar al formulario de edición
        navigate(`/registracion/editar-embalaje/${row.Operacion_ID}`, { 
            state: { 
                operationStatus: estado,
                origen: "OperacionesEmbalaje"
            } 
        });
    };

    const handleProcesar = async () => {
        if (selectedRows.length === 0) {
            return Swal.fire('Atención', 'Debe seleccionar al menos una operación para procesar.', 'warning');
        }

        console.log('🔍 Operaciones seleccionadas:', selectedRows.length);
        console.log('📋 Detalle:', selectedRows.map(r => r.NumeroDocumento));

        // ✅ VALIDACIÓN 1: Verificar que las operaciones seleccionadas sean VERDES
        const operacionesValidas = selectedRows.filter(row => {
            const estado = calcularEstadoYColorVB(row);
            // ✅ SOLO permitir procesar operaciones VERDES
            const esVerde = estado.backgroundColor === '#00FF00' || estado.backgroundColor === '#7CFC00';
            return esVerde;
        });

        if (operacionesValidas.length === 0) {
            return Swal.fire(
                'Atención', 
                'No hay operaciones válidas seleccionadas para procesar.\n\n' +
                'Solo se pueden procesar operaciones en estado:\n' +
                '• Lista para Embalaje (Verde)\n' +
                '• Preembalaje (Verde Lawn)\n\n' +
                'Las operaciones en otros estados (gris, amarillo, rojo, blanco) no pueden procesarse.', 
                'warning'
            );
        }

        console.log('✅ Operaciones válidas (verdes):', operacionesValidas.length);

        // ✅ VALIDACIÓN 2: Verificar que las operaciones aún existan (no cerradas)
        try {
            for (const row of operacionesValidas) {
                const response = await axiosInstance.get(`/registracion/operaciones/verificar-estado/${row.Operacion_ID}`);
                if (!response.data.existe) {
                    return Swal.fire('Advertencia', `Una de las operaciones seleccionadas ya fue CERRADA. Vuelva a Registración`, 'warning');
                }
            }
        } catch (error) {
            console.error('Error al verificar estado:', error);
        }

        // ✅ VALIDACIÓN 3: Validar compatibilidad entre operaciones
        const primeraOperacion = operacionesValidas[0];
        let serieBase = '';
        let serieLBase = '';
        let anchoBase = '';
        let numeroPedidoBase = '';
        let operacionesAAbrir = '';
        let hayError = false;
        let mensajeError = '';
        let validar35Embalaje = false;

        // Obtener datos de la primera operación
        if (maquinaId === 'EMB') {
            serieBase = primeraOperacion.Origen_Lote?.substring(0, 5) || '';
            if (primeraOperacion.CodProdPedido?.trim().length >= 23) {
                anchoBase = primeraOperacion.CodProdPedido.trim().substring(19, 4);
            } else {
                anchoBase = '0000';
            }
        } else {
            serieBase = primeraOperacion.Origen_Lote || '';
        }
        
        serieLBase = primeraOperacion.Origen_Lote || '';
        numeroPedidoBase = primeraOperacion.NumeroPedido?.trim() || '';
        operacionesAAbrir = primeraOperacion.NumeroDocumento || '';

        // ✅ VALIDAR TODAS LAS OPERACIONES SELECCIONADAS
        for (let i = 1; i < operacionesValidas.length; i++) {
            const row = operacionesValidas[i];
            let serie = '';
            let serieL = row.Origen_Lote || '';
            let ancho = '';
            let numeroPedido = row.NumeroPedido?.trim() || '';

            if (maquinaId !== 'EMB') {
                // Para Slitter: deben ser misma Serie/Lote completa
                if (serieBase !== serieL) {
                    hayError = true;
                    mensajeError = 'Las operaciones seleccionadas deben ser de la misma SERIE/LOTE';
                    break;
                }
            } else {
                // Para Embalaje
                serie = serieL.substring(0, 5);
                
                if (row.CodProdPedido?.trim().length >= 23) {
                    ancho = row.CodProdPedido.trim().substring(19, 4);
                } else {
                    ancho = '0000';
                }

                if (serieBase === serie) {
                    if (numeroPedidoBase !== numeroPedido) {
                        validar35Embalaje = true;
                        if (serieLBase !== serieL) {
                            hayError = true;
                            mensajeError = 'Las operaciones seleccionadas deben ser del mismo PEDIDO y la misma SERIE\n' +
                                        'o de la misma SERIE/LOTE (en caso de ser PEDIDOS distintos)\ny Siempre los ANCHOS deben ser iguales';
                            break;
                        } else {
                            if (ancho !== anchoBase) {
                                hayError = true;
                                mensajeError = 'Los anchos de las operaciones seleccionadas deben ser iguales';
                                break;
                            }
                        }
                    } else {
                        if (ancho !== anchoBase) {
                            hayError = true;
                            mensajeError = 'Los anchos de las operaciones seleccionadas deben ser iguales';
                            break;
                        }
                    }
                } else {
                    hayError = true;
                    mensajeError = 'Las operaciones seleccionadas deben ser del mismo PEDIDO y la misma SERIE\n' +
                                'o de la misma SERIE/LOTE (en caso de ser PEDIDOS distintos)\ny Siempre los ANCHOS deben ser iguales';
                    break;
                }
            }

            operacionesAAbrir += ' / ' + row.NumeroDocumento;
        }

        if (hayError) {
            return Swal.fire('Error de Validación', mensajeError, 'error');
        }

        // ✅ VALIDACIÓN 4: Contar operaciones a registrar (máximo 15)
        try {
            let cantARegistrar = 0;
            for (const row of operacionesValidas) {
                const response = await axiosInstance.get(`/registracion/operaciones/contar-registrar-embalaje/${row.Operacion_ID}`);
                cantARegistrar += response.data.cantidad || 0;
            }

            if (cantARegistrar > 15) {
                return Swal.fire(
                    'Advertencia Embalaje',
                    'Las operaciones seleccionadas tienen demasiadas operaciones involucradas\nDesmarque algunas para poder procesar.',
                    'warning'
                );
            }
        } catch (error) {
            console.error('Error al contar operaciones:', error);
        }

        // ✅ CONFIRMAR PROCESAMIENTO
        const result = await Swal.fire({
            title: 'Confirma MULTIOPERACION',
            html: `Se abrirán las Operaciones:<br><strong>${operacionesAAbrir}</strong><br>CONFIRMA?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d'
        });

        if (!result.isConfirmed) return;

        // ✅ PROCESAR MULTI-OPERACIÓN
        Swal.fire({
            title: 'Procesando...',
            text: 'Creando Multi-Operación...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            // 1. Obtener último número de Multi-Operación
            const responseUltima = await axiosInstance.get('/registracion/operaciones/ultima-multioperacion');
            const ultimaMultiOp = responseUltima.data.ultimaMultiOperacion || 0;
            const nuevaMultiOp = ultimaMultiOp + 1;

            // 2. Procesar todas las operaciones
            const operacionesData = operacionesValidas.map(row => ({
                id: row.Operacion_ID,
                nroBatch: row.NroBatch
            }));

            const response = await axiosInstance.post('/registracion/operaciones/procesar-multioperacion', {
                operacionesData,
                numeroMultiOperacion: nuevaMultiOp,
                maquina: maquinaId,
                usuario: user?.nombre || 'sistema'
            });

            Swal.close();
            
            await Swal.fire(
                'Éxito',
                `Multi-Operación #${nuevaMultiOp} creada.\nOperaciones: ${operacionesAAbrir}`,
                'success'
            );

            // 3. Recargar operaciones
            await fetchOperaciones();
            
            // 4. Navegar al detalle de la primera operación
            if (maquinaId === 'EMB') {
                navigate(`/registracion/editar-embalaje/${primeraOperacion.Operacion_ID}`, {
                    state: {
                        numeroMultiOperacion: nuevaMultiOp,
                        origen: 'ProcesarMultiOperacion'
                    }
                });
            } else {
                navigate(`/registracion/editar/${primeraOperacion.Operacion_ID}`, {
                    state: {
                        numeroMultiOperacion: nuevaMultiOp,
                        origen: 'ProcesarMultiOperacion'
                    }
                });
            }

        } catch (error) {
            Swal.close();
            console.error('Error al procesar:', error);
            Swal.fire('Error', error.response?.data?.error || 'No se pudo procesar la selección.', 'error');
        }
    };

    const columns = useMemo(() => [
        { name: 'Nro. Pedido', selector: row => row.NumeroPedido || '', sortable: true, width: '90px', wrap: true },
        { name: 'Nro. Item', selector: row => row.NumeroItem || '', sortable: true, width: '70px', wrap: true },
        { name: 'Nº Operación', selector: row => row.NumeroDocumento || '', sortable: true, width: '130px', wrap: true },
        { name: 'Serie/Lote', selector: row => row.Origen_Lote?.substring(0, 11) || '', sortable: true, width: '110px', wrap: true },
        { name: 'Nro. MultiOp.', selector: row => row.NumeroMultiOperacion || '', sortable: true, width: '100px', wrap: true },
        { name: 'Prog.', selector: row => formatNumber(row.KilosProgramadosEntrantes), right: true, width: '70px' },
        { name: 'Stock', selector: row => formatNumber(row.Stock), right: true, width: '70px' },
        { name: 'Batch', selector: row => row.NroBatch || '', sortable: true, width: '80px', wrap: true },
        { name: 'Balanza', selector: row => formatNumber(row.Kilos_Balanza), right: true, width: '80px' },
        { name: 'Abas', selector: row => row.Abastecida === '0' ? 'OK' : '', width: '60px', center: true },
        { name: 'OpAnt', selector: row => row.OpAnteriorStatus || '', width: '60px', center: true },
        { name: 'Clientes', selector: row => row.Clientes || '', width: '150px', wrap: true },
        { name: 'Cali', cell: row => <CaliIcon iconType={calcularEstadoYColorVB(row).caliIcon} />, width: '70px', center: true },
        { name: 'Ancho', selector: row => formatNumber(row.Ancho), right: true, width: '70px' },
        { name: 'Flia.', selector: row => row.Familia || '', width: '50px', center: true },
        { name: 'Esp.', selector: row => row.Espesor || '', width: '60px', right: true },
        { name: 'Fecha Inicio', 
          selector: row => row.batch_FechaInicio, 
          format: row => formatCustomDate(row.batch_FechaInicio), 
          sortable: true, 
          width: '100px' },
        { name: 'Consulta', 
            cell: row => (
                <button 
                className="btn btn-xs btn-default border" 
                onClick={(e) => {
                    e.stopPropagation();
                    // CAMBIAR: Navegar a consultar en lugar de detalle
                    navigate(`/registracion/consultar-embalaje/${row.Operacion_ID}`, { 
                        state: { operationStatus: calcularEstadoYColorVB(row), origen: "OperacionesEmbalaje" } 
                    });
                }}
                >
                Ver
                </button>
            ), 
            width: '80px', 
            center: true 
        },
        { name: 'Preembalaje', 
          selector: row => calcularEstadoYColorVB(row).preembalajeText, 
          width: '100px', 
          center: true 
        },
        { name: 'Tarea', selector: row => row.Tarea || '', width: '120px', wrap: true },
        { name: 'Pag/Ata', selector: row => row.CantidadPaquetes || '', width: '70px', center: true },
        { name: 'Hoj/Roll', selector: row => row.CantidadRollos || '', width: '80px', center: true },
        { name: 'Cod Prod Pedido', selector: row => row.CodProdPedido || '', width: '150px', wrap: true }
    ], [navigate]);

    // ESTILOS DE FILA - LÓGICA IDÉNTICA AL VB.NET
    const conditionalRowStyles = [
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#FF0000'; // Rojo - BLOQUEADA
            },
            style: { backgroundColor: '#FF0000', color: 'white' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#7CFC00'; // LawnGreen - Preembalaje cerrada
            },
            style: { backgroundColor: '#7CFC00', color: 'black' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#00FF00'; // Verde - LISTA
            },
            style: { backgroundColor: '#00FF00', color: 'black' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#E0E0E0'; // Gris claro - Preembalaje abierta
            },
            style: { backgroundColor: '#E0E0E0', color: 'black' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#808080'; // Gris - EN_PROCESO
            },
            style: { backgroundColor: '#808080', color: 'white' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#FFFF00'; // Amarillo - Tolerancia/Calidad
            },
            style: { backgroundColor: '#FFFF00', color: 'black' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#EEE8AA'; // PaleGoldenrod - Calidad dictaminada
            },
            style: { backgroundColor: '#EEE8AA', color: 'black' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#FFFFFF'; // Blanco - SUSPENDIDA
            },
            style: { backgroundColor: '#FFFFFF', color: 'black' }
        }
    ];

    const customStyles = {
        table: { style: { backgroundColor: 'white' } },
        headRow: { style: { backgroundColor: 'white', color: 'black', fontWeight: 'bold', fontSize: '11px', fontStyle: 'italic', minHeight: '30px' } },
        rows: { style: { minHeight: '26px', fontSize: '12px', borderBottom: '1px solid #ccc' } },
        cells: { style: { padding: '2px' } }
    };

    // ✅ FUNCIÓN CLAVE: SOLO permitir seleccionar filas VERDES
    const selectableRowDisabled = (row) => {
        const estado = calcularEstadoYColorVB(row);
        // ✅ SOLO permitir seleccionar si es VERDE (#00FF00 o #7CFC00)
        const esVerde = estado.backgroundColor === '#00FF00' || estado.backgroundColor === '#7CFC00';
        return !esVerde; // Retorna true (deshabilitado) si NO es verde
    };

    return (
        <div style={{backgroundColor: '#800000', minHeight: '100vh', padding: '10px'}}>
            <div className="container-fluid">
                {/* Header Superior */}
                <div className="d-flex justify-content-between align-items-start mb-2" style={{color: 'white'}}>
                    <div>
                        <h6 className="m-0"><i>REGISTRACION - Producción</i></h6>
                        <h5 className="m-0"><b>SRP - Operaciones Pendientes Embalaje</b></h5>
                    </div>
                    <div className="text-center">
                        <span style={{background: 'black', color: 'red', padding: '2px 30px', fontWeight: 'bold', fontSize: '20px'}}>Embalaje</span>
                    </div>
                    <div className="d-flex flex-column align-items-end">
                        <span>Usuario: {user?.nombre || 'Desconocido'}</span>
                        <button className="btn btn-sm btn-light mt-1" onClick={() => navigate('/registracion')}>
                            <i className="fas fa-door-open" style={{fontSize: '24px', color: '#B8860B'}}></i>
                        </button>
                    </div>
                </div>

                {/* Tabla de Datos */}
                <div className="card" style={{borderRadius: '0px'}}>
                    <div className="card-body p-0 border">
                        <DataTable
                            columns={columns}
                            data={operaciones}
                            progressPending={loading}
                            progressComponent={<div className="py-5"><div className="spinner-border text-primary"></div></div>}
                            conditionalRowStyles={conditionalRowStyles}
                            customStyles={customStyles}
                            fixedHeader
                            fixedHeaderScrollHeight="60vh"
                            selectableRows
                            onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                            noDataComponent={<div className="p-3">No hay datos</div>}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                                selectAllRowsItem: true,
                                selectAllRowsItemText: 'Todos'
                            }}
                            highlightOnHover
                            selectableRowDisabled={selectableRowDisabled}
                            onRowClicked={handleRowClicked}
                        />
                    </div>
                </div>

                {/* REFERENCIAS DE COLORES */}
                <div className="row mt-2 text-white" style={{fontSize: '11px', fontWeight: 'bold'}}>
                    <div className="col-md-9">
                        <div className="row">
                            <div className="col-4 d-flex align-items-center mb-1">
                                <div style={{width: '20px', height: '14px', background: 'green', border: '1px solid white', marginRight: '5px'}}></div>
                                <span>Cerrada - Lista para Embalaje</span>
                            </div>
                            <div className="col-4 d-flex align-items-center mb-1">
                                <div style={{width: '20px', height: '14px', background: 'grey', border: '1px solid white', marginRight: '5px'}}></div>
                                <span>Abierta - En proceso de Embalaje</span>
                            </div>
                            <div className="col-4 d-flex align-items-center mb-1">
                                <div style={{width: '20px', height: '14px', background: 'yellow', border: '1px solid white', marginRight: '5px'}}></div>
                                <span>En Calidad o fuera de tolerancia</span>
                            </div>
                            <div className="col-4 d-flex align-items-center">
                                <div style={{width: '20px', height: '14px', background: 'lawngreen', border: '1px solid white', marginRight: '5px'}}></div>
                                <span>Cerrada - Preembalaje</span>
                            </div>
                            <div className="col-4 d-flex align-items-center">
                                <div style={{width: '20px', height: '14px', background: 'white', border: '1px solid #ccc', marginRight: '5px'}}></div>
                                <span>Abierta - En proceso de Preembalaje</span>
                            </div>
                            <div className="col-4 d-flex align-items-center">
                                <div style={{width: '20px', height: '14px', background: 'red', border: '1px solid white', marginRight: '5px'}}></div>
                                <span>No puede procesarse</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 text-right">
                        <button className="btn btn-light btn-lg px-5" 
                                style={{borderRadius: '0px', fontWeight: 'bold', color: 'black', fontSize: '18px'}}
                                onClick={handleProcesar}
                                disabled={selectedRows.length === 0 || loading}>
                            PROCESAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperacionesEmbalaje;
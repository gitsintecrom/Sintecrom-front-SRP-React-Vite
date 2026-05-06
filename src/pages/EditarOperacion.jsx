// src/pages/EditarOperacion.jsx

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './EditarOperacion.css';
import CuchillasModal from '../components/CuchillasModal';
import CuchillasInputModal from '../components/CuchillasInputModal';
import ToleranciasModal from '../components/ToleranciasModal';
import SupervisorAuthModal from '../components/SupervisorAuthModal';
import NotasCalipsoModal from '../components/NotasCalipsoModal';
import PesajeModalSelector from '../components/PesajeModalSelector';

const InfoItem = ({ label, value, bold = false }) => {
    const displayValue = value !== null && value !== undefined && value !== '' ? String(value) : 'N/A';
    return (
        <div className="info-item">
            <span className="info-label">{label}:</span>
            <span className={`info-value ${bold ? 'bold' : ''}`}>{displayValue}</span>
        </div>
    );
};

const formatNumber = (num, decimals = 0) => {
    if (num === null || num === undefined || num === '') return '0';
    let number;
    try {
        number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
    } catch (e) {
        number = 0;
    }
    if (isNaN(number)) return '0';
    return number.toLocaleString('es-AR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

const EditarOperacion = () => {
    const { operacionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editedLineas, setEditedLineas] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
   
    const [showCuchillasModal, setShowCuchillasModal] = useState(false);
    const [cuchillasData, setCuchillasData] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [showCuchillasInputModal, setShowCuchillasInputModal] = useState(false);
    const [showToleranciasModal, setShowToleranciasModal] = useState(false);
    const [showSupervisorModal, setShowSupervisorModal] = useState(false);
    const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
    const [notasCalipso, setNotasCalipso] = useState('');
    const [showPesajeModal, setShowPesajeModal] = useState(false);
    const [selectedLinea, setSelectedLinea] = useState(null);
    const operationStatusFromGrid = location.state?.operationStatus;
    const [maquinaNumero, setMaquinaNumero] = useState("");
    
    const [inspeccionData, setInspeccionData] = useState(null);

    const fetchData = async () => {
        if (!operacionId) {
            navigate('/registracion');
            return;
        }
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
            const fetchedData = response.data || { header: {}, lineas: [], balance: {} };
            const maquinaId = fetchedData.header?.maquinaId || "No disponible";
            const maquinaMatch = maquinaId?.match(/^SL(\d+)$/);
            setMaquinaNumero(maquinaMatch ? maquinaMatch[1] : "No disponible");
            setData(fetchedData);
            setEditedLineas([...fetchedData.lineas]);
            setHasChanges(false);
        } catch (err) {
            Swal.fire('Error', 'No se pudo cargar el detalle.', 'error');
            navigate('/registracion');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [operacionId, navigate]);
    
    useEffect(() => {
        const fetchInspeccionData = async () => {
            if (!operacionId || !data?.header?.LoteID) return;
            try {
                const response = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${data.header.LoteID}`);
                setInspeccionData(response.data);
            } catch (error) {
                console.error('Error al cargar inspección:', error);
            }
        };
        fetchInspeccionData();
    }, [operacionId, data?.header?.LoteID]);

    const currentStatus = useMemo(() => operationStatusFromGrid || data?.header?.status || '', [operationStatusFromGrid, data]);
    const isOperationEditable = useMemo(() => ['LISTA', 'EN_PROCESO', 'EN_CALIDAD'].includes(currentStatus), [currentStatus]);
    
    const isInspeccionComplete = useMemo(() => {
        if (!inspeccionData) return false;
        if (!inspeccionData.header?.inicioRevisado) return false;
        
        const pasadasData = inspeccionData.pasadasData || {};
        const cantPasadas = inspeccionData.header?.cantPasadas || 0;
        
        for (let i = 1; i <= cantPasadas; i++) {
            const pasada = pasadasData[i];
            if (!pasada) return false;
            
            const camposObligatorios = {
                'espesorBLM': pasada.espesorBLM,
                'espesorC': pasada.espesorC,
                'espesorBLO': pasada.espesorBLO,
                'anchoRealBobina': pasada.anchoRealBobina,
            };
            
            for (const [campo, valor] of Object.entries(camposObligatorios)) {
                const numValor = parseFloat(valor) || 0;
                if (numValor === 0) return false;
            }
            
            const anchosDeCorte = pasada.anchosDeCorte || [];
            if (anchosDeCorte.length === 0) return false;
            
            for (const ancho of anchosDeCorte) {
                if (parseFloat(ancho.valor) === 0) return false;
            }
        }
        
        return true;
    }, [inspeccionData]);
    
    const canEditOperacion = useMemo(() => {
        return isOperationEditable && isInspeccionComplete;
    }, [isOperationEditable, isInspeccionComplete]);

    const handleSaveChanges = async () => {
        if (!hasChanges) return;
        setModalLoading(true);
        try {
            const changes = editedLineas.map((linea, index) => {
                const original = data.lineas[index];
                const changedFields = {};
                ['Programados', 'SobreOrden', 'Calidad', 'Atados', 'Rollos'].forEach(field => {
                    if (linea[field] !== original[field]) changedFields[field] = linea[field];
                });
                return { ...linea, changedFields };
            }).filter(l => Object.keys(l.changedFields).length > 0);
            await axiosInstance.put(`/registracion/actualizar-lineas/${operacionId}`, { lineas: changes });
            await Swal.fire('¡Éxito!', 'Cambios guardados.', 'success');
            setHasChanges(false);
            await fetchData();
        } catch (error) { Swal.fire('Error', 'Error al guardar.', 'error'); } 
        finally { setModalLoading(false); }
    };

    // ✅ VALIDACIONES DEL VB.NET PARA EL CIERRE
    const validarCierreVB = async () => {
        if (!data || !data.lineas || !data.balance) {
            return { valido: false, mensajes: [], requiereSupervisor: false };
        }

        const TOLERANCIA_GENERAL = 0.05; // 5% - igual que VB.NET
        const TOLERANCIA_INDIVIDUAL = 0.35; // 35% - igual que VB.NET
        
        let mensajesError = [];
        let hayFueraTolerancia = false;
        let faltaDictamenCalidad = false;
        let requiereSupervisor = false;

        // === VALIDAR CADA LÍNEA NORMAL (como en VB.NET) ===
        for (const linea of data.lineas) {
            if (linea.esSobrante || linea.esScrap) continue;

            const programados = parseFloat(linea.Programados) || 0;
            const sobreOrden = parseFloat(linea.SobreOrden) || 0;
            const calidad = parseFloat(linea.Calidad) || 0;
            const totalRegistrado = sobreOrden + calidad;

            // Calcular tolerancia programada (mínimo 2 kg) - IGUAL QUE VB.NET
            let toleranciaProg = programados * TOLERANCIA_GENERAL;
            if (toleranciaProg < 2) toleranciaProg = 2;

            // Verificar si está fuera de tolerancia general
            const diferencia = Math.abs(totalRegistrado - programados);
            if (diferencia > toleranciaProg) {
                hayFueraTolerancia = true;
                mensajesError.push(`Fuera Tolerancia en Serie/Lote ${linea.Destino || linea.SerieLote}`);
            }

            // Verificar tolerancia individual (35%) - IGUAL QUE VB.NET
            let toleranciaInd = programados * TOLERANCIA_INDIVIDUAL;
            if (toleranciaInd < 2) toleranciaInd = 2;
            if (diferencia > toleranciaInd) {
                requiereSupervisor = true;
            }

            // Verificar si está en calidad sin dictamen (sEstaEnCalidad == "1" en VB.NET)
            // Simulamos: si hay algo en Calidad y no está "dictaminado"
            if (calidad > 0 && !linea.dictamen) {
                faltaDictamenCalidad = true;
                mensajesError.push(`${linea.Destino || linea.SerieLote} - FALTA DICTAMEN DE CALIDAD`);
            }
        }

        // === VALIDAR SOBRANTES (como en VB.NET) ===
        const lineasSobrante = data.lineas.filter(l => l.esSobrante);
        for (const sobrante of lineasSobrante) {
            // En VB.NET: si dgSobrantes.Rows[j].Cells["EnCalidadItem"].Value == "1"
            // Simulamos: si hay kilos en calidad en sobrante, NO validar el 35%
            const calidadSobrante = parseFloat(sobrante.Calidad) || 0;
            if (calidadSobrante > 0) {
                requiereSupervisor = false; // Si tiene calidad, no valida 35%
                faltaDictamenCalidad = true;
                mensajesError.push("Sobrante - FALTA DICTAMEN DE CALIDAD");
            }
        }

        // === VALIDAR SCRAP (como en VB.NET) ===
        const lineasScrap = data.lineas.filter(l => l.esScrap);
        for (const scrap of lineasScrap) {
            const calidadScrap = parseFloat(scrap.Calidad) || 0;
            if (calidadScrap > 0) {
                faltaDictamenCalidad = true;
                mensajesError.push("Scrap - FALTA DICTAMEN DE CALIDAD");
            }
        }

        // === VALIDAR SALDO TOTAL (como en VB.NET Cierro()) ===
        const kgsEntrantes = parseFloat(data.balance.kgsEntrantes) || 0;
        const sobreOrdenTotal = parseFloat(data.balance.sobreOrden) || 0;
        const calidadTotal = parseFloat(data.balance.calidad) || 0;
        const sobranteTotal = parseFloat(data.balance.sobrante) || 0;
        const scrapTotal = parseFloat(data.balance.scrap) || 0;
        
        const saldo = kgsEntrantes - sobreOrdenTotal - calidadTotal - sobranteTotal - scrapTotal;
        let toleranciaSaldo = kgsEntrantes * TOLERANCIA_GENERAL;
        if (toleranciaSaldo < 2) toleranciaSaldo = 2;
        
        if (Math.abs(saldo) > toleranciaSaldo) {
            hayFueraTolerancia = true;
            mensajesError.push(`El SALDO DEBE estar dentro de la TOLERANCIA para efectuar el cierre: ${toleranciaSaldo.toFixed(3)} kgs.`);
        }

        // === RESULTADO (como en VB.NET) ===
        if (mensajesError.length > 0) {
            return {
                valido: false,
                requiereSupervisor,
                mensajes: mensajesError,
                saldo: saldo.toFixed(3),
                toleranciaSaldo: toleranciaSaldo.toFixed(3)
            };
        }

        return {
            valido: true,
            requiereSupervisor,
            mensajes: [],
            saldo: saldo.toFixed(3)
        };
    };

    // ✅ FUNCIÓN DE CIERRE CON VALIDACIONES VB.NET
    const handleCierreClick = async () => {
        // ✅ VALIDACIÓN 1: Verificar que la inspección final esté aprobada
        if (!inspeccionData?.header?.finalRevisado) {
            await Swal.fire({
                title: 'Advertencia',
                text: 'Se debe aprobar la INSPECCION FINAL antes de cerrar la operación',
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#ffc107'
            });
            return; // ⛔ DETENER AQUÍ - No permitir el cierre
        }

        // ✅ VALIDACIÓN 2: Validaciones de tolerancia y calidad (VB.NET - Cierro())
        const validacion = await validarCierreVB();
        
        if (!validacion.valido) {
            const mensajeCompleto = validacion.mensajes.join('\n');
            
            if (validacion.requiereSupervisor) {
                const result = await Swal.fire({
                    title: 'Advertencia',
                    html: `<div style="text-align: left; white-space: pre-wrap; font-family: monospace;">${mensajeCompleto}</div>`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Autorizar con Supervisor',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#28a745',
                    cancelButtonColor: '#6c757d'
                });
                
                if (result.isConfirmed) {
                    setShowSupervisorModal(true);
                    return;
                }
                return;
            } else {
                await Swal.fire({
                    title: 'Advertencia',
                    html: `<div style="text-align: left; white-space: pre-wrap; font-family: monospace;">${mensajeCompleto}</div>`,
                    icon: 'warning',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#ffc107'
                });
                return;
            }
        }

        // ✅ Si pasó todas las validaciones, mostrar confirmación de cierre (VB.NET - CierroFinal())
        const result = await Swal.fire({
            title: '¿Confirmar Cierre?',
            text: 'Se CERRARA la operación.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            confirmButtonText: 'Sí, cerrar',
            cancelButtonText: 'Cancelar'
        });
        
        if (!result.isConfirmed) return;

        // ✅ Ejecutar cierre en backend
        setModalLoading(true);
        try {
            const userStr = localStorage.getItem('user'); 
            const userObj = userStr ? JSON.parse(userStr) : { nombre: 'SISTEMA' };
            
            await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, { 
                usuario: userObj.nombre
            });
            
            await Swal.fire('¡Éxito!', 'Cerrada con éxito.', 'success');
            navigate(`/registracion/operaciones/${data.header.maquinaId}`);
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Error al cerrar.', 'error');
        } finally {
            setModalLoading(false);
        }
    };

    const handleNotasCalipsoClick = async () => {
        setModalLoading(true); setShowNotasCalipsoModal(true);
        try {
            const response = await axiosInstance.get(`/registracion/notas-calipso/${operacionId}`);
            setNotasCalipso(response.data.notes);
        } catch (error) { setShowNotasCalipsoModal(false); } 
        finally { setModalLoading(false); }
    };

    if (loading || !data) return null;
    const { header, balance } = data;
    const isSuspended = currentStatus === 'SUSPENDIDA';

    return (
        <>
            <div className={`detalle-container ${isOperationEditable ? 'editar-mode' : ''}`}>
                <div className="main-content">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h1 className="m-0" style={{ color: 'white' }}>REGISTRACION Slitter {maquinaNumero} - Editar Operación</h1>
                        <button className="btn btn-secondary" onClick={() => navigate(-1)}><i className="fas fa-arrow-left mr-2"></i>Volver a la Grilla</button>
                    </div>

                    <div className="detalle-header">
                        <div className="header-top-row">
                            <div className="header-left-col">
                                <InfoItem label="Clientes" value={header.Clientes} />
                                <div className="row mt-2">
                                    <div className="col-sm-6">
                                        <InfoItem label="Serie/Lote" value={header.SerieLote} bold />
                                        <InfoItem label="Matching" value={header.Matching} />
                                        <InfoItem label="Batch" value={header.Batch} />
                                    </div>
                                    <div className="col-sm-6">
                                        <InfoItem label="Cant.Atados" value={header.CantAtados || 0} />
                                        <InfoItem label="Cant.Rollos" value={header.CantRollos || 0} />
                                        <InfoItem label="Stock" value={formatNumber(header.Stock)} />
                                        <InfoItem label="Kgs Programados" value={formatNumber(header.KgsProgramados, 2)} />
                                    </div>
                                </div>
                                <InfoItem label="Scrap Programado" value={formatNumber(header.ScrapProgramado, 2)} />
                            </div>
                            <div className="header-right-col">
                                <div className="entrante-block">
                                    <div className="entrante-header">ENTRANTE</div>
                                    <div className="entrante-body">
                                        <InfoItem label="Familia" value={header.Familia} />
                                        <InfoItem label="Aleación" value={header.Aleacion} />
                                        <InfoItem label="Temple" value={header.Temple} />
                                        <InfoItem label="Espesor" value={header.Espesor} />
                                        <InfoItem label="País Origen" value={header.PaisOrigen} />
                                        <InfoItem label="Recubrimiento" value={header.Recubrimiento} />
                                        <InfoItem label="Calidad" value={header.Calidad} />
                                        <InfoItem label="Ancho" value={header.Ancho} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="detalle-body-container">
                        <div className="grid-header">
                            <div></div> <div>Programados</div> <div>Sobre Orden</div> <div>Calidad (Suspendido)</div> <div>Atados</div> <div>Rollos</div>
                        </div>
                        <div className="grid-body">
                            {editedLineas
                                .filter(l => !l.esSobrante && !l.esScrap) 
                                .map((linea, index) => (
                                <div key={index} className="grid-row" style={{ cursor: 'default' }}>
                                    <div
                                        className="grid-cell-desc"
                                        style={{ 
                                            cursor: canEditOperacion ? 'pointer' : 'default',
                                            opacity: canEditOperacion ? 1 : 0.7
                                        }}
                                        onClick={canEditOperacion ? () => {
                                            setSelectedLinea({ ...linea, bSobrante: false, bScrap: false, SerieLote: header.SerieLote });
                                            setShowPesajeModal(true);
                                        } : undefined}
                                        title={!canEditOperacion ? (inspeccionData && !inspeccionData.header?.inicioRevisado ? "Debe revisar el inicio en Inspección" : "Complete todos los datos de las pasadas") : ""}
                                    >
                                        <div>
                                            <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
                                                {String(linea.Ancho || 'N/A')}
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
                                                {String(linea.Cuchillas || 'N/A')}
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
                                                {String(linea.Tarea || 'N/A')}
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
                                                {linea.Destino ? String(linea.Destino || '').substring(0, 11) : 'N/A'}
                                            </span>
                                        </div>
                                        {!canEditOperacion && <div className="text-muted small">Bloqueado</div>}
                                    </div>
                                    <input 
                                        type="text" 
                                        className="form-control grid-cell-input"
                                        style={{
                                            backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
                                            opacity: canEditOperacion ? 1 : 0.7
                                        }}
                                        value={formatNumber(linea.Programados)} 
                                        readOnly 
                                        disabled={!canEditOperacion}
                                    />
                                    <input 
                                        type="text" 
                                        className="form-control grid-cell-input"
                                        style={{
                                            backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
                                            opacity: canEditOperacion ? 1 : 0.7
                                        }}
                                        value={formatNumber(linea.SobreOrden)} 
                                        readOnly 
                                        disabled={!canEditOperacion}
                                    />
                                    <input 
                                        type="text" 
                                        className="form-control grid-cell-input"
                                        style={{
                                            backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
                                            opacity: canEditOperacion ? 1 : 0.7
                                        }}
                                        value={formatNumber(linea.Calidad)} 
                                        readOnly 
                                        disabled={!canEditOperacion}
                                    />
                                    <input 
                                        type="text" 
                                        className="form-control grid-cell-input"
                                        style={{
                                            backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
                                            opacity: canEditOperacion ? 1 : 0.7
                                        }}
                                        value={formatNumber(linea.TotAtados)} 
                                        readOnly 
                                        disabled={!canEditOperacion}
                                    />
                                    <input 
                                        type="text" 
                                        className="form-control grid-cell-input"
                                        style={{
                                            backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
                                            opacity: canEditOperacion ? 1 : 0.7
                                        }}
                                        value={formatNumber(linea.TotRollos)} 
                                        readOnly 
                                        disabled={!canEditOperacion}
                                    />
                                </div>
                            ))}

                            {[
                                { tipo: 'Sobrante', totSO: balance.sobrante, totAt: balance.atadosSobrante, totRo: balance.rollosSobrante, config: { bSobrante: true, bScrap: false, Tarea: 'Sobrante' } },
                                { tipo: 'Scrap Seriado', totSO: balance.scrapSeriado, totAt: balance.atadosScrapSeriado, totRo: 0, config: { bSobrante: false, bScrap: true, bScrapSeriado: true, Tarea: 'Scrap Seriado' } },
                                { tipo: 'Scrap No Seriado', totSO: balance.scrapNoSeriado, totAt: balance.atadosScrapNoSeriado, totRo: 0, config: { bSobrante: false, bScrap: true, bScrapNoSeriado: true, Tarea: 'Scrap No Seriado' } }
                            ].map((item) => (
                                <div key={item.tipo} className="grid-row" style={{ cursor: 'default' }}>
                                    <div
                                        className="grid-cell-desc font-weight-bold"
                                        style={{ 
                                            cursor: canEditOperacion ? 'pointer' : 'default',
                                            opacity: canEditOperacion ? 1 : 0.7
                                        }}
                                        onClick={canEditOperacion ? async () => {
                                            let lb = { ...item.config, Ancho: header.Ancho, Cuchillas: header.Cuchillas, SerieLote: header.SerieLote, LoteID: header.LoteID, Operacion_ID: operacionId, Programados: 0 };
                                            if (item.tipo === 'Scrap Seriado') {
                                                try {
                                                    const res = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
                                                    lb.CodigoProductoS = res.data.CodigoProductoS;
                                                } catch (e) { console.warn("Fallback merma"); }
                                            }
                                            setSelectedLinea(lb); setShowPesajeModal(true);
                                        } : undefined}
                                        title={!canEditOperacion ? (inspeccionData && !inspeccionData.header?.inicioRevisado ? "Debe revisar el inicio en Inspección" : "Complete todos los datos de las pasadas") : ""}
                                    >
                                        <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
                                            {item.tipo}
                                        </span>
                                        {!canEditOperacion && <div className="text-muted small">Bloqueado</div>}
                                    </div>
                                    <div className="grid-cell-placeholder"></div>
                                    <input 
                                        type="text" 
                                        className="form-control grid-cell-input"
                                        style={{
                                            backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
                                            opacity: canEditOperacion ? 1 : 0.7
                                        }}
                                        value={formatNumber(item.totSO)} 
                                        readOnly 
                                        disabled={!canEditOperacion}
                                    />
                                    <input 
                                        type="text" 
                                        className="form-control grid-cell-input"
                                        style={{
                                            backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
                                            opacity: canEditOperacion ? 1 : 0.7
                                        }}
                                        value="0" 
                                        readOnly 
                                        disabled={!canEditOperacion}
                                    />
                                    <input 
                                        type="text" 
                                        className="form-control grid-cell-input"
                                        style={{
                                            backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
                                            opacity: canEditOperacion ? 1 : 0.7
                                        }}
                                        value={formatNumber(item.totAt)} 
                                        readOnly 
                                        disabled={!canEditOperacion}
                                    />
                                    <input 
                                        type="text" 
                                        className="form-control grid-cell-input"
                                        style={{
                                            backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
                                            opacity: canEditOperacion ? 1 : 0.7
                                        }}
                                        value={formatNumber(item.totRo)} 
                                        readOnly 
                                        disabled={!canEditOperacion}
                                    />
                                </div>
                            ))}
                        </div>
                       
                        <div className="detalle-footer">
                            <div className="balance-grid">
                                <div className="balance-label">Kgs.Entrantes</div> <div className="balance-label">Programados</div> <div className="balance-label">Sobre Orden</div>
                                <div className="balance-label">Calidad</div> <div className="balance-label">Sobrante</div> <div className="balance-label">Scrap</div> <div className="balance-label">Saldo</div>
                                <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div> <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
                                <div className="balance-value">{formatNumber(balance.sobreOrden)}</div> <div className="balance-value">{formatNumber(balance.calidad)}</div>
                                <div className="balance-value">{formatNumber(balance.sobrante)}</div> <div className="balance-value">{formatNumber(balance.scrap)}</div>
                                <div className="balance-value font-weight-bold" style={{ color: balance.saldo < 0 ? 'red' : 'white' }}>{formatNumber(balance.saldo)}</div>
                            </div>
                        </div>
                    </div>
                </div>
               
                <div className="actions-sidebar">
                    <button className="btn btn-info btn-block" onClick={() => navigate(`/registracion/inspeccion/${operacionId}/${header.LoteID}`)}>Inspección</button>
                    <button className={`btn btn-block ${isSuspended ? 'btn-info' : 'btn-warning'}`} onClick={() => setShowSupervisorModal(true)}>{isSuspended ? 'Activar' : 'Suspender'}</button>
                    <hr style={{ borderColor: 'white', width: '100%' }} />
                    <button className="btn btn-light btn-block" disabled={header.tieneNotasSRP}>Notas SRP</button>
                    <button className="btn btn-light btn-block" onClick={() => setShowToleranciasModal(true)} disabled={!isOperationEditable}>Tolerancias</button>
                    <button className="btn btn-light btn-block" onClick={() => navigate(`/registracion/fichatecnica/${operacionId}`)}>Ficha Técnica</button>
                    <button className="btn btn-light btn-block" onClick={handleNotasCalipsoClick}>Notas Calipso</button>
                    {header.tieneNotasCalipso && (
                        <div className="alert alert-danger mt-2 p-2 text-center" style={{
                            fontWeight: 'bold',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '100%'
                        }}>
                            Existen Notas en CALIPSO
                        </div>
                    )}
                    
                    {!canEditOperacion && isOperationEditable && (
                        <div className="alert alert-warning mt-2 p-2 text-center" style={{
                            fontWeight: 'bold',
                            backgroundColor: '#ffc107',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            width: '100%'
                        }}>
                            {!inspeccionData ? "Cargando inspección..." : 
                             !inspeccionData.header?.inicioRevisado ? "⚠️ Revise el Inicio en Inspección" : 
                             "⚠️ Complete todas las pasadas"}
                        </div>
                    )}
                    
                    <div className="cierre-container">
                        <button 
                            className="btn btn-success btn-block" 
                            onClick={handleCierreClick}
                            disabled={!canEditOperacion || modalLoading}
                            title={!canEditOperacion ? 
                                (!inspeccionData ? "Cargando inspección..." : 
                                !inspeccionData.header?.inicioRevisado ? "Debe revisar el inicio en Inspección" : 
                                "Complete todos los datos de las pasadas") : 
                                "Cerrar operación"}
                            style={!canEditOperacion ? {
                                backgroundColor: '#6c757d',
                                borderColor: '#6c757d',
                                cursor: 'not-allowed',
                                opacity: 0.6
                            } : {}}
                        >
                            {modalLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Cerrando...
                                </>
                            ) : (
                                'CIERRE'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {showPesajeModal && selectedLinea && (
                <PesajeModalSelector lineaData={selectedLinea} operacionId={operacionId} onClose={() => setShowPesajeModal(false)} onSuccess={fetchData} />
            )}
            {showSupervisorModal && <SupervisorAuthModal onClose={() => setShowSupervisorModal(false)} onConfirm={fetchData} />}
            {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
            {showNotasCalipsoModal && <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />}
        </>
    );
};

export default EditarOperacion;
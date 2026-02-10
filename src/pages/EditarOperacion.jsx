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
   
    // Estados para modales
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

    const fetchData = async () => {
        if (!operacionId) {
            navigate('/registracion');
            return;
        }
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
            const fetchedData = response.data || { header: {}, lineas: [], balance: {} };
            console.log("operacionId...........", operacionId);
            
            console.log("fetchedData", fetchedData);

            
            /// Obtener maquinaId del header
            const maquinaId = fetchedData.header?.maquinaId || "No disponible";
            console.log("maquinaId del header:", maquinaId);

            // Extraer solo el número después de "SL" (si existe)
            const maquinaMatch = maquinaId?.match(/^SL(\d+)$/);
            const maquinaNumeroCalculado = maquinaMatch ? maquinaMatch[1] : "No disponible";
            console.log("Número de máquina:", maquinaNumeroCalculado);
            
            // Guardar el número de máquina en el estado
            setMaquinaNumero(maquinaNumeroCalculado);
            
            setData(fetchedData);
            setEditedLineas([...fetchedData.lineas]);
            setHasChanges(false);
        } catch (err) {
            Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
            navigate('/registracion');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [operacionId, navigate]);

    const currentStatus = useMemo(() => operationStatusFromGrid || data?.header?.status || '', [operationStatusFromGrid, data]);

    const isOperationEditable = useMemo(() => {
        if (!data?.header) return false;
        return ['LISTA', 'EN_PROCESO', 'EN_CALIDAD'].includes(currentStatus);
    }, [currentStatus, data]);

    const handleInputChange = (index, field, value) => {
        if (!isOperationEditable) return;
        const numValue = parseFloat(value) || parseInt(value) || 0;
        if (numValue < 0) return;
        setEditedLineas(prev => {
            const newLineas = [...prev];
            newLineas[index][field] = numValue;
            setHasChanges(true);
            return newLineas;
        });
    };

    const handleSaveChanges = async () => {
        if (!hasChanges) {
            Swal.fire('Info', 'No hay cambios para guardar.', 'info');
            return;
        }
        setModalLoading(true);
        try {
            const changes = editedLineas.map((linea, index) => {
                const original = data.lineas[index];
                const changedFields = {};
                ['Programados', 'SobreOrden', 'Calidad', 'Atados', 'Rollos'].forEach(field => {
                    if (linea[field] !== original[field]) {
                        changedFields[field] = linea[field];
                    }
                });
                return { ...linea, changedFields };
            }).filter(l => Object.keys(l.changedFields).length > 0);
            await axiosInstance.put(`/registracion/actualizar-lineas/${operacionId}`, { lineas: changes });
            await Swal.fire('¡Éxito!', 'Cambios guardados correctamente.', 'success');
            setHasChanges(false);
            await fetchData();
        } catch (error) {
            console.error('Error al guardar:', error);
            Swal.fire('Error', error.response?.data?.error || 'No se pudieron guardar los cambios.', 'error');
        } finally {
            setModalLoading(false);
        }
    };

    const handleCuchillasClick = async () => {
        if (!data?.header) return;
        setModalLoading(true);
        setShowCuchillasModal(true);
        try {
            const response = await axiosInstance.post('/registracion/cuchillas/calcular', {
                cuchillas: data.header.Cuchillas,
                espesor: data.header.Espesor,
                ancho: data.header.Ancho
            });
            setCuchillasData(response.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudo obtener el cálculo de cuchillas.', 'error');
            setShowCuchillasModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleConfirmCuchillasInput = async (inputData) => {
        setShowCuchillasInputModal(false);
        setModalLoading(true);
        setShowCuchillasModal(true);
        try {
            const response = await axiosInstance.post('/registracion/cuchillas/calcular', {
                cuchillas: inputData.cuchillas,
                espesor: inputData.espesor,
                ancho: inputData.ancho
            });
            setCuchillasData(response.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudo obtener el cálculo de cuchillas con los datos ingresados.', 'error');
            setShowCuchillasModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleToggleSuspension = async (supervisorCredentials) => {
        if (!data?.header) return;
        const isCurrentlySuspended = (operationStatusFromGrid || data.header.status) === 'SUSPENDIDA';
        const action = isCurrentlySuspended ? 'activar' : 'suspender';
        try {
            const response = await axiosInstance.post(`/registracion/operaciones/suspender/${operacionId}`, {
                ...supervisorCredentials,
                suspend: !isCurrentlySuspended
            });
            setShowSupervisorModal(false);
            await Swal.fire('¡Éxito!', response.data.message, 'success');
            await fetchData();
            navigate(`/registracion/operaciones/${data.header.maquinaId}`);
        } catch (error) {
            setShowSupervisorModal(false);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                if (error.response.data?.error === 'Credenciales de supervisor incorrectas.') {
                    Swal.fire('Error de Autenticación', 'Usuario o contraseña de supervisor incorrectos. Por favor, inténtelo de nuevo.', 'error');
                } else {
                    const errorMessage = error.response?.data?.error || 'No autorizado para realizar esta acción.';
                    Swal.fire('Error de Autorización', errorMessage, 'error');
                }
            } else {
                const errorMessage = error.response?.data?.error || `No se pudo ${action} la operación debido a un error inesperado.`;
                Swal.fire('Error', errorMessage, 'error');
            }
        }
    };

    const handleNotasCalipsoClick = async () => {
        setModalLoading(true);
        setShowNotasCalipsoModal(true);
        try {
            const response = await axiosInstance.get(`/registracion/notas-calipso/${operacionId}`);
            setNotasCalipso(response.data.notes);
        } catch (error) {
            Swal.fire('Error', 'No se pudieron cargar las notas de Calipso.', 'error');
            setShowNotasCalipsoModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCierreClick = async () => {
        if (!data?.header) return;

        const { header, balance } = data;
        const { kgsEntrantes, programados, sobreOrden, calidad, sobrante, scrap } = balance;

        // === VALIDACIÓN DE TOLERANCIA (como en VB) ===
        let toleranciaProg = 0;
        let totalCierre = 0;
        let saldoCierre = 0;
        let totalMerma = 0;

        // Calcular total merma (Scrap Programado)
        totalMerma = parseFloat(header.ScrapProgramado || 0);

        // Calcular total cierre (suma de todos los valores registrados)
        totalCierre = parseFloat(sobreOrden || 0) + parseFloat(calidad || 0) + parseFloat(sobrante || 0) + parseFloat(scrap || 0);
        saldoCierre = parseFloat(kgsEntrantes || 0) - totalCierre;

        // Calcular tolerancia basada en el peso entrante
        const tolerancia = parseFloat(header.Tolerancia || 0.05); // Si no está definido, usar 5%
        toleranciaProg = parseFloat(kgsEntrantes || 0) * tolerancia;

        // Validar que el saldo esté dentro de la tolerancia
        if (Math.abs(saldoCierre) > toleranciaProg) {
            Swal.fire({
                title: 'Advertencia',
                text: `El SALDO debe estar dentro de la TOLERANCIA para efectuar el cierre: ${toleranciaProg.toFixed(2)} kgs.`,
                icon: 'warning'
            });
            return;
        }

        // === VALIDAR DICTAMEN DE CALIDAD (si hay algo en "Calidad") ===
        if (parseFloat(calidad || 0) > 0) {
            // En VB, si hay algo en Calidad, se valida que tenga dictamen.
            // En nuestro caso, verificamos si hay algún item en "lineas" con Calidad > 0 y sin dictamen.
            const tieneCalidadSinDictamen = editedLineas.some(linea => {
                return parseFloat(linea.Calidad || 0) > 0 && !linea.esSobrante && !linea.esScrap;
            });

            if (tieneCalidadSinDictamen) {
                Swal.fire({
                    title: 'Advertencia',
                    text: 'Hay Items donde falta DICTAMEN de CALIDAD',
                    icon: 'warning'
                });
                return;
            }
        }

        // === VALIDAR INSPECCIÓN FINAL (como en VB) ===
        if (!header.finalRevisado) {
            Swal.fire({
                title: 'Advertencia',
                text: 'Se debe aprobar la INSPECCION FINAL antes de cerrar la operación',
                icon: 'warning'
            });
            return;
        }

        // === CONFIRMACIÓN DEL USUARIO ===
        const result = await Swal.fire({
            title: '¿Confirmar Cierre?',
            text: 'Se CERRARA la operación. ¿CONFIRMA?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cerrar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        // === EJECUTAR EL CIERRE ===
        setModalLoading(true);
        try {
            // Llamar a un nuevo endpoint en el backend que haga todo el proceso de cierre
            console.log('🔵 FRONTEND: URL a llamar:', `/registracion/operaciones/cerrar/${operacionId}`);
            console.log('🔵 FRONTEND: Body a enviar:', { usuario: 'pmorrone' });
            const response = await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, {
                usuario: 'pmorrone' // Reemplazar por el usuario actual cuando lo tengas
            });

            await Swal.fire('¡Éxito!', 'Operación cerrada correctamente.', 'success');
            // Recargar los datos
            await fetchData();
            // Redirigir a la grilla de operaciones de la máquina
            navigate(`/registracion/operaciones/${header.maquinaId}`);
        } catch (error) {
            console.error('Error al cerrar operación:', error);
            Swal.fire('Error', error.response?.data?.error || 'Error al cerrar la operación.', 'error');
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
    if (!data) return null;

    const { header, lineas, balance } = data;
    const isSuspended = currentStatus === 'SUSPENDIDA';
    const isNotasCalipsoDisabled = !header.tieneNotasCalipso;
    const isNotasSRPDisabled = !header.tieneNotasSRP;

    console.log("Balance ", balance);
    console.log("DATA ", data);
    
    

    // ✅ NUEVO: Usa directamente del balance (ya cargado en data.balance)
    const totalSobrante = balance?.sobrante || 0;
    const totalScrapSeriado = balance?.scrapSeriado || 0;
    const totalScrapNoSeriado = balance?.scrapNoSeriado || 0;

    console.log("editedLineas ", editedLineas);
    

    return (
        <>
            <div className={`detalle-container ${isOperationEditable ? 'editar-mode' : ''}`}>
                <div className="main-content">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h1 className="m-0" style={{ color: 'white' }}>REGISTRACION Slitter {maquinaNumero} - Editar Operación</h1>
                        <div className="d-flex align-items-center">
                            {header.maquinaId === 'SL2' && (
                                <div className="d-flex mr-3">
                                    <button onClick={handleCuchillasClick} className="btn btn-primary mr-2" style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}>Cuchillas Automático</button>
                                    <button onClick={() => setShowCuchillasInputModal(true)} className="btn" style={{ backgroundColor: '#6610f2', borderColor: '#6610f2', color: 'white' }}>Cuchillas</button>
                                </div>
                            )}
                            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left mr-2"></i>Volver a la Grilla
                            </button>
                        </div>
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
                        <div className="cuchillas-block">
                            <InfoItem label="Cuchillas" value={header.Cuchillas} bold />
                            <InfoItem label="Pasadas" value={header.Pasadas} />
                            <InfoItem label="Diámetro" value={header.Diametro} />
                            <InfoItem label="Corona" value={header.Corona} />
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
                                <div
                                    key={index}
                                    className={`grid-row ${!isOperationEditable ? 'disabled-row' : ''}`}
                                    style={{ cursor: isOperationEditable ? 'pointer' : 'default' }}
                                >
                                    <div
                                        className="grid-cell-desc"
                                        onClick={isOperationEditable ? () => {
                                            setSelectedLinea({ ...linea, bSobrante: false, bScrap: false, SerieLote: header.SerieLote });
                                            setShowPesajeModal(true);
                                        } : undefined}
                                    >
                                        <div>{String(linea.Ancho || 'N/A')}</div>
                                        <div>{String(linea.Cuchillas || 'N/A')}</div>
                                        <div>{String(linea.Tarea || 'N/A')}</div>
                                        <div>{linea.Destino ? String(linea.Destino || '').substring(0, 11) : 'N/A'}</div>
                                        <div>Atados: {formatNumber(linea.Atados)} Rollos: {formatNumber(linea.Rollos)}</div>
                                    </div>
                                    <input
                                        type="text"
                                        className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
                                        value={formatNumber(linea.Programados)}
                                        readOnly
                                        disabled={!isOperationEditable}
                                    />
                                    <input
                                        type="text"
                                        className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
                                        value={formatNumber(linea.SobreOrden)}
                                        readOnly
                                        disabled={!isOperationEditable}
                                    />
                                    <input
                                        type="text"
                                        className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
                                        value={formatNumber(linea.Calidad)}
                                        readOnly
                                        disabled={!isOperationEditable}
                                    />
                                    <input
                                        type="text"
                                        className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
                                        value={formatNumber(linea.TotAtados)}
                                        readOnly
                                        disabled={!isOperationEditable}
                                    />
                                    <input
                                        type="text"
                                        className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
                                        value={formatNumber(linea.TotRollos)}
                                        readOnly
                                        disabled={!isOperationEditable}
                                    />
                                </div>
                            ))}

                            {/* === FILAS ESPECIALES === */}
                            {[
                                { 
                                    tipo: 'Sobrante', 
                                    data: editedLineas.find(l => l.esSobrante) || {},
                                    totalSO: totalSobrante,
                                    totalCal: 0,
                                    totalAtados: 0,
                                    totalRollos: 0 ,
                                    bSobrante: true,           // ✅
                                    bScrap: false,             // ✅
                                    bScrapNoSeriado: false,    // ✅
                                    Lote_IDS: header.Lote_IDS,            // ✅ Sobrante no tiene Lote_IDS
                                    Tarea: "Sobrante"
                                },
                                { 
                                    tipo: 'Scrap Seriado', 
                                    data: editedLineas.find(l => l.esScrap && l.esScrapSeriado) || {},
                                    totalSO: totalScrapSeriado, 
                                    totalCal: 0,
                                    totalAtados: 0,
                                    totalRollos: 0 
                                },
                                { 
                                    tipo: 'Scrap No Seriado', 
                                     data: editedLineas.find(l => l.esScrap && l.esScrapNoSeriado) || {},
                                    totalSO: totalScrapNoSeriado, 
                                    totalCal: 0,
                                    totalAtados: 0,
                                    totalRollos: 0 
                                }
                            ].map((item) => {
                                return (
                                    <div
                                        key={item.tipo}
                                        className={`grid-row ${!isOperationEditable ? 'disabled-row' : ''}`}
                                        style={{ cursor: isOperationEditable ? 'pointer' : 'default' }}
                                        onClick={isOperationEditable ? async () => {
                                            let lineaDataParaModal = null;

                                            if (item.tipo === 'Scrap Seriado') {
                                                try {
                                                    const mermaRes = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
                                                    const CodigoProductoS = mermaRes.data.CodigoProductoS || '';
                                                    if (!CodigoProductoS) {
                                                        Swal.fire('Error', 'No se pudo obtener el código de merma para scrap.', 'error');
                                                        return;
                                                    }
                                                    lineaDataParaModal = {
                                                        tipoEspecial: item.tipo,
                                                        bSobrante: false,
                                                        bScrap: true,
                                                        bScrapSeriado: true,
                                                        bScrapNoSeriado: false,
                                                        SobreOrden: item.totalSO,
                                                        Calidad: item.totalCal,
                                                        TotAtados: item.totalAtados,
                                                        TotRollos: item.totalRollos,
                                                        SerieLote: header.SerieLote,
                                                        CodSerie: header.SerieLote,
                                                        CodigoProducto: header.CodigoProducto || '',
                                                        CodigoProductoS: CodigoProductoS,
                                                        LoteID: header.LoteID,
                                                        Tarea: item.tipo,
                                                        Maquina: header.maquinaId,
                                                        NroBatch: header.Batch,
                                                        Cuchillas: header.Cuchillas,
                                                        NroMatching: header.Matching,
                                                        DestinoLote: header.SerieLote || '',
                                                        Lote_IDS: header.LoteID || null
                                                    };
                                                } catch (err) {
                                                    Swal.fire('Error', 'No se pudo cargar el código de merma.', 'error');
                                                    console.error(err);
                                                }
                                            } else {
                                                lineaDataParaModal = {
                                                    tipoEspecial: item.tipo,
                                                    bSobrante: item.tipo === 'Sobrante',
                                                    bScrap: item.tipo.includes('Scrap'),
                                                    bScrapSeriado: item.tipo === 'Scrap Seriado',
                                                    bScrapNoSeriado: item.tipo === 'Scrap No Seriado',
                                                    SobreOrden: item.totalSO,
                                                    Calidad: item.totalCal,
                                                    TotAtados: item.totalAtados,
                                                    TotRollos: item.totalRollos,
                                                    SerieLote: header.SerieLote,
                                                    CodSerie: header.SerieLote,
                                                    CodigoProducto: header.CodigoProducto || '',
                                                    CodigoProductoS: header.CodigoProductoS || '',
                                                    LoteID: header.LoteID,
                                                    Tarea: item.tipo,
                                                    Maquina: header.maquinaId,
                                                    NroBatch: header.Batch,
                                                    Cuchillas: header.Cuchillas,
                                                    NroMatching: header.Matching,
                                                    DestinoLote: item.tipo === 'Scrap No Seriado' ? 'Scrap No Seriado' : (header.SerieLote || ''),
                                                    Lote_IDS: (item.tipo === 'Sobrante' || item.tipo === 'Scrap No Seriado') ? null : (header.LoteID || null)
                                                };
                                            }

                                            if (lineaDataParaModal) {
                                                setSelectedLinea(lineaDataParaModal);
                                                setShowPesajeModal(true);
                                            }
                                        } : undefined}
                                    >
                                        <div className="grid-cell-desc font-weight-bold">{item.tipo}</div>
                                        <div className="grid-cell-placeholder"></div>
                                        <input
                                            type="text"
                                            className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
                                            value={formatNumber(item.totalSO)}
                                            readOnly
                                            disabled={!isOperationEditable}
                                        />
                                        <input
                                            type="text"
                                            className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
                                            value={formatNumber(item.totalCal)}
                                            readOnly
                                            disabled={!isOperationEditable}
                                        />
                                        <input
                                            type="text"
                                            className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
                                            value={formatNumber(item.totalAtados)}
                                            readOnly
                                            disabled={!isOperationEditable}
                                        />
                                        <input
                                            type="text"
                                            className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
                                            value={formatNumber(item.totalRollos)}
                                            readOnly
                                            disabled={!isOperationEditable}
                                        />
                                    </div>
                                );
                            })}

                            
                        </div>
                       
                        <div className="detalle-footer">
                            <div className="balance-grid">
                                <div className="balance-label">Kgs.Entrantes</div> <div className="balance-label">Programados</div> <div className="balance-label">Sobre Orden</div>
                                <div className="balance-label">Calidad</div> <div className="balance-label">Sobrante</div> <div className="balance-label">Scrap</div> <div className="balance-label">Saldo</div>
                                <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div> <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
                                <div className="balance-value">{formatNumber(balance.sobreOrden)}</div> <div className="balance-value">{formatNumber(balance.calidad)}</div>
                                <div className="balance-value">{formatNumber(balance.sobrante)}</div> <div className="balance-value">{formatNumber(balance.scrap)}</div>
                                <div className="balance-value">{formatNumber(balance.saldo)}</div>
                            </div>
                        </div>
                    </div>
                </div>
               
                <div className="actions-sidebar">
                    {hasChanges && (
                        <button
                            className="btn btn-success btn-block mb-2"
                            onClick={handleSaveChanges}
                            disabled={modalLoading}
                        >
                            {modalLoading ? <span className="spinner-border spinner-border-sm mr-2"></span> : null}
                            Guardar Cambios
                        </button>
                    )}
                   
                    <button
                        className="btn btn-info btn-block"
                        onClick={() => navigate(`/registracion/inspeccion/${operacionId}/${header.LoteID}`, { 
                            state: { maquinaNumero: maquinaNumero } // <-- Pasamos el número aquí
                        })}
                    >
                        Inspección
                    </button>
                                    
                    <button
                        className={`btn btn-block ${isSuspended ? 'btn-info' : 'btn-warning'}`}
                        onClick={() => setShowSupervisorModal(true)}
                    >
                        {isSuspended ? 'Activar' : 'Suspender'}
                    </button>
                   
                    <hr style={{ borderColor: 'white', width: '100%' }} />
                    <button
                        className="btn btn-light btn-block"
                        disabled={isNotasSRPDisabled}
                    >
                        Notas SRP
                    </button>
                    <button
                        className="btn btn-light btn-block"
                        onClick={() => setShowToleranciasModal(true)}
                        disabled={!isOperationEditable}
                    >
                        Tolerancias
                    </button>
                    <button
                        className="btn btn-light btn-block"
                        onClick={() => navigate(`/registracion/fichatecnica/${operacionId}`, { state: { headerData: header } })}
                    >
                        Ficha Técnica
                    </button>
                   
                    <button
                        className="btn btn-light btn-block"
                        disabled={isNotasCalipsoDisabled}
                        onClick={handleNotasCalipsoClick}
                    >
                        Notas Calipso
                    </button>
                    {!isNotasCalipsoDisabled && (
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
                    {/* Reemplaza el botón de cierre actual */}
                    <div className="cierre-container">
                        <button
                            className="btn btn-success btn-block"
                            disabled={modalLoading} // 👈 SOLO deshabilitado durante la carga
                            onClick={handleCierreClick} // 👈 Usa la nueva función
                        >
                            {modalLoading ? <span className="spinner-border spinner-border-sm mr-2"></span> : null}
                            CIERRE
                        </button>
                    </div>
                </div>
            </div>
            {showCuchillasModal && (
                modalLoading
                    ? <div className="cuchillas-modal-overlay"><div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }}></div></div>
                    : <CuchillasModal data={cuchillasData} onClose={() => setShowCuchillasModal(false)} />
            )}
           
            {showCuchillasInputModal && (
                <CuchillasInputModal
                    headerData={header}
                    onClose={() => setShowCuchillasInputModal(false)}
                    onConfirm={handleConfirmCuchillasInput}
                />
            )}
            {showToleranciasModal && (
                <ToleranciasModal
                    operacionId={operacionId}
                    onClose={() => setShowToleranciasModal(false)}
                />
            )}
           
            {showSupervisorModal && (
                <SupervisorAuthModal
                    title={isSuspended ? 'Activar Operación' : 'Suspender Operación'}
                    message={`Ingrese credenciales para ${isSuspended ? 'activar' : 'suspender'} la operación.`}
                    onClose={() => setShowSupervisorModal(false)}
                    onConfirm={handleToggleSuspension}
                />
            )}
            {showNotasCalipsoModal && (
                <NotasCalipsoModal
                    notes={notasCalipso}
                    onClose={() => setShowNotasCalipsoModal(false)}
                />
            )}
            {showPesajeModal && selectedLinea && (
                <PesajeModalSelector
                    lineaData={selectedLinea}
                    operacionId={operacionId}
                    onClose={() => setShowPesajeModal(false)}
                    onSuccess={() => fetchData()}
                />
            )}
        </>
    );
};

export default EditarOperacion;
// src/components/modals/PesajeEmbalajeModal.jsx
import React, { useState, useEffect, useRef } from 'react';  // ✅ Agregar useRef
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './PesajeEmbalajeModal.css';
import AjustePesoModal from './AjustePesoModal';

const PesajeEmbalajeModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
    // === ESTADOS DE DATOS ===
    const [peso, setPeso] = useState(0);
    const [isManualEdit, setIsManualEdit] = useState(false); 
    const [numeroPaquete, setNumeroPaquete] = useState(1);
    const [hojas, setHojas] = useState(1);
    const [paquetes, setPaquetes] = useState([]);
    const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
    const [calidadTotal, setCalidadTotal] = useState(0);
    const [programados, setProgramados] = useState(0);
    const [cargandoPaquetes, setCargandoPaquetes] = useState(true);
    const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);
    
    // ✅ NUEVO REF para trackear el último número de lote usado
    const ultimoNumeroLoteRef = useRef(12);  // Empezar después del 012
    
    // Estado para modal de ajuste de peso
    const [showAjusteModal, setShowAjusteModal] = useState(false);
    const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
    const [indexPaqueteSeleccionado, setIndexPaqueteSeleccionado] = useState(null);
    
    // Datos del pedido
    const numeroPedido = lineaData?.NumeroPedido || '';
    const numeroItem = lineaData?.NumeroItem || '';
    const serieLote = lineaData?.SerieLote || '';
    const sobranteParam = 0;

    // === CARGA INICIAL ===
    useEffect(() => {
        cargarPaquetesExistentes();
        obtenerUltimaEtiqueta();
        setProgramados(parseFloat(lineaData?.Programados) || 0);
    }, [lineaData, operacionId]);
    
    // === BALANZA EN TIEMPO REAL ===
    useEffect(() => {
        const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
        const interval = setInterval(async () => {
            if (isManualEdit) return;
            try {
                const res = await axiosInstance.get(`${agenteUrl}/peso`);
                setPeso(Math.round(parseFloat(res.data.peso) || 0));
            } catch {
                // Balanza no disponible
            }
        }, 1200);
        return () => clearInterval(interval);
    }, [isManualEdit]);

    const obtenerGuidParaConsulta = () => {
        return lineaData?.Lote_IDS || 
               lineaData?.Origen_Lote_ID || 
               lineaData?.PedidoID || 
               operacionId;
    };

    const cargarPaquetesExistentes = async () => {
        try {
            setCargandoPaquetes(true);
            
            const idParaConsulta = lineaData?.Operacion_ID || operacionId;
            const itemPedidoId = lineaData?.PedidoID || lineaData?.Lote_IDS || operacionId;
            const numeroItem = lineaData?.NumeroItem || 2;
            
            const res = await axiosInstance.post('/registracion/pesaje/obtener-paquetes-emabalaje', {
                operacionId: idParaConsulta,
                itemPedidoId: String(itemPedidoId),
                numeroItem: String(numeroItem),
                sobrante: 0
            });
            
            const paquetesData = res.data.map((item, index) => {
                const numeroCorrecto = index + 1;
                
                // ✅ Actualizar el ref con el último número de lote
                const match = item.SerieLote?.match(/(\d+)\s*-\s*(\d+)/);
                if (match) {
                    ultimoNumeroLoteRef.current = Math.max(ultimoNumeroLoteRef.current, parseInt(match[2]));
                }
                
                return {
                    id: item.NroPaquete || numeroCorrecto,
                    numeroPaquete: numeroCorrecto,
                    serieLote: item.SerieLote || serieLote,
                    peso: parseFloat(item.KilosSobreOrden) || 0,
                    kilosBruto: parseFloat(item.KilosBruto) || parseFloat(item.KilosSobreOrden) || 0,
                    tara: parseFloat(item.Tara) || 0,
                    hojas: item.Hojas || 1,
                    esCalidad: item.Calidad === 'Aceptada',
                    nroEtiqueta: item.NroEtiqueta || '',
                    idLotePlancha: item.ID_LotePlancha || '',
                    registrada: item.Registrada === 'SI',
                    fechaReg: item.FechaReg
                };
            });
            
            setPaquetes(paquetesData);
            
            const sobreOrden = paquetesData.filter(p => !p.esCalidad).reduce((sum, p) => sum + p.peso, 0);
            const calidad = paquetesData.filter(p => p.esCalidad).reduce((sum, p) => sum + p.peso, 0);
            
            setSobreOrdenTotal(sobreOrden);
            setCalidadTotal(calidad);
            
            const ultimoNumero = paquetesData.length > 0 ? Math.max(...paquetesData.map(p => p.numeroPaquete), 0) : 0;
            setNumeroPaquete(ultimoNumero + 1);
            
        } catch (err) {
            console.error('❌ Error cargando paquetes:', err);
            Swal.fire('Error', 'No se pudieron cargar los paquetes', 'error');
        } finally {
            setCargandoPaquetes(false);
        }
    };

    const obtenerUltimaEtiqueta = async () => {
        try {
            const res = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
            setUltimaEtiqueta(res.data.ultimaEtiqueta);
        } catch (err) {
            console.error("Error al obtener etiqueta:", err);
        }
    };

    const generarEtiqueta = async () => {
        const res = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
        return res.data.nroEtiqueta;
    };

    // ✅ FUNCIÓN CORREGIDA: Usar el ItemPedido_ID correcto
    const obtenerLoteDisponible = async () => {
        try {
            const itemPedidoId = lineaData?.PedidoID || '21607AFA-73DD-4062-929E-9E96A2E5296B';
            const codSerie = serieLote.substring(0, 6);
            
            const res = await axiosInstance.post('/registracion/pesaje/obtener-lote-disponible', {
                itemPedidoId: itemPedidoId,
                codSerie: codSerie
            });
            
            return res.data;
        } catch (err) {
            console.error('Error obteniendo lote disponible:', err);
            return null;
        }
    };

    // ✅ FUNCIÓN CORREGIDA: Evitar lotes duplicados
    const agregarPaquete = async (esCalidad) => {
        if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
        if (hojas <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de hojas.', 'warning');
        if (!ultimaEtiqueta) return Swal.fire('Error', 'Número de etiqueta no disponible.', 'error');
        
        try {
            const nroEtiqueta = await generarEtiqueta();
            
            // ✅ INTENTAR obtener nuevo lote de LotesDisponibles
            const loteDisponible = await obtenerLoteDisponible();
            
            let serieLoteUsado = '';
            let idLotePlanchaUsado = '';
            let loteYaUsado = false;
            
            if (loteDisponible && loteDisponible.idLotePlancha) {
                // ✅ Verificar si este lote YA fue usado en esta sesión
                const loteRepetido = paquetes.some(p => p.idLotePlancha === loteDisponible.idLotePlancha);
                
                if (loteRepetido) {
                    console.log('⚠️ Lote ya usado en esta sesión, generando nuevo automáticamente');
                    loteYaUsado = true;
                } else {
                    // ✅ Hay lote disponible y NO fue usado - lo usamos y marcamos como usado
                    serieLoteUsado = loteDisponible.lotePlanchaDesc.substring(0, 11);
                    idLotePlanchaUsado = loteDisponible.idLotePlancha;
                    
                    // Actualizar ref
                    const match = serieLoteUsado.match(/(\d+)\s*-\s*(\d+)/);
                    if (match) {
                        ultimoNumeroLoteRef.current = parseInt(match[2]);
                    }
                    
                    // Marcar lote como usado
                    try {
                        const itemPedidoId = obtenerGuidParaConsulta();
                        await axiosInstance.post('/registracion/pesaje/marcar-lote-usado', {
                            itemPedidoId: itemPedidoId,
                            idLotePlancha: idLotePlanchaUsado
                        });
                    } catch (err) {
                        console.error('Error marcando lote como usado:', err);
                    }
                }
            } else {
                loteYaUsado = true;
            }
            
            // ✅ Si no hay lote disponible O ya fue usado, generar uno nuevo automáticamente
            if (loteYaUsado || (!loteDisponible || !loteDisponible.idLotePlancha)) {
                const codSerie = serieLote.substring(0, 6);
                
                // ✅ Incrementar el número usando el ref (siempre actualizado)
                ultimoNumeroLoteRef.current += 1;
                const proximoNumero = ultimoNumeroLoteRef.current;
                
                serieLoteUsado = `${codSerie} - ${String(proximoNumero).padStart(3, '0')}`;
                idLotePlanchaUsado = lineaData?.Origen_Lote_ID || '';
                
                console.log(`🔢 Generando nuevo lote automáticamente: ${serieLoteUsado} (número ${proximoNumero})`);
            }
            
            const nuevo = { 
                id: Date.now(), 
                numeroPaquete, 
                serieLote: serieLoteUsado,
                idLotePlancha: idLotePlanchaUsado,
                peso,
                kilosBruto: peso,
                tara: 0,
                hojas, 
                esCalidad, 
                nroEtiqueta 
            };
            
            console.log('✅ Agregando paquete:', nuevo);
            
            setPaquetes(prev => {
                const nuevos = [...prev, nuevo];
                console.log('📦 Paquetes actualizados:', nuevos.length, 'total');
                console.log('📦 Detalle:', nuevos.map(p => p.serieLote));
                return nuevos;
            });
            
            if (esCalidad) {
                setCalidadTotal(prev => prev + peso);
            } else {
                setSobreOrdenTotal(prev => prev + peso);
            }
            
            setNumeroPaquete(prev => prev + 1);
            setHojas(1);
            setUltimaEtiqueta(nroEtiqueta);
            setPeso(0);
            
        } catch (err) {
            console.error('❌ Error en agregarPaquete:', err);
            Swal.fire('Error', 'No se pudo agregar el paquete.', 'error');
        }
    };

    // ✅ NUEVA FUNCIÓN: Manejar doble click en la grilla
    const handleDobleClickGrilla = (paquete, index) => {
        setPaqueteSeleccionado(paquete);
        setIndexPaqueteSeleccionado(index);
        setShowAjusteModal(true);
    };

    // ✅ FUNCIÓN CORREGIDA: Actualizar desde el modal de ajuste
    const handleAjustePesoConfirmado = (nuevosValores) => {
        if (paqueteSeleccionado && indexPaqueteSeleccionado !== null) {
            setPaquetes(prev => {
                const nuevosPaquetes = [...prev];
                const paqueteExistente = nuevosPaquetes[indexPaqueteSeleccionado];
                
                nuevosPaquetes[indexPaqueteSeleccionado] = {
                    ...paqueteExistente,
                    peso: nuevosValores.peso,
                    kilosBruto: nuevosValores.kilosBruto,
                    tara: nuevosValores.tara
                };
                
                const nuevoSobreOrden = nuevosPaquetes.filter(p => !p.esCalidad).reduce((sum, p) => sum + p.peso, 0);
                const nuevaCalidad = nuevosPaquetes.filter(p => p.esCalidad).reduce((sum, p) => sum + p.peso, 0);
                setSobreOrdenTotal(nuevoSobreOrden);
                setCalidadTotal(nuevaCalidad);
                
                return nuevosPaquetes;
            });
        }
        setShowAjusteModal(false);
        setPaqueteSeleccionado(null);
        setIndexPaqueteSeleccionado(null);
    };

    const handleSobreOrden = () => agregarPaquete(false);
    const handleCalidad = () => agregarPaquete(true);
    const handleRegistrar = async () => {
        if (paquetes.length === 0) return Swal.fire('Advertencia', 'No hay paquetes para registrar.', 'warning');

        console.log('\n========================================');
        console.log('📦 PAQUETES EN ESTADO:', paquetes.length);
        console.log('📦 Detalle:', paquetes);
        console.log('========================================\n');
        
        try {
            const idParaRegistro = lineaData?.Operacion_ID || operacionId;
            const itemPedidoId = obtenerGuidParaConsulta();
            
            // ✅ OBTENER USUARIO LOGUEADO REAL - Extraer solo el nombre
            let usuarioLogueado = 'pmorrone'; // Valor por defecto
            
            const userStorage = localStorage.getItem('user') || localStorage.getItem('usuario');
            if (userStorage) {
                try {
                    const userData = typeof userStorage === 'string' ? JSON.parse(userStorage) : userStorage;
                    // ✅ Extraer solo el nombre/nombre de usuario
                    usuarioLogueado = userData.nombre || userData.username || userData.user || userData.email || 'pmorrone';
                } catch (err) {
                    console.error('Error parsing user data:', err);
                    // Si falla el parseo, usar el string directo si no es JSON
                    usuarioLogueado = typeof userStorage === 'string' ? userStorage : 'pmorrone';
                }
            }
            
            console.log('👤 Usuario logueado:', usuarioLogueado);
            
            const dataToSend = {
                operacionId: idParaRegistro,
                itemPedidoId: itemPedidoId,
                loteIds: itemPedidoId,
                sobrante: sobranteParam,
                atados: paquetes.map(p => ({
                    atado: p.numeroPaquete,
                    rollos: p.hojas,
                    peso: p.peso,
                    kilosBruto: p.kilosBruto,
                    tara: p.tara,
                    esCalidad: p.esCalidad,
                    nroEtiqueta: p.nroEtiqueta,
                    idLotePlancha: p.idLotePlancha,
                    serieLote: p.serieLote
                })),
                lineaData,
                usuario: usuarioLogueado  // ✅ USAR SOLO EL NOMBRE
            };
            
            console.log('📤 ENVIANDO AL BACKEND:', dataToSend.atados.length, 'paquetes');
            
            await axiosInstance.post('/registracion/pesaje/registrar-paquetes-emabalaje', dataToSend);
            
            Swal.fire('Éxito', 'Paquetes registrados correctamente.', 'success');
            onSuccess();
            onClose();
            
        } catch (err) {
            console.error("❌ Error al registrar:", err);
            Swal.fire('Error', err.response?.data?.error || 'Error al registrar.', 'error');
        }
    };

    const handleReset = async () => {
        const confirm = await Swal.fire({ 
            title: '¿Resetear todo?', 
            text: 'Se borrarán todos los paquetes cargados.',
            icon: 'warning', 
            showCancelButton: true,
            confirmButtonText: 'Sí, resetear',
            cancelButtonText: 'Cancelar'
        });
        
        if (!confirm.isConfirmed) return;
        
        try {
            const idParaReset = lineaData?.Operacion_ID || operacionId;
            const itemPedidoId = obtenerGuidParaConsulta();
            
            await axiosInstance.post('/registracion/pesaje/resetear-paquetes-emabalaje', {
                operacionId: idParaReset,
                itemPedidoId: itemPedidoId,
                sobrante: sobranteParam,
                idLotePlancha: null,
                lineaData: lineaData
            });
            
            setPaquetes([]);
            setSobreOrdenTotal(0);
            setCalidadTotal(0);
            setNumeroPaquete(1);
            ultimoNumeroLoteRef.current = 12;  // ✅ Resetear el ref
            
            Swal.fire('Reseteado', 'Todos los paquetes han sido eliminados.', 'success');
            onSuccess();
            onClose();
            
        } catch (err) {
            console.error("Error al resetear:", err);
            Swal.fire('Error', 'No se pudo resetear.', 'error');
        }
    };

    const handleEliminarPaquete = async (paqueteAEliminar, index) => {
        const confirm = await Swal.fire({ 
            title: '¿Eliminar paquete?', 
            text: `Se eliminará el paquete ${paqueteAEliminar.numeroPaquete} de ${paqueteAEliminar.peso.toFixed(2)} Kg`,
            icon: 'warning', 
            showCancelButton: true 
        });
        
        if (!confirm.isConfirmed) return;
        
        setPaquetes(prev => {
            const nuevos = prev.filter((_, i) => i !== index);
            const renumerados = nuevos.map((p, i) => ({
                ...p,
                numeroPaquete: i + 1
            }));
            return renumerados;
        });
        
        if (paqueteAEliminar.esCalidad) {
            setCalidadTotal(prev => prev - paqueteAEliminar.peso);
        } else {
            setSobreOrdenTotal(prev => prev - paqueteAEliminar.peso);
        }
        
        setNumeroPaquete(prev => Math.max(1, prev - 1));
    };

    const imprimirEtiqueta = (p) => { 
        console.log("Imprimir etiqueta:", p);
    };

    const totalKilos = sobreOrdenTotal + calidadTotal;

    return (
        <div className="pesaje-modal-overlay">
            <div className="pesaje-modal embalaje-modal">
                <div className="modal-header">
                    <h3>REGISTRACION - Paquetes Embalaje</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-body">
                    <div className="info-panel embalaje-info">
                        <div><strong>Nº Pedido:</strong> {numeroPedido}</div>
                        <div><strong>Item:</strong> {numeroItem}</div>
                        <div><strong>Serie/Lote:</strong> {serieLote || 'N/A'}</div>
                        <div><strong>Kgs. Programados:</strong> {programados.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    
                    <div className="pesaje-section">
                        <label><strong>Peso Balanza (Kg):</strong></label>
                        <input 
                            type="number" 
                            step="1"
                            pattern="\d*"
                            value={peso} 
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setPeso(val >= 0 ? val : 0);
                            }}
                            onFocus={() => setIsManualEdit(true)} 
                            onBlur={() => setIsManualEdit(false)} 
                            className="peso-input" 
                            placeholder="0"
                        />
                    </div>
                    
                    <div className="totales embalaje-totales">
                        <div className="total-box">
                            <span>SOBRE ORDEN:</span>
                            <strong>{sobreOrdenTotal.toFixed(2)} Kg</strong>
                        </div>
                        <div className="total-box">
                            <span>CALIDAD:</span>
                            <strong>{calidadTotal.toFixed(2)} Kg</strong>
                        </div>
                        <div className="total-box total-final">
                            <span>TOTAL:</span>
                            <strong>{totalKilos.toFixed(2)} Kg</strong>
                        </div>
                    </div>
                    
                    <div className="carga-section">
                        <div className="form-row">
                            <label><strong>Nº Paquete:</strong></label>
                            <span className="form-value">{numeroPaquete}</span>
                        </div>
                        <div className="form-row">
                            <label><strong>Hojas:</strong></label>
                            <input 
                                type="number" 
                                value={hojas} 
                                onChange={e => setHojas(parseInt(e.target.value) || 1)} 
                                min="1"
                                className="form-input-small"
                            />
                        </div>
                        <div className="form-row">
                            <label><strong>Nº Etiqueta:</strong></label>
                            <span className="form-value">{ultimaEtiqueta || '-'}</span>
                        </div>
                        <div className="form-row">
                            <label><strong>Calidad:</strong></label>
                            <select className="form-select">
                                <option value="0">Normal</option>
                                <option value="1">Calidad</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="action-buttons">
                        <button onClick={handleSobreOrden} className="btn btn-so">
                            AGREGAR S.O.
                        </button>
                        <button onClick={handleCalidad} className="btn btn-calidad">
                            AGREGAR CALIDAD
                        </button>
                    </div>
                    
                    <div className="grilla-paquetes">
                        <h4>Paquetes Registrados</h4>
                        {cargandoPaquetes ? (
                            <div className="loading">Cargando paquetes...</div>
                        ) : (
                            <div className="paquetes-table-container">
                                <table className="paquetes-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '60px' }}>Nº Paquete</th>
                                            <th style={{ width: '150px' }}>Serie/Lote</th>
                                            <th style={{ width: '80px', textAlign: 'right' }}>Kilos</th>
                                            <th style={{ width: '100px', textAlign: 'right' }}>Kilos Bruto</th>
                                            <th style={{ width: '80px', textAlign: 'right' }}>Tara</th>
                                            <th style={{ width: '60px', textAlign: 'center' }}>Hojas</th>
                                            <th style={{ width: '100px', textAlign: 'center' }}>Nº Etiqueta</th>
                                            <th style={{ width: '80px', textAlign: 'center' }}>Calidad</th>
                                            <th style={{ width: '100px', textAlign: 'center' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paquetes.length > 0 ? paquetes.map((p, i) => (
                                            <tr 
                                                key={p.id || i}
                                                onDoubleClick={() => handleDobleClickGrilla(p, i)}
                                                style={{ cursor: 'pointer' }}
                                                title="Doble click para ajustar Peso Bruto"
                                            >
                                                <td>{p.numeroPaquete}</td>
                                                <td>{p.serieLote}</td>
                                                <td style={{ textAlign: 'right' }}>{p.peso.toFixed(2)}</td>
                                                <td style={{ textAlign: 'right' }}>{p.kilosBruto.toFixed(2)}</td>
                                                <td style={{ textAlign: 'right' }}>{Math.abs(p.tara).toFixed(2)}</td>
                                                <td style={{ textAlign: 'center' }}>{p.hojas}</td>
                                                <td style={{ textAlign: 'center' }}>{p.nroEtiqueta}</td>
                                                <td style={{ textAlign: 'center' }}>{p.esCalidad ? '✓' : '-'}</td>
                                                <td className="acciones" style={{ textAlign: 'center' }}>
                                                    <button onClick={() => imprimirEtiqueta(p)} className="btn-icon btn-imprimir" title="Imprimir">🖨️</button>
                                                    <button onClick={() => handleEliminarPaquete(p, i)} className="btn-icon btn-eliminar" title="Eliminar">🗑️</button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                                    No hay paquetes cargados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="modal-footer">
                    <button onClick={handleReset} className="btn btn-reset" disabled={paquetes.length === 0}>
                        RESET
                    </button>
                    <button onClick={handleRegistrar} className="btn btn-registrar" disabled={paquetes.length === 0}>
                        CONFIRMAR REGISTRO
                    </button>
                </div>
            </div>
            
            {showAjusteModal && (
                <AjustePesoModal
                    paquete={paqueteSeleccionado}
                    onClose={() => {
                        setShowAjusteModal(false);
                        setPaqueteSeleccionado(null);
                        setIndexPaqueteSeleccionado(null);
                    }}
                    onConfirm={handleAjustePesoConfirmado}
                />
            )}
        </div>
    );
};

export default PesajeEmbalajeModal;
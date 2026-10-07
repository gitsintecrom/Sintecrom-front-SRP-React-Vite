// // src/components/modals/PesajeEmbalajeModal.jsx
// import React, { useState, useEffect, useRef } from 'react';  // ✅ Agregar useRef
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './PesajeEmbalajeModal.css';
// import AjustePesoModal from './AjustePesoModal';

// const PesajeEmbalajeModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
//     // === ESTADOS DE DATOS ===
//     const [peso, setPeso] = useState(0);
//     const [isManualEdit, setIsManualEdit] = useState(false); 
//     const [numeroPaquete, setNumeroPaquete] = useState(1);
//     const [hojas, setHojas] = useState(1);
//     const [paquetes, setPaquetes] = useState([]);
//     const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
//     const [calidadTotal, setCalidadTotal] = useState(0);
//     const [programados, setProgramados] = useState(0);
//     const [cargandoPaquetes, setCargandoPaquetes] = useState(true);
//     const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);
    
//     // ✅ NUEVO REF para trackear el último número de lote usado
//     const ultimoNumeroLoteRef = useRef(12);  // Empezar después del 012
    
//     // Estado para modal de ajuste de peso
//     const [showAjusteModal, setShowAjusteModal] = useState(false);
//     const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
//     const [indexPaqueteSeleccionado, setIndexPaqueteSeleccionado] = useState(null);
    
//     // Datos del pedido
//     const numeroPedido = lineaData?.NumeroPedido || '';
//     const numeroItem = lineaData?.NumeroItem || '';
//     const serieLote = lineaData?.SerieLote || '';
//     const sobranteParam = 0;

//     // === CARGA INICIAL ===
//     useEffect(() => {
//         cargarPaquetesExistentes();
//         obtenerUltimaEtiqueta();
//         setProgramados(parseFloat(lineaData?.Programados) || 0);
//     }, [lineaData, operacionId]);
    
//     // === BALANZA EN TIEMPO REAL ===
//     useEffect(() => {
//         const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
//         const interval = setInterval(async () => {
//             if (isManualEdit) return;
//             try {
//                 const res = await axiosInstance.get(`${agenteUrl}/peso`);
//                 setPeso(Math.round(parseFloat(res.data.peso) || 0));
//             } catch {
//                 // Balanza no disponible
//             }
//         }, 1200);
//         return () => clearInterval(interval);
//     }, [isManualEdit]);

//     const obtenerGuidParaConsulta = () => {
//         return lineaData?.Lote_IDS || 
//                lineaData?.Origen_Lote_ID || 
//                lineaData?.PedidoID || 
//                operacionId;
//     };

//     const cargarPaquetesExistentes = async () => {
//         try {
//             setCargandoPaquetes(true);
            
//             const idParaConsulta = lineaData?.Operacion_ID || operacionId;
//             const itemPedidoId = lineaData?.PedidoID || lineaData?.Lote_IDS || operacionId;
//             const numeroItem = lineaData?.NumeroItem || 2;
            
//             const res = await axiosInstance.post('/registracion/pesaje/obtener-paquetes-emabalaje', {
//                 operacionId: idParaConsulta,
//                 itemPedidoId: String(itemPedidoId),
//                 numeroItem: String(numeroItem),
//                 sobrante: 0
//             });
            
//             const paquetesData = res.data.map((item, index) => {
//                 const numeroCorrecto = index + 1;
                
//                 // ✅ Actualizar el ref con el último número de lote
//                 const match = item.SerieLote?.match(/(\d+)\s*-\s*(\d+)/);
//                 if (match) {
//                     ultimoNumeroLoteRef.current = Math.max(ultimoNumeroLoteRef.current, parseInt(match[2]));
//                 }
                
//                 return {
//                     id: item.NroPaquete || numeroCorrecto,
//                     numeroPaquete: numeroCorrecto,
//                     serieLote: item.SerieLote || serieLote,
//                     peso: parseFloat(item.KilosSobreOrden) || 0,
//                     kilosBruto: parseFloat(item.KilosBruto) || parseFloat(item.KilosSobreOrden) || 0,
//                     tara: parseFloat(item.Tara) || 0,
//                     hojas: item.Hojas || 1,
//                     esCalidad: item.Calidad === 'Aceptada',
//                     nroEtiqueta: item.NroEtiqueta || '',
//                     idLotePlancha: item.ID_LotePlancha || '',
//                     registrada: item.Registrada === 'SI',
//                     fechaReg: item.FechaReg
//                 };
//             });
            
//             setPaquetes(paquetesData);
            
//             const sobreOrden = paquetesData.filter(p => !p.esCalidad).reduce((sum, p) => sum + p.peso, 0);
//             const calidad = paquetesData.filter(p => p.esCalidad).reduce((sum, p) => sum + p.peso, 0);
            
//             setSobreOrdenTotal(sobreOrden);
//             setCalidadTotal(calidad);
            
//             const ultimoNumero = paquetesData.length > 0 ? Math.max(...paquetesData.map(p => p.numeroPaquete), 0) : 0;
//             setNumeroPaquete(ultimoNumero + 1);
            
//         } catch (err) {
//             console.error('❌ Error cargando paquetes:', err);
//             Swal.fire('Error', 'No se pudieron cargar los paquetes', 'error');
//         } finally {
//             setCargandoPaquetes(false);
//         }
//     };

//     const obtenerUltimaEtiqueta = async () => {
//         try {
//             const res = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
//             setUltimaEtiqueta(res.data.ultimaEtiqueta);
//         } catch (err) {
//             console.error("Error al obtener etiqueta:", err);
//         }
//     };

//     const generarEtiqueta = async () => {
//         const res = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
//         return res.data.nroEtiqueta;
//     };

//     // ✅ FUNCIÓN CORREGIDA: Usar el ItemPedido_ID correcto
//     const obtenerLoteDisponible = async () => {
//         try {
//             const itemPedidoId = lineaData?.PedidoID || '21607AFA-73DD-4062-929E-9E96A2E5296B';
//             const codSerie = serieLote.substring(0, 6);
            
//             const res = await axiosInstance.post('/registracion/pesaje/obtener-lote-disponible', {
//                 itemPedidoId: itemPedidoId,
//                 codSerie: codSerie
//             });
            
//             return res.data;
//         } catch (err) {
//             console.error('Error obteniendo lote disponible:', err);
//             return null;
//         }
//     };

//     // ✅ FUNCIÓN CORREGIDA: Evitar lotes duplicados
//     const agregarPaquete = async (esCalidad) => {
//         if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
//         if (hojas <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de hojas.', 'warning');
//         if (!ultimaEtiqueta) return Swal.fire('Error', 'Número de etiqueta no disponible.', 'error');
        
//         try {
//             const nroEtiqueta = await generarEtiqueta();
            
//             // ✅ INTENTAR obtener nuevo lote de LotesDisponibles
//             const loteDisponible = await obtenerLoteDisponible();
            
//             let serieLoteUsado = '';
//             let idLotePlanchaUsado = '';
//             let loteYaUsado = false;
            
//             if (loteDisponible && loteDisponible.idLotePlancha) {
//                 // ✅ Verificar si este lote YA fue usado en esta sesión
//                 const loteRepetido = paquetes.some(p => p.idLotePlancha === loteDisponible.idLotePlancha);
                
//                 if (loteRepetido) {
//                     console.log('⚠️ Lote ya usado en esta sesión, generando nuevo automáticamente');
//                     loteYaUsado = true;
//                 } else {
//                     // ✅ Hay lote disponible y NO fue usado - lo usamos y marcamos como usado
//                     serieLoteUsado = loteDisponible.lotePlanchaDesc.substring(0, 11);
//                     idLotePlanchaUsado = loteDisponible.idLotePlancha;
                    
//                     // Actualizar ref
//                     const match = serieLoteUsado.match(/(\d+)\s*-\s*(\d+)/);
//                     if (match) {
//                         ultimoNumeroLoteRef.current = parseInt(match[2]);
//                     }
                    
//                     // Marcar lote como usado
//                     try {
//                         const itemPedidoId = obtenerGuidParaConsulta();
//                         await axiosInstance.post('/registracion/pesaje/marcar-lote-usado', {
//                             itemPedidoId: itemPedidoId,
//                             idLotePlancha: idLotePlanchaUsado
//                         });
//                     } catch (err) {
//                         console.error('Error marcando lote como usado:', err);
//                     }
//                 }
//             } else {
//                 loteYaUsado = true;
//             }
            
//             // ✅ Si no hay lote disponible O ya fue usado, generar uno nuevo automáticamente
//             if (loteYaUsado || (!loteDisponible || !loteDisponible.idLotePlancha)) {
//                 const codSerie = serieLote.substring(0, 6);
                
//                 // ✅ Incrementar el número usando el ref (siempre actualizado)
//                 ultimoNumeroLoteRef.current += 1;
//                 const proximoNumero = ultimoNumeroLoteRef.current;
                
//                 serieLoteUsado = `${codSerie} - ${String(proximoNumero).padStart(3, '0')}`;
//                 idLotePlanchaUsado = lineaData?.Origen_Lote_ID || '';
                
//                 console.log(`🔢 Generando nuevo lote automáticamente: ${serieLoteUsado} (número ${proximoNumero})`);
//             }
            
//             const nuevo = { 
//                 id: Date.now(), 
//                 numeroPaquete, 
//                 serieLote: serieLoteUsado,
//                 idLotePlancha: idLotePlanchaUsado,
//                 peso,
//                 kilosBruto: peso,
//                 tara: 0,
//                 hojas, 
//                 esCalidad, 
//                 nroEtiqueta 
//             };
            
//             console.log('✅ Agregando paquete:', nuevo);
            
//             setPaquetes(prev => {
//                 const nuevos = [...prev, nuevo];
//                 console.log('📦 Paquetes actualizados:', nuevos.length, 'total');
//                 console.log('📦 Detalle:', nuevos.map(p => p.serieLote));
//                 return nuevos;
//             });
            
//             if (esCalidad) {
//                 setCalidadTotal(prev => prev + peso);
//             } else {
//                 setSobreOrdenTotal(prev => prev + peso);
//             }
            
//             setNumeroPaquete(prev => prev + 1);
//             setHojas(1);
//             setUltimaEtiqueta(nroEtiqueta);
//             setPeso(0);
            
//         } catch (err) {
//             console.error('❌ Error en agregarPaquete:', err);
//             Swal.fire('Error', 'No se pudo agregar el paquete.', 'error');
//         }
//     };

//     // ✅ NUEVA FUNCIÓN: Manejar doble click en la grilla
//     const handleDobleClickGrilla = (paquete, index) => {
//         setPaqueteSeleccionado(paquete);
//         setIndexPaqueteSeleccionado(index);
//         setShowAjusteModal(true);
//     };

//     // ✅ FUNCIÓN CORREGIDA: Actualizar desde el modal de ajuste
//     const handleAjustePesoConfirmado = (nuevosValores) => {
//         if (paqueteSeleccionado && indexPaqueteSeleccionado !== null) {
//             setPaquetes(prev => {
//                 const nuevosPaquetes = [...prev];
//                 const paqueteExistente = nuevosPaquetes[indexPaqueteSeleccionado];
                
//                 nuevosPaquetes[indexPaqueteSeleccionado] = {
//                     ...paqueteExistente,
//                     peso: nuevosValores.peso,
//                     kilosBruto: nuevosValores.kilosBruto,
//                     tara: nuevosValores.tara
//                 };
                
//                 const nuevoSobreOrden = nuevosPaquetes.filter(p => !p.esCalidad).reduce((sum, p) => sum + p.peso, 0);
//                 const nuevaCalidad = nuevosPaquetes.filter(p => p.esCalidad).reduce((sum, p) => sum + p.peso, 0);
//                 setSobreOrdenTotal(nuevoSobreOrden);
//                 setCalidadTotal(nuevaCalidad);
                
//                 return nuevosPaquetes;
//             });
//         }
//         setShowAjusteModal(false);
//         setPaqueteSeleccionado(null);
//         setIndexPaqueteSeleccionado(null);
//     };

//     const handleSobreOrden = () => agregarPaquete(false);
//     const handleCalidad = () => agregarPaquete(true);
//     const handleRegistrar = async () => {
//         if (paquetes.length === 0) return Swal.fire('Advertencia', 'No hay paquetes para registrar.', 'warning');

//         console.log('\n========================================');
//         console.log('📦 PAQUETES EN ESTADO:', paquetes.length);
//         console.log('📦 Detalle:', paquetes);
//         console.log('========================================\n');
        
//         try {
//             const idParaRegistro = lineaData?.Operacion_ID || operacionId;
//             const itemPedidoId = obtenerGuidParaConsulta();
            
//             // ✅ OBTENER USUARIO LOGUEADO REAL - Extraer solo el nombre
//             let usuarioLogueado = 'pmorrone'; // Valor por defecto
            
//             const userStorage = localStorage.getItem('user') || localStorage.getItem('usuario');
//             if (userStorage) {
//                 try {
//                     const userData = typeof userStorage === 'string' ? JSON.parse(userStorage) : userStorage;
//                     // ✅ Extraer solo el nombre/nombre de usuario
//                     usuarioLogueado = userData.nombre || userData.username || userData.user || userData.email || 'pmorrone';
//                 } catch (err) {
//                     console.error('Error parsing user data:', err);
//                     // Si falla el parseo, usar el string directo si no es JSON
//                     usuarioLogueado = typeof userStorage === 'string' ? userStorage : 'pmorrone';
//                 }
//             }
            
//             console.log('👤 Usuario logueado:', usuarioLogueado);
            
//             const dataToSend = {
//                 operacionId: idParaRegistro,
//                 itemPedidoId: itemPedidoId,
//                 loteIds: itemPedidoId,
//                 sobrante: sobranteParam,
//                 atados: paquetes.map(p => ({
//                     atado: p.numeroPaquete,
//                     rollos: p.hojas,
//                     peso: p.peso,
//                     kilosBruto: p.kilosBruto,
//                     tara: p.tara,
//                     esCalidad: p.esCalidad,
//                     nroEtiqueta: p.nroEtiqueta,
//                     idLotePlancha: p.idLotePlancha,
//                     serieLote: p.serieLote
//                 })),
//                 lineaData,
//                 usuario: usuarioLogueado  // ✅ USAR SOLO EL NOMBRE
//             };
            
//             console.log('📤 ENVIANDO AL BACKEND:', dataToSend.atados.length, 'paquetes');
            
//             await axiosInstance.post('/registracion/pesaje/registrar-paquetes-emabalaje', dataToSend);
            
//             Swal.fire('Éxito', 'Paquetes registrados correctamente.', 'success');
//             onSuccess();
//             onClose();
            
//         } catch (err) {
//             console.error("❌ Error al registrar:", err);
//             Swal.fire('Error', err.response?.data?.error || 'Error al registrar.', 'error');
//         }
//     };

//     const handleReset = async () => {
//         const confirm = await Swal.fire({ 
//             title: '¿Resetear todo?', 
//             text: 'Se borrarán todos los paquetes cargados.',
//             icon: 'warning', 
//             showCancelButton: true,
//             confirmButtonText: 'Sí, resetear',
//             cancelButtonText: 'Cancelar'
//         });
        
//         if (!confirm.isConfirmed) return;
        
//         try {
//             const idParaReset = lineaData?.Operacion_ID || operacionId;
//             const itemPedidoId = obtenerGuidParaConsulta();
            
//             await axiosInstance.post('/registracion/pesaje/resetear-paquetes-emabalaje', {
//                 operacionId: idParaReset,
//                 itemPedidoId: itemPedidoId,
//                 sobrante: sobranteParam,
//                 idLotePlancha: null,
//                 lineaData: lineaData
//             });
            
//             setPaquetes([]);
//             setSobreOrdenTotal(0);
//             setCalidadTotal(0);
//             setNumeroPaquete(1);
//             ultimoNumeroLoteRef.current = 12;  // ✅ Resetear el ref
            
//             Swal.fire('Reseteado', 'Todos los paquetes han sido eliminados.', 'success');
//             onSuccess();
//             onClose();
            
//         } catch (err) {
//             console.error("Error al resetear:", err);
//             Swal.fire('Error', 'No se pudo resetear.', 'error');
//         }
//     };

//     const handleEliminarPaquete = async (paqueteAEliminar, index) => {
//         const confirm = await Swal.fire({ 
//             title: '¿Eliminar paquete?', 
//             text: `Se eliminará el paquete ${paqueteAEliminar.numeroPaquete} de ${paqueteAEliminar.peso.toFixed(2)} Kg`,
//             icon: 'warning', 
//             showCancelButton: true 
//         });
        
//         if (!confirm.isConfirmed) return;
        
//         setPaquetes(prev => {
//             const nuevos = prev.filter((_, i) => i !== index);
//             const renumerados = nuevos.map((p, i) => ({
//                 ...p,
//                 numeroPaquete: i + 1
//             }));
//             return renumerados;
//         });
        
//         if (paqueteAEliminar.esCalidad) {
//             setCalidadTotal(prev => prev - paqueteAEliminar.peso);
//         } else {
//             setSobreOrdenTotal(prev => prev - paqueteAEliminar.peso);
//         }
        
//         setNumeroPaquete(prev => Math.max(1, prev - 1));
//     };

//     const imprimirEtiqueta = (p) => { 
//         console.log("Imprimir etiqueta:", p);
//     };

//     const totalKilos = sobreOrdenTotal + calidadTotal;

//     return (
//         <div className="pesaje-modal-overlay">
//             <div className="pesaje-modal embalaje-modal">
//                 <div className="modal-header">
//                     <h3>REGISTRACION - Paquetes Embalaje</h3>
//                     <button className="modal-close" onClick={onClose}>&times;</button>
//                 </div>
                
//                 <div className="modal-body">
//                     <div className="info-panel embalaje-info">
//                         <div><strong>Nº Pedido:</strong> {numeroPedido}</div>
//                         <div><strong>Item:</strong> {numeroItem}</div>
//                         <div><strong>Serie/Lote:</strong> {serieLote || 'N/A'}</div>
//                         <div><strong>Kgs. Programados:</strong> {programados.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
//                     </div>
                    
//                     <div className="pesaje-section">
//                         <label><strong>Peso Balanza (Kg):</strong></label>
//                         <input 
//                             type="number" 
//                             step="1"
//                             pattern="\d*"
//                             value={peso} 
//                             onChange={(e) => {
//                                 const val = parseInt(e.target.value) || 0;
//                                 setPeso(val >= 0 ? val : 0);
//                             }}
//                             onFocus={() => setIsManualEdit(true)} 
//                             onBlur={() => setIsManualEdit(false)} 
//                             className="peso-input" 
//                             placeholder="0"
//                         />
//                     </div>
                    
//                     <div className="totales embalaje-totales">
//                         <div className="total-box">
//                             <span>SOBRE ORDEN:</span>
//                             <strong>{sobreOrdenTotal.toFixed(2)} Kg</strong>
//                         </div>
//                         <div className="total-box">
//                             <span>CALIDAD:</span>
//                             <strong>{calidadTotal.toFixed(2)} Kg</strong>
//                         </div>
//                         <div className="total-box total-final">
//                             <span>TOTAL:</span>
//                             <strong>{totalKilos.toFixed(2)} Kg</strong>
//                         </div>
//                     </div>
                    
//                     <div className="carga-section">
//                         <div className="form-row">
//                             <label><strong>Nº Paquete:</strong></label>
//                             <span className="form-value">{numeroPaquete}</span>
//                         </div>
//                         <div className="form-row">
//                             <label><strong>Hojas:</strong></label>
//                             <input 
//                                 type="number" 
//                                 value={hojas} 
//                                 onChange={e => setHojas(parseInt(e.target.value) || 1)} 
//                                 min="1"
//                                 className="form-input-small"
//                             />
//                         </div>
//                         <div className="form-row">
//                             <label><strong>Nº Etiqueta:</strong></label>
//                             <span className="form-value">{ultimaEtiqueta || '-'}</span>
//                         </div>
//                         <div className="form-row">
//                             <label><strong>Calidad:</strong></label>
//                             <select className="form-select">
//                                 <option value="0">Normal</option>
//                                 <option value="1">Calidad</option>
//                             </select>
//                         </div>
//                     </div>
                    
//                     <div className="action-buttons">
//                         <button onClick={handleSobreOrden} className="btn btn-so">
//                             AGREGAR S.O.
//                         </button>
//                         <button onClick={handleCalidad} className="btn btn-calidad">
//                             AGREGAR CALIDAD
//                         </button>
//                     </div>
                    
//                     <div className="grilla-paquetes">
//                         <h4>Paquetes Registrados</h4>
//                         {cargandoPaquetes ? (
//                             <div className="loading">Cargando paquetes...</div>
//                         ) : (
//                             <div className="paquetes-table-container">
//                                 <table className="paquetes-table">
//                                     <thead>
//                                         <tr>
//                                             <th style={{ width: '60px' }}>Nº Paquete</th>
//                                             <th style={{ width: '150px' }}>Serie/Lote</th>
//                                             <th style={{ width: '80px', textAlign: 'right' }}>Kilos</th>
//                                             <th style={{ width: '100px', textAlign: 'right' }}>Kilos Bruto</th>
//                                             <th style={{ width: '80px', textAlign: 'right' }}>Tara</th>
//                                             <th style={{ width: '60px', textAlign: 'center' }}>Hojas</th>
//                                             <th style={{ width: '100px', textAlign: 'center' }}>Nº Etiqueta</th>
//                                             <th style={{ width: '80px', textAlign: 'center' }}>Calidad</th>
//                                             <th style={{ width: '100px', textAlign: 'center' }}>Acciones</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {paquetes.length > 0 ? paquetes.map((p, i) => (
//                                             <tr 
//                                                 key={p.id || i}
//                                                 onDoubleClick={() => handleDobleClickGrilla(p, i)}
//                                                 style={{ cursor: 'pointer' }}
//                                                 title="Doble click para ajustar Peso Bruto"
//                                             >
//                                                 <td>{p.numeroPaquete}</td>
//                                                 <td>{p.serieLote}</td>
//                                                 <td style={{ textAlign: 'right' }}>{p.peso.toFixed(2)}</td>
//                                                 <td style={{ textAlign: 'right' }}>{p.kilosBruto.toFixed(2)}</td>
//                                                 <td style={{ textAlign: 'right' }}>{Math.abs(p.tara).toFixed(2)}</td>
//                                                 <td style={{ textAlign: 'center' }}>{p.hojas}</td>
//                                                 <td style={{ textAlign: 'center' }}>{p.nroEtiqueta}</td>
//                                                 <td style={{ textAlign: 'center' }}>{p.esCalidad ? '✓' : '-'}</td>
//                                                 <td className="acciones" style={{ textAlign: 'center' }}>
//                                                     <button onClick={() => imprimirEtiqueta(p)} className="btn-icon btn-imprimir" title="Imprimir">🖨️</button>
//                                                     <button onClick={() => handleEliminarPaquete(p, i)} className="btn-icon btn-eliminar" title="Eliminar">🗑️</button>
//                                                 </td>
//                                             </tr>
//                                         )) : (
//                                             <tr>
//                                                 <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
//                                                     No hay paquetes cargados
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         )}
//                     </div>
//                 </div>
                
//                 <div className="modal-footer">
//                     <button onClick={handleReset} className="btn btn-reset" disabled={paquetes.length === 0}>
//                         RESET
//                     </button>
//                     <button onClick={handleRegistrar} className="btn btn-registrar" disabled={paquetes.length === 0}>
//                         CONFIRMAR REGISTRO
//                     </button>
//                 </div>
//             </div>
            
//             {showAjusteModal && (
//                 <AjustePesoModal
//                     paquete={paqueteSeleccionado}
//                     onClose={() => {
//                         setShowAjusteModal(false);
//                         setPaqueteSeleccionado(null);
//                         setIndexPaqueteSeleccionado(null);
//                     }}
//                     onConfirm={handleAjustePesoConfirmado}
//                 />
//             )}
//         </div>
//     );
// };

// export default PesajeEmbalajeModal;

































































// // src/components/modals/PesajeEmbalajeModal.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './PesajeEmbalajeModal.css';
// import AjustePesoModal from './AjustePesoModal';

// const PesajeEmbalajeModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
//     // === ESTADOS DE DATOS ===
//     const [peso, setPeso] = useState(0);
//     const [isManualEdit, setIsManualEdit] = useState(false);
//     const [numeroPaquete, setNumeroPaquete] = useState(1);
//     const [hojas, setHojas] = useState(1);
//     const [paquetes, setPaquetes] = useState([]);
//     const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
//     const [calidadTotal, setCalidadTotal] = useState(0);
//     const [programados, setProgramados] = useState(0);
//     const [cargandoPaquetes, setCargandoPaquetes] = useState(true);
//     const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);

//     const ultimoNumeroLoteRef = useRef(0);

//     const [showAjusteModal, setShowAjusteModal] = useState(false);
//     const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
//     const [indexPaqueteSeleccionado, setIndexPaqueteSeleccionado] = useState(null);

//     // Datos del pedido
//     const numeroPedido = lineaData?.NumeroPedido || '';
//     const numeroItem = lineaData?.NumeroItem || '';
//     const serieLote = lineaData?.SerieLote || '';
//     const sobranteParam = 0;

//     // ✅ VB: Inicial.sPedidoID = ItemPedido_ID de la línea (GUID del item del pedido)
//     const itemPedidoId = lineaData?.ItemPedido_ID || lineaData?.PedidoID || '';
//     // ✅ VB: Inicial.sSerieOrigen = LotePlanchaDesc.Substring(0,6) (serie del lote DESTINO)
//     const codSerie = (String(lineaData?.LotePlanchaDesc || '').substring(0, 6) ||
//                       String(serieLote).substring(0, 6)).trim();

//     // === CARGA INICIAL ===
//     useEffect(() => {
//         cargarPaquetesExistentes();
//         obtenerUltimaEtiqueta();
//         setProgramados(parseFloat(lineaData?.Programados) || 0);
//     }, [lineaData, operacionId]);

//     // === BALANZA EN TIEMPO REAL ===
//     useEffect(() => {
//         const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
//         const interval = setInterval(async () => {
//             if (isManualEdit) return;
//             try {
//                 const res = await axiosInstance.get(`${agenteUrl}/peso`);
//                 setPeso(Math.round(parseFloat(res.data.peso) || 0));
//             } catch {
//                 // Balanza no disponible
//             }
//         }, 1200);
//         return () => clearInterval(interval);
//     }, [isManualEdit]);

//     const obtenerGuidParaConsulta = () => {
//         return itemPedidoId || lineaData?.Lote_IDS || lineaData?.Origen_Lote_ID || operacionId;
//     };

//     const cargarPaquetesExistentes = async () => {
//         try {
//             setCargandoPaquetes(true);

//             const res = await axiosInstance.post('/registracion/pesaje/obtener-paquetes-emabalaje', {
//                 operacionId: lineaData?.Operacion_ID || operacionId,
//                 itemPedidoId: itemPedidoId ? String(itemPedidoId) : '',   // ✅ GUID correcto
//                 numeroItem: String(numeroItem || ''),                    // ✅ fallback del backend
//                 sobrante: sobranteParam
//             });

//             const paquetesData = (res.data || []).map((item, index) => {
//                 const ks = parseFloat(item.KilosSobreOrden) || 0;
//                 const kc = parseFloat(item.KilosCalidad) || 0;

//                 const match = item.SerieLote?.match(/(\d+)\s*-\s*(\d+)/);
//                 if (match) {
//                     ultimoNumeroLoteRef.current = Math.max(ultimoNumeroLoteRef.current, parseInt(match[2]));
//                 }

//                 return {
//                     id: item.ID_LotePlancha || `pkg-${index}`,
//                     numeroPaquete: item.NroPaquete || (index + 1),
//                     serieLote: item.SerieLote || '',
//                     peso: ks > 0 ? ks : kc,              // ✅ como la celda "Kilos" del VB
//                     kilosBruto: parseFloat(item.KilosBruto) || 0,
//                     tara: parseFloat(item.Tara) || 0,
//                     hojas: item.Hojas || 1,
//                     esCalidad: kc > 0,
//                     calidadTexto: item.Calidad || ' ',
//                     nroEtiqueta: item.NroEtiqueta || '',
//                     idLotePlancha: item.ID_LotePlancha || '',
//                     registrada: item.Registrada === 'SI',
//                     fechaReg: item.FechaReg
//                 };
//             });

//             setPaquetes(paquetesData);

//             const sobreOrden = paquetesData.filter(p => !p.esCalidad).reduce((sum, p) => sum + p.peso, 0);
//             const calidad = paquetesData.filter(p => p.esCalidad).reduce((sum, p) => sum + p.peso, 0);
//             setSobreOrdenTotal(sobreOrden);
//             setCalidadTotal(calidad);

//             const ultimoNumero = paquetesData.length > 0 ? Math.max(...paquetesData.map(p => p.numeroPaquete), 0) : 0;
//             setNumeroPaquete(ultimoNumero + 1);
//         } catch (err) {
//             console.error('❌ Error cargando paquetes:', err);
//             Swal.fire('Error', 'No se pudieron cargar los paquetes', 'error');
//         } finally {
//             setCargandoPaquetes(false);
//         }
//     };

//     const obtenerUltimaEtiqueta = async () => {
//         try {
//             const res = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
//             setUltimaEtiqueta(res.data.ultimaEtiqueta);
//         } catch (err) {
//             console.error("Error al obtener etiqueta:", err);
//         }
//     };

//     const generarEtiqueta = async () => {
//         const res = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
//         return res.data.nroEtiqueta;
//     };

//     // ✅ Con el ItemPedido_ID correcto (antes mandaba el GUID de la operación)
//     const obtenerLoteDisponible = async () => {
//         if (!itemPedidoId) return null;
//         try {
//             const res = await axiosInstance.post('/registracion/pesaje/obtener-lote-disponible', {
//                 itemPedidoId,
//                 codSerie
//             });
//             return res.data;
//         } catch (err) {
//             console.error('Error obteniendo lote disponible:', err);
//             return null;
//         }
//     };

//     const agregarPaquete = async (esCalidad) => {
//         if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
//         if (hojas <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de hojas.', 'warning');
//         if (!ultimaEtiqueta) return Swal.fire('Error', 'Número de etiqueta no disponible.', 'error');

//         try {
//             const nroEtiqueta = await generarEtiqueta();
//             const loteDisponible = await obtenerLoteDisponible();

//             let serieLoteUsado = '';
//             let idLotePlanchaUsado = '';
//             let loteYaUsado = false;

//             if (loteDisponible && loteDisponible.idLotePlancha) {
//                 const loteRepetido = paquetes.some(p => p.idLotePlancha === loteDisponible.idLotePlancha);
//                 if (loteRepetido) {
//                     loteYaUsado = true;
//                 } else {
//                     serieLoteUsado = loteDisponible.lotePlanchaDesc.substring(0, 11);
//                     idLotePlanchaUsado = loteDisponible.idLotePlancha;

//                     const match = serieLoteUsado.match(/(\d+)\s*-\s*(\d+)/);
//                     if (match) ultimoNumeroLoteRef.current = parseInt(match[2]);

//                     try {
//                         await axiosInstance.post('/registracion/pesaje/marcar-lote-usado', {
//                             itemPedidoId: itemPedidoId,          // ✅ GUID correcto
//                             idLotePlancha: idLotePlanchaUsado
//                         });
//                     } catch (err) {
//                         console.error('Error marcando lote como usado:', err);
//                     }
//                 }
//             } else {
//                 loteYaUsado = true;
//             }

//             if (loteYaUsado || !loteDisponible || !loteDisponible.idLotePlancha) {
//                 ultimoNumeroLoteRef.current += 1;
//                 const proximoNumero = ultimoNumeroLoteRef.current;
//                 serieLoteUsado = `${codSerie} - ${String(proximoNumero).padStart(3, '0')}`;
//                 // ✅ GUID NUEVO por paquete (antes se reusaba Origen_Lote_ID y colisionaban)
//                 idLotePlanchaUsado = (typeof crypto !== 'undefined' && crypto.randomUUID)
//                     ? crypto.randomUUID()
//                     : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
//             }

//             const nuevo = {
//                 id: Date.now(),
//                 numeroPaquete,
//                 serieLote: serieLoteUsado,
//                 idLotePlancha: idLotePlanchaUsado,
//                 peso,
//                 kilosBruto: peso,
//                 tara: 0,
//                 hojas,
//                 esCalidad,
//                 calidadTexto: esCalidad ? 'Calidad' : ' ',
//                 nroEtiqueta
//             };

//             setPaquetes(prev => [...prev, nuevo]);
//             if (esCalidad) setCalidadTotal(prev => prev + peso);
//             else setSobreOrdenTotal(prev => prev + peso);

//             setNumeroPaquete(prev => prev + 1);
//             setHojas(1);
//             setUltimaEtiqueta(nroEtiqueta);
//             setPeso(0);
//         } catch (err) {
//             console.error('❌ Error en agregarPaquete:', err);
//             Swal.fire('Error', 'No se pudo agregar el paquete.', 'error');
//         }
//     };

//     const handleDobleClickGrilla = (paquete, index) => {
//         setPaqueteSeleccionado(paquete);
//         setIndexPaqueteSeleccionado(index);
//         setShowAjusteModal(true);
//     };

//     const handleAjustePesoConfirmado = (nuevosValores) => {
//         if (paqueteSeleccionado && indexPaqueteSeleccionado !== null) {
//             setPaquetes(prev => {
//                 const nuevosPaquetes = [...prev];
//                 nuevosPaquetes[indexPaqueteSeleccionado] = {
//                     ...nuevosPaquetes[indexPaqueteSeleccionado],
//                     peso: nuevosValores.peso,
//                     kilosBruto: nuevosValores.kilosBruto,
//                     tara: nuevosValores.tara
//                 };
//                 const nuevoSobreOrden = nuevosPaquetes.filter(p => !p.esCalidad).reduce((sum, p) => sum + p.peso, 0);
//                 const nuevaCalidad = nuevosPaquetes.filter(p => p.esCalidad).reduce((sum, p) => sum + p.peso, 0);
//                 setSobreOrdenTotal(nuevoSobreOrden);
//                 setCalidadTotal(nuevaCalidad);
//                 return nuevosPaquetes;
//             });
//         }
//         setShowAjusteModal(false);
//         setPaqueteSeleccionado(null);
//         setIndexPaqueteSeleccionado(null);
//     };

//     const handleSobreOrden = () => agregarPaquete(false);
//     const handleCalidad = () => agregarPaquete(true);

//     const handleRegistrar = async () => {
//         if (paquetes.length === 0) return Swal.fire('Advertencia', 'No hay paquetes para registrar.', 'warning');

//         try {
//             const idParaRegistro = lineaData?.Operacion_ID || operacionId;
//             const guidRegistro = obtenerGuidParaConsulta();

//             let usuarioLogueado = 'pmorrone';
//             const userStorage = localStorage.getItem('user') || localStorage.getItem('usuario');
//             if (userStorage) {
//                 try {
//                     const userData = typeof userStorage === 'string' ? JSON.parse(userStorage) : userStorage;
//                     usuarioLogueado = userData.nombre || userData.username || userData.user || userData.email || 'pmorrone';
//                 } catch (err) {
//                     usuarioLogueado = typeof userStorage === 'string' ? userStorage : 'pmorrone';
//                 }
//             }

//             const dataToSend = {
//                 operacionId: idParaRegistro,
//                 itemPedidoId: guidRegistro,
//                 loteIds: guidRegistro,
//                 sobrante: sobranteParam,
//                 atados: paquetes.map(p => ({
//                     atado: p.numeroPaquete,
//                     rollos: p.hojas,
//                     peso: p.peso,
//                     kilosBruto: p.kilosBruto,
//                     tara: p.tara,
//                     esCalidad: p.esCalidad,
//                     nroEtiqueta: p.nroEtiqueta,
//                     idLotePlancha: p.idLotePlancha,
//                     serieLote: p.serieLote
//                 })),
//                 lineaData,
//                 usuario: usuarioLogueado
//             };

//             await axiosInstance.post('/registracion/pesaje/registrar-paquetes-emabalaje', dataToSend);
//             Swal.fire('Éxito', 'Paquetes registrados correctamente.', 'success');
//             onSuccess();
//             onClose();
//         } catch (err) {
//             console.error("❌ Error al registrar:", err);
//             Swal.fire('Error', err.response?.data?.error || 'Error al registrar.', 'error');
//         }
//     };

//     const handleReset = async () => {
//         const confirm = await Swal.fire({
//             title: '¿Resetear todo?',
//             text: 'Se borrarán todos los paquetes cargados.',
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Sí, resetear',
//             cancelButtonText: 'Cancelar'
//         });
//         if (!confirm.isConfirmed) return;

//         try {
//             await axiosInstance.post('/registracion/pesaje/resetear-paquetes-emabalaje', {
//                 operacionId: lineaData?.Operacion_ID || operacionId,
//                 itemPedidoId: obtenerGuidParaConsulta(),
//                 sobrante: sobranteParam,
//                 idLotePlancha: null,
//                 lineaData: lineaData
//             });

//             setPaquetes([]);
//             setSobreOrdenTotal(0);
//             setCalidadTotal(0);
//             setNumeroPaquete(1);
//             ultimoNumeroLoteRef.current = 0;

//             Swal.fire('Reseteado', 'Todos los paquetes han sido eliminados.', 'success');
//             onSuccess();
//             onClose();
//         } catch (err) {
//             console.error("Error al resetear:", err);
//             Swal.fire('Error', 'No se pudo resetear.', 'error');
//         }
//     };

//     const handleEliminarPaquete = async (paqueteAEliminar, index) => {
//         const confirm = await Swal.fire({
//             title: '¿Eliminar paquete?',
//             text: `Se eliminará el paquete ${paqueteAEliminar.numeroPaquete} de ${paqueteAEliminar.peso.toFixed(2)} Kg`,
//             icon: 'warning',
//             showCancelButton: true
//         });
//         if (!confirm.isConfirmed) return;

//         setPaquetes(prev => prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, numeroPaquete: i + 1 })));
//         if (paqueteAEliminar.esCalidad) setCalidadTotal(prev => prev - paqueteAEliminar.peso);
//         else setSobreOrdenTotal(prev => prev - paqueteAEliminar.peso);
//         setNumeroPaquete(prev => Math.max(1, prev - 1));
//     };

    










//     // ✅ IMPRIMIR ETIQUETA (VB: dblclick columna "Etiqueta" de frmPaquetes -> reporte EtiquetaPlancha)
//     const imprimirEtiqueta = async (paquete) => {
//         if (!paquete) return;

//         // ✅ Mismos controles que el VB: Hojas <> 0 y PESO BRUTO cargado
//         if (!paquete.hojas) {
//             return Swal.fire('Advertencia', 'El paquete no tiene HOJAS cargadas.', 'warning');
//         }
//         if (!paquete.kilosBruto) {
//             return Swal.fire('Advertencia', 'Debe ingresar PESO BRUTO antes de imprimir la etiqueta', 'warning');
//         }

//         const confirm = await Swal.fire({
//             title: 'Imprimir etiqueta',
//             text: `¿Desea imprimir la etiqueta para el atado ${paquete.numeroPaquete}?`,   // ✅ antes: paquete.atado (undefined)
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonText: 'Imprimir',
//             cancelButtonText: 'Cancelar'
//         });
//         if (!confirm.isConfirmed) return;

//         try {
//             // ✅ Datos REALES del paquete (antes: .atado / .rollos / tara fija 26)
//             const neto  = Math.round(paquete.peso || 0);
//             const bruto = Math.round(paquete.kilosBruto || 0);
//             const tara  = Math.round(paquete.tara || 0);
//             const espesorNum = parseFloat(lineaData?.Espesor);

//             const labelData = {
//                 parSerieLote: paquete.serieLote || serieLote || '',        // ✅ lote DESTINO del paquete (VB: Inicial.sDesLote)
//                 parFecha: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
//                 parHora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),

//                 parNumeroExterno: lineaData?.NumeroExterno || lineaData?.NoDoc || '',
//                 parNotaVenta: lineaData?.NotaVenta || lineaData?.NumeroPedido || '',
//                 parCodCliente: lineaData?.CodCliente || String(lineaData?.CodProdPedido || '').substring(0, 4),
//                 parCliente: lineaData?.Clientes || lineaData?.ClientePedido || '',

//                 parEspesor: isNaN(espesorNum) ? String(lineaData?.Espesor || '0.000') : espesorNum.toFixed(3),
//                 parAncho: String(lineaData?.Ancho || ''),
//                 parLargo: String(lineaData?.Largo || '0.0'),
//                 parRecubrimiento: lineaData?.Recubrimiento || 'NA - N',
//                 parCodProducto: lineaData?.CodigoProducto || lineaData?.CodProdPedido || '',

//                 parMaterial: lineaData?.Material || lineaData?.Familia || '',
//                 parAleacion: lineaData?.Aleacion || '',
//                 parTemple: lineaData?.Temple || '',
//                 parTerminacion: lineaData?.Terminacion || 'NA - NA',
//                 parCalidad: lineaData?.Calidad || '01 -',
//                 parPaquete: String(paquete.numeroPaquete),                 // ✅ nº de atado/paquete
//                 parParecer: '',

//                 parLiquido: String(neto),                                  // ✅ NETO real
//                 parBruto: String(bruto),                                   // ✅ BRUTO real (antes peso+26)
//                 parTara: String(tara),                                     // ✅ TARA real (antes fija '26')
//                 parUnid: String(paquete.hojas),                            // ✅ antes: paquete.rollos (undefined -> crash)
//                 parTipo: 'FL',
//                 parNumeroLoteAdicional: String(paquete.nroEtiqueta || '')  // ✅ nº de etiqueta (antes fijo '315021')
//             };

//             const etiquetaHTML = `
//                 <div class="etiqueta-container">
//                     <div class="header-contenedor">
//                         <div class="logo-y-serie">
//                             <img src="/Logo1.jpg" alt="Logo Sintecrom" class="logo">
//                             <span class="serie-lote">${labelData.parSerieLote}</span>
//                         </div>
//                     </div>
//                     <div class="tabla-top">
//                         <div class="celda numero-externo-h"><div class="label">NUMERO EXTERNO</div></div>
//                         <div class="celda nota-venta-h"><div class="label">NOTA DE VENTA</div></div>
//                         <div class="celda cod-cliente-h"><div class="label">COD.CLIENTE</div></div>
//                         <div class="celda cliente-h"><div class="label">CLIENTE</div></div>
//                         <div class="celda numero-externo-v"><div class="valor-grande">${labelData.parNumeroExterno}</div></div>
//                         <div class="celda nota-venta-v"><div class="valor-grande">${labelData.parNotaVenta}</div></div>
//                         <div class="celda cod-cliente-v"><div class="valor-grande">${labelData.parCodCliente}</div></div>
//                         <div class="celda cliente-v"><div class="valor-grande">${labelData.parCliente}</div></div>
//                         <div class="celda espesor-h"><div class="label">ESPESOR</div></div>
//                         <div class="celda ancho-h"><div class="label">ANCHO</div></div>
//                         <div class="celda largo-h"><div class="label">LARGO</div></div>
//                         <div class="celda cob-h"><div class="label">COB</div></div>
//                         <div class="celda espesor-v"><div class="valor-mediano">${labelData.parEspesor}</div></div>
//                         <div class="celda ancho-v"><div class="valor-mediano">${labelData.parAncho}</div></div>
//                         <div class="celda largo-v"><div class="valor-mediano">${labelData.parLargo}</div></div>
//                         <div class="celda cob-v"><div class="valor-mediano">${labelData.parRecubrimiento}</div></div>
//                         <div class="celda codigo-completo"><div>${labelData.parCodProducto}</div></div>
//                     </div>
//                     <table class="tabla tabla-material">
//                         <tr><th>MATERIAL</th><th>ALEACION</th><th>TEMPLE</th><th>TERMINACION</th><th>CALIDAD</th><th>PAQUETE</th><th>DICTAMEN</th></tr>
//                         <tr>
//                             <td>${labelData.parMaterial}</td>
//                             <td>${labelData.parAleacion}</td>
//                             <td>${labelData.parTemple}</td>
//                             <td>${labelData.parTerminacion}</td>
//                             <td>${labelData.parCalidad}</td>
//                             <td>${labelData.parPaquete}</td>
//                             <td>${labelData.parParecer}</td>
//                         </tr>
//                     </table>
//                     <table class="tabla tabla-pesaje">
//                         <tr><th>NETO(Kg)</th><th>BRUTO(Kg)</th><th>TARA(Kg)</th><th>UNID</th><th>TIPO</th><th>FECHA</th></tr>
//                         <tr>
//                             <td>${labelData.parLiquido}</td>
//                             <td>${labelData.parBruto}</td>
//                             <td>${labelData.parTara}</td>
//                             <td>${labelData.parUnid}</td>
//                             <td>${labelData.parTipo}</td>
//                             <td>${labelData.parFecha}</td>
//                         </tr>
//                     </table>
//                     <div class="info-adicional">
//                         <span class="procedencia">Material Origen Brasil y Procedencia Argentina</span>
//                         <span class="numero-lote">${labelData.parNumeroLoteAdicional}</span>
//                     </div>
//                 </div>
//             `;

//             const etiquetaCSS = `
//                 <style>
//                     * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
//                     body { background: white; margin: 0; padding: 0; }
//                     .etiqueta-container {
//                         width: 14.5cm !important; height: 10cm !important; background: white;
//                         margin: 0.5cm 0 0 0.5cm; padding: 0; font-size: 9pt; line-height: 1.1; overflow: hidden;
//                     }
//                     @media print {
//                         body { margin: 0 !important; padding: 0 !important; background: white; }
//                         .etiqueta-container { margin: 0.5cm 0 0 0.5cm !important; padding: 0 !important; border: none !important; width: 14.5cm !important; height: 10cm !important; }
//                         @page { size: 15cm 10.5cm !important; margin: 0 !important; }
//                     }
//                     .header-contenedor { border: 1pt solid black; padding: 0.05cm 0.1cm; margin-bottom: 0.05cm; display: flex; align-items: center; height: 1.2cm; }
//                     .logo-y-serie { display: flex; align-items: center; width: 100%; }
//                     .logo { height: 0.8cm; width: auto; margin-right: 0.2cm; flex-shrink: 0; }
//                     .logo-y-serie > span { font-size: 32pt; font-weight: bold; text-align: center; flex-grow: 1; line-height: 1; }
//                     .tabla-top {
//                         display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(4, auto);
//                         border: 1pt solid black; background: white; margin-bottom: 0.05cm; width: 100%; height: 4cm;
//                     }
//                     .celda { border: 1pt solid black; padding: 1px 2px; display: flex; justify-content: center; align-items: center; text-align: center; background: white; }
//                     .label { font-size: 8px; font-weight: normal; letter-spacing: 0.1px; }
//                     .valor-grande { font-size: 12px; font-weight: normal; letter-spacing: 0.3px; }
//                     .valor-mediano { font-size: 10px; font-weight: normal; letter-spacing: 0.2px; }
//                     .numero-externo-h { grid-column: 1 / 3; grid-row: 1; }
//                     .nota-venta-h { grid-column: 3 / 5; grid-row: 1; }
//                     .cod-cliente-h { grid-column: 5 / 6; grid-row: 1; }
//                     .cliente-h { grid-column: 6 / 8; grid-row: 1; }
//                     .numero-externo-v { grid-column: 1 / 3; grid-row: 2; }
//                     .nota-venta-v { grid-column: 3 / 5; grid-row: 2; }
//                     .cod-cliente-v { grid-column: 5 / 6; grid-row: 2; }
//                     .cliente-v { grid-column: 6 / 8; grid-row: 2; }
//                     .espesor-h { grid-column: 1; grid-row: 3; }
//                     .ancho-h { grid-column: 2; grid-row: 3; }
//                     .largo-h { grid-column: 3; grid-row: 3; }
//                     .cob-h { grid-column: 4; grid-row: 3; }
//                     .espesor-v { grid-column: 1; grid-row: 4; }
//                     .ancho-v { grid-column: 2; grid-row: 4; }
//                     .largo-v { grid-column: 3; grid-row: 4; }
//                     .cob-v { grid-column: 4; grid-row: 4; }
//                     .codigo-completo { grid-column: 5 / 8; grid-row: 3 / 5; font-size: 8px; padding: 2px 4px; text-align: left; background: #f8f8f8; border: 1pt solid black; }
//                     .tabla { width: 100%; border-collapse: collapse; margin-bottom: 0.05cm; table-layout: fixed; border: 1pt solid black; height: 1.9cm; }
//                     .tabla th, .tabla td { border: 1pt solid black; padding: 0.03cm; text-align: center; vertical-align: middle; font-size: 7pt; font-weight: normal; }
//                     .tabla th { background-color: #f0f0f0; }
//                     .tabla-material th, .tabla-material td { width: calc(100% / 7); font-size: 6pt; }
//                     .tabla-material th:last-child, .tabla-material td:last-child { width: 18%; }
//                     .tabla-material th:nth-child(5), .tabla-material td:nth-child(5) { width: 10%; }
//                     .tabla-material th:nth-child(6), .tabla-material td:nth-child(6) { width: 10%; border-right: none; }
//                     .tabla-pesaje th, .tabla-pesaje td { width: calc(100% / 6); }
//                     .tabla-pesaje td:last-child { font-size: 6pt; }
//                     .info-adicional {
//                         width: 100%; display: flex; justify-content: space-between; align-items: center;
//                         font-size: 7pt; margin-top: 0.02cm; padding: 0.02cm 0; border-top: 1pt solid black; height: 0.5cm;
//                     }
//                     .procedencia { font-style: italic; margin-left: 0.05cm; }
//                     .numero-lote { margin-right: 0.05cm; }
//                 </style>
//             `;

//             const printWindow = window.open('', '_blank', 'width=600,height=400,scrollbars=no');
//             if (!printWindow) {   // ✅ popup bloqueado -> mensaje claro en vez de crash
//                 return Swal.fire('Error', 'El navegador bloqueó la ventana de impresión. Habilite las ventanas emergentes.', 'error');
//             }
//             printWindow.document.write(`
//                 <!DOCTYPE html>
//                 <html>
//                 <head>
//                     <title>Etiqueta - ${labelData.parSerieLote}</title>
//                     ${etiquetaCSS}
//                 </head>
//                 <body>
//                     ${etiquetaHTML}
//                     <script>
//                         window.onload = function() {
//                             setTimeout(function() { window.print(); }, 500);
//                         };
//                         window.onafterprint = function() {
//                             setTimeout(function() { window.close(); }, 100);
//                         };
//                     </script>
//                 </body>
//                 </html>
//             `);
//             printWindow.document.close();

//             Swal.fire('Éxito', 'Etiqueta enviada a impresión.', 'success');
//         } catch (error) {
//             console.error('Error al imprimir etiqueta:', error);
//             Swal.fire('Error', 'Error al preparar la etiqueta para impresión.', 'error');
//         }
//     };


//     const totalKilos = sobreOrdenTotal + calidadTotal;

//     return (
//         <div className="pesaje-modal-overlay">
//             <div className="pesaje-modal embalaje-modal">
//                 <div className="modal-header">
//                     <h3>REGISTRACION - Paquetes Embalaje</h3>
//                     <button className="modal-close" onClick={onClose}>&times;</button>
//                 </div>

//                 <div className="modal-body">
//                     <div className="info-panel embalaje-info">
//                         <div><strong>Nº Pedido:</strong> {numeroPedido}</div>
//                         <div><strong>Item:</strong> {numeroItem}</div>
//                         <div><strong>Serie/Lote:</strong> {serieLote || 'N/A'}</div>
//                         <div><strong>Kgs. Programados:</strong> {programados.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
//                     </div>

//                     <div className="pesaje-section">
//                         <label><strong>Peso Balanza (Kg):</strong></label>
//                         <input
//                             type="number"
//                             step="1"
//                             pattern="\d*"
//                             value={peso}
//                             onChange={(e) => {
//                                 const val = parseInt(e.target.value) || 0;
//                                 setPeso(val >= 0 ? val : 0);
//                             }}
//                             onFocus={() => setIsManualEdit(true)}
//                             onBlur={() => setIsManualEdit(false)}
//                             className="peso-input"
//                             placeholder="0"
//                         />
//                     </div>

//                     <div className="totales embalaje-totales">
//                         <div className="total-box">
//                             <span>SOBRE ORDEN:</span>
//                             <strong>{sobreOrdenTotal.toFixed(2)} Kg</strong>
//                         </div>
//                         <div className="total-box">
//                             <span>CALIDAD:</span>
//                             <strong>{calidadTotal.toFixed(2)} Kg</strong>
//                         </div>
//                         <div className="total-box total-final">
//                             <span>TOTAL:</span>
//                             <strong>{totalKilos.toFixed(2)} Kg</strong>
//                         </div>
//                     </div>

//                     <div className="carga-section">
//                         <div className="form-row">
//                             <label><strong>Nº Paquete:</strong></label>
//                             <span className="form-value">{numeroPaquete}</span>
//                         </div>
//                         <div className="form-row">
//                             <label><strong>Hojas:</strong></label>
//                             <input
//                                 type="number"
//                                 value={hojas}
//                                 onChange={e => setHojas(parseInt(e.target.value) || 1)}
//                                 min="1"
//                                 className="form-input-small"
//                             />
//                         </div>
//                         <div className="form-row">
//                             <label><strong>Nº Etiqueta:</strong></label>
//                             <span className="form-value">{ultimaEtiqueta || '-'}</span>
//                         </div>
//                         <div className="form-row">
//                             <label><strong>Calidad:</strong></label>
//                             <select className="form-select">
//                                 <option value="0">Normal</option>
//                                 <option value="1">Calidad</option>
//                             </select>
//                         </div>
//                     </div>

//                     <div className="action-buttons">
//                         <button onClick={handleSobreOrden} className="btn btn-so">AGREGAR S.O.</button>
//                         <button onClick={handleCalidad} className="btn btn-calidad">AGREGAR CALIDAD</button>
//                     </div>

//                     <div className="grilla-paquetes">
//                         <h4>Paquetes Registrados</h4>
//                         {cargandoPaquetes ? (
//                             <div className="loading">Cargando paquetes...</div>
//                         ) : (
//                             <div className="paquetes-table-container">
//                                 <table className="paquetes-table">
//                                     <thead>
//                                         <tr>
//                                             <th style={{ width: '60px' }}>Nº Paquete</th>
//                                             <th style={{ width: '150px' }}>Serie/Lote</th>
//                                             <th style={{ width: '80px', textAlign: 'right' }}>Kilos</th>
//                                             <th style={{ width: '100px', textAlign: 'right' }}>Kilos Bruto</th>
//                                             <th style={{ width: '80px', textAlign: 'right' }}>Tara</th>
//                                             <th style={{ width: '60px', textAlign: 'center' }}>Hojas</th>
//                                             <th style={{ width: '100px', textAlign: 'center' }}>Nº Etiqueta</th>
//                                             <th style={{ width: '80px', textAlign: 'center' }}>Calidad</th>
//                                             <th style={{ width: '100px', textAlign: 'center' }}>Acciones</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {paquetes.length > 0 ? paquetes.map((p, i) => (
//                                             <tr
//                                                 key={p.id || i}
//                                                 onDoubleClick={() => handleDobleClickGrilla(p, i)}
//                                                 style={{ cursor: 'pointer' }}
//                                                 title="Doble click para ajustar Peso Bruto"
//                                             >
//                                                 <td>{p.numeroPaquete}</td>
//                                                 <td>{p.serieLote}</td>
//                                                 <td style={{ textAlign: 'right' }}>{p.peso.toFixed(2)}</td>
//                                                 <td style={{ textAlign: 'right' }}>{p.kilosBruto.toFixed(2)}</td>
//                                                 <td style={{ textAlign: 'right' }}>{Math.abs(p.tara).toFixed(2)}</td>
//                                                 <td style={{ textAlign: 'center' }}>{p.hojas}</td>
//                                                 <td style={{ textAlign: 'center' }}>{p.nroEtiqueta}</td>
//                                                 <td style={{ textAlign: 'center' }}>
//                                                     {(p.calidadTexto || '').trim() ? p.calidadTexto : ''}
//                                                 </td>
//                                                 <td className="acciones" style={{ textAlign: 'center' }}>
//                                                     <button onClick={() => imprimirEtiqueta(p)} className="btn-icon btn-imprimir" title="Imprimir">🖨️</button>
//                                                     <button onClick={() => handleEliminarPaquete(p, i)} className="btn-icon btn-eliminar" title="Eliminar">🗑️</button>
//                                                 </td>
//                                             </tr>
//                                         )) : (
//                                             <tr>
//                                                 <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
//                                                     No hay paquetes cargados
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div className="modal-footer">
//                     <button onClick={handleReset} className="btn btn-reset" disabled={paquetes.length === 0}>
//                         RESET
//                     </button>
//                     <button onClick={handleRegistrar} className="btn btn-registrar" disabled={paquetes.length === 0}>
//                         CONFIRMAR REGISTRO
//                     </button>
//                 </div>
//             </div>

//             {showAjusteModal && (
//                 <AjustePesoModal
//                     paquete={paqueteSeleccionado}
//                     onClose={() => {
//                         setShowAjusteModal(false);
//                         setPaqueteSeleccionado(null);
//                         setIndexPaqueteSeleccionado(null);
//                     }}
//                     onConfirm={handleAjustePesoConfirmado}
//                 />
//             )}
//         </div>
//     );
// };

// export default PesajeEmbalajeModal;


















































































// src/components/modals/PesajeEmbalajeModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './PesajeEmbalajeModal.css';
import AjustePesoModal from './AjustePesoModal';
import CalidadModal from '../components/modals/CalidadModal';   // ✅ NUEVO: mismo modal de calidad que usa Slitter

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

    const ultimoNumeroLoteRef = useRef(0);

    const [showAjusteModal, setShowAjusteModal] = useState(false);
    const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
    const [indexPaqueteSeleccionado, setIndexPaqueteSeleccionado] = useState(null);

    // ✅ NUEVOS ESTADOS del flujo de calidad (paridad slitter)
    const [showCalidad, setShowCalidad] = useState(false);
    const [loteCalidad, setLoteCalidad] = useState(null);

    // Datos del pedido
    const numeroPedido = lineaData?.NumeroPedido || '';
    const numeroItem = lineaData?.NumeroItem || '';
    const serieLote = lineaData?.SerieLote || '';
    const sobranteParam = 0;

    // ✅ VB: Inicial.sPedidoID = ItemPedido_ID de la línea (GUID del item del pedido)
    const itemPedidoId = lineaData?.ItemPedido_ID || lineaData?.PedidoID || '';
    // ✅ VB: Inicial.sSerieOrigen = LotePlanchaDesc.Substring(0,6) (serie del lote DESTINO)
    const codSerie = (String(lineaData?.LotePlanchaDesc || '').substring(0, 6) ||
                      String(serieLote).substring(0, 6)).trim();

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
        return itemPedidoId || lineaData?.Lote_IDS || lineaData?.Origen_Lote_ID || operacionId;
    };

    const cargarPaquetesExistentes = async () => {
        try {
            setCargandoPaquetes(true);

            const res = await axiosInstance.post('/registracion/pesaje/obtener-paquetes-emabalaje', {
                operacionId: lineaData?.Operacion_ID || operacionId,
                itemPedidoId: itemPedidoId ? String(itemPedidoId) : '',   // ✅ GUID correcto
                numeroItem: String(numeroItem || ''),                    // ✅ fallback del backend
                sobrante: sobranteParam
            });

            const paquetesData = (res.data || []).map((item, index) => {
                const ks = parseFloat(item.KilosSobreOrden) || 0;
                const kc = parseFloat(item.KilosCalidad) || 0;

                const match = item.SerieLote?.match(/(\d+)\s*-\s*(\d+)/);
                if (match) {
                    ultimoNumeroLoteRef.current = Math.max(ultimoNumeroLoteRef.current, parseInt(match[2]));
                }

                return {
                    id: item.ID_LotePlancha || `pkg-${index}`,
                    numeroPaquete: item.NroPaquete || (index + 1),
                    serieLote: item.SerieLote || '',
                    peso: ks > 0 ? ks : kc,              // ✅ como la celda "Kilos" del VB
                    kilosBruto: parseFloat(item.KilosBruto) || 0,
                    tara: parseFloat(item.Tara) || 0,
                    hojas: item.Hojas || 1,
                    esCalidad: kc > 0,
                    calidadTexto: item.Calidad || ' ',
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

    // ✅ Con el ItemPedido_ID correcto (antes mandaba el GUID de la operación)
    const obtenerLoteDisponible = async () => {
        if (!itemPedidoId) return null;
        try {
            const res = await axiosInstance.post('/registracion/pesaje/obtener-lote-disponible', {
                itemPedidoId,
                codSerie
            });
            return res.data;
        } catch (err) {
            console.error('Error obteniendo lote disponible:', err);
            return null;
        }
    };

    // ✅ lotePreasignado: cuando venimos del modal de calidad, el lote ya fue resuelto
    //    al abrirlo (para que los defectos y el paquete compartan ID_LotePlancha).
    const agregarPaquete = async (esCalidad, lotePreasignado = null) => {
        if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
        if (hojas <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de hojas.', 'warning');
        if (!ultimaEtiqueta) return Swal.fire('Error', 'Número de etiqueta no disponible.', 'error');

        try {
            const nroEtiqueta = await generarEtiqueta();

            let serieLoteUsado = '';
            let idLotePlanchaUsado = '';

            if (lotePreasignado && lotePreasignado.idLotePlancha) {
                // ✅ Lote resuelto al abrir el modal de calidad: se reusa tal cual
                serieLoteUsado = lotePreasignado.serieLote;
                idLotePlanchaUsado = lotePreasignado.idLotePlancha;
                const match = String(serieLoteUsado).match(/(\d+)\s*-\s*(\d+)/);
                if (match) ultimoNumeroLoteRef.current = Math.max(ultimoNumeroLoteRef.current, parseInt(match[2]));
                try {
                    await axiosInstance.post('/registracion/pesaje/marcar-lote-usado', {
                        itemPedidoId: itemPedidoId,
                        idLotePlancha: idLotePlanchaUsado
                    });
                } catch (err) {
                    console.error('Error marcando lote como usado:', err);
                }
            } else {
                // Flujo normal (S.O.): buscar lote disponible o generar uno nuevo
                const loteDisponible = await obtenerLoteDisponible();
                let loteYaUsado = false;

                if (loteDisponible && loteDisponible.idLotePlancha) {
                    const loteRepetido = paquetes.some(p => p.idLotePlancha === loteDisponible.idLotePlancha);
                    if (loteRepetido) {
                        loteYaUsado = true;
                    } else {
                        serieLoteUsado = loteDisponible.lotePlanchaDesc.substring(0, 11);
                        idLotePlanchaUsado = loteDisponible.idLotePlancha;

                        const match = serieLoteUsado.match(/(\d+)\s*-\s*(\d+)/);
                        if (match) ultimoNumeroLoteRef.current = parseInt(match[2]);

                        try {
                            await axiosInstance.post('/registracion/pesaje/marcar-lote-usado', {
                                itemPedidoId: itemPedidoId,          // ✅ GUID correcto
                                idLotePlancha: idLotePlanchaUsado
                            });
                        } catch (err) {
                            console.error('Error marcando lote como usado:', err);
                        }
                    }
                } else {
                    loteYaUsado = true;
                }

                if (loteYaUsado || !loteDisponible || !loteDisponible.idLotePlancha) {
                    ultimoNumeroLoteRef.current += 1;
                    const proximoNumero = ultimoNumeroLoteRef.current;
                    serieLoteUsado = `${codSerie} - ${String(proximoNumero).padStart(3, '0')}`;
                    // ✅ GUID NUEVO por paquete (antes se reusaba Origen_Lote_ID y colisionaban)
                    idLotePlanchaUsado = (typeof crypto !== 'undefined' && crypto.randomUUID)
                        ? crypto.randomUUID()
                        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
                }
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
                calidadTexto: esCalidad ? 'Calidad' : ' ',
                nroEtiqueta
            };

            setPaquetes(prev => [...prev, nuevo]);
            if (esCalidad) setCalidadTotal(prev => prev + peso);
            else setSobreOrdenTotal(prev => prev + peso);

            setNumeroPaquete(prev => prev + 1);
            setHojas(1);
            setUltimaEtiqueta(nroEtiqueta);
            setPeso(0);
        } catch (err) {
            console.error('❌ Error en agregarPaquete:', err);
            Swal.fire('Error', 'No se pudo agregar el paquete.', 'error');
        }
    };

    const handleDobleClickGrilla = (paquete, index) => {
        setPaqueteSeleccionado(paquete);
        setIndexPaqueteSeleccionado(index);
        setShowAjusteModal(true);
    };

    const handleAjustePesoConfirmado = (nuevosValores) => {
        if (paqueteSeleccionado && indexPaqueteSeleccionado !== null) {
            setPaquetes(prev => {
                const nuevosPaquetes = [...prev];
                nuevosPaquetes[indexPaqueteSeleccionado] = {
                    ...nuevosPaquetes[indexPaqueteSeleccionado],
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

    // ✅✅ PARIDAD SLITTER: AGREGAR CALIDAD abre el modal de calidad (NO suma el paquete directo).
    //    El lote del paquete se resuelve AHORA para que los defectos (CalidadPlancha)
    //    y el paquete compartan el mismo ID_LotePlancha.
    const handleCalidad = async () => {
        if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
        if (hojas <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de hojas.', 'warning');

        let lotePrev = null;
        const loteDisponible = await obtenerLoteDisponible();
        if (loteDisponible && loteDisponible.idLotePlancha &&
            !paquetes.some(p => p.idLotePlancha === loteDisponible.idLotePlancha)) {
            lotePrev = {
                idLotePlancha: loteDisponible.idLotePlancha,
                serieLote: String(loteDisponible.lotePlanchaDesc || '').substring(0, 11)
            };
        }
        if (!lotePrev) {
            ultimoNumeroLoteRef.current += 1;
            lotePrev = {
                idLotePlancha: (typeof crypto !== 'undefined' && crypto.randomUUID)
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                serieLote: `${codSerie} - ${String(ultimoNumeroLoteRef.current).padStart(3, '0')}`
            };
        }
        setLoteCalidad(lotePrev);
        setShowCalidad(true);
    };

    // ✅ El CalidadModal YA guardó los defectos en la BD al CONFIRMA (igual que slitter):
    //    acá solo se agrega el paquete como calidad, con el mismo lote.
    const handleCalidadConfirm = () => {
        agregarPaquete(true, loteCalidad);
    };

    const handleRegistrar = async () => {
        if (paquetes.length === 0) return Swal.fire('Advertencia', 'No hay paquetes para registrar.', 'warning');

        try {
            const idParaRegistro = lineaData?.Operacion_ID || operacionId;
            const guidRegistro = obtenerGuidParaConsulta();

            let usuarioLogueado = 'pmorrone';
            const userStorage = localStorage.getItem('user') || localStorage.getItem('usuario');
            if (userStorage) {
                try {
                    const userData = typeof userStorage === 'string' ? JSON.parse(userStorage) : userStorage;
                    usuarioLogueado = userData.nombre || userData.username || userData.user || userData.email || 'pmorrone';
                } catch (err) {
                    usuarioLogueado = typeof userStorage === 'string' ? userStorage : 'pmorrone';
                }
            }

            const dataToSend = {
                operacionId: idParaRegistro,
                itemPedidoId: guidRegistro,
                loteIds: guidRegistro,
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
                usuario: usuarioLogueado
            };

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
            await axiosInstance.post('/registracion/pesaje/resetear-paquetes-emabalaje', {
                operacionId: lineaData?.Operacion_ID || operacionId,
                itemPedidoId: obtenerGuidParaConsulta(),
                sobrante: sobranteParam,
                idLotePlancha: null,
                lineaData: lineaData
            });

            setPaquetes([]);
            setSobreOrdenTotal(0);
            setCalidadTotal(0);
            setNumeroPaquete(1);
            ultimoNumeroLoteRef.current = 0;

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
            icon: 'warning', showCancelButton: true
        });
        if (!confirm.isConfirmed) return;

        setPaquetes(prev => prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, numeroPaquete: i + 1 })));
        if (paqueteAEliminar.esCalidad) setCalidadTotal(prev => prev - paqueteAEliminar.peso);
        else setSobreOrdenTotal(prev => prev - paqueteAEliminar.peso);
        setNumeroPaquete(prev => Math.max(1, prev - 1));
    };

    // ✅ IMPRIMIR ETIQUETA (VB: dblclick columna "Etiqueta" de frmPaquetes -> reporte EtiquetaPlancha)
    const imprimirEtiqueta = async (paquete) => {
        if (!paquete) return;

        // ✅ Mismos controles que el VB: Hojas <> 0 y PESO BRUTO cargado
        if (!paquete.hojas) {
            return Swal.fire('Advertencia', 'El paquete no tiene HOJAS cargadas.', 'warning');
        }
        if (!paquete.kilosBruto) {
            return Swal.fire('Advertencia', 'Debe ingresar PESO BRUTO antes de imprimir la etiqueta', 'warning');
        }

        const confirm = await Swal.fire({
            title: 'Imprimir etiqueta',
            text: `¿Desea imprimir la etiqueta para el atado ${paquete.numeroPaquete}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Imprimir',
            cancelButtonText: 'Cancelar'
        });
        if (!confirm.isConfirmed) return;

        try {
            // ✅ Datos REALES del paquete (antes: .atado / .rollos / tara fija 26)
            const neto  = Math.round(paquete.peso || 0);
            const bruto = Math.round(paquete.kilosBruto || 0);
            const tara  = Math.round(paquete.tara || 0);
            const espesorNum = parseFloat(lineaData?.Espesor);

            const labelData = {
                parSerieLote: paquete.serieLote || serieLote || '',        // ✅ lote DESTINO del paquete (VB: Inicial.sDesLote)
                parFecha: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                parHora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),

                parNumeroExterno: lineaData?.NumeroExterno || lineaData?.NoDoc || '',
                parNotaVenta: lineaData?.NotaVenta || lineaData?.NumeroPedido || '',
                parCodCliente: lineaData?.CodCliente || String(lineaData?.CodProdPedido || '').substring(0, 4),
                parCliente: lineaData?.Clientes || lineaData?.ClientePedido || '',

                parEspesor: isNaN(espesorNum) ? String(lineaData?.Espesor || '0.000') : espesorNum.toFixed(3),
                parAncho: String(lineaData?.Ancho || ''),
                parLargo: String(lineaData?.Largo || '0.0'),
                parRecubrimiento: lineaData?.Recubrimiento || 'NA - N',
                parCodProducto: lineaData?.CodigoProducto || lineaData?.CodProdPedido || '',

                parMaterial: lineaData?.Material || lineaData?.Familia || '',
                parAleacion: lineaData?.Aleacion || '',
                parTemple: lineaData?.Temple || '',
                parTerminacion: lineaData?.Terminacion || 'NA - NA',
                parCalidad: lineaData?.Calidad || '01 -',
                parPaquete: String(paquete.numeroPaquete),                 // ✅ nº de atado/paquete
                parParecer: '',

                parLiquido: String(neto),                                  // ✅ NETO real
                parBruto: String(bruto),                                   // ✅ BRUTO real (antes peso+26)
                parTara: String(tara),                                     // ✅ TARA real (antes fija '26')
                parUnid: String(paquete.hojas),                            // ✅ antes: paquete.rollos (undefined -> crash)
                parTipo: 'FL',
                parNumeroLoteAdicional: String(paquete.nroEtiqueta || '')  // ✅ nº de etiqueta (antes fijo '315021')
            };

            const etiquetaHTML = `
                <div class="etiqueta-container">
                    <div class="header-contenedor">
                        <div class="logo-y-serie">
                            <img src="/Logo1.jpg" alt="Logo Sintecrom" class="logo">
                            <span class="serie-lote">${labelData.parSerieLote}</span>
                        </div>
                    </div>
                    <div class="tabla-top">
                        <div class="celda numero-externo-h"><div class="label">NUMERO EXTERNO</div></div>
                        <div class="celda nota-venta-h"><div class="label">NOTA DE VENTA</div></div>
                        <div class="celda cod-cliente-h"><div class="label">COD.CLIENTE</div></div>
                        <div class="celda cliente-h"><div class="label">CLIENTE</div></div>
                        <div class="celda numero-externo-v"><div class="valor-grande">${labelData.parNumeroExterno}</div></div>
                        <div class="celda nota-venta-v"><div class="valor-grande">${labelData.parNotaVenta}</div></div>
                        <div class="celda cod-cliente-v"><div class="valor-grande">${labelData.parCodCliente}</div></div>
                        <div class="celda cliente-v"><div class="valor-grande">${labelData.parCliente}</div></div>
                        <div class="celda espesor-h"><div class="label">ESPESOR</div></div>
                        <div class="celda ancho-h"><div class="label">ANCHO</div></div>
                        <div class="celda largo-h"><div class="label">LARGO</div></div>
                        <div class="celda cob-h"><div class="label">COB</div></div>
                        <div class="celda espesor-v"><div class="valor-mediano">${labelData.parEspesor}</div></div>
                        <div class="celda ancho-v"><div class="valor-mediano">${labelData.parAncho}</div></div>
                        <div class="celda largo-v"><div class="valor-mediano">${labelData.parLargo}</div></div>
                        <div class="celda cob-v"><div class="valor-mediano">${labelData.parRecubrimiento}</div></div>
                        <div class="celda codigo-completo"><div>${labelData.parCodProducto}</div></div>
                    </div>
                    <table class="tabla tabla-material">
                        <tr><th>MATERIAL</th><th>ALEACION</th><th>TEMPLE</th><th>TERMINACION</th><th>CALIDAD</th><th>PAQUETE</th><th>DICTAMEN</th></tr>
                        <tr>
                            <td>${labelData.parMaterial}</td>
                            <td>${labelData.parAleacion}</td>
                            <td>${labelData.parTemple}</td>
                            <td>${labelData.parTerminacion}</td>
                            <td>${labelData.parCalidad}</td>
                            <td>${labelData.parPaquete}</td>
                            <td>${labelData.parParecer}</td>
                        </tr>
                    </table>
                    <table class="tabla tabla-pesaje">
                        <tr><th>NETO(Kg)</th><th>BRUTO(Kg)</th><th>TARA(Kg)</th><th>UNID</th><th>TIPO</th><th>FECHA</th></tr>
                        <tr>
                            <td>${labelData.parLiquido}</td>
                            <td>${labelData.parBruto}</td>
                            <td>${labelData.parTara}</td>
                            <td>${labelData.parUnid}</td>
                            <td>${labelData.parTipo}</td>
                            <td>${labelData.parFecha}</td>
                        </tr>
                    </table>
                    <div class="info-adicional">
                        <span class="procedencia">Material Origen Brasil y Procedencia Argentina</span>
                        <span class="numero-lote">${labelData.parNumeroLoteAdicional}</span>
                    </div>
                </div>
            `;

            const etiquetaCSS = `
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
                    body { background: white; margin: 0; padding: 0; }
                    .etiqueta-container {
                        width: 14.5cm !important; height: 10cm !important; background: white;
                        margin: 0.5cm 0 0 0.5cm; padding: 0; font-size: 9pt; line-height: 1.1; overflow: hidden;
                    }
                    @media print {
                        body { margin: 0 !important; padding: 0 !important; background: white; }
                        .etiqueta-container { margin: 0.5cm 0 0 0.5cm !important; padding: 0 !important; border: none !important; width: 14.5cm !important; height: 10cm !important; }
                        @page { size: 15cm 10.5cm !important; margin: 0 !important; }
                    }
                    .header-contenedor { border: 1pt solid black; padding: 0.05cm 0.1cm; margin-bottom: 0.05cm; display: flex; align-items: center; height: 1.2cm; }
                    .logo-y-serie { display: flex; align-items: center; width: 100%; }
                    .logo { height: 0.8cm; width: auto; margin-right: 0.2cm; flex-shrink: 0; }
                    .logo-y-serie > span { font-size: 32pt; font-weight: bold; text-align: center; flex-grow: 1; line-height: 1; }
                    .tabla-top {
                        display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(4, auto);
                        border: 1pt solid black; background: white; margin-bottom: 0.05cm; width: 100%; height: 4cm;
                    }
                    .celda { border: 1pt solid black; padding: 1px 2px; display: flex; justify-content: center; align-items: center; text-align: center; background: white; }
                    .label { font-size: 8px; font-weight: normal; letter-spacing: 0.1px; }
                    .valor-grande { font-size: 12px; font-weight: normal; letter-spacing: 0.3px; }
                    .valor-mediano { font-size: 10px; font-weight: normal; letter-spacing: 0.2px; }
                    .numero-externo-h { grid-column: 1 / 3; grid-row: 1; }
                    .nota-venta-h { grid-column: 3 / 5; grid-row: 1; }
                    .cod-cliente-h { grid-column: 5 / 6; grid-row: 1; }
                    .cliente-h { grid-column: 6 / 8; grid-row: 1; }
                    .numero-externo-v { grid-column: 1 / 3; grid-row: 2; }
                    .nota-venta-v { grid-column: 3 / 5; grid-row: 2; }
                    .cod-cliente-v { grid-column: 5 / 6; grid-row: 2; }
                    .cliente-v { grid-column: 6 / 8; grid-row: 2; }
                    .espesor-h { grid-column: 1; grid-row: 3; }
                    .ancho-h { grid-column: 2; grid-row: 3; }
                    .largo-h { grid-column: 3; grid-row: 3; }
                    .cob-h { grid-column: 4; grid-row: 3; }
                    .espesor-v { grid-column: 1; grid-row: 4; }
                    .ancho-v { grid-column: 2; grid-row: 4; }
                    .largo-v { grid-column: 3; grid-row: 4; }
                    .cob-v { grid-column: 4; grid-row: 4; }
                    .codigo-completo { grid-column: 5 / 8; grid-row: 3 / 5; font-size: 8px; padding: 2px 4px; text-align: left; background: #f8f8f8; border: 1pt solid black; }
                    .tabla { width: 100%; border-collapse: collapse; margin-bottom: 0.05cm; table-layout: fixed; border: 1pt solid black; height: 1.9cm; }
                    .tabla th, .tabla td { border: 1pt solid black; padding: 0.03cm; text-align: center; vertical-align: middle; font-size: 7pt; font-weight: normal; }
                    .tabla th { background-color: #f0f0f0; }
                    .tabla-material th, .tabla-material td { width: calc(100% / 7); font-size: 6pt; }
                    .tabla-material th:last-child, .tabla-material td:last-child { width: 18%; }
                    .tabla-material th:nth-child(5), .tabla-material td:nth-child(5) { width: 10%; }
                    .tabla-material th:nth-child(6), .tabla-material td:nth-child(6) { width: 10%; border-right: none; }
                    .tabla-pesaje th, .tabla-pesaje td { width: calc(100% / 6); }
                    .tabla-pesaje td:last-child { font-size: 6pt; }
                    .info-adicional {
                        width: 100%; display: flex; justify-content: space-between; align-items: center;
                        font-size: 7pt; margin-top: 0.02cm; padding: 0.02cm 0; border-top: 1pt solid black; height: 0.5cm;
                    }
                    .procedencia { font-style: italic; margin-left: 0.05cm; }
                    .numero-lote { margin-right: 0.05cm; }
                </style>
            `;

            const printWindow = window.open('', '_blank', 'width=600,height=400,scrollbars=no');
            if (!printWindow) {   // ✅ popup bloqueado -> mensaje claro en vez de crash
                return Swal.fire('Error', 'El navegador bloqueó la ventana de impresión. Habilite las ventanas emergentes.', 'error');
            }
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Etiqueta - ${labelData.parSerieLote}</title>
                    ${etiquetaCSS}
                </head>
                <body>
                    ${etiquetaHTML}
                    <script>
                        window.onload = function() {
                            setTimeout(function() { window.print(); }, 500);
                        };
                        window.onafterprint = function() {
                            setTimeout(function() { window.close(); }, 100);
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();

            Swal.fire('Éxito', 'Etiqueta enviada a impresión.', 'success');
        } catch (error) {
            console.error('Error al imprimir etiqueta:', error);
            Swal.fire('Error', 'Error al preparar la etiqueta para impresión.', 'error');
        }
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
                        <button onClick={handleSobreOrden} className="btn btn-so">AGREGAR S.O.</button>
                        <button onClick={handleCalidad} className="btn btn-calidad">AGREGAR CALIDAD</button>
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
                                                <td style={{ textAlign: 'center' }}>
                                                    {(p.calidadTexto || '').trim() ? p.calidadTexto : ''}
                                                </td>
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

            {/* ✅✅ MODAL DE CALIDAD (idéntico al de Slitter, flujo 'embalaje'):
                carga los defectos pendientes del paquete o queda listo para cargar nuevos.
                Al CONFIRMA guarda en BD y recién entonces se agrega el paquete como calidad. */}
            {showCalidad && (
                <CalidadModal
                    operacionId={lineaData?.Operacion_ID || operacionId}
                    // lineaData={{
                    //     ...lineaData,
                    //     Lote_IDS: loteCalidad?.idLotePlancha || '',   // ✅ ID_LotePlancha del paquete
                    //     ItemPedido_ID: itemPedidoId,
                    //     NumeroItem: numeroItem,
                    //     NumeroPedido: numeroPedido,
                    // }}




































                    lineaData={{
                        ...lineaData,
                        Lote_IDS: loteCalidad?.idLotePlancha || '',
                        SerieLotePaquete: loteCalidad?.serieLote || '',   // ✅ AGREGAR
                        ItemPedido_ID: itemPedidoId,
                        NumeroItem: numeroItem,
                        NumeroPedido: numeroPedido,
                    }}
                    infoHeader={{
                        ancho: lineaData?.Ancho,
                        detalle: lineaData?.Cuchillas || serieLote,
                        maquina: lineaData?.Maquina || 'EMB',
                        usuario: '',
                        codigoProducto: lineaData?.CodigoProducto || lineaData?.CodProdPedido || '',
                        programados,
                        calidadKgs: peso,
                    }}
                    flujo="embalaje"
                    onConfirm={handleCalidadConfirm}
                    onClose={() => { setShowCalidad(false); setLoteCalidad(null); }}
                />
            )}
        </div>
    );
};

export default PesajeEmbalajeModal;
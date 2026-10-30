// ModalScrapSeriado.jsx
// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import AtadosList from './AtadosList';

// const ModalScrapSeriado = ({ operacionId, itemPedidoId, numeroItem, onClose, onSuccess }) => {
//     const [atados, setAtados] = useState([]);
//     const [idLotePlancha, setIdLotePlancha] = useState('');
//     const [serieLote, setSerieLote] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [loteLoading, setLoteLoading] = useState(false);

//     // ✅ Cargar lote disponible automáticamente al montar el modal
//     useEffect(() => {
//         const cargarLoteDisponible = async () => {
//             if (!operacionId || !itemPedidoId) return;
            
//             setLoteLoading(true);
//             try {
//                 // Extraer los primeros 6 caracteres del código de serie del item
//                 const response = await axiosInstance.post('/registracion/pesaje/obtener-lote-disponible', {
//                     itemPedidoId,
//                     codSerie: '73769' // Ajustar según corresponda
//                 });

//                 if (response.data) {
//                     setIdLotePlancha(response.data.idLotePlancha);
//                     setSerieLote(response.data.lotePlanchaDesc);
//                 }
//             } catch (error) {
//                 console.error('Error al obtener lote disponible:', error);
//                 // No mostramos error, el usuario puede completar manualmente
//             } finally {
//                 setLoteLoading(false);
//             }
//         };

//         cargarLoteDisponible();
//     }, [operacionId, itemPedidoId]);

//     const handleGuardar = async () => {
//         if (atados.length === 0) {
//             Swal.fire('Atención', 'Debe ingresar al menos un atado.', 'warning');
//             return;
//         }

//         if (!idLotePlancha || !serieLote) {
//             Swal.fire('Atención', 'Debe especificar el ID de Lote Plancha y la Serie/Lote.', 'warning');
//             return;
//         }

//         setLoading(true);
//         try {
//             await axiosInstance.post('/registracion/pesaje/registrar-scrap-seriado', {
//                 operacionId,
//                 itemPedidoId,
//                 numeroItem,
//                 idLotePlancha,
//                 serieLote,
//                 atados,
//                 usuario: localStorage.getItem('user') || 'sistema'
//             });

//             await Swal.fire('Éxito', 'Scrap Seriado registrado correctamente.', 'success');
//             if (onSuccess) onSuccess();
//             onClose();
//         } catch (error) {
//             console.error('Error al registrar scrap seriado:', error);
//             Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar el scrap seriado.', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="modal-overlay" onClick={onClose}>
//             <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
//                 <div className="modal-header">
//                     <h2>📦 Scrap Seriado</h2>
//                     <button className="modal-close" onClick={onClose}>×</button>
//                 </div>
                
//                 <div className="modal-body">
//                     <div className="form-group" style={{ marginBottom: '20px' }}>
//                         <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                             ID Lote Plancha (GUID) *
//                         </label>
//                         <input
//                             type="text"
//                             className="form-control"
//                             value={idLotePlancha}
//                             onChange={(e) => setIdLotePlancha(e.target.value)}
//                             placeholder="Ej: 123e4567-e89b-12d3-a456-426614174000"
//                             disabled={loteLoading}
//                             style={{ 
//                                 width: '100%', 
//                                 padding: '8px', 
//                                 border: '1px solid #ddd', 
//                                 borderRadius: '4px' 
//                             }}
//                         />
//                         {loteLoading && <small style={{ color: '#666' }}>Cargando lote disponible...</small>}
//                     </div>

//                     <div className="form-group" style={{ marginBottom: '20px' }}>
//                         <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                             Serie/Lote *
//                         </label>
//                         <input
//                             type="text"
//                             className="form-control"
//                             value={serieLote}
//                             onChange={(e) => setSerieLote(e.target.value)}
//                             placeholder="Ej: 73769 - 015 - Embalaje"
//                             disabled={loteLoading}
//                             style={{ 
//                                 width: '100%', 
//                                 padding: '8px', 
//                                 border: '1px solid #ddd', 
//                                 borderRadius: '4px' 
//                             }}
//                         />
//                     </div>

//                     <div className="alert alert-info" style={{ 
//                         backgroundColor: '#fff3cd', 
//                         border: '1px solid #ffc107', 
//                         borderRadius: '4px', 
//                         padding: '12px',
//                         marginBottom: '20px'
//                     }}>
//                         <strong>Importante:</strong><br/>
//                         El Scrap Seriado requiere un ID de Lote Plancha válido y una descripción de Serie/Lote.
//                     </div>

//                     <AtadosList 
//                         atados={atados} 
//                         setAtados={setAtados} 
//                         operacionId={operacionId}
//                         itemPedidoId={itemPedidoId}
//                         numeroItem={numeroItem}
//                         esScrap={true}
//                         esScrapSeriado={true}
//                     />
//                 </div>

//                 <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//                     <button 
//                         className="btn btn-secondary" 
//                         onClick={onClose}
//                         disabled={loading}
//                     >
//                         Cancelar
//                     </button>
//                     <button 
//                         className="btn btn-primary" 
//                         onClick={handleGuardar}
//                         disabled={loading || atados.length === 0 || !idLotePlancha || !serieLote}
//                         style={{ 
//                             backgroundColor: '#1976d2', 
//                             color: 'white',
//                             padding: '10px 20px',
//                             border: 'none',
//                             borderRadius: '4px',
//                             cursor: (loading || atados.length === 0 || !idLotePlancha || !serieLote) ? 'not-allowed' : 'pointer'
//                         }}
//                     >
//                         {loading ? 'Guardando...' : 'Guardar Scrap Seriado'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ModalScrapSeriado;






























// // src/components/modals/ModalScrapSeriado.jsx
// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import AtadosList from './AtadosList';

// const ModalScrapSeriado = ({ operacionId, itemPedidoId, numeroItem, serieLote, onClose, onSuccess }) => {
//     const [atados, setAtados] = useState([]);
//     const [idLotePlancha, setIdLotePlancha] = useState('');
//     const [serieLoteState, setSerieLoteState] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [loteLoading, setLoteLoading] = useState(false);

//     // ✅ Cargar lote disponible automáticamente al montar el modal
//     useEffect(() => {
//         const cargarLoteDisponible = async () => {
//             if (!operacionId || !itemPedidoId) return;
            
//             setLoteLoading(true);
//             try {
//                 // Extraer dinámicamente el código de serie (ej: "73769 - 015 - Embalaje" -> "73769")
//                 const codSerieExtraido = serieLote ? serieLote.split('-')[0].trim() : '73769';
                
//                 const response = await axiosInstance.post('/registracion/pesaje/obtener-lote-disponible', {
//                     itemPedidoId,
//                     codSerie: codSerieExtraido
//                 });

//                 if (response.data) {
//                     setIdLotePlancha(response.data.idLotePlancha);
//                     setSerieLoteState(response.data.lotePlanchaDesc);
//                 }
//             } catch (error) {
//                 console.error('Error al obtener lote disponible:', error);
//             } finally {
//                 setLoteLoading(false);
//             }
//         };

//         cargarLoteDisponible();
//     }, [operacionId, itemPedidoId, serieLote]);

//     const handleGuardar = async () => {
//         if (atados.length === 0) {
//             Swal.fire('Atención', 'Debe ingresar al menos un atado.', 'warning');
//             return;
//         }

//         if (!idLotePlancha || !serieLoteState) {
//             Swal.fire('Atención', 'Debe especificar el ID de Lote Plancha y la Serie/Lote.', 'warning');
//             return;
//         }

//         setLoading(true);
//         try {
//             await axiosInstance.post('/registracion/pesaje/registrar-scrap-seriado', {
//                 operacionId,
//                 itemPedidoId,
//                 numeroItem,
//                 idLotePlancha,
//                 serieLote: serieLoteState,
//                 atados,
//                 usuario: localStorage.getItem('user') || 'sistema'
//             });

//             await Swal.fire('Éxito', 'Scrap Seriado registrado correctamente.', 'success');
//             if (onSuccess) onSuccess();
//         } catch (error) {
//             console.error('Error al registrar scrap seriado:', error);
//             Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar el scrap seriado.', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="modal-overlay" onClick={onClose}>
//             <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
//                 <div className="modal-header">
//                     <h2>📦 Scrap Seriado</h2>
//                     <button className="modal-close" onClick={onClose}>×</button>
//                 </div>
                
//                 <div className="modal-body">
//                     <div className="form-group" style={{ marginBottom: '20px' }}>
//                         <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                             ID Lote Plancha (GUID) *
//                         </label>
//                         <input
//                             type="text"
//                             className="form-control"
//                             value={idLotePlancha}
//                             onChange={(e) => setIdLotePlancha(e.target.value)}
//                             placeholder="Ej: 123e4567-e89b-12d3-a456-426614174000"
//                             disabled={loteLoading}
//                             style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
//                         />
//                         {loteLoading && <small style={{ color: '#666' }}>Cargando lote disponible...</small>}
//                     </div>

//                     <div className="form-group" style={{ marginBottom: '20px' }}>
//                         <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                             Serie/Lote *
//                         </label>
//                         <input
//                             type="text"
//                             className="form-control"
//                             value={serieLoteState}
//                             onChange={(e) => setSerieLoteState(e.target.value)}
//                             placeholder="Ej: 73769 - 015 - Embalaje"
//                             disabled={loteLoading}
//                             style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
//                         />
//                     </div>

//                     <div className="alert alert-info" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', padding: '12px', marginBottom: '20px' }}>
//                         <strong>Importante:</strong><br/>
//                         El Scrap Seriado requiere un ID de Lote Plancha válido y una descripción de Serie/Lote.
//                     </div>

//                     <AtadosList 
//                         atados={atados} 
//                         setAtados={setAtados} 
//                         operacionId={operacionId}
//                         itemPedidoId={itemPedidoId}
//                         numeroItem={numeroItem}
//                         esScrap={true}
//                         esScrapSeriado={true}
//                     />
//                 </div>

//                 <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//                     <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
//                     <button 
//                         className="btn btn-primary" 
//                         onClick={handleGuardar}
//                         disabled={loading || atados.length === 0 || !idLotePlancha || !serieLoteState}
//                         style={{ backgroundColor: '#1976d2', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: (loading || atados.length === 0 || !idLotePlancha || !serieLoteState) ? 'not-allowed' : 'pointer' }}
//                     >
//                         {loading ? 'Guardando...' : 'Guardar Scrap Seriado'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ModalScrapSeriado;






































// // src/components/modals/ModalScrapSeriado.jsx
// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import PrintLabel from '../PrintLabel';
// import '../PesajeModal.css';

// const ModalScrapSeriado = ({ operacionId, itemPedidoId, numeroItem, serieLote, lineaData, onClose, onSuccess }) => {
//     const [peso, setPeso] = useState(0);
//     const [isManualEdit, setIsManualEdit] = useState(false);
//     const [atado, setAtado] = useState(1);
//     const [rollos, setRollos] = useState(0);
//     const [atados, setAtados] = useState([]);
//     const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
//     const [calidadTotal, setCalidadTotal] = useState(0);
//     const [idLotePlancha, setIdLotePlancha] = useState('');
//     const [serieLoteState, setSerieLoteState] = useState('');
//     const [loteLoading, setLoteLoading] = useState(true);
//     const [loading, setLoading] = useState(false);
//     const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);

//     // ✅ Carga lote de merma disponible + última etiqueta
//     useEffect(() => {
//         const cargar = async () => {
//             try {
//                 const codSerie = serieLote ? serieLote.split('-')[0].trim() : String(serieLote || '').substring(0, 6);
//                 const res = await axiosInstance.post('/registracion/pesaje/obtener-lote-disponible', { itemPedidoId, codSerie });
//                 if (res.data) {
//                     setIdLotePlancha(res.data.idLotePlancha || '');
//                     setSerieLoteState(res.data.lotePlanchaDesc || '');
//                 }
//             } catch (e) { console.error('Error al obtener lote disponible:', e); }
//             finally { setLoteLoading(false); }
//             try {
//                 const e2 = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
//                 setUltimaEtiqueta(e2.data.ultimaEtiqueta);
//             } catch (e) { console.error(e); }
//         };
//         cargar();
//     }, [operacionId, itemPedidoId, serieLote]);

//     // ✅ Polling de balanza
//     useEffect(() => {
//         const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
//         const interval = setInterval(async () => {
//             if (isManualEdit) return;
//             try {
//                 const res = await axiosInstance.get(`${agenteUrl}/peso`);
//                 setPeso(parseFloat(res.data?.peso) || 0);
//             } catch { /* balanza offline */ }
//         }, 1200);
//         return () => clearInterval(interval);
//     }, [isManualEdit]);

//     const generarEtiqueta = async () => {
//         const res = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
//         return res.data.nroEtiqueta;
//     };

//     const agregarAtado = async (esCalidad) => {
//         if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
//         if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de rollos.', 'warning');
//         try {
//             const nroEtiqueta = await generarEtiqueta();
//             setAtados(prev => [...prev.map(a => ({ ...a, isLatest: false })), { atado, rollos, peso, esCalidad, nroEtiqueta, isLatest: true }]);
//             if (esCalidad) setCalidadTotal(prev => prev + peso);
//             else setSobreOrdenTotal(prev => prev + peso);
//             setAtado(prev => prev + 1);
//             setRollos(0);
//             setPeso(0);
//             setUltimaEtiqueta(nroEtiqueta);
//         } catch (e) {
//             Swal.fire('Error', 'No se pudo generar etiqueta.', 'error');
//         }
//     };

//     const handleEliminar = (index) => {
//         const a = atados[index];
//         if (!a.isLatest) return Swal.fire('Advertencia', 'Solo se puede eliminar el último.', 'warning');
//         Swal.fire({ title: '¿Eliminar?', showCancelButton: true }).then(c => {
//             if (!c.isConfirmed) return;
//             if (a.esCalidad) setCalidadTotal(prev => prev - a.peso);
//             else setSobreOrdenTotal(prev => prev - a.peso);
//             setAtados(prev => prev.filter((_, i) => i !== index));
//         });
//     };

//     const imprimirEtiqueta = (item) => {
//         PrintLabel({
//             parSerieLote: serieLoteState || serieLote || 'N/A',
//             parFecha: new Date().toLocaleDateString('es-AR'),
//             parHora: new Date().toLocaleTimeString('es-AR'),
//             parCliente: lineaData?.Clientes || '',
//             parAncho: (lineaData?.Ancho || '0').toString(),
//             parEspesor: (lineaData?.Espesor?.toFixed?.(3) || '0.000').toString(),
//             parCodProducto: lineaData?.CodigoProducto || '',
//             parLiquido: item.peso.toFixed(0),
//             parBruto: (item.peso + 26).toFixed(0),
//             parTara: '26',
//             parUnid: item.rollos.toString()
//         });
//     };

//     const handleReset = async () => {
//         const confirm = await Swal.fire({ title: '¿Borrar todo?', icon: 'warning', showCancelButton: true });
//         if (!confirm.isConfirmed) return;
//         try {
//             await axiosInstance.post('/registracion/pesaje/resetear-paquetes-emabalaje', {
//                 operacionId, itemPedidoId, sobrante: 2, idLotePlancha
//             });
//             setAtados([]); setSobreOrdenTotal(0); setCalidadTotal(0);
//             setAtado(1); setRollos(0); setPeso(0);
//             Swal.fire('Éxito', 'Reset completado.', 'success');
//             if (onSuccess) onSuccess();
//             onClose();
//         } catch (e) {
//             Swal.fire('Error', 'No se pudo resetear.', 'error');
//         }
//     };

//     const handleGuardar = async () => {
//         if (atados.length === 0 || (sobreOrdenTotal + calidadTotal) <= 0) {
//             return Swal.fire('Advertencia', 'No puede registrar sin kilos.', 'warning');
//         }
//         if (!idLotePlancha || !serieLoteState) {
//             return Swal.fire('Advertencia', 'Debe especificar el ID de Lote Plancha y la Serie/Lote.', 'warning');
//         }
//         setLoading(true);
//         try {
//             let userName = 'sistema';
//             try { userName = JSON.parse(localStorage.getItem('user'))?.nombre || 'sistema'; } catch (e) {}
//             await axiosInstance.post('/registracion/pesaje/registrar-scrap-seriado', {
//                 operacionId,
//                 itemPedidoId,
//                 numeroItem,
//                 idLotePlancha,
//                 serieLote: serieLoteState,
//                 atados: atados.map(a => ({ atado: a.atado, rollos: a.rollos, peso: a.peso, esCalidad: a.esCalidad, nroEtiqueta: a.nroEtiqueta })),
//                 usuario: userName
//             });
//             Swal.fire('Éxito', 'Scrap Seriado registrado correctamente.', 'success');
//             if (onSuccess) onSuccess();
//             onClose();
//         } catch (error) {
//             console.error('Error al registrar scrap seriado:', error);
//             Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar el scrap seriado.', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="pesaje-modal-overlay">
//             <div className="pesaje-modal">
//                 <div className="modal-header">
//                     <h3>Scrap Seriado - {lineaData?.Ancho || ''}</h3>
//                     <button onClick={onClose}>&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="info-panel">
//                         <div>Serie-Lote: {serieLoteState || serieLote || 'N/A'}</div>
//                         <div>ID Lote Plancha: {loteLoading ? 'Cargando...' : (idLotePlancha || 'SIN LOTE')}</div>
//                     </div>

//                     <div className="pesaje-section">
//                         <label>Peso Balanza:</label>
//                         <input
//                             type="number"
//                             step="1"
//                             pattern="\d*"
//                             value={peso}
//                             onChange={(e) => { const v = parseInt(e.target.value) || 0; setPeso(v >= 0 ? v : 0); setIsManualEdit(true); }}
//                             onFocus={() => setIsManualEdit(true)}
//                             onBlur={() => setIsManualEdit(false)}
//                             className="peso-input"
//                         />
//                     </div>

//                     <div className="totales">
//                         <div>Kg. Sobre Orden: {sobreOrdenTotal.toFixed(2)}</div>
//                         <div>Kg. Calidad: {calidadTotal.toFixed(2)}</div>
//                     </div>

//                     <div className="atados-section">
//                         <label>Atado: {atado}</label>
//                         <label>Rollos:</label>
//                         <input type="number" value={rollos} onChange={e => setRollos(parseInt(e.target.value) || 0)} min="0" />
//                         <button onClick={() => agregarAtado(false)} className="btn-so">Sobre Orden</button>
//                         <button onClick={() => agregarAtado(true)} className="btn-calidad">Calidad</button>
//                     </div>

//                     <div className="grilla-atados">
//                         <h4>Atados Registrados</h4>
//                         <table>
//                             <thead>
//                                 <tr><th>Atado</th><th>Rollos</th><th>Peso</th><th>Calidad</th><th>Nro. Etiqueta</th><th>Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {atados.length > 0 ? atados.map((a, i) => (
//                                     <tr key={i}>
//                                         <td>{a.atado}</td>
//                                         <td>{a.rollos}</td>
//                                         <td>{a.peso.toFixed(2)}</td>
//                                         <td>{a.esCalidad ? '✓' : ''}</td>
//                                         <td>{a.nroEtiqueta}</td>
//                                         <td className="acciones-atado">
//                                             <button onClick={() => imprimirEtiqueta(a)} className="btn-imprimir">🖨️</button>
//                                             {a.isLatest && <button onClick={() => handleEliminar(i)} className="btn-eliminar">🗑️</button>}
//                                         </td>
//                                     </tr>
//                                 )) : (
//                                     <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay atados</td></tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//                 <div className="modal-footer">
//                     <button onClick={handleReset} className="btn-reset">RESET</button>
//                     <button onClick={handleGuardar} className="btn-registrar" disabled={loading}>
//                         {loading ? 'GUARDANDO...' : 'REGISTRAR'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ModalScrapSeriado;























// src/components/modals/ModalScrapSeriado.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import PrintLabel from '../PrintLabel';
import '../PesajeModal.css';

const ModalScrapSeriado = ({ operacionId, itemPedidoId, numeroItem, serieLote, lineaData, onClose, onSuccess }) => {
    const [peso, setPeso] = useState(0);
    const [isManualEdit, setIsManualEdit] = useState(false);
    const [atado, setAtado] = useState(1);
    const [rollos, setRollos] = useState(0);
    const [atados, setAtados] = useState([]);
    const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
    const [calidadTotal, setCalidadTotal] = useState(0);
    const [idLotePlancha, setIdLotePlancha] = useState('');
    const [serieLoteState, setSerieLoteState] = useState('');
    const [loteLoading, setLoteLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);

    // ✅ Carga lote de merma disponible + última etiqueta
    useEffect(() => {
        const cargar = async () => {
            try {
                const codSerie = serieLote ? serieLote.split('-')[0].trim() : String(serieLote || '').substring(0, 6);
                const res = await axiosInstance.post('/registracion/pesaje/obtener-lote-disponible', { itemPedidoId, codSerie });
                if (res.data) {
                    setIdLotePlancha(res.data.idLotePlancha || '');
                    setSerieLoteState(res.data.lotePlanchaDesc || '');
                }
            } catch (e) { console.error('Error al obtener lote disponible:', e); }
            finally { setLoteLoading(false); }
            try {
                const e2 = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
                setUltimaEtiqueta(e2.data.ultimaEtiqueta);
            } catch (e) { console.error(e); }
        };
        cargar();
    }, [operacionId, itemPedidoId, serieLote]);

    // ✅✅ Carga atados YA REGISTRADOS de scrap seriado (endpoint nuevo)
    useEffect(() => {
        const cargarExistente = async () => {
            try {
                const res = await axiosInstance.post('/registracion/pesaje/obtener-scrap-embalaje', { operacionId });
                const lista = res.data?.atadosSeriado || [];
                if (lista.length > 0) {
                    const mapped = lista.map((a, i) => ({ ...a, isLatest: i === lista.length - 1 }));
                    setAtados(mapped);
                    setSobreOrdenTotal(mapped.filter(a => !a.esCalidad).reduce((s, a) => s + a.peso, 0));
                    setCalidadTotal(mapped.filter(a => a.esCalidad).reduce((s, a) => s + a.peso, 0));
                    setAtado(Math.max(...mapped.map(a => a.atado), 0) + 1);
                }
            } catch (e) { console.warn('⚠️ sin scrap seriado previo:', e.message); }
        };
        cargarExistente();
    }, [operacionId]);

    // ✅ Polling de balanza
    useEffect(() => {
        const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
        const interval = setInterval(async () => {
            if (isManualEdit) return;
            try {
                const res = await axiosInstance.get(`${agenteUrl}/peso`);
                setPeso(parseFloat(res.data?.peso) || 0);
            } catch { /* balanza offline */ }
        }, 1200);
        return () => clearInterval(interval);
    }, [isManualEdit]);

    const generarEtiqueta = async () => {
        const res = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
        return res.data.nroEtiqueta;
    };

    const agregarAtado = async (esCalidad) => {
        if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
        if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de rollos.', 'warning');
        try {
            const nroEtiqueta = await generarEtiqueta();
            setAtados(prev => [...prev.map(a => ({ ...a, isLatest: false })), { atado, rollos, peso, esCalidad, nroEtiqueta, isLatest: true }]);
            if (esCalidad) setCalidadTotal(prev => prev + peso);
            else setSobreOrdenTotal(prev => prev + peso);
            setAtado(prev => prev + 1);
            setRollos(0);
            setPeso(0);
            setUltimaEtiqueta(nroEtiqueta);
        } catch (e) {
            Swal.fire('Error', 'No se pudo generar etiqueta.', 'error');
        }
    };

    const handleEliminar = (index) => {
        const a = atados[index];
        if (!a.isLatest) return Swal.fire('Advertencia', 'Solo se puede eliminar el último.', 'warning');
        Swal.fire({ title: '¿Eliminar?', showCancelButton: true }).then(c => {
            if (!c.isConfirmed) return;
            if (a.esCalidad) setCalidadTotal(prev => prev - a.peso);
            else setSobreOrdenTotal(prev => prev - a.peso);
            setAtados(prev => prev.filter((_, i) => i !== index));
        });
    };

    const imprimirEtiqueta = (item) => {
        PrintLabel({
            parSerieLote: serieLoteState || serieLote || 'N/A',
            parFecha: new Date().toLocaleDateString('es-AR'),
            parHora: new Date().toLocaleTimeString('es-AR'),
            parCliente: lineaData?.Clientes || '',
            parAncho: (lineaData?.Ancho || '0').toString(),
            parEspesor: (lineaData?.Espesor?.toFixed?.(3) || '0.000').toString(),
            parCodProducto: lineaData?.CodigoProducto || '',
            parLiquido: item.peso.toFixed(0),
            parBruto: (item.peso + 26).toFixed(0),
            parTara: '26',
            parUnid: item.rollos.toString()
        });
    };

    const handleReset = async () => {
        const confirm = await Swal.fire({ title: '¿Borrar todo?', icon: 'warning', showCancelButton: true });
        if (!confirm.isConfirmed) return;
        try {
            await axiosInstance.post('/registracion/pesaje/resetear-paquetes-emabalaje', {
                operacionId, itemPedidoId, sobrante: 2, idLotePlancha
            });
            setAtados([]); setSobreOrdenTotal(0); setCalidadTotal(0);
            setAtado(1); setRollos(0); setPeso(0);
            Swal.fire('Éxito', 'Reset completado.', 'success');
            if (onSuccess) onSuccess();
            onClose();
        } catch (e) {
            Swal.fire('Error', 'No se pudo resetear.', 'error');
        }
    };

    const handleGuardar = async () => {
        if (atados.length === 0 || (sobreOrdenTotal + calidadTotal) <= 0) {
            return Swal.fire('Advertencia', 'No puede registrar sin kilos.', 'warning');
        }
        if (!idLotePlancha || !serieLoteState) {
            return Swal.fire('Advertencia', 'Debe especificar el ID de Lote Plancha y la Serie/Lote.', 'warning');
        }
        setLoading(true);
        try {
            let userName = 'sistema';
            try { userName = JSON.parse(localStorage.getItem('user'))?.nombre || 'sistema'; } catch (e) {}
            await axiosInstance.post('/registracion/pesaje/registrar-scrap-seriado', {
                operacionId,
                itemPedidoId,
                numeroItem,
                idLotePlancha,
                serieLote: serieLoteState,
                atados: atados.map(a => ({ atado: a.atado, rollos: a.rollos, peso: a.peso, esCalidad: a.esCalidad, nroEtiqueta: a.nroEtiqueta })),
                usuario: userName
            });
            Swal.fire('Éxito', 'Scrap Seriado registrado correctamente.', 'success');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error al registrar scrap seriado:', error);
            Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar el scrap seriado.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pesaje-modal-overlay">
            <div className="pesaje-modal">
                <div className="modal-header">
                    <h3>Scrap Seriado - {lineaData?.Ancho || ''}</h3>
                    <button onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="info-panel">
                        <div>Serie-Lote: {serieLoteState || serieLote || 'N/A'}</div>
                        <div>ID Lote Plancha: {loteLoading ? 'Cargando...' : (idLotePlancha || 'SIN LOTE')}</div>
                    </div>

                    <div className="pesaje-section">
                        <label>Peso Balanza:</label>
                        <input
                            type="number" step="1" pattern="\d*" value={peso}
                            onChange={(e) => { const v = parseInt(e.target.value) || 0; setPeso(v >= 0 ? v : 0); setIsManualEdit(true); }}
                            onFocus={() => setIsManualEdit(true)}
                            onBlur={() => setIsManualEdit(false)}
                            className="peso-input"
                        />
                    </div>

                    <div className="totales">
                        <div>Kg. Sobre Orden: {sobreOrdenTotal.toFixed(2)}</div>
                        <div>Kg. Calidad: {calidadTotal.toFixed(2)}</div>
                    </div>

                    <div className="atados-section">
                        <label>Atado: {atado}</label>
                        <label>Rollos:</label>
                        <input type="number" value={rollos} onChange={e => setRollos(parseInt(e.target.value) || 0)} min="0" />
                        <button onClick={() => agregarAtado(false)} className="btn-so">Sobre Orden</button>
                        <button onClick={() => agregarAtado(true)} className="btn-calidad">Calidad</button>
                    </div>

                    <div className="grilla-atados">
                        <h4>Atados Registrados</h4>
                        <table>
                            <thead>
                                <tr><th>Atado</th><th>Rollos</th><th>Peso</th><th>Calidad</th><th>Nro. Etiqueta</th><th>Acciones</th></tr>
                            </thead>
                            <tbody>
                                {atados.length > 0 ? atados.map((a, i) => (
                                    <tr key={i}>
                                        <td>{a.atado}</td>
                                        <td>{a.rollos}</td>
                                        <td>{a.peso.toFixed(2)}</td>
                                        <td>{a.esCalidad ? '✓' : ''}</td>
                                        <td>{a.nroEtiqueta}</td>
                                        <td className="acciones-atado">
                                            <button onClick={() => imprimirEtiqueta(a)} className="btn-imprimir">🖨️</button>
                                            {a.isLatest && <button onClick={() => handleEliminar(i)} className="btn-eliminar">🗑️</button>}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay atados</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleReset} className="btn-reset">RESET</button>
                    <button onClick={handleGuardar} className="btn-registrar" disabled={loading}>
                        {loading ? 'GUARDANDO...' : 'REGISTRAR'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalScrapSeriado;
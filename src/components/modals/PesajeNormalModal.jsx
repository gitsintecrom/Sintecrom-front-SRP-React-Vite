// // src/components/modals/PesajeNormalModal.jsx
// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import '../PesajeModal.css';

// const PesajeNormalModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
//     // === ESTADOS DE DATOS ===
//     const [peso, setPeso] = useState(0);
//     const [isManualEdit, setIsManualEdit] = useState(false); 
//     const [atado, setAtado] = useState(1);
//     const [rollos, setRollos] = useState(0);
//     const [atados, setAtados] = useState([]);
//     const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
//     const [calidadTotal, setCalidadTotal] = useState(0);
//     const [programados, setProgramados] = useState(0);
//     const [cargandoAtados, setCargandoAtados] = useState(true);
//     const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);
    
//     const loteIdsParam = lineaData?.Lote_IDS || null;
//     const sobranteParam = 0; 

//     // === LÓGICA DE BALANZA Y DATOS ===
//     useEffect(() => {
//         cargarAtadosExistentes();
//     }, [lineaData, operacionId]);
    
//     useEffect(() => {
//         const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
//         const interval = setInterval(async () => {
//             if (isManualEdit) return;
//             try {
//                 const res = await axiosInstance.get(`${agenteUrl}/peso`);
//                 // ✅ REDONDEAR A ENTERO el peso de la balanza
//                 setPeso(Math.round(parseFloat(res.data.peso) || 0));
//             } catch {
//                 console.warn("Balanza no disponible");
//             }
//         }, 1200);
//         return () => clearInterval(interval);
//     }, [isManualEdit]);

//     const cargarAtadosExistentes = async () => {
//         try {
//             setCargandoAtados(true);
//             const idParaConsulta = lineaData?.Operacion_ID || operacionId;
//             const res = await axiosInstance.post('/registracion/pesaje/obtener-atados', {
//                 operacionId: idParaConsulta,
//                 loteIds: loteIdsParam,
//                 sobrante: sobranteParam
//             });
//             const dataResponse = Array.isArray(res.data) ? res.data : [];
//             const atadosData = dataResponse.map(item => ({
//                 atado: item.Atado || 0,
//                 rollos: item.Rollos || 0,
//                 peso: parseFloat(item.Peso) || 0,
//                 esCalidad: item.Calidad === 1,
//                 nroEtiqueta: item.Etiqueta,
//                 idBD: item.IdRegistroPesaje
//             }));
//             setAtados(atadosData);
//             setSobreOrdenTotal(atadosData.filter(a => !a.esCalidad).reduce((sum, a) => sum + a.peso, 0));
//             setCalidadTotal(atadosData.filter(a => a.esCalidad).reduce((sum, a) => sum + a.peso, 0));
//             const lastAtado = atadosData.length > 0 ? Math.max(...atadosData.map(a => a.atado), 0) : 0;
//             setAtado(lastAtado + 1);
//             setProgramados(parseFloat(lineaData?.Programados) || 0);
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setCargandoAtados(false);
//         }
//         try {
//             const etiquetaRes = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
//             setUltimaEtiqueta(etiquetaRes.data.ultimaEtiqueta);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const generarEtiqueta = async () => {
//         const res = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
//         return res.data.nroEtiqueta;
//     };

//     const agregarAtado = async (esCalidad) => {
//         if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
//         if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de rollos.', 'warning');
//         if (!ultimaEtiqueta) return Swal.fire('Error', 'Número de etiqueta no disponible.', 'error');
//         try {
//             const nroEtiqueta = await generarEtiqueta();
//             const nuevo = { atado, rollos, peso, esCalidad, nroEtiqueta };
//             setAtados(prev => [...prev, nuevo]);
//             if (esCalidad) setCalidadTotal(prev => prev + peso);
//             else setSobreOrdenTotal(prev => prev + peso);
//             setAtado(prev => prev + 1);
//             setRollos(0);
//             setUltimaEtiqueta(nroEtiqueta);
//         } catch (err) {
//             Swal.fire('Error', 'No se pudo generar etiqueta.', 'error');
//         }
//     };

//     const handleSobreOrden = () => agregarAtado(false);
//     const handleCalidad = () => agregarAtado(true);

//     const handleRegistrar = async () => {
//         if (atados.length === 0) return Swal.fire('Advertencia', 'No hay pesajes.', 'warning');
//         try {
//             const idParaRegistro = lineaData?.Operacion_ID || operacionId;
//             await axiosInstance.post('/registracion/pesaje/registrar', {
//                 operacionId: idParaRegistro,
//                 loteIds: loteIdsParam,
//                 sobrante: sobranteParam,
//                 atados: atados.map(a => ({
//                     atado: a.atado,
//                     rollos: a.rollos,
//                     peso: a.peso,
//                     esCalidad: a.esCalidad,
//                     nroEtiqueta: a.nroEtiqueta
//                 })),
//                 lineaData
//             });
//             Swal.fire('Éxito', 'Registrado correctamente.', 'success');
//             onSuccess();
//             onClose();
//         } catch (err) {
//             Swal.fire('Error', 'Error al registrar.', 'error');
//         }
//     };

//     const handleReset = async () => {
//         const confirm = await Swal.fire({ title: '¿Borrar todo?', text: 'Se borrarán todos los pesajes y se cerrará el modal.', icon: 'warning', showCancelButton: true });
//         if (!confirm.isConfirmed) return;
//         try {
//             const idParaReset = lineaData?.Operacion_ID || operacionId;
//             await axiosInstance.post('/registracion/pesaje/reset', {
//                 operacionId: idParaReset,
//                 loteIds: loteIdsParam,
//                 sobrante: sobranteParam
//             });
            
//             await Swal.fire('Éxito', 'Pesajes borrados correctamente.', 'success');
            
//             onSuccess(); 
//             onClose();
            
//         } catch (err) {
//             console.error(err);
//             Swal.fire('Error', 'No se pudo resetear.', 'error');
//         }
//     };

//     const handleEliminarAtado = async (atadoAEliminar, index) => {
//         const confirm = await Swal.fire({ 
//             title: '¿Eliminar atado?', 
//             text: `Se eliminará el atado ${atadoAEliminar.atado} de ${atadoAEliminar.peso.toFixed(2)} Kg`,
//             icon: 'warning', 
//             showCancelButton: true 
//         });
//         if (!confirm.isConfirmed) return;
        
//         setAtados(prev => {
//             const nuevos = prev.filter((_, i) => i !== index);
//             const renumerados = nuevos.map((a, i) => ({
//                 ...a,
//                 atado: i + 1
//             }));
//             return renumerados;
//         });
        
//         if (atadoAEliminar.esCalidad) {
//             setCalidadTotal(prev => prev - atadoAEliminar.peso);
//         } else {
//             setSobreOrdenTotal(prev => prev - atadoAEliminar.peso);
//         }
        
//         setAtado(prev => prev - 1);
//     };

//     const imprimirEtiqueta = (a) => { console.log("Imprimir", a); };

//     return (
//         <div className="pesaje-modal-overlay">
//             <div className="pesaje-modal">
//                 <div className="modal-header">
//                     <h3>Pesaje Normal - {lineaData?.Ancho} x {lineaData?.Cuchillas}</h3>
//                     <button onClick={onClose}>&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="info-panel">
//                         <div>Serie-Lote: {lineaData?.SerieLote || 'N/A'}</div>
//                         <div>Kgs. Programados: {programados.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
//                     </div>
//                     <div className="pesaje-section">
//                         <label>Peso Balanza:</label>
//                         {/* ✅ INPUT SOLO ENTEROS: step="1", pattern, y onChange que redondea */}
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
//                         />
//                     </div>
//                     <div className="totales">
//                         <div>SOBRE ORDEN: {sobreOrdenTotal.toFixed(2)}</div>
//                         <div>CALIDAD: {calidadTotal.toFixed(2)}</div>
//                     </div>
//                     <div className="atados-section">
//                         <label>Atado: {atado}</label>
//                         <label>Rollos:</label>
//                         <input type="number" value={rollos} onChange={e => setRollos(parseInt(e.target.value) || 0)} min="0" />
//                         <button onClick={handleSobreOrden} className="btn-so">AGREGAR S.O.</button>
//                         <button onClick={handleCalidad} className="btn-calidad">AGREGAR CALIDAD</button>
//                     </div>
//                     <div className="grilla-atados">
//                         <h4>Atados en Memoria / Registrados</h4>
//                         {cargandoAtados ? <div>Cargando...</div> : (
//                             <table>
//                                 <thead><tr><th>Atado</th><th>Rollos</th><th>Peso</th><th>Calidad</th><th>Etiqueta</th><th>Acciones</th></tr></thead>
//                                 <tbody>
//                                     {atados.length > 0 ? atados.map((a, i) => (
//                                         <tr key={i}>
//                                             <td>{a.atado}</td>
//                                             <td>{a.rollos}</td>
//                                             <td>{a.peso.toFixed(2)} Kg</td>
//                                             <td>{a.esCalidad ? 'SI' : 'NO'}</td>
//                                             <td>{a.nroEtiqueta}</td>
//                                             <td className="acciones-atado">
//                                                 <button onClick={() => imprimirEtiqueta(a)} className="btn-imprimir">🖨️</button>
//                                                 <button onClick={() => handleEliminarAtado(a, i)} className="btn-eliminar">🗑️</button>
//                                             </td>
//                                         </tr>
//                                     )) : <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay pesajes cargados</td></tr>}
//                                 </tbody>
//                             </table>
//                         )}
//                     </div>
//                 </div>
//                 <div className="modal-footer">
//                     <button onClick={handleReset} className="btn-reset">BORRAR TODO</button>
//                     <button onClick={handleRegistrar} className="btn-registrar">CONFIRMAR REGISTRO</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PesajeNormalModal;














































// // src/components/modals/PesajeNormalModal.jsx
// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import CalidadModal from './CalidadModal'; // ✅ NUEVO
// import '../PesajeModal.css';

// // ✅ NUEVO: prop codigoProducto (pasala desde el padre con header.CodigoProducto)
// const PesajeNormalModal = ({ lineaData, operacionId, codigoProducto, onClose, onSuccess }) => {
//     const [peso, setPeso] = useState(0);
//     const [isManualEdit, setIsManualEdit] = useState(false);
//     const [atado, setAtado] = useState(1);
//     const [rollos, setRollos] = useState(0);
//     const [atados, setAtados] = useState([]);
//     const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
//     const [calidadTotal, setCalidadTotal] = useState(0);
//     const [programados, setProgramados] = useState(0);
//     const [cargandoAtados, setCargandoAtados] = useState(true);
//     const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);
//     const [showCalidad, setShowCalidad] = useState(false);      // ✅ NUEVO
//     const [defectosCalidad, setDefectosCalidad] = useState([]); // ✅ NUEVO

//     const loteIdsParam = lineaData?.Lote_IDS || null;
//     const sobranteParam = 0;
//     const codProd = codigoProducto || lineaData?.CodigoProducto || ''; // ✅ NUEVO

//     useEffect(() => { cargarAtadosExistentes(); }, [lineaData, operacionId]);

//     useEffect(() => {
//         const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
//         const interval = setInterval(async () => {
//             if (isManualEdit) return;
//             try {
//                 const res = await axiosInstance.get(`${agenteUrl}/peso`);
//                 setPeso(Math.round(parseFloat(res.data.peso) || 0));
//             } catch { console.warn("Balanza no disponible"); }
//         }, 1200);
//         return () => clearInterval(interval);
//     }, [isManualEdit]);

//     const cargarAtadosExistentes = async () => {
//         try {
//             setCargandoAtados(true);
//             const idParaConsulta = lineaData?.Operacion_ID || operacionId;
//             const res = await axiosInstance.post('/registracion/pesaje/obtener-atados', {
//                 operacionId: idParaConsulta, loteIds: loteIdsParam, sobrante: sobranteParam
//             });
//             const dataResponse = Array.isArray(res.data) ? res.data : [];
//             const atadosData = dataResponse.map(item => ({
//                 atado: item.Atado || 0, rollos: item.Rollos || 0, peso: parseFloat(item.Peso) || 0,
//                 esCalidad: item.Calidad === 1, nroEtiqueta: item.Etiqueta, idBD: item.IdRegistroPesaje
//             }));
//             setAtados(atadosData);
//             setSobreOrdenTotal(atadosData.filter(a => !a.esCalidad).reduce((sum, a) => sum + a.peso, 0));
//             setCalidadTotal(atadosData.filter(a => a.esCalidad).reduce((sum, a) => sum + a.peso, 0));
//             const lastAtado = atadosData.length > 0 ? Math.max(...atadosData.map(a => a.atado), 0) : 0;
//             setAtado(lastAtado + 1);
//             setProgramados(parseFloat(lineaData?.Programados) || 0);
//         } catch (err) { console.error(err); } finally { setCargandoAtados(false); }
//         try {
//             const etiquetaRes = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
//             setUltimaEtiqueta(etiquetaRes.data.ultimaEtiqueta);
//         } catch (err) { console.error(err); }
//     };

//     const generarEtiqueta = async () => {
//         const res = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
//         return res.data.nroEtiqueta;
//     };

//     const agregarAtado = async (esCalidad) => {
//         if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
//         if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de rollos.', 'warning');
//         if (!ultimaEtiqueta) return Swal.fire('Error', 'Número de etiqueta no disponible.', 'error');
//         try {
//             const nroEtiqueta = await generarEtiqueta();
//             setAtados(prev => [...prev, { atado, rollos, peso, esCalidad, nroEtiqueta }]);
//             if (esCalidad) setCalidadTotal(prev => prev + peso);
//             else setSobreOrdenTotal(prev => prev + peso);
//             setAtado(prev => prev + 1);
//             setRollos(0);
//             setUltimaEtiqueta(nroEtiqueta);
//         } catch (err) { Swal.fire('Error', 'No se pudo generar etiqueta.', 'error'); }
//     };

//     const handleSobreOrden = () => agregarAtado(false);

//     // ✅ CAMBIO: ahora abre el modal de calidad (réplica frmCalidad) en vez de agregar directo
//     const handleCalidad = () => {
//         if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
//         if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de rollos.', 'warning');
//         setShowCalidad(true);
//     };

//     // ✅ NUEVO: cuando CONFIRMA en el modal de calidad → agrega el atado como calidad y guarda defectos en memoria
//     const handleCalidadConfirm = (defectos) => {
//         agregarAtado(true);
//         setDefectosCalidad(defectos);
//     };

//     const handleRegistrar = async () => {
//         if (atados.length === 0) return Swal.fire('Advertencia', 'No hay pesajes.', 'warning');
//         try {
//             const idParaRegistro = lineaData?.Operacion_ID || operacionId;
//             await axiosInstance.post('/registracion/pesaje/registrar', {
//                 operacionId: idParaRegistro,
//                 loteIds: loteIdsParam,
//                 sobrante: sobranteParam,
//                 atados: atados.map(a => ({ atado: a.atado, rollos: a.rollos, peso: a.peso, esCalidad: a.esCalidad, nroEtiqueta: a.nroEtiqueta })),
//                 lineaData
//             });

//             // ✅ NUEVO: después de registrar los atados, grabo los defectos de calidad (como el VB)
//             if (defectosCalidad.length > 0) {
//                 try {
//                     await axiosInstance.post('/registracion/calidad/guardar-slitter', {
//                         operacionId: idParaRegistro,
//                         loteIds: loteIdsParam,
//                         sobrante: 0,
//                         sobreorden: 0,
//                         defectos: defectosCalidad,
//                         // familia / loteID / destinoLote los completa el backend solo
//                     });
//                 } catch (errCal) {
//                     console.error(errCal);
//                     Swal.fire('Atención', 'Pesaje registrado, pero hubo un error al guardar los defectos de calidad.', 'warning');
//                 }
//             }

//             Swal.fire('Éxito', 'Registrado correctamente.', 'success');
//             onSuccess();
//             onClose();
//         } catch (err) { Swal.fire('Error', 'Error al registrar.', 'error'); }
//     };

//     const handleReset = async () => {
//         const confirm = await Swal.fire({ title: '¿Borrar todo?', text: 'Se borrarán todos los pesajes y se cerrará el modal.', icon: 'warning', showCancelButton: true });
//         if (!confirm.isConfirmed) return;
//         try {
//             const idParaReset = lineaData?.Operacion_ID || operacionId;
//             await axiosInstance.post('/registracion/pesaje/reset', {
//                 operacionId: idParaReset, loteIds: loteIdsParam, sobrante: sobranteParam
//             });
//             await Swal.fire('Éxito', 'Pesajes borrados correctamente.', 'success');
//             onSuccess();
//             onClose();
//         } catch (err) { console.error(err); Swal.fire('Error', 'No se pudo resetear.', 'error'); }
//     };

//     const handleEliminarAtado = async (atadoAEliminar, index) => {
//         const confirm = await Swal.fire({
//             title: '¿Eliminar atado?',
//             text: `Se eliminará el atado ${atadoAEliminar.atado} de ${atadoAEliminar.peso.toFixed(2)} Kg`,
//             icon: 'warning', showCancelButton: true
//         });
//         if (!confirm.isConfirmed) return;
//         setAtados(prev => prev.filter((_, i) => i !== index).map((a, i) => ({ ...a, atado: i + 1 })));
//         if (atadoAEliminar.esCalidad) setCalidadTotal(prev => prev - atadoAEliminar.peso);
//         else setSobreOrdenTotal(prev => prev - atadoAEliminar.peso);
//         setAtado(prev => prev - 1);
//     };

//     const imprimirEtiqueta = (a) => { console.log("Imprimir", a); };

//     return (
//         <div className="pesaje-modal-overlay">
//             <div className="pesaje-modal">
//                 <div className="modal-header">
//                     <h3>Pesaje Normal - {lineaData?.Ancho} x {lineaData?.Cuchillas}</h3>
//                     <button onClick={onClose}>&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="info-panel">
//                         <div>Serie-Lote: {lineaData?.SerieLote || 'N/A'}</div>
//                         <div>Kgs. Programados: {programados.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
//                     </div>
//                     <div className="pesaje-section">
//                         <label>Peso Balanza:</label>
//                         <input
//                             type="number" step="1" pattern="\d*" value={peso}
//                             onChange={(e) => { const val = parseInt(e.target.value) || 0; setPeso(val >= 0 ? val : 0); }}
//                             onFocus={() => setIsManualEdit(true)} onBlur={() => setIsManualEdit(false)}
//                             className="peso-input"
//                         />
//                     </div>
//                     <div className="totales">
//                         <div>SOBRE ORDEN: {sobreOrdenTotal.toFixed(2)}</div>
//                         <div>CALIDAD: {calidadTotal.toFixed(2)}</div>
//                     </div>
//                     <div className="atados-section">
//                         <label>Atado: {atado}</label>
//                         <label>Rollos:</label>
//                         <input type="number" value={rollos} onChange={e => setRollos(parseInt(e.target.value) || 0)} min="0" />
//                         <button onClick={handleSobreOrden} className="btn-so">AGREGAR S.O.</button>
//                         <button onClick={handleCalidad} className="btn-calidad">AGREGAR CALIDAD</button>
//                     </div>
//                     <div className="grilla-atados">
//                         <h4>Atados en Memoria / Registrados</h4>
//                         {cargandoAtados ? <div>Cargando...</div> : (
//                             <table>
//                                 <thead><tr><th>Atado</th><th>Rollos</th><th>Peso</th><th>Calidad</th><th>Etiqueta</th><th>Acciones</th></tr></thead>
//                                 <tbody>
//                                     {atados.length > 0 ? atados.map((a, i) => (
//                                         <tr key={i}>
//                                             <td>{a.atado}</td>
//                                             <td>{a.rollos}</td>
//                                             <td>{a.peso.toFixed(2)} Kg</td>
//                                             <td>{a.esCalidad ? 'SI' : 'NO'}</td>
//                                             <td>{a.nroEtiqueta}</td>
//                                             <td className="acciones-atado">
//                                                 <button onClick={() => imprimirEtiqueta(a)} className="btn-imprimir">🖨️</button>
//                                                 <button onClick={() => handleEliminarAtado(a, i)} className="btn-eliminar">🗑️</button>
//                                             </td>
//                                         </tr>
//                                     )) : <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay pesajes cargados</td></tr>}
//                                 </tbody>
//                             </table>
//                         )}
//                     </div>
//                 </div>
//                 <div className="modal-footer">
//                     <button onClick={handleReset} className="btn-reset">BORRAR TODO</button>
//                     <button onClick={handleRegistrar} className="btn-registrar">CONFIRMAR REGISTRO</button>
//                 </div>
//             </div>

//             {/* ✅ NUEVO: MODAL DE CALIDAD (réplica de frmCalidad) */}
//             {showCalidad && (
//                 <CalidadModal
//                     operacionId={lineaData?.Operacion_ID || operacionId}
//                     lineaData={lineaData}
//                     infoHeader={{
//                         ancho: lineaData?.Ancho,
//                         detalle: lineaData?.Cuchillas,
//                         maquina: lineaData?.Maquina || 'SL2',
//                         usuario: lineaData?.Usuario || '',
//                         codigoProducto: codProd,
//                         programados,
//                         calidadKgs: peso,   // ✅ ANTES: calidadTotal → AHORA el peso del input Peso Balan
//                     }}
//                     defectosIniciales={defectosCalidad}
//                     onConfirm={handleCalidadConfirm}
//                     onClose={() => setShowCalidad(false)}
//                 />
//             )}
//         </div>
//     );
// };

// export default PesajeNormalModal;








































// src/components/modals/PesajeNormalModal.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import CalidadModal from './CalidadModal';
import '../PesajeModal.css';

const PesajeNormalModal = ({ lineaData, operacionId, codigoProducto, onClose, onSuccess }) => {
    const [peso, setPeso] = useState(0);
    const [isManualEdit, setIsManualEdit] = useState(false);
    const [atado, setAtado] = useState(1);
    const [rollos, setRollos] = useState(0);
    const [atados, setAtados] = useState([]);
    const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
    const [calidadTotal, setCalidadTotal] = useState(0);
    const [programados, setProgramados] = useState(0);
    const [cargandoAtados, setCargandoAtados] = useState(true);
    const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);
    const [showCalidad, setShowCalidad] = useState(false);
    const [defectosCalidad, setDefectosCalidad] = useState([]);

    const loteIdsParam = lineaData?.Lote_IDS || null;
    const sobranteParam = 0;
    const codProd = codigoProducto || lineaData?.CodigoProducto || '';

    useEffect(() => { cargarAtadosExistentes(); }, [lineaData, operacionId]);

    useEffect(() => {
        const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
        const interval = setInterval(async () => {
            if (isManualEdit) return;
            try {
                const res = await axiosInstance.get(`${agenteUrl}/peso`);
                setPeso(Math.round(parseFloat(res.data.peso) || 0));
            } catch { console.warn("Balanza no disponible"); }
        }, 1200);
        return () => clearInterval(interval);
    }, [isManualEdit]);

    const cargarAtadosExistentes = async () => {
        try {
            setCargandoAtados(true);
            const idParaConsulta = lineaData?.Operacion_ID || operacionId;
            const res = await axiosInstance.post('/registracion/pesaje/obtener-atados', {
                operacionId: idParaConsulta, loteIds: loteIdsParam, sobrante: sobranteParam
            });
            const dataResponse = Array.isArray(res.data) ? res.data : [];
            const atadosData = dataResponse.map(item => ({
                atado: item.Atado || 0, rollos: item.Rollos || 0, peso: parseFloat(item.Peso) || 0,
                esCalidad: item.Calidad === 1, nroEtiqueta: item.Etiqueta, idBD: item.IdRegistroPesaje
            }));
            setAtados(atadosData);
            setSobreOrdenTotal(atadosData.filter(a => !a.esCalidad).reduce((sum, a) => sum + a.peso, 0));
            setCalidadTotal(atadosData.filter(a => a.esCalidad).reduce((sum, a) => sum + a.peso, 0));
            const lastAtado = atadosData.length > 0 ? Math.max(...atadosData.map(a => a.atado), 0) : 0;
            setAtado(lastAtado + 1);
            setProgramados(parseFloat(lineaData?.Programados) || 0);
        } catch (err) { console.error(err); } finally { setCargandoAtados(false); }
        try {
            const etiquetaRes = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
            setUltimaEtiqueta(etiquetaRes.data.ultimaEtiqueta);
        } catch (err) { console.error(err); }
    };

    const generarEtiqueta = async () => {
        const res = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
        return res.data.nroEtiqueta;
    };

    const agregarAtado = async (esCalidad) => {
        if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
        if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de rollos.', 'warning');
        if (!ultimaEtiqueta) return Swal.fire('Error', 'Número de etiqueta no disponible.', 'error');
        try {
            const nroEtiqueta = await generarEtiqueta();
            setAtados(prev => [...prev, { atado, rollos, peso, esCalidad, nroEtiqueta }]);
            if (esCalidad) setCalidadTotal(prev => prev + peso);
            else setSobreOrdenTotal(prev => prev + peso);
            setAtado(prev => prev + 1);
            setRollos(0);
            setUltimaEtiqueta(nroEtiqueta);
        } catch (err) { Swal.fire('Error', 'No se pudo generar etiqueta.', 'error'); }
    };

    const handleSobreOrden = () => agregarAtado(false);

    const handleCalidad = () => {
        if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
        if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de rollos.', 'warning');
        setShowCalidad(true);
    };

    // ✅ El modal de calidad YA guardó en la BD al CONFIRMAR. 
    // Solo actualizo memoria y agrego el atado como calidad.
    const handleCalidadConfirm = (defectos) => {
        agregarAtado(true);
        setDefectosCalidad(defectos);
    };

    const handleRegistrar = async () => {
        if (atados.length === 0) return Swal.fire('Advertencia', 'No hay pesajes.', 'warning');
        try {
            const idParaRegistro = lineaData?.Operacion_ID || operacionId;
            // ✅ SOLO registrar el pesaje. Los defectos ya están en la BD (los guardó CalidadModal al CONFIRMAR).
            await axiosInstance.post('/registracion/pesaje/registrar', {
                operacionId: idParaRegistro,
                loteIds: loteIdsParam,
                sobrante: sobranteParam,
                atados: atados.map(a => ({ atado: a.atado, rollos: a.rollos, peso: a.peso, esCalidad: a.esCalidad, nroEtiqueta: a.nroEtiqueta })),
                lineaData
            });

            Swal.fire('Éxito', 'Registrado correctamente.', 'success');
            onSuccess();
            onClose();
        } catch (err) { Swal.fire('Error', 'Error al registrar.', 'error'); }
    };

    const handleReset = async () => {
        const confirm = await Swal.fire({ title: '¿Borrar todo?', text: 'Se borrarán todos los pesajes y se cerrará el modal.', icon: 'warning', showCancelButton: true });
        if (!confirm.isConfirmed) return;
        try {
            const idParaReset = lineaData?.Operacion_ID || operacionId;
            await axiosInstance.post('/registracion/pesaje/reset', {
                operacionId: idParaReset, loteIds: loteIdsParam, sobrante: sobranteParam
            });
            await Swal.fire('Éxito', 'Pesajes borrados correctamente.', 'success');
            onSuccess();
            onClose();
        } catch (err) { console.error(err); Swal.fire('Error', 'No se pudo resetear.', 'error'); }
    };

    const handleEliminarAtado = async (atadoAEliminar, index) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar atado?',
            text: `Se eliminará el atado ${atadoAEliminar.atado} de ${atadoAEliminar.peso.toFixed(2)} Kg`,
            icon: 'warning', showCancelButton: true
        });
        if (!confirm.isConfirmed) return;
        setAtados(prev => prev.filter((_, i) => i !== index).map((a, i) => ({ ...a, atado: i + 1 })));
        if (atadoAEliminar.esCalidad) setCalidadTotal(prev => prev - atadoAEliminar.peso);
        else setSobreOrdenTotal(prev => prev - atadoAEliminar.peso);
        setAtado(prev => prev - 1);
    };


    const imprimirEtiqueta = async (itemAtado) => {
        try {
            const confirm = await Swal.fire({
                title: 'Imprimir etiqueta',
                text: `¿Desea imprimir la etiqueta para el atado ${itemAtado.atado}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Imprimir',
                cancelButtonText: 'Cancelar'
            });

            if (confirm.isConfirmed) {
                let labelData = {
                    parSerieLote: lineaData?.SerieLote || '73291 - 010', // Ajustado según screenshot
                    parFecha: new Date().toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }),
                    parHora: new Date().toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),

                    parNumeroExterno: lineaData?.NumeroExterno || '25A0674-2',
                    parNotaVenta: lineaData?.NotaVenta || '032000',
                    parCodCliente: lineaData?.CodCliente || '0945',
                    parCliente: lineaData?.Clientes || 'CIMET S.A.',

                    parEspesor: (lineaData?.Espesor?.toFixed(3) || '0.500').toString(),
                    parAncho: (lineaData?.Ancho || '160').toString(), // Ajustado según screenshot
                    parLargo: (lineaData?.Largo || '0.0').toString(),
                    parRecubrimiento: lineaData?.Recubrimiento || 'NA - N',
                    parCodProducto: lineaData?.CodigoProducto || '0945-PT-AL-FL-0500-0050-1NP-01',

                    parMaterial: lineaData?.Material || 'Aluminio',
                    parAleacion: lineaData?.Aleacion || '1100 -',
                    parTemple: lineaData?.Temple || 'O - O',
                    parTerminacion: lineaData?.Terminacion || 'NA - NA',
                    parCalidad: lineaData?.Calidad || '01 -',
                    parPaquete: '0',
                    parParecer: '',

                    parLiquido: itemAtado.peso.toFixed(0),
                    parBruto: (itemAtado.peso + 26).toFixed(0),
                    parTara: '26',
                    parUnid: itemAtado.rollos.toString(),
                    parTipo: 'FL',
                    parNumeroLoteAdicional: '315021'
                };

                const etiquetaHTML = `
                    <div class="etiqueta-container">
                        <!-- Header con logo y serie-lote -->
                        <div class="header-contenedor">
                            <div class="logo-y-serie">
                                <img src="/Logo1.jpg" alt="Logo Sintecrom" class="logo">
                                <span class="serie-lote">${labelData.parSerieLote}</span>
                            </div>
                        </div>

                        <!-- Grid para Cabecera y Dimensiones (sin celdas vacías) -->
                        <div class="tabla-top">
                            <!-- Fila 1 - Headers -->
                            <div class="celda numero-externo-h">
                                <div class="label">NUMERO EXTERNO</div>
                            </div>
                            <div class="celda nota-venta-h">
                                <div class="label">NOTA DE VENTA</div>
                            </div>
                            <div class="celda cod-cliente-h">
                                <div class="label">COD.CLIENTE</div>
                            </div>
                            <div class="celda cliente-h">
                                <div class="label">CLIENTE</div>
                            </div>

                            <!-- Fila 2 - Valores principales -->
                            <div class="celda numero-externo-v">
                                <div class="valor-grande">${labelData.parNumeroExterno}</div>
                            </div>
                            <div class="celda nota-venta-v">
                                <div class="valor-grande">${labelData.parNotaVenta}</div>
                            </div>
                            <div class="celda cod-cliente-v">
                                <div class="valor-grande">${labelData.parCodCliente}</div>
                            </div>
                            <div class="celda cliente-v">
                                <div class="valor-grande">${labelData.parCliente}</div>
                            </div>

                            <!-- Fila 3 - Sub headers -->
                            <div class="celda espesor-h">
                                <div class="label">ESPESOR</div>
                            </div>
                            <div class="celda ancho-h">
                                <div class="label">ANCHO</div>
                            </div>
                            <div class="celda largo-h">
                                <div class="label">LARGO</div>
                            </div>
                            <div class="celda cob-h">
                                <div class="label">COB</div>
                            </div>

                            <!-- Fila 4 - Valores dimensiones -->
                            <div class="celda espesor-v">
                                <div class="valor-mediano">${labelData.parEspesor}</div>
                            </div>
                            <div class="celda ancho-v">
                                <div class="valor-mediano">${labelData.parAncho}</div>
                            </div>
                            <div class="celda largo-v">
                                <div class="valor-mediano">${labelData.parLargo}</div>
                            </div>
                            <div class="celda cob-v">
                                <div class="valor-mediano">${labelData.parRecubrimiento}</div>
                            </div>

                            <!-- Código completo - spans rows 3-4, cols 5-7 -->
                            <div class="celda codigo-completo">
                                <div>${labelData.parCodProducto}</div>
                            </div>
                        </div>

                        <!-- Tabla Material -->
                        <table class="tabla tabla-material">
                            <tr>
                                <th>MATERIAL</th>
                                <th>ALEACION</th>
                                <th>TEMPLE</th>
                                <th>TERMINACION</th>
                                <th>CALIDAD</th>
                                <th>PAQUETE</th>
                                <th>DICTAMEN</th>
                            </tr>
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

                        <!-- Tabla Pesaje -->
                        <table class="tabla tabla-pesaje">
                            <tr>
                                <th>NETO(Kg)</th>
                                <th>BRUTO(Kg)</th>
                                <th>TARA(Kg)</th>
                                <th>UNID</th>
                                <th>TIPO</th>
                                <th>FECHA</th>
                            </tr>
                            <tr>
                                <td>${labelData.parLiquido}</td>
                                <td>${labelData.parBruto}</td>
                                <td>${labelData.parTara}</td>
                                <td>${labelData.parUnid}</td>
                                <td>${labelData.parTipo}</td>
                                <td>${labelData.parFecha}</td>
                            </tr>
                        </table>

                        <!-- Información adicional PEGADA -->
                        <div class="info-adicional">
                            <span class="procedencia">Material Origen Brasil y Procedencia Argentina</span>
                            <span class="numero-lote">${labelData.parNumeroLoteAdicional}</span>
                        </div>
                    </div>
                `;

                const etiquetaCSS = `
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                            font-family: Arial, sans-serif;
                        }

                        body {
                            background: white;
                            margin: 0;
                            padding: 0;
                        }

                        .etiqueta-container {
                            width: 14.5cm !important;
                            height: 10cm !important; /* Altura reducida un poco más */
                            background: white;
                            margin: 0.5cm 0 0 0.5cm; /* Margen superior e izquierdo de 0.5cm */
                            padding: 0; /* Padding cero para usar todo el espacio */
                            font-size: 9pt;
                            line-height: 1.1; /* Reducir line-height para mayor compacidad */
                            overflow: hidden; /* Evitar desbordes */
                        }

                        @media print {
                            body {
                                margin: 0 !important;
                                padding: 0 !important;
                                background: white;
                            }
                            .etiqueta-container {
                                margin: 0.5cm 0 0 0.5cm !important; /* Márgenes en print */
                                padding: 0 !important;
                                border: none !important;
                                width: 14.5cm !important;
                                height: 10cm !important;
                            }
                            @page {
                                size: 15cm 10.5cm !important; /* Tamaño de página ajustado */
                                margin: 0 !important;
                            }
                        }

                        /* Header con logo y serie-lote */
                        .header-contenedor {
                            border: 1pt solid black;
                            padding: 0.05cm 0.1cm;
                            margin-bottom: 0.05cm;
                            display: flex;
                            align-items: center;
                            height: 1.2cm; /* Altura aumentada para mejor visual del número de lote y serie */
                        }

                        .logo-y-serie {
                            display: flex;
                            align-items: center;
                            width: 100%;
                        }

                        .logo {
                            height: 0.8cm; /* Altura del logo ajustada proporcionalmente */
                            width: auto;
                            margin-right: 0.2cm;
                            flex-shrink: 0;
                        }
                        
                        .logo-y-serie > span {
                            font-size: 32pt;
                            font-weight: bold;
                            text-align: center;
                            flex-grow: 1;
                            line-height: 1;
                        }

                        /* Grid para la parte superior */
                        .tabla-top {
                            display: grid;
                            grid-template-columns: repeat(7, 1fr);
                            grid-template-rows: repeat(4, auto);
                            border: 1pt solid black;
                            background: white;
                            margin-bottom: 0.05cm;
                            width: 100%;
                            height: 4cm; /* Altura reducida proporcionalmente */
                        }

                        .celda {
                            border: 1pt solid black;
                            padding: 1px 2px; /* Padding ajustado */
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            background: white;
                        }

                        .label {
                            font-size: 8px;
                            font-weight: normal;
                            letter-spacing: 0.1px;
                        }

                        .valor-grande {
                            font-size: 12px;
                            font-weight: normal;
                            letter-spacing: 0.3px;
                        }

                        .valor-mediano {
                            font-size: 10px;
                            font-weight: normal;
                            letter-spacing: 0.2px;
                        }

                        /* Posicionamiento de celdas */
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

                        .codigo-completo {
                            grid-column: 5 / 8;
                            grid-row: 3 / 5;
                            font-size: 8px;
                            font-weight: normal;
                            letter-spacing: 0.1px;
                            padding: 2px 4px;
                            text-align: left;
                            background: #f8f8f8;
                            border: 1pt solid black;
                        }

                        /* Tablas inferiores */
                        .tabla {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 0.05cm;
                            table-layout: fixed;
                            border: 1pt solid black;
                            height: 1.9cm; /* Altura igual a la parte superior, reducida */
                        }

                        .tabla th,
                        .tabla td {
                            border: 1pt solid black;
                            padding: 0.03cm; /* Padding ajustado para más altura interna */
                            text-align: center;
                            vertical-align: middle;
                            font-size: 7pt;
                            font-weight: normal;
                        }

                        .tabla th {
                            background-color: #f0f0f0;
                        }

                        /* Tabla Material */
                        .tabla-material th,
                        .tabla-material td {
                            width: calc(100% / 7);
                            font-size: 6pt;
                        }
                        .tabla-material th:last-child, .tabla-material td:last-child {
                            width: 18%;
                        }
                        .tabla-material th:nth-child(5), .tabla-material td:nth-child(5) {
                            width: 10%;
                        }
                        .tabla-material th:nth-child(6), .tabla-material td:nth-child(6) {
                            width: 10%;
                            border-right: none;
                        }

                        /* Tabla Pesaje */
                        .tabla-pesaje th,
                        .tabla-pesaje td {
                            width: calc(100% / 6);
                        }
                        .tabla-pesaje td:last-child {
                            font-size: 6pt;
                        }

                        /* Información adicional */
                        .info-adicional {
                            width: 100%;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            font-size: 7pt;
                            margin-top: 0.02cm;
                            padding: 0.02cm 0;
                            border-top: 1pt solid black;
                            font-weight: normal;
                            height: 0.5cm; /* Altura reducida proporcionalmente */
                        }

                        .procedencia {
                            font-style: italic;
                            margin-left: 0.05cm;
                        }

                        .numero-lote {
                            margin-right: 0.05cm;
                        }
                    </style>
                `;

                const printWindow = window.open('', '_blank', 'width=600,height=400,scrollbars=no');
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
                                setTimeout(function() {
                                    window.print();
                                }, 500);
                            };
                            window.onafterprint = function() {
                                setTimeout(function() {
                                    window.close();
                                }, 100);
                            };
                        </script>
                    </body>
                    </html>
                `);
                printWindow.document.close();

                Swal.fire('Éxito', 'Etiqueta enviada a impresión.', 'success');
            }
        } catch (error) {
            console.error('Error al imprimir etiqueta:', error);
            Swal.fire('Error', 'Error al preparar la etiqueta para impresión.', 'error');
        }
    };



    return (
        <div className="pesaje-modal-overlay">
            <div className="pesaje-modal">
                <div className="modal-header">
                    <h3>Pesaje Normal - {lineaData?.Ancho} x {lineaData?.Cuchillas}</h3>
                    <button onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="info-panel">
                        <div>Serie-Lote: {lineaData?.SerieLote || 'N/A'}</div>
                        <div>Kgs. Programados: {programados.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="pesaje-section">
                        <label>Peso Balanza:</label>
                        <input
                            type="number" step="1" pattern="\d*" value={peso}
                            onChange={(e) => { const val = parseInt(e.target.value) || 0; setPeso(val >= 0 ? val : 0); }}
                            onFocus={() => setIsManualEdit(true)} onBlur={() => setIsManualEdit(false)}
                            className="peso-input"
                        />
                    </div>
                    <div className="totales">
                        <div>SOBRE ORDEN: {sobreOrdenTotal.toFixed(2)}</div>
                        <div>CALIDAD: {calidadTotal.toFixed(2)}</div>
                    </div>
                    <div className="atados-section">
                        <label>Atado: {atado}</label>
                        <label>Rollos:</label>
                        <input type="number" value={rollos} onChange={e => setRollos(parseInt(e.target.value) || 0)} min="0" />
                        <button onClick={handleSobreOrden} className="btn-so">AGREGAR S.O.</button>
                        <button onClick={handleCalidad} className="btn-calidad">AGREGAR CALIDAD</button>
                    </div>
                    <div className="grilla-atados">
                        <h4>Atados en Memoria / Registrados</h4>
                        {cargandoAtados ? <div>Cargando...</div> : (
                            <table>
                                <thead><tr><th>Atado</th><th>Rollos</th><th>Peso</th><th>Calidad</th><th>Etiqueta</th><th>Acciones</th></tr></thead>
                                <tbody>
                                    {atados.length > 0 ? atados.map((a, i) => (
                                        <tr key={i}>
                                            <td>{a.atado}</td>
                                            <td>{a.rollos}</td>
                                            <td>{a.peso.toFixed(2)} Kg</td>
                                            <td>{a.esCalidad ? 'SI' : 'NO'}</td>
                                            <td>{a.nroEtiqueta}</td>
                                            <td className="acciones-atado">
                                                <button onClick={() => imprimirEtiqueta(a)} className="btn-imprimir">🖨️</button>
                                                <button onClick={() => handleEliminarAtado(a, i)} className="btn-eliminar">🗑️</button>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay pesajes cargados</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleReset} className="btn-reset">BORRAR TODO</button>
                    <button onClick={handleRegistrar} className="btn-registrar">CONFIRMAR REGISTRO</button>
                </div>
            </div>

            {showCalidad && (
                <CalidadModal
                    operacionId={lineaData?.Operacion_ID || operacionId}
                    lineaData={lineaData}
                    infoHeader={{
                        ancho: lineaData?.Ancho,
                        detalle: lineaData?.Cuchillas,
                        maquina: lineaData?.Maquina || 'SL2',
                        usuario: lineaData?.Usuario || '',
                        codigoProducto: codProd,
                        programados,
                        calidadKgs: peso,
                    }}
                    defectosIniciales={defectosCalidad}
                    onConfirm={handleCalidadConfirm}
                    onClose={() => setShowCalidad(false)}
                />
            )}
        </div>
    );
};

export default PesajeNormalModal;
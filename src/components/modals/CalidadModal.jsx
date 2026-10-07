// // src/components/modals/CalidadModal.jsx
// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './CalidadModal.css';

// // Mismos valores que el VB (cboGravedad / cboUbicacion)
// const GRAVEDADES = [
//     { cod: '0', texto: '[0, Sin Requerimiento]' },
//     { cod: '1', texto: '[1, Grave]' },
//     { cod: '2', texto: '[2, Moderado]' },
//     { cod: '3', texto: '[3, Leve]' },
// ];
// const UBICACIONES = [
//     { cod: '0', texto: '[1, Lado Operador]' },
//     { cod: '1', texto: '[2, Centro]' },
//     { cod: '2', texto: '[3, Lado Motor]' },
// ];

// const CalidadModal = ({
//     operacionId,
//     lineaData,
//     infoHeader,            // { ancho, detalle, maquina, usuario, codigoProducto, programados, calidadKgs }
//     defectosIniciales = [],
//     onConfirm,             // (defectos) => void  (el padre los guarda en memoria)
//     onClose,
// }) => {
//     const [defectosCombo, setDefectosCombo] = useState([]);
//     const [defectos, setDefectos] = useState(defectosIniciales);
//     const [selDefecto, setSelDefecto] = useState('');
//     const [selGravedad, setSelGravedad] = useState('');
//     const [selUbicacion, setSelUbicacion] = useState('');
//     const [nota, setNota] = useState('');

//     const defectoSel = defectosCombo.find(d => d.Codigo === selDefecto);
//     const esFDI = defectoSel?.Descripcion === 'Fuera de Diámetro';

//     // === CARGA INICIAL: combo de defectos + defectos ya registrados en BD ===
//     useEffect(() => {
//         const cargar = async () => {
//             try {
//                 const familia = (infoHeader?.codigoProducto || '').substring(8, 10);
//                 const res = await axiosInstance.get(`/registracion/calidad/defectos/${familia}`);
//                 const lista = Array.isArray(res.data) ? res.data : [];
//                 if (lista.length === 0) {
//                     Swal.fire('Advertencia', `No existen defectos para el material: ${familia}. AVISE A CALIDAD`, 'warning');
//                     onClose();
//                     return;
//                 }
//                 setDefectosCombo(lista);
//                 setSelDefecto(lista[0].Codigo);
//             } catch (e) {
//                 console.error(e);
//             }

//             // Si el padre no trae defectos en memoria, cargo los ya grabados en BD
//             if (defectosIniciales.length === 0) {
//                 try {
//                     const res = await axiosInstance.post('/registracion/calidad/obtener-slitter', {
//                         operacionId,
//                         loteIds: lineaData?.Lote_IDS,
//                         sobrante: 0,
//                         sobreorden: 0,
//                     });
//                     const regs = (Array.isArray(res.data) ? res.data : [])
//                         .filter(r => parseInt(r.Dictamen) === 0); // VB: solo Dictamen = 0
//                     if (regs.length > 0) {
//                         setDefectos(regs.map(r => ({
//                             codDefecto: r.Codigo,
//                             defecto: r.Descripcion,
//                             codGravedad: String(r.Gravedad),
//                             codUbicacion: String(r.Ubicacion),
//                             nota: r.Nota || '',
//                         })));
//                     }
//                 } catch (e) {
//                     console.warn('Sin calidad previa registrada', e);
//                 }
//             }
//         };
//         cargar();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     // VB: si elige "Fuera de Diámetro" se deshabilitan Gravedad y Ubicación
//     useEffect(() => {
//         if (esFDI) { setSelGravedad(''); setSelUbicacion(''); }
//     }, [esFDI]);

//     // === CONFIRMA DEFECTO (misma validación que btnConfirmaDefecto_Click) ===
//     const confirmarDefecto = () => {
//         if (!defectoSel) return;

//         if (!esFDI && (selGravedad === '' || selUbicacion === '')) {
//             return Swal.fire('Advertencia', 'Deben ingresar Gravedad y Ubicación', 'warning');
//         }
//         const hayFDIEnGrilla = defectos.some(d => d.defecto === 'Fuera de Diámetro');
//         if (esFDI && defectos.length > 0) {
//             return Swal.fire('Advertencia', 'Debe ingresar Fuera de diámetro o Defectos, no ambos', 'warning');
//         }
//         if (!esFDI && hayFDIEnGrilla) {
//             return Swal.fire('Advertencia', 'Debe ingresar Fuera de diámetro o Defectos, no ambos', 'warning');
//         }

//         const nuevo = esFDI
//             ? { codDefecto: defectoSel.Codigo, defecto: 'Fuera de Diámetro', codGravedad: '9', codUbicacion: '9', nota }
//             : { codDefecto: defectoSel.Codigo, defecto: defectoSel.Descripcion, codGravedad: selGravedad, codUbicacion: selUbicacion, nota };

//         setDefectos(prev => [...prev, nuevo]);
//         setSelGravedad('');
//         setSelUbicacion('');
//         setNota('');
//     };

//     // === MENÚ CONTEXTUAL DEL VB → botones Modificar / Borrar ===
//     const modificar = (index) => {
//         const d = defectos[index];
//         setSelDefecto(d.codDefecto);
//         if (d.defecto !== 'Fuera de Diámetro') {
//             setSelGravedad(d.codGravedad);
//             setSelUbicacion(d.codUbicacion);
//         }
//         setNota(d.nota || '');
//         setDefectos(prev => prev.filter((_, i) => i !== index)); // igual que VB: saca la fila y la sube al formulario
//     };

//     const borrar = (index) => {
//         setDefectos(prev => prev.filter((_, i) => i !== index));
//     };

//     // === CONFIRMA FINAL (btnConfirma_Click) ===
//     const confirmar = () => {
//         if (defectos.length === 0) {
//             return Swal.fire('Advertencia', 'No ha ingresado ningún Defecto', 'warning');
//         }
//         onConfirm(defectos);
//         onClose();
//     };

//     const textoGravedad = (d) =>
//         d.defecto === 'Fuera de Diámetro' ? '[No Corresponde]' : (GRAVEDADES.find(g => g.cod === d.codGravedad)?.texto || d.codGravedad);
//     const textoUbicacion = (d) =>
//         d.defecto === 'Fuera de Diámetro' ? '[No Corresponde]' : (UBICACIONES.find(u => u.cod === d.codUbicacion)?.texto || d.codUbicacion);

//     return (
//         <div className="calidad-modal-overlay">
//             <div className="calidad-modal">
//                 {/* ===== HEADER ===== */}
//                 <div className="calidad-header">
//                     <div className="ch-left"><em>REGISTRACION - Calidad</em></div>
//                     <div className="ch-center">
//                         <div>Ancho: {infoHeader?.ancho ?? ''}</div>
//                         <div>{infoHeader?.detalle ?? ''}</div>
//                         <div>{infoHeader?.maquina ?? ''} - CORTE</div>
//                     </div>
//                     <div className="ch-right">Usuario: {infoHeader?.usuario ?? ''}</div>
//                     <button className="btn-cerrar-puerta" onClick={onClose} title="Salir">&times;</button>
//                 </div>

//                 {/* ===== DATOS CORTE ===== */}
//                 <fieldset className="calidad-datos">
//                     <legend>Datos Corte</legend>
//                     <div className="datos-flex">
//                         <div>
//                             <strong>Kgs.Pgmados:</strong> {Number(infoHeader?.programados || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}<br />
//                             <strong>Kgs.Calidad:</strong> {Number(infoHeader?.calidadKgs || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
//                         </div>
//                         <div><strong>Cód.Prod:</strong> {infoHeader?.codigoProducto ?? ''}</div>
//                     </div>
//                 </fieldset>

//                 {/* ===== DEFECTOS ===== */}
//                 <fieldset className="calidad-defectos">
//                     <legend>Defectos</legend>
//                     <div className="defectos-form">
//                         <div className="col-combos">
//                             <label>Defecto</label>
//                             <select value={selDefecto} onChange={e => setSelDefecto(e.target.value)}>
//                                 {defectosCombo.map(d => (
//                                     <option key={d.Codigo} value={d.Codigo}>{d.Descripcion}</option>
//                                 ))}
//                             </select>
//                             <label>Gravedad</label>
//                             <select value={selGravedad} onChange={e => setSelGravedad(e.target.value)} disabled={esFDI}>
//                                 <option value=""></option>
//                                 {GRAVEDADES.map(g => <option key={g.cod} value={g.cod}>{g.texto}</option>)}
//                             </select>
//                             <label>Ubicación</label>
//                             <select value={selUbicacion} onChange={e => setSelUbicacion(e.target.value)} disabled={esFDI}>
//                                 <option value=""></option>
//                                 {UBICACIONES.map(u => <option key={u.cod} value={u.cod}>{u.texto}</option>)}
//                             </select>
//                         </div>
//                         <div className="col-nota">
//                             <label>Nota</label>
//                             <textarea value={nota} onChange={e => setNota(e.target.value)} />
//                         </div>
//                         <button className="btn-confirma-defecto" onClick={confirmarDefecto}>Confirma Defecto</button>
//                     </div>

//                     <div className="grilla-defectos">
//                         <table>
//                             <thead>
//                                 <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th>Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {defectos.length > 0 ? defectos.map((d, i) => (
//                                     <tr key={i}>
//                                         <td>{d.defecto}</td>
//                                         <td>{textoGravedad(d)}</td>
//                                         <td>{textoUbicacion(d)}</td>
//                                         <td>{d.nota}</td>
//                                         <td>
//                                             <button className="btn-mini" onClick={() => modificar(i)} title="Modificar">✏️</button>
//                                             <button className="btn-mini" onClick={() => borrar(i)} title="Borrar">🗑️</button>
//                                         </td>
//                                     </tr>
//                                 )) : (
//                                     <tr><td colSpan="5" style={{ textAlign: 'center' }}>Sin defectos cargados</td></tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     <div className="confirma-final">
//                         <button className="btn-confirma" onClick={confirmar}>CONFIRMA</button>
//                     </div>
//                 </fieldset>
//             </div>
//         </div>
//     );
// };

// export default CalidadModal;






























// // src/components/modals/CalidadModal.jsx
// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import '../PesajeModal.css';   // ✅ MISMO estilo que el pesaje normal
// import './CalidadModal.css';  // solo overlay apilado + formulario de defectos

// const GRAVEDADES = [
//     { cod: '0', texto: '[0, Sin Requerimiento]' },
//     { cod: '1', texto: '[1, Grave]' },
//     { cod: '2', texto: '[2, Moderado]' },
//     { cod: '3', texto: '[3, Leve]' },
// ];
// const UBICACIONES = [
//     { cod: '0', texto: '[1, Lado Operador]' },
//     { cod: '1', texto: '[2, Centro]' },
//     { cod: '2', texto: '[3, Lado Motor]' },
// ];

// const CalidadModal = ({
//     operacionId,
//     lineaData,
//     infoHeader,              // { ancho, detalle, maquina, usuario, codigoProducto, programados, calidadKgs }
//     defectosIniciales = [],
//     onConfirm,
//     onClose,
// }) => {
//     const [defectosCombo, setDefectosCombo] = useState([]);
//     const [defectos, setDefectos] = useState(defectosIniciales);
//     const [selDefecto, setSelDefecto] = useState('');
//     const [selGravedad, setSelGravedad] = useState('');
//     const [selUbicacion, setSelUbicacion] = useState('');
//     const [nota, setNota] = useState('');
//     const [codigoProducto, setCodigoProducto] = useState(infoHeader?.codigoProducto || '');
//     const [cargando, setCargando] = useState(true);

//     const defectoSel = defectosCombo.find(d => d.Codigo === selDefecto);
//     const esFDI = defectoSel?.Descripcion === 'Fuera de Diámetro';

//     // === CARGA INICIAL ===
//     useEffect(() => {
//         const cargar = async () => {
//             try {
//                 // ✅ SI el padre no pasó codigoProducto, lo busco en la BD (arregla combo vacío)
//                 let codProd = infoHeader?.codigoProducto || lineaData?.CodigoProducto || '';
//                 if (!codProd && operacionId) {
//                     const resInfo = await axiosInstance.get(`/registracion/calidad/info-operacion/${operacionId}`);
//                     codProd = resInfo.data?.Codigo_Producto || '';
//                 }
//                 setCodigoProducto(codProd);

//                 const familia = (codProd || '').substring(8, 10);
//                 const res = await axiosInstance.get(`/registracion/calidad/defectos/${familia}`);
//                 const lista = (Array.isArray(res.data) ? res.data : []).map(x => ({
//                     Codigo: x.Codigo ?? x.codigo,
//                     Descripcion: x.Descripcion ?? x.descripcion,
//                 }));
//                 if (lista.length === 0) {
//                     Swal.fire('Advertencia', `No existen defectos para el material: ${familia}. AVISE A CALIDAD`, 'warning');
//                     onClose();
//                     return;
//                 }
//                 setDefectosCombo(lista);
//                 setSelDefecto(lista[0].Codigo);
//             } catch (e) {
//                 console.error('Error cargando defectos:', e);
//             }

//             // Defectos ya registrados en BD (si el padre no trae nada en memoria)
//             if (defectosIniciales.length === 0) {
//                 try {
//                     const res = await axiosInstance.post('/registracion/calidad/obtener-slitter', {
//                         operacionId,
//                         loteIds: lineaData?.Lote_IDS,
//                         sobrante: 0,
//                         sobreorden: 0,
//                     });
//                     const regs = (Array.isArray(res.data) ? res.data : []).filter(r => parseInt(r.Dictamen) === 0);
//                     if (regs.length > 0) {
//                         setDefectos(regs.map(r => ({
//                             codDefecto: r.Codigo,
//                             defecto: r.Descripcion,
//                             codGravedad: String(r.Gravedad),
//                             codUbicacion: String(r.Ubicacion),
//                             nota: r.Nota || '',
//                         })));
//                     }
//                 } catch (e) { console.warn('Sin calidad previa registrada', e); }
//             }
//             setCargando(false);
//         };
//         cargar();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     // VB: con "Fuera de Diámetro" se deshabilitan Gravedad y Ubicación
//     useEffect(() => {
//         if (esFDI) { setSelGravedad(''); setSelUbicacion(''); }
//     }, [esFDI]);

//     // === CONFIRMA DEFECTO (mismas validaciones del VB) ===
//     const confirmarDefecto = () => {
//         if (!defectoSel) return;
//         if (!esFDI && (selGravedad === '' || selUbicacion === '')) {
//             return Swal.fire('Advertencia', 'Deben ingresar Gravedad y Ubicación', 'warning');
//         }
//         const hayFDIEnGrilla = defectos.some(d => d.defecto === 'Fuera de Diámetro');
//         if (esFDI && defectos.length > 0) {
//             return Swal.fire('Advertencia', 'Debe ingresar Fuera de diámetro o Defectos, no ambos', 'warning');
//         }
//         if (!esFDI && hayFDIEnGrilla) {
//             return Swal.fire('Advertencia', 'Debe ingresar Fuera de diámetro o Defectos, no ambos', 'warning');
//         }

//         const nuevo = esFDI
//             ? { codDefecto: defectoSel.Codigo, defecto: 'Fuera de Diámetro', codGravedad: '9', codUbicacion: '9', nota }
//             : { codDefecto: defectoSel.Codigo, defecto: defectoSel.Descripcion, codGravedad: selGravedad, codUbicacion: selUbicacion, nota };

//         setDefectos(prev => [...prev, nuevo]);
//         setSelGravedad('');
//         setSelUbicacion('');
//         setNota('');
//     };

//     const modificar = (index) => {
//         const d = defectos[index];
//         setSelDefecto(d.codDefecto);
//         if (d.defecto !== 'Fuera de Diámetro') {
//             setSelGravedad(d.codGravedad);
//             setSelUbicacion(d.codUbicacion);
//         }
//         setNota(d.nota || '');
//         setDefectos(prev => prev.filter((_, i) => i !== index));
//     };

//     const borrar = (index) => {
//         setDefectos(prev => prev.filter((_, i) => i !== index));
//     };

//     const confirmar = () => {
//         if (defectos.length === 0) {
//             return Swal.fire('Advertencia', 'No ha ingresado ningún Defecto', 'warning');
//         }
//         onConfirm(defectos);
//         onClose();
//     };

//     const textoGravedad = (d) =>
//         d.defecto === 'Fuera de Diámetro' ? '[No Corresponde]' : (GRAVEDADES.find(g => g.cod === d.codGravedad)?.texto || d.codGravedad);
//     const textoUbicacion = (d) =>
//         d.defecto === 'Fuera de Diámetro' ? '[No Corresponde]' : (UBICACIONES.find(u => u.cod === d.codUbicacion)?.texto || d.codUbicacion);

//     return (
//         // ✅ Overlay APILADO y semitransparente: el pesaje queda visible detrás
//         <div className="pesaje-modal-overlay calidad-overlay">
//             <div className="pesaje-modal">
//                 <div className="modal-header">
//                     <h3>REGISTRACION - Calidad</h3>
//                     <button onClick={onClose}>&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="info-panel">
//                         <div>Ancho: {infoHeader?.ancho ?? ''} | {infoHeader?.detalle ?? ''}</div>
//                         <div>{infoHeader?.maquina ?? ''} - CORTE | Usuario: {infoHeader?.usuario ?? ''}</div>
//                         <div>Kgs.Pgmados: {Number(infoHeader?.programados || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
//                         <div>Kgs.Calidad: {Number(infoHeader?.calidadKgs || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
//                         <div>Cód.Prod: {codigoProducto || 'N/A'}</div>
//                     </div>

//                     {/* <div className="pesaje-section">
//                         <div className="defectos-form">
//                             <div className="defectos-col-combos">
//                                 <label>Defecto</label>
//                                 <select value={selDefecto} onChange={e => setSelDefecto(e.target.value)} disabled={cargando}>
//                                     {defectosCombo.map(d => (
//                                         <option key={d.Codigo} value={d.Codigo}>{d.Descripcion}</option>
//                                     ))}
//                                 </select>
//                                 <label>Gravedad</label>
//                                 <select value={selGravedad} onChange={e => setSelGravedad(e.target.value)} disabled={esFDI || cargando}>
//                                     <option value=""></option>
//                                     {GRAVEDADES.map(g => <option key={g.cod} value={g.cod}>{g.texto}</option>)}
//                                 </select>
//                                 <label>Ubicación</label>
//                                 <select value={selUbicacion} onChange={e => setSelUbicacion(e.target.value)} disabled={esFDI || cargando}>
//                                     <option value=""></option>
//                                     {UBICACIONES.map(u => <option key={u.cod} value={u.cod}>{u.texto}</option>)}
//                                 </select>
//                             </div>
//                             <div className="defectos-col-nota">
//                                 <label>Nota</label>
//                                 <textarea value={nota} onChange={e => setNota(e.target.value)} />
//                             </div>
//                             <button className="btn-calidad" onClick={confirmarDefecto}>Confirma Defecto</button>
//                         </div>
//                     </div> */}









//                     <div className="pesaje-section">
//                         <div className="defectos-form">
//                             <div className="defectos-col-combos">
//                                 <label>Defecto</label>
//                                 <select value={selDefecto} onChange={e => setSelDefecto(e.target.value)} disabled={cargando}>
//                                     {defectosCombo.map(d => (
//                                         <option key={d.Codigo} value={d.Codigo}>{d.Descripcion}</option>
//                                     ))}
//                                 </select>
//                                 <label>Gravedad</label>
//                                 <select value={selGravedad} onChange={e => setSelGravedad(e.target.value)} disabled={esFDI || cargando}>
//                                     <option value=""></option>
//                                     {GRAVEDADES.map(g => <option key={g.cod} value={g.cod}>{g.texto}</option>)}
//                                 </select>
//                                 <label>Ubicación</label>
//                                 <select value={selUbicacion} onChange={e => setSelUbicacion(e.target.value)} disabled={esFDI || cargando}>
//                                     <option value=""></option>
//                                     {UBICACIONES.map(u => <option key={u.cod} value={u.cod}>{u.texto}</option>)}
//                                 </select>
//                             </div>

//                             {/* ✅ NOTA ANCHA + BOTÓN DEBAJO */}
//                             <div className="defectos-col-nota">
//                                 <div className="nota-row">
//                                     <label>Nota</label>
//                                     <textarea value={nota} onChange={e => setNota(e.target.value)} />
//                                 </div>
//                                 <button className="btn-calidad btn-confirma-defecto" onClick={confirmarDefecto}>
//                                     Confirma Defecto
//                                 </button>
//                             </div>
//                         </div>
//                     </div>



//                     <div className="grilla-atados">
//                         <h4>Defectos</h4>
//                         <table>
//                             <thead>
//                                 <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th>Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {defectos.length > 0 ? defectos.map((d, i) => (
//                                     <tr key={i}>
//                                         <td>{d.defecto}</td>
//                                         <td>{textoGravedad(d)}</td>
//                                         <td>{textoUbicacion(d)}</td>
//                                         <td>{d.nota}</td>
//                                         <td className="acciones-atado">
//                                             <button onClick={() => modificar(i)} title="Modificar">✏️</button>
//                                             <button onClick={() => borrar(i)} title="Borrar">🗑️</button>
//                                         </td>
//                                     </tr>
//                                 )) : (
//                                     <tr><td colSpan="5" style={{ textAlign: 'center' }}>Sin defectos cargados</td></tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//                 <div className="modal-footer">
//                     <button onClick={onClose} className="btn-reset">CANCELAR</button>
//                     <button onClick={confirmar} className="btn-registrar">CONFIRMA</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CalidadModal;




























// // src/components/modals/CalidadModal.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import { useAuth } from '../../context/AuthContext';   // ✅ NUEVO: para el usuario logueado
// import '../PesajeModal.css';
// import './CalidadModal.css';

// const GRAVEDADES = [
//     { cod: '0', texto: '[0, Sin Requerimiento]' },
//     { cod: '1', texto: '[1, Grave]' },
//     { cod: '2', texto: '[2, Moderado]' },
//     { cod: '3', texto: '[3, Leve]' },
// ];
// const UBICACIONES = [
//     { cod: '0', texto: '[1, Lado Operador]' },
//     { cod: '1', texto: '[2, Centro]' },
//     { cod: '2', texto: '[3, Lado Motor]' },
// ];

// const CalidadModal = ({
//     operacionId,
//     lineaData,
//     infoHeader,
//     defectosIniciales = [],
//     onConfirm,
//     onClose,
// }) => {
//     const { user } = useAuth(); // ✅ usuario logueado
//     const usuarioActual = useMemo(() => {
//         if (!user) return 'admin';
//         if (typeof user === 'string') return user;
//         return user?.username || user?.nombre || user?.userName || user?.name || 'admin';
//     }, [user]);

//     const [defectosCombo, setDefectosCombo] = useState([]);
//     const [defectos, setDefectos] = useState(defectosIniciales);
//     const [selDefecto, setSelDefecto] = useState('');
//     const [selGravedad, setSelGravedad] = useState('');
//     const [selUbicacion, setSelUbicacion] = useState('');
//     const [nota, setNota] = useState('');
//     const [codigoProducto, setCodigoProducto] = useState(infoHeader?.codigoProducto || '');
//     const [cargando, setCargando] = useState(true);
//     const [guardando, setGuardando] = useState(false); // ✅ evita doble click

//     const defectoSel = defectosCombo.find(d => d.Codigo === selDefecto);
//     const esFDI = defectoSel?.Descripcion === 'Fuera de Diámetro';

//     // === CARGA INICIAL ===
//     useEffect(() => {
//         const cargar = async () => {
//             try {
//                 let codProd = infoHeader?.codigoProducto || lineaData?.CodigoProducto || '';
//                 if (!codProd && operacionId) {
//                     const resInfo = await axiosInstance.get(`/registracion/calidad/info-operacion/${operacionId}`);
//                     codProd = resInfo.data?.Codigo_Producto || '';
//                 }
//                 setCodigoProducto(codProd);

//                 const familia = (codProd || '').substring(8, 10);
//                 const res = await axiosInstance.get(`/registracion/calidad/defectos/${familia}`);
//                 const lista = (Array.isArray(res.data) ? res.data : []).map(x => ({
//                     Codigo: x.Codigo ?? x.codigo,
//                     Descripcion: x.Descripcion ?? x.descripcion,
//                 }));
//                 if (lista.length === 0) {
//                     Swal.fire('Advertencia', `No existen defectos para el material: ${familia}. AVISE A CALIDAD`, 'warning');
//                     onClose();
//                     return;
//                 }
//                 setDefectosCombo(lista);
//                 setSelDefecto(lista[0].Codigo);
//             } catch (e) {
//                 console.error('Error cargando defectos:', e);
//             }

//             if (defectosIniciales.length === 0) {
//                 try {
//                     const res = await axiosInstance.post('/registracion/calidad/obtener-slitter', {
//                         operacionId,
//                         loteIds: lineaData?.Lote_IDS,
//                         sobrante: 0,
//                         sobreorden: 0,
//                     });
//                     const regs = (Array.isArray(res.data) ? res.data : []).filter(r => parseInt(r.Dictamen) === 0);
//                     if (regs.length > 0) {
//                         setDefectos(regs.map(r => ({
//                             codDefecto: r.Codigo,
//                             defecto: r.Descripcion,
//                             codGravedad: String(r.Gravedad),
//                             codUbicacion: String(r.Ubicacion),
//                             nota: r.Nota || '',
//                         })));
//                     }
//                 } catch (e) { console.warn('Sin calidad previa registrada', e); }
//             }
//             setCargando(false);
//         };
//         cargar();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     useEffect(() => {
//         if (esFDI) { setSelGravedad(''); setSelUbicacion(''); }
//     }, [esFDI]);

//     const confirmarDefecto = () => {
//         if (!defectoSel) return;
//         if (!esFDI && (selGravedad === '' || selUbicacion === '')) {
//             return Swal.fire('Advertencia', 'Deben ingresar Gravedad y Ubicación', 'warning');
//         }
//         const hayFDIEnGrilla = defectos.some(d => d.defecto === 'Fuera de Diámetro');
//         if (esFDI && defectos.length > 0) {
//             return Swal.fire('Advertencia', 'Debe ingresar Fuera de diámetro o Defectos, no ambos', 'warning');
//         }
//         if (!esFDI && hayFDIEnGrilla) {
//             return Swal.fire('Advertencia', 'Debe ingresar Fuera de diámetro o Defectos, no ambos', 'warning');
//         }

//         const nuevo = esFDI
//             ? { codDefecto: defectoSel.Codigo, defecto: 'Fuera de Diámetro', codGravedad: '9', codUbicacion: '9', nota }
//             : { codDefecto: defectoSel.Codigo, defecto: defectoSel.Descripcion, codGravedad: selGravedad, codUbicacion: selUbicacion, nota };

//         setDefectos(prev => [...prev, nuevo]);
//         setSelGravedad('');
//         setSelUbicacion('');
//         setNota('');
//     };

//     const modificar = (index) => {
//         const d = defectos[index];
//         setSelDefecto(d.codDefecto);
//         if (d.defecto !== 'Fuera de Diámetro') {
//             setSelGravedad(d.codGravedad);
//             setSelUbicacion(d.codUbicacion);
//         }
//         setNota(d.nota || '');
//         setDefectos(prev => prev.filter((_, i) => i !== index));
//     };

//     const borrar = (index) => {
//         setDefectos(prev => prev.filter((_, i) => i !== index));
//     };

//     // ✅ CONFIRMA FINAL: GUARDA DIRECTO EN LA BD (igual que el VB)
//     const confirmar = async () => {
//         if (defectos.length === 0) {
//             return Swal.fire('Advertencia', 'No ha ingresado ningún Defecto', 'warning');
//         }
//         setGuardando(true);
//         try {
//             await axiosInstance.post('/registracion/calidad/guardar-slitter', {
//                 operacionId,
//                 loteIds: lineaData?.Lote_IDS,
//                 sobrante: 0,
//                 sobreorden: 0,
//                 defectos,
//                 usuario: usuarioActual, // ✅ usuario logueado
//             });
//             Swal.fire('Éxito', 'Defectos guardados correctamente', 'success');
//             onConfirm(defectos); // avisa al padre (por si quiere reflejarlo en memoria)
//             onClose();
//         } catch (e) {
//             console.error('Error guardando defectos:', e);
//             Swal.fire('Error',
//                 'No se pudieron guardar los defectos: ' + (e.response?.data?.error || e.message),
//                 'error');
//         } finally {
//             setGuardando(false);
//         }
//     };

//     const textoGravedad = (d) =>
//         d.defecto === 'Fuera de Diámetro' ? '[No Corresponde]' : (GRAVEDADES.find(g => g.cod === d.codGravedad)?.texto || d.codGravedad);
//     const textoUbicacion = (d) =>
//         d.defecto === 'Fuera de Diámetro' ? '[No Corresponde]' : (UBICACIONES.find(u => u.cod === d.codUbicacion)?.texto || d.codUbicacion);

//     return (
//         <div className="pesaje-modal-overlay calidad-overlay">
//             <div className="pesaje-modal">
//                 <div className="modal-header">
//                     <h3>REGISTRACION - Calidad</h3>
//                     <button onClick={onClose} disabled={guardando}>&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="info-panel">
//                         <div>Ancho: {infoHeader?.ancho ?? ''} | {infoHeader?.detalle ?? ''}</div>
//                         <div>{infoHeader?.maquina ?? ''} - CORTE | Usuario: {usuarioActual}</div>
//                         <div>Kgs.Pgmados: {Number(infoHeader?.programados || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
//                         <div>Kgs.Calidad: {Number(infoHeader?.calidadKgs || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
//                         <div>Cód.Prod: {codigoProducto || 'N/A'}</div>
//                     </div>

//                     <div className="pesaje-section">
//                         <div className="defectos-form">
//                             <div className="defectos-col-combos">
//                                 <label>Defecto</label>
//                                 <select value={selDefecto} onChange={e => setSelDefecto(e.target.value)} disabled={cargando}>
//                                     {defectosCombo.map(d => (
//                                         <option key={d.Codigo} value={d.Codigo}>{d.Descripcion}</option>
//                                     ))}
//                                 </select>
//                                 <label>Gravedad</label>
//                                 <select value={selGravedad} onChange={e => setSelGravedad(e.target.value)} disabled={esFDI || cargando}>
//                                     <option value=""></option>
//                                     {GRAVEDADES.map(g => <option key={g.cod} value={g.cod}>{g.texto}</option>)}
//                                 </select>
//                                 <label>Ubicación</label>
//                                 <select value={selUbicacion} onChange={e => setSelUbicacion(e.target.value)} disabled={esFDI || cargando}>
//                                     <option value=""></option>
//                                     {UBICACIONES.map(u => <option key={u.cod} value={u.cod}>{u.texto}</option>)}
//                                 </select>
//                             </div>

//                             <div className="defectos-col-nota">
//                                 <div className="nota-row">
//                                     <label>Nota</label>
//                                     <textarea value={nota} onChange={e => setNota(e.target.value)} />
//                                 </div>
//                                 <button className="btn-calidad btn-confirma-defecto" onClick={confirmarDefecto} disabled={cargando}>
//                                     Confirma Defecto
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="grilla-atados">
//                         <h4>Defectos</h4>
//                         <table>
//                             <thead>
//                                 <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th>Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {defectos.length > 0 ? defectos.map((d, i) => (
//                                     <tr key={i}>
//                                         <td>{d.defecto}</td>
//                                         <td>{textoGravedad(d)}</td>
//                                         <td>{textoUbicacion(d)}</td>
//                                         <td>{d.nota}</td>
//                                         <td className="acciones-atado">
//                                             <button onClick={() => modificar(i)} title="Modificar" disabled={guardando}>✏️</button>
//                                             <button onClick={() => borrar(i)} title="Borrar" disabled={guardando}>🗑️</button>
//                                         </td>
//                                     </tr>
//                                 )) : (
//                                     <tr><td colSpan="5" style={{ textAlign: 'center' }}>Sin defectos cargados</td></tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//                 <div className="modal-footer">
//                     <button onClick={onClose} className="btn-reset" disabled={guardando}>CANCELAR</button>
//                     <button onClick={confirmar} className="btn-registrar" disabled={guardando}>
//                         {guardando ? 'Guardando...' : 'CONFIRMA'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CalidadModal;


































































// // src/components/modals/CalidadModal.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import { useAuth } from '../../context/AuthContext';
// import '../PesajeModal.css';
// import './CalidadModal.css';

// const GRAVEDADES = [
//     { cod: '0', texto: '[0, Sin Requerimiento]' },
//     { cod: '1', texto: '[1, Grave]' },
//     { cod: '2', texto: '[2, Moderado]' },
//     { cod: '3', texto: '[3, Leve]' },
// ];
// const UBICACIONES = [
//     { cod: '0', texto: '[1, Lado Operador]' },
//     { cod: '1', texto: '[2, Centro]' },
//     { cod: '2', texto: '[3, Lado Motor]' },
// ];

// // ============================================================================
// // ✅ ENDPOINTS CENTRALIZADOS
// //    - Slitter  : registracionController (SP_TraerCalidad / SP_InsertarCalidad)
// //    - Embalaje : LECTURA en registracionController (SP_TraerCalidadPlancha)
// //                 y GUARDADO en calidadController (SP_EliminarCalidadPlancha de 5 params
// //                 + SP_EditarAtadosRegistradosPlanchaCalidad + SP_InsertarCalidadPlancha)
// //      ⚠️ '/registracion/calidad/guardar' NO se usa más: es la versión vieja de 4 params
// //         que rompía con "expects parameter '@ID_LotePlancha'".
// // ============================================================================
// const ENDPOINTS = {
//     defectos: (familia) => `/registracion/calidad/defectos/${familia}`,
//     infoOperacion: (id) => `/registracion/calidad/info-operacion/${id}`,
//     obtenerSlitter: '/registracion/calidad/obtener-slitter',
//     guardarSlitter: '/registracion/calidad/guardar-slitter',
//     obtenerEmbalaje: '/registracion/calidad/obtener',
//     guardarEmbalaje: '/calidad/guardar',   // ✅ calidadController.guardarCalidad (5 params)
// };

// /**
//  * flujo: 'slitter'  → guarda con SP_TraerCalidad / SP_InsertarCalidad (lote = Lote_IDS)
//  *        'embalaje' → guarda con SP_InsertarCalidadPlancha (lote = ID_LotePlancha = lineaData.Lote_IDS)
//  */
// const CalidadModal = ({
//     operacionId,
//     lineaData,
//     infoHeader,
//     defectosIniciales = [],
//     onConfirm,
//     onClose,
//     flujo = 'slitter',
// }) => {
//     const { user } = useAuth();
//     const usuarioActual = useMemo(() => {
//         if (!user) return 'admin';
//         if (typeof user === 'string') return user;
//         return user?.username || user?.nombre || user?.userName || user?.name || 'admin';
//     }, [user]);

//     const [defectosCombo, setDefectosCombo] = useState([]);
//     const [defectos, setDefectos] = useState(defectosIniciales);
//     const [selDefecto, setSelDefecto] = useState('');
//     const [selGravedad, setSelGravedad] = useState('');
//     const [selUbicacion, setSelUbicacion] = useState('');
//     const [nota, setNota] = useState('');
//     const [codigoProducto, setCodigoProducto] = useState(infoHeader?.codigoProducto || '');
//     const [cargando, setCargando] = useState(true);
//     const [guardando, setGuardando] = useState(false);

//     const defectoSel = defectosCombo.find(d => d.Codigo === selDefecto);
//     const esFDI = defectoSel?.Descripcion === 'Fuera de Diámetro';

//     // === CARGA INICIAL ===
//     useEffect(() => {
//         const cargar = async () => {
//             try {
//                 let codProd = infoHeader?.codigoProducto || lineaData?.CodigoProducto || '';
//                 if (!codProd && operacionId) {
//                     const resInfo = await axiosInstance.get(ENDPOINTS.infoOperacion(operacionId));
//                     codProd = resInfo.data?.Codigo_Producto || '';
//                 }
//                 setCodigoProducto(codProd);

//                 const familia = (codProd || '').substring(8, 10);
//                 const res = await axiosInstance.get(ENDPOINTS.defectos(familia));
//                 const lista = (Array.isArray(res.data) ? res.data : []).map(x => ({
//                     Codigo: x.Codigo ?? x.codigo,
//                     Descripcion: x.Descripcion ?? x.descripcion,
//                 }));
//                 if (lista.length === 0) {
//                     Swal.fire('Advertencia', `No existen defectos para el material: ${familia}. AVISE A CALIDAD`, 'warning');
//                     onClose();
//                     return;
//                 }
//                 setDefectosCombo(lista);
//                 setSelDefecto(lista[0].Codigo);
//             } catch (e) {
//                 console.error('Error cargando defectos:', e);
//             }

//             // ✅ Cargar defectos pendientes (Dictamen = 0) según el flujo
//             if (defectosIniciales.length === 0) {
//                 try {
//                     let regs = [];
//                     if (flujo === 'embalaje') {
//                         const res = await axiosInstance.post(ENDPOINTS.obtenerEmbalaje, {
//                             operacionId,
//                             itemPedidoId: lineaData?.ItemPedido_ID || '',
//                             numeroItem: parseInt(lineaData?.NumeroItem) || 0,
//                             sobrante: 0,
//                             idLotePlancha: lineaData?.Lote_IDS || '',   // info extra (no molesta al SP)
//                         });
//                         regs = Array.isArray(res.data) ? res.data : [];
//                     } else {
//                         const res = await axiosInstance.post(ENDPOINTS.obtenerSlitter, {
//                             operacionId,
//                             loteIds: lineaData?.Lote_IDS,
//                             sobrante: 0,
//                             sobreorden: 0,
//                         });
//                         regs = Array.isArray(res.data) ? res.data : [];
//                     }
//                     const pendientes = regs.filter(r => parseInt(r.Dictamen) === 0);
//                     if (pendientes.length > 0) {
//                         setDefectos(pendientes.map(r => ({
//                             codDefecto: r.Codigo,
//                             defecto: r.Descripcion,
//                             codGravedad: String(r.Gravedad),
//                             codUbicacion: String(r.Ubicacion),
//                             nota: r.Nota || '',
//                         })));
//                     }
//                 } catch (e) { console.warn('Sin calidad previa registrada', e); }
//             }
//             setCargando(false);
//         };
//         cargar();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     useEffect(() => {
//         if (esFDI) { setSelGravedad(''); setSelUbicacion(''); }
//     }, [esFDI]);

//     const confirmarDefecto = () => {
//         if (!defectoSel) return;
//         if (!esFDI && (selGravedad === '' || selUbicacion === '')) {
//             return Swal.fire('Advertencia', 'Deben ingresar Gravedad y Ubicación', 'warning');
//         }
//         const hayFDIEnGrilla = defectos.some(d => d.defecto === 'Fuera de Diámetro');
//         if (esFDI && defectos.length > 0) {
//             return Swal.fire('Advertencia', 'Debe ingresar Fuera de diámetro o Defectos, no ambos', 'warning');
//         }
//         if (!esFDI && hayFDIEnGrilla) {
//             return Swal.fire('Advertencia', 'Debe ingresar Fuera de diámetro o Defectos, no ambos', 'warning');
//         }

//         const nuevo = esFDI
//             ? { codDefecto: defectoSel.Codigo, defecto: 'Fuera de Diámetro', codGravedad: '9', codUbicacion: '9', nota }
//             : { codDefecto: defectoSel.Codigo, defecto: defectoSel.Descripcion, codGravedad: selGravedad, codUbicacion: selUbicacion, nota };

//         setDefectos(prev => [...prev, nuevo]);
//         setSelGravedad('');
//         setSelUbicacion('');
//         setNota('');
//     };

//     const modificar = (index) => {
//         const d = defectos[index];
//         setSelDefecto(d.codDefecto);
//         if (d.defecto !== 'Fuera de Diámetro') {
//             setSelGravedad(d.codGravedad);
//             setSelUbicacion(d.codUbicacion);
//         }
//         setNota(d.nota || '');
//         setDefectos(prev => prev.filter((_, i) => i !== index));
//     };

//     const borrar = (index) => {
//         setDefectos(prev => prev.filter((_, i) => i !== index));
//     };

//     // ✅ CONFIRMA FINAL: guarda en BD según flujo y avisa al padre
//     const confirmar = async () => {
//         if (defectos.length === 0) {
//             return Swal.fire('Advertencia', 'No ha ingresado ningún Defecto', 'warning');
//         }
//         setGuardando(true);
//         try {
//             if (flujo === 'embalaje') {
//                 // ✅ calidadController.guardarCalidad:
//                 //    SP_EliminarCalidadPlancha (5 params, con @ID_LotePlancha)
//                 //    + SP_EditarAtadosRegistradosPlanchaCalidad
//                 //    + SP_InsertarCalidadPlancha (15 params)
//                 await axiosInstance.post(ENDPOINTS.guardarEmbalaje, {
//                     operacionId,
//                     itemPedidoId: lineaData?.ItemPedido_ID || '',
//                     numeroItem: parseInt(lineaData?.NumeroItem) || 0,
//                     sobrante: 0,
//                     lineaData: {
//                         ...lineaData,
//                         // Lote_IDS = ID_LotePlancha del paquete (lo usa como @ID_LotePlancha)
//                         CodigoProducto: codigoProducto || lineaData?.CodigoProducto || '',
//                     },
//                     defectos,
//                     usuario: usuarioActual,
//                 });
//             } else {
//                 // ✅ registracionController.guardarCalidadSlitter (rama slitter del VB)
//                 await axiosInstance.post(ENDPOINTS.guardarSlitter, {
//                     operacionId,
//                     loteIds: lineaData?.Lote_IDS,
//                     sobrante: 0,
//                     sobreorden: 0,
//                     defectos,
//                     usuario: usuarioActual,
//                 });
//             }
//             Swal.fire('Éxito', 'Defectos guardados correctamente', 'success');
//             onConfirm(defectos);
//             onClose();
//         } catch (e) {
//             console.error('Error guardando defectos:', e);
//             Swal.fire('Error', 'No se pudieron guardar los defectos: ' + (e.response?.data?.error || e.message), 'error');
//         } finally {
//             setGuardando(false);
//         }
//     };

//     const textoGravedad = (d) =>
//         d.defecto === 'Fuera de Diámetro' ? '[No Corresponde]' : (GRAVEDADES.find(g => g.cod === d.codGravedad)?.texto || d.codGravedad);
//     const textoUbicacion = (d) =>
//         d.defecto === 'Fuera de Diámetro' ? '[No Corresponde]' : (UBICACIONES.find(u => u.cod === d.codUbicacion)?.texto || d.codUbicacion);

//     return (
//         <div className="pesaje-modal-overlay calidad-overlay">
//             <div className="pesaje-modal">
//                 <div className="modal-header">
//                     <h3>REGISTRACION - Calidad</h3>
//                     <button onClick={onClose} disabled={guardando}>&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="info-panel">
//                         <div>Ancho: {infoHeader?.ancho ?? ''} | {infoHeader?.detalle ?? ''}</div>
//                         <div>{infoHeader?.maquina ?? ''} - CORTE | Usuario: {usuarioActual}</div>
//                         <div>Kgs.Pgmados: {Number(infoHeader?.programados || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
//                         <div>Kgs.Calidad: {Number(infoHeader?.calidadKgs || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
//                         <div>Cód.Prod: {codigoProducto || 'N/A'}</div>
//                     </div>

//                     <div className="pesaje-section">
//                         <div className="defectos-form">
//                             <div className="defectos-col-combos">
//                                 <label>Defecto</label>
//                                 <select value={selDefecto} onChange={e => setSelDefecto(e.target.value)} disabled={cargando}>
//                                     {defectosCombo.map(d => (
//                                         <option key={d.Codigo} value={d.Codigo}>{d.Descripcion}</option>
//                                     ))}
//                                 </select>
//                                 <label>Gravedad</label>
//                                 <select value={selGravedad} onChange={e => setSelGravedad(e.target.value)} disabled={esFDI || cargando}>
//                                     <option value=""></option>
//                                     {GRAVEDADES.map(g => <option key={g.cod} value={g.cod}>{g.texto}</option>)}
//                                 </select>
//                                 <label>Ubicación</label>
//                                 <select value={selUbicacion} onChange={e => setSelUbicacion(e.target.value)} disabled={esFDI || cargando}>
//                                     <option value=""></option>
//                                     {UBICACIONES.map(u => <option key={u.cod} value={u.cod}>{u.texto}</option>)}
//                                 </select>
//                             </div>

//                             <div className="defectos-col-nota">
//                                 <div className="nota-row">
//                                     <label>Nota</label>
//                                     <textarea value={nota} onChange={e => setNota(e.target.value)} />
//                                 </div>
//                                 <button className="btn-calidad btn-confirma-defecto" onClick={confirmarDefecto} disabled={cargando}>
//                                     Confirma Defecto
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="grilla-atados">
//                         <h4>Defectos</h4>
//                         <table>
//                             <thead>
//                                 <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th>Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {defectos.length > 0 ? defectos.map((d, i) => (
//                                     <tr key={i}>
//                                         <td>{d.defecto}</td>
//                                         <td>{textoGravedad(d)}</td>
//                                         <td>{textoUbicacion(d)}</td>
//                                         <td>{d.nota}</td>
//                                         <td className="acciones-atado">
//                                             <button onClick={() => modificar(i)} title="Modificar" disabled={guardando}>✏️</button>
//                                             <button onClick={() => borrar(i)} title="Borrar" disabled={guardando}>🗑️</button>
//                                         </td>
//                                     </tr>
//                                 )) : (
//                                     <tr><td colSpan="5" style={{ textAlign: 'center' }}>Sin defectos cargados</td></tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//                 <div className="modal-footer">
//                     <button onClick={onClose} className="btn-reset" disabled={guardando}>CANCELAR</button>
//                     <button onClick={confirmar} className="btn-registrar" disabled={guardando}>
//                         {guardando ? 'Guardando...' : 'CONFIRMA'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CalidadModal;
















































// // src/components/modals/CalidadModal.jsx
// import React, { useState, useEffect, useMemo } from 'react';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import { useAuth } from '../../context/AuthContext';
// import '../PesajeModal.css';
// import './CalidadModal.css';

// const GRAVEDADES = [
//     { cod: '0', texto: '[0, Sin Requerimiento]' },
//     { cod: '1', texto: '[1, Grave]' },
//     { cod: '2', texto: '[2, Moderado]' },
//     { cod: '3', texto: '[3, Leve]' },
// ];
// const UBICACIONES = [
//     { cod: '0', texto: '[1, Lado Operador]' },
//     { cod: '1', texto: '[2, Centro]' },
//     { cod: '2', texto: '[3, Lado Motor]' },
// ];

// const ENDPOINTS = {
//     defectos: (familia) => `/registracion/calidad/defectos/${familia}`,
//     infoOperacion: (id) => `/registracion/calidad/info-operacion/${id}`,
//     obtenerSlitter: '/registracion/calidad/obtener-slitter',
//     guardarSlitter: '/registracion/calidad/guardar-slitter',
//     obtenerEmbalaje: '/registracion/calidad/obtener',
//     guardarEmbalaje: '/calidad/guardar',
//     eliminarDefecto: '/calidad/eliminar-defecto',   // ✅ NUEVO: borrado directo de la fila
// };

// const CalidadModal = ({
//     operacionId,
//     lineaData,
//     infoHeader,
//     defectosIniciales = [],
//     onConfirm,
//     onClose,
//     flujo = 'slitter',
// }) => {
//     const { user } = useAuth();
//     const usuarioActual = useMemo(() => {
//         if (!user) return 'admin';
//         if (typeof user === 'string') return user;
//         return user?.username || user?.nombre || user?.userName || user?.name || 'admin';
//     }, [user]);

//     const [defectosCombo, setDefectosCombo] = useState([]);
//     const [defectos, setDefectos] = useState(defectosIniciales);
//     const [selDefecto, setSelDefecto] = useState('');
//     const [selGravedad, setSelGravedad] = useState('');
//     const [selUbicacion, setSelUbicacion] = useState('');
//     const [nota, setNota] = useState('');
//     const [codigoProducto, setCodigoProducto] = useState(infoHeader?.codigoProducto || '');
//     const [cargando, setCargando] = useState(true);
//     const [guardando, setGuardando] = useState(false);

//     const defectoSel = defectosCombo.find(d => d.Codigo === selDefecto);
//     const esFDI = defectoSel?.Descripcion === 'Fuera de Diámetro';

//     // === CARGA INICIAL ===
//     useEffect(() => {
//         const cargar = async () => {
//             try {
//                 let codProd = infoHeader?.codigoProducto || lineaData?.CodigoProducto || '';
//                 if (!codProd && operacionId) {
//                     const resInfo = await axiosInstance.get(ENDPOINTS.infoOperacion(operacionId));
//                     codProd = resInfo.data?.Codigo_Producto || '';
//                 }
//                 setCodigoProducto(codProd);

//                 const familia = (codProd || '').substring(8, 10);
//                 const res = await axiosInstance.get(ENDPOINTS.defectos(familia));
//                 const lista = (Array.isArray(res.data) ? res.data : []).map(x => ({
//                     Codigo: x.Codigo ?? x.codigo,
//                     Descripcion: x.Descripcion ?? x.descripcion,
//                 }));
//                 if (lista.length === 0) {
//                     Swal.fire('Advertencia', `No existen defectos para el material: ${familia}. AVISE A CALIDAD`, 'warning');
//                     onClose();
//                     return;
//                 }
//                 setDefectosCombo(lista);
//                 setSelDefecto(lista[0].Codigo);
//             } catch (e) {
//                 console.error('Error cargando defectos:', e);
//             }

//             // ✅ Cargar defectos pendientes (Dictamen = 0) CONSU ID DE FILA (para el 🗑️)
//             if (defectosIniciales.length === 0) {
//                 try {
//                     let regs = [];
//                     if (flujo === 'embalaje') {
//                         const res = await axiosInstance.post(ENDPOINTS.obtenerEmbalaje, {
//                             operacionId,
//                             itemPedidoId: lineaData?.ItemPedido_ID || '',
//                             numeroItem: parseInt(lineaData?.NumeroItem) || 0,
//                             sobrante: 0,
//                             idLotePlancha: lineaData?.Lote_IDS || '',
//                         });
//                         regs = Array.isArray(res.data) ? res.data : [];
//                     } else {
//                         const res = await axiosInstance.post(ENDPOINTS.obtenerSlitter, {
//                             operacionId,
//                             loteIds: lineaData?.Lote_IDS,
//                             sobrante: 0,
//                             sobreorden: 0,
//                         });
//                         regs = Array.isArray(res.data) ? res.data : [];
//                     }
//                     const pendientes = regs.filter(r => parseInt(r.Dictamen) === 0);
//                     if (pendientes.length > 0) {
//                         setDefectos(pendientes.map(r => ({
//                             id: r.ID ?? r.Id ?? null,          // ✅ ID de la fila en Calidad/CalidadPlancha
//                             codDefecto: r.Codigo,
//                             defecto: r.Descripcion,
//                             codGravedad: String(r.Gravedad),
//                             codUbicacion: String(r.Ubicacion),
//                             nota: r.Nota || '',
//                         })));
//                     }
//                 } catch (e) { console.warn('Sin calidad previa registrada', e); }
//             }
//             setCargando(false);
//         };
//         cargar();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     useEffect(() => {
//         if (esFDI) { setSelGravedad(''); setSelUbicacion(''); }
//     }, [esFDI]);

//     // ✅ Sincroniza la lista completa (usada por CONFIRMA)
//     const sincronizarLista = async (lista) => {
//         if (flujo === 'embalaje') {
//             await axiosInstance.post(ENDPOINTS.guardarEmbalaje, {
//                 operacionId,
//                 itemPedidoId: lineaData?.ItemPedido_ID || '',
//                 numeroItem: parseInt(lineaData?.NumeroItem) || 0,
//                 sobrante: 0,
//                 lineaData: {
//                     ...lineaData,
//                     CodigoProducto: codigoProducto || lineaData?.CodigoProducto || '',
//                 },
//                 defectos: lista,
//                 usuario: usuarioActual,
//             });
//         } else {
//             await axiosInstance.post(ENDPOINTS.guardarSlitter, {
//                 operacionId,
//                 loteIds: lineaData?.Lote_IDS,
//                 sobrante: 0,
//                 sobreorden: 0,
//                 defectos: lista,
//                 usuario: usuarioActual,
//             });
//         }
//     };

//     const confirmarDefecto = () => {
//         if (!defectoSel) return;
//         if (!esFDI && (selGravedad === '' || selUbicacion === '')) {
//             return Swal.fire('Advertencia', 'Deben ingresar Gravedad y Ubicación', 'warning');
//         }
//         const hayFDIEnGrilla = defectos.some(d => d.defecto === 'Fuera de Diámetro');
//         if (esFDI && defectos.length > 0) {
//             return Swal.fire('Advertencia', 'Debe ingresar Fuera de diámetro o Defectos, no ambos', 'warning');
//         }
//         if (!esFDI && hayFDIEnGrilla) {
//             return Swal.fire('Advertencia', 'Debe ingresar Fuera de diámetro o Defectos, no ambos', 'warning');
//         }

//         const nuevo = esFDI
//             ? { codDefecto: defectoSel.Codigo, defecto: 'Fuera de Diámetro', codGravedad: '9', codUbicacion: '9', nota }
//             : { codDefecto: defectoSel.Codigo, defecto: defectoSel.Descripcion, codGravedad: selGravedad, codUbicacion: selUbicacion, nota };

//         setDefectos(prev => [...prev, nuevo]);
//         setSelGravedad('');
//         setSelUbicacion('');
//         setNota('');
//     };

//     const modificar = (index) => {
//         const d = defectos[index];
//         setSelDefecto(d.codDefecto);
//         if (d.defecto !== 'Fuera de Diámetro') {
//             setSelGravedad(d.codGravedad);
//             setSelUbicacion(d.codUbicacion);
//         }
//         setNota(d.nota || '');
//         setDefectos(prev => prev.filter((_, i) => i !== index));
//     };

//     // // ✅✅ EL 🗑️ AHORA SÍ VA AL BACK: borra la fila de Calidad/CalidadPlancha por ID.
//     // //    Si el defecto todavía no estaba en BD (agregado en esta sesión), solo sale de la grilla
//     // //    y el CONFIRMA se encarga de sincronizar.
//     // const borrar = async (index) => {
//     //     const d = defectos[index];
//     //     const listaPrev = defectos;
//     //     const nuevaLista = listaPrev.filter((_, i) => i !== index);
//     //     setDefectos(nuevaLista);

//     //     if (d && d.id) {
//     //         setGuardando(true);
//     //         try {
//     //             await axiosInstance.post(ENDPOINTS.eliminarDefecto, { defectoId: d.id, flujo });
//     //             Swal.fire({
//     //                 icon: 'success',
//     //                 title: 'Defecto eliminado',
//     //                 text: 'Se quitó de la grilla y de la base de datos.',
//     //                 toast: true, position: 'top-end', timer: 2000, showConfirmButton: false,
//     //             });
//     //         } catch (e) {
//     //             console.error('Error al eliminar defecto de la BD:', e);
//     //             setDefectos(listaPrev);   // revertir para no mentirle al usuario
//     //             Swal.fire('Error', 'No se pudo eliminar el defecto de la base de datos: ' + (e.response?.data?.error || e.message), 'error');
//     //         } finally {
//     //             setGuardando(false);
//     //         }
//     //     }
//     // };


























//     // // ✅✅ EL 🗑️ VA AL BACK con TODOS los campos que exige la rama embalaje
//     // const borrar = async (index) => {
//     //     const d = defectos[index];
//     //     const listaPrev = defectos;
//     //     const nuevaLista = listaPrev.filter((_, i) => i !== index);
//     //     setDefectos(nuevaLista);

//     //     if (d && d.id) {
//     //         setGuardando(true);
//     //         try {
//     //             await axiosInstance.post(ENDPOINTS.eliminarDefecto, {
//     //                 defectoId: d.id,
//     //                 flujo,
//     //                 // ✅ campos obligatorios para embalaje/plancha:
//     //                 operacionId,
//     //                 itemPedidoId: lineaData?.ItemPedido_ID || '',
//     //                 numeroItem: parseInt(lineaData?.NumeroItem) || 0,
//     //                 sobrante: 0,
//     //                 idLotePlancha: lineaData?.Lote_IDS || '',
//     //                 usuario: usuarioActual,
//     //             });
//     //             Swal.fire({
//     //                 icon: 'success',
//     //                 title: 'Defecto eliminado',
//     //                 text: 'Se quitó de la grilla y de la base de datos.',
//     //                 toast: true, position: 'top-end', timer: 2000, showConfirmButton: false,
//     //             });
//     //         } catch (e) {
//     //             console.error('Error al eliminar defecto de la BD:', e);
//     //             setDefectos(listaPrev);   // revertir para no mentirle al usuario
//     //             Swal.fire('Error', 'No se pudo eliminar el defecto de la base de datos: ' + (e.response?.data?.error || e.message), 'error');
//     //         } finally {
//     //             setGuardando(false);
//     //         }
//     //     }
//     // };
















//     // // ✅✅ EL 🗑️ SIN IDs: sincroniza la lista restante contra la BD
//     // //    (misma lógica del CONFIRMA / btnConfirma_Click del VB:
//     // //     SP_EliminarCalidadPlancha + re-insert de los que quedan).
//     // const borrar = async (index) => {
//     //     const listaPrev = defectos;
//     //     const nuevaLista = listaPrev.filter((_, i) => i !== index);
//     //     setDefectos(nuevaLista);
//     //     setGuardando(true);
//     //     try {
//     //         await sincronizarLista(nuevaLista);   // ← va al /calidad/guardar (o guardar-slitter)
//     //         Swal.fire({
//     //             icon: 'success',
//     //             title: 'Defecto eliminado',
//     //             text: 'Se quitó de la grilla y de la base de datos.',
//     //             toast: true, position: 'top-end', timer: 2000, showConfirmButton: false,
//     //         });
//     //     } catch (e) {
//     //         console.error('Error al sincronizar el borrado:', e);
//     //         setDefectos(listaPrev);   // revertir si falló
//     //         Swal.fire('Error', 'No se pudo eliminar el defecto de la base de datos: ' + (e.response?.data?.error || e.message), 'error');
//     //     } finally {
//     //         setGuardando(false);
//     //     }
//     // };

//     // // ✅ CONFIRMA FINAL: sincroniza la lista completa (altas/modificaciones) y avisa al padre
//     // const confirmar = async () => {
//     //     if (defectos.length === 0) {
//     //         return Swal.fire('Advertencia', 'No ha ingresado ningún Defecto', 'warning');
//     //     }
//     //     setGuardando(true);
//     //     try {
//     //         await sincronizarLista(defectos);
//     //         Swal.fire('Éxito', 'Defectos guardados correctamente', 'success');
//     //         onConfirm(defectos);
//     //         onClose();
//     //     } catch (e) {
//     //         console.error('Error guardando defectos:', e);
//     //         Swal.fire('Error', 'No se pudieron guardar los defectos: ' + (e.response?.data?.error || e.message), 'error');
//     //     } finally {
//     //         setGuardando(false);
//     //     }
//     // };
















//         // ✅✅ EL 🗑️ VA AL BACK DE VERDAD: sincroniza la lista restante contra la BD
//     //    (borra todos los pendientes del lote y re-inserta solo lo que queda en la grilla,
//     //     igual que el btnConfirma_Click del VB). Sin IDs: imposible que reviva.
//     const borrar = async (index) => {
//         const listaPrev = defectos;
//         const nuevaLista = listaPrev.filter((_, i) => i !== index);
//         setDefectos(nuevaLista);
//         setGuardando(true);
//         try {
//             await sincronizarLista(nuevaLista);
//             Swal.fire({
//                 icon: 'success',
//                 title: 'Defecto eliminado',
//                 text: 'Se quitó de la grilla y de la base de datos.',
//                 toast: true, position: 'top-end', timer: 2000, showConfirmButton: false,
//             });
//         } catch (e) {
//             console.error('Error al sincronizar el borrado:', e);
//             setDefectos(listaPrev);   // si falló, la grilla vuelve a mostrar la realidad
//             Swal.fire('Error', 'No se pudo eliminar el defecto de la base de datos: ' + (e.response?.data?.error || e.message), 'error');
//         } finally {
//             setGuardando(false);
//         }
//     };

//     // ✅ CONFIRMA: sincroniza la lista completa. Si está vacía, pregunta y persiste el vacío
//     //    (así el caso de tu imagen 3 guarda la eliminación en vez de bloquear).
//     const confirmar = async () => {
//         if (defectos.length === 0) {
//             const ask = await Swal.fire({
//                 title: 'Sin defectos',
//                 text: 'Se eliminarán todos los defectos pendientes de la base de datos. ¿Continúa?',
//                 icon: 'warning',
//                 showCancelButton: true,
//                 confirmButtonText: 'Sí, guardar sin defectos',
//                 cancelButtonText: 'Cancelar',
//             });
//             if (!ask.isConfirmed) return;
//         }
//         setGuardando(true);
//         try {
//             await sincronizarLista(defectos);
//             Swal.fire('Éxito', 'Defectos guardados correctamente', 'success');
//             onConfirm(defectos);
//             onClose();
//         } catch (e) {
//             console.error('Error guardando defectos:', e);
//             Swal.fire('Error', 'No se pudieron guardar los defectos: ' + (e.response?.data?.error || e.message), 'error');
//         } finally {
//             setGuardando(false);
//         }
//     };

//     const textoGravedad = (d) =>
//         d.defecto === 'Fuera de Diámetro' ? '[No Corresponde]' : (GRAVEDADES.find(g => g.cod === d.codGravedad)?.texto || d.codGravedad);
//     const textoUbicacion = (d) =>
//         d.defecto === 'Fuera de Diámetro' ? '[No Corresponde]' : (UBICACIONES.find(u => u.cod === d.codUbicacion)?.texto || d.codUbicacion);

//     return (
//         <div className="pesaje-modal-overlay calidad-overlay">
//             <div className="pesaje-modal">
//                 <div className="modal-header">
//                     <h3>REGISTRACION - Calidad</h3>
//                     <button onClick={onClose} disabled={guardando}>&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="info-panel">
//                         <div>Ancho: {infoHeader?.ancho ?? ''} | {infoHeader?.detalle ?? ''}</div>
//                         <div>{infoHeader?.maquina ?? ''} - CORTE | Usuario: {usuarioActual}</div>
//                         <div>Kgs.Pgmados: {Number(infoHeader?.programados || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
//                         <div>Kgs.Calidad: {Number(infoHeader?.calidadKgs || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
//                         <div>Cód.Prod: {codigoProducto || 'N/A'}</div>
//                     </div>

//                     <div className="pesaje-section">
//                         <div className="defectos-form">
//                             <div className="defectos-col-combos">
//                                 <label>Defecto</label>
//                                 <select value={selDefecto} onChange={e => setSelDefecto(e.target.value)} disabled={cargando}>
//                                     {defectosCombo.map(d => (
//                                         <option key={d.Codigo} value={d.Codigo}>{d.Descripcion}</option>
//                                     ))}
//                                 </select>
//                                 <label>Gravedad</label>
//                                 <select value={selGravedad} onChange={e => setSelGravedad(e.target.value)} disabled={esFDI || cargando}>
//                                     <option value=""></option>
//                                     {GRAVEDADES.map(g => <option key={g.cod} value={g.cod}>{g.texto}</option>)}
//                                 </select>
//                                 <label>Ubicación</label>
//                                 <select value={selUbicacion} onChange={e => setSelUbicacion(e.target.value)} disabled={esFDI || cargando}>
//                                     <option value=""></option>
//                                     {UBICACIONES.map(u => <option key={u.cod} value={u.cod}>{u.texto}</option>)}
//                                 </select>
//                             </div>

//                             <div className="defectos-col-nota">
//                                 <div className="nota-row">
//                                     <label>Nota</label>
//                                     <textarea value={nota} onChange={e => setNota(e.target.value)} />
//                                 </div>
//                                 <button className="btn-calidad btn-confirma-defecto" onClick={confirmarDefecto} disabled={cargando}>
//                                     Confirma Defecto
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="grilla-atados">
//                         <h4>Defectos</h4>
//                         <table>
//                             <thead>
//                                 <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th>Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {defectos.length > 0 ? defectos.map((d, i) => (
//                                     <tr key={d.id || i}>
//                                         <td>{d.defecto}</td>
//                                         <td>{textoGravedad(d)}</td>
//                                         <td>{textoUbicacion(d)}</td>
//                                         <td>{d.nota}</td>
//                                         <td className="acciones-atado">
//                                             <button onClick={() => modificar(i)} title="Modificar" disabled={guardando}>✏️</button>
//                                             <button onClick={() => borrar(i)} title="Borrar (grilla y BD)" disabled={guardando}>🗑️</button>
//                                         </td>
//                                     </tr>
//                                 )) : (
//                                     <tr><td colSpan="5" style={{ textAlign: 'center' }}>Sin defectos cargados</td></tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//                 <div className="modal-footer">
//                     <button onClick={onClose} className="btn-reset" disabled={guardando}>CANCELAR</button>
//                     <button onClick={confirmar} className="btn-registrar" disabled={guardando}>
//                         {guardando ? 'Guardando...' : 'CONFIRMA'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CalidadModal;











































// src/components/modals/CalidadModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import '../PesajeModal.css';
import './CalidadModal.css';

const GRAVEDADES = [
    { cod: '0', texto: '[0, Sin Requerimiento]' },
    { cod: '1', texto: '[1, Grave]' },
    { cod: '2', texto: '[2, Moderado]' },
    { cod: '3', texto: '[3, Leve]' },
];
const UBICACIONES = [
    { cod: '0', texto: '[1, Lado Operador]' },
    { cod: '1', texto: '[2, Centro]' },
    { cod: '2', texto: '[3, Lado Motor]' },
];

const ENDPOINTS = {
    defectos: (familia) => `/registracion/calidad/defectos/${familia}`,
    infoOperacion: (id) => `/registracion/calidad/info-operacion/${id}`,
    obtenerSlitter: '/registracion/calidad/obtener-slitter',
    guardarSlitter: '/registracion/calidad/guardar-slitter',
    obtenerEmbalaje: '/registracion/calidad/obtener',
    guardarEmbalaje: '/calidad/guardar',
    eliminarDefecto: '/calidad/eliminar-defecto',
};

const CalidadModal = ({
    operacionId,
    lineaData,
    infoHeader,
    defectosIniciales = [],
    onConfirm,
    onClose,
    flujo = 'slitter',
}) => {
    const { user } = useAuth();
    const usuarioActual = useMemo(() => {
        if (!user) return 'admin';
        if (typeof user === 'string') return user;
        return user?.username || user?.nombre || user?.userName || user?.name || 'admin';
    }, [user]);

    const [defectosCombo, setDefectosCombo] = useState([]);
    const [defectos, setDefectos] = useState(defectosIniciales);
    const [selDefecto, setSelDefecto] = useState('');
    const [selGravedad, setSelGravedad] = useState('');
    const [selUbicacion, setSelUbicacion] = useState('');
    const [nota, setNota] = useState('');
    const [codigoProducto, setCodigoProducto] = useState(infoHeader?.codigoProducto || '');
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const defectoSel = defectosCombo.find(d => d.Codigo === selDefecto);
    const esFDI = defectoSel?.Descripcion === 'Fuera de Diámetro';

    // === CARGA INICIAL ===
    useEffect(() => {
        const cargar = async () => {
            try {
                let codProd = infoHeader?.codigoProducto || lineaData?.CodigoProducto || '';
                if (!codProd && operacionId) {
                    const resInfo = await axiosInstance.get(ENDPOINTS.infoOperacion(operacionId));
                    codProd = resInfo.data?.Codigo_Producto || '';
                }
                setCodigoProducto(codProd);

                const familia = (codProd || '').substring(8, 10);
                const res = await axiosInstance.get(ENDPOINTS.defectos(familia));
                const lista = (Array.isArray(res.data) ? res.data : []).map(x => ({
                    Codigo: x.Codigo ?? x.codigo,
                    Descripcion: x.Descripcion ?? x.descripcion,
                }));
                if (lista.length === 0) {
                    Swal.fire('Advertencia', `No existen defectos para el material: ${familia}. AVISE A CALIDAD`, 'warning');
                    onClose();
                    return;
                }
                setDefectosCombo(lista);
                setSelDefecto(lista[0].Codigo);
            } catch (e) {
                console.error('Error cargando defectos:', e);
            }

            if (defectosIniciales.length === 0) {
                try {
                    let regs = [];
                    if (flujo === 'embalaje') {
                        const res = await axiosInstance.post(ENDPOINTS.obtenerEmbalaje, {
                            operacionId,
                            itemPedidoId: lineaData?.ItemPedido_ID || '',
                            numeroItem: parseInt(lineaData?.NumeroItem) || 0,
                            sobrante: 0,
                            idLotePlancha: lineaData?.Lote_IDS || '',
                        });
                        regs = Array.isArray(res.data) ? res.data : [];
                    } else {
                        const res = await axiosInstance.post(ENDPOINTS.obtenerSlitter, {
                            operacionId,
                            loteIds: lineaData?.Lote_IDS,
                            sobrante: 0,
                            sobreorden: 0,
                        });
                        regs = Array.isArray(res.data) ? res.data : [];
                    }
                    const pendientes = regs.filter(r => parseInt(r.Dictamen) === 0);
                    if (pendientes.length > 0) {
                        setDefectos(pendientes.map(r => ({
                            id: r.ID ?? r.Id ?? null,
                            codDefecto: r.Codigo,
                            defecto: r.Descripcion,
                            codGravedad: String(r.Gravedad),
                            codUbicacion: String(r.Ubicacion),
                            nota: r.Nota || '',
                        })));
                    }
                } catch (e) { console.warn('Sin calidad previa registrada', e); }
            }
            setCargando(false);
        };
        cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (esFDI) { setSelGravedad(''); setSelUbicacion(''); }
    }, [esFDI]);

    const sincronizarLista = async (lista) => {
        if (flujo === 'embalaje') {
            await axiosInstance.post(ENDPOINTS.guardarEmbalaje, {
                operacionId,
                itemPedidoId: lineaData?.ItemPedido_ID || '',
                numeroItem: parseInt(lineaData?.NumeroItem) || 0,
                sobrante: 0,
                lineaData: {
                    ...lineaData,
                    CodigoProducto: codigoProducto || lineaData?.CodigoProducto || '',
                },
                defectos: lista,
                usuario: usuarioActual,
            });
        } else {
            await axiosInstance.post(ENDPOINTS.guardarSlitter, {
                operacionId,
                loteIds: lineaData?.Lote_IDS,
                sobrante: 0,
                sobreorden: 0,
                defectos: lista,
                usuario: usuarioActual,
            });
        }
    };

    const confirmarDefecto = () => {
        if (!defectoSel) return;
        if (!esFDI && (selGravedad === '' || selUbicacion === '')) {
            return Swal.fire('Advertencia', 'Deben ingresar Gravedad y Ubicación', 'warning');
        }
        const hayFDIEnGrilla = defectos.some(d => d.defecto === 'Fuera de Diámetro');
        if (esFDI && defectos.length > 0) {
            return Swal.fire('Advertencia', 'Debe ingresar Fuera de diámetro o Defectos, no ambos', 'warning');
        }
        if (!esFDI && hayFDIEnGrilla) {
            return Swal.fire('Advertencia', 'Debe ingresar Fuera de diámetro o Defectos, no ambos', 'warning');
        }

        const nuevo = esFDI
            ? { codDefecto: defectoSel.Codigo, defecto: 'Fuera de Diámetro', codGravedad: '9', codUbicacion: '9', nota }
            : { codDefecto: defectoSel.Codigo, defecto: defectoSel.Descripcion, codGravedad: selGravedad, codUbicacion: selUbicacion, nota };

        setDefectos(prev => [...prev, nuevo]);
        setSelGravedad('');
        setSelUbicacion('');
        setNota('');
    };

    const modificar = (index) => {
        const d = defectos[index];
        setSelDefecto(d.codDefecto);
        if (d.defecto !== 'Fuera de Diámetro') {
            setSelGravedad(d.codGravedad);
            setSelUbicacion(d.codUbicacion);
        }
        setNota(d.nota || '');
        setDefectos(prev => prev.filter((_, i) => i !== index));
    };

    // const borrar = async (index) => {
    //     const listaPrev = defectos;
    //     const nuevaLista = listaPrev.filter((_, i) => i !== index);
    //     setDefectos(nuevaLista);
    //     setGuardando(true);
    //     try {
    //         await sincronizarLista(nuevaLista);
    //         Swal.fire({
    //             icon: 'success',
    //             title: 'Defecto eliminado',
    //             text: 'Se quitó de la grilla y de la base de datos.',
    //             toast: true, position: 'top-end', timer: 2000, showConfirmButton: false,
    //         });
    //     } catch (e) {
    //         console.error('Error al sincronizar el borrado:', e);
    //         setDefectos(listaPrev);
    //         Swal.fire('Error', 'No se pudo eliminar el defecto de la base de datos: ' + (e.response?.data?.error || e.message), 'error');
    //     } finally {
    //         setGuardando(false);
    //     }
    // };
















        // ✅✅ 🗑️ = DELETE directo de la fila en dbo.CalidadFinal por su ID.
    //    Ni SPs ni re-syncs: se borra la fila seleccionada y punto.
    const borrar = async (index) => {
        const d = defectos[index];
        const listaPrev = defectos;
        setDefectos(listaPrev.filter((_, i) => i !== index));
        if (!d || !d.id) return;   // defecto agregado en esta sesión: aún no existe en la tabla
        setGuardando(true);
        try {
            await axiosInstance.post(ENDPOINTS.eliminarDefecto, { defectoId: d.id, flujo });
            Swal.fire({ icon: 'success', title: 'Defecto eliminado de la tabla', toast: true, position: 'top-end', timer: 1800, showConfirmButton: false });
        } catch (e) {
            console.error('Error al eliminar de CalidadFinal:', e);
            setDefectos(listaPrev);   // si falló, la grilla vuelve a la realidad
            Swal.fire('Error', 'No se pudo eliminar de la tabla: ' + (e.response?.data?.error || e.message), 'error');
        } finally {
            setGuardando(false);
        }
    };

    // ✅ CONFIRMA FINAL: sincroniza la lista completa (altas/modificaciones) y avisa al padre
    const confirmar = async () => {
        if (defectos.length === 0) {
            return Swal.fire('Advertencia', 'No ha ingresado ningún Defecto', 'warning');
        }
        setGuardando(true);
        try {
            await sincronizarLista(defectos);
            Swal.fire('Éxito', 'Defectos guardados correctamente', 'success');
            onConfirm(defectos);
            onClose();
        } catch (e) {
            console.error('Error guardando defectos:', e);
            Swal.fire('Error', 'No se pudieron guardar los defectos: ' + (e.response?.data?.error || e.message), 'error');
        } finally {
            setGuardando(false);
        }
    };

    const textoGravedad = (d) =>
        d.defecto === 'Fuera de Diámetro' ? '[No Corresponde]' : (GRAVEDADES.find(g => g.cod === d.codGravedad)?.texto || d.codGravedad);
    const textoUbicacion = (d) =>
        d.defecto === 'Fuera de Diámetro' ? '[No Corresponde]' : (UBICACIONES.find(u => u.cod === d.codUbicacion)?.texto || d.codUbicacion);

    return (
        <div className="pesaje-modal-overlay calidad-overlay">
            <div className="pesaje-modal">
                <div className="modal-header">
                    <h3>REGISTRACION - Calidad</h3>
                    <button onClick={onClose} disabled={guardando}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="info-panel">
                        <div>Ancho: {infoHeader?.ancho ?? ''} | {infoHeader?.detalle ?? ''}</div>
                        <div>{infoHeader?.maquina ?? ''} - CORTE | Usuario: {usuarioActual}</div>
                        <div>Kgs.Pgmados: {Number(infoHeader?.programados || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                        <div>Kgs.Calidad: {Number(infoHeader?.calidadKgs || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                        <div>Cód.Prod: {codigoProducto || 'N/A'}</div>
                    </div>

                    <div className="pesaje-section">
                        <div className="defectos-form">
                            <div className="defectos-col-combos">
                                <label>Defecto</label>
                                <select value={selDefecto} onChange={e => setSelDefecto(e.target.value)} disabled={cargando}>
                                    {defectosCombo.map(d => (
                                        <option key={d.Codigo} value={d.Codigo}>{d.Descripcion}</option>
                                    ))}
                                </select>
                                <label>Gravedad</label>
                                <select value={selGravedad} onChange={e => setSelGravedad(e.target.value)} disabled={esFDI || cargando}>
                                    <option value=""></option>
                                    {GRAVEDADES.map(g => <option key={g.cod} value={g.cod}>{g.texto}</option>)}
                                </select>
                                <label>Ubicación</label>
                                <select value={selUbicacion} onChange={e => setSelUbicacion(e.target.value)} disabled={esFDI || cargando}>
                                    <option value=""></option>
                                    {UBICACIONES.map(u => <option key={u.cod} value={u.cod}>{u.texto}</option>)}
                                </select>
                            </div>

                            <div className="defectos-col-nota">
                                <div className="nota-row">
                                    <label>Nota</label>
                                    <textarea value={nota} onChange={e => setNota(e.target.value)} />
                                </div>
                                <button className="btn-calidad btn-confirma-defecto" onClick={confirmarDefecto} disabled={cargando}>
                                    Confirma Defecto
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grilla-atados">
                        <h4>Defectos</h4>
                        <table>
                            <thead>
                                <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th>Acciones</th></tr>
                            </thead>
                            <tbody>
                                {defectos.length > 0 ? defectos.map((d, i) => (
                                    <tr key={d.id || i}>
                                        <td>{d.defecto}</td>
                                        <td>{textoGravedad(d)}</td>
                                        <td>{textoUbicacion(d)}</td>
                                        <td>{d.nota}</td>
                                        <td className="acciones-atado">
                                            <button onClick={() => modificar(i)} title="Modificar" disabled={guardando}>✏️</button>
                                            <button onClick={() => borrar(i)} title="Borrar (grilla y BD)" disabled={guardando}>🗑️</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>Sin defectos cargados</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-reset" disabled={guardando}>CANCELAR</button>
                    <button onClick={confirmar} className="btn-registrar" disabled={guardando}>
                        {guardando ? 'Guardando...' : 'CONFIRMA'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalidadModal;
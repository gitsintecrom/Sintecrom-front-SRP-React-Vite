// // src/components/SupervisorReviewModal.jsx
// import React, { useState } from 'react';
// import Swal from 'sweetalert2';

// const SupervisorReviewModal = ({ data, onConfirm, onCancel, onForceFinal }) => {
//     const [formData, setFormData] = useState({
//         retenido: data?.retenido || '',
//         seleccion: data?.seleccion || '',
//         retrabajo: data?.retrabajo || '',
//         rechazado: data?.rechazado || '',
//         iniciaCorte: data?.iniciaCorte || false,
//         finalizaOperacion: data?.finalizaOperacion || false,
//         observaCalidad: data?.observaCalidad || ''
//     });

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     const handleConfirm = () => {
//         // Validaciones similares a VB (e.g., si chkIniciaCorte, verificar pasadas)
//         if (formData.iniciaCorte) {
//             // Lógica de validación para Pasada 1 (implementar según necesidad)
//             Swal.fire('Advertencia', 'Verifique datos de Pasada 1 antes de iniciar corte.', 'warning');
//             return;
//         }
//         if (formData.finalizaOperacion) {
//             // Lógica de validación para diámetros externos
//             Swal.fire('Advertencia', 'Verifique diámetros externos de todas las pasadas.', 'warning');
//             return;
//         }
//         onConfirm(formData);
//     };

//     return (
//         <div className="modal-overlay" onClick={onCancel}>
//             <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
//                 <div className="modal-header">
//                     <h3>Revisión SUPERVISOR</h3>
//                     <button onClick={onCancel}>&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="form-group">
//                         <label>Retenido:</label>
//                         <textarea name="retenido" value={formData.retenido} onChange={handleInputChange} className="form-control" rows="2" />
//                     </div>
//                     <div className="form-group">
//                         <label>Selección:</label>
//                         <textarea name="seleccion" value={formData.seleccion} onChange={handleInputChange} className="form-control" rows="2" />
//                     </div>
//                     <div className="form-group">
//                         <label>Retrabajo:</label>
//                         <textarea name="retrabajo" value={formData.retrabajo} onChange={handleInputChange} className="form-control" rows="2" />
//                     </div>
//                     <div className="form-group">
//                         <label>Rechazado:</label>
//                         <textarea name="rechazado" value={formData.rechazado} onChange={handleInputChange} className="form-control" rows="2" />
//                     </div>
//                     <div className="form-check">
//                         <input type="checkbox" name="iniciaCorte" checked={formData.iniciaCorte} onChange={handleInputChange} className="form-check-input" />
//                         <label className="form-check-label">Inicio Revisado - Aprueba Corte</label>
//                     </div>
//                     <div className="form-check">
//                         <input type="checkbox" name="finalizaOperacion" checked={formData.finalizaOperacion} onChange={handleInputChange} className="form-check-input" />
//                         <label className="form-check-label">Final Revisado - Aprueba Cierre de Operación</label>
//                     </div>
//                     <div className="form-group">
//                         <label>Observación Calidad:</label>
//                         <textarea name="observaCalidad" value={formData.observaCalidad} onChange={handleInputChange} className="form-control" rows="3" disabled />
//                     </div>
//                     <button onClick={onForceFinal} className="btn btn-warning mb-3">Forzar Inspección</button>
//                     <div className="d-flex justify-content-end">
//                         <button onClick={onCancel} className="btn btn-secondary mr-2">Salir</button>
//                         <button onClick={handleConfirm} className="btn btn-primary">Confirma</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SupervisorReviewModal;



// // src/components/SupervisorReviewModal.jsx -- DISEÑO MEJORADO: Grid, estilos profesionales

// import React, { useState } from 'react';
// import Swal from 'sweetalert2';
// import './SupervisorReviewModal.css'; // Nuevo CSS

// const SupervisorReviewModal = ({ data, onConfirm, onCancel, onForceFinal }) => {
//     const [formData, setFormData] = useState({
//         retenido: data?.retenido || '',
//         seleccion: data?.seleccion || '',
//         retrabajo: data?.retrabajo || '',
//         rechazado: data?.rechazado || '',
//         iniciaCorte: data?.iniciaCorte || false,
//         finalizaOperacion: data?.finalizaOperacion || false,
//         observaCalidad: data?.observaCalidad || ''
//     });

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     // const handleConfirm = () => {
//     //     // Validaciones básicas (como en VB)
//     //     if (formData.iniciaCorte) {
//     //         Swal.fire('Advertencia', 'Verifique datos de Pasada 1 antes de iniciar corte.', 'warning');
//     //         return;
//     //     }
//     //     if (formData.finalizaOperacion) {
//     //         Swal.fire('Advertencia', 'Verifique diámetros externos de todas las pasadas.', 'warning');
//     //         return;
//     //     }
//     //     onConfirm(formData);
//     // };








//     // const handleConfirm = () => {
//     //     // Validación dinámica para Inicia Corte (chequea Pasada 1)
//     //     if (formData.iniciaCorte) {
//     //         if (!pasadasData || !pasadasData[1]) {
//     //             Swal.fire('Advertencia', 'No hay datos para Pasada 1. Verifique antes de iniciar corte.', 'warning');
//     //             return;
//     //         }
//     //         const pasada1 = pasadasData[1];
//     //         const espesorBLM = parseFloat(pasada1.espesorBLM || 0);
//     //         const espesorC = parseFloat(pasada1.espesorC || 0);
//     //         const espesorBLO = parseFloat(pasada1.espesorBLO || 0);
//     //         const anchos = pasada1.anchosDeCorte || [];
//     //         if (espesorBLM === 0 || espesorC === 0 || espesorBLO === 0 || anchos.length === 0 || anchos.every(a => parseFloat(a.valor || 0) === 0)) {
//     //             Swal.fire('Advertencia', 'Verifique espesores y anchos de Pasada 1 antes de iniciar corte.', 'warning');
//     //             return;
//     //         }
//     //     }

//     //     // Validación dinámica para Finaliza Operación (chequea diámetros en todas pasadas)
//     //     if (formData.finalizaOperacion) {
//     //         if (!pasadasData) {
//     //             Swal.fire('Advertencia', 'No hay datos de pasadas. Verifique antes de finalizar.', 'warning');
//     //             return;
//     //         }
//     //         const cantPasadas = header?.cantPasadas || 1; // Asume header pasado o usa 5
//     //         let ok = true;
//     //         for (let i = 1; i <= cantPasadas; i++) {
//     //             const pasada = pasadasData[i];
//     //             if (!pasada || parseFloat(pasada.diametroExterno || 0) === 0) {
//     //                 ok = false;
//     //                 break;
//     //             }
//     //         }
//     //         if (!ok) {
//     //             Swal.fire('Advertencia', 'Verifique diámetros externos de TODAS las pasadas antes de finalizar operación.', 'warning');
//     //             return;
//     //         }
//     //     }

//     //     onConfirm(formData);
//     // };






//     const handleConfirm = () => {
//         console.log('=== DEBUG CONFIRM ===');
//         console.log('formData.iniciaCorte:', formData.iniciaCorte);
//         console.log('pasadasData[1]:', pasadasData ? pasadasData[1] : 'No pasadasData');

//         // Validación para Inicia Corte (flexible: alerta si TODOS datos Pasada 1 son 0)
//         if (formData.iniciaCorte) {
//             if (!pasadasData || !pasadasData[1]) {
//                 console.log('Falla: No hay pasadasData[1]');
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'No hay datos para Pasada 1. Verifique antes de iniciar corte.',
//                     icon: 'warning',
//                     allowOutsideClick: true // FIX: Permite cerrar y continuar
//                 });
//                 return;
//             }
//             const pasada1 = pasadasData[1];
//             const espesorBLM = parseFloat(pasada1.espesorBLM || 0);
//             const espesorC = parseFloat(pasada1.espesorC || 0);
//             const espesorBLO = parseFloat(pasada1.espesorBLO || 0);
//             const anchos = pasada1.anchosDeCorte || [];
//             const anchosOK = anchos.some(a => parseFloat(a.valor || 0) > 0); // FIX: Algún ancho >0 basta
//             console.log('Datos Pasada 1:', { espesorBLM, espesorC, espesorBLO, anchosLength: anchos.length, anchosOK });

//             if (espesorBLM === 0 && espesorC === 0 && espesorBLO === 0 && !anchosOK) {
//                 console.log('Falla validación Pasada 1');
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'Verifique espesores y anchos de Pasada 1 antes de iniciar corte.',
//                     icon: 'warning',
//                     allowOutsideClick: true // FIX: Non-blocking, cierra alerta y permite confirmar
//                 });
//                 // No return; permite confirmar después de alerta
//             } else {
//                 console.log('Pasada 1 OK');
//             }
//         }

//         // Validación para Finaliza Operación (flexible: diámetros >0 en todas pasadas)
//         if (formData.finalizaOperacion) {
//             if (!pasadasData || !header) {
//                 console.log('Falla: No hay pasadasData o header');
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'No hay datos de pasadas. Verifique antes de finalizar.',
//                     icon: 'warning',
//                     allowOutsideClick: true
//                 });
//                 return;
//             }
//             const cantPasadas = header.cantPasadas || 1;
//             let ok = true;
//             for (let i = 1; i <= cantPasadas; i++) {
//                 const pasada = pasadasData[i];
//                 const diamExt = parseFloat(pasada?.diametroExterno || 0);
//                 if (diamExt === 0) {
//                     ok = false;
//                     console.log(`Falla diámetro Pasada ${i}: ${diamExt}`);
//                     break;
//                 }
//             }
//             if (!ok) {
//                 console.log('Falla validación diámetros');
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'Verifique diámetros externos de TODAS las pasadas antes de finalizar operación.',
//                     icon: 'warning',
//                     allowOutsideClick: true
//                 });
//                 // No return; permite confirmar
//             } else {
//                 console.log('Diámetros OK');
//             }
//         }

//         console.log('Validación pasada, confirmando...');
//         onConfirm(formData);
//     };



//     return (
//         <div className="modal-overlay" onClick={onCancel}>
//             <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//                 <div className="modal-header">
//                     <h3>Revisión SUPERVISOR</h3>
//                     <button onClick={onCancel} className="close-button">&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="review-grid">
//                         {/* Sección 1: Aprobaciones ARRIBA */}
//                         <div className="section full-width">
//                             <h4>Aprobaciones</h4>
//                             <div className="checkbox-group">
//                                 <div className="checkbox-section">
//                                     <label className="section-label">Proceso Liberado (Inicia Corte)</label>
//                                     <label className="checkbox-label">
//                                         <input type="checkbox" name="iniciaCorte" checked={formData.iniciaCorte} onChange={handleInputChange} />
//                                         <span className="checkbox-text">Inicio Revisado - Aprueba Corte</span>
//                                     </label>
//                                 </div>
//                                 <div className="checkbox-section">
//                                     <label className="section-label">Producto Liberado (Cierra Operación)</label>
//                                     <label className="checkbox-label">
//                                         <input type="checkbox" name="finalizaOperacion" checked={formData.finalizaOperacion} onChange={handleInputChange} />
//                                         <span className="checkbox-text">Final Revisado - Aprueba Cierre de Operación</span>
//                                     </label>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Sección 2: Campos de Control ABAJO + Observaciones Agregada */}
//                         <div className="section full-width">
//                             <h4>Campos de Control</h4>
//                             <div className="form-group">
//                                 <label>Retenido:</label>
//                                 <textarea name="retenido" value={formData.retenido} onChange={handleInputChange} rows="2" />
//                             </div>
//                             <div className="form-group">
//                                 <label>Selección 100%:</label>
//                                 <textarea name="seleccion" value={formData.seleccion} onChange={handleInputChange} rows="2" />
//                             </div>
//                             <div className="form-group">
//                                 <label>Retrabajo:</label>
//                                 <textarea name="retrabajo" value={formData.retrabajo} onChange={handleInputChange} rows="2" />
//                             </div>
//                             <div className="form-group">
//                                 <label>Rechazado:</label>
//                                 <textarea name="rechazado" value={formData.rechazado} onChange={handleInputChange} rows="2" />
//                             </div>
//                             <div className="form-group">
//                                 <label>Observaciones:</label>
//                                 <textarea name="observaciones" value={formData.observaciones || ''} onChange={handleInputChange} rows="3" />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Botón Forzar */}
//                     <div className="force-section">
//                         <button onClick={onForceFinal} className="btn-force">Forzar Inspección</button>
//                     </div>

//                     {/* Footer */}
//                     <div className="modal-footer">
//                         <button onClick={onCancel} className="btn btn-secondary">Salir</button>
//                         <button onClick={handleConfirm} className="btn btn-primary">Confirma</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SupervisorReviewModal;







// // src/components/SupervisorReviewModal.jsx -- VERSIÓN COMPLETA Y FINAL: Aprobaciones arriba, Campos abajo, Observaciones incluida

// import React, { useState } from 'react';
// import Swal from 'sweetalert2';
// import './SupervisorReviewModal.css'; // CSS actualizado para compacto

// const SupervisorReviewModal = ({ data, pasadasData, header, onConfirm, onCancel, onForceFinal }) => {
//     const { retenido, seleccion, retrabajo, rechazado, iniciaCorte, finalizaOperacion, observaCalidad, observaciones } = data || {}; // Desestructuración de props

//     const [formData, setFormData] = useState({
//         retenido: retenido || '',
//         seleccion: seleccion || '',
//         retrabajo: retrabajo || '',
//         rechazado: rechazado || '',
//         iniciaCorte: iniciaCorte || false,
//         finalizaOperacion: finalizaOperacion || false,
//         observaCalidad: observaCalidad || '',
//         observaciones: observaciones || ''
//     });

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     const handleConfirm = () => {
//         console.log('=== DEBUG CONFIRM ===');
//         console.log('formData.iniciaCorte:', formData.iniciaCorte);
//         console.log('pasadasData:', pasadasData ? 'OK' : 'No definido');
//         console.log('header.cantPasadas:', header?.cantPasadas);

//         // Validación para Inicia Corte (flexible)
//         if (formData.iniciaCorte) {
//             if (!pasadasData || !pasadasData[1]) {
//                 console.log('Falla: No hay pasadasData[1]');
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'No hay datos para Pasada 1. Verifique antes de iniciar corte.',
//                     icon: 'warning',
//                     allowOutsideClick: true
//                 });
//                 return;
//             }
//             const pasada1 = pasadasData[1];
//             const espesorBLM = parseFloat(pasada1.espesorBLM || 0);
//             const espesorC = parseFloat(pasada1.espesorC || 0);
//             const espesorBLO = parseFloat(pasada1.espesorBLO || 0);
//             const anchos = pasada1.anchosDeCorte || [];
//             const anchosOK = anchos.some(a => parseFloat(a.valor || 0) > 0);
//             console.log('Datos Pasada 1:', { espesorBLM, espesorC, espesorBLO, anchosLength: anchos.length, anchosOK });

//             if (espesorBLM === 0 && espesorC === 0 && espesorBLO === 0 && !anchosOK) {
//                 console.log('Falla validación Pasada 1');
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'Verifique espesores y anchos de Pasada 1 antes de iniciar corte.',
//                     icon: 'warning',
//                     allowOutsideClick: true
//                 });
//                 return;
//             } else {
//                 console.log('Pasada 1 OK');
//             }
//         }

//         // Validación para Finaliza Operación (flexible)
//         if (formData.finalizaOperacion) {
//             if (!pasadasData || !header) {
//                 console.log('Falla: No hay pasadasData o header');
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'No hay datos de pasadas. Verifique antes de finalizar.',
//                     icon: 'warning',
//                     allowOutsideClick: true
//                 });
//                 return;
//             }
//             const cantPasadas = header.cantPasadas || 1;
//             let ok = true;
//             for (let i = 1; i <= cantPasadas; i++) {
//                 const pasada = pasadasData[i];
//                 const diamExt = parseFloat(pasada?.diametroExterno || 0);
//                 if (diamExt === 0) {
//                     ok = false;
//                     console.log(`Falla diámetro Pasada ${i}: ${diamExt}`);
//                     break;
//                 }
//             }
//             if (!ok) {
//                 console.log('Falla validación diámetros');
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'Verifique diámetros externos de TODAS las pasadas antes de finalizar operación.',
//                     icon: 'warning',
//                     allowOutsideClick: true
//                 });
//                 return;
//             } else {
//                 console.log('Diámetros OK');
//             }
//         }

//         console.log('Validación pasada, confirmando...');
//         onConfirm(formData);
//     };

//     return (
//         <div className="modal-overlay" onClick={onCancel}>
//             <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//                 <div className="modal-header">
//                     <h3>Revisión SUPERVISOR</h3>
//                     <button onClick={onCancel} className="close-button">&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="review-grid">
//                         {/* Sección 1: Aprobaciones ARRIBA */}
//                         <div className="section full-width">
//                             <h4>Aprobaciones</h4>
//                             <div className="checkbox-group">
//                                 <div className="checkbox-section">
//                                     <label className="section-label">Proceso Liberado (Inicia Corte)</label>
//                                     <label className="checkbox-label">
//                                         <input type="checkbox" name="iniciaCorte" checked={formData.iniciaCorte} onChange={handleInputChange} />
//                                         <span className="checkbox-text">Inicio Revisado - Aprueba Corte</span>
//                                     </label>
//                                 </div>
//                                 <div className="checkbox-section">
//                                     <label className="section-label">Producto Liberado (Cierra Operación)</label>
//                                     <label className="checkbox-label">
//                                         <input type="checkbox" name="finalizaOperacion" checked={formData.finalizaOperacion} onChange={handleInputChange} />
//                                         <span className="checkbox-text">Final Revisado - Aprueba Cierre de Operación</span>
//                                     </label>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Sección 2: Campos de Control ABAJO + Observaciones */}
//                         <div className="section full-width">
//                             <h4>Campos de Control</h4>
//                             <div className="form-group">
//                                 <label>Retenido:</label>
//                                 <textarea name="retenido" value={formData.retenido} onChange={handleInputChange} rows="2" />
//                             </div>
//                             <div className="form-group">
//                                 <label>Selección 100%:</label>
//                                 <textarea name="seleccion" value={formData.seleccion} onChange={handleInputChange} rows="2" />
//                             </div>
//                             <div className="form-group">
//                                 <label>Retrabajo:</label>
//                                 <textarea name="retrabajo" value={formData.retrabajo} onChange={handleInputChange} rows="2" />
//                             </div>
//                             <div className="form-group">
//                                 <label>Rechazado:</label>
//                                 <textarea name="rechazado" value={formData.rechazado} onChange={handleInputChange} rows="2" />
//                             </div>
//                             <div className="form-group">
//                                 <label>Observaciones:</label>
//                                 <textarea name="observaciones" value={formData.observaciones} onChange={handleInputChange} rows="3" />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Botón Forzar */}
//                     <div className="force-section">
//                         <button onClick={onForceFinal} className="btn-force">Forzar Inspección</button>
//                     </div>

//                     {/* Footer */}
//                     <div className="modal-footer">
//                         <button onClick={onCancel} className="btn btn-secondary">Salir</button>
//                         <button onClick={handleConfirm} className="btn btn-primary">Confirma</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SupervisorReviewModal;



// src/components/SupervisorReviewModal.jsx -- VERSIÓN COMPLETA Y FINAL: Botón Forzar visible, scroll si necesario

// import React, { useState } from 'react';
// import Swal from 'sweetalert2';
// import './SupervisorReviewModal.css';

// const SupervisorReviewModal = ({ data, pasadasData, header, onConfirm, onCancel, onForceFinal }) => {
//     const { retenido, seleccion, retrabajo, rechazado, iniciaCorte, finalizaOperacion, observaCalidad, observaciones } = data || {};

//     const [formData, setFormData] = useState({
//         retenido: retenido || '',
//         seleccion: seleccion || '',
//         retrabajo: retrabajo || '',
//         rechazado: rechazado || '',
//         iniciaCorte: iniciaCorte || false,
//         finalizaOperacion: finalizaOperacion || false,
//         observaCalidad: observaCalidad || '',
//         observaciones: observaciones || ''
//     });

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     const handleConfirm = () => {
//         console.log('=== DEBUG CONFIRM ===');
//         console.log('formData.iniciaCorte:', formData.iniciaCorte);
//         console.log('pasadasData:', pasadasData ? 'OK' : 'No definido');
//         console.log('header.cantPasadas:', header?.cantPasadas);

//         // Validación para Inicia Corte (flexible)
//         if (formData.iniciaCorte) {
//             if (!pasadasData || !pasadasData[1]) {
//                 console.log('Falla: No hay pasadasData[1]');
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'No hay datos para Pasada 1. Verifique antes de iniciar corte.',
//                     icon: 'warning',
//                     allowOutsideClick: true
//                 });
//                 return;
//             }
//             const pasada1 = pasadasData[1];
//             const espesorBLM = parseFloat(pasada1.espesorBLM || 0);
//             const espesorC = parseFloat(pasada1.espesorC || 0);
//             const espesorBLO = parseFloat(pasada1.espesorBLO || 0);
//             const anchos = pasada1.anchosDeCorte || [];
//             const anchosOK = anchos.some(a => parseFloat(a.valor || 0) > 0);
//             console.log('Datos Pasada 1:', { espesorBLM, espesorC, espesorBLO, anchosLength: anchos.length, anchosOK });

//             if (espesorBLM === 0 && espesorC === 0 && espesorBLO === 0 && !anchosOK) {
//                 console.log('Falla validación Pasada 1');
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'Verifique espesores y anchos de Pasada 1 antes de iniciar corte.',
//                     icon: 'warning',
//                     allowOutsideClick: true
//                 });
//                 return;
//             } else {
//                 console.log('Pasada 1 OK');
//             }
//         }

//         // Validación para Finaliza Operación (flexible)
//         if (formData.finalizaOperacion) {
//             if (!pasadasData || !header) {
//                 console.log('Falla: No hay pasadasData o header');
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'No hay datos de pasadas. Verifique antes de finalizar.',
//                     icon: 'warning',
//                     allowOutsideClick: true
//                 });
//                 return;
//             }
//             const cantPasadas = header.cantPasadas || 1;
//             let ok = true;
//             for (let i = 1; i <= cantPasadas; i++) {
//                 const pasada = pasadasData[i];
//                 const diamExt = parseFloat(pasada?.diametroExterno || 0);
//                 if (diamExt === 0) {
//                     ok = false;
//                     console.log(`Falla diámetro Pasada ${i}: ${diamExt}`);
//                     break;
//                 }
//             }
//             if (!ok) {
//                 console.log('Falla validación diámetros');
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'Verifique diámetros externos de TODAS las pasadas antes de finalizar operación.',
//                     icon: 'warning',
//                     allowOutsideClick: true
//                 });
//                 return;
//             } else {
//                 console.log('Diámetros OK');
//             }
//         }

//         console.log('Validación pasada, confirmando...');
//         onConfirm(formData);
//     };

//     return (
//         <div className="modal-overlay" onClick={onCancel}>
//             <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//                 <div className="modal-header">
//                     <h3>Revisión SUPERVISOR</h3>
//                     <button onClick={onCancel} className="close-button">&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="review-grid">
//                         {/* Sección 1: Aprobaciones ARRIBA */}
//                         <div className="section full-width">
//                             <h4>Aprobaciones</h4>
//                             <div className="checkbox-group">
//                                 <div className="checkbox-section">
//                                     <label className="section-label">Proceso Liberado (Inicia Corte)</label>
//                                     <label className="checkbox-label">
//                                         <input type="checkbox" name="iniciaCorte" checked={formData.iniciaCorte} onChange={handleInputChange} />
//                                         <span className="checkbox-text">Inicio Revisado - Aprueba Corte</span>
//                                     </label>
//                                 </div>
//                                 <div className="checkbox-section">
//                                     <label className="section-label">Producto Liberado (Cierra Operación)</label>
//                                     <label className="checkbox-label">
//                                         <input type="checkbox" name="finalizaOperacion" checked={formData.finalizaOperacion} onChange={handleInputChange} />
//                                         <span className="checkbox-text">Final Revisado - Aprueba Cierre de Operación</span>
//                                     </label>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Sección 2: Campos de Control ABAJO */}
//                         <div className="section full-width">
//                             <h4>Campos de Control</h4>
//                             <div className="form-group">
//                                 <label>Retenido:</label>
//                                 <textarea name="retenido" value={formData.retenido} onChange={handleInputChange} rows="2" />
//                             </div>
//                             <div className="form-group">
//                                 <label>Selección 100%:</label>
//                                 <textarea name="seleccion" value={formData.seleccion} onChange={handleInputChange} rows="2" />
//                             </div>
//                             <div className="form-group">
//                                 <label>Retrabajo:</label>
//                                 <textarea name="retrabajo" value={formData.retrabajo} onChange={handleInputChange} rows="2" />
//                             </div>
//                             <div className="form-group">
//                                 <label>Rechazado:</label>
//                                 <textarea name="rechazado" value={formData.rechazado} onChange={handleInputChange} rows="2" />
//                             </div>
//                             <div className="form-group">
//                                 <label>Observaciones:</label>
//                                 <textarea name="observaciones" value={formData.observaciones} onChange={handleInputChange} rows="3" />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Botón Forzar (visible y centrado) */}
//                     <div className="force-section">
//                         <button onClick={onForceFinal} className="btn-force">Forzar Inspección</button>
//                     </div>

//                     {/* Footer */}
//                     <div className="modal-footer">
//                         <button onClick={onCancel} className="btn btn-secondary">Salir</button>
//                         <button onClick={handleConfirm} className="btn btn-primary">Confirma</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SupervisorReviewModal;




import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './SupervisorReviewModal.css';

const SupervisorReviewModal = ({ data, pasadasData, header, onConfirm, onCancel, onForceFinal }) => {
    const { retenido, seleccion, retrabajo, rechazado, iniciaCorte, finalizaOperacion, observaCalidad, observaciones } = data || {};

    const [formData, setFormData] = useState({
        retenido: retenido || '',
        seleccion: seleccion || '',
        retrabajo: retrabajo || '',
        rechazado: rechazado || '',
        iniciaCorte: iniciaCorte || false,
        finalizaOperacion: finalizaOperacion || false,
        observaCalidad: observaCalidad || '',
        observaciones: observaciones || ''
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleConfirm = () => {
        console.log('=== DEBUG CONFIRM ===');
        console.log('formData.iniciaCorte:', formData.iniciaCorte);
        console.log('pasadasData:', pasadasData ? 'OK' : 'No definido');
        console.log('header.cantPasadas:', header?.cantPasadas);

        // Validación para Inicia Corte (flexible)
        if (formData.iniciaCorte) {
            if (!pasadasData || !pasadasData[1]) {
                console.log('Falla: No hay pasadasData[1]');
                Swal.fire({
                    title: 'Advertencia',
                    text: 'No hay datos para Pasada 1. Verifique antes de iniciar corte.',
                    icon: 'warning',
                    allowOutsideClick: true
                });
                return;
            }
            const pasada1 = pasadasData[1];
            const espesorBLM = parseFloat(pasada1.espesorBLM || 0);
            const espesorC = parseFloat(pasada1.espesorC || 0);
            const espesorBLO = parseFloat(pasada1.espesorBLO || 0);
            const anchos = pasada1.anchosDeCorte || [];
            const anchosOK = anchos.some(a => parseFloat(a.valor || 0) > 0);
            console.log('Datos Pasada 1:', { espesorBLM, espesorC, espesorBLO, anchosLength: anchos.length, anchosOK });

            if (espesorBLM === 0 && espesorC === 0 && espesorBLO === 0 && !anchosOK) {
                console.log('Falla validación Pasada 1');
                Swal.fire({
                    title: 'Advertencia',
                    text: 'Verifique espesores y anchos de Pasada 1 antes de iniciar corte.',
                    icon: 'warning',
                    allowOutsideClick: true
                });
                return;
            } else {
                console.log('Pasada 1 OK');
            }
        }

        // Validación para Finaliza Operación (flexible)
        if (formData.finalizaOperacion) {
            if (!pasadasData || !header) {
                console.log('Falla: No hay pasadasData o header');
                Swal.fire({
                    title: 'Advertencia',
                    text: 'No hay datos de pasadas. Verifique antes de finalizar.',
                    icon: 'warning',
                    allowOutsideClick: true
                });
                return;
            }
            const cantPasadas = header.cantPasadas || 1;
            let ok = true;
            for (let i = 1; i <= cantPasadas; i++) {
                const pasada = pasadasData[i];
                const diamExt = parseFloat(pasada?.diametroExterno || 0);
                if (diamExt === 0) {
                    ok = false;
                    console.log(`Falla diámetro Pasada ${i}: ${diamExt}`);
                    break;
                }
            }
            if (!ok) {
                console.log('Falla validación diámetros');
                Swal.fire({
                    title: 'Advertencia',
                    text: 'Verifique diámetros externos de TODAS las pasadas antes de finalizar operación.',
                    icon: 'warning',
                    allowOutsideClick: true
                });
                return;
            } else {
                console.log('Diámetros OK');
            }
        }

        console.log('Validación pasada, confirmando...');
        onConfirm(formData);
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Revisión SUPERVISOR</h3>
                    <button onClick={onCancel} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="review-grid">
                        {/* Sección 1: Aprobaciones ARRIBA */}
                        <div className="section full-width">
                            <h4>Aprobaciones</h4>
                            <div className="checkbox-group">
                                <div className="checkbox-section">
                                    <label className="section-label">Proceso Liberado (Inicia Corte)</label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="iniciaCorte" checked={formData.iniciaCorte} onChange={handleInputChange} />
                                        <span className="checkbox-text">Inicio Revisado - Aprueba Corte</span>
                                    </label>
                                </div>
                                <div className="checkbox-section">
                                    <label className="section-label">Producto Liberado (Cierra Operación)</label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="finalizaOperacion" checked={formData.finalizaOperacion} onChange={handleInputChange} />
                                        <span className="checkbox-text">Final Revisado - Aprueba Cierre de Operación</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Sección 2: Campos de Control ABAJO */}
                        <div className="section full-width">
                            <h4>Campos de Control</h4>
                            <div className="form-group">
                                <label>Retenido:</label>
                                <textarea name="retenido" value={formData.retenido} onChange={handleInputChange} rows="1" /> {/* Ajustado a 1 fila */}
                            </div>
                            <div className="form-group">
                                <label>Selección 100%:</label>
                                <textarea name="seleccion" value={formData.seleccion} onChange={handleInputChange} rows="1" /> {/* Ajustado a 1 fila */}
                            </div>
                            <div className="form-group">
                                <label>Retrabajo:</label>
                                <textarea name="retrabajo" value={formData.retrabajo} onChange={handleInputChange} rows="1" /> {/* Ajustado a 1 fila */}
                            </div>
                            <div className="form-group">
                                <label>Rechazado:</label>
                                <textarea name="rechazado" value={formData.rechazado} onChange={handleInputChange} rows="1" /> {/* Ajustado a 1 fila */}
                            </div>
                            <div className="form-group">
                                <label>Observaciones:</label>
                                <textarea name="observaciones" value={formData.observaciones} onChange={handleInputChange} rows="2" /> {/* Ajustado a 2 filas */}
                            </div>
                        </div>
                    </div>

                    {/* Botón Forzar (visible y centrado) */}
                    <div className="force-section">
                        <button onClick={onForceFinal} className="btn-force">Forzar Inspección</button>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer">
                        <button onClick={onCancel} className="btn btn-secondary">Salir</button>
                        <button onClick={handleConfirm} className="btn btn-primary">Confirma</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupervisorReviewModal;
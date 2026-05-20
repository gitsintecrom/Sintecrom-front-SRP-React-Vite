// // src/components/PesajeEmbalajeModal.jsx

// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './PesajeEmbalajeModal.css';

// const PesajeEmbalajeModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
//     const [paquetes, setPaquetes] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         numeroPedido: lineaData.NumeroPedido || '',
//         item: lineaData.NumeroItem || '',
//         kgsProgramados: lineaData.Programados || 0,
//         serieLote: '',
//         kilos: '',
//         kilosBruto: '',
//         tara: '',
//         hojas: '1',
//         etiqueta: '',
//         nroEtiqueta: '',
//         calidad: '0'
//     });

//     useEffect(() => {
//         cargarPaquetesExistentes();
//         obtenerUltimaEtiqueta();
//     }, []);

//     const cargarPaquetesExistentes = async () => {
//         try {
//             setLoading(true);
//             const response = await axiosInstance.post('/pesaje/obtener-atados', {
//                 operacionId,
//                 loteIds: lineaData.Lote_IDS || null,
//                 sobrante: 0
//             });
            
//             if (response.data && response.data.length > 0) {
//                 const paquetesFormateados = response.data.map((pkg, index) => ({
//                     id: index + 1,
//                     numeroPaquete: pkg.Atado || index + 1,
//                     serieLote: lineaData.SerieLote || '',
//                     kilos: parseFloat(pkg.Peso || 0).toFixed(2),
//                     kilosBruto: parseFloat(pkg.Peso || 0).toFixed(2),
//                     tara: '0.00',
//                     hojas: '1',
//                     etiqueta: pkg.Etiqueta ? '🖨️' : '',
//                     nroEtiqueta: pkg.Etiqueta || '',
//                     calidad: pkg.Calidad === 1 ? '✓' : '0'
//                 }));
//                 setPaquetes(paquetesFormateados);
//             }
//         } catch (error) {
//             console.error("Error al cargar paquetes:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const obtenerUltimaEtiqueta = async () => {
//         try {
//             const response = await axiosInstance.get('/pesaje/obtener-ultima-etiqueta');
//             setFormData(prev => ({
//                 ...prev,
//                 nroEtiqueta: response.data.ultimaEtiqueta + 1
//             }));
//         } catch (error) {
//             console.error("Error al obtener etiqueta:", error);
//         }
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const calcularTara = () => {
//         const bruto = parseFloat(formData.kilosBruto) || 0;
//         const neto = parseFloat(formData.kilos) || 0;
//         const tara = bruto - neto;
//         setFormData(prev => ({ ...prev, tara: tara.toFixed(2) }));
//     };

//     const agregarPaquete = async () => {
//         if (!formData.kilos || parseFloat(formData.kilos) <= 0) {
//             Swal.fire('Atención', 'Debe ingresar un peso válido', 'warning');
//             return;
//         }

//         try {
//             // Generar nueva etiqueta
//             const responseEtiqueta = await axiosInstance.post('/pesaje/obtener-y-actualizar-etiqueta');
//             const nuevaEtiqueta = responseEtiqueta.data.nroEtiqueta;

//             const nuevoPaquete = {
//                 id: paquetes.length + 1,
//                 numeroPaquete: paquetes.length + 1,
//                 serieLote: formData.serieLote || lineaData.SerieLote || '',
//                 kilos: parseFloat(formData.kilos).toFixed(2),
//                 kilosBruto: parseFloat(formData.kilosBruto || formData.kilos).toFixed(2),
//                 tara: formData.tara || '0.00',
//                 hojas: formData.hojas || '1',
//                 etiqueta: '🖨️',
//                 nroEtiqueta: nuevaEtiqueta,
//                 calidad: formData.calidad || '0'
//             };

//             setPaquetes(prev => [...prev, nuevoPaquete]);
            
//             // Limpiar campos
//             setFormData(prev => ({
//                 ...prev,
//                 kilos: '',
//                 kilosBruto: '',
//                 tara: '',
//                 nroEtiqueta: nuevaEtiqueta + 1
//             }));

//             Swal.fire({
//                 icon: 'success',
//                 title: 'Paquete agregado',
//                 showConfirmButton: false,
//                 timer: 1000
//             });
//         } catch (error) {
//             Swal.fire('Error', 'No se pudo agregar el paquete', 'error');
//         }
//     };

//     const eliminarPaquete = (id) => {
//         Swal.fire({
//             title: '¿Eliminar paquete?',
//             text: "Esta acción no se puede deshacer",
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#d33',
//             cancelButtonColor: '#3085d6',
//             confirmButtonText: 'Sí, eliminar',
//             cancelButtonText: 'Cancelar'
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 setPaquetes(prev => prev.filter(p => p.id !== id));
//                 Swal.fire('Eliminado', 'El paquete ha sido eliminado', 'success');
//             }
//         });
//     };

//     const resetearTodo = () => {
//         Swal.fire({
//             title: '¿Resetear todo?',
//             text: "Se eliminarán todos los paquetes cargados",
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#d33',
//             cancelButtonColor: '#3085d6',
//             confirmButtonText: 'Sí, resetear',
//             cancelButtonText: 'Cancelar'
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 try {
//                     await axiosInstance.post('/pesaje/reset', {
//                         operacionId,
//                         loteIds: lineaData.Lote_IDS || null,
//                         sobrante: 0
//                     });
//                     setPaquetes([]);
//                     Swal.fire('Resetead!', 'Todos los paquetes han sido eliminados', 'success');
//                 } catch (error) {
//                     Swal.fire('Error', 'No se pudo resetear', 'error');
//                 }
//             }
//         });
//     };

//     const confirmarRegistro = async () => {
//         if (paquetes.length === 0) {
//             Swal.fire('Atención', 'No hay paquetes para registrar', 'warning');
//             return;
//         }

//         const atados = paquetes.map(pkg => ({
//             atado: pkg.numeroPaquete,
//             rollos: parseInt(pkg.hojas) || 1,
//             peso: parseFloat(pkg.kilos),
//             esCalidad: pkg.calidad === '✓' || pkg.calidad === '1',
//             nroEtiqueta: pkg.nroEtiqueta
//         }));

//         try {
//             setLoading(true);
//             await axiosInstance.post('/pesaje/registrar', {
//                 operacionId,
//                 loteIds: lineaData.Lote_IDS || null,
//                 sobrante: 0,
//                 atados,
//                 usuario: 'usuario_actual' // Reemplazar con usuario logueado
//             });

//             Swal.fire('Éxito', 'Paquetes registrados correctamente', 'success');
//             onSuccess();
//             onClose();
//         } catch (error) {
//             Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const totalKilos = paquetes.reduce((sum, pkg) => sum + parseFloat(pkg.kilos || 0), 0);

//     return (
//         <div className="modal-overlay">
//             <div className="modal-content embalaje-modal">
//                 <div className="modal-header">
//                     <h2>REGISTRACION - Paquetes</h2>
//                     <button className="modal-close" onClick={onClose}>×</button>
//                 </div>

//                 <div className="embalaje-info-header">
//                     <div className="info-box">
//                         <strong>Nº PEDIDO:</strong> {formData.numeroPedido}<br/>
//                         <strong>Item:</strong> {formData.item}<br/>
//                         <strong>Kgs.Programados:</strong> {parseFloat(formData.kgsProgramados).toFixed(2)}
//                     </div>
//                 </div>

//                 <div className="paquetes-table-container">
//                     <table className="paquetes-table">
//                         <thead>
//                             <tr>
//                                 <th>Nº Paquete</th>
//                                 <th>Serie/Lote</th>
//                                 <th>Kilos</th>
//                                 <th>Kilos Bruto</th>
//                                 <th>Tara</th>
//                                 <th>Hojas</th>
//                                 <th>Etiqueta</th>
//                                 <th>Nº Etiqueta</th>
//                                 <th>Calidad</th>
//                                 <th>Acción</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {paquetes.map((pkg) => (
//                                 <tr key={pkg.id}>
//                                     <td>{pkg.numeroPaquete}</td>
//                                     <td>{pkg.serieLote}</td>
//                                     <td className="text-right">{pkg.kilos}</td>
//                                     <td className="text-right">{pkg.kilosBruto}</td>
//                                     <td className="text-right">{pkg.tara}</td>
//                                     <td className="text-center">{pkg.hojas}</td>
//                                     <td className="text-center">{pkg.etiqueta}</td>
//                                     <td>{pkg.nroEtiqueta}</td>
//                                     <td className="text-center">{pkg.calidad}</td>
//                                     <td className="text-center">
//                                         <button 
//                                             className="btn-delete-row"
//                                             onClick={() => eliminarPaquete(pkg.id)}
//                                         >
//                                             🗑️
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                         <tfoot>
//                             <tr className="total-row">
//                                 <td colSpan="2" className="text-right"><strong>TOTAL:</strong></td>
//                                 <td className="text-right"><strong>{totalKilos.toFixed(2)}</strong></td>
//                                 <td colSpan="7"></td>
//                             </tr>
//                         </tfoot>
//                     </table>
//                 </div>

//                 <div className="embalaje-form-section">
//                     <div className="form-row">
//                         <div className="form-group">
//                             <label>Serie/Lote:</label>
//                             <input
//                                 type="text"
//                                 name="serieLote"
//                                 value={formData.serieLote}
//                                 onChange={handleInputChange}
//                                 placeholder="Automático"
//                                 disabled
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Kilos:</label>
//                             <input
//                                 type="number"
//                                 name="kilos"
//                                 value={formData.kilos}
//                                 onChange={handleInputChange}
//                                 onBlur={calcularTara}
//                                 step="0.01"
//                                 placeholder="0.00"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Kilos Bruto:</label>
//                             <input
//                                 type="number"
//                                 name="kilosBruto"
//                                 value={formData.kilosBruto}
//                                 onChange={handleInputChange}
//                                 onBlur={calcularTara}
//                                 step="0.01"
//                                 placeholder="0.00"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Tara:</label>
//                             <input
//                                 type="text"
//                                 name="tara"
//                                 value={formData.tara}
//                                 readOnly
//                                 placeholder="0.00"
//                             />
//                         </div>
//                     </div>

//                     <div className="form-row">
//                         <div className="form-group">
//                             <label>Hojas:</label>
//                             <input
//                                 type="number"
//                                 name="hojas"
//                                 value={formData.hojas}
//                                 onChange={handleInputChange}
//                                 min="1"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Nº Etiqueta:</label>
//                             <input
//                                 type="text"
//                                 name="nroEtiqueta"
//                                 value={formData.nroEtiqueta}
//                                 readOnly
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Calidad:</label>
//                             <select 
//                                 name="calidad" 
//                                 value={formData.calidad} 
//                                 onChange={handleInputChange}
//                             >
//                                 <option value="0">Normal</option>
//                                 <option value="1">Calidad</option>
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="modal-footer-buttons">
//                     <button className="btn btn-agregar" onClick={agregarPaquete}>
//                         Agregar Paquete
//                     </button>
//                     <button className="btn btn-reset" onClick={resetearTodo}>
//                         RESET
//                     </button>
//                     <button 
//                         className="btn btn-confirmar" 
//                         onClick={confirmarRegistro}
//                         disabled={loading || paquetes.length === 0}
//                     >
//                         {loading ? 'Procesando...' : 'CONFIRMAR REGISTRO'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PesajeEmbalajeModal;


// // src/components/PesajeEmbalajeModal.jsx

// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './PesajeEmbalajeModal.css';

// const PesajeEmbalajeModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
//     const [paquetes, setPaquetes] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         numeroPedido: lineaData.NumeroPedido || '',
//         item: lineaData.NumeroItem || '',
//         kgsProgramados: lineaData.Programados || 0,
//         serieLote: lineaData.SerieLote || '',
//         kilos: '',
//         kilosBruto: '',
//         tara: '',
//         hojas: '1',
//         etiqueta: '',
//         nroEtiqueta: '',
//         calidad: '0'
//     });

//     useEffect(() => {
//         cargarPaquetesExistentes();
//         obtenerUltimaEtiqueta();
//     }, []);

//     // const cargarPaquetesExistentes = async () => {
//     //     try {
//     //         setLoading(true);
//     //         const response = await axiosInstance.post('/pesaje/obtener-atados', {
//     //             operacionId,
//     //             loteIds: lineaData.Lote_IDS || null,
//     //             sobrante: 0
//     //         });
            
//     //         if (response.data && response.data.length > 0) {
//     //             const paquetesFormateados = response.data.map((pkg, index) => ({
//     //                 id: pkg.Atado || index + 1,
//     //                 numeroPaquete: pkg.Atado || index + 1,
//     //                 serieLote: lineaData.SerieLote || '',
//     //                 kilos: parseFloat(pkg.Peso || 0).toFixed(2),
//     //                 kilosBruto: (parseFloat(pkg.Peso || 0) + 13).toFixed(2), // Asumiendo tara de 13
//     //                 tara: '13.00',
//     //                 hojas: pkg.Rollos || '1',
//     //                 etiqueta: pkg.Etiqueta ? '🖨️' : '',
//     //                 nroEtiqueta: pkg.Etiqueta || '',
//     //                 calidad: pkg.Calidad === 1 ? '✓' : ''
//     //             }));
//     //             setPaquetes(paquetesFormateados);
                
//     //             // Actualizar el próximo número de paquete
//     //             const maxPaquete = Math.max(...paquetesFormateados.map(p => p.numeroPaquete));
//     //             setFormData(prev => ({
//     //                 ...prev,
//     //                 nroEtiqueta: (parseInt(response.data[response.data.length - 1]?.Etiqueta) || 0) + 1
//     //             }));
//     //         }
//     //     } catch (error) {
//     //         console.error("Error al cargar paquetes:", error);
//     //     } finally {
//     //         setLoading(false);
//     //     }
//     // };

//     const cargarPaquetesExistentes = async () => {
//         try {
//             console.log("🔄 Cargando paquetes existentes para operacionId:", operacionId);
//             console.log("🔄 lineaData.Lote_IDS:", lineaData.Lote_IDS);
            
//             setLoading(true);
            
//             const payload = {
//                 operacionId,
//                 loteIds: lineaData.Lote_IDS || null,
//                 sobrante: 0
//             };
            
//             console.log("📤 Enviando payload:", payload);
            
//             const response = await axiosInstance.post('/pesaje/obtener-atados', payload);
            
//             console.log("📥 Response recibido:", response.data);
//             console.log("📥 Cantidad de paquetes:", response.data?.length);
            
//             if (response.data && response.data.length > 0) {
//                 const paquetesFormateados = response.data.map((pkg, index) => {
//                     console.log(`📦 Procesando paquete ${index + 1}:`, pkg);
//                     return {
//                         id: pkg.Atado || index + 1,
//                         numeroPaquete: pkg.Atado || index + 1,
//                         serieLote: lineaData.SerieLote || '',
//                         kilos: parseFloat(pkg.Peso || 0).toFixed(2),
//                         kilosBruto: (parseFloat(pkg.Peso || 0) + 13).toFixed(2),
//                         tara: '13.00',
//                         hojas: pkg.Rollos || '1',
//                         etiqueta: pkg.Etiqueta ? '🖨️' : '',
//                         nroEtiqueta: pkg.Etiqueta || '',
//                         calidad: pkg.Calidad === 1 ? '✓' : ''
//                     };
//                 });
                
//                 console.log("✅ Paquetes formateados:", paquetesFormateados);
//                 setPaquetes(paquetesFormateados);
                
//                 // Actualizar próximo número de etiqueta
//                 const ultimaEtiqueta = Math.max(...paquetesFormateados.map(p => parseInt(p.nroEtiqueta) || 0));
//                 setFormData(prev => ({
//                     ...prev,
//                     nroEtiqueta: ultimaEtiqueta + 1
//                 }));
//             } else {
//                 console.log("⚠️ No se encontraron paquetes registrados");
//                 setPaquetes([]);
//             }
//         } catch (error) {
//             console.error("❌ Error al cargar paquetes:", error);
//             console.error("Error details:", error.response?.data);
//             Swal.fire('Error', 'No se pudieron cargar los paquetes existentes', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const obtenerUltimaEtiqueta = async () => {
//         try {
//             const response = await axiosInstance.get('/pesaje/obtener-ultima-etiqueta');
//             setFormData(prev => ({
//                 ...prev,
//                 nroEtiqueta: response.data.ultimaEtiqueta + 1
//             }));
//         } catch (error) {
//             console.error("Error al obtener etiqueta:", error);
//         }
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const calcularTara = () => {
//         const bruto = parseFloat(formData.kilosBruto) || 0;
//         const neto = parseFloat(formData.kilos) || 0;
//         const tara = bruto - neto;
//         setFormData(prev => ({ ...prev, tara: tara.toFixed(2) }));
//     };

//     const agregarPaquete = async () => {
//         if (!formData.kilos || parseFloat(formData.kilos) <= 0) {
//             Swal.fire('Atención', 'Debe ingresar un peso válido', 'warning');
//             return;
//         }

//         try {
//             // Generar nueva etiqueta
//             const responseEtiqueta = await axiosInstance.post('/pesaje/obtener-y-actualizar-etiqueta');
//             const nuevaEtiqueta = responseEtiqueta.data.nroEtiqueta;

//             const nuevoPaquete = {
//                 id: paquetes.length > 0 ? Math.max(...paquetes.map(p => p.id)) + 1 : 1,
//                 numeroPaquete: paquetes.length > 0 ? Math.max(...paquetes.map(p => p.numeroPaquete)) + 1 : 1,
//                 serieLote: formData.serieLote || lineaData.SerieLote || '',
//                 kilos: parseFloat(formData.kilos).toFixed(2),
//                 kilosBruto: parseFloat(formData.kilosBruto || formData.kilos).toFixed(2),
//                 tara: formData.tara || '0.00',
//                 hojas: formData.hojas || '1',
//                 etiqueta: '🖨️',
//                 nroEtiqueta: nuevaEtiqueta,
//                 calidad: formData.calidad === '1' ? '✓' : ''
//             };

//             setPaquetes(prev => [...prev, nuevoPaquete]);
            
//             // Limpiar campos pero mantener serie/lotte
//             setFormData(prev => ({
//                 ...prev,
//                 kilos: '',
//                 kilosBruto: '',
//                 tara: '',
//                 nroEtiqueta: nuevaEtiqueta + 1
//             }));

//             Swal.fire({
//                 icon: 'success',
//                 title: 'Paquete agregado',
//                 showConfirmButton: false,
//                 timer: 1000
//             });
//         } catch (error) {
//             Swal.fire('Error', 'No se pudo agregar el paquete', 'error');
//         }
//     };

//     const eliminarPaquete = (id) => {
//         Swal.fire({
//             title: '¿Eliminar paquete?',
//             text: "Esta acción no se puede deshacer",
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#d33',
//             cancelButtonColor: '#3085d6',
//             confirmButtonText: 'Sí, eliminar',
//             cancelButtonText: 'Cancelar'
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 setPaquetes(prev => prev.filter(p => p.id !== id));
//                 Swal.fire('Eliminado', 'El paquete ha sido eliminado', 'success');
//             }
//         });
//     };

//     const resetearTodo = async () => {
//         const result = await Swal.fire({
//             title: '¿Resetear todo?',
//             text: "Se eliminarán todos los paquetes cargados",
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#d33',
//             cancelButtonColor: '#3085d6',
//             confirmButtonText: 'Sí, resetear',
//             cancelButtonText: 'Cancelar'
//         });

//         if (result.isConfirmed) {
//             try {
//                 setLoading(true);
//                 await axiosInstance.post('/pesaje/reset', {
//                     operacionId,
//                     loteIds: lineaData.Lote_IDS || null,
//                     sobrante: 0
//                 });
//                 setPaquetes([]);
//                 Swal.fire('Reseteado', 'Todos los paquetes han sido eliminados', 'success');
//                 onSuccess();
//             } catch (error) {
//                 Swal.fire('Error', 'No se pudo resetear', 'error');
//             } finally {
//                 setLoading(false);
//             }
//         }
//     };

//     const confirmarRegistro = async () => {
//         if (paquetes.length === 0) {
//             Swal.fire('Atención', 'No hay paquetes para registrar', 'warning');
//             return;
//         }

//         const atados = paquetes.map(pkg => ({
//             atado: pkg.numeroPaquete,
//             rollos: parseInt(pkg.hojas) || 1,
//             peso: parseFloat(pkg.kilos),
//             esCalidad: pkg.calidad === '✓' || pkg.calidad === '1',
//             nroEtiqueta: pkg.nroEtiqueta
//         }));

//         try {
//             setLoading(true);
//             await axiosInstance.post('/pesaje/registrar', {
//                 operacionId,
//                 loteIds: lineaData.Lote_IDS || null,
//                 sobrante: 0,
//                 atados,
//                 usuario: 'usuario_actual' // Reemplazar con usuario logueado
//             });

//             Swal.fire('Éxito', 'Paquetes registrados correctamente', 'success');
//             onSuccess();
//             onClose();
//         } catch (error) {
//             Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const totalKilos = paquetes.reduce((sum, pkg) => sum + parseFloat(pkg.kilos || 0), 0);

//     return (
//         <div className="modal-overlay">
//             <div className="modal-content embalaje-modal">
//                 {/* HEADER CON X EN ESQUINA SUPERIOR DERECHA */}
//                 <div className="modal-header">
//                     <div className="header-left">
//                         <h2>REGISTRACION - Paquetes</h2>
//                     </div>
//                     <button className="modal-close" onClick={onClose}>×</button>
//                 </div>

//                 {/* INFO DEL PEDIDO */}
//                 <div className="embalaje-info-header">
//                     <div className="info-box">
//                         <strong>Nº PEDIDO:</strong> {formData.numeroPedido} | 
//                         <strong> Item:</strong> {formData.item} | 
//                         <strong> Kgs.Programados:</strong> {parseFloat(formData.kgsProgramados).toFixed(2)}
//                     </div>
//                 </div>

//                 {/* TABLA DE PAQUETES */}
//                 <div className="paquetes-table-container">
//                     <table className="paquetes-table">
//                         <thead>
//                             <tr>
//                                 <th>Nº Paquete</th>
//                                 <th>Serie/Lote</th>
//                                 <th>Kilos</th>
//                                 <th>Kilos Bruto</th>
//                                 <th>Tara</th>
//                                 <th>Hojas</th>
//                                 <th>Etiqueta</th>
//                                 <th>Nº Etiqueta</th>
//                                 <th>Calidad</th>
//                                 <th>Acción</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {paquetes.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="10" style={{textAlign: 'center', padding: '20px', color: '#888'}}>
//                                         No hay paquetes cargados
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 paquetes.map((pkg) => (
//                                     <tr key={pkg.id}>
//                                         <td>{pkg.numeroPaquete}</td>
//                                         <td>{pkg.serieLote}</td>
//                                         <td className="text-right">{pkg.kilos}</td>
//                                         <td className="text-right">{pkg.kilosBruto}</td>
//                                         <td className="text-right">{pkg.tara}</td>
//                                         <td className="text-center">{pkg.hojas}</td>
//                                         <td className="text-center">{pkg.etiqueta}</td>
//                                         <td>{pkg.nroEtiqueta}</td>
//                                         <td className="text-center">{pkg.calidad}</td>
//                                         <td className="text-center">
//                                             <button 
//                                                 className="btn-delete-row"
//                                                 onClick={() => eliminarPaquete(pkg.id)}
//                                             >
//                                                 🗑️
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                         {paquetes.length > 0 && (
//                             <tfoot>
//                                 <tr className="total-row">
//                                     <td colSpan="2" className="text-right"><strong>TOTAL:</strong></td>
//                                     <td className="text-right"><strong>{totalKilos.toFixed(2)}</strong></td>
//                                     <td colSpan="7"></td>
//                                 </tr>
//                             </tfoot>
//                         )}
//                     </table>
//                 </div>

//                 {/* FORMULARIO DE CARGA */}
//                 <div className="embalaje-form-section">
//                     <div className="form-row">
//                         <div className="form-group">
//                             <label>Serie/Lote:</label>
//                             <input
//                                 type="text"
//                                 name="serieLote"
//                                 value={formData.serieLote}
//                                 onChange={handleInputChange}
//                                 placeholder="Automático"
//                                 disabled
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Kilos:</label>
//                             <input
//                                 type="number"
//                                 name="kilos"
//                                 value={formData.kilos}
//                                 onChange={handleInputChange}
//                                 onBlur={calcularTara}
//                                 step="0.01"
//                                 placeholder="0.00"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Kilos Bruto:</label>
//                             <input
//                                 type="number"
//                                 name="kilosBruto"
//                                 value={formData.kilosBruto}
//                                 onChange={handleInputChange}
//                                 onBlur={calcularTara}
//                                 step="0.01"
//                                 placeholder="0.00"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Tara:</label>
//                             <input
//                                 type="text"
//                                 name="tara"
//                                 value={formData.tara}
//                                 readOnly
//                                 placeholder="0.00"
//                             />
//                         </div>
//                     </div>

//                     <div className="form-row">
//                         <div className="form-group">
//                             <label>Hojas:</label>
//                             <input
//                                 type="number"
//                                 name="hojas"
//                                 value={formData.hojas}
//                                 onChange={handleInputChange}
//                                 min="1"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Nº Etiqueta:</label>
//                             <input
//                                 type="text"
//                                 name="nroEtiqueta"
//                                 value={formData.nroEtiqueta}
//                                 readOnly
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Calidad:</label>
//                             <select 
//                                 name="calidad" 
//                                 value={formData.calidad} 
//                                 onChange={handleInputChange}
//                             >
//                                 <option value="0">Normal</option>
//                                 <option value="1">Calidad</option>
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 {/* BOTONES DE ACCION */}
//                 <div className="modal-footer-buttons">
//                     <button className="btn btn-agregar" onClick={agregarPaquete}>
//                         Agregar Paquete
//                     </button>
//                     <button className="btn btn-reset" onClick={resetearTodo} disabled={loading}>
//                         RESET
//                     </button>
//                     <button 
//                         className="btn btn-confirmar" 
//                         onClick={confirmarRegistro}
//                         disabled={loading || paquetes.length === 0}
//                     >
//                         {loading ? 'Procesando...' : 'CONFIRMAR REGISTRO'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PesajeEmbalajeModal;











// src/components/modals/PesajeEmbalajeModal.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './PesajeEmbalajeModal.css';

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
    
    // Datos del pedido
    const numeroPedido = lineaData?.NumeroPedido || '';
    const numeroItem = lineaData?.NumeroItem || '';
    const serieLote = lineaData?.SerieLote || '';
    const loteIdsParam = lineaData?.Lote_IDS || null;
    const sobranteParam = 0; // Embalaje normal, no sobrante

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
                // Balanza no disponible, usar valor manual
            }
        }, 1200);
        return () => clearInterval(interval);
    }, [isManualEdit]);

    const cargarPaquetesExistentes = async () => {
        try {
            setCargandoPaquetes(true);
            const idParaConsulta = lineaData?.Operacion_ID || operacionId;
            
            const res = await axiosInstance.post('/registracion/pesaje/obtener-atados', {
                operacionId: idParaConsulta,
                loteIds: loteIdsParam,
                sobrante: sobranteParam
            });
            
            const dataResponse = Array.isArray(res.data) ? res.data : [];
            
            const paquetesData = dataResponse.map((item, index) => ({
                id: item.Atado || index + 1,
                numeroPaquete: item.Atado || index + 1,
                serieLote: serieLote,
                peso: parseFloat(item.Peso) || 0,
                hojas: item.Rollos || 1, // En embalaje, "Rollos" = "Hojas"
                esCalidad: item.Calidad === 1,
                nroEtiqueta: item.Etiqueta || '',
                idBD: item.IdRegistroPesaje
            }));
            
            setPaquetes(paquetesData);
            setSobreOrdenTotal(paquetesData.filter(p => !p.esCalidad).reduce((sum, p) => sum + p.peso, 0));
            setCalidadTotal(paquetesData.filter(p => p.esCalidad).reduce((sum, p) => sum + p.peso, 0));
            
            const lastPaquete = paquetesData.length > 0 ? Math.max(...paquetesData.map(p => p.numeroPaquete), 0) : 0;
            setNumeroPaquete(lastPaquete + 1);
            
        } catch (err) {
            console.error("Error al cargar paquetes:", err);
            Swal.fire('Advertencia', 'No se pudieron cargar los paquetes existentes', 'warning');
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

    const agregarPaquete = async (esCalidad) => {
        if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
        if (hojas <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de hojas.', 'warning');
        if (!ultimaEtiqueta) return Swal.fire('Error', 'Número de etiqueta no disponible.', 'error');
        
        try {
            const nroEtiqueta = await generarEtiqueta();
            const nuevo = { 
                id: Date.now(), 
                numeroPaquete, 
                serieLote, 
                peso, 
                hojas, 
                esCalidad, 
                nroEtiqueta 
            };
            
            setPaquetes(prev => [...prev, nuevo]);
            
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
            Swal.fire('Error', 'No se pudo agregar el paquete.', 'error');
        }
    };

    const handleSobreOrden = () => agregarPaquete(false);
    const handleCalidad = () => agregarPaquete(true);

    const handleRegistrar = async () => {
        if (paquetes.length === 0) return Swal.fire('Advertencia', 'No hay paquetes para registrar.', 'warning');
        
        try {
            const idParaRegistro = lineaData?.Operacion_ID || operacionId;
            
            await axiosInstance.post('/registracion/pesaje/registrar', {
                operacionId: idParaRegistro,
                loteIds: loteIdsParam,
                sobrante: sobranteParam,
                atados: paquetes.map(p => ({
                    atado: p.numeroPaquete,
                    rollos: p.hojas,
                    peso: p.peso,
                    esCalidad: p.esCalidad,
                    nroEtiqueta: p.nroEtiqueta
                })),
                lineaData,
                usuario: 'usuario_actual' // Reemplazar con usuario logueado
            });
            
            Swal.fire('Éxito', 'Paquetes registrados correctamente.', 'success');
            onSuccess();
            onClose();
            
        } catch (err) {
            console.error("Error al registrar:", err);
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
            
            await axiosInstance.post('/registracion/pesaje/reset', {
                operacionId: idParaReset,
                loteIds: loteIdsParam,
                sobrante: sobranteParam
            });
            
            setPaquetes([]);
            setSobreOrdenTotal(0);
            setCalidadTotal(0);
            setNumeroPaquete(1);
            
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
        // Aquí iría la lógica de impresión real
    };

    const totalKilos = sobreOrdenTotal + calidadTotal;

    return (
        <div className="pesaje-modal-overlay">
            <div className="pesaje-modal embalaje-modal">
                {/* HEADER */}
                <div className="modal-header">
                    <h3>REGISTRACION - Paquetes Embalaje</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-body">
                    {/* INFO DEL PEDIDO */}
                    <div className="info-panel embalaje-info">
                        <div><strong>Nº Pedido:</strong> {numeroPedido}</div>
                        <div><strong>Item:</strong> {numeroItem}</div>
                        <div><strong>Serie/Lote:</strong> {serieLote || 'N/A'}</div>
                        <div><strong>Kgs. Programados:</strong> {programados.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    
                    {/* PESO DE BALANZA */}
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
                    
                    {/* TOTALES */}
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
                    
                    {/* FORM DE CARGA */}
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
                    
                    {/* BOTONES DE ACCIÓN */}
                    <div className="action-buttons">
                        <button onClick={handleSobreOrden} className="btn btn-so">
                            AGREGAR S.O.
                        </button>
                        <button onClick={handleCalidad} className="btn btn-calidad">
                            AGREGAR CALIDAD
                        </button>
                    </div>
                    
                    {/* GRILLA DE PAQUETES */}
                    <div className="grilla-paquetes">
                        <h4>Paquetes Registrados</h4>
                        {cargandoPaquetes ? (
                            <div className="loading">Cargando paquetes...</div>
                        ) : (
                            <table className="paquetes-table">
                                <thead>
                                    <tr>
                                        <th>Nº Paquete</th>
                                        <th>Serie/Lote</th>
                                        <th>Hojas</th>
                                        <th>Peso (Kg)</th>
                                        <th>Calidad</th>
                                        <th>Etiqueta</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paquetes.length > 0 ? paquetes.map((p, i) => (
                                        <tr key={p.id || i}>
                                            <td>{p.numeroPaquete}</td>
                                            <td>{p.serieLote}</td>
                                            <td>{p.hojas}</td>
                                            <td>{p.peso.toFixed(2)}</td>
                                            <td>{p.esCalidad ? '✓' : '-'}</td>
                                            <td>{p.nroEtiqueta}</td>
                                            <td className="acciones">
                                                <button onClick={() => imprimirEtiqueta(p)} className="btn-icon btn-imprimir" title="Imprimir">🖨️</button>
                                                <button onClick={() => handleEliminarPaquete(p, i)} className="btn-icon btn-eliminar" title="Eliminar">🗑️</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                                No hay paquetes cargados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                
                {/* FOOTER */}
                <div className="modal-footer">
                    <button onClick={handleReset} className="btn btn-reset" disabled={paquetes.length === 0}>
                        RESET
                    </button>
                    <button onClick={handleRegistrar} className="btn btn-registrar" disabled={paquetes.length === 0}>
                        CONFIRMAR REGISTRO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PesajeEmbalajeModal;
// // src/pages/EditarOperacionEmbalaje.jsx
// import React, { useEffect, useState, useMemo } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './EditarOperacion.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import SupervisorAuthModal from '../components/SupervisorAuthModal';
// import NotasCalipsoModal from '../components/NotasCalipsoModal';
// import PesajeModalSelector from '../components/PesajeModalSelector';

// const InfoItem = ({ label, value, bold = false }) => {
//     const displayValue = value !== null && value !== undefined && value !== '' ? String(value) : 'N/A';
//     return (
//         <div className="info-item">
//             <span className="info-label">{label}:</span>
//             <span className={`info-value ${bold ? 'bold' : ''}`}>{displayValue}</span>
//         </div>
//     );
// };

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number;
//     try {
//         number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     } catch (e) {
//         number = 0;
//     }
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [editedLineas, setEditedLineas] = useState([]);
//     const [hasChanges, setHasChanges] = useState(false);
    
//     // Estados para modales
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const [modalLoading, setModalLoading] = useState(false);

//     const operationStatusFromGrid = location.state?.operationStatus;

//     const fetchData = async () => {
//         if (!operacionId) {
//             navigate('/registracion');
//             return;
//         }
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle-embalaje/${operacionId}`);
//             const fetchedData = response.data || { header: {}, lineas: [], balance: {} };
            
//             setData(fetchedData);
//             setEditedLineas([...fetchedData.lineas]);
//             setHasChanges(false);
//         } catch (err) {
//             Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
//             navigate('/registracion');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, [operacionId, navigate]);

//     const currentStatus = useMemo(() => operationStatusFromGrid || data?.header?.status || '', [operationStatusFromGrid, data]);
    
//     const isOperationEditable = useMemo(() => {
//         if (!data?.header) return false;
//         return ['LISTA', 'EN_PROCESO', 'EN_CALIDAD'].includes(currentStatus);
//     }, [currentStatus, data]);

//     const handleInputChange = (index, field, value) => {
//         if (!isOperationEditable) return;
//         const numValue = parseFloat(value) || parseInt(value) || 0;
//         if (numValue < 0) return;
//         setEditedLineas(prev => {
//             const newLineas = [...prev];
//             newLineas[index][field] = numValue;
//             setHasChanges(true);
//             return newLineas;
//         });
//     };

//     const handleSaveChanges = async () => {
//         if (!hasChanges) {
//             Swal.fire('Info', 'No hay cambios para guardar.', 'info');
//             return;
//         }
//         setModalLoading(true);
//         try {
//             const changes = editedLineas.map((linea, index) => {
//                 const original = data.lineas[index];
//                 const changedFields = {};
//                 ['Programados', 'SobreOrden', 'Calidad', 'Atados', 'Rollos'].forEach(field => {
//                     if (linea[field] !== original[field]) {
//                         changedFields[field] = linea[field];
//                     }
//                 });
//                 return { ...linea, changedFields };
//             }).filter(l => Object.keys(l.changedFields).length > 0);
            
//             await axiosInstance.put(`/registracion/actualizar-lineas/${operacionId}`, { lineas: changes });
//             await Swal.fire('¡Éxito!', 'Cambios guardados correctamente.', 'success');
//             setHasChanges(false);
//             await fetchData();
//         } catch (error) {
//             console.error('Error al guardar:', error);
//             Swal.fire('Error', error.response?.data?.error || 'No se pudieron guardar los cambios.', 'error');
//         } finally {
//             setModalLoading(false);
//         }
//     };

//     const handleToggleSuspension = async (supervisorCredentials) => {
//         if (!data?.header) return;
//         const isCurrentlySuspended = (operationStatusFromGrid || data.header.status) === 'SUSPENDIDA';
//         const action = isCurrentlySuspended ? 'activar' : 'suspender';

//         try {
//             const response = await axiosInstance.post(`/registracion/operaciones/suspender/${operacionId}`, {
//                 ...supervisorCredentials,
//                 suspend: !isCurrentlySuspended
//             });
            
//             setShowSupervisorModal(false);
//             await Swal.fire('¡Éxito!', response.data.message, 'success');
//             await fetchData();
//             navigate(`/registracion/operaciones/${data.header.maquinaId}`);
//         } catch (error) {
//             setShowSupervisorModal(false);
//             if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//                 if (error.response.data?.error === 'Credenciales de supervisor incorrectas.') {
//                     Swal.fire('Error de Autenticación', 'Usuario o contraseña de supervisor incorrectos. Por favor, inténtelo de nuevo.', 'error');
//                 } else {
//                     Swal.fire('Error de Autorización', 'No autorizado para realizar esta acción.', 'error');
//                 }
//             } else {
//                 Swal.fire('Error', `No se pudo ${action} la operación debido a un error inesperado.`, 'error');
//             }
//         }
//     };

//     const handleNotasCalipsoClick = async () => {
//         setModalLoading(true);
//         setShowNotasCalipsoModal(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/notas-calipso/${operacionId}`);
//             setNotasCalipso(response.data.notes);
//         } catch (error) {
//             Swal.fire('Error', 'No se pudieron cargar las notas de Calipso.', 'error');
//             setShowNotasCalipsoModal(false);
//         } finally {
//             setModalLoading(false);
//         }
//     };

//     const handleCierreClick = async () => {
//         if (!data?.header) return;
//         const { header, balance } = data;
//         const { kgsEntrantes, sobreOrden, calidad, sobrante, scrap } = balance;

//         // === VALIDACIÓN DE TOLERANCIA ===
//         let toleranciaProg = 0;
//         let saldoCierre = 0;
        
//         saldoCierre = parseFloat(kgsEntrantes || 0) - parseFloat(sobreOrden || 0) - parseFloat(calidad || 0) - parseFloat(sobrante || 0) - parseFloat(scrap || 0);
        
//         const tolerancia = parseFloat(header.Tolerancia || 0.05);
//         toleranciaProg = parseFloat(kgsEntrantes || 0) * tolerancia;
        
//         if (Math.abs(saldoCierre) > toleranciaProg) {
//             Swal.fire({
//                 title: 'Advertencia',
//                 text: `El SALDO debe estar dentro de la TOLERANCIA para efectuar el cierre: ${toleranciaProg.toFixed(2)} kgs.`,
//                 icon: 'warning'
//             });
//             return;
//         }

//         // === VALIDAR DICTAMEN DE CALIDAD ===
//         if (parseFloat(calidad || 0) > 0) {
//             const tieneCalidadSinDictamen = editedLineas.some(linea => {
//                 return parseFloat(linea.Calidad || 0) > 0 && !linea.esSobrante && !linea.esScrap;
//             });
//             if (tieneCalidadSinDictamen) {
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'Hay Items donde falta DICTAMEN de CALIDAD',
//                     icon: 'warning'
//                 });
//                 return;
//             }
//         }

//         // === CONFIRMACIÓN DEL USUARIO ===
//         const result = await Swal.fire({
//             title: '¿Confirmar Cierre?',
//             text: 'Se CERRARA la operación. ¿CONFIRMA?',
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonText: 'Cerrar',
//             cancelButtonText: 'Cancelar'
//         });

//         if (!result.isConfirmed) return;

//         // === EJECUTAR EL CIERRE ===
//         setModalLoading(true);
//         try {
//             const response = await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, {
//                 usuario: 'pmorrone' // Reemplazar por usuario actual
//             });
//             await Swal.fire('¡Éxito!', 'Operación cerrada correctamente.', 'success');
//             await fetchData();
//             navigate(`/registracion/operaciones/${header.maquinaId}`);
//         } catch (error) {
//             console.error('Error al cerrar operación:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al cerrar la operación.', 'error');
//         } finally {
//             setModalLoading(false);
//         }
//     };

//     if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
//     if (!data) return null;

//     const { header, lineas, balance } = data;
//     const isSuspended = currentStatus === 'SUSPENDIDA';
//     const isNotasCalipsoDisabled = !header.tieneNotasCalipso;
//     const isNotasSRPDisabled = !header.tieneNotasSRP;

//     const totalSobrante = balance?.sobrante || 0;
//     const totalScrapSeriado = balance?.scrapSeriado || 0;
//     const totalScrapNoSeriado = balance?.scrapNoSeriado || 0;

//     return (
//         <>
//             <div className={`detalle-container ${isOperationEditable ? 'editar-mode' : ''}`}>
//                 <div className="main-content">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                         <h1 className="m-0" style={{ color: 'white' }}>REGISTRACION - Embalaje - Editar Operación</h1>
//                         <div className="d-flex align-items-center">
//                             <button className="btn btn-secondary" onClick={() => navigate(-1)}>
//                                 <i className="fas fa-arrow-left mr-2"></i>Volver a la Grilla
//                             </button>
//                         </div>
//                     </div>

//                     <div className="detalle-header">
//                         <div className="header-top-row">
//                             <div className="header-left-col">
//                                 <InfoItem label="Clientes" value={header.Clientes} />
//                                 <div className="row mt-2">
//                                     <div className="col-sm-6">
//                                         <InfoItem label="Serie/Lote" value={header.SerieLote} bold />
//                                         <InfoItem label="Matching" value={header.Matching} />
//                                         <InfoItem label="Batch" value={header.Batch} />
//                                     </div>
//                                     <div className="col-sm-6">
//                                         <InfoItem label="Cant.Atados" value={header.CantAtados || 0} />
//                                         <InfoItem label="Cant.Rollos" value={header.CantRollos || 0} />
//                                         <InfoItem label="Stock" value={formatNumber(header.Stock)} />
//                                         <InfoItem label="Kgs Programados" value={formatNumber(header.KgsProgramados, 2)} />
//                                     </div>
//                                 </div>
//                                 <InfoItem label="Scrap Programado" value={formatNumber(header.ScrapProgramado, 2)} />
//                             </div>
//                             <div className="header-right-col">
//                                 <div className="entrante-block">
//                                     <div className="entrante-header">ENTRANTE</div>
//                                     <div className="entrante-body">
//                                         <InfoItem label="Familia" value={header.Familia} />
//                                         <InfoItem label="Aleación" value={header.Aleacion} />
//                                         <InfoItem label="Temple" value={header.Temple} />
//                                         <InfoItem label="Espesor" value={header.Espesor} />
//                                         <InfoItem label="País Origen" value={header.PaisOrigen} />
//                                         <InfoItem label="Recubrimiento" value={header.Recubrimiento} />
//                                         <InfoItem label="Calidad" value={header.Calidad} />
//                                         <InfoItem label="Ancho" value={header.Ancho} />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
                        
//                         {/* Panel de Cod.Prod.Final, Corona, Diametro y Pasadas */}
//                         <div className="cuchillas-block" style={{ marginTop: '1rem' }}>
//                             <InfoItem label="Cod.Prod.Final" value={header.CodProdFinal || 'N/A'} bold />
//                             <InfoItem label="Corona" value={header.Corona || 'N/A'} />
//                             <InfoItem label="Diámetro" value={header.Diametro || 'N/A'} />
//                             <InfoItem label="Cant.Pasadas" value={header.Pasadas || '1'} />
//                         </div>
//                     </div>

//                     <div className="detalle-body-container">
//                         <div className="grid-header">
//                             <div>Detalle</div> 
//                             <div>Programados</div> 
//                             <div>Sobre Orden</div> 
//                             <div>Calidad (Suspendido)</div> 
//                             <div>Tot.Atados</div> 
//                             <div>Tot.Rollos</div>
//                         </div>
//                         <div className="grid-body">
//                             {editedLineas
//                                 .filter(l => !l.esSobrante && !l.esScrap)
//                                 .map((linea, index) => (
//                                     <div
//                                         key={index}
//                                         className={`grid-row ${!isOperationEditable ? 'disabled-row' : ''}`}
//                                         style={{ cursor: isOperationEditable ? 'pointer' : 'default' }}
//                                     >
//                                         <div
//                                             className="grid-cell-desc"
//                                             onClick={isOperationEditable ? () => {
//                                                 setSelectedLinea({ ...linea, bSobrante: false, bScrap: false, SerieLote: header.SerieLote });
//                                                 setShowPesajeModal(true);
//                                             } : undefined}
//                                         >
//                                             <div>{String(linea.Ancho || 'N/A')}</div>
//                                             <div>{String(linea.Tarea || 'N/A')}</div>
//                                             <div>{linea.Destino ? String(linea.Destino || '').substring(0, 11) : 'N/A'}</div>
//                                             <div>Pedido: {linea.NumeroPedido || 'N/A'}</div>
//                                             <div>Atados: {formatNumber(linea.Atados)} Rollos: {formatNumber(linea.Rollos)}</div>
//                                         </div>
//                                         <input
//                                             type="text"
//                                             className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
//                                             value={formatNumber(linea.Programados)}
//                                             readOnly
//                                             disabled={!isOperationEditable}
//                                         />
//                                         <input
//                                             type="text"
//                                             className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
//                                             value={formatNumber(linea.SobreOrden)}
//                                             readOnly
//                                             disabled={!isOperationEditable}
//                                         />
//                                         <input
//                                             type="text"
//                                             className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
//                                             value={formatNumber(linea.Calidad)}
//                                             readOnly
//                                             disabled={!isOperationEditable}
//                                         />
//                                         <input
//                                             type="text"
//                                             className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
//                                             value={formatNumber(linea.TotAtados)}
//                                             readOnly
//                                             disabled={!isOperationEditable}
//                                         />
//                                         <input
//                                             type="text"
//                                             className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
//                                             value={formatNumber(linea.TotRollos)}
//                                             readOnly
//                                             disabled={!isOperationEditable}
//                                         />
//                                     </div>
//                                 ))}
                            
//                             {/* FILAS ESPECIALES: Sobrante, Scrap Seriado, Scrap No Seriado */}
//                             {[
//                                 {
//                                     tipo: 'Sobrante',
//                                     totalSO: totalSobrante,
//                                     totalCal: 0,
//                                     totalAtados: 0,
//                                     totalRollos: 0,
//                                     bSobrante: true,
//                                     bScrap: false
//                                 },
//                                 {
//                                     tipo: 'Scrap Seriado',
//                                     totalSO: totalScrapSeriado,
//                                     totalCal: 0,
//                                     totalAtados: 0,
//                                     totalRollos: 0,
//                                     bSobrante: false,
//                                     bScrap: true
//                                 },
//                                 {
//                                     tipo: 'Scrap No Seriado',
//                                     totalSO: totalScrapNoSeriado,
//                                     totalCal: 0,
//                                     totalAtados: 0,
//                                     totalRollos: 0,
//                                     bSobrante: false,
//                                     bScrap: true
//                                 }
//                             ].map((item) => (
//                                 <div
//                                     key={item.tipo}
//                                     className={`grid-row ${!isOperationEditable ? 'disabled-row' : ''}`}
//                                     style={{ cursor: isOperationEditable ? 'pointer' : 'default' }}
//                                     onClick={isOperationEditable ? async () => {
//                                         let lineaDataParaModal = {
//                                             tipoEspecial: item.tipo,
//                                             bSobrante: item.bSobrante,
//                                             bScrap: item.bScrap,
//                                             SobreOrden: item.totalSO,
//                                             Calidad: item.totalCal,
//                                             TotAtados: item.totalAtados,
//                                             TotRollos: item.totalRollos,
//                                             SerieLote: header.SerieLote,
//                                             CodSerie: header.SerieLote,
//                                             CodigoProducto: header.CodigoProducto || '',
//                                             CodigoProductoS: header.CodigoProductoS || '',
//                                             LoteID: header.LoteID,
//                                             Tarea: item.tipo,
//                                             Maquina: 'EMB',
//                                             NroBatch: header.Batch,
//                                             Cuchillas: '',
//                                             NroMatching: header.Matching,
//                                             DestinoLote: item.tipo === 'Scrap No Seriado' ? 'Scrap No Seriado' : (header.SerieLote || ''),
//                                             Lote_IDS: item.bSobrante ? null : (header.LoteID || null)
//                                         };
//                                         setSelectedLinea(lineaDataParaModal);
//                                         setShowPesajeModal(true);
//                                     } : undefined}
//                                 >
//                                     <div className="grid-cell-desc font-weight-bold">{item.tipo}</div>
//                                     <div className="grid-cell-placeholder"></div>
//                                     <input
//                                         type="text"
//                                         className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
//                                         value={formatNumber(item.totalSO)}
//                                         readOnly
//                                         disabled={!isOperationEditable}
//                                     />
//                                     <input
//                                         type="text"
//                                         className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
//                                         value={formatNumber(item.totalCal)}
//                                         readOnly
//                                         disabled={!isOperationEditable}
//                                     />
//                                     <input
//                                         type="text"
//                                         className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
//                                         value={formatNumber(item.totalAtados)}
//                                         readOnly
//                                         disabled={!isOperationEditable}
//                                     />
//                                     <input
//                                         type="text"
//                                         className={`form-control grid-cell-input ${isOperationEditable ? 'editable' : ''}`}
//                                         value={formatNumber(item.totalRollos)}
//                                         readOnly
//                                         disabled={!isOperationEditable}
//                                     />
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="detalle-footer">
//                             <div className="balance-grid">
//                                 <div className="balance-label">Kgs.Entrantes</div>
//                                 <div className="balance-label">Programados</div>
//                                 <div className="balance-label">Sobre Orden</div>
//                                 <div className="balance-label">Calidad</div>
//                                 <div className="balance-label">Sobrante</div>
//                                 <div className="balance-label">Scrap</div>
//                                 <div className="balance-label">Saldo</div>
//                                 <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div>
//                                 <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
//                                 <div className="balance-value">{formatNumber(balance.sobreOrden)}</div>
//                                 <div className="balance-value">{formatNumber(balance.calidad)}</div>
//                                 <div className="balance-value">{formatNumber(balance.sobrante)}</div>
//                                 <div className="balance-value">{formatNumber(balance.scrap)}</div>
//                                 <div className="balance-value">{formatNumber(balance.saldo)}</div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="actions-sidebar">
//                     {hasChanges && (
//                         <button
//                             className="btn btn-success btn-block mb-2"
//                             onClick={handleSaveChanges}
//                             disabled={modalLoading}
//                         >
//                             {modalLoading ? <span className="spinner-border spinner-border-sm mr-2"></span> : null}
//                             Guardar Cambios
//                         </button>
//                     )}
                    
//                     <button
//                         className="btn btn-info btn-block"
//                         onClick={() => navigate(`/registracion/inspeccion/${operacionId}/${header.LoteID}`)}
//                     >
//                         Inspección
//                     </button>
                    
//                     <button
//                         className={`btn btn-block ${isSuspended ? 'btn-info' : 'btn-warning'}`}
//                         onClick={() => setShowSupervisorModal(true)}
//                     >
//                         {isSuspended ? 'Activar' : 'Suspender'}
//                     </button>
                    
//                     <hr style={{ borderColor: 'white', width: '100%' }} />

//                     <button
//                         className="btn btn-light btn-block"
//                         disabled={isNotasSRPDisabled}
//                     >
//                         Notas SRP
//                     </button>

//                     <button
//                         className="btn btn-light btn-block"
//                         onClick={() => setShowToleranciasModal(true)}
//                         disabled={!isOperationEditable}
//                     >
//                         Tolerancias
//                     </button>

//                     <button
//                         className="btn btn-light btn-block"
//                         onClick={() => navigate(`/registracion/fichatecnica/${operacionId}`, { state: { headerData: header } })}
//                     >
//                         Ficha Técnica
//                     </button>

//                     <button
//                         className="btn btn-light btn-block"
//                         onClick={() => navigate(`/registracion/fichaembalaje/${operacionId}`, { state: { headerData: header } })}
//                     >
//                         Ficha Embalaje
//                     </button>

//                     <button
//                         className="btn btn-light btn-block"
//                         disabled={isNotasCalipsoDisabled}
//                         onClick={handleNotasCalipsoClick}
//                     >
//                         Notas Calipso
//                     </button>

//                     {!isNotasCalipsoDisabled && (
//                         <div className="alert alert-danger mt-2 p-2 text-center" style={{
//                             fontWeight: 'bold',
//                             backgroundColor: '#dc3545',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '4px',
//                             width: '100%'
//                         }}>
//                             Existen Notas en CALIPSO
//                         </div>
//                     )}

//                     <div className="cierre-container">
//                         <button
//                             className="btn btn-success btn-block"
//                             disabled={modalLoading}
//                             onClick={handleCierreClick}
//                         >
//                             {modalLoading ? <span className="spinner-border spinner-border-sm mr-2"></span> : null}
//                             CIERRE
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {showToleranciasModal && (
//                 <ToleranciasModal
//                     operacionId={operacionId}
//                     onClose={() => setShowToleranciasModal(false)}
//                 />
//             )}

//             {showSupervisorModal && (
//                 <SupervisorAuthModal
//                     title={isSuspended ? 'Activar Operación' : 'Suspender Operación'}
//                     message={`Ingrese credenciales para ${isSuspended ? 'activar' : 'suspender'} la operación.`}
//                     onClose={() => setShowSupervisorModal(false)}
//                     onConfirm={handleToggleSuspension}
//                 />
//             )}

//             {showNotasCalipsoModal && (
//                 <NotasCalipsoModal
//                     notes={notasCalipso}
//                     onClose={() => setShowNotasCalipsoModal(false)}
//                 />
//             )}

//             {showPesajeModal && selectedLinea && (
//                 <PesajeModalSelector
//                     lineaData={selectedLinea}
//                     operacionId={operacionId}
//                     onClose={() => setShowPesajeModal(false)}
//                     onSuccess={() => fetchData()}
//                 />
//             )}
//         </>
//     );
// };

// export default EditarOperacionEmbalaje;




// // src/pages/EditarOperacionEmbalaje.jsx
// import React, { useEffect, useState, useMemo } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import SupervisorAuthModal from '../components/SupervisorAuthModal';
// import NotasCalipsoModal from '../components/NotasCalipsoModal';
// import PesajeModalSelector from '../components/PesajeModalSelector';

// const InfoItem = ({ label, value, bold = false }) => {
//     const displayValue = value !== null && value !== undefined && value !== '' ? String(value) : 'N/A';
//     return (
//         <div className="info-row">
//             <span className="info-label">{label}:</span>
//             <span className={`info-value ${bold ? 'bold' : ''}`}>{displayValue}</span>
//         </div>
//     );
// };

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number;
//     try {
//         number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     } catch (e) {
//         number = 0;
//     }
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [editedLineas, setEditedLineas] = useState([]);
//     const [hasChanges, setHasChanges] = useState(false);
    
//     // Estados para modales
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const [modalLoading, setModalLoading] = useState(false);

//     const operationStatusFromGrid = location.state?.operationStatus;

//     const fetchData = async () => {
//         if (!operacionId) {
//             navigate('/registracion');
//             return;
//         }
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle-embalaje/${operacionId}`);
//             const fetchedData = response.data || { header: {}, lineas: [], balance: {} };
            
//             setData(fetchedData);
//             setEditedLineas([...fetchedData.lineas]);
//             setHasChanges(false);
//         } catch (err) {
//             Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
//             navigate('/registracion');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, [operacionId, navigate]);

//     const currentStatus = useMemo(() => operationStatusFromGrid || data?.header?.status || '', [operationStatusFromGrid, data]);
    
//     const isOperationEditable = useMemo(() => {
//         if (!data?.header) return false;
//         return ['LISTA', 'EN_PROCESO', 'EN_CALIDAD'].includes(currentStatus);
//     }, [currentStatus, data]);

//     const handleSaveChanges = async () => {
//         if (!hasChanges) {
//             Swal.fire('Info', 'No hay cambios para guardar.', 'info');
//             return;
//         }
//         setModalLoading(true);
//         try {
//             const changes = editedLineas.map((linea, index) => {
//                 const original = data.lineas[index];
//                 const changedFields = {};
//                 ['Programados', 'SobreOrden', 'Calidad', 'Atados', 'Rollos'].forEach(field => {
//                     if (linea[field] !== original[field]) {
//                         changedFields[field] = linea[field];
//                     }
//                 });
//                 return { ...linea, changedFields };
//             }).filter(l => Object.keys(l.changedFields).length > 0);
            
//             await axiosInstance.put(`/registracion/actualizar-lineas/${operacionId}`, { lineas: changes });
//             await Swal.fire('¡Éxito!', 'Cambios guardados correctamente.', 'success');
//             setHasChanges(false);
//             await fetchData();
//         } catch (error) {
//             console.error('Error al guardar:', error);
//             Swal.fire('Error', error.response?.data?.error || 'No se pudieron guardar los cambios.', 'error');
//         } finally {
//             setModalLoading(false);
//         }
//     };

//     const handleToggleSuspension = async (supervisorCredentials) => {
//         if (!data?.header) return;
//         const isCurrentlySuspended = (operationStatusFromGrid || data.header.status) === 'SUSPENDIDA';

//         try {
//             const response = await axiosInstance.post(`/registracion/operaciones/suspender/${operacionId}`, {
//                 ...supervisorCredentials,
//                 suspend: !isCurrentlySuspended
//             });
            
//             setShowSupervisorModal(false);
//             await Swal.fire('¡Éxito!', response.data.message, 'success');
//             await fetchData();
//             navigate(`/registracion/operaciones/${data.header.maquinaId}`);
//         } catch (error) {
//             setShowSupervisorModal(false);
//             if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//                 Swal.fire('Error', 'Credenciales de supervisor incorrectas.', 'error');
//             } else {
//                 Swal.fire('Error', 'No se pudo realizar la acción.', 'error');
//             }
//         }
//     };

//     const handleNotasCalipsoClick = async () => {
//         setModalLoading(true);
//         setShowNotasCalipsoModal(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/notas-calipso/${operacionId}`);
//             setNotasCalipso(response.data.notes);
//         } catch (error) {
//             Swal.fire('Error', 'No se pudieron cargar las notas de Calipso.', 'error');
//             setShowNotasCalipsoModal(false);
//         } finally {
//             setModalLoading(false);
//         }
//     };

//     const handleCierreClick = async () => {
//         if (!data?.header) return;
//         const { header, balance } = data;
//         const { kgsEntrantes, sobreOrden, calidad, sobrante, scrap } = balance;

//         let saldoCierre = parseFloat(kgsEntrantes || 0) - parseFloat(sobreOrden || 0) - parseFloat(calidad || 0) - parseFloat(sobrante || 0) - parseFloat(scrap || 0);
//         const tolerancia = parseFloat(header.Tolerancia || 0.05);
//         const toleranciaProg = parseFloat(kgsEntrantes || 0) * tolerancia;
        
//         if (Math.abs(saldoCierre) > toleranciaProg) {
//             Swal.fire({
//                 title: 'Advertencia',
//                 text: `El SALDO debe estar dentro de la TOLERANCIA: ${toleranciaProg.toFixed(2)} kgs.`,
//                 icon: 'warning'
//             });
//             return;
//         }

//         if (parseFloat(calidad || 0) > 0) {
//             const tieneCalidadSinDictamen = editedLineas.some(linea => {
//                 return parseFloat(linea.Calidad || 0) > 0 && !linea.esSobrante && !linea.esScrap;
//             });
//             if (tieneCalidadSinDictamen) {
//                 Swal.fire({
//                     title: 'Advertencia',
//                     text: 'Hay Items donde falta DICTAMEN de CALIDAD',
//                     icon: 'warning'
//                 });
//                 return;
//             }
//         }

//         const result = await Swal.fire({
//             title: '¿Confirmar Cierre?',
//             text: 'Se CERRARA la operación. ¿CONFIRMA?',
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonText: 'Cerrar',
//             cancelButtonText: 'Cancelar'
//         });

//         if (!result.isConfirmed) return;

//         setModalLoading(true);
//         try {
//             await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, {
//                 usuario: 'pmorrone'
//             });
//             await Swal.fire('¡Éxito!', 'Operación cerrada correctamente.', 'success');
//             await fetchData();
//             navigate(`/registracion/operaciones/${header.maquinaId}`);
//         } catch (error) {
//             Swal.fire('Error', error.response?.data?.error || 'Error al cerrar la operación.', 'error');
//         } finally {
//             setModalLoading(false);
//         }
//     };

//     if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
//     if (!data) return null;

//     const { header, lineas, balance } = data;
//     const isSuspended = currentStatus === 'SUSPENDIDA';
//     const isNotasCalipsoDisabled = !header.tieneNotasCalipso;
//     const isNotasSRPDisabled = !header.tieneNotasSRP;

//     const totalSobrante = balance?.sobrante || 0;
//     const totalScrapSeriado = balance?.scrapSeriado || 0;
//     const totalScrapNoSeriado = balance?.scrapNoSeriado || 0;

//     return (
//         <div className="detalle-container moderno">
//             {/* Header */}
//             <div className="moderno-header">
//                 <h1>REGISTRACION Slitter 4 - Editar Operación</h1>
//                 <div className="header-actions">
//                     <button className="btn-volver" onClick={() => navigate(-1)}>
//                         <i className="fas fa-arrow-left"></i> Volver a la Grilla
//                     </button>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="main-content-moderno">
//                 {/* Info Section */}
//                 <div className="info-section">
//                     <div className="info-grid">
//                         <div className="info-column">
//                             <h3>Información General</h3>
//                             <InfoItem label="Clientes" value={header.Clientes} />
//                             <InfoItem label="Serie/Lote" value={header.SerieLote} bold />
//                             <InfoItem label="Matching" value={header.Matching} />
//                             <InfoItem label="Batch" value={header.Batch} />
//                             <InfoItem label="Scrap Programado" value={`${formatNumber(header.ScrapProgramado, 2)}`} />
//                         </div>
                        
//                         <div className="panel-central">
//                             <div className="cod-prod-label">Cod.Prod.Final:</div>
//                             <div className="cod-prod-final">{header.CodProdFinal || 'N/A'}</div>
//                             <div style={{ marginTop: '15px' }}>
//                                 <InfoItem label="Cant.Atados" value={header.CantAtados || 0} />
//                                 <InfoItem label="Cant.Rollos" value={header.CantRollos || 0} />
//                                 <InfoItem label="Stock" value={formatNumber(header.Stock)} />
//                                 <InfoItem label="Kgs Programados" value={`${formatNumber(header.KgsProgramados, 2)} (teóricos)`} />
//                             </div>
//                         </div>
                        
//                         <div className="entrante-panel">
//                             <div className="entrante-header">ENTRANTE</div>
//                             <InfoItem label="Familia" value={header.Familia} />
//                             <InfoItem label="Aleación" value={header.Aleacion} />
//                             <InfoItem label="Temple" value={header.Temple} />
//                             <InfoItem label="Espesor" value={header.Espesor} />
//                             <InfoItem label="País Origen" value={header.PaisOrigen} />
//                             <InfoItem label="Recubrimiento" value={header.Recubrimiento} />
//                             <InfoItem label="Calidad" value={header.Calidad} />
//                             <InfoItem label="Ancho" value={header.Ancho} />
//                         </div>
//                     </div>
                    
//                     {/* Detalles adicionales */}
//                     <div className="panel-detalles">
//                         <div className="detalle-item">
//                             <div className="detalle-label">Cuchillas:</div>
//                             <div className="detalle-value">{header.Cuchillas || 'N/A'}</div>
//                         </div>
//                         <div className="detalle-item">
//                             <div className="detalle-label">Pasadas:</div>
//                             <div className="detalle-value">{header.Pasadas || '1'}</div>
//                         </div>
//                         <div className="detalle-item">
//                             <div className="detalle-label">Diámetro:</div>
//                             <div className="detalle-value">{header.Diametro || 'N/A'}</div>
//                         </div>
//                         <div className="detalle-item">
//                             <div className="detalle-label">Corona:</div>
//                             <div className="detalle-value">{header.Corona || 'N/A'}</div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Grid Container */}
//                 <div className="grid-container-moderno">
//                     <div className="grid-header-moderno">
//                         <div>Detalle</div>
//                         <div>Programados</div>
//                         <div>Sobre Orden</div>
//                         <div>Calidad (Suspendido)</div>
//                         <div>Atados</div>
//                         <div>Rollos</div>
//                     </div>
                    
//                     <div className="grid-body">
//                         {editedLineas
//                             .filter(l => !l.esSobrante && !l.esScrap)
//                             .map((linea, index) => (
//                                 <div
//                                     key={index}
//                                     className="grid-row-moderno"
//                                     style={{ cursor: isOperationEditable ? 'pointer' : 'default' }}
//                                     onClick={isOperationEditable ? () => {
//                                         setSelectedLinea({ ...linea, bSobrante: false, bScrap: false, SerieLote: header.SerieLote });
//                                         setShowPesajeModal(true);
//                                     } : undefined}
//                                 >
//                                     <div className="grid-cell-desc">
//                                         <strong>{linea.Ancho || 'N/A'}</strong>
//                                         <div>{linea.Cuchillas || ''}</div>
//                                         <div>{linea.Tarea || 'Embalaje'}</div>
//                                         <div>Pedido: {linea.NumeroPedido || 'N/A'}</div>
//                                         <div>Atados: {formatNumber(linea.Atados)} Rollos: {formatNumber(linea.Rollos)}</div>
//                                     </div>
//                                     <div className="grid-cell-value">{formatNumber(linea.Programados)}</div>
//                                     <div className="grid-cell-value">{formatNumber(linea.SobreOrden)}</div>
//                                     <div className="grid-cell-value">{formatNumber(linea.Calidad)}</div>
//                                     <div className="grid-cell-value">{formatNumber(linea.TotAtados)}</div>
//                                     <div className="grid-cell-value">{formatNumber(linea.TotRollos)}</div>
//                                 </div>
//                             ))}
                        
//                         {/* Scrap Buttons */}
//                         <div className="scrap-buttons-container">
//                             <div
//                                 className="scrap-button-moderno"
//                                 onClick={isOperationEditable ? () => {
//                                     setSelectedLinea({
//                                         tipoEspecial: 'Scrap Seriado',
//                                         bSobrante: false,
//                                         bScrap: true,
//                                         SerieLote: header.SerieLote,
//                                         LoteID: header.LoteID
//                                     });
//                                     setShowPesajeModal(true);
//                                 } : undefined}
//                             >
//                                 Scrap Seriado
//                             </div>
//                             <div
//                                 className="scrap-button-moderno"
//                                 onClick={isOperationEditable ? () => {
//                                     setSelectedLinea({
//                                         tipoEspecial: 'Scrap No Seriado',
//                                         bSobrante: false,
//                                         bScrap: true,
//                                         SerieLote: header.SerieLote,
//                                         LoteID: header.LoteID
//                                     });
//                                     setShowPesajeModal(true);
//                                 } : undefined}
//                             >
//                                 Scrap No Seriado
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Balance Section */}
//                 <div className="balance-section">
//                     <div className="balance-title">Balance de Masas</div>
//                     <div className="balance-grid-moderno">
//                         <div className="balance-item">
//                             <div className="balance-label-moderno">Kgs.Entrantes</div>
//                             <div className="balance-value-moderno">{formatNumber(balance.kgsEntrantes)}</div>
//                         </div>
//                         <div className="balance-item">
//                             <div className="balance-label-moderno">Programados</div>
//                             <div className="balance-value-moderno">{formatNumber(balance.programados, 2)}</div>
//                         </div>
//                         <div className="balance-item">
//                             <div className="balance-label-moderno">Sobre Orden</div>
//                             <div className="balance-value-moderno">{formatNumber(balance.sobreOrden)}</div>
//                         </div>
//                         <div className="balance-item">
//                             <div className="balance-label-moderno">Calidad</div>
//                             <div className="balance-value-moderno">{formatNumber(balance.calidad)}</div>
//                         </div>
//                         <div className="balance-item">
//                             <div className="balance-label-moderno">Sobrante</div>
//                             <div className="balance-value-moderno">{formatNumber(balance.sobrante)}</div>
//                         </div>
//                         <div className="balance-item">
//                             <div className="balance-label-moderno">Scrap</div>
//                             <div className="balance-value-moderno">{formatNumber(balance.scrap)}</div>
//                         </div>
//                         <div className="balance-item">
//                             <div className="balance-label-moderno">Saldo</div>
//                             <div className="balance-value-moderno saldo">{formatNumber(balance.saldo)}</div>
//                         </div>
//                         <div className="balance-item">
//                             <div className="balance-label-moderno">Bruto</div>
//                             <div className="balance-value-moderno">{formatNumber(balance.bruto || 0)}</div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Sidebar */}
//             <div className="sidebar-moderno">
//                 <button
//                     className="sidebar-button primary"
//                     onClick={() => navigate(`/registracion/inspeccion/${operacionId}/${header.LoteID}`)}
//                 >
//                     Inspección
//                 </button>
                
//                 <button
//                     className={`sidebar-button warning`}
//                     onClick={() => setShowSupervisorModal(true)}
//                 >
//                     {isSuspended ? 'Activar' : 'Suspender'}
//                 </button>
                
//                 <hr className="sidebar-divider" />

//                 <button
//                     className="sidebar-button secondary"
//                     disabled={isNotasSRPDisabled}
//                 >
//                     Notas SRP
//                 </button>

//                 <button
//                     className="sidebar-button secondary"
//                     onClick={() => setShowToleranciasModal(true)}
//                     disabled={!isOperationEditable}
//                 >
//                     Tolerancias
//                 </button>

//                 <button
//                     className="sidebar-button secondary"
//                     onClick={() => navigate(`/registracion/fichatecnica/${operacionId}`, { state: { headerData: header } })}
//                 >
//                     Ficha Técnica
//                 </button>

//                 <button
//                     className="sidebar-button secondary"
//                     onClick={() => navigate(`/registracion/fichaembalaje/${operacionId}`, { state: { headerData: header } })}
//                 >
//                     Ficha Embalaje
//                 </button>

//                 <button
//                     className="sidebar-button secondary"
//                     disabled={isNotasCalipsoDisabled}
//                     onClick={handleNotasCalipsoClick}
//                 >
//                     Notas Calipso
//                 </button>

//                 {!isNotasCalipsoDisabled && (
//                     <div className="alert-notas">
//                         Existen Notas en CALIPSO
//                     </div>
//                 )}

//                 <button
//                     className="btn-cierre-moderno"
//                     disabled={modalLoading}
//                     onClick={handleCierreClick}
//                 >
//                     {modalLoading ? <span className="spinner-border spinner-border-sm mr-2"></span> : null}
//                     CIERRE
//                 </button>
//             </div>

//             {/* Modales */}
//             {showToleranciasModal && (
//                 <ToleranciasModal
//                     operacionId={operacionId}
//                     onClose={() => setShowToleranciasModal(false)}
//                 />
//             )}

//             {showSupervisorModal && (
//                 <SupervisorAuthModal
//                     title={isSuspended ? 'Activar Operación' : 'Suspender Operación'}
//                     message={`Ingrese credenciales para ${isSuspended ? 'activar' : 'suspender'} la operación.`}
//                     onClose={() => setShowSupervisorModal(false)}
//                     onConfirm={handleToggleSuspension}
//                 />
//             )}

//             {showNotasCalipsoModal && (
//                 <NotasCalipsoModal
//                     notes={notasCalipso}
//                     onClose={() => setShowNotasCalipsoModal(false)}
//                 />
//             )}

//             {showPesajeModal && selectedLinea && (
//                 <PesajeModalSelector
//                     lineaData={selectedLinea}
//                     operacionId={operacionId}
//                     onClose={() => setShowPesajeModal(false)}
//                     onSuccess={() => fetchData()}
//                 />
//             )}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;





// import React, { useEffect, useState, useMemo } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import SupervisorAuthModal from '../components/SupervisorAuthModal';
// import NotasCalipsoModal from '../components/NotasCalipsoModal';
// import PesajeModalSelector from '../components/PesajeModalSelector';

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [editedLineas, setEditedLineas] = useState([]);
    
//     // Modales
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);

//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle-embalaje/${operacionId}`);
//             setData(response.data);
//             setEditedLineas(response.data.lineas);
//         } catch (err) {
//             Swal.fire('Error', 'No se pudo cargar el detalle.', 'error');
//             navigate('/registracion');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchData(); }, [operacionId]);

//     if (loading || !data) return <div className="loading-legacy">Cargando Operación...</div>;

//     const { header, balance } = data;

//     return (
//         <div className="legacy-container">
//             {/* BARRA SUPERIOR AZUL/GRIS */}
//             <div className="legacy-top-header">
//                 <div className="header-title-section">
//                     <span className="title-main">REGISTRACION - Embalaje</span>
//                     <span className="user-info">Usuario: <strong>pmorrone</strong></span>
//                 </div>
//             </div>

//             <div className="legacy-main-layout">
//                 <div className="legacy-content-area">
//                     {/* SECCION INFO SUPERIOR */}
//                     <div className="legacy-info-grid">
//                         <div className="info-left">
//                             <div className="info-row"><span>Clientes:</span> <strong>{header.Clientes || 'NP032523-SABO INDUSTRIA E COM'}</strong></div>
//                             <div className="info-row mt-15"><span>Serie/Lote:</span> <strong>{header.SerieLote}</strong></div>
//                             <div className="info-row"><span>Nro.Operación:</span> <strong>{header.Matching || '00967103-1'}</strong></div>
//                             <div className="info-row"><span>Batch:</span> <strong>{header.Batch}</strong></div>
//                         </div>

//                         <div className="info-center">
//                             <div className="cod-prod-container">
//                                 <span className="label-small">Cod.Prod.Final:</span>
//                                 <div className="cod-prod-value">{header.CodProdFinal}</div>
//                             </div>
//                             <div className="info-row-center">
//                                 <div className="blue-labels">
//                                     <div>Cant.Atados: <span className="val">{header.CantAtados || 1}</span></div>
//                                     <div>Cant.Rollos: <span className="val">{header.CantRollos || 1}</span></div>
//                                 </div>
//                                 <div className="stock-info">
//                                     <div>Stock: <strong>{formatNumber(header.Stock)}</strong></div>
//                                     <div>Kgs.Programados: <strong>{formatNumber(header.KgsProgramados)}</strong> (teóricos)</div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="info-right-box">
//                             <div className="box-title">ENTRANTE</div>
//                             <div className="box-content">
//                                 <div className="box-row"><span>Familia:</span> <span>Hojalata</span></div>
//                                 <div className="box-row"><span>Aleación:</span> <span>NA</span></div>
//                                 <div className="box-row"><span>Temple:</span> <span>T3</span></div>
//                                 <div className="box-row"><span>Espesor:</span> <span>0,2200000000</span></div>
//                                 <div className="box-row"><span>País Origen:</span> <span>P</span></div>
//                                 <div className="box-row"><span>Recubrimiento:</span> <span>E-1</span></div>
//                                 <div className="box-row"><span>Calidad:</span> <span>01</span></div>
//                                 <div className="box-row"><span>Ancho:</span> <span>220</span></div>
//                                 <div className="box-row blue-txt"><span>SI02-PP-HO-PP-0220-0000-1NP-21</span></div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* GRILLA PRINCIPAL - ESTILO ORIGINAL */}
//                     <div className="legacy-grid-section">
//                         <div className="legacy-grid-headers">
//                             <div className="h-detalle">Detalle</div>
//                             <div className="h-prog">Programados</div>
//                             <div className="h-orden">Sobre Orden</div>
//                             <div className="h-calidad">Calidad<br/>(Kg.Suspendidos)</div>
//                             <div className="h-paquetes">
//                                 Paquetes
//                                 <div className="h-sub">
//                                     <span>Tot.Atados</span>
//                                     <span>Tot.Rollos</span>
//                                 </div>
//                             </div>
//                             <div className="h-bruto">Bruto</div>
//                         </div>

//                         <div className="legacy-grid-body">
//                             {editedLineas.filter(l => !l.esSobrante && !l.esScrap).map((linea, idx) => (
//                                 <div key={idx} className="legacy-data-row">
//                                     <div className="row-left">
//                                         <div className="detail-box-crema" onClick={() => { setSelectedLinea(linea); setShowPesajeModal(true); }}>
//                                             <strong>Pedido:{linea.NumeroPedido || '032523'}</strong><br/>
//                                             Item:{linea.Item || '2'}<br/>
//                                             NºDoc: {linea.NoDoc || '00967103-01-002'}<br/>
//                                             Atados: {linea.Atados} Rollos: {linea.Rollos}
//                                         </div>
//                                         <div className="scrap-btn-group">
//                                             <div className="scrap-small-box">Scrap Seriado</div>
//                                             <div className="scrap-small-box">Scrap No Seriado</div>
//                                         </div>
//                                     </div>
//                                     <div className="row-values">
//                                         <div className="val-box-crema big-txt">{formatNumber(linea.Programados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.SobreOrden)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.Calidad)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.TotAtados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.TotRollos)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.Bruto || 266)}</div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* BALANCE DE MASAS */}
//                     <div className="legacy-balance-container">
//                         <fieldset className="legacy-fieldset">
//                             <legend>Balance de Masas</legend>
//                             <div className="balance-grid">
//                                 <div className="bal-col"><span>Kgs.Entrantes</span><div className="bal-val">{formatNumber(balance.kgsEntrantes)}</div></div>
//                                 <div className="bal-col"><span>Programados</span><div className="bal-val">{formatNumber(balance.programados)}</div></div>
//                                 <div className="bal-col"><span>Sobre Orden</span><div className="bal-val">{formatNumber(balance.sobreOrden)}</div></div>
//                                 <div className="bal-col"><span>Calidad</span><div className="bal-val">{formatNumber(balance.calidad)}</div></div>
//                                 <div className="bal-col"><span>Sobrante</span><div className="bal-val">{formatNumber(balance.sobrante)}</div></div>
//                                 <div className="bal-col"><span>Scrap</span><div className="bal-val">{formatNumber(balance.scrap)}</div></div>
//                                 <div className="bal-col"><span>Scrap Seriado</span><div className="bal-val">0</div></div>
//                                 <div className="bal-col"><span>Saldo</span><div className="bal-val blue-v">{formatNumber(balance.saldo)}</div></div>
//                                 <div className="bal-col"><span>Bruto</span><div className="bal-val">{formatNumber(balance.bruto || 266)}</div></div>
//                             </div>
//                         </fieldset>
//                     </div>
//                 </div>

//                 {/* SIDEBAR DERECHO */}
//                 <div className="legacy-sidebar">
//                     <button className="leg-btn italic-btn">Notas SRP</button>
//                     <button className="leg-btn italic-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
//                     <button className="leg-btn italic-btn">Ficha Técnica</button>
//                     <button className="leg-btn italic-btn">Ficha Embalaje</button>
//                     <button className="leg-btn italic-btn">Notas Calipso</button>
                    
//                     <div className="calipso-alert">
//                         Existen Notas<br/>en CALIPSO
//                     </div>

//                     <button className="leg-btn-cierre" onClick={() => {/* handleCierre */}}>CIERRE</button>
//                 </div>
//             </div>

//             {/* Modales */}
//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
//             {showPesajeModal && selectedLinea && (
//                 <PesajeModalSelector lineaData={selectedLinea} operacionId={operacionId} onClose={() => setShowPesajeModal(false)} onSuccess={() => fetchData()} />
//             )}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;




// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeModalSelector from '../components/PesajeModalSelector';

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);

//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle-embalaje/${operacionId}`);
//             setData(response.data);
//         } catch (err) {
//             navigate('/registracion');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchData(); }, [operacionId]);

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     return (
//         <div className="slitter-container">
//             <header className="slitter-header">
//                 <div className="header-left"><h1>REGISTRACION Embalaje - Editar Operación</h1></div>
//                 <div className="header-right"><button className="back-link" onClick={() => navigate(-1)}>← Volver a la Grilla</button></div>
//             </header>

//             <div className="slitter-layout">
//                 <main className="slitter-main-content">
//                     <div className="slitter-top-info">
//                         <div className="client-info-box">
//                             <div className="info-grid-main">
//                                 <div className="info-left-group">
//                                     <p><strong>Clientes:</strong> {header.Clientes}</p>
//                                     <p><strong>Serie/Lote:</strong> {header.SerieLote}</p>
//                                     <p><strong>Matching:</strong> {header.Matching}</p>
//                                     <p><strong>Batch:</strong> {header.Batch}</p>
//                                 </div>
//                                 <div className="info-right-group">
//                                     <p><strong>Cant.Atados:</strong> {header.CantAtados}</p>
//                                     <p><strong>Cant.Rollos:</strong> {header.CantRollos}</p>
//                                     <p><strong>Stock:</strong> {formatNumber(header.Stock)}</p>
//                                     <p><strong>Kgs Programados:</strong> {formatNumber(header.KgsProgramados)}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="slitter-entrante-box">
//                             <div className="box-header">ENTRANTE</div>
//                             <div className="box-body">
//                                 <div className="box-row"><span>Familia:</span> {header.Familia}</div>
//                                 <div className="box-row"><span>Aleación:</span> {header.Aleacion}</div>
//                                 <div className="box-row"><span>Temple:</span> {header.Temple}</div>
//                                 <div className="box-row"><span>Espesor:</span> {header.Espesor}</div>
//                                 <div className="box-row"><span>País Origen:</span> {header.PaisOrigen}</div>
//                                 <div className="box-row"><span>Recubrimiento:</span> {header.Recubrimiento}</div>
//                                 <div className="box-row"><span>Calidad:</span> {header.Calidad}</div>
//                                 <div className="box-row"><span>Ancho:</span> {header.Ancho}</div>
//                                 <div className="blue-cod-text-box">{header.CodProdFinal}</div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="slitter-middle-bar"><strong>Cod. Prod. Final:</strong> {header.CodProdFinal}</div>

//                     <div className="production-grid-area">
//                         <div className="grid-header-labels">
//                             <div className="h-det">Detalle</div>
//                             <div className="h-val">Programados</div>
//                             <div className="h-val">Sobre Orden</div>
//                             <div className="h-val">Calidad (Suspendido)</div>
//                             <div className="h-val">Atados</div>
//                             <div className="h-val">Rollos</div>
//                             <div className="h-val">Bruto</div>
//                         </div>

//                         {lineas.map((linea, idx) => (
//                             <div key={idx} className="production-row-block">
//                                 <div className="row-left-panel">
//                                     <div className="pedido-card-crema" onClick={() => { setSelectedLinea(linea); setShowPesajeModal(true); }}>
//                                         <strong>Pedido: {linea.NumeroPedido}</strong><br/>
//                                         Item: {linea.NumeroItem}<br/>
//                                         Doc: {linea.NoDoc}<br/>
//                                         Atados: {linea.AtadosTeoricos || linea.Atados} Rollos: {linea.RollosTeoricos || linea.Rollos}
//                                     </div>
//                                     <div className="scrap-btn-row">
//                                         <div className="btn-scrap-crema">Scrap Seriado</div>
//                                         <div className="btn-scrap-crema">Scrap No Seriado</div>
//                                     </div>
//                                 </div>

//                                 <div className="row-right-values">
//                                     <div className="values-line">
//                                         <div className="val-box-crema big-text">{formatNumber(linea.Programados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.SobreOrden)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.Calidad)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.TotAtados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.TotRollos)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.Bruto)}</div>
//                                     </div>
//                                     <div className="values-line sub-row">
//                                         <div className="val-box-crema transparent"></div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapKgs)}</div>
//                                         <div className="val-box-crema transparent"></div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapAtados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapRollos)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapBruto)}</div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     {/* BALANCE INFERIOR ACTUALIZADO CON LAS 9 COLUMNAS */}
//                     <footer className="slitter-balance-footer">
//                         <div className="bal-col"><span>Kgs. Entrantes</span><strong>{formatNumber(balance.kgsEntrantes)}</strong></div>
//                         <div className="bal-col"><span>Programados</span><strong>{formatNumber(balance.programados)}</strong></div>
//                         <div className="bal-col"><span>Sobre Orden</span><strong>{formatNumber(balance.sobreOrden)}</strong></div>
//                         <div className="bal-col"><span>Calidad</span><strong>{formatNumber(balance.calidad)}</strong></div>
//                         <div className="bal-col"><span>Sobrante</span><strong>{formatNumber(balance.sobrante)}</strong></div>
//                         <div className="bal-col"><span>Scrap</span><strong>{formatNumber(balance.scrap)}</strong></div>
//                         <div className="bal-col"><span>Scrap Seriado</span><strong>{formatNumber(balance.scrapSeriado || 0)}</strong></div>
//                         <div className="bal-col"><span>Saldo</span><strong className="blue-saldo-text">{formatNumber(balance.saldo)}</strong></div>
//                         <div className="bal-col"><span>Bruto</span><strong>{formatNumber(balance.bruto || 0)}</strong></div>
//                     </footer>
//                 </main>

//                 <aside className="slitter-sidebar">
//                     <div className="side-btns-group">
//                         <button className="side-btn">Notas SRP</button>
//                         <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
//                         <button className="side-btn">Ficha Técnica</button>
//                         <button className="side-btn">Notas Calipso</button>
//                     </div>
//                     {header.tieneNotasCalipso && <div className="side-red-alert-box">Existen Notas en CALIPSO</div>}
//                     <button className="side-btn btn-green-cierre">CIERRE</button>
//                 </aside>
//             </div>
//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;





// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeModalSelector from '../components/PesajeModalSelector';

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);

//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle-embalaje/${operacionId}`);
//             setData(response.data);
//         } catch (err) {
//             console.error("Error al cargar datos:", err);
//             navigate('/registracion');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchData(); }, [operacionId]);

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     return (
//         <div className="slitter-container">
//             <header className="slitter-header">
//                 <div className="header-left"><h1>REGISTRACION Embalaje - Editar Operación</h1></div>
//                 <div className="header-right"><button className="back-link" onClick={() => navigate(-1)}>← Volver a la Grilla</button></div>
//             </header>

//             <div className="slitter-layout">
//                 <main className="slitter-main-content">
//                     <div className="slitter-top-info">
//                         <div className="client-info-box">
//                             <div className="info-grid-main">
//                                 <div className="info-left-group">
//                                     <p><strong>Clientes:</strong> <span className="val-text">{header.Clientes || 'N/A'}</span></p>
//                                     <p><strong>Serie/Lote:</strong> <span className="val-text">{header.SerieLote}</span></p>
//                                     <p><strong>Matching:</strong> <span className="val-text">{header.Matching}</span></p>
//                                     <p><strong>Batch:</strong> <span className="val-text">{header.Batch}</span></p>
//                                 </div>
//                                 <div className="info-right-group">
//                                     {/* CONTADORES EN AZUL COMO LA ORIGINAL */}
//                                     <p><strong>Cant.Atados:</strong> <span className="blue-counter">{header.CantAtados || 0}</span></p>
//                                     <p><strong>Cant.Rollos:</strong> <span className="blue-counter">{header.CantRollos || 0}</span></p>
//                                     <p><strong>Stock:</strong> <span className="val-text">{formatNumber(header.Stock)}</span></p>
//                                     <p><strong>Kgs Programados:</strong> <span className="val-text">{formatNumber(header.KgsProgramados)}</span></p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="slitter-entrante-box">
//                             <div className="box-header">ENTRANTE</div>
//                             <div className="box-body">
//                                 <div className="box-row"><span>Familia:</span> {header.Familia}</div>
//                                 <div className="box-row"><span>Aleación:</span> {header.Aleacion}</div>
//                                 <div className="box-row"><span>Temple:</span> {header.Temple}</div>
//                                 <div className="box-row"><span>Espesor:</span> {header.Espesor}</div>
//                                 <div className="box-row"><span>País Origen:</span> {header.PaisOrigen}</div>
//                                 <div className="box-row"><span>Recubrimiento:</span> {header.Recubrimiento}</div>
//                                 <div className="box-row"><span>Calidad:</span> {header.Calidad}</div>
//                                 <div className="box-row"><span>Ancho:</span> {header.Ancho}</div>
//                                 <div className="blue-cod-text-box">{header.CodProdFinal}</div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="slitter-middle-bar"><strong>Cod. Prod. Final:</strong> {header.CodProdFinal}</div>

//                     <div className="production-grid-area">
//                         <div className="grid-header-labels">
//                             <div className="h-det">Detalle</div>
//                             <div className="h-val">Programados</div>
//                             <div className="h-val">Sobre Orden</div>
//                             <div className="h-val">Calidad (Suspendido)</div>
//                             <div className="h-val">Atados</div>
//                             <div className="h-val">Rollos</div>
//                             <div className="h-val">Bruto</div>
//                         </div>

//                         {lineas.map((linea, idx) => (
//                             <div key={idx} className="production-row-block">
//                                 <div className="row-left-panel">
//                                     <div className="pedido-card-crema" onClick={() => { setSelectedLinea(linea); setShowPesajeModal(true); }}>
//                                         <strong>Pedido: {linea.NumeroPedido}</strong><br/>
//                                         Item: {linea.NumeroItem}<br/>
//                                         Doc: {linea.NoDoc}<br/>
//                                         Atados: {linea.AtadosTeoricos || 1} Rollos: {linea.RollosTeoricos || 1}
//                                     </div>
//                                     <div className="scrap-btn-row">
//                                         <div className="btn-scrap-crema">Scrap Seriado</div>
//                                         <div className="btn-scrap-crema">Scrap No Seriado</div>
//                                     </div>
//                                 </div>

//                                 <div className="row-right-values">
//                                     <div className="values-line">
//                                         <div className="val-box-crema big-text">{formatNumber(linea.Programados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.SobreOrden)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.Calidad)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.TotAtados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.TotRollos)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.Bruto)}</div>
//                                     </div>
//                                     <div className="values-line sub-row">
//                                         <div className="val-box-crema transparent"></div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapKgs)}</div>
//                                         <div className="val-box-crema transparent"></div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapAtados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapRollos)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapBruto)}</div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     <footer className="slitter-balance-footer">
//                         <div className="bal-col"><span>Kgs. Entrantes</span><strong>{formatNumber(balance.kgsEntrantes)}</strong></div>
//                         <div className="bal-col"><span>Programados</span><strong>{formatNumber(balance.programados)}</strong></div>
//                         <div className="bal-col"><span>Sobre Orden</span><strong>{formatNumber(balance.sobreOrden)}</strong></div>
//                         <div className="bal-col"><span>Calidad</span><strong>{formatNumber(balance.calidad)}</strong></div>
//                         <div className="bal-col"><span>Sobrante</span><strong>{formatNumber(balance.sobrante)}</strong></div>
//                         <div className="bal-col"><span>Scrap</span><strong>{formatNumber(balance.scrap)}</strong></div>
//                         <div className="bal-col"><span>Scrap Seriado</span><strong>{formatNumber(balance.scrapSeriado || 0)}</strong></div>
//                         <div className="bal-col"><span>Saldo</span><strong className="blue-saldo-text">{formatNumber(balance.saldo)}</strong></div>
//                         <div className="bal-col"><span>Bruto</span><strong>{formatNumber(balance.bruto || 0)}</strong></div>
//                     </footer>
//                 </main>

//                 <aside className="slitter-sidebar">
//                     <div className="side-btns-group">
//                         <button className="side-btn">Notas SRP</button>
//                         <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
//                         <button className="side-btn">Ficha Técnica</button>
//                         <button className="side-btn">Notas Calipso</button>
//                     </div>
//                     {header.tieneNotasCalipso && <div className="side-red-alert-box">Existen Notas en CALIPSO</div>}
//                     <button className="side-btn btn-green-cierre">CIERRE</button>
//                 </aside>
//             </div>
//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;








// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeModalSelector from '../components/PesajeModalSelector';

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);

//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle-embalaje/${operacionId}`);
//             setData(response.data);
//         } catch (err) {
//             console.error("Error al cargar datos:", err);
//             navigate('/registracion');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchData(); }, [operacionId]);

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     return (
//         <div className="slitter-container">
//             <header className="slitter-header">
//                 <div className="header-left"><h1>REGISTRACION Embalaje - Editar Operación</h1></div>
//                 <div className="header-right"><button className="back-link" onClick={() => navigate(-1)}>← Volver a la Grilla</button></div>
//             </header>

//             <div className="slitter-layout">
//                 <main className="slitter-main-content">
//                     <div className="slitter-top-info">
//                         <div className="client-info-box">
//                             <div className="info-grid-main">
//                                 <div className="info-left-group">
//                                     <p><strong>Clientes:</strong> <span>{header.Clientes}</span></p>
//                                     <p><strong>Serie/Lote:</strong> <span>{header.SerieLote}</span></p>
//                                     <p><strong>Matching:</strong> <span>{header.Matching}</span></p>
//                                     <p><strong>Batch:</strong> <span>{header.Batch}</span></p>
//                                 </div>
//                                 <div className="info-right-group">
//                                     <p><strong>Cant.Atados:</strong> <span className="blue-counter">{header.CantAtados}</span></p>
//                                     <p><strong>Cant.Rollos:</strong> <span className="blue-counter">{header.CantRollos}</span></p>
//                                     <p><strong>Stock:</strong> <span>{formatNumber(header.Stock)}</span></p>
//                                     <p><strong>Kgs Programados:</strong> <span>{formatNumber(header.KgsProgramados)}</span></p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="slitter-entrante-box">
//                             <div className="box-header">ENTRANTE</div>
//                             <div className="box-body">
//                                 <div className="box-row"><span>Familia:</span> {header.Familia}</div>
//                                 <div className="box-row"><span>Aleación:</span> {header.Aleacion}</div>
//                                 <div className="box-row"><span>Temple:</span> {header.Temple}</div>
//                                 <div className="box-row"><span>Espesor:</span> {header.Espesor}</div>
//                                 <div className="box-row"><span>País Origen:</span> {header.PaisOrigen}</div>
//                                 <div className="box-row"><span>Recubrimiento:</span> {header.Recubrimiento}</div>
//                                 <div className="box-row"><span>Calidad:</span> {header.Calidad}</div>
//                                 <div className="box-row"><span>Ancho:</span> {header.Ancho}</div>
//                                 <div className="blue-cod-text-box">{header.CodProdFinal}</div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="slitter-middle-bar"><strong>Cod. Prod. Final:</strong> {header.CodProdFinal}</div>

//                     <div className="production-grid-area">
//                         <div className="grid-header-labels">
//                             <div className="h-det">Detalle</div>
//                             <div className="h-val">Programados</div>
//                             <div className="h-val">Sobre Orden</div>
//                             <div className="h-val">Calidad (Suspendido)</div>
//                             <div className="h-val">Atados</div>
//                             <div className="h-val">Rollos</div>
//                             <div className="h-val">Bruto</div>
//                         </div>

//                         {lineas.map((linea, idx) => (
//                             <div key={idx} className="production-row-block">
//                                 <div className="row-left-panel">
//                                     <div className="pedido-card-crema" onClick={() => { setSelectedLinea(linea); setShowPesajeModal(true); }}>
//                                         <strong>Pedido: {linea.NumeroPedido}</strong><br/>
//                                         Item: {linea.NumeroItem}<br/>
//                                         Doc: {linea.NoDoc}<br/>
//                                         Atados: {linea.AtadosTeoricos} Rollos: {linea.RollosTeoricos}
//                                     </div>
//                                     <div className="scrap-btn-row">
//                                         <div className="btn-scrap-crema">Scrap Seriado</div>
//                                         <div className="btn-scrap-crema">Scrap No Seriado</div>
//                                     </div>
//                                 </div>

//                                 <div className="row-right-values">
//                                     <div className="values-line">
//                                         <div className="val-box-crema big-text">{formatNumber(linea.Programados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.SobreOrden)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.Calidad)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.TotAtados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.TotRollos)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.Bruto)}</div>
//                                     </div>
//                                     <div className="values-line sub-row">
//                                         <div className="val-box-crema transparent"></div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapKgs)}</div>
//                                         <div className="val-box-crema transparent"></div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapAtados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapRollos)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapBruto)}</div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     <footer className="slitter-balance-footer">
//                         <div className="bal-col"><span>Kgs. Entrantes</span><strong>{formatNumber(balance.kgsEntrantes)}</strong></div>
//                         <div className="bal-col"><span>Programados</span><strong>{formatNumber(balance.programados)}</strong></div>
//                         <div className="bal-col"><span>Sobre Orden</span><strong>{formatNumber(balance.sobreOrden)}</strong></div>
//                         <div className="bal-col"><span>Calidad</span><strong>{formatNumber(balance.calidad)}</strong></div>
//                         <div className="bal-col"><span>Sobrante</span><strong>{formatNumber(balance.sobrante)}</strong></div>
//                         <div className="bal-col"><span>Scrap</span><strong>{formatNumber(balance.scrap)}</strong></div>
//                         <div className="bal-col"><span>Saldo</span><strong className="blue-saldo-text">{formatNumber(balance.saldo)}</strong></div>
//                         <div className="bal-col"><span>Bruto</span><strong>{formatNumber(balance.bruto)}</strong></div>
//                     </footer>
//                 </main>

//                 <aside className="slitter-sidebar">
//                     <div className="side-btns-group">
//                         <button className="side-btn">Notas SRP</button>
//                         <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
//                         <button className="side-btn">Ficha Técnica</button>
//                         <button className="side-btn">Notas Calipso</button>
//                     </div>

//                     {/* CARTEL DINÁMICO REFORZADO */}
//                     {header.tieneNotasCalipso === true && (
//                         <div className="side-red-alert-box">
//                             Existen Notas en<br/>CALIPSO
//                         </div>
//                     )}

//                     <button className="side-btn btn-green-cierre">CIERRE</button>
//                 </aside>
//             </div>
//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;










// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeModalSelector from '../components/PesajeModalSelector';

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);

//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle-embalaje/${operacionId}`);
//             setData(response.data);
//         } catch (err) {
//             navigate('/registracion');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchData(); }, [operacionId]);

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     return (
//         <div className="slitter-container">
//             <header className="slitter-header">
//                 <div className="header-left"><h1>REGISTRACION Embalaje - Editar Operación</h1></div>
//                 <div className="header-right"><button className="back-link" onClick={() => navigate(-1)}>← Volver a la Grilla</button></div>
//             </header>

//             <div className="slitter-layout">
//                 <main className="slitter-main-content">
//                     <div className="slitter-top-info">
//                         <div className="client-info-box">
//                             <div className="info-grid-main">
//                                 <div className="info-left-group">
//                                     <p><strong>Clientes:</strong> {header.Clientes}</p>
//                                     <p><strong>Serie/Lote:</strong> {header.SerieLote}</p>
//                                     <p><strong>Matching:</strong> {header.Matching}</p>
//                                     <p><strong>Batch:</strong> {header.Batch}</p>
//                                 </div>
//                                 <div className="info-right-group">
//                                     <p><strong>Cant.Atados:</strong> <span className="blue-counter">{header.CantAtados}</span></p>
//                                     <p><strong>Cant.Rollos:</strong> <span className="blue-counter">{header.CantRollos}</span></p>
//                                     <p><strong>Stock:</strong> {formatNumber(header.Stock)}</p>
//                                     <p><strong>Kgs Programados:</strong> {formatNumber(header.KgsProgramados)}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="slitter-entrante-box">
//                             <div className="box-header">ENTRANTE</div>
//                             <div className="box-body">
//                                 <div className="box-row"><span>Familia:</span> {header.Familia}</div>
//                                 <div className="box-row"><span>Aleación:</span> {header.Aleacion}</div>
//                                 <div className="box-row"><span>Temple:</span> {header.Temple}</div>
//                                 <div className="box-row"><span>Espesor:</span> {header.Espesor}</div>
//                                 <div className="box-row"><span>País Origen:</span> {header.PaisOrigen}</div>
//                                 <div className="box-row"><span>Recubrimiento:</span> {header.Recubrimiento}</div>
//                                 <div className="box-row"><span>Calidad:</span> {header.Calidad}</div>
//                                 <div className="box-row"><span>Ancho:</span> {header.Ancho}</div>
//                                 <div className="blue-cod-text-box">{header.CodProdFinal}</div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="slitter-middle-bar"><strong>Cod. Prod. Final:</strong> {header.CodProdFinal}</div>

//                     <div className="production-grid-area">
//                         <div className="grid-header-labels">
//                             <div className="h-det">Detalle</div>
//                             <div className="h-val">Programados</div>
//                             <div className="h-val">Sobre Orden</div>
//                             <div className="h-val">Calidad (Suspendido)</div>
//                             <div className="h-val">Atados</div>
//                             <div className="h-val">Rollos</div>
//                             <div className="h-val">Bruto</div>
//                         </div>

//                         {lineas.map((linea, idx) => (
//                             <div key={idx} className="production-row-block">
//                                 <div className="row-left-panel">
//                                     <div className="pedido-card-crema" onClick={() => { setSelectedLinea(linea); setShowPesajeModal(true); }}>
//                                         <strong>Pedido: {linea.NumeroPedido}</strong><br/>
//                                         Item: {linea.NumeroItem}<br/>
//                                         Doc: {linea.NoDoc}<br/>
//                                         Atados: {linea.AtadosTeoricos} Rollos: {linea.RollosTeoricos}
//                                     </div>
//                                     <div className="scrap-btn-row">
//                                         <div className="btn-scrap-crema">Scrap Seriado</div>
//                                         <div className="btn-scrap-crema">Scrap No Seriado</div>
//                                     </div>
//                                 </div>

//                                 <div className="row-right-values">
//                                     <div className="values-line">
//                                         <div className="val-box-crema big-text">{formatNumber(linea.Programados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.SobreOrden)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.Calidad)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.TotAtados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.TotRollos)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.Bruto)}</div>
//                                     </div>
//                                     <div className="values-line sub-row">
//                                         <div className="val-box-crema transparent"></div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapKgs)}</div>
//                                         <div className="val-box-crema transparent"></div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapAtados)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapRollos)}</div>
//                                         <div className="val-box-crema">{formatNumber(linea.ScrapBruto)}</div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     <footer className="slitter-balance-footer">
//                         <div className="bal-col"><span>Kgs. Entrantes</span><strong>{formatNumber(balance.kgsEntrantes)}</strong></div>
//                         <div className="bal-col"><span>Programados</span><strong>{formatNumber(balance.programados)}</strong></div>
//                         <div className="bal-col"><span>Sobre Orden</span><strong>{formatNumber(balance.sobreOrden)}</strong></div>
//                         <div className="bal-col"><span>Calidad</span><strong>{formatNumber(balance.calidad)}</strong></div>
//                         <div className="bal-col"><span>Sobrante</span><strong>{formatNumber(balance.sobrante)}</strong></div>
//                         <div className="bal-col"><span>Scrap</span><strong>{formatNumber(balance.scrap)}</strong></div>
//                         <div className="bal-col"><span>Scrap Seriado</span><strong>{formatNumber(balance.scrapSeriado)}</strong></div>
//                         <div className="bal-col"><span>Saldo</span><strong className="blue-saldo-text">{formatNumber(balance.saldo)}</strong></div>
//                         <div className="bal-col"><span>Bruto</span><strong>{formatNumber(balance.bruto)}</strong></div>
//                     </footer>
//                 </main>

//                 <aside className="slitter-sidebar">
//                     <div className="side-btns-group">
//                         <button className="side-btn">Notas SRP</button>
//                         <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
//                         <button className="side-btn">Ficha Técnica</button>
//                         <button className="side-btn">Notas Calipso</button>
//                     </div>
//                     {header.tieneNotasCalipso && (
//                         <div className="side-red-alert-box">Existen Notas en<br/>CALIPSO</div>
//                     )}
//                     <button className="side-btn btn-green-cierre">CIERRE</button>
//                 </aside>
//             </div>
//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;








import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './EditarOperacionEmbalaje.css';
import ToleranciasModal from '../components/ToleranciasModal';
import PesajeModalSelector from '../components/PesajeModalSelector';
import NotasCalipsoModal from '../components/NotasCalipsoModal';

const formatNumber = (num, decimals = 0) => {
    if (num === null || num === undefined || num === '') return '0';
    let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
    if (isNaN(number)) return '0';
    return number.toLocaleString('es-AR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

const EditarOperacionEmbalaje = () => {
    const { operacionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Estados para modales
    const [showToleranciasModal, setShowToleranciasModal] = useState(false);
    const [showPesajeModal, setShowPesajeModal] = useState(false);
    const [selectedLinea, setSelectedLinea] = useState(null);
    const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
    const [notasCalipso, setNotasCalipso] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/registracion/detalle-embalaje/${operacionId}`);
            setData(response.data);
        } catch (err) {
            console.error("Error al cargar datos:", err);
            navigate('/registracion');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [operacionId]);

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

    if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

    const { header, balance, lineas } = data;

    return (
        <div className="slitter-container">
            <header className="slitter-header">
                <div className="header-left"><h1>REGISTRACION Embalaje - Editar Operación</h1></div>
                <div className="header-right"><button className="back-link" onClick={() => navigate(-1)}>← Volver a la Grilla</button></div>
            </header>

            <div className="slitter-layout">
                <main className="slitter-main-content">
                    <div className="slitter-top-info">
                        <div className="client-info-box">
                            <div className="info-grid-main">
                                <div className="info-left-group">
                                    <p><strong>Clientes:</strong> <span>{header.Clientes || 'N/A'}</span></p>
                                    <p><strong>Serie/Lote:</strong> <span>{header.SerieLote}</span></p>
                                    <p><strong>Matching:</strong> <span>{header.Matching}</span></p>
                                    <p><strong>Batch:</strong> <span>{header.Batch}</span></p>
                                </div>
                                <div className="info-right-group">
                                    <p><strong>Cant.Atados:</strong> <span className="blue-counter">{header.CantAtados}</span></p>
                                    <p><strong>Cant.Rollos:</strong> <span className="blue-counter">{header.CantRollos}</span></p>
                                    <p><strong>Stock:</strong> <span>{formatNumber(header.Stock)}</span></p>
                                    <p><strong>Kgs Programados:</strong> <span>{formatNumber(header.KgsProgramados)}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="slitter-entrante-box">
                            <div className="box-header">ENTRANTE</div>
                            <div className="box-body">
                                <div className="box-row"><span>Familia:</span> {header.Familia}</div>
                                <div className="box-row"><span>Aleación:</span> {header.Aleacion}</div>
                                <div className="box-row"><span>Temple:</span> {header.Temple}</div>
                                <div className="box-row"><span>Espesor:</span> {header.Espesor}</div>
                                <div className="box-row"><span>País Origen:</span> {header.PaisOrigen}</div>
                                <div className="box-row"><span>Recubrimiento:</span> {header.Recubrimiento}</div>
                                <div className="box-row"><span>Calidad:</span> {header.Calidad}</div>
                                <div className="box-row"><span>Ancho:</span> {header.Ancho}</div>
                                <div className="blue-cod-text-box">{header.CodProdFinal}</div>
                            </div>
                        </div>
                    </div>

                    <div className="slitter-middle-bar"><strong>Cod. Prod. Final:</strong> {header.CodProdFinal}</div>

                    <div className="production-grid-area">
                        <div className="grid-header-labels">
                            <div className="h-det">Detalle</div>
                            <div className="h-val">Programados</div>
                            <div className="h-val">Sobre Orden</div>
                            <div className="h-val">Calidad (Suspendido)</div>
                            <div className="h-val">Atados</div>
                            <div className="h-val">Rollos</div>
                            <div className="h-val">Bruto</div>
                        </div>

                        {lineas.map((linea, idx) => (
                            <div key={idx} className="production-row-block">
                                <div className="row-left-panel">
                                    <div className="pedido-card-crema" onClick={() => { setSelectedLinea(linea); setShowPesajeModal(true); }}>
                                        <strong>Pedido: {linea.NumeroPedido}</strong><br/>
                                        Item: {linea.NumeroItem}<br/>
                                        Doc: {linea.NoDoc}<br/>
                                        Atados: {linea.AtadosTeoricos} Rollos: {linea.RollosTeoricos}
                                    </div>
                                    <div className="scrap-btn-row">
                                        <div className="btn-scrap-crema">Scrap Seriado</div>
                                        <div className="btn-scrap-crema">Scrap No Seriado</div>
                                    </div>
                                </div>
                                <div className="row-right-values">
                                    <div className="values-line">
                                        <div className="val-box-crema big-text">{formatNumber(linea.Programados)}</div>
                                        <div className="val-box-crema">{formatNumber(linea.SobreOrden)}</div>
                                        <div className="val-box-crema">{formatNumber(linea.Calidad)}</div>
                                        <div className="val-box-crema">{formatNumber(linea.TotAtados)}</div>
                                        <div className="val-box-crema">{formatNumber(linea.TotRollos)}</div>
                                        <div className="val-box-crema">{formatNumber(linea.Bruto)}</div>
                                    </div>
                                    <div className="values-line sub-row">
                                        <div className="val-box-crema transparent"></div>
                                        <div className="val-box-crema">{formatNumber(linea.ScrapKgs)}</div>
                                        <div className="val-box-crema transparent"></div>
                                        <div className="val-box-crema">{formatNumber(linea.ScrapAtados)}</div>
                                        <div className="val-box-crema">{formatNumber(linea.ScrapRollos)}</div>
                                        <div className="val-box-crema">{formatNumber(linea.ScrapBruto)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* BARRA DE BALANCE CON LAS 9 COLUMNAS ORIGINALES */}
                    <footer className="slitter-balance-footer">
                        <div className="bal-col"><span>Kgs. Entrantes</span><strong>{formatNumber(balance.kgsEntrantes)}</strong></div>
                        <div className="bal-col"><span>Programados</span><strong>{formatNumber(balance.programados)}</strong></div>
                        <div className="bal-col"><span>Sobre Orden</span><strong>{formatNumber(balance.sobreOrden)}</strong></div>
                        <div className="bal-col"><span>Calidad</span><strong>{formatNumber(balance.calidad)}</strong></div>
                        <div className="bal-col"><span>Sobrante</span><strong>{formatNumber(balance.sobrante)}</strong></div>
                        <div className="bal-col"><span>Scrap</span><strong>{formatNumber(balance.scrap)}</strong></div>
                        <div className="bal-col"><span>Scrap Seriado</span><strong>{formatNumber(balance.scrapSeriado || 0)}</strong></div>
                        <div className="bal-col"><span>Saldo</span><strong className="blue-saldo-text">{formatNumber(balance.saldo)}</strong></div>
                        <div className="bal-col"><span>Bruto</span><strong>{formatNumber(balance.bruto)}</strong></div>
                    </footer>
                </main>

                <aside className="slitter-sidebar">
                    <div className="side-btns-group">
                        <button className="side-btn">Notas SRP</button>
                        <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
                        <button className="side-btn">Ficha Técnica</button>
                        <button 
                            className="side-btn" 
                            disabled={!header.tieneNotasCalipso}
                            onClick={handleNotasCalipsoClick}
                        >
                            Notas Calipso
                        </button>
                    </div>

                    {header.tieneNotasCalipso && (
                        <div className="side-red-alert-box">Existen Notas en<br/>CALIPSO</div>
                    )}
                    <button className="side-btn btn-green-cierre">CIERRE</button>
                </aside>
            </div>

            {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
            {showPesajeModal && selectedLinea && (
                <PesajeModalSelector lineaData={selectedLinea} operacionId={operacionId} onClose={() => setShowPesajeModal(false)} onSuccess={() => fetchData()} />
            )}
            {showNotasCalipsoModal && (
                <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />
            )}
        </div>
    );
};

export default EditarOperacionEmbalaje;
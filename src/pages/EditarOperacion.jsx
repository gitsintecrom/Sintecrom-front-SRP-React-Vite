// // src/pages/EditarOperacion.jsx

// import React, { useEffect, useState, useMemo } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './EditarOperacion.css';
// import CuchillasModal from '../components/CuchillasModal';
// import CuchillasInputModal from '../components/CuchillasInputModal';
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

// const EditarOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [editedLineas, setEditedLineas] = useState([]);
//     const [hasChanges, setHasChanges] = useState(false);
   
//     const [showCuchillasModal, setShowCuchillasModal] = useState(false);
//     const [cuchillasData, setCuchillasData] = useState(null);
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showCuchillasInputModal, setShowCuchillasInputModal] = useState(false);
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const operationStatusFromGrid = location.state?.operationStatus;
//     const [maquinaNumero, setMaquinaNumero] = useState("");
    
//     const [inspeccionData, setInspeccionData] = useState(null);

//     const fetchData = async () => {
//         if (!operacionId) {
//             navigate('/registracion');
//             return;
//         }
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//             const fetchedData = response.data || { header: {}, lineas: [], balance: {} };
//             const maquinaId = fetchedData.header?.maquinaId || "No disponible";
//             const maquinaMatch = maquinaId?.match(/^SL(\d+)$/);
//             setMaquinaNumero(maquinaMatch ? maquinaMatch[1] : "No disponible");
//             setData(fetchedData);
//             setEditedLineas([...fetchedData.lineas]);
//             setHasChanges(false);
//         } catch (err) {
//             Swal.fire('Error', 'No se pudo cargar el detalle.', 'error');
//             navigate('/registracion');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchData(); }, [operacionId, navigate]);
    
//     useEffect(() => {
//         const fetchInspeccionData = async () => {
//             if (!operacionId || !data?.header?.LoteID) return;
//             try {
//                 const response = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${data.header.LoteID}`);
//                 setInspeccionData(response.data);
//             } catch (error) {
//                 console.error('Error al cargar inspección:', error);
//             }
//         };
//         fetchInspeccionData();
//     }, [operacionId, data?.header?.LoteID]);

//     const currentStatus = useMemo(() => operationStatusFromGrid || data?.header?.status || '', [operationStatusFromGrid, data]);
//     // const isOperationEditable = useMemo(() => ['LISTA', 'EN_PROCESO', 'EN_CALIDAD'].includes(currentStatus), [currentStatus]);









//     // ✅ AHORA (amarillo tolerancia y calidad dictaminada también editables, como en VB):
//     const isOperationEditable = useMemo(() => 
//         ['LISTA', 'EN_PROCESO', 'EN_CALIDAD', 'CALIDAD_DICTAMINADA', 'TOLERANCIA_EXCEDIDA'].includes(currentStatus), 
//     [currentStatus]);

//     const isInspeccionComplete = useMemo(() => {
//         if (!inspeccionData) return false;
//         if (!inspeccionData.header?.inicioRevisado) return false;
        
//         const pasadasData = inspeccionData.pasadasData || {};
//         const cantPasadas = inspeccionData.header?.cantPasadas || 0;
        
//         for (let i = 1; i <= cantPasadas; i++) {
//             const pasada = pasadasData[i];
//             if (!pasada) return false;
            
//             // ✅ SOLO validar espesores (los más importantes)
//             const espesorBLM = parseFloat(pasada.espesorBLM) || 0;
//             const espesorC = parseFloat(pasada.espesorC) || 0;
//             const espesorBLO = parseFloat(pasada.espesorBLO) || 0;
            
//             // Si los 3 espesores son 0, la pasada está vacía
//             if (espesorBLM === 0 && espesorC === 0 && espesorBLO === 0) {
//                 return false;
//             }
//         }
        
//         return true;
//     }, [inspeccionData]);

//     const canEditOperacion = useMemo(() => {
//         return isOperationEditable && isInspeccionComplete;
//     }, [isOperationEditable, isInspeccionComplete]);

//     const handleSaveChanges = async () => {
//         if (!hasChanges) return;
//         setModalLoading(true);
//         try {
//             const changes = editedLineas.map((linea, index) => {
//                 const original = data.lineas[index];
//                 const changedFields = {};
//                 ['Programados', 'SobreOrden', 'Calidad', 'Atados', 'Rollos'].forEach(field => {
//                     if (linea[field] !== original[field]) changedFields[field] = linea[field];
//                 });
//                 return { ...linea, changedFields };
//             }).filter(l => Object.keys(l.changedFields).length > 0);
//             await axiosInstance.put(`/registracion/actualizar-lineas/${operacionId}`, { lineas: changes });
//             await Swal.fire('¡Éxito!', 'Cambios guardados.', 'success');
//             setHasChanges(false);
//             await fetchData();
//         } catch (error) { Swal.fire('Error', 'Error al guardar.', 'error'); } 
//         finally { setModalLoading(false); }
//     };

//     // ✅ VALIDACIONES DEL VB.NET PARA EL CIERRE - CORREGIDO CON DEBUG
//     const validarCierreVB = async () => {
//         console.log('🔍 === INICIO VALIDACIÓN DE CIERRE ===');
        
//         if (!data || !data.lineas || !data.balance) {
//             console.error('❌ Datos incompletos');
//             return { valido: false, mensajes: [], requiereSupervisor: false };
//         }

//         const TOLERANCIA_GENERAL = 0.005; // 0.5%
//         const TOLERANCIA_INDIVIDUAL = 0.35; // 35%
        
//         let mensajesError = [];
//         let hayFueraTolerancia = false;
//         let faltaDictamenCalidad = false;
//         let requiereSupervisor = false;

//         console.log('\n📋 === VALIDANDO LÍNEAS NORMALES ===');
//         for (const linea of data.lineas) {
//             if (linea.esSobrante || linea.esScrap) {
//                 console.log(`⏭️  Saltando línea ${linea.esSobrante ? 'SOBRANTE' : 'SCRAP'}`);
//                 continue;
//             }

//             const programados = parseFloat(linea.Programados) || 0;
//             const sobreOrden = parseFloat(linea.SobreOrden) || 0;
//             const calidad = parseFloat(linea.Calidad) || 0;
//             const totalRegistrado = sobreOrden + calidad;

//             console.log(`\n📊 Línea: ${linea.Destino || linea.SerieLote}`);
//             console.log(`   Programados: ${programados}`);
//             console.log(`   SobreOrden: ${sobreOrden}`);
//             console.log(`   Calidad: ${calidad}`);
//             console.log(`   Total Registrado: ${totalRegistrado}`);

//             // ✅ CORRECCIÓN CLAVE: Si programados es 0, no validar
//             if (programados === 0) {
//                 console.log('   ⏭️  Saltando (programados = 0)');
//                 continue;
//             }

//             // Calcular tolerancia programada (mínimo 2 kg)
//             let toleranciaProg = programados * TOLERANCIA_GENERAL;
//             if (toleranciaProg < 2) toleranciaProg = 2;

//             console.log(`   Tolerancia Programada: ${toleranciaProg}`);

//             // Verificar si está fuera de tolerancia general
//             const diferencia = Math.abs(totalRegistrado - programados);
//             console.log(`   Diferencia: ${diferencia}`);
            
//             if (diferencia > toleranciaProg) {
//                 hayFueraTolerancia = true;
//                 const msg = `Fuera Tolerancia en Serie/Lote ${linea.Destino || linea.SerieLote}`;
//                 console.log(`   ⚠️  ${msg} (diff: ${diferencia} > tol: ${toleranciaProg})`);
//                 mensajesError.push(msg);
//             } else {
//                 console.log(`   ✅ Dentro de tolerancia`);
//             }

//             // Verificar tolerancia individual (35%)
//             let toleranciaInd = programados * TOLERANCIA_INDIVIDUAL;
//             if (toleranciaInd < 2) toleranciaInd = 2;
//             if (diferencia > toleranciaInd) {
//                 requiereSupervisor = true;
//                 console.log(`   🔑 Requiere supervisor`);
//             }

//             // Verificar si está en calidad sin dictamen
//             if (calidad > 0 && !linea.dictamen) {
//                 faltaDictamenCalidad = true;
//                 mensajesError.push(`${linea.Destino || linea.SerieLote} - FALTA DICTAMEN DE CALIDAD`);
//             }
//         }

//         // ... resto del código (sobrantes, scrap, saldo)
//         console.log('\n📋 === VALIDANDO SOBRANTES ===');
//         const lineasSobrante = data.lineas.filter(l => l.esSobrante);
//         for (const sobrante of lineasSobrante) {
//             const calidadSobrante = parseFloat(sobrante.Calidad) || 0;
//             if (calidadSobrante > 0) {
//                 requiereSupervisor = false;
//                 faltaDictamenCalidad = true;
//                 mensajesError.push("Sobrante - FALTA DICTAMEN DE CALIDAD");
//             }
//         }

//         console.log('\n📋 === VALIDANDO SCRAP ===');
//         const lineasScrap = data.lineas.filter(l => l.esScrap);
//         for (const scrap of lineasScrap) {
//             const calidadScrap = parseFloat(scrap.Calidad) || 0;
//             if (calidadScrap > 0) {
//                 faltaDictamenCalidad = true;
//                 mensajesError.push("Scrap - FALTA DICTAMEN DE CALIDAD");
//             }
//         }

//         console.log('\n📋 === VALIDANDO SALDO TOTAL ===');
//         const kgsEntrantes = parseFloat(data.balance.kgsEntrantes) || 0;
//         const sobreOrdenTotal = parseFloat(data.balance.sobreOrden) || 0;
//         const calidadTotal = parseFloat(data.balance.calidad) || 0;
//         const sobranteTotal = parseFloat(data.balance.sobrante) || 0;
//         const scrapTotal = parseFloat(data.balance.scrap) || 0;
        
//         const saldo = kgsEntrantes - sobreOrdenTotal - calidadTotal - sobranteTotal - scrapTotal;
//         const saldoAbsoluto = Math.abs(saldo);
        
//         let toleranciaSaldo = kgsEntrantes * TOLERANCIA_GENERAL;
//         if (toleranciaSaldo < 2) toleranciaSaldo = 2;
        
//         console.log(`Saldo Calculado: ${saldo}`);
//         console.log(`Tolerancia Saldo: ${toleranciaSaldo}`);
        
//         const toleranciaSaldoFormatted = toleranciaSaldo.toFixed(2).replace('.', ',');
        
//         if (saldoAbsoluto > toleranciaSaldo) {
//             hayFueraTolerancia = true;
//             mensajesError.push(`El SALDO DEBE estar dentro de la TOLERANCIA para efectuar el cierre: ${toleranciaSaldoFormatted} kgs.`);
//         } else {
//             console.log(`✅ Saldo dentro de tolerancia`);
//         }

//         console.log('\n📋 === RESUMEN VALIDACIÓN ===');
//         console.log(`Hay Fuera Tolerancia: ${hayFueraTolerancia}`);
//         console.log(`Mensajes de Error: ${mensajesError.length}`);
//         mensajesError.forEach((msg, i) => console.log(`  ${i + 1}. ${msg}`));
//         console.log('🔍 === FIN VALIDACIÓN ===\n');

//         if (mensajesError.length > 0) {
//             return {
//                 valido: false,
//                 requiereSupervisor,
//                 mensajes: mensajesError,
//                 saldo: saldo.toFixed(2),
//                 toleranciaSaldo: toleranciaSaldo.toFixed(2)
//             };
//         }

//         return {
//             valido: true,
//             requiereSupervisor,
//             mensajes: [],
//             saldo: saldo.toFixed(2)
//         };
//     };


//     // ✅ FUNCIÓN DE CIERRE CON VALIDACIONES VB.NET - CORREGIDO
//     const handleCierreClick = async () => {
//         // ✅ VALIDACIÓN 1: Verificar que la inspección final esté aprobada
//         if (!inspeccionData?.header?.finalRevisado) {
//             await Swal.fire({
//                 title: 'Advertencia',
//                 text: 'Se debe aprobar la INSPECCION FINAL antes de cerrar la operación',
//                 icon: 'warning',
//                 confirmButtonText: 'Aceptar',
//                 confirmButtonColor: '#ffc107'
//             });
//             return; // ⛔ BLOQUEAR (inspección no aprobada)
//         }

//         // ✅ VALIDACIÓN 2: Validar cierre (tolerancia, calidad, saldo)
//         const validacion = await validarCierreVB();
        
//         // ⛔ Si hay errores, mostrar warning y RETORNAR (NO continuar al cierre)
//         if (!validacion.valido) {
//             const mensajeCompleto = validacion.mensajes.join('\n');
            
//             await Swal.fire({
//                 title: 'Advertencia',
//                 html: `<div style="text-align: left; white-space: pre-wrap; font-family: monospace;">${mensajeCompleto}</div>`,
//                 icon: 'warning',
//                 confirmButtonText: 'Aceptar',
//                 confirmButtonColor: '#ffc107'
//             });
//             return; // ⛔ RETORNAR - NO CONTINUAR AL CIERRE
//         }

//         // ✅ Si pasó todas las validaciones, mostrar confirmación de cierre
//         const result = await Swal.fire({
//             title: '¿Confirmar Cierre?',
//             text: 'Se CERRARA la operación.',
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonColor: '#28a745',
//             confirmButtonText: 'Sí, cerrar',
//             cancelButtonText: 'Cancelar',
//             cancelButtonColor: '#6c757d'
//         });
        
//         if (!result.isConfirmed) return;

//         // ✅ Ejecutar cierre en backend
//         setModalLoading(true);
//         try {
//             const userStr = localStorage.getItem('user'); 
//             const userObj = userStr ? JSON.parse(userStr) : { nombre: 'SISTEMA' };
            
//             await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, { 
//                 usuario: userObj.nombre
//             });
            
//             await Swal.fire('¡Éxito!', 'Operación cerrada con éxito.', 'success');
//             navigate(`/registracion/operaciones/${data.header.maquinaId}`);
//         } catch (error) {
//             Swal.fire('Error', error.response?.data?.error || 'Error al cerrar.', 'error');
//         } finally {
//             setModalLoading(false);
//         }
//     };

//     const handleNotasCalipsoClick = async () => {
//         setModalLoading(true); setShowNotasCalipsoModal(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/notas-calipso/${operacionId}`);
//             setNotasCalipso(response.data.notes);
//         } catch (error) { setShowNotasCalipsoModal(false); } 
//         finally { setModalLoading(false); }
//     };

//     if (loading || !data) return null;
//     const { header, balance } = data;
//     const isSuspended = currentStatus === 'SUSPENDIDA';

//     return (
//         <>
//             <div className={`detalle-container ${isOperationEditable ? 'editar-mode' : ''}`}>
//                 <div className="main-content">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                         <h1 className="m-0" style={{ color: 'white' }}>REGISTRACION Slitter {maquinaNumero} - Editar Operación</h1>
//                         <button className="btn btn-secondary" onClick={() => navigate(-1)}><i className="fas fa-arrow-left mr-2"></i>Volver a la Grilla</button>
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
//                                         <div className="info-item" style={{ marginTop: '0.5rem', borderTop: '1px solid #ccc', paddingTop: '0.5rem' }}>
//                                             <span className="info-value" style={{ fontSize: '0.85rem',  color: '#1b03f5', fontWeight: 'bold' }}>
//                                                 {header.CodigoProducto || 'N/A'}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* SECCIÓN Cuchillas, Pasadas, Diámetro, Corona - ESTILO VB.NET */}
//                     <div className="cuchillas-panel">
//                         <div className="cuchillas-item">
//                             <span className="cuchillas-label">Cuchillas:</span>
//                             <span className="cuchillas-value">{header.Cuchillas || 'N/A'}</span>
//                         </div>
                        
//                         <div className="cuchillas-item">
//                             <span className="cuchillas-label">Pasadas:</span>
//                             <span className="cuchillas-value">{header.Pasadas || '0'}</span>
//                         </div>
                        
//                         <div className="cuchillas-item">
//                             <span className="cuchillas-label">Diámetro:</span>
//                             <span className="cuchillas-value">{header.Diametro || '0'}</span>
//                         </div>
                        
//                         <div className="cuchillas-item">
//                             <span className="cuchillas-label">Corona:</span>
//                             <span className="cuchillas-value">{header.Corona || '0'}</span>
//                         </div>
//                     </div>

//                     <div className="detalle-body-container">
//                         <div className="grid-header">
//                             <div></div> <div>Programados</div> <div>Sobre Orden</div> <div>Calidad (Suspendido)</div> <div>Atados</div> <div>Rollos</div>
//                         </div>
//                         <div className="grid-body">
//                             {editedLineas
//                                 .filter(l => !l.esSobrante && !l.esScrap) 
//                                 .map((linea, index) => (
//                                 <div key={index} className="grid-row" style={{ cursor: 'default' }}>
//                                     <div
//                                         className="grid-cell-desc"
//                                         style={{ 
//                                             cursor: canEditOperacion ? 'pointer' : 'default',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         onClick={canEditOperacion ? () => {
//                                             setSelectedLinea({ ...linea, bSobrante: false, bScrap: false, SerieLote: header.SerieLote });
//                                             setShowPesajeModal(true);
//                                         } : undefined}
//                                         title={!canEditOperacion ? (inspeccionData && !inspeccionData.header?.inicioRevisado ? "Debe revisar el inicio en Inspección" : "Complete todos los datos de las pasadas") : ""}
//                                     >
//                                         <div>
//                                             <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                                 {String(linea.Ancho || 'N/A')}
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                                 {String(linea.Cuchillas || 'N/A')}
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                                 {String(linea.Tarea || 'N/A')}
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                                 {linea.Destino ? String(linea.Destino || '').substring(0, 11) : 'N/A'}
//                                             </span>
//                                         </div>
//                                         {!canEditOperacion && <div className="text-muted small">Bloqueado</div>}
//                                     </div>
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.Programados)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.SobreOrden)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.Calidad)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.TotAtados)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.TotRollos)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                 </div>
//                             ))}

//                             {[
//                                 { tipo: 'Sobrante', totSO: balance.sobrante, totAt: balance.atadosSobrante, totRo: balance.rollosSobrante, config: { bSobrante: true, bScrap: false, Tarea: 'Sobrante' } },
//                                 { tipo: 'Scrap Seriado', totSO: balance.scrapSeriado, totAt: balance.atadosScrapSeriado, totRo: balance.rollosScrapSeriado, config: { bSobrante: false, bScrap: true, bScrapSeriado: true, Tarea: 'Scrap Seriado' } },
//                                 { tipo: 'Scrap No Seriado', totSO: balance.scrapNoSeriado, totAt: balance.atadosScrapNoSeriado, totRo: balance.rollosScrapNoSeriado, config: { bSobrante: false, bScrap: true, bScrapNoSeriado: true, Tarea: 'Scrap No Seriado' } }
//                             ].map((item) => (
//                                 <div key={item.tipo} className="grid-row" style={{ cursor: 'default' }}>
//                                     <div
//                                         className="grid-cell-desc font-weight-bold"
//                                         style={{ 
//                                             cursor: canEditOperacion ? 'pointer' : 'default',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         onClick={canEditOperacion ? async () => {
//                                             let lb = { ...item.config, Ancho: header.Ancho, Cuchillas: header.Cuchillas, SerieLote: header.SerieLote, LoteID: header.LoteID, Operacion_ID: operacionId, Programados: 0 };
//                                             if (item.tipo === 'Scrap Seriado') {
//                                                 try {
//                                                     const res = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
//                                                     lb.CodigoProductoS = res.data.CodigoProductoS;
//                                                 } catch (e) { console.warn("Fallback merma"); }
//                                             }
//                                             setSelectedLinea(lb); setShowPesajeModal(true);
//                                         } : undefined}
//                                         title={!canEditOperacion ? (inspeccionData && !inspeccionData.header?.inicioRevisado ? "Debe revisar el inicio en Inspección" : "Complete todos los datos de las pasadas") : ""}
//                                     >
//                                         <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                             {item.tipo}
//                                         </span>
//                                         {!canEditOperacion && <div className="text-muted small">Bloqueado</div>}
//                                     </div>
//                                     <div className="grid-cell-placeholder"></div>
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(item.totSO)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value="0" 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(item.totAt)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(item.totRo)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                 </div>
//                             ))}
//                         </div>
                       
//                         <div className="detalle-footer">
//                             <div className="balance-grid">
//                                 <div className="balance-label">Kgs.Entrantes</div> <div className="balance-label">Programados</div> <div className="balance-label">Sobre Orden</div>
//                                 <div className="balance-label">Calidad</div> <div className="balance-label">Sobrante</div> <div className="balance-label">Scrap</div> <div className="balance-label">Saldo</div>
//                                 <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div> <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
//                                 <div className="balance-value">{formatNumber(balance.sobreOrden)}</div> <div className="balance-value">{formatNumber(balance.calidad)}</div>
//                                 <div className="balance-value">{formatNumber(balance.sobrante)}</div> <div className="balance-value">{formatNumber(balance.scrap)}</div>
//                                 <div className="balance-value font-weight-bold" style={{ color: balance.saldo < 0 ? 'red' : 'white' }}>{formatNumber(balance.saldo)}</div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
               
//                 <div className="actions-sidebar">
//                     <button className="btn btn-info btn-block" onClick={() => navigate(`/registracion/inspeccion/${operacionId}/${header.LoteID}`)}>Inspección</button>
//                     <button className={`btn btn-block ${isSuspended ? 'btn-info' : 'btn-warning'}`} onClick={() => setShowSupervisorModal(true)}>{isSuspended ? 'Activar' : 'Suspender'}</button>
//                     <hr style={{ borderColor: 'white', width: '100%' }} />
//                     <button className="btn btn-light btn-block" disabled={header.tieneNotasSRP}>Notas SRP</button>
//                     <button className="btn btn-light btn-block" onClick={() => setShowToleranciasModal(true)} disabled={!isOperationEditable}>Tolerancias</button>
//                     <button className="btn btn-light btn-block" onClick={() => navigate(`/registracion/fichatecnica/${operacionId}`)}>Ficha Técnica</button>
//                     <button 
//                         className="btn btn-light btn-block" 
//                         onClick={handleNotasCalipsoClick}
//                         disabled={!header.tieneNotasCalipso}
//                         title={!header.tieneNotasCalipso ? "No hay notas de Calipso para esta operación" : ""}
//                         style={!header.tieneNotasCalipso ? { 
//                             opacity: 0.6, 
//                             cursor: 'not-allowed',
//                             backgroundColor: '#e9ecef'
//                         } : {}}
//                     >
//                         Notas Calipso
//                     </button>
//                     {header.tieneNotasCalipso && (
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
                    
//                     {!canEditOperacion && isOperationEditable && (
//                         <div className="alert alert-warning mt-2 p-2 text-center" style={{
//                             fontWeight: 'bold',
//                             backgroundColor: '#ffc107',
//                             color: '#000',
//                             border: 'none',
//                             borderRadius: '4px',
//                             width: '100%'
//                         }}>
//                             {!inspeccionData ? "Cargando inspección..." : 
//                              !inspeccionData.header?.inicioRevisado ? "⚠️ Revise el Inicio en Inspección" : 
//                              "⚠️ Complete todas las pasadas"}
//                         </div>
//                     )}
//                     <div className="cierre-container">
//                         <button 
//                             className={`btn btn-success btn-block ${modalLoading ? 'btn-cierre-loading' : ''}`} 
//                             onClick={handleCierreClick}
//                             disabled={!canEditOperacion || modalLoading}
//                             title={!canEditOperacion ? 
//                                 (!inspeccionData ? "Cargando inspección..." : 
//                                 !inspeccionData.header?.inicioRevisado ? "Debe revisar el inicio en Inspección" : 
//                                 "Complete todos los datos de las pasadas") : 
//                                 "Cerrar operación"}
//                             style={!canEditOperacion && !modalLoading ? {
//                                 backgroundColor: '#6c757d',
//                                 borderColor: '#6c757d',
//                                 cursor: 'not-allowed',
//                                 opacity: 0.6
//                             } : {}}
//                         >
//                             {modalLoading ? (
//                                 <>
//                                     <i className="fas fa-spinner fa-spin mr-2"></i>
//                                     <span>Cerrando...</span>
//                                 </>
//                             ) : (
//                                 'CIERRE'
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {showPesajeModal && selectedLinea && (
//                 <PesajeModalSelector lineaData={selectedLinea} operacionId={operacionId} onClose={() => setShowPesajeModal(false)} onSuccess={fetchData} />
//             )}
//             {showSupervisorModal && <SupervisorAuthModal onClose={() => setShowSupervisorModal(false)} onConfirm={fetchData} />}
//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
//             {showNotasCalipsoModal && <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />}
//         </>
//     );
// };

// export default EditarOperacion;











































// // src/pages/EditarOperacion.jsx
// import React, { useEffect, useState, useMemo } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './EditarOperacion.css';
// import CuchillasModal from '../components/CuchillasModal';
// import CuchillasInputModal from '../components/CuchillasInputModal';
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

// const EditarOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [editedLineas, setEditedLineas] = useState([]);
//     const [hasChanges, setHasChanges] = useState(false);
   
//     const [showCuchillasModal, setShowCuchillasModal] = useState(false);
//     const [cuchillasData, setCuchillasData] = useState(null);
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showCuchillasInputModal, setShowCuchillasInputModal] = useState(false);
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const operationStatusFromGrid = location.state?.operationStatus;
//     const [maquinaNumero, setMaquinaNumero] = useState("");
    
//     const [inspeccionData, setInspeccionData] = useState(null);

//     const fetchData = async () => {
//         if (!operacionId) {
//             navigate('/registracion');
//             return;
//         }
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//             const fetchedData = response.data || { header: {}, lineas: [], balance: {} };
//             const maquinaId = fetchedData.header?.maquinaId || "No disponible";
//             const maquinaMatch = maquinaId?.match(/^SL(\d+)$/);
//             setMaquinaNumero(maquinaMatch ? maquinaMatch[1] : "No disponible");
//             setData(fetchedData);
//             setEditedLineas([...fetchedData.lineas]);
//             setHasChanges(false);
//         } catch (err) {
//             Swal.fire('Error', 'No se pudo cargar el detalle.', 'error');
//             navigate('/registracion');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchData(); }, [operacionId, navigate]);
    
//     useEffect(() => {
//         const fetchInspeccionData = async () => {
//             if (!operacionId || !data?.header?.LoteID) return;
//             try {
//                 const response = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${data.header.LoteID}`);
//                 setInspeccionData(response.data);
//             } catch (error) {
//                 console.error('Error al cargar inspección:', error);
//             }
//         };
//         fetchInspeccionData();
//     }, [operacionId, data?.header?.LoteID]);

//     // ✅ FIX 1: NORMALIZAR el estado. La grilla puede viajar en state.operationStatus el OBJETO de
//     // estilos ({backgroundColor, caliIcon,...}) o un string. Si no es string, mandamos con el
//     // status que calcula el backend (fuente de verdad). Antes includes(objeto) => siempre false.
//     const statusFromGrid = typeof operationStatusFromGrid === 'string' ? operationStatusFromGrid : '';
//     const currentStatus = useMemo(() => statusFromGrid || data?.header?.status || '', [statusFromGrid, data]);

//     // ✅ Gris, amarillo tolerancia y calidad dictaminada editables, como en VB
//     const isOperationEditable = useMemo(() => 
//         ['LISTA', 'EN_PROCESO', 'EN_CALIDAD', 'CALIDAD_DICTAMINADA', 'TOLERANCIA_EXCEDIDA'].includes(currentStatus), 
//     [currentStatus]);

//     // ✅ FIX 2 (paridad VB frmDetalleSlitter_Load):
//     //    if (!Inicial.bVer || !Inicial.bInspeccionInicialOK) panel2.Enabled = false;
//     //    → lo ÚNICO que bloquea los clicks de pesaje es que el INICIO de inspección esté revisado.
//     //    El color (gris/amarillo) NO bloquea el pesaje; las pasadas completas y la inspección FINAL
//     //    se exigen recién en el CIERRE (bInspeccionFinalOK), que ya se valida en handleCierreClick.
//     const inicioRevisado = !!inspeccionData?.header?.inicioRevisado;

//     const canEditOperacion = useMemo(() => {
//         return isOperationEditable && inicioRevisado;
//     }, [isOperationEditable, inicioRevisado]);

//     const motivoBloqueo = !isOperationEditable
//         ? "El estado de la operación no permite registrar"
//         : (!inspeccionData ? "Cargando inspección..." : "Debe revisar el inicio en Inspección");

//     const handleSaveChanges = async () => {
//         if (!hasChanges) return;
//         setModalLoading(true);
//         try {
//             const changes = editedLineas.map((linea, index) => {
//                 const original = data.lineas[index];
//                 const changedFields = {};
//                 ['Programados', 'SobreOrden', 'Calidad', 'Atados', 'Rollos'].forEach(field => {
//                     if (linea[field] !== original[field]) changedFields[field] = linea[field];
//                 });
//                 return { ...linea, changedFields };
//             }).filter(l => Object.keys(l.changedFields).length > 0);
//             await axiosInstance.put(`/registracion/actualizar-lineas/${operacionId}`, { lineas: changes });
//             await Swal.fire('¡Éxito!', 'Cambios guardados.', 'success');
//             setHasChanges(false);
//             await fetchData();
//         } catch (error) { Swal.fire('Error', 'Error al guardar.', 'error'); } 
//         finally { setModalLoading(false); }
//     };

//     // ✅ VALIDACIONES DEL VB.NET PARA EL CIERRE
//     const validarCierreVB = async () => {
//         if (!data || !data.lineas || !data.balance) {
//             return { valido: false, mensajes: [], requiereSupervisor: false };
//         }

//         const TOLERANCIA_GENERAL = 0.005; // 0.5%
//         const TOLERANCIA_INDIVIDUAL = 0.35; // 35%
        
//         let mensajesError = [];
//         let hayFueraTolerancia = false;
//         let faltaDictamenCalidad = false;
//         let requiereSupervisor = false;

//         for (const linea of data.lineas) {
//             if (linea.esSobrante || linea.esScrap) continue;

//             const programados = parseFloat(linea.Programados) || 0;
//             const sobreOrden = parseFloat(linea.SobreOrden) || 0;
//             const calidad = parseFloat(linea.Calidad) || 0;
//             const totalRegistrado = sobreOrden + calidad;

//             if (programados === 0) continue;

//             let toleranciaProg = programados * TOLERANCIA_GENERAL;
//             if (toleranciaProg < 2) toleranciaProg = 2;

//             const diferencia = Math.abs(totalRegistrado - programados);
            
//             if (diferencia > toleranciaProg) {
//                 hayFueraTolerancia = true;
//                 mensajesError.push(`Fuera Tolerancia en Serie/Lote ${linea.Destino || linea.SerieLote}`);
//             }

//             let toleranciaInd = programados * TOLERANCIA_INDIVIDUAL;
//             if (toleranciaInd < 2) toleranciaInd = 2;
//             if (diferencia > toleranciaInd) {
//                 requiereSupervisor = true;
//             }

//             if (calidad > 0 && !linea.dictamen) {
//                 faltaDictamenCalidad = true;
//                 mensajesError.push(`${linea.Destino || linea.SerieLote} - FALTA DICTAMEN DE CALIDAD`);
//             }
//         }

//         const lineasSobrante = data.lineas.filter(l => l.esSobrante);
//         for (const sobrante of lineasSobrante) {
//             const calidadSobrante = parseFloat(sobrante.Calidad) || 0;
//             if (calidadSobrante > 0) {
//                 requiereSupervisor = false;
//                 faltaDictamenCalidad = true;
//                 mensajesError.push("Sobrante - FALTA DICTAMEN DE CALIDAD");
//             }
//         }

//         const lineasScrap = data.lineas.filter(l => l.esScrap);
//         for (const scrap of lineasScrap) {
//             const calidadScrap = parseFloat(scrap.Calidad) || 0;
//             if (calidadScrap > 0) {
//                 faltaDictamenCalidad = true;
//                 mensajesError.push("Scrap - FALTA DICTAMEN DE CALIDAD");
//             }
//         }

//         const kgsEntrantes = parseFloat(data.balance.kgsEntrantes) || 0;
//         const sobreOrdenTotal = parseFloat(data.balance.sobreOrden) || 0;
//         const calidadTotal = parseFloat(data.balance.calidad) || 0;
//         const sobranteTotal = parseFloat(data.balance.sobrante) || 0;
//         const scrapTotal = parseFloat(data.balance.scrap) || 0;
        
//         const saldo = kgsEntrantes - sobreOrdenTotal - calidadTotal - sobranteTotal - scrapTotal;
//         const saldoAbsoluto = Math.abs(saldo);
        
//         let toleranciaSaldo = kgsEntrantes * TOLERANCIA_GENERAL;
//         if (toleranciaSaldo < 2) toleranciaSaldo = 2;
        
//         const toleranciaSaldoFormatted = toleranciaSaldo.toFixed(2).replace('.', ',');
        
//         if (saldoAbsoluto > toleranciaSaldo) {
//             hayFueraTolerancia = true;
//             mensajesError.push(`El SALDO DEBE estar dentro de la TOLERANCIA para efectuar el cierre: ${toleranciaSaldoFormatted} kgs.`);
//         }

//         if (mensajesError.length > 0) {
//             return {
//                 valido: false,
//                 requiereSupervisor,
//                 mensajes: mensajesError,
//                 saldo: saldo.toFixed(2),
//                 toleranciaSaldo: toleranciaSaldo.toFixed(2)
//             };
//         }

//         return {
//             valido: true,
//             requiereSupervisor,
//             mensajes: [],
//             saldo: saldo.toFixed(2)
//         };
//     };

//     // ✅ FUNCIÓN DE CIERRE CON VALIDACIONES VB.NET
//     const handleCierreClick = async () => {
//         // ✅ VALIDACIÓN 1 (VB: bInspeccionFinalOK)
//         if (!inspeccionData?.header?.finalRevisado) {
//             await Swal.fire({
//                 title: 'Advertencia',
//                 text: 'Se debe aprobar la INSPECCION FINAL antes de cerrar la operación',
//                 icon: 'warning',
//                 confirmButtonText: 'Aceptar',
//                 confirmButtonColor: '#ffc107'
//             });
//             return;
//         }

//         // ✅ VALIDACIÓN 2: tolerancia / calidad / saldo
//         const validacion = await validarCierreVB();
        
//         if (!validacion.valido) {
//             const mensajeCompleto = validacion.mensajes.join('\n');
//             await Swal.fire({
//                 title: 'Advertencia',
//                 html: `<div style="text-align: left; white-space: pre-wrap; font-family: monospace;">${mensajeCompleto}</div>`,
//                 icon: 'warning',
//                 confirmButtonText: 'Aceptar',
//                 confirmButtonColor: '#ffc107'
//             });
//             return;
//         }

//         const result = await Swal.fire({
//             title: '¿Confirmar Cierre?',
//             text: 'Se CERRARA la operación.',
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonColor: '#28a745',
//             confirmButtonText: 'Sí, cerrar',
//             cancelButtonText: 'Cancelar',
//             cancelButtonColor: '#6c757d'
//         });
        
//         if (!result.isConfirmed) return;

//         setModalLoading(true);
//         try {
//             const userStr = localStorage.getItem('user'); 
//             const userObj = userStr ? JSON.parse(userStr) : { nombre: 'SISTEMA' };
            
//             await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, { 
//                 usuario: userObj.nombre
//             });
            
//             await Swal.fire('¡Éxito!', 'Operación cerrada con éxito.', 'success');
//             navigate(`/registracion/operaciones/${data.header.maquinaId}`);
//         } catch (error) {
//             Swal.fire('Error', error.response?.data?.error || 'Error al cerrar.', 'error');
//         } finally {
//             setModalLoading(false);
//         }
//     };

//     const handleNotasCalipsoClick = async () => {
//         setModalLoading(true); setShowNotasCalipsoModal(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/notas-calipso/${operacionId}`);
//             setNotasCalipso(response.data.notes);
//         } catch (error) { setShowNotasCalipsoModal(false); } 
//         finally { setModalLoading(false); }
//     };

//     if (loading || !data) return null;
//     const { header, balance } = data;
//     const isSuspended = currentStatus === 'SUSPENDIDA';

//     return (
//         <>
//             <div className={`detalle-container ${isOperationEditable ? 'editar-mode' : ''}`}>
//                 <div className="main-content">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                         <h1 className="m-0" style={{ color: 'white' }}>REGISTRACION Slitter {maquinaNumero} - Editar Operación</h1>
//                         <button className="btn btn-secondary" onClick={() => navigate(-1)}><i className="fas fa-arrow-left mr-2"></i>Volver a la Grilla</button>
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
//                                         <div className="info-item" style={{ marginTop: '0.5rem', borderTop: '1px solid #ccc', paddingTop: '0.5rem' }}>
//                                             <span className="info-value" style={{ fontSize: '0.85rem',  color: '#1b03f5', fontWeight: 'bold' }}>
//                                                 {header.CodigoProducto || 'N/A'}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* SECCIÓN Cuchillas, Pasadas, Diámetro, Corona - ESTILO VB.NET */}
//                     <div className="cuchillas-panel">
//                         <div className="cuchillas-item">
//                             <span className="cuchillas-label">Cuchillas:</span>
//                             <span className="cuchillas-value">{header.Cuchillas || 'N/A'}</span>
//                         </div>
                        
//                         <div className="cuchillas-item">
//                             <span className="cuchillas-label">Pasadas:</span>
//                             <span className="cuchillas-value">{header.Pasadas || '0'}</span>
//                         </div>
                        
//                         <div className="cuchillas-item">
//                             <span className="cuchillas-label">Diámetro:</span>
//                             <span className="cuchillas-value">{header.Diametro || '0'}</span>
//                         </div>
                        
//                         <div className="cuchillas-item">
//                             <span className="cuchillas-label">Corona:</span>
//                             <span className="cuchillas-value">{header.Corona || '0'}</span>
//                         </div>
//                     </div>

//                     <div className="detalle-body-container">
//                         <div className="grid-header">
//                             <div></div> <div>Programados</div> <div>Sobre Orden</div> <div>Calidad (Suspendido)</div> <div>Atados</div> <div>Rollos</div>
//                         </div>
//                         <div className="grid-body">
//                             {editedLineas
//                                 .filter(l => !l.esSobrante && !l.esScrap) 
//                                 .map((linea, index) => (
//                                 <div key={index} className="grid-row" style={{ cursor: 'default' }}>
//                                     <div
//                                         className="grid-cell-desc"
//                                         style={{ 
//                                             cursor: canEditOperacion ? 'pointer' : 'default',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         onClick={canEditOperacion ? () => {
//                                             setSelectedLinea({ ...linea, bSobrante: false, bScrap: false, SerieLote: header.SerieLote });
//                                             setShowPesajeModal(true);
//                                         } : undefined}
//                                         title={!canEditOperacion ? motivoBloqueo : ""}
//                                     >
//                                         <div>
//                                             <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                                 {String(linea.Ancho || 'N/A')}
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                                 {String(linea.Cuchillas || 'N/A')}
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                                 {String(linea.Tarea || 'N/A')}
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                                 {linea.Destino ? String(linea.Destino || '').substring(0, 11) : 'N/A'}
//                                             </span>
//                                         </div>
//                                         {!canEditOperacion && <div className="text-muted small">Bloqueado</div>}
//                                     </div>
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.Programados)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.SobreOrden)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.Calidad)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.TotAtados)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.TotRollos)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                 </div>
//                             ))}

//                             {[
//                                 { tipo: 'Sobrante', totSO: balance.sobrante, totAt: balance.atadosSobrante, totRo: balance.rollosSobrante, config: { bSobrante: true, bScrap: false, Tarea: 'Sobrante' } },
//                                 { tipo: 'Scrap Seriado', totSO: balance.scrapSeriado, totAt: balance.atadosScrapSeriado, totRo: balance.rollosScrapSeriado, config: { bSobrante: false, bScrap: true, bScrapSeriado: true, Tarea: 'Scrap Seriado' } },
//                                 { tipo: 'Scrap No Seriado', totSO: balance.scrapNoSeriado, totAt: balance.atadosScrapNoSeriado, totRo: balance.rollosScrapNoSeriado, config: { bSobrante: false, bScrap: true, bScrapNoSeriado: true, Tarea: 'Scrap No Seriado' } }
//                             ].map((item) => (
//                                 <div key={item.tipo} className="grid-row" style={{ cursor: 'default' }}>
//                                     <div
//                                         className="grid-cell-desc font-weight-bold"
//                                         style={{ 
//                                             cursor: canEditOperacion ? 'pointer' : 'default',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         onClick={canEditOperacion ? async () => {
//                                             let lb = { ...item.config, Ancho: header.Ancho, Cuchillas: header.Cuchillas, SerieLote: header.SerieLote, LoteID: header.LoteID, Operacion_ID: operacionId, Programados: 0 };
//                                             if (item.tipo === 'Scrap Seriado') {
//                                                 try {
//                                                     const res = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
//                                                     lb.CodigoProductoS = res.data.CodigoProductoS;
//                                                 } catch (e) { console.warn("Fallback merma"); }
//                                             }
//                                             setSelectedLinea(lb); setShowPesajeModal(true);
//                                         } : undefined}
//                                         title={!canEditOperacion ? motivoBloqueo : ""}
//                                     >
//                                         <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                             {item.tipo}
//                                         </span>
//                                         {!canEditOperacion && <div className="text-muted small">Bloqueado</div>}
//                                     </div>
//                                     <div className="grid-cell-placeholder"></div>
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(item.totSO)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value="0" 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(item.totAt)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(item.totRo)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                 </div>
//                             ))}
//                         </div>
                       
//                         <div className="detalle-footer">
//                             <div className="balance-grid">
//                                 <div className="balance-label">Kgs.Entrantes</div> <div className="balance-label">Programados</div> <div className="balance-label">Sobre Orden</div>
//                                 <div className="balance-label">Calidad</div> <div className="balance-label">Sobrante</div> <div className="balance-label">Scrap</div> <div className="balance-label">Saldo</div>
//                                 <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div> <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
//                                 <div className="balance-value">{formatNumber(balance.sobreOrden)}</div> <div className="balance-value">{formatNumber(balance.calidad)}</div>
//                                 <div className="balance-value">{formatNumber(balance.sobrante)}</div> <div className="balance-value">{formatNumber(balance.scrap)}</div>
//                                 <div className="balance-value font-weight-bold" style={{ color: balance.saldo < 0 ? 'red' : 'white' }}>{formatNumber(balance.saldo)}</div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
               
//                 <div className="actions-sidebar">
//                     <button className="btn btn-info btn-block" onClick={() => navigate(`/registracion/inspeccion/${operacionId}/${header.LoteID}`)}>Inspección</button>
//                     <button className={`btn btn-block ${isSuspended ? 'btn-info' : 'btn-warning'}`} onClick={() => setShowSupervisorModal(true)}>{isSuspended ? 'Activar' : 'Suspender'}</button>
//                     <hr style={{ borderColor: 'white', width: '100%' }} />
//                     <button className="btn btn-light btn-block" disabled={header.tieneNotasSRP}>Notas SRP</button>
//                     <button className="btn btn-light btn-block" onClick={() => setShowToleranciasModal(true)} disabled={!isOperationEditable}>Tolerancias</button>
//                     <button className="btn btn-light btn-block" onClick={() => navigate(`/registracion/fichatecnica/${operacionId}`)}>Ficha Técnica</button>
//                     <button 
//                         className="btn btn-light btn-block" 
//                         onClick={handleNotasCalipsoClick}
//                         disabled={!header.tieneNotasCalipso}
//                         title={!header.tieneNotasCalipso ? "No hay notas de Calipso para esta operación" : ""}
//                         style={!header.tieneNotasCalipso ? { 
//                             opacity: 0.6, 
//                             cursor: 'not-allowed',
//                             backgroundColor: '#e9ecef'
//                         } : {}}
//                     >
//                         Notas Calipso
//                     </button>
//                     {header.tieneNotasCalipso && (
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
                    
//                     {!canEditOperacion && isOperationEditable && (
//                         <div className="alert alert-warning mt-2 p-2 text-center" style={{
//                             fontWeight: 'bold',
//                             backgroundColor: '#ffc107',
//                             color: '#000',
//                             border: 'none',
//                             borderRadius: '4px',
//                             width: '100%'
//                         }}>
//                             {!inspeccionData ? "Cargando inspección..." : "⚠️ Revise el Inicio en Inspección"}
//                         </div>
//                     )}
//                     <div className="cierre-container">
//                         <button 
//                             className={`btn btn-success btn-block ${modalLoading ? 'btn-cierre-loading' : ''}`} 
//                             onClick={handleCierreClick}
//                             disabled={!canEditOperacion || modalLoading}
//                             title={!canEditOperacion ? motivoBloqueo : "Cerrar operación"}
//                             style={!canEditOperacion && !modalLoading ? {
//                                 backgroundColor: '#6c757d',
//                                 borderColor: '#6c757d',
//                                 cursor: 'not-allowed',
//                                 opacity: 0.6
//                             } : {}}
//                         >
//                             {modalLoading ? (
//                                 <>
//                                     <i className="fas fa-spinner fa-spin mr-2"></i>
//                                     <span>Cerrando...</span>
//                                 </>
//                             ) : (
//                                 'CIERRE'
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {showPesajeModal && selectedLinea && (
//                 <PesajeModalSelector lineaData={selectedLinea} operacionId={operacionId} onClose={() => setShowPesajeModal(false)} onSuccess={fetchData} />
//             )}
//             {showSupervisorModal && <SupervisorAuthModal onClose={() => setShowSupervisorModal(false)} onConfirm={fetchData} />}
//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
//             {showNotasCalipsoModal && <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />}
//         </>
//     );
// };

// export default EditarOperacion;




































// // src/pages/EditarOperacion.jsx
// import React, { useEffect, useState, useMemo } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './EditarOperacion.css';
// import CuchillasModal from '../components/CuchillasModal';
// import CuchillasInputModal from '../components/CuchillasInputModal';
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

// const EditarOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [editedLineas, setEditedLineas] = useState([]);
//     const [hasChanges, setHasChanges] = useState(false);
   
//     const [showCuchillasModal, setShowCuchillasModal] = useState(false);
//     const [cuchillasData, setCuchillasData] = useState(null);
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showCuchillasInputModal, setShowCuchillasInputModal] = useState(false);
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const operationStatusFromGrid = location.state?.operationStatus;
//     const [maquinaNumero, setMaquinaNumero] = useState("");
    
//     const [inspeccionData, setInspeccionData] = useState(null);

//     const fetchData = async () => {
//         if (!operacionId) {
//             navigate('/registracion');
//             return;
//         }
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//             const fetchedData = response.data || { header: {}, lineas: [], balance: {} };
//             const maquinaId = fetchedData.header?.maquinaId || "No disponible";
//             const maquinaMatch = maquinaId?.match(/^SL(\d+)$/);
//             setMaquinaNumero(maquinaMatch ? maquinaMatch[1] : "No disponible");
//             setData(fetchedData);
//             setEditedLineas([...fetchedData.lineas]);
//             setHasChanges(false);
//         } catch (err) {
//             Swal.fire('Error', 'No se pudo cargar el detalle.', 'error');
//             navigate('/registracion');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchData(); }, [operacionId, navigate]);
    
//     useEffect(() => {
//         const fetchInspeccionData = async () => {
//             if (!operacionId || !data?.header?.LoteID) return;
//             try {
//                 const response = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${data.header.LoteID}`);
//                 setInspeccionData(response.data);
//             } catch (error) {
//                 console.error('Error al cargar inspección:', error);
//             }
//         };
//         fetchInspeccionData();
//     }, [operacionId, data?.header?.LoteID]);

//     // ✅ FIX 1: NORMALIZAR el estado. La grilla puede viajar en state.operationStatus el OBJETO de
//     // estilos ({backgroundColor, caliIcon,...}) o un string. Si no es string, mandamos con el
//     // status que calcula el backend (fuente de verdad). Antes includes(objeto) => siempre false.
//     const statusFromGrid = typeof operationStatusFromGrid === 'string' ? operationStatusFromGrid : '';
//     const currentStatus = useMemo(() => statusFromGrid || data?.header?.status || '', [statusFromGrid, data]);

//     // ✅ Gris, amarillo tolerancia y calidad dictaminada editables, como en VB
//     const isOperationEditable = useMemo(() => 
//         ['LISTA', 'EN_PROCESO', 'EN_CALIDAD', 'CALIDAD_DICTAMINADA', 'TOLERANCIA_EXCEDIDA'].includes(currentStatus), 
//     [currentStatus]);

//     // ✅ FIX 2 (paridad VB frmDetalleSlitter_Load):
//     //    if (!Inicial.bVer || !Inicial.bInspeccionInicialOK) panel2.Enabled = false;
//     //    → lo ÚNICO que bloquea los clicks de pesaje es que el INICIO de inspección esté revisado.
//     //    El color (gris/amarillo) NO bloquea el pesaje; las pasadas completas y la inspección FINAL
//     //    se exigen recién en el CIERRE (bInspeccionFinalOK), que ya se valida en handleCierreClick.
//     const inicioRevisado = !!inspeccionData?.header?.inicioRevisado;

//     const canEditOperacion = useMemo(() => {
//         return isOperationEditable && inicioRevisado;
//     }, [isOperationEditable, inicioRevisado]);

//     const motivoBloqueo = !isOperationEditable
//         ? "El estado de la operación no permite registrar"
//         : (!inspeccionData ? "Cargando inspección..." : "Debe revisar el inicio en Inspección");

//     const handleSaveChanges = async () => {
//         if (!hasChanges) return;
//         setModalLoading(true);
//         try {
//             const changes = editedLineas.map((linea, index) => {
//                 const original = data.lineas[index];
//                 const changedFields = {};
//                 ['Programados', 'SobreOrden', 'Calidad', 'Atados', 'Rollos'].forEach(field => {
//                     if (linea[field] !== original[field]) changedFields[field] = linea[field];
//                 });
//                 return { ...linea, changedFields };
//             }).filter(l => Object.keys(l.changedFields).length > 0);
//             await axiosInstance.put(`/registracion/actualizar-lineas/${operacionId}`, { lineas: changes });
//             await Swal.fire('¡Éxito!', 'Cambios guardados.', 'success');
//             setHasChanges(false);
//             await fetchData();
//         } catch (error) { Swal.fire('Error', 'Error al guardar.', 'error'); } 
//         finally { setModalLoading(false); }
//     };

//     // ✅ VALIDACIONES DEL VB.NET PARA EL CIERRE
//     const validarCierreVB = async () => {
//         if (!data || !data.lineas || !data.balance) {
//             return { valido: false, mensajes: [], requiereSupervisor: false };
//         }

//         const TOLERANCIA_GENERAL = 0.005; // 0.5%
//         const TOLERANCIA_INDIVIDUAL = 0.35; // 35%
        
//         let mensajesError = [];
//         let hayFueraTolerancia = false;
//         let faltaDictamenCalidad = false;
//         let requiereSupervisor = false;

//         for (const linea of data.lineas) {
//             if (linea.esSobrante || linea.esScrap) continue;

//             const programados = parseFloat(linea.Programados) || 0;
//             const sobreOrden = parseFloat(linea.SobreOrden) || 0;
//             const calidad = parseFloat(linea.Calidad) || 0;
//             const totalRegistrado = sobreOrden + calidad;

//             if (programados === 0) continue;

//             let toleranciaProg = programados * TOLERANCIA_GENERAL;
//             if (toleranciaProg < 2) toleranciaProg = 2;

//             const diferencia = Math.abs(totalRegistrado - programados);
            
//             if (diferencia > toleranciaProg) {
//                 hayFueraTolerancia = true;
//                 mensajesError.push(`Fuera Tolerancia en Serie/Lote ${linea.Destino || linea.SerieLote}`);
//             }

//             let toleranciaInd = programados * TOLERANCIA_INDIVIDUAL;
//             if (toleranciaInd < 2) toleranciaInd = 2;
//             if (diferencia > toleranciaInd) {
//                 requiereSupervisor = true;
//             }

//             if (calidad > 0 && !linea.dictamen) {
//                 faltaDictamenCalidad = true;
//                 mensajesError.push(`${linea.Destino || linea.SerieLote} - FALTA DICTAMEN DE CALIDAD`);
//             }
//         }

//         const lineasSobrante = data.lineas.filter(l => l.esSobrante);
//         for (const sobrante of lineasSobrante) {
//             const calidadSobrante = parseFloat(sobrante.Calidad) || 0;
//             if (calidadSobrante > 0) {
//                 requiereSupervisor = false;
//                 faltaDictamenCalidad = true;
//                 mensajesError.push("Sobrante - FALTA DICTAMEN DE CALIDAD");
//             }
//         }

//         const lineasScrap = data.lineas.filter(l => l.esScrap);
//         for (const scrap of lineasScrap) {
//             const calidadScrap = parseFloat(scrap.Calidad) || 0;
//             if (calidadScrap > 0) {
//                 faltaDictamenCalidad = true;
//                 mensajesError.push("Scrap - FALTA DICTAMEN DE CALIDAD");
//             }
//         }

//         const kgsEntrantes = parseFloat(data.balance.kgsEntrantes) || 0;
//         const sobreOrdenTotal = parseFloat(data.balance.sobreOrden) || 0;
//         const calidadTotal = parseFloat(data.balance.calidad) || 0;
//         const sobranteTotal = parseFloat(data.balance.sobrante) || 0;
//         const scrapTotal = parseFloat(data.balance.scrap) || 0;
        
//         const saldo = kgsEntrantes - sobreOrdenTotal - calidadTotal - sobranteTotal - scrapTotal;
//         const saldoAbsoluto = Math.abs(saldo);
        
//         let toleranciaSaldo = kgsEntrantes * TOLERANCIA_GENERAL;
//         if (toleranciaSaldo < 2) toleranciaSaldo = 2;
        
//         const toleranciaSaldoFormatted = toleranciaSaldo.toFixed(2).replace('.', ',');
        
//         if (saldoAbsoluto > toleranciaSaldo) {
//             hayFueraTolerancia = true;
//             mensajesError.push(`El SALDO DEBE estar dentro de la TOLERANCIA para efectuar el cierre: ${toleranciaSaldoFormatted} kgs.`);
//         }

//         if (mensajesError.length > 0) {
//             return {
//                 valido: false,
//                 requiereSupervisor,
//                 mensajes: mensajesError,
//                 saldo: saldo.toFixed(2),
//                 toleranciaSaldo: toleranciaSaldo.toFixed(2)
//             };
//         }

//         return {
//             valido: true,
//             requiereSupervisor,
//             mensajes: [],
//             saldo: saldo.toFixed(2)
//         };
//     };

//     // ✅ FUNCIÓN DE CIERRE CON VALIDACIONES VB.NET
//     const handleCierreClick = async () => {
//         // ✅ VALIDACIÓN 1 (VB: bInspeccionFinalOK)
//         if (!inspeccionData?.header?.finalRevisado) {
//             await Swal.fire({
//                 title: 'Advertencia',
//                 text: 'Se debe aprobar la INSPECCION FINAL antes de cerrar la operación',
//                 icon: 'warning',
//                 confirmButtonText: 'Aceptar',
//                 confirmButtonColor: '#ffc107'
//             });
//             return;
//         }

//         // ✅ VALIDACIÓN 2: tolerancia / calidad / saldo
//         const validacion = await validarCierreVB();
        
//         if (!validacion.valido) {
//             const mensajeCompleto = validacion.mensajes.join('\n');
//             await Swal.fire({
//                 title: 'Advertencia',
//                 html: `<div style="text-align: left; white-space: pre-wrap; font-family: monospace;">${mensajeCompleto}</div>`,
//                 icon: 'warning',
//                 confirmButtonText: 'Aceptar',
//                 confirmButtonColor: '#ffc107'
//             });
//             return;
//         }

//         const result = await Swal.fire({
//             title: '¿Confirmar Cierre?',
//             text: 'Se CERRARA la operación.',
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonColor: '#28a745',
//             confirmButtonText: 'Sí, cerrar',
//             cancelButtonText: 'Cancelar',
//             cancelButtonColor: '#6c757d'
//         });
        
//         if (!result.isConfirmed) return;

//         setModalLoading(true);
//         try {
//             const userStr = localStorage.getItem('user'); 
//             const userObj = userStr ? JSON.parse(userStr) : { nombre: 'SISTEMA' };
            
//             await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, { 
//                 usuario: userObj.nombre
//             });
            
//             await Swal.fire('¡Éxito!', 'Operación cerrada con éxito.', 'success');
//             navigate(`/registracion/operaciones/${data.header.maquinaId}`);
//         } catch (error) {
//             Swal.fire('Error', error.response?.data?.error || 'Error al cerrar.', 'error');
//         } finally {
//             setModalLoading(false);
//         }
//     };

//     const handleNotasCalipsoClick = async () => {
//         setModalLoading(true); setShowNotasCalipsoModal(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/notas-calipso/${operacionId}`);
//             setNotasCalipso(response.data.notes);
//         } catch (error) { setShowNotasCalipsoModal(false); } 
//         finally { setModalLoading(false); }
//     };

//     // ✅ VB: btnFichaTecnica_Click -> Inicial.sFicha = "FTD"
//     //    Abre frmFichaTecnica con grilla; al clickear un producto → frmFichaTecnicaDetalle
//     const handleFichaTecnicaClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data?.header?.SerieLote || '',
//                     Matching: data?.header?.Matching || '',
//                     CodigoProducto: data?.header?.CodigoProducto || ''
//                 },
//                 tipoFicha: 'FTD'
//             }
//         });
//     };

//     // ✅ VB: btFichaEmbalaje_Click -> Inicial.sFicha = "FE"
//     //    Abre frmFichaTecnica con grilla; al clickear un producto → abre PDF "TIPO XX.pdf"
//     const handleFichaEmbalajeClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data?.header?.SerieLote || '',
//                     Matching: data?.header?.Matching || '',
//                     CodigoProducto: data?.header?.CodigoProducto || ''
//                 },
//                 tipoFicha: 'FE'
//             }
//         });
//     };

//     if (loading || !data) return null;
//     const { header, balance } = data;
//     const isSuspended = currentStatus === 'SUSPENDIDA';

//     return (
//         <>
//             <div className={`detalle-container ${isOperationEditable ? 'editar-mode' : ''}`}>
//                 <div className="main-content">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                         <h1 className="m-0" style={{ color: 'white' }}>REGISTRACION Slitter {maquinaNumero} - Editar Operación</h1>
//                         <button className="btn btn-secondary" onClick={() => navigate(-1)}><i className="fas fa-arrow-left mr-2"></i>Volver a la Grilla</button>
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
//                                         <div className="info-item" style={{ marginTop: '0.5rem', borderTop: '1px solid #ccc', paddingTop: '0.5rem' }}>
//                                             <span className="info-value" style={{ fontSize: '0.85rem',  color: '#1b03f5', fontWeight: 'bold' }}>
//                                                 {header.CodigoProducto || 'N/A'}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* SECCIÓN Cuchillas, Pasadas, Diámetro, Corona - ESTILO VB.NET */}
//                     <div className="cuchillas-panel">
//                         <div className="cuchillas-item">
//                             <span className="cuchillas-label">Cuchillas:</span>
//                             <span className="cuchillas-value">{header.Cuchillas || 'N/A'}</span>
//                         </div>
                        
//                         <div className="cuchillas-item">
//                             <span className="cuchillas-label">Pasadas:</span>
//                             <span className="cuchillas-value">{header.Pasadas || '0'}</span>
//                         </div>
                        
//                         <div className="cuchillas-item">
//                             <span className="cuchillas-label">Diámetro:</span>
//                             <span className="cuchillas-value">{header.Diametro || '0'}</span>
//                         </div>
                        
//                         <div className="cuchillas-item">
//                             <span className="cuchillas-label">Corona:</span>
//                             <span className="cuchillas-value">{header.Corona || '0'}</span>
//                         </div>
//                     </div>

//                     <div className="detalle-body-container">
//                         <div className="grid-header">
//                             <div></div> <div>Programados</div> <div>Sobre Orden</div> <div>Calidad (Suspendido)</div> <div>Atados</div> <div>Rollos</div>
//                         </div>
//                         <div className="grid-body">
//                             {editedLineas
//                                 .filter(l => !l.esSobrante && !l.esScrap) 
//                                 .map((linea, index) => (
//                                 <div key={index} className="grid-row" style={{ cursor: 'default' }}>
//                                     <div
//                                         className="grid-cell-desc"
//                                         style={{ 
//                                             cursor: canEditOperacion ? 'pointer' : 'default',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         onClick={canEditOperacion ? () => {
//                                             setSelectedLinea({ ...linea, bSobrante: false, bScrap: false, SerieLote: header.SerieLote });
//                                             setShowPesajeModal(true);
//                                         } : undefined}
//                                         title={!canEditOperacion ? motivoBloqueo : ""}
//                                     >
//                                         <div>
//                                             <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                                 {String(linea.Ancho || 'N/A')}
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                                 {String(linea.Cuchillas || 'N/A')}
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                                 {String(linea.Tarea || 'N/A')}
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                                 {linea.Destino ? String(linea.Destino || '').substring(0, 11) : 'N/A'}
//                                             </span>
//                                         </div>
//                                         {!canEditOperacion && <div className="text-muted small">Bloqueado</div>}
//                                     </div>
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.Programados)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.SobreOrden)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.Calidad)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.TotAtados)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(linea.TotRollos)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                 </div>
//                             ))}

//                             {[
//                                 { tipo: 'Sobrante', totSO: balance.sobrante, totAt: balance.atadosSobrante, totRo: balance.rollosSobrante, config: { bSobrante: true, bScrap: false, Tarea: 'Sobrante' } },
//                                 { tipo: 'Scrap Seriado', totSO: balance.scrapSeriado, totAt: balance.atadosScrapSeriado, totRo: balance.rollosScrapSeriado, config: { bSobrante: false, bScrap: true, bScrapSeriado: true, Tarea: 'Scrap Seriado' } },
//                                 { tipo: 'Scrap No Seriado', totSO: balance.scrapNoSeriado, totAt: balance.atadosScrapNoSeriado, totRo: balance.rollosScrapNoSeriado, config: { bSobrante: false, bScrap: true, bScrapNoSeriado: true, Tarea: 'Scrap No Seriado' } }
//                             ].map((item) => (
//                                 <div key={item.tipo} className="grid-row" style={{ cursor: 'default' }}>
//                                     <div
//                                         className="grid-cell-desc font-weight-bold"
//                                         style={{ 
//                                             cursor: canEditOperacion ? 'pointer' : 'default',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         onClick={canEditOperacion ? async () => {
//                                             let lb = { ...item.config, Ancho: header.Ancho, Cuchillas: header.Cuchillas, SerieLote: header.SerieLote, LoteID: header.LoteID, Operacion_ID: operacionId, Programados: 0 };
//                                             if (item.tipo === 'Scrap Seriado') {
//                                                 try {
//                                                     const res = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
//                                                     lb.CodigoProductoS = res.data.CodigoProductoS;
//                                                 } catch (e) { console.warn("Fallback merma"); }
//                                             }
//                                             setSelectedLinea(lb); setShowPesajeModal(true);
//                                         } : undefined}
//                                         title={!canEditOperacion ? motivoBloqueo : ""}
//                                     >
//                                         <span style={{ color: canEditOperacion ? 'black' : 'gray' }}>
//                                             {item.tipo}
//                                         </span>
//                                         {!canEditOperacion && <div className="text-muted small">Bloqueado</div>}
//                                     </div>
//                                     <div className="grid-cell-placeholder"></div>
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(item.totSO)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value="0" 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(item.totAt)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                     <input 
//                                         type="text" 
//                                         className="form-control grid-cell-input"
//                                         style={{
//                                             backgroundColor: canEditOperacion ? '#fff' : '#e8e4d9',
//                                             opacity: canEditOperacion ? 1 : 0.7
//                                         }}
//                                         value={formatNumber(item.totRo)} 
//                                         readOnly 
//                                         disabled={!canEditOperacion}
//                                     />
//                                 </div>
//                             ))}
//                         </div>
                       
//                         <div className="detalle-footer">
//                             <div className="balance-grid">
//                                 <div className="balance-label">Kgs.Entrantes</div> <div className="balance-label">Programados</div> <div className="balance-label">Sobre Orden</div>
//                                 <div className="balance-label">Calidad</div> <div className="balance-label">Sobrante</div> <div className="balance-label">Scrap</div> <div className="balance-label">Saldo</div>
//                                 <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div> <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
//                                 <div className="balance-value">{formatNumber(balance.sobreOrden)}</div> <div className="balance-value">{formatNumber(balance.calidad)}</div>
//                                 <div className="balance-value">{formatNumber(balance.sobrante)}</div> <div className="balance-value">{formatNumber(balance.scrap)}</div>
//                                 <div className="balance-value font-weight-bold" style={{ color: balance.saldo < 0 ? 'red' : 'white' }}>{formatNumber(balance.saldo)}</div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
               
//                 <div className="actions-sidebar">
//                     <button className="btn btn-info btn-block" onClick={() => navigate(`/registracion/inspeccion/${operacionId}/${header.LoteID}`)}>Inspección</button>
//                     <button className={`btn btn-block ${isSuspended ? 'btn-info' : 'btn-warning'}`} onClick={() => setShowSupervisorModal(true)}>{isSuspended ? 'Activar' : 'Suspender'}</button>
//                     <hr style={{ borderColor: 'white', width: '100%' }} />
//                     <button className="btn btn-light btn-block" disabled={header.tieneNotasSRP}>Notas SRP</button>
//                     <button className="btn btn-light btn-block" onClick={() => setShowToleranciasModal(true)} disabled={!isOperationEditable}>Tolerancias</button>
//                     {/* ✅ VB: btnFichaTecnica_Click -> sFicha = "FTD" */}
//                     <button className="btn btn-light btn-block" onClick={handleFichaTecnicaClick}>Ficha Técnica</button>
//                     {/* ✅ VB: btFichaEmbalaje_Click -> sFicha = "FE" */}
//                     <button className="btn btn-light btn-block" onClick={handleFichaEmbalajeClick}>Ficha Embalaje</button>
//                     <button 
//                         className="btn btn-light btn-block" 
//                         onClick={handleNotasCalipsoClick}
//                         disabled={!header.tieneNotasCalipso}
//                         title={!header.tieneNotasCalipso ? "No hay notas de Calipso para esta operación" : ""}
//                         style={!header.tieneNotasCalipso ? { 
//                             opacity: 0.6, 
//                             cursor: 'not-allowed',
//                             backgroundColor: '#e9ecef'
//                         } : {}}
//                     >
//                         Notas Calipso
//                     </button>
//                     {header.tieneNotasCalipso && (
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
                    
//                     {!canEditOperacion && isOperationEditable && (
//                         <div className="alert alert-warning mt-2 p-2 text-center" style={{
//                             fontWeight: 'bold',
//                             backgroundColor: '#ffc107',
//                             color: '#000',
//                             border: 'none',
//                             borderRadius: '4px',
//                             width: '100%'
//                         }}>
//                             {!inspeccionData ? "Cargando inspección..." : "⚠️ Revise el Inicio en Inspección"}
//                         </div>
//                     )}
//                     <div className="cierre-container">
//                         <button 
//                             className={`btn btn-success btn-block ${modalLoading ? 'btn-cierre-loading' : ''}`} 
//                             onClick={handleCierreClick}
//                             disabled={!canEditOperacion || modalLoading}
//                             title={!canEditOperacion ? motivoBloqueo : "Cerrar operación"}
//                             style={!canEditOperacion && !modalLoading ? {
//                                 backgroundColor: '#6c757d',
//                                 borderColor: '#6c757d',
//                                 cursor: 'not-allowed',
//                                 opacity: 0.6
//                             } : {}}
//                         >
//                             {modalLoading ? (
//                                 <>
//                                     <i className="fas fa-spinner fa-spin mr-2"></i>
//                                     <span>Cerrando...</span>
//                                 </>
//                             ) : (
//                                 'CIERRE'
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {showPesajeModal && selectedLinea && (
//                 <PesajeModalSelector lineaData={selectedLinea} operacionId={operacionId} onClose={() => setShowPesajeModal(false)} onSuccess={fetchData} />
//             )}
//             {showSupervisorModal && <SupervisorAuthModal onClose={() => setShowSupervisorModal(false)} onConfirm={fetchData} />}
//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
//             {showNotasCalipsoModal && <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />}
//         </>
//     );
// };

// export default EditarOperacion;


































// // src/pages/EditarOperacion.jsx
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

// const EditarOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [editedLineas, setEditedLineas] = useState([]);
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const [maquinaNumero, setMaquinaNumero] = useState("");
//     const [inspeccionData, setInspeccionData] = useState(null);

//     const operationStatusFromGrid = location.state?.operationStatus;

//     const fetchData = async () => {
//         if (!operacionId) { navigate('/registracion'); return; }
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//             const fetchedData = response.data || { header: {}, lineas: [], balance: {} };
//             const maquinaId = fetchedData.header?.maquinaId || "No disponible";
//             const maquinaMatch = maquinaId?.match(/^SL(\d+)$/);
//             setMaquinaNumero(maquinaMatch ? maquinaMatch[1] : "No disponible");
//             setData(fetchedData);
//             setEditedLineas([...fetchedData.lineas]);
//         } catch (err) {
//             Swal.fire('Error', 'No se pudo cargar el detalle.', 'error');
//             navigate('/registracion');
//         } finally { setLoading(false); }
//     };

//     useEffect(() => { fetchData(); }, [operacionId, navigate]);
    
//     useEffect(() => {
//         const fetchInspeccionData = async () => {
//             if (!operacionId || !data?.header?.LoteID) return;
//             try {
//                 const response = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${data.header.LoteID}`);
//                 setInspeccionData(response.data);
//             } catch (error) { console.error('Error al cargar inspección:', error); }
//         };
//         fetchInspeccionData();
//     }, [operacionId, data?.header?.LoteID]);

//     // ✅ VB.NET: el color/estado NUNCA bloquea las tarjetas ni el cierre.
//     //    Las tarjetas son SIEMPRE clickeables.
//     //    El CIERRE está SIEMPRE habilitado y valida al hacer click.
//     const CAN_EDIT = true; // Sin candados

//     const handleCierreClick = async () => {
//         // ✅ VALIDACIÓN 1 (VB: CierroFinal → bInspeccionFinalOK)
//         if (!inspeccionData?.header?.finalRevisado) {
//             await Swal.fire({
//                 title: 'Advertencia',
//                 text: 'Se debe aprobar la INSPECCION FINAL antes de cerrar la operación',
//                 icon: 'warning',
//                 confirmButtonText: 'Aceptar',
//                 confirmButtonColor: '#ffc107'
//             });
//             return;
//         }

//         // ✅ VALIDACIÓN 2: tolerancia / calidad / saldo (VB: btnCierre_Click + Cierro)
//         if (!data || !data.lineas || !data.balance) return;

//         const TOLERANCIA_GENERAL = 0.005;
//         const TOLERANCIA_INDIVIDUAL = 0.35;
//         let mensajesError = [];
//         let requiereSupervisor = false;

//         for (const linea of data.lineas) {
//             if (linea.esSobrante || linea.esScrap) continue;
//             const programados = parseFloat(linea.Programados) || 0;
//             const sobreOrden = parseFloat(linea.SobreOrden) || 0;
//             const calidad = parseFloat(linea.Calidad) || 0;
//             const totalRegistrado = sobreOrden + calidad;
//             if (programados === 0) continue;

//             let toleranciaProg = programados * TOLERANCIA_GENERAL;
//             if (toleranciaProg < 2) toleranciaProg = 2;
//             const diferencia = Math.abs(totalRegistrado - programados);
            
//             if (diferencia > toleranciaProg) {
//                 mensajesError.push(`Fuera Tolerancia en Serie/Lote ${linea.Destino || linea.SerieLote}`);
//             }
//             let toleranciaInd = programados * TOLERANCIA_INDIVIDUAL;
//             if (toleranciaInd < 2) toleranciaInd = 2;
//             if (diferencia > toleranciaInd) requiereSupervisor = true;
//             if (calidad > 0 && !linea.dictamen) {
//                 mensajesError.push(`${linea.Destino || linea.SerieLote} - FALTA DICTAMEN DE CALIDAD`);
//             }
//         }

//         const kgsEntrantes = parseFloat(data.balance.kgsEntrantes) || 0;
//         const sobreOrdenTotal = parseFloat(data.balance.sobreOrden) || 0;
//         const calidadTotal = parseFloat(data.balance.calidad) || 0;
//         const sobranteTotal = parseFloat(data.balance.sobrante) || 0;
//         const scrapTotal = parseFloat(data.balance.scrap) || 0;
//         const saldo = kgsEntrantes - sobreOrdenTotal - calidadTotal - sobranteTotal - scrapTotal;
//         const saldoAbsoluto = Math.abs(saldo);
//         let toleranciaSaldo = kgsEntrantes * TOLERANCIA_GENERAL;
//         if (toleranciaSaldo < 2) toleranciaSaldo = 2;
        
//         if (saldoAbsoluto > toleranciaSaldo) {
//             mensajesError.push(`El SALDO DEBE estar dentro de la TOLERANCIA: ${toleranciaSaldo.toFixed(2).replace('.', ',')} kgs.`);
//         }

//         if (mensajesError.length > 0) {
//             await Swal.fire({
//                 title: 'Advertencia',
//                 html: `<div style="text-align: left; white-space: pre-wrap; font-family: monospace;">${mensajesError.join('\n')}</div>`,
//                 icon: 'warning',
//                 confirmButtonText: 'Aceptar',
//                 confirmButtonColor: '#ffc107'
//             });
//             return;
//         }

//         const result = await Swal.fire({
//             title: '¿Confirmar Cierre?',
//             text: 'Se CERRARA la operación.',
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonColor: '#28a745',
//             confirmButtonText: 'Sí, cerrar',
//             cancelButtonText: 'Cancelar',
//             cancelButtonColor: '#6c757d'
//         });
//         if (!result.isConfirmed) return;

//         setModalLoading(true);
//         try {
//             const userStr = localStorage.getItem('user'); 
//             const userObj = userStr ? JSON.parse(userStr) : { nombre: 'SISTEMA' };
//             await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, { usuario: userObj.nombre });
//             await Swal.fire('¡Éxito!', 'Operación cerrada con éxito.', 'success');
//             navigate(`/registracion/operaciones/${data.header.maquinaId}`);
//         } catch (error) {
//             Swal.fire('Error', error.response?.data?.error || 'Error al cerrar.', 'error');
//         } finally { setModalLoading(false); }
//     };

//     const handleNotasCalipsoClick = async () => {
//         setModalLoading(true); setShowNotasCalipsoModal(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/notas-calipso/${operacionId}`);
//             setNotasCalipso(response.data.notes);
//         } catch (error) { setShowNotasCalipsoModal(false); } 
//         finally { setModalLoading(false); }
//     };

//     const handleFichaTecnicaClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: { headerData: { SerieLote: data?.header?.SerieLote, Matching: data?.header?.Matching, CodigoProducto: data?.header?.CodigoProducto }, tipoFicha: 'FTD' }
//         });
//     };

//     const handleFichaEmbalajeClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: { headerData: { SerieLote: data?.header?.SerieLote, Matching: data?.header?.Matching, CodigoProducto: data?.header?.CodigoProducto }, tipoFicha: 'FE' }
//         });
//     };

//     if (loading || !data) return null;
//     const { header, balance } = data;
//     const currentStatus = data?.header?.status || '';
//     const isSuspended = currentStatus === 'SUSPENDIDA';

//     return (
//         <>
//             <div className="detalle-container editar-mode">
//                 <div className="main-content">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                         <h1 className="m-0" style={{ color: 'white' }}>REGISTRACION Slitter {maquinaNumero} - Editar Operación</h1>
//                         <button className="btn btn-secondary" onClick={() => navigate(-1)}><i className="fas fa-arrow-left mr-2"></i>Volver a la Grilla</button>
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
//                                         <div className="info-item" style={{ marginTop: '0.5rem', borderTop: '1px solid #ccc', paddingTop: '0.5rem' }}>
//                                             <span className="info-value" style={{ fontSize: '0.85rem', color: '#1b03f5', fontWeight: 'bold' }}>
//                                                 {header.CodigoProducto || 'N/A'}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="cuchillas-panel">
//                         <div className="cuchillas-item"><span className="cuchillas-label">Cuchillas:</span><span className="cuchillas-value">{header.Cuchillas || 'N/A'}</span></div>
//                         <div className="cuchillas-item"><span className="cuchillas-label">Pasadas:</span><span className="cuchillas-value">{header.Pasadas || '0'}</span></div>
//                         <div className="cuchillas-item"><span className="cuchillas-label">Diámetro:</span><span className="cuchillas-value">{header.Diametro || '0'}</span></div>
//                         <div className="cuchillas-item"><span className="cuchillas-label">Corona:</span><span className="cuchillas-value">{header.Corona || '0'}</span></div>
//                     </div>

//                     <div className="detalle-body-container">
//                         <div className="grid-header">
//                             <div></div> <div>Programados</div> <div>Sobre Orden</div> <div>Calidad (Suspendido)</div> <div>Atados</div> <div>Rollos</div>
//                         </div>
//                         <div className="grid-body">
//                             {editedLineas.filter(l => !l.esSobrante && !l.esScrap).map((linea, index) => (
//                                 <div key={index} className="grid-row">
//                                     <div
//                                         className="grid-cell-desc"
//                                         style={{ cursor: 'pointer' }}
//                                         onClick={() => {
//                                             setSelectedLinea({ ...linea, bSobrante: false, bScrap: false, SerieLote: header.SerieLote });
//                                             setShowPesajeModal(true);
//                                         }}
//                                     >
//                                         <div><span>{String(linea.Ancho || 'N/A')}</span></div>
//                                         <div><span>{String(linea.Cuchillas || 'N/A')}</span></div>
//                                         <div><span>{String(linea.Tarea || 'N/A')}</span></div>
//                                         <div><span>{linea.Destino ? String(linea.Destino).substring(0, 11) : 'N/A'}</span></div>
//                                         <div><span>Atados: {linea.AtadosTeoricos || 0} Rollos: {linea.RollosTeoricos || 0}</span></div>
//                                     </div>
//                                     <input type="text" className="form-control grid-cell-input" value={formatNumber(linea.Programados)} readOnly />
//                                     <input type="text" className="form-control grid-cell-input" value={formatNumber(linea.SobreOrden)} readOnly />
//                                     <input type="text" className="form-control grid-cell-input" value={formatNumber(linea.Calidad)} readOnly />
//                                     <input type="text" className="form-control grid-cell-input" value={formatNumber(linea.TotAtados)} readOnly />
//                                     <input type="text" className="form-control grid-cell-input" value={formatNumber(linea.TotRollos)} readOnly />
//                                 </div>
//                             ))}

//                             {[
//                                 { tipo: 'Sobrante', totSO: balance.sobrante, totAt: balance.atadosSobrante, totRo: balance.rollosSobrante, config: { bSobrante: true, bScrap: false, Tarea: 'Sobrante' } },
//                                 { tipo: 'Scrap Seriado', totSO: balance.scrapSeriado, totAt: balance.atadosScrapSeriado, totRo: balance.rollosScrapSeriado, config: { bSobrante: false, bScrap: true, bScrapSeriado: true, Tarea: 'Scrap Seriado' } },
//                                 { tipo: 'Scrap No Seriado', totSO: balance.scrapNoSeriado, totAt: balance.atadosScrapNoSeriado, totRo: balance.rollosScrapNoSeriado, config: { bSobrante: false, bScrap: true, bScrapNoSeriado: true, Tarea: 'Scrap No Seriado' } }
//                             ].map((item) => (
//                                 <div key={item.tipo} className="grid-row">
//                                     <div
//                                         className="grid-cell-desc font-weight-bold"
//                                         style={{ cursor: 'pointer' }}
//                                         onClick={async () => {
//                                             let lb = { ...item.config, Ancho: header.Ancho, Cuchillas: header.Cuchillas, SerieLote: header.SerieLote, LoteID: header.LoteID, Operacion_ID: operacionId, Programados: 0 };
//                                             if (item.tipo === 'Scrap Seriado') {
//                                                 try {
//                                                     const res = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
//                                                     lb.CodigoProductoS = res.data.CodigoProductoS;
//                                                 } catch (e) {}
//                                             }
//                                             setSelectedLinea(lb); setShowPesajeModal(true);
//                                         }}
//                                     >
//                                         <span>{item.tipo}</span>
//                                     </div>
//                                     <div className="grid-cell-placeholder"></div>
//                                     <input type="text" className="form-control grid-cell-input" value={formatNumber(item.totSO)} readOnly />
//                                     <input type="text" className="form-control grid-cell-input" value="0" readOnly />
//                                     <input type="text" className="form-control grid-cell-input" value={formatNumber(item.totAt)} readOnly />
//                                     <input type="text" className="form-control grid-cell-input" value={formatNumber(item.totRo)} readOnly />
//                                 </div>
//                             ))}
//                         </div>
                       
//                         <div className="detalle-footer">
//                             <div className="balance-grid">
//                                 <div className="balance-label">Kgs.Entrantes</div> <div className="balance-label">Programados</div> <div className="balance-label">Sobre Orden</div>
//                                 <div className="balance-label">Calidad</div> <div className="balance-label">Sobrante</div> <div className="balance-label">Scrap</div> <div className="balance-label">Saldo</div>
//                                 <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div> <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
//                                 <div className="balance-value">{formatNumber(balance.sobreOrden)}</div> <div className="balance-value">{formatNumber(balance.calidad)}</div>
//                                 <div className="balance-value">{formatNumber(balance.sobrante)}</div> <div className="balance-value">{formatNumber(balance.scrap)}</div>
//                                 <div className="balance-value font-weight-bold" style={{ color: balance.saldo < 0 ? 'red' : 'white' }}>{formatNumber(balance.saldo)}</div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
               
//                 <div className="actions-sidebar">
//                     <button className="btn btn-info btn-block" onClick={() => navigate(`/registracion/inspeccion/${operacionId}/${header.LoteID}`)}>Inspección</button>
//                     <button className={`btn btn-block ${isSuspended ? 'btn-info' : 'btn-warning'}`} onClick={() => setShowSupervisorModal(true)}>{isSuspended ? 'Activar' : 'Suspender'}</button>
//                     <hr style={{ borderColor: 'white', width: '100%' }} />
//                     <button className="btn btn-light btn-block" disabled={header.tieneNotasSRP}>Notas SRP</button>
//                     <button className="btn btn-light btn-block" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
//                     <button className="btn btn-light btn-block" onClick={handleFichaTecnicaClick}>Ficha Técnica</button>
//                     <button className="btn btn-light btn-block" onClick={handleFichaEmbalajeClick}>Ficha Embalaje</button>
//                     <button 
//                         className="btn btn-light btn-block" 
//                         onClick={handleNotasCalipsoClick}
//                         disabled={!header.tieneNotasCalipso}
//                         style={!header.tieneNotasCalipso ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
//                     >Notas Calipso</button>
//                     {header.tieneNotasCalipso && (
//                         <div className="alert alert-danger mt-2 p-2 text-center" style={{ fontWeight: 'bold', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', width: '100%' }}>
//                             Existen Notas en CALIPSO
//                         </div>
//                     )}
//                     <div className="cierre-container">
//                         <button 
//                             className={`btn btn-success btn-block ${modalLoading ? 'btn-cierre-loading' : ''}`} 
//                             onClick={handleCierreClick}
//                             disabled={modalLoading}
//                         >
//                             {modalLoading ? (<><i className="fas fa-spinner fa-spin mr-2"></i><span>Cerrando...</span></>) : 'CIERRE'}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {showPesajeModal && selectedLinea && (
//                 <PesajeModalSelector lineaData={selectedLinea} operacionId={operacionId} onClose={() => setShowPesajeModal(false)} onSuccess={fetchData} />
//             )}
//             {showSupervisorModal && <SupervisorAuthModal onClose={() => setShowSupervisorModal(false)} onConfirm={fetchData} />}
//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
//             {showNotasCalipsoModal && <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />}
//         </>
//     );
// };

// export default EditarOperacion;















































// src/pages/EditarOperacion.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './EditarOperacion.css';
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
    const [modalLoading, setModalLoading] = useState(false);
    const [showToleranciasModal, setShowToleranciasModal] = useState(false);
    const [showSupervisorModal, setShowSupervisorModal] = useState(false);
    const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
    const [notasCalipso, setNotasCalipso] = useState('');
    const [showPesajeModal, setShowPesajeModal] = useState(false);
    const [selectedLinea, setSelectedLinea] = useState(null);
    const [maquinaNumero, setMaquinaNumero] = useState("");
    const [inspeccionData, setInspeccionData] = useState(null);

    const operationStatusFromGrid = location.state?.operationStatus;

    const fetchData = async () => {
        if (!operacionId) { navigate('/registracion'); return; }
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
            const fetchedData = response.data || { header: {}, lineas: [], balance: {} };
            const maquinaId = fetchedData.header?.maquinaId || "No disponible";
            const maquinaMatch = maquinaId?.match(/^SL(\d+)$/);
            setMaquinaNumero(maquinaMatch ? maquinaMatch[1] : "No disponible");
            setData(fetchedData);
            setEditedLineas([...fetchedData.lineas]);
        } catch (err) {
            Swal.fire('Error', 'No se pudo cargar el detalle.', 'error');
            navigate('/registracion');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [operacionId, navigate]);

    useEffect(() => {
        const fetchInspeccionData = async () => {
            if (!operacionId || !data?.header?.LoteID) return;
            try {
                const response = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${data.header.LoteID}`);
                setInspeccionData(response.data);
            } catch (error) { console.error('Error al cargar inspección:', error); }
        };
        fetchInspeccionData();
    }, [operacionId, data?.header?.LoteID]);

    const handleCierreClick = async () => {
        // ✅ VB: groupBox1 (Balance + CIERRE) ya nace deshabilitado sin inspección inicial;
        //    doble guarda por si el botón se habilitara en el futuro.
        if (!data?.header?.inicioRevisado) {
            await Swal.fire({
                title: 'Advertencia',
                text: 'Se debe aprobar la INSPECCIÓN INICIAL (IniciaCorte) antes de cerrar la operación',
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        // ✅ VALIDACIÓN 2 (VB: CierroFinal → bInspeccionFinalOK)
        if (!inspeccionData?.header?.finalRevisado) {
            await Swal.fire({
                title: 'Advertencia',
                text: 'Se debe aprobar la INSPECCION FINAL antes de cerrar la operación',
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        // ✅ VALIDACIÓN 3: tolerancia / calidad / saldo (VB: btnCierre_Click + Cierro)
        if (!data || !data.lineas || !data.balance) return;

        const TOLERANCIA_GENERAL = 0.005;
        const TOLERANCIA_INDIVIDUAL = 0.35;
        let mensajesError = [];
        let requiereSupervisor = false;

        for (const linea of data.lineas) {
            if (linea.esSobrante || linea.esScrap) continue;
            const programados = parseFloat(linea.Programados) || 0;
            const sobreOrden = parseFloat(linea.SobreOrden) || 0;
            const calidad = parseFloat(linea.Calidad) || 0;
            const totalRegistrado = sobreOrden + calidad;
            if (programados === 0) continue;

            let toleranciaProg = programados * TOLERANCIA_GENERAL;
            if (toleranciaProg < 2) toleranciaProg = 2;
            const diferencia = Math.abs(totalRegistrado - programados);

            if (diferencia > toleranciaProg) {
                mensajesError.push(`Fuera Tolerancia en Serie/Lote ${linea.Destino || linea.SerieLote}`);
            }
            let toleranciaInd = programados * TOLERANCIA_INDIVIDUAL;
            if (toleranciaInd < 2) toleranciaInd = 2;
            if (diferencia > toleranciaInd) requiereSupervisor = true;
            if (calidad > 0 && !linea.dictamen) {
                mensajesError.push(`${linea.Destino || linea.SerieLote} - FALTA DICTAMEN DE CALIDAD`);
            }
        }

        const kgsEntrantes = parseFloat(data.balance.kgsEntrantes) || 0;
        const sobreOrdenTotal = parseFloat(data.balance.sobreOrden) || 0;
        const calidadTotal = parseFloat(data.balance.calidad) || 0;
        const sobranteTotal = parseFloat(data.balance.sobrante) || 0;
        const scrapTotal = parseFloat(data.balance.scrap) || 0;
        const saldo = kgsEntrantes - sobreOrdenTotal - calidadTotal - sobranteTotal - scrapTotal;
        const saldoAbsoluto = Math.abs(saldo);
        let toleranciaSaldo = kgsEntrantes * TOLERANCIA_GENERAL;
        if (toleranciaSaldo < 2) toleranciaSaldo = 2;

        if (saldoAbsoluto > toleranciaSaldo) {
            mensajesError.push(`El SALDO DEBE estar dentro de la TOLERANCIA: ${toleranciaSaldo.toFixed(2).replace('.', ',')} kgs.`);
        }

        if (mensajesError.length > 0) {
            await Swal.fire({
                title: 'Advertencia',
                html: `<div style="text-align: left; white-space: pre-wrap; font-family: monospace;">${mensajesError.join('\n')}</div>`,
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        const result = await Swal.fire({
            title: '¿Confirmar Cierre?',
            text: 'Se CERRARA la operación.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            confirmButtonText: 'Sí, cerrar',
            cancelButtonText: 'Cancelar',
            cancelButtonColor: '#6c757d'
        });
        if (!result.isConfirmed) return;

        setModalLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const userObj = userStr ? JSON.parse(userStr) : { nombre: 'SISTEMA' };
            await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, { usuario: userObj.nombre });
            await Swal.fire('¡Éxito!', 'Operación cerrada con éxito.', 'success');
            navigate(`/registracion/operaciones/${data.header.maquinaId}`);
        } catch (error) {
            Swal.fire('Error', error.response?.data?.error || 'Error al cerrar.', 'error');
        } finally { setModalLoading(false); }
    };

    const handleNotasCalipsoClick = async () => {
        setModalLoading(true); setShowNotasCalipsoModal(true);
        try {
            const response = await axiosInstance.get(`/registracion/notas-calipso/${operacionId}`);
            setNotasCalipso(response.data.notes);
        } catch (error) { setShowNotasCalipsoModal(false); }
        finally { setModalLoading(false); }
    };

    const handleFichaTecnicaClick = () => {
        navigate(`/registracion/fichatecnica/${operacionId}`, {
            state: { headerData: { SerieLote: data?.header?.SerieLote, Matching: data?.header?.Matching, CodigoProducto: data?.header?.CodigoProducto }, tipoFicha: 'FTD' }
        });
    };

    const handleFichaEmbalajeClick = () => {
        navigate(`/registracion/fichatecnica/${operacionId}`, {
            state: { headerData: { SerieLote: data?.header?.SerieLote, Matching: data?.header?.Matching, CodigoProducto: data?.header?.CodigoProducto }, tipoFicha: 'FE' }
        });
    };

    if (loading || !data) return null;
    const { header, balance } = data;
    const currentStatus = data?.header?.status || '';
    const isSuspended = currentStatus === 'SUSPENDIDA';

    // ✅✅ PARIDAD VB (frmDetalleSlitter_Load + Control_Inspeccion):
    //    bInspeccionInicialOK = (SP_TraerInspeccionSlitter.IniciaCorte == 1) → header.inicioRevisado
    //    if (!bVer || !bInspeccionInicialOK) { panel2.Enabled=false; groupBox1.Enabled=false; btnTolerancias.Enabled=false; }
    //    En la web "Editar" = bVer true → el candado depende SOLO de inicioRevisado.
        // ✅ Normalizado: el SP puede devolver bit (true), int (1) o char ('1')
    const esOK = (v) => v === true || v === 1 || String(v ?? '').trim().toLowerCase() === '1' || String(v ?? '').trim().toLowerCase() === 'true';
    const CAN_EDIT = esOK(header?.inicioRevisado);
    console.log('🔒 [EditarOperacion] inicioRevisado CRUDO =', header?.inicioRevisado, '| CAN_EDIT =', CAN_EDIT);

    // ✅ Apertura de pesaje con guarda (equivale a panel2 deshabilitado en VB)
    const abrirPesaje = (lineaExtra) => {
        if (!CAN_EDIT) {
            Swal.fire({
                title: 'Edición bloqueada',
                text: 'Debe aprobarse la INSPECCIÓN INICIAL (IniciaCorte) en el formulario de Inspección antes de registrar pesajes.',
                icon: 'warning',
                confirmButtonText: 'Ir a Inspección',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
            }).then(r => {
                if (r.isConfirmed) navigate(`/registracion/inspeccion/${operacionId}/${header.LoteID}`);
            });
            return;
        }
        setSelectedLinea(lineaExtra);
        setShowPesajeModal(true);
    };

    return (
        <>
            <div className="detalle-container editar-mode">
                <div className="main-content">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h1 className="m-0" style={{ color: 'white' }}>REGISTRACION Slitter {maquinaNumero} - Editar Operación</h1>
                        <button className="btn btn-secondary" onClick={() => navigate(-1)}><i className="fas fa-arrow-left mr-2"></i>Volver a la Grilla</button>
                    </div>

                    {/* ✅ Cartel VB: sin inspección inicial la edición queda bloqueada */}
                    {!CAN_EDIT && (
                        <div className="alert alert-warning py-2 mb-2" style={{ fontWeight: 'bold' }}>
                            <i className="fas fa-clipboard-check mr-2"></i>
                            Inspección inicial pendiente: la grilla de pesajes, Tolerancias y el CIERRE permanecen bloqueados (como en el VB) hasta aprobar el INICIO DE CORTE en Inspección.
                        </div>
                    )}

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
                                        <div className="info-item" style={{ marginTop: '0.5rem', borderTop: '1px solid #ccc', paddingTop: '0.5rem' }}>
                                            <span className="info-value" style={{ fontSize: '0.85rem', color: '#1b03f5', fontWeight: 'bold' }}>
                                                {header.CodigoProducto || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="cuchillas-panel">
                        <div className="cuchillas-item"><span className="cuchillas-label">Cuchillas:</span><span className="cuchillas-value">{header.Cuchillas || 'N/A'}</span></div>
                        <div className="cuchillas-item"><span className="cuchillas-label">Pasadas:</span><span className="cuchillas-value">{header.Pasadas || '0'}</span></div>
                        <div className="cuchillas-item"><span className="cuchillas-label">Diámetro:</span><span className="cuchillas-value">{header.Diametro || '0'}</span></div>
                        <div className="cuchillas-item"><span className="cuchillas-label">Corona:</span><span className="cuchillas-value">{header.Corona || '0'}</span></div>
                    </div>

                    {/* ✅ panel2 del VB: se deshabilita completo sin inspección inicial */}
                    <div className="detalle-body-container" style={!CAN_EDIT ? { opacity: 0.75 } : {}}>
                        <div className="grid-header">
                            <div></div> <div>Programados</div> <div>Sobre Orden</div> <div>Calidad (Suspendido)</div> <div>Atados</div> <div>Rollos</div>
                        </div>
                        <div className="grid-body">
                            {editedLineas.filter(l => !l.esSobrante && !l.esScrap).map((linea, index) => (
                                <div key={index} className={`grid-row ${CAN_EDIT ? '' : 'disabled-row'}`}>
                                    <div
                                        className="grid-cell-desc"
                                        style={{ cursor: CAN_EDIT ? 'pointer' : 'not-allowed' }}
                                        onClick={() => abrirPesaje({ ...linea, bSobrante: false, bScrap: false, SerieLote: header.SerieLote })}
                                    >
                                        <div><span>{String(linea.Ancho || 'N/A')}</span></div>
                                        <div><span>{String(linea.Cuchillas || 'N/A')}</span></div>
                                        <div><span>{String(linea.Tarea || 'N/A')}</span></div>
                                        <div><span>{linea.Destino ? String(linea.Destino).substring(0, 11) : 'N/A'}</span></div>
                                        <div><span>Atados: {linea.AtadosTeoricos || 0} Rollos: {linea.RollosTeoricos || 0}</span></div>
                                    </div>
                                    <input type="text" className="form-control grid-cell-input" value={formatNumber(linea.Programados)} readOnly disabled={!CAN_EDIT} />
                                    <input type="text" className="form-control grid-cell-input" value={formatNumber(linea.SobreOrden)} readOnly disabled={!CAN_EDIT} />
                                    <input type="text" className="form-control grid-cell-input" value={formatNumber(linea.Calidad)} readOnly disabled={!CAN_EDIT} />
                                    <input type="text" className="form-control grid-cell-input" value={formatNumber(linea.TotAtados)} readOnly disabled={!CAN_EDIT} />
                                    <input type="text" className="form-control grid-cell-input" value={formatNumber(linea.TotRollos)} readOnly disabled={!CAN_EDIT} />
                                </div>
                            ))}

                            {[
                                { tipo: 'Sobrante', totSO: balance.sobrante, totAt: balance.atadosSobrante, totRo: balance.rollosSobrante, config: { bSobrante: true, bScrap: false, Tarea: 'Sobrante' } },
                                { tipo: 'Scrap Seriado', totSO: balance.scrapSeriado, totAt: balance.atadosScrapSeriado, totRo: balance.rollosScrapSeriado, config: { bSobrante: false, bScrap: true, bScrapSeriado: true, Tarea: 'Scrap Seriado' } },
                                { tipo: 'Scrap No Seriado', totSO: balance.scrapNoSeriado, totAt: balance.atadosScrapNoSeriado, totRo: balance.rollosScrapNoSeriado, config: { bSobrante: false, bScrap: true, bScrapNoSeriado: true, Tarea: 'Scrap No Seriado' } }
                            ].map((item) => (
                                <div key={item.tipo} className={`grid-row ${CAN_EDIT ? '' : 'disabled-row'}`}>
                                    <div
                                        className="grid-cell-desc font-weight-bold"
                                        style={{ cursor: CAN_EDIT ? 'pointer' : 'not-allowed' }}
                                        onClick={async () => {
                                            if (!CAN_EDIT) { abrirPesaje(null); return; }   // muestra el aviso
                                            let lb = { ...item.config, Ancho: header.Ancho, Cuchillas: header.Cuchillas, SerieLote: header.SerieLote, LoteID: header.LoteID, Operacion_ID: operacionId, Programados: 0 };
                                            if (item.tipo === 'Scrap Seriado') {
                                                try {
                                                    const res = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
                                                    lb.CodigoProductoS = res.data.CodigoProductoS;
                                                } catch (e) {}
                                            }
                                            abrirPesaje(lb);
                                        }}
                                    >
                                        <span>{item.tipo}</span>
                                    </div>
                                    <div className="grid-cell-placeholder"></div>
                                    <input type="text" className="form-control grid-cell-input" value={formatNumber(item.totSO)} readOnly disabled={!CAN_EDIT} />
                                    <input type="text" className="form-control grid-cell-input" value="0" readOnly disabled={!CAN_EDIT} />
                                    <input type="text" className="form-control grid-cell-input" value={formatNumber(item.totAt)} readOnly disabled={!CAN_EDIT} />
                                    <input type="text" className="form-control grid-cell-input" value={formatNumber(item.totRo)} readOnly disabled={!CAN_EDIT} />
                                </div>
                            ))}
                        </div>

                        {/* ✅ groupBox1 del VB (Balance + CIERRE): también se bloquea */}
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
                    {/* ✅ VB: btnInspeccion solo se deshabilita si !bVer Y !inicioOK → en Edición queda SIEMPRE habilitado */}
                    <button className="btn btn-info btn-block" onClick={() => navigate(`/registracion/inspeccion/${operacionId}/${header.LoteID}`)}>Inspección</button>
                    <button className={`btn btn-block ${isSuspended ? 'btn-info' : 'btn-warning'}`} onClick={() => setShowSupervisorModal(true)}>{isSuspended ? 'Activar' : 'Suspender'}</button>
                    <hr style={{ borderColor: 'white', width: '100%' }} />
                    <button className="btn btn-light btn-block" disabled={header.tieneNotasSRP}>Notas SRP</button>
                    {/* ✅ VB: btnTolerancias.Enabled = false sin inspección inicial */}
                    <button className="btn btn-light btn-block" onClick={() => setShowToleranciasModal(true)} disabled={!CAN_EDIT}
                        style={!CAN_EDIT ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>Tolerancias</button>
                    <button className="btn btn-light btn-block" onClick={handleFichaTecnicaClick}>Ficha Técnica</button>
                    <button className="btn btn-light btn-block" onClick={handleFichaEmbalajeClick}>Ficha Embalaje</button>
                    <button
                        className="btn btn-light btn-block"
                        onClick={handleNotasCalipsoClick}
                        disabled={!header.tieneNotasCalipso}
                        style={!header.tieneNotasCalipso ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                    >Notas Calipso</button>
                    {header.tieneNotasCalipso && (
                        <div className="alert alert-danger mt-2 p-2 text-center" style={{ fontWeight: 'bold', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', width: '100%' }}>
                            Existen Notas en CALIPSO
                        </div>
                    )}
                    <div className="cierre-container">
                        {/* ✅ VB: groupBox1.Enabled=false → CIERRE gris sin inspección inicial */}
                        <button
                            className={`btn btn-success btn-block ${modalLoading ? 'btn-cierre-loading' : ''}`}
                            onClick={handleCierreClick}
                            disabled={modalLoading || !CAN_EDIT}
                            title={!CAN_EDIT ? 'Bloqueado: falta aprobar la Inspección Inicial' : ''}
                        >
                            {modalLoading ? (<><i className="fas fa-spinner fa-spin mr-2"></i><span>Cerrando...</span></>) : 'CIERRE'}
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
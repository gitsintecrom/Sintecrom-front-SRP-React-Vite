// // src/pages/DetalleOperacion.jsx

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance'; // Asumiendo que tienes este archivo
// import Swal from 'sweetalert2';

// const DetalleOperacion = () => {
//     const { operacionId } = useParams(); // Obtiene el ID de la URL
//     const navigate = useNavigate();
    
//     // (Opcional, para el futuro) Estado para guardar los detalles
//     const [detalle, setDetalle] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // useEffect(() => {
//     //     // AQUÍ HARÍAS LA LLAMADA A LA API PARA OBTENER LOS DETALLES
//     //     // Por ejemplo: axiosInstance.get(`/registracion/detalle/${operacionId}`)
//     //     //     .then(res => setDetalle(res.data))
//     //     //     .catch(err => Swal.fire('Error', 'No se pudo cargar el detalle', 'error'))
//     //     //     .finally(() => setLoading(false));
//     //     
//     //     // Por ahora, solo simulamos la carga
//     //     setTimeout(() => setLoading(false), 500);
//     // }, [operacionId]);
    
//     // if (loading) {
//     //     return <div>Cargando detalle de la operación...</div>
//     // }

//     return (
//         <>
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="d-flex justify-content-between align-items-center">
//                         <h1>Detalle de la Operación</h1>
//                         <button className="btn btn-secondary" onClick={() => navigate(-1)}>
//                             <i className="fas fa-arrow-left mr-2"></i>Volver
//                         </button>
//                     </div>
//                 </div>
//             </div>
//             <div className="content">
//                 <div className="container-fluid">
//                     <div className="card">
//                         <div className="card-body">
//                             <h5 className="card-title">Información de la Operación</h5>
//                             <p className="card-text mt-3">
//                                 El ID de la operación seleccionada es:
//                             </p>
//                             <pre><code>{operacionId}</code></pre>
//                             <p className="card-text">
//                                 (Aquí se mostrará el resto de la información de la operación).
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default DetalleOperacion;





// // /src/pages/DetalleOperacion.jsx

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './DetalleOperacion.css'; // Importamos los nuevos estilos

// const InfoItem = ({ label, value, bold = false }) => (
//     <div className="info-item">
//         <span className="info-label">{label}:</span>
//         <span className={`info-value ${bold ? 'font-weight-bold' : ''}`}>{value}</span>
//     </div>
// );

// const DetalleOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
    
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (!operacionId) return;
//             setLoading(true);
//             try {
//                 const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//                 setData(response.data);
//             } catch (err) {
//                 console.error("Error fetching operation details:", err);
//                 Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
//                 navigate(-1);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [operacionId, navigate]);

//     if (loading) {
//         return (
//             <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
//                 <div className="spinner-border text-primary" role="status"><span className="sr-only">Cargando...</span></div>
//             </div>
//         );
//     }
    
//     if (!data) return <div className="p-4 text-white">No se encontraron datos para esta operación.</div>;

//     const { header, lineas, balance } = data;

//     return (
//         <div className="detalle-container">
//             {/* Encabezado Superior */}
//             <div className="detalle-header">
//                 <div className="row">
//                     <div className="col-lg-7">
//                         <InfoItem label="Clientes" value={header.Clientes} bold />
//                         <div className="row mt-2">
//                             <div className="col-sm-6">
//                                 <InfoItem label="Serie/Lote" value={header.SerieLote} bold />
//                                 <InfoItem label="Matching" value={header.Matching} />
//                                 <InfoItem label="Batch" value={header.Batch} />
//                             </div>
//                              <div className="col-sm-6">
//                                 <InfoItem label="Stock" value={parseFloat(header.Stock || 0).toLocaleString()} />
//                                 <InfoItem label="Kgs Programados" value={parseFloat(header.KgsProgramados || 0).toLocaleString()} />
//                             </div>
//                         </div>
//                         <InfoItem label="Scrap Programado" value={parseFloat(header.ScrapProgramado || 0).toFixed(2)} />
//                     </div>
//                     <div className="col-lg-5">
//                         <div className="card h-100 mb-0 bg-dark">
//                              <div className="card-header py-1 bg-secondary text-white">
//                                 <h3 className="card-title font-weight-bold">ENTRANTE</h3>
//                             </div>
//                             <div className="card-body py-2">
//                                 <InfoItem label="Familia" value={header.Familia} />
//                                 <InfoItem label="Aleación" value={header.Aleacion} />
//                                 <InfoItem label="Temple" value={header.Temple} />
//                                 <InfoItem label="Espesor" value={header.Espesor} />
//                                 <InfoItem label="País Origen" value={header.PaisOrigen} />
//                                 <InfoItem label="Recubrimiento" value={header.Recubrimiento} />
//                                 <InfoItem label="Calidad" value={header.Calidad} />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                  <div className="cuchillas-block">
//                     <InfoItem label="Cuchillas" value={header.Cuchillas} bold />
//                     <InfoItem label="Pasadas" value={header.Pasadas} />
//                     <InfoItem label="Diámetro" value={header.Diametro} />
//                     <InfoItem label="Corona" value={header.Corona} />
//                 </div>
//             </div>

//             {/* Cuerpo - Grilla de Registración */}
//             <div className="detalle-body">
//                  <div className="grid-header">
//                     <div></div>
//                     <div>Programados</div>
//                     <div>Sobre Orden</div>
//                     <div>Calidad (Suspendido)</div>
//                     <div>Tot.Atados</div>
//                     <div>Tot.Rollos</div>
//                 </div>
//                 <div className="grid-body">
//                     {lineas.map((linea, index) => (
//                         <div key={index} className="grid-row">
//                             <div className="grid-cell-desc" style={{ whiteSpace: 'pre-wrap' }}>{linea.Descripcion}</div>
//                             <input type="text" className="form-control grid-cell-input" readOnly value={parseFloat(linea.Programados || 0).toLocaleString()} />
//                             <input type="text" className="form-control grid-cell-input" readOnly value={parseFloat(linea.SobreOrden || 0).toLocaleString()} />
//                             <input type="text" className="form-control grid-cell-input" readOnly value={parseFloat(linea.Calidad || 0).toLocaleString()} />
//                             <input type="text" className="form-control grid-cell-input" readOnly value={linea.TotAtados || 0} />
//                             <input type="text" className="form-control grid-cell-input" readOnly value={linea.TotRollos || 0} />
//                         </div>
//                     ))}
//                     <div className="grid-row">
//                         <div className="grid-cell-desc font-weight-bold">Sobrante</div>
//                         <div className="grid-cell-placeholder"></div>
//                         <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                     </div>
//                 </div>
//             </div>

//             {/* Footer - Balance de Masas */}
//             <div className="detalle-footer">
//                 <div className="balance-grid">
//                     <div>Kgs.Entrantes</div><div>Programados</div><div>Sobre Orden</div><div>Calidad</div><div>Sobrante</div><div>Scrap</div><div>Saldo</div>
//                     <div className="font-weight-bold">{parseFloat(balance.kgsEntrantes || 0).toLocaleString()}</div>
//                     <div className="font-weight-bold">{parseFloat(balance.programados || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
//                     <div className="font-weight-bold">{parseFloat(balance.sobreOrden || 0).toLocaleString()}</div>
//                     <div className="font-weight-bold">{parseFloat(balance.calidad || 0).toLocaleString()}</div>
//                     <div className="font-weight-bold">{parseFloat(balance.sobrante || 0).toLocaleString()}</div>
//                     <div className="font-weight-bold">{parseFloat(balance.scrap || 0).toLocaleString()}</div>
//                     <div className="font-weight-bold">{parseFloat(balance.saldo || 0).toLocaleString()}</div>
//                 </div>
//             </div>
            
//             <div className="actions-sidebar">
//                 <button className="btn btn-info btn-block">Inspección</button>
//                 <button className="btn btn-warning btn-block">Suspender</button>
//                 <hr style={{ borderColor: 'white' }} />
//                 <button className="btn btn-light btn-block">Notas SRP</button>
//                 <button className="btn btn-light btn-block">Tolerancias</button>
//                 <button className="btn btn-light btn-block">Ficha Técnica</button>
//                 <button className="btn btn-light btn-block">Notas Calipso</button>
//                 <div className="cierre-container">
//                     <button className="btn btn-success btn-block">CIERRE</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DetalleOperacion;






// // /src/pages/DetalleOperacion.jsx

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './DetalleOperacion.css';

// const InfoItem = ({ label, value, bold = false }) => (
//     <div className="info-item">
//         <span className="info-label">{label}:</span>
//         <span className={`info-value ${bold ? 'font-weight-bold' : ''}`}>{value || 'N/A'}</span>
//     </div>
// );

// const DetalleOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
    
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (!operacionId) return;
//             setLoading(true);
//             try {
//                 const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//                 setData(response.data);
//             } catch (err) {
//                 console.error("Error fetching operation details:", err);
//                 Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
//                 navigate(-1);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [operacionId, navigate]);

//     if (loading) {
//         return (
//             <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
//                 <div className="spinner-border text-primary" role="status"><span className="sr-only">Cargando...</span></div>
//             </div>
//         );
//     }
    
//     if (!data) return <div className="p-4 text-white">No se encontraron datos para esta operación.</div>;

//     const { header, lineas, balance } = data;

//     return (
//         <div className="detalle-container">
//             <div className="detalle-header card card-body bg-dark text-white">
//                 <div className="row">
//                     <div className="col-lg-7">
//                         <InfoItem label="Clientes" value={header.Clientes} bold />
//                         <div className="row mt-2">
//                             <div className="col-sm-6">
//                                 <InfoItem label="Serie/Lote" value={header.SerieLote} bold />
//                                 <InfoItem label="Matching" value={header.Matching} />
//                                 <InfoItem label="Batch" value={header.Batch} />
//                             </div>
//                              <div className="col-sm-6">
//                                 <InfoItem label="Stock" value={parseFloat(header.Stock || 0).toLocaleString()} />
//                                 <InfoItem label="Kgs Programados" value={parseFloat(header.KgsProgramados || 0).toLocaleString()} />
//                             </div>
//                         </div>
//                         <InfoItem label="Scrap Programado" value={parseFloat(header.ScrapProgramado || 0).toFixed(2)} />
//                     </div>
//                     <div className="col-lg-5">
//                         <div className="card h-100 mb-0 bg-secondary">
//                              <div className="card-header py-1 text-white">
//                                 <h3 className="card-title font-weight-bold">ENTRANTE</h3>
//                             </div>
//                             <div className="card-body py-2">
//                                 <InfoItem label="Familia" value={header.Familia} />
//                                 <InfoItem label="Aleación" value={header.Aleacion} />
//                                 <InfoItem label="Temple" value={header.Temple} />
//                                 <InfoItem label="Espesor" value={header.Espesor} />
//                                 <InfoItem label="País Origen" value={header.PaisOrigen} />
//                                 <InfoItem label="Recubrimiento" value={header.Recubrimiento} />
//                                 <InfoItem label="Calidad" value={header.Calidad} />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                  <div className="cuchillas-block">
//                     <InfoItem label="Cuchillas" value={header.Cuchillas} bold />
//                     <InfoItem label="Pasadas" value={header.Pasadas} />
//                     <InfoItem label="Diámetro" value={header.Diametro} />
//                     <InfoItem label="Corona" value={header.Corona} />
//                 </div>
//             </div>

//             <div className="detalle-body card bg-dark text-white">
//                  <div className="card-header grid-header">
//                     <div></div>
//                     <div>Programados</div>
//                     <div>Sobre Orden</div>
//                     <div>Calidad (Suspendido)</div>
//                     <div>Tot.Atados</div>
//                     <div>Tot.Rollos</div>
//                 </div>
//                 <div className="card-body grid-body">
//                     {lineas.map((linea, index) => (
//                         <div key={index} className="grid-row">
//                             <div className="grid-cell-desc" style={{ whiteSpace: 'pre-wrap' }}>{linea.Descripcion}</div>
//                             <input type="text" className="form-control grid-cell-input" readOnly value={parseFloat(linea.Programados || 0).toLocaleString()} />
//                             <input type="text" className="form-control grid-cell-input" readOnly value={parseFloat(linea.SobreOrden || 0).toLocaleString()} />
//                             <input type="text" className="form-control grid-cell-input" readOnly value={parseFloat(linea.Calidad || 0).toLocaleString()} />
//                             <input type="text" className="form-control grid-cell-input" readOnly value={linea.TotAtados || 0} />
//                             <input type="text" className="form-control grid-cell-input" readOnly value={linea.TotRollos || 0} />
//                         </div>
//                     ))}
//                     <div className="grid-row">
//                         <div className="grid-cell-desc font-weight-bold">Sobrante</div>
//                         <div className="grid-cell-placeholder"></div>
//                         <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                     </div>
//                 </div>
//             </div>

//             <div className="detalle-footer card card-body bg-dark text-white">
//                 <h5 className="card-title">Balance de Masas</h5>
//                 <div className="balance-grid">
//                     <div>Kgs.Entrantes</div><div>Programados</div><div>Sobre Orden</div><div>Calidad</div><div>Sobrante</div><div>Scrap</div><div>Saldo</div>
//                     <div className="font-weight-bold">{parseFloat(balance.kgsEntrantes || 0).toLocaleString()}</div>
//                     <div className="font-weight-bold">{parseFloat(balance.programados || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
//                     <div className="font-weight-bold">{parseFloat(balance.sobreOrden || 0).toLocaleString()}</div>
//                     <div className="font-weight-bold">{parseFloat(balance.calidad || 0).toLocaleString()}</div>
//                     <div className="font-weight-bold">{parseFloat(balance.sobrante || 0).toLocaleString()}</div>
//                     <div className="font-weight-bold">{parseFloat(balance.scrap || 0).toLocaleString()}</div>
//                     <div className="font-weight-bold">{parseFloat(balance.saldo || 0).toLocaleString()}</div>
//                 </div>
//             </div>
            
//             <div className="actions-sidebar">
//                 <button className="btn btn-info btn-block">Inspección</button>
//                 <button className="btn btn-warning btn-block">Suspender</button>
//                 <hr style={{ borderColor: 'white' }} />
//                 <button className="btn btn-light btn-block">Notas SRP</button>
//                 <button className="btn btn-light btn-block">Tolerancias</button>
//                 <button className="btn btn-light btn-block">Ficha Técnica</button>
//                 <button className="btn btn-light btn-block">Notas Calipso</button>
//                 <div className="cierre-container">
//                     <button className="btn btn-success btn-block">CIERRE</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DetalleOperacion;




// // /src/pages/DetalleOperacion.jsx -- VERSIÓN VISUAL MEJORADA

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './DetalleOperacion.css';

// // Componente reutilizable para mostrar información
// const InfoItem = ({ label, value, bold = false }) => (
//     <div className="info-item">
//         <span className="info-label">{label}:</span>
//         <span className={`info-value ${bold ? 'bold' : ''}`}>{value || 'N/A'}</span>
//     </div>
// );

// // Formateador de números para que coincida con el original
// const formatNumber = (num, decimals = 0) => {
//     const number = parseFloat(num);
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('de-DE', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const DetalleOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
    
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (!operacionId) return;
//             setLoading(true);
//             try {
//                 const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//                 setData(response.data);
//             } catch (err) {
//                 console.error("Error fetching operation details:", err);
//                 Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
//                 navigate('/registracion'); // Volver a la selección de máquinas
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [operacionId, navigate]);

//     if (loading) {
//         return (
//             <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
//                 <div className="spinner-border text-primary" role="status"><span className="sr-only">Cargando...</span></div>
//             </div>
//         );
//     }
    
//     if (!data) return <div className="p-4 text-white">No se encontraron datos para esta operación.</div>;

//     const { header, lineas, balance } = data;

//     return (
//         <div className="detalle-container">
//             <div className="main-content">
//                 {/* Encabezado Superior */}
//                 <div className="detalle-header">
//                     <div className="header-top-row">
//                         <div className="header-left-col">
//                             <InfoItem label="Clientes" value={header.Clientes} />
//                             <div className="row mt-2">
//                                 <div className="col-sm-6">
//                                     <InfoItem label="Serie/Lote" value={header.SerieLote} bold />
//                                     <InfoItem label="Matching" value={header.Matching} />
//                                     <InfoItem label="Batch" value={header.Batch} />
//                                 </div>
//                                 <div className="col-sm-6">
//                                     <InfoItem label="Stock" value={formatNumber(header.Stock)} />
//                                     <InfoItem label="Kgs Programados" value={formatNumber(header.KgsProgramados, 2)} />
//                                 </div>
//                             </div>
//                             <InfoItem label="Scrap Programado" value={formatNumber(header.ScrapProgramado, 2)} />
//                         </div>
//                         <div className="header-right-col">
//                             <div className="entrante-block">
//                                 <div className="entrante-header">ENTRANTE</div>
//                                 <div className="entrante-body">
//                                     <InfoItem label="Familia" value={header.Familia} />
//                                     <InfoItem label="Aleación" value={header.Aleacion} />
//                                     <InfoItem label="Temple" value={header.Temple} />
//                                     <InfoItem label="Espesor" value={header.Espesor} />
//                                     <InfoItem label="País Origen" value={header.PaisOrigen} />
//                                     <InfoItem label="Recubrimiento" value={header.Recubrimiento} />
//                                     <InfoItem label="Calidad" value={header.Calidad} />
//                                     <InfoItem label="Ancho" value={header.Ancho} />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="cuchillas-block">
//                         <InfoItem label="Cuchillas" value={header.Cuchillas} bold />
//                         <InfoItem label="Pasadas" value={header.Pasadas} />
//                         <InfoItem label="Diámetro" value={header.Diametro} />
//                         <InfoItem label="Corona" value={header.Corona} />
//                     </div>
//                 </div>

//                 {/* Cuerpo - Grilla de Registración */}
//                 <div className="detalle-body">
//                     <div className="grid-header">
//                         <div></div> {/* Espacio para la descripción */}
//                         <div>Programados</div>
//                         <div>Sobre Orden</div>
//                         <div>Calidad (Suspendido)</div>
//                         <div>Tot.Atados</div>
//                         <div>Tot.Rollos</div>
//                     </div>
//                     <div className="grid-body">
//                         {lineas.map((linea, index) => (
//                             <div key={index} className="grid-row">
//                                 <div className="grid-cell-desc" style={{ whiteSpace: 'pre-wrap' }}>{linea.Descripcion}</div>
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Programados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.SobreOrden)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Calidad)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotAtados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotRollos)} />
//                             </div>
//                         ))}
//                         <div className="grid-row">
//                             <div className="grid-cell-desc font-weight-bold">Sobrante</div>
//                             <div className="grid-cell-placeholder"></div>
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Footer - Balance de Masas */}
//                 <div className="detalle-footer">
//                     <div className="balance-grid">
//                         <div className="balance-label">Kgs.Entrantes</div>
//                         <div className="balance-label">Programados</div>
//                         <div className="balance-label">Sobre Orden</div>
//                         <div className="balance-label">Calidad</div>
//                         <div className="balance-label">Sobrante</div>
//                         <div className="balance-label">Scrap</div>
//                         <div className="balance-label">Saldo</div>
//                         <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div>
//                         <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
//                         <div className="balance-value">{formatNumber(balance.sobreOrden)}</div>
//                         <div className="balance-value">{formatNumber(balance.calidad)}</div>
//                         <div className="balance-value">{formatNumber(balance.sobrante)}</div>
//                         <div className="balance-value">{formatNumber(balance.scrap)}</div>
//                         <div className="balance-value">{formatNumber(balance.saldo)}</div>
//                     </div>
//                 </div>
//             </div>
            
//             <div className="actions-sidebar">
//                 <button className="btn btn-info btn-block">Inspección</button>
//                 <button className="btn btn-warning btn-block">Suspender</button>
//                 <hr style={{ borderColor: 'white', width: '100%' }} />
//                 <button className="btn btn-light btn-block">Notas SRP</button>
//                 <button className="btn btn-light btn-block">Tolerancias</button>
//                 <button className="btn btn-light btn-block">Ficha Técnica</button>
//                 <button className="btn btn-light btn-block">Notas Calipso</button>
//                 <div className="cierre-container">
//                     <button className="btn btn-success btn-block">CIERRE</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DetalleOperacion;






// // /src/pages/DetalleOperacion.jsx -- VERSIÓN VISUAL FINAL CORREGIDA

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './DetalleOperacion.css';

// const InfoItem = ({ label, value, bold = false }) => (
//     <div className="info-item">
//         <span className="info-label">{label}:</span>
//         <span className={`info-value ${bold ? 'bold' : ''}`}>{value !== null && value !== undefined ? value : 'N/A'}</span>
//     </div>
// );

// const formatNumber = (num, decimals = 0) => {
//     const number = parseFloat(num);
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', { // Usar localización argentina para el formato de miles
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const DetalleOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
    
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (!operacionId) return;
//             setLoading(true);
//             try {
//                 const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//                 setData(response.data);
//             } catch (err) {
//                 console.error("Error fetching operation details:", err);
//                 Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
//                 navigate('/registracion');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [operacionId, navigate]);

//     if (loading) {
//         return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
//     }
    
//     if (!data) return <div className="p-4">No se encontraron datos para esta operación.</div>;

//     const { header, lineas, balance } = data;

//     return (
//         <div className="detalle-container">
//             <div className="main-content">
//                 <div className="detalle-header">
//                     <div className="header-top-row">
//                         <div className="header-left-col">
//                             <InfoItem label="Clientes" value={header.Clientes} />
//                             <div className="row mt-2">
//                                 <div className="col-sm-6">
//                                     <InfoItem label="Serie/Lote" value={header.SerieLote} bold />
//                                     <InfoItem label="Matching" value={header.Matching} />
//                                     <InfoItem label="Batch" value={header.Batch} />
//                                 </div>
//                                 <div className="col-sm-6">
//                                     {/* Campos Faltantes Añadidos */}
//                                     <InfoItem label="Cant.Atados" value={header.CantAtados} />
//                                     <InfoItem label="Cant.Rollos" value={header.CantRollos} />
//                                     <InfoItem label="Stock" value={formatNumber(header.Stock)} />
//                                     <InfoItem label="Kgs Programados" value={formatNumber(header.KgsProgramados, 2)} />
//                                 </div>
//                             </div>
//                             <InfoItem label="Scrap Programado" value={formatNumber(header.ScrapProgramado, 2)} />
//                         </div>
//                         <div className="header-right-col">
//                             <div className="entrante-block">
//                                 <div className="entrante-header">ENTRANTE</div>
//                                 <div className="entrante-body">
//                                     <InfoItem label="Familia" value={header.Familia} />
//                                     <InfoItem label="Aleación" value={header.Aleacion} />
//                                     <InfoItem label="Temple" value={header.Temple} />
//                                     <InfoItem label="Espesor" value={header.Espesor} />
//                                     <InfoItem label="País Origen" value={header.PaisOrigen} />
//                                     <InfoItem label="Recubrimiento" value={header.Recubrimiento} />
//                                     <InfoItem label="Calidad" value={header.Calidad} />
//                                     <InfoItem label="Ancho" value={header.Ancho} />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="cuchillas-block">
//                         <InfoItem label="Cuchillas" value={header.Cuchillas} bold />
//                         <InfoItem label="Pasadas" value={header.Pasadas} />
//                         <InfoItem label="Diámetro" value={header.Diametro} />
//                         <InfoItem label="Corona" value={header.Corona} />
//                     </div>
//                 </div>

//                 <div className="detalle-body">
//                     <div className="grid-header">
//                         <div></div>
//                         <div>Programados</div>
//                         <div>Sobre Orden</div>
//                         <div>Calidad (Suspendido)</div>
//                         <div>Atados</div>
//                         <div>Rollos</div>
//                     </div>
//                     <div className="grid-body">
//                         {lineas.map((linea, index) => (
//                             <div key={index} className="grid-row">
//                                 <div className="grid-cell-desc">
//                                     <div>{linea.Ancho}</div>
//                                     <div>{linea.Cuchillas}</div>
//                                     <div>{linea.Tarea}</div>
//                                     <div>{linea.Destino}</div>
//                                     <div>Atados: {linea.Atados} Rollos: {linea.Rollos}</div>
//                                 </div>
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Programados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.SobreOrden)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Calidad)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotAtados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotRollos)} />
//                             </div>
//                         ))}
//                         <div className="grid-row">
//                             <div className="grid-cell-desc font-weight-bold">Sobrante</div>
//                             <div className="grid-cell-placeholder"></div>
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="detalle-footer">
//                     <div className="balance-grid">
//                         <div className="balance-label">Kgs.Entrantes</div>
//                         <div className="balance-label">Programados</div>
//                         <div className="balance-label">Sobre Orden</div>
//                         <div className="balance-label">Calidad</div>
//                         <div className="balance-label">Sobrante</div>
//                         <div className="balance-label">Scrap</div>
//                         <div className="balance-label">Saldo</div>
//                         <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div>
//                         <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
//                         <div className="balance-value">{formatNumber(balance.sobreOrden)}</div>
//                         <div className="balance-value">{formatNumber(balance.calidad)}</div>
//                         <div className="balance-value">{formatNumber(balance.sobrante)}</div>
//                         <div className="balance-value">{formatNumber(balance.scrap)}</div>
//                         <div className="balance-value">{formatNumber(balance.saldo)}</div>
//                     </div>
//                 </div>
//             </div>
            
//             <div className="actions-sidebar">
//                 <button className="btn btn-info btn-block">Inspección</button>
//                 <button className="btn btn-warning btn-block">Suspender</button>
//                 <hr style={{ borderColor: 'white', width: '100%' }} />
//                 <button className="btn btn-light btn-block">Notas SRP</button>
//                 <button className="btn btn-light btn-block">Tolerancias</button>
//                 <button className="btn btn-light btn-block">Ficha Técnica</button>
//                 <button className="btn btn-light btn-block">Notas Calipso</button>
//                 <div className="cierre-container">
//                     <button className="btn btn-success btn-block">CIERRE</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DetalleOperacion;










// // /src/pages/DetalleOperacion.jsx -- VERSIÓN VISUAL FINAL

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './DetalleOperacion.css';

// const InfoItem = ({ label, value, bold = false }) => (
//     <div className="info-item">
//         <span className="info-label">{label}:</span>
//         <span className={`info-value ${bold ? 'bold' : ''}`}>{value !== null && value !== undefined ? value : 'N/A'}</span>
//     </div>
// );

// const formatNumber = (num, decimals = 0) => {
//     const number = parseFloat(num);
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const DetalleOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (!operacionId) return;
//             setLoading(true);
//             try {
//                 const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//                 setData(response.data);
//             } catch (err) {
//                 Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
//                 navigate('/registracion');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [operacionId, navigate]);

//     if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
//     if (!data) return null;

//     const { header, lineas, balance } = data;

//     return (
//         <div className="detalle-container">
//             <div className="main-content">
//                 <div className="detalle-header">
//                     <div className="header-top-row">
//                         <div className="header-left-col">
//                             <InfoItem label="Clientes" value={header.Clientes} />
//                             <div className="row mt-2">
//                                 <div className="col-sm-6">
//                                     <InfoItem label="Serie/Lote" value={header.SerieLote} bold />
//                                     <InfoItem label="Matching" value={header.Matching} />
//                                     <InfoItem label="Batch" value={header.Batch} />
//                                 </div>
//                                 <div className="col-sm-6">
//                                     <InfoItem label="Cant.Atados" value={header.CantAtados || 0} />
//                                     <InfoItem label="Cant.Rollos" value={header.CantRollos || 0} />
//                                     <InfoItem label="Stock" value={formatNumber(header.Stock)} />
//                                     <InfoItem label="Kgs Programados" value={formatNumber(header.KgsProgramados, 2)} />
//                                 </div>
//                             </div>
//                             <InfoItem label="Scrap Programado" value={formatNumber(header.ScrapProgramado, 2)} />
//                         </div>
//                         <div className="header-right-col">
//                             <div className="entrante-block">
//                                 <div className="entrante-header">ENTRANTE</div>
//                                 <div className="entrante-body">
//                                     <InfoItem label="Familia" value={header.Familia} />
//                                     <InfoItem label="Aleación" value={header.Aleacion} />
//                                     <InfoItem label="Temple" value={header.Temple} />
//                                     <InfoItem label="Espesor" value={header.Espesor} />
//                                     <InfoItem label="País Origen" value={header.PaisOrigen} />
//                                     <InfoItem label="Recubrimiento" value={header.Recubrimiento} />
//                                     <InfoItem label="Calidad" value={header.Calidad} />
//                                     <InfoItem label="Ancho" value={header.Ancho} />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="cuchillas-block">
//                         <InfoItem label="Cuchillas" value={header.Cuchillas} bold />
//                         <InfoItem label="Pasadas" value={header.Pasadas} />
//                         <InfoItem label="Diámetro" value={header.Diametro} />
//                         <InfoItem label="Corona" value={header.Corona} />
//                     </div>
//                 </div>

//                 <div className="detalle-body">
//                     <div className="grid-header">
//                         <div></div>
//                         <div>Programados</div>
//                         <div>Sobre Orden</div>
//                         <div>Calidad (Suspendido)</div>
//                         <div>Atados</div>
//                         <div>Rollos</div>
//                     </div>
//                     <div className="grid-body">
//                         {lineas.map((linea, index) => (
//                             <div key={index} className="grid-row">
//                                 <div className="grid-cell-desc">
//                                     <div>{linea.Ancho}</div>
//                                     <div>{linea.Cuchillas}</div>
//                                     <div>{linea.Tarea}</div>
//                                     <div>{linea.Destino.substring(0, 11)}</div>
//                                     <div>Atados: {linea.Atados} Rollos: {linea.Rollos}</div>
//                                 </div>
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Programados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.SobreOrden)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Calidad)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotAtados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotRollos)} />
//                             </div>
//                         ))}
//                         <div className="grid-row">
//                             <div className="grid-cell-desc font-weight-bold">Sobrante</div>
//                             <div className="grid-cell-placeholder"></div>
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="detalle-footer">
//                     <div className="balance-grid">
//                         <div className="balance-label">Kgs.Entrantes</div>
//                         <div className="balance-label">Programados</div>
//                         <div className="balance-label">Sobre Orden</div>
//                         <div className="balance-label">Calidad</div>
//                         <div className="balance-label">Sobrante</div>
//                         <div className="balance-label">Scrap</div>
//                         <div className="balance-label">Saldo</div>
//                         <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div>
//                         <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
//                         <div className="balance-value">{formatNumber(balance.sobreOrden)}</div>
//                         <div className="balance-value">{formatNumber(balance.calidad)}</div>
//                         <div className="balance-value">{formatNumber(balance.sobrante)}</div>
//                         <div className="balance-value">{formatNumber(balance.scrap)}</div>
//                         <div className="balance-value">{formatNumber(balance.saldo)}</div>
//                     </div>
//                 </div>
//             </div>
            
//             <div className="actions-sidebar">
//                 <button className="btn btn-info btn-block">Inspección</button>
//                 <button className="btn btn-warning btn-block">Suspender</button>
//                 <hr style={{ borderColor: 'white', width: '100%' }} />
//                 <button className="btn btn-light btn-block">Notas SRP</button>
//                 <button className="btn btn-light btn-block">Tolerancias</button>
//                 <button className="btn btn-light btn-block">Ficha Técnica</button>
//                 <button className="btn btn-light btn-block">Notas Calipso</button>
//                 <div className="cierre-container">
//                     <button className="btn btn-success btn-block">CIERRE</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DetalleOperacion;
















// // /src/pages/DetalleOperacion.jsx -- VERSIÓN FINAL CORREGIDA

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './DetalleOperacion.css';

// const InfoItem = ({ label, value, bold = false }) => (
//     <div className="info-item">
//         <span className="info-label">{label}:</span>
//         <span className={`info-value ${bold ? 'bold' : ''}`}>{value !== null && value !== undefined ? value : 'N/A'}</span>
//     </div>
// );

// const formatNumber = (num, decimals = 0) => {
//     const number = parseFloat(num);
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const DetalleOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (!operacionId) return;
//             setLoading(true);
//             try {
//                 const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//                 setData(response.data);
//             } catch (err) {
//                 console.error("Error fetching operation details:", err);
//                 Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
//                 navigate('/registracion');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [operacionId, navigate]);

//     if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
//     if (!data || !data.header) return <div className="p-4 text-white">Cargando datos...</div>; // Protección adicional

//     const { header, lineas, balance } = data;

//     return (
//         <div className="detalle-container">
//             <div className="main-content">
//                 <div className="detalle-header">
//                     <div className="header-top-row">
//                         <div className="header-left-col">
//                             <InfoItem label="Clientes" value={header.Clientes} />
//                             <div className="row mt-2">
//                                 <div className="col-sm-6">
//                                     <InfoItem label="Serie/Lote" value={header.SerieLote} bold />
//                                     <InfoItem label="Matching" value={header.Matching} />
//                                     <InfoItem label="Batch" value={header.Batch} />
//                                 </div>
//                                 <div className="col-sm-6">
//                                     <InfoItem label="Cant.Atados" value={header.CantAtados || 0} />
//                                     <InfoItem label="Cant.Rollos" value={header.CantRollos || 0} />
//                                     <InfoItem label="Stock" value={formatNumber(header.Stock)} />
//                                     <InfoItem label="Kgs Programados" value={formatNumber(header.KgsProgramados, 2)} />
//                                 </div>
//                             </div>
//                             <InfoItem label="Scrap Programado" value={formatNumber(header.ScrapProgramado, 2)} />
//                         </div>
//                         <div className="header-right-col">
//                             <div className="entrante-block">
//                                 <div className="entrante-header">ENTRANTE</div>
//                                 <div className="entrante-body">
//                                     <InfoItem label="Familia" value={header.Familia} />
//                                     <InfoItem label="Aleación" value={header.Aleacion} />
//                                     <InfoItem label="Temple" value={header.Temple} />
//                                     <InfoItem label="Espesor" value={header.Espesor} />
//                                     <InfoItem label="País Origen" value={header.PaisOrigen} />
//                                     <InfoItem label="Recubrimiento" value={header.Recubrimiento} />
//                                     <InfoItem label="Calidad" value={header.Calidad} />
//                                     <InfoItem label="Ancho" value={header.Ancho} />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="cuchillas-block">
//                         <InfoItem label="Cuchillas" value={header.Cuchillas} bold />
//                         <InfoItem label="Pasadas" value={header.Pasadas} />
//                         <InfoItem label="Diámetro" value={header.Diametro} />
//                         <InfoItem label="Corona" value={header.Corona} />
//                     </div>
//                 </div>

//                 <div className="detalle-body">
//                     <div className="grid-header">
//                         <div></div> <div>Programados</div> <div>Sobre Orden</div> <div>Calidad (Suspendido)</div> <div>Atados</div> <div>Rollos</div>
//                     </div>
//                     <div className="grid-body">
//                         {lineas.map((linea, index) => (
//                             <div key={index} className="grid-row">
//                                 <div className="grid-cell-desc">
//                                     {/* CORRECCIÓN: Usar los campos desglosados */}
//                                     <div>{linea.Ancho}</div>
//                                     <div>{linea.Cuchillas}</div>
//                                     <div>{linea.Tarea}</div>
//                                     {/* CORRECCIÓN: Verificar que 'Destino' existe antes de usar substring */}
//                                     <div>{linea.Destino ? linea.Destino.substring(0, 11) : 'N/A'}</div>
//                                     <div>Atados: {linea.Atados} Rollos: {linea.Rollos}</div>
//                                 </div>
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Programados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.SobreOrden)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Calidad)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotAtados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotRollos)} />
//                             </div>
//                         ))}
//                         <div className="grid-row">
//                             <div className="grid-cell-desc font-weight-bold">Sobrante</div>
//                             <div className="grid-cell-placeholder"></div> <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" /> <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="detalle-footer">
//                     <div className="balance-grid">
//                         <div className="balance-label">Kgs.Entrantes</div> <div className="balance-label">Programados</div> <div className="balance-label">Sobre Orden</div>
//                         <div className="balance-label">Calidad</div> <div className="balance-label">Sobrante</div> <div className="balance-label">Scrap</div> <div className="balance-label">Saldo</div>
//                         <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div> <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
//                         <div className="balance-value">{formatNumber(balance.sobreOrden)}</div> <div className="balance-value">{formatNumber(balance.calidad)}</div>
//                         <div className="balance-value">{formatNumber(balance.sobrante)}</div> <div className="balance-value">{formatNumber(balance.scrap)}</div>
//                         <div className="balance-value">{formatNumber(balance.saldo)}</div>
//                     </div>
//                 </div>
//             </div>
            
//             <div className="actions-sidebar">
//                 <button className="btn btn-info btn-block">Inspección</button> <button className="btn btn-warning btn-block">Suspender</button>
//                 <hr style={{ borderColor: 'white', width: '100%' }} />
//                 <button className="btn btn-light btn-block">Notas SRP</button> <button className="btn btn-light btn-block">Tolerancias</button>
//                 <button className="btn btn-light btn-block">Ficha Técnica</button> <button className="btn btn-light btn-block">Notas Calipso</button>
//                 <div className="cierre-container"> <button className="btn btn-success btn-block">CIERRE</button> </div>
//             </div>
//         </div>
//     );
// };

// export default DetalleOperacion;


// // /src/pages/DetalleOperacion.jsx -- VERSIÓN FINAL CON CORRECCIÓN DE NOMBRES DE CAMPOS

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './DetalleOperacion.css';

// // Componente reutilizable para mostrar información
// const InfoItem = ({ label, value, bold = false }) => (
//     <div className="info-item">
//         <span className="info-label">{label}:</span>
//         <span className={`info-value ${bold ? 'bold' : ''}`}>{value !== null && value !== undefined ? value : 'N/A'}</span>
//     </div>
// );

// // Formateador de números para que coincida con el original
// const formatNumber = (num, decimals = 0) => {
//     const number = parseFloat(num);
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const DetalleOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
    
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (!operacionId) return;
//             setLoading(true);
//             try {
//                 const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//                 setData(response.data);
//             } catch (err) {
//                 console.error("Error fetching operation details:", err);
//                 Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
//                 navigate('/registracion');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [operacionId, navigate]);

//     if (loading) {
//         return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
//     }
    
//     if (!data || !data.header) {
//         return <div className="p-4 text-white">No se encontraron datos para esta operación.</div>;
//     }

//     const { header, lineas, balance } = data;

//     return (
//         <div className="detalle-container">
//             <div className="main-content">
//                 <div className="detalle-header">
//                     <div className="header-top-row">
//                         <div className="header-left-col">
//                             <InfoItem label="Clientes" value={header.Clientes} />
//                             <div className="row mt-2">
//                                 <div className="col-sm-6">
//                                     {/* ===== CORRECCIÓN DE NOMBRES DE CAMPOS ===== */}
//                                     <InfoItem label="Serie/Lote" value={header.SerieLote} bold />
//                                     <InfoItem label="Matching" value={header.Matching} />
//                                     <InfoItem label="Batch" value={header.Batch} />
//                                 </div>
//                                 <div className="col-sm-6">
//                                     <InfoItem label="Cant.Atados" value={header.CantAtados || 0} />
//                                     <InfoItem label="Cant.Rollos" value={header.CantRollos || 0} />
//                                     <InfoItem label="Stock" value={formatNumber(header.Stock)} />
//                                     <InfoItem label="Kgs Programados" value={formatNumber(header.KgsProgramados, 2)} />
//                                 </div>
//                             </div>
//                             <InfoItem label="Scrap Programado" value={formatNumber(header.ScrapProgramado, 2)} />
//                         </div>
//                         <div className="header-right-col">
//                             <div className="entrante-block">
//                                 <div className="entrante-header">ENTRANTE</div>
//                                 <div className="entrante-body">
//                                     <InfoItem label="Familia" value={header.Familia} />
//                                     <InfoItem label="Aleación" value={header.Aleacion} />
//                                     <InfoItem label="Temple" value={header.Temple} />
//                                     <InfoItem label="Espesor" value={header.Espesor} />
//                                     <InfoItem label="País Origen" value={header.PaisOrigen} />
//                                     <InfoItem label="Recubrimiento" value={header.Recubrimiento} />
//                                     <InfoItem label="Calidad" value={header.Calidad} />
//                                     <InfoItem label="Ancho" value={header.Ancho} />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="cuchillas-block">
//                         {/* ===== CORRECCIÓN DE NOMBRES DE CAMPOS ===== */}
//                         <InfoItem label="Cuchillas" value={header.Cuchillas} bold />
//                         <InfoItem label="Pasadas" value={header.Pasadas} />
//                         <InfoItem label="Diámetro" value={header.Diametro} />
//                         <InfoItem label="Corona" value={header.Corona} />
//                     </div>
//                 </div>

//                 <div className="detalle-body">
//                     <div className="grid-header">
//                         <div></div> <div>Programados</div> <div>Sobre Orden</div> <div>Calidad (Suspendido)</div> <div>Atados</div> <div>Rollos</div>
//                     </div>
//                     <div className="grid-body">
//                         {lineas.map((linea, index) => (
//                             <div key={index} className="grid-row">
//                                 <div className="grid-cell-desc">
//                                     <div>{linea.Ancho}</div>
//                                     <div>{linea.Cuchillas}</div>
//                                     <div>{linea.Tarea}</div>
//                                     <div>{linea.Destino ? linea.Destino.substring(0, 11) : 'N/A'}</div>
//                                     <div>Atados: {linea.Atados} Rollos: {linea.Rollos}</div>
//                                 </div>
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Programados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.SobreOrden)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Calidad)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotAtados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotRollos)} />
//                             </div>
//                         ))}
//                         <div className="grid-row">
//                             <div className="grid-cell-desc font-weight-bold">Sobrante</div>
//                             <div className="grid-cell-placeholder"></div> <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" /> <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="detalle-footer">
//                     <div className="balance-grid">
//                         <div className="balance-label">Kgs.Entrantes</div> <div className="balance-label">Programados</div> <div className="balance-label">Sobre Orden</div>
//                         <div className="balance-label">Calidad</div> <div className="balance-label">Sobrante</div> <div className="balance-label">Scrap</div> <div className="balance-label">Saldo</div>
//                         <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div> <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
//                         <div className="balance-value">{formatNumber(balance.sobreOrden)}</div> <div className="balance-value">{formatNumber(balance.calidad)}</div>
//                         <div className="balance-value">{formatNumber(balance.sobrante)}</div> <div className="balance-value">{formatNumber(balance.scrap)}</div>
//                         <div className="balance-value">{formatNumber(balance.saldo)}</div>
//                     </div>
//                 </div>
//             </div>
            
//             <div className="actions-sidebar">
//                 <button className="btn btn-info btn-block">Inspección</button> <button className="btn btn-warning btn-block">Suspender</button>
//                 <hr style={{ borderColor: 'white', width: '100%' }} />
//                 <button className="btn btn-light btn-block">Notas SRP</button> <button className="btn btn-light btn-block">Tolerancias</button>
//                 <button className="btn btn-light btn-block">Ficha Técnica</button> <button className="btn btn-light btn-block">Notas Calipso</button>
//                 <div className="cierre-container"> <button className="btn btn-success btn-block">CIERRE</button> </div>
//             </div>
//         </div>
//     );
// };

// export default DetalleOperacion;




// // /src/pages/DetalleOperacion.jsx -- VERSIÓN FINAL CON CORRECCIÓN DE NOMBRES DE CAMPOS

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './DetalleOperacion.css';

// // Componente reutilizable para mostrar información
// const InfoItem = ({ label, value, bold = false }) => (
//     <div className="info-item">
//         <span className="info-label">{label}:</span>
//         <span className={`info-value ${bold ? 'bold' : ''}`}>{value !== null && value !== undefined ? value : 'N/A'}</span>
//     </div>
// );

// // Formateador de números para que coincida con el original
// const formatNumber = (num, decimals = 0) => {
//     const number = parseFloat(num);
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const DetalleOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
    
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (!operacionId) return;
//             setLoading(true);
//             try {
//                 const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//                 setData(response.data);
//             } catch (err) {
//                 console.error("Error fetching operation details:", err);
//                 Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
//                 navigate('/registracion');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [operacionId, navigate]);

//     if (loading) {
//         return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
//     }
    
//     if (!data || !data.header) {
//         return <div className="p-4 text-white">No se encontraron datos para esta operación.</div>;
//     }

//     const { header, lineas, balance } = data;

//     return (
//         <div className="detalle-container">
//             <div className="main-content">
//                 <div className="detalle-header">
//                     <div className="header-top-row">
//                         <div className="header-left-col">
//                             <InfoItem label="Clientes" value={header.Clientes} />
//                             <div className="row mt-2">
//                                 <div className="col-sm-6">
//                                     {/* ===== CORRECCIÓN DE NOMBRES DE CAMPOS ===== */}
//                                     <InfoItem label="Serie/Lote" value={header.SerieLote} bold />
//                                     <InfoItem label="Matching" value={header.Matching} />
//                                     <InfoItem label="Batch" value={header.Batch} />
//                                 </div>
//                                 <div className="col-sm-6">
//                                     <InfoItem label="Cant.Atados" value={header.CantAtados || 0} />
//                                     <InfoItem label="Cant.Rollos" value={header.CantRollos || 0} />
//                                     <InfoItem label="Stock" value={formatNumber(header.Stock)} />
//                                     <InfoItem label="Kgs Programados" value={formatNumber(header.KgsProgramados, 2)} />
//                                 </div>
//                             </div>
//                             <InfoItem label="Scrap Programado" value={formatNumber(header.ScrapProgramado, 2)} />
//                         </div>
//                         <div className="header-right-col">
//                             <div className="entrante-block">
//                                 <div className="entrante-header">ENTRANTE</div>
//                                 <div className="entrante-body">
//                                     <InfoItem label="Familia" value={header.Familia} />
//                                     <InfoItem label="Aleación" value={header.Aleacion} />
//                                     <InfoItem label="Temple" value={header.Temple} />
//                                     <InfoItem label="Espesor" value={header.Espesor} />
//                                     <InfoItem label="País Origen" value={header.PaisOrigen} />
//                                     <InfoItem label="Recubrimiento" value={header.Recubrimiento} />
//                                     <InfoItem label="Calidad" value={header.Calidad} />
//                                     <InfoItem label="Ancho" value={header.Ancho} />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="cuchillas-block">
//                         {/* ===== CORRECCIÓN DE NOMBRES DE CAMPOS ===== */}
//                         <InfoItem label="Cuchillas" value={header.Cuchillas} bold />
//                         <InfoItem label="Pasadas" value={header.Pasadas} />
//                         <InfoItem label="Diámetro" value={header.Diametro} />
//                         <InfoItem label="Corona" value={header.Corona} />
//                     </div>
//                 </div>

//                 <div className="detalle-body">
//                     <div className="grid-header">
//                         <div></div> <div>Programados</div> <div>Sobre Orden</div> <div>Calidad (Suspendido)</div> <div>Atados</div> <div>Rollos</div>
//                     </div>
//                     <div className="grid-body">
//                         {lineas.map((linea, index) => (
//                             <div key={index} className="grid-row">
//                                 <div className="grid-cell-desc">
//                                     <div>{linea.Ancho}</div>
//                                     <div>{linea.Cuchillas}</div>
//                                     <div>{linea.Tarea}</div>
//                                     <div>{linea.Destino ? linea.Destino.substring(0, 11) : 'N/A'}</div>
//                                     <div>Atados: {linea.Atados} Rollos: {linea.Rollos}</div>
//                                 </div>
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Programados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.SobreOrden)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Calidad)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotAtados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotRollos)} />
//                             </div>
//                         ))}
//                         <div className="grid-row">
//                             <div className="grid-cell-desc font-weight-bold">Sobrante</div>
//                             <div className="grid-cell-placeholder"></div> <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" /> <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="detalle-footer">
//                     <div className="balance-grid">
//                         <div className="balance-label">Kgs.Entrantes</div> <div className="balance-label">Programados</div> <div className="balance-label">Sobre Orden</div>
//                         <div className="balance-label">Calidad</div> <div className="balance-label">Sobrante</div> <div className="balance-label">Scrap</div> <div className="balance-label">Saldo</div>
//                         <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div> <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
//                         <div className="balance-value">{formatNumber(balance.sobreOrden)}</div> <div className="balance-value">{formatNumber(balance.calidad)}</div>
//                         <div className="balance-value">{formatNumber(balance.sobrante)}</div> <div className="balance-value">{formatNumber(balance.scrap)}</div>
//                         <div className="balance-value">{formatNumber(balance.saldo)}</div>
//                     </div>
//                 </div>
//             </div>
            
//             <div className="actions-sidebar">
//                 <button className="btn btn-info btn-block">Inspección</button> <button className="btn btn-warning btn-block">Suspender</button>
//                 <hr style={{ borderColor: 'white', width: '100%' }} />
//                 <button className="btn btn-light btn-block">Notas SRP</button> <button className="btn btn-light btn-block">Tolerancias</button>
//                 <button className="btn btn-light btn-block">Ficha Técnica</button> <button className="btn btn-light btn-block">Notas Calipso</button>
//                 <div className="cierre-container"> <button className="btn btn-success btn-block">CIERRE</button> </div>
//             </div>
//         </div>
//     );
// };

// export default DetalleOperacion;





// // /src/pages/DetalleOperacion.jsx -- VERSIÓN FINAL CON LAYOUT CORREGIDO

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './DetalleOperacion.css';

// const InfoItem = ({ label, value, bold = false }) => (
//     <div className="info-item">
//         <span className="info-label">{label}:</span>
//         <span className={`info-value ${bold ? 'bold' : ''}`}>{value !== null && value !== undefined ? value : 'N/A'}</span>
//     </div>
// );

// const formatNumber = (num, decimals = 0) => {
//     const number = parseFloat(num);
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const DetalleOperacion = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (!operacionId) return;
//             setLoading(true);
//             try {
//                 const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
//                 setData(response.data);
//             } catch (err) {
//                 Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
//                 navigate('/registracion');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [operacionId, navigate]);

//     if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
//     if (!data) return null;

//     const { header, lineas, balance } = data;

//     return (
//         <div className="detalle-container">
//             <div className="main-content">
//                 <div className="detalle-header">
//                     <div className="header-top-row">
//                         <div className="header-left-col">
//                             <InfoItem label="Clientes" value={header.Clientes} />
//                             <div className="row mt-2">
//                                 <div className="col-sm-6">
//                                     <InfoItem label="Serie/Lote" value={header.SerieLote} bold />
//                                     <InfoItem label="Matching" value={header.Matching} />
//                                     <InfoItem label="Batch" value={header.Batch} />
//                                 </div>
//                                 <div className="col-sm-6">
//                                     <InfoItem label="Cant.Atados" value={header.CantAtados || 0} />
//                                     <InfoItem label="Cant.Rollos" value={header.CantRollos || 0} />
//                                     <InfoItem label="Stock" value={formatNumber(header.Stock)} />
//                                     <InfoItem label="Kgs Programados" value={formatNumber(header.KgsProgramados, 2)} />
//                                 </div>
//                             </div>
//                             <InfoItem label="Scrap Programado" value={formatNumber(header.ScrapProgramado, 2)} />
//                         </div>
//                         <div className="header-right-col">
//                             <div className="entrante-block">
//                                 <div className="entrante-header">ENTRANTE</div>
//                                 <div className="entrante-body">
//                                     <InfoItem label="Familia" value={header.Familia} />
//                                     <InfoItem label="Aleación" value={header.Aleacion} />
//                                     <InfoItem label="Temple" value={header.Temple} />
//                                     <InfoItem label="Espesor" value={header.Espesor} />
//                                     <InfoItem label="País Origen" value={header.PaisOrigen} />
//                                     <InfoItem label="Recubrimiento" value={header.Recubrimiento} />
//                                     <InfoItem label="Calidad" value={header.Calidad} />
//                                     <InfoItem label="Ancho" value={header.Ancho} />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="cuchillas-block">
//                         <InfoItem label="Cuchillas" value={header.Cuchillas} bold />
//                         <InfoItem label="Pasadas" value={header.Pasadas} />
//                         <InfoItem label="Diámetro" value={header.Diametro} />
//                         <InfoItem label="Corona" value={header.Corona} />
//                     </div>
//                 </div>

//                 {/* ===== INICIO DE LA CORRECCIÓN DE LAYOUT ===== */}
//                 <div className="detalle-body-container">
//                     <div className="grid-header">
//                         <div></div> <div>Programados</div> <div>Sobre Orden</div> <div>Calidad (Suspendido)</div> <div>Atados</div> <div>Rollos</div>
//                     </div>
//                     <div className="grid-body">
//                         {lineas.map((linea, index) => (
//                             <div key={index} className="grid-row">
//                                 <div className="grid-cell-desc">
//                                     <div>{linea.Ancho}</div>
//                                     <div>{linea.Cuchillas}</div>
//                                     <div>{linea.Tarea}</div>
//                                     <div>{linea.Destino ? linea.Destino.substring(0, 11) : 'N/A'}</div>
//                                     <div>Atados: {linea.Atados} Rollos: {linea.Rollos}</div>
//                                 </div>
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Programados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.SobreOrden)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Calidad)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotAtados)} />
//                                 <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotRollos)} />
//                             </div>
//                         ))}
//                         <div className="grid-row">
//                             <div className="grid-cell-desc font-weight-bold">Sobrante</div>
//                             <div className="grid-cell-placeholder"></div>
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                             <input type="text" className="form-control grid-cell-input" readOnly value="0" />
//                         </div>
//                     </div>
                    
//                     <div className="detalle-footer">
//                         <div className="balance-grid">
//                             <div className="balance-label">Kgs.Entrantes</div> <div className="balance-label">Programados</div> <div className="balance-label">Sobre Orden</div>
//                             <div className="balance-label">Calidad</div> <div className="balance-label">Sobrante</div> <div className="balance-label">Scrap</div> <div className="balance-label">Saldo</div>
//                             <div className="balance-value">{formatNumber(balance.kgsEntrantes)}</div> <div className="balance-value">{formatNumber(balance.programados, 2)}</div>
//                             <div className="balance-value">{formatNumber(balance.sobreOrden)}</div> <div className="balance-value">{formatNumber(balance.calidad)}</div>
//                             <div className="balance-value">{formatNumber(balance.sobrante)}</div> <div className="balance-value">{formatNumber(balance.scrap)}</div>
//                             <div className="balance-value">{formatNumber(balance.saldo)}</div>
//                         </div>
//                     </div>
//                 </div>
//                 {/* ===== FIN DE LA CORRECCIÓN DE LAYOUT ===== */}
//             </div>
            
//             <div className="actions-sidebar">
//                 <button className="btn btn-info btn-block">Inspección</button> <button className="btn btn-warning btn-block">Suspender</button>
//                 <hr style={{ borderColor: 'white', width: '100%' }} />
//                 <button className="btn btn-light btn-block">Notas SRP</button> <button className="btn btn-light btn-block">Tolerancias</button>
//                 <button className="btn btn-light btn-block">Ficha Técnica</button> <button className="btn btn-light btn-block">Notas Calipso</button>
//                 <div className="cierre-container"> <button className="btn btn-success btn-block">CIERRE</button> </div>
//             </div>
//         </div>
//     );
// };

// export default DetalleOperacion;










// /src/pages/DetalleOperacion.jsx -- VERSIÓN FINAL CON BOTÓN VOLVER

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './DetalleOperacion.css';

const InfoItem = ({ label, value, bold = false }) => (
    <div className="info-item">
        <span className="info-label">{label}:</span>
        <span className={`info-value ${bold ? 'bold' : ''}`}>{value !== null && value !== undefined ? value : 'N/A'}</span>
    </div>
);

const formatNumber = (num, decimals = 0) => {
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    return number.toLocaleString('es-AR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

const DetalleOperacion = () => {
    const { operacionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!operacionId) return;
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/registracion/detalle/${operacionId}`);
                setData(response.data);
            } catch (err) {
                Swal.fire('Error', 'No se pudo cargar el detalle de la operación.', 'error');
                navigate('/registracion');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [operacionId, navigate]);

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
    if (!data) return null;

    const { header, lineas, balance } = data;

    return (
        <div className="detalle-container">
            <div className="main-content">

                {/* ===== INICIO DEL CAMBIO ===== */}
                <div className="d-flex justify-content-between align-items-center">
                    <h1 className="m-0" style={{color: 'white'}}>Detalle Registración</h1>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        <i className="fas fa-arrow-left mr-2"></i>Volver a la Grilla
                    </button>
                </div>
                {/* ===== FIN DEL CAMBIO ===== */}

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
                        {lineas.map((linea, index) => (
                            <div key={index} className="grid-row">
                                <div className="grid-cell-desc">
                                    <div>{linea.Ancho}</div>
                                    <div>{linea.Cuchillas}</div>
                                    <div>{linea.Tarea}</div>
                                    <div>{linea.Destino ? linea.Destino.substring(0, 11) : 'N/A'}</div>
                                    <div>Atados: {linea.Atados} Rollos: {linea.Rollos}</div>
                                </div>
                                <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Programados)} />
                                <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.SobreOrden)} />
                                <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.Calidad)} />
                                <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotAtados)} />
                                <input type="text" className="form-control grid-cell-input" readOnly value={formatNumber(linea.TotRollos)} />
                            </div>
                        ))}
                        <div className="grid-row">
                            <div className="grid-cell-desc font-weight-bold">Sobrante</div>
                            <div className="grid-cell-placeholder"></div>
                            <input type="text" className="form-control grid-cell-input" readOnly value="0" />
                            <input type="text" className="form-control grid-cell-input" readOnly value="0" />
                            <input type="text" className="form-control grid-cell-input" readOnly value="0" />
                            <input type="text" className="form-control grid-cell-input" readOnly value="0" />
                        </div>
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
                <button className="btn btn-info btn-block">Inspección</button> <button className="btn btn-warning btn-block">Suspender</button>
                <hr style={{ borderColor: 'white', width: '100%' }} />
                <button className="btn btn-light btn-block">Notas SRP</button> <button className="btn btn-light btn-block">Tolerancias</button>
                <button className="btn btn-light btn-block">Ficha Técnica</button> <button className="btn btn-light btn-block">Notas Calipso</button>
                <div className="cierre-container"> <button className="btn btn-success btn-block">CIERRE</button> </div>
            </div>
        </div>
    );
};

export default DetalleOperacion;
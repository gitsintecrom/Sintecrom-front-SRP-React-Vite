// // src/pages/EditarOperacionEmbalaje.jsx

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeEmbalajeModal from '../components/PesajeEmbalajeModal'; // ✅ NUEVO COMPONENTE
// import NotasCalipsoModal from '../components/NotasCalipsoModal';

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
    
//     // Estados para modales
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showFichaTecnicaModal, setShowFichaTecnicaModal] = useState(false); // ✅ NUEVO

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

//     const handleExit = async () => {
//         navigate(-1);
//         setTimeout(() => {
//             window.location.reload();
//         }, 100); // Pequeño retraso para asegurar que la navegación ocurra primero
//     };

//     // ✅ NUEVO HANDLER PARA FICHA TÉCNICA
//     const handleFichaTecnicaClick = () => {
//         // Pasar los datos necesarios al modal/ruta de ficha técnica
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data.header.SerieLote,
//                     Matching: data.header.Matching,
//                     CodigoProducto: data.header.CodProdPedido
//                 }
//             }
//         });
//     };

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     return (
//         <div className="slitter-container">
//             <header className="slitter-header">
//                 <div className="header-left"><h1>REGISTRACION Embalaje - Editar Operación</h1></div>
//                 <div className="header-right"><button className="back-link" onClick={handleExit}>← Volver a la Grilla</button></div>
//             </header>

//             <div className="slitter-layout">
//                 <main className="slitter-main-content">
//                     <div className="slitter-top-info">
//                         <div className="client-info-box">
//                             <div className="info-grid-main">
//                                 <div className="info-left-group">
//                                     <p><strong>Clientes:</strong> <span>{header.Clientes || 'N/A'}</span></p>
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

//                     {/* ✅ CORREGIDO: Ahora muestra CodProdPedido (del pedido) */}
//                     <div className="slitter-middle-bar"><strong>Cod.Prod.Final:</strong> {header.CodProdPedido || 'N/A'}</div>

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

//                     {/* BARRA DE BALANCE CON LAS 9 COLUMNAS ORIGINALES */}
//                     <footer className="slitter-balance-footer">
//                         <div className="bal-col"><span>Kgs. Entrantes</span><strong>{formatNumber(balance.kgsEntrantes)}</strong></div>
//                         <div className="bal-col"><span>Programados</span><strong>{formatNumber(balance.programados)}</strong></div>
//                         <div className="bal-col"><span>Sobre Orden</span><strong>{formatNumber(balance.sobreOrden)}</strong></div>
//                         <div className="bal-col"><span>Calidad</span><strong>{formatNumber(balance.calidad)}</strong></div>
//                         <div className="bal-col"><span>Sobrante</span><strong>{formatNumber(balance.sobrante)}</strong></div>
//                         <div className="bal-col"><span>Scrap</span><strong>{formatNumber(balance.scrap)}</strong></div>
//                         <div className="bal-col"><span>Scrap Seriado</span><strong>{formatNumber(balance.scrapSeriado || 0)}</strong></div>
//                         <div className="bal-col"><span>Saldo</span><strong className="blue-saldo-text">{formatNumber(balance.saldo)}</strong></div>
//                         <div className="bal-col"><span>Bruto</span><strong>{formatNumber(balance.bruto)}</strong></div>
//                     </footer>
//                 </main>

//                 <aside className="slitter-sidebar">
//                     <div className="side-btns-group">
//                         <button className="side-btn">Notas SRP</button>
//                         <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
//                         <button className="side-btn" onClick={handleFichaTecnicaClick}>Ficha Técnica</button>
//                          <button className="side-btn">Ficha Embalaje</button> 
//                         <button 
//                             className="side-btn" 
//                             disabled={!header.tieneNotasCalipso}
//                             onClick={handleNotasCalipsoClick}
//                         >
//                             Notas Calipso
//                         </button>
//                     </div>

//                     {header.tieneNotasCalipso && (
//                         <div className="side-red-alert-box">Existen Notas en<br/>CALIPSO</div>
//                     )}
//                     <button className="side-btn btn-green-cierre">CIERRE</button>
//                 </aside>
//             </div>

//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
            
//             {/* ✅ NUEVO MODAL DE PESAJE PARA EMBALAJE */}
//             {showPesajeModal && selectedLinea && (
//                 <PesajeEmbalajeModal 
//                     lineaData={selectedLinea} 
//                     operacionId={operacionId} 
//                     onClose={() => setShowPesajeModal(false)} 
//                     onSuccess={() => fetchData()} 
//                 />
//             )}
            
//             {showNotasCalipsoModal && (
//                 <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />
//             )}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;






































// // src/pages/EditarOperacionEmbalaje.jsx

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeEmbalajeModal from '../components/PesajeEmbalajeModal';
// import NotasCalipsoModal from '../components/NotasCalipsoModal';

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
    
//     // Estados para modales
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showFichaTecnicaModal, setShowFichaTecnicaModal] = useState(false);

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

//     const handleExit = async () => {
//         navigate(-1);
//         setTimeout(() => {
//             window.location.reload();
//         }, 100);
//     };

//     const handleFichaTecnicaClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data.header.SerieLote,
//                     Matching: data.header.Matching,
//                     CodigoProducto: data.header.CodProdPedido
//                 }
//             }
//         });
//     };

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     return (
//         <div className="slitter-container">
//             <header className="slitter-header">
//                 <div className="header-left"><h1>REGISTRACION Embalaje - Editar Operación</h1></div>
//                 <div className="header-right"><button className="back-link" onClick={handleExit}>← Volver a la Grilla</button></div>
//             </header>

//             <div className="slitter-layout">
//                 <main className="slitter-main-content">
//                     <div className="slitter-top-info">
//                         <div className="client-info-box">
//                             <div className="info-grid-main">
//                                 <div className="info-left-group">
//                                     <p><strong>Clientes:</strong> <span>{header.Clientes || 'N/A'}</span></p>
//                                     <p><strong>Serie/Lote:</strong> <span>{header.SerieLote || 'N/A'}</span></p>
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

//                     <div className="slitter-middle-bar"><strong>Cod.Prod.Final:</strong> {header.CodProdPedido || 'N/A'}</div>

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

//                         {/* ✅ Renderizar solo las líneas de pedido (sin scrap) */}
//                         {lineas.map((linea, idx) => (
//                             <div key={idx} className="production-row-block">
//                                 <div className="row-left-panel">
//                                     <div className="pedido-card-crema" onClick={() => { setSelectedLinea(linea); setShowPesajeModal(true); }}>
//                                         <strong>Pedido: {linea.NumeroPedido}</strong><br/>
//                                         Item: {linea.NumeroItem}<br/>
//                                         Doc: {linea.NoDoc}<br/>
//                                         Atados: {linea.AtadosTeoricos} Rollos: {linea.RollosTeoricos}
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

//                         {/* ✅ Botones de Scrap SOLO al final (después de todas las líneas) */}
//                         <div className="production-row-block">
//                             <div className="row-left-panel">
//                                 <div className="scrap-btn-row">
//                                     <div className="btn-scrap-crema">Scrap Seriado</div>
//                                     <div className="btn-scrap-crema">Scrap No Seriado</div>
//                                 </div>
//                             </div>
//                             <div className="row-right-values">
//                                 <div className="values-line">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema">{formatNumber(balance.scrap || 0)}</div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema">0</div>
//                                     <div className="val-box-crema">0</div>
//                                     <div className="val-box-crema">0</div>
//                                 </div>
//                             </div>
//                         </div>
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
//                         <div className="bal-col"><span>Bruto</span><strong>{formatNumber(balance.bruto)}</strong></div>
//                     </footer>
//                 </main>

//                 <aside className="slitter-sidebar">
//                     <div className="side-btns-group">
//                         <button className="side-btn">Notas SRP</button>
//                         <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
//                         <button className="side-btn" onClick={handleFichaTecnicaClick}>Ficha Técnica</button>
//                         <button className="side-btn">Ficha Embalaje</button> 
//                         <button 
//                             className="side-btn" 
//                             disabled={!header.tieneNotasCalipso}
//                             onClick={handleNotasCalipsoClick}
//                         >
//                             Notas Calipso
//                         </button>
//                     </div>

//                     {header.tieneNotasCalipso && (
//                         <div className="side-red-alert-box">Existen Notas en<br/>CALIPSO</div>
//                     )}
//                     <button className="side-btn btn-green-cierre">CIERRE</button>
//                 </aside>
//             </div>

//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
            
//             {showPesajeModal && selectedLinea && (
//                 <PesajeEmbalajeModal 
//                     lineaData={selectedLinea} 
//                     operacionId={operacionId} 
//                     onClose={() => setShowPesajeModal(false)} 
//                     onSuccess={() => fetchData()} 
//                 />
//             )}
            
//             {showNotasCalipsoModal && (
//                 <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />
//             )}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;



















































// // src/pages/EditarOperacionEmbalaje.jsx

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeEmbalajeModal from '../components/PesajeEmbalajeModal';
// import NotasCalipsoModal from '../components/NotasCalipsoModal';

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// // ✅ Formateador para mostrar números con decimales (para kgs)
// const formatKg = (num) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     });
// };

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
    
//     // Estados para modales
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showFichaTecnicaModal, setShowFichaTecnicaModal] = useState(false);
//     const [showNotasSRP, setShowNotasSRP] = useState(false);
//     const [notasSRP, setNotasSRP] = useState({ calidad: '', otras: '', traccion: '' });

//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle-embalaje/${operacionId}`);
//             console.log('📋 Datos recibidos:', response.data);
//             setData(response.data);
//         } catch (err) {
//             console.error("Error al cargar datos:", err);
//             navigate('/registracion');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchData(); }, [operacionId]);

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

//     const handleNotasSRPClick = async () => {
//         try {
//             const response = await axiosInstance.get(`/registracion/notas-srp/${operacionId}`);
//             setNotasSRP(response.data);
//             setShowNotasSRP(true);
//         } catch (error) {
//             Swal.fire('Error', 'No se pudieron cargar las notas SRP.', 'error');
//         }
//     };

//     const handleExit = async () => {
//         navigate(-1);
//         setTimeout(() => {
//             window.location.reload();
//         }, 100);
//     };

//     const handleFichaTecnicaClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data.header.SerieLote,
//                     Matching: data.header.Matching,
//                     CodigoProducto: data.header.CodProdPedido
//                 }
//             }
//         });
//     };

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     // ✅ Calcular totales para el balance
//     const totalProgramados = lineas.reduce((sum, l) => sum + (l.Programados || 0), 0);
//     const totalAtados = lineas.reduce((sum, l) => sum + (l.TotAtados || 0), 0);
//     const totalRollos = lineas.reduce((sum, l) => sum + (l.TotRollos || 0), 0);

//     return (
//         <div className="slitter-container">
//             <header className="slitter-header">
//                 <div className="header-left"><h1>REGISTRACION Embalaje - Editar Operación</h1></div>
//                 <div className="header-right"><button className="back-link" onClick={handleExit}>← Volver a la Grilla</button></div>
//             </header>

//             <div className="slitter-layout">
//                 <main className="slitter-main-content">
//                     <div className="slitter-top-info">
//                         <div className="client-info-box">
//                             <div className="info-grid-main">
//                                 <div className="info-left-group">
//                                     <p><strong>Clientes:</strong> <span>{header.Clientes || 'N/A'}</span></p>
//                                     <p><strong>Serie/Lote:</strong> <span>{header.SerieLote || 'N/A'}</span></p>
//                                     <p><strong>Matching:</strong> <span>{header.Matching}</span></p>
//                                     <p><strong>Batch:</strong> <span>{header.Batch}</span></p>
//                                 </div>
//                                 <div className="info-right-group">
//                                     <p><strong>Cant.Atados:</strong> <span className="blue-counter">{header.CantAtados || 0}</span></p>
//                                     <p><strong>Cant.Rollos:</strong> <span className="blue-counter">{header.CantRollos || 0}</span></p>
//                                     <p><strong>Stock:</strong> <span>{formatNumber(header.Stock)}</span></p>
//                                     <p><strong>Kgs Programados:</strong> <span>{formatKg(header.KgsProgramados)} (teóricos)</span></p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="slitter-entrante-box">
//                             <div className="box-header">ENTRANTE</div>
//                             <div className="box-body">
//                                 <div className="box-row"><span>Familia:</span> {header.Familia || 'N/A'}</div>
//                                 <div className="box-row"><span>Aleación:</span> {header.Aleacion || 'N/A'}</div>
//                                 <div className="box-row"><span>Temple:</span> {header.Temple || 'N/A'}</div>
//                                 <div className="box-row"><span>Espesor:</span> {header.Espesor || 'N/A'}</div>
//                                 <div className="box-row"><span>País Origen:</span> {header.PaisOrigen || 'N/A'}</div>
//                                 <div className="box-row"><span>Recubrimiento:</span> {header.Recubrimiento || 'N/A'}</div>
//                                 <div className="box-row"><span>Calidad:</span> {header.Calidad || 'N/A'}</div>
//                                 <div className="box-row"><span>Ancho:</span> {header.Ancho || 'N/A'}</div>
//                                 {/* <div className="blue-cod-text-box">{header.CodProdFinal || header.CodProdPedido || 'N/A'}</div> */}
//                                 <div className="blue-cod-text-box">{header.CodProdIntermedio || 'N/A'}</div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="slitter-middle-bar">
//                         <strong>Cod.Prod.Final:</strong> {header.CodProdPedido || header.CodProdFinal || 'N/A'}
//                     </div>

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

//                         {/* ✅ Renderizar líneas de pedido */}
//                         {lineas.filter(l => l.NumeroPedido).map((linea, idx) => (
//                             <div key={idx} className="production-row-block">
//                                 <div className="row-left-panel">
//                                     <div 
//                                         className="pedido-card-crema" 
//                                         onClick={() => { 
//                                             if (linea.tieneRegistros !== false) {
//                                                 setSelectedLinea(linea); 
//                                                 setShowPesajeModal(true);
//                                             }
//                                         }}
//                                         style={{ cursor: linea.tieneRegistros !== false ? 'pointer' : 'default' }}
//                                     >
//                                         <strong>Pedido: {linea.NumeroPedido}</strong><br/>
//                                         Item: {linea.NumeroItem}<br/>
//                                         Doc: {linea.NoDoc}<br/>
//                                         Atados: {linea.AtadosTeoricos} Rollos: {linea.RollosTeoricos}
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
//                                     {/* ✅ Fila de Scrap para cada línea */}
//                                     <div className="values-line sub-row">
//                                         <div className="val-box-crema transparent"></div>
//                                         <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                             {formatNumber(linea.ScrapKgs)}
//                                         </div>
//                                         <div className="val-box-crema transparent"></div>
//                                         <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                             {formatNumber(linea.ScrapAtados)}
//                                         </div>
//                                         <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                             {formatNumber(linea.ScrapRollos)}
//                                         </div>
//                                         <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                             {formatNumber(linea.ScrapBruto)}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}

//                         {/* ✅ Botones de Scrap (siempre al final) */}
//                         <div className="production-row-block">
//                             <div className="row-left-panel">
//                                 <div className="scrap-btn-row">
//                                     <div className="btn-scrap-crema">Scrap Seriado</div>
//                                     <div className="btn-scrap-crema">Scrap No Seriado</div>
//                                 </div>
//                             </div>
//                             <div className="row-right-values">
//                                 <div className="values-line">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.scrapSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>0</div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>0</div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>0</div>
//                                 </div>
//                                 <div className="values-line sub-row">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.scrapNoSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>0</div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>0</div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>0</div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <footer className="slitter-balance-footer">
//                         <div className="bal-col">
//                             <span>Kgs. Entrantes</span>
//                             <strong>{formatKg(balance.kgsEntrantes)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Programados</span>
//                             <strong>{formatKg(balance.programados)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Sobre Orden</span>
//                             <strong>{formatKg(balance.sobreOrden)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Calidad</span>
//                             <strong>{formatKg(balance.calidad)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Sobrante</span>
//                             <strong>{formatKg(balance.sobrante)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Scrap</span>
//                             <strong>{formatKg(balance.scrap)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Scrap Seriado</span>
//                             <strong>{formatKg(balance.scrapSeriado || 0)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Saldo</span>
//                             <strong className="blue-saldo-text">{formatKg(balance.saldo)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Bruto</span>
//                             <strong>{formatKg(balance.bruto)}</strong>
//                         </div>
//                     </footer>
//                 </main>

//                 <aside className="slitter-sidebar">
//                     <div className="side-btns-group">
//                         <button className="side-btn" onClick={handleNotasSRPClick}>Notas SRP</button>
//                         <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
//                         <button className="side-btn" onClick={handleFichaTecnicaClick}>Ficha Técnica</button>
//                         <button className="side-btn">Ficha Embalaje</button> 
//                         <button 
//                             className="side-btn" 
//                             disabled={!header.tieneNotasCalipso}
//                             onClick={handleNotasCalipsoClick}
//                         >
//                             Notas Calipso
//                         </button>
//                     </div>

//                     {header.tieneNotasCalipso && (
//                         <div className="side-red-alert-box">Existen Notas en<br/>CALIPSO</div>
//                     )}
//                     <button className="side-btn btn-green-cierre">CIERRE</button>
//                 </aside>
//             </div>

//             {/* ✅ Modal de Notas SRP */}
//             {showNotasSRP && (
//                 <div className="modal-overlay" onClick={() => setShowNotasSRP(false)}>
//                     <div className="modal-content notas-srp-modal" onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h2>Notas SRP</h2>
//                             <button className="modal-close" onClick={() => setShowNotasSRP(false)}>×</button>
//                         </div>
//                         <div className="modal-body">
//                             {notasSRP.calidad && (
//                                 <div className="nota-section">
//                                     <h3>Calidad</h3>
//                                     <p>{notasSRP.calidad}</p>
//                                 </div>
//                             )}
//                             {notasSRP.otras && (
//                                 <div className="nota-section">
//                                     <h3>Otras</h3>
//                                     <p>{notasSRP.otras}</p>
//                                 </div>
//                             )}
//                             {notasSRP.traccion && (
//                                 <div className="nota-section">
//                                     <h3>Tracción</h3>
//                                     <p>{notasSRP.traccion}</p>
//                                 </div>
//                             )}
//                             {!notasSRP.calidad && !notasSRP.otras && !notasSRP.traccion && (
//                                 <p>No hay notas SRP para esta operación.</p>
//                             )}
//                         </div>
//                         <div className="modal-footer">
//                             <button className="btn-secondary" onClick={() => setShowNotasSRP(false)}>Cerrar</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
            
//             {showPesajeModal && selectedLinea && (
//                 <PesajeEmbalajeModal 
//                     lineaData={selectedLinea} 
//                     operacionId={operacionId} 
//                     onClose={() => setShowPesajeModal(false)} 
//                     onSuccess={() => fetchData()} 
//                 />
//             )}
            
//             {showNotasCalipsoModal && (
//                 <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />
//             )}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;
















































// // src/pages/EditarOperacionEmbalaje.jsx

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeEmbalajeModal from '../components/PesajeEmbalajeModal';
// import NotasCalipsoModal from '../components/NotasCalipsoModal';

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// // ✅ Formateador para mostrar números con decimales (para kgs)
// const formatKg = (num) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     });
// };

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
    
//     // Estados para modales
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showFichaTecnicaModal, setShowFichaTecnicaModal] = useState(false);
//     const [showNotasSRP, setShowNotasSRP] = useState(false);
//     const [notasSRP, setNotasSRP] = useState({ calidad: '', otras: '', traccion: '' });

//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/detalle-embalaje/${operacionId}`);
//             console.log('📋 Datos recibidos:', response.data);
//             setData(response.data);
//         } catch (err) {
//             console.error("Error al cargar datos:", err);
//             navigate('/registracion');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchData(); }, [operacionId]);

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

//     const handleNotasSRPClick = async () => {
//         try {
//             const response = await axiosInstance.get(`/registracion/notas-srp/${operacionId}`);
//             setNotasSRP(response.data);
//             setShowNotasSRP(true);
//         } catch (error) {
//             Swal.fire('Error', 'No se pudieron cargar las notas SRP.', 'error');
//         }
//     };

//     const handleExit = async () => {
//         navigate(-1);
//         setTimeout(() => {
//             window.location.reload();
//         }, 100);
//     };

//     const handleFichaTecnicaClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data.header.SerieLote,
//                     Matching: data.header.Matching,
//                     CodigoProducto: data.header.CodProdPedido
//                 }
//             }
//         });
//     };

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     return (
//         <div className="slitter-container">
//             <header className="slitter-header">
//                 <div className="header-left"><h1>REGISTRACION Embalaje - Editar Operación</h1></div>
//                 <div className="header-right"><button className="back-link" onClick={handleExit}>← Volver a la Grilla</button></div>
//             </header>

//             <div className="slitter-layout">
//                 <main className="slitter-main-content">
//                     <div className="slitter-top-info">
//                         <div className="client-info-box">
//                             <div className="info-grid-main">
//                                 <div className="info-left-group">
//                                     <p><strong>Clientes:</strong> <span>{header.Clientes || 'N/A'}</span></p>
//                                     <p><strong>Serie/Lote:</strong> <span>{header.SerieLote || 'N/A'}</span></p>
//                                     <p><strong>Matching:</strong> <span>{header.Matching}</span></p>
//                                     <p><strong>Batch:</strong> <span>{header.Batch}</span></p>
//                                 </div>
//                                 <div className="info-right-group">
//                                     <p><strong>Cant.Atados:</strong> <span className="blue-counter">{header.CantAtados || 0}</span></p>
//                                     <p><strong>Cant.Rollos:</strong> <span className="blue-counter">{header.CantRollos || 0}</span></p>
//                                     <p><strong>Stock:</strong> <span>{formatNumber(header.Stock)}</span></p>
//                                     <p><strong>Kgs Programados:</strong> <span>{formatKg(header.KgsProgramados)} (teóricos)</span></p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="slitter-entrante-box">
//                             <div className="box-header">ENTRANTE</div>
//                             <div className="box-body">
//                                 <div className="box-row"><span>Familia:</span> {header.Familia || 'N/A'}</div>
//                                 <div className="box-row"><span>Aleación:</span> {header.Aleacion || 'N/A'}</div>
//                                 <div className="box-row"><span>Temple:</span> {header.Temple || 'N/A'}</div>
//                                 <div className="box-row"><span>Espesor:</span> {header.Espesor || 'N/A'}</div>
//                                 <div className="box-row"><span>País Origen:</span> {header.PaisOrigen || 'N/A'}</div>
//                                 <div className="box-row"><span>Recubrimiento:</span> {header.Recubrimiento || 'N/A'}</div>
//                                 <div className="box-row"><span>Calidad:</span> {header.Calidad || 'N/A'}</div>
//                                 <div className="box-row"><span>Ancho:</span> {header.Ancho || 'N/A'}</div>
//                                 <div className="blue-cod-text-box">{header.CodProdIntermedio || 'N/A'}</div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="slitter-middle-bar">
//                         <strong>Cod.Prod.Final:</strong> {header.CodProdPedido || header.CodProdFinal || 'N/A'}
//                     </div>

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

//                         {/* ✅ Renderizar líneas de pedido (UNA sola fila de valores, como el VB) */}
//                         {lineas.filter(l => l.NumeroPedido).map((linea, idx) => (
//                             <div key={idx} className="production-row-block">
//                                 <div className="row-left-panel">
//                                     <div 
//                                         className="pedido-card-crema" 
//                                         onClick={() => { 
//                                             if (linea.tieneRegistros !== false) {
//                                                 setSelectedLinea(linea); 
//                                                 setShowPesajeModal(true);
//                                             }
//                                         }}
//                                         style={{ cursor: linea.tieneRegistros !== false ? 'pointer' : 'default' }}
//                                     >
//                                         <strong>Pedido: {linea.NumeroPedido}</strong><br/>
//                                         Item: {linea.NumeroItem}<br/>
//                                         Doc: {linea.NoDoc}<br/>
//                                         Atados: {linea.AtadosTeoricos} Rollos: {linea.RollosTeoricos}
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
//                                     {/* ❌ Se eliminó la sub-fila de scrap por línea (no existe en el VB) */}
//                                 </div>
//                             </div>
//                         ))}

//                         {/* ✅ Botones de Scrap (siempre al final, UNA sola fila de valores como el VB) */}
//                         <div className="production-row-block">
//                             <div className="row-left-panel">
//                                 <div className="scrap-btn-row">
//                                     <div className="btn-scrap-crema">Scrap Seriado</div>
//                                     <div className="btn-scrap-crema">Scrap No Seriado</div>
//                                 </div>
//                             </div>
//                             <div className="row-right-values">
//                                 <div className="values-line">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.scrapSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>0</div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>0</div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>0</div>
//                                 </div>
//                                 {/* ❌ Se eliminó la segunda fila del bloque Scrap (no existe en el VB) */}
//                             </div>
//                         </div>
//                     </div>

//                     <footer className="slitter-balance-footer">
//                         <div className="bal-col">
//                             <span>Kgs. Entrantes</span>
//                             <strong>{formatKg(balance.kgsEntrantes)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Programados</span>
//                             <strong>{formatKg(balance.programados)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Sobre Orden</span>
//                             <strong>{formatKg(balance.sobreOrden)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Calidad</span>
//                             <strong>{formatKg(balance.calidad)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Sobrante</span>
//                             <strong>{formatKg(balance.sobrante)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Scrap</span>
//                             <strong>{formatKg(balance.scrap)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Scrap Seriado</span>
//                             <strong>{formatKg(balance.scrapSeriado || 0)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Saldo</span>
//                             <strong className="blue-saldo-text">{formatKg(balance.saldo)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Bruto</span>
//                             <strong>{formatKg(balance.bruto)}</strong>
//                         </div>
//                     </footer>
//                 </main>

//                 <aside className="slitter-sidebar">
//                     <div className="side-btns-group">
//                         <button className="side-btn" onClick={handleNotasSRPClick}>Notas SRP</button>
//                         <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
//                         <button className="side-btn" onClick={handleFichaTecnicaClick}>Ficha Técnica</button>
//                         <button className="side-btn">Ficha Embalaje</button> 
//                         <button 
//                             className="side-btn" 
//                             disabled={!header.tieneNotasCalipso}
//                             onClick={handleNotasCalipsoClick}
//                         >
//                             Notas Calipso
//                         </button>
//                     </div>

//                     {header.tieneNotasCalipso && (
//                         <div className="side-red-alert-box">Existen Notas en<br/>CALIPSO</div>
//                     )}
//                     <button className="side-btn btn-green-cierre">CIERRE</button>
//                 </aside>
//             </div>

//             {/* ✅ Modal de Notas SRP */}
//             {showNotasSRP && (
//                 <div className="modal-overlay" onClick={() => setShowNotasSRP(false)}>
//                     <div className="modal-content notas-srp-modal" onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h2>Notas SRP</h2>
//                             <button className="modal-close" onClick={() => setShowNotasSRP(false)}>×</button>
//                         </div>
//                         <div className="modal-body">
//                             {notasSRP.calidad && (
//                                 <div className="nota-section">
//                                     <h3>Calidad</h3>
//                                     <p>{notasSRP.calidad}</p>
//                                 </div>
//                             )}
//                             {notasSRP.otras && (
//                                 <div className="nota-section">
//                                     <h3>Otras</h3>
//                                     <p>{notasSRP.otras}</p>
//                                 </div>
//                             )}
//                             {notasSRP.traccion && (
//                                 <div className="nota-section">
//                                     <h3>Tracción</h3>
//                                     <p>{notasSRP.traccion}</p>
//                                 </div>
//                             )}
//                             {!notasSRP.calidad && !notasSRP.otras && !notasSRP.traccion && (
//                                 <p>No hay notas SRP para esta operación.</p>
//                             )}
//                         </div>
//                         <div className="modal-footer">
//                             <button className="btn-secondary" onClick={() => setShowNotasSRP(false)}>Cerrar</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
            
//             {showPesajeModal && selectedLinea && (
//                 <PesajeEmbalajeModal 
//                     lineaData={selectedLinea} 
//                     operacionId={operacionId} 
//                     onClose={() => setShowPesajeModal(false)} 
//                     onSuccess={() => fetchData()} 
//                 />
//             )}
            
//             {showNotasCalipsoModal && (
//                 <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />
//             )}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;




























































// src/pages/EditarOperacionEmbalaje.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './EditarOperacionEmbalaje.css';
import ToleranciasModal from '../components/ToleranciasModal';
import PesajeEmbalajeModal from '../components/PesajeEmbalajeModal';
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

// ✅ Formateador para mostrar números con decimales (para kgs)
const formatKg = (num) => {
    if (num === null || num === undefined || num === '') return '0';
    let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
    if (isNaN(number)) return '0';
    return number.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
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
    const [showFichaTecnicaModal, setShowFichaTecnicaModal] = useState(false);
    const [showNotasSRP, setShowNotasSRP] = useState(false);
    const [notasSRP, setNotasSRP] = useState({ calidad: '', otras: '', traccion: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/registracion/detalle-embalaje/${operacionId}`);
            console.log('📋 Datos recibidos:', response.data);
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

    const handleNotasSRPClick = async () => {
        try {
            const response = await axiosInstance.get(`/registracion/notas-srp/${operacionId}`);
            setNotasSRP(response.data);
            setShowNotasSRP(true);
        } catch (error) {
            Swal.fire('Error', 'No se pudieron cargar las notas SRP.', 'error');
        }
    };

    const handleExit = async () => {
        navigate(-1);
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    // ✅ VB: btnFichaTecnica_Click -> Inicial.sFicha = "FTD" (abre el detalle de ficha)
    const handleFichaTecnicaClick = () => {
        navigate(`/registracion/fichatecnica/${operacionId}`, {
            state: {
                headerData: {
                    SerieLote: data.header.SerieLote,
                    Matching: data.header.Matching,
                    CodigoProducto: data.header.CodProdPedido
                },
                tipoFicha: 'FTD'
            }
        });
    };

    // ✅ VB: btFichaEmbalaje_Click -> Inicial.sFicha = "FE"
    //    (la grilla abre igual, pero al clickear un producto abre el PDF "TIPO XX.pdf")
    const handleFichaEmbalajeClick = () => {
        navigate(`/registracion/fichatecnica/${operacionId}`, {
            state: {
                headerData: {
                    SerieLote: data.header.SerieLote,
                    Matching: data.header.Matching,
                    CodigoProducto: data.header.CodProdPedido
                },
                tipoFicha: 'FE'
            }
        });
    };

    if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

    const { header, balance, lineas } = data;

    return (
        <div className="slitter-container">
            <header className="slitter-header">
                <div className="header-left"><h1>REGISTRACION Embalaje - Editar Operación</h1></div>
                <div className="header-right"><button className="back-link" onClick={handleExit}>← Volver a la Grilla</button></div>
            </header>

            <div className="slitter-layout">
                <main className="slitter-main-content">
                    <div className="slitter-top-info">
                        <div className="client-info-box">
                            <div className="info-grid-main">
                                <div className="info-left-group">
                                    <p><strong>Clientes:</strong> <span>{header.Clientes || 'N/A'}</span></p>
                                    <p><strong>Serie/Lote:</strong> <span>{header.SerieLote || 'N/A'}</span></p>
                                    <p><strong>Matching:</strong> <span>{header.Matching}</span></p>
                                    <p><strong>Batch:</strong> <span>{header.Batch}</span></p>
                                </div>
                                <div className="info-right-group">
                                    <p><strong>Cant.Atados:</strong> <span className="blue-counter">{header.CantAtados || 0}</span></p>
                                    <p><strong>Cant.Rollos:</strong> <span className="blue-counter">{header.CantRollos || 0}</span></p>
                                    <p><strong>Stock:</strong> <span>{formatNumber(header.Stock)}</span></p>
                                    <p><strong>Kgs Programados:</strong> <span>{formatKg(header.KgsProgramados)} (teóricos)</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="slitter-entrante-box">
                            <div className="box-header">ENTRANTE</div>
                            <div className="box-body">
                                <div className="box-row"><span>Familia:</span> {header.Familia || 'N/A'}</div>
                                <div className="box-row"><span>Aleación:</span> {header.Aleacion || 'N/A'}</div>
                                <div className="box-row"><span>Temple:</span> {header.Temple || 'N/A'}</div>
                                <div className="box-row"><span>Espesor:</span> {header.Espesor || 'N/A'}</div>
                                <div className="box-row"><span>País Origen:</span> {header.PaisOrigen || 'N/A'}</div>
                                <div className="box-row"><span>Recubrimiento:</span> {header.Recubrimiento || 'N/A'}</div>
                                <div className="box-row"><span>Calidad:</span> {header.Calidad || 'N/A'}</div>
                                <div className="box-row"><span>Ancho:</span> {header.Ancho || 'N/A'}</div>
                                <div className="blue-cod-text-box">{header.CodProdIntermedio || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="slitter-middle-bar">
                        <strong>Cod.Prod.Final:</strong> {header.CodProdPedido || header.CodProdFinal || 'N/A'}
                    </div>

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

                        {/* ✅ Renderizar líneas de pedido (UNA sola fila de valores, como el VB) */}
                        {lineas.filter(l => l.NumeroPedido).map((linea, idx) => (
                            <div key={idx} className="production-row-block">
                                <div className="row-left-panel">
                                    <div 
                                        className="pedido-card-crema" 
                                        // onClick={() => { 
                                        //     if (linea.tieneRegistros !== false) {
                                        //         setSelectedLinea(linea); 
                                        //         setShowPesajeModal(true);
                                        //     }
                                        // }}




                                        onClick={() => { 
                                            if (linea.tieneRegistros !== false) {
                                                setSelectedLinea({ ...linea, CodigoProducto: header.CodProdPedido || header.CodProdFinal || '' });  // ✅ antes: setSelectedLinea(linea)
                                                setShowPesajeModal(true);
                                            }
                                        }}


                                        
                                        style={{ cursor: linea.tieneRegistros !== false ? 'pointer' : 'default' }}
                                    >
                                        <strong>Pedido: {linea.NumeroPedido}</strong><br/>
                                        Item: {linea.NumeroItem}<br/>
                                        Doc: {linea.NoDoc}<br/>
                                        Atados: {linea.AtadosTeoricos} Rollos: {linea.RollosTeoricos}
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
                                </div>
                            </div>
                        ))}

                        {/* ✅ Botones de Scrap (siempre al final, UNA sola fila de valores como el VB) */}
                        <div className="production-row-block">
                            <div className="row-left-panel">
                                <div className="scrap-btn-row">
                                    <div className="btn-scrap-crema">Scrap Seriado</div>
                                    <div className="btn-scrap-crema">Scrap No Seriado</div>
                                </div>
                            </div>
                            <div className="row-right-values">
                                <div className="values-line">
                                    <div className="val-box-crema transparent"></div>
                                    <div className="val-box-crema" style={{ color: '#8B0000' }}>
                                        {formatNumber(balance.scrapSeriado || 0)}
                                    </div>
                                    <div className="val-box-crema transparent"></div>
                                    <div className="val-box-crema" style={{ color: '#8B0000' }}>0</div>
                                    <div className="val-box-crema" style={{ color: '#8B0000' }}>0</div>
                                    <div className="val-box-crema" style={{ color: '#8B0000' }}>0</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="slitter-balance-footer">
                        <div className="bal-col">
                            <span>Kgs. Entrantes</span>
                            <strong>{formatKg(balance.kgsEntrantes)}</strong>
                        </div>
                        <div className="bal-col">
                            <span>Programados</span>
                            <strong>{formatKg(balance.programados)}</strong>
                        </div>
                        <div className="bal-col">
                            <span>Sobre Orden</span>
                            <strong>{formatKg(balance.sobreOrden)}</strong>
                        </div>
                        <div className="bal-col">
                            <span>Calidad</span>
                            <strong>{formatKg(balance.calidad)}</strong>
                        </div>
                        <div className="bal-col">
                            <span>Sobrante</span>
                            <strong>{formatKg(balance.sobrante)}</strong>
                        </div>
                        <div className="bal-col">
                            <span>Scrap</span>
                            <strong>{formatKg(balance.scrap)}</strong>
                        </div>
                        <div className="bal-col">
                            <span>Scrap Seriado</span>
                            <strong>{formatKg(balance.scrapSeriado || 0)}</strong>
                        </div>
                        <div className="bal-col">
                            <span>Saldo</span>
                            <strong className="blue-saldo-text">{formatKg(balance.saldo)}</strong>
                        </div>
                        <div className="bal-col">
                            <span>Bruto</span>
                            <strong>{formatKg(balance.bruto)}</strong>
                        </div>
                    </footer>
                </main>

                <aside className="slitter-sidebar">
                    <div className="side-btns-group">
                        <button className="side-btn" onClick={handleNotasSRPClick}>Notas SRP</button>
                        <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
                        <button className="side-btn" onClick={handleFichaTecnicaClick}>Ficha Técnica</button>
                        {/* ✅ VB: btFichaEmbalaje_Click */}
                        <button className="side-btn" onClick={handleFichaEmbalajeClick}>Ficha Embalaje</button>
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

            {/* ✅ Modal de Notas SRP */}
            {showNotasSRP && (
                <div className="modal-overlay" onClick={() => setShowNotasSRP(false)}>
                    <div className="modal-content notas-srp-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Notas SRP</h2>
                            <button className="modal-close" onClick={() => setShowNotasSRP(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {notasSRP.calidad && (
                                <div className="nota-section">
                                    <h3>Calidad</h3>
                                    <p>{notasSRP.calidad}</p>
                                </div>
                            )}
                            {notasSRP.otras && (
                                <div className="nota-section">
                                    <h3>Otras</h3>
                                    <p>{notasSRP.otras}</p>
                                </div>
                            )}
                            {notasSRP.traccion && (
                                <div className="nota-section">
                                    <h3>Tracción</h3>
                                    <p>{notasSRP.traccion}</p>
                                </div>
                            )}
                            {!notasSRP.calidad && !notasSRP.otras && !notasSRP.traccion && (
                                <p>No hay notas SRP para esta operación.</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowNotasSRP(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {showToleranciasModal && <ToleranciasModal operacionId={operacionId} onClose={() => setShowToleranciasModal(false)} />}
            
            {showPesajeModal && selectedLinea && (
                <PesajeEmbalajeModal 
                    lineaData={selectedLinea} 
                    operacionId={operacionId} 
                    onClose={() => setShowPesajeModal(false)} 
                    onSuccess={() => fetchData()} 
                />
            )}
            
            {showNotasCalipsoModal && (
                <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />
            )}
        </div>
    );
};

export default EditarOperacionEmbalaje;
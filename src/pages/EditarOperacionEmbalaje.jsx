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

//     // ✅ VB: btnFichaTecnica_Click -> Inicial.sFicha = "FTD" (abre el detalle de ficha)
//     const handleFichaTecnicaClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data.header.SerieLote,
//                     Matching: data.header.Matching,
//                     CodigoProducto: data.header.CodProdPedido
//                 },
//                 tipoFicha: 'FTD'
//             }
//         });
//     };

//     // ✅ VB: btFichaEmbalaje_Click -> Inicial.sFicha = "FE"
//     //    (la grilla abre igual, pero al clickear un producto abre el PDF "TIPO XX.pdf")
//     const handleFichaEmbalajeClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data.header.SerieLote,
//                     Matching: data.header.Matching,
//                     CodigoProducto: data.header.CodProdPedido
//                 },
//                 tipoFicha: 'FE'
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
//                                                 setSelectedLinea({ ...linea, CodigoProducto: header.CodProdPedido || header.CodProdFinal || '' });  // ✅ antes: setSelectedLinea(linea)
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
//                         {/* ✅ VB: btFichaEmbalaje_Click */}
//                         <button className="side-btn" onClick={handleFichaEmbalajeClick}>Ficha Embalaje</button>
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
// import { useAuth } from '../context/AuthContext';
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

// // ✅ VB: Inicial.dTolerancia (porcentaje de tolerancia p/ cierre).
// //    En VB además: if (ToleranciaProg < 2) ToleranciaProg = 2;  → se replica abajo.
// const TOLERANCIA_PORCENTAJE = 0.01; // Ajustar al valor real (ej: 0.01 = 1%)

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const { user } = useAuth();
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

//     // ✅✅ Estados del flujo de CIERRE (VB: btnCierre_Click + pnlSupervisor)
//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [supUser, setSupUser] = useState('');
//     const [supPass, setSupPass] = useState('');
//     const [supValidando, setSupValidando] = useState(false);
//     const [cerrando, setCerrando] = useState(false);

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

//     // ✅ VB: btnFichaTecnica_Click -> Inicial.sFicha = "FTD" (abre el detalle de ficha)
//     const handleFichaTecnicaClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data.header.SerieLote,
//                     Matching: data.header.Matching,
//                     CodigoProducto: data.header.CodProdPedido
//                 },
//                 tipoFicha: 'FTD'
//             }
//         });
//     };

//     // ✅ VB: btFichaEmbalaje_Click -> Inicial.sFicha = "FE"
//     //    (la grilla abre igual, pero al clickear un producto abre el PDF "TIPO XX.pdf")
//     const handleFichaEmbalajeClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data.header.SerieLote,
//                     Matching: data.header.Matching,
//                     CodigoProducto: data.header.CodProdPedido
//                 },
//                 tipoFicha: 'FE'
//             }
//         });
//     };

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     // ========================================================================
//     // ✅✅ CIERRE DE OPERACIÓN (réplica de btnCierre_Click de frmDetalleEmbalaje)
//     // ========================================================================

//     // ✅ Ejecuta el cierre real (endpoint backend = Cierre_Final del VB)
//     const ejecutarCierre = async (supervisor) => {
//         setCerrando(true);
//         try {
//             const confirm = await Swal.fire({
//                 title: 'Confirma Operación',
//                 html: 'Se <b>CERRARÁ</b> la operación.<br/>¿CONFIRMA?',
//                 icon: 'question',
//                 showCancelButton: true,
//                 confirmButtonText: 'Sí, cerrar',
//                 cancelButtonText: 'Cancelar',
//                 confirmButtonColor: '#28a745',
//                 cancelButtonColor: '#6c757d'
//             });
//             if (!confirm.isConfirmed) return;

//             Swal.fire({
//                 title: 'Cerrando...',
//                 text: 'Procesando cierre de la operación.',
//                 allowOutsideClick: false,
//                 didOpen: () => Swal.showLoading()
//             });

//             await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, {
//                 usuario: user?.nombre || 'sistema',
//                 supervisor: supervisor || null
//             });

//             Swal.close();
//             await Swal.fire('Éxito', 'Operación cerrada correctamente.', 'success');
//             // ✅ Vuelve a la grilla y refresca (como el VB que recarga OperacionesEmbalaje)
//             navigate(-1);
//             setTimeout(() => window.location.reload(), 100);
//         } catch (err) {
//             Swal.close();
//             console.error('Error al cerrar:', err);
//             Swal.fire('Error', err.response?.data?.error || 'No se pudo cerrar la operación.', 'error');
//         } finally {
//             setCerrando(false);
//         }
//     };

//     // ✅ Autorización de Supervisor (VB: pnlSupervisor / Validar35Embalaje)
//     const handleSupervisorAuth = async () => {
//         const nombre = supUser.trim();
//         if (!nombre || !supPass) {
//             Swal.fire('Atención', 'Ingrese usuario y contraseña de Supervisor.', 'warning');
//             return;
//         }
//         setSupValidando(true);
//         try {
//             const res = await axiosInstance.post('/auth/verify-supervisor', { nombre, password: supPass });
//             if (res.data?.success) {
//                 setShowSupervisorModal(false);
//                 setSupUser('');
//                 setSupPass('');
//                 await ejecutarCierre({ nombre });
//             } else {
//                 Swal.fire('Error', 'Credenciales de Supervisor incorrectas.', 'error');
//             }
//         } catch (err) {
//             Swal.fire('Error', err.response?.data?.message || 'Error de autorización.', 'error');
//         } finally {
//             setSupValidando(false);
//         }
//     };

//     // ✅ btnCierre_Click
//     const handleCierre = async () => {
//         if (cerrando) return;

//         // ---- PASO 1: validaciones por línea (VB: loop de items) ----
//         const mensajesTolerancia = [];
//         const erroresBruto = [];
//         let faltaBruto = false;

//         (lineas || []).forEach(l => {
//             if (!l.NumeroPedido) return;
//             const prog = parseFloat(l.Programados || 0);
//             const so = parseFloat(l.SobreOrden || 0);
//             const cal = parseFloat(l.Calidad || 0);
//             const bruto = parseFloat(l.Bruto || 0);

//             // VB: ToleranciaProg = dKgsProg * dTolerancia; if (< 2) = 2
//             let tolItem = prog * TOLERANCIA_PORCENTAJE;
//             if (tolItem < 2) tolItem = 2;
//             if ((so + cal) > (prog + tolItem) || (so + cal) < (prog - tolItem)) {
//                 mensajesTolerancia.push(`Fuera Tolerancia en Item ${l.NumeroItem}`);
//             }

//             // VB: dKgsBruto == 0 && dKgsSO != 0 → falta ingresar PESO BRUTO
//             if (bruto === 0 && so !== 0) faltaBruto = true;
//             // VB: dKgsBruto != 0 && dKgsBruto < dKgsSO → bruto menor al neto
//             if (bruto !== 0 && bruto < so) {
//                 erroresBruto.push(`Item ${l.NumeroItem}: PESO BRUTO no puede ser menor al PESO NETO (Sobre Orden).`);
//             }
//         });

//         if (erroresBruto.length > 0) {
//             return Swal.fire('Advertencia', erroresBruto.join('\n'), 'warning');
//         }

//         // ---- PASO 2: advertencia de tolerancia por línea (NO bloqueante, como VB) ----
//         if (mensajesTolerancia.length > 0) {
//             await Swal.fire({
//                 title: 'Advertencia',
//                 text: mensajesTolerancia.join('\n'),
//                 icon: 'warning',
//                 confirmButtonText: 'Continuar'
//             });
//         }

//         // ---- PASO 3: validaciones de BD (op. anterior cerrada / falta dictamen calidad) ----
//         let validacion = { puedeCerrar: true, necesitaSupervisor: false, mensaje: '' };
//         try {
//             const valRes = await axiosInstance.get(`/registracion/operaciones/validar-cierre/${operacionId}`);
//             validacion = valRes.data || validacion;
//         } catch (err) {
//             return Swal.fire('Error', err.response?.data?.error || 'No se pudo validar el cierre.', 'error');
//         }

//         if (!validacion.puedeCerrar) {
//             return Swal.fire('Advertencia', validacion.mensaje || 'No es posible cerrar la operación.', 'warning');
//         }

//         // ---- PASO 4: saldo global dentro de tolerancia (VB: SaldoCierre vs ToleranciaProg) ----
//         const pesada = parseFloat(balance.kgsEntrantes || 0);
//         let tolGlobal = pesada * TOLERANCIA_PORCENTAJE;
//         if (tolGlobal < 2) tolGlobal = 2;
//         const saldo = parseFloat(balance.saldo || 0);
//         const saldoFuera = saldo > tolGlobal || saldo < (tolGlobal * -1);

//         if (saldoFuera || faltaBruto) {
//             let msg = '';
//             if (saldoFuera) msg += `El SALDO (${formatKg(saldo)} kgs) DEBE estar dentro de la TOLERANCIA (${formatKg(tolGlobal)} kgs) para efectuar el cierre.\n`;
//             if (faltaBruto) msg += 'Hay items donde falta ingresar PESO BRUTO.';
//             return Swal.fire('Advertencia', msg, 'warning');
//         }

//         // ---- PASO 5: requiere Supervisor (VB: Validar35Embalaje → pnlSupervisor) ----
//         if (validacion.necesitaSupervisor) {
//             setShowSupervisorModal(true);
//             return;
//         }

//         // ---- PASO 6: confirmación y Cierre_Final ----
//         await ejecutarCierre(null);
//     };

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
//                                                 setSelectedLinea({ ...linea, CodigoProducto: header.CodProdPedido || header.CodProdFinal || '' });  // ✅ antes: setSelectedLinea(linea)
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
//                         {/* ✅ VB: btFichaEmbalaje_Click */}
//                         <button className="side-btn" onClick={handleFichaEmbalajeClick}>Ficha Embalaje</button>
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
//                     {/* ✅✅ VB: btnCierre_Click */}
//                     <button 
//                         className="side-btn btn-green-cierre" 
//                         disabled={cerrando}
//                         onClick={handleCierre}
//                     >
//                         CIERRE
//                     </button>
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

//             {/* ✅✅ Modal de Autorización de Supervisor (VB: pnlSupervisor) */}
//             {showSupervisorModal && (
//                 <div className="modal-overlay" onClick={() => !supValidando && setShowSupervisorModal(false)}>
//                     <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h2>⚠️ Autorización de Supervisor</h2>
//                             <button className="modal-close" onClick={() => !supValidando && setShowSupervisorModal(false)}>×</button>
//                         </div>
//                         <div className="modal-body">
//                             <p style={{ marginBottom: '15px' }}>
//                                 La operación excede la tolerancia individual permitida.<br/>
//                                 Ingrese credenciales de Supervisor para autorizar el cierre.
//                             </p>
//                             <div style={{ marginBottom: '12px' }}>
//                                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Usuario Supervisor:</label>
//                                 <input 
//                                     type="text" 
//                                     className="form-control" 
//                                     value={supUser} 
//                                     onChange={e => setSupUser(e.target.value)} 
//                                     autoComplete="off"
//                                     autoFocus
//                                 />
//                             </div>
//                             <div style={{ marginBottom: '8px' }}>
//                                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Contraseña:</label>
//                                 <input 
//                                     type="password" 
//                                     className="form-control" 
//                                     value={supPass} 
//                                     onChange={e => setSupPass(e.target.value)} 
//                                     autoComplete="new-password"
//                                     onKeyDown={(e) => e.key === 'Enter' && handleSupervisorAuth()}
//                                 />
//                             </div>
//                         </div>
//                         <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//                             <button className="btn-secondary" disabled={supValidando} onClick={() => setShowSupervisorModal(false)}>Cancelar</button>
//                             <button 
//                                 className="btn-primary" 
//                                 disabled={supValidando}
//                                 style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
//                                 onClick={handleSupervisorAuth}
//                             >
//                                 {supValidando ? 'Validando...' : 'Autorizar y Cerrar'}
//                             </button>
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
// import { useAuth } from '../context/AuthContext';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeEmbalajeModal from '../components/PesajeEmbalajeModal';
// import NotasCalipsoModal from '../components/NotasCalipsoModal';
// import ScrapSeriadoModal from '../components/modals/ScrapSeriadoModal';
// import ScrapNoSeriadoModal from '../components/modals/ScrapNoSeriadoModal';

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const formatKg = (num) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     });
// };

// const TOLERANCIA_PORCENTAJE = 0.01;

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
    
//     // Estados para modales
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showNotasSRP, setShowNotasSRP] = useState(false);
//     const [notasSRP, setNotasSRP] = useState({ calidad: '', otras: '', traccion: '' });

//     // ✅✅ Estados para modales de Scrap
//     const [showScrapSeriadoModal, setShowScrapSeriadoModal] = useState(false);
//     const [showScrapNoSeriadoModal, setShowScrapNoSeriadoModal] = useState(false);

//     // ✅✅ Estados del flujo de CIERRE
//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [supUser, setSupUser] = useState('');
//     const [supPass, setSupPass] = useState('');
//     const [supValidando, setSupValidando] = useState(false);
//     const [cerrando, setCerrando] = useState(false);

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
//                 },
//                 tipoFicha: 'FTD'
//             }
//         });
//     };

//     const handleFichaEmbalajeClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data.header.SerieLote,
//                     Matching: data.header.Matching,
//                     CodigoProducto: data.header.CodProdPedido
//                 },
//                 tipoFicha: 'FE'
//             }
//         });
//     };

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     // ========================================================================
//     // ✅✅ CIERRE DE OPERACIÓN
//     // ========================================================================
//     const ejecutarCierre = async (supervisor) => {
//         setCerrando(true);
//         try {
//             const confirm = await Swal.fire({
//                 title: 'Confirma Operación',
//                 html: 'Se <b>CERRARÁ</b> la operación.<br/>¿CONFIRMA?',
//                 icon: 'question',
//                 showCancelButton: true,
//                 confirmButtonText: 'Sí, cerrar',
//                 cancelButtonText: 'Cancelar',
//                 confirmButtonColor: '#28a745',
//                 cancelButtonColor: '#6c757d'
//             });
//             if (!confirm.isConfirmed) return;

//             Swal.fire({
//                 title: 'Cerrando...',
//                 text: 'Procesando cierre de la operación.',
//                 allowOutsideClick: false,
//                 didOpen: () => Swal.showLoading()
//             });

//             await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, {
//                 usuario: user?.nombre || 'sistema',
//                 supervisor: supervisor || null
//             });

//             Swal.close();
//             await Swal.fire('Éxito', 'Operación cerrada correctamente.', 'success');
//             navigate(-1);
//             setTimeout(() => window.location.reload(), 100);
//         } catch (err) {
//             Swal.close();
//             console.error('Error al cerrar:', err);
//             Swal.fire('Error', err.response?.data?.error || 'No se pudo cerrar la operación.', 'error');
//         } finally {
//             setCerrando(false);
//         }
//     };

//     const handleSupervisorAuth = async () => {
//         const nombre = supUser.trim();
//         if (!nombre || !supPass) {
//             Swal.fire('Atención', 'Ingrese usuario y contraseña de Supervisor.', 'warning');
//             return;
//         }
//         setSupValidando(true);
//         try {
//             const res = await axiosInstance.post('/auth/verify-supervisor', { nombre, password: supPass });
//             if (res.data?.success) {
//                 setShowSupervisorModal(false);
//                 setSupUser('');
//                 setSupPass('');
//                 await ejecutarCierre({ nombre });
//             } else {
//                 Swal.fire('Error', 'Credenciales de Supervisor incorrectas.', 'error');
//             }
//         } catch (err) {
//             Swal.fire('Error', err.response?.data?.message || 'Error de autorización.', 'error');
//         } finally {
//             setSupValidando(false);
//         }
//     };

//     const handleCierre = async () => {
//         if (cerrando) return;

//         const mensajesTolerancia = [];
//         const erroresBruto = [];
//         let faltaBruto = false;

//         (lineas || []).forEach(l => {
//             if (!l.NumeroPedido) return;
//             const prog = parseFloat(l.Programados || 0);
//             const so = parseFloat(l.SobreOrden || 0);
//             const cal = parseFloat(l.Calidad || 0);
//             const bruto = parseFloat(l.Bruto || 0);

//             let tolItem = prog * TOLERANCIA_PORCENTAJE;
//             if (tolItem < 2) tolItem = 2;
//             if ((so + cal) > (prog + tolItem) || (so + cal) < (prog - tolItem)) {
//                 mensajesTolerancia.push(`Fuera Tolerancia en Item ${l.NumeroItem}`);
//             }

//             if (bruto === 0 && so !== 0) faltaBruto = true;
//             if (bruto !== 0 && bruto < so) {
//                 erroresBruto.push(`Item ${l.NumeroItem}: PESO BRUTO no puede ser menor al PESO NETO (Sobre Orden).`);
//             }
//         });

//         if (erroresBruto.length > 0) {
//             return Swal.fire('Advertencia', erroresBruto.join('\n'), 'warning');
//         }

//         if (mensajesTolerancia.length > 0) {
//             await Swal.fire({
//                 title: 'Advertencia',
//                 text: mensajesTolerancia.join('\n'),
//                 icon: 'warning',
//                 confirmButtonText: 'Continuar'
//             });
//         }

//         let validacion = { puedeCerrar: true, necesitaSupervisor: false, mensaje: '' };
//         try {
//             const valRes = await axiosInstance.get(`/registracion/operaciones/validar-cierre/${operacionId}`);
//             validacion = valRes.data || validacion;
//         } catch (err) {
//             return Swal.fire('Error', err.response?.data?.error || 'No se pudo validar el cierre.', 'error');
//         }

//         if (!validacion.puedeCerrar) {
//             return Swal.fire('Advertencia', validacion.mensaje || 'No es posible cerrar la operación.', 'warning');
//         }

//         const pesada = parseFloat(balance.kgsEntrantes || 0);
//         let tolGlobal = pesada * TOLERANCIA_PORCENTAJE;
//         if (tolGlobal < 2) tolGlobal = 2;
//         const saldo = parseFloat(balance.saldo || 0);
//         const saldoFuera = saldo > tolGlobal || saldo < (tolGlobal * -1);

//         if (saldoFuera || faltaBruto) {
//             let msg = '';
//             if (saldoFuera) msg += `El SALDO (${formatKg(saldo)} kgs) DEBE estar dentro de la TOLERANCIA (${formatKg(tolGlobal)} kgs) para efectuar el cierre.\n`;
//             if (faltaBruto) msg += 'Hay items donde falta ingresar PESO BRUTO.';
//             return Swal.fire('Advertencia', msg, 'warning');
//         }

//         if (validacion.necesitaSupervisor) {
//             setShowSupervisorModal(true);
//             return;
//         }

//         await ejecutarCierre(null);
//     };

//     // ✅✅ Función para abrir modal de Scrap Seriado
//     const abrirScrapSeriado = async () => {
//         try {
//             const res = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
//             const codigoMerma = res.data?.CodigoProductoS || '';
            
//             setSelectedLinea({
//                 operacionId,
//                 itemPedidoId: lineas[0]?.ItemPedido_ID || header.LoteID,
//                 numeroItem: lineas[0]?.NumeroItem || 0,
//                 CodigoProductoS: codigoMerma,
//                 CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//                 SerieLote: header.SerieLote,
//                 Ancho: header.Ancho
//             });
//             setShowScrapSeriadoModal(true);
//         } catch (e) {
//             console.error("Error al obtener código de merma", e);
//             setSelectedLinea({
//                 operacionId,
//                 itemPedidoId: lineas[0]?.ItemPedido_ID || header.LoteID,
//                 numeroItem: lineas[0]?.NumeroItem || 0,
//                 CodigoProductoS: '',
//                 CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//                 SerieLote: header.SerieLote,
//                 Ancho: header.Ancho
//             });
//             setShowScrapSeriadoModal(true);
//         }
//     };

//     // ✅✅ Función para abrir modal de Scrap No Seriado
//     const abrirScrapNoSeriado = () => {
//         setSelectedLinea({
//             operacionId,
//             itemPedidoId: lineas[0]?.ItemPedido_ID || header.LoteID,
//             numeroItem: lineas[0]?.NumeroItem || 0,
//             CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//             SerieLote: header.SerieLote,
//             Ancho: header.Ancho
//         });
//         setShowScrapNoSeriadoModal(true);
//     };

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

//                         {/* ✅ Renderizar líneas de pedido */}
//                         {lineas.filter(l => l.NumeroPedido).map((linea, idx) => (
//                             <div key={idx} className="production-row-block">
//                                 <div className="row-left-panel">
//                                     <div 
//                                         className="pedido-card-crema" 
//                                         onClick={() => { 
//                                             if (linea.tieneRegistros !== false) {
//                                                 setSelectedLinea({ ...linea, CodigoProducto: header.CodProdPedido || header.CodProdFinal || '' });
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
//                                 </div>
//                             </div>
//                         ))}

//                         {/* ✅✅ FILA DE SCRAP SERIADO */}
//                         <div className="production-row-block">
//                             <div className="row-left-panel">
//                                 <div className="scrap-btn-row">
//                                     <button 
//                                         className="btn-scrap-crema"
//                                         onClick={abrirScrapSeriado}
//                                         style={{ 
//                                             cursor: 'pointer', 
//                                             border: '1px solid #ccc', 
//                                             borderRadius: '4px', 
//                                             background: '#f9f9f9',
//                                             padding: '10px 20px',
//                                             fontWeight: 'bold'
//                                         }}
//                                     >
//                                         Scrap Seriado
//                                     </button>
//                                 </div>
//                             </div>
//                             <div className="row-right-values">
//                                 <div className="values-line">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000', fontWeight: 'bold' }}>
//                                         {formatNumber(balance.scrapSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.atadosScrapSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.rollosScrapSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* ✅✅ FILA DE SCRAP NO SERIADO */}
//                         <div className="production-row-block">
//                             <div className="row-left-panel">
//                                 <div className="scrap-btn-row">
//                                     <button 
//                                         className="btn-scrap-crema"
//                                         onClick={abrirScrapNoSeriado}
//                                         style={{ 
//                                             cursor: 'pointer', 
//                                             border: '1px solid #ccc', 
//                                             borderRadius: '4px', 
//                                             background: '#f9f9f9',
//                                             padding: '10px 20px',
//                                             fontWeight: 'bold'
//                                         }}
//                                     >
//                                         Scrap No Seriado
//                                     </button>
//                                 </div>
//                             </div>
//                             <div className="row-right-values">
//                                 <div className="values-line">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000', fontWeight: 'bold' }}>
//                                         {formatNumber(balance.scrapNoSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.atadosScrapNoSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.rollosScrapNoSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
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
//                             <span>Scrap</span>
//                             <strong>{formatKg(balance.scrap)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Scrap Seriado</span>
//                             <strong>{formatKg(balance.scrapSeriado || 0)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Scrap No Seriado</span>
//                             <strong>{formatKg(balance.scrapNoSeriado || 0)}</strong>
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
//                         <button className="side-btn" onClick={handleFichaEmbalajeClick}>Ficha Embalaje</button>
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
//                     <button 
//                         className="side-btn btn-green-cierre" 
//                         disabled={cerrando}
//                         onClick={handleCierre}
//                     >
//                         CIERRE
//                     </button>
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
//                             {notasSRP.calidad && <div className="nota-section"><h3>Calidad</h3><p>{notasSRP.calidad}</p></div>}
//                             {notasSRP.otras && <div className="nota-section"><h3>Otras</h3><p>{notasSRP.otras}</p></div>}
//                             {notasSRP.traccion && <div className="nota-section"><h3>Tracción</h3><p>{notasSRP.traccion}</p></div>}
//                             {!notasSRP.calidad && !notasSRP.otras && !notasSRP.traccion && <p>No hay notas SRP para esta operación.</p>}
//                         </div>
//                         <div className="modal-footer">
//                             <button className="btn-secondary" onClick={() => setShowNotasSRP(false)}>Cerrar</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ✅✅ Modal de Autorización de Supervisor */}
//             {showSupervisorModal && (
//                 <div className="modal-overlay" onClick={() => !supValidando && setShowSupervisorModal(false)}>
//                     <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h2>⚠️ Autorización de Supervisor</h2>
//                             <button className="modal-close" onClick={() => !supValidando && setShowSupervisorModal(false)}>×</button>
//                         </div>
//                         <div className="modal-body">
//                             <p style={{ marginBottom: '15px' }}>
//                                 La operación excede la tolerancia individual permitida.<br/>
//                                 Ingrese credenciales de Supervisor para autorizar el cierre.
//                             </p>
//                             <div style={{ marginBottom: '12px' }}>
//                                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Usuario Supervisor:</label>
//                                 <input 
//                                     type="text" 
//                                     className="form-control" 
//                                     value={supUser} 
//                                     onChange={e => setSupUser(e.target.value)} 
//                                     autoComplete="off"
//                                     autoFocus
//                                 />
//                             </div>
//                             <div style={{ marginBottom: '8px' }}>
//                                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Contraseña:</label>
//                                 <input 
//                                     type="password" 
//                                     className="form-control" 
//                                     value={supPass} 
//                                     onChange={e => setSupPass(e.target.value)} 
//                                     autoComplete="new-password"
//                                     onKeyDown={(e) => e.key === 'Enter' && handleSupervisorAuth()}
//                                 />
//                             </div>
//                         </div>
//                         <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//                             <button className="btn-secondary" disabled={supValidando} onClick={() => setShowSupervisorModal(false)}>Cancelar</button>
//                             <button 
//                                 className="btn-primary" 
//                                 disabled={supValidando}
//                                 style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
//                                 onClick={handleSupervisorAuth}
//                             >
//                                 {supValidando ? 'Validando...' : 'Autorizar y Cerrar'}
//                             </button>
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

//             {/* ✅✅ Modal de Scrap Seriado */}
//             {showScrapSeriadoModal && selectedLinea && (
//                 <ScrapSeriadoModal
//                     operacionId={selectedLinea.operacionId}
//                     itemPedidoId={selectedLinea.itemPedidoId}
//                     numeroItem={selectedLinea.numeroItem}
//                     onClose={() => {
//                         setShowScrapSeriadoModal(false);
//                         setSelectedLinea(null);
//                     }}
//                     onSuccess={() => {
//                         setShowScrapSeriadoModal(false);
//                         setSelectedLinea(null);
//                         fetchData();
//                     }}
//                 />
//             )}

//             {/* ✅✅ Modal de Scrap No Seriado */}
//             {showScrapNoSeriadoModal && selectedLinea && (
//                 <ScrapNoSeriadoModal
//                     operacionId={selectedLinea.operacionId}
//                     itemPedidoId={selectedLinea.itemPedidoId}
//                     numeroItem={selectedLinea.numeroItem}
//                     onClose={() => {
//                         setShowScrapNoSeriadoModal(false);
//                         setSelectedLinea(null);
//                     }}
//                     onSuccess={() => {
//                         setShowScrapNoSeriadoModal(false);
//                         setSelectedLinea(null);
//                         fetchData();
//                     }}
//                 />
//             )}
            
//             {showNotasCalipsoModal && (
//                 <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />
//             )}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;


























// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import { useAuth } from '../context/AuthContext';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeEmbalajeModal from '../components/PesajeEmbalajeModal';
// import NotasCalipsoModal from '../components/NotasCalipsoModal';
// import ScrapSeriadoModal from '../components/modals/ScrapSeriadoModal';
// import ScrapNoSeriadoModal from '../components/modals/ScrapNoSeriadoModal';

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const formatKg = (num) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     });
// };

// const TOLERANCIA_PORCENTAJE = 0.01;

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
    
//     // Estados para modales
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showNotasSRP, setShowNotasSRP] = useState(false);
//     const [notasSRP, setNotasSRP] = useState({ calidad: '', otras: '', traccion: '' });

//     // ✅✅ Estados para modales de Scrap
//     const [showScrapSeriadoModal, setShowScrapSeriadoModal] = useState(false);
//     const [showScrapNoSeriadoModal, setShowScrapNoSeriadoModal] = useState(false);

//     // ✅✅ Estados del flujo de CIERRE
//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [supUser, setSupUser] = useState('');
//     const [supPass, setSupPass] = useState('');
//     const [supValidando, setSupValidando] = useState(false);
//     const [cerrando, setCerrando] = useState(false);

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
//                 },
//                 tipoFicha: 'FTD'
//             }
//         });
//     };

//     const handleFichaEmbalajeClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data.header.SerieLote,
//                     Matching: data.header.Matching,
//                     CodigoProducto: data.header.CodProdPedido
//                 },
//                 tipoFicha: 'FE'
//             }
//         });
//     };

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     // ========================================================================
//     // ✅✅ CIERRE DE OPERACIÓN
//     // ========================================================================
//     const ejecutarCierre = async (supervisor) => {
//         setCerrando(true);
//         try {
//             const confirm = await Swal.fire({
//                 title: 'Confirma Operación',
//                 html: 'Se <b>CERRARÁ</b> la operación.<br/>¿CONFIRMA?',
//                 icon: 'question',
//                 showCancelButton: true,
//                 confirmButtonText: 'Sí, cerrar',
//                 cancelButtonText: 'Cancelar',
//                 confirmButtonColor: '#28a745',
//                 cancelButtonColor: '#6c757d'
//             });
//             if (!confirm.isConfirmed) return;

//             Swal.fire({
//                 title: 'Cerrando...',
//                 text: 'Procesando cierre de la operación.',
//                 allowOutsideClick: false,
//                 didOpen: () => Swal.showLoading()
//             });

//             await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, {
//                 usuario: user?.nombre || 'sistema',
//                 supervisor: supervisor || null
//             });

//             Swal.close();
//             await Swal.fire('Éxito', 'Operación cerrada correctamente.', 'success');
//             navigate(-1);
//             setTimeout(() => window.location.reload(), 100);
//         } catch (err) {
//             Swal.close();
//             console.error('Error al cerrar:', err);
//             Swal.fire('Error', err.response?.data?.error || 'No se pudo cerrar la operación.', 'error');
//         } finally {
//             setCerrando(false);
//         }
//     };

//     const handleSupervisorAuth = async () => {
//         const nombre = supUser.trim();
//         if (!nombre || !supPass) {
//             Swal.fire('Atención', 'Ingrese usuario y contraseña de Supervisor.', 'warning');
//             return;
//         }
//         setSupValidando(true);
//         try {
//             const res = await axiosInstance.post('/auth/verify-supervisor', { nombre, password: supPass });
//             if (res.data?.success) {
//                 setShowSupervisorModal(false);
//                 setSupUser('');
//                 setSupPass('');
//                 await ejecutarCierre({ nombre });
//             } else {
//                 Swal.fire('Error', 'Credenciales de Supervisor incorrectas.', 'error');
//             }
//         } catch (err) {
//             Swal.fire('Error', err.response?.data?.message || 'Error de autorización.', 'error');
//         } finally {
//             setSupValidando(false);
//         }
//     };

//     const handleCierre = async () => {
//         if (cerrando) return;

//         const mensajesTolerancia = [];
//         const erroresBruto = [];
//         let faltaBruto = false;

//         (lineas || []).forEach(l => {
//             if (!l.NumeroPedido) return;
//             const prog = parseFloat(l.Programados || 0);
//             const so = parseFloat(l.SobreOrden || 0);
//             const cal = parseFloat(l.Calidad || 0);
//             const bruto = parseFloat(l.Bruto || 0);

//             let tolItem = prog * TOLERANCIA_PORCENTAJE;
//             if (tolItem < 2) tolItem = 2;
//             if ((so + cal) > (prog + tolItem) || (so + cal) < (prog - tolItem)) {
//                 mensajesTolerancia.push(`Fuera Tolerancia en Item ${l.NumeroItem}`);
//             }

//             if (bruto === 0 && so !== 0) faltaBruto = true;
//             if (bruto !== 0 && bruto < so) {
//                 erroresBruto.push(`Item ${l.NumeroItem}: PESO BRUTO no puede ser menor al PESO NETO (Sobre Orden).`);
//             }
//         });

//         if (erroresBruto.length > 0) {
//             return Swal.fire('Advertencia', erroresBruto.join('\n'), 'warning');
//         }

//         if (mensajesTolerancia.length > 0) {
//             await Swal.fire({
//                 title: 'Advertencia',
//                 text: mensajesTolerancia.join('\n'),
//                 icon: 'warning',
//                 confirmButtonText: 'Continuar'
//             });
//         }

//         let validacion = { puedeCerrar: true, necesitaSupervisor: false, mensaje: '' };
//         try {
//             const valRes = await axiosInstance.get(`/registracion/operaciones/validar-cierre/${operacionId}`);
//             validacion = valRes.data || validacion;
//         } catch (err) {
//             return Swal.fire('Error', err.response?.data?.error || 'No se pudo validar el cierre.', 'error');
//         }

//         if (!validacion.puedeCerrar) {
//             return Swal.fire('Advertencia', validacion.mensaje || 'No es posible cerrar la operación.', 'warning');
//         }

//         const pesada = parseFloat(balance.kgsEntrantes || 0);
//         let tolGlobal = pesada * TOLERANCIA_PORCENTAJE;
//         if (tolGlobal < 2) tolGlobal = 2;
//         const saldo = parseFloat(balance.saldo || 0);
//         const saldoFuera = saldo > tolGlobal || saldo < (tolGlobal * -1);

//         if (saldoFuera || faltaBruto) {
//             let msg = '';
//             if (saldoFuera) msg += `El SALDO (${formatKg(saldo)} kgs) DEBE estar dentro de la TOLERANCIA (${formatKg(tolGlobal)} kgs) para efectuar el cierre.\n`;
//             if (faltaBruto) msg += 'Hay items donde falta ingresar PESO BRUTO.';
//             return Swal.fire('Advertencia', msg, 'warning');
//         }

//         if (validacion.necesitaSupervisor) {
//             setShowSupervisorModal(true);
//             return;
//         }

//         await ejecutarCierre(null);
//     };

//     // ✅✅ Función para abrir modal de Scrap Seriado
//     const abrirScrapSeriado = async () => {
//         try {
//             const res = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
//             const codigoMerma = res.data?.CodigoProductoS || '';
            
//             const primeraLinea = lineas.find(l => l.NumeroPedido) || lineas[0] || {};
            
//             setSelectedLinea({
//                 operacionId,
//                 itemPedidoId: primeraLinea.ItemPedido_ID || '',
//                 numeroItem: primeraLinea.NumeroItem || 0,
//                 CodigoProductoS: codigoMerma,
//                 CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//                 SerieLote: header.SerieLote,
//                 Ancho: header.Ancho
//             });
//             setShowScrapSeriadoModal(true);
//         } catch (e) {
//             console.error("Error al obtener código de merma", e);
//             const primeraLinea = lineas.find(l => l.NumeroPedido) || lineas[0] || {};
//             setSelectedLinea({
//                 operacionId,
//                 itemPedidoId: primeraLinea.ItemPedido_ID || '',
//                 numeroItem: primeraLinea.NumeroItem || 0,
//                 CodigoProductoS: '',
//                 CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//                 SerieLote: header.SerieLote,
//                 Ancho: header.Ancho
//             });
//             setShowScrapSeriadoModal(true);
//         }
//     };

//     // ✅✅ Función para abrir modal de Scrap No Seriado
//     const abrirScrapNoSeriado = () => {
//         const primeraLinea = lineas.find(l => l.NumeroPedido) || lineas[0] || {};
//         setSelectedLinea({
//             operacionId,
//             itemPedidoId: primeraLinea.ItemPedido_ID || '',
//             numeroItem: primeraLinea.NumeroItem || 0,
//             CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//             SerieLote: header.SerieLote,
//             Ancho: header.Ancho
//         });
//         setShowScrapNoSeriadoModal(true);
//     };

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

//                         {/* ✅ Renderizar líneas de pedido */}
//                         {lineas.filter(l => l.NumeroPedido).map((linea, idx) => (
//                             <div key={idx} className="production-row-block">
//                                 <div className="row-left-panel">
//                                     <div 
//                                         className="pedido-card-crema" 
//                                         onClick={() => { 
//                                             if (linea.tieneRegistros !== false) {
//                                                 setSelectedLinea({ ...linea, CodigoProducto: header.CodProdPedido || header.CodProdFinal || '' });
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
//                                 </div>
//                             </div>
//                         ))}

//                         {/* ✅✅ FILA DE SCRAP SERIADO */}
//                         <div className="production-row-block">
//                             <div className="row-left-panel">
//                                 <div className="scrap-btn-row">
//                                     <button 
//                                         className="btn-scrap-crema"
//                                         onClick={abrirScrapSeriado}
//                                         style={{ 
//                                             cursor: 'pointer', 
//                                             border: '1px solid #ccc', 
//                                             borderRadius: '4px', 
//                                             background: '#f9f9f9',
//                                             padding: '10px 20px',
//                                             fontWeight: 'bold'
//                                         }}
//                                     >
//                                         Scrap Seriado
//                                     </button>
//                                 </div>
//                             </div>
//                             <div className="row-right-values">
//                                 <div className="values-line">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000', fontWeight: 'bold' }}>
//                                         {formatNumber(balance.scrapSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.atadosScrapSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.rollosScrapSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* ✅✅ FILA DE SCRAP NO SERIADO */}
//                         <div className="production-row-block">
//                             <div className="row-left-panel">
//                                 <div className="scrap-btn-row">
//                                     <button 
//                                         className="btn-scrap-crema"
//                                         onClick={abrirScrapNoSeriado}
//                                         style={{ 
//                                             cursor: 'pointer', 
//                                             border: '1px solid #ccc', 
//                                             borderRadius: '4px', 
//                                             background: '#f9f9f9',
//                                             padding: '10px 20px',
//                                             fontWeight: 'bold'
//                                         }}
//                                     >
//                                         Scrap No Seriado
//                                     </button>
//                                 </div>
//                             </div>
//                             <div className="row-right-values">
//                                 <div className="values-line">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000', fontWeight: 'bold' }}>
//                                         {formatNumber(balance.scrapNoSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.atadosScrapNoSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.rollosScrapNoSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
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
//                             <span>Scrap</span>
//                             <strong>{formatKg(balance.scrap)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Scrap Seriado</span>
//                             <strong>{formatKg(balance.scrapSeriado || 0)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Scrap No Seriado</span>
//                             <strong>{formatKg(balance.scrapNoSeriado || 0)}</strong>
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
//                         <button className="side-btn" onClick={handleFichaEmbalajeClick}>Ficha Embalaje</button>
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
//                     <button 
//                         className="side-btn btn-green-cierre" 
//                         disabled={cerrando}
//                         onClick={handleCierre}
//                     >
//                         CIERRE
//                     </button>
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
//                             {notasSRP.calidad && <div className="nota-section"><h3>Calidad</h3><p>{notasSRP.calidad}</p></div>}
//                             {notasSRP.otras && <div className="nota-section"><h3>Otras</h3><p>{notasSRP.otras}</p></div>}
//                             {notasSRP.traccion && <div className="nota-section"><h3>Tracción</h3><p>{notasSRP.traccion}</p></div>}
//                             {!notasSRP.calidad && !notasSRP.otras && !notasSRP.traccion && <p>No hay notas SRP para esta operación.</p>}
//                         </div>
//                         <div className="modal-footer">
//                             <button className="btn-secondary" onClick={() => setShowNotasSRP(false)}>Cerrar</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ✅✅ Modal de Autorización de Supervisor */}
//             {showSupervisorModal && (
//                 <div className="modal-overlay" onClick={() => !supValidando && setShowSupervisorModal(false)}>
//                     <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h2>⚠️ Autorización de Supervisor</h2>
//                             <button className="modal-close" onClick={() => !supValidando && setShowSupervisorModal(false)}>×</button>
//                         </div>
//                         <div className="modal-body">
//                             <p style={{ marginBottom: '15px' }}>
//                                 La operación excede la tolerancia individual permitida.<br/>
//                                 Ingrese credenciales de Supervisor para autorizar el cierre.
//                             </p>
//                             <div style={{ marginBottom: '12px' }}>
//                                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Usuario Supervisor:</label>
//                                 <input 
//                                     type="text" 
//                                     className="form-control" 
//                                     value={supUser} 
//                                     onChange={e => setSupUser(e.target.value)} 
//                                     autoComplete="off"
//                                     autoFocus
//                                 />
//                             </div>
//                             <div style={{ marginBottom: '8px' }}>
//                                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Contraseña:</label>
//                                 <input 
//                                     type="password" 
//                                     className="form-control" 
//                                     value={supPass} 
//                                     onChange={e => setSupPass(e.target.value)} 
//                                     autoComplete="new-password"
//                                     onKeyDown={(e) => e.key === 'Enter' && handleSupervisorAuth()}
//                                 />
//                             </div>
//                         </div>
//                         <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//                             <button className="btn-secondary" disabled={supValidando} onClick={() => setShowSupervisorModal(false)}>Cancelar</button>
//                             <button 
//                                 className="btn-primary" 
//                                 disabled={supValidando}
//                                 style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
//                                 onClick={handleSupervisorAuth}
//                             >
//                                 {supValidando ? 'Validando...' : 'Autorizar y Cerrar'}
//                             </button>
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

//             {/* ✅✅ Modal de Scrap Seriado */}
//             {showScrapSeriadoModal && selectedLinea && (
//                 <ScrapSeriadoModal
//                     operacionId={selectedLinea.operacionId}
//                     itemPedidoId={selectedLinea.itemPedidoId}
//                     numeroItem={selectedLinea.numeroItem}
//                     serieLote={selectedLinea.SerieLote}
//                     onClose={() => {
//                         setShowScrapSeriadoModal(false);
//                         setSelectedLinea(null);
//                     }}
//                     onSuccess={() => {
//                         setShowScrapSeriadoModal(false);
//                         setSelectedLinea(null);
//                         fetchData();
//                     }}
//                 />
//             )}

//             {/* ✅✅ Modal de Scrap No Seriado */}
//             {showScrapNoSeriadoModal && selectedLinea && (
//                 <ScrapNoSeriadoModal
//                     operacionId={selectedLinea.operacionId}
//                     itemPedidoId={selectedLinea.itemPedidoId}
//                     numeroItem={selectedLinea.numeroItem}
//                     onClose={() => {
//                         setShowScrapNoSeriadoModal(false);
//                         setSelectedLinea(null);
//                     }}
//                     onSuccess={() => {
//                         setShowScrapNoSeriadoModal(false);
//                         setSelectedLinea(null);
//                         fetchData();
//                     }}
//                 />
//             )}
            
//             {showNotasCalipsoModal && (
//                 <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />
//             )}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;



















// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import { useAuth } from '../context/AuthContext';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeEmbalajeModal from '../components/PesajeEmbalajeModal';
// import NotasCalipsoModal from '../components/NotasCalipsoModal';
// import ScrapSeriadoModal from '../components/modals/ScrapSeriadoModal';
// import ScrapNoSeriadoModal from '../components/modals/ScrapNoSeriadoModal';

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const formatKg = (num) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     });
// };

// const TOLERANCIA_PORCENTAJE = 0.01;

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
    
//     // Estados para modales
//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showNotasSRP, setShowNotasSRP] = useState(false);
//     const [notasSRP, setNotasSRP] = useState({ calidad: '', otras: '', traccion: '' });

//     // ✅✅ Estados para modales de Scrap
//     const [showScrapSeriadoModal, setShowScrapSeriadoModal] = useState(false);
//     const [showScrapNoSeriadoModal, setShowScrapNoSeriadoModal] = useState(false);

//     // ✅✅ Estados del flujo de CIERRE
//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [supUser, setSupUser] = useState('');
//     const [supPass, setSupPass] = useState('');
//     const [supValidando, setSupValidando] = useState(false);
//     const [cerrando, setCerrando] = useState(false);

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
//                 },
//                 tipoFicha: 'FTD'
//             }
//         });
//     };

//     const handleFichaEmbalajeClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: {
//                     SerieLote: data.header.SerieLote,
//                     Matching: data.header.Matching,
//                     CodigoProducto: data.header.CodProdPedido
//                 },
//                 tipoFicha: 'FE'
//             }
//         });
//     };

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     // ========================================================================
//     // ✅✅ CIERRE DE OPERACIÓN
//     // ========================================================================
//     const ejecutarCierre = async (supervisor) => {
//         setCerrando(true);
//         try {
//             const confirm = await Swal.fire({
//                 title: 'Confirma Operación',
//                 html: 'Se <b>CERRARÁ</b> la operación.<br/>¿CONFIRMA?',
//                 icon: 'question',
//                 showCancelButton: true,
//                 confirmButtonText: 'Sí, cerrar',
//                 cancelButtonText: 'Cancelar',
//                 confirmButtonColor: '#28a745',
//                 cancelButtonColor: '#6c757d'
//             });
//             if (!confirm.isConfirmed) return;

//             Swal.fire({
//                 title: 'Cerrando...',
//                 text: 'Procesando cierre de la operación.',
//                 allowOutsideClick: false,
//                 didOpen: () => Swal.showLoading()
//             });

//             await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, {
//                 usuario: user?.nombre || 'sistema',
//                 supervisor: supervisor || null
//             });

//             Swal.close();
//             await Swal.fire('Éxito', 'Operación cerrada correctamente.', 'success');
//             navigate(-1);
//             setTimeout(() => window.location.reload(), 100);
//         } catch (err) {
//             Swal.close();
//             console.error('Error al cerrar:', err);
//             Swal.fire('Error', err.response?.data?.error || 'No se pudo cerrar la operación.', 'error');
//         } finally {
//             setCerrando(false);
//         }
//     };

//     const handleSupervisorAuth = async () => {
//         const nombre = supUser.trim();
//         if (!nombre || !supPass) {
//             Swal.fire('Atención', 'Ingrese usuario y contraseña de Supervisor.', 'warning');
//             return;
//         }
//         setSupValidando(true);
//         try {
//             const res = await axiosInstance.post('/auth/verify-supervisor', { nombre, password: supPass });
//             if (res.data?.success) {
//                 setShowSupervisorModal(false);
//                 setSupUser('');
//                 setSupPass('');
//                 await ejecutarCierre({ nombre });
//             } else {
//                 Swal.fire('Error', 'Credenciales de Supervisor incorrectas.', 'error');
//             }
//         } catch (err) {
//             Swal.fire('Error', err.response?.data?.message || 'Error de autorización.', 'error');
//         } finally {
//             setSupValidando(false);
//         }
//     };

//     const handleCierre = async () => {
//         if (cerrando) return;

//         const mensajesTolerancia = [];
//         const erroresBruto = [];
//         let faltaBruto = false;

//         (lineas || []).forEach(l => {
//             if (!l.NumeroPedido) return;
//             const prog = parseFloat(l.Programados || 0);
//             const so = parseFloat(l.SobreOrden || 0);
//             const cal = parseFloat(l.Calidad || 0);
//             const bruto = parseFloat(l.Bruto || 0);

//             let tolItem = prog * TOLERANCIA_PORCENTAJE;
//             if (tolItem < 2) tolItem = 2;
//             if ((so + cal) > (prog + tolItem) || (so + cal) < (prog - tolItem)) {
//                 mensajesTolerancia.push(`Fuera Tolerancia en Item ${l.NumeroItem}`);
//             }

//             if (bruto === 0 && so !== 0) faltaBruto = true;
//             if (bruto !== 0 && bruto < so) {
//                 erroresBruto.push(`Item ${l.NumeroItem}: PESO BRUTO no puede ser menor al PESO NETO (Sobre Orden).`);
//             }
//         });

//         if (erroresBruto.length > 0) {
//             return Swal.fire('Advertencia', erroresBruto.join('\n'), 'warning');
//         }

//         if (mensajesTolerancia.length > 0) {
//             await Swal.fire({
//                 title: 'Advertencia',
//                 text: mensajesTolerancia.join('\n'),
//                 icon: 'warning',
//                 confirmButtonText: 'Continuar'
//             });
//         }

//         let validacion = { puedeCerrar: true, necesitaSupervisor: false, mensaje: '' };
//         try {
//             const valRes = await axiosInstance.get(`/registracion/operaciones/validar-cierre/${operacionId}`);
//             validacion = valRes.data || validacion;
//         } catch (err) {
//             return Swal.fire('Error', err.response?.data?.error || 'No se pudo validar el cierre.', 'error');
//         }

//         if (!validacion.puedeCerrar) {
//             return Swal.fire('Advertencia', validacion.mensaje || 'No es posible cerrar la operación.', 'warning');
//         }

//         const pesada = parseFloat(balance.kgsEntrantes || 0);
//         let tolGlobal = pesada * TOLERANCIA_PORCENTAJE;
//         if (tolGlobal < 2) tolGlobal = 2;
//         const saldo = parseFloat(balance.saldo || 0);
//         const saldoFuera = saldo > tolGlobal || saldo < (tolGlobal * -1);

//         if (saldoFuera || faltaBruto) {
//             let msg = '';
//             if (saldoFuera) msg += `El SALDO (${formatKg(saldo)} kgs) DEBE estar dentro de la TOLERANCIA (${formatKg(tolGlobal)} kgs) para efectuar el cierre.\n`;
//             if (faltaBruto) msg += 'Hay items donde falta ingresar PESO BRUTO.';
//             return Swal.fire('Advertencia', msg, 'warning');
//         }

//         if (validacion.necesitaSupervisor) {
//             setShowSupervisorModal(true);
//             return;
//         }

//         await ejecutarCierre(null);
//     };

//     // ✅✅ Función para abrir modal de Scrap Seriado
//     const abrirScrapSeriado = async () => {
//         try {
//             const res = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
//             const codigoMerma = res.data?.CodigoProductoS || '';
            
//             const primeraLinea = lineas.find(l => l.NumeroPedido) || lineas[0] || {};
            
//             setSelectedLinea({
//                 operacionId,
//                 itemPedidoId: primeraLinea.ItemPedido_ID || '',
//                 numeroItem: primeraLinea.NumeroItem || 0,
//                 CodigoProductoS: codigoMerma,
//                 CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//                 SerieLote: header.SerieLote,
//                 Ancho: header.Ancho
//             });
//             setShowScrapSeriadoModal(true);
//         } catch (e) {
//             console.error("Error al obtener código de merma", e);
//             const primeraLinea = lineas.find(l => l.NumeroPedido) || lineas[0] || {};
//             setSelectedLinea({
//                 operacionId,
//                 itemPedidoId: primeraLinea.ItemPedido_ID || '',
//                 numeroItem: primeraLinea.NumeroItem || 0,
//                 CodigoProductoS: '',
//                 CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//                 SerieLote: header.SerieLote,
//                 Ancho: header.Ancho
//             });
//             setShowScrapSeriadoModal(true);
//         }
//     };

//     // ✅✅ Función para abrir modal de Scrap No Seriado
//     const abrirScrapNoSeriado = () => {
//         const primeraLinea = lineas.find(l => l.NumeroPedido) || lineas[0] || {};
//         setSelectedLinea({
//             operacionId,
//             itemPedidoId: primeraLinea.ItemPedido_ID || '',
//             numeroItem: primeraLinea.NumeroItem || 0,
//             CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//             SerieLote: header.SerieLote,
//             Ancho: header.Ancho
//         });
//         setShowScrapNoSeriadoModal(true);
//     };

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

//                         {/* ✅ Renderizar líneas de pedido */}
//                         {lineas.filter(l => l.NumeroPedido).map((linea, idx) => (
//                             <div key={idx} className="production-row-block">
//                                 <div className="row-left-panel">
//                                     <div 
//                                         className="pedido-card-crema" 
//                                         onClick={() => { 
//                                             if (linea.tieneRegistros !== false) {
//                                                 setSelectedLinea({ ...linea, CodigoProducto: header.CodProdPedido || header.CodProdFinal || '' });
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
//                                 </div>
//                             </div>
//                         ))}

//                         {/* ✅✅ FILA DE SCRAP SERIADO */}
//                         <div className="production-row-block">
//                             <div className="row-left-panel">
//                                 <div className="scrap-btn-row">
//                                     <button 
//                                         className="btn-scrap-crema"
//                                         onClick={abrirScrapSeriado}
//                                         style={{ 
//                                             cursor: 'pointer', 
//                                             border: '1px solid #ccc', 
//                                             borderRadius: '4px', 
//                                             background: '#f9f9f9',
//                                             padding: '10px 20px',
//                                             fontWeight: 'bold'
//                                         }}
//                                     >
//                                         Scrap Seriado
//                                     </button>
//                                 </div>
//                             </div>
//                             <div className="row-right-values">
//                                 <div className="values-line">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000', fontWeight: 'bold' }}>
//                                         {formatNumber(balance.scrapSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.atadosScrapSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.rollosScrapSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* ✅✅ FILA DE SCRAP NO SERIADO */}
//                         <div className="production-row-block">
//                             <div className="row-left-panel">
//                                 <div className="scrap-btn-row">
//                                     <button 
//                                         className="btn-scrap-crema"
//                                         onClick={abrirScrapNoSeriado}
//                                         style={{ 
//                                             cursor: 'pointer', 
//                                             border: '1px solid #ccc', 
//                                             borderRadius: '4px', 
//                                             background: '#f9f9f9',
//                                             padding: '10px 20px',
//                                             fontWeight: 'bold'
//                                         }}
//                                     >
//                                         Scrap No Seriado
//                                     </button>
//                                 </div>
//                             </div>
//                             <div className="row-right-values">
//                                 <div className="values-line">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000', fontWeight: 'bold' }}>
//                                         {formatNumber(balance.scrapNoSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.atadosScrapNoSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>
//                                         {formatNumber(balance.rollosScrapNoSeriado || 0)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
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
//                             <span>Scrap</span>
//                             <strong>{formatKg(balance.scrap)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Scrap Seriado</span>
//                             <strong>{formatKg(balance.scrapSeriado || 0)}</strong>
//                         </div>
//                         <div className="bal-col">
//                             <span>Scrap No Seriado</span>
//                             <strong>{formatKg(balance.scrapNoSeriado || 0)}</strong>
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
//                         <button className="side-btn" onClick={handleFichaEmbalajeClick}>Ficha Embalaje</button>
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
//                     <button 
//                         className="side-btn btn-green-cierre" 
//                         disabled={cerrando}
//                         onClick={handleCierre}
//                     >
//                         CIERRE
//                     </button>
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
//                             {notasSRP.calidad && <div className="nota-section"><h3>Calidad</h3><p>{notasSRP.calidad}</p></div>}
//                             {notasSRP.otras && <div className="nota-section"><h3>Otras</h3><p>{notasSRP.otras}</p></div>}
//                             {notasSRP.traccion && <div className="nota-section"><h3>Tracción</h3><p>{notasSRP.traccion}</p></div>}
//                             {!notasSRP.calidad && !notasSRP.otras && !notasSRP.traccion && <p>No hay notas SRP para esta operación.</p>}
//                         </div>
//                         <div className="modal-footer">
//                             <button className="btn-secondary" onClick={() => setShowNotasSRP(false)}>Cerrar</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ✅✅ Modal de Autorización de Supervisor */}
//             {showSupervisorModal && (
//                 <div className="modal-overlay" onClick={() => !supValidando && setShowSupervisorModal(false)}>
//                     <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h2>⚠️ Autorización de Supervisor</h2>
//                             <button className="modal-close" onClick={() => !supValidando && setShowSupervisorModal(false)}>×</button>
//                         </div>
//                         <div className="modal-body">
//                             <p style={{ marginBottom: '15px' }}>
//                                 La operación excede la tolerancia individual permitida.<br/>
//                                 Ingrese credenciales de Supervisor para autorizar el cierre.
//                             </p>
//                             <div style={{ marginBottom: '12px' }}>
//                                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Usuario Supervisor:</label>
//                                 <input 
//                                     type="text" 
//                                     className="form-control" 
//                                     value={supUser} 
//                                     onChange={e => setSupUser(e.target.value)} 
//                                     autoComplete="off"
//                                     autoFocus
//                                 />
//                             </div>
//                             <div style={{ marginBottom: '8px' }}>
//                                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Contraseña:</label>
//                                 <input 
//                                     type="password" 
//                                     className="form-control" 
//                                     value={supPass} 
//                                     onChange={e => setSupPass(e.target.value)} 
//                                     autoComplete="new-password"
//                                     onKeyDown={(e) => e.key === 'Enter' && handleSupervisorAuth()}
//                                 />
//                             </div>
//                         </div>
//                         <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//                             <button className="btn-secondary" disabled={supValidando} onClick={() => setShowSupervisorModal(false)}>Cancelar</button>
//                             <button 
//                                 className="btn-primary" 
//                                 disabled={supValidando}
//                                 style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
//                                 onClick={handleSupervisorAuth}
//                             >
//                                 {supValidando ? 'Validando...' : 'Autorizar y Cerrar'}
//                             </button>
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

//             {/* ✅✅ Modal de Scrap Seriado */}
//             {showScrapSeriadoModal && selectedLinea && (
//                 <ScrapSeriadoModal
//                     operacionId={selectedLinea.operacionId}
//                     itemPedidoId={selectedLinea.itemPedidoId}
//                     numeroItem={selectedLinea.numeroItem}
//                     serieLote={selectedLinea.SerieLote}
//                     onClose={() => {
//                         setShowScrapSeriadoModal(false);
//                         setSelectedLinea(null);
//                     }}
//                     onSuccess={() => {
//                         setShowScrapSeriadoModal(false);
//                         setSelectedLinea(null);
//                         fetchData();
//                     }}
//                 />
//             )}

//             {/* ✅✅ Modal de Scrap No Seriado */}
//             {showScrapNoSeriadoModal && selectedLinea && (
//                 <ScrapNoSeriadoModal
//                     operacionId={selectedLinea.operacionId}
//                     itemPedidoId={selectedLinea.itemPedidoId}
//                     numeroItem={selectedLinea.numeroItem}
//                     onClose={() => {
//                         setShowScrapNoSeriadoModal(false);
//                         setSelectedLinea(null);
//                     }}
//                     onSuccess={() => {
//                         setShowScrapNoSeriadoModal(false);
//                         setSelectedLinea(null);
//                         fetchData();
//                     }}
//                 />
//             )}
            
//             {showNotasCalipsoModal && (
//                 <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />
//             )}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;





















































































// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import { useAuth } from '../context/AuthContext';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeEmbalajeModal from '../components/PesajeEmbalajeModal';
// import NotasCalipsoModal from '../components/NotasCalipsoModal';
// // ✅✅ CAMBIO CLAVE: modales de EMBALAJE (llaman a registrar-scrap-seriado / registrar-scrap-no-seriado)
// import ModalScrapSeriado from '../components/modals/ModalScrapSeriado';
// import ModalScrapNoSeriado from '../components/modals/ModalScrapNoSeriado';

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
// };

// const formatKg = (num) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// };

// const TOLERANCIA_PORCENTAJE = 0.01;

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showNotasSRP, setShowNotasSRP] = useState(false);
//     const [notasSRP, setNotasSRP] = useState({ calidad: '', otras: '', traccion: '' });

//     const [showScrapSeriadoModal, setShowScrapSeriadoModal] = useState(false);
//     const [showScrapNoSeriadoModal, setShowScrapNoSeriadoModal] = useState(false);

//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [supUser, setSupUser] = useState('');
//     const [supPass, setSupPass] = useState('');
//     const [supValidando, setSupValidando] = useState(false);
//     const [cerrando, setCerrando] = useState(false);

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
//         setTimeout(() => { window.location.reload(); }, 100);
//     };

//     const handleFichaTecnicaClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: { SerieLote: data.header.SerieLote, Matching: data.header.Matching, CodigoProducto: data.header.CodProdPedido },
//                 tipoFicha: 'FTD'
//             }
//         });
//     };

//     const handleFichaEmbalajeClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: { SerieLote: data.header.SerieLote, Matching: data.header.Matching, CodigoProducto: data.header.CodProdPedido },
//                 tipoFicha: 'FE'
//             }
//         });
//     };

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     const ejecutarCierre = async (supervisor) => {
//         setCerrando(true);
//         try {
//             const confirm = await Swal.fire({
//                 title: 'Confirma Operación',
//                 html: 'Se <b>CERRARÁ</b> la operación.<br/>¿CONFIRMA?',
//                 icon: 'question',
//                 showCancelButton: true,
//                 confirmButtonText: 'Sí, cerrar',
//                 cancelButtonText: 'Cancelar',
//                 confirmButtonColor: '#28a745',
//                 cancelButtonColor: '#6c757d'
//             });
//             if (!confirm.isConfirmed) { setCerrando(false); return; }

//             Swal.fire({ title: 'Cerrando...', text: 'Procesando cierre de la operación.', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

//             await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, {
//                 usuario: user?.nombre || 'sistema',
//                 supervisor: supervisor || null
//             });

//             Swal.close();
//             await Swal.fire('Éxito', 'Operación cerrada correctamente.', 'success');
//             navigate(-1);
//             setTimeout(() => window.location.reload(), 100);
//         } catch (err) {
//             Swal.close();
//             console.error('Error al cerrar:', err);
//             Swal.fire('Error', err.response?.data?.error || 'No se pudo cerrar la operación.', 'error');
//         } finally {
//             setCerrando(false);
//         }
//     };

//     const handleSupervisorAuth = async () => {
//         const nombre = supUser.trim();
//         if (!nombre || !supPass) {
//             Swal.fire('Atención', 'Ingrese usuario y contraseña de Supervisor.', 'warning');
//             return;
//         }
//         setSupValidando(true);
//         try {
//             const res = await axiosInstance.post('/auth/verify-supervisor', { nombre, password: supPass });
//             if (res.data?.success) {
//                 setShowSupervisorModal(false);
//                 setSupUser(''); setSupPass('');
//                 await ejecutarCierre({ nombre });
//             } else {
//                 Swal.fire('Error', 'Credenciales de Supervisor incorrectas.', 'error');
//             }
//         } catch (err) {
//             Swal.fire('Error', err.response?.data?.message || 'Error de autorización.', 'error');
//         } finally {
//             setSupValidando(false);
//         }
//     };

//     const handleCierre = async () => {
//         if (cerrando) return;

//         const mensajesTolerancia = [];
//         const erroresBruto = [];
//         let faltaBruto = false;

//         (lineas || []).forEach(l => {
//             if (!l.NumeroPedido) return;
//             const prog = parseFloat(l.Programados || 0);
//             const so = parseFloat(l.SobreOrden || 0);
//             const cal = parseFloat(l.Calidad || 0);
//             const bruto = parseFloat(l.Bruto || 0);

//             let tolItem = prog * TOLERANCIA_PORCENTAJE;
//             if (tolItem < 2) tolItem = 2;
//             if ((so + cal) > (prog + tolItem) || (so + cal) < (prog - tolItem)) {
//                 mensajesTolerancia.push(`Fuera Tolerancia en Item ${l.NumeroItem}`);
//             }
//             if (bruto === 0 && so !== 0) faltaBruto = true;
//             if (bruto !== 0 && bruto < so) {
//                 erroresBruto.push(`Item ${l.NumeroItem}: PESO BRUTO no puede ser menor al PESO NETO (Sobre Orden).`);
//             }
//         });

//         if (erroresBruto.length > 0) return Swal.fire('Advertencia', erroresBruto.join('\n'), 'warning');

//         if (mensajesTolerancia.length > 0) {
//             await Swal.fire({ title: 'Advertencia', text: mensajesTolerancia.join('\n'), icon: 'warning', confirmButtonText: 'Continuar' });
//         }

//         let validacion = { puedeCerrar: true, necesitaSupervisor: false, mensaje: '' };
//         try {
//             const valRes = await axiosInstance.get(`/registracion/operaciones/validar-cierre/${operacionId}`);
//             validacion = valRes.data || validacion;
//         } catch (err) {
//             return Swal.fire('Error', err.response?.data?.error || 'No se pudo validar el cierre.', 'error');
//         }

//         if (!validacion.puedeCerrar) return Swal.fire('Advertencia', validacion.mensaje || 'No es posible cerrar la operación.', 'warning');

//         const pesada = parseFloat(balance.kgsEntrantes || 0);
//         let tolGlobal = pesada * TOLERANCIA_PORCENTAJE;
//         if (tolGlobal < 2) tolGlobal = 2;
//         const saldo = parseFloat(balance.saldo || 0);
//         const saldoFuera = saldo > tolGlobal || saldo < (tolGlobal * -1);

//         if (saldoFuera || faltaBruto) {
//             let msg = '';
//             if (saldoFuera) msg += `El SALDO (${formatKg(saldo)} kgs) DEBE estar dentro de la TOLERANCIA (${formatKg(tolGlobal)} kgs) para efectuar el cierre.\n`;
//             if (faltaBruto) msg += 'Hay items donde falta ingresar PESO BRUTO.';
//             return Swal.fire('Advertencia', msg, 'warning');
//         }

//         if (validacion.necesitaSupervisor) { setShowSupervisorModal(true); return; }

//         await ejecutarCierre(null);
//     };

//     const abrirScrapSeriado = async () => {
//         const primeraLinea = lineas.find(l => l.NumeroPedido) || lineas[0] || {};
//         let codigoMerma = '';
//         try {
//             const res = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
//             codigoMerma = res.data?.CodigoProductoS || '';
//         } catch (e) { console.warn('⚠️ codigo merma:', e.message); }

//         setSelectedLinea({
//             operacionId,
//             itemPedidoId: primeraLinea.ItemPedido_ID || '',
//             numeroItem: primeraLinea.NumeroItem || 0,
//             CodigoProductoS: codigoMerma,
//             CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//             SerieLote: header.SerieLote,
//             Ancho: header.Ancho
//         });
//         setShowScrapSeriadoModal(true);
//     };

//     const abrirScrapNoSeriado = () => {
//         const primeraLinea = lineas.find(l => l.NumeroPedido) || lineas[0] || {};
//         setSelectedLinea({
//             operacionId,
//             itemPedidoId: primeraLinea.ItemPedido_ID || '',
//             numeroItem: primeraLinea.NumeroItem || 0,
//             CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//             SerieLote: header.SerieLote,
//             Ancho: header.Ancho
//         });
//         setShowScrapNoSeriadoModal(true);
//     };

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

//                         {lineas.filter(l => l.NumeroPedido).map((linea, idx) => (
//                             <div key={idx} className="production-row-block">
//                                 <div className="row-left-panel">
//                                     <div
//                                         className="pedido-card-crema"
//                                         onClick={() => {
//                                             if (linea.tieneRegistros !== false) {
//                                                 setSelectedLinea({ ...linea, CodigoProducto: header.CodProdPedido || header.CodProdFinal || '' });
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
//                                 </div>
//                             </div>
//                         ))}

//                         {/* ✅ FILA SCRAP SERIADO */}
//                         <div className="production-row-block">
//                             <div className="row-left-panel">
//                                 <div className="scrap-btn-row">
//                                     <button className="btn-scrap-crema" onClick={abrirScrapSeriado}
//                                         style={{ cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: '#f9f9f9', padding: '10px 20px', fontWeight: 'bold' }}>
//                                         Scrap Seriado
//                                     </button>
//                                 </div>
//                             </div>
//                             <div className="row-right-values">
//                                 <div className="values-line">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000', fontWeight: 'bold' }}>{formatNumber(balance.scrapSeriado || 0)}</div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>{formatNumber(balance.atadosScrapSeriado || 0)}</div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>{formatNumber(balance.rollosScrapSeriado || 0)}</div>
//                                     <div className="val-box-crema transparent"></div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* ✅ FILA SCRAP NO SERIADO */}
//                         <div className="production-row-block">
//                             <div className="row-left-panel">
//                                 <div className="scrap-btn-row">
//                                     <button className="btn-scrap-crema" onClick={abrirScrapNoSeriado}
//                                         style={{ cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: '#f9f9f9', padding: '10px 20px', fontWeight: 'bold' }}>
//                                         Scrap No Seriado
//                                     </button>
//                                 </div>
//                             </div>
//                             <div className="row-right-values">
//                                 <div className="values-line">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000', fontWeight: 'bold' }}>{formatNumber(balance.scrapNoSeriado || 0)}</div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>{formatNumber(balance.atadosScrapNoSeriado || 0)}</div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>{formatNumber(balance.rollosScrapNoSeriado || 0)}</div>
//                                     <div className="val-box-crema transparent"></div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <footer className="slitter-balance-footer">
//                         <div className="bal-col"><span>Kgs. Entrantes</span><strong>{formatKg(balance.kgsEntrantes)}</strong></div>
//                         <div className="bal-col"><span>Programados</span><strong>{formatKg(balance.programados)}</strong></div>
//                         <div className="bal-col"><span>Sobre Orden</span><strong>{formatKg(balance.sobreOrden)}</strong></div>
//                         <div className="bal-col"><span>Calidad</span><strong>{formatKg(balance.calidad)}</strong></div>
//                         <div className="bal-col"><span>Scrap</span><strong>{formatKg(balance.scrap)}</strong></div>
//                         <div className="bal-col"><span>Scrap Seriado</span><strong>{formatKg(balance.scrapSeriado || 0)}</strong></div>
//                         <div className="bal-col"><span>Scrap No Seriado</span><strong>{formatKg(balance.scrapNoSeriado || 0)}</strong></div>
//                         <div className="bal-col"><span>Saldo</span><strong className="blue-saldo-text">{formatKg(balance.saldo)}</strong></div>
//                         <div className="bal-col"><span>Bruto</span><strong>{formatKg(balance.bruto)}</strong></div>
//                     </footer>
//                 </main>

//                 <aside className="slitter-sidebar">
//                     <div className="side-btns-group">
//                         <button className="side-btn" onClick={handleNotasSRPClick}>Notas SRP</button>
//                         <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
//                         <button className="side-btn" onClick={handleFichaTecnicaClick}>Ficha Técnica</button>
//                         <button className="side-btn" onClick={handleFichaEmbalajeClick}>Ficha Embalaje</button>
//                         <button className="side-btn" disabled={!header.tieneNotasCalipso} onClick={handleNotasCalipsoClick}>Notas Calipso</button>
//                     </div>

//                     {header.tieneNotasCalipso && (
//                         <div className="side-red-alert-box">Existen Notas en<br/>CALIPSO</div>
//                     )}
//                     <button className="side-btn btn-green-cierre" disabled={cerrando} onClick={handleCierre}>CIERRE</button>
//                 </aside>
//             </div>

//             {showNotasSRP && (
//                 <div className="modal-overlay" onClick={() => setShowNotasSRP(false)}>
//                     <div className="modal-content notas-srp-modal" onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h2>Notas SRP</h2>
//                             <button className="modal-close" onClick={() => setShowNotasSRP(false)}>×</button>
//                         </div>
//                         <div className="modal-body">
//                             {notasSRP.calidad && <div className="nota-section"><h3>Calidad</h3><p>{notasSRP.calidad}</p></div>}
//                             {notasSRP.otras && <div className="nota-section"><h3>Otras</h3><p>{notasSRP.otras}</p></div>}
//                             {notasSRP.traccion && <div className="nota-section"><h3>Tracción</h3><p>{notasSRP.traccion}</p></div>}
//                             {!notasSRP.calidad && !notasSRP.otras && !notasSRP.traccion && <p>No hay notas SRP para esta operación.</p>}
//                         </div>
//                         <div className="modal-footer">
//                             <button className="btn-secondary" onClick={() => setShowNotasSRP(false)}>Cerrar</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showSupervisorModal && (
//                 <div className="modal-overlay" onClick={() => !supValidando && setShowSupervisorModal(false)}>
//                     <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h2>⚠️ Autorización de Supervisor</h2>
//                             <button className="modal-close" onClick={() => !supValidando && setShowSupervisorModal(false)}>×</button>
//                         </div>
//                         <div className="modal-body">
//                             <p style={{ marginBottom: '15px' }}>
//                                 La operación excede la tolerancia individual permitida.<br/>
//                                 Ingrese credenciales de Supervisor para autorizar el cierre.
//                             </p>
//                             <div style={{ marginBottom: '12px' }}>
//                                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Usuario Supervisor:</label>
//                                 <input type="text" className="form-control" value={supUser} onChange={e => setSupUser(e.target.value)} autoComplete="off" autoFocus />
//                             </div>
//                             <div style={{ marginBottom: '8px' }}>
//                                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Contraseña:</label>
//                                 <input type="password" className="form-control" value={supPass} onChange={e => setSupPass(e.target.value)} autoComplete="new-password"
//                                     onKeyDown={(e) => e.key === 'Enter' && handleSupervisorAuth()} />
//                             </div>
//                         </div>
//                         <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//                             <button className="btn-secondary" disabled={supValidando} onClick={() => setShowSupervisorModal(false)}>Cancelar</button>
//                             <button className="btn-primary" disabled={supValidando}
//                                 style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
//                                 onClick={handleSupervisorAuth}>
//                                 {supValidando ? 'Validando...' : 'Autorizar y Cerrar'}
//                             </button>
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

//             {/* ✅✅ MODAL SCRAP SERIADO — EMBALAJE (registrar-scrap-seriado) */}
//             {showScrapSeriadoModal && selectedLinea && (
//                 <ModalScrapSeriado
//                     operacionId={selectedLinea.operacionId}
//                     itemPedidoId={selectedLinea.itemPedidoId}
//                     numeroItem={selectedLinea.numeroItem}
//                     serieLote={selectedLinea.SerieLote}
//                     onClose={() => { setShowScrapSeriadoModal(false); setSelectedLinea(null); }}
//                     onSuccess={() => { setShowScrapSeriadoModal(false); setSelectedLinea(null); fetchData(); }}
//                 />
//             )}

//             {/* ✅✅ MODAL SCRAP NO SERIADO — EMBALAJE (registrar-scrap-no-seriado) */}
//             {showScrapNoSeriadoModal && selectedLinea && (
//                 <ModalScrapNoSeriado
//                     operacionId={selectedLinea.operacionId}
//                     itemPedidoId={selectedLinea.itemPedidoId}
//                     numeroItem={selectedLinea.numeroItem}
//                     onClose={() => { setShowScrapNoSeriadoModal(false); setSelectedLinea(null); }}
//                     onSuccess={() => { setShowScrapNoSeriadoModal(false); setSelectedLinea(null); fetchData(); }}
//                 />
//             )}

//             {showNotasCalipsoModal && (
//                 <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />
//             )}
//         </div>
//     );
// };

// export default EditarOperacionEmbalaje;

























































// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import { useAuth } from '../context/AuthContext';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeEmbalajeModal from '../components/PesajeEmbalajeModal';
// import NotasCalipsoModal from '../components/NotasCalipsoModal';
// // ✅✅ CAMBIO CLAVE: modales de EMBALAJE (llaman a registrar-scrap-seriado / registrar-scrap-no-seriado)
// import ModalScrapSeriado from '../components/modals/ModalScrapSeriado';
// import ModalScrapNoSeriado from '../components/modals/ModalScrapNoSeriado';

// const formatNumber = (num, decimals = 0) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
// };

// const formatKg = (num) => {
//     if (num === null || num === undefined || num === '') return '0';
//     let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// };

// const TOLERANCIA_PORCENTAJE = 0.01;

// const EditarOperacionEmbalaje = () => {
//     const { operacionId } = useParams();
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const [showToleranciasModal, setShowToleranciasModal] = useState(false);
//     const [showPesajeModal, setShowPesajeModal] = useState(false);
//     const [selectedLinea, setSelectedLinea] = useState(null);
//     const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
//     const [notasCalipso, setNotasCalipso] = useState('');
//     const [modalLoading, setModalLoading] = useState(false);
//     const [showNotasSRP, setShowNotasSRP] = useState(false);
//     const [notasSRP, setNotasSRP] = useState({ calidad: '', otras: '', traccion: '' });

//     const [showScrapSeriadoModal, setShowScrapSeriadoModal] = useState(false);
//     const [showScrapNoSeriadoModal, setShowScrapNoSeriadoModal] = useState(false);

//     const [showSupervisorModal, setShowSupervisorModal] = useState(false);
//     const [supUser, setSupUser] = useState('');
//     const [supPass, setSupPass] = useState('');
//     const [supValidando, setSupValidando] = useState(false);
//     const [cerrando, setCerrando] = useState(false);

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
//         setTimeout(() => { window.location.reload(); }, 100);
//     };

//     const handleFichaTecnicaClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: { SerieLote: data.header.SerieLote, Matching: data.header.Matching, CodigoProducto: data.header.CodProdPedido },
//                 tipoFicha: 'FTD'
//             }
//         });
//     };

//     const handleFichaEmbalajeClick = () => {
//         navigate(`/registracion/fichatecnica/${operacionId}`, {
//             state: {
//                 headerData: { SerieLote: data.header.SerieLote, Matching: data.header.Matching, CodigoProducto: data.header.CodProdPedido },
//                 tipoFicha: 'FE'
//             }
//         });
//     };

//     if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

//     const { header, balance, lineas } = data;

//     // ✅✅ TOTALES COMBINADOS DE SCRAP (una sola fila, como el VB)
//     const scrapTotalKg = (balance.scrapSeriado || 0) + (balance.scrapNoSeriado || 0);
//     const scrapTotalAtados = (balance.scrapAtados !== undefined)
//         ? balance.scrapAtados
//         : (balance.atadosScrapSeriado || 0) + (balance.atadosScrapNoSeriado || 0);
//     const scrapTotalRollos = (balance.scrapRollos !== undefined)
//         ? balance.scrapRollos
//         : (balance.rollosScrapSeriado || 0) + (balance.rollosScrapNoSeriado || 0);
//     const scrapTotalBruto = (balance.scrapBruto !== undefined)
//         ? balance.scrapBruto
//         : scrapTotalKg;

//     const ejecutarCierre = async (supervisor) => {
//         setCerrando(true);
//         try {
//             const confirm = await Swal.fire({
//                 title: 'Confirma Operación',
//                 html: 'Se <b>CERRARÁ</b> la operación.<br/>¿CONFIRMA?',
//                 icon: 'question',
//                 showCancelButton: true,
//                 confirmButtonText: 'Sí, cerrar',
//                 cancelButtonText: 'Cancelar',
//                 confirmButtonColor: '#28a745',
//                 cancelButtonColor: '#6c757d'
//             });
//             if (!confirm.isConfirmed) { setCerrando(false); return; }

//             Swal.fire({ title: 'Cerrando...', text: 'Procesando cierre de la operación.', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

//             await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, {
//                 usuario: user?.nombre || 'sistema',
//                 supervisor: supervisor || null
//             });

//             Swal.close();
//             await Swal.fire('Éxito', 'Operación cerrada correctamente.', 'success');
//             navigate(-1);
//             setTimeout(() => window.location.reload(), 100);
//         } catch (err) {
//             Swal.close();
//             console.error('Error al cerrar:', err);
//             Swal.fire('Error', err.response?.data?.error || 'No se pudo cerrar la operación.', 'error');
//         } finally {
//             setCerrando(false);
//         }
//     };

//     const handleSupervisorAuth = async () => {
//         const nombre = supUser.trim();
//         if (!nombre || !supPass) {
//             Swal.fire('Atención', 'Ingrese usuario y contraseña de Supervisor.', 'warning');
//             return;
//         }
//         setSupValidando(true);
//         try {
//             const res = await axiosInstance.post('/auth/verify-supervisor', { nombre, password: supPass });
//             if (res.data?.success) {
//                 setShowSupervisorModal(false);
//                 setSupUser(''); setSupPass('');
//                 await ejecutarCierre({ nombre });
//             } else {
//                 Swal.fire('Error', 'Credenciales de Supervisor incorrectas.', 'error');
//             }
//         } catch (err) {
//             Swal.fire('Error', err.response?.data?.message || 'Error de autorización.', 'error');
//         } finally {
//             setSupValidando(false);
//         }
//     };

//     const handleCierre = async () => {
//         if (cerrando) return;

//         const mensajesTolerancia = [];
//         const erroresBruto = [];
//         let faltaBruto = false;

//         (lineas || []).forEach(l => {
//             if (!l.NumeroPedido) return;
//             const prog = parseFloat(l.Programados || 0);
//             const so = parseFloat(l.SobreOrden || 0);
//             const cal = parseFloat(l.Calidad || 0);
//             const bruto = parseFloat(l.Bruto || 0);

//             let tolItem = prog * TOLERANCIA_PORCENTAJE;
//             if (tolItem < 2) tolItem = 2;
//             if ((so + cal) > (prog + tolItem) || (so + cal) < (prog - tolItem)) {
//                 mensajesTolerancia.push(`Fuera Tolerancia en Item ${l.NumeroItem}`);
//             }
//             if (bruto === 0 && so !== 0) faltaBruto = true;
//             if (bruto !== 0 && bruto < so) {
//                 erroresBruto.push(`Item ${l.NumeroItem}: PESO BRUTO no puede ser menor al PESO NETO (Sobre Orden).`);
//             }
//         });

//         if (erroresBruto.length > 0) return Swal.fire('Advertencia', erroresBruto.join('\n'), 'warning');

//         if (mensajesTolerancia.length > 0) {
//             await Swal.fire({ title: 'Advertencia', text: mensajesTolerancia.join('\n'), icon: 'warning', confirmButtonText: 'Continuar' });
//         }

//         let validacion = { puedeCerrar: true, necesitaSupervisor: false, mensaje: '' };
//         try {
//             const valRes = await axiosInstance.get(`/registracion/operaciones/validar-cierre/${operacionId}`);
//             validacion = valRes.data || validacion;
//         } catch (err) {
//             return Swal.fire('Error', err.response?.data?.error || 'No se pudo validar el cierre.', 'error');
//         }

//         if (!validacion.puedeCerrar) return Swal.fire('Advertencia', validacion.mensaje || 'No es posible cerrar la operación.', 'warning');

//         const pesada = parseFloat(balance.kgsEntrantes || 0);
//         let tolGlobal = pesada * TOLERANCIA_PORCENTAJE;
//         if (tolGlobal < 2) tolGlobal = 2;
//         const saldo = parseFloat(balance.saldo || 0);
//         const saldoFuera = saldo > tolGlobal || saldo < (tolGlobal * -1);

//         if (saldoFuera || faltaBruto) {
//             let msg = '';
//             if (saldoFuera) msg += `El SALDO (${formatKg(saldo)} kgs) DEBE estar dentro de la TOLERANCIA (${formatKg(tolGlobal)} kgs) para efectuar el cierre.\n`;
//             if (faltaBruto) msg += 'Hay items donde falta ingresar PESO BRUTO.';
//             return Swal.fire('Advertencia', msg, 'warning');
//         }

//         if (validacion.necesitaSupervisor) { setShowSupervisorModal(true); return; }

//         await ejecutarCierre(null);
//     };

//     const abrirScrapSeriado = async () => {
//         const primeraLinea = lineas.find(l => l.NumeroPedido) || lineas[0] || {};
//         let codigoMerma = '';
//         try {
//             const res = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
//             codigoMerma = res.data?.CodigoProductoS || '';
//         } catch (e) { console.warn('⚠️ codigo merma:', e.message); }

//         setSelectedLinea({
//             operacionId,
//             itemPedidoId: primeraLinea.ItemPedido_ID || '',
//             numeroItem: primeraLinea.NumeroItem || 0,
//             CodigoProductoS: codigoMerma,
//             CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//             SerieLote: header.SerieLote,
//             Ancho: header.Ancho
//         });
//         setShowScrapSeriadoModal(true);
//     };

//     const abrirScrapNoSeriado = () => {
//         const primeraLinea = lineas.find(l => l.NumeroPedido) || lineas[0] || {};
//         setSelectedLinea({
//             operacionId,
//             itemPedidoId: primeraLinea.ItemPedido_ID || '',
//             numeroItem: primeraLinea.NumeroItem || 0,
//             CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
//             SerieLote: header.SerieLote,
//             Ancho: header.Ancho
//         });
//         setShowScrapNoSeriadoModal(true);
//     };

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

//                         {lineas.filter(l => l.NumeroPedido).map((linea, idx) => (
//                             <div key={idx} className="production-row-block">
//                                 <div className="row-left-panel">
//                                     <div
//                                         className="pedido-card-crema"
//                                         onClick={() => {
//                                             if (linea.tieneRegistros !== false) {
//                                                 setSelectedLinea({ ...linea, CodigoProducto: header.CodProdPedido || header.CodProdFinal || '' });
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
//                                 </div>
//                             </div>
//                         ))}

//                         {/* ✅✅ FILA ÚNICA DE SCRAP (como el VB: dos botones lado a lado, una sola línea de valores) */}
//                         <div className="production-row-block">
//                             <div className="row-left-panel">
//                                 <div className="scrap-btn-row" style={{ display: 'flex', gap: '8px', width: '100%' }}>
//                                     <button
//                                         className="btn-scrap-crema"
//                                         onClick={abrirScrapSeriado}
//                                         style={{ cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: '#f9f9f9', padding: '10px', fontWeight: 'bold', flex: 1 }}
//                                     >
//                                         Scrap Seriado
//                                     </button>
//                                     <button
//                                         className="btn-scrap-crema"
//                                         onClick={abrirScrapNoSeriado}
//                                         style={{ cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: '#f9f9f9', padding: '10px', fontWeight: 'bold', flex: 1 }}
//                                     >
//                                         Scrap No Seriado
//                                     </button>
//                                 </div>
//                             </div>
//                             <div className="row-right-values">
//                                 <div className="values-line">
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000', fontWeight: 'bold' }}>
//                                         {formatNumber(scrapTotalKg)}
//                                     </div>
//                                     <div className="val-box-crema transparent"></div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>{formatNumber(scrapTotalAtados)}</div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>{formatNumber(scrapTotalRollos)}</div>
//                                     <div className="val-box-crema" style={{ color: '#8B0000' }}>{formatNumber(scrapTotalBruto)}</div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <footer className="slitter-balance-footer">
//                         <div className="bal-col"><span>Kgs. Entrantes</span><strong>{formatKg(balance.kgsEntrantes)}</strong></div>
//                         <div className="bal-col"><span>Programados</span><strong>{formatKg(balance.programados)}</strong></div>
//                         <div className="bal-col"><span>Sobre Orden</span><strong>{formatKg(balance.sobreOrden)}</strong></div>
//                         <div className="bal-col"><span>Calidad</span><strong>{formatKg(balance.calidad)}</strong></div>
//                         <div className="bal-col"><span>Scrap</span><strong>{formatKg(balance.scrap)}</strong></div>
//                         <div className="bal-col"><span>Scrap Seriado</span><strong>{formatKg(balance.scrapSeriado || 0)}</strong></div>
//                         <div className="bal-col"><span>Scrap No Seriado</span><strong>{formatKg(balance.scrapNoSeriado || 0)}</strong></div>
//                         <div className="bal-col"><span>Saldo</span><strong className="blue-saldo-text">{formatKg(balance.saldo)}</strong></div>
//                         <div className="bal-col"><span>Bruto</span><strong>{formatKg(balance.bruto)}</strong></div>
//                     </footer>
//                 </main>

//                 <aside className="slitter-sidebar">
//                     <div className="side-btns-group">
//                         <button className="side-btn" onClick={handleNotasSRPClick}>Notas SRP</button>
//                         <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
//                         <button className="side-btn" onClick={handleFichaTecnicaClick}>Ficha Técnica</button>
//                         <button className="side-btn" onClick={handleFichaEmbalajeClick}>Ficha Embalaje</button>
//                         <button className="side-btn" disabled={!header.tieneNotasCalipso} onClick={handleNotasCalipsoClick}>Notas Calipso</button>
//                     </div>

//                     {header.tieneNotasCalipso && (
//                         <div className="side-red-alert-box">Existen Notas en<br/>CALIPSO</div>
//                     )}
//                     <button className="side-btn btn-green-cierre" disabled={cerrando} onClick={handleCierre}>CIERRE</button>
//                 </aside>
//             </div>

//             {showNotasSRP && (
//                 <div className="modal-overlay" onClick={() => setShowNotasSRP(false)}>
//                     <div className="modal-content notas-srp-modal" onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h2>Notas SRP</h2>
//                             <button className="modal-close" onClick={() => setShowNotasSRP(false)}>×</button>
//                         </div>
//                         <div className="modal-body">
//                             {notasSRP.calidad && <div className="nota-section"><h3>Calidad</h3><p>{notasSRP.calidad}</p></div>}
//                             {notasSRP.otras && <div className="nota-section"><h3>Otras</h3><p>{notasSRP.otras}</p></div>}
//                             {notasSRP.traccion && <div className="nota-section"><h3>Tracción</h3><p>{notasSRP.traccion}</p></div>}
//                             {!notasSRP.calidad && !notasSRP.otras && !notasSRP.traccion && <p>No hay notas SRP para esta operación.</p>}
//                         </div>
//                         <div className="modal-footer">
//                             <button className="btn-secondary" onClick={() => setShowNotasSRP(false)}>Cerrar</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showSupervisorModal && (
//                 <div className="modal-overlay" onClick={() => !supValidando && setShowSupervisorModal(false)}>
//                     <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h2>⚠️ Autorización de Supervisor</h2>
//                             <button className="modal-close" onClick={() => !supValidando && setShowSupervisorModal(false)}>×</button>
//                         </div>
//                         <div className="modal-body">
//                             <p style={{ marginBottom: '15px' }}>
//                                 La operación excede la tolerancia individual permitida.<br/>
//                                 Ingrese credenciales de Supervisor para autorizar el cierre.
//                             </p>
//                             <div style={{ marginBottom: '12px' }}>
//                                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Usuario Supervisor:</label>
//                                 <input type="text" className="form-control" value={supUser} onChange={e => setSupUser(e.target.value)} autoComplete="off" autoFocus />
//                             </div>
//                             <div style={{ marginBottom: '8px' }}>
//                                 <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Contraseña:</label>
//                                 <input type="password" className="form-control" value={supPass} onChange={e => setSupPass(e.target.value)} autoComplete="new-password"
//                                     onKeyDown={(e) => e.key === 'Enter' && handleSupervisorAuth()} />
//                             </div>
//                         </div>
//                         <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//                             <button className="btn-secondary" disabled={supValidando} onClick={() => setShowSupervisorModal(false)}>Cancelar</button>
//                             <button className="btn-primary" disabled={supValidando}
//                                 style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
//                                 onClick={handleSupervisorAuth}>
//                                 {supValidando ? 'Validando...' : 'Autorizar y Cerrar'}
//                             </button>
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

//             {/* ✅✅ MODAL SCRAP SERIADO — EMBALAJE (registrar-scrap-seriado) */}
//             {showScrapSeriadoModal && selectedLinea && (
//                 <ModalScrapSeriado
//                     operacionId={selectedLinea.operacionId}
//                     itemPedidoId={selectedLinea.itemPedidoId}
//                     numeroItem={selectedLinea.numeroItem}
//                     serieLote={selectedLinea.SerieLote}
//                     onClose={() => { setShowScrapSeriadoModal(false); setSelectedLinea(null); }}
//                     onSuccess={() => { setShowScrapSeriadoModal(false); setSelectedLinea(null); fetchData(); }}
//                 />
//             )}

//             {/* ✅✅ MODAL SCRAP NO SERIADO — EMBALAJE (registrar-scrap-no-seriado) */}
//             {showScrapNoSeriadoModal && selectedLinea && (
//                 <ModalScrapNoSeriado
//                     operacionId={selectedLinea.operacionId}
//                     itemPedidoId={selectedLinea.itemPedidoId}
//                     numeroItem={selectedLinea.numeroItem}
//                     onClose={() => { setShowScrapNoSeriadoModal(false); setSelectedLinea(null); }}
//                     onSuccess={() => { setShowScrapNoSeriadoModal(false); setSelectedLinea(null); fetchData(); }}
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
import { useAuth } from '../context/AuthContext';
import './EditarOperacionEmbalaje.css';
import ToleranciasModal from '../components/ToleranciasModal';
import PesajeEmbalajeModal from '../components/PesajeEmbalajeModal';
import NotasCalipsoModal from '../components/NotasCalipsoModal';
// ✅✅ CAMBIO CLAVE: modales de EMBALAJE (llaman a registrar-scrap-seriado / registrar-scrap-no-seriado)
import ModalScrapSeriado from '../components/modals/ModalScrapSeriado';
import ModalScrapNoSeriado from '../components/modals/ModalScrapNoSeriado';

const formatNumber = (num, decimals = 0) => {
    if (num === null || num === undefined || num === '') return '0';
    let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
    if (isNaN(number)) return '0';
    return number.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatKg = (num) => {
    if (num === null || num === undefined || num === '') return '0';
    let number = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^\d.-]/g, ''));
    if (isNaN(number)) return '0';
    return number.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const TOLERANCIA_PORCENTAJE = 0.01;

const EditarOperacionEmbalaje = () => {
    const { operacionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showToleranciasModal, setShowToleranciasModal] = useState(false);
    const [showPesajeModal, setShowPesajeModal] = useState(false);
    const [selectedLinea, setSelectedLinea] = useState(null);
    const [showNotasCalipsoModal, setShowNotasCalipsoModal] = useState(false);
    const [notasCalipso, setNotasCalipso] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [showNotasSRP, setShowNotasSRP] = useState(false);
    const [notasSRP, setNotasSRP] = useState({ calidad: '', otras: '', traccion: '' });

    const [showScrapSeriadoModal, setShowScrapSeriadoModal] = useState(false);
    const [showScrapNoSeriadoModal, setShowScrapNoSeriadoModal] = useState(false);

    const [showSupervisorModal, setShowSupervisorModal] = useState(false);
    const [supUser, setSupUser] = useState('');
    const [supPass, setSupPass] = useState('');
    const [supValidando, setSupValidando] = useState(false);
    const [cerrando, setCerrando] = useState(false);

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
        setTimeout(() => { window.location.reload(); }, 100);
    };

    const handleFichaTecnicaClick = () => {
        navigate(`/registracion/fichatecnica/${operacionId}`, {
            state: {
                headerData: { SerieLote: data.header.SerieLote, Matching: data.header.Matching, CodigoProducto: data.header.CodProdPedido },
                tipoFicha: 'FTD'
            }
        });
    };

    const handleFichaEmbalajeClick = () => {
        navigate(`/registracion/fichatecnica/${operacionId}`, {
            state: {
                headerData: { SerieLote: data.header.SerieLote, Matching: data.header.Matching, CodigoProducto: data.header.CodProdPedido },
                tipoFicha: 'FE'
            }
        });
    };

    if (loading || !data) return <div className="loading-screen">Cargando Operación...</div>;

    const { header, balance, lineas } = data;

    // ✅✅ TOTALES COMBINADOS DE SCRAP (una sola fila, como el VB)
    const scrapTotalKg = (balance.scrapSeriado || 0) + (balance.scrapNoSeriado || 0);
    const scrapTotalAtados = (balance.scrapAtados !== undefined)
        ? balance.scrapAtados
        : (balance.atadosScrapSeriado || 0) + (balance.atadosScrapNoSeriado || 0);
    const scrapTotalRollos = (balance.scrapRollos !== undefined)
        ? balance.scrapRollos
        : (balance.rollosScrapSeriado || 0) + (balance.rollosScrapNoSeriado || 0);
    const scrapTotalBruto = (balance.scrapBruto !== undefined)
        ? balance.scrapBruto
        : scrapTotalKg;

    // ✅✅ NUEVO (paridad VB Genero_Linea): si ya hay scrap de un tipo,
    //    se DESHABILITA el botón del otro tipo.
    //    VB: TieneScrap + Inicial.bScrapNoSeriado (RetornaStock == "Z") → VecImagen.Enabled / VecImagen1.Enabled
    const hayScrapNoSeriado = (balance.scrapNoSeriado || 0) > 0;
    const hayScrapSeriado = (balance.scrapSeriado || 0) > 0;

    // ========================================================================
    // ✅✅ CIERRE DE OPERACIÓN
    // ========================================================================
    const ejecutarCierre = async (supervisor) => {
        setCerrando(true);
        try {
            const confirm = await Swal.fire({
                title: 'Confirma Operación',
                html: 'Se <b>CERRARÁ</b> la operación.<br/>¿CONFIRMA?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, cerrar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#6c757d'
            });
            if (!confirm.isConfirmed) { setCerrando(false); return; }

            Swal.fire({ title: 'Cerrando...', text: 'Procesando cierre de la operación.', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            await axiosInstance.post(`/registracion/operaciones/cerrar/${operacionId}`, {
                usuario: user?.nombre || 'sistema',
                supervisor: supervisor || null
            });

            Swal.close();
            await Swal.fire('Éxito', 'Operación cerrada correctamente.', 'success');
            navigate(-1);
            setTimeout(() => window.location.reload(), 100);
        } catch (err) {
            Swal.close();
            console.error('Error al cerrar:', err);
            Swal.fire('Error', err.response?.data?.error || 'No se pudo cerrar la operación.', 'error');
        } finally {
            setCerrando(false);
        }
    };

    const handleSupervisorAuth = async () => {
        const nombre = supUser.trim();
        if (!nombre || !supPass) {
            Swal.fire('Atención', 'Ingrese usuario y contraseña de Supervisor.', 'warning');
            return;
        }
        setSupValidando(true);
        try {
            const res = await axiosInstance.post('/auth/verify-supervisor', { nombre, password: supPass });
            if (res.data?.success) {
                setShowSupervisorModal(false);
                setSupUser(''); setSupPass('');
                await ejecutarCierre({ nombre });
            } else {
                Swal.fire('Error', 'Credenciales de Supervisor incorrectas.', 'error');
            }
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Error de autorización.', 'error');
        } finally {
            setSupValidando(false);
        }
    };

    const handleCierre = async () => {
        if (cerrando) return;

        const mensajesTolerancia = [];
        const erroresBruto = [];
        let faltaBruto = false;

        (lineas || []).forEach(l => {
            if (!l.NumeroPedido) return;
            const prog = parseFloat(l.Programados || 0);
            const so = parseFloat(l.SobreOrden || 0);
            const cal = parseFloat(l.Calidad || 0);
            const bruto = parseFloat(l.Bruto || 0);

            let tolItem = prog * TOLERANCIA_PORCENTAJE;
            if (tolItem < 2) tolItem = 2;
            if ((so + cal) > (prog + tolItem) || (so + cal) < (prog - tolItem)) {
                mensajesTolerancia.push(`Fuera Tolerancia en Item ${l.NumeroItem}`);
            }
            if (bruto === 0 && so !== 0) faltaBruto = true;
            if (bruto !== 0 && bruto < so) {
                erroresBruto.push(`Item ${l.NumeroItem}: PESO BRUTO no puede ser menor al PESO NETO (Sobre Orden).`);
            }
        });

        if (erroresBruto.length > 0) return Swal.fire('Advertencia', erroresBruto.join('\n'), 'warning');

        if (mensajesTolerancia.length > 0) {
            await Swal.fire({ title: 'Advertencia', text: mensajesTolerancia.join('\n'), icon: 'warning', confirmButtonText: 'Continuar' });
        }

        let validacion = { puedeCerrar: true, necesitaSupervisor: false, mensaje: '' };
        try {
            const valRes = await axiosInstance.get(`/registracion/operaciones/validar-cierre/${operacionId}`);
            validacion = valRes.data || validacion;
        } catch (err) {
            return Swal.fire('Error', err.response?.data?.error || 'No se pudo validar el cierre.', 'error');
        }

        if (!validacion.puedeCerrar) return Swal.fire('Advertencia', validacion.mensaje || 'No es posible cerrar la operación.', 'warning');

        const pesada = parseFloat(balance.kgsEntrantes || 0);
        let tolGlobal = pesada * TOLERANCIA_PORCENTAJE;
        if (tolGlobal < 2) tolGlobal = 2;
        const saldo = parseFloat(balance.saldo || 0);
        const saldoFuera = saldo > tolGlobal || saldo < (tolGlobal * -1);

        if (saldoFuera || faltaBruto) {
            let msg = '';
            if (saldoFuera) msg += `El SALDO (${formatKg(saldo)} kgs) DEBE estar dentro de la TOLERANCIA (${formatKg(tolGlobal)} kgs) para efectuar el cierre.\n`;
            if (faltaBruto) msg += 'Hay items donde falta ingresar PESO BRUTO.';
            return Swal.fire('Advertencia', msg, 'warning');
        }

        if (validacion.necesitaSupervisor) { setShowSupervisorModal(true); return; }

        await ejecutarCierre(null);
    };

    // ✅✅ Función para abrir modal de Scrap Seriado
    //    BLOQUEADA si ya hay Scrap No Seriado registrado (paridad VB)
    const abrirScrapSeriado = async () => {
        if (hayScrapNoSeriado) return; // ✅ VB: VecImagen.Enabled = false

        const primeraLinea = lineas.find(l => l.NumeroPedido) || lineas[0] || {};
        let codigoMerma = '';
        try {
            const res = await axiosInstance.get(`/registracion/pesaje/codigo-merma/${operacionId}`);
            codigoMerma = res.data?.CodigoProductoS || '';
        } catch (e) { console.warn('⚠️ codigo merma:', e.message); }

        setSelectedLinea({
            operacionId,
            itemPedidoId: primeraLinea.ItemPedido_ID || '',
            numeroItem: primeraLinea.NumeroItem || 0,
            CodigoProductoS: codigoMerma,
            CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
            SerieLote: header.SerieLote,
            Ancho: header.Ancho
        });
        setShowScrapSeriadoModal(true);
    };

    // ✅✅ Función para abrir modal de Scrap No Seriado
    //    BLOQUEADA si ya hay Scrap Seriado registrado (paridad VB)
    const abrirScrapNoSeriado = () => {
        if (hayScrapSeriado) return; // ✅ VB: VecImagen1.Enabled = false

        const primeraLinea = lineas.find(l => l.NumeroPedido) || lineas[0] || {};
        setSelectedLinea({
            operacionId,
            itemPedidoId: primeraLinea.ItemPedido_ID || '',
            numeroItem: primeraLinea.NumeroItem || 0,
            CodigoProducto: header.CodProdPedido || header.CodProdFinal || '',
            SerieLote: header.SerieLote,
            Ancho: header.Ancho
        });
        setShowScrapNoSeriadoModal(true);
    };

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

                        {/* ✅ Renderizar líneas de pedido */}
                        {lineas.filter(l => l.NumeroPedido).map((linea, idx) => (
                            <div key={idx} className="production-row-block">
                                <div className="row-left-panel">
                                    <div
                                        className="pedido-card-crema"
                                        onClick={() => {
                                            if (linea.tieneRegistros !== false) {
                                                setSelectedLinea({ ...linea, CodigoProducto: header.CodProdPedido || header.CodProdFinal || '' });
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

                        {/* ✅✅ FILA ÚNICA DE SCRAP (como el VB: dos botones lado a lado, una sola línea de valores)
                            ✅✅ NUEVO: botón del tipo opuesto DESHABILITADO cuando ya hay scrap registrado */}
                        <div className="production-row-block">
                            <div className="row-left-panel">
                                <div className="scrap-btn-row" style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                    <button
                                        className="btn-scrap-crema"
                                        onClick={abrirScrapSeriado}
                                        disabled={hayScrapNoSeriado}
                                        title={hayScrapNoSeriado ? 'Ya hay Scrap No Seriado registrado. Use RESET en el modal para poder cargar Seriado.' : ''}
                                        style={{
                                            cursor: hayScrapNoSeriado ? 'not-allowed' : 'pointer',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            background: '#f9f9f9',
                                            padding: '10px',
                                            fontWeight: 'bold',
                                            flex: 1,
                                            opacity: hayScrapNoSeriado ? 0.45 : 1,
                                            color: hayScrapNoSeriado ? '#888' : 'inherit'
                                        }}
                                    >
                                        Scrap Seriado
                                    </button>
                                    <button
                                        className="btn-scrap-crema"
                                        onClick={abrirScrapNoSeriado}
                                        disabled={hayScrapSeriado}
                                        title={hayScrapSeriado ? 'Ya hay Scrap Seriado registrado. Use RESET en el modal para poder cargar No Seriado.' : ''}
                                        style={{
                                            cursor: hayScrapSeriado ? 'not-allowed' : 'pointer',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            background: '#f9f9f9',
                                            padding: '10px',
                                            fontWeight: 'bold',
                                            flex: 1,
                                            opacity: hayScrapSeriado ? 0.45 : 1,
                                            color: hayScrapSeriado ? '#888' : 'inherit'
                                        }}
                                    >
                                        Scrap No Seriado
                                    </button>
                                </div>
                            </div>
                            <div className="row-right-values">
                                <div className="values-line">
                                    <div className="val-box-crema transparent"></div>
                                    <div className="val-box-crema" style={{ color: '#8B0000', fontWeight: 'bold' }}>
                                        {formatNumber(scrapTotalKg)}
                                    </div>
                                    <div className="val-box-crema transparent"></div>
                                    <div className="val-box-crema" style={{ color: '#8B0000' }}>{formatNumber(scrapTotalAtados)}</div>
                                    <div className="val-box-crema" style={{ color: '#8B0000' }}>{formatNumber(scrapTotalRollos)}</div>
                                    <div className="val-box-crema" style={{ color: '#8B0000' }}>{formatNumber(scrapTotalBruto)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="slitter-balance-footer">
                        <div className="bal-col"><span>Kgs. Entrantes</span><strong>{formatKg(balance.kgsEntrantes)}</strong></div>
                        <div className="bal-col"><span>Programados</span><strong>{formatKg(balance.programados)}</strong></div>
                        <div className="bal-col"><span>Sobre Orden</span><strong>{formatKg(balance.sobreOrden)}</strong></div>
                        <div className="bal-col"><span>Calidad</span><strong>{formatKg(balance.calidad)}</strong></div>
                        <div className="bal-col"><span>Scrap</span><strong>{formatKg(balance.scrap)}</strong></div>
                        <div className="bal-col"><span>Scrap Seriado</span><strong>{formatKg(balance.scrapSeriado || 0)}</strong></div>
                        <div className="bal-col"><span>Scrap No Seriado</span><strong>{formatKg(balance.scrapNoSeriado || 0)}</strong></div>
                        <div className="bal-col"><span>Saldo</span><strong className="blue-saldo-text">{formatKg(balance.saldo)}</strong></div>
                        <div className="bal-col"><span>Bruto</span><strong>{formatKg(balance.bruto)}</strong></div>
                    </footer>
                </main>

                <aside className="slitter-sidebar">
                    <div className="side-btns-group">
                        <button className="side-btn" onClick={handleNotasSRPClick}>Notas SRP</button>
                        <button className="side-btn" onClick={() => setShowToleranciasModal(true)}>Tolerancias</button>
                        <button className="side-btn" onClick={handleFichaTecnicaClick}>Ficha Técnica</button>
                        <button className="side-btn" onClick={handleFichaEmbalajeClick}>Ficha Embalaje</button>
                        <button className="side-btn" disabled={!header.tieneNotasCalipso} onClick={handleNotasCalipsoClick}>Notas Calipso</button>
                    </div>

                    {header.tieneNotasCalipso && (
                        <div className="side-red-alert-box">Existen Notas en<br/>CALIPSO</div>
                    )}
                    <button className="side-btn btn-green-cierre" disabled={cerrando} onClick={handleCierre}>CIERRE</button>
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
                            {notasSRP.calidad && <div className="nota-section"><h3>Calidad</h3><p>{notasSRP.calidad}</p></div>}
                            {notasSRP.otras && <div className="nota-section"><h3>Otras</h3><p>{notasSRP.otras}</p></div>}
                            {notasSRP.traccion && <div className="nota-section"><h3>Tracción</h3><p>{notasSRP.traccion}</p></div>}
                            {!notasSRP.calidad && !notasSRP.otras && !notasSRP.traccion && <p>No hay notas SRP para esta operación.</p>}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowNotasSRP(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅✅ Modal de Autorización de Supervisor */}
            {showSupervisorModal && (
                <div className="modal-overlay" onClick={() => !supValidando && setShowSupervisorModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>⚠️ Autorización de Supervisor</h2>
                            <button className="modal-close" onClick={() => !supValidando && setShowSupervisorModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '15px' }}>
                                La operación excede la tolerancia individual permitida.<br/>
                                Ingrese credenciales de Supervisor para autorizar el cierre.
                            </p>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Usuario Supervisor:</label>
                                <input type="text" className="form-control" value={supUser} onChange={e => setSupUser(e.target.value)} autoComplete="off" autoFocus />
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Contraseña:</label>
                                <input type="password" className="form-control" value={supPass} onChange={e => setSupPass(e.target.value)} autoComplete="new-password"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSupervisorAuth()} />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="btn-secondary" disabled={supValidando} onClick={() => setShowSupervisorModal(false)}>Cancelar</button>
                            <button className="btn-primary" disabled={supValidando}
                                style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                                onClick={handleSupervisorAuth}>
                                {supValidando ? 'Validando...' : 'Autorizar y Cerrar'}
                            </button>
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

            {/* ✅✅ Modal de Scrap Seriado — EMBALAJE */}
            {showScrapSeriadoModal && selectedLinea && (
                <ModalScrapSeriado
                    operacionId={selectedLinea.operacionId}
                    itemPedidoId={selectedLinea.itemPedidoId}
                    numeroItem={selectedLinea.numeroItem}
                    serieLote={selectedLinea.SerieLote}
                    onClose={() => { setShowScrapSeriadoModal(false); setSelectedLinea(null); }}
                    onSuccess={() => { setShowScrapSeriadoModal(false); setSelectedLinea(null); fetchData(); }}
                />
            )}

            {/* ✅✅ Modal de Scrap No Seriado — EMBALAJE */}
            {showScrapNoSeriadoModal && selectedLinea && (
                <ModalScrapNoSeriado
                    operacionId={selectedLinea.operacionId}
                    itemPedidoId={selectedLinea.itemPedidoId}
                    numeroItem={selectedLinea.numeroItem}
                    serieLote={selectedLinea.SerieLote}
                    onClose={() => { setShowScrapNoSeriadoModal(false); setSelectedLinea(null); }}
                    onSuccess={() => { setShowScrapNoSeriadoModal(false); setSelectedLinea(null); fetchData(); }}
                />
            )}

            {showNotasCalipsoModal && (
                <NotasCalipsoModal notes={notasCalipso} onClose={() => setShowNotasCalipsoModal(false)} />
            )}
        </div>
    );
};

export default EditarOperacionEmbalaje;
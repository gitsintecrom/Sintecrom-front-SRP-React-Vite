// // src/pages/EditarOperacionEmbalaje.jsx

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './EditarOperacionEmbalaje.css';
// import ToleranciasModal from '../components/ToleranciasModal';
// import PesajeModalSelector from '../components/PesajeModalSelector';
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
//                         <button className="side-btn">Ficha Técnica</button>
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
//                 <PesajeModalSelector lineaData={selectedLinea} operacionId={operacionId} onClose={() => setShowPesajeModal(false)} onSuccess={() => fetchData()} />
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
// import PesajeModalSelector from '../components/PesajeModalSelector';
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
//                         <button className="side-btn">Ficha Técnica</button>
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
//                 <PesajeModalSelector lineaData={selectedLinea} operacionId={operacionId} onClose={() => setShowPesajeModal(false)} onSuccess={() => fetchData()} />
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
import PesajeEmbalajeModal from '../components/PesajeEmbalajeModal'; // ✅ NUEVO COMPONENTE
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

                    {/* ✅ CORREGIDO: Ahora muestra CodProdPedido (del pedido) */}
                    <div className="slitter-middle-bar"><strong>Cod.Prod.Final:</strong> {header.CodProdPedido || 'N/A'}</div>

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
            
            {/* ✅ NUEVO MODAL DE PESAJE PARA EMBALAJE */}
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
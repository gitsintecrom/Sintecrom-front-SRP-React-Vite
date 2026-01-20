// // /src/pages/InspeccionSlitter.jsx -- VERSIÓN FINAL CON FORMULARIO DE PASADA

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './InspeccionSlitter.css';
// import PasadaForm from '../components/PasadaForm'; // <-- 1. Importar el nuevo componente

// const InspeccionSlitter = () => {
//     const { operacionId, loteId } = useParams();
//     const navigate = useNavigate();
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // ===== NUEVOS ESTADOS PARA CONTROLAR EL FORMULARIO DE PASADA =====
//     const [editingPasada, setEditingPasada] = useState(null); // Guarda el número de la pasada a editar

//     // Formateador de números local
//     const formatNumber = (num, decimals = 4) => {
//         const number = parseFloat(num);
//         if (isNaN(number) || number === 0) {
//             return (0).toLocaleString('es-AR', {
//                 minimumFractionDigits: decimals,
//                 maximumFractionDigits: decimals,
//             });
//         }
//         return number.toLocaleString('es-AR', {
//             minimumFractionDigits: decimals,
//             maximumFractionDigits: decimals,
//         });
//     };

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const response = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${loteId}`);
//                 setData(response.data);
//                 console.log(response.data);
                
//             } catch (err) {
//                 Swal.fire('Error', 'No se pudieron cargar los datos de la inspección.', 'error');
//                 navigate(-1);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [operacionId, loteId, navigate]);

//     // ===== NUEVA FUNCIÓN: Se activa al hacer clic en una celda de la tabla =====
//     const handleCellClick = (pasadaNum) => {
//         if (data.pasadasData[pasadaNum]) {
//             setEditingPasada(pasadaNum);
//         } else {
//             // Lógica para crear una nueva pasada si se desea
//             Swal.fire('Aviso', `No hay datos para la pasada ${pasadaNum}. Se debe implementar la creación.`, 'info');
//         }
//     };

//     // ===== NUEVA FUNCIÓN: Se llama al confirmar/salir del formulario =====
//     const handleClosePasadaForm = () => {
//         setEditingPasada(null);
//         // Aquí podrías añadir lógica para guardar los datos y recargar
//     };

//     if (loading || !data) {
//         return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
//     }

//     const { header, conceptos, pasadasData } = data;

//     // Si estamos editando una pasada, mostramos el formulario
//     if (editingPasada) {
//         return (
//             <div className="inspeccion-container">
//                 <PasadaForm 
//                     pasadaNum={editingPasada}
//                     pasadaData={pasadasData[editingPasada]}
//                     onConfirm={handleClosePasadaForm}
//                     onCancel={handleClosePasadaForm}
//                 />
//             </div>
//         );
//     }
    
//     // --- MAPEO DE CLAVES Y DECIMALES PARA LA TABLA ---
//     const rowConfig = [
//         { key: 'identificacionBobina', decimals: null },
//         { key: 'espesorBLM', decimals: 4 },
//         { key: 'espesorC', decimals: 4 },
//         { key: 'espesorBLO', decimals: 4 },
//         { key: 'anchoRealBobina', decimals: 4 },
//         { key: 'aparienciaCaraSuperior', decimals: null },
//         { key: 'aparienciaCaraInferiorIni', decimals: null },
//         { key: 'aparienciaCaraInferior14', decimals: null },
//         { key: 'aparienciaCaraInferior12', decimals: null },
//         { key: 'aparienciaCaraInferior34', decimals: null },
//         { key: 'aparienciaCaraInferiorFin', decimals: null },
//         { key: 'camber', decimals: 4 },
//         { key: 'diametroInterno', decimals: 4 },
//         { key: 'diametroExterno', decimals: 4 },
//         { key: 'desplazamientoEspiras', decimals: 4 }
//     ];

//     const tableRows = conceptos.map((concepto, index) => {
//         const config = rowConfig[index];
//         return (
//             <tr key={index}>
//                 <td>{concepto}</td>
//                 {Array.from({ length: header.cantPasadas }, (_, i) => i + 1).map(numPasada => {
//                     const value = pasadasData[numPasada]?.[config.key];
//                     const formattedValue = config.decimals !== null ? formatNumber(value, config.decimals) : (value || '');
//                     return <td key={numPasada} onClick={() => handleCellClick(numPasada)} style={{cursor: 'pointer'}}>{formattedValue}</td>;
//                 })}
//             </tr>
//         );
//     });

//     for (let i = 0; i < header.cantFlejes; i++) {
//         tableRows.push(
//             <tr key={`ancho-${i}`}>
//                 <td>Ancho de Corte {i + 1}</td>
//                 {Array.from({ length: header.cantPasadas }, (_, idx) => idx + 1).map(numPasada => {
//                     const anchos = pasadasData[numPasada]?.anchosDeCorte || [];
//                     const anchoItem = anchos.find(a => a.item === i + 1);
//                     return <td key={numPasada} onClick={() => handleCellClick(numPasada)} style={{cursor: 'pointer'}}>{formatNumber(anchoItem?.valor, 2)}</td>;
//                 })}
//             </tr>
//         );
//     }

//     console.log(localStorage.getItem('user'));

//     const datosUsurario = JSON.parse(localStorage.getItem('user'));
    
//     return (
//         <div className="inspeccion-container">
//             <div className="inspeccion-header-bar">
//                 <span className="inspeccion-title">REGISTRACION - Producción</span>
//                 <span className="inspeccion-title">INSPECCION SLITTER</span>
//                 <span>Usuario: {datosUsurario.nombre}</span>
//                 <button onClick={() => navigate(-1)} className="btn btn-sm btn-light">
//                     <i className="fas fa-door-open"></i>
//                 </button>
//             </div>

//             <div className="inspeccion-form-container">
//                 <div className="form-grid">
//                     <div className="form-grid-item"><label>Fecha:</label><input type="text" value={header.fecha} readOnly /></div>
//                     <div className="form-grid-item"><label>Serie/Lote:</label><input type="text" value={header.serieLote} readOnly /></div>
//                     <div className="form-grid-item"><label>Orden Producción (Batch):</label><input type="text" value={header.ordenProduccion} readOnly /></div>
//                     <div className="form-grid-item"><label>Rollo Entrante (Cant Bobinas):</label><input type="text" value={header.rolloEntrante} readOnly /></div>
//                     <div className="form-grid-item"><label>Cantidad Pasadas:</label><input type="text" value={header.cantPasadas} readOnly /></div>
//                     <div className="form-grid-item"><label>Cantidad de FLEJES:</label><input type="text" value={header.cantFlejes} readOnly /></div>
//                     <div className="form-grid-item observaciones"><label>Observaciones</label><textarea rows="2" defaultValue={header.observaciones}></textarea></div>
//                     <div className="form-grid-item buttons">
//                         <button className="btn supervisor-btn">SUPERVISOR</button>
//                         <span className="status-label">{header.inicioRevisado ? 'Inicio Revisado' : 'Inicio NO Revisado'}</span>
//                         <span className="status-label">{header.finalRevisado ? 'Final Revisado' : 'Final NO Revisado'}</span>
//                         <button className="btn calidad-btn">Calidad</button>
//                     </div>
//                 </div>
//             </div>

//             <div className="inspeccion-table-container">
//                 <table className="inspeccion-table">
//                     <thead>
//                         <tr>
//                             <th>Concepto</th>
//                             {Array.from({ length: header.cantPasadas }, (_, i) => i + 1).map(num => (
//                                 <th key={num} onClick={() => handleCellClick(num)} style={{cursor: 'pointer'}}>PASADA {num}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {tableRows}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default InspeccionSlitter;





// src/pages/InspeccionSlitter.jsx -- FIX FINAL: Imitando exactamente EditarOperacion

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './InspeccionSlitter.css';
import PasadaForm from '../components/PasadaForm';
import SupervisorAuthModal from '../components/SupervisorAuthModal'; // Funciona bien, como en el ejemplo
import SupervisorReviewModal from '../components/SupervisorReviewModal';
import CalidadReviewModal from '../components/CalidadReviewModal';

const InspeccionSlitter = () => {
    const { operacionId, loteId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estados para pasada
    const [editingPasada, setEditingPasada] = useState(null);

    // Estados para modales (igual que en EditarOperacion)
    const [showSupervisorModal, setShowSupervisorModal] = useState(false); // Modal de auth
    const [authType, setAuthType] = useState(''); // 'Supervisor' o 'Calidad'
    const [showSupervisorReview, setShowSupervisorReview] = useState(false);
    const [showCalidadReview, setShowCalidadReview] = useState(false);
    const [reviewData, setReviewData] = useState(null);

    // Formateador
    const formatNumber = (num, decimals = 4) => {
        const number = parseFloat(num);
        if (isNaN(number) || number === 0) return (0).toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        return number.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${loteId}`);
                setData(response.data);
            } catch (err) {
                Swal.fire('Error', 'No se pudieron cargar los datos de la inspección.', 'error');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [operacionId, loteId, navigate]);

    // ===== FUNCIÓN PARA CARGAR DATOS DE REVISIÓN =====
    const fetchReviewData = async () => {
        try {
            const response = await axiosInstance.get(`/registracion/inspeccion-review-data/${operacionId}/${loteId}`);
            setReviewData(response.data);
        } catch (error) {
            console.error('Error cargando datos de revisión:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos de revisión.', 'error');
        }
    };

    // ===== FUNCIÓN PARA CONFIRMAR AUTENTICACIÓN (exacto a handleToggleSuspension en EditarOperacion) =====
    const handleSupervisorConfirm = async (credentials) => {
        console.log('Confirmando auth:', credentials, 'Tipo:', authType); // Log para debug
        try {
            // POST a endpoint con localAuthErrorHandling: true (igual que en EditarOperacion)
            const response = await axiosInstance.post('/registracion/validate-supervisor', {
                username: credentials.username,
                password: credentials.password,
                actionType: authType // Para backend saber si es Supervisor o Calidad
            }, {
                localAuthErrorHandling: true // CLAVE: Manejo local, no redirección al login
            });

            setShowSupervisorModal(false);
            await Swal.fire('¡Éxito!', response.data.message || 'Credenciales válidas.', 'success');
            await fetchReviewData();
            if (authType === 'Supervisor') {
                setShowSupervisorReview(true);
            } else if (authType === 'Calidad') {
                setShowCalidadReview(true);
            }
        } catch (error) {
            console.error('Error en confirm auth:', error); // Log para debug
            setShowSupervisorModal(false);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                if (error.response.data?.error === 'Credenciales de supervisor incorrectas.' || error.response.data?.error === 'Usuario no encontrado') {
                    Swal.fire('Error de Autenticación', 'Usuario o contraseña incorrectos. Por favor, inténtelo de nuevo.', 'error');
                } else {
                    const errorMessage = error.response?.data?.error || 'No autorizado para realizar esta acción.';
                    Swal.fire('Error de Autorización', errorMessage, 'error');
                }
            } else {
                const errorMessage = error.response?.data?.error || 'No se pudo validar las credenciales debido a un error inesperado.';
                Swal.fire('Error', errorMessage, 'error');
            }
        }
    };

    // ===== FUNCIÓN PARA CONFIRMAR REVISIÓN SUPERVISOR =====
    const handleSupervisorReviewConfirm = async (formData) => {
        try {
            const response = await axiosInstance.post(`/registracion/update-inspeccion-supervisor/${operacionId}/${loteId}`, {
                ...formData,
                origen: 'Supervisor'
            }, {
                localAuthErrorHandling: true
            });
            setShowSupervisorReview(false);
            await Swal.fire('Éxito', 'Revisión confirmada.', 'success');
            const refreshResponse = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${loteId}`);
            setData(refreshResponse.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudo confirmar la revisión.', 'error');
        }
    };

    // ===== FUNCIÓN PARA CONFIRMAR REVISIÓN CALIDAD =====
    const handleCalidadReviewConfirm = async (observacionCalidad) => {
        try {
            const response = await axiosInstance.post(`/registracion/update-inspeccion-calidad/${operacionId}/${loteId}`, {
                observacionCalidad,
                origen: 'Calidad'
            }, {
                localAuthErrorHandling: true
            });
            setShowCalidadReview(false);
            await Swal.fire('Éxito', 'Observación confirmada.', 'success');
            const refreshResponse = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${loteId}`);
            setData(refreshResponse.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudo confirmar la observación.', 'error');
        }
    };

    // ===== FUNCIÓN PARA CLIC EN CELDA DE TABLA =====
    const handleCellClick = (pasadaNum) => {
        if (!data || !data.pasadasData) {
            console.warn('Datos no cargados aún para handleCellClick');
            return;
        }
        if (data.pasadasData[pasadaNum]) {
            setEditingPasada(pasadaNum);
        } else {
            Swal.fire('Aviso', `No hay datos para la pasada ${pasadaNum}.`, 'info');
        }
    };

    // ===== FUNCIÓN PARA CERRAR FORM DE PASADA =====
    const handleClosePasadaForm = async (formData) => {
        setEditingPasada(null);
        if (!formData) {
            Swal.fire('Advertencia', 'No hay datos para guardar.', 'warning');
            return;
        }

        try {
            console.log('Guardando pasada:', formData);
            await axiosInstance.post(`/registracion/inspeccion/save-pasada/${operacionId}/${loteId}/${editingPasada}`, formData);
            Swal.fire('Éxito', 'Pasada guardada correctamente.', 'success');
            // Refetch para actualizar tabla
            const refreshResponse = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${loteId}`);
            setData(refreshResponse.data);
        } catch (error) {
            console.error('Error guardando pasada:', error);
            Swal.fire('Error', 'No se pudo guardar la pasada.', 'error');
        }
    };

    if (loading || !data) {
        return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
    }

    const { header, conceptos, pasadasData } = data;

    if (editingPasada !== null) {
        return (
            <div className="inspeccion-container">
                <PasadaForm 
                    pasadaNum={editingPasada}
                    pasadaData={pasadasData[editingPasada]}
                    onConfirm={handleClosePasadaForm}
                    onCancel={handleClosePasadaForm}
                />
            </div>
        );
    }

    // Mapear tabla (completo)
    const rowConfig = [
        { key: 'identificacionBobina', decimals: null },
        { key: 'espesorBLM', decimals: 4 },
        { key: 'espesorC', decimals: 4 },
        { key: 'espesorBLO', decimals: 4 },
        { key: 'anchoRealBobina', decimals: 4 },
        { key: 'aparienciaCaraSuperior', decimals: null },
        { key: 'aparienciaCaraInferiorIni', decimals: null },
        { key: 'aparienciaCaraInferior14', decimals: null },
        { key: 'aparienciaCaraInferior12', decimals: null },
        { key: 'aparienciaCaraInferior34', decimals: null },
        { key: 'aparienciaCaraInferiorFin', decimals: null },
        { key: 'camber', decimals: 4 },
        { key: 'diametroInterno', decimals: 4 },
        { key: 'diametroExterno', decimals: 4 },
        { key: 'desplazamientoEspiras', decimals: 4 }
    ];

    const tableRows = conceptos.map((concepto, index) => {
        const config = rowConfig[index];
        return (
            <tr key={index}>
                <td>{concepto}</td>
                {Array.from({ length: header.cantPasadas }, (_, i) => i + 1).map(numPasada => {
                    const value = pasadasData[numPasada]?.[config.key];
                    const formattedValue = config.decimals !== null ? formatNumber(value, config.decimals) : (value || '');
                    return <td key={numPasada} onClick={() => handleCellClick(numPasada)} style={{cursor: 'pointer'}}>{formattedValue}</td>;
                })}
            </tr>
        );
    });

    for (let i = 0; i < header.cantFlejes; i++) {
        tableRows.push(
            <tr key={`ancho-${i}`}>
                <td>Ancho de Corte {i + 1}</td>
                {Array.from({ length: header.cantPasadas }, (_, idx) => idx + 1).map(numPasada => {
                    const anchos = pasadasData[numPasada]?.anchosDeCorte || [];
                    const anchoItem = anchos.find(a => a.item === i + 1);
                    return <td key={numPasada} onClick={() => handleCellClick(numPasada)} style={{cursor: 'pointer'}}>{formatNumber(anchoItem?.valor, 2)}</td>;
                })}
            </tr>
        );
    }

    const datosUsurario = JSON.parse(localStorage.getItem('user'));
    
    return (
        <div className="inspeccion-container">
            <div className="inspeccion-header-bar">
                <span className="inspeccion-title">REGISTRACION - Producción</span>
                <span className="inspeccion-title">INSPECCION SLITTER</span>
                <span>Usuario: {datosUsurario.nombre}</span>
                <button onClick={() => navigate(-1)} className="btn btn-sm btn-light">
                    <i className="fas fa-door-open"></i>
                </button>
            </div>

            <div className="inspeccion-form-container">
                <div className="form-grid">
                    <div className="form-grid-item"><label>Fecha:</label><input type="text" value={header.fecha} readOnly /></div>
                    <div className="form-grid-item"><label>Serie/Lote:</label><input type="text" value={header.serieLote} readOnly /></div>
                    <div className="form-grid-item"><label>Orden Producción (Batch):</label><input type="text" value={header.ordenProduccion} readOnly /></div>
                    <div className="form-grid-item"><label>Rollo Entrante (Cant Bobinas):</label><input type="text" value={header.rolloEntrante} readOnly /></div>
                    <div className="form-grid-item"><label>Cantidad Pasadas:</label><input type="text" value={header.cantPasadas} readOnly /></div>
                    <div className="form-grid-item"><label>Cantidad de FLEJES:</label><input type="text" value={header.cantFlejes} readOnly /></div>
                    <div className="form-grid-item observaciones"><label>Observaciones</label><textarea rows="2" defaultValue={header.observaciones}></textarea></div>
                    <div className="form-grid-item buttons">
                        <button className="btn supervisor-btn" onClick={() => { setAuthType('Supervisor'); setShowSupervisorModal(true); }}>SUPERVISOR</button>
                        <span className="status-label">{header.inicioRevisado ? 'Inicio Revisado' : 'Inicio NO Revisado'}</span>
                        <span className="status-label">{header.finalRevisado ? 'Final Revisado' : 'Final NO Revisado'}</span>
                        <button className="btn calidad-btn" onClick={() => { setAuthType('Calidad'); setShowSupervisorModal(true); }}>Calidad</button>
                    </div>
                </div>
            </div>

            <div className="inspeccion-table-container">
                <table className="inspeccion-table">
                    <thead>
                        <tr>
                            <th>Concepto</th>
                            {Array.from({ length: header.cantPasadas }, (_, i) => i + 1).map(num => (
                                <th key={num} onClick={() => handleCellClick(num)} style={{cursor: 'pointer'}}>PASADA {num}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div>

            {/* Modales */}
            {showSupervisorModal && (
                <SupervisorAuthModal
                    title={authType === 'Supervisor' ? 'Revisión SUPERVISOR' : 'Revisión CALIDAD'}
                    message={`Ingrese credenciales para ${authType.toLowerCase()}.`}
                    onClose={() => setShowSupervisorModal(false)}
                    onConfirm={handleSupervisorConfirm}
                />
            )}

            {showSupervisorReview && reviewData && (
                <SupervisorReviewModal
                    data={reviewData}
                    pasadasData={data.pasadasData} // Datos de pasadas para validación
                    header={data.header} // CantPasadas para validación final
                    onConfirm={handleSupervisorReviewConfirm}
                    onCancel={() => setShowSupervisorReview(false)}
                    onForceFinal={() => {
                        Swal.fire('Forzar Final', 'Función de forzar inspección activada.', 'info');
                    }}
                />
            )}

            {showCalidadReview && reviewData && (
                <CalidadReviewModal
                    data={reviewData}
                    onConfirm={handleCalidadReviewConfirm}
                    onCancel={() => setShowCalidadReview(false)}
                />
            )}
        </div>
    );
};

export default InspeccionSlitter;
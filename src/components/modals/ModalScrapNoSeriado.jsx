// ModalScrapNoSeriado.jsx
// import React, { useState } from 'react';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import AtadosList from './AtadosList';

// const ModalScrapNoSeriado = ({ operacionId, itemPedidoId, numeroItem, onClose, onSuccess }) => {
//     const [atados, setAtados] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const handleGuardar = async () => {
//         if (atados.length === 0) {
//             Swal.fire('Atención', 'Debe ingresar al menos un atado.', 'warning');
//             return;
//         }

//         setLoading(true);
//         try {
//             await axiosInstance.post('/registracion/pesaje/registrar-scrap-no-seriado', {
//                 operacionId,
//                 itemPedidoId,
//                 numeroItem,
//                 atados,
//                 usuario: localStorage.getItem('user') || 'sistema'
//             });

//             await Swal.fire('Éxito', 'Scrap No Seriado registrado correctamente.', 'success');
//             if (onSuccess) onSuccess();
//             onClose();
//         } catch (error) {
//             console.error('Error al registrar scrap no seriado:', error);
//             Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar el scrap no seriado.', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="modal-overlay" onClick={onClose}>
//             <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
//                 <div className="modal-header">
//                     <h2>📦 Scrap No Seriado</h2>
//                     <button className="modal-close" onClick={onClose}>×</button>
//                 </div>
                
//                 <div className="modal-body">
//                     <div className="alert alert-info" style={{ 
//                         backgroundColor: '#e3f2fd', 
//                         border: '1px solid #2196f3', 
//                         borderRadius: '4px', 
//                         padding: '12px',
//                         marginBottom: '20px'
//                     }}>
//                         <strong>Información:</strong><br/>
//                         El Scrap No Seriado no requiere ID de Lote específico.<br/>
//                         Se utilizará automáticamente el GUID: <code>EBCEC003-0D54-49C7-9423-7E41B3D11AE7</code>
//                     </div>

//                     <AtadosList 
//                         atados={atados} 
//                         setAtados={setAtados} 
//                         operacionId={operacionId}
//                         itemPedidoId={itemPedidoId}
//                         numeroItem={numeroItem}
//                         esScrap={true}
//                         esScrapNoSeriado={true}
//                     />
//                 </div>

//                 <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//                     <button 
//                         className="btn btn-secondary" 
//                         onClick={onClose}
//                         disabled={loading}
//                     >
//                         Cancelar
//                     </button>
//                     <button 
//                         className="btn btn-primary" 
//                         onClick={handleGuardar}
//                         disabled={loading || atados.length === 0}
//                         style={{ 
//                             backgroundColor: '#1976d2', 
//                             color: 'white',
//                             padding: '10px 20px',
//                             border: 'none',
//                             borderRadius: '4px',
//                             cursor: loading ? 'not-allowed' : 'pointer'
//                         }}
//                     >
//                         {loading ? 'Guardando...' : 'Guardar Scrap No Seriado'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ModalScrapNoSeriado;

































// // src/components/modals/ModalScrapNoSeriado.jsx
// import React, { useState } from 'react';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import AtadosList from './AtadosList';

// const ModalScrapNoSeriado = ({ operacionId, itemPedidoId, numeroItem, onClose, onSuccess }) => {
//     const [atados, setAtados] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const handleGuardar = async () => {
//         if (atados.length === 0) {
//             Swal.fire('Atención', 'Debe ingresar al menos un atado.', 'warning');
//             return;
//         }

//         setLoading(true);
//         try {
//             await axiosInstance.post('/registracion/pesaje/registrar-scrap-no-seriado', {
//                 operacionId,
//                 itemPedidoId,
//                 numeroItem,
//                 atados,
//                 usuario: localStorage.getItem('user') || 'sistema'
//             });

//             await Swal.fire('Éxito', 'Scrap No Seriado registrado correctamente.', 'success');
//             if (onSuccess) onSuccess();
//         } catch (error) {
//             console.error('Error al registrar scrap no seriado:', error);
//             Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar el scrap no seriado.', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="modal-overlay" onClick={onClose}>
//             <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
//                 <div className="modal-header">
//                     <h2>📦 Scrap No Seriado</h2>
//                     <button className="modal-close" onClick={onClose}>×</button>
//                 </div>
                
//                 <div className="modal-body">
//                     <div className="alert alert-info" style={{ backgroundColor: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '4px', padding: '12px', marginBottom: '20px' }}>
//                         <strong>Información:</strong><br/>
//                         El Scrap No Seriado no requiere ID de Lote específico.<br/>
//                         Se utilizará automáticamente el GUID: <code>EBCEC003-0D54-49C7-9423-7E41B3D11AE7</code>
//                     </div>

//                     <AtadosList 
//                         atados={atados} 
//                         setAtados={setAtados} 
//                         operacionId={operacionId}
//                         itemPedidoId={itemPedidoId}
//                         numeroItem={numeroItem}
//                         esScrap={true}
//                         esScrapNoSeriado={true}
//                     />
//                 </div>

//                 <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//                     <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
//                     <button 
//                         className="btn btn-primary" 
//                         onClick={handleGuardar}
//                         disabled={loading || atados.length === 0}
//                         style={{ backgroundColor: '#1976d2', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
//                     >
//                         {loading ? 'Guardando...' : 'Guardar Scrap No Seriado'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ModalScrapNoSeriado;

















































// // src/components/modals/ModalScrapNoSeriado.jsx
// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';
// import '../PesajeModal.css';

// const SCRAP_GUID = 'EBCEC003-0D54-49C7-9423-7E41B3D11AE7';

// const ModalScrapNoSeriado = ({ operacionId, itemPedidoId, numeroItem, serieLote, lineaData, onClose, onSuccess }) => {
//     const [peso, setPeso] = useState(0);
//     const [isManualEdit, setIsManualEdit] = useState(false);
//     const [atados, setAtados] = useState([]);
//     const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
//     const [cargando, setCargando] = useState(true);
//     const [loading, setLoading] = useState(false);

//     // ✅ Carga registro existente (si ya había scrap no seriado guardado)
//     useEffect(() => {
//         const cargarExistente = async () => {
//             try {
//                 const res = await axiosInstance.post('/registracion/pesaje/obtener-registro-scrap-no-seriado', { operacionId });
//                 const reg = Array.isArray(res.data) ? res.data[0] : res.data;
//                 if (reg && reg.ID) {
//                     const kilos = parseFloat(reg.Kilos_Sobreorden) || 0;
//                     setAtados([{ atado: 1, rollos: parseInt(reg.Rollos) || 1, peso: kilos, esCalidad: false, nroEtiqueta: '', isLatest: false }]);
//                     setSobreOrdenTotal(kilos);
//                 }
//             } catch (e) { /* 404 = sin registro previo, normal */ }
//             finally { setCargando(false); }
//         };
//         cargarExistente();
//     }, [operacionId]);

//     // ✅ Polling de balanza (igual que Slitter)
//     useEffect(() => {
//         const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
//         const interval = setInterval(async () => {
//             if (isManualEdit) return;
//             try {
//                 const res = await axiosInstance.get(`${agenteUrl}/peso`);
//                 setPeso(parseFloat(res.data?.peso) || 0);
//             } catch { /* balanza offline */ }
//         }, 1200);
//         return () => clearInterval(interval);
//     }, [isManualEdit]);

//     const handleAgregarScrap = () => {
//         if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese un peso válido.', 'warning');
//         setAtados(prev => [...prev.map(a => ({ ...a, isLatest: false })), { atado: prev.length + 1, rollos: 1, peso, esCalidad: false, nroEtiqueta: '', isLatest: true }]);
//         setSobreOrdenTotal(prev => prev + peso);
//         setPeso(0);
//     };

//     const handleEliminar = (index) => {
//         const a = atados[index];
//         if (!a.isLatest) return Swal.fire('Advertencia', 'Solo se puede eliminar el último.', 'warning');
//         setSobreOrdenTotal(prev => prev - a.peso);
//         setAtados(prev => prev.filter((_, i) => i !== index));
//     };

//     const handleReset = async () => {
//         const confirm = await Swal.fire({ title: '¿Borrar todo?', text: 'Se eliminará el scrap no seriado registrado.', icon: 'warning', showCancelButton: true });
//         if (!confirm.isConfirmed) return;
//         try {
//             await axiosInstance.post('/registracion/pesaje/resetear-paquetes-emabalaje', {
//                 operacionId, itemPedidoId, sobrante: 2, idLotePlancha: SCRAP_GUID
//             });
//             setAtados([]); setSobreOrdenTotal(0); setPeso(0);
//             Swal.fire('Éxito', 'Reset completado.', 'success');
//             if (onSuccess) onSuccess();
//             onClose();
//         } catch (e) {
//             Swal.fire('Error', 'No se pudo resetear.', 'error');
//         }
//     };

//     const handleGuardar = async () => {
//         if (atados.length === 0 || sobreOrdenTotal <= 0) {
//             return Swal.fire('Advertencia', 'Debe ingresar al menos un peso.', 'warning');
//         }
//         setLoading(true);
//         try {
//             let userName = 'sistema';
//             try { userName = JSON.parse(localStorage.getItem('user'))?.nombre || 'sistema'; } catch (e) {}
//             await axiosInstance.post('/registracion/pesaje/registrar-scrap-no-seriado', {
//                 operacionId,
//                 itemPedidoId,
//                 numeroItem,
//                 atados: atados.map(a => ({ atado: a.atado, rollos: a.rollos, peso: a.peso, esCalidad: false, nroEtiqueta: a.nroEtiqueta || '' })),
//                 usuario: userName
//             });
//             Swal.fire('Éxito', 'Scrap No Seriado registrado correctamente.', 'success');
//             if (onSuccess) onSuccess();
//             onClose();
//         } catch (error) {
//             console.error('Error al registrar scrap no seriado:', error);
//             Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar el scrap no seriado.', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="pesaje-modal-overlay">
//             <div className="pesaje-modal">
//                 <div className="modal-header">
//                     <h3>Scrap No Seriado</h3>
//                     <button onClick={onClose}>&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="info-panel">
//                         <div>Serie-Lote: {serieLote || lineaData?.SerieLote || 'N/A'}</div>
//                         <div>GUID fijo: EBCEC003-0D54-49C7-9423-7E41B3D11AE7</div>
//                     </div>

//                     <div className="pesaje-section">
//                         <label>Peso Balanza:</label>
//                         <input
//                             type="number"
//                             step="1"
//                             pattern="\d*"
//                             value={peso}
//                             onChange={(e) => { const v = parseInt(e.target.value) || 0; setPeso(v >= 0 ? v : 0); setIsManualEdit(true); }}
//                             onFocus={() => setIsManualEdit(true)}
//                             onBlur={() => setIsManualEdit(false)}
//                             className="peso-input"
//                         />
//                     </div>

//                     <div className="totales">
//                         <div>Kg. Scrap: {sobreOrdenTotal.toFixed(2)}</div>
//                     </div>

//                     <div className="atados-section">
//                         <button onClick={handleAgregarScrap} className="btn-so">Agregar Scrap</button>
//                     </div>

//                     <div className="grilla-atados">
//                         <h4>Pesajes Registrados</h4>
//                         {cargando ? <div>Cargando...</div> : (
//                             <table>
//                                 <thead>
//                                     <tr><th>Items</th><th>Peso</th><th></th></tr>
//                                 </thead>
//                                 <tbody>
//                                     {atados.length > 0 ? atados.map((a, i) => (
//                                         <tr key={i}>
//                                             <td>{a.rollos}</td>
//                                             <td>{a.peso.toFixed(2)} Kg</td>
//                                             <td style={{ textAlign: 'center' }}>
//                                                 {a.isLatest && <button onClick={() => handleEliminar(i)} className="btn-eliminar">🗑️</button>}
//                                             </td>
//                                         </tr>
//                                     )) : (
//                                         <tr><td colSpan="3" style={{ textAlign: 'center' }}>No hay pesajes</td></tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         )}
//                     </div>
//                 </div>
//                 <div className="modal-footer">
//                     <button onClick={handleReset} className="btn-reset">RESET</button>
//                     <button onClick={handleGuardar} className="btn-registrar" disabled={loading}>
//                         {loading ? 'GUARDANDO...' : 'REGISTRAR SCRAP'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ModalScrapNoSeriado;

































// src/components/modals/ModalScrapNoSeriado.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import '../PesajeModal.css';

const SCRAP_GUID = 'EBCEC003-0D54-49C7-9423-7E41B3D11AE7';

const ModalScrapNoSeriado = ({ operacionId, itemPedidoId, numeroItem, serieLote, lineaData, onClose, onSuccess }) => {
    const [peso, setPeso] = useState(0);
    const [isManualEdit, setIsManualEdit] = useState(false);
    const [atados, setAtados] = useState([]);
    const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [loading, setLoading] = useState(false);

    // ✅✅ Carga lo YA REGISTRADO desde las tablas de EMBALAJE (endpoint nuevo)
    useEffect(() => {
        const cargarExistente = async () => {
            try {
                const res = await axiosInstance.post('/registracion/pesaje/obtener-scrap-embalaje', { operacionId });
                const lista = res.data?.atadosNoSeriado || [];
                if (lista.length > 0) {
                    const mapped = lista.map((a, i) => ({ ...a, isLatest: i === lista.length - 1 }));
                    setAtados(mapped);
                    setSobreOrdenTotal(mapped.reduce((s, a) => s + a.peso, 0));
                }
            } catch (e) { console.warn('⚠️ sin scrap no seriado previo:', e.message); }
            finally { setCargando(false); }
        };
        cargarExistente();
    }, [operacionId]);

    // ✅ Polling de balanza
    useEffect(() => {
        const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
        const interval = setInterval(async () => {
            if (isManualEdit) return;
            try {
                const res = await axiosInstance.get(`${agenteUrl}/peso`);
                setPeso(parseFloat(res.data?.peso) || 0);
            } catch { /* balanza offline */ }
        }, 1200);
        return () => clearInterval(interval);
    }, [isManualEdit]);

    const handleAgregarScrap = () => {
        if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese un peso válido.', 'warning');
        setAtados(prev => [...prev.map(a => ({ ...a, isLatest: false })), { atado: prev.length + 1, rollos: 1, peso, esCalidad: false, nroEtiqueta: '', isLatest: true }]);
        setSobreOrdenTotal(prev => prev + peso);
        setPeso(0);
    };

    const handleEliminar = (index) => {
        const a = atados[index];
        if (!a.isLatest) return Swal.fire('Advertencia', 'Solo se puede eliminar el último.', 'warning');
        setSobreOrdenTotal(prev => prev - a.peso);
        setAtados(prev => prev.filter((_, i) => i !== index));
    };

    const handleReset = async () => {
        const confirm = await Swal.fire({ title: '¿Borrar todo?', text: 'Se eliminará el scrap no seriado registrado.', icon: 'warning', showCancelButton: true });
        if (!confirm.isConfirmed) return;
        try {
            await axiosInstance.post('/registracion/pesaje/resetear-paquetes-emabalaje', {
                operacionId, itemPedidoId, sobrante: 2, idLotePlancha: SCRAP_GUID
            });
            setAtados([]); setSobreOrdenTotal(0); setPeso(0);
            Swal.fire('Éxito', 'Reset completado.', 'success');
            if (onSuccess) onSuccess();
            onClose();
        } catch (e) {
            Swal.fire('Error', 'No se pudo resetear.', 'error');
        }
    };

    const handleGuardar = async () => {
        if (atados.length === 0 || sobreOrdenTotal <= 0) {
            return Swal.fire('Advertencia', 'Debe ingresar al menos un peso.', 'warning');
        }
        setLoading(true);
        try {
            let userName = 'sistema';
            try { userName = JSON.parse(localStorage.getItem('user'))?.nombre || 'sistema'; } catch (e) {}
            await axiosInstance.post('/registracion/pesaje/registrar-scrap-no-seriado', {
                operacionId,
                itemPedidoId,
                numeroItem,
                atados: atados.map(a => ({ atado: a.atado, rollos: a.rollos, peso: a.peso, esCalidad: false, nroEtiqueta: a.nroEtiqueta || '' })),
                usuario: userName
            });
            Swal.fire('Éxito', 'Scrap No Seriado registrado correctamente.', 'success');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error al registrar scrap no seriado:', error);
            Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar el scrap no seriado.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pesaje-modal-overlay">
            <div className="pesaje-modal">
                <div className="modal-header">
                    <h3>Scrap No Seriado</h3>
                    <button onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="info-panel">
                        <div>Serie-Lote: {serieLote || lineaData?.SerieLote || 'N/A'}</div>
                        <div>GUID fijo: EBCEC003-0D54-49C7-9423-7E41B3D11AE7</div>
                    </div>

                    <div className="pesaje-section">
                        <label>Peso Balanza:</label>
                        <input
                            type="number" step="1" pattern="\d*" value={peso}
                            onChange={(e) => { const v = parseInt(e.target.value) || 0; setPeso(v >= 0 ? v : 0); setIsManualEdit(true); }}
                            onFocus={() => setIsManualEdit(true)}
                            onBlur={() => setIsManualEdit(false)}
                            className="peso-input"
                        />
                    </div>

                    <div className="totales">
                        <div>Kg. Scrap: {sobreOrdenTotal.toFixed(2)}</div>
                    </div>

                    <div className="atados-section">
                        <button onClick={handleAgregarScrap} className="btn-so">Agregar Scrap</button>
                    </div>

                    <div className="grilla-atados">
                        <h4>Pesajes Registrados</h4>
                        {cargando ? <div>Cargando...</div> : (
                            <table>
                                <thead><tr><th>Items</th><th>Peso</th><th></th></tr></thead>
                                <tbody>
                                    {atados.length > 0 ? atados.map((a, i) => (
                                        <tr key={i}>
                                            <td>{a.rollos}</td>
                                            <td>{a.peso.toFixed(2)} Kg</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {a.isLatest && <button onClick={() => handleEliminar(i)} className="btn-eliminar">🗑️</button>}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" style={{ textAlign: 'center' }}>No hay pesajes</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleReset} className="btn-reset">RESET</button>
                    <button onClick={handleGuardar} className="btn-registrar" disabled={loading}>
                        {loading ? 'GUARDANDO...' : 'REGISTRAR SCRAP'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalScrapNoSeriado;
// src/pages/InspeccionSlitter.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './InspeccionSlitter.css';
import PasadaForm from '../components/PasadaForm';
import SupervisorAuthModal from '../components/SupervisorAuthModal';
import SupervisorReviewModal from '../components/SupervisorReviewModal';
import CalidadReviewModal from '../components/CalidadReviewModal';

const InspeccionSlitter = () => {
    const { operacionId, loteId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const user = JSON.parse(localStorage.getItem('user'));

    const [data, setData] = useState(null);
    const [originalHeader, setOriginalHeader] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [editingPasada, setEditingPasada] = useState(null);
    
    // Estado para el número de máquina
    const [maquinaNumero, setMaquinaNumero] = useState(location.state?.maquinaNumero || "");

    // Estados para modales
    const [showSupervisorModal, setShowSupervisorModal] = useState(false);
    const [authType, setAuthType] = useState(''); 
    const [showSupervisorReview, setShowSupervisorReview] = useState(false);
    const [showCalidadReview, setShowCalidadReview] = useState(false);
    const [reviewData, setReviewData] = useState(null);

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
                setOriginalHeader({ ...response.data.header }); 

                if (!maquinaNumero) {
                    const mId = response.data.header?.maquina;
                    const match = mId?.match(/(\d+)/);
                    if (match) setMaquinaNumero(match[0]);
                }
            } catch (err) {
                Swal.fire('Error', 'No se pudieron cargar los datos.', 'error');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [operacionId, loteId, navigate]);

    // --- MANEJADOR DE CAMBIOS CON ALERTA RESTAURADA ---
    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        let val = name === 'observaciones' ? value : (parseInt(value) || 0);

        if (name === 'cantPasadas') {
            val = Math.max(1, val); // Mínimo 1
            
            if (val > 15) {
                val = 15; // Límite máximo absoluto
            } else if (val > 5) {
                // RESTAURADA: Alerta del software original
                Swal.fire({
                    title: 'Advertencia',
                    text: 'Cantidad de Pasadas a registrar, sólo 5',
                    icon: 'warning',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#3085d6',
                });
            }
        }

        setData(prev => ({
            ...prev,
            header: { ...prev.header, [name]: val }
        }));
    };

    const handleSaveOnly = async () => {
        const h = data.header;
        const oh = originalHeader;
        const huboCambios = h.rolloEntrante !== oh.rolloEntrante || h.cantPasadas !== oh.cantPasadas || h.cantFlejes !== oh.cantFlejes || h.observaciones !== oh.observaciones;

        if (!huboCambios) {
            Swal.fire('Info', 'No hay cambios para subir.', 'info');
            return;
        }

        const result = await Swal.fire({
            title: 'Confirma Resguardo',
            text: '¿Guarda los nuevos datos?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });

        if (result.isConfirmed) {
            try {
                await axiosInstance.post(`/registracion/inspeccion/save-header/${operacionId}/${loteId}`, { header: h });
                setOriginalHeader({ ...h }); 
                await Swal.fire('Éxito', 'Cambios guardados correctamente.', 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudieron guardar los cambios.', 'error');
            }
        }
    };

    const handleExit = async () => {
        const h = data.header;
        const oh = originalHeader;
        const huboCambios = h.rolloEntrante !== oh.rolloEntrante || h.cantPasadas !== oh.cantPasadas || h.cantFlejes !== oh.cantFlejes || h.observaciones !== oh.observaciones;

        if (huboCambios) {
            const result = await Swal.fire({
                title: 'Confirma Resguardo',
                text: 'Se han cambiado valores. ¿Guarda los nuevos datos?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'No'
            });

            if (result.isConfirmed) {
                try {
                    await axiosInstance.post(`/registracion/inspeccion/save-header/${operacionId}/${loteId}`, { header: h });
                } catch (error) {
                    Swal.fire('Error', 'No se pudo guardar antes de salir.', 'error');
                    return; 
                }
            }
        }
        navigate(-1);
        setTimeout(() => {
            window.location.reload();
        }, 100); // Pequeño retraso para asegurar que la navegación ocurra primero
    };

    const handleCellClick = (pasadaNum) => {
        setEditingPasada(pasadaNum);
    };

    const handleClosePasadaForm = async (formData) => {
        const pNum = editingPasada;
        setEditingPasada(null);
        if (!formData) return;

        try {
            await axiosInstance.post(`/registracion/inspeccion/save-pasada/${operacionId}/${loteId}/${pNum}`, {
                header: data.header,
                pasadaData: formData,
                usuario: user?.nombre || 'admin'
            });
            const res = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${loteId}`);
            setData(res.data);
            setOriginalHeader({ ...res.data.header }); 
            Swal.fire('Éxito', 'Pasada guardada.', 'success');
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar.', 'error');
        }
    };

    const handleSupervisorConfirm = async (credentials) => {
        try {
            await axiosInstance.post('/registracion/validate-supervisor', {
                username: credentials.username, password: credentials.password, actionType: authType 
            }, { localAuthErrorHandling: true });
            setShowSupervisorModal(false);
            await fetchReviewData();
            authType === 'Supervisor' ? setShowSupervisorReview(true) : setShowCalidadReview(true);
        } catch (error) { setShowSupervisorModal(false); Swal.fire('Error', 'Credenciales inválidas', 'error'); }
    };

    const fetchReviewData = async () => {
        try {
            const response = await axiosInstance.get(`/registracion/inspeccion-review-data/${operacionId}/${loteId}`);
            setReviewData(response.data);
        } catch (error) { console.error(error); }
    };

    const handleSupervisorReviewConfirm = async (formData) => {
        try {
            await axiosInstance.post(`/registracion/update-inspeccion-supervisor/${operacionId}/${loteId}`, { ...formData, origen: 'Supervisor' });
            setShowSupervisorReview(false);
            const res = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${loteId}`);
            setData(res.data);
            setOriginalHeader({ ...res.data.header });
            Swal.fire('Éxito', 'Revisión confirmada.', 'success');
        } catch (error) { Swal.fire('Error', 'No se pudo actualizar', 'error'); }
    };

    const handleCalidadReviewConfirm = async (observacionCalidad) => {
        try {
            await axiosInstance.post(`/registracion/update-inspeccion-calidad/${operacionId}/${loteId}`, { observacionCalidad, origen: 'Calidad' });
            setShowCalidadReview(false);
            const res = await axiosInstance.get(`/registracion/inspeccion/${operacionId}/${loteId}`);
            setData(res.data);
            setOriginalHeader({ ...res.data.header });
            Swal.fire('Éxito', 'Observación guardada.', 'success');
        } catch (error) { Swal.fire('Error', 'No se pudo actualizar', 'error'); }
    };

    if (loading || !data) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;

    const { header, conceptos, pasadasData } = data;

    if (editingPasada !== null) {
        return (
            <PasadaForm 
                pasadaNum={editingPasada}
                pasadaData={pasadasData[editingPasada] || {}}
                totalFlejesHeader={parseInt(header.cantFlejes) || 0}
                onConfirm={handleClosePasadaForm}
                onCancel={() => setEditingPasada(null)}
            />
        );
    }

    const tableRows = conceptos.map((concepto, idx) => {
        const rowKeys = ['identificacionBobina', 'espesorBLM', 'espesorC', 'espesorBLO', 'anchoRealBobina', 'aparienciaCaraSuperior', 'aparienciaCaraInferiorIni', 'aparienciaCaraInferior14', 'aparienciaCaraInferior12', 'aparienciaCaraInferior34', 'aparienciaCaraInferiorFin', 'camber', 'diametroInterno', 'diametroExterno', 'desplazamientoEspiras'];
        const key = rowKeys[idx];
        
        return (
            <tr key={idx}>
                <td>{concepto}</td>
                {/* SIEMPRE Math.min(5, ...) para pintar máximo 5 columnas */}
                {Array.from({ length: Math.min(5, header.cantPasadas) }, (_, i) => i + 1).map(p => {
                    const value = pasadasData[p]?.[key];
                    let displayValue = '';

                    if (key === 'identificacionBobina') {
                        displayValue = value || 'C';
                    } else if (['espesorBLM', 'espesorC', 'espesorBLO', 'anchoRealBobina', 'camber', 'diametroInterno', 'diametroExterno', 'desplazamientoEspiras'].includes(key)) {
                        displayValue = formatNumber(value);
                    } else {
                        displayValue = value || '';
                    }

                    return (
                        <td key={p} onClick={() => handleCellClick(p)} style={{cursor: 'pointer'}}>
                            {displayValue}
                        </td>
                    );
                })}
            </tr>
        );
    });

    for (let i = 0; i < header.cantFlejes; i++) {
        tableRows.push(
            <tr key={`f-row-${i}`}>
                <td>Ancho de Corte {i + 1}</td>
                {Array.from({ length: Math.min(5, header.cantPasadas) }, (_, idx) => idx + 1).map(p => {
                    const ancho = (pasadasData[p]?.anchosDeCorte || []).find(a => a.item === i + 1);
                    return <td key={p} onClick={() => handleCellClick(p)} style={{cursor: 'pointer'}}>{formatNumber(ancho?.valor, 2)}</td>;
                })}
            </tr>
        );
    }

    return (
        <div className="inspeccion-container">
            <div className="inspeccion-header-bar">
                <span className="inspeccion-title">REGISTRACION - Producción</span>
                <span className="inspeccion-title">INSPECCION SLITTER {maquinaNumero}</span>
                <span>Usuario: {user?.nombre}</span>
                <button onClick={handleExit} className="btn btn-sm btn-light">
                    <i className="fas fa-door-open"></i>
                </button>
            </div>
            <div className="inspeccion-form-container">
                <div className="form-grid">
                    <div className="form-grid-item"><label>Fecha:</label><input type="text" value={header.fecha} readOnly /></div>
                    <div className="form-grid-item"><label>Lote:</label><input type="text" value={header.serieLote} readOnly /></div>
                    <div className="form-grid-item"><label>Batch:</label><input type="text" value={header.ordenProduccion} readOnly /></div>
                    <div className="form-grid-item"><label>Bobinas:</label><input type="number" name="rolloEntrante" value={header.rolloEntrante} onChange={handleHeaderChange} min="1" max='15' /></div>
                    <div className="form-grid-item"><label>Pasadas:</label><input type="number" name="cantPasadas" value={header.cantPasadas} onChange={handleHeaderChange} min="1" max="15" /></div>
                    <div className="form-grid-item"><label>Flejes:</label><input type="number" name="cantFlejes" value={header.cantFlejes} onChange={handleHeaderChange} min="1" max="20" /></div>
                    <div className="form-grid-item observaciones"><label>Obervaciones</label><textarea rows="2" name="observaciones" value={header.observaciones} onChange={handleHeaderChange}></textarea></div>
                    
                    <div className="actions-container">
                        <button className="btn subir-cambios-btn" onClick={handleSaveOnly}>SUBIR CAMBIOS</button>

                        <div className="right-stack">
                            <button className="btn supervisor-btn" onClick={() => { setAuthType('Supervisor'); setShowSupervisorModal(true); }}>SUPERVISOR</button>
                            <span className="status-label">{header.inicioRevisado ? 'Inicio Revisado' : 'Inicio NO Revisado'}</span>
                            <span className="status-label">{header.finalRevisado ? 'Final Revisado' : 'Final NO Revisado'}</span>
                            <button className="btn calidad-btn" onClick={() => { setAuthType('Calidad'); setShowSupervisorModal(true); }}>Calidad</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="inspeccion-table-container">
                <table className="inspeccion-table">
                    <thead>
                        <tr>
                            <th>Concepto</th>
                            {Array.from({ length: Math.min(5, header.cantPasadas) }, (_, i) => <th key={i}>PASADA {i+1}</th>)}
                        </tr>
                    </thead>
                    <tbody>{tableRows}</tbody>
                </table>
            </div>
            {showSupervisorModal && <SupervisorAuthModal title={authType} onClose={() => setShowSupervisorModal(false)} onConfirm={handleSupervisorConfirm} />}
            {showSupervisorReview && reviewData && <SupervisorReviewModal data={reviewData} pasadasData={data.pasadasData} header={data.header} onConfirm={handleSupervisorReviewConfirm} onCancel={() => setShowSupervisorReview(false)} />}
            {showCalidadReview && reviewData && <CalidadReviewModal data={reviewData} onConfirm={handleCalidadReviewConfirm} onCancel={() => setShowCalidadReview(false)} />}
        </div>
    );
};

export default InspeccionSlitter;
// /src/pages/DetalleOperacion.jsx (VERSIÓN COMPLETA CON FUNCIONALIDAD DE SUSPENDER)

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './DetalleOperacion.css';
import CuchillasModal from '../components/CuchillasModal';
import CuchillasInputModal from '../components/CuchillasInputModal';
import ToleranciasModal from '../components/ToleranciasModal';
import SupervisorAuthModal from '../components/SupervisorAuthModal';

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
    const location = useLocation();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Estados para modales
    const [showCuchillasModal, setShowCuchillasModal] = useState(false);
    const [cuchillasData, setCuchillasData] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [showCuchillasInputModal, setShowCuchillasInputModal] = useState(false);
    const [showToleranciasModal, setShowToleranciasModal] = useState(false);
    const [showSupervisorModal, setShowSupervisorModal] = useState(false);

    const operationStatusFromGrid = location.state?.operationStatus;
    
    // Se extrae fetchData para poder llamarla desde otras funciones
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
    
    useEffect(() => {
        fetchData();
    }, [operacionId]); // Se quita navigate de las dependencias

    const handleCuchillasClick = async () => {
        setModalLoading(true);
        setShowCuchillasModal(true);
        try {
            const response = await axiosInstance.post('/registracion/cuchillas/calcular', {
                cuchillas: data.header.Cuchillas,
                espesor: data.header.Espesor,
                ancho: data.header.Ancho
            });
            setCuchillasData(response.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudo obtener el cálculo de cuchillas.', 'error');
            setShowCuchillasModal(false);
        } finally {
            setModalLoading(false);
        }
    };
    
    const handleConfirmCuchillasInput = async (inputData) => {
        setShowCuchillasInputModal(false);
        setModalLoading(true);
        setShowCuchillasModal(true);
        try {
            const response = await axiosInstance.post('/registracion/cuchillas/calcular', {
                cuchillas: inputData.cuchillas,
                espesor: inputData.espesor,
                ancho: inputData.ancho
            });
            setCuchillasData(response.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudo obtener el cálculo de cuchillas con los datos ingresados.', 'error');
            setShowCuchillasModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleToggleSuspension = async (supervisorCredentials) => {
        const isCurrentlySuspended = (operationStatusFromGrid || data.header.status) === 'SUSPENDIDA';
        const action = isCurrentlySuspended ? 'activar' : 'suspender';

        try {
            const response = await axiosInstance.post(`/registracion/operaciones/suspender/${operacionId}`, {
                ...supervisorCredentials,
                suspend: !isCurrentlySuspended
            });
            
            setShowSupervisorModal(false);
            await Swal.fire('¡Éxito!', response.data.message, 'success');
            navigate(`/registracion/operaciones/${data.header.maquinaId}`);

        } catch (error) {
            setShowSupervisorModal(false);
            const errorMessage = error.response?.data?.error || `No se pudo ${action} la operación.`;
            Swal.fire('Error', errorMessage, 'error');
        }
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
    if (!data) return null;

    const { header, lineas, balance } = data;
    
    const currentStatus = operationStatusFromGrid || header.status;
    const isOperationEditable = currentStatus === 'EN_PROCESO';
    const isSuspended = currentStatus === 'SUSPENDIDA';

    const isNotasCalipsoDisabled = (!isOperationEditable && !isSuspended) || !header.tieneNotasCalipso;
    const isNotasSRPDisabled = (!isOperationEditable && !isSuspended) || !header.tieneNotasSRP;

    return (
        <>
            <div className="detalle-container">
                <div className="main-content">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h1 className="m-0" style={{color: 'white'}}>REGISTRACION - Detalle Slitter</h1>
                        
                        <div className="d-flex align-items-center">
                            {header.maquinaId === 'SL2' && (
                                <div className="d-flex mr-3">
                                    <button onClick={handleCuchillasClick} className="btn btn-primary mr-2" style={{backgroundColor: '#007bff', borderColor: '#007bff'}}>Cuchillas Automático</button>
                                    <button onClick={() => setShowCuchillasInputModal(true)} className="btn" style={{backgroundColor: '#6610f2', borderColor: '#6610f2', color: 'white'}}>Cuchillas</button>
                                </div>
                            )}
                            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left mr-2"></i>Volver a la Grilla
                            </button>
                        </div>
                    </div>

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
                            <div className="grid-row">
                                <div className="grid-cell-desc font-weight-bold">Scrap Seriado</div>
                                <div className="grid-cell-placeholder"></div>
                                <input type="text" className="form-control grid-cell-input" readOnly value="0" />
                                <input type="text" className="form-control grid-cell-input" readOnly value="0" />
                                <input type="text" className="form-control grid-cell-input" readOnly value="0" />
                                <input type="text" className="form-control grid-cell-input" readOnly value="0" />
                            </div>
                            <div className="grid-row">
                                <div className="grid-cell-desc font-weight-bold">Scrap No Seriado</div>
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
                    <button 
                        className="btn btn-info btn-block" 
                        disabled={!isOperationEditable}
                        onClick={() => navigate(`/registracion/inspeccion/${operacionId}/${header.LoteID}`)}
                    >
                        Inspección
                    </button>
                    
                    <button 
                        className={`btn btn-block ${isSuspended ? 'btn-info' : 'btn-warning'}`} 
                        disabled={!isOperationEditable && !isSuspended}
                        onClick={() => setShowSupervisorModal(true)}
                    >
                        {isSuspended ? 'Activar' : 'Suspender'}
                    </button>
                    
                    <hr style={{ borderColor: 'white', width: '100%' }} />

                    <button 
                        className="btn btn-light btn-block"
                        disabled={isNotasSRPDisabled}
                    >
                        Notas SRP
                    </button>  

                    <button 
                        className="btn btn-light btn-block"
                        onClick={() => setShowToleranciasModal(true)}
                        disabled={!isOperationEditable}
                    >
                        Tolerancias
                    </button>

                    <button 
                        className="btn btn-light btn-block"
                        onClick={() => navigate(`/registracion/fichatecnica/${operacionId}`, { state: { headerData: header } })}
                    >
                        Ficha Técnica
                    </button>  
                    
                    <button 
                        className="btn btn-light btn-block"
                        disabled={isNotasCalipsoDisabled}
                    >
                        Notas Calipso
                    </button>

                    <div className="cierre-container"> 
                        <button className="btn btn-success btn-block" disabled={!isOperationEditable}>
                            CIERRE
                        </button> 
                    </div>
                </div>
            </div>

            {/* Modal VISUALIZADOR */}
            {showCuchillasModal && (
                 modalLoading 
                 ? <div className="cuchillas-modal-overlay"><div className="spinner-border text-light" style={{width: '3rem', height: '3rem'}}></div></div>
                 : <CuchillasModal data={cuchillasData} onClose={() => setShowCuchillasModal(false)} />
            )}
            
            {/* Modal de INPUT */}
            {showCuchillasInputModal && (
                <CuchillasInputModal 
                    headerData={header} 
                    onClose={() => setShowCuchillasInputModal(false)}
                    onConfirm={handleConfirmCuchillasInput}
                />
            )}

            {/* Modal de TOLERANCIAS */}
            {showToleranciasModal && (
                <ToleranciasModal
                    operacionId={operacionId}
                    onClose={() => setShowToleranciasModal(false)}
                />
            )}
            
            {/* Modal de SUPERVISOR */}
            {showSupervisorModal && (
                <SupervisorAuthModal
                    title={isSuspended ? 'Activar Operación' : 'Suspender Operación'}
                    message={`Ingrese credenciales para ${isSuspended ? 'activar' : 'suspender'} la operación.`}
                    onClose={() => setShowSupervisorModal(false)}
                    onConfirm={handleToggleSuspension}
                />
            )}
        </>
    );
};

export default DetalleOperacion;
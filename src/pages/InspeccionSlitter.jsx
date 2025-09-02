// /src/pages/InspeccionSlitter.jsx -- VERSIÓN FINAL CON FORMULARIO DE PASADA

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './InspeccionSlitter.css';
import PasadaForm from '../components/PasadaForm'; // <-- 1. Importar el nuevo componente

const InspeccionSlitter = () => {
    const { operacionId, loteId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // ===== NUEVOS ESTADOS PARA CONTROLAR EL FORMULARIO DE PASADA =====
    const [editingPasada, setEditingPasada] = useState(null); // Guarda el número de la pasada a editar

    // Formateador de números local
    const formatNumber = (num, decimals = 4) => {
        const number = parseFloat(num);
        if (isNaN(number) || number === 0) {
            return (0).toLocaleString('es-AR', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
        }
        return number.toLocaleString('es-AR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
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

    // ===== NUEVA FUNCIÓN: Se activa al hacer clic en una celda de la tabla =====
    const handleCellClick = (pasadaNum) => {
        if (data.pasadasData[pasadaNum]) {
            setEditingPasada(pasadaNum);
        } else {
            // Lógica para crear una nueva pasada si se desea
            Swal.fire('Aviso', `No hay datos para la pasada ${pasadaNum}. Se debe implementar la creación.`, 'info');
        }
    };

    // ===== NUEVA FUNCIÓN: Se llama al confirmar/salir del formulario =====
    const handleClosePasadaForm = () => {
        setEditingPasada(null);
        // Aquí podrías añadir lógica para guardar los datos y recargar
    };

    if (loading || !data) {
        return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" role="status"></div></div>;
    }

    const { header, conceptos, pasadasData } = data;

    // Si estamos editando una pasada, mostramos el formulario
    if (editingPasada) {
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
    
    // --- MAPEO DE CLAVES Y DECIMALES PARA LA TABLA ---
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
    
    return (
        <div className="inspeccion-container">
            <div className="inspeccion-header-bar">
                <span className="inspeccion-title">REGISTRACION - Producción</span>
                <span className="inspeccion-title">INSPECCION SLITTER</span>
                <span>Usuario: {localStorage.getItem('user')}</span>
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
                        <button className="btn supervisor-btn">SUPERVISOR</button>
                        <span className="status-label">{header.inicioRevisado ? 'Inicio Revisado' : 'Inicio NO Revisado'}</span>
                        <span className="status-label">{header.finalRevisado ? 'Final Revisado' : 'Final NO Revisado'}</span>
                        <button className="btn calidad-btn">Calidad</button>
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
        </div>
    );
};

export default InspeccionSlitter;
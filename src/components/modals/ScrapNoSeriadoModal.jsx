// src/components/modals/ScrapNoSeriadoModal.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import '../PesajeModal.css';
import PrintLabel from '../PrintLabel';

const ScrapNoSeriadoModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
    // === ESTADOS ===
    const [peso, setPeso] = useState(0);
    const [isManualEdit, setIsManualEdit] = useState(false);
    const [atados, setAtados] = useState([]);
    const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
    const [cargandoAtados, setCargandoAtados] = useState(true);
    const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);
    const sobranteParam = 2; // Scrap

    // === CARGA INICIAL ===
    useEffect(() => {
        cargarRegistroExistente();
    }, [lineaData, operacionId]);

    // === LÓGICA DE BALANZA (POLLING) ===
    useEffect(() => {
        const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
        const interval = setInterval(async () => {
            if (isManualEdit) return;
            try {
                const res = await axiosInstance.get(`${agenteUrl}/peso`);
                setPeso(parseFloat(res.data.peso) || 0);
            } catch {
                console.warn("Balanza no disponible");
            }
        }, 1200);
        return () => clearInterval(interval);
    }, [isManualEdit]);

    const cargarRegistroExistente = async () => {
        try {
            setCargandoAtados(true);
            const res = await axiosInstance.post('/registracion/pesaje/obtener-registro-scrap-no-seriado', {
                operacionId
            });

            const registro = Array.isArray(res.data) ? res.data[0] : res.data;

            if (registro && registro.ID) {
                const atadoFicticio = {
                    rollos: 1, // Referencia como Item
                    peso: parseFloat(registro.Kilos_Sobreorden) || 0,
                    nroEtiqueta: registro.Nro_Matching || '0000',
                    idBD: registro.ID,
                    isLatest: false
                };
                setAtados([atadoFicticio]);
                setSobreOrdenTotal(atadoFicticio.peso);
            } else {
                setAtados([]);
                setSobreOrdenTotal(0);
            }
        } catch (err) {
            if (err.response?.status !== 404) {
                console.error(err);
                Swal.fire('Error', 'No se cargaron los datos de scrap no seriado.', 'error');
            }
        } finally {
            setCargandoAtados(false);
        }

        try {
            const etiquetaRes = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
            setUltimaEtiqueta(etiquetaRes.data.ultimaEtiqueta);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRegistrarScrap = async () => {
        if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
        if (!ultimaEtiqueta) return Swal.fire('Error', 'Número de etiqueta no disponible.', 'error');

        try {
            const atado = {
                atado: 1,
                rollos: 1, 
                peso,
                esCalidad: false,
                nroEtiqueta: ''
            };
            setAtados(prev => {
                const updated = prev.map(a => ({ ...a, isLatest: false }));
                return [...updated, { ...atado, isLatest: true }];
            });
            setSobreOrdenTotal(prev => prev + peso);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Error al procesar scrap.', 'error');
        }
    };

    const handleFinalizar = async () => {
        if (sobreOrdenTotal <= 0 || atados.length === 0) {
            return Swal.fire('Advertencia', 'No puede registrar sin kilos.', 'warning');
        }
        try {
            await axiosInstance.post('/registracion/pesaje/registrar', {
                operacionId,
                loteIds: null,
                sobrante: sobranteParam,
                atados: atados.map(a => ({
                    atado: 1,
                    rollos: 1,
                    peso: a.peso,
                    esCalidad: false,
                    nroEtiqueta: a.nroEtiqueta
                })),
                lineaData: {
                    ...lineaData,
                    bSobrante: false,
                    bScrap: true,
                    bScrapNoSeriado: true
                }
            });
            Swal.fire('Éxito', 'Scrap no seriado registrado.', 'success');
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            Swal.fire('Error', err.response?.data?.error || 'Error al registrar scrap.', 'error');
        }
    };

    const handleReset = async () => {
        const confirm = await Swal.fire({ title: '¿Borrar todo?', icon: 'warning', showCancelButton: true });
        if (!confirm.isConfirmed) return;
        try {
            await axiosInstance.post('/registracion/pesaje/reset', {
                operacionId,
                loteIds: 'EBCEC003-0D54-49C7-9423-7E41B3D11AE7',
                sobrante: sobranteParam
            });
            setAtados([]);
            setSobreOrdenTotal(0);
            setPeso(0);
            Swal.fire('Éxito', 'Reset completado.', 'success');
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo resetear.', 'error');
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
                        <div>Serie-Lote: {lineaData?.SerieLote || 'N/A'}</div>
                    </div>
                    <div className="pesaje-section">
                        <label>Peso Balanza:</label>
                        {/* ✅ INPUT SOLO ENTEROS: step="1", pattern, y onChange que redondea */}
                        <input 
                            type="number" 
                            step="1"
                            pattern="\d*"
                            value={peso} 
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setPeso(val >= 0 ? val : 0);
                            }}
                            onFocus={() => setIsManualEdit(true)} 
                            onBlur={() => setIsManualEdit(false)} 
                            className="peso-input" 
                        />
                    </div>
                    <div className="totales">
                        <div>Kg. Scrap: {sobreOrdenTotal.toFixed(2)}</div>
                    </div>
                    <div className="atados-section">
                        <button onClick={handleRegistrarScrap} className="btn-so">Agregar Scrap</button>
                    </div>
                    <div className="grilla-atados">
                        <h4>Pesajes Registrados</h4>
                        {cargandoAtados ? <div>Cargando...</div> : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Items</th>
                                        <th>Peso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {atados.length > 0 ? atados.map((a, i) => (
                                        <tr key={i}>
                                            <td>{a.rollos}</td>
                                            <td>{a.peso.toFixed(2)} Kg</td>
                                        </tr>
                                    )) : <tr><td colSpan="2" style={{ textAlign: 'center' }}>No hay pesajes</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleReset} className="btn-reset">RESET</button>
                    <button onClick={handleFinalizar} className="btn-registrar">REGISTRAR SCRAP</button>
                </div>
            </div>
        </div>
    );
};

export default ScrapNoSeriadoModal;
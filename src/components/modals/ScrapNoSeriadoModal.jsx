    // src/components/modals/ScrapNoSeriadoModal.jsx
    import React, { useState, useEffect } from 'react';
    import axiosInstance from '../../api/axiosInstance';
    import Swal from 'sweetalert2';
    import '../PesajeModal.css';
    import PrintLabel from '../PrintLabel';

    const ScrapNoSeriadoModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
        const [peso, setPeso] = useState(0);
        const [rollos, setRollos] = useState(0);
        const [atados, setAtados] = useState([]);
        const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
        const [cargandoAtados, setCargandoAtados] = useState(true);
        const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);
        const sobranteParam = 2; // Scrap

        useEffect(() => {
            cargarRegistroExistente();
            console.log("lineaData..........",lineaData);
            
        }, [lineaData, operacionId]);

        useEffect(() => {
            const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
            const interval = setInterval(async () => {
                try {
                    const res = await axiosInstance.get(`${agenteUrl}/peso`);
                    setPeso(parseFloat(res.data.peso) || 0);
                } catch {
                    setPeso(0);
                }
            }, 1200);
            return () => clearInterval(interval);
        }, []);

        const cargarRegistroExistente = async () => {
            try {
                setCargandoAtados(true);
                
                const res = await axiosInstance.post('/registracion/pesaje/obtener-registro-scrap-no-seriado', {
                    operacionId
                });

                // ✅ Validación robusta: verificar si res.data es un objeto válido
                const registro = Array.isArray(res.data) 
                    ? res.data[0] // si es array, tomar el primer elemento
                    : res.data;   // si es un objeto, usar directamente

                if (registro && registro.ID) {
                    const atadoFicticio = {
                        rollos: registro.Rollos || 0,
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

                setRollos(0);
            } catch (err) {
                // ✅ Si no hay registro (404), NO es un error grave
                if (err.response?.status === 404) {
                    setAtados([]);
                    setSobreOrdenTotal(0);
                } else {
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

        const generarEtiqueta = async () => {
            const res = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
            return res.data.nroEtiqueta;
        };

        const handleRegistrarScrap = async () => {
            if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
            if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de rollos.', 'warning');
            if (!ultimaEtiqueta) return Swal.fire('Error', 'Número de etiqueta no disponible.', 'error');

            try {
                const nroEtiqueta = '';
                const atado = {
                    atado: 1, // fijo
                    rollos,
                    peso,
                    esCalidad: false, // siempre falso
                    nroEtiqueta
                };
                setAtados(prev => {
                    const updated = prev.map(a => ({ ...a, isLatest: false }));
                    return [...updated, { ...atado, isLatest: true }];
                });
                setSobreOrdenTotal(prev => prev + peso);
                setRollos(0);
                setUltimaEtiqueta(nroEtiqueta);
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'No se pudo generar etiqueta.', 'error');
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
                        rollos: a.rollos,
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
                setRollos(0);
                setPeso(0);
                setUltimaEtiqueta(null);
                Swal.fire('Éxito', 'Reset completado.', 'success');
                onSuccess();
                onClose();
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'No se pudo resetear.', 'error');
            }
        };

        const imprimirEtiqueta = (item) => {
            const labelData = {
                parSerieLote: 'Scrap No Seriado',
                parFecha: new Date().toLocaleDateString('es-AR'),
                parHora: new Date().toLocaleTimeString('es-AR'),
                parCliente: lineaData?.Clientes || 'CIMET S.A.',
                parAncho: (lineaData?.Ancho || '160').toString(),
                parEspesor: (lineaData?.Espesor?.toFixed(3) || '0.500').toString(),
                parCodProducto: lineaData?.CodigoProducto || '0945-PT-AL-FL-0500-0050-1NP-01',
                parLiquido: item.peso.toFixed(0),
                parBruto: (item.peso + 26).toFixed(0),
                parTara: '26',
                parUnid: item.rollos.toString()
            };
            PrintLabel(labelData);
        };

        const handleEliminarAtado = (atadoAEliminar, index) => {
            if (!atadoAEliminar.isLatest) return Swal.fire('Advertencia', 'Solo se puede eliminar el último.', 'warning');
            const confirm = Swal.fire({ title: '¿Eliminar?', showCancelButton: true });
            if (!confirm.isConfirmed) return;
            setAtados(prev => {
                const nuevos = prev.filter((_, i) => i !== index);
                return nuevos;
            });
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
                            <input type="number" value={peso.toFixed(3)} readOnly className="peso-input" />
                        </div>
                        <div className="totales">
                            <div>Kg. Scrap: {sobreOrdenTotal.toFixed(2)}</div>
                        </div>
                        <div className="atados-section">
                            <label>Rollos:</label>
                            <input type="number" value={rollos} onChange={e => setRollos(parseInt(e.target.value) || 0)} min="0" />
                            <button onClick={handleRegistrarScrap} className="btn-so">Agregar Scrap</button>
                        </div>
                        <div className="grilla-atados">
                            <h4>Atados Registrados</h4>
                            {cargandoAtados ? <div>Cargando...</div> : (
                                <table>
                                    <thead><tr><th>Rollos</th><th>Peso</th><th>Nro. Etiqueta</th><th>Acciones</th></tr></thead>
                                    <tbody>
                                        {atados.length > 0 ? atados.map((a, i) => (
                                            <tr key={i}>
                                                <td>{a.rollos}</td>
                                                <td>{a.peso.toFixed(2)}</td>
                                                <td>{a.nroEtiqueta}</td>
                                                <td className="acciones-atado">
                                                    <button onClick={() => imprimirEtiqueta(a)} className="btn-imprimir">🖨️</button>
                                                    {a.isLatest && <button onClick={() => handleEliminarAtado(a, i)} className="btn-eliminar">🗑️</button>}
                                                </td>
                                            </tr>
                                        )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No hay atados</td></tr>}
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
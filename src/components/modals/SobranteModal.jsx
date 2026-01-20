// src/components/modals/SobranteModal.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import '../PesajeModal.css';
import PrintLabel from '../PrintLabel';

const SobranteModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
    const [peso, setPeso] = useState(0);
    const [atado, setAtado] = useState(1);
    const [rollos, setRollos] = useState(0);
    const [atados, setAtados] = useState([]);
    const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
    const [calidadTotal, setCalidadTotal] = useState(0);
    const [programados, setProgramados] = useState(0);
    const [cargandoAtados, setCargandoAtados] = useState(true);
    const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);

    console.log("LINEADATA ", lineaData);
    console.log("operacionId     ", operacionId);
    

    // Datos fijos para Sobrante
    const loteIdsParam = lineaData?.LoteID;
    const sobranteParam = 1;

    useEffect(() => {
        cargarAtadosExistentes();
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

    const cargarAtadosExistentes = async () => {
        try {
            setCargandoAtados(true);
            console.log("ENTRA EN CARGAR ATADO EXISTENTE");

            console.log("loteIdsParam -----", loteIdsParam);
            
            
            const res = await axiosInstance.post('/registracion/pesaje/obtenerAtadosSobrantes', {
                operacionId,
                loteIds: loteIdsParam,
                sobrante: 1 // <-- Este es el cambio clave
            });
            const atadosData = (res.data || []).map(item => ({
                atado: item.Atado || 0,
                rollos: item.Rollos || 0,
                peso: parseFloat(item.Peso) || 0,
                esCalidad: item.Calidad === 1,
                nroEtiqueta: item.Etiqueta,
                idBD: item.IdRegistroPesaje,
                isLatest: false
            }));

            console.log("atadosData ", atadosData);
            
            setAtados(atadosData);
            setSobreOrdenTotal(atadosData.filter(a => !a.esCalidad).reduce((sum, a) => sum + a.peso, 0));
            setCalidadTotal(atadosData.filter(a => a.esCalidad).reduce((sum, a) => sum + a.peso, 0));
            const lastAtado = Math.max(...atadosData.map(a => a.atado), 0);
            setAtado(lastAtado + 1);
            setProgramados(parseFloat(lineaData.Programados) || 0);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se cargaron los atados de sobrante.', 'error');
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

    const agregarAtado = async (esCalidad) => {
        if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese peso válido.', 'warning');
        if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese cantidad de rollos.', 'warning');
        if (!ultimaEtiqueta) return Swal.fire('Error', 'Número de etiqueta no disponible.', 'error');

        try {
            const nroEtiqueta = await generarEtiqueta();
            const nuevo = {
                atado,
                rollos,
                peso,
                esCalidad,
                nroEtiqueta,
                isLatest: true
            };
            setAtados(prev => {
                const updated = prev.map(a => ({ ...a, isLatest: false }));
                return [...updated, nuevo];
            });
            if (esCalidad) setCalidadTotal(prev => prev + peso);
            else setSobreOrdenTotal(prev => prev + peso);
            setAtado(prev => prev + 1);
            setRollos(0);
            setUltimaEtiqueta(nroEtiqueta);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo generar etiqueta.', 'error');
        }
    };

    const handleSobreOrden = () => agregarAtado(false);
    const handleCalidad = () => agregarAtado(true);

    // const handleRegistrar = async () => {
    //     if (sobreOrdenTotal + calidadTotal <= 0 || atados.length === 0) {
    //         return Swal.fire('Advertencia', 'No puede registrar sin kilos.', 'warning');
    //     }
    //     try {
    //         await axiosInstance.post('/registracion/pesaje/registrar', {
    //             operacionId,
    //             atados: atados.map(a => ({
    //                 atado: a.atado,
    //                 rollos: a.rollos,
    //                 peso: a.peso,
    //                 esCalidad: a.esCalidad,
    //                 nroEtiqueta: a.nroEtiqueta
    //             })),
    //             lineaData: {
    //                 ...lineaData,
    //                 bSobrante: true,
    //                 bScrap: false,
    //                 bScrapNoSeriado: false
    //             }
    //         });
    //         Swal.fire('Éxito', 'Sobrante registrado.', 'success');
    //         onSuccess();
    //         onClose();
    //     } catch (err) {
    //         console.error(err);
    //         Swal.fire('Error', err.response?.data?.error || 'Error al registrar sobrante.', 'error');
    //     }
    // };



    const handleRegistrar = async () => {
    if (sobreOrdenTotal + calidadTotal <= 0 || atados.length === 0) {
        return Swal.fire('Advertencia', 'No puede registrar sin kilos.', 'warning');
    }
    try {
        await axiosInstance.post('/registracion/pesaje/registrar', {
            operacionId,
            sobrante: 1, // ✅ ¡ESTO FALTABA!
            atados: atados.map(a => ({
                atado: a.atado,
                rollos: a.rollos,
                peso: a.peso,
                esCalidad: a.esCalidad,
                nroEtiqueta: a.nroEtiqueta
            })),
            lineaData: {
                ...lineaData,
                bSobrante: true,
                bScrap: false,
                bScrapNoSeriado: false
            }
        });
        Swal.fire('Éxito', 'Sobrante registrado.', 'success');
        onSuccess();
        onClose();
    } catch (err) {
        console.error(err);
        Swal.fire('Error', err.response?.data?.error || 'Error al registrar sobrante.', 'error');
    }
};



    const handleReset = async () => {
        const confirm = await Swal.fire({ title: '¿Borrar todo?', icon: 'warning', showCancelButton: true });
        if (!confirm.isConfirmed) return;
        try {
            await axiosInstance.post('/registracion/pesaje/reset', {
                operacionId,
                loteIds: loteIdsParam,
                sobrante: sobranteParam
            });
            setAtados([]);
            setSobreOrdenTotal(0);
            setCalidadTotal(0);
            setAtado(1);
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
            parSerieLote: lineaData?.SerieLote || '73291 - 010',
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
            const nuevos = prev.filter((_, i) => i !== index).map((a, i) => ({ ...a, atado: i + 1 }));
            const last = nuevos.length - 1;
            if (last >= 0) nuevos[last] = { ...nuevos[last], isLatest: true };
            return nuevos;
        });
    };

    return (
        <div className="pesaje-modal-overlay">
            <div className="pesaje-modal">
                <div className="modal-header">
                    <h3>Sobrante - {lineaData?.Ancho} x {lineaData?.Cuchillas}</h3>
                    <button onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="info-panel">
                        <div>Serie-Lote: {lineaData?.SerieLote || 'N/A'}</div>
                        <div>Kgs. Programados: {programados.toFixed(2)}</div>
                    </div>
                    <div className="pesaje-section">
                        <label>Peso Balanza:</label>
                        <input type="number" value={peso.toFixed(3)} readOnly className="peso-input" />
                    </div>
                    <div className="totales">
                        <div>Kg. Sobre Orden: {sobreOrdenTotal.toFixed(2)}</div>
                        <div>Kg. Calidad: {calidadTotal.toFixed(2)}</div>
                    </div>
                    <div className="atados-section">
                        <label>Atado: {atado}</label>
                        <label>Rollos:</label>
                        <input type="number" value={rollos} onChange={e => setRollos(parseInt(e.target.value) || 0)} min="0" />
                        <button onClick={handleSobreOrden} className="btn-so">Sobre Orden</button>
                        <button onClick={handleCalidad} className="btn-calidad">Calidad</button>
                    </div>
                    <div className="grilla-atados">
                        <h4>Atados Registrados</h4>
                        {cargandoAtados ? <div>Cargando...</div> : (
                            <table>
                                <thead><tr><th>Atado</th><th>Rollos</th><th>Peso</th><th>Calidad</th><th>Nro. Etiqueta</th><th>Acciones</th></tr></thead>
                                <tbody>
                                    {atados.length > 0 ? atados.map((a, i) => (
                                        <tr key={i}>
                                            <td>{a.atado}</td>
                                            <td>{a.rollos}</td>
                                            <td>{a.peso.toFixed(2)}</td>
                                            <td>{a.esCalidad ? '✓' : ''}</td>
                                            <td>{a.nroEtiqueta}</td>
                                            <td className="acciones-atado">
                                                <button onClick={() => imprimirEtiqueta(a)} className="btn-imprimir">🖨️</button>
                                                {a.isLatest && <button onClick={() => handleEliminarAtado(a, i)} className="btn-eliminar">🗑️</button>}
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay atados</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleReset} className="btn-reset">RESET</button>
                    <button onClick={handleRegistrar} className="btn-registrar">REGISTRAR</button>
                </div>
            </div>
        </div>
    );
};

export default SobranteModal;
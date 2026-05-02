// src/components/modals/PesajeNormalModal.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import '../PesajeModal.css';

const PesajeNormalModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
    // === ESTADOS DE DATOS ===
    const [peso, setPeso] = useState(0);
    const [isManualEdit, setIsManualEdit] = useState(false); 
    const [atado, setAtado] = useState(1);
    const [rollos, setRollos] = useState(0);
    const [atados, setAtados] = useState([]);
    const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
    const [calidadTotal, setCalidadTotal] = useState(0);
    const [programados, setProgramados] = useState(0);
    const [cargandoAtados, setCargandoAtados] = useState(true);
    const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);
    
    const loteIdsParam = lineaData?.Lote_IDS || null;
    const sobranteParam = 0; 

    // === LÓGICA DE BALANZA Y DATOS ===
    useEffect(() => {
        cargarAtadosExistentes();
    }, [lineaData, operacionId]);
    
    useEffect(() => {
        const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
        const interval = setInterval(async () => {
            if (isManualEdit) return;
            try {
                const res = await axiosInstance.get(`${agenteUrl}/peso`);
                // ✅ REDONDEAR A ENTERO el peso de la balanza
                setPeso(Math.round(parseFloat(res.data.peso) || 0));
            } catch {
                console.warn("Balanza no disponible");
            }
        }, 1200);
        return () => clearInterval(interval);
    }, [isManualEdit]);

    const cargarAtadosExistentes = async () => {
        try {
            setCargandoAtados(true);
            const idParaConsulta = lineaData?.Operacion_ID || operacionId;
            const res = await axiosInstance.post('/registracion/pesaje/obtener-atados', {
                operacionId: idParaConsulta,
                loteIds: loteIdsParam,
                sobrante: sobranteParam
            });
            const dataResponse = Array.isArray(res.data) ? res.data : [];
            const atadosData = dataResponse.map(item => ({
                atado: item.Atado || 0,
                rollos: item.Rollos || 0,
                peso: parseFloat(item.Peso) || 0,
                esCalidad: item.Calidad === 1,
                nroEtiqueta: item.Etiqueta,
                idBD: item.IdRegistroPesaje
            }));
            setAtados(atadosData);
            setSobreOrdenTotal(atadosData.filter(a => !a.esCalidad).reduce((sum, a) => sum + a.peso, 0));
            setCalidadTotal(atadosData.filter(a => a.esCalidad).reduce((sum, a) => sum + a.peso, 0));
            const lastAtado = atadosData.length > 0 ? Math.max(...atadosData.map(a => a.atado), 0) : 0;
            setAtado(lastAtado + 1);
            setProgramados(parseFloat(lineaData?.Programados) || 0);
        } catch (err) {
            console.error(err);
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
            const nuevo = { atado, rollos, peso, esCalidad, nroEtiqueta };
            setAtados(prev => [...prev, nuevo]);
            if (esCalidad) setCalidadTotal(prev => prev + peso);
            else setSobreOrdenTotal(prev => prev + peso);
            setAtado(prev => prev + 1);
            setRollos(0);
            setUltimaEtiqueta(nroEtiqueta);
        } catch (err) {
            Swal.fire('Error', 'No se pudo generar etiqueta.', 'error');
        }
    };

    const handleSobreOrden = () => agregarAtado(false);
    const handleCalidad = () => agregarAtado(true);

    const handleRegistrar = async () => {
        if (atados.length === 0) return Swal.fire('Advertencia', 'No hay pesajes.', 'warning');
        try {
            const idParaRegistro = lineaData?.Operacion_ID || operacionId;
            await axiosInstance.post('/registracion/pesaje/registrar', {
                operacionId: idParaRegistro,
                loteIds: loteIdsParam,
                sobrante: sobranteParam,
                atados: atados.map(a => ({
                    atado: a.atado,
                    rollos: a.rollos,
                    peso: a.peso,
                    esCalidad: a.esCalidad,
                    nroEtiqueta: a.nroEtiqueta
                })),
                lineaData
            });
            Swal.fire('Éxito', 'Registrado correctamente.', 'success');
            onSuccess();
            onClose();
        } catch (err) {
            Swal.fire('Error', 'Error al registrar.', 'error');
        }
    };

    const handleReset = async () => {
        const confirm = await Swal.fire({ title: '¿Borrar todo?', text: 'Se borrarán todos los pesajes y se cerrará el modal.', icon: 'warning', showCancelButton: true });
        if (!confirm.isConfirmed) return;
        try {
            const idParaReset = lineaData?.Operacion_ID || operacionId;
            await axiosInstance.post('/registracion/pesaje/reset', {
                operacionId: idParaReset,
                loteIds: loteIdsParam,
                sobrante: sobranteParam
            });
            
            await Swal.fire('Éxito', 'Pesajes borrados correctamente.', 'success');
            
            onSuccess(); 
            onClose();
            
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo resetear.', 'error');
        }
    };

    const handleEliminarAtado = async (atadoAEliminar, index) => {
        const confirm = await Swal.fire({ 
            title: '¿Eliminar atado?', 
            text: `Se eliminará el atado ${atadoAEliminar.atado} de ${atadoAEliminar.peso.toFixed(2)} Kg`,
            icon: 'warning', 
            showCancelButton: true 
        });
        if (!confirm.isConfirmed) return;
        
        setAtados(prev => {
            const nuevos = prev.filter((_, i) => i !== index);
            const renumerados = nuevos.map((a, i) => ({
                ...a,
                atado: i + 1
            }));
            return renumerados;
        });
        
        if (atadoAEliminar.esCalidad) {
            setCalidadTotal(prev => prev - atadoAEliminar.peso);
        } else {
            setSobreOrdenTotal(prev => prev - atadoAEliminar.peso);
        }
        
        setAtado(prev => prev - 1);
    };

    const imprimirEtiqueta = (a) => { console.log("Imprimir", a); };

    return (
        <div className="pesaje-modal-overlay">
            <div className="pesaje-modal">
                <div className="modal-header">
                    <h3>Pesaje Normal - {lineaData?.Ancho} x {lineaData?.Cuchillas}</h3>
                    <button onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="info-panel">
                        <div>Serie-Lote: {lineaData?.SerieLote || 'N/A'}</div>
                        <div>Kgs. Programados: {programados.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
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
                        <div>SOBRE ORDEN: {sobreOrdenTotal.toFixed(2)}</div>
                        <div>CALIDAD: {calidadTotal.toFixed(2)}</div>
                    </div>
                    <div className="atados-section">
                        <label>Atado: {atado}</label>
                        <label>Rollos:</label>
                        <input type="number" value={rollos} onChange={e => setRollos(parseInt(e.target.value) || 0)} min="0" />
                        <button onClick={handleSobreOrden} className="btn-so">AGREGAR S.O.</button>
                        <button onClick={handleCalidad} className="btn-calidad">AGREGAR CALIDAD</button>
                    </div>
                    <div className="grilla-atados">
                        <h4>Atados en Memoria / Registrados</h4>
                        {cargandoAtados ? <div>Cargando...</div> : (
                            <table>
                                <thead><tr><th>Atado</th><th>Rollos</th><th>Peso</th><th>Calidad</th><th>Etiqueta</th><th>Acciones</th></tr></thead>
                                <tbody>
                                    {atados.length > 0 ? atados.map((a, i) => (
                                        <tr key={i}>
                                            <td>{a.atado}</td>
                                            <td>{a.rollos}</td>
                                            <td>{a.peso.toFixed(2)} Kg</td>
                                            <td>{a.esCalidad ? 'SI' : 'NO'}</td>
                                            <td>{a.nroEtiqueta}</td>
                                            <td className="acciones-atado">
                                                <button onClick={() => imprimirEtiqueta(a)} className="btn-imprimir">🖨️</button>
                                                <button onClick={() => handleEliminarAtado(a, i)} className="btn-eliminar">🗑️</button>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay pesajes cargados</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleReset} className="btn-reset">BORRAR TODO</button>
                    <button onClick={handleRegistrar} className="btn-registrar">CONFIRMAR REGISTRO</button>
                </div>
            </div>
        </div>
    );
};

export default PesajeNormalModal;
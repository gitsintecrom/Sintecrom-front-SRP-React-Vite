// // // // PesajeModal.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './PesajeModal.css';

const PesajeModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
    const [peso, setPeso] = useState(0);
    const [atado, setAtado] = useState(1);
    const [rollos, setRollos] = useState(0);
    const [atados, setAtados] = useState([]);
    const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
    const [calidadTotal, setCalidadTotal] = useState(0);
    const [programados, setProgramados] = useState(0);
    const [cargandoAtados, setCargandoAtados] = useState(true);
    const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null); // Sin valor por defecto

    const loteIdsParam = lineaData?.Lote_IDS || null;
    const sobranteParam = lineaData?.bSobrante ? 1 : (lineaData?.bScrap ? 2 : 0);

    useEffect(() => {
        console.log('lineaData recibido:', lineaData); // Depuración
        cargarAtadosExistentes();
    }, [lineaData, operacionId]);

    useEffect(() => {
        const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
        let pollingInterval = null;

        const updatePesoDisplay = async () => {
            try {
                const response = await axiosInstance.get(`${agenteUrl}/peso`);
                if (response.data?.success) {
                    const nuevoPeso = parseFloat(response.data.peso) || 0;
                    setPeso(nuevoPeso);
                }
            } catch (error) {
                setPeso(0);
            }
        };

        pollingInterval = setInterval(updatePesoDisplay, 1200);
        return () => clearInterval(pollingInterval);
    }, []);

    const cargarAtadosExistentes = async () => {
        try {
            setCargandoAtados(true);

            const response = await axiosInstance.post('/registracion/pesaje/obtener-atados', {
                operacionId,
                loteIds: loteIdsParam,
                sobrante: sobranteParam
            });

            console.log(response);

            if (response.data && response.data.length > 0) {
                const atadosData = response.data.map(item => ({
                    atado: item.Atado || 0,
                    rollos: item.Rollos || 0,
                    peso: parseFloat(item.Peso) || 0,
                    esCalidad: item.Calidad === 1,
                    nroEtiqueta: item.Etiqueta,
                    idBD: item.IdRegistroPesaje,
                    isLatest: false
                }));

                setAtados(atadosData);

                const soTotal = atadosData
                    .filter(item => !item.esCalidad)
                    .reduce((sum, item) => sum + item.peso, 0);
                const calTotal = atadosData
                    .filter(item => item.esCalidad)
                    .reduce((sum, item) => sum + item.peso, 0);
                setSobreOrdenTotal(soTotal);
                setCalidadTotal(calTotal);

                const ultimaEtiquetaRegistrada = Math.max(...atadosData.map(item => item.nroEtiqueta));
                setUltimaEtiqueta(ultimaEtiquetaRegistrada);

                const ultimoAtado = Math.max(...atadosData.map(item => item.atado), 0);
                setAtado(ultimoAtado + 1);
            } else {
                // Obtener el último número de etiqueta de la tabla sin modificarlo
                const etiquetaResponse = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
                setUltimaEtiqueta(etiquetaResponse.data.ultimaEtiqueta);
                setAtados([]);
                setSobreOrdenTotal(0);
                setCalidadTotal(0);
                setAtado(1);
            }

            if (lineaData) {
                setProgramados(parseFloat(lineaData.Programados) || 0);
            }
        } catch (error) {
            console.error('Error al cargar atados existentes:', error);
            Swal.fire('Error', 'No se pudieron cargar los atados existentes o el número de etiqueta.', 'error');
        } finally {
            setCargandoAtados(false);
        }
    };

    const handleSobreOrden = async () => {
        if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese un peso válido.', 'warning');
        if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese la cantidad de rollos.', 'warning');
        if (!ultimaEtiqueta) return Swal.fire('Error', 'El número de etiqueta no está inicializado.', 'error');

        try {
            // Obtener y actualizar el siguiente número de etiqueta desde la tabla solo al agregar
            const etiquetaResponse = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
            const nroEtiqueta = etiquetaResponse.data.nroEtiqueta;

            const nuevoAtado = {
                atado,
                rollos,
                peso,
                esCalidad: false,
                nroEtiqueta,
                isLatest: true
            };

            setAtados(prev => {
                const updatedAtados = prev.map(item => ({ ...item, isLatest: false }));
                return [...updatedAtados, nuevoAtado];
            });
            setSobreOrdenTotal(prev => prev + peso);
            setAtado(prev => prev + 1);
            setRollos(0);
            setUltimaEtiqueta(nroEtiqueta);
        } catch (error) {
            console.error('Error al generar etiqueta:', error);
            Swal.fire('Error', 'No se pudo generar el número de etiqueta.', 'error');
        }
    };

    const handleCalidad = async () => {
        if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese un peso válido.', 'warning');
        if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese la cantidad de rollos.', 'warning');
        if (!ultimaEtiqueta) return Swal.fire('Error', 'El número de etiqueta no está inicializado.', 'error');

        try {
            // Obtener y actualizar el siguiente número de etiqueta desde la tabla solo al agregar
            const etiquetaResponse = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
            const nroEtiqueta = etiquetaResponse.data.nroEtiqueta;

            const nuevoAtado = {
                atado,
                rollos,
                peso,
                esCalidad: true,
                nroEtiqueta,
                isLatest: true
            };

            setAtados(prev => {
                const updatedAtados = prev.map(item => ({ ...item, isLatest: false }));
                return [...updatedAtados, nuevoAtado];
            });
            setCalidadTotal(prev => prev + peso);
            setAtado(prev => prev + 1);
            setRollos(0);
            setUltimaEtiqueta(nroEtiqueta);
        } catch (error) {
            console.error('Error al generar etiqueta:', error);
            Swal.fire('Error', 'No se pudo generar el número de etiqueta.', 'error');
        }
    };

    const handleRegistrar = async () => {
        if (sobreOrdenTotal + calidadTotal <= 0 || atados.length === 0) {
            return Swal.fire('Advertencia', 'No puede registrar sin kilos y rollos.', 'warning');
        }

        try {
            await axiosInstance.post('/registracion/pesaje/registrar', {
                operacionId,
                loteIds: loteIdsParam,
                sobrante: sobranteParam,
                atados: atados.map(item => ({
                    atado: item.atado,
                    rollos: item.rollos,
                    peso: item.peso,
                    esCalidad: item.esCalidad,
                    esSobreOrden: !item.esCalidad,
                    nroEtiqueta: item.nroEtiqueta,
                    idBD: item.idBD
                }))
            });

            Swal.fire('Éxito', 'Pesaje registrado correctamente.', 'success');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error al registrar:', error);
            Swal.fire('Error', error.response?.data?.error || 'Error al registrar el pesaje.', 'error');
        }
    };

    const handleReset = async () => {
        const confirm = await Swal.fire({
            title: '¿Borrar todo?',
            text: 'Se borrará todo lo registrado en esta sesión y en la base de datos para esta operación/lote.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
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
                setUltimaEtiqueta(null); // Resetear a null, se cargará al recargar

                Swal.fire('Reset completado', 'Todos los datos han sido reseteados.', 'success');
            } catch (error) {
                console.error('Error al resetear:', error);
                Swal.fire('Error', 'No se pudo completar el reset.', 'error');
            }
        }
    };

    const imprimirEtiqueta = async (itemAtado) => {
        try {
            Swal.fire({
                title: 'Imprimir etiqueta',
                text: `¿Desea imprimir la etiqueta para el atado ${itemAtado.atado} (Nro. Etiqueta: ${itemAtado.nroEtiqueta})?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Imprimir',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    console.log('Solicitud de impresión de etiqueta:', itemAtado);
                    Swal.fire('Éxito', 'Etiqueta enviada a imprimir (simulado)', 'success');
                }
            });
        } catch (error) {
            console.error('Error al imprimir etiqueta:', error);
            Swal.fire('Error', 'Error al imprimir la etiqueta', 'error');
        }
    };

    const handleEliminarAtado = async (atadoAEliminar, index) => {
        if (!atadoAEliminar.isLatest) {
            Swal.fire('Advertencia', 'Solo se puede eliminar el último atado registrado.', 'warning');
            return;
        }

        const confirm = await Swal.fire({
            title: '¿Eliminar atado?',
            text: `¿Está seguro que desea eliminar el atado ${atadoAEliminar.atado} (Peso: ${atadoAEliminar.peso.toFixed(2)} Kg, Nro. Etiqueta: ${atadoAEliminar.nroEtiqueta})?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            try {
                if (atadoAEliminar.idBD) {
                    await axiosInstance.post('/registracion/pesaje/eliminar-atado', {
                        idRegistroPesaje: atadoAEliminar.idBD,
                        operacionId: operacionId,
                        loteIds: loteIdsParam,
                        sobrante: sobranteParam
                    });
                    Swal.fire('Eliminado', 'Atado eliminado de la base de datos.', 'success');
                } else {
                    Swal.fire('Eliminado', 'Atado eliminado de la sesión actual.', 'success');
                }

                setAtados(prevAtados => {
                    const nuevosAtados = prevAtados.filter((_, i) => i !== index);

                    // Renumerar los atados según la cantidad de ítems restantes
                    const renumerados = nuevosAtados.map((atado, i) => ({
                        ...atado,
                        atado: i + 1
                    }));

                    const newSoTotal = renumerados
                        .filter(item => !item.esCalidad)
                        .reduce((sum, item) => sum + item.peso, 0);
                    const newCalTotal = renumerados
                        .filter(item => item.esCalidad)
                        .reduce((sum, item) => sum + item.peso, 0);

                    setSobreOrdenTotal(newSoTotal);
                    setCalidadTotal(newCalTotal);

                    if (renumerados.length > 0) {
                        const lastIndex = renumerados.length - 1;
                        renumerados[lastIndex] = { ...renumerados[lastIndex], isLatest: true };
                        // Actualizar el estado 'atado' al próximo número disponible (cantidad de ítems + 1)
                        setAtado(renumerados.length + 1);
                    } else {
                        setAtado(1);
                        setUltimaEtiqueta(null); // Resetear a null
                    }

                    return renumerados;
                });
            } catch (error) {
                console.error('Error al eliminar atado:', error);
                Swal.fire('Error', error.response?.data?.error || 'Error al eliminar el atado.', 'error');
            }
        }
    };

    return (
        <div className="pesaje-modal-overlay">
            <div className="pesaje-modal">
                <div className="modal-header">
                    <h3>Pesaje - {lineaData?.Ancho} x {lineaData?.Cuchillas}</h3>
                    <button onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="info-panel">
                        <div>Serie-Lote: {lineaData?.SerieLote || 'N/A'}{lineaData?.SerieLote === undefined ? ' (Dato no recibido)' : ''}</div>
                        <div>Cortes: {lineaData?.Cuchillas}</div>
                        <div>Nro.Matching: {lineaData?.Matching}</div>
                        <div>Kgs. Programados: {programados.toFixed(2)}</div>
                    </div>

                    <div className="pesaje-section">
                        <label>Peso Balanza:</label>
                        <input
                            type="number"
                            value={peso.toFixed(3)}
                            readOnly
                            className="peso-input"
                            placeholder="Esperando lectura..."
                            step="0.001"
                        />
                    </div>

                    <div className="totales">
                        <div>Kg. Sobre Orden: {sobreOrdenTotal.toFixed(2)}</div>
                        <div>Kg. Calidad: {calidadTotal.toFixed(2)}</div>
                    </div>

                    <div className="atados-section">
                        <label>Atado: {atado}</label>
                        <label>Rollos: </label>
                        <input
                            type="number"
                            value={rollos}
                            onChange={(e) => setRollos(parseInt(e.target.value) || 0)}
                            placeholder="Rollos"
                            min="0"
                        />
                        <button onClick={handleSobreOrden} className="btn-so">Sobre Orden</button>
                        <button onClick={handleCalidad} className="btn-calidad">Calidad</button>
                    </div>

                    <div className="grilla-atados">
                        <h4>Atados Registrados</h4>
                        {cargandoAtados ? (
                            <div className="cargando-atados">Cargando atados existentes...</div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Atado</th>
                                        <th>Rollos</th>
                                        <th>Peso</th>
                                        <th>Calidad</th>
                                        <th>Nro. Etiqueta</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {atados.length > 0 ? (
                                        atados.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.atado}</td>
                                                <td>{item.rollos}</td>
                                                <td>{item.peso.toFixed(2)}</td>
                                                <td>{item.esCalidad ? '✓' : ''}</td>
                                                <td>{item.nroEtiqueta}</td>
                                                <td className="acciones-atado">
                                                    <button
                                                        onClick={() => imprimirEtiqueta(item)}
                                                        className="btn-imprimir"
                                                        title="Imprimir etiqueta"
                                                    >
                                                        🖨️
                                                    </button>
                                                    {item.isLatest && (
                                                        <button
                                                            onClick={() => handleEliminarAtado(item, idx)}
                                                            className="btn-eliminar"
                                                            title="Eliminar atado"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{textAlign: 'center', padding: '10px'}}>
                                                No hay atados registrados
                                            </td>
                                        </tr>
                                    )}
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

export default PesajeModal;
// src/components/modals/PesajeNormalModal.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';
import '../PesajeModal.css';

const PesajeNormalModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
    // === ESTADOS DE DATOS ===
    const [peso, setPeso] = useState(0);
    const [atado, setAtado] = useState(1);
    const [rollos, setRollos] = useState(0);
    const [atados, setAtados] = useState([]);
    const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
    const [calidadTotal, setCalidadTotal] = useState(0);
    const [programados, setProgramados] = useState(0);
    const [cargandoAtados, setCargandoAtados] = useState(true);
    const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);
    
    const loteIdsParam = lineaData?.Lote_IDS ?? '';
    const sobranteParam = 0; 

    // === LÓGICA DE BALANZA Y DATOS ===
    useEffect(() => {
        cargarAtadosExistentes();
    }, [lineaData, operacionId]);
    
    console.log("LINEDATA........", lineaData);
    

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

    console.log("LoteIdParams...........", loteIdsParam);
    

    const cargarAtadosExistentes = async () => {
        try {
            setCargandoAtados(true);
            const res = await axiosInstance.post('/registracion/pesaje/obtener-atados', {
                operacionId: lineaData.Operacion_ID,
                loteIds: loteIdsParam,
                sobrante: sobranteParam
            });

            console.log("operacionId......",lineaData.Operacion_ID);
            console.log("loteIdsParam......",loteIdsParam);
            console.log("sobranteParam......",sobranteParam);
            
            console.log("res........", res);
            
            
            const atadosData = (res.data || []).map(item => ({
                atado: item.Atado || 0,
                rollos: item.Rollos || 0,
                peso: parseFloat(item.Peso) || 0,
                esCalidad: item.Calidad === 1,
                nroEtiqueta: item.Etiqueta,
                idBD: item.IdRegistroPesaje,
                isLatest: false
            }));
            setAtados(atadosData);
            setSobreOrdenTotal(atadosData.filter(a => !a.esCalidad).reduce((sum, a) => sum + a.peso, 0));
            setCalidadTotal(atadosData.filter(a => a.esCalidad).reduce((sum, a) => sum + a.peso, 0));
            const lastAtado = Math.max(...atadosData.map(a => a.atado), 0);
            setAtado(lastAtado + 1);
            setProgramados(parseFloat(lineaData.Programados) || 0);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se cargaron los atados.', 'error');
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

    const handleRegistrar = async () => {
        if (sobreOrdenTotal + calidadTotal <= 0 || atados.length === 0) {
            return Swal.fire('Advertencia', 'No puede registrar sin kilos.', 'warning');
        }
        try {
            await axiosInstance.post('/registracion/pesaje/registrar', {
                operacionId,
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
            console.error(err);
            Swal.fire('Error', err.response?.data?.error || 'Error al registrar.', 'error');
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
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo resetear.', 'error');
        }
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

    // === FUNCIÓN DE IMPRESIÓN EXACTA DEL CÓDIGO VIEJO QUE FUNCIONA ===

    const imprimirEtiqueta = async (itemAtado) => {
        try {
            const confirm = await Swal.fire({
                title: 'Imprimir etiqueta',
                text: `¿Desea imprimir la etiqueta para el atado ${itemAtado.atado}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Imprimir',
                cancelButtonText: 'Cancelar'
            });

            if (confirm.isConfirmed) {
                // EXACTAMENTE LOS MISMOS DATOS QUE EN EL CÓDIGO VIEJO
                let labelData = {
                    parSerieLote: lineaData?.SerieLote || '73291 - 010',
                    parFecha: new Date().toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }),
                    parHora: new Date().toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),

                    parNumeroExterno: lineaData?.NumeroExterno || '25A0674-2',
                    parNotaVenta: lineaData?.NotaVenta || '032000',
                    parCodCliente: lineaData?.CodCliente || '0945',
                    parCliente: lineaData?.Clientes || 'CIMET S.A.',

                    parEspesor: (lineaData?.Espesor?.toFixed(3) || '0.500').toString(),
                    parAncho: (lineaData?.Ancho || '160').toString(),
                    parLargo: (lineaData?.Largo || '0.0').toString(),
                    parRecubrimiento: lineaData?.Recubrimiento || 'NA - N',
                    parCodProducto: lineaData?.CodigoProducto || '0945-PT-AL-FL-0500-0050-1NP-01',

                    parMaterial: lineaData?.Material || 'Aluminio',
                    parAleacion: lineaData?.Aleacion || '1100 -',
                    parTemple: lineaData?.Temple || 'O - O',
                    parTerminacion: lineaData?.Terminacion || 'NA - NA',
                    parCalidad: lineaData?.Calidad || '01 -',
                    parPaquete: '0',
                    parParecer: '',

                    // DIFERENCIA CLAVE: Usar el peso del atado actual
                    parLiquido: itemAtado.peso.toFixed(0),
                    parBruto: (itemAtado.peso + 26).toFixed(0),
                    parTara: '26',
                    parUnid: itemAtado.rollos.toString(),
                    parTipo: 'FL',
                    parNumeroLoteAdicional: '315021'
                };


                // // // HTML EXACTAMENTE IGUAL AL CÓDIGO VIEJO
                const etiquetaHTML = `
                    <div class="etiqueta-container">
                        <!-- Header con logo y serie-lote -->
                        <div class="header-contenedor">
                            <div class="logo-y-serie">
                                <img src="/Logo1.jpg" alt="Logo Sintecrom" class="logo">
                                <span class="serie-lote">${labelData.parSerieLote}</span>
                            </div>
                        </div>

                        <!-- Grid para Cabecera y Dimensiones -->
                        <div class="tabla-top">
                            <!-- Fila 1 - Headers -->
                            <div class="celda numero-externo-h">
                                <div class="label">NUMERO EXTERNO</div>
                            </div>
                            <div class="celda nota-venta-h">
                                <div class="label">NOTA DE VENTA</div>
                            </div>
                            <div class="celda cod-cliente-h">
                                <div class="label">COD.CLIENTE</div>
                            </div>
                            <div class="celda cliente-h">
                                <div class="label">CLIENTE</div>
                            </div>

                            <!-- Fila 2 - Valores principales -->
                            <div class="celda numero-externo-v">
                                <div class="valor-grande">${labelData.parNumeroExterno}</div>
                            </div>
                            <div class="celda nota-venta-v">
                                <div class="valor-grande">${labelData.parNotaVenta}</div>
                            </div>
                            <!-- AQUÍ ESTÁ EL CAMBIO (visible en CSS): Cod Cliente sin borde derecho -->
                            <div class="celda cod-cliente-v">
                                <div class="valor-grande">${labelData.parCodCliente}</div>
                            </div>
                            <div class="celda cliente-v">
                                <div class="valor-grande">${labelData.parCliente}</div>
                            </div>

                            <!-- Fila 3 - Sub headers -->
                            <div class="celda espesor-h">
                                <div class="label">ESPESOR</div>
                            </div>
                            <div class="celda ancho-h">
                                <div class="label">ANCHO</div>
                            </div>
                            <div class="celda largo-h">
                                <div class="label">LARGO</div>
                            </div>
                            <div class="celda cob-h">
                                <div class="label">COB</div>
                            </div>

                            <!-- Fila 4 - Valores dimensiones -->
                            <div class="celda espesor-v">
                                <div class="valor-mediano">${labelData.parEspesor}</div>
                            </div>
                            <div class="celda ancho-v">
                                <div class="valor-mediano">${labelData.parAncho}</div>
                            </div>
                            <div class="celda largo-v">
                                <div class="valor-mediano">${labelData.parLargo}</div>
                            </div>
                            <div class="celda cob-v">
                                <div class="valor-mediano">${labelData.parRecubrimiento}</div>
                            </div>

                            <!-- Código completo - SIN BORDE IZQUIERDO -->
                            <div class="celda codigo-completo">
                                <div class="codigo-texto">${labelData.parCodProducto}</div>
                            </div>
                        </div>

                        <!-- Tabla Material -->
                        <table class="tabla tabla-material">
                            <tr>
                                <th>MATERIAL</th>
                                <th>ALEACION</th>
                                <th>TEMPLE</th>
                                <th>TERMINACION</th>
                                <th>CALIDAD</th>
                                <th>PAQUETE</th>
                                <th>DICTAMEN</th>
                            </tr>
                            <tr>
                                <td>${labelData.parMaterial}</td>
                                <td>${labelData.parAleacion}</td>
                                <td>${labelData.parTemple}</td>
                                <td>${labelData.parTerminacion}</td>
                                <td>${labelData.parCalidad}</td>
                                <td>${labelData.parPaquete}</td>
                                <td>${labelData.parParecer}</td>
                            </tr>
                        </table>

                        <!-- Tabla Pesaje -->
                        <table class="tabla tabla-pesaje">
                            <tr>
                                <th>NETO(Kg)</th>
                                <th>BRUTO(Kg)</th>
                                <th>TARA(Kg)</th>
                                <th>UNID</th>
                                <th>TIPO</th>
                                <th>FECHA</th>
                            </tr>
                            <tr>
                                <td>${labelData.parLiquido}</td>
                                <td>${labelData.parBruto}</td>
                                <td>${labelData.parTara}</td>
                                <td>${labelData.parUnid}</td>
                                <td>${labelData.parTipo}</td>
                                <td>${labelData.parFecha}</td>
                            </tr>
                        </table>

                        <!-- Información adicional -->
                        <div class="info-adicional">
                            <span class="procedencia">Material Origen Brasil y Procedencia Argentina</span>
                            <span class="numero-lote">${labelData.parNumeroLoteAdicional}</span>
                        </div>
                    </div>
                `;

                // // CSS CORREGIDO - AJUSTES PARA QUITAR BORDE EN COD.CLIENTE (VALOR)
                const etiquetaCSS = `
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
                        body { background: white; }

                        .etiqueta-container {
                            /* Ancho reducido 10% (14.5 -> 13.0) */
                            width: 12.0cm !important;
                            /* Alto reducido 10% (10.0 -> 9.0) */
                            height: 9.0cm !important;
                            background: white;
                            /* MARGEN IZQUIERDO DE 2CM APLICADO AQUÍ */
                            margin: 0.5cm 0 0 2.0cm;
                            padding: 0;
                            /* Fuente base ligeramente reducida */
                            font-size: 8pt; 
                            line-height: 1.1;
                            overflow: hidden;
                        }

                        @media print {
                            body {
                                margin: 0 !important;
                                padding: 0 !important;
                                background: white;
                            }
                            .etiqueta-container {
                                margin: 1.0cm 0 0 1.0cm !important;
                                padding: 0 !important;
                                border: none !important;
                                width: 12.5cm !important;
                                height: 10cm !important;
                            }
                            @page {
                                size: 15cm 10.5cm !important;
                                margin: 0 !important;
                            }
                        }

                        /* Header con logo y serie-lote - MÁS ALTO */
                        .header-contenedor {
                            border: 1pt solid black;
                            padding: 0.05cm 0.1cm;
                            margin-bottom: 0.1cm;
                            display: flex;
                            align-items: center;
                            height: 1.5cm;
                        }

                        .logo-y-serie {
                            display: flex;
                            align-items: center;
                            width: 100%;
                        }

                        .logo {
                            height: 1.0cm;
                            width: auto;
                            margin-right: 0.2cm;
                            flex-shrink: 0;
                        }
                        
                        .logo-y-serie > span {
                            font-size: 36pt;
                            font-weight: bold;
                            text-align: center;
                            flex-grow: 1;
                            line-height: 1;
                        }

                        /* Grid para la parte superior - AJUSTADO */
                        .tabla-top {
                            display: grid;
                            grid-template-columns: repeat(7, 1fr);
                            grid-template-rows: repeat(4, auto);
                            border: 1pt solid black;
                            background: white;
                            margin-bottom: 0.05cm;
                            width: 100%;
                            height: 3.5cm;
                        }

                        .celda {
                            border: 1pt solid black;
                            padding: 1px 2px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            background: white;
                        }

                        .label {
                            font-size: 8px;
                            font-weight: normal;
                            letter-spacing: 0.1px;
                        }

                        .valor-grande {
                            font-size: 12px;
                            font-weight: normal;
                            letter-spacing: 0.3px;
                        }

                        .valor-mediano {
                            font-size: 10px;
                            font-weight: normal;
                            letter-spacing: 0.2px;
                        }

                        /* Posicionamiento de celdas */
                        .numero-externo-h { grid-column: 1 / 3; grid-row: 1; }
                        .nota-venta-h { grid-column: 3 / 5; grid-row: 1; }
                        .cod-cliente-h { grid-column: 5 / 6; grid-row: 1; }
                        .cliente-h { grid-column: 6 / 8; grid-row: 1; }

                        .numero-externo-v { grid-column: 1 / 3; grid-row: 2; }
                        .nota-venta-v { grid-column: 3 / 5; grid-row: 2; }
                        
                        /* MODIFICADO: Quitar borde derecho del DATO Cod.Cliente */
                        .cod-cliente-v { 
                            grid-column: 5 / 6; 
                            grid-row: 2; 
                            border-right: none;
                        }
                        
                        /* MODIFICADO: Quitar borde izquierdo del vecino (Cliente) para que desaparezca la línea */
                        .cliente-v { 
                            grid-column: 6 / 8; 
                            grid-row: 2; 
                            border-left: none;
                        }

                        .espesor-h { grid-column: 1; grid-row: 3; }
                        .ancho-h { grid-column: 2; grid-row: 3; }
                        .largo-h { grid-column: 3; grid-row: 3; }
                        .cob-h { grid-column: 4; grid-row: 3; }

                        .espesor-v { grid-column: 1; grid-row: 4; }
                        .ancho-v { grid-column: 2; grid-row: 4; }
                        .largo-v { grid-column: 3; grid-row: 4; }
                        .cob-v { grid-column: 4; grid-row: 4; }

                        /* CÓDIGO COMPLETO */
                        .codigo-completo {
                            grid-column: 5 / 8;
                            grid-row: 3 / 5;
                            font-size: 7px;
                            font-weight: normal;
                            letter-spacing: 0.1px;
                            padding: 2px 4px;
                            text-align: left;
                            background: #f8f8f8;
                            border-top: 1pt solid black;
                            border-right: 1pt solid black;
                            border-bottom: 1pt solid black;
                            border-left: 1pt solid black;
                            display: flex;
                            align-items: center;
                        }
                        
                        .codigo-texto {
                            font-size: 7px;
                            line-height: 1.1;
                            word-break: break-word;
                        }

                        /* Tablas inferiores */
                        .tabla {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 0.05cm;
                            table-layout: fixed;
                            border: 1pt solid black;
                            height: 1.5cm;
                        }

                        .tabla th,
                        .tabla td {
                            border: 1pt solid black;
                            padding: 0.03cm;
                            text-align: center;
                            vertical-align: middle;
                            font-size: 7pt;
                            font-weight: normal;
                        }

                        .tabla th {
                            background-color: #f0f0f0;
                        }

                        /* Tabla Material */
                        .tabla-material th,
                        .tabla-material td {
                            width: calc(100% / 7);
                            font-size: 6pt;
                        }
                        .tabla-material th:last-child, .tabla-material td:last-child {
                            width: 18%;
                        }
                        .tabla-material th:nth-child(5), .tabla-material td:nth-child(5) {
                            width: 10%;
                        }
                        .tabla-material th:nth-child(6), .tabla-material td:nth-child(6) {
                            width: 10%;
                            border-right: none;
                        }

                        /* Tabla Pesaje */
                        .tabla-pesaje th,
                        .tabla-pesaje td {
                            width: calc(100% / 6);
                        }
                        .tabla-pesaje td:last-child {
                            font-size: 6pt;
                        }

                        /* Información adicional */
                        .info-adicional {
                            width: 100%;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            font-size: 7pt;
                            margin-top: 0.02cm;
                            padding: 0.01cm 0;
                            border-top: 1pt solid black;
                            font-weight: normal;
                            height: 0.4cm;
                        }

                        .procedencia {
                            font-style: italic;
                            margin-left: 0.05cm;
                        }

                        .numero-lote {
                            margin-right: 0.05cm;
                        }
                    </style>
                `;




                // // HTML (Mantenemos la versión de Paneles Divididos para que funcione lo de la línea verde)
                // const etiquetaHTML = `
                //     <div class="etiqueta-container">
                //         <!-- Header con logo y serie-lote -->
                //         <div class="header-contenedor">
                //             <div class="logo-y-serie">
                //                 <img src="/Logo1.jpg" alt="Logo Sintecrom" class="logo">
                //                 <span class="serie-lote">${labelData.parSerieLote}</span>
                //             </div>
                //         </div>

                //         <!-- CONTENEDOR DIVIDIDO -->
                //         <div class="tabla-central-split">
                            
                //             <!-- PANEL IZQUIERDO -->
                //             <div class="panel-izquierdo">
                //                 <!-- Fila 1 -->
                //                 <div class="fila-izq header-row border-b">
                //                     <div class="cell-mitad border-r"><div class="label">NUMERO EXTERNO</div></div>
                //                     <div class="cell-mitad"><div class="label">NOTA DE VENTA</div></div>
                //                 </div>
                //                 <!-- Fila 2 -->
                //                 <div class="fila-izq data-row border-b">
                //                     <div class="cell-mitad border-r"><div class="valor-grande">${labelData.parNumeroExterno}</div></div>
                //                     <div class="cell-mitad"><div class="valor-grande">${labelData.parNotaVenta}</div></div>
                //                 </div>
                //                 <!-- Fila 3 -->
                //                 <div class="fila-izq header-row border-b">
                //                     <div class="cell-cuarto border-r"><div class="label">ESPESOR</div></div>
                //                     <div class="cell-cuarto border-r"><div class="label">ANCHO</div></div>
                //                     <div class="cell-cuarto border-r"><div class="label">LARGO</div></div>
                //                     <div class="cell-cuarto"><div class="label">COB</div></div>
                //                 </div>
                //                 <!-- Fila 4 -->
                //                 <div class="fila-izq data-row">
                //                     <div class="cell-cuarto border-r"><div class="valor-mediano">${labelData.parEspesor}</div></div>
                //                     <div class="cell-cuarto border-r"><div class="valor-mediano">${labelData.parAncho}</div></div>
                //                     <div class="cell-cuarto border-r"><div class="valor-mediano">${labelData.parLargo}</div></div>
                //                     <div class="cell-cuarto"><div class="valor-mediano">${labelData.parRecubrimiento}</div></div>
                //                 </div>
                //             </div>

                //             <!-- PANEL DERECHO -->
                //             <div class="panel-derecho">
                //                 <!-- Fila 1 -->
                //                 <div class="fila-der header-row border-b">
                //                     <div class="cell-cod border-r"><div class="label">COD.CLIENTE</div></div>
                //                     <div class="cell-cli"><div class="label">CLIENTE</div></div>
                //                 </div>
                                
                //                 <!-- Fila 2: DATOS EXPANDIDOS -->
                //                 <div class="fila-der data-row-expandido">
                //                     <div class="cell-cod border-r"><div class="valor-grande">${labelData.parCodCliente}</div></div>
                //                     <div class="cell-cli"><div class="valor-grande">${labelData.parCliente}</div></div>
                //                 </div>

                //                 <!-- Fila 3: CÓDIGO (Altura ajustada) -->
                //                 <div class="fila-der code-row border-t">
                //                     <div class="codigo-texto">${labelData.parCodProducto}</div>
                //                 </div>
                //             </div>
                //         </div>

                //         <!-- Tabla Material -->
                //         <table class="tabla tabla-material">
                //             <tr>
                //                 <th>MATERIAL</th>
                //                 <th>ALEACION</th>
                //                 <th>TEMPLE</th>
                //                 <th>TERMINACION</th>
                //                 <th>CALIDAD</th>
                //                 <th>PAQUETE</th>
                //                 <th>DICTAMEN</th>
                //             </tr>
                //             <tr>
                //                 <td>${labelData.parMaterial}</td>
                //                 <td>${labelData.parAleacion}</td>
                //                 <td>${labelData.parTemple}</td>
                //                 <td>${labelData.parTerminacion}</td>
                //                 <td>${labelData.parCalidad}</td>
                //                 <td>${labelData.parPaquete}</td>
                //                 <td>${labelData.parParecer}</td>
                //             </tr>
                //         </table>

                //         <!-- Tabla Pesaje -->
                //         <table class="tabla tabla-pesaje">
                //             <tr>
                //                 <th>NETO(Kg)</th>
                //                 <th>BRUTO(Kg)</th>
                //                 <th>TARA(Kg)</th>
                //                 <th>UNID</th>
                //                 <th>TIPO</th>
                //                 <th>FECHA</th>
                //             </tr>
                //             <tr>
                //                 <td>${labelData.parLiquido}</td>
                //                 <td>${labelData.parBruto}</td>
                //                 <td>${labelData.parTara}</td>
                //                 <td>${labelData.parUnid}</td>
                //                 <td>${labelData.parTipo}</td>
                //                 <td>${labelData.parFecha}</td>
                //             </tr>
                //         </table>

                //         <!-- Información adicional -->
                //         <div class="info-adicional">
                //             <span class="procedencia">Material Origen Brasil y Procedencia Argentina</span>
                //             <span class="numero-lote">${labelData.parNumeroLoteAdicional}</span>
                //         </div>
                //     </div>
                // `;

                // // CSS ACTUALIZADO:
                // // 1. Reducción del 10% en tamaños (14.5cm -> 13cm, etc).
                // // 2. Margen izquierdo aumentado a 2cm.
                // const etiquetaCSS = `
                //     <style>
                //         * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
                //         body { background: white; }

                //         .etiqueta-container {
                //             /* Ancho reducido 10% (14.5 -> 13.0) */
                //             width: 13.0cm !important;
                //             /* Alto reducido 10% (10.0 -> 9.0) */
                //             height: 9.0cm !important;
                //             background: white;
                //             /* MARGEN IZQUIERDO DE 2CM APLICADO AQUÍ */
                //             margin: 0.5cm 0 0 2.0cm;
                //             padding: 0;
                //             /* Fuente base ligeramente reducida */
                //             font-size: 8pt; 
                //             line-height: 1.1;
                //             overflow: hidden;
                //         }

                //         @media print {
                //             body { margin: 0 !important; padding: 0 !important; }
                //             .etiqueta-container {
                //                 /* Aseguramos el margen en impresión */
                //                 margin: 0.5cm 0 0 2.0cm !important; 
                //                 padding: 0 !important; 
                //                 border: none !important;
                //                 width: 13.0cm !important;
                //                 height: 9.0cm !important;
                //             }
                //             @page { 
                //                 /* Definimos un tamaño de papel seguro para contener el margen */
                //                 size: 15.5cm 10cm !important; 
                //                 margin: 0 !important; 
                //             }
                //         }

                //         /* HEADER - Altura reducida (1.5 -> 1.35) */
                //         .header-contenedor {
                //             border: 1pt solid black;
                //             padding: 0.05cm 0.1cm;
                //             margin-bottom: 0.1cm;
                //             display: flex; align-items: center;
                //             height: 1.35cm;
                //         }
                //         .logo-y-serie { display: flex; align-items: center; width: 100%; }
                //         /* Logo reducido */
                //         .logo { height: 0.9cm; width: auto; margin-right: 0.2cm; flex-shrink: 0; }
                //         /* Fuente serie reducida (36pt -> 32pt) */
                //         .logo-y-serie > span { font-size: 32pt; font-weight: bold; text-align: center; flex-grow: 1; line-height: 1; }

                //         /* TABLA CENTRAL - Altura reducida (3.8 -> 3.4) */
                //         .tabla-central-split {
                //             display: flex;
                //             width: 100%;
                //             height: 3.4cm; 
                //             border: 1pt solid black;
                //             margin-bottom: 0.05cm;
                //         }

                //         /* --- Panel Izquierdo --- */
                //         .panel-izquierdo {
                //             width: 57.14%;
                //             border-right: 1pt solid black;
                //             display: flex; flex-direction: column;
                //         }
                //         .fila-izq { display: flex; width: 100%; }
                //         /* Header rows reducidos (0.5 -> 0.45) */
                //         .header-row { height: 0.45cm; background: white; } 
                //         .data-row { flex: 1; display: flex; align-items: center; } 

                //         /* --- Panel Derecho --- */
                //         .panel-derecho {
                //             width: 42.86%;
                //             display: flex; flex-direction: column;
                //         }
                //         .fila-der { display: flex; width: 100%; }
                //         .data-row-expandido { flex-grow: 1; display: flex; align-items: center; }
                        
                //         /* CÓDIGO Y LÍNEA VERDE - Altura reducida (0.7 -> 0.6) */
                //         .code-row {
                //             height: 0.6cm; 
                //             display: flex; align-items: center;
                //             padding-left: 4px; background: #f8f8f8;
                //         }

                //         /* Celdas internas */
                //         .cell-mitad { width: 50%; height: 100%; display: flex; justify-content: center; align-items: center; text-align: center; }
                //         .cell-cuarto { width: 25%; height: 100%; display: flex; justify-content: center; align-items: center; text-align: center; }
                //         .cell-cod { width: 33.33%; height: 100%; display: flex; justify-content: center; align-items: center; text-align: center; }
                //         .cell-cli { width: 66.66%; height: 100%; display: flex; justify-content: center; align-items: center; text-align: center; }

                //         .border-b { border-bottom: 1pt solid black; }
                //         .border-t { border-top: 1pt solid black; }
                //         .border-r { border-right: 1pt solid black; }

                //         /* Tipografía reducida (~10%) */
                //         .label { font-size: 7px; font-weight: normal; letter-spacing: 0.1px; }
                //         .valor-grande { font-size: 11px; font-weight: normal; letter-spacing: 0.3px; }
                //         .valor-mediano { font-size: 9px; font-weight: normal; letter-spacing: 0.2px; }
                //         .codigo-texto { font-size: 6px; line-height: 1.1; word-break: break-word; }

                //         /* TABLAS INFERIORES - Altura reducida (1.7 -> 1.5) */
                //         .tabla { width: 100%; border-collapse: collapse; margin-bottom: 0.05cm; table-layout: fixed; border: 1pt solid black; height: 1.5cm; }
                //         .tabla th, .tabla td { border: 1pt solid black; padding: 0.03cm; text-align: center; vertical-align: middle; font-size: 6pt; font-weight: normal; }
                //         .tabla th { background-color: #f0f0f0; }

                //         /* Ajustes específicos tablas */
                //         .tabla-material th, .tabla-material td { width: calc(100% / 7); }
                //         .tabla-material th:last-child, .tabla-material td:last-child { width: 18%; }
                //         .tabla-material th:nth-child(5), .tabla-material td:nth-child(5) { width: 10%; }
                //         .tabla-material th:nth-child(6), .tabla-material td:nth-child(6) { width: 10%; border-right: none; }
                //         .tabla-pesaje th, .tabla-pesaje td { width: calc(100% / 6); }

                //         /* FOOTER - Altura reducida (0.4 -> 0.35) */
                //         .info-adicional { 
                //             width: 100%; display: flex; justify-content: space-between; align-items: center; 
                //             font-size: 6pt; margin-top: 0.02cm; padding: 0.01cm 0; 
                //             border-top: 1pt solid black; font-weight: normal; 
                //             height: 0.35cm; 
                //         }
                //         .procedencia { font-style: italic; margin-left: 0.05cm; }
                //         .numero-lote { margin-right: 0.05cm; }
                //     </style>
                // `;
















                // Abrir ventana de impresión EXACTAMENTE IGUAL
                const printWindow = window.open('', '_blank', 'width=600,height=400,scrollbars=no');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Etiqueta - ${labelData.parSerieLote}</title>
                        ${etiquetaCSS}
                    </head>
                    <body>
                        ${etiquetaHTML}
                        <script>
                            window.onload = function() {
                                setTimeout(function() {
                                    window.print();
                                }, 500);
                            };
                            window.onafterprint = function() {
                                setTimeout(function() {
                                    window.close();
                                }, 100);
                            };
                        </script>
                    </body>
                    </html>
                `);
                printWindow.document.close();

                Swal.fire('Éxito', 'Etiqueta enviada a impresión.', 'success');
            }
        } catch (error) {
            console.error('Error al imprimir etiqueta:', error);
            Swal.fire('Error', 'Error al preparar la etiqueta para impresión.', 'error');
        }
    };







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

export default PesajeNormalModal;
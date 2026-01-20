// // // // // // PesajeModal.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import './PesajeModal.css';
import PrintLabel from './PrintLabel';

const PesajeModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
    const [peso, setPeso] = useState(0);
    const [atado, setAtado] = useState(1);
    const [rollos, setRollos] = useState(0);
    const [atados, setAtados] = useState([]);
    const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
    const [calidadTotal, setCalidadTotal] = useState(0);
    const [programados, setProgramados] = useState(0);
    const [cargandoAtados, setCargandoAtados] = useState(true);
    const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);

    const loteIdsParam = lineaData?.Lote_IDS || null;
    const sobranteParam = lineaData?.bSobrante ? 1 : (lineaData?.bScrap ? 2 : 0);

    useEffect(() => {
        console.log('lineaData recibido:', lineaData);
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

                const ultimoAtado = Math.max(...atadosData.map(item => item.atado), 0);
                setAtado(ultimoAtado + 1);
            } else {
                setAtados([]);
                setSobreOrdenTotal(0);
                setCalidadTotal(0);
                setAtado(1);
            }

            const etiquetaResponse = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
            setUltimaEtiqueta(etiquetaResponse.data.ultimaEtiqueta);

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
                loteIds: loteIdsParam === 'null' ? null : loteIdsParam,
                sobrante: sobranteParam,
                atados: atados.map(item => ({
                    atado: item.atado,
                    rollos: item.rollos,
                    peso: item.peso,
                    esCalidad: item.esCalidad,
                    esSobreOrden: !item.esCalidad,
                    nroEtiqueta: item.nroEtiqueta,
                    idBD: item.idBD
                })),
                lineaData // ✅ ESTO ES CLAVE: enviar lineaData completo
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
                setUltimaEtiqueta(null);

                Swal.fire('Reset completado', 'Todos los datos han sido reseteados.', 'success');
            } catch (error) {
                console.error('Error al resetear:', error);
                Swal.fire('Error', 'No se pudo completar el reset.', 'error');
            }
        }
    };







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
                let labelData = {
                    parSerieLote: lineaData?.SerieLote || '73291 - 010', // Ajustado según screenshot
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
                    parAncho: (lineaData?.Ancho || '160').toString(), // Ajustado según screenshot
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

                    parLiquido: itemAtado.peso.toFixed(0),
                    parBruto: (itemAtado.peso + 26).toFixed(0),
                    parTara: '26',
                    parUnid: itemAtado.rollos.toString(),
                    parTipo: 'FL',
                    parNumeroLoteAdicional: '315021'
                };

                const etiquetaHTML = `
                    <div class="etiqueta-container">
                        <!-- Header con logo y serie-lote -->
                        <div class="header-contenedor">
                            <div class="logo-y-serie">
                                <img src="/Logo1.jpg" alt="Logo Sintecrom" class="logo">
                                <span class="serie-lote">${labelData.parSerieLote}</span>
                            </div>
                        </div>

                        <!-- Grid para Cabecera y Dimensiones (sin celdas vacías) -->
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

                            <!-- Código completo - spans rows 3-4, cols 5-7 -->
                            <div class="celda codigo-completo">
                                <div>${labelData.parCodProducto}</div>
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

                        <!-- Información adicional PEGADA -->
                        <div class="info-adicional">
                            <span class="procedencia">Material Origen Brasil y Procedencia Argentina</span>
                            <span class="numero-lote">${labelData.parNumeroLoteAdicional}</span>
                        </div>
                    </div>
                `;

                const etiquetaCSS = `
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                            font-family: Arial, sans-serif;
                        }

                        body {
                            background: white;
                            margin: 0;
                            padding: 0;
                        }

                        .etiqueta-container {
                            width: 14.5cm !important;
                            height: 10cm !important; /* Altura reducida un poco más */
                            background: white;
                            margin: 0.5cm 0 0 0.5cm; /* Margen superior e izquierdo de 0.5cm */
                            padding: 0; /* Padding cero para usar todo el espacio */
                            font-size: 9pt;
                            line-height: 1.1; /* Reducir line-height para mayor compacidad */
                            overflow: hidden; /* Evitar desbordes */
                        }

                        @media print {
                            body {
                                margin: 0 !important;
                                padding: 0 !important;
                                background: white;
                            }
                            .etiqueta-container {
                                margin: 0.5cm 0 0 0.5cm !important; /* Márgenes en print */
                                padding: 0 !important;
                                border: none !important;
                                width: 14.5cm !important;
                                height: 10cm !important;
                            }
                            @page {
                                size: 15cm 10.5cm !important; /* Tamaño de página ajustado */
                                margin: 0 !important;
                            }
                        }

                        /* Header con logo y serie-lote */
                        .header-contenedor {
                            border: 1pt solid black;
                            padding: 0.05cm 0.1cm;
                            margin-bottom: 0.05cm;
                            display: flex;
                            align-items: center;
                            height: 1.2cm; /* Altura aumentada para mejor visual del número de lote y serie */
                        }

                        .logo-y-serie {
                            display: flex;
                            align-items: center;
                            width: 100%;
                        }

                        .logo {
                            height: 0.8cm; /* Altura del logo ajustada proporcionalmente */
                            width: auto;
                            margin-right: 0.2cm;
                            flex-shrink: 0;
                        }
                        
                        .logo-y-serie > span {
                            font-size: 32pt;
                            font-weight: bold;
                            text-align: center;
                            flex-grow: 1;
                            line-height: 1;
                        }

                        /* Grid para la parte superior */
                        .tabla-top {
                            display: grid;
                            grid-template-columns: repeat(7, 1fr);
                            grid-template-rows: repeat(4, auto);
                            border: 1pt solid black;
                            background: white;
                            margin-bottom: 0.05cm;
                            width: 100%;
                            height: 4cm; /* Altura reducida proporcionalmente */
                        }

                        .celda {
                            border: 1pt solid black;
                            padding: 1px 2px; /* Padding ajustado */
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
                        .cod-cliente-v { grid-column: 5 / 6; grid-row: 2; }
                        .cliente-v { grid-column: 6 / 8; grid-row: 2; }

                        .espesor-h { grid-column: 1; grid-row: 3; }
                        .ancho-h { grid-column: 2; grid-row: 3; }
                        .largo-h { grid-column: 3; grid-row: 3; }
                        .cob-h { grid-column: 4; grid-row: 3; }

                        .espesor-v { grid-column: 1; grid-row: 4; }
                        .ancho-v { grid-column: 2; grid-row: 4; }
                        .largo-v { grid-column: 3; grid-row: 4; }
                        .cob-v { grid-column: 4; grid-row: 4; }

                        .codigo-completo {
                            grid-column: 5 / 8;
                            grid-row: 3 / 5;
                            font-size: 8px;
                            font-weight: normal;
                            letter-spacing: 0.1px;
                            padding: 2px 4px;
                            text-align: left;
                            background: #f8f8f8;
                            border: 1pt solid black;
                        }

                        /* Tablas inferiores */
                        .tabla {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 0.05cm;
                            table-layout: fixed;
                            border: 1pt solid black;
                            height: 1.9cm; /* Altura igual a la parte superior, reducida */
                        }

                        .tabla th,
                        .tabla td {
                            border: 1pt solid black;
                            padding: 0.03cm; /* Padding ajustado para más altura interna */
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
                            padding: 0.02cm 0;
                            border-top: 1pt solid black;
                            font-weight: normal;
                            height: 0.5cm; /* Altura reducida proporcionalmente */
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
                        setAtado(renumerados.length + 1);
                    } else {
                        setAtado(1);
                        setUltimaEtiqueta(null);
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








// // // // // // // PesajeModal.jsx

// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './PesajeModal.css';
// import PrintLabel from './PrintLabel';

// const PesajeModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
//     const [peso, setPeso] = useState(0);
//     const [atado, setAtado] = useState(1);
//     const [rollos, setRollos] = useState(0);
//     const [atados, setAtados] = useState([]);
//     const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
//     const [calidadTotal, setCalidadTotal] = useState(0);
//     const [programados, setProgramados] = useState(0);
//     const [cargandoAtados, setCargandoAtados] = useState(true);
//     const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);

//     const loteIdsParam = lineaData?.Lote_IDS || null;
//     const sobranteParam = lineaData?.bSobrante ? 1 : (lineaData?.bScrap ? 2 : 0);

//     useEffect(() => {
//         console.log('lineaData recibido:', lineaData);
//         cargarAtadosExistentes();
//     }, [lineaData, operacionId]);

//     useEffect(() => {
//         const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
//         let pollingInterval = null;

//         const updatePesoDisplay = async () => {
//             try {
//                 const response = await axiosInstance.get(`${agenteUrl}/peso`);
//                 if (response.data?.success) {
//                     const nuevoPeso = parseFloat(response.data.peso) || 0;
//                     setPeso(nuevoPeso);
//                 }
//             } catch (error) {
//                 setPeso(0);
//             }
//         };

//         pollingInterval = setInterval(updatePesoDisplay, 1200);
//         return () => clearInterval(pollingInterval);
//     }, []);

//     const cargarAtadosExistentes = async () => {
//         try {
//             setCargandoAtados(true);

//             const response = await axiosInstance.post('/registracion/pesaje/obtener-atados', {
//                 operacionId,
//                 loteIds: loteIdsParam,
//                 sobrante: sobranteParam
//             });

//             console.log(response);

//             if (response.data && response.data.length > 0) {
//                 const atadosData = response.data.map(item => ({
//                     atado: item.Atado || 0,
//                     rollos: item.Rollos || 0,
//                     peso: parseFloat(item.Peso) || 0,
//                     esCalidad: item.Calidad === 1,
//                     nroEtiqueta: item.Etiqueta,
//                     idBD: item.IdRegistroPesaje,
//                     isLatest: false
//                 }));

//                 // Deduplicar por nroEtiqueta para evitar entradas repetidas del backend
//                 const uniqueAtados = atadosData.filter((item, index, arr) => 
//                     index === arr.findIndex(t => t.nroEtiqueta === item.nroEtiqueta)
//                 );

//                 setAtados(uniqueAtados);

//                 const soTotal = uniqueAtados
//                     .filter(item => !item.esCalidad)
//                     .reduce((sum, item) => sum + item.peso, 0);
//                 const calTotal = uniqueAtados
//                     .filter(item => item.esCalidad)
//                     .reduce((sum, item) => sum + item.peso, 0);
//                 setSobreOrdenTotal(soTotal);
//                 setCalidadTotal(calTotal);

//                 const ultimoAtado = Math.max(...uniqueAtados.map(item => item.atado), 0);
//                 setAtado(ultimoAtado + 1);
//             } else {
//                 setAtados([]);
//                 setSobreOrdenTotal(0);
//                 setCalidadTotal(0);
//                 setAtado(1);
//             }

//             const etiquetaResponse = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
//             setUltimaEtiqueta(etiquetaResponse.data.ultimaEtiqueta);

//             if (lineaData) {
//                 setProgramados(parseFloat(lineaData.Programados) || 0);
//             }
//         } catch (error) {
//             console.error('Error al cargar atados existentes:', error);
//             Swal.fire('Error', 'No se pudieron cargar los atados existentes o el número de etiqueta.', 'error');
//         } finally {
//             setCargandoAtados(false);
//         }
//     };

//     const handleSobreOrden = async () => {
//         if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese un peso válido.', 'warning');
//         if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese la cantidad de rollos.', 'warning');
//         if (!ultimaEtiqueta) return Swal.fire('Error', 'El número de etiqueta no está inicializado.', 'error');

//         try {
//             const etiquetaResponse = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
//             const nroEtiqueta = etiquetaResponse.data.nroEtiqueta;

//             const nuevoAtado = {
//                 atado,
//                 rollos,
//                 peso,
//                 esCalidad: false,
//                 nroEtiqueta,
//                 isLatest: true
//             };

//             setAtados(prev => {
//                 const updatedAtados = prev.map(item => ({ ...item, isLatest: false }));
//                 return [...updatedAtados, nuevoAtado];
//             });
//             setSobreOrdenTotal(prev => prev + peso);
//             setAtado(prev => prev + 1);
//             setRollos(0);
//             setUltimaEtiqueta(nroEtiqueta);
//         } catch (error) {
//             console.error('Error al generar etiqueta:', error);
//             Swal.fire('Error', 'No se pudo generar el número de etiqueta.', 'error');
//         }
//     };

//     const handleCalidad = async () => {
//         if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese un peso válido.', 'warning');
//         if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese la cantidad de rollos.', 'warning');
//         if (!ultimaEtiqueta) return Swal.fire('Error', 'El número de etiqueta no está inicializado.', 'error');

//         try {
//             const etiquetaResponse = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
//             const nroEtiqueta = etiquetaResponse.data.nroEtiqueta;

//             const nuevoAtado = {
//                 atado,
//                 rollos,
//                 peso,
//                 esCalidad: true,
//                 nroEtiqueta,
//                 isLatest: true
//             };

//             setAtados(prev => {
//                 const updatedAtados = prev.map(item => ({ ...item, isLatest: false }));
//                 return [...updatedAtados, nuevoAtado];
//             });
//             setCalidadTotal(prev => prev + peso);
//             setAtado(prev => prev + 1);
//             setRollos(0);
//             setUltimaEtiqueta(nroEtiqueta);
//         } catch (error) {
//             console.error('Error al generar etiqueta:', error);
//             Swal.fire('Error', 'No se pudo generar el número de etiqueta.', 'error');
//         }
//     };

//     const handleRegistrar = async () => {
//         if (sobreOrdenTotal + calidadTotal <= 0 || atados.length === 0) {
//             return Swal.fire('Advertencia', 'No puede registrar sin kilos y rollos.', 'warning');
//         }

//         try {
//             // await axiosInstance.post('/registracion/pesaje/registrar', {
//             //     operacionId,
//             //     loteIds: loteIdsParam,
//             //     sobrante: sobranteParam,
//             //     atados: atados.map(item => ({
//             //         atado: item.atado,
//             //         rollos: item.rollos,
//             //         peso: item.peso,
//             //         esCalidad: item.esCalidad,
//             //         esSobreOrden: !item.esCalidad,
//             //         nroEtiqueta: item.nroEtiqueta,
//             //         idBD: item.idBD
//             //     }))
//             // });

//             await axiosInstance.post('/registracion/pesaje/registrar', {
//                 operacionId,
//                 loteIds: loteIdsParam,
//                 sobrante: sobranteParam,
//                 atados: atados.map(item => ({
//                     atado: item.atado,
//                     rollos: item.rollos,
//                     peso: item.peso,
//                     esCalidad: item.esCalidad,
//                     esSobreOrden: !item.esCalidad,
//                     nroEtiqueta: item.nroEtiqueta,
//                     idBD: item.idBD
//                 })),
//                 lineaData: lineaData // <-- ¡ESTO ES CLAVE!
//             });

//             /////////////////////////////////////////////////////////////////////////////////////////7
            
//             console.log('Enviando a registrar:', {
//                 operacionId,
//                 loteIds: loteIdsParam,
//                 sobrante: sobranteParam,
//                 atados,
//                 lineaData
//             });

//             Swal.fire('Éxito', 'Pesaje registrado correctamente.', 'success');
//             onSuccess?.();
//             onClose();
//         } catch (error) {
//             console.error('Error al registrar:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al registrar el pesaje.', 'error');
//         }
//     };

//     const handleReset = async () => {
//         const confirm = await Swal.fire({
//             title: '¿Borrar todo?',
//             text: 'Se borrará todo lo registrado en esta sesión y en la base de datos para esta operación/lote.',
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Sí, borrar',
//             cancelButtonText: 'Cancelar'
//         });

//         if (confirm.isConfirmed) {
//             try {
//                 await axiosInstance.post('/registracion/pesaje/reset', {
//                     operacionId,
//                     loteIds: loteIdsParam,
//                     sobrante: sobranteParam
//                 });

//                 setAtados([]);
//                 setSobreOrdenTotal(0);
//                 setCalidadTotal(0);
//                 setAtado(1);
//                 setRollos(0);
//                 setPeso(0);
//                 setUltimaEtiqueta(null);

//                 Swal.fire('Reset completado', 'Todos los datos han sido reseteados.', 'success');
//             } catch (error) {
//                 console.error('Error al resetear:', error);
//                 Swal.fire('Error', 'No se pudo completar el reset.', 'error');
//             }
//         }
//     };





//     const imprimirEtiqueta = async (itemAtado) => {
//         try {
//             const confirm = await Swal.fire({
//                 title: 'Imprimir etiqueta',
//                 text: `¿Desea imprimir la etiqueta para el atado ${itemAtado.atado}?`,
//                 icon: 'question',
//                 showCancelButton: true,
//                 confirmButtonText: 'Imprimir',
//                 cancelButtonText: 'Cancelar'
//             });

//             if (confirm.isConfirmed) {
//                 let labelData = {
//                     parSerieLote: lineaData?.SerieLote || '73291 - 010', // Ajustado según screenshot
//                     parFecha: new Date().toLocaleDateString('es-AR', {
//                         day: '2-digit',
//                         month: '2-digit',
//                         year: 'numeric'
//                     }),
//                     parHora: new Date().toLocaleTimeString('es-AR', {
//                         hour: '2-digit',
//                         minute: '2-digit'
//                     }),

//                     parNumeroExterno: lineaData?.NumeroExterno || '25A0674-2',
//                     parNotaVenta: lineaData?.NotaVenta || '032000',
//                     parCodCliente: lineaData?.CodCliente || '0945',
//                     parCliente: lineaData?.Clientes || 'CIMET S.A.',

//                     parEspesor: (lineaData?.Espesor?.toFixed(3) || '0.500').toString(),
//                     parAncho: (lineaData?.Ancho || '160').toString(), // Ajustado según screenshot
//                     parLargo: (lineaData?.Largo || '0.0').toString(),
//                     parRecubrimiento: lineaData?.Recubrimiento || 'NA - N',
//                     parCodProducto: lineaData?.CodigoProducto || '0945-PT-AL-FL-0500-0050-1NP-01',

//                     parMaterial: lineaData?.Material || 'Aluminio',
//                     parAleacion: lineaData?.Aleacion || '1100 -',
//                     parTemple: lineaData?.Temple || 'O - O',
//                     parTerminacion: lineaData?.Terminacion || 'NA - NA',
//                     parCalidad: lineaData?.Calidad || '01 -',
//                     parPaquete: '0',
//                     parParecer: '',

//                     parLiquido: itemAtado.peso.toFixed(0),
//                     parBruto: (itemAtado.peso + 26).toFixed(0),
//                     parTara: '26',
//                     parUnid: itemAtado.rollos.toString(),
//                     parTipo: 'FL',
//                     parNumeroLoteAdicional: '315021'
//                 };

//                 const etiquetaHTML = `
//                     <div class="etiqueta-container">
//                         <!-- Header con logo y serie-lote -->
//                         <div class="header-contenedor">
//                             <div class="logo-y-serie">
//                                 <img src="/Logo1.jpg" alt="Logo Sintecrom" class="logo">
//                                 <span class="serie-lote">${labelData.parSerieLote}</span>
//                             </div>
//                         </div>

//                         <!-- Grid para Cabecera y Dimensiones (sin celdas vacías) -->
//                         <div class="tabla-top">
//                             <!-- Fila 1 - Headers -->
//                             <div class="celda numero-externo-h">
//                                 <div class="label">NUMERO EXTERNO</div>
//                             </div>
//                             <div class="celda nota-venta-h">
//                                 <div class="label">NOTA DE VENTA</div>
//                             </div>
//                             <div class="celda cod-cliente-h">
//                                 <div class="label">COD.CLIENTE</div>
//                             </div>
//                             <div class="celda cliente-h">
//                                 <div class="label">CLIENTE</div>
//                             </div>

//                             <!-- Fila 2 - Valores principales -->
//                             <div class="celda numero-externo-v">
//                                 <div class="valor-grande">${labelData.parNumeroExterno}</div>
//                             </div>
//                             <div class="celda nota-venta-v">
//                                 <div class="valor-grande">${labelData.parNotaVenta}</div>
//                             </div>
//                             <div class="celda cod-cliente-v">
//                                 <div class="valor-grande">${labelData.parCodCliente}</div>
//                             </div>
//                             <div class="celda cliente-v">
//                                 <div class="valor-grande">${labelData.parCliente}</div>
//                             </div>

//                             <!-- Fila 3 - Sub headers -->
//                             <div class="celda espesor-h">
//                                 <div class="label">ESPESOR</div>
//                             </div>
//                             <div class="celda ancho-h">
//                                 <div class="label">ANCHO</div>
//                             </div>
//                             <div class="celda largo-h">
//                                 <div class="label">LARGO</div>
//                             </div>
//                             <div class="celda cob-h">
//                                 <div class="label">COB</div>
//                             </div>

//                             <!-- Fila 4 - Valores dimensiones -->
//                             <div class="celda espesor-v">
//                                 <div class="valor-mediano">${labelData.parEspesor}</div>
//                             </div>
//                             <div class="celda ancho-v">
//                                 <div class="valor-mediano">${labelData.parAncho}</div>
//                             </div>
//                             <div class="celda largo-v">
//                                 <div class="valor-mediano">${labelData.parLargo}</div>
//                             </div>
//                             <div class="celda cob-v">
//                                 <div class="valor-mediano">${labelData.parRecubrimiento}</div>
//                             </div>

//                             <!-- Código completo - spans rows 3-4, cols 5-7 -->
//                             <div class="celda codigo-completo">
//                                 <div>${labelData.parCodProducto}</div>
//                             </div>
//                         </div>

//                         <!-- Tabla Material -->
//                         <table class="tabla tabla-material">
//                             <tr>
//                                 <th>MATERIAL</th>
//                                 <th>ALEACION</th>
//                                 <th>TEMPLE</th>
//                                 <th>TERMINACION</th>
//                                 <th>CALIDAD</th>
//                                 <th>PAQUETE</th>
//                                 <th>DICTAMEN</th>
//                             </tr>
//                             <tr>
//                                 <td>${labelData.parMaterial}</td>
//                                 <td>${labelData.parAleacion}</td>
//                                 <td>${labelData.parTemple}</td>
//                                 <td>${labelData.parTerminacion}</td>
//                                 <td>${labelData.parCalidad}</td>
//                                 <td>${labelData.parPaquete}</td>
//                                 <td>${labelData.parParecer}</td>
//                             </tr>
//                         </table>

//                         <!-- Tabla Pesaje -->
//                         <table class="tabla tabla-pesaje">
//                             <tr>
//                                 <th>NETO(Kg)</th>
//                                 <th>BRUTO(Kg)</th>
//                                 <th>TARA(Kg)</th>
//                                 <th>UNID</th>
//                                 <th>TIPO</th>
//                                 <th>FECHA</th>
//                             </tr>
//                             <tr>
//                                 <td>${labelData.parLiquido}</td>
//                                 <td>${labelData.parBruto}</td>
//                                 <td>${labelData.parTara}</td>
//                                 <td>${labelData.parUnid}</td>
//                                 <td>${labelData.parTipo}</td>
//                                 <td>${labelData.parFecha}</td>
//                             </tr>
//                         </table>

//                         <!-- Información adicional PEGADA -->
//                         <div class="info-adicional">
//                             <span class="procedencia">Material Origen Brasil y Procedencia Argentina</span>
//                             <span class="numero-lote">${labelData.parNumeroLoteAdicional}</span>
//                         </div>
//                     </div>
//                 `;

//                 const etiquetaCSS = `
//                     <style>
//                         * {
//                             margin: 0;
//                             padding: 0;
//                             box-sizing: border-box;
//                             font-family: Arial, sans-serif;
//                         }

//                         body {
//                             background: white;
//                             margin: 0;
//                             padding: 0;
//                         }

//                         .etiqueta-container {
//                             width: 14.5cm !important;
//                             height: 10cm !important; /* Altura reducida un poco más */
//                             background: white;
//                             margin: 0.5cm 0 0 0.5cm; /* Margen superior e izquierdo de 0.5cm */
//                             padding: 0; /* Padding cero para usar todo el espacio */
//                             font-size: 9pt;
//                             line-height: 1.1; /* Reducir line-height para mayor compacidad */
//                             overflow: hidden; /* Evitar desbordes */
//                         }

//                         @media print {
//                             body {
//                                 margin: 0 !important;
//                                 padding: 0 !important;
//                                 background: white;
//                             }
//                             .etiqueta-container {
//                                 margin: 0.5cm 0 0 0.5cm !important; /* Márgenes en print */
//                                 padding: 0 !important;
//                                 border: none !important;
//                                 width: 14.5cm !important;
//                                 height: 10cm !important;
//                             }
//                             @page {
//                                 size: 15cm 10.5cm !important; /* Tamaño de página ajustado */
//                                 margin: 0 !important;
//                             }
//                         }

//                         /* Header con logo y serie-lote */
//                         .header-contenedor {
//                             border: 1pt solid black;
//                             padding: 0.05cm 0.1cm;
//                             margin-bottom: 0.05cm;
//                             display: flex;
//                             align-items: center;
//                             height: 1.2cm; /* Altura aumentada para mejor visual del número de lote y serie */
//                         }

//                         .logo-y-serie {
//                             display: flex;
//                             align-items: center;
//                             width: 100%;
//                         }

//                         .logo {
//                             height: 0.8cm; /* Altura del logo ajustada proporcionalmente */
//                             width: auto;
//                             margin-right: 0.2cm;
//                             flex-shrink: 0;
//                         }
                        
//                         .logo-y-serie > span {
//                             font-size: 32pt;
//                             font-weight: bold;
//                             text-align: center;
//                             flex-grow: 1;
//                             line-height: 1;
//                         }

//                         /* Grid para la parte superior */
//                         .tabla-top {
//                             display: grid;
//                             grid-template-columns: repeat(7, 1fr);
//                             grid-template-rows: repeat(4, auto);
//                             border: 1pt solid black;
//                             background: white;
//                             margin-bottom: 0.05cm;
//                             width: 100%;
//                             height: 4cm; /* Altura reducida proporcionalmente */
//                         }

//                         .celda {
//                             border: 1pt solid black;
//                             padding: 1px 2px; /* Padding ajustado */
//                             display: flex;
//                             justify-content: center;
//                             align-items: center;
//                             text-align: center;
//                             background: white;
//                         }

//                         .label {
//                             font-size: 8px;
//                             font-weight: normal;
//                             letter-spacing: 0.1px;
//                         }

//                         .valor-grande {
//                             font-size: 12px;
//                             font-weight: normal;
//                             letter-spacing: 0.3px;
//                         }

//                         .valor-mediano {
//                             font-size: 10px;
//                             font-weight: normal;
//                             letter-spacing: 0.2px;
//                         }

//                         /* Posicionamiento de celdas */
//                         .numero-externo-h { grid-column: 1 / 3; grid-row: 1; }
//                         .nota-venta-h { grid-column: 3 / 5; grid-row: 1; }
//                         .cod-cliente-h { grid-column: 5 / 6; grid-row: 1; }
//                         .cliente-h { grid-column: 6 / 8; grid-row: 1; }

//                         .numero-externo-v { grid-column: 1 / 3; grid-row: 2; }
//                         .nota-venta-v { grid-column: 3 / 5; grid-row: 2; }
//                         .cod-cliente-v { grid-column: 5 / 6; grid-row: 2; }
//                         .cliente-v { grid-column: 6 / 8; grid-row: 2; }

//                         .espesor-h { grid-column: 1; grid-row: 3; }
//                         .ancho-h { grid-column: 2; grid-row: 3; }
//                         .largo-h { grid-column: 3; grid-row: 3; }
//                         .cob-h { grid-column: 4; grid-row: 3; }

//                         .espesor-v { grid-column: 1; grid-row: 4; }
//                         .ancho-v { grid-column: 2; grid-row: 4; }
//                         .largo-v { grid-column: 3; grid-row: 4; }
//                         .cob-v { grid-column: 4; grid-row: 4; }

//                         .codigo-completo {
//                             grid-column: 5 / 8;
//                             grid-row: 3 / 5;
//                             font-size: 8px;
//                             font-weight: normal;
//                             letter-spacing: 0.1px;
//                             padding: 2px 4px;
//                             text-align: left;
//                             background: #f8f8f8;
//                             border: 1pt solid black;
//                         }

//                         /* Tablas inferiores */
//                         .tabla {
//                             width: 100%;
//                             border-collapse: collapse;
//                             margin-bottom: 0.05cm;
//                             table-layout: fixed;
//                             border: 1pt solid black;
//                             height: 1.9cm; /* Altura igual a la parte superior, reducida */
//                         }

//                         .tabla th,
//                         .tabla td {
//                             border: 1pt solid black;
//                             padding: 0.03cm; /* Padding ajustado para más altura interna */
//                             text-align: center;
//                             vertical-align: middle;
//                             font-size: 7pt;
//                             font-weight: normal;
//                         }

//                         .tabla th {
//                             background-color: #f0f0f0;
//                         }

//                         /* Tabla Material */
//                         .tabla-material th,
//                         .tabla-material td {
//                             width: calc(100% / 7);
//                             font-size: 6pt;
//                         }
//                         .tabla-material th:last-child, .tabla-material td:last-child {
//                             width: 18%;
//                         }
//                         .tabla-material th:nth-child(5), .tabla-material td:nth-child(5) {
//                             width: 10%;
//                         }
//                         .tabla-material th:nth-child(6), .tabla-material td:nth-child(6) {
//                             width: 10%;
//                             border-right: none;
//                         }

//                         /* Tabla Pesaje */
//                         .tabla-pesaje th,
//                         .tabla-pesaje td {
//                             width: calc(100% / 6);
//                         }
//                         .tabla-pesaje td:last-child {
//                             font-size: 6pt;
//                         }

//                         /* Información adicional */
//                         .info-adicional {
//                             width: 100%;
//                             display: flex;
//                             justify-content: space-between;
//                             align-items: center;
//                             font-size: 7pt;
//                             margin-top: 0.02cm;
//                             padding: 0.02cm 0;
//                             border-top: 1pt solid black;
//                             font-weight: normal;
//                             height: 0.5cm; /* Altura reducida proporcionalmente */
//                         }

//                         .procedencia {
//                             font-style: italic;
//                             margin-left: 0.05cm;
//                         }

//                         .numero-lote {
//                             margin-right: 0.05cm;
//                         }
//                     </style>
//                 `;

//                 const printWindow = window.open('', '_blank', 'width=600,height=400,scrollbars=no');
//                 printWindow.document.write(`
//                     <!DOCTYPE html>
//                     <html>
//                     <head>
//                         <title>Etiqueta - ${labelData.parSerieLote}</title>
//                         ${etiquetaCSS}
//                     </head>
//                     <body>
//                         ${etiquetaHTML}
//                         <script>
//                             window.onload = function() {
//                                 setTimeout(function() {
//                                     window.print();
//                                 }, 500);
//                             };
//                             window.onafterprint = function() {
//                                 setTimeout(function() {
//                                     window.close();
//                                 }, 100);
//                             };
//                         </script>
//                     </body>
//                     </html>
//                 `);
//                 printWindow.document.close();

//                 Swal.fire('Éxito', 'Etiqueta enviada a impresión.', 'success');
//             }
//         } catch (error) {
//             console.error('Error al imprimir etiqueta:', error);
//             Swal.fire('Error', 'Error al preparar la etiqueta para impresión.', 'error');
//         }
//     };


//     const handleEliminarAtado = async (atadoAEliminar, index) => {
//         if (!atadoAEliminar.isLatest) {
//             Swal.fire('Advertencia', 'Solo se puede eliminar el último atado registrado.', 'warning');
//             return;
//         }

//         const confirm = await Swal.fire({
//             title: '¿Eliminar atado?',
//             text: `¿Está seguro que desea eliminar el atado ${atadoAEliminar.atado} (Peso: ${atadoAEliminar.peso.toFixed(2)} Kg, Nro. Etiqueta: ${atadoAEliminar.nroEtiqueta})?`,
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Sí, eliminar',
//             cancelButtonText: 'Cancelar'
//         });

//         if (confirm.isConfirmed) {
//             try {
//                 if (atadoAEliminar.idBD) {
//                     await axiosInstance.post('/registracion/pesaje/eliminar-atado', {
//                         idRegistroPesaje: atadoAEliminar.idBD,
//                         operacionId: operacionId,
//                         loteIds: loteIdsParam,
//                         sobrante: sobranteParam
//                     });
//                     Swal.fire('Eliminado', 'Atado eliminado de la base de datos.', 'success');
//                 } else {
//                     Swal.fire('Eliminado', 'Atado eliminado de la sesión actual.', 'success');
//                 }

//                 setAtados(prevAtados => {
//                     const nuevosAtados = prevAtados.filter((_, i) => i !== index);

//                     const renumerados = nuevosAtados.map((atado, i) => ({
//                         ...atado,
//                         atado: i + 1
//                     }));

//                     const newSoTotal = renumerados
//                         .filter(item => !item.esCalidad)
//                         .reduce((sum, item) => sum + item.peso, 0);
//                     const newCalTotal = renumerados
//                         .filter(item => item.esCalidad)
//                         .reduce((sum, item) => sum + item.peso, 0);

//                     setSobreOrdenTotal(newSoTotal);
//                     setCalidadTotal(newCalTotal);

//                     if (renumerados.length > 0) {
//                         const lastIndex = renumerados.length - 1;
//                         renumerados[lastIndex] = { ...renumerados[lastIndex], isLatest: true };
//                         setAtado(renumerados.length + 1);
//                     } else {
//                         setAtado(1);
//                         setUltimaEtiqueta(null);
//                     }

//                     return renumerados;
//                 });
//             } catch (error) {
//                 console.error('Error al eliminar atado:', error);
//                 Swal.fire('Error', error.response?.data?.error || 'Error al eliminar el atado.', 'error');
//             }
//         }
//     };

//     return (
//         <div className="pesaje-modal-overlay">
//             <div className="pesaje-modal">
//                 <div className="modal-header">
//                     <h3>Pesaje - {lineaData?.Ancho} x {lineaData?.Cuchillas}</h3>
//                     <button onClick={onClose}>&times;</button>
//                 </div>

//                 <div className="modal-body">
//                     <div className="info-panel">
//                         <div>Serie-Lote: {lineaData?.SerieLote || 'N/A'}{lineaData?.SerieLote === undefined ? ' (Dato no recibido)' : ''}</div>
//                         <div>Cortes: {lineaData?.Cuchillas}</div>
//                         <div>Nro.Matching: {lineaData?.Matching}</div>
//                         <div>Kgs. Programados: {programados.toFixed(2)}</div>
//                     </div>

//                     <div className="pesaje-section">
//                         <label>Peso Balanza:</label>
//                         <input
//                             type="number"
//                             value={peso.toFixed(3)}
//                             readOnly
//                             className="peso-input"
//                             placeholder="Esperando lectura..."
//                             step="0.001"
//                         />
//                     </div>

//                     <div className="totales">
//                         <div>Kg. Sobre Orden: {sobreOrdenTotal.toFixed(2)}</div>
//                         <div>Kg. Calidad: {calidadTotal.toFixed(2)}</div>
//                     </div>

//                     <div className="atados-section">
//                         <label>Atado: {atado}</label>
//                         <label>Rollos: </label>
//                         <input
//                             type="number"
//                             value={rollos}
//                             onChange={(e) => setRollos(parseInt(e.target.value) || 0)}
//                             placeholder="Rollos"
//                             min="0"
//                         />
//                         <button onClick={handleSobreOrden} className="btn-so">Sobre Orden</button>
//                         <button onClick={handleCalidad} className="btn-calidad">Calidad</button>
//                     </div>

//                     <div className="grilla-atados">
//                         <h4>Atados Registrados</h4>
//                         {cargandoAtados ? (
//                             <div className="cargando-atados">Cargando atados existentes...</div>
//                         ) : (
//                             <table>
//                                 <thead>
//                                     <tr>
//                                         <th>Atado</th>
//                                         <th>Rollos</th>
//                                         <th>Peso</th>
//                                         <th>Calidad</th>
//                                         <th>Nro. Etiqueta</th>
//                                         <th>Acciones</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {atados.length > 0 ? (
//                                         atados.map((item, idx) => (
//                                             <tr key={idx}>
//                                                 <td>{item.atado}</td>
//                                                 <td>{item.rollos}</td>
//                                                 <td>{item.peso.toFixed(2)}</td>
//                                                 <td>{item.esCalidad ? '✓' : ''}</td>
//                                                 <td>{item.nroEtiqueta}</td>
//                                                 <td className="acciones-atado">
//                                                     <button
//                                                         onClick={() => imprimirEtiqueta(item)}
//                                                         className="btn-imprimir"
//                                                         title="Imprimir etiqueta"
//                                                     >
//                                                         🖨️
//                                                     </button>
//                                                     {item.isLatest && (
//                                                         <button
//                                                             onClick={() => handleEliminarAtado(item, idx)}
//                                                             className="btn-eliminar"
//                                                             title="Eliminar atado"
//                                                         >
//                                                             🗑️
//                                                         </button>
//                                                     )}
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan="6" style={{textAlign: 'center', padding: '10px'}}>
//                                                 No hay atados registrados
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         )}
//                     </div>
//                 </div>

//                 <div className="modal-footer">
//                     <button onClick={handleReset} className="btn-reset">RESET</button>
//                     <button onClick={handleRegistrar} className="btn-registrar">REGISTRAR</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PesajeModal;




// // src/components/PesajeModal.jsx

// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import './PesajeModal.css';

// const PesajeModal = ({ lineaData, operacionId, onClose, onSuccess }) => {
//     const [peso, setPeso] = useState(0);
//     const [atado, setAtado] = useState(1);
//     const [rollos, setRollos] = useState(0);
//     const [atados, setAtados] = useState([]);
//     const [sobreOrdenTotal, setSobreOrdenTotal] = useState(0);
//     const [calidadTotal, setCalidadTotal] = useState(0);
//     const [programados, setProgramados] = useState(0);
//     const [cargandoAtados, setCargandoAtados] = useState(true);
//     const [ultimaEtiqueta, setUltimaEtiqueta] = useState(null);

//     // const loteIdsParam = lineaData?.Lote_IDS || null;

//     let loteIdsParam = lineaData?.Lote_IDS || null;
//     if (typeof loteIdsParam === 'string' && (loteIdsParam.trim() === '' || loteIdsParam.trim().toLowerCase() === 'null')) {
//         loteIdsParam = null;
//     }
//     const sobranteParam = lineaData?.bSobrante ? 1 : (lineaData?.bScrap ? 2 : 0);

//     useEffect(() => {
//         console.log('lineaData recibido:', lineaData);
//         cargarAtadosExistentes();
//     }, [lineaData, operacionId]);

//     useEffect(() => {
//         const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
//         let pollingInterval = null;
//         const updatePesoDisplay = async () => {
//             try {
//                 const response = await axiosInstance.get(`${agenteUrl}/peso`);
//                 if (response.data?.success) {
//                     const nuevoPeso = parseFloat(response.data.peso) || 0;
//                     setPeso(nuevoPeso);
//                 }
//             } catch (error) {
//                 setPeso(0);
//             }
//         };
//         pollingInterval = setInterval(updatePesoDisplay, 1200);
//         return () => clearInterval(pollingInterval);
//     }, []);

//     const cargarAtadosExistentes = async () => {
//         try {
//             setCargandoAtados(true);
//             const response = await axiosInstance.post('/registracion/pesaje/obtener-atados', {
//                 operacionId,
//                 loteIds: loteIdsParam,
//                 sobrante: sobranteParam
//             });
//             if (response.data && response.data.length > 0) {
//                 const atadosData = response.data.map(item => ({
//                     atado: item.Atado || 0,
//                     rollos: item.Rollos || 0,
//                     peso: parseFloat(item.Peso) || 0,
//                     esCalidad: item.Calidad === 1,
//                     nroEtiqueta: item.Etiqueta,
//                     idBD: item.IdRegistroPesaje,
//                     isLatest: false
//                 }));
//                 const uniqueAtados = atadosData.filter((item, index, arr) => 
//                     index === arr.findIndex(t => t.nroEtiqueta === item.nroEtiqueta)
//                 );
//                 setAtados(uniqueAtados);
//                 const soTotal = uniqueAtados.filter(item => !item.esCalidad).reduce((sum, item) => sum + item.peso, 0);
//                 const calTotal = uniqueAtados.filter(item => item.esCalidad).reduce((sum, item) => sum + item.peso, 0);
//                 setSobreOrdenTotal(soTotal);
//                 setCalidadTotal(calTotal);
//                 const ultimoAtado = Math.max(...uniqueAtados.map(item => item.atado), 0);
//                 setAtado(ultimoAtado + 1);
//             } else {
//                 setAtados([]);
//                 setSobreOrdenTotal(0);
//                 setCalidadTotal(0);
//                 setAtado(1);
//             }
//             const etiquetaResponse = await axiosInstance.get('/registracion/pesaje/obtener-ultima-etiqueta');
//             setUltimaEtiqueta(etiquetaResponse.data.ultimaEtiqueta);
//             if (lineaData) {
//                 setProgramados(parseFloat(lineaData.Programados) || 0);
//             }
//         } catch (error) {
//             console.error('Error al cargar atados existentes:', error);
//             Swal.fire('Error', 'No se pudieron cargar los atados existentes.', 'error');
//         } finally {
//             setCargandoAtados(false);
//         }
//     };

//     const handleSobreOrden = async () => {
//         if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese un peso válido.', 'warning');
//         if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese la cantidad de rollos.', 'warning');
//         if (!ultimaEtiqueta) return Swal.fire('Error', 'El número de etiqueta no está inicializado.', 'error');
//         try {
//             const etiquetaResponse = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
//             const nroEtiqueta = etiquetaResponse.data.nroEtiqueta;
//             const nuevoAtado = {
//                 atado,
//                 rollos,
//                 peso,
//                 esCalidad: false,
//                 nroEtiqueta,
//                 isLatest: true
//             };
//             setAtados(prev => {
//                 const updatedAtados = prev.map(item => ({ ...item, isLatest: false }));
//                 return [...updatedAtados, nuevoAtado];
//             });
//             setSobreOrdenTotal(prev => prev + peso);
//             setAtado(prev => prev + 1);
//             setRollos(0);
//             setUltimaEtiqueta(nroEtiqueta);
//         } catch (error) {
//             console.error('Error al generar etiqueta:', error);
//             Swal.fire('Error', 'No se pudo generar el número de etiqueta.', 'error');
//         }
//     };

//     const handleCalidad = async () => {
//         if (peso <= 0) return Swal.fire('Advertencia', 'Ingrese un peso válido.', 'warning');
//         if (rollos <= 0) return Swal.fire('Advertencia', 'Ingrese la cantidad de rollos.', 'warning');
//         if (!ultimaEtiqueta) return Swal.fire('Error', 'El número de etiqueta no está inicializado.', 'error');
//         try {
//             const etiquetaResponse = await axiosInstance.post('/registracion/pesaje/obtener-y-actualizar-etiqueta');
//             const nroEtiqueta = etiquetaResponse.data.nroEtiqueta;
//             const nuevoAtado = {
//                 atado,
//                 rollos,
//                 peso,
//                 esCalidad: true,
//                 nroEtiqueta,
//                 isLatest: true
//             };
//             setAtados(prev => {
//                 const updatedAtados = prev.map(item => ({ ...item, isLatest: false }));
//                 return [...updatedAtados, nuevoAtado];
//             });
//             setCalidadTotal(prev => prev + peso);
//             setAtado(prev => prev + 1);
//             setRollos(0);
//             setUltimaEtiqueta(nroEtiqueta);
//         } catch (error) {
//             console.error('Error al generar etiqueta:', error);
//             Swal.fire('Error', 'No se pudo generar el número de etiqueta.', 'error');
//         }
//     };

//     const handleRegistrar = async () => {
//         if (sobreOrdenTotal + calidadTotal <= 0 || atados.length === 0) {
//             return Swal.fire('Advertencia', 'No puede registrar sin kilos y rollos.', 'warning');
//         }
//         try {
//            // DESPUÉS (envía null cuando corresponde)
//             await axiosInstance.post('/registracion/pesaje/registrar', {
//                 operacionId,
//                 loteIds: loteIdsParam === 'null' ? null : loteIdsParam, // <-- Convierte 'null' a null
//                 sobrante: sobranteParam,
//                 atados: atados.map(item => ({
//                     atado: item.atado,
//                     rollos: item.rollos,
//                     peso: item.peso,
//                     esCalidad: item.esCalidad,
//                     esSobreOrden: !item.esCalidad,
//                     nroEtiqueta: item.nroEtiqueta,
//                     idBD: item.idBD
//                 })),
//                 lineaData // <-- Asegúrate de que lineaData también se envíe
//             });
//             Swal.fire('Éxito', 'Pesaje registrado correctamente.', 'success');
//             onSuccess?.();
//             onClose();
//         } catch (error) {
//             console.error('Error al registrar:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al registrar el pesaje.', 'error');
//         }
//     };

//     const handleReset = async () => {
//         const confirm = await Swal.fire({
//             title: '¿Borrar todo?',
//             text: 'Se borrará todo lo registrado en esta sesión y en la base de datos.',
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Sí, borrar',
//             cancelButtonText: 'Cancelar'
//         });
//         if (confirm.isConfirmed) {
//             try {
//                 await axiosInstance.post('/registracion/pesaje/reset', {
//                     operacionId,
//                     loteIds: loteIdsParam,
//                     sobrante: sobranteParam
//                 });
//                 setAtados([]);
//                 setSobreOrdenTotal(0);
//                 setCalidadTotal(0);
//                 setAtado(1);
//                 setRollos(0);
//                 setPeso(0);
//                 setUltimaEtiqueta(null);
//                 Swal.fire('Reset completado', 'Todos los datos han sido reseteados.', 'success');
//             } catch (error) {
//                 console.error('Error al resetear:', error);
//                 Swal.fire('Error', 'No se pudo completar el reset.', 'error');
//             }
//         }
//     };

//     const handleEliminarAtado = async (atadoAEliminar, index) => {
//         if (!atadoAEliminar.isLatest) {
//             Swal.fire('Advertencia', 'Solo se puede eliminar el último atado registrado.', 'warning');
//             return;
//         }
//         const confirm = await Swal.fire({
//             title: '¿Eliminar atado?',
//             text: `¿Está seguro que desea eliminar el atado ${atadoAEliminar.atado}?`,
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Sí, eliminar',
//             cancelButtonText: 'Cancelar'
//         });
//         if (confirm.isConfirmed) {
//             try {
//                 if (atadoAEliminar.idBD) {
//                     await axiosInstance.post('/registracion/pesaje/eliminar-atado', {
//                         idRegistroPesaje: atadoAEliminar.idBD,
//                         operacionId,
//                         loteIds: loteIdsParam,
//                         sobrante: sobranteParam
//                     });
//                 }
//                 setAtados(prevAtados => {
//                     const nuevosAtados = prevAtados.filter((_, i) => i !== index);
//                     const renumerados = nuevosAtados.map((atado, i) => ({ ...atado, atado: i + 1 }));
//                     const newSoTotal = renumerados.filter(item => !item.esCalidad).reduce((sum, item) => sum + item.peso, 0);
//                     const newCalTotal = renumerados.filter(item => item.esCalidad).reduce((sum, item) => sum + item.peso, 0);
//                     setSobreOrdenTotal(newSoTotal);
//                     setCalidadTotal(newCalTotal);
//                     if (renumerados.length > 0) {
//                         const lastIndex = renumerados.length - 1;
//                         renumerados[lastIndex] = { ...renumerados[lastIndex], isLatest: true };
//                         setAtado(renumerados.length + 1);
//                     } else {
//                         setAtado(1);
//                         setUltimaEtiqueta(null);
//                     }
//                     return renumerados;
//                 });
//                 Swal.fire('Eliminado', 'Atado eliminado.', 'success');
//             } catch (error) {
//                 console.error('Error al eliminar atado:', error);
//                 Swal.fire('Error', 'Error al eliminar el atado.', 'error');
//             }
//         }
//     };

//     return (
//         <div className="pesaje-modal-overlay">
//             <div className="pesaje-modal">
//                 <div className="modal-header">
//                     <h3>Pesaje - {lineaData?.Ancho} x {lineaData?.Cuchillas}</h3>
//                     <button onClick={onClose}>&times;</button>
//                 </div>
//                 <div className="modal-body">
//                     <div className="info-panel">
//                         <div>Serie-Lote: {lineaData?.SerieLote || 'N/A'}</div>
//                         <div>Cortes: {lineaData?.Cuchillas}</div>
//                         <div>Nro.Matching: {lineaData?.Matching}</div>
//                         <div>Kgs. Programados: {programados.toFixed(2)}</div>
//                     </div>
//                     <div className="pesaje-section">
//                         <label>Peso Balanza:</label>
//                         <input
//                             type="number"
//                             value={peso.toFixed(3)}
//                             readOnly
//                             className="peso-input"
//                             placeholder="Esperando lectura..."
//                             step="0.001"
//                         />
//                     </div>
//                     <div className="totales">
//                         <div>Kg. Sobre Orden: {sobreOrdenTotal.toFixed(2)}</div>
//                         <div>Kg. Calidad: {calidadTotal.toFixed(2)}</div>
//                     </div>
//                     <div className="atados-section">
//                         <label>Atado: {atado}</label>
//                         <label>Rollos: </label>
//                         <input
//                             type="number"
//                             value={rollos}
//                             onChange={(e) => setRollos(parseInt(e.target.value) || 0)}
//                             placeholder="Rollos"
//                             min="0"
//                         />
//                         <button onClick={handleSobreOrden} className="btn-so">Sobre Orden</button>
//                         <button onClick={handleCalidad} className="btn-calidad">Calidad</button>
//                     </div>
//                     <div className="grilla-atados">
//                         <h4>Atados Registrados</h4>
//                         {cargandoAtados ? (
//                             <div className="cargando-atados">Cargando atados existentes...</div>
//                         ) : (
//                             <table>
//                                 <thead>
//                                     <tr>
//                                         <th>Atado</th>
//                                         <th>Rollos</th>
//                                         <th>Peso</th>
//                                         <th>Calidad</th>
//                                         <th>Nro. Etiqueta</th>
//                                         <th>Acciones</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {atados.length > 0 ? (
//                                         atados.map((item, idx) => (
//                                             <tr key={idx}>
//                                                 <td>{item.atado}</td>
//                                                 <td>{item.rollos}</td>
//                                                 <td>{item.peso.toFixed(2)}</td>
//                                                 <td>{item.esCalidad ? '✓' : ''}</td>
//                                                 <td>{item.nroEtiqueta}</td>
//                                                 <td className="acciones-atado">
//                                                     <button
//                                                         onClick={() => Swal.fire('Info', 'Imprimir no implementado aún.', 'info')}
//                                                         className="btn-imprimir"
//                                                         title="Imprimir etiqueta"
//                                                     >
//                                                         🖨️
//                                                     </button>
//                                                     {item.isLatest && (
//                                                         <button
//                                                             onClick={() => handleEliminarAtado(item, idx)}
//                                                             className="btn-eliminar"
//                                                             title="Eliminar atado"
//                                                         >
//                                                             🗑️
//                                                         </button>
//                                                     )}
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan="6" style={{textAlign: 'center', padding: '10px'}}>
//                                                 No hay atados registrados
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         )}
//                     </div>
//                 </div>
//                 <div className="modal-footer">
//                     <button onClick={handleReset} className="btn-reset">RESET</button>
//                     <button onClick={handleRegistrar} className="btn-registrar">REGISTRAR</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PesajeModal;
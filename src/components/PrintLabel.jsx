import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import './PrintLabel.css'; // Import CSS below

const PrintLabel = ({ 
    // Parameters from RDLC (map to props)
    parSerieLote = 'DEFAULT-SERIE',
    parNroAtado = '1',
    parCantRollos = '0',
    parEspesor = '0.500',
    parAncho = '150.0',
    parLargo = '0.0',
    parRecubrimiento = 'NA',
    parTemple = 'Z180',
    parMaterial = 'Galvanizado',
    parAleacion = 'NA',
    parTerminacion = 'NA',
    parCalidad = '01',
    parPT = 'P',
    parNroOperacion = '18020232-194710',
    parOrigen = 'Nacional',
    parPropietario = 'S02-P',
    parActual = 'SL3',
    parProx = 'SL3',
    parCodProducto = 'GALV-0000-150.0-0500-Z180-01',
    parNeto = '0',
    parUnid = 'PP',
    parCliente = 'FLOR ADRIAN ALBERT',
    parTipo = 'PP',
    parFecha = '18/09/25',
    parFechaImpre = '01/10/25',
    parNroEtiqueta = '7291-010',
    onPrintComplete // Optional callback
}) => {
    const barcodeRef = useRef(null);
    const printWindowRef = useRef(null);

    useEffect(() => {
        // Generate barcode on mount
        if (barcodeRef.current && parSerieLote) {
            JsBarcode(barcodeRef.current, parSerieLote, {
                format: 'CODE128',
                width: 2,
                height: 60,
                fontSize: 14,
                displayValue: false // Hide text, as RDLC uses custom font
            });
        }

        // Auto-print after render (simulate VB report viewer)
        const timer = setTimeout(() => {
            if (printWindowRef.current) {
                printWindowRef.current.print();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [parSerieLote]);

    // Handle print dialog close (simulate VB close after print)
    const handleAfterPrint = () => {
        if (printWindowRef.current) {
            printWindowRef.current.close();
        }
        onPrintComplete?.();
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia('print');
        mediaQuery.addListener((mql) => {
            if (!mql.matches) {
                handleAfterPrint();
            }
        });
        return () => mediaQuery.removeListener();
    }, []);

    return (
        <div className="print-label-container" ref={printWindowRef}>
            {/* Header Rectangle with Logo, Barcode, and Nro Etiqueta */}
            <div className="label-header">
                <img src="/api/logo-sinte" alt="SINTE" className="logo-sinte" /> {/* Assume backend serves logo */}
                <canvas ref={barcodeRef} className="barcode" />
                <div className="nro-etiqueta">{parNroEtiqueta}</div>
            </div>

            {/* Serie/Lote Text */}
            <div className="serie-lote">{parSerieLote}</div>

            {/* Dimensions Rectangle */}
            <div className="dimensions-rect">
                <div className="dim-cell espesor">{parEspesor}</div>
                <div className="dim-cell ancho">{parAncho}</div>
                <div className="dim-cell largo">{parLargo}</div>
                <div className="dim-cell recubrimiento">{parRecubrimiento}</div>
                <div className="dim-labels">
                    <div>ESPESOR</div>
                    <div>ANCHO</div>
                    <div>LARGO</div>
                    <div>COB</div>
                </div>
            </div>

            {/* Material/Aleacion/Terminacion/Calidad/PT Rectangle */}
            <div className="material-rect">
                <div className="mat-cell material">{parMaterial}</div>
                <div className="mat-cell aleacion">{parAleacion}</div>
                <div className="mat-cell terminacion">{parTerminacion}</div>
                <div className="mat-cell calidad">{parCalidad}</div>
                <div className="mat-cell pt">{parPT}</div>
                <div className="mat-labels">
                    <div>MATERIAL</div>
                    <div>ALEACION</div>
                    <div>TERMINACION</div>
                    <div>CALIDAD</div>
                    <div>P/T</div>
                </div>
            </div>

            {/* OP/Origen/Propietario Rectangle */}
            <div className="op-rect">
                <div className="op-cell nro-op">{parNroOperacion}</div>
                <div className="op-cell origen">{parOrigen}</div>
                <div className="op-cell propietario">{parPropietario}</div>
                <div className="op-labels">
                    <div>Nro. OP</div>
                    <div>ORIGEN</div>
                    <div>PROPIETARIO</div>
                </div>
            </div>

            {/* Actual/Prox Rectangle */}
            <div className="actual-prox-rect">
                <div className="actual-cell">ACTUAL</div>
                <div className="actual-cell">{parActual}</div>
                <div className="prox-cell">PROX</div>
                <div className="prox-cell">{parProx}</div>
            </div>

            {/* Atado/Rollos Rectangle */}
            <div className="atado-rollos-rect">
                <div className="atado-cell">ATADO</div>
                <div className="atado-cell">{parNroAtado}</div>
                <div className="rollos-cell">ROLLOS</div>
                <div className="rollos-cell">{parCantRollos}</div>
            </div>

            {/* Neto/Unid/Cliente/Tipo/Fecha Rectangle */}
            <div className="neto-rect">
                <div className="neto-cell neto">NETO(Kg)</div>
                <div className="neto-cell">{parNeto}</div>
                <div className="neto-cell unid">UNID</div>
                <div className="neto-cell">{parUnid}</div>
                <div className="neto-cell tipo">TIPO</div>
                <div className="neto-cell">{parTipo}</div>
                <div className="neto-cell cliente">CLIENTES</div>
                <div className="neto-cell cliente-name">{parCliente}</div>
                <div className="neto-cell fecha">FECHA</div>
                <div className="neto-cell">{parFecha}</div>
            </div>

            {/* CodProducto Bottom */}
            <div className="cod-producto">{parCodProducto}</div>

            {/* Vertical Barcode and FechaImpre */}
            <div className="vertical-barcode">{parSerieLote}</div> {/* Vertical text simulation */}
            <div className="fecha-impre-vertical">{parFechaImpre}</div>
        </div>
    );
};

export default PrintLabel;
// /src/components/CuchillasModal.jsx

import React from 'react';
import './CuchillasModal.css';

const CuchillasModal = ({ data, onClose }) => {
    if (!data) return null;

    const { header, ejeSuperior, ejeInferior, herramental, luzDeCorte } = data;

    // Componente para renderizar una barra individual CON ETIQUETA
    const BarraCuchilla = ({ item }) => {
        let etiqueta = item.tipo;
        // Mapeamos los tipos del backend a las etiquetas visuales deseadas
        if (item.tipo === 'Cu') etiqueta = 'Cu';
        else if (item.tipo === 'L') etiqueta = 'L';
        else if (item.tipo.includes('G')) etiqueta = 'G';
        else if (item.tipo.includes('S')) etiqueta = 'S';
        
        return (
            <div className="barra-container">
                <div className="barra-etiqueta">{etiqueta}</div>
                <div className="barra" style={{ width: `${item.medida * 4}px`, backgroundColor: item.color }}>
                    {/* No mostrar medida "0" para el espacio de la etiqueta L */}
                    <span className="barra-medida">{item.medida > 0 ? item.medida : ''}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="cuchillas-modal-overlay" onClick={onClose}>
            <div className="cuchillas-modal-content" onClick={e => e.stopPropagation()}>
                <div className="cuchillas-modal-header">
                    <h4>Acomodar Cuchillas</h4>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                
                <div className="cuchillas-info-header">
                    <div><strong>Cuchillas:</strong> {header.cuchillas}</div>
                    <div><strong>Espesor:</strong> {header.espesor}</div>
                    <div><strong>Luz:</strong> {header.luz}</div>
                    <div><strong>Cruce:</strong> {header.cruce}</div>
                    <div><strong>Ancho:</strong> {header.ancho}</div>
                </div>

                <div className="armado-info">
                    <strong>Armado:</strong> {header.armado}
                </div>

                <div className="ejes-container">
                    {/* Eje Superior */}
                    <div className="eje-grafico">
                        <div className="eje-label"><span>Superior</span></div>
                        <div className="barras-wrapper">
                            {ejeSuperior.map((item, index) => <BarraCuchilla key={`sup-${index}`} item={item} />)}
                        </div>
                    </div>
                    {/* Eje Inferior */}
                    <div className="eje-grafico">
                        <div className="eje-label"><span>Inferior</span></div>
                        <div className="barras-wrapper">
                            {ejeInferior.map((item, index) => <BarraCuchilla key={`inf-${index}`} item={item} />)}
                        </div>
                    </div>
                </div>

                <div className="cuchillas-modal-footer">
                    <div className="footer-section">
                        <strong>Herramental a Utilizar:</strong>
                        <ul>
                            {herramental.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                     <div className="footer-section">
                        <strong>Luz de Corte:</strong>
                        <ul>
                            {luzDeCorte.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="footer-section-impresion">
                        <strong>Impresora:</strong>
                        <select className="form-control form-control-sm">
                            <option>\\eq7700\Etiquetas Expedicion</option>
                        </select>
                        <button className="btn btn-secondary btn-sm mt-2">Impresión Gráfico</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CuchillasModal;
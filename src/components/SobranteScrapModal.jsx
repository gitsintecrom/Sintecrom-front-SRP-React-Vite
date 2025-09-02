// src/components/SobranteScrapModal.jsx

import React from 'react';
import './SobranteScrapModal.css'; // Optional: for custom styling

const SobranteScrapModal = ({ title, data, isScrap, onClose, onSelect }) => {
    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>{title}</h2>
                    <p>No hay datos disponibles.</p>
                    <button onClick={onClose}>Cerrar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{title}</h2>
                <table className="sobrante-scrap-table">
                    <thead>
                        <tr>
                            <th>Ancho Sal</th>
                            <th>Serie/Lote</th>
                            {!isScrap && <th>Sobre Orden</th>}
                            {!isScrap && <th>Calidad</th>}
                            {isScrap && <th>Kgs. Total</th>}
                            <th>Atados</th>
                            <th>Rollos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index} onClick={() => onSelect(row)} className="clickable-row">
                                <td>{row.AnchoSal || 'N/A'}</td>
                                <td>{row.SeriesLotes || 'N/A'}</td>
                                {!isScrap && <td>{row.Kilos_SobreOrden || 0}</td>}
                                {!isScrap && <td>{row.Kilos_Calidad || 0}</td>}
                                {isScrap && <td>{(row.Kilos_SobreOrden || 0) + (row.Kilos_Calidad || 0)}</td>}
                                <td>{row.Atados || 0}</td>
                                <td>{row.Rollos || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
};

export default SobranteScrapModal;
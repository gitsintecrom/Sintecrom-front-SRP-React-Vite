import React, { useState, useEffect } from 'react';
import './CuchillasInputModal.css';

const CuchillasInputModal = ({ headerData, onConfirm, onClose }) => {
    const [formData, setFormData] = useState({
        ancho: headerData.Ancho || 0,
        espesor: headerData.Espesor || 0,
        mermaInicial: 0,
        mermaFinal: 0,
        cortes: Array(6).fill({ cantidad: 0, medida: 0 })
    });

    // Desglosar la cadena de cuchillas inicial para pre-rellenar el formulario
    useEffect(() => {
        if (headerData.Cuchillas) {
            try {
                const partes = headerData.Cuchillas.split('/').map(p => p.trim());
                const mermaInicial = parseFloat(partes[0]);
                const mermaFinal = parseFloat(partes[partes.length - 1]);
                const cortesStr = partes.slice(1, -1);
                
                const nuevosCortes = Array(6).fill({ cantidad: 0, medida: 0 });
                cortesStr.forEach((corte, index) => {
                    if (index < 6) {
                        const [cantidad, medida] = corte.split('x').map(s => parseFloat(s.trim()));
                        nuevosCortes[index] = { cantidad, medida };
                    }
                });
                setFormData(prev => ({ ...prev, mermaInicial, mermaFinal, cortes: nuevosCortes }));
            } catch (e) {
                console.error("Error al desglosar cuchillas:", e);
            }
        }
    }, [headerData.Cuchillas]);

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const nuevosCortes = [...formData.cortes];
        nuevosCortes[index] = { ...nuevosCortes[index], [name]: value };
        setFormData({ ...formData, cortes: nuevosCortes });
    };

    const handleGeneralChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const handleConfirmClick = () => {
        // Construir la cadena de cuchillas a partir del estado del formulario
        let cuchillasString = `${formData.mermaInicial}`;
        formData.cortes.forEach(corte => {
            if (corte.cantidad > 0 && corte.medida > 0) {
                cuchillasString += ` / ${corte.cantidad} x ${corte.medida}`;
            }
        });
        cuchillasString += ` / ${formData.mermaFinal}`;
        
        // Llamar a la función onConfirm pasada desde el componente padre
        onConfirm({
            cuchillas: cuchillasString,
            espesor: formData.espesor,
            ancho: formData.ancho
        });
    };

    return (
        <div className="cuchillas-modal-overlay" onClick={onClose}>
            <div className="cuchillas-modal-content small-modal" onClick={e => e.stopPropagation()}>
                <div className="cuchillas-modal-header">
                    <h4>Programación de Cuchillas</h4>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>

                <div className="input-main-container">
                    <div className="input-group-top">
                        <div className="form-group">
                            <label>Ancho MP</label>
                            <input type="number" name="ancho" value={formData.ancho} onChange={handleGeneralChange} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Espesor</label>
                            <input type="number" name="espesor" value={formData.espesor} onChange={handleGeneralChange} className="form-control" />
                        </div>
                         <div className="form-group">
                            <label>Merma Principio</label>
                            <input type="number" name="mermaInicial" value={formData.mermaInicial} onChange={handleGeneralChange} className="form-control" />
                        </div>
                         <div className="form-group">
                            <label>Merma Final</label>
                            <input type="number" name="mermaFinal" value={formData.mermaFinal} onChange={handleGeneralChange} className="form-control" />
                        </div>
                    </div>
                    
                    <div className="input-group-cortes">
                        <label className="cortes-title">Flejes</label>
                        {formData.cortes.map((corte, index) => (
                            <div key={index} className="corte-row">
                                <input type="number" name="cantidad" value={corte.cantidad} onChange={e => handleInputChange(e, index)} className="form-control" />
                                <span className="corte-x">X</span>
                                <input type="number" name="medida" value={corte.medida} onChange={e => handleInputChange(e, index)} className="form-control" />
                            </div>
                        ))}
                    </div>
                    
                    <button className="btn btn-primary btn-confirma" onClick={handleConfirmClick}>Confirma</button>
                </div>
            </div>
        </div>
    );
};

export default CuchillasInputModal;

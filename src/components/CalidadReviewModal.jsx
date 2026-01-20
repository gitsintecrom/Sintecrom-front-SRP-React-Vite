// src/components/CalidadReviewModal.jsx
import React, { useState } from 'react';

const CalidadReviewModal = ({ data, onConfirm, onCancel }) => {
    const [observacionCalidad, setObservacionCalidad] = useState(data?.observacionCalidad || '');

    const handleConfirm = () => {
        onConfirm(observacionCalidad);
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Revisión CALIDAD</h3>
                    <button onClick={onCancel}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Observación:</label>
                        <textarea
                            value={observacionCalidad}
                            onChange={(e) => setObservacionCalidad(e.target.value)}
                            className="form-control"
                            rows="10"
                        />
                    </div>
                    <div className="d-flex justify-content-end">
                        <button onClick={onCancel} className="btn btn-secondary mr-2">Salir</button>
                        <button onClick={handleConfirm} className="btn btn-primary">Confirma</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalidadReviewModal;
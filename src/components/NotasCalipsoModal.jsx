// src/components/NotasCalipsoModal.jsx

import React from 'react';
import './NotasCalipsoModal.css';

const NotasCalipsoModal = ({ notes, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Notas Calipso</h2>
                <div className="notes-container">
                    <textarea readOnly value={notes || 'No hay notas disponibles.'} />
                </div>
                <button onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
};

export default NotasCalipsoModal;
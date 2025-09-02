// src/components/SupervisorAuthModal.jsx (NUEVO ARCHIVO)

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './SupervisorAuthModal.css';

const SupervisorAuthModal = ({ title, message, onConfirm, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            Swal.fire('Atención', 'Debe ingresar usuario y contraseña.', 'warning');
            return;
        }
        setLoading(true);
        // La función onConfirm es la que hará la llamada a la API
        await onConfirm({ username, password });
        setLoading(false);
    };

    return (
        <div className="supervisor-modal-overlay">
            <div className="supervisor-modal-content">
                <div className="supervisor-modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleConfirm}>
                    <div className="supervisor-modal-body">
                        <p>{message}</p>
                        <div className="form-group">
                            <label htmlFor="supervisor-user">Usuario Supervisor</label>
                            <input
                                id="supervisor-user"
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="supervisor-pass">Contraseña</label>
                            <input
                                id="supervisor-pass"
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="supervisor-modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupervisorAuthModal;
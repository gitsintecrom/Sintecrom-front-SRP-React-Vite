// src/components/ToleranciasModal.jsx (NUEVO ARCHIVO)

import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import './ToleranciasModal.css';

const ToleranciasModal = ({ operacionId, onClose }) => {
    const [tolerancias, setTolerancias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTolerancias = async () => {
            setLoading(true);
            setError('');
            try {
                // 1. Obtenemos la lista de productos salientes de la operación
                const responseProductos = await axiosInstance.get(`/registracion/fichatecnica/${operacionId}`);
                
                if (responseProductos.data.length === 0) {
                    setTolerancias([]);
                    setLoading(false);
                    return;
                }

                // 2. Para cada producto, obtenemos su ficha técnica detallada (que incluye las tolerancias)
                const promesasTolerancia = responseProductos.data.map(producto => 
                    axiosInstance.get(`/registracion/fichatecnica/detalle/${encodeURIComponent(producto.CodProdPedido)}`)
                );
                
                const resultados = await Promise.all(promesasTolerancia);
                
                // 3. Extraemos los datos necesarios para la tabla
                const datosTabla = resultados.map(res => ({
                    Cliente: res.data.Cliente,
                    DiametroInt: res.data.DiametroInt,
                    Ancho: res.data.Ancho,
                    AnchoMax: res.data.AnchoMax,
                    AnchoMin: res.data.AnchoMin,
                }));

                // Eliminamos duplicados por si un mismo producto saliente aparece varias veces
                const uniqueTolerancias = Array.from(new Map(datosTabla.map(item => [item.Cliente + item.Ancho, item])).values());
                
                setTolerancias(uniqueTolerancias);

            } catch (err) {
                console.error("Error al cargar tolerancias:", err);
                setError('No se pudieron cargar los datos de tolerancia.');
            } finally {
                setLoading(false);
            }
        };

        fetchTolerancias();
    }, [operacionId]);

    return (
        <div className="tolerancias-modal-overlay" onClick={onClose}>
            <div className="tolerancias-modal-content" onClick={e => e.stopPropagation()}>
                <div className="tolerancias-modal-header">
                    <h3>Tolerancias Operación</h3>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="tolerancias-modal-body">
                    {loading && <div className="spinner-border text-primary" role="status"></div>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    {!loading && !error && (
                        <table className="table table-bordered table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Clientes</th>
                                    <th>Diámetro Int.</th>
                                    <th>Ancho</th>
                                    <th>Toler. Ancho Máx</th>
                                    <th>Toler. Ancho Mín</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tolerancias.length > 0 ? (
                                    tolerancias.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.Cliente}</td>
                                            <td>{item.DiametroInt}</td>
                                            <td>{item.Ancho}</td>
                                            <td>{item.AnchoMax}</td>
                                            <td>{item.AnchoMin}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">No hay datos de tolerancia para mostrar.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ToleranciasModal;
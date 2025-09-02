import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable, { createTheme } from 'react-data-table-component';
import './FichaTecnica.css';

// Tema oscuro para la tabla
createTheme('maroonDark', {
    text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
    background: { default: '#A52A2A' }, // Un marrón más claro
    context: { background: '#cb3837', text: '#FFFFFF' },
    divider: { default: '#8B0000' },
    action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
    striped: { default: '#9A2A2A', text: '#FFFFFF' },
    highlightOnHover: { default: '#B53333', text: '#FFFFFF' },
}, 'dark');


const FichaTecnica = () => {
    const { operacionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Obtenemos los datos pasados desde la página anterior
    const { headerData } = location.state || {};

    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/registracion/fichatecnica/${operacionId}`);
                setProductos(response.data);
            } catch (err) {
                Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [operacionId, navigate]);

    const columns = [
        { name: 'Nro. Pedido', selector: row => row.NumeroPedido, sortable: true, width: '120px' },
        { name: 'Cód. Producto', selector: row => row.CodProdPedido, sortable: true, width: '220px' },
        { name: 'Producto', selector: row => row.DescProdPedido, sortable: true, grow: 2 },
        { name: 'Cliente', selector: row => row.ClientePedido, sortable: true, grow: 1.5 },
        { name: 'Código Prod. Entrante', selector: row => row.Codigo_Producto, sortable: true, width: '220px' },
    ];

    const handleRowClicked = (row) => {
        const codProd = row.CodProdPedido;
        if (!codProd) {
            Swal.fire('Error', 'El producto seleccionado no tiene un código válido.', 'error');
            return;
        }

        // El problema está aquí. La ruta DEBE incluir '/registracion' para que coincida con main.jsx
        // Y es buena práctica usar encodeURIComponent por si el código tiene caracteres especiales.
        const encodedCodProd = encodeURIComponent(codProd.trim());

        navigate(`/registracion/fichatecnica/detalle/${encodedCodProd}`, { 
            state: { 
                headerData: headerData,
                kgsProgramados: row.KgsProgramados 
            } 
        });
    };
    
    return (
        <div className="fichatecnica-container">
            <div className="fichatecnica-header">
                <div className="header-info">
                    <span><strong>REGISTRACION - Fichas Técnicas de Productos</strong></span>
                    {headerData && (
                        <>
                            <span><strong>Serie/Lote:</strong> {headerData.SerieLote}</span>
                            <span><strong>Nº Matching:</strong> {headerData.Matching}</span>
                        </>
                    )}
                </div>
                <div className="header-title">FICHAS TECNICAS</div>
                <button onClick={() => navigate(-1)} className="btn btn-sm btn-light">
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <DataTable
                columns={columns}
                data={productos}
                progressPending={loading}
                progressComponent={<div className="py-5 text-center text-white">Cargando...</div>}
                noDataComponent={<div className='py-5 text-center text-white'>No hay productos para esta operación.</div>}
                striped
                highlightOnHover
                pointerOnHover
                onRowClicked={handleRowClicked}
                theme="maroonDark"
            />
        </div>
    );
};

export default FichaTecnica;
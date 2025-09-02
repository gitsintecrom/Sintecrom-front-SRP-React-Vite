// src/pages/FichaTecnicaDetalle.jsx (VERSIÓN COMPLETA Y FINAL)

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import { Tabs, Tab } from 'react-bootstrap';
import './FichaTecnicaDetalle.css'; 

// Componente helper para aceptar className
const InfoField = ({ label, value, className = '' }) => (
    <div className={`info-field ${className}`}>
        <strong className="info-label">{label}:</strong>
        <span className="info-value">{value || '-'}</span>
    </div>
);


const FichaTecnicaDetalle = () => {
    const { codProd } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { headerData } = location.state || {};

    const [detalle, setDetalle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetalle = async () => {
            if (!codProd) return;
            setLoading(true);
            try {
                const encodedCodProd = encodeURIComponent(codProd);
                const response = await axiosInstance.get(`/registracion/fichatecnica/detalle/${encodedCodProd}`);
                setDetalle(response.data);
            } catch (err) {
                Swal.fire('Error', err.response?.data?.error || 'No se pudo cargar el detalle de la ficha técnica.', 'error');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchDetalle();
    }, [codProd, navigate]);
    
    if (loading) {
        return <div className="loading-container">Cargando Ficha Técnica...</div>;
    }

    if (!detalle) {
        return <div className="loading-container">No hay datos para mostrar.</div>;
    }
    
    const formatDate = (dateString) => {
        if (!dateString || dateString === '-') return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('es-AR', { timeZone: 'UTC' });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="ft-detalle-container">
            {/* Header Superior */}
            <div className="ft-detalle-header">
                <div className="header-info">
                    <span>REGISTRACION - Ficha Técnica</span>
                    {headerData && (
                        <>
                            <span><strong>Serie/Lote:</strong> {headerData.SerieLote}</span>
                            <span><strong>Nº Matching:</strong> {headerData.Matching}</span>
                        </>
                    )}
                </div>
                <div className="header-title-box">
                    <span className="ft-status">{detalle.Estado || 'N/A'}</span>
                    <span className="ft-main-title">FICHA TECNICA</span>
                    <div><strong>Nro.Ficha:</strong> {detalle.FichaTecnica}</div>
                </div>
                <button onClick={() => navigate(-1)} className="btn btn-sm btn-light close-button">
                    <i className="fas fa-times"></i>
                </button>
            </div>

            {/* Header de Datos del Producto */}
            <div className="ft-product-header">
                 <div className="product-grid">
                    <InfoField label="Cliente" value={detalle.Cliente} className="span-5" />
                    <InfoField label="Nro.Formulario" value={detalle.NumForm} className="span-2" />
                    <InfoField label="Vigencia" value={formatDate(detalle.FechaVig)} className="span-2" />

                    <InfoField label="Código producto Cliente" value={decodeURIComponent(codProd)} className="span-5" />
                    <InfoField label="Revisión" value={detalle.Revision} className="span-4" />
                    
                    <InfoField label="Descripción Cliente" value={detalle.DescTotal} className="span-5" />
                    <InfoField label="Aprobado por Cliente" value={detalle.Apxcli} className="span-4" />

                    <InfoField label="Uso Final" value={detalle.UsoFin} className="span-5" />
                    <InfoField label="Se Produce" value={detalle.Fabrica} className="span-4" />
                    
                    <InfoField label="Producto con Especificación Std" value={detalle.especificacionestandar} className="span-5" />
                    <InfoField label="Especif.Std.Recibida por Cliente" value={detalle.EspecificacionSTD} className="span-4" />
                </div>
                <div className="product-dimensions">
                    <InfoField label="Material" value={detalle.Material} />
                    <InfoField label="Ancho (mm)" value={detalle.Ancho} />
                    <InfoField label="Largo (mm)" value={detalle.Largo} />
                    <InfoField label="Espesor (mm)" value={detalle.Espesor} />
                </div>
            </div>
            
            {/* Pestañas de Detalles */}
            <div className="ft-tabs-container">
                <Tabs defaultActiveKey="detalle" id="ficha-tecnica-tabs" className="mb-3">
                    <Tab eventKey="detalle" title="Detalle">
                        <div className="tab-grid-detalle">
                            {/* Columna 1 */}
                            <div>
                                <InfoField label="Aleación" value={detalle.Aleacion} />
                                <InfoField label="Terminación" value={detalle.Terminacion} />
                                <InfoField label="Recubrimiento" value={detalle.Recubrimiento} />
                                <InfoField label="Temple" value={detalle.Temple} />
                            </div>
                            {/* Columna 2 */}
                            <div>
                                <InfoField label="Diámetro Int." value={detalle.DiametroInt} />
                                <InfoField label="Material Buje" value={detalle.MatBuje} />
                                <InfoField label="Plan" value={detalle.PlanProd} />
                            </div>
                            {/* Columna 3 */}
                            <div>
                                <InfoField label="Origen" value={detalle.Origen} />
                                <InfoField label="Calidad Origen" value={detalle.CalidadOri} />
                                <InfoField label="Calidad Cliente" value={detalle.CalidadCli} />
                                <InfoField label="Ancho x Largo Indistinto" value={detalle.Anchoxlargoindistinto} />
                                <InfoField label="Planitud %" value={detalle.Planitud} />
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey="tolerancias" title="Tolerancias">
                         <div className="tab-grid tolerancias-grid">
                            <div className="grid-header"></div>
                            <div className="grid-header"><strong>Máximo</strong></div>
                            <div className="grid-header"><strong>Mínimo</strong></div>

                            <div className="grid-label"><strong>Espesor (mm):</strong></div>
                            <div>{detalle.EspesorMax}</div>
                            <div>{detalle.EspesorMin}</div>

                            <div className="grid-label"><strong>Ancho (mm):</strong></div>
                            <div>{detalle.AnchoMax}</div>
                            <div>{detalle.AnchoMin}</div>

                            <div className="grid-label"><strong>Largo (mm):</strong></div>
                            <div>{detalle.LargoMax}</div>
                            <div>{detalle.LargoMin}</div>
                            
                            <div className="grid-label"><strong>Diámetro Ext:</strong></div>
                            <div>{detalle.DiamExtMax}</div>
                            <div>{detalle.DiamExtMin}</div>
                            
                            <div className="grid-label"><strong>Kg. x rollo:</strong></div>
                            <div>{detalle.PesoRMax}</div>
                            <div>{detalle.PesoRMin}</div>

                            <div className="grid-label"><strong>Cant.hojas x paquete:</strong></div>
                            <div>{detalle.CHPP}</div>
                             <div>{detalle.CMHPP}</div>
                        </div>
                         <div className="tab-grid additional-tolerances">
                            <InfoField label="Curv.lat. (sable - mm/m)" value={detalle.Sable} />
                            <InfoField label="Tipo de empalme" value={detalle.TipoEmpalme} />
                            <InfoField label="Desp.de espiras (mm)" value={detalle.Espiras} />
                            <InfoField label="Cant.empalmes máx. x rollo" value={detalle.Empalmes} />
                            <InfoField label="Diferencial escuadra" value={detalle.Escuadra} />
                            <InfoField label="% de rollos menores al mín" value={detalle.PorRoMen} />
                        </div>
                    </Tab>
                    <Tab eventKey="superficial" title="Estado Superficial">
                        <p>{detalle.EstadoSup || 'Sin especificaciones.'}</p>
                    </Tab>
                    <Tab eventKey="pintura" title="Pintura">
                        <div className="pintura-section">
                            <div className="pintura-group">
                                <h5>Primer (Basecoat)</h5>
                                <div className="tab-grid">
                                    <InfoField label="Tipo Cobertura /Código" value={detalle.CoberturaInterna} />
                                    <InfoField label="Carga Primer (gr/m2)" value={detalle.Carga_Gr_Int_CI} />
                                    <InfoField label="Color" value={detalle.ColorInterno} />
                                    <InfoField label="Producto Cobertura" value={detalle.ProductoCoberturaInterna} />
                                </div>
                            </div>
                            <div className="pintura-group">
                                <h5>Recubrimiento Cara Externa</h5>
                                 <div className="tab-grid">
                                    <InfoField label="Tipo Cobertura /Código" value={detalle.CoberturaExterna_CE} />
                                    <InfoField label="Carga Recubr. (gr/m2)" value={detalle.Carga_Gr_Ext_CE} />
                                    <InfoField label="Color" value={detalle.ColorExterno_CE} />
                                    <InfoField label="Producto Cobertura" value={detalle.ProductoCoberturaExterna_CE} />
                                </div>
                            </div>
                             <div className="pintura-group">
                                <h5>Recubrimiento Cara Interna</h5>
                                 <div className="tab-grid">
                                    <InfoField label="Tipo Cobertura /Código" value={detalle.CoberturaExterna} />
                                    <InfoField label="Carga Recubr. (gr/m2)" value={detalle.Carga_Gr_Ext_CI} />
                                    <InfoField label="Color" value={detalle.ColorExterno} />
                                    <InfoField label="Producto Cobertura" value={detalle.ProductoCoberturaExterna} />
                                </div>
                            </div>
                            <div className="pintura-group">
                                <h5>Back</h5>
                                <div className="tab-grid">
                                    <InfoField label="Tipo Cobertura /Código" value={detalle.CoberturaBack} />
                                    <InfoField label="Carga Back (gr/m2)" value={detalle.Carga_Back} />
                                    <InfoField label="Color" value={detalle.ColorBack} />
                                    <InfoField label="Producto Cobertura" value={detalle.ProductoCoberturaBack} />
                                </div>
                            </div>
                             <div className="pintura-footer">
                                <InfoField label="Pintado" value={detalle.Aplicacion_Recubrimiento} />
                                <InfoField label="Protección Ext. (Plástico)" value={detalle.PROTECCIONEXTERNAPLASTICO} />
                                <InfoField label="Parám. Inicial Proceso" value={detalle.PIP} />
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey="embalaje" title="Embalaje">
                        <div className="tab-grid">
                            <InfoField label="Tipo de embalaje" value={`${detalle.CodigoEmb || ''}, ${detalle.TipoEmb || ''}`} />
                            <InfoField label="Peso máximo por bulto" value={detalle.PesoMaxBulto} />
                            <InfoField label="Certifica análisis de origen" value={detalle.Analori} />
                        </div>
                        <div className="embalaje-notas">
                            <strong>Descripcion Embalaje:</strong>
                            <textarea value={detalle.DescEmb || ''} readOnly rows="4" />
                        </div>
                         <div className="embalaje-notas">
                            <strong>Observaciones:</strong>
                            <textarea value={detalle.ObservaFT || ''} readOnly rows="4" />
                        </div>
                    </Tab>
                    <Tab eventKey="notas" title="Notas Producción">
                        <div className="embalaje-notas">
                             <textarea value={detalle.Notas_Produccion || ''} readOnly rows="10" />
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
};

export default FichaTecnicaDetalle;
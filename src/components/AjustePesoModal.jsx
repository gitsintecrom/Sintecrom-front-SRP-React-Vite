// // src/components/modals/AjustePesoModal.jsx
// import React, { useState, useEffect } from 'react';
// import Swal from 'sweetalert2';
// import axiosInstance from '../api/axiosInstance';
// import './PesajeEmbalajeModal.css';

// const AjustePesoModal = ({ paquete, onClose, onConfirm, operacionId }) => {
//     const [pesoBalanza, setPesoBalanza] = useState(0);
//     const [isManualEdit, setIsManualEdit] = useState(false);
//     const [tipoRegistro, setTipoRegistro] = useState(null); // 'sobreOrden' o 'bruto'
    
//     if (!paquete) return null;
    
//     // === BALANZA EN TIEMPO REAL ===
//     useEffect(() => {
//         const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
//         const interval = setInterval(async () => {
//             if (isManualEdit) return;
//             try {
//                 const res = await axiosInstance.get(`${agenteUrl}/peso`);
//                 setPesoBalanza(Math.round(parseFloat(res.data.peso) || 0));
//             } catch {
//                 // Balanza no disponible
//             }
//         }, 1200);
//         return () => clearInterval(interval);
//     }, [isManualEdit]);

//     const handleRegistrar = async () => {
//         if (pesoBalanza <= 0) {
//             Swal.fire('Advertencia', 'Ingrese un peso válido.', 'warning');
//             return;
//         }
        
//         if (!tipoRegistro) {
//             Swal.fire('Advertencia', 'Seleccione si es Sobre Orden o Bruto.', 'warning');
//             return;
//         }
        
//         // Si es bruto, validar que sea mayor al peso sobre orden
//         if (tipoRegistro === 'bruto' && pesoBalanza < paquete.peso) {
//             Swal.fire(
//                 'Advertencia', 
//                 `El Peso Bruto (${pesoBalanza}) no puede ser menor al Peso Sobre Orden (${paquete.peso}).`, 
//                 'warning'
//             );
//             return;
//         }
        
//         // Calcular nuevos valores
//         let nuevosKilosBruto = paquete.kilosBruto;
//         let nuevosTara = paquete.tara;
//         let nuevosPeso = paquete.peso;
        
//         if (tipoRegistro === 'sobreOrden') {
//             // Actualizar peso sobre orden
//             nuevosPeso = pesoBalanza;
//             // Recalcular tara si ya hay bruto
//             if (paquete.kilosBruto > 0) {
//                 nuevosTara = paquete.kilosBruto - pesoBalanza;
//             }
//         } else {
//             // Actualizar peso bruto
//             nuevosKilosBruto = pesoBalanza;
//             nuevosTara = pesoBalanza - paquete.peso;
//         }
        
//         onConfirm({
//             peso: nuevosPeso,
//             kilosBruto: nuevosKilosBruto,
//             tara: nuevosTara > 0 ? nuevosTara : 0
//         });
//     };

//     const taraPreview = tipoRegistro === 'bruto' 
//         ? pesoBalanza - paquete.peso 
//         : (paquete.kilosBruto > 0 ? paquete.kilosBruto - pesoBalanza : 0);

//     return (
//         <div className="pesaje-modal-overlay">
//             <div className="ajuste-peso-modal">
//                 {/* HEADER */}
//                 <div className="ajuste-header">
//                     <div className="ajuste-header-left">
//                         <strong>REGISTRACION EMBALAJE</strong>
//                         <div>Serie-Lote: {paquete.serieLote}</div>
//                         <div>Usuario: pmorrone</div>
//                     </div>
//                     <button className="ajuste-close" onClick={onClose}>&times;</button>
//                 </div>
                
//                 {/* DATOS DEL CORTE */}
//                 <div className="ajuste-datos-corte">
//                     <div className="ajuste-datos-left">
//                         <div><strong>Datos Corte</strong></div>
//                         <div><strong>Item:</strong> {paquete.numeroPaquete}</div>
//                         <div><strong>SERIE/LOTE:</strong></div>
//                         <div>{paquete.serieLote}</div>
//                     </div>
//                     <div className="ajuste-datos-right">
//                         <div className="ajuste-dato-box">
//                             <strong>Kgs.Sobre Orden:</strong>
//                             <span>{paquete.peso.toFixed(2)}</span>
//                         </div>
//                         <div className="ajuste-dato-box bruto-box">
//                             <strong>Kgs.Bruto:</strong>
//                             <span>{paquete.kilosBruto.toFixed(2)}</span>
//                         </div>
//                     </div>
//                 </div>
                
//                 {/* SECCIÓN DE INGRESO */}
//                 <div className="ajuste-ingreso">
//                     <div className="ajuste-ingreso-left">
//                         <label><strong>Ingrese valor de BALANZA</strong></label>
//                         <input 
//                             type="number" 
//                             step="1"
//                             value={pesoBalanza} 
//                             onChange={(e) => {
//                                 const val = parseInt(e.target.value) || 0;
//                                 setPesoBalanza(val >= 0 ? val : 0);
//                             }}
//                             onFocus={() => setIsManualEdit(true)} 
//                             onBlur={() => setIsManualEdit(false)} 
//                             className="ajuste-peso-input"
//                         />
//                     </div>
                    
//                     <div className="ajuste-ingreso-center">
//                         <button 
//                             className={`ajuste-btn-tipo ${tipoRegistro === 'sobreOrden' ? 'activo' : ''}`}
//                             onClick={() => setTipoRegistro('sobreOrden')}
//                         >
//                             Sobre Orden
//                         </button>
//                         <button 
//                             className={`ajuste-btn-tipo bruto-btn ${tipoRegistro === 'bruto' ? 'activo' : ''}`}
//                             onClick={() => setTipoRegistro('bruto')}
//                         >
//                             BRUTO
//                         </button>
//                     </div>
                    
//                     <div className="ajuste-ingreso-right">
//                         <label><strong>Nº PAQUETE: {paquete.numeroPaquete}</strong></label>
//                         <div className="ajuste-rollos-box">
//                             <label>Rollos</label>
//                             <input 
//                                 type="number" 
//                                 value={paquete.hojas} 
//                                 readOnly
//                                 className="ajuste-rollos-input"
//                             />
//                         </div>
//                     </div>
//                 </div>
                
//                 {/* PREVIEW DE TARA */}
//                 {tipoRegistro && (
//                     <div className="ajuste-preview">
//                         <strong>Tara Calculada:</strong> 
//                         <span>{Math.max(0, taraPreview).toFixed(2)} Kg</span>
//                         <small>Tara = Peso Bruto - Peso Sobre Orden</small>
//                     </div>
//                 )}
                
//                 {/* BOTÓN REGISTRA */}
//                 <div className="ajuste-footer">
//                     <button className="ajuste-btn-registra" onClick={handleRegistrar}>
//                         REGISTRA
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AjustePesoModal;




// src/components/modals/AjustePesoModal.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../api/axiosInstance';
import './PesajeEmbalajeModal.css';

const AjustePesoModal = ({ paquete, onClose, onConfirm, operacionId }) => {
    const [pesoBalanza, setPesoBalanza] = useState(0);
    const [isManualEdit, setIsManualEdit] = useState(false);
    const [tipoRegistro, setTipoRegistro] = useState(null);
    const [pesoSobreOrden, setPesoSobreOrden] = useState(paquete?.peso || 0);
    const [pesoBruto, setPesoBruto] = useState(paquete?.kilosBruto || 0);
    
    if (!paquete) return null;

    // === BALANZA EN TIEMPO REAL ===
    useEffect(() => {
        const agenteUrl = import.meta.env.VITE_AGENT_BALANZA_URL || 'http://localhost:12345';
        const interval = setInterval(async () => {
            if (isManualEdit) return;
            try {
                const res = await axiosInstance.get(`${agenteUrl}/peso`);
                const nuevoPeso = Math.round(parseFloat(res.data.peso) || 0);
                setPesoBalanza(nuevoPeso);
            } catch (err) {
                console.error('Error balanza:', err);
            }
        }, 1200);
        return () => clearInterval(interval);
    }, [isManualEdit]);

    // ✅ MANEJAR CLICK EN BOTONES
    const handleTipoRegistro = (tipo) => {
        if (pesoBalanza <= 0) {
            Swal.fire('Advertencia', 'Ingrese un peso válido en la balanza.', 'warning');
            return;
        }
        
        setTipoRegistro(tipo);
        
        if (tipo === 'sobreOrden') {
            setPesoSobreOrden(pesoBalanza);
        } else {
            setPesoBruto(pesoBalanza);
        }
    };

    const handlePesoBalanzaChange = (e) => {
        const val = parseInt(e.target.value) || 0;
        setPesoBalanza(val >= 0 ? val : 0);
    };

    const handleRegistrar = () => {
        if (pesoBalanza <= 0) {
            Swal.fire('Advertencia', 'Ingrese un peso válido.', 'warning');
            return;
        }
        
        if (!tipoRegistro) {
            Swal.fire('Advertencia', 'Seleccione si es Sobre Orden o Bruto.', 'warning');
            return;
        }
        
        const taraCalculada = Math.abs(pesoBruto - pesoSobreOrden);
        
        if (taraCalculada < 0) {
            Swal.fire(
                'Advertencia', 
                `La Tara no puede ser negativa. Peso Bruto (${pesoBruto}) es menor que Sobre Orden (${pesoSobreOrden}).`, 
                'warning'
            );
            return;
        }
        
        onConfirm({
            peso: pesoSobreOrden,
            kilosBruto: pesoBruto,
            tara: taraCalculada
        });
    };

    const taraCalculada = Math.abs(pesoBruto - pesoSobreOrden);

    return (
        <div className="pesaje-modal-overlay">
            <div className="ajuste-peso-modal">
                <div className="ajuste-header">
                    <div className="ajuste-header-left">
                        <strong>REGISTRACION EMBALAJE</strong>
                        <div>Serie-Lote: {paquete.serieLote}</div>
                        <div>Usuario: pmorrone</div>
                    </div>
                    <button className="ajuste-close" onClick={onClose}>&times;</button>
                </div>
                
                <div className="ajuste-datos-corte">
                    <div className="ajuste-datos-left">
                        <div><strong>Datos Corte</strong></div>
                        <div><strong>Item:</strong> {paquete.numeroPaquete}</div>
                        <div><strong>SERIE/LOTE:</strong></div>
                        <div>{paquete.serieLote}</div>
                    </div>
                    <div className="ajuste-datos-right">
                        <div className="ajuste-dato-box">
                            <strong>Kgs.Sobre Orden:</strong>
                            <span>{pesoSobreOrden.toFixed(2)}</span>
                        </div>
                        <div className="ajuste-dato-box bruto-box">
                            <strong>Kgs.Bruto:</strong>
                            <span>{pesoBruto.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="ajuste-ingreso">
                    <div className="ajuste-ingreso-left">
                        <label><strong>Ingrese valor de BALANZA</strong></label>
                        <input 
                            type="number" 
                            step="1"
                            value={pesoBalanza} 
                            onChange={handlePesoBalanzaChange}
                            onFocus={() => setIsManualEdit(true)} 
                            onBlur={() => setIsManualEdit(false)} 
                            className="ajuste-peso-input"
                        />
                    </div>
                    
                    <div className="ajuste-ingreso-center">
                        <button 
                            className={`ajuste-btn-tipo ${tipoRegistro === 'sobreOrden' ? 'activo' : ''}`}
                            onClick={() => handleTipoRegistro('sobreOrden')}
                        >
                            Sobre Orden
                        </button>
                        <button 
                            className={`ajuste-btn-tipo bruto-btn ${tipoRegistro === 'bruto' ? 'activo' : ''}`}
                            onClick={() => handleTipoRegistro('bruto')}
                        >
                            BRUTO
                        </button>
                    </div>
                    
                    <div className="ajuste-ingreso-right">
                        <label><strong>Nº PAQUETE: {paquete.numeroPaquete}</strong></label>
                        <div className="ajuste-rollos-box">
                            <label>Rollos</label>
                            <input 
                                type="number" 
                                value={paquete.hojas} 
                                readOnly
                                className="ajuste-rollos-input"
                            />
                        </div>
                    </div>
                </div>
                
                {tipoRegistro && (
                    <div className="ajuste-preview">
                        <strong>Tara Calculada:</strong> 
                        <span style={{ color: taraCalculada >= 0 ? '#2e7d32' : '#d32f2f' }}>
                            {taraCalculada.toFixed(2)} Kg
                        </span>
                        <small>Tara = Peso Bruto ({pesoBruto.toFixed(2)}) - Peso Sobre Orden ({pesoSobreOrden.toFixed(2)})</small>
                    </div>
                )}
                
                <div className="ajuste-footer">
                    <button className="ajuste-btn-registra" onClick={handleRegistrar}>
                        REGISTRA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AjustePesoModal;
// // src/components/PasadaForm.jsx

// import React from 'react';
// import './PasadaForm.css';

// const PasadaForm = ({ pasadaNum, pasadaData, onConfirm, onCancel }) => {
  
//   return (
//     <div className="pasada-form-container">
//         <div className="pasada-form-grid">

//             {/* Columna Izquierda: Ancho de Corte */}
//             <div className="form-group-box ancho-corte">
//                 <label>Ancho de Corte (mm)</label>
//                 <div className="ancho-corte-table-wrapper">
//                     <table className="ancho-corte-table">
//                         <thead>
//                             <tr>
//                                 <th>Fleje</th>
//                                 <th>Medida</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {/* ===== CORRECCIÓN AQUÍ: Se eliminó el .sort() ===== */}
//                             {pasadaData.anchosDeCorte.map((ancho, index) => (
//                                 <tr key={ancho.item}>
//                                     <td>{index + 1}</td>
//                                     <td>{ancho.valor.toFixed(2)}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Columna Central */}
//             <div className="form-column-center">
//                 <div className="form-group-box espesor">
//                     <label>Espesor (mm)</label>
//                     <div className="input-row"><label>B.L.M.:</label><input type="text" defaultValue={pasadaData.espesorBLM.toFixed(4)} /></div>
//                     <div className="input-row"><label>C.:</label><input type="text" defaultValue={pasadaData.espesorC.toFixed(4)} /></div>
//                     <div className="input-row"><label>B.L.O.:</label><input type="text" defaultValue={pasadaData.espesorBLO.toFixed(4)} /></div>
//                 </div>

//                 <div className="form-group-box diametro-interno">
//                      <div className="input-row"><label>Diámetro INTERNO:</label><input type="text" defaultValue={pasadaData.diametroInterno.toFixed(4)} /></div>
//                 </div>

//                 <div className="form-group-box apariencia">
//                     <label>Apariencia</label>
//                     <div className="input-row"><label>Cara Superior:</label><textarea rows="2" defaultValue={pasadaData.aparienciaCaraSuperior}></textarea></div>
//                     <div className="apariencia-inferior">
//                         <label>Cara Inferior (para Freezer):</label>
//                         <div className="checkbox-group">
//                             <label><input type="checkbox" defaultChecked={pasadaData.aparienciaCaraInferiorIni === 'OK'} /> Inicio lote</label>
//                             <label><input type="checkbox" defaultChecked={pasadaData.aparienciaCaraInferior14 === 'OK'} /> 1/4</label>
//                             <label><input type="checkbox" defaultChecked={pasadaData.aparienciaCaraInferior12 === 'OK'} /> 1/2</label>
//                             <label><input type="checkbox" defaultChecked={pasadaData.aparienciaCaraInferior34 === 'OK'} /> 3/4</label>
//                             <label><input type="checkbox" defaultChecked={pasadaData.aparienciaCaraInferiorFin === 'OK'} /> Final lote</label>
//                         </div>
//                     </div>
//                 </div>
                
//                 <div className="form-group-box identificacion-bobina">
//                     <label>Identificación de Bobina</label>
//                     <div className="radio-group">
//                         <label><input type="radio" name="idBobina" defaultChecked={pasadaData.identificacionBobina === 'C'} /> Corresponde</label>
//                         <label><input type="radio" name="idBobina" defaultChecked={pasadaData.identificacionBobina === 'NC'} /> No Corresponde</label>
//                     </div>
//                 </div>
//                  <div className="form-group-box ancho-bobina">
//                      <div className="input-row"><label>Ancho de Bobina o Precorte (mm):</label><input type="text" defaultValue={pasadaData.anchoRealBobina.toFixed(4)} /></div>
//                 </div>

//             </div>
            
//             {/* Columna Derecha */}
//             <div className="form-column-right">
//                 <div className="pasada-title">PASADA {pasadaNum}</div>
//                 <div className="form-group-box final-pasada">
//                     <label>FINAL PASADA</label>
//                      <div className="input-row"><label>Diámetro EXTERNO:</label><input type="text" defaultValue={pasadaData.diametroExterno.toFixed(4)} /></div>
//                      <div className="input-row"><label>Desplazamiento de Espiras(mm):</label><input type="text" defaultValue={pasadaData.desplazamientoEspiras.toFixed(4)} /></div>
//                      <div className="input-row"><label>CAMBER (mm/m):</label><input type="text" defaultValue={pasadaData.camber.toFixed(4)} /></div>
//                 </div>
                
//                 <div className="form-actions">
//                     <button className="btn btn-light" onClick={onConfirm}>Confirma</button>
//                     <button className="btn btn-light" onClick={onCancel}>Salir</button>
//                 </div>
//             </div>
//         </div>
//     </div>
//   );
// };

// export default PasadaForm;





// src/components/PasadaForm.jsx -- ADAPTADO: Vista original intacta, editable, guarda diámetros y datos

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './PasadaForm.css';

const PasadaForm = ({ pasadaNum, pasadaData, onConfirm, onCancel }) => {
    // State para campos (editable, guarda diámetros y todo)
    const [formData, setFormData] = useState({
        espesorBLM: '',
        espesorC: '',
        espesorBLO: '',
        diametroInterno: '',
        diametroExterno: '', // Editable y guarda
        desplazamientoEspiras: '',
        camber: '',
        anchoRealBobina: '',
        aparienciaCaraSuperior: '',
        aparienciaCaraInferiorIni: false, // Inicio lote
        aparienciaCaraInferior14: false, // 1/4
        aparienciaCaraInferior12: false, // 1/2
        aparienciaCaraInferior34: false, // 3/4
        aparienciaCaraInferiorFin: false, // Final lote
        identificacionBobina: 'C', // 'C' o 'NC'
        anchosDeCorte: [] // Editable
    });

    useEffect(() => {
        if (pasadaData) {
            setFormData({
                espesorBLM: pasadaData.espesorBLM || '',
                espesorC: pasadaData.espesorC || '',
                espesorBLO: pasadaData.espesorBLO || '',
                diametroInterno: pasadaData.diametroInterno || '',
                diametroExterno: pasadaData.diametroExterno || '', // Carga editable
                desplazamientoEspiras: pasadaData.desplazamientoEspiras || '',
                camber: pasadaData.camber || '',
                anchoRealBobina: pasadaData.anchoRealBobina || '',
                aparienciaCaraSuperior: pasadaData.aparienciaCaraSuperior || '',
                aparienciaCaraInferiorIni: pasadaData.aparienciaCaraInferiorIni === 'OK',
                aparienciaCaraInferior14: pasadaData.aparienciaCaraInferior14 === 'OK',
                aparienciaCaraInferior12: pasadaData.aparienciaCaraInferior12 === 'OK',
                aparienciaCaraInferior34: pasadaData.aparienciaCaraInferior34 === 'OK',
                aparienciaCaraInferiorFin: pasadaData.aparienciaCaraInferiorFin === 'OK',
                identificacionBobina: pasadaData.identificacionBobina || 'C',
                anchosDeCorte: pasadaData.anchosDeCorte || []
            });
        }
    }, [pasadaData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('ancho')) { // Para anchos de corte
            const item = parseInt(name.split('-')[1]);
            setFormData(prev => ({
                ...prev,
                anchosDeCorte: prev.anchosDeCorte.map((a, idx) => idx + 1 === item ? { ...a, valor: value } : a)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleConfirm = () => {
        // Validación básica (solo diámetro/espesor, como VB)
        if (parseFloat(formData.diametroExterno) === 0 || parseFloat(formData.espesorBLM) === 0) {
            Swal.fire('Advertencia', 'Debe ingresar Diámetros y espesor.', 'warning');
            return;
        }
        onConfirm(formData); // Pasa formData completa al parent para guardar
    };

    const handleCancel = () => {
        onCancel(); // Cierra sin guardar
    };

    return (
        <div className="pasada-form-container">
            <div className="pasada-form-grid">
                {/* Columna Izquierda: Ancho de Corte (tabla original, editable) */}
                <div className="form-group-box ancho-corte">
                    <label>Ancho de Corte (mm)</label>
                    <div className="ancho-corte-table-wrapper">
                        <table className="ancho-corte-table">
                            <thead>
                                <tr>
                                    <th>Fleje</th>
                                    <th>Medida</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.anchosDeCorte.map((ancho, index) => (
                                    <tr key={ancho.item}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <input 
                                                type="text" 
                                                value={ancho.valor} 
                                                onChange={(e) => handleInputChange({ target: { name: `ancho-${ancho.item}`, value: e.target.value } })}
                                                className="form-control" 
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Columna Central */}
                <div className="form-column-center">
                    <div className="form-group-box espesor">
                        <label>Espesor (mm)</label>
                        <div className="input-row">
                            <label>B.L.M.:</label>
                            <input type="text" value={formData.espesorBLM} onChange={(e) => setFormData(prev => ({ ...prev, espesorBLM: e.target.value }))} />
                        </div>
                        <div className="input-row">
                            <label>C.:</label>
                            <input type="text" value={formData.espesorC} onChange={(e) => setFormData(prev => ({ ...prev, espesorC: e.target.value }))} />
                        </div>
                        <div className="input-row">
                            <label>B.L.O.:</label>
                            <input type="text" value={formData.espesorBLO} onChange={(e) => setFormData(prev => ({ ...prev, espesorBLO: e.target.value }))} />
                        </div>
                    </div>

                    <div className="form-group-box diametro-interno">
                        <div className="input-row">
                            <label>Diámetro INTERNO:</label>
                            <input type="text" value={formData.diametroInterno} onChange={(e) => setFormData(prev => ({ ...prev, diametroInterno: e.target.value }))} />
                        </div>
                    </div>

                    <div className="form-group-box apariencia">
                        <label>Apariencia</label>
                        <div className="input-row">
                            <label>Cara Superior:</label>
                            <textarea rows="2" value={formData.aparienciaCaraSuperior} onChange={(e) => setFormData(prev => ({ ...prev, aparienciaCaraSuperior: e.target.value }))} />
                        </div>
                        <div className="apariencia-inferior">
                            <label>Cara Inferior (para Freezer):</label>
                            <div className="checkbox-group">
                                <label>
                                    <input type="checkbox" checked={formData.aparienciaCaraInferiorIni} onChange={(e) => setFormData(prev => ({ ...prev, aparienciaCaraInferiorIni: e.target.checked }))} />
                                    Inicio lote
                                </label>
                                <label>
                                    <input type="checkbox" checked={formData.aparienciaCaraInferior14} onChange={(e) => setFormData(prev => ({ ...prev, aparienciaCaraInferior14: e.target.checked }))} />
                                    1/4
                                </label>
                                <label>
                                    <input type="checkbox" checked={formData.aparienciaCaraInferior12} onChange={(e) => setFormData(prev => ({ ...prev, aparienciaCaraInferior12: e.target.checked }))} />
                                    1/2
                                </label>
                                <label>
                                    <input type="checkbox" checked={formData.aparienciaCaraInferior34} onChange={(e) => setFormData(prev => ({ ...prev, aparienciaCaraInferior34: e.target.checked }))} />
                                    3/4
                                </label>
                                <label>
                                    <input type="checkbox" checked={formData.aparienciaCaraInferiorFin} onChange={(e) => setFormData(prev => ({ ...prev, aparienciaCaraInferiorFin: e.target.checked }))} />
                                    Final lote
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-group-box identificacion-bobina">
                        <label>Identificación de Bobina</label>
                        <div className="radio-group">
                            <label>
                                <input type="radio" name="identificacionBobina" checked={formData.identificacionBobina === 'C'} onChange={(e) => setFormData(prev => ({ ...prev, identificacionBobina: e.target.value }))} />
                                Corresponde
                            </label>
                            <label>
                                <input type="radio" name="identificacionBobina" checked={formData.identificacionBobina === 'NC'} onChange={(e) => setFormData(prev => ({ ...prev, identificacionBobina: e.target.value }))} />
                                No Corresponde
                            </label>
                        </div>
                    </div>
                    <div className="form-group-box ancho-bobina">
                        <div className="input-row">
                            <label>Ancho de Bobina o Precorte (mm):</label>
                            <input type="text" value={formData.anchoRealBobina} onChange={(e) => setFormData(prev => ({ ...prev, anchoRealBobina: e.target.value }))} />
                        </div>
                    </div>
                </div>

                {/* Columna Derecha */}
                <div className="form-column-right">
                    <div className="pasada-title">PASADA {pasadaNum}</div>
                    <div className="form-group-box final-pasada">
                        <label>FINAL PASADA</label>
                        <div className="input-row">
                            <label>Diámetro EXTERNO:</label>
                            <input type="text" value={formData.diametroExterno} onChange={(e) => setFormData(prev => ({ ...prev, diametroExterno: e.target.value }))} />
                        </div>
                        <div className="input-row">
                            <label>Desplazamiento de Espiras(mm):</label>
                            <input type="text" value={formData.desplazamientoEspiras} onChange={(e) => setFormData(prev => ({ ...prev, desplazamientoEspiras: e.target.value }))} />
                        </div>
                        <div className="input-row">
                            <label>CAMBER (mm/m):</label>
                            <input type="text" value={formData.camber} onChange={(e) => setFormData(prev => ({ ...prev, camber: e.target.value }))} />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn btn-light" onClick={handleConfirm}>Confirma</button>
                        <button className="btn btn-light" onClick={handleCancel}>Salir</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasadaForm;
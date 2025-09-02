// src/components/PasadaForm.jsx

import React from 'react';
import './PasadaForm.css';

const PasadaForm = ({ pasadaNum, pasadaData, onConfirm, onCancel }) => {
  
  return (
    <div className="pasada-form-container">
        <div className="pasada-form-grid">

            {/* Columna Izquierda: Ancho de Corte */}
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
                            {/* ===== CORRECCIÓN AQUÍ: Se eliminó el .sort() ===== */}
                            {pasadaData.anchosDeCorte.map((ancho, index) => (
                                <tr key={ancho.item}>
                                    <td>{index + 1}</td>
                                    <td>{ancho.valor.toFixed(2)}</td>
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
                    <div className="input-row"><label>B.L.M.:</label><input type="text" defaultValue={pasadaData.espesorBLM.toFixed(4)} /></div>
                    <div className="input-row"><label>C.:</label><input type="text" defaultValue={pasadaData.espesorC.toFixed(4)} /></div>
                    <div className="input-row"><label>B.L.O.:</label><input type="text" defaultValue={pasadaData.espesorBLO.toFixed(4)} /></div>
                </div>

                <div className="form-group-box diametro-interno">
                     <div className="input-row"><label>Diámetro INTERNO:</label><input type="text" defaultValue={pasadaData.diametroInterno.toFixed(4)} /></div>
                </div>

                <div className="form-group-box apariencia">
                    <label>Apariencia</label>
                    <div className="input-row"><label>Cara Superior:</label><textarea rows="2" defaultValue={pasadaData.aparienciaCaraSuperior}></textarea></div>
                    <div className="apariencia-inferior">
                        <label>Cara Inferior (para Freezer):</label>
                        <div className="checkbox-group">
                            <label><input type="checkbox" defaultChecked={pasadaData.aparienciaCaraInferiorIni === 'OK'} /> Inicio lote</label>
                            <label><input type="checkbox" defaultChecked={pasadaData.aparienciaCaraInferior14 === 'OK'} /> 1/4</label>
                            <label><input type="checkbox" defaultChecked={pasadaData.aparienciaCaraInferior12 === 'OK'} /> 1/2</label>
                            <label><input type="checkbox" defaultChecked={pasadaData.aparienciaCaraInferior34 === 'OK'} /> 3/4</label>
                            <label><input type="checkbox" defaultChecked={pasadaData.aparienciaCaraInferiorFin === 'OK'} /> Final lote</label>
                        </div>
                    </div>
                </div>
                
                <div className="form-group-box identificacion-bobina">
                    <label>Identificación de Bobina</label>
                    <div className="radio-group">
                        <label><input type="radio" name="idBobina" defaultChecked={pasadaData.identificacionBobina === 'C'} /> Corresponde</label>
                        <label><input type="radio" name="idBobina" defaultChecked={pasadaData.identificacionBobina === 'NC'} /> No Corresponde</label>
                    </div>
                </div>
                 <div className="form-group-box ancho-bobina">
                     <div className="input-row"><label>Ancho de Bobina o Precorte (mm):</label><input type="text" defaultValue={pasadaData.anchoRealBobina.toFixed(4)} /></div>
                </div>

            </div>
            
            {/* Columna Derecha */}
            <div className="form-column-right">
                <div className="pasada-title">PASADA {pasadaNum}</div>
                <div className="form-group-box final-pasada">
                    <label>FINAL PASADA</label>
                     <div className="input-row"><label>Diámetro EXTERNO:</label><input type="text" defaultValue={pasadaData.diametroExterno.toFixed(4)} /></div>
                     <div className="input-row"><label>Desplazamiento de Espiras(mm):</label><input type="text" defaultValue={pasadaData.desplazamientoEspiras.toFixed(4)} /></div>
                     <div className="input-row"><label>CAMBER (mm/m):</label><input type="text" defaultValue={pasadaData.camber.toFixed(4)} /></div>
                </div>
                
                <div className="form-actions">
                    <button className="btn btn-light" onClick={onConfirm}>Confirma</button>
                    <button className="btn btn-light" onClick={onCancel}>Salir</button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PasadaForm;
// src/components/PasadaForm.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './PasadaForm.css';

const PasadaForm = ({ pasadaNum, pasadaData, totalFlejesHeader, onConfirm, onCancel }) => {
    const [formData, setFormData] = useState({
        espesorBLM: '', espesorC: '', espesorBLO: '',
        diametroInterno: '', diametroExterno: '', 
        desplazamientoEspiras: '', camber: '',
        anchoRealBobina: '', aparienciaCaraSuperior: '',
        aparienciaCaraInferiorIni: false, aparienciaCaraInferior14: false, 
        aparienciaCaraInferior12: false, aparienciaCaraInferior34: false, 
        aparienciaCaraInferiorFin: false, 
        identificacionBobina: 'C',
        anchosDeCorte: [] 
    });

    useEffect(() => {
        if (pasadaData) {
            const count = parseInt(totalFlejesHeader) || 0;
            const anchosExistentes = Array.isArray(pasadaData.anchosDeCorte) ? pasadaData.anchosDeCorte : [];
            const listaFinalAnchos = [];
            for (let i = 1; i <= count; i++) {
                const encontrado = anchosExistentes.find(a => parseInt(a.item) === i);
                listaFinalAnchos.push({ item: i, valor: encontrado ? encontrado.valor : '0' });
            }

            setFormData({
                espesorBLM: pasadaData.espesorBLM || '',
                espesorC: pasadaData.espesorC || '',
                espesorBLO: pasadaData.espesorBLO || '',
                diametroInterno: pasadaData.diametroInterno || '',
                diametroExterno: pasadaData.diametroExterno || '', 
                desplazamientoEspiras: pasadaData.desplazamientoEspiras || '',
                camber: pasadaData.camber || '',
                anchoRealBobina: pasadaData.anchoRealBobina || '',
                aparienciaCaraSuperior: pasadaData.aparienciaCaraSuperior || '',
                aparienciaCaraInferiorIni: pasadaData.aparienciaCaraInferiorIni === 'OK' || pasadaData.aparienciaCaraInferiorIni === true,
                aparienciaCaraInferior14: pasadaData.aparienciaCaraInferior14 === 'OK' || pasadaData.aparienciaCaraInferior14 === true,
                aparienciaCaraInferior12: pasadaData.aparienciaCaraInferior12 === 'OK' || pasadaData.aparienciaCaraInferior12 === true,
                aparienciaCaraInferior34: pasadaData.aparienciaCaraInferior34 === 'OK' || pasadaData.aparienciaCaraInferior34 === true,
                aparienciaCaraInferiorFin: pasadaData.aparienciaCaraInferiorFin === 'OK' || pasadaData.aparienciaCaraInferiorFin === true,
                identificacionBobina: pasadaData.identificacionBobina || 'C',
                anchosDeCorte: listaFinalAnchos
            });
        }
    }, [pasadaData, totalFlejesHeader]);

    // ✅ Función mejorada que acepta coma y la convierte en punto
    const formatNumericValue = (value) => {
        // Paso 1: Reemplazar TODAS las comas por puntos
        let formattedValue = value.replace(/,/g, '.');
        
        // Paso 2: Eliminar cualquier carácter que no sea dígito o punto
        formattedValue = formattedValue.replace(/[^0-9.]/g, '');
        
        // Paso 3: Asegurar que solo haya un punto decimal
        const parts = formattedValue.split('.');
        if (parts.length > 2) {
            // Si hay más de un punto, mantener solo el primero
            formattedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Paso 4: Validar que no sea negativo (eliminar signo menos si existe)
        formattedValue = formattedValue.replace('-', '');
        
        return formattedValue;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('ancho-')) { 
            // Campos de la grilla de anchos de corte
            const item = parseInt(name.split('-')[1]);
            const formattedValue = formatNumericValue(value);
            setFormData(prev => ({
                ...prev,
                anchosDeCorte: prev.anchosDeCorte.map((a) => a.item === item ? { ...a, valor: formattedValue } : a)
            }));
        } else if (name === 'aparienciaCaraSuperior') {
            // Campo de texto libre (no numérico)
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            // Campos numéricos - aplicar conversión de coma a punto
            const formattedValue = formatNumericValue(value);
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : formattedValue
            }));
        }
    };

    // ✅ Prevenir teclas no deseadas pero permitir coma y punto
    const handleKeyDown = (e) => {
        // Permitir: backspace, delete, tab, escape, enter, home, end, left, right
        const allowedKeys = [8, 9, 13, 27, 46, 35, 36, 37, 39];
        
        if (allowedKeys.includes(e.keyCode)) {
            return;
        }
        
        // Prevenir el signo menos (-) en todas sus formas
        if (e.key === '-' || e.keyCode === 189 || e.keyCode === 109) {
            e.preventDefault();
            return;
        }
        
        // Permitir dígitos (0-9), punto (.) y coma (,)
        if (/^[0-9.,]$/.test(e.key)) {
            return;
        }
        
        // Prevenir cualquier otra tecla
        e.preventDefault();
    };

    // ✅ Opcional: Convertir coma a punto también al perder el foco
    const handleBlur = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('ancho-')) {
            const item = parseInt(name.split('-')[1]);
            const finalValue = value.replace(/,/g, '.');
            setFormData(prev => ({
                ...prev,
                anchosDeCorte: prev.anchosDeCorte.map((a) => a.item === item ? { ...a, valor: finalValue } : a)
            }));
        } else if (name !== 'aparienciaCaraSuperior') {
            const finalValue = value.replace(/,/g, '.');
            setFormData(prev => ({
                ...prev,
                [name]: finalValue
            }));
        }
    };

    return (
        <div className="pasada-form-container">
            <div className="pasada-form-grid">
                {/* Columna Izquierda */}
                <div className="form-group-box ancho-corte">
                    <label>Ancho de Corte (mm)</label>
                    <div className="ancho-corte-table-wrapper">
                        <table className="ancho-corte-table">
                            <thead><tr><th>Fleje</th><th>Medida</th></tr></thead>
                            <tbody>
                                {formData.anchosDeCorte.map((ancho, index) => (
                                    <tr key={ancho.item}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <input 
                                                type="text" 
                                                inputMode="decimal"
                                                value={ancho.valor} 
                                                name={`ancho-${ancho.item}`}
                                                onChange={handleInputChange}
                                                onKeyDown={handleKeyDown}
                                                onBlur={handleBlur}
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
                            <input 
                                type="text" 
                                inputMode="decimal"
                                name="espesorBLM" 
                                value={formData.espesorBLM} 
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                            />
                        </div>
                        <div className="input-row">
                            <label>C.:</label>
                            <input 
                                type="text" 
                                inputMode="decimal"
                                name="espesorC" 
                                value={formData.espesorC} 
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                            />
                        </div>
                        <div className="input-row">
                            <label>B.L.O.:</label>
                            <input 
                                type="text" 
                                inputMode="decimal"
                                name="espesorBLO" 
                                value={formData.espesorBLO} 
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                            />
                        </div>
                    </div>

                    <div className="form-group-box diametro-interno">
                        <div className="input-row">
                            <label>Diámetro INTERNO:</label>
                            <input 
                                type="text" 
                                inputMode="numeric"
                                name="diametroInterno" 
                                value={formData.diametroInterno} 
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                            />
                        </div>
                    </div>

                    <div className="form-group-box apariencia">
                        <label>Apariencia</label>
                        <div className="input-row">
                            <label>Cara Superior:</label>
                            <textarea 
                                name="aparienciaCaraSuperior" 
                                rows="2" 
                                value={formData.aparienciaCaraSuperior} 
                                onChange={handleInputChange} 
                            />
                        </div>
                        <div className="apariencia-inferior">
                            <label>Cara Inferior (para Freezer):</label>
                            <div className="checkbox-group">
                                <label><input type="checkbox" name="aparienciaCaraInferiorIni" checked={formData.aparienciaCaraInferiorIni} onChange={handleInputChange} /> Inicio lote</label>
                                <label><input type="checkbox" name="aparienciaCaraInferior14" checked={formData.aparienciaCaraInferior14} onChange={handleInputChange} /> 1/4</label>
                                <label><input type="checkbox" name="aparienciaCaraInferior12" checked={formData.aparienciaCaraInferior12} onChange={handleInputChange} /> 1/2</label>
                                <label><input type="checkbox" name="aparienciaCaraInferior34" checked={formData.aparienciaCaraInferior34} onChange={handleInputChange} /> 3/4</label>
                                <label><input type="checkbox" name="aparienciaCaraInferiorFin" checked={formData.aparienciaCaraInferiorFin} onChange={handleInputChange} /> Final lote</label>
                            </div>
                        </div>
                    </div>

                    <div className="form-group-box identificacion-bobina">
                        <label>Identificación de Bobina</label>
                        <div className="radio-group">
                            <label>
                                <input 
                                    type="radio" 
                                    name="identificacionBobina" 
                                    value="C"
                                    checked={formData.identificacionBobina === 'C'} 
                                    onChange={() => setFormData(prev => ({ ...prev, identificacionBobina: 'C' }))} 
                                />
                                Corresponde
                            </label>
                            <label>
                                <input 
                                    type="radio" 
                                    name="identificacionBobina" 
                                    value="NC"
                                    checked={formData.identificacionBobina === 'NC'} 
                                    onChange={() => setFormData(prev => ({ ...prev, identificacionBobina: 'NC' }))} 
                                />
                                No Corresponde
                            </label>
                        </div>
                    </div>
                    <div className="form-group-box ancho-bobina">
                        <div className="input-row">
                            <label>Ancho de Bobina (mm):</label>
                            <input 
                                type="text" 
                                inputMode="numeric"
                                name="anchoRealBobina" 
                                value={formData.anchoRealBobina} 
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                            />
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
                            <input 
                                type="text" 
                                inputMode="numeric"
                                name="diametroExterno" 
                                value={formData.diametroExterno} 
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                            />
                        </div>
                        <div className="input-row">
                            <label>Despl. Espiras(mm):</label>
                            <input 
                                type="text" 
                                inputMode="numeric"
                                name="desplazamientoEspiras" 
                                value={formData.desplazamientoEspiras} 
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                            />
                        </div>
                        <div className="input-row">
                            <label>CAMBER (mm/m):</label>
                            <input 
                                type="text" 
                                inputMode="decimal"
                                name="camber" 
                                value={formData.camber} 
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-light" onClick={() => onConfirm(formData)}>Confirma</button>
                        <button className="btn btn-light" onClick={onCancel}>Salir</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasadaForm;
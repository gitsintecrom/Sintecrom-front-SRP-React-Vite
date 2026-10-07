// // /src/components/Calidad/CalidadModal.jsx
// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Row, Col, Card, Table } from 'react-bootstrap';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';

// const CalidadModal = ({ show, onHide, operacion, onSuccess }) => {
//     const [defectos, setDefectos] = useState([]);
//     const [defectosDetectados, setDefectosDetectados] = useState([]);
//     const [formData, setFormData] = useState({
//         defecto: '',
//         gravedad: '',
//         ubicacion: '',
//         nota: ''
//     });
//     const [notaCalidad, setNotaCalidad] = useState('');
//     const [retornaStock, setRetornaStock] = useState(false);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (show && operacion) {
//             cargarDefectos();
//             setDefectosDetectados([]);
//             setNotaCalidad('');
//             setRetornaStock(false);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//         }
//     }, [show, operacion]);

//     const cargarDefectos = async () => {
//         try {
//             const familia = operacion?.Codigo_Producto 
//                 ? operacion.Codigo_Producto.substring(8, 2) 
//                 : '00';
            
//             const response = await axiosInstance.get('/calidad/defectos', {
//                 params: { familia }
//             });
//             setDefectos(Array.isArray(response.data) ? response.data : []);
//         } catch (error) {
//             console.error('Error al cargar defectos:', error);
//             setDefectos([]);
//         }
//     };

//     const handleAgregarDefecto = () => {
//         if (!formData.defecto) {
//             Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
//             return;
//         }

//         if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
//             Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
//             return;
//         }

//         const nuevoDefecto = {
//             id: Date.now(),
//             defecto: formData.defecto,
//             descripcion: defectos.find(d => d.Codigo === formData.defecto)?.Descripcion || '',
//             gravedad: formData.gravedad,
//             ubicacion: formData.ubicacion,
//             nota: formData.nota
//         };

//         setDefectosDetectados([...defectosDetectados, nuevoDefecto]);
//         setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     };

//     const handleEliminarDefecto = (id) => {
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== id));
//     };

//     const handleModificarDefecto = (defecto) => {
//         setFormData({
//             defecto: defecto.defecto,
//             gravedad: defecto.gravedad,
//             ubicacion: defecto.ubicacion,
//             nota: defecto.nota
//         });
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== defecto.id));
//     };

//     const handleGuardarCalidad = async (dictamen) => {
//         // dictamen: 1 = Aprobado, 2 = Rechazado
        
//         if (defectosDetectados.length === 0 && dictamen === 2) {
//             Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
//             return;
//         }

//         setLoading(true);

//         try {
//             // Guardar cada defecto
//             for (const defecto of defectosDetectados) {
//                 await axiosInstance.post('/calidad/guardar', {
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     familia: operacion.Codigo_Producto ? operacion.Codigo_Producto.substring(8, 2) : '',
//                     codigo: defecto.defecto,
//                     gravedad: defecto.gravedad,
//                     ubicacion: defecto.ubicacion,
//                     nota: defecto.nota || '',
//                     usuario: 'pmorrone',
//                     sobrante: operacion.Sobrante,
//                     sobreorden: operacion.Kilos_Sobreorden
//                 });
//             }

//             // Actualizar estado de la operación (aprobado/rechazado)
//             await axiosInstance.post('/calidad/actualizar-dictamen', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 dictamen: dictamen,
//                 notaCalidad: notaCalidad,
//                 retornaStock: retornaStock
//             });

//             await Swal.fire(
//                 'Éxito',
//                 dictamen === 1 ? 'Operación APROBADA correctamente' : 'Operación RECHAZADA correctamente',
//                 'success'
//             );

//             if (onSuccess) onSuccess();
//             onHide();
//         } catch (error) {
//             console.error('Error al guardar calidad:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al guardar calidad', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getGravedadLabel = (codigo) => {
//         const labels = {
//             '0': '[0] Sin Requerimiento',
//             '1': '[1] Grave',
//             '2': '[2] Moderado',
//             '3': '[3] Leve'
//         };
//         return labels[codigo] || codigo;
//     };

//     const getUbicacionLabel = (codigo) => {
//         const labels = {
//             '1': '[1] Lado Operador',
//             '2': '[2] Centro',
//             '3': '[3] Lado Motor'
//         };
//         return labels[codigo] || codigo;
//     };

//     if (!operacion) return null;

//     return (
//         <Modal 
//             show={show} 
//             onHide={onHide} 
//             size="xl" 
//             centered
//             backdrop="static"
//             keyboard={false}
//         >
//             <Modal.Header closeButton className="bg-secondary text-white">
//                 <Modal.Title>
//                     <i className="fas fa-clipboard-check me-2"></i>
//                     REGISTRACION CALIDAD - Operaciones pendientes
//                 </Modal.Title>
//             </Modal.Header>
            
//             <Modal.Body className="bg-light">
//                 {/* Header con datos de la operación */}
//                 <Card className="mb-3">
//                     <Card.Body>
//                         <Row>
//                             <Col md={6}>
//                                 <div className="mb-2">
//                                     <strong>Máquina:</strong> {operacion.Maquina}
//                                 </div>
//                                 <div className="mb-2">
//                                     <strong>Tarea:</strong> {operacion.Tarea}
//                                 </div>
//                                 <div className="mb-2">
//                                     <strong>Nro. Batch:</strong> {operacion.NroBatch}
//                                 </div>
//                                 <div className="mb-2">
//                                     <strong>Serie/Lote:</strong> {operacion.SerieLote}
//                                 </div>
//                             </Col>
//                             <Col md={6}>
//                                 <div className="mb-2">
//                                     <strong>Nro. Operación:</strong> {operacion.NroOperacion}
//                                 </div>
//                                 <div className="mb-2">
//                                     <strong>Kgs. Calidad:</strong> 
//                                     <span className="badge bg-primary ms-2">{operacion.Kilos_Sobreorden?.toFixed(3)}</span>
//                                 </div>
//                                 <div className="mb-2">
//                                     <strong>Kgs. Programados:</strong> 
//                                     <span className="badge bg-info ms-2">{operacion.Kilos_Bruto?.toFixed(3)}</span>
//                                 </div>
//                                 <div className="mb-2">
//                                     <strong>Tipo:</strong> 
//                                     <span className={`badge ms-2 bg-${
//                                         operacion.Tipo === 'SO' ? 'success' : 
//                                         operacion.Tipo === 'Sobrante' ? 'warning' : 'danger'
//                                     }`}>
//                                         {operacion.Tipo}
//                                     </span>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 {/* Defectos Detectados */}
//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white">
//                         <i className="fas fa-exclamation-triangle me-2"></i>
//                         Defectos Detectados
//                     </Card.Header>
//                     <Card.Body>
//                         <Row className="mb-3">
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label>Defecto *</Form.Label>
//                                     <Form.Select
//                                         value={formData.defecto}
//                                         onChange={(e) => setFormData({...formData, defecto: e.target.value})}
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         {defectos.map((defecto, index) => (
//                                             <option key={index} value={defecto.Codigo}>
//                                                 {defecto.Descripcion}
//                                             </option>
//                                         ))}
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label>Gravedad</Form.Label>
//                                     <Form.Select
//                                         value={formData.gravedad}
//                                         onChange={(e) => setFormData({...formData, gravedad: e.target.value})}
//                                         disabled={formData.defecto === 'FDI'}
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[0] Sin Requerimiento</option>
//                                         <option value="1">[1] Grave</option>
//                                         <option value="2">[2] Moderado</option>
//                                         <option value="3">[3] Leve</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label>Ubicación</Form.Label>
//                                     <Form.Select
//                                         value={formData.ubicacion}
//                                         onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
//                                         disabled={formData.defecto === 'FDI'}
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         <option value="1">[1] Lado Operador</option>
//                                         <option value="2">[2] Centro</option>
//                                         <option value="3">[3] Lado Motor</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label>Nota</Form.Label>
//                                     <Form.Control
//                                         type="text"
//                                         value={formData.nota}
//                                         onChange={(e) => setFormData({...formData, nota: e.target.value})}
//                                         size="sm"
//                                     />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
                        
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button 
//                                 variant="primary" 
//                                 onClick={handleAgregarDefecto}
//                                 size="sm"
//                             >
//                                 <i className="fas fa-plus me-1"></i>
//                                 Agregar Defecto
//                             </Button>
//                         </div>

//                         {/* Tabla de defectos */}
//                         <Table striped bordered hover size="sm">
//                             <thead className="table-dark">
//                                 <tr>
//                                     <th>Defecto</th>
//                                     <th>Gravedad</th>
//                                     <th>Ubicación</th>
//                                     <th>Nota</th>
//                                     <th width="100">Acciones</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {defectosDetectados.length === 0 ? (
//                                     <tr>
//                                         <td colSpan="5" className="text-center text-muted">
//                                             No hay defectos registrados
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     defectosDetectados.map((defecto) => (
//                                         <tr key={defecto.id}>
//                                             <td>{defecto.descripcion}</td>
//                                             <td>{getGravedadLabel(defecto.gravedad)}</td>
//                                             <td>{getUbicacionLabel(defecto.ubicacion)}</td>
//                                             <td>{defecto.nota}</td>
//                                             <td>
//                                                 <Button 
//                                                     variant="warning" 
//                                                     size="sm"
//                                                     onClick={() => handleModificarDefecto(defecto)}
//                                                     className="me-1"
//                                                 >
//                                                     <i className="fas fa-edit"></i>
//                                                 </Button>
//                                                 <Button 
//                                                     variant="danger" 
//                                                     size="sm"
//                                                     onClick={() => handleEliminarDefecto(defecto.id)}
//                                                 >
//                                                     <i className="fas fa-trash"></i>
//                                                 </Button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </Table>
//                     </Card.Body>
//                 </Card>

//                 {/* Notas de Calidad */}
//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white">
//                         <i className="fas fa-sticky-note me-2"></i>
//                         Notas Calidad
//                     </Card.Header>
//                     <Card.Body>
//                         <Form.Control
//                             as="textarea"
//                             rows={3}
//                             value={notaCalidad}
//                             onChange={(e) => setNotaCalidad(e.target.value)}
//                             placeholder="Ingrese notas adicionales sobre la calidad..."
//                         />
//                     </Card.Body>
//                 </Card>

//                 {/* Checkbox Retorna Stock */}
//                 <Form.Check
//                     type="checkbox"
//                     label="Retorna a STOCK"
//                     checked={retornaStock}
//                     onChange={(e) => setRetornaStock(e.target.checked)}
//                     className="mb-3"
//                 />
//             </Modal.Body>

//             <Modal.Footer className="bg-light">
//                 <Button 
//                     variant="secondary" 
//                     onClick={onHide}
//                     disabled={loading}
//                 >
//                     <i className="fas fa-times me-1"></i>
//                     Cancelar
//                 </Button>
                
//                 <Button 
//                     variant="danger" 
//                     onClick={() => handleGuardarCalidad(2)}
//                     disabled={loading || defectosDetectados.length === 0}
//                     className="me-2"
//                 >
//                     <i className="fas fa-times-circle me-1"></i>
//                     RECHAZADO
//                 </Button>
                
//                 <Button 
//                     variant="success" 
//                     onClick={() => handleGuardarCalidad(1)}
//                     disabled={loading}
//                 >
//                     <i className="fas fa-check-circle me-1"></i>
//                     APROBADO
//                 </Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default CalidadModal;



























// // /src/components/Calidad/CalidadModal.jsx
// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Row, Col, Card, Table, Badge } from 'react-bootstrap';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';

// const CalidadModal = ({ show, onHide, operacion, onSuccess }) => {
//     const [defectos, setDefectos] = useState([]);
//     const [defectosDetectados, setDefectosDetectados] = useState([]);
//     const [formData, setFormData] = useState({
//         defecto: '',
//         gravedad: '',
//         ubicacion: '',
//         nota: ''
//     });
//     const [notaCalidad, setNotaCalidad] = useState('');
//     const [retornaStock, setRetornaStock] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [datosOperacion, setDatosOperacion] = useState(null);

//     useEffect(() => {
//         if (show && operacion) {
//             cargarDefectos();
//             cargarDefectosExistentes();
//             cargarDatosCompletosOperacion();
//             setNotaCalidad('');
//             setRetornaStock(false);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//         }
//     }, [show, operacion]);

//     const cargarDatosCompletosOperacion = async () => {
//         try {
//             // Obtener datos completos de la operación desde el backend
//             const response = await axiosInstance.get(`/registracion/detalle/${operacion.Operacion_ID}`);
//             setDatosOperacion(response.data);
//         } catch (error) {
//             console.error('Error al cargar datos de operación:', error);
//         }
//     };

//     const cargarDefectos = async () => {
//         try {
//             const familia = operacion?.Codigo_Producto 
//                 ? operacion.Codigo_Producto.substring(8, 2) 
//                 : '00';
            
//             const response = await axiosInstance.get('/calidad/defectos', {
//                 params: { familia }
//             });
//             setDefectos(Array.isArray(response.data) ? response.data : []);
//         } catch (error) {
//             console.error('Error al cargar defectos:', error);
//             setDefectos([]);
//         }
//     };

//     const cargarDefectosExistentes = async () => {
//         try {
//             // Cargar defectos ya registrados para esta operación
//             const response = await axiosInstance.get('/calidad/defectos-existentes', {
//                 params: { 
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS 
//                 }
//             });
//             setDefectosDetectados(Array.isArray(response.data) ? response.data : []);
//         } catch (error) {
//             console.error('Error al cargar defectos existentes:', error);
//             setDefectosDetectados([]);
//         }
//     };

//     const handleAgregarDefecto = () => {
//         if (!formData.defecto) {
//             Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
//             return;
//         }

//         if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
//             Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
//             return;
//         }

//         const defectoSeleccionado = defectos.find(d => d.Codigo === formData.defecto);
        
//         const nuevoDefecto = {
//             id: Date.now(),
//             defecto: formData.defecto,
//             descripcion: defectoSeleccionado?.Descripcion || '',
//             gravedad: formData.gravedad,
//             gravedadDesc: getGravedadLabel(formData.gravedad),
//             ubicacion: formData.ubicacion,
//             ubicacionDesc: getUbicacionLabel(formData.ubicacion),
//             nota: formData.nota
//         };

//         setDefectosDetectados([...defectosDetectados, nuevoDefecto]);
//         setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     };

//     const handleEliminarDefecto = (id) => {
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== id));
//     };

//     const handleModificarDefecto = (defecto) => {
//         setFormData({
//             defecto: defecto.defecto,
//             gravedad: defecto.gravedad,
//             ubicacion: defecto.ubicacion,
//             nota: defecto.nota
//         });
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== defecto.id));
//     };

//     const getGravedadLabel = (codigo) => {
//         const labels = {
//             '0': '[0, Sin Requerimiento]',
//             '1': '[1, Grave]',
//             '2': '[2, Moderado]',
//             '3': '[3, Leve]'
//         };
//         return labels[codigo] || codigo;
//     };

//     const getUbicacionLabel = (codigo) => {
//         const labels = {
//             '1': '[1, Lado Operador]',
//             '2': '[2, Centro]',
//             '3': '[3, Lado Motor]'
//         };
//         return labels[codigo] || codigo;
//     };

//     const handleGuardarCalidad = async (dictamen) => {
//         // dictamen: 1 = Aprobado, 2 = Rechazado
        
//         if (defectosDetectados.length === 0 && dictamen === 2) {
//             Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
//             return;
//         }

//         setLoading(true);

//         try {
//             // Guardar cada defecto
//             for (const defecto of defectosDetectados) {
//                 await axiosInstance.post('/calidad/guardar', {
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     familia: operacion.Codigo_Producto ? operacion.Codigo_Producto.substring(8, 2) : '',
//                     codigo: defecto.defecto,
//                     gravedad: defecto.gravedad,
//                     ubicacion: defecto.ubicacion,
//                     nota: defecto.nota || '',
//                     usuario: 'pmorrone',
//                     sobrante: operacion.Sobrante,
//                     sobreorden: operacion.Kilos_Sobreorden
//                 });
//             }

//             // Actualizar estado de la operación (aprobado/rechazado)
//             await axiosInstance.post('/calidad/actualizar-dictamen', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 dictamen: dictamen,
//                 notaCalidad: notaCalidad,
//                 retornaStock: retornaStock
//             });

//             await Swal.fire(
//                 'Éxito',
//                 dictamen === 1 ? 'Operación APROBADA correctamente' : 'Operación RECHAZADA correctamente',
//                 'success'
//             );

//             if (onSuccess) onSuccess();
//             onHide();
//         } catch (error) {
//             console.error('Error al guardar calidad:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al guardar calidad', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!operacion) return null;

//     return (
//         <Modal 
//             show={show} 
//             onHide={onHide} 
//             size="xl" 
//             centered
//             backdrop="static"
//             keyboard={false}
//         >
//             <Modal.Header closeButton className="bg-secondary text-white">
//                 <Modal.Title>
//                     <i className="fas fa-clipboard-check me-2"></i>
//                     REGISTRACION CALIDAD - Operaciones pendientes
//                 </Modal.Title>
//             </Modal.Header>
            
//             <Modal.Body className="bg-light">
//                 {/* Header con datos de la operación - EXACTAMENTE COMO EL ORIGINAL */}
//                 <Card className="mb-3">
//                     <Card.Body>
//                         <Row>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small">Datos Corte</legend>
//                                     <Row>
//                                         <Col md={6}>
//                                             <div className="mb-1">
//                                                 <strong>Ancho:</strong> {datosOperacion?.header?.Ancho || operacion.Ancho || 'N/A'}
//                                             </div>
//                                             <div className="mb-1">
//                                                 <strong>Tarea Destino:</strong> {datosOperacion?.header?.TareaDestino || operacion.Tarea || 'N/A'}
//                                             </div>
//                                             <div className="mb-1">
//                                                 <strong>Serie/Lote Dest:</strong> {operacion.SerieLote?.substring(0, 11) || 'N/A'}
//                                             </div>
//                                         </Col>
//                                         <Col md={6}>
//                                             <div className="mb-1">
//                                                 <strong>Cant.Pasadas:</strong> {datosOperacion?.header?.Pasadas || '1'}
//                                             </div>
//                                             <div className="mb-1">
//                                                 <strong>Kgs.Programados:</strong> {parseFloat(operacion.Kilos_Bruto || 0).toFixed(2)}
//                                             </div>
//                                             <div className="mb-1">
//                                                 <strong>Kgs.SobreOrden:</strong> {parseFloat(operacion.Kilos_Sobreorden || 0).toFixed(0)}
//                                             </div>
//                                         </Col>
//                                     </Row>
//                                 </fieldset>
                                
//                                 <div className="bg-secondary text-white text-center p-2 mb-2">
//                                     <h5><strong>Kgs.Calidad: {parseFloat(operacion.Kilos_Sobreorden || 0).toFixed(0)}</strong></h5>
//                                 </div>
//                             </Col>
                            
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small">Clientes</legend>
//                                     <div className="mb-1">
//                                         <strong>{datosOperacion?.header?.Clientes || 'N/A'}</strong>
//                                     </div>
//                                     <div className="mb-1">
//                                         <strong>Nº Pedido:</strong> {datosOperacion?.header?.NumeroPedido || 'N/A'}
//                                     </div>
//                                 </fieldset>
                                
//                                 <div className="text-end">
//                                     <Button variant="info" size="sm">
//                                         Ficha Técnica
//                                     </Button>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 {/* Defectos Detectados */}
//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white">
//                         <i className="fas fa-exclamation-triangle me-2"></i>
//                         Defectos Detectados
//                     </Card.Header>
//                     <Card.Body>
//                         <Row className="mb-3">
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label>Defecto *</Form.Label>
//                                     <Form.Select
//                                         value={formData.defecto}
//                                         onChange={(e) => setFormData({...formData, defecto: e.target.value})}
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         {defectos.map((defecto, index) => (
//                                             <option key={index} value={defecto.Codigo}>
//                                                 {defecto.Descripcion}
//                                             </option>
//                                         ))}
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label>Gravedad</Form.Label>
//                                     <Form.Select
//                                         value={formData.gravedad}
//                                         onChange={(e) => setFormData({...formData, gravedad: e.target.value})}
//                                         disabled={formData.defecto === 'FDI'}
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[0, Sin Requerimiento]</option>
//                                         <option value="1">[1, Grave]</option>
//                                         <option value="2">[2, Moderado]</option>
//                                         <option value="3">[3, Leve]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label>Ubicación</Form.Label>
//                                     <Form.Select
//                                         value={formData.ubicacion}
//                                         onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
//                                         disabled={formData.defecto === 'FDI'}
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         <option value="1">[1, Lado Operador]</option>
//                                         <option value="2">[2, Centro]</option>
//                                         <option value="3">[3, Lado Motor]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label>Nota</Form.Label>
//                                     <Form.Control
//                                         type="text"
//                                         value={formData.nota}
//                                         onChange={(e) => setFormData({...formData, nota: e.target.value})}
//                                         size="sm"
//                                     />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
                        
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button 
//                                 variant="primary" 
//                                 onClick={handleAgregarDefecto}
//                                 size="sm"
//                             >
//                                 <i className="fas fa-plus me-1"></i>
//                                 Agregar Defecto
//                             </Button>
//                         </div>

//                         {/* Tabla de defectos - EXACTAMENTE COMO EL ORIGINAL */}
//                         <Table striped bordered hover size="sm" className="mb-2">
//                             <thead className="table-dark">
//                                 <tr>
//                                     <th>Defecto</th>
//                                     <th>Gravedad</th>
//                                     <th>Ubicación</th>
//                                     <th>Nota</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {defectosDetectados.length === 0 ? (
//                                     <tr>
//                                         <td colSpan="4" className="text-center text-muted">
//                                             No hay defectos registrados
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     defectosDetectados.map((defecto) => (
//                                         <tr key={defecto.id}>
//                                             <td>{defecto.descripcion}</td>
//                                             <td>{defecto.gravedadDesc}</td>
//                                             <td>{defecto.ubicacionDesc}</td>
//                                             <td>{defecto.nota}</td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </Table>
                        
//                         <div className="text-end">
//                             <Button 
//                                 variant="secondary" 
//                                 onClick={() => {}}
//                                 size="sm"
//                             >
//                                 Modificar
//                             </Button>
//                         </div>
//                     </Card.Body>
//                 </Card>

//                 {/* Notas de Calidad */}
//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white">
//                         Notas Calidad
//                     </Card.Header>
//                     <Card.Body>
//                         <Form.Control
//                             as="textarea"
//                             rows={3}
//                             value={notaCalidad}
//                             onChange={(e) => setNotaCalidad(e.target.value)}
//                             placeholder="Ingrese notas adicionales sobre la calidad..."
//                         />
//                     </Card.Body>
//                 </Card>

//                 {/* Checkbox Retorna Stock */}
//                 <Form.Check
//                     type="checkbox"
//                     label="Retorna a STOCK"
//                     checked={retornaStock}
//                     onChange={(e) => setRetornaStock(e.target.checked)}
//                     className="mb-3"
//                 />
//             </Modal.Body>

//             <Modal.Footer className="bg-light">
//                 <Button 
//                     variant="secondary" 
//                     onClick={onHide}
//                     disabled={loading}
//                 >
//                     <i className="fas fa-times me-1"></i>
//                     Cancelar
//                 </Button>
                
//                 <Button 
//                     variant="danger" 
//                     onClick={() => handleGuardarCalidad(2)}
//                     disabled={loading || defectosDetectados.length === 0}
//                     className="me-2"
//                 >
//                     <i className="fas fa-times-circle me-1"></i>
//                     RECHAZADO
//                 </Button>
                
//                 <Button 
//                     variant="success" 
//                     onClick={() => handleGuardarCalidad(1)}
//                     disabled={loading}
//                 >
//                     <i className="fas fa-check-circle me-1"></i>
//                     APROBADO
//                 </Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default CalidadModal;



























// // /src/components/Calidad/CalidadModal.jsx
// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Row, Col, Card, Table, Badge, Container } from 'react-bootstrap';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';

// const CalidadModal = ({ show, onHide, operacion, onSuccess }) => {
//     const [defectos, setDefectos] = useState([]);
//     const [defectosDetectados, setDefectosDetectados] = useState([]);
//     const [datosOperacion, setDatosOperacion] = useState(null);
//     const [formData, setFormData] = useState({
//         defecto: '',
//         gravedad: '',
//         ubicacion: '',
//         nota: ''
//     });
//     const [notaCalidad, setNotaCalidad] = useState('');
//     const [retornaStock, setRetornaStock] = useState(false);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (show && operacion) {
//             cargarDatosCompletos();
//         }
//     }, [show, operacion]);

//     const cargarDatosCompletos = async () => {
//         try {
//             setLoading(true);
            
//             // 1. Obtener datos completos de la operación desde el backend
//             console.log(' Cargando datos para operación:', operacion.Operacion_ID);
            
//             const response = await axiosInstance.get(`/registracion/detalle/${operacion.Operacion_ID}`);
//             console.log('📊 Datos recibidos:', response.data);
            
//             setDatosOperacion(response.data);
            
//             // 2. Cargar defectos disponibles
//             await cargarDefectosDisponibles(response.data.header?.Familia || '00');
            
//             // 3. Cargar defectos existentes registrados
//             await cargarDefectosExistentes();
            
//             setNotaCalidad('');
//             setRetornaStock(false);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
            
//         } catch (error) {
//             console.error('❌ Error al cargar datos:', error);
//             Swal.fire('Error', 'No se pudieron cargar los datos de la operación', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const cargarDefectosDisponibles = async (familia) => {
//         try {
//             const response = await axiosInstance.get('/calidad/defectos', {
//                 params: { familia }
//             });
//             setDefectos(Array.isArray(response.data) ? response.data : []);
//         } catch (error) {
//             console.error('Error al cargar defectos:', error);
//             setDefectos([]);
//         }
//     };

//     const cargarDefectosExistentes = async () => {
//         try {
//             console.log('🔍 Buscando defectos existentes para:', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS
//             });
            
//             // Ejecutar el SP que trae los defectos registrados
//             const response = await axiosInstance.get('/calidad/defectos-registrados', {
//                 params: { 
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     sobrante: operacion.Sobrante || 0
//                 }
//             });
            
//             console.log('✅ Defectos encontrados:', response.data);
//             setDefectosDetectados(Array.isArray(response.data) ? response.data : []);
//         } catch (error) {
//             console.error('❌ Error al cargar defectos existentes:', error);
//             setDefectosDetectados([]);
//         }
//     };

//     const handleAgregarDefecto = () => {
//         if (!formData.defecto) {
//             Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
//             return;
//         }

//         if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
//             Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
//             return;
//         }

//         const defectoSeleccionado = defectos.find(d => d.Codigo === formData.defecto);
        
//         const nuevoDefecto = {
//             id: Date.now(),
//             defecto: formData.defecto,
//             descripcion: defectoSeleccionado?.Descripcion || '',
//             gravedad: formData.gravedad,
//             gravedadDesc: getGravedadLabel(formData.gravedad),
//             ubicacion: formData.ubicacion,
//             ubicacionDesc: getUbicacionLabel(formData.ubicacion),
//             nota: formData.nota
//         };

//         setDefectosDetectados([...defectosDetectados, nuevoDefecto]);
//         setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     };

//     const handleEliminarDefecto = (id) => {
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== id));
//     };

//     const handleModificarDefecto = (defecto) => {
//         setFormData({
//             defecto: defecto.defecto,
//             gravedad: defecto.gravedad,
//             ubicacion: defecto.ubicacion,
//             nota: defecto.nota
//         });
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== defecto.id));
//     };

//     const getGravedadLabel = (codigo) => {
//         const labels = {
//             '0': '[0, Sin Requerimiento]',
//             '1': '[1, Grave]',
//             '2': '[2, Moderado]',
//             '3': '[3, Leve]'
//         };
//         return labels[codigo] || codigo;
//     };

//     const getUbicacionLabel = (codigo) => {
//         const labels = {
//             '0': '[1, Lado Operador]',
//             '1': '[2, Centro]',
//             '2': '[3, Lado Motor]'
//         };
//         return labels[codigo] || codigo;
//     };

//     const handleGuardarCalidad = async (dictamen) => {
//         // dictamen: 1 = Aprobado, 2 = Rechazado
        
//         if (defectosDetectados.length === 0 && dictamen === 2) {
//             Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
//             return;
//         }

//         setLoading(true);

//         try {
//             // Guardar cada defecto
//             for (const defecto of defectosDetectados) {
//                 await axiosInstance.post('/calidad/guardar', {
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     familia: datosOperacion?.header?.Familia || '00',
//                     codigo: defecto.defecto,
//                     gravedad: defecto.gravedad,
//                     ubicacion: defecto.ubicacion,
//                     nota: defecto.nota || '',
//                     usuario: 'pmorrone',
//                     sobrante: operacion.Sobrante,
//                     sobreorden: operacion.Kilos_Sobreorden
//                 });
//             }

//             // Actualizar estado de la operación (aprobado/rechazado)
//             await axiosInstance.post('/calidad/actualizar-dictamen', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 dictamen: dictamen,
//                 notaCalidad: notaCalidad,
//                 retornaStock: retornaStock
//             });

//             await Swal.fire(
//                 'Éxito',
//                 dictamen === 1 ? 'Operación APROBADA correctamente' : 'Operación RECHAZADA correctamente',
//                 'success'
//             );

//             if (onSuccess) onSuccess();
//             onHide();
//         } catch (error) {
//             console.error('Error al guardar calidad:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al guardar calidad', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!operacion || !datosOperacion) return null;

//     const header = datosOperacion.header || {};

//     return (
//         <Modal 
//             show={show} 
//             onHide={onHide} 
//             size="xl" 
//             centered
//             backdrop="static"
//             keyboard={false}
//         >
//             <Modal.Header closeButton className="bg-secondary text-white">
//                 <Modal.Title>
//                     <i className="fas fa-clipboard-check me-2"></i>
//                     REGISTRACION CALIDAD - Operaciones pendientes
//                 </Modal.Title>
//             </Modal.Header>
            
//             <Modal.Body className="bg-light">
//                 {/* Header con datos de la operación */}
//                 <Card className="mb-3">
//                     <Card.Body>
//                         <Row>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2">Datos Corte</legend>
//                                     <Row>
//                                         <Col md={6}>
//                                             <div className="mb-1">
//                                                 <strong>Ancho:</strong> {header.Ancho || 'N/A'}
//                                             </div>
//                                             <div className="mb-1">
//                                                 <strong>Tarea Destino:</strong> {header.TareaDestino || operacion.Tarea || 'N/A'}
//                                             </div>
//                                             <div className="mb-1">
//                                                 <strong>Serie/Lote Dest:</strong> {operacion.SerieLote?.substring(0, 11) || 'N/A'}
//                                             </div>
//                                         </Col>
//                                         <Col md={6}>
//                                             <div className="mb-1">
//                                                 <strong>Cant.Pasadas:</strong> {header.Pasadas || '1'}
//                                             </div>
//                                             <div className="mb-1">
//                                                 <strong>Kgs.Programados:</strong> {parseFloat(header.KgsProgramados || 0).toFixed(2)}
//                                             </div>
//                                             <div className="mb-1">
//                                                 <strong>Kgs.SobreOrden:</strong> {parseFloat(operacion.Kilos_Sobreorden || 0).toFixed(0)}
//                                             </div>
//                                         </Col>
//                                     </Row>
//                                 </fieldset>
                                
//                                 <div className="bg-secondary text-white text-center p-2 mb-2">
//                                     <h5><strong>Kgs.Calidad: {parseFloat(operacion.Kilos_Sobreorden || 0).toFixed(0)}</strong></h5>
//                                 </div>
//                             </Col>
                            
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2">Clientes</legend>
//                                     <div className="mb-1">
//                                         <strong>{header.Clientes || 'N/A'}</strong>
//                                     </div>
//                                     <div className="mb-1">
//                                         <strong>Nº Pedido:</strong> {header.NumeroPedido || header.PedidoID || 'N/A'}
//                                     </div>
//                                 </fieldset>
                                
//                                 <div className="text-end">
//                                     <Button variant="info" size="sm">
//                                         Ficha Técnica
//                                     </Button>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 {/* Defectos Detectados */}
//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white">
//                         <i className="fas fa-exclamation-triangle me-2"></i>
//                         Defectos Detectados
//                     </Card.Header>
//                     <Card.Body>
//                         <Row className="mb-3">
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label>Defecto *</Form.Label>
//                                     <Form.Select
//                                         value={formData.defecto}
//                                         onChange={(e) => setFormData({...formData, defecto: e.target.value})}
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         {defectos.map((defecto, index) => (
//                                             <option key={index} value={defecto.Codigo}>
//                                                 {defecto.Descripcion}
//                                             </option>
//                                         ))}
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label>Gravedad</Form.Label>
//                                     <Form.Select
//                                         value={formData.gravedad}
//                                         onChange={(e) => setFormData({...formData, gravedad: e.target.value})}
//                                         disabled={formData.defecto === 'FDI'}
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[0, Sin Requerimiento]</option>
//                                         <option value="1">[1, Grave]</option>
//                                         <option value="2">[2, Moderado]</option>
//                                         <option value="3">[3, Leve]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label>Ubicación</Form.Label>
//                                     <Form.Select
//                                         value={formData.ubicacion}
//                                         onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
//                                         disabled={formData.defecto === 'FDI'}
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[1, Lado Operador]</option>
//                                         <option value="1">[2, Centro]</option>
//                                         <option value="2">[3, Lado Motor]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label>Nota</Form.Label>
//                                     <Form.Control
//                                         type="text"
//                                         value={formData.nota}
//                                         onChange={(e) => setFormData({...formData, nota: e.target.value})}
//                                         size="sm"
//                                     />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
                        
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button 
//                                 variant="primary" 
//                                 onClick={handleAgregarDefecto}
//                                 size="sm"
//                             >
//                                 <i className="fas fa-plus me-1"></i>
//                                 Agregar Defecto
//                             </Button>
//                         </div>

//                         {/* Tabla de defectos */}
//                         <Table striped bordered hover size="sm" className="mb-2">
//                             <thead className="table-dark">
//                                 <tr>
//                                     <th>Defecto</th>
//                                     <th>Gravedad</th>
//                                     <th>Ubicación</th>
//                                     <th>Nota</th>
//                                     <th width="100">Acciones</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {defectosDetectados.length === 0 ? (
//                                     <tr>
//                                         <td colSpan="5" className="text-center text-muted">
//                                             No hay defectos registrados
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     defectosDetectados.map((defecto) => (
//                                         <tr key={defecto.id}>
//                                             <td>{defecto.descripcion}</td>
//                                             <td>{defecto.gravedadDesc}</td>
//                                             <td>{defecto.ubicacionDesc}</td>
//                                             <td>{defecto.nota}</td>
//                                             <td>
//                                                 <Button 
//                                                     variant="warning" 
//                                                     size="sm"
//                                                     onClick={() => handleModificarDefecto(defecto)}
//                                                     className="me-1"
//                                                 >
//                                                     <i className="fas fa-edit"></i>
//                                                 </Button>
//                                                 <Button 
//                                                     variant="danger" 
//                                                     size="sm"
//                                                     onClick={() => handleEliminarDefecto(defecto.id)}
//                                                 >
//                                                     <i className="fas fa-trash"></i>
//                                                 </Button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </Table>
                        
//                         <div className="text-end">
//                             <Button 
//                                 variant="secondary" 
//                                 onClick={() => {}}
//                                 size="sm"
//                             >
//                                 Modificar
//                             </Button>
//                         </div>
//                     </Card.Body>
//                 </Card>

//                 {/* Notas de Calidad */}
//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white">
//                         Notas Calidad
//                     </Card.Header>
//                     <Card.Body>
//                         <Form.Control
//                             as="textarea"
//                             rows={3}
//                             value={notaCalidad}
//                             onChange={(e) => setNotaCalidad(e.target.value)}
//                             placeholder="Ingrese notas adicionales sobre la calidad..."
//                         />
//                     </Card.Body>
//                 </Card>

//                 {/* Checkbox Retorna Stock */}
//                 <Form.Check
//                     type="checkbox"
//                     label="Retorna a STOCK"
//                     checked={retornaStock}
//                     onChange={(e) => setRetornaStock(e.target.checked)}
//                     className="mb-3"
//                 />
//             </Modal.Body>

//             <Modal.Footer className="bg-light">
//                 <Button 
//                     variant="secondary" 
//                     onClick={onHide}
//                     disabled={loading}
//                 >
//                     <i className="fas fa-times me-1"></i>
//                     Cancelar
//                 </Button>
                
//                 <Button 
//                     variant="danger" 
//                     onClick={() => handleGuardarCalidad(2)}
//                     disabled={loading || defectosDetectados.length === 0}
//                     className="me-2"
//                 >
//                     <i className="fas fa-times-circle me-1"></i>
//                     RECHAZADO
//                 </Button>
                
//                 <Button 
//                     variant="success" 
//                     onClick={() => handleGuardarCalidad(1)}
//                     disabled={loading}
//                 >
//                     <i className="fas fa-check-circle me-1"></i>
//                     APROBADO
//                 </Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default CalidadModal;
















































// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Row, Col, Card, Table } from 'react-bootstrap';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';

// const CalidadModal = ({ show, onHide, operacion, onSuccess }) => {
//     const [defectos, setDefectos] = useState([]);
//     const [defectosDetectados, setDefectosDetectados] = useState([]);
//     const [datosOperacion, setDatosOperacion] = useState(null);
//     const [formData, setFormData] = useState({
//         defecto: '',
//         gravedad: '',
//         ubicacion: '',
//         nota: ''
//     });
//     const [notaCalidad, setNotaCalidad] = useState('');
//     const [retornaStock, setRetornaStock] = useState(false);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (show && operacion) {
//             console.log('🚀 [CalidadModal] Modal abierto para operación:', operacion);
//             cargarDatosCompletos();
//         } else {
//             // Limpiar estado al cerrar para evitar datos residuales
//             setDatosOperacion(null);
//             setDefectosDetectados([]);
//             setDefectos([]);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//             setNotaCalidad('');
//             setRetornaStock(false);
//         }
//     }, [show, operacion]);

//     const cargarDatosCompletos = async () => {
//         try {
//             console.log('📥 [CalidadModal] Iniciando carga de datos para Operacion_ID:', operacion.Operacion_ID);
//             setLoading(true);
            
//             // 1. Obtener datos completos de la operación desde el backend
//             console.log('📡 [CalidadModal] Solicitando /registracion/detalle/', operacion.Operacion_ID);
//             const response = await axiosInstance.get(`/registracion/detalle/${operacion.Operacion_ID}`);
//             console.log('📊 [CalidadModal] Datos de operación recibidos (HEADER):', response.data.header);
//             console.log('📊 [CalidadModal] Datos de operación recibidos (LINEAS):', response.data.lineas);
            
//             setDatosOperacion(response.data);
            
//             // 2. Cargar defectos disponibles
//             const familia = response.data.header?.Familia || (operacion.Codigo_Producto ? operacion.Codigo_Producto.substring(8, 2) : '00');
//             console.log('📡 [CalidadModal] Solicitando defectos disponibles para familia:', familia);
//             await cargarDefectosDisponibles(familia);
            
//             // 3. Cargar defectos existentes registrados
//             await cargarDefectosExistentes();
            
//             setNotaCalidad('');
//             setRetornaStock(false);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
            
//         } catch (error) {
//             console.error('❌ [CalidadModal] Error crítico al cargar datos:', error);
//             Swal.fire('Error', 'No se pudieron cargar los datos de la operación: ' + (error.message || 'Error desconocido'), 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const cargarDefectosDisponibles = async (familia) => {
//         try {
//             const response = await axiosInstance.get('/calidad/defectos', {
//                 params: { familia }
//             });
//             const data = Array.isArray(response.data) ? response.data : [];
//             console.log('✅ [CalidadModal] Defectos disponibles cargados:', data.length, data);
//             setDefectos(data);
//         } catch (error) {
//             console.error('❌ [CalidadModal] Error al cargar defectos disponibles:', error);
//             setDefectos([]);
//         }
//     };

//     const cargarDefectosExistentes = async () => {
//         try {
//             console.log('📡 [CalidadModal] Solicitando defectos registrados:', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 sobrante: operacion.Sobrante
//             });
            
//             const response = await axiosInstance.get('/calidad/defectos-registrados', {
//                 params: { 
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     sobrante: operacion.Sobrante || 0
//                 }
//             });
            
//             console.log('✅ [CalidadModal] Defectos registrados RAW:', response.data);
//             const data = Array.isArray(response.data) ? response.data : [];
//             console.log('✅ [CalidadModal] Defectos registrados procesados:', data.length, data);
//             setDefectosDetectados(data);
//         } catch (error) {
//             console.error('❌ [CalidadModal] Error al cargar defectos existentes:', error);
//             setDefectosDetectados([]);
//         }
//     };

//     const handleAgregarDefecto = () => {
//         if (!formData.defecto) {
//             Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
//             return;
//         }

//         if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
//             Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
//             return;
//         }

//         const defectoSeleccionado = defectos.find(d => d.Codigo === formData.defecto);
        
//         const nuevoDefecto = {
//             id: Date.now(),
//             defecto: formData.defecto,
//             descripcion: defectoSeleccionado?.Descripcion || formData.defecto,
//             gravedad: formData.gravedad,
//             gravedadDesc: getGravedadLabel(formData.gravedad),
//             ubicacion: formData.ubicacion,
//             ubicacionDesc: getUbicacionLabel(formData.ubicacion),
//             nota: formData.nota
//         };

//         console.log('➕ [CalidadModal] Agregando defecto:', nuevoDefecto);
//         setDefectosDetectados([...defectosDetectados, nuevoDefecto]);
//         setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     };

//     const handleEliminarDefecto = (id) => {
//         console.log('🗑️ [CalidadModal] Eliminando defecto ID:', id);
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== id));
//     };

//     const handleModificarDefecto = (defecto) => {
//         console.log('✏️ [CalidadModal] Modificando defecto:', defecto);
//         setFormData({
//             defecto: defecto.defecto,
//             gravedad: defecto.gravedad,
//             ubicacion: defecto.ubicacion,
//             nota: defecto.nota
//         });
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== defecto.id));
//     };

//     const getGravedadLabel = (codigo) => {
//         const labels = {
//             '0': '[0, Sin Requerimiento]',
//             '1': '[1, Grave]',
//             '2': '[2, Moderado]',
//             '3': '[3, Leve]'
//         };
//         return labels[codigo] || codigo;
//     };

//     const getUbicacionLabel = (codigo) => {
//         const labels = {
//             '0': '[1, Lado Operador]',
//             '1': '[2, Centro]',
//             '2': '[3, Lado Motor]'
//         };
//         return labels[codigo] || codigo;
//     };

//     const handleGuardarCalidad = async (dictamen) => {
//         if (defectosDetectados.length === 0 && dictamen === 2) {
//             Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
//             return;
//         }

//         setLoading(true);

//         try {
//             console.log('💾 [CalidadModal] Guardando calidad. Dictamen:', dictamen);
//             console.log('💾 [CalidadModal] Defectos a guardar:', defectosDetectados);

//             // Guardar cada defecto
//             for (const defecto of defectosDetectados) {
//                 await axiosInstance.post('/calidad/guardar', {
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     familia: datosOperacion?.header?.Familia || '00',
//                     codigo: defecto.defecto,
//                     gravedad: defecto.gravedad,
//                     ubicacion: defecto.ubicacion,
//                     nota: defecto.nota || '',
//                     usuario: 'pmorrone', 
//                     sobrante: operacion.Sobrante,
//                     sobreorden: operacion.Kilos_Sobreorden
//                 });
//             }

//             // Actualizar estado de la operación (aprobado/rechazado)
//             await axiosInstance.post('/calidad/actualizar-dictamen', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 dictamen: dictamen,
//                 notaCalidad: notaCalidad,
//                 retornaStock: retornaStock
//             });

//             await Swal.fire(
//                 'Éxito',
//                 dictamen === 1 ? 'Operación APROBADA correctamente' : 'Operación RECHAZADA correctamente',
//                 'success'
//             );

//             if (onSuccess) onSuccess();
//             onHide();
//         } catch (error) {
//             console.error('❌ [CalidadModal] Error al guardar calidad:', error);
//             Swal.fire('Error', error.response?.data?.error || error.message || 'Error al guardar calidad', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Mostrar spinner de carga mientras se obtienen los datos
//     if (!operacion || !datosOperacion) {
//         return (
//             <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//                 <Modal.Header closeButton className="bg-secondary text-white">
//                     <Modal.Title>Cargando datos de calidad...</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body className="text-center py-5">
//                     <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
//                         <span className="visually-hidden">Cargando...</span>
//                     </div>
//                     <p className="mt-3">Obteniendo información de la operación y defectos registrados...</p>
//                 </Modal.Body>
//             </Modal>
//         );
//     }

//     const header = datosOperacion.header || {};
    
//     // Fallbacks robustos para obtener los datos correctos si no están en el header principal
//     const tareaDestino = header.TareaDestino || datosOperacion.lineas?.[0]?.Tarea || operacion.Tarea || 'N/A';
//     const numeroPedido = header.NumeroPedido || header.PedidoID || operacion.NumeroPedido || 'N/A';

//     return (
//         <Modal 
//             show={show} 
//             onHide={onHide} 
//             size="xl" 
//             centered
//             backdrop="static"
//             keyboard={false}
//         >
//             <Modal.Header closeButton className="bg-secondary text-white">
//                 <Modal.Title>
//                     <i className="fas fa-clipboard-check me-2"></i>
//                     REGISTRACION CALIDAD - Operaciones pendientes
//                 </Modal.Title>
//             </Modal.Header>
            
//             <Modal.Body className="bg-light">
//                 {/* Header con datos de la operación */}
//                 <Card className="mb-3">
//                     <Card.Body>
//                         <Row>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Datos Corte</legend>
//                                     <Row>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Ancho:</strong> {header.Ancho || 'N/A'}</div>
//                                             <div className="mb-1"><strong>Tarea Destino:</strong> {tareaDestino}</div>
//                                             <div className="mb-1"><strong>Serie/Lote Dest:</strong> {operacion.SerieLote ? operacion.SerieLote.substring(0, 11) : 'N/A'}</div>
//                                         </Col>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Cant.Pasadas:</strong> {header.Pasadas || '1'}</div>
//                                             <div className="mb-1"><strong>Kgs.Programados:</strong> {parseFloat(header.KgsProgramados || 0).toFixed(2)}</div>
//                                             <div className="mb-1"><strong>Kgs.SobreOrden:</strong> {parseFloat(operacion.Kilos_Sobreorden || 0).toFixed(0)}</div>
//                                         </Col>
//                                     </Row>
//                                 </fieldset>
                                
//                                 <div className="bg-secondary text-white text-center p-2 mb-2 rounded">
//                                     <h5 className="mb-0"><strong>Kgs.Calidad: {parseFloat(operacion.Kilos_Sobreorden || 0).toFixed(0)}</strong></h5>
//                                 </div>
//                             </Col>
                            
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Clientes</legend>
//                                     <div className="mb-1"><strong>{header.Clientes || 'N/A'}</strong></div>
//                                     <div className="mb-1"><strong>Nº Pedido:</strong> {numeroPedido}</div>
//                                 </fieldset>
                                
//                                 <div className="text-end">
//                                     <Button variant="info" size="sm" disabled title="Funcionalidad pendiente de integrar">
//                                         <i className="fas fa-file-alt me-1"></i> Ficha Técnica
//                                     </Button>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 {/* Defectos Detectados */}
//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white">
//                         <i className="fas fa-exclamation-triangle me-2"></i>
//                         Defectos Detectados
//                     </Card.Header>
//                     <Card.Body>
//                         <Row className="mb-3">
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Defecto *</Form.Label>
//                                     <Form.Select
//                                         value={formData.defecto}
//                                         onChange={(e) => setFormData({...formData, defecto: e.target.value})}
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         {defectos.map((defecto, index) => (
//                                             <option key={index} value={defecto.Codigo}>
//                                                 {defecto.Descripcion}
//                                             </option>
//                                         ))}
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Gravedad</Form.Label>
//                                     <Form.Select
//                                         value={formData.gravedad}
//                                         onChange={(e) => setFormData({...formData, gravedad: e.target.value})}
//                                         disabled={formData.defecto === 'FDI'}
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[0, Sin Requerimiento]</option>
//                                         <option value="1">[1, Grave]</option>
//                                         <option value="2">[2, Moderado]</option>
//                                         <option value="3">[3, Leve]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Ubicación</Form.Label>
//                                     <Form.Select
//                                         value={formData.ubicacion}
//                                         onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
//                                         disabled={formData.defecto === 'FDI'}
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[1, Lado Operador]</option>
//                                         <option value="1">[2, Centro]</option>
//                                         <option value="2">[3, Lado Motor]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Nota</Form.Label>
//                                     <Form.Control
//                                         type="text"
//                                         value={formData.nota}
//                                         onChange={(e) => setFormData({...formData, nota: e.target.value})}
//                                         size="sm"
//                                         placeholder="Observación..."
//                                     />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
                        
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button 
//                                 variant="primary" 
//                                 onClick={handleAgregarDefecto}
//                                 size="sm"
//                             >
//                                 <i className="fas fa-plus me-1"></i> Agregar Defecto
//                             </Button>
//                         </div>

//                         {/* Tabla de defectos */}
//                         <Table striped bordered hover size="sm" className="mb-2">
//                             <thead className="table-dark">
//                                 <tr>
//                                     <th>Defecto</th>
//                                     <th>Gravedad</th>
//                                     <th>Ubicación</th>
//                                     <th>Nota</th>
//                                     <th width="100" className="text-center">Acciones</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {defectosDetectados.length === 0 ? (
//                                     <tr>
//                                         <td colSpan="5" className="text-center text-muted py-3">
//                                             <i className="fas fa-info-circle me-2"></i>
//                                             No hay defectos registrados para esta operación
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     defectosDetectados.map((defecto) => (
//                                         <tr key={defecto.id}>
//                                             <td>{defecto.descripcion}</td>
//                                             <td>{defecto.gravedadDesc}</td>
//                                             <td>{defecto.ubicacionDesc}</td>
//                                             <td>{defecto.nota || '-'}</td>
//                                             <td className="text-center">
//                                                 <Button 
//                                                     variant="warning" 
//                                                     size="sm"
//                                                     onClick={() => handleModificarDefecto(defecto)}
//                                                     className="me-1"
//                                                     title="Modificar"
//                                                 >
//                                                     <i className="fas fa-edit"></i>
//                                                 </Button>
//                                                 <Button 
//                                                     variant="danger" 
//                                                     size="sm"
//                                                     onClick={() => handleEliminarDefecto(defecto.id)}
//                                                     title="Eliminar"
//                                                 >
//                                                     <i className="fas fa-trash"></i>
//                                                 </Button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </Table>
//                     </Card.Body>
//                 </Card>

//                 {/* Notas de Calidad */}
//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white">
//                         <i className="fas fa-sticky-note me-2"></i> Notas Calidad
//                     </Card.Header>
//                     <Card.Body>
//                         <Form.Control
//                             as="textarea"
//                             rows={3}
//                             value={notaCalidad}
//                             onChange={(e) => setNotaCalidad(e.target.value)}
//                             placeholder="Ingrese notas adicionales sobre la calidad..."
//                         />
//                     </Card.Body>
//                 </Card>

//                 {/* Checkbox Retorna Stock */}
//                 <Form.Check
//                     type="checkbox"
//                     label={<span className="fw-bold">Retorna a STOCK</span>}
//                     checked={retornaStock}
//                     onChange={(e) => setRetornaStock(e.target.checked)}
//                     className="mb-3"
//                 />
//             </Modal.Body>

//             <Modal.Footer className="bg-light">
//                 <Button 
//                     variant="secondary" 
//                     onClick={onHide}
//                     disabled={loading}
//                 >
//                     <i className="fas fa-times me-1"></i> Cancelar
//                 </Button>
                
//                 <Button 
//                     variant="danger" 
//                     onClick={() => handleGuardarCalidad(2)}
//                     disabled={loading || defectosDetectados.length === 0}
//                     className="me-2"
//                 >
//                     <i className="fas fa-times-circle me-1"></i> RECHAZADO
//                 </Button>
                
//                 <Button 
//                     variant="success" 
//                     onClick={() => handleGuardarCalidad(1)}
//                     disabled={loading}
//                 >
//                     <i className="fas fa-check-circle me-1"></i> APROBADO
//                 </Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default CalidadModal;




























// // /src/components/Calidad/CalidadModal.jsx
// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Row, Col, Card, Table } from 'react-bootstrap';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';

// const CalidadModal = ({ show, onHide, operacion, onSuccess }) => {
//     const [defectos, setDefectos] = useState([]);
//     const [defectosDetectados, setDefectosDetectados] = useState([]);
//     const [datosOperacion, setDatosOperacion] = useState(null);
//     const [formData, setFormData] = useState({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     const [notaCalidad, setNotaCalidad] = useState('');
//     const [retornaStock, setRetornaStock] = useState(false);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (show && operacion) {
//             cargarDatosCompletos();
//         }
//     }, [show, operacion]);

//     const cargarDatosCompletos = async () => {
//         try {
//             setLoading(true);
//             console.log('🚀 [Modal] Cargando datos para Operacion_ID:', operacion.Operacion_ID);
            
//             // 1. Usamos getDetalleOperacion (que ya funciona perfecto)
//             const response = await axiosInstance.get(`/registracion/detalle/${operacion.Operacion_ID}`);
//             console.log('📊 [Modal] Datos recibidos de getDetalleOperacion:', response.data);
//             setDatosOperacion(response.data);
            
//             // 2. Cargar defectos disponibles
//             const header = response.data.header || {};
//             const familia = header.Familia && header.Familia !== 'N/A' ? header.Familia : (operacion.Codigo_Producto ? operacion.Codigo_Producto.substring(8, 2) : '00');
//             await cargarDefectosDisponibles(familia);
            
//             // 3. Cargar defectos existentes
//             await cargarDefectosExistentes();
            
//             setNotaCalidad('');
//             setRetornaStock(false);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//         } catch (error) {
//             console.error('❌ [Modal] Error al cargar datos:', error);
//             Swal.fire('Error', 'No se pudieron cargar los datos de la operación', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const cargarDefectosDisponibles = async (familia) => {
//         try {
//             const response = await axiosInstance.get('/calidad/defectos', { params: { familia } });
//             setDefectos(Array.isArray(response.data) ? response.data : []);
//         } catch (error) {
//             console.error('❌ [Modal] Error al cargar defectos disponibles:', error);
//             setDefectos([]);
//         }
//     };

//     const cargarDefectosExistentes = async () => {
//         try {
//             console.log('🔍 [Modal] Buscando defectos existentes:', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 sobrante: operacion.Sobrante
//             });
            
//             const response = await axiosInstance.get('/calidad/defectos-registrados', {
//                 params: { 
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     sobrante: operacion.Sobrante || 0
//                 }
//             });
            
//             console.log('✅ [Modal] Defectos existentes recibidos:', response.data);
//             setDefectosDetectados(Array.isArray(response.data) ? response.data : []);
//         } catch (error) {
//             console.error('❌ [Modal] Error al cargar defectos existentes:', error);
//             setDefectosDetectados([]);
//         }
//     };

//     const handleAgregarDefecto = () => {
//         if (!formData.defecto) {
//             Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
//             return;
//         }
//         if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
//             Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
//             return;
//         }

//         const defectoSeleccionado = defectos.find(d => d.Codigo === formData.defecto);
//         const nuevoDefecto = {
//             id: Date.now(),
//             defecto: formData.defecto,
//             descripcion: defectoSeleccionado?.Descripcion || '',
//             gravedad: formData.gravedad,
//             gravedadDesc: getGravedadLabel(formData.gravedad),
//             ubicacion: formData.ubicacion,
//             ubicacionDesc: getUbicacionLabel(formData.ubicacion),
//             nota: formData.nota
//         };

//         setDefectosDetectados([...defectosDetectados, nuevoDefecto]);
//         setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     };

//     const handleEliminarDefecto = (id) => {
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== id));
//     };

//     const handleModificarDefecto = (defecto) => {
//         setFormData({
//             defecto: defecto.defecto,
//             gravedad: defecto.gravedad,
//             ubicacion: defecto.ubicacion,
//             nota: defecto.nota
//         });
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== defecto.id));
//     };

//     const getGravedadLabel = (codigo) => {
//         const labels = { '0': '[0, Sin Requerimiento]', '1': '[1, Grave]', '2': '[2, Moderado]', '3': '[3, Leve]' };
//         return labels[codigo] || codigo;
//     };

//     const getUbicacionLabel = (codigo) => {
//         const labels = { '0': '[1, Lado Operador]', '1': '[2, Centro]', '2': '[3, Lado Motor]' };
//         return labels[codigo] || codigo;
//     };

//     const handleGuardarCalidad = async (dictamen) => {
//         if (defectosDetectados.length === 0 && dictamen === 2) {
//             Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
//             return;
//         }
//         setLoading(true);
//         try {
//             const header = datosOperacion?.header || {};
//             for (const defecto of defectosDetectados) {
//                 await axiosInstance.post('/calidad/guardar', {
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     familia: header.Familia && header.Familia !== 'N/A' ? header.Familia : '00',
//                     codigo: defecto.defecto,
//                     gravedad: defecto.gravedad,
//                     ubicacion: defecto.ubicacion,
//                     nota: defecto.nota || '',
//                     usuario: 'pmorrone',
//                     sobrante: operacion.Sobrante,
//                     sobreorden: operacion.Kilos_Sobreorden
//                 });
//             }
//             await axiosInstance.post('/calidad/actualizar-dictamen', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 dictamen: dictamen,
//                 notaCalidad: notaCalidad,
//                 retornaStock: retornaStock
//             });
//             await Swal.fire('Éxito', dictamen === 1 ? 'Operación APROBADA' : 'Operación RECHAZADA', 'success');
//             if (onSuccess) onSuccess();
//             onHide();
//         } catch (error) {
//             console.error('❌ [Modal] Error al guardar:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al guardar', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!operacion || !datosOperacion) {
//         return (
//             <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//                 <Modal.Body className="text-center py-5">
//                     <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
//                     <p className="mt-3">Cargando datos de la operación...</p>
//                 </Modal.Body>
//             </Modal>
//         );
//     }

//     const header = datosOperacion.header || {};
//     const linea = datosOperacion.lineas?.[0] || {};

//     // ✅ CORRECCIÓN CLAVE: Usar los datos que getDetalleOperacion YA nos devuelve correctamente
//     const tareaDestino = linea.Tarea || header.Tarea || operacion.Tarea || 'N/A';
//     const clientes = header.Clientes || 'N/A';
//     const numeroPedido = header.NumeroPedido || header.PedidoID || 'N/A';
//     const pasadas = header.Pasadas || '1';
//     const kgProgramados = header.KgsProgramados || operacion.Kilos_Bruto || 0;

//     return (
//         <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//             <Modal.Header closeButton className="bg-secondary text-white">
//                 <Modal.Title><i className="fas fa-clipboard-check me-2"></i> REGISTRACION CALIDAD</Modal.Title>
//             </Modal.Header>
//             <Modal.Body className="bg-light">
//                 <Card className="mb-3">
//                     <Card.Body>
//                         <Row>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Datos Corte</legend>
//                                     <Row>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Ancho:</strong> {header.Ancho || 'N/A'}</div>
//                                             <div className="mb-1"><strong>Tarea Destino:</strong> {tareaDestino}</div>
//                                             <div className="mb-1"><strong>Serie/Lote Dest:</strong> {operacion.SerieLote ? operacion.SerieLote.substring(0, 11) : 'N/A'}</div>
//                                         </Col>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Cant.Pasadas:</strong> {pasadas}</div>
//                                             <div className="mb-1"><strong>Kgs.Programados:</strong> {parseFloat(kgProgramados).toFixed(2)}</div>
//                                             <div className="mb-1"><strong>Kgs.SobreOrden:</strong> {parseFloat(operacion.Kilos_Sobreorden || 0).toFixed(0)}</div>
//                                         </Col>
//                                     </Row>
//                                 </fieldset>
//                                 <div className="bg-secondary text-white text-center p-2 mb-2 rounded">
//                                     <h5 className="mb-0"><strong>Kgs.Calidad: {parseFloat(operacion.Kilos_Sobreorden || 0).toFixed(0)}</strong></h5>
//                                 </div>
//                             </Col>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Clientes</legend>
//                                     <div className="mb-1"><strong>{clientes}</strong></div>
//                                     <div className="mb-1"><strong>Nº Pedido:</strong> {numeroPedido}</div>
//                                 </fieldset>
//                                 <div className="text-end">
//                                     <Button variant="info" size="sm" disabled><i className="fas fa-file-alt me-1"></i> Ficha Técnica</Button>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-exclamation-triangle me-2"></i> Defectos Detectados</Card.Header>
//                     <Card.Body>
//                         <Row className="mb-3">
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Defecto *</Form.Label>
//                                     <Form.Select value={formData.defecto} onChange={(e) => setFormData({...formData, defecto: e.target.value})} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         {defectos.map((d, i) => <option key={i} value={d.Codigo}>{d.Descripcion}</option>)}
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Gravedad</Form.Label>
//                                     <Form.Select value={formData.gravedad} onChange={(e) => setFormData({...formData, gravedad: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[0, Sin Requerimiento]</option>
//                                         <option value="1">[1, Grave]</option>
//                                         <option value="2">[2, Moderado]</option>
//                                         <option value="3">[3, Leve]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Ubicación</Form.Label>
//                                     <Form.Select value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[1, Lado Operador]</option>
//                                         <option value="1">[2, Centro]</option>
//                                         <option value="2">[3, Lado Motor]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Nota</Form.Label>
//                                     <Form.Control type="text" value={formData.nota} onChange={(e) => setFormData({...formData, nota: e.target.value})} size="sm" />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button variant="primary" onClick={handleAgregarDefecto} size="sm"><i className="fas fa-plus me-1"></i> Agregar</Button>
//                         </div>
//                         <Table striped bordered hover size="sm" className="mb-2">
//                             <thead className="table-dark">
//                                 <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th width="100" className="text-center">Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {defectosDetectados.length === 0 ? (
//                                     <tr><td colSpan="5" className="text-center text-muted py-3">No hay defectos registrados</td></tr>
//                                 ) : (
//                                     defectosDetectados.map((d) => (
//                                         <tr key={d.id}>
//                                             <td>{d.descripcion}</td>
//                                             <td>{d.gravedadDesc}</td>
//                                             <td>{d.ubicacionDesc}</td>
//                                             <td>{d.nota || '-'}</td>
//                                             <td className="text-center">
//                                                 <Button variant="warning" size="sm" onClick={() => handleModificarDefecto(d)} className="me-1"><i className="fas fa-edit"></i></Button>
//                                                 <Button variant="danger" size="sm" onClick={() => handleEliminarDefecto(d.id)}><i className="fas fa-trash"></i></Button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </Table>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-sticky-note me-2"></i> Notas Calidad</Card.Header>
//                     <Card.Body>
//                         <Form.Control as="textarea" rows={3} value={notaCalidad} onChange={(e) => setNotaCalidad(e.target.value)} placeholder="Ingrese notas adicionales..." />
//                     </Card.Body>
//                 </Card>

//                 <Form.Check type="checkbox" label={<span className="fw-bold">Retorna a STOCK</span>} checked={retornaStock} onChange={(e) => setRetornaStock(e.target.checked)} className="mb-3" />
//             </Modal.Body>
//             <Modal.Footer className="bg-light">
//                 <Button variant="secondary" onClick={onHide} disabled={loading}><i className="fas fa-times me-1"></i> Cancelar</Button>
//                 <Button variant="danger" onClick={() => handleGuardarCalidad(2)} disabled={loading || defectosDetectados.length === 0} className="me-2"><i className="fas fa-times-circle me-1"></i> RECHAZADO</Button>
//                 <Button variant="success" onClick={() => handleGuardarCalidad(1)} disabled={loading}><i className="fas fa-check-circle me-1"></i> APROBADO</Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default CalidadModal;





























































// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Row, Col, Card, Table } from 'react-bootstrap';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';

// const CalidadModal = ({ show, onHide, operacion, onSuccess }) => {
//     const [defectos, setDefectos] = useState([]);
//     const [defectosDetectados, setDefectosDetectados] = useState([]);
//     const [datosOperacion, setDatosOperacion] = useState(null);
//     const [formData, setFormData] = useState({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     const [notaCalidad, setNotaCalidad] = useState('');
//     const [retornaStock, setRetornaStock] = useState(false);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (show && operacion) {
//             cargarDatosCompletos();
//         }
//     }, [show, operacion]);

//     const cargarDatosCompletos = async () => {
//         try {
//             setLoading(true);
//             console.log('🚀 [Modal] Cargando datos para Operacion_ID:', operacion.Operacion_ID);
            
//             // 1. Usamos la nueva ruta específica de calidad
//             const response = await axiosInstance.get(`/calidad/detalle/${operacion.Operacion_ID}`);
//             console.log('📊 [Modal] Datos recibidos:', response.data);
//             setDatosOperacion(response.data);
            
//             // 2. Cargar defectos disponibles para el combo
//             const familia = operacion.Codigo_Producto ? operacion.Codigo_Producto.substring(8, 2) : '00';
//             const respDefectos = await axiosInstance.get('/calidad/defectos', { params: { familia } });
//             setDefectos(Array.isArray(respDefectos.data) ? respDefectos.data : []);
            
//             // 3. Cargar defectos existentes (ya vienen en la respuesta del detalle)
//             setDefectosDetectados(response.data.defectos || []);
            
//             setNotaCalidad('');
//             setRetornaStock(false);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//         } catch (error) {
//             console.error('❌ [Modal] Error al cargar datos:', error);
//             Swal.fire('Error', 'No se pudieron cargar los datos de la operación: ' + error.message, 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAgregarDefecto = () => {
//         if (!formData.defecto) {
//             Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
//             return;
//         }
//         if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
//             Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
//             return;
//         }

//         const defectoSeleccionado = defectos.find(d => d.Codigo === formData.defecto);
//         const nuevoDefecto = {
//             id: Date.now(),
//             defecto: formData.defecto,
//             descripcion: defectoSeleccionado?.Descripcion || '',
//             gravedad: formData.gravedad,
//             gravedadDesc: getGravedadLabel(formData.gravedad),
//             ubicacion: formData.ubicacion,
//             ubicacionDesc: getUbicacionLabel(formData.ubicacion),
//             nota: formData.nota
//         };

//         setDefectosDetectados([...defectosDetectados, nuevoDefecto]);
//         setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     };

//     const handleEliminarDefecto = (id) => {
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== id));
//     };

//     const handleModificarDefecto = (defecto) => {
//         setFormData({
//             defecto: defecto.defecto,
//             gravedad: defecto.gravedad,
//             ubicacion: defecto.ubicacion,
//             nota: defecto.nota
//         });
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== defecto.id));
//     };

//     const getGravedadLabel = (codigo) => {
//         const labels = { '0': '[0, Sin Requerimiento]', '1': '[1, Grave]', '2': '[2, Moderado]', '3': '[3, Leve]' };
//         return labels[codigo] || codigo;
//     };

//     const getUbicacionLabel = (codigo) => {
//         const labels = { '0': '[1, Lado Operador]', '1': '[2, Centro]', '2': '[3, Lado Motor]' };
//         return labels[codigo] || codigo;
//     };

//     const handleGuardarCalidad = async (dictamen) => {
//         if (defectosDetectados.length === 0 && dictamen === 2) {
//             Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
//             return;
//         }
//         setLoading(true);
//         try {
//             const familia = operacion.Codigo_Producto ? operacion.Codigo_Producto.substring(8, 2) : '00';
            
//             for (const defecto of defectosDetectados) {
//                 await axiosInstance.post('/calidad/guardar', {
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     familia: familia,
//                     codigo: defecto.defecto,
//                     gravedad: defecto.gravedad,
//                     ubicacion: defecto.ubicacion,
//                     nota: defecto.nota || '',
//                     usuario: 'pmorrone',
//                     sobrante: operacion.Sobrante,
//                     sobreorden: operacion.Kilos_Sobreorden
//                 });
//             }
            
//             await axiosInstance.post('/calidad/actualizar-dictamen', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 dictamen: dictamen,
//                 notaCalidad: notaCalidad,
//                 retornaStock: retornaStock
//             });
            
//             await Swal.fire('Éxito', dictamen === 1 ? 'Operación APROBADA' : 'Operación RECHAZADA', 'success');
//             if (onSuccess) onSuccess();
//             onHide();
//         } catch (error) {
//             console.error('❌ [Modal] Error al guardar:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al guardar', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!operacion || !datosOperacion) {
//         return (
//             <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//                 <Modal.Body className="text-center py-5">
//                     <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
//                     <p className="mt-3">Cargando datos de la operación...</p>
//                 </Modal.Body>
//             </Modal>
//         );
//     }

//     const header = datosOperacion.header || {};
    
//     // Combinamos datos del backend con los de la grilla para asegurar que nada quede vacío
//     const tareaDestino = header.tareaDestino || operacion.Tarea || 'N/A';
//     const clientes = header.cliente || 'N/A';
//     const numeroPedido = header.numeroPedido || 'N/A';
//     const pasadas = header.pasadas || '1';
//     const ancho = header.ancho || 'N/A';
//     const destinoLote = header.destinoLote || operacion.SerieLote || 'N/A';
//     const kgProgramados = operacion.Kilos_Bruto || 0;
//     const kgSobreOrden = operacion.Kilos_Sobreorden || 0;

//     return (
//         <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//             <Modal.Header closeButton className="bg-secondary text-white">
//                 <Modal.Title><i className="fas fa-clipboard-check me-2"></i> REGISTRACION CALIDAD</Modal.Title>
//             </Modal.Header>
//             <Modal.Body className="bg-light">
//                 <Card className="mb-3">
//                     <Card.Body>
//                         <Row>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Datos Corte</legend>
//                                     <Row>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Ancho:</strong> {ancho}</div>
//                                             <div className="mb-1"><strong>Tarea Destino:</strong> {tareaDestino}</div>
//                                             <div className="mb-1"><strong>Serie/Lote Dest:</strong> {destinoLote.substring(0, 11)}</div>
//                                         </Col>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Cant.Pasadas:</strong> {pasadas}</div>
//                                             <div className="mb-1"><strong>Kgs.Programados:</strong> {parseFloat(kgProgramados).toFixed(2)}</div>
//                                             <div className="mb-1"><strong>Kgs.SobreOrden:</strong> {parseFloat(kgSobreOrden).toFixed(0)}</div>
//                                         </Col>
//                                     </Row>
//                                 </fieldset>
//                                 <div className="bg-secondary text-white text-center p-2 mb-2 rounded">
//                                     <h5 className="mb-0"><strong>Kgs.Calidad: {parseFloat(kgSobreOrden).toFixed(0)}</strong></h5>
//                                 </div>
//                             </Col>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Clientes</legend>
//                                     <div className="mb-1"><strong>{clientes}</strong></div>
//                                     <div className="mb-1"><strong>Nº Pedido:</strong> {numeroPedido}</div>
//                                 </fieldset>
//                                 <div className="text-end">
//                                     <Button variant="info" size="sm" disabled><i className="fas fa-file-alt me-1"></i> Ficha Técnica</Button>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-exclamation-triangle me-2"></i> Defectos Detectados</Card.Header>
//                     <Card.Body>
//                         <Row className="mb-3">
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Defecto *</Form.Label>
//                                     <Form.Select value={formData.defecto} onChange={(e) => setFormData({...formData, defecto: e.target.value})} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         {defectos.map((d, i) => <option key={i} value={d.Codigo}>{d.Descripcion}</option>)}
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Gravedad</Form.Label>
//                                     <Form.Select value={formData.gravedad} onChange={(e) => setFormData({...formData, gravedad: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[0, Sin Requerimiento]</option>
//                                         <option value="1">[1, Grave]</option>
//                                         <option value="2">[2, Moderado]</option>
//                                         <option value="3">[3, Leve]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Ubicación</Form.Label>
//                                     <Form.Select value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[1, Lado Operador]</option>
//                                         <option value="1">[2, Centro]</option>
//                                         <option value="2">[3, Lado Motor]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Nota</Form.Label>
//                                     <Form.Control type="text" value={formData.nota} onChange={(e) => setFormData({...formData, nota: e.target.value})} size="sm" />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button variant="primary" onClick={handleAgregarDefecto} size="sm"><i className="fas fa-plus me-1"></i> Agregar</Button>
//                         </div>
//                         <Table striped bordered hover size="sm" className="mb-2">
//                             <thead className="table-dark">
//                                 <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th width="100" className="text-center">Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {defectosDetectados.length === 0 ? (
//                                     <tr><td colSpan="5" className="text-center text-muted py-3">No hay defectos registrados</td></tr>
//                                 ) : (
//                                     defectosDetectados.map((d) => (
//                                         <tr key={d.id}>
//                                             <td>{d.descripcion}</td>
//                                             <td>{d.gravedadDesc}</td>
//                                             <td>{d.ubicacionDesc}</td>
//                                             <td>{d.nota || '-'}</td>
//                                             <td className="text-center">
//                                                 <Button variant="warning" size="sm" onClick={() => handleModificarDefecto(d)} className="me-1"><i className="fas fa-edit"></i></Button>
//                                                 <Button variant="danger" size="sm" onClick={() => handleEliminarDefecto(d.id)}><i className="fas fa-trash"></i></Button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </Table>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-sticky-note me-2"></i> Notas Calidad</Card.Header>
//                     <Card.Body>
//                         <Form.Control as="textarea" rows={3} value={notaCalidad} onChange={(e) => setNotaCalidad(e.target.value)} placeholder="Ingrese notas adicionales..." />
//                     </Card.Body>
//                 </Card>

//                 <Form.Check type="checkbox" label={<span className="fw-bold">Retorna a STOCK</span>} checked={retornaStock} onChange={(e) => setRetornaStock(e.target.checked)} className="mb-3" />
//             </Modal.Body>
//             <Modal.Footer className="bg-light">
//                 <Button variant="secondary" onClick={onHide} disabled={loading}><i className="fas fa-times me-1"></i> Cancelar</Button>
//                 <Button variant="danger" onClick={() => handleGuardarCalidad(2)} disabled={loading || defectosDetectados.length === 0} className="me-2"><i className="fas fa-times-circle me-1"></i> RECHAZADO</Button>
//                 <Button variant="success" onClick={() => handleGuardarCalidad(1)} disabled={loading}><i className="fas fa-check-circle me-1"></i> APROBADO</Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default CalidadModal;








































// // /src/components/Calidad/CalidadModal.jsx

// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Row, Col, Card, Table } from 'react-bootstrap';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';

// const CalidadModal = ({ show, onHide, operacion, onSuccess }) => {
//     const [defectos, setDefectos] = useState([]);
//     const [defectosDetectados, setDefectosDetectados] = useState([]);
//     const [datosOperacion, setDatosOperacion] = useState(null);
//     const [formData, setFormData] = useState({
//         defecto: '',
//         gravedad: '',
//         ubicacion: '',
//         nota: ''
//     });
//     const [notaCalidad, setNotaCalidad] = useState('');
//     const [retornaStock, setRetornaStock] = useState(false);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (show && operacion) {
//             console.log('🚀 [Modal] Abriendo modal para operación:', operacion.Operacion_ID);
//             cargarDatosCompletos();
//         }
//     }, [show, operacion]);

//     const cargarDatosCompletos = async () => {
//         try {
//             setLoading(true);
//             console.log('📥 [Modal] Cargando datos para Operacion_ID:', operacion.Operacion_ID);
            
//             // 1. Usamos la nueva ruta específica de calidad
//             const response = await axiosInstance.get(`/calidad/detalle/${operacion.Operacion_ID}`);
//             console.log('📊 [Modal] Datos recibidos:', response.data);
//             setDatosOperacion(response.data);
            
//             // 2. Cargar defectos disponibles para el combo
//             // ✅ CORRECCIÓN: Extraer correctamente la familia (posiciones 8-10 del código)
//             const familia = operacion.Codigo_Producto && operacion.Codigo_Producto.length >= 10 
//                 ? operacion.Codigo_Producto.substring(8, 10) 
//                 : '00';
            
//             console.log('🔍 Familia extraída:', familia, 'de código:', operacion.Codigo_Producto);
            
//             const respDefectos = await axiosInstance.get('/calidad/defectos', { params: { familia } });
//             setDefectos(Array.isArray(respDefectos.data) ? respDefectos.data : []);
            
//             // 3. Cargar defectos existentes (ya vienen en la respuesta del detalle)
//             setDefectosDetectados(response.data.defectos || []);
            
//             setNotaCalidad('');
//             setRetornaStock(false);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//         } catch (error) {
//             console.error('❌ [Modal] Error al cargar datos:', error);
//             Swal.fire('Error', 'No se pudieron cargar los datos de la operación: ' + error.message, 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAgregarDefecto = () => {
//         if (!formData.defecto) {
//             Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
//             return;
//         }
//         if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
//             Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
//             return;
//         }

//         const defectoSeleccionado = defectos.find(d => d.Codigo === formData.defecto);
//         const nuevoDefecto = {
//             id: Date.now(),
//             defecto: formData.defecto,
//             descripcion: defectoSeleccionado?.Descripcion || '',
//             gravedad: formData.gravedad,
//             gravedadDesc: getGravedadLabel(formData.gravedad),
//             ubicacion: formData.ubicacion,
//             ubicacionDesc: getUbicacionLabel(formData.ubicacion),
//             nota: formData.nota
//         };

//         setDefectosDetectados([...defectosDetectados, nuevoDefecto]);
//         setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     };

//     const handleEliminarDefecto = (id) => {
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== id));
//     };

//     const handleModificarDefecto = (defecto) => {
//         setFormData({
//             defecto: defecto.defecto,
//             gravedad: defecto.gravedad,
//             ubicacion: defecto.ubicacion,
//             nota: defecto.nota
//         });
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== defecto.id));
//     };

//     const getGravedadLabel = (codigo) => {
//         const labels = { '0': '[0, Sin Requerimiento]', '1': '[1, Grave]', '2': '[2, Moderado]', '3': '[3, Leve]' };
//         return labels[codigo] || codigo;
//     };

//     const getUbicacionLabel = (codigo) => {
//         const labels = { '0': '[1, Lado Operador]', '1': '[2, Centro]', '2': '[3, Lado Motor]' };
//         return labels[codigo] || codigo;
//     };

//     const handleGuardarCalidad = async (dictamen) => {
//         if (defectosDetectados.length === 0 && dictamen === 2) {
//             Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
//             return;
//         }
//         setLoading(true);
//         try {
//             // ✅ CORRECCIÓN: Extraer correctamente la familia
//             const familia = operacion.Codigo_Producto && operacion.Codigo_Producto.length >= 10 
//                 ? operacion.Codigo_Producto.substring(8, 10) 
//                 : '00';
            
//             for (const defecto of defectosDetectados) {
//                 await axiosInstance.post('/calidad/guardar', {
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     familia: familia,
//                     codigo: defecto.defecto,
//                     gravedad: defecto.gravedad,
//                     ubicacion: defecto.ubicacion,
//                     nota: defecto.nota || '',
//                     usuario: 'pmorrone',
//                     sobrante: operacion.Sobrante,
//                     sobreorden: operacion.Kilos_Sobreorden
//                 });
//             }
            
//             await axiosInstance.post('/calidad/actualizar-dictamen', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 dictamen: dictamen,
//                 notaCalidad: notaCalidad,
//                 retornaStock: retornaStock
//             });
            
//             await Swal.fire('Éxito', dictamen === 1 ? 'Operación APROBADA' : 'Operación RECHAZADA', 'success');
//             if (onSuccess) onSuccess();
//             onHide();
//         } catch (error) {
//             console.error('❌ [Modal] Error al guardar:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al guardar', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!operacion || !datosOperacion) {
//         return (
//             <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//                 <Modal.Body className="text-center py-5">
//                     <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
//                     <p className="mt-3">Cargando datos de la operación...</p>
//                 </Modal.Body>
//             </Modal>
//         );
//     }

//     const header = datosOperacion.header || {};
    
//     // Combinamos datos del backend con los de la grilla para asegurar que nada quede vacío
//     const tareaDestino = header.tareaDestino || operacion.Tarea || 'N/A';
//     const clientes = header.cliente || 'N/A';
//     const numeroPedido = header.numeroPedido || 'N/A';
//     const pasadas = header.pasadas || '1';
//     const ancho = header.ancho || 'N/A';
//     const destinoLote = header.destinoLote || operacion.SerieLote || 'N/A';
//     const kgProgramados = operacion.Kilos_Bruto || 0;
//     const kgSobreOrden = operacion.Kilos_Sobreorden || 0;

//     return (
//         <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//             <Modal.Header closeButton className="bg-secondary text-white">
//                 <Modal.Title><i className="fas fa-clipboard-check me-2"></i> REGISTRACION CALIDAD</Modal.Title>
//             </Modal.Header>
//             <Modal.Body className="bg-light">
//                 <Card className="mb-3">
//                     <Card.Body>
//                         <Row>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Datos Corte</legend>
//                                     <Row>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Ancho:</strong> {ancho}</div>
//                                             <div className="mb-1"><strong>Tarea Destino:</strong> {tareaDestino}</div>
//                                             <div className="mb-1"><strong>Serie/Lote Dest:</strong> {destinoLote.substring(0, 11)}</div>
//                                         </Col>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Cant.Pasadas:</strong> {pasadas}</div>
//                                             <div className="mb-1"><strong>Kgs.Programados:</strong> {parseFloat(kgProgramados).toFixed(2)}</div>
//                                             <div className="mb-1"><strong>Kgs.SobreOrden:</strong> {parseFloat(kgSobreOrden).toFixed(0)}</div>
//                                         </Col>
//                                     </Row>
//                                 </fieldset>
//                                 <div className="bg-secondary text-white text-center p-2 mb-2 rounded">
//                                     <h5 className="mb-0"><strong>Kgs.Calidad: {parseFloat(kgSobreOrden).toFixed(0)}</strong></h5>
//                                 </div>
//                             </Col>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Clientes</legend>
//                                     <div className="mb-1"><strong>{clientes}</strong></div>
//                                     <div className="mb-1"><strong>Nº Pedido:</strong> {numeroPedido}</div>
//                                 </fieldset>
//                                 <div className="text-end">
//                                     <Button variant="info" size="sm" disabled><i className="fas fa-file-alt me-1"></i> Ficha Técnica</Button>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-exclamation-triangle me-2"></i> Defectos Detectados</Card.Header>
//                     <Card.Body>
//                         <Row className="mb-3">
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Defecto *</Form.Label>
//                                     <Form.Select value={formData.defecto} onChange={(e) => setFormData({...formData, defecto: e.target.value})} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         {defectos.map((d, i) => <option key={i} value={d.Codigo}>{d.Descripcion}</option>)}
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Gravedad</Form.Label>
//                                     <Form.Select value={formData.gravedad} onChange={(e) => setFormData({...formData, gravedad: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[0, Sin Requerimiento]</option>
//                                         <option value="1">[1, Grave]</option>
//                                         <option value="2">[2, Moderado]</option>
//                                         <option value="3">[3, Leve]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Ubicación</Form.Label>
//                                     <Form.Select value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[1, Lado Operador]</option>
//                                         <option value="1">[2, Centro]</option>
//                                         <option value="2">[3, Lado Motor]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Nota</Form.Label>
//                                     <Form.Control type="text" value={formData.nota} onChange={(e) => setFormData({...formData, nota: e.target.value})} size="sm" />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button variant="primary" onClick={handleAgregarDefecto} size="sm"><i className="fas fa-plus me-1"></i> Agregar</Button>
//                         </div>
//                         <Table striped bordered hover size="sm" className="mb-2">
//                             <thead className="table-dark">
//                                 <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th width="100" className="text-center">Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {defectosDetectados.length === 0 ? (
//                                     <tr><td colSpan="5" className="text-center text-muted py-3">No hay defectos registrados</td></tr>
//                                 ) : (
//                                     defectosDetectados.map((d) => (
//                                         <tr key={d.id}>
//                                             <td>{d.descripcion}</td>
//                                             <td>{d.gravedadDesc}</td>
//                                             <td>{d.ubicacionDesc}</td>
//                                             <td>{d.nota || '-'}</td>
//                                             <td className="text-center">
//                                                 <Button variant="warning" size="sm" onClick={() => handleModificarDefecto(d)} className="me-1"><i className="fas fa-edit"></i></Button>
//                                                 <Button variant="danger" size="sm" onClick={() => handleEliminarDefecto(d.id)}><i className="fas fa-trash"></i></Button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </Table>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-sticky-note me-2"></i> Notas Calidad</Card.Header>
//                     <Card.Body>
//                         <Form.Control as="textarea" rows={3} value={notaCalidad} onChange={(e) => setNotaCalidad(e.target.value)} placeholder="Ingrese notas adicionales..." />
//                     </Card.Body>
//                 </Card>

//                 <Form.Check type="checkbox" label={<span className="fw-bold">Retorna a STOCK</span>} checked={retornaStock} onChange={(e) => setRetornaStock(e.target.checked)} className="mb-3" />
//             </Modal.Body>
//             <Modal.Footer className="bg-light">
//                 <Button variant="secondary" onClick={onHide} disabled={loading}><i className="fas fa-times me-1"></i> Cancelar</Button>
//                 <Button variant="danger" onClick={() => handleGuardarCalidad(2)} disabled={loading || defectosDetectados.length === 0} className="me-2"><i className="fas fa-times-circle me-1"></i> RECHAZADO</Button>
//                 <Button variant="success" onClick={() => handleGuardarCalidad(1)} disabled={loading}><i className="fas fa-check-circle me-1"></i> APROBADO</Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default CalidadModal;












































// // /src/components/Calidad/CalidadModal.jsx

// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Row, Col, Card, Table } from 'react-bootstrap';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';

// const CalidadModal = ({ show, onHide, operacion, onSuccess }) => {
//     const [defectos, setDefectos] = useState([]);
//     const [defectosDetectados, setDefectosDetectados] = useState([]);
//     const [datosOperacion, setDatosOperacion] = useState(null);
//     const [formData, setFormData] = useState({
//         defecto: '',
//         gravedad: '',
//         ubicacion: '',
//         nota: ''
//     });
//     const [notaCalidad, setNotaCalidad] = useState('');
//     const [retornaStock, setRetornaStock] = useState(false);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (show && operacion) {
//             console.log('🚀 [Modal] Abriendo modal para operación:', operacion.Operacion_ID);
//             cargarDatosCompletos();
//         }
//     }, [show, operacion]);

//     const cargarDatosCompletos = async () => {
//         try {
//             setLoading(true);
//             console.log('📥 [Modal] Cargando datos para Operacion_ID:', operacion.Operacion_ID);
            
//             // 1. Usamos la nueva ruta específica de calidad
//             const response = await axiosInstance.get(`/calidad/detalle/${operacion.Operacion_ID}`);
//             console.log('📊 [Modal] Datos recibidos:', response.data);
//             setDatosOperacion(response.data);
            
//             // 2. Cargar defectos disponibles para el combo
//             const familia = operacion.Codigo_Producto && operacion.Codigo_Producto.length >= 10 
//                 ? operacion.Codigo_Producto.substring(8, 10) 
//                 : '00';
            
//             console.log('🔍 Familia extraída:', familia, 'de código:', operacion.Codigo_Producto);
            
//             const respDefectos = await axiosInstance.get('/calidad/defectos', { params: { familia } });
//             setDefectos(Array.isArray(respDefectos.data) ? respDefectos.data : []);
            
//             // 3. Cargar defectos existentes (ya vienen en la respuesta del detalle)
//             setDefectosDetectados(response.data.defectos || []);
            
//             setNotaCalidad('');
//             setRetornaStock(false);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//         } catch (error) {
//             console.error('❌ [Modal] Error al cargar datos:', error);
//             Swal.fire('Error', 'No se pudieron cargar los datos de la operación: ' + error.message, 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAgregarDefecto = () => {
//         if (!formData.defecto) {
//             Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
//             return;
//         }
//         if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
//             Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
//             return;
//         }

//         const defectoSeleccionado = defectos.find(d => d.Codigo === formData.defecto);
//         const nuevoDefecto = {
//             id: Date.now(),
//             defecto: formData.defecto,
//             descripcion: defectoSeleccionado?.Descripcion || '',
//             gravedad: formData.gravedad,
//             gravedadDesc: getGravedadLabel(formData.gravedad),
//             ubicacion: formData.ubicacion,
//             ubicacionDesc: getUbicacionLabel(formData.ubicacion),
//             nota: formData.nota
//         };

//         setDefectosDetectados([...defectosDetectados, nuevoDefecto]);
//         setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     };

//     const handleEliminarDefecto = (id) => {
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== id));
//     };

//     const handleModificarDefecto = (defecto) => {
//         setFormData({
//             defecto: defecto.defecto,
//             gravedad: defecto.gravedad,
//             ubicacion: defecto.ubicacion,
//             nota: defecto.nota
//         });
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== defecto.id));
//     };

//     const getGravedadLabel = (codigo) => {
//         const labels = { '0': '[0, Sin Requerimiento]', '1': '[1, Grave]', '2': '[2, Moderado]', '3': '[3, Leve]' };
//         return labels[codigo] || codigo;
//     };

//     const getUbicacionLabel = (codigo) => {
//         const labels = { '0': '[1, Lado Operador]', '1': '[2, Centro]', '2': '[3, Lado Motor]' };
//         return labels[codigo] || codigo;
//     };

//     const handleGuardarCalidad = async (dictamen) => {
//         if (defectosDetectados.length === 0 && dictamen === 2) {
//             Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
//             return;
//         }
//         setLoading(true);
//         try {
//             const familia = operacion.Codigo_Producto && operacion.Codigo_Producto.length >= 10 
//                 ? operacion.Codigo_Producto.substring(8, 10) 
//                 : '00';
            
//             for (const defecto of defectosDetectados) {
//                 await axiosInstance.post('/calidad/guardar', {
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     familia: familia,
//                     codigo: defecto.defecto,
//                     gravedad: defecto.gravedad,
//                     ubicacion: defecto.ubicacion,
//                     nota: defecto.nota || '',
//                     usuario: 'pmorrone',
//                     sobrante: operacion.Sobrante,
//                     sobreorden: operacion.Kilos_Sobreorden
//                 });
//             }
            
//             await axiosInstance.post('/calidad/actualizar-dictamen', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 dictamen: dictamen,
//                 notaCalidad: notaCalidad,
//                 retornaStock: retornaStock
//             });
            
//             await Swal.fire('Éxito', dictamen === 1 ? 'Operación APROBADA' : 'Operación RECHAZADA', 'success');
//             if (onSuccess) onSuccess();
//             onHide();
//         } catch (error) {
//             console.error('❌ [Modal] Error al guardar:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al guardar', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!operacion || !datosOperacion) {
//         return (
//             <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//                 <Modal.Body className="text-center py-5">
//                     <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
//                     <p className="mt-3">Cargando datos de la operación...</p>
//                 </Modal.Body>
//             </Modal>
//         );
//     }

//     const header = datosOperacion.header || {};
    
//     // ✅ CORRECCIÓN CLAVE: Usar los datos del HEADER (backend) en lugar de operacion (grilla)
//     const tareaDestino = header.tareaDestino || 'N/A';
//     const clientes = header.cliente || 'N/A';
//     const numeroPedido = header.numeroPedido || 'N/A';
//     const pasadas = header.pasadas || '1';
//     const ancho = header.ancho || 0;
//     const destinoLote = header.destinoLote || 'N/A';
//     const kgProgramados = header.kgsProgramados || 0;  // ✅ USAR header.kgsProgramados (4426)
//     const kgSobreOrden = header.kgsSobreOrden || 0;    // ✅ USAR header.kgsSobreOrden (4382)
//     const kgCalidad = header.kgsCalidad || 0;

//     return (
//         <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//             <Modal.Header closeButton className="bg-secondary text-white">
//                 <Modal.Title><i className="fas fa-clipboard-check me-2"></i> REGISTRACION CALIDAD</Modal.Title>
//             </Modal.Header>
//             <Modal.Body className="bg-light">
//                 <Card className="mb-3">
//                     <Card.Body>
//                         <Row>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Datos Corte</legend>
//                                     <Row>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Ancho:</strong> {ancho}</div>
//                                             <div className="mb-1"><strong>Tarea Destino:</strong> {tareaDestino}</div>
//                                             <div className="mb-1"><strong>Serie/Lote Dest:</strong> {destinoLote.substring(0, 11)}</div>
//                                         </Col>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Cant.Pasadas:</strong> {pasadas}</div>
//                                             <div className="mb-1"><strong>Kgs.Programados:</strong> {parseFloat(kgProgramados).toFixed(2)}</div>
//                                             <div className="mb-1"><strong>Kgs.SobreOrden:</strong> {parseFloat(kgSobreOrden).toFixed(0)}</div>
//                                         </Col>
//                                     </Row>
//                                 </fieldset>
//                                 <div className="bg-secondary text-white text-center p-2 mb-2 rounded">
//                                     <h5 className="mb-0"><strong>Kgs.Calidad: {parseFloat(kgCalidad).toFixed(0)}</strong></h5>
//                                 </div>
//                             </Col>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Clientes</legend>
//                                     <div className="mb-1"><strong>{clientes}</strong></div>
//                                     <div className="mb-1"><strong>Nº Pedido:</strong> {numeroPedido}</div>
//                                 </fieldset>
//                                 <div className="text-end">
//                                     <Button variant="info" size="sm" disabled><i className="fas fa-file-alt me-1"></i> Ficha Técnica</Button>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-exclamation-triangle me-2"></i> Defectos Detectados</Card.Header>
//                     <Card.Body>
//                         <Row className="mb-3">
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Defecto *</Form.Label>
//                                     <Form.Select value={formData.defecto} onChange={(e) => setFormData({...formData, defecto: e.target.value})} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         {defectos.map((d, i) => <option key={i} value={d.Codigo}>{d.Descripcion}</option>)}
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Gravedad</Form.Label>
//                                     <Form.Select value={formData.gravedad} onChange={(e) => setFormData({...formData, gravedad: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[0, Sin Requerimiento]</option>
//                                         <option value="1">[1, Grave]</option>
//                                         <option value="2">[2, Moderado]</option>
//                                         <option value="3">[3, Leve]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Ubicación</Form.Label>
//                                     <Form.Select value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[1, Lado Operador]</option>
//                                         <option value="1">[2, Centro]</option>
//                                         <option value="2">[3, Lado Motor]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Nota</Form.Label>
//                                     <Form.Control type="text" value={formData.nota} onChange={(e) => setFormData({...formData, nota: e.target.value})} size="sm" />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button variant="primary" onClick={handleAgregarDefecto} size="sm"><i className="fas fa-plus me-1"></i> Agregar</Button>
//                         </div>
//                         <Table striped bordered hover size="sm" className="mb-2">
//                             <thead className="table-dark">
//                                 <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th width="100" className="text-center">Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {defectosDetectados.length === 0 ? (
//                                     <tr><td colSpan="5" className="text-center text-muted py-3">No hay defectos registrados</td></tr>
//                                 ) : (
//                                     defectosDetectados.map((d) => (
//                                         <tr key={d.id}>
//                                             <td>{d.descripcion}</td>
//                                             <td>{d.gravedadDesc}</td>
//                                             <td>{d.ubicacionDesc}</td>
//                                             <td>{d.nota || '-'}</td>
//                                             <td className="text-center">
//                                                 <Button variant="warning" size="sm" onClick={() => handleModificarDefecto(d)} className="me-1"><i className="fas fa-edit"></i></Button>
//                                                 <Button variant="danger" size="sm" onClick={() => handleEliminarDefecto(d.id)}><i className="fas fa-trash"></i></Button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </Table>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-sticky-note me-2"></i> Notas Calidad</Card.Header>
//                     <Card.Body>
//                         <Form.Control as="textarea" rows={3} value={notaCalidad} onChange={(e) => setNotaCalidad(e.target.value)} placeholder="Ingrese notas adicionales..." />
//                     </Card.Body>
//                 </Card>

//                 <Form.Check type="checkbox" label={<span className="fw-bold">Retorna a STOCK</span>} checked={retornaStock} onChange={(e) => setRetornaStock(e.target.checked)} className="mb-3" />
//             </Modal.Body>
//             <Modal.Footer className="bg-light">
//                 <Button variant="secondary" onClick={onHide} disabled={loading}><i className="fas fa-times me-1"></i> Cancelar</Button>
//                 <Button variant="danger" onClick={() => handleGuardarCalidad(2)} disabled={loading || defectosDetectados.length === 0} className="me-2"><i className="fas fa-times-circle me-1"></i> RECHAZADO</Button>
//                 <Button variant="success" onClick={() => handleGuardarCalidad(1)} disabled={loading}><i className="fas fa-check-circle me-1"></i> APROBADO</Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default CalidadModal;






































// // /src/components/Calidad/CalidadModal.jsx

// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Row, Col, Card, Table } from 'react-bootstrap';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';

// const CalidadModal = ({ show, onHide, operacion, onSuccess }) => {
//     const [defectos, setDefectos] = useState([]);
//     const [defectosDetectados, setDefectosDetectados] = useState([]);
//     const [datosOperacion, setDatosOperacion] = useState(null);
//     const [formData, setFormData] = useState({
//         defecto: '',
//         gravedad: '',
//         ubicacion: '',
//         nota: ''
//     });
//     const [notaCalidad, setNotaCalidad] = useState('');
//     const [retornaStock, setRetornaStock] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [mostrarBotones, setMostrarBotones] = useState(true);  // ✅ NUEVO ESTADO

//     useEffect(() => {
//         if (show && operacion) {
//             console.log('🚀 [Modal] Abriendo modal para operación:', operacion.Operacion_ID);
//             cargarDatosCompletos();
//         }
//     }, [show, operacion]);

//     const cargarDatosCompletos = async () => {
//         try {
//             setLoading(true);
//             console.log('📥 [Modal] Cargando datos para Operacion_ID:', operacion.Operacion_ID);
            
//             // 1. Usamos la nueva ruta específica de calidad
//             const response = await axiosInstance.get(`/calidad/detalle/${operacion.Operacion_ID}`);
//             console.log('📊 [Modal] Datos recibidos:', response.data);
//             setDatosOperacion(response.data);
            
//             // 2. Cargar defectos disponibles para el combo
//             const familia = operacion.Codigo_Producto && operacion.Codigo_Producto.length >= 10 
//                 ? operacion.Codigo_Producto.substring(8, 10) 
//                 : '00';
            
//             console.log('🔍 Familia extraída:', familia, 'de código:', operacion.Codigo_Producto);
            
//             const respDefectos = await axiosInstance.get('/calidad/defectos', { params: { familia } });
//             setDefectos(Array.isArray(respDefectos.data) ? respDefectos.data : []);
            
//             // 3. Cargar defectos existentes (ya vienen en la respuesta del detalle)
//             setDefectosDetectados(response.data.defectos || []);
            
//             // ✅ LÓGICA VB.NET: Determinar si viene de Sobreorden (SO) o Calidad normal (CA)
//             // Si es tipo "SO" (Sobreorden) → NO mostrar botones
//             // Si es tipo normal → MOSTRAR botones
//             const esSobreorden = operacion.Tipo === 'SO' && operacion.Sobrante === 0;
//             setMostrarBotones(!esSobreorden);
//             console.log(' Mostrar botones:', !esSobreorden, '- Es Sobreorden:', esSobreorden, '- Tipo:', operacion.Tipo, '- Sobrante:', operacion.Sobrante);
            
//             setNotaCalidad('');
//             setRetornaStock(false);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//         } catch (error) {
//             console.error('❌ [Modal] Error al cargar datos:', error);
//             Swal.fire('Error', 'No se pudieron cargar los datos de la operación: ' + error.message, 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAgregarDefecto = () => {
//         if (!formData.defecto) {
//             Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
//             return;
//         }
//         if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
//             Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
//             return;
//         }

//         const defectoSeleccionado = defectos.find(d => d.Codigo === formData.defecto);
//         const nuevoDefecto = {
//             id: Date.now(),
//             defecto: formData.defecto,
//             descripcion: defectoSeleccionado?.Descripcion || '',
//             gravedad: formData.gravedad,
//             gravedadDesc: getGravedadLabel(formData.gravedad),
//             ubicacion: formData.ubicacion,
//             ubicacionDesc: getUbicacionLabel(formData.ubicacion),
//             nota: formData.nota
//         };

//         setDefectosDetectados([...defectosDetectados, nuevoDefecto]);
//         setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     };

//     const handleEliminarDefecto = (id) => {
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== id));
//     };

//     const handleModificarDefecto = (defecto) => {
//         setFormData({
//             defecto: defecto.defecto,
//             gravedad: defecto.gravedad,
//             ubicacion: defecto.ubicacion,
//             nota: defecto.nota
//         });
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== defecto.id));
//     };

//     const getGravedadLabel = (codigo) => {
//         const labels = { '0': '[0, Sin Requerimiento]', '1': '[1, Grave]', '2': '[2, Moderado]', '3': '[3, Leve]' };
//         return labels[codigo] || codigo;
//     };

//     const getUbicacionLabel = (codigo) => {
//         const labels = { '0': '[1, Lado Operador]', '1': '[2, Centro]', '2': '[3, Lado Motor]' };
//         return labels[codigo] || codigo;
//     };

//     const handleGuardarCalidad = async (dictamen) => {
//         if (defectosDetectados.length === 0 && dictamen === 2) {
//             Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
//             return;
//         }
//         setLoading(true);
//         try {
//             const familia = operacion.Codigo_Producto && operacion.Codigo_Producto.length >= 10 
//                 ? operacion.Codigo_Producto.substring(8, 10) 
//                 : '00';
            
//             for (const defecto of defectosDetectados) {
//                 await axiosInstance.post('/calidad/guardar', {
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     familia: familia,
//                     codigo: defecto.defecto,
//                     gravedad: defecto.gravedad,
//                     ubicacion: defecto.ubicacion,
//                     nota: defecto.nota || '',
//                     usuario: 'pmorrone',
//                     sobrante: operacion.Sobrante,
//                     sobreorden: operacion.Kilos_Sobreorden
//                 });
//             }
            
//             await axiosInstance.post('/calidad/actualizar-dictamen', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 dictamen: dictamen,
//                 notaCalidad: notaCalidad,
//                 retornaStock: retornaStock
//             });
            
//             await Swal.fire('Éxito', dictamen === 1 ? 'Operación APROBADA' : 'Operación RECHAZADA', 'success');
//             if (onSuccess) onSuccess();
//             onHide();
//         } catch (error) {
//             console.error('❌ [Modal] Error al guardar:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al guardar', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!operacion || !datosOperacion) {
//         return (
//             <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//                 <Modal.Body className="text-center py-5">
//                     <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
//                     <p className="mt-3">Cargando datos de la operación...</p>
//                 </Modal.Body>
//             </Modal>
//         );
//     }

//     const header = datosOperacion.header || {};
    
//     const tareaDestino = header.tareaDestino || 'N/A';
//     const clientes = header.cliente || 'N/A';
//     const numeroPedido = header.numeroPedido || 'N/A';
//     const pasadas = header.pasadas || '1';
//     const ancho = header.ancho || 0;
//     const destinoLote = header.destinoLote || 'N/A';
//     const kgProgramados = header.kgsProgramados || 0;
//     const kgSobreOrden = header.kgsSobreOrden || 0;
//     const kgCalidad = header.kgsCalidad || 0;

//     return (
//         <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//             <Modal.Header closeButton className="bg-secondary text-white">
//                 <Modal.Title><i className="fas fa-clipboard-check me-2"></i> REGISTRACION CALIDAD</Modal.Title>
//             </Modal.Header>
//             <Modal.Body className="bg-light">
//                 <Card className="mb-3">
//                     <Card.Body>
//                         <Row>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Datos Corte</legend>
//                                     <Row>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Ancho:</strong> {ancho}</div>
//                                             <div className="mb-1"><strong>Tarea Destino:</strong> {tareaDestino}</div>
//                                             <div className="mb-1"><strong>Serie/Lote Dest:</strong> {destinoLote.substring(0, 11)}</div>
//                                         </Col>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Cant.Pasadas:</strong> {pasadas}</div>
//                                             <div className="mb-1"><strong>Kgs.Programados:</strong> {parseFloat(kgProgramados).toFixed(2)}</div>
//                                             <div className="mb-1"><strong>Kgs.SobreOrden:</strong> {parseFloat(kgSobreOrden).toFixed(0)}</div>
//                                         </Col>
//                                     </Row>
//                                 </fieldset>
//                                 <div className="bg-secondary text-white text-center p-2 mb-2 rounded">
//                                     <h5 className="mb-0"><strong>Kgs.Calidad: {parseFloat(kgCalidad).toFixed(0)}</strong></h5>
//                                 </div>
//                             </Col>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Clientes</legend>
//                                     <div className="mb-1"><strong>{clientes}</strong></div>
//                                     <div className="mb-1"><strong>Nº Pedido:</strong> {numeroPedido}</div>
//                                 </fieldset>
//                                 <div className="text-end">
//                                     <Button variant="info" size="sm" disabled><i className="fas fa-file-alt me-1"></i> Ficha Técnica</Button>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-exclamation-triangle me-2"></i> Defectos Detectados</Card.Header>
//                     <Card.Body>
//                         <Row className="mb-3">
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Defecto *</Form.Label>
//                                     <Form.Select value={formData.defecto} onChange={(e) => setFormData({...formData, defecto: e.target.value})} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         {defectos.map((d, i) => <option key={i} value={d.Codigo}>{d.Descripcion}</option>)}
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Gravedad</Form.Label>
//                                     <Form.Select value={formData.gravedad} onChange={(e) => setFormData({...formData, gravedad: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[0, Sin Requerimiento]</option>
//                                         <option value="1">[1, Grave]</option>
//                                         <option value="2">[2, Moderado]</option>
//                                         <option value="3">[3, Leve]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Ubicación</Form.Label>
//                                     <Form.Select value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[1, Lado Operador]</option>
//                                         <option value="1">[2, Centro]</option>
//                                         <option value="2">[3, Lado Motor]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Nota</Form.Label>
//                                     <Form.Control type="text" value={formData.nota} onChange={(e) => setFormData({...formData, nota: e.target.value})} size="sm" />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button variant="primary" onClick={handleAgregarDefecto} size="sm"><i className="fas fa-plus me-1"></i> Agregar</Button>
//                         </div>
//                         <Table striped bordered hover size="sm" className="mb-2">
//                             <thead className="table-dark">
//                                 <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th width="100" className="text-center">Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {defectosDetectados.length === 0 ? (
//                                     <tr><td colSpan="5" className="text-center text-muted py-3">No hay defectos registrados</td></tr>
//                                 ) : (
//                                     defectosDetectados.map((d) => (
//                                         <tr key={d.id}>
//                                             <td>{d.descripcion}</td>
//                                             <td>{d.gravedadDesc}</td>
//                                             <td>{d.ubicacionDesc}</td>
//                                             <td>{d.nota || '-'}</td>
//                                             <td className="text-center">
//                                                 <Button variant="warning" size="sm" onClick={() => handleModificarDefecto(d)} className="me-1"><i className="fas fa-edit"></i></Button>
//                                                 <Button variant="danger" size="sm" onClick={() => handleEliminarDefecto(d.id)}><i className="fas fa-trash"></i></Button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </Table>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-sticky-note me-2"></i> Notas Calidad</Card.Header>
//                     <Card.Body>
//                         <Form.Control as="textarea" rows={3} value={notaCalidad} onChange={(e) => setNotaCalidad(e.target.value)} placeholder="Ingrese notas adicionales..." />
//                     </Card.Body>
//                 </Card>

//                 {/* ✅ CHECKBOX RETORNA STOCK - Visible solo si NO es Sobreorden */}
//                 {mostrarBotones && (
//                     <Form.Check 
//                         type="checkbox" 
//                         label={<span className="fw-bold">Retorna a STOCK</span>} 
//                         checked={retornaStock} 
//                         onChange={(e) => setRetornaStock(e.target.checked)} 
//                         className="mb-3" 
//                     />
//                 )}
//             </Modal.Body>
//             <Modal.Footer className="bg-light">
//                 <Button variant="secondary" onClick={onHide} disabled={loading}>
//                     <i className="fas fa-times me-1"></i> Cancelar
//                 </Button>
                
//                 {/* ✅ BOTONES - Visible solo si NO es Sobreorden */}
//                 {mostrarBotones && (
//                     <>
//                         <Button 
//                             variant="danger" 
//                             onClick={() => handleGuardarCalidad(2)} 
//                             disabled={loading || defectosDetectados.length === 0} 
//                             className="me-2"
//                         >
//                             <i className="fas fa-times-circle me-1"></i> RECHAZADO
//                         </Button>
//                         <Button 
//                             variant="success" 
//                             onClick={() => handleGuardarCalidad(1)} 
//                             disabled={loading}
//                         >
//                             <i className="fas fa-check-circle me-1"></i> APROBADO
//                         </Button>
//                     </>
//                 )}
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default CalidadModal;


































// // /src/components/Calidad/CalidadModal.jsx

// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Row, Col, Card, Table } from 'react-bootstrap';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';

// const CalidadModal = ({ show, onHide, operacion, verDefectosSobreorden, onSuccess }) => {
//     const [defectos, setDefectos] = useState([]);
//     const [defectosDetectados, setDefectosDetectados] = useState([]);
//     const [datosOperacion, setDatosOperacion] = useState(null);
//     const [formData, setFormData] = useState({
//         defecto: '',
//         gravedad: '',
//         ubicacion: '',
//         nota: ''
//     });
//     const [notaCalidad, setNotaCalidad] = useState('');
//     const [retornaStock, setRetornaStock] = useState(false);
//     const [loading, setLoading] = useState(false);

//     // ✅ LÓGICA EXPLÍCITA: Los botones se muestran SOLO si verDefectosSobreorden es estrictamente false.
//     // Esto replica exactamente el comportamiento del VB.NET original (chkVerSobreorden.Checked == false)
//     const mostrarBotones = verDefectosSobreorden === false;

//     useEffect(() => {
//         if (show && operacion) {
//             console.log('🔘 [Modal] Prop recibida verDefectosSobreorden:', verDefectosSobreorden, '| Tipo:', typeof verDefectosSobreorden);
//             console.log('✅ [Modal] mostrarBotones calculado:', mostrarBotones);
//             cargarDatosCompletos();
//         }
//     }, [show, operacion, verDefectosSobreorden]);

//     const cargarDatosCompletos = async () => {
//         try {
//             setLoading(true);
//             console.log('📥 [Modal] Cargando datos para Operacion_ID:', operacion.Operacion_ID);
            
//             const response = await axiosInstance.get(`/calidad/detalle/${operacion.Operacion_ID}`);
//             console.log('📊 [Modal] Datos recibidos del backend:', response.data);
//             setDatosOperacion(response.data);
            
//             const familia = operacion.Codigo_Producto && operacion.Codigo_Producto.length >= 10 
//                 ? operacion.Codigo_Producto.substring(8, 10) 
//                 : '00';
            
//             console.log('🔍 Familia extraída:', familia, 'de código:', operacion.Codigo_Producto);
            
//             const respDefectos = await axiosInstance.get('/calidad/defectos', { params: { familia } });
//             setDefectos(Array.isArray(respDefectos.data) ? respDefectos.data : []);
            
//             setDefectosDetectados(response.data.defectos || []);
            
//             setNotaCalidad('');
//             setRetornaStock(false);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//         } catch (error) {
//             console.error('❌ [Modal] Error al cargar datos:', error);
//             Swal.fire('Error', 'No se pudieron cargar los datos de la operación: ' + error.message, 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAgregarDefecto = () => {
//         if (!formData.defecto) {
//             Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
//             return;
//         }
//         if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
//             Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
//             return;
//         }

//         const defectoSeleccionado = defectos.find(d => d.Codigo === formData.defecto);
//         const nuevoDefecto = {
//             id: Date.now(),
//             defecto: formData.defecto,
//             descripcion: defectoSeleccionado?.Descripcion || '',
//             gravedad: formData.gravedad,
//             gravedadDesc: getGravedadLabel(formData.gravedad),
//             ubicacion: formData.ubicacion,
//             ubicacionDesc: getUbicacionLabel(formData.ubicacion),
//             nota: formData.nota
//         };

//         setDefectosDetectados([...defectosDetectados, nuevoDefecto]);
//         setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     };

//     const handleEliminarDefecto = (id) => {
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== id));
//     };

//     const handleModificarDefecto = (defecto) => {
//         setFormData({
//             defecto: defecto.defecto,
//             gravedad: defecto.gravedad,
//             ubicacion: defecto.ubicacion,
//             nota: defecto.nota
//         });
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== defecto.id));
//     };

//     const getGravedadLabel = (codigo) => {
//         const labels = { '0': '[0, Sin Requerimiento]', '1': '[1, Grave]', '2': '[2, Moderado]', '3': '[3, Leve]' };
//         return labels[codigo] || codigo;
//     };

//     const getUbicacionLabel = (codigo) => {
//         const labels = { '0': '[1, Lado Operador]', '1': '[2, Centro]', '2': '[3, Lado Motor]' };
//         return labels[codigo] || codigo;
//     };

//     const handleGuardarCalidad = async (dictamen) => {
//         if (defectosDetectados.length === 0 && dictamen === 2) {
//             Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
//             return;
//         }
//         setLoading(true);
//         try {
//             const familia = operacion.Codigo_Producto && operacion.Codigo_Producto.length >= 10 
//                 ? operacion.Codigo_Producto.substring(8, 10) 
//                 : '00';
            
//             for (const defecto of defectosDetectados) {
//                 await axiosInstance.post('/calidad/guardar', {
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     familia: familia,
//                     codigo: defecto.defecto,
//                     gravedad: defecto.gravedad,
//                     ubicacion: defecto.ubicacion,
//                     nota: defecto.nota || '',
//                     usuario: 'pmorrone',
//                     sobrante: operacion.Sobrante,
//                     sobreorden: operacion.Kilos_Sobreorden
//                 });
//             }
            
//             await axiosInstance.post('/calidad/actualizar-dictamen', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 dictamen: dictamen,
//                 notaCalidad: notaCalidad,
//                 retornaStock: retornaStock
//             });
            
//             await Swal.fire('Éxito', dictamen === 1 ? 'Operación APROBADA' : 'Operación RECHAZADA', 'success');
//             if (onSuccess) onSuccess();
//             onHide();
//         } catch (error) {
//             console.error('❌ [Modal] Error al guardar:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al guardar', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!operacion || !datosOperacion) {
//         return (
//             <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//                 <Modal.Body className="text-center py-5">
//                     <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
//                     <p className="mt-3">Cargando datos de la operación...</p>
//                 </Modal.Body>
//             </Modal>
//         );
//     }

//     const header = datosOperacion.header || {};
    
//     const tareaDestino = header.tareaDestino || 'N/A';
//     const clientes = header.cliente || 'N/A';
//     const numeroPedido = header.numeroPedido || 'N/A';
//     const pasadas = header.pasadas || '1';
//     const ancho = header.ancho || 0;
//     const destinoLote = header.destinoLote || 'N/A';
//     const kgProgramados = header.kgsProgramados || 0;
//     const kgSobreOrden = header.kgsSobreOrden || 0;
//     const kgCalidad = header.kgsCalidad || 0;

//     return (
//         <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//             <Modal.Header closeButton className="bg-secondary text-white">
//                 <Modal.Title><i className="fas fa-clipboard-check me-2"></i> REGISTRACION CALIDAD</Modal.Title>
//             </Modal.Header>
//             <Modal.Body className="bg-light">
//                 <Card className="mb-3">
//                     <Card.Body>
//                         <Row>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Datos Corte</legend>
//                                     <Row>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Ancho:</strong> {ancho}</div>
//                                             <div className="mb-1"><strong>Tarea Destino:</strong> {tareaDestino}</div>
//                                             <div className="mb-1"><strong>Serie/Lote Dest:</strong> {destinoLote.substring(0, 11)}</div>
//                                         </Col>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Cant.Pasadas:</strong> {pasadas}</div>
//                                             <div className="mb-1"><strong>Kgs.Programados:</strong> {parseFloat(kgProgramados).toFixed(2)}</div>
//                                             <div className="mb-1"><strong>Kgs.SobreOrden:</strong> {parseFloat(kgSobreOrden).toFixed(0)}</div>
//                                         </Col>
//                                     </Row>
//                                 </fieldset>
//                                 <div className="bg-secondary text-white text-center p-2 mb-2 rounded">
//                                     <h5 className="mb-0"><strong>Kgs.Calidad: {parseFloat(kgCalidad).toFixed(0)}</strong></h5>
//                                 </div>
//                             </Col>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Clientes</legend>
//                                     <div className="mb-1"><strong>{clientes}</strong></div>
//                                     <div className="mb-1"><strong>Nº Pedido:</strong> {numeroPedido}</div>
//                                 </fieldset>
//                                 <div className="text-end">
//                                     <Button variant="info" size="sm" disabled><i className="fas fa-file-alt me-1"></i> Ficha Técnica</Button>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-exclamation-triangle me-2"></i> Defectos Detectados</Card.Header>
//                     <Card.Body>
//                         <Row className="mb-3">
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Defecto *</Form.Label>
//                                     <Form.Select value={formData.defecto} onChange={(e) => setFormData({...formData, defecto: e.target.value})} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         {defectos.map((d, i) => <option key={i} value={d.Codigo}>{d.Descripcion}</option>)}
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Gravedad</Form.Label>
//                                     <Form.Select value={formData.gravedad} onChange={(e) => setFormData({...formData, gravedad: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[0, Sin Requerimiento]</option>
//                                         <option value="1">[1, Grave]</option>
//                                         <option value="2">[2, Moderado]</option>
//                                         <option value="3">[3, Leve]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Ubicación</Form.Label>
//                                     <Form.Select value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[1, Lado Operador]</option>
//                                         <option value="1">[2, Centro]</option>
//                                         <option value="2">[3, Lado Motor]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Nota</Form.Label>
//                                     <Form.Control type="text" value={formData.nota} onChange={(e) => setFormData({...formData, nota: e.target.value})} size="sm" />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button variant="primary" onClick={handleAgregarDefecto} size="sm"><i className="fas fa-plus me-1"></i> Agregar</Button>
//                         </div>
//                         <Table striped bordered hover size="sm" className="mb-2">
//                             <thead className="table-dark">
//                                 <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th width="100" className="text-center">Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {defectosDetectados.length === 0 ? (
//                                     <tr><td colSpan="5" className="text-center text-muted py-3">No hay defectos registrados</td></tr>
//                                 ) : (
//                                     defectosDetectados.map((d) => (
//                                         <tr key={d.id}>
//                                             <td>{d.descripcion}</td>
//                                             <td>{d.gravedadDesc}</td>
//                                             <td>{d.ubicacionDesc}</td>
//                                             <td>{d.nota || '-'}</td>
//                                             <td className="text-center">
//                                                 <Button variant="warning" size="sm" onClick={() => handleModificarDefecto(d)} className="me-1"><i className="fas fa-edit"></i></Button>
//                                                 <Button variant="danger" size="sm" onClick={() => handleEliminarDefecto(d.id)}><i className="fas fa-trash"></i></Button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </Table>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-sticky-note me-2"></i> Notas Calidad</Card.Header>
//                     <Card.Body>
//                         <Form.Control as="textarea" rows={3} value={notaCalidad} onChange={(e) => setNotaCalidad(e.target.value)} placeholder="Ingrese notas adicionales..." />
//                     </Card.Body>
//                 </Card>

//                 {/* ✅ CHECKBOX RETORNA STOCK - Visible SOLO si mostrarBotones es true */}
//                 {mostrarBotones && (
//                     <Form.Check 
//                         type="checkbox" 
//                         label={<span className="fw-bold">Retorna a STOCK</span>} 
//                         checked={retornaStock} 
//                         onChange={(e) => setRetornaStock(e.target.checked)} 
//                         className="mb-3" 
//                     />
//                 )}
//             </Modal.Body>
//             <Modal.Footer className="bg-light">
//                 <Button variant="secondary" onClick={onHide} disabled={loading}>
//                     <i className="fas fa-times me-1"></i> Cancelar
//                 </Button>
                
//                 {/* ✅ BOTONES APROBADO/RECHAZADO - Visibles SOLO si mostrarBotones es true */}
//                 {mostrarBotones && (
//                     <>
//                         <Button 
//                             variant="danger" 
//                             onClick={() => handleGuardarCalidad(2)} 
//                             disabled={loading || defectosDetectados.length === 0} 
//                             className="me-2"
//                         >
//                             <i className="fas fa-times-circle me-1"></i> RECHAZADO
//                         </Button>
//                         <Button 
//                             variant="success" 
//                             onClick={() => handleGuardarCalidad(1)} 
//                             disabled={loading}
//                         >
//                             <i className="fas fa-check-circle me-1"></i> APROBADO
//                         </Button>
//                     </>
//                 )}
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default CalidadModal;





























// // /src/components/Calidad/CalidadModal.jsx

// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Row, Col, Card, Table } from 'react-bootstrap';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';

// const CalidadModal = ({ show, onHide, operacion, verDefectosSobreorden, onSuccess }) => {
//     const [defectos, setDefectos] = useState([]);
//     const [defectosDetectados, setDefectosDetectados] = useState([]);
//     const [datosOperacion, setDatosOperacion] = useState(null);
//     const [formData, setFormData] = useState({
//         defecto: '',
//         gravedad: '',
//         ubicacion: '',
//         nota: ''
//     });
//     const [notaCalidad, setNotaCalidad] = useState('');
//     const [retornaStock, setRetornaStock] = useState(false);
//     const [loading, setLoading] = useState(false);

//     const mostrarBotones = verDefectosSobreorden === false;

//     useEffect(() => {
//         if (show && operacion) {
//             console.log('🔘 [Modal] Prop recibida verDefectosSobreorden:', verDefectosSobreorden, '| Tipo:', typeof verDefectosSobreorden);
//             console.log('✅ [Modal] mostrarBotones calculado:', mostrarBotones);
//             cargarDatosCompletos();
//         }
//     }, [show, operacion, verDefectosSobreorden]);

//     const cargarDatosCompletos = async () => {
//         try {
//             setLoading(true);
//             console.log('📥 [Modal] Cargando datos para Operacion_ID:', operacion.Operacion_ID);
            
//             const response = await axiosInstance.get(`/calidad/detalle/${operacion.Operacion_ID}`);
//             console.log('📊 [Modal] Datos recibidos del backend:', response.data);
//             setDatosOperacion(response.data);
            
//             const familia = operacion.Codigo_Producto && operacion.Codigo_Producto.length >= 10 
//                 ? operacion.Codigo_Producto.substring(8, 10) 
//                 : '00';
            
//             console.log('🔍 Familia extraída:', familia, 'de código:', operacion.Codigo_Producto);
            
//             const respDefectos = await axiosInstance.get('/calidad/defectos', { params: { familia } });
//             setDefectos(Array.isArray(respDefectos.data) ? respDefectos.data : []);
            
//             setDefectosDetectados(response.data.defectos || []);
            
//             setNotaCalidad('');
//             setRetornaStock(false);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//         } catch (error) {
//             console.error('❌ [Modal] Error al cargar datos:', error);
//             Swal.fire('Error', 'No se pudieron cargar los datos de la operación: ' + error.message, 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAgregarDefecto = () => {
//         if (!formData.defecto) {
//             Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
//             return;
//         }
//         if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
//             Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
//             return;
//         }

//         const defectoSeleccionado = defectos.find(d => d.Codigo === formData.defecto);
//         const nuevoDefecto = {
//             id: Date.now(),
//             defecto: formData.defecto,
//             descripcion: defectoSeleccionado?.Descripcion || '',
//             gravedad: formData.gravedad,
//             gravedadDesc: getGravedadLabel(formData.gravedad),
//             ubicacion: formData.ubicacion,
//             ubicacionDesc: getUbicacionLabel(formData.ubicacion),
//             nota: formData.nota
//         };

//         setDefectosDetectados([...defectosDetectados, nuevoDefecto]);
//         setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//     };

//     const handleEliminarDefecto = (id) => {
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== id));
//     };

//     const handleModificarDefecto = (defecto) => {
//         setFormData({
//             defecto: defecto.defecto,
//             gravedad: defecto.gravedad,
//             ubicacion: defecto.ubicacion,
//             nota: defecto.nota
//         });
//         setDefectosDetectados(defectosDetectados.filter(d => d.id !== defecto.id));
//     };

//     const getGravedadLabel = (codigo) => {
//         const labels = { '0': '[0, Sin Requerimiento]', '1': '[1, Grave]', '2': '[2, Moderado]', '3': '[3, Leve]' };
//         return labels[codigo] || codigo;
//     };

//     const getUbicacionLabel = (codigo) => {
//         const labels = { '0': '[1, Lado Operador]', '1': '[2, Centro]', '2': '[3, Lado Motor]' };
//         return labels[codigo] || codigo;
//     };

//     const handleGuardarCalidad = async (dictamen) => {
//         if (defectosDetectados.length === 0 && dictamen === 2) {
//             Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
//             return;
//         }
//         setLoading(true);
//         try {
//             const familia = operacion.Codigo_Producto && operacion.Codigo_Producto.length >= 10 
//                 ? operacion.Codigo_Producto.substring(8, 10) 
//                 : '00';
            
//             for (const defecto of defectosDetectados) {
//                 await axiosInstance.post('/calidad/guardar', {
//                     operacionId: operacion.Operacion_ID,
//                     loteIds: operacion.Lote_IDS,
//                     familia: familia,
//                     codigo: defecto.defecto,
//                     gravedad: defecto.gravedad,
//                     ubicacion: defecto.ubicacion,
//                     nota: defecto.nota || '',
//                     usuario: 'pmorrone',
//                     sobrante: operacion.Sobrante,
//                     sobreorden: operacion.Kilos_Sobreorden
//                 });
//             }
            
//             await axiosInstance.post('/calidad/actualizar-dictamen', {
//                 operacionId: operacion.Operacion_ID,
//                 loteIds: operacion.Lote_IDS,
//                 dictamen: dictamen,
//                 notaCalidad: notaCalidad,
//                 retornaStock: retornaStock
//             });
            
//             await Swal.fire('Éxito', dictamen === 1 ? 'Operación APROBADA' : 'Operación RECHAZADA', 'success');
//             if (onSuccess) onSuccess();
//             onHide();
//         } catch (error) {
//             console.error('❌ [Modal] Error al guardar:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al guardar', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!operacion || !datosOperacion) {
//         return (
//             <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//                 <Modal.Body className="text-center py-5">
//                     <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
//                     <p className="mt-3">Cargando datos de la operación...</p>
//                 </Modal.Body>
//             </Modal>
//         );
//     }

//     const header = datosOperacion.header || {};
//     const tipoMaquina = datosOperacion.tipoMaquina || 'SLITTER';
//     const maquina = datosOperacion.maquina || '';
    
//     const clientes = header.cliente || 'N/A';
//     const numeroPedido = header.numeroPedido || 'N/A';
//     const ancho = header.ancho || 0;
//     const destinoLote = header.destinoLote || 'N/A';
//     const kgProgramados = header.kgsProgramados || 0;
//     const kgSobreOrden = header.kgsSobreOrden || 0;
//     const kgCalidad = header.kgsCalidad || 0;

//     return (
//         <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//             <Modal.Header closeButton className="bg-secondary text-white">
//                 <Modal.Title>
//                     <i className="fas fa-clipboard-check me-2"></i> 
//                     REGISTRACION CALIDAD - {maquina}
//                 </Modal.Title>
//             </Modal.Header>
//             <Modal.Body className="bg-light">
//                 <Card className="mb-3">
//                     <Card.Body>
//                         <Row>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Datos Corte</legend>
//                                     <Row>
//                                         <Col md={6}>
//                                             {/* PLANCHAS: Ancho y Largo */}
//                                             {tipoMaquina === 'PLANCHAS' && (
//                                                 <>
//                                                     <div className="mb-1"><strong>Ancho:</strong> {ancho}</div>
//                                                     <div className="mb-1"><strong>Largo:</strong> {header.largo || 0}</div>
//                                                     <div className="mb-1"><strong>Serie/Lote Dest:</strong> {destinoLote.substring(0, 11)}</div>
//                                                 </>
//                                             )}
                                            
//                                             {/* SLITTER y HORNOS: Ancho, Tarea Destino, Serie/Lote */}
//                                             {(tipoMaquina === 'SLITTER' || tipoMaquina === 'HORNOS') && (
//                                                 <>
//                                                     <div className="mb-1"><strong>Ancho:</strong> {ancho}</div>
//                                                     <div className="mb-1"><strong>Tarea Destino:</strong> {header.tareaDestino || 'N/A'}</div>
//                                                     <div className="mb-1"><strong>Serie/Lote Dest:</strong> {destinoLote.substring(0, 11)}</div>
//                                                 </>
//                                             )}
//                                         </Col>
//                                         <Col md={6}>
//                                             {/* PLANCHAS: Solo Kgs */}
//                                             {tipoMaquina === 'PLANCHAS' && (
//                                                 <>
//                                                     <div className="mb-1"><strong>Kgs.Programados:</strong> {parseFloat(kgProgramados).toFixed(2)}</div>
//                                                     <div className="mb-1"><strong>Kgs.SobreOrden:</strong> {parseFloat(kgSobreOrden).toFixed(0)}</div>
//                                                 </>
//                                             )}
                                            
//                                             {/* SLITTER y HORNOS: Pasadas y Kgs */}
//                                             {(tipoMaquina === 'SLITTER' || tipoMaquina === 'HORNOS') && (
//                                                 <>
//                                                     <div className="mb-1"><strong>Cant.Pasadas:</strong> {header.pasadas || 'N/A'}</div>
//                                                     <div className="mb-1"><strong>Kgs.Programados:</strong> {parseFloat(kgProgramados).toFixed(2)}</div>
//                                                     <div className="mb-1"><strong>Kgs.SobreOrden:</strong> {parseFloat(kgSobreOrden).toFixed(0)}</div>
//                                                 </>
//                                             )}
//                                         </Col>
//                                     </Row>
//                                 </fieldset>
//                                 <div className="bg-secondary text-white text-center p-2 mb-2 rounded">
//                                     <h5 className="mb-0"><strong>Kgs.Calidad: {parseFloat(kgCalidad).toFixed(0)}</strong></h5>
//                                 </div>
//                             </Col>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Clientes</legend>
//                                     <div className="mb-1"><strong>{clientes}</strong></div>
//                                     <div className="mb-1"><strong>Nº Pedido:</strong> {numeroPedido}</div>
//                                 </fieldset>
//                                 <div className="text-end">
//                                     <Button variant="info" size="sm" disabled>
//                                         <i className="fas fa-file-alt me-1"></i> Ficha Técnica
//                                     </Button>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white">
//                         <i className="fas fa-exclamation-triangle me-2"></i> Defectos Detectados
//                     </Card.Header>
//                     <Card.Body>
//                         <Row className="mb-3">
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Defecto *</Form.Label>
//                                     <Form.Select 
//                                         value={formData.defecto} 
//                                         onChange={(e) => setFormData({...formData, defecto: e.target.value})} 
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         {defectos.map((d, i) => <option key={i} value={d.Codigo}>{d.Descripcion}</option>)}
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Gravedad</Form.Label>
//                                     <Form.Select 
//                                         value={formData.gravedad} 
//                                         onChange={(e) => setFormData({...formData, gravedad: e.target.value})} 
//                                         disabled={formData.defecto === 'FDI'} 
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[0, Sin Requerimiento]</option>
//                                         <option value="1">[1, Grave]</option>
//                                         <option value="2">[2, Moderado]</option>
//                                         <option value="3">[3, Leve]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Ubicación</Form.Label>
//                                     <Form.Select 
//                                         value={formData.ubicacion} 
//                                         onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} 
//                                         disabled={formData.defecto === 'FDI'} 
//                                         size="sm"
//                                     >
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[1, Lado Operador]</option>
//                                         <option value="1">[2, Centro]</option>
//                                         <option value="2">[3, Lado Motor]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Nota</Form.Label>
//                                     <Form.Control 
//                                         type="text" 
//                                         value={formData.nota} 
//                                         onChange={(e) => setFormData({...formData, nota: e.target.value})} 
//                                         size="sm" 
//                                     />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button variant="primary" onClick={handleAgregarDefecto} size="sm">
//                                 <i className="fas fa-plus me-1"></i> Agregar
//                             </Button>
//                         </div>
//                         <Table striped bordered hover size="sm" className="mb-2">
//                             <thead className="table-dark">
//                                 <tr>
//                                     <th>Defecto</th>
//                                     <th>Gravedad</th>
//                                     <th>Ubicación</th>
//                                     <th>Nota</th>
//                                     <th width="100" className="text-center">Acciones</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {defectosDetectados.length === 0 ? (
//                                     <tr>
//                                         <td colSpan="5" className="text-center text-muted py-3">
//                                             No hay defectos registrados
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     defectosDetectados.map((d) => (
//                                         <tr key={d.id}>
//                                             <td>{d.descripcion}</td>
//                                             <td>{d.gravedadDesc}</td>
//                                             <td>{d.ubicacionDesc}</td>
//                                             <td>{d.nota || '-'}</td>
//                                             <td className="text-center">
//                                                 <Button 
//                                                     variant="warning" 
//                                                     size="sm" 
//                                                     onClick={() => handleModificarDefecto(d)} 
//                                                     className="me-1"
//                                                 >
//                                                     <i className="fas fa-edit"></i>
//                                                 </Button>
//                                                 <Button 
//                                                     variant="danger" 
//                                                     size="sm" 
//                                                     onClick={() => handleEliminarDefecto(d.id)}
//                                                 >
//                                                     <i className="fas fa-trash"></i>
//                                                 </Button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </Table>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white">
//                         <i className="fas fa-sticky-note me-2"></i> Notas Calidad
//                     </Card.Header>
//                     <Card.Body>
//                         <Form.Control 
//                             as="textarea" 
//                             rows={3} 
//                             value={notaCalidad} 
//                             onChange={(e) => setNotaCalidad(e.target.value)} 
//                             placeholder="Ingrese notas adicionales..." 
//                         />
//                     </Card.Body>
//                 </Card>

//                 {mostrarBotones && (
//                     <Form.Check 
//                         type="checkbox" 
//                         label={<span className="fw-bold">Retorna a STOCK</span>} 
//                         checked={retornaStock} 
//                         onChange={(e) => setRetornaStock(e.target.checked)} 
//                         className="mb-3" 
//                     />
//                 )}
//             </Modal.Body>
//             <Modal.Footer className="bg-light">
//                 <Button variant="secondary" onClick={onHide} disabled={loading}>
//                     <i className="fas fa-times me-1"></i> Cancelar
//                 </Button>
                
//                 {mostrarBotones && (
//                     <>
//                         <Button 
//                             variant="danger" 
//                             onClick={() => handleGuardarCalidad(2)} 
//                             disabled={loading || defectosDetectados.length === 0} 
//                             className="me-2"
//                         >
//                             <i className="fas fa-times-circle me-1"></i> RECHAZADO
//                         </Button>
//                         <Button 
//                             variant="success" 
//                             onClick={() => handleGuardarCalidad(1)} 
//                             disabled={loading}
//                         >
//                             <i className="fas fa-check-circle me-1"></i> APROBADO
//                         </Button>
//                     </>
//                 )}
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default CalidadModal;































// // /src/components/Calidad/CalidadModal.jsx

// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Row, Col, Card, Table } from 'react-bootstrap';
// import axiosInstance from '../../api/axiosInstance';
// import Swal from 'sweetalert2';

// const CalidadModal = ({ show, onHide, operacion, verDefectosSobreorden, onSuccess }) => {
//     const [defectos, setDefectos] = useState([]);
//     const [defectosDetectados, setDefectosDetectados] = useState([]);
//     const [datosOperacion, setDatosOperacion] = useState(null);
//     const [formData, setFormData] = useState({
//         defecto: '',
//         gravedad: '',
//         ubicacion: '',
//         nota: ''
//     });
//     const [notaCalidad, setNotaCalidad] = useState('');
//     const [retornaStock, setRetornaStock] = useState(false);
//     const [loading, setLoading] = useState(false);

//     const mostrarBotones = verDefectosSobreorden === false;

//     useEffect(() => {
//         if (show && operacion) {
//             console.log('🚀 [Modal] Abriendo modal para operación:', operacion.Operacion_ID);
//             cargarDatosCompletos();
//         }
//     }, [show, operacion]);

//     const cargarDatosCompletos = async () => {
//         try {
//             setLoading(true);
//             const response = await axiosInstance.get(`/calidad/detalle/${operacion.Operacion_ID}`);
//             setDatosOperacion(response.data);
            
//             const familia = operacion.Codigo_Producto && operacion.Codigo_Producto.length >= 10 
//                 ? operacion.Codigo_Producto.substring(8, 10) 
//                 : '00';
            
//             const respDefectos = await axiosInstance.get('/calidad/defectos', { params: { familia } });
//             setDefectos(Array.isArray(respDefectos.data) ? respDefectos.data : []);
//             setDefectosDetectados(response.data.defectos || []);
            
//             setNotaCalidad('');
//             setRetornaStock(false);
//             setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
//         } catch (error) {
//             console.error('❌ [Modal] Error al cargar datos:', error);
//             Swal.fire('Error', 'No se pudieron cargar los datos de la operación: ' + error.message, 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ✅ NUEVO: Sincroniza la lista completa de defectos con la BD (como btnConfirma_Click)
//     const sincronizarConBackend = async (lista) => {
//         try {
//             await axiosInstance.post('/calidad/sincronizar-defectos', {
//                 operacionId: operacion.Operacion_ID,
//                 defectos: lista.map(d => ({
//                     defecto: d.defecto,
//                     gravedad: d.gravedad,
//                     ubicacion: d.ubicacion,
//                     nota: d.nota || '',
//                     horno: d.horno || 0,
//                     horneada: d.horneada || 0,
//                     kgsHorneada: d.kgsHorneada || 0
//                 })),
//                 usuario: 'pmorrone',
//                 sobreorden: verDefectosSobreorden ? 1 : 0
//             });
//             console.log('✅ [Modal] Defectos sincronizados con la BD');
//         } catch (error) {
//             console.error('❌ [Modal] Error al sincronizar defectos:', error);
//             Swal.fire('Error', 'No se pudieron guardar los defectos: ' + (error.response?.data?.error || error.message), 'error');
//         }
//     };

//     // ✅ AGREGAR: agrega a la grilla Y guarda en la BD
//     const handleAgregarDefecto = async () => {
//         if (!formData.defecto) {
//             Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
//             return;
//         }
//         if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
//             Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
//             return;
//         }

//         const defectoSeleccionado = defectos.find(d => d.Codigo === formData.defecto);
//         const nuevoDefecto = {
//             id: Date.now(),
//             defecto: formData.defecto,
//             descripcion: defectoSeleccionado?.Descripcion || '',
//             gravedad: formData.gravedad,
//             gravedadDesc: getGravedadLabel(formData.gravedad),
//             ubicacion: formData.ubicacion,
//             ubicacionDesc: getUbicacionLabel(formData.ubicacion),
//             nota: formData.nota
//         };

//         const nuevaLista = [...defectosDetectados, nuevoDefecto];
//         setDefectosDetectados(nuevaLista);
//         setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
        
//         // ✅ Guardo en la base de datos
//         await sincronizarConBackend(nuevaLista);
//     };

//     // ✅ ELIMINAR: quita de la grilla Y actualiza la BD
//     const handleEliminarDefecto = async (id) => {
//         const nuevaLista = defectosDetectados.filter(d => d.id !== id);
//         setDefectosDetectados(nuevaLista);
//         await sincronizarConBackend(nuevaLista);
//     };

//     // ✅ MODIFICAR: carga en el formulario, quita de la grilla y sincroniza BD
//     const handleModificarDefecto = async (defecto) => {
//         setFormData({
//             defecto: defecto.defecto,
//             gravedad: defecto.gravedad,
//             ubicacion: defecto.ubicacion,
//             nota: defecto.nota
//         });
//         const nuevaLista = defectosDetectados.filter(d => d.id !== defecto.id);
//         setDefectosDetectados(nuevaLista);
//         await sincronizarConBackend(nuevaLista);
//     };

//     const getGravedadLabel = (codigo) => {
//         const labels = { '0': '[0, Sin Requerimiento]', '1': '[1, Grave]', '2': '[2, Moderado]', '3': '[3, Leve]' };
//         return labels[codigo] || codigo;
//     };

//     const getUbicacionLabel = (codigo) => {
//         const labels = { '0': '[1, Lado Operador]', '1': '[2, Centro]', '2': '[3, Lado Motor]' };
//         return labels[codigo] || codigo;
//     };

//     // ✅ APROBADO/RECHAZADO: Confirma, actualiza registración, dictamen, atados y envía mails
//     const handleGuardarCalidad = async (dictamen) => {
//         if (defectosDetectados.length === 0 && dictamen === 2) {
//             Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
//             return;
//         }

//         // 1. Confirmación (Replicando MessageBox.Show del C#)
//         const confirmMsg = dictamen === 1 
//             ? 'Se ACEPTARÁ el material cortado. ¿Continúa?' 
//             : 'Se RECHAZARÁ el material cortado. ¿Continúa?';
//         const confirmTitle = dictamen === 1 ? 'APROBADO' : 'RECHAZADO';
        
//         const result = await Swal.fire({
//             title: confirmTitle,
//             text: confirmMsg,
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonColor: dictamen === 1 ? '#28a745' : '#dc3545',
//             cancelButtonColor: '#6c757d',
//             confirmButtonText: 'Sí, continuar',
//             cancelButtonText: 'Cancelar'
//         });

//         if (!result.isConfirmed) return;

//         setLoading(true);
//         try {
//             await axiosInstance.post('/calidad/actualizar-dictamen', {
//                 operacionId: operacion.Operacion_ID,
//                 dictamen: dictamen,
//                 notaCalidad: notaCalidad,
//                 retornaStock: retornaStock,
//                 esSobreorden: verDefectosSobreorden, // Para que el backend sepa si es SO
//                 usuario: 'pmorrone',                 // Reemplazar por usuario logueado real
//                 defectos: defectosDetectados         // Para evaluar si hay "Fuera de Diámetro"
//             });
            
//             await Swal.fire('Éxito', `Operación ${dictamen === 1 ? 'APROBADA' : 'RECHAZADA'} correctamente`, 'success');
//             if (onSuccess) onSuccess();
//             onHide();
//         } catch (error) {
//             console.error('❌ [Modal] Error al guardar:', error);
//             Swal.fire('Error', error.response?.data?.error || 'Error al procesar el dictamen', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };


























//     if (!operacion || !datosOperacion) {
//         return (
//             <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//                 <Modal.Body className="text-center py-5">
//                     <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
//                     <p className="mt-3">Cargando datos de la operación...</p>
//                 </Modal.Body>
//             </Modal>
//         );
//     }

//     const header = datosOperacion.header || {};
    
//     const tareaDestino = header.tareaDestino || 'N/A';
//     const clientes = header.cliente || 'N/A';
//     const numeroPedido = header.numeroPedido || 'N/A';
//     const pasadas = header.pasadas || '1';
//     const ancho = header.ancho || 0;
//     const destinoLote = header.destinoLote || 'N/A';
//     const kgProgramados = header.kgsProgramados || 0;
//     const kgSobreOrden = header.kgsSobreOrden || 0;
//     const kgCalidad = header.kgsCalidad || 0;

//     return (
//         <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
//             <Modal.Header closeButton className="bg-secondary text-white">
//                 <Modal.Title><i className="fas fa-clipboard-check me-2"></i> REGISTRACION CALIDAD</Modal.Title>
//             </Modal.Header>
//             <Modal.Body className="bg-light">
//                 <Card className="mb-3">
//                     <Card.Body>
//                         <Row>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Datos Corte</legend>
//                                     <Row>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Ancho:</strong> {ancho}</div>
//                                             <div className="mb-1"><strong>Tarea Destino:</strong> {tareaDestino}</div>
//                                             <div className="mb-1"><strong>Serie/Lote Dest:</strong> {destinoLote.substring(0, 11)}</div>
//                                         </Col>
//                                         <Col md={6}>
//                                             <div className="mb-1"><strong>Cant.Pasadas:</strong> {pasadas}</div>
//                                             <div className="mb-1"><strong>Kgs.Programados:</strong> {parseFloat(kgProgramados).toFixed(2)}</div>
//                                             <div className="mb-1"><strong>Kgs.SobreOrden:</strong> {parseFloat(kgSobreOrden).toFixed(0)}</div>
//                                         </Col>
//                                     </Row>
//                                 </fieldset>
//                                 <div className="bg-secondary text-white text-center p-2 mb-2 rounded">
//                                     <h5 className="mb-0"><strong>Kgs.Calidad: {parseFloat(kgCalidad).toFixed(0)}</strong></h5>
//                                 </div>
//                             </Col>
//                             <Col md={6}>
//                                 <fieldset className="border p-2 mb-2">
//                                     <legend className="w-auto small px-2 fw-bold">Clientes</legend>
//                                     <div className="mb-1"><strong>{clientes}</strong></div>
//                                     <div className="mb-1"><strong>Nº Pedido:</strong> {numeroPedido}</div>
//                                 </fieldset>
//                                 <div className="text-end">
//                                     <Button variant="info" size="sm" disabled><i className="fas fa-file-alt me-1"></i> Ficha Técnica</Button>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-exclamation-triangle me-2"></i> Defectos Detectados</Card.Header>
//                     <Card.Body>
//                         <Row className="mb-3">
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Defecto *</Form.Label>
//                                     <Form.Select value={formData.defecto} onChange={(e) => setFormData({...formData, defecto: e.target.value})} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         {defectos.map((d, i) => <option key={i} value={d.Codigo}>{d.Descripcion}</option>)}
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Gravedad</Form.Label>
//                                     <Form.Select value={formData.gravedad} onChange={(e) => setFormData({...formData, gravedad: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[0, Sin Requerimiento]</option>
//                                         <option value="1">[1, Grave]</option>
//                                         <option value="2">[2, Moderado]</option>
//                                         <option value="3">[3, Leve]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Ubicación</Form.Label>
//                                     <Form.Select value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
//                                         <option value="">Seleccione...</option>
//                                         <option value="0">[1, Lado Operador]</option>
//                                         <option value="1">[2, Centro]</option>
//                                         <option value="2">[3, Lado Motor]</option>
//                                     </Form.Select>
//                                 </Form.Group>
//                             </Col>
//                             <Col md={3}>
//                                 <Form.Group>
//                                     <Form.Label className="fw-bold">Nota</Form.Label>
//                                     <Form.Control type="text" value={formData.nota} onChange={(e) => setFormData({...formData, nota: e.target.value})} size="sm" />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
//                         <div className="d-flex justify-content-end mb-3">
//                             <Button variant="primary" onClick={handleAgregarDefecto} size="sm"><i className="fas fa-plus me-1"></i> Agregar</Button>
//                         </div>
//                         <Table striped bordered hover size="sm" className="mb-2">
//                             <thead className="table-dark">
//                                 <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th width="100" className="text-center">Acciones</th></tr>
//                             </thead>
//                             <tbody>
//                                 {defectosDetectados.length === 0 ? (
//                                     <tr><td colSpan="5" className="text-center text-muted py-3">No hay defectos registrados</td></tr>
//                                 ) : (
//                                     defectosDetectados.map((d) => (
//                                         <tr key={d.id}>
//                                             <td>{d.descripcion}</td>
//                                             <td>{d.gravedadDesc}</td>
//                                             <td>{d.ubicacionDesc}</td>
//                                             <td>{d.nota || '-'}</td>
//                                             <td className="text-center">
//                                                 <Button variant="warning" size="sm" onClick={() => handleModificarDefecto(d)} className="me-1"><i className="fas fa-edit"></i></Button>
//                                                 <Button variant="danger" size="sm" onClick={() => handleEliminarDefecto(d.id)}><i className="fas fa-trash"></i></Button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </Table>
//                     </Card.Body>
//                 </Card>

//                 <Card className="mb-3">
//                     <Card.Header className="bg-dark text-white"><i className="fas fa-sticky-note me-2"></i> Notas Calidad</Card.Header>
//                     <Card.Body>
//                         <Form.Control as="textarea" rows={3} value={notaCalidad} onChange={(e) => setNotaCalidad(e.target.value)} placeholder="Ingrese notas adicionales..." />
//                     </Card.Body>
//                 </Card>

//                 {mostrarBotones && (
//                     <Form.Check 
//                         type="checkbox" 
//                         label={<span className="fw-bold">Retorna a STOCK</span>} 
//                         checked={retornaStock} 
//                         onChange={(e) => setRetornaStock(e.target.checked)} 
//                         className="mb-3" 
//                     />
//                 )}
//             </Modal.Body>
//             <Modal.Footer className="bg-light">
//                 <Button variant="secondary" onClick={onHide} disabled={loading}>
//                     <i className="fas fa-times me-1"></i> Cancelar
//                 </Button>
                
//                 {mostrarBotones && (
//                     <>
//                         <Button 
//                             variant="danger" 
//                             onClick={() => handleGuardarCalidad(2)} 
//                             disabled={loading || defectosDetectados.length === 0} 
//                             className="me-2"
//                         >
//                             <i className="fas fa-times-circle me-1"></i> RECHAZADO
//                         </Button>
//                         <Button 
//                             variant="success" 
//                             onClick={() => handleGuardarCalidad(1)} 
//                             disabled={loading}
//                         >
//                             <i className="fas fa-check-circle me-1"></i> APROBADO
//                         </Button>
//                     </>
//                 )}
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default CalidadModal;











































// /src/components/Calidad/CalidadModal.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, Table } from 'react-bootstrap';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const CalidadModal = ({ show, onHide, operacion, verDefectosSobreorden, onSuccess }) => {
    const [defectos, setDefectos] = useState([]);
    const [defectosDetectados, setDefectosDetectados] = useState([]);
    const [datosOperacion, setDatosOperacion] = useState(null);
    const [formData, setFormData] = useState({
        defecto: '',
        gravedad: '',
        ubicacion: '',
        nota: ''
    });
    const [notaCalidad, setNotaCalidad] = useState('');
    const [retornaStock, setRetornaStock] = useState(false);
    const [loading, setLoading] = useState(false);

    const mostrarBotones = verDefectosSobreorden === false;

    useEffect(() => {
        if (show && operacion) {
            console.log('🚀 [Modal] Abriendo modal para operación:', operacion.Operacion_ID);
            // ✅ Resetear estados al abrir para evitar datos residuales
            setDatosOperacion(null);
            setDefectosDetectados([]);
            setNotaCalidad('');
            setRetornaStock(false);
            setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
            cargarDatosCompletos();
        }
    }, [show, operacion]);

    const cargarDatosCompletos = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/calidad/detalle/${operacion.Operacion_ID}`);
            setDatosOperacion(response.data);
            
            const familia = operacion.Codigo_Producto && operacion.Codigo_Producto.length >= 10 
                ? operacion.Codigo_Producto.substring(8, 10) 
                : '00';
            
            const respDefectos = await axiosInstance.get('/calidad/defectos', { params: { familia } });
            setDefectos(Array.isArray(respDefectos.data) ? respDefectos.data : []);
            setDefectosDetectados(response.data.defectos || []);
            
        } catch (error) {
            console.error('❌ [Modal] Error al cargar datos:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos de la operación: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const sincronizarConBackend = async (lista) => {
        try {
            await axiosInstance.post('/calidad/sincronizar-defectos', {
                operacionId: operacion.Operacion_ID,
                defectos: lista.map(d => ({
                    defecto: d.defecto,
                    gravedad: d.gravedad,
                    ubicacion: d.ubicacion,
                    nota: d.nota || '',
                    horno: d.horno || 0,
                    horneada: d.horneada || 0,
                    kgsHorneada: d.kgsHorneada || 0
                })),
                usuario: 'pmorrone',
                sobreorden: verDefectosSobreorden ? 1 : 0
            });
            console.log('✅ [Modal] Defectos sincronizados con la BD');
        } catch (error) {
            console.error('❌ [Modal] Error al sincronizar defectos:', error);
            Swal.fire('Error', 'No se pudieron guardar los defectos: ' + (error.response?.data?.error || error.message), 'error');
        }
    };

    const handleAgregarDefecto = async () => {
        if (!formData.defecto) {
            Swal.fire('Atención', 'Debe seleccionar un defecto', 'warning');
            return;
        }
        if (formData.defecto !== 'FDI' && (!formData.gravedad || !formData.ubicacion)) {
            Swal.fire('Atención', 'Debe completar Gravedad y Ubicación', 'warning');
            return;
        }

        const defectoSeleccionado = defectos.find(d => d.Codigo === formData.defecto);
        const nuevoDefecto = {
            id: Date.now(),
            defecto: formData.defecto,
            descripcion: defectoSeleccionado?.Descripcion || '',
            gravedad: formData.gravedad,
            gravedadDesc: getGravedadLabel(formData.gravedad),
            ubicacion: formData.ubicacion,
            ubicacionDesc: getUbicacionLabel(formData.ubicacion),
            nota: formData.nota
        };

        const nuevaLista = [...defectosDetectados, nuevoDefecto];
        setDefectosDetectados(nuevaLista);
        setFormData({ defecto: '', gravedad: '', ubicacion: '', nota: '' });
        
        await sincronizarConBackend(nuevaLista);
    };

    const handleEliminarDefecto = async (id) => {
        const nuevaLista = defectosDetectados.filter(d => d.id !== id);
        setDefectosDetectados(nuevaLista);
        await sincronizarConBackend(nuevaLista);
    };

    const handleModificarDefecto = async (defecto) => {
        setFormData({
            defecto: defecto.defecto,
            gravedad: defecto.gravedad,
            ubicacion: defecto.ubicacion,
            nota: defecto.nota
        });
        const nuevaLista = defectosDetectados.filter(d => d.id !== defecto.id);
        setDefectosDetectados(nuevaLista);
        await sincronizarConBackend(nuevaLista);
    };

    const getGravedadLabel = (codigo) => {
        const labels = { '0': '[0, Sin Requerimiento]', '1': '[1, Grave]', '2': '[2, Moderado]', '3': '[3, Leve]' };
        return labels[codigo] || codigo;
    };

    const getUbicacionLabel = (codigo) => {
        const labels = { '0': '[1, Lado Operador]', '1': '[2, Centro]', '2': '[3, Lado Motor]' };
        return labels[codigo] || codigo;
    };

    const handleGuardarCalidad = async (dictamen) => {
        if (defectosDetectados.length === 0 && dictamen === 2) {
            Swal.fire('Atención', 'Debe ingresar al menos un defecto para rechazar', 'warning');
            return;
        }

        const confirmMsg = dictamen === 1 
            ? 'Se ACEPTARÁ el material cortado. ¿Continúa?' 
            : 'Se RECHAZARÁ el material cortado. ¿Continúa?';
        const confirmTitle = dictamen === 1 ? 'APROBADO' : 'RECHAZADO';
        
        const result = await Swal.fire({
            title: confirmTitle,
            text: confirmMsg,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: dictamen === 1 ? '#28a745' : '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            await axiosInstance.post('/calidad/actualizar-dictamen', {
                operacionId: operacion.Operacion_ID,
                dictamen: dictamen,
                notaCalidad: notaCalidad,
                retornaStock: retornaStock,
                esSobreorden: verDefectosSobreorden,
                usuario: 'pmorrone',
                defectos: defectosDetectados
            });
            
            await Swal.fire('Éxito', `Operación ${dictamen === 1 ? 'APROBADA' : 'RECHAZADA'} correctamente`, 'success');
            if (onSuccess) onSuccess();
            onHide();
        } catch (error) {
            console.error('❌ [Modal] Error al guardar:', error);
            Swal.fire('Error', error.response?.data?.error || 'Error al procesar el dictamen', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!operacion) return null;

    const header = datosOperacion?.header || {};
    
    const tareaDestino = header.tareaDestino || 'N/A';
    const clientes = header.cliente || 'N/A';
    const numeroPedido = header.numeroPedido || 'N/A';
    const pasadas = header.pasadas || '1';
    const ancho = header.ancho || 0;
    const destinoLote = header.destinoLote || 'N/A';
    const kgProgramados = header.kgsProgramados || 0;
    const kgSobreOrden = header.kgsSobreOrden || 0;
    const kgCalidad = header.kgsCalidad || 0;

    return (
        // ✅ enforceFocus y restoreFocus en false evitan bugs de foco al navegar entre páginas en React Router
        <Modal 
            show={show} 
            onHide={onHide} 
            size="xl" 
            centered 
            backdrop="static" 
            keyboard={false}
            enforceFocus={false}
            restoreFocus={false}
        >
            <Modal.Header closeButton className="bg-secondary text-white">
                <Modal.Title><i className="fas fa-clipboard-check me-2"></i> REGISTRACION CALIDAD</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-light">
                {/* ✅ El Spinner ahora está DENTRO del Modal.Body. Esto evita que React desmonte el Modal y rompa el CSS de Bootstrap */}
                {loading || !datosOperacion ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
                        <p className="mt-3">Cargando datos de la operación...</p>
                    </div>
                ) : (
                    <>
                        <Card className="mb-3">
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <fieldset className="border p-2 mb-2">
                                            <legend className="w-auto small px-2 fw-bold">Datos Corte</legend>
                                            <Row>
                                                <Col md={6}>
                                                    <div className="mb-1"><strong>Ancho:</strong> {ancho}</div>
                                                    <div className="mb-1"><strong>Tarea Destino:</strong> {tareaDestino}</div>
                                                    <div className="mb-1"><strong>Serie/Lote Dest:</strong> {destinoLote.substring(0, 11)}</div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="mb-1"><strong>Cant.Pasadas:</strong> {pasadas}</div>
                                                    <div className="mb-1"><strong>Kgs.Programados:</strong> {parseFloat(kgProgramados).toFixed(2)}</div>
                                                    <div className="mb-1"><strong>Kgs.SobreOrden:</strong> {parseFloat(kgSobreOrden).toFixed(0)}</div>
                                                </Col>
                                            </Row>
                                        </fieldset>
                                        <div className="bg-secondary text-white text-center p-2 mb-2 rounded">
                                            <h5 className="mb-0"><strong>Kgs.Calidad: {parseFloat(kgCalidad).toFixed(0)}</strong></h5>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <fieldset className="border p-2 mb-2">
                                            <legend className="w-auto small px-2 fw-bold">Clientes</legend>
                                            <div className="mb-1"><strong>{clientes}</strong></div>
                                            <div className="mb-1"><strong>Nº Pedido:</strong> {numeroPedido}</div>
                                        </fieldset>
                                        <div className="text-end">
                                            <Button variant="info" size="sm" disabled><i className="fas fa-file-alt me-1"></i> Ficha Técnica</Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="mb-3">
                            <Card.Header className="bg-dark text-white"><i className="fas fa-exclamation-triangle me-2"></i> Defectos Detectados</Card.Header>
                            <Card.Body>
                                <Row className="mb-3">
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold">Defecto *</Form.Label>
                                            <Form.Select value={formData.defecto} onChange={(e) => setFormData({...formData, defecto: e.target.value})} size="sm">
                                                <option value="">Seleccione...</option>
                                                {defectos.map((d, i) => <option key={i} value={d.Codigo}>{d.Descripcion}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold">Gravedad</Form.Label>
                                            <Form.Select value={formData.gravedad} onChange={(e) => setFormData({...formData, gravedad: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
                                                <option value="">Seleccione...</option>
                                                <option value="0">[0, Sin Requerimiento]</option>
                                                <option value="1">[1, Grave]</option>
                                                <option value="2">[2, Moderado]</option>
                                                <option value="3">[3, Leve]</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold">Ubicación</Form.Label>
                                            <Form.Select value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} disabled={formData.defecto === 'FDI'} size="sm">
                                                <option value="">Seleccione...</option>
                                                <option value="0">[1, Lado Operador]</option>
                                                <option value="1">[2, Centro]</option>
                                                <option value="2">[3, Lado Motor]</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold">Nota</Form.Label>
                                            <Form.Control type="text" value={formData.nota} onChange={(e) => setFormData({...formData, nota: e.target.value})} size="sm" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <div className="d-flex justify-content-end mb-3">
                                    <Button variant="primary" onClick={handleAgregarDefecto} size="sm"><i className="fas fa-plus me-1"></i> Agregar</Button>
                                </div>
                                <Table striped bordered hover size="sm" className="mb-2">
                                    <thead className="table-dark">
                                        <tr><th>Defecto</th><th>Gravedad</th><th>Ubicación</th><th>Nota</th><th width="100" className="text-center">Acciones</th></tr>
                                    </thead>
                                    <tbody>
                                        {defectosDetectados.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center text-muted py-3">No hay defectos registrados</td></tr>
                                        ) : (
                                            defectosDetectados.map((d) => (
                                                <tr key={d.id}>
                                                    <td>{d.descripcion}</td>
                                                    <td>{d.gravedadDesc}</td>
                                                    <td>{d.ubicacionDesc}</td>
                                                    <td>{d.nota || '-'}</td>
                                                    <td className="text-center">
                                                        <Button variant="warning" size="sm" onClick={() => handleModificarDefecto(d)} className="me-1"><i className="fas fa-edit"></i></Button>
                                                        <Button variant="danger" size="sm" onClick={() => handleEliminarDefecto(d.id)}><i className="fas fa-trash"></i></Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>

                        <Card className="mb-3">
                            <Card.Header className="bg-dark text-white"><i className="fas fa-sticky-note me-2"></i> Notas Calidad</Card.Header>
                            <Card.Body>
                                <Form.Control as="textarea" rows={3} value={notaCalidad} onChange={(e) => setNotaCalidad(e.target.value)} placeholder="Ingrese notas adicionales..." />
                            </Card.Body>
                        </Card>

                        {mostrarBotones && (
                            <Form.Check 
                                type="checkbox" 
                                label={<span className="fw-bold">Retorna a STOCK</span>} 
                                checked={retornaStock} 
                                onChange={(e) => setRetornaStock(e.target.checked)} 
                                className="mb-3" 
                            />
                        )}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    <i className="fas fa-times me-1"></i> Cancelar
                </Button>
                
                {mostrarBotones && !loading && datosOperacion && (
                    <>
                        <Button 
                            variant="danger" 
                            onClick={() => handleGuardarCalidad(2)} 
                            disabled={loading || defectosDetectados.length === 0} 
                            className="me-2"
                        >
                            <i className="fas fa-times-circle me-1"></i> RECHAZADO
                        </Button>
                        <Button 
                            variant="success" 
                            onClick={() => handleGuardarCalidad(1)} 
                            disabled={loading}
                        >
                            <i className="fas fa-check-circle me-1"></i> APROBADO
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default CalidadModal;

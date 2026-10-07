// // /src/pages/Calidad.jsx
// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { Card, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import axiosInstance from '../api/axiosInstance';
// import CalidadModal from '../components/Calidad/CalidadModal';

// // Configuración del tema oscuro
// createTheme('adminLteDark', {
//     text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//     background: { default: '#343a40' },
//     divider: { default: '#454d55' },
//     action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//     striped: { default: '#3a4047', text: '#FFFFFF' },
//     highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// const Calidad = () => {
//     const { theme } = useContext(ThemeContext);
//     const { user } = useAuth();
    
//     const usuarioActual = useMemo(() => {
//         if (!user) return 'admin';
//         if (typeof user === 'string') return user;
//         return user?.username || user?.nombre || user?.userName || user?.name || 'admin';
//     }, [user]);
    
//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [verDefectosSobreorden, setVerDefectosSobreorden] = useState(false);
//     const [maquinaFiltro, setMaquinaFiltro] = useState('TODAS');
//     const [showModal, setShowModal] = useState(false);
//     const [operacionSeleccionada, setOperacionSeleccionada] = useState(null);

//     useEffect(() => {
//         cargarOperaciones();
//     }, [verDefectosSobreorden, maquinaFiltro]);

//     const cargarOperaciones = async () => {
//         try {
//             setLoading(true);
//             setError(null);
            
//             const response = await axiosInstance.get('/calidad/operaciones-pendientes', {
//                 params: {
//                     maquina: maquinaFiltro,
//                     verDefectosSobreorden: verDefectosSobreorden
//                 }
//             });
            
//             setOperaciones(response.data);
//         } catch (err) {
//             console.error('Error al cargar operaciones:', err);
//             setError('Error al cargar operaciones: ' + (err.response?.data?.error || err.message));
//             setOperaciones([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleRowClick = (row) => {
//         setOperacionSeleccionada(row);
//         setShowModal(true);
//     };

//     const handleModalSuccess = () => {
//         cargarOperaciones();
//     };

//     const columns = useMemo(() => [
//     {
//         name: 'Máquina',
//         selector: row => row.Maquina,
//         sortable: true,
//         width: '8%',
//         style: { fontWeight: 'bold', fontSize: '12px' }
//     },
//     {
//         name: 'Tarea',
//         selector: row => row.Tarea,
//         sortable: true,
//         width: '12%',
//         style: { fontSize: '12px' }
//     },
//     {
//         name: 'Nro. Batch',
//         selector: row => row.NroBatch,
//         sortable: true,
//         width: '10%',
//         style: { fontSize: '12px' }
//     },
//     {
//         name: 'Cuchillas',
//         selector: row => row.Cuchillas,
//         sortable: true,
//         width: '15%',
//         style: { fontSize: '12px' }
//     },
//     {
//         name: 'Serie/Lote Saliente',
//         selector: row => row.SerieLote,
//         sortable: true,
//         width: '18%',
//         style: { fontSize: '12px' }
//     },
//     {
//         name: 'Nro. Operación',
//         selector: row => row.NroOperacion,
//         sortable: true,
//         width: '12%',
//         style: { fontSize: '11px' }
//     },
//     {
//         name: verDefectosSobreorden ? 'Kgs. SobreOrden' : 'Kgs. Calidad',  // ✅ CAMBIO CLAVE
//         selector: row => verDefectosSobreorden 
//             ? row.Kilos_Sobreorden.toFixed(3) 
//             : row.Kilos_Calidad.toFixed(3),  // ✅ CAMBIO CLAVE
//         sortable: true,
//         right: true,
//         width: '10%',
//         style: { fontWeight: 'bold', color: '#0d6efd', fontSize: '12px' }
//     },
//     {
//         name: 'Kilos Brutos',
//         selector: row => row.Kilos_Bruto.toFixed(3),
//         sortable: true,
//         right: true,
//         width: '10%',
//         style: { fontSize: '12px' }
//     },
//     {
//         name: 'Tipo',
//         selector: row => row.Tipo,
//         sortable: true,
//         width: '5%',
//         cell: row => {
//             let badgeColor = 'secondary';
//             if (row.Tipo === 'Sobrante') badgeColor = 'warning';
//             if (row.Tipo === 'Scrap') badgeColor = 'danger';
//             if (row.Tipo === 'SO') badgeColor = 'success';
            
//             return (
//                 <span className={`badge bg-${badgeColor}`} style={{ fontSize: '10px' }}>
//                     {row.Tipo}
//                 </span>
//             );
//         }
//     }
//     ], [verDefectosSobreorden]);  // ✅ AGREGAR verDefectosSobreorden como dependencia

//     const customStyles = {
//         headCells: {
//             style: {
//                 fontSize: '12px',
//                 fontWeight: 'bold',
//                 backgroundColor: theme === 'dark' ? '#343a40' : '#e9ecef',
//                 color: theme === 'dark' ? '#FFFFFF' : '#495057',
//                 borderBottom: '2px solid #dee2e6',
//                 padding: '10px 8px'
//             }
//         },
//         rows: {
//             style: {
//                 minHeight: '44px',
//                 cursor: 'pointer',
//                 fontSize: '12px',
//                 '&:hover': {
//                     backgroundColor: theme === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(0,123,255,.05)'
//                 }
//             }
//         },
//         cells: {
//             style: {
//                 padding: '6px 8px'
//             }
//         }
//     };

//     return (
//         <>
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="row mb-3">
//                         <div className="col-sm-6">
//                             <h1 className="m-0">
//                                 <b>REGISTRACIÓN CALIDAD - Operaciones Pendientes</b>
//                             </h1>
//                         </div>
//                         <div className="col-sm-6">
//                             <div className="float-right">
//                                 <div className="d-flex align-items-center justify-content-end gap-3">
//                                     <Form.Check
//                                         type="checkbox"
//                                         id="verDefectosSobreorden"
//                                         label={
//                                             <span className="fw-bold">
//                                                 <i className="fas fa-exclamation-triangle me-1"></i>
//                                                 Ver Defectos Sobreorden
//                                             </span>
//                                         }
//                                         checked={verDefectosSobreorden}
//                                         onChange={(e) => setVerDefectosSobreorden(e.target.checked)}
//                                         className="fs-6"
//                                         style={{ minWidth: '250px' }}
//                                     />
                                    
//                                     <div className="d-flex align-items-center">
//                                         <i className="fas fa-user-circle fa-lg me-2 text-primary"></i>
//                                         <span className="fw-bold">
//                                             Usuario: <span className="text-primary">{usuarioActual}</span>
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
            
//             <div className="content">
//                 <div className="container-fluid">
//                     <Card className={theme === 'dark' ? 'bg-dark text-white' : ''}>
//                         <Card.Body>
//                             {error && <Alert variant="danger">{error}</Alert>}
                            
//                             <Row className="mb-3">
//                                 <Col md={3}>
//                                     <Form.Group>
//                                         <Form.Label className="fw-bold">
//                                             <i className="fas fa-filter me-1"></i>
//                                             Filtrar por Máquina:
//                                         </Form.Label>
//                                         <Form.Select 
//                                             value={maquinaFiltro} 
//                                             onChange={(e) => setMaquinaFiltro(e.target.value)}
//                                             size="sm"
//                                         >
//                                             <option value="TODAS">TODAS</option>
//                                             <option value="SL1">SL1</option>
//                                             <option value="SL2">SL2</option>
//                                             <option value="SL3">SL3</option>
//                                             <option value="PL1">PL1</option>
//                                             <option value="PL2">PL2</option>
//                                             <option value="PL3">PL3</option>
//                                             <option value="EMB">EMB</option>
//                                         </Form.Select>
//                                     </Form.Group>
//                                 </Col>
//                             </Row>

//                             <div style={{ width: '100%', overflow: 'hidden' }}>
//                                 <DataTable
//                                     columns={columns}
//                                     data={operaciones}
//                                     progressPending={loading}
//                                     progressComponent={
//                                         <div className="py-5 text-center">
//                                             <Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} />
//                                             <p className="mt-2 mb-0">Cargando operaciones...</p>
//                                         </div>
//                                     }
//                                     noDataComponent={
//                                         <div className='py-5 text-center text-muted'>
//                                             <i className="fas fa-inbox fa-3x mb-3 d-block"></i>
//                                             No hay operaciones pendientes de calidad
//                                         </div>
//                                     }
//                                     customStyles={customStyles}
//                                     pagination
//                                     paginationPerPage={10}
//                                     paginationRowsPerPageOptions={[10, 20, 50, 100]}
//                                     paginationComponentOptions={{ 
//                                         rowsPerPageText: 'Filas por página:', 
//                                         rangeSeparatorText: 'de',
//                                         noRowsPerPage: false,
//                                         selectAllRowsItem: true,
//                                         selectAllRowsItemText: 'Todas'
//                                     }}
//                                     striped
//                                     highlightOnHover
//                                     theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//                                     onRowClicked={handleRowClick}
//                                     responsive={false}
//                                     style={{
//                                         fontSize: '12px',
//                                         border: '1px solid #dee2e6',
//                                         borderRadius: '4px',
//                                         width: '100%',
//                                         tableLayout: 'fixed'
//                                     }}
//                                 />
//                             </div>
//                         </Card.Body>
//                     </Card>
//                 </div>
//             </div>

//             {/* Modal de Calidad */}
//             {/* <CalidadModal
//                 show={showModal}
//                 onHide={() => setShowModal(false)}
//                 operacion={operacionSeleccionada}
//                 onSuccess={handleModalSuccess}
//             /> */}
//             <CalidadModal
//                 show={showModal}
//                 onHide={() => setShowModal(false)}
//                 operacion={operacionSeleccionada}
//                 verDefectosSobreorden={verDefectosSobreorden} // ✅ AGREGAR ESTA LÍNEA
//                 onSuccess={handleModalSuccess}
//             />
//         </>
//     );
// };

// export default Calidad;



























// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { Card, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import axiosInstance from '../api/axiosInstance';
// import CalidadModal from '../components/Calidad/CalidadModal';

// createTheme('adminLteDark', {
//     text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//     background: { default: '#343a40' },
//     divider: { default: '#454d55' },
//     action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//     striped: { default: '#3a4047', text: '#FFFFFF' },
//     highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// const Calidad = () => {
//     const { theme } = useContext(ThemeContext);
//     const { user } = useAuth();
    
//     const usuarioActual = useMemo(() => {
//         if (!user) return 'admin';
//         if (typeof user === 'string') return user;
//         return user?.username || user?.nombre || user?.userName || user?.name || 'admin';
//     }, [user]);
    
//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [verDefectosSobreorden, setVerDefectosSobreorden] = useState(false);
//     const [maquinaFiltro, setMaquinaFiltro] = useState('TODAS');
//     const [showModal, setShowModal] = useState(false);
//     const [operacionSeleccionada, setOperacionSeleccionada] = useState(null);

//     useEffect(() => {
//         cargarOperaciones();
//     }, [verDefectosSobreorden, maquinaFiltro]);

//     const cargarOperaciones = async () => {
//         try {
//             setLoading(true);
//             setError(null);
//             const response = await axiosInstance.get('/calidad/operaciones-pendientes', {
//                 params: { maquina: maquinaFiltro, verDefectosSobreorden: verDefectosSobreorden }
//             });
//             setOperaciones(response.data);
//         } catch (err) {
//             console.error('Error al cargar operaciones:', err);
//             setError('Error al cargar operaciones: ' + (err.response?.data?.error || err.message));
//             setOperaciones([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleRowClick = (row) => {
//         setOperacionSeleccionada(row);
//         setShowModal(true);
//     };

//     const handleModalSuccess = () => {
//         cargarOperaciones();
//     };

//     const columns = useMemo(() => [
//         { name: 'Máquina', selector: row => row.Maquina, sortable: true, width: '8%', style: { fontWeight: 'bold', fontSize: '12px' } },
//         { name: 'Tarea', selector: row => row.Tarea, sortable: true, width: '12%', style: { fontSize: '12px' } },
//         { name: 'Nro. Batch', selector: row => row.NroBatch, sortable: true, width: '10%', style: { fontSize: '12px' } },
//         { name: 'Cuchillas', selector: row => row.Cuchillas, sortable: true, width: '15%', style: { fontSize: '12px' } },
//         { name: 'Serie/Lote Saliente', selector: row => row.SerieLote, sortable: true, width: '18%', style: { fontSize: '12px' } },
//         { name: 'Nro. Operación', selector: row => row.NroOperacion, sortable: true, width: '12%', style: { fontSize: '11px' } },
//         { 
//             name: verDefectosSobreorden ? 'Kgs. SobreOrden' : 'Kgs. Calidad',
//             selector: row => verDefectosSobreorden ? row.Kilos_Sobreorden.toFixed(3) : row.Kilos_Calidad.toFixed(3),
//             sortable: true, right: true, width: '10%', style: { fontWeight: 'bold', color: '#0d6efd', fontSize: '12px' }
//         },
//         { name: 'Kilos Brutos', selector: row => row.Kilos_Bruto.toFixed(3), sortable: true, right: true, width: '10%', style: { fontSize: '12px' } },
//         {
//             name: 'Tipo', selector: row => row.Tipo, sortable: true, width: '5%',
//             cell: row => {
//                 let badgeColor = 'secondary';
//                 if (row.Tipo === 'Sobrante') badgeColor = 'warning';
//                 if (row.Tipo === 'Scrap') badgeColor = 'danger';
//                 if (row.Tipo === 'SO') badgeColor = 'success';
//                 return <span className={`badge bg-${badgeColor}`} style={{ fontSize: '10px' }}>{row.Tipo}</span>;
//             }
//         }
//     ], [verDefectosSobreorden]);

//     const customStyles = {
//         headCells: { style: { fontSize: '12px', fontWeight: 'bold', backgroundColor: theme === 'dark' ? '#343a40' : '#e9ecef', color: theme === 'dark' ? '#FFFFFF' : '#495057', borderBottom: '2px solid #dee2e6', padding: '10px 8px' } },
//         rows: { style: { minHeight: '44px', cursor: 'pointer', fontSize: '12px', '&:hover': { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(0,123,255,.05)' } } },
//         cells: { style: { padding: '6px 8px' } }
//     };

//     return (
//         <>
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="row mb-3">
//                         <div className="col-sm-6"><h1 className="m-0"><b>REGISTRACIÓN CALIDAD - Operaciones Pendientes</b></h1></div>
//                         <div className="col-sm-6">
//                             <div className="float-right">
//                                 <div className="d-flex align-items-center justify-content-end gap-3">
//                                     <Form.Check
//                                         type="checkbox"
//                                         id="verDefectosSobreorden"
//                                         label={<span className="fw-bold"><i className="fas fa-exclamation-triangle me-1"></i> Ver Defectos Sobreorden</span>}
//                                         checked={verDefectosSobreorden}
//                                         onChange={(e) => setVerDefectosSobreorden(e.target.checked)}
//                                         className="fs-6"
//                                         style={{ minWidth: '250px' }}
//                                     />
//                                     <div className="d-flex align-items-center">
//                                         <i className="fas fa-user-circle fa-lg me-2 text-primary"></i>
//                                         <span className="fw-bold">Usuario: <span className="text-primary">{usuarioActual}</span></span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
            
//             <div className="content">
//                 <div className="container-fluid">
//                     <Card className={theme === 'dark' ? 'bg-dark text-white' : ''}>
//                         <Card.Body>
//                             {error && <Alert variant="danger">{error}</Alert>}
//                             <Row className="mb-3">
//                                 <Col md={3}>
//                                     <Form.Group>
//                                         <Form.Label className="fw-bold"><i className="fas fa-filter me-1"></i> Filtrar por Máquina:</Form.Label>
//                                         <Form.Select value={maquinaFiltro} onChange={(e) => setMaquinaFiltro(e.target.value)} size="sm">
//                                             <option value="TODAS">TODAS</option>
//                                             <option value="SL1">SL1</option>
//                                             <option value="SL2">SL2</option>
//                                             <option value="SL3">SL3</option>
//                                             <option value="PL1">PL1</option>
//                                             <option value="PL2">PL2</option>
//                                             <option value="PL3">PL3</option>
//                                             <option value="EMB">EMB</option>
//                                         </Form.Select>
//                                     </Form.Group>
//                                 </Col>
//                             </Row>
//                             <div style={{ width: '100%', overflow: 'hidden' }}>
//                                 <DataTable
//                                     columns={columns} data={operaciones} progressPending={loading}
//                                     progressComponent={<div className="py-5 text-center"><Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} /><p className="mt-2 mb-0">Cargando operaciones...</p></div>}
//                                     noDataComponent={<div className='py-5 text-center text-muted'><i className="fas fa-inbox fa-3x mb-3 d-block"></i>No hay operaciones pendientes de calidad</div>}
//                                     customStyles={customStyles} pagination paginationPerPage={10} paginationRowsPerPageOptions={[10, 20, 50, 100]}
//                                     paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de', noRowsPerPage: false, selectAllRowsItem: true, selectAllRowsItemText: 'Todas' }}
//                                     striped highlightOnHover theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//                                     onRowClicked={handleRowClick} responsive={false}
//                                     style={{ fontSize: '12px', border: '1px solid #dee2e6', borderRadius: '4px', width: '100%', tableLayout: 'fixed' }}
//                                 />
//                             </div>
//                         </Card.Body>
//                     </Card>
//                 </div>
//             </div>

//             <CalidadModal
//                 show={showModal}
//                 onHide={() => setShowModal(false)}
//                 operacion={operacionSeleccionada}
//                 verDefectosSobreorden={verDefectosSobreorden}
//                 onSuccess={handleModalSuccess}
//             />
//         </>
//     );
// };

// export default Calidad;



























































// // /src/pages/Calidad.jsx

// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { Card, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import axiosInstance from '../api/axiosInstance';
// import CalidadModal from '../components/Calidad/CalidadModal';

// createTheme('adminLteDark', {
//     text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//     background: { default: '#343a40' },
//     divider: { default: '#454d55' },
//     action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//     striped: { default: '#3a4047', text: '#FFFFFF' },
//     highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// const Calidad = () => {
//     const { theme } = useContext(ThemeContext);
//     const { user } = useAuth();
    
//     const usuarioActual = useMemo(() => {
//         if (!user) return 'admin';
//         if (typeof user === 'string') return user;
//         return user?.username || user?.nombre || user?.userName || user?.name || 'admin';
//     }, [user]);
    
//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [verDefectosSobreorden, setVerDefectosSobreorden] = useState(false); // ✅ INICIALIZADO EN false
//     const [maquinaFiltro, setMaquinaFiltro] = useState('TODAS');
//     const [showModal, setShowModal] = useState(false);
//     const [operacionSeleccionada, setOperacionSeleccionada] = useState(null);

//     useEffect(() => {
//         cargarOperaciones();
//     }, [verDefectosSobreorden, maquinaFiltro]);

//     const cargarOperaciones = async () => {
//         try {
//             setLoading(true);
//             setError(null);
//             const response = await axiosInstance.get('/calidad/operaciones-pendientes', {
//                 params: { maquina: maquinaFiltro, verDefectosSobreorden: verDefectosSobreorden }
//             });
//             setOperaciones(response.data);
//         } catch (err) {
//             console.error('Error al cargar operaciones:', err);
//             setError('Error al cargar operaciones: ' + (err.response?.data?.error || err.message));
//             setOperaciones([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleRowClick = (row) => {
//         console.log(' [Calidad] Fila seleccionada:', row);
//         console.log('🔘 [Calidad] verDefectosSobreorden al abrir modal:', verDefectosSobreorden);
//         setOperacionSeleccionada(row);
//         setShowModal(true);
//     };

//     const handleModalSuccess = () => {
//         cargarOperaciones();
//     };

//     const columns = useMemo(() => [
//         { name: 'Máquina', selector: row => row.Maquina, sortable: true, width: '8%', style: { fontWeight: 'bold', fontSize: '12px' } },
//         { name: 'Tarea', selector: row => row.Tarea, sortable: true, width: '12%', style: { fontSize: '12px' } },
//         { name: 'Nro. Batch', selector: row => row.NroBatch, sortable: true, width: '10%', style: { fontSize: '12px' } },
//         { name: 'Cuchillas', selector: row => row.Cuchillas, sortable: true, width: '15%', style: { fontSize: '12px' } },
//         { name: 'Serie/Lote Saliente', selector: row => row.SerieLote, sortable: true, width: '18%', style: { fontSize: '12px' } },
//         { name: 'Nro. Operación', selector: row => row.NroOperacion, sortable: true, width: '12%', style: { fontSize: '11px' } },
//         { 
//             name: verDefectosSobreorden ? 'Kgs. SobreOrden' : 'Kgs. Calidad',
//             selector: row => verDefectosSobreorden 
//                 ? row.Kilos_Sobreorden.toFixed(3) 
//                 : row.Kilos_Calidad.toFixed(3),
//             sortable: true, right: true, width: '10%', style: { fontWeight: 'bold', color: '#0d6efd', fontSize: '12px' }
//         },
//         { name: 'Kilos Brutos', selector: row => row.Kilos_Bruto.toFixed(3), sortable: true, right: true, width: '10%', style: { fontSize: '12px' } },
//         {
//             name: 'Tipo', selector: row => row.Tipo, sortable: true, width: '5%',
//             cell: row => {
//                 let badgeColor = 'secondary';
//                 if (row.Tipo === 'Sobrante') badgeColor = 'warning';
//                 if (row.Tipo === 'Scrap') badgeColor = 'danger';
//                 if (row.Tipo === 'SO') badgeColor = 'success';
//                 return <span className={`badge bg-${badgeColor}`} style={{ fontSize: '10px' }}>{row.Tipo}</span>;
//             }
//         }
//     ], [verDefectosSobreorden]);

//     const customStyles = {
//         headCells: { style: { fontSize: '12px', fontWeight: 'bold', backgroundColor: theme === 'dark' ? '#343a40' : '#e9ecef', color: theme === 'dark' ? '#FFFFFF' : '#495057', borderBottom: '2px solid #dee2e6', padding: '10px 8px' } },
//         rows: { style: { minHeight: '44px', cursor: 'pointer', fontSize: '12px', '&:hover': { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(0,123,255,.05)' } } },
//         cells: { style: { padding: '6px 8px' } }
//     };

//     return (
//         <>
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="row mb-3">
//                         <div className="col-sm-6"><h1 className="m-0"><b>REGISTRACIÓN CALIDAD - Operaciones Pendientes</b></h1></div>
//                         <div className="col-sm-6">
//                             <div className="float-right">
//                                 <div className="d-flex align-items-center justify-content-end gap-3">
//                                     <Form.Check
//                                         type="checkbox"
//                                         id="verDefectosSobreorden"
//                                         label={<span className="fw-bold"><i className="fas fa-exclamation-triangle me-1"></i> Ver Defectos Sobreorden</span>}
//                                         checked={verDefectosSobreorden} // ✅ CONTROLADO
//                                         onChange={(e) => {
//                                             console.log('🔘 [Calidad] Checkbox cambiado a:', e.target.checked);
//                                             setVerDefectosSobreorden(e.target.checked);
//                                         }}
//                                         className="fs-6"
//                                         style={{ minWidth: '250px' }}
//                                     />
//                                     <div className="d-flex align-items-center">
//                                         <i className="fas fa-user-circle fa-lg me-2 text-primary"></i>
//                                         <span className="fw-bold">Usuario: <span className="text-primary">{usuarioActual}</span></span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
            
//             <div className="content">
//                 <div className="container-fluid">
//                     <Card className={theme === 'dark' ? 'bg-dark text-white' : ''}>
//                         <Card.Body>
//                             {error && <Alert variant="danger">{error}</Alert>}
//                             <Row className="mb-3">
//                                 <Col md={3}>
//                                     <Form.Group>
//                                         <Form.Label className="fw-bold"><i className="fas fa-filter me-1"></i> Filtrar por Máquina:</Form.Label>
//                                         <Form.Select value={maquinaFiltro} onChange={(e) => setMaquinaFiltro(e.target.value)} size="sm">
//                                             <option value="TODAS">TODAS</option>
//                                             <option value="SL1">SL1</option>
//                                             <option value="SL2">SL2</option>
//                                             <option value="SL3">SL3</option>
//                                             <option value="PL1">PL1</option>
//                                             <option value="PL2">PL2</option>
//                                             <option value="PL3">PL3</option>
//                                             <option value="EMB">EMB</option>
//                                         </Form.Select>
//                                     </Form.Group>
//                                 </Col>
//                             </Row>
//                             <div style={{ width: '100%', overflow: 'hidden' }}>
//                                 <DataTable
//                                     columns={columns} data={operaciones} progressPending={loading}
//                                     progressComponent={<div className="py-5 text-center"><Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} /><p className="mt-2 mb-0">Cargando operaciones...</p></div>}
//                                     noDataComponent={<div className='py-5 text-center text-muted'><i className="fas fa-inbox fa-3x mb-3 d-block"></i>No hay operaciones pendientes de calidad</div>}
//                                     customStyles={customStyles} pagination paginationPerPage={10} paginationRowsPerPageOptions={[10, 20, 50, 100]}
//                                     paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de', noRowsPerPage: false, selectAllRowsItem: true, selectAllRowsItemText: 'Todas' }}
//                                     striped highlightOnHover theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//                                     onRowClicked={handleRowClick} responsive={false}
//                                     style={{ fontSize: '12px', border: '1px solid #dee2e6', borderRadius: '4px', width: '100%', tableLayout: 'fixed' }}
//                                 />
//                             </div>
//                         </Card.Body>
//                     </Card>
//                 </div>
//             </div>

//             {/* <CalidadModal
//                 show={showModal}
//                 onHide={() => setShowModal(false)}
//                 operacion={operacionSeleccionada}
//                 verDefectosSobreorden={verDefectosSobreorden} // ✅ PASADO CORRECTAMENTE
//                 onSuccess={handleModalSuccess}
//             /> */}
//             <CalidadModal
//                 key={`modal-${verDefectosSobreorden}`}  // ✅ AGREGAR ESTO
//                 show={showModal}
//                 onHide={() => setShowModal(false)}
//                 operacion={operacionSeleccionada}
//                 verDefectosSobreorden={verDefectosSobreorden}
//                 onSuccess={handleModalSuccess}
//             />
//         </>
//     );
// };

// export default Calidad;


































// /src/pages/Calidad.jsx

import React, { useState, useEffect, useMemo, useContext } from 'react';
import DataTable, { createTheme } from 'react-data-table-component';
import { Card, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import CalidadModal from '../components/Calidad/CalidadModal';

createTheme('adminLteDark', {
    text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
    background: { default: '#343a40' },
    divider: { default: '#454d55' },
    action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
    striped: { default: '#3a4047', text: '#FFFFFF' },
    highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
}, 'dark');

const Calidad = () => {
    const { theme } = useContext(ThemeContext);
    const { user } = useAuth();
    
    const usuarioActual = useMemo(() => {
        if (!user) return 'admin';
        if (typeof user === 'string') return user;
        return user?.username || user?.nombre || user?.userName || user?.name || 'admin';
    }, [user]);
    
    const [operaciones, setOperaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [verDefectosSobreorden, setVerDefectosSobreorden] = useState(false);
    const [maquinaFiltro, setMaquinaFiltro] = useState('TODAS');
    const [showModal, setShowModal] = useState(false);
    const [operacionSeleccionada, setOperacionSeleccionada] = useState(null);

    // 1) Un solo F5 al entrar
    useEffect(() => {
        const key = 'calidad_refreshed';

        if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, '1');
            window.location.reload();
            return;
        }
        // Si la key existe → ya se hizo el F5, no hacer nada más aquí
    }, []);

    // 2) Cargar datos (y cuando cambian filtros)
    useEffect(() => {
        if (sessionStorage.getItem('calidad_refreshed') !== '1') return;
        cargarOperaciones();
    }, [verDefectosSobreorden, maquinaFiltro]);

    // 3) Al salir de la página (SPA) borrar la key; en F5 el timer se cancela solo
    useEffect(() => {
        return () => {
            setTimeout(() => {
                sessionStorage.removeItem('calidad_refreshed');
                sessionStorage.removeItem('calidad_reloading'); // por si quedó basura
            }, 0);
        };
    }, []);

    const cargarOperaciones = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/calidad/operaciones-pendientes', {
                params: { maquina: maquinaFiltro, verDefectosSobreorden: verDefectosSobreorden }
            });
            setOperaciones(response.data);
        } catch (err) {
            console.error('Error al cargar operaciones:', err);
            setError('Error al cargar operaciones: ' + (err.response?.data?.error || err.message));
            setOperaciones([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (row) => {
        console.log(' [Calidad] Fila seleccionada:', row);
        setOperacionSeleccionada(row);
        setShowModal(true);
    };

    const handleModalSuccess = () => {
        cargarOperaciones();
    };

    const columns = useMemo(() => [
        { name: 'Máquina', selector: row => row.Maquina, sortable: true, width: '8%', style: { fontWeight: 'bold', fontSize: '12px' } },
        { name: 'Tarea', selector: row => row.Tarea, sortable: true, width: '12%', style: { fontSize: '12px' } },
        { name: 'Nro. Batch', selector: row => row.NroBatch, sortable: true, width: '10%', style: { fontSize: '12px' } },
        { name: 'Cuchillas', selector: row => row.Cuchillas, sortable: true, width: '15%', style: { fontSize: '12px' } },
        { name: 'Serie/Lote Saliente', selector: row => row.SerieLote, sortable: true, width: '18%', style: { fontSize: '12px' } },
        { name: 'Nro. Operación', selector: row => row.NroOperacion, sortable: true, width: '12%', style: { fontSize: '11px' } },
        { 
            name: verDefectosSobreorden ? 'Kgs. SobreOrden' : 'Kgs. Calidad',
            selector: row => verDefectosSobreorden 
                ? row.Kilos_Sobreorden.toFixed(3) 
                : row.Kilos_Calidad.toFixed(3),
            sortable: true, right: true, width: '10%', style: { fontWeight: 'bold', color: '#0d6efd', fontSize: '12px' }
        },
        { name: 'Kilos Brutos', selector: row => row.Kilos_Bruto.toFixed(3), sortable: true, right: true, width: '10%', style: { fontSize: '12px' } },
        {
            name: 'Tipo', selector: row => row.Tipo, sortable: true, width: '5%',
            cell: row => {
                let badgeColor = 'secondary';
                if (row.Tipo === 'Sobrante') badgeColor = 'warning';
                if (row.Tipo === 'Scrap') badgeColor = 'danger';
                if (row.Tipo === 'SO') badgeColor = 'success';
                return <span className={`badge bg-${badgeColor}`} style={{ fontSize: '10px' }}>{row.Tipo}</span>;
            }
        }
    ], [verDefectosSobreorden]);

    const customStyles = {
        headCells: { style: { fontSize: '12px', fontWeight: 'bold', backgroundColor: theme === 'dark' ? '#343a40' : '#e9ecef', color: theme === 'dark' ? '#FFFFFF' : '#495057', borderBottom: '2px solid #dee2e6', padding: '10px 8px' } },
        rows: { style: { minHeight: '44px', cursor: 'pointer', fontSize: '12px', '&:hover': { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(0,123,255,.05)' } } },
        cells: { style: { padding: '6px 8px' } }
    };

    return (
        <>
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-3">
                        <div className="col-sm-6"><h1 className="m-0"><b>REGISTRACIÓN CALIDAD - Operaciones Pendientes</b></h1></div>
                        <div className="col-sm-6">
                            <div className="float-right">
                                <div className="d-flex align-items-center justify-content-end gap-3">
                                    <Form.Check
                                        type="checkbox"
                                        id="verDefectosSobreorden"
                                        label={<span className="fw-bold"><i className="fas fa-exclamation-triangle me-1"></i> Ver Defectos Sobreorden</span>}
                                        checked={verDefectosSobreorden}
                                        onChange={(e) => setVerDefectosSobreorden(e.target.checked)}
                                        className="fs-6"
                                        style={{ minWidth: '250px' }}
                                    />
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-user-circle fa-lg me-2 text-primary"></i>
                                        <span className="fw-bold">Usuario: <span className="text-primary">{usuarioActual}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="content">
                <div className="container-fluid">
                    <Card className={theme === 'dark' ? 'bg-dark text-white' : ''}>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Row className="mb-3">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold"><i className="fas fa-filter me-1"></i> Filtrar por Máquina:</Form.Label>
                                        <Form.Select value={maquinaFiltro} onChange={(e) => setMaquinaFiltro(e.target.value)} size="sm">
                                            <option value="TODAS">TODAS</option>
                                            <option value="SL1">SL1</option>
                                            <option value="SL2">SL2</option>
                                            <option value="SL3">SL3</option>
                                            <option value="PL1">PL1</option>
                                            <option value="PL2">PL2</option>
                                            <option value="PL3">PL3</option>
                                            <option value="EMB">EMB</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div style={{ width: '100%', overflow: 'hidden' }}>
                                <DataTable
                                    columns={columns} data={operaciones} progressPending={loading}
                                    progressComponent={<div className="py-5 text-center"><Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} /><p className="mt-2 mb-0">Cargando operaciones...</p></div>}
                                    noDataComponent={<div className='py-5 text-center text-muted'><i className="fas fa-inbox fa-3x mb-3 d-block"></i>No hay operaciones pendientes de calidad</div>}
                                    customStyles={customStyles} pagination paginationPerPage={10} paginationRowsPerPageOptions={[10, 20, 50, 100]}
                                    paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de', noRowsPerPage: false, selectAllRowsItem: true, selectAllRowsItemText: 'Todas' }}
                                    striped highlightOnHover theme={theme === 'dark' ? 'adminLteDark' : 'default'}
                                    onRowClicked={handleRowClick} responsive={false}
                                    style={{ fontSize: '12px', border: '1px solid #dee2e6', borderRadius: '4px', width: '100%', tableLayout: 'fixed' }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* ✅ RENDERIZADO CONDICIONAL: Garantiza que el Modal se destruya y limpie el DOM al cerrarse */}
            {showModal && operacionSeleccionada && (
                <CalidadModal
                    key={`modal-${verDefectosSobreorden}-${operacionSeleccionada.Operacion_ID}`}
                    show={true} // Siempre true porque el componente solo existe cuando se muestra
                    onHide={() => setShowModal(false)}
                    operacion={operacionSeleccionada}
                    verDefectosSobreorden={verDefectosSobreorden}
                    onSuccess={handleModalSuccess}
                />
            )}
        </>
    );
};

export default Calidad;
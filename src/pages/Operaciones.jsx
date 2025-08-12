// import React from "react";

// const Operaciones = () => {
//   return (
//     <>
//       <div className="content-header">
//         <div className="container-fluid">
//           <h1 className="m-0">Operaciones Varias</h1>
//         </div>
//       </div>
//       <div className="content">
//         <div className="container-fluid">
//           <p>Aquí iría la información de la Operaciones.</p>
//         </div>
//       </div>
//     </>
//   );
// };
// export default Operaciones;





// // src/pages/Operaciones.jsx

// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import maquinas from '../data/maquinas.json';

// // Tema oscuro para la tabla (opcional, si lo usas en tu proyecto)
// createTheme('adminLteDark', {
//   text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//   background: { default: '#343a40' },
//   divider: { default: '#454d55' },
//   action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//   striped: { default: '#3a4047', text: '#FFFFFF' },
//   highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// const Operaciones = () => {
//     const { maquinaId } = useParams();
//     const navigate = useNavigate();
//     const { theme } = useContext(ThemeContext);
//     const { user } = useAuth();

//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [toggleCleared, setToggleCleared] = useState(false);

//     const maquinaInfo = useMemo(() => maquinas.find(m => m.id === maquinaId) || { nombre: 'Desconocida' }, [maquinaId]);

//     const fetchOperaciones = async () => {
//         if (!maquinaId) return;
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/operaciones/${maquinaId}`);
//             setOperaciones(response.data);
//         } catch (error) {
//             Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error');
//             setOperaciones([]); // Limpiar en caso de error
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     useEffect(() => {
//         fetchOperaciones();
//         const interval = setInterval(fetchOperaciones, 300000); // Polling cada 5 minutos
//         return () => clearInterval(interval); // Limpieza al desmontar
//     }, [maquinaId]);

//     const handleRowSelected = React.useCallback(state => {
//         setSelectedRows(state.selectedRows);
//     }, []);

//     const handleProcesar = async () => {
//         if (selectedRows.length === 0) {
//             Swal.fire('Atención', 'Debe seleccionar al menos una operación para procesar.', 'warning');
//             return;
//         }

//         // Validación específica para Slitter y Embalaje, como en el código VB.NET
//         if (maquinaId.startsWith('SL')) {
//             const firstSerieLote = selectedRows[0].Origen_Lote.substring(0, 11);
//             if (!selectedRows.every(row => row.Origen_Lote.substring(0, 11) === firstSerieLote)) {
//                  Swal.fire('Error de validación', 'Para Slitter, todas las operaciones seleccionadas deben ser de la misma SERIE/LOTE.', 'error');
//                  return;
//             }
//         }
//         if (maquinaId === 'EMB') {
//             const firstSerie = selectedRows[0].Origen_Lote.substring(0, 5);
//             const firstPedido = selectedRows[0].NumeroPedido;
//             let esValido = true;
//             for(const row of selectedRows) {
//                 if (row.Origen_Lote.substring(0, 5) !== firstSerie) {
//                     esValido = false;
//                     break;
//                 }
//                 if (row.NumeroPedido !== firstPedido) {
//                     // Si los pedidos son diferentes, la serie/lote completa debe ser idéntica
//                     if (row.Origen_Lote.substring(0, 11) !== selectedRows[0].Origen_Lote.substring(0, 11)) {
//                          esValido = false;
//                          break;
//                     }
//                 }
//             }
//             if(!esValido) {
//                 Swal.fire('Error de validación', 'Para Embalaje, las operaciones deben ser de la misma SERIE y PEDIDO, o de la misma SERIE/LOTE si son de pedidos distintos.', 'error');
//                 return;
//             }
//         }
        
//         const operacionesNombres = selectedRows.map(r => r.NumeroDocumento).join(' / ');

//         Swal.fire({
//             title: 'Confirmar Multi-Operación',
//             html: `Se procesarán las siguientes operaciones:<br><b>${operacionesNombres}</b><br>¿Desea continuar?`,
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Sí, procesar',
//             cancelButtonText: 'Cancelar'
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 const operacionesData = selectedRows.map(r => ({
//                     id: r.Operacion_ID,
//                     nroBatch: r.NroBatch
//                 }));

//                 try {
//                     const response = await axiosInstance.post('/registracion/operaciones/procesar', {
//                         operacionesData,
//                         usuario: user.nombre,
//                         maquinaId: maquinaId
//                     });
//                     Swal.fire('Éxito', `Multi-Operación #${response.data.multiOperacionId} creada.`, 'success');
//                     setToggleCleared(!toggleCleared);
//                     setSelectedRows([]);
//                     await fetchOperaciones(); // Refrescar la tabla
//                     // Opcional: navegar a la página de detalle de la multi-operación
//                     // navigate(`/registracion/detalle/multi/${response.data.multiOperacionId}`);
//                 } catch (error) {
//                     Swal.fire('Error', error.response?.data?.error || 'No se pudo procesar la selección.', 'error');
//                 }
//             }
//         });
//     };

//     const formatCustomDate = (dateString) => {
//         if (!dateString || typeof dateString !== 'string' || dateString.length < 12) return 'N/A';
//         try {
//           const year = dateString.substring(0, 4); const month = dateString.substring(4, 6); const day = dateString.substring(6, 8);
//           const hour = dateString.substring(8, 10); const minute = dateString.substring(10, 12);
//           return `${day}/${month}/${year} ${hour}:${minute}`;
//         } catch (e) { return 'Fecha Inválida'; }
//       };

//     const columns = useMemo(() => [
//         { name: 'Nº Op.', selector: row => row.NumeroDocumento, sortable: true, width: '120px', wrap: true },
//         { name: 'Serie/Lote', selector: row => row.Origen_Lote.substring(0, 11), sortable: true, width: '110px' },
//         { name: 'Prog.', selector: row => parseFloat(row.KilosProgramadosEntrantes || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Stock', selector: row => parseFloat(row.Stock || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Batch', selector: row => row.NroBatch, sortable: true, width: '90px' },
//         { name: 'Balanza', selector: row => parseFloat(row.Kilos_Balanza || 0).toFixed(0), sortable: true, right: true, width: '90px' },
//         { name: 'Abas.', cell: row => row.Abastecida === '0' ? 'OK' : '', width: '70px', center: true },
//         { name: 'Op. Ant.', cell: row => row.OpAnterior.startsWith('OK') ? 'OK' : '', width: '80px', center: true },
//         { name: 'Cortes', selector: row => row.Operacion_Cuchillas, grow: 2, wrap: true },
//         { name: 'Fecha Inicio', selector: row => row.batch_FechaInicio, format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, width: '170px' },
//         { name: 'Tarea', selector: row => row.Tarea, sortable: true, wrap: true },
//         { 
//             name: 'Consulta',
//             cell: row => <button className="btn btn-sm btn-info" onClick={() => navigate(`/registracion/detalle/${row.Operacion_ID}`)}>Ver</button>,
//             ignoreRowClick: true,
//             allowOverflow: true,
//             button: true,
//             center: true
//         }
//     ], [navigate]);

//     const conditionalRowStyles = [
//         { when: row => row.status === 'BLOQUEADA', style: { backgroundColor: 'var(--danger)', color: 'white' } },
//         { when: row => row.status === 'LISTA', style: { backgroundColor: 'var(--success)', color: 'white' } },
//         { when: row => row.status === 'EN_PROCESO', style: { backgroundColor: 'var(--secondary)', color: 'white' } },
//         { when: row => row.status === 'EN_CALIDAD' || row.status === 'CALIDAD_DICTAMINADA', style: { backgroundColor: 'var(--warning)', color: 'black' } },
//         { when: row => row.status === 'SUSPENDIDA', style: { backgroundColor: '#e9ecef', color: 'black' } },
//     ];

//     return (
//         <>
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="d-flex justify-content-between align-items-center">
//                         <h1><b>SRP - Operaciones Pendientes {maquinaInfo.nombre}</b></h1>
//                         <button className="btn btn-secondary" onClick={() => navigate('/registracion')}>
//                             <i className="fas fa-arrow-left mr-2"></i>Volver a Máquinas
//                         </button>
//                     </div>
//                 </div>
//             </div>
//             <div className="content">
//                 <div className="container-fluid">
//                     <div className="card card-primary card-outline">
//                         <div className="card-body p-0">
//                             <DataTable
//                                 columns={columns}
//                                 data={operaciones}
//                                 progressPending={loading}
//                                 progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div>}
//                                 noDataComponent={<div className='py-5 text-center text-muted'>No hay operaciones pendientes para esta máquina.</div>}
//                                 pagination
//                                 paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
//                                 striped
//                                 highlightOnHover
//                                 selectableRows
//                                 onSelectedRowsChange={handleRowSelected}
//                                 clearSelectedRows={toggleCleared}
//                                 conditionalRowStyles={conditionalRowStyles}
//                                 theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//                             />
//                         </div>
//                         <div className="card-footer text-right">
//                            <button className="btn btn-primary btn-lg" onClick={handleProcesar} disabled={selectedRows.length === 0 || loading}>
//                                 PROCESAR SELECCIÓN
//                            </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Operaciones;









// // src/pages/Operaciones.jsx

// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import maquinas from '../data/maquinas.json';

// // Tema oscuro para la tabla
// createTheme('adminLteDark', {
//   text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//   background: { default: '#343a40' },
//   divider: { default: '#454d55' },
//   action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//   striped: { default: '#3a4047', text: '#FFFFFF' },
//   highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// // Componente para el icono de Calidad
// const CaliIcon = ({ iconType }) => {
//     const styles = {
//         width: '24px', height: '24px',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         borderRadius: '4px', color: 'white'
//     };
//     switch (iconType) {
//         case 'rojo-fondo': return <div style={{...styles, backgroundColor: 'red'}}></div>;
//         case 'verde-fondo': return <div style={{...styles, backgroundColor: 'green'}}></div>;
//         case 'gris-fondo': return <div style={{...styles, backgroundColor: 'grey'}}></div>;
//         case 'blanco-fondo': return <div style={{...styles, backgroundColor: 'white'}}></div>;
//         case 'rojo-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-times-circle text-danger"></i></div>;
//         case 'verde-tilde-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-check-circle text-success"></i></div>;
//         default: return null;
//     }
// };

// const Operaciones = () => {
//     const { maquinaId } = useParams();
//     const navigate = useNavigate();
//     const { theme } = useContext(ThemeContext);
//     const { user } = useAuth();

//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [toggleCleared, setToggleCleared] = useState(false);

//     const maquinaInfo = useMemo(() => maquinas.find(m => m.id === maquinaId) || { nombre: 'Desconocida' }, [maquinaId]);

//     const fetchOperaciones = async () => {
//         if (!maquinaId) return;
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/operaciones/${maquinaId}`);
//             setOperaciones(response.data);
//         } catch (error) {
//             Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error');
//             setOperaciones([]);
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     useEffect(() => {
//         fetchOperaciones();
//         const interval = setInterval(fetchOperaciones, 300000);
//         return () => clearInterval(interval);
//     }, [maquinaId]);

//     const handleRowSelected = React.useCallback(state => {
//         setSelectedRows(state.selectedRows);
//     }, []);

//     const handleProcesar = async () => {
//          // Lógica de procesar sin cambios...
//          if (selectedRows.length === 0) {
//             Swal.fire('Atención', 'Debe seleccionar al menos una operación para procesar.', 'warning');
//             return;
//         }

//         if (maquinaId.startsWith('SL')) {
//             const firstSerieLote = selectedRows[0].Origen_Lote.substring(0, 11);
//             if (!selectedRows.every(row => row.Origen_Lote.substring(0, 11) === firstSerieLote)) {
//                  Swal.fire('Error de validación', 'Para Slitter, todas las operaciones seleccionadas deben ser de la misma SERIE/LOTE.', 'error');
//                  return;
//             }
//         }
//         if (maquinaId === 'EMB') {
//             const firstSerie = selectedRows[0].Origen_Lote.substring(0, 5);
//             const firstPedido = selectedRows[0].NumeroPedido;
//             let esValido = true;
//             for(const row of selectedRows) {
//                 if (row.Origen_Lote.substring(0, 5) !== firstSerie) {
//                     esValido = false; break;
//                 }
//                 if (row.NumeroPedido !== firstPedido && row.Origen_Lote.substring(0, 11) !== selectedRows[0].Origen_Lote.substring(0, 11)) {
//                     esValido = false; break;
//                 }
//             }
//             if(!esValido) {
//                 Swal.fire('Error de validación', 'Para Embalaje, las operaciones deben ser de la misma SERIE y PEDIDO, o de la misma SERIE/LOTE si son de pedidos distintos.', 'error');
//                 return;
//             }
//         }
        
//         const operacionesNombres = selectedRows.map(r => r.NumeroDocumento).join(' / ');

//         Swal.fire({
//             title: 'Confirmar Multi-Operación',
//             html: `Se procesarán las siguientes operaciones:<br><b>${operacionesNombres}</b><br>¿Desea continuar?`,
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Sí, procesar',
//             cancelButtonText: 'Cancelar'
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 const operacionesData = selectedRows.map(r => ({
//                     id: r.Operacion_ID,
//                     nroBatch: r.NroBatch
//                 }));

//                 try {
//                     const response = await axiosInstance.post('/registracion/operaciones/procesar', {
//                         operacionesData,
//                         usuario: user.nombre,
//                         maquinaId: maquinaId
//                     });
//                     Swal.fire('Éxito', `Multi-Operación #${response.data.multiOperacionId} creada.`, 'success');
//                     setToggleCleared(!toggleCleared);
//                     setSelectedRows([]);
//                     await fetchOperaciones();
//                 } catch (error) {
//                     Swal.fire('Error', error.response?.data?.error || 'No se pudo procesar la selección.', 'error');
//                 }
//             }
//         });
//     };

//     // Formato de fecha corregido para incluir segundos si están disponibles
//     const formatCustomDate = (dateString) => {
//         if (!dateString || typeof dateString !== 'string' || dateString.length < 12) return 'N/A';
//         try {
//           const year = dateString.substring(0, 4); 
//           const month = dateString.substring(4, 6); 
//           const day = dateString.substring(6, 8);
//           const hour = dateString.substring(8, 10); 
//           const minute = dateString.substring(10, 12);
//           const second = dateString.length >= 14 ? dateString.substring(12, 14) : '00';
//           return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
//         } catch (e) { return 'Fecha Inválida'; }
//     };

//     const columns = useMemo(() => [
//         // Orden de columnas ajustado para coincidir con la imagen original
//         { name: 'Nº Op.', selector: row => row.NumeroDocumento, sortable: true, width: '150px', wrap: true },
//         { name: 'Serie/Lote', selector: row => row.Origen_Lote.substring(0, 11), sortable: true, width: '110px' },
//         { name: 'Nro. MultiOp', selector: row => row.NumeroMultiOperacion, sortable: true, width: '110px' },
//         { 
//             name: 'Cortes', 
//             selector: row => row.Operacion_Cuchillas, 
//             width: '150px', // <-- Añadimos esto para fijar el ancho
//             style: {
//                 whiteSpace: 'nowrap',
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//             } 
//         },
//         { name: 'Prog', selector: row => parseFloat(row.KilosProgramadosEntrantes || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Stock', selector: row => parseFloat(row.Stock || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Batch', selector: row => row.NroBatch, sortable: true, width: '90px' },
//         { name: 'Balanza', selector: row => parseFloat(row.Kilos_Balanza || 0).toFixed(0), sortable: true, right: true, width: '90px' },
//         { name: 'Abas', cell: row => row.Abastecida === '0' ? 'OK' : '', width: '70px', center: true },
//         { name: 'Op.Ant.', cell: row => row.OpAnterior.startsWith('OK') ? row.OpAnterior : '', width: '80px', center: true },
//         { name: 'Cali', cell: row => <CaliIcon iconType={row.caliIcon} />, width: '60px', center: true },
//         { name: 'Ancho', selector: row => row.Ancho, sortable: true, width: '80px', right: true },
//         { name: 'Flia.', selector: row => row.Familia, sortable: true, width: '70px', center: true },
//         { name: 'Esp.', selector: row => row.Espesor, sortable: true, width: '70px', right: true },
//         { name: 'Fecha Inicio', selector: row => row.batch_FechaInicio, format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, width: '170px' },
//         { name: 'Consulta', cell: row => <button className="btn btn-sm btn-info" onClick={() => navigate(`/registracion/detalle/${row.Operacion_ID}`)}>Ver</button>, ignoreRowClick: true, center: true },
//         { name: 'Tarea', selector: row => row.Tarea, sortable: true, wrap: true },
//         { name: 'Paq/Ata', selector: row => row.Paquetes, sortable: true, width: '80px', center: true },
//         { name: 'Hoj/Roll', selector: row => row.Rollos, sortable: true, width: '80px', center: true },
//     ], [navigate]);


//     const conditionalRowStyles = [
//     {
//         when: row => {
//             const isMatch = row.status === 'BLOQUEADA';
//             if (isMatch) {
//                 console.log(`%cFila Operación ${row.NumeroDocumento}`, 'font-weight: bold; color: red');
//                 console.log('Variables:', {
//                     status: row.status,
//                     Abastecida: row.Abastecida,
//                     OpAnterior: row.OpAnterior,
//                     Stock: row.Stock,
//                     Suspendida: row.Suspendida,
//                     Estado: row.Estado,
//                     Calidad: row.caliIcon,
//                     TieneMultiOp: !!row.NumeroMultiOperacion
//                 });
//                 console.log(`Color asignado: Rojo (#dc3545) - BLOQUEADA\n`);
//             }
//             return isMatch;
//         },
//         style: { backgroundColor: '#dc3545', color: 'white' }
//     },
//     {
//         when: row => {
//             const isMatch = row.status === 'LISTA';
//             if (isMatch) {
//                 console.log(`%cFila Operación ${row.NumeroDocumento}`, 'font-weight: bold; color: green');
//                 console.log('Variables:', {
//                     status: row.status,
//                     Abastecida: row.Abastecida,
//                     OpAnterior: row.OpAnterior,
//                     Stock: row.Stock,
//                     Suspendida: row.Suspendida,
//                     Estado: row.Estado,
//                     Calidad: row.caliIcon,
//                     TieneMultiOp: !!row.NumeroMultiOperacion
//                 });
//                 console.log(`Color asignado: Verde (#28a745) - LISTA\n`);
//             }
//             return isMatch;
//         },
//         style: { backgroundColor: '#28a745', color: 'white' }
//     },
//     {
//         when: row => {
//             const isMatch = row.status === 'EN_PROCESO';
//             if (isMatch) {
//                 console.log(`%cFila Operación ${row.NumeroDocumento}`, 'font-weight: bold; color: grey');
//                 console.log('Variables:', {
//                     status: row.status,
//                     Abastecida: row.Abastecida,
//                     OpAnterior: row.OpAnterior,
//                     Stock: row.Stock,
//                     Suspendida: row.Suspendida,
//                     Estado: row.Estado,
//                     Calidad: row.caliIcon,
//                     TieneMultiOp: !!row.NumeroMultiOperacion
//                 });
//                 console.log(`Color asignado: Gris (#6c757d) - EN_PROCESO\n`);
//             }
//             return isMatch;
//         },
//         style: { backgroundColor: '#6c757d', color: 'white' }
//     },
//     {
//         when: row => {
//             const isMatch = row.status === 'EN_CALIDAD' || row.status === 'CALIDAD_DICTAMINADA';
//             if (isMatch) {
//                 console.log(`%cFila Operación ${row.NumeroDocumento}`, 'font-weight: bold; color: #cc9900');
//                 console.log('Variables:', {
//                     status: row.status,
//                     Abastecida: row.Abastecida,
//                     OpAnterior: row.OpAnterior,
//                     Stock: row.Stock,
//                     Suspendida: row.Suspendida,
//                     Estado: row.Estado,
//                     Calidad: row.caliIcon,
//                     TieneMultiOp: !!row.NumeroMultiOperacion
//                 });
//                 console.log(`Color asignado: Amarillo (#ffc107) - EN_CALIDAD / DICTAMINADA\n`);
//             }
//             return isMatch;
//         },
//         style: { backgroundColor: '#ffc107', color: 'black' }
//     },
//     {
//         when: row => {
//             const isMatch = row.status === 'SUSPENDIDA';
//             if (isMatch) {
//                 console.log(`%cFila Operación ${row.NumeroDocumento}`, 'font-weight: bold; color: #555');
//                 console.log('Variables:', {
//                     status: row.status,
//                     Abastecida: row.Abastecida,
//                     OpAnterior: row.OpAnterior,
//                     Stock: row.Stock,
//                     Suspendida: row.Suspendida,
//                     Estado: row.Estado,
//                     Calidad: row.caliIcon,
//                     TieneMultiOp: !!row.NumeroMultiOperacion
//                 });
//                 console.log(`Color asignado: Gris claro (#e9ecef) - SUSPENDIDA\n`);
//             }
//             return isMatch;
//         },
//         style: { backgroundColor: '#e9ecef', color: 'black' }
//     }
// ];


//     return (
//         <>
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="d-flex justify-content-between align-items-center">
//                         <h1><b>SRP - Operaciones Pendientes {maquinaInfo.nombre}</b></h1>
//                         <button className="btn btn-secondary" onClick={() => navigate('/registracion')}>
//                             <i className="fas fa-arrow-left mr-2"></i>Volver a Máquinas
//                         </button>
//                     </div>
//                 </div>
//             </div>
//             <div className="content">
//                 <div className="container-fluid">
//                     <div className="card card-primary card-outline">
//                         <div className="card-body p-0">
//                             <DataTable
//                                 columns={columns}
//                                 data={operaciones}
//                                 progressPending={loading}
//                                 progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div>}
//                                 noDataComponent={<div className='py-5 text-center text-muted'>No hay operaciones pendientes para esta máquina.</div>}
//                                 pagination
//                                 paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
//                                 striped
//                                 highlightOnHover
//                                 selectableRows
//                                 onSelectedRowsChange={handleRowSelected}
//                                 clearSelectedRows={toggleCleared}
//                                 conditionalRowStyles={conditionalRowStyles}
//                                 theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//                             />
//                         </div>
//                         <div className="card-footer text-right">
//                            <button className="btn btn-primary btn-lg" onClick={handleProcesar} disabled={selectedRows.length === 0 || loading}>
//                                 PROCESAR
//                            </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Operaciones;











// src/pages/Operaciones.jsx

import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable, { createTheme } from 'react-data-table-component';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import maquinas from '../data/maquinas.json';

// Tema oscuro para la tabla
createTheme('adminLteDark', {
  text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
  background: { default: '#343a40' },
  divider: { default: '#454d55' },
  action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
  striped: { default: '#3a4047', text: '#FFFFFF' },
  highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
}, 'dark');

// Componente para el icono de Calidad (ACTUALIZADO)
const CaliIcon = ({ iconType }) => {
    const styles = {
        width: '24px', height: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '4px', color: 'white'
    };
    switch (iconType) {
        case 'rojo-fondo': return <div style={{...styles, backgroundColor: 'red'}}></div>;
        case 'verde-fondo': return <div style={{...styles, backgroundColor: 'green'}}></div>;
        case 'gris-fondo': return <div style={{...styles, backgroundColor: 'grey'}}></div>;
        case 'amarillo-fondo': return <div style={{...styles, backgroundColor: 'yellow'}}></div>; // <-- AÑADIDO
        case 'blanco-fondo': return <div style={{...styles, backgroundColor: 'white'}}></div>;
        case 'rojo-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-times-circle text-danger"></i></div>;
        case 'verde-tilde-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-check-circle text-success"></i></div>;
        default: return null;
    }
};

const Operaciones = () => {
    const { maquinaId } = useParams();
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const { user } = useAuth();

    const [operaciones, setOperaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [toggleCleared, setToggleCleared] = useState(false);

    const maquinaInfo = useMemo(() => maquinas.find(m => m.id === maquinaId) || { nombre: 'Desconocida' }, [maquinaId]);

    const fetchOperaciones = async () => {
        if (!maquinaId) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/registracion/operaciones/${maquinaId}`);
            setOperaciones(response.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error');
            setOperaciones([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchOperaciones();
        const interval = setInterval(fetchOperaciones, 30000); // <-- Ajustado a 30 segundos para pruebas, puedes volver a 300000
        return () => clearInterval(interval);
    }, [maquinaId]);

    const handleRowSelected = React.useCallback(state => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handleProcesar = async () => {
         if (selectedRows.length === 0) {
            Swal.fire('Atención', 'Debe seleccionar al menos una operación para procesar.', 'warning');
            return;
        }

        if (maquinaId.startsWith('SL')) {
            const firstSerieLote = selectedRows[0].Origen_Lote.substring(0, 11);
            if (!selectedRows.every(row => row.Origen_Lote.substring(0, 11) === firstSerieLote)) {
                 Swal.fire('Error de validación', 'Para Slitter, todas las operaciones seleccionadas deben ser de la misma SERIE/LOTE.', 'error');
                 return;
            }
        }
        if (maquinaId === 'EMB') {
            const firstSerie = selectedRows[0].Origen_Lote.substring(0, 5);
            const firstPedido = selectedRows[0].NumeroPedido;
            let esValido = true;
            for(const row of selectedRows) {
                if (row.Origen_Lote.substring(0, 5) !== firstSerie) {
                    esValido = false; break;
                }
                if (row.NumeroPedido !== firstPedido && row.Origen_Lote.substring(0, 11) !== selectedRows[0].Origen_Lote.substring(0, 11)) {
                    esValido = false; break;
                }
            }
            if(!esValido) {
                Swal.fire('Error de validación', 'Para Embalaje, las operaciones deben ser de la misma SERIE y PEDIDO, o de la misma SERIE/LOTE si son de pedidos distintos.', 'error');
                return;
            }
        }
        
        const operacionesNombres = selectedRows.map(r => r.NumeroDocumento).join(' / ');

        Swal.fire({
            title: 'Confirmar Multi-Operación',
            html: `Se procesarán las siguientes operaciones:<br><b>${operacionesNombres}</b><br>¿Desea continuar?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, procesar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const operacionesData = selectedRows.map(r => ({
                    id: r.Operacion_ID,
                    nroBatch: r.NroBatch
                }));

                try {
                    const response = await axiosInstance.post('/registracion/operaciones/procesar', {
                        operacionesData,
                        usuario: user.nombre,
                        maquinaId: maquinaId
                    });
                    Swal.fire('Éxito', `Multi-Operación #${response.data.multiOperacionId} creada.`, 'success');
                    setToggleCleared(!toggleCleared);
                    setSelectedRows([]);
                    await fetchOperaciones();
                } catch (error) {
                    Swal.fire('Error', error.response?.data?.error || 'No se pudo procesar la selección.', 'error');
                }
            }
        });
    };

    const formatCustomDate = (dateString) => {
        if (!dateString || typeof dateString !== 'string' || dateString.length < 12) return 'N/A';
        try {
          const year = dateString.substring(0, 4); 
          const month = dateString.substring(4, 6); 
          const day = dateString.substring(6, 8);
          const hour = dateString.substring(8, 10); 
          const minute = dateString.substring(10, 12);
          const second = dateString.length >= 14 ? dateString.substring(12, 14) : '00';
          return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
        } catch (e) { return 'Fecha Inválida'; }
    };

    const columns = useMemo(() => [
        { name: 'Nº Op.', selector: row => row.NumeroDocumento, sortable: true, width: '150px', wrap: true },
        { name: 'Serie/Lote', selector: row => row.Origen_Lote.substring(0, 11), sortable: true, width: '110px' },
        { name: 'Nro. MultiOp', selector: row => row.NumeroMultiOperacion, sortable: true, width: '110px' },
        { 
            name: 'Cortes', 
            selector: row => row.Operacion_Cuchillas, 
            width: '150px',
            style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } 
        },
        { name: 'Prog', selector: row => parseFloat(row.KilosProgramadosEntrantes || 0).toFixed(0), sortable: true, right: true, width: '80px' },
        { name: 'Stock', selector: row => parseFloat(row.Stock || 0).toFixed(0), sortable: true, right: true, width: '80px' },
        { name: 'Batch', selector: row => row.NroBatch, sortable: true, width: '90px' },
        { name: 'Balanza', selector: row => parseFloat(row.Kilos_Balanza || 0).toFixed(0), sortable: true, right: true, width: '90px' },
        { name: 'Abas', cell: row => row.Abastecida === '0' ? 'OK' : '', width: '70px', center: true },
        { name: 'Op.Ant.', cell: row => row.OpAnterior.startsWith('OK') ? row.OpAnterior : '', width: '80px', center: true },
        { name: 'Cali', cell: row => <CaliIcon iconType={row.caliIcon} />, width: '60px', center: true },
        { name: 'Ancho', selector: row => row.Ancho, sortable: true, width: '80px', right: true },
        { name: 'Flia.', selector: row => row.Familia, sortable: true, width: '70px', center: true },
        { name: 'Esp.', selector: row => row.Espesor, sortable: true, width: '70px', right: true },
        { name: 'Fecha Inicio', selector: row => row.batch_FechaInicio, format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, width: '170px' },
        { name: 'Consulta', cell: row => <button className="btn btn-sm btn-info" onClick={() => navigate(`/registracion/detalle/${row.Operacion_ID}`)}>Ver</button>, ignoreRowClick: true, center: true },
        { name: 'Tarea', selector: row => row.Tarea, sortable: true, wrap: true },
        { name: 'Paq/Ata', selector: row => row.Paquetes, sortable: true, width: '80px', center: true },
        { name: 'Hoj/Roll', selector: row => row.Rollos, sortable: true, width: '80px', center: true },
    ], [navigate]);

    // Estilos condicionales de fila (ACTUALIZADOS)
    const conditionalRowStyles = [
        {
            when: row => row.status === 'BLOQUEADA',
            style: { backgroundColor: '#dc3545', color: 'white' }
        },
        {
            when: row => row.status === 'LISTA',
            style: { backgroundColor: '#28a745', color: 'white' }
        },
        {
            when: row => row.status === 'EN_PROCESO',
            style: { backgroundColor: '#6c757d', color: 'white' }
        },
        {
            // AÑADIDO 'TOLERANCIA_EXCEDIDA' A LA CONDICIÓN
            when: row => row.status === 'EN_CALIDAD' || row.status === 'CALIDAD_DICTAMINADA' || row.status === 'TOLERANCIA_EXCEDIDA',
            style: { backgroundColor: '#ffc107', color: 'black' }
        },
        {
            when: row => row.status === 'SUSPENDIDA',
            style: { backgroundColor: '#e9ecef', color: 'black' }
        }
    ];

    return (
        <>
            <div className="content-header">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1><b>SRP - Operaciones Pendientes {maquinaInfo.nombre}</b></h1>
                        <button className="btn btn-secondary" onClick={() => navigate('/registracion')}>
                            <i className="fas fa-arrow-left mr-2"></i>Volver a Máquinas
                        </button>
                    </div>
                </div>
            </div>
            <div className="content">
                <div className="container-fluid">
                    <div className="card card-primary card-outline">
                        <div className="card-body p-0">
                            <DataTable
                                columns={columns}
                                data={operaciones}
                                progressPending={loading}
                                progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div>}
                                noDataComponent={<div className='py-5 text-center text-muted'>No hay operaciones pendientes para esta máquina.</div>}
                                pagination
                                paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
                                striped
                                highlightOnHover
                                selectableRows
                                onSelectedRowsChange={handleRowSelected}
                                clearSelectedRows={toggleCleared}
                                conditionalRowStyles={conditionalRowStyles}
                                theme={theme === 'dark' ? 'adminLteDark' : 'default'}
                            />
                        </div>
                        <div className="card-footer text-right">
                           <button className="btn btn-primary btn-lg" onClick={handleProcesar} disabled={selectedRows.length === 0 || loading}>
                                PROCESAR
                           </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Operaciones;






// // src/pages/Operaciones.jsx

// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import maquinas from '../data/maquinas.json';

// createTheme('adminLteDark', {
//   text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//   background: { default: '#343a40' },
//   divider: { default: '#454d55' },
//   action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//   striped: { default: '#3a4047', text: '#FFFFFF' },
//   highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// const CaliIcon = ({ iconType }) => {
//     const styles = { width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: 'white' };
//     switch (iconType) {
//         case 'rojo-fondo': return <div style={{...styles, backgroundColor: 'red'}}></div>;
//         case 'verde-fondo': return <div style={{...styles, backgroundColor: 'green'}}></div>;
//         case 'gris-fondo': return <div style={{...styles, backgroundColor: 'grey'}}></div>;
//         case 'blanco-fondo': return <div style={{...styles, backgroundColor: 'white'}}></div>;
//         case 'rojo-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-times-circle text-danger"></i></div>;
//         case 'verde-tilde-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-check-circle text-success"></i></div>;
//         default: return null;
//     }
// };

// const Operaciones = () => {
//     const { maquinaId } = useParams();
//     const navigate = useNavigate();
//     const { theme } = useContext(ThemeContext);
//     const { user } = useAuth();

//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [toggleCleared, setToggleCleared] = useState(false);

//     const maquinaInfo = useMemo(() => maquinas.find(m => m.id === maquinaId) || { nombre: 'Desconocida' }, [maquinaId]);

//     const fetchOperaciones = async () => {
//         if (!maquinaId) return;
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/operaciones/${maquinaId}`);
//             setOperaciones(response.data);
//         } catch (error) {
//             Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error');
//             setOperaciones([]);
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     useEffect(() => {
//         fetchOperaciones();
//         const interval = setInterval(fetchOperaciones, 300000);
//         return () => clearInterval(interval);
//     }, [maquinaId]);

//     const handleRowSelected = React.useCallback(state => {
//         setSelectedRows(state.selectedRows);
//     }, []);

//     const handleProcesar = async () => {
//          if (selectedRows.length === 0) {
//             Swal.fire('Atención', 'Debe seleccionar al menos una operación para procesar.', 'warning');
//             return;
//         }
//         if (maquinaId.startsWith('SL')) {
//             const firstSerieLote = selectedRows[0].Origen_Lote.substring(0, 11);
//             if (!selectedRows.every(row => row.Origen_Lote.substring(0, 11) === firstSerieLote)) {
//                  Swal.fire('Error de validación', 'Para Slitter, todas las operaciones seleccionadas deben ser de la misma SERIE/LOTE.', 'error');
//                  return;
//             }
//         }
//         if (maquinaId === 'EMB') {
//             const firstSerie = selectedRows[0].Origen_Lote.substring(0, 5);
//             const firstPedido = selectedRows[0].NumeroPedido;
//             let esValido = true;
//             for(const row of selectedRows) {
//                 if (row.Origen_Lote.substring(0, 5) !== firstSerie) { esValido = false; break; }
//                 if (row.NumeroPedido !== firstPedido && row.Origen_Lote.substring(0, 11) !== selectedRows[0].Origen_Lote.substring(0, 11)) { esValido = false; break; }
//             }
//             if(!esValido) {
//                 Swal.fire('Error de validación', 'Para Embalaje, las operaciones deben ser de la misma SERIE y PEDIDO, o de la misma SERIE/LOTE si son de pedidos distintos.', 'error');
//                 return;
//             }
//         }
//         const operacionesNombres = selectedRows.map(r => r.NumeroDocumento).join(' / ');
//         Swal.fire({
//             title: 'Confirmar Multi-Operación',
//             html: `Se procesarán las siguientes operaciones:<br><b>${operacionesNombres}</b><br>¿Desea continuar?`,
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6', cancelButtonColor: '#d33',
//             confirmButtonText: 'Sí, procesar', cancelButtonText: 'Cancelar'
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 const operacionesData = selectedRows.map(r => ({ id: r.Operacion_ID, nroBatch: r.NroBatch }));
//                 try {
//                     const response = await axiosInstance.post('/registracion/operaciones/procesar', { operacionesData, usuario: user.nombre, maquinaId: maquinaId });
//                     Swal.fire('Éxito', `Multi-Operación #${response.data.multiOperacionId} creada.`, 'success');
//                     setToggleCleared(!toggleCleared);
//                     setSelectedRows([]);
//                     await fetchOperaciones();
//                 } catch (error) {
//                     Swal.fire('Error', error.response?.data?.error || 'No se pudo procesar la selección.', 'error');
//                 }
//             }
//         });
//     };

//     const formatCustomDate = (dateString) => {
//         if (!dateString || typeof dateString !== 'string' || dateString.length < 12) return 'N/A';
//         try {
//           const year = dateString.substring(0, 4); const month = dateString.substring(4, 6); const day = dateString.substring(6, 8);
//           const hour = dateString.substring(8, 10); const minute = dateString.substring(10, 12); const second = dateString.length >= 14 ? dateString.substring(12, 14) : '00';
//           return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
//         } catch (e) { return 'Fecha Inválida'; }
//     };

//     const columns = useMemo(() => [
//         { name: 'Nº Op.', selector: row => row.NumeroDocumento, sortable: true, width: '120px' },
//         { name: 'Serie/Lote', selector: row => row.Origen_Lote.substring(0, 11), sortable: true, width: '110px' },
//         { name: 'Nro. MultiOp', selector: row => row.NumeroMultiOperacion, sortable: true, width: '110px' },
//         { name: 'Cortes', selector: row => row.Operacion_Cuchillas, width: '150px', style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
//         { name: 'Prog', selector: row => parseFloat(row.KilosProgramadosEntrantes || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Stock', selector: row => parseFloat(row.Stock || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Batch', selector: row => row.NroBatch, sortable: true, width: '90px' },
//         { name: 'Balanza', selector: row => parseFloat(row.Kilos_Balanza || 0).toFixed(0), sortable: true, right: true, width: '90px' },
//         { name: 'Abas', cell: row => row.Abastecida === '0' ? 'OK' : '', center: true, width: '70px' },
//         { name: 'Op.Ant.', cell: row => row.OpAnterior.startsWith('OK') ? row.OpAnterior : '', center: true, width: '80px' },
//         { name: 'Cali', cell: row => <CaliIcon iconType={row.caliIcon} />, center: true, width: '60px' },
//         { name: 'Ancho', selector: row => row.Ancho, sortable: true, right: true, width: '80px' },
//         { name: 'Flia.', selector: row => row.Familia, sortable: true, center: true, width: '70px' },
//         { name: 'Esp.', selector: row => row.Espesor, sortable: true, right: true, width: '70px' },
//         { name: 'Fecha Inicio', selector: row => row.batch_FechaInicio, format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, width: '170px' },
        
//         // ===== INICIO DE LA CORRECCIÓN CLAVE =====
//         { 
//             name: 'Consulta',
//             cell: (row) => <button className="btn btn-sm btn-info" onClick={() => navigate(`/registracion/detalle/${row.Operacion_ID}`)}>Ver</button>,
//             ignoreRowClick: true, // Evita que el clic en el botón seleccione la fila
//         },
//         // ===== FIN DE LA CORRECCIÓN CLAVE =====

//         { name: 'Tarea', selector: row => row.Tarea, sortable: true },
//         { name: 'Paq/Ata', selector: row => row.Paquetes, sortable: true, center: true, width: '80px' },
//         { name: 'Hoj/Roll', selector: row => row.Rollos, sortable: true, center: true, width: '80px' },
//     ], [navigate]);

//     const conditionalRowStyles = [
//         { when: row => row.status === 'BLOQUEADA', style: { backgroundColor: 'var(--danger)', color: 'white' } },
//         { when: row => row.status === 'LISTA', style: { backgroundColor: 'var(--success)', color: 'white' } },
//         { when: row => row.status === 'EN_PROCESO', style: { backgroundColor: 'var(--secondary)', color: 'white' } },
//         { when: row => row.status === 'EN_CALIDAD' || row.status === 'CALIDAD_DICTAMINADA', style: { backgroundColor: 'var(--warning)', color: 'black' } },
//         { when: row => row.status === 'SUSPENDIDA', style: { backgroundColor: '#e9ecef', color: 'black' } },
//     ];

//     return (
//         <>
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="d-flex justify-content-between align-items-center">
//                         <h1><b>SRP - Operaciones Pendientes {maquinaInfo.nombre}</b></h1>
//                         <button className="btn btn-secondary" onClick={() => navigate('/registracion')}>
//                             <i className="fas fa-arrow-left mr-2"></i>Volver a Máquinas
//                         </button>
//                     </div>
//                 </div>
//             </div>
//             <div className="content">
//                 <div className="container-fluid">
//                     <div className="card card-primary card-outline">
//                         <div className="card-body p-0">
//                             <DataTable
//                                 columns={columns}
//                                 data={operaciones}
//                                 progressPending={loading}
//                                 progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div>}
//                                 noDataComponent={<div className='py-5 text-center text-muted'>No hay operaciones pendientes para esta máquina.</div>}
//                                 pagination
//                                 paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
//                                 striped
//                                 highlightOnHover
//                                 selectableRows
//                                 onSelectedRowsChange={handleRowSelected}
//                                 clearSelectedRows={toggleCleared}
//                                 conditionalRowStyles={conditionalRowStyles}
//                                 theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//                             />
//                         </div>
//                         <div className="card-footer text-right">
//                            <button className="btn btn-primary btn-lg" onClick={handleProcesar} disabled={selectedRows.length === 0 || loading}>
//                                 PROCESAR
//                            </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Operaciones;







// // /src/pages/Operaciones.jsx -- VERSIÓN COMPLETA Y FUNCIONAL

// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import maquinas from '../data/maquinas.json';

// // Tema oscuro para la tabla
// createTheme('adminLteDark', {
//   text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//   background: { default: '#343a40' },
//   divider: { default: '#454d55' },
//   action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//   striped: { default: '#3a4047', text: '#FFFFFF' },
//   highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// // Componente para el icono de Calidad
// const CaliIcon = ({ iconType }) => {
//     const styles = { width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: 'white' };
//     switch (iconType) {
//         case 'rojo-fondo': return <div style={{...styles, backgroundColor: 'red'}}></div>;
//         case 'verde-fondo': return <div style={{...styles, backgroundColor: 'green'}}></div>;
//         case 'gris-fondo': return <div style={{...styles, backgroundColor: 'grey'}}></div>;
//         case 'blanco-fondo': return <div style={{...styles, backgroundColor: 'white'}}></div>;
//         case 'rojo-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-times-circle text-danger"></i></div>;
//         case 'verde-tilde-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-check-circle text-success"></i></div>;
//         default: return null;
//     }
// };


// // Lógica de colores (Traducción de C#)
// // const getRowStatus = (row) => {
// //     const isAbastecida = row.Abastecida === '0';
// //     const hasStock = row.Stock && parseFloat(row.Stock) > 0;
    
// //     let opAnteriorOk = false;
// //     if (!row.OpAnteriorData) {
// //         opAnteriorOk = true; // OK-R
// //     } else if (row.OpAnteriorData.Estado === '2') {
// //         opAnteriorOk = true; // OK
// //     }

// //     const tieneRegistroCalidad = !!row.CalidadData;
// //     const isAbierta = row.Estado === '1';

// //     if (!isAbastecida || !opAnteriorOk || !hasStock) {
// //         return 'BLOQUEADA'; // Rojo
// //     } else if (row.Suspendida == 1) {
// //         return 'SUSPENDIDA'; // Gris claro
// //     } else if (isAbierta && tieneRegistroCalidad) {
// //         return 'EN_CALIDAD'; // Amarillo
// //     } else if (isAbierta) {
// //         return 'EN_PROCESO'; // Gris
// //     } else {
// //         return 'LISTA'; // Verde
// //     }
// // };








// // const getRowStatus = (row) => {
// //     // Para depurar, imprimimos los datos clave de la fila que debería ser amarilla
// //     if (row.NumeroDocumento === '00966205-01') {
// //         console.group('--- DEBUG: Fila 00966205-01 ---');
// //         console.log('Datos recibidos del backend:', row);
// //         console.log(`Valor de 'Estado':`, row.Estado, `(Tipo: ${typeof row.Estado})`);
// //         console.log(`Valor de 'CalidadData':`, row.CalidadData);
// //         console.log(`Valor de 'Suspendida':`, row.Suspendida);
// //         console.log(`Valor de 'Abastecida':`, row.Abastecida);
// //         console.log(`Valor de 'OpAnteriorData':`, row.OpAnteriorData);
// //         console.log(`Valor de 'Stock':`, row.Stock);
// //         console.groupEnd();
// //     }

// //     // Lógica de decisión a prueba de errores
// //     const isAbastecida = row.Abastecida === '0';
// //     const hasStock = row.Stock && parseFloat(row.Stock) > 0;
    
// //     let opAnteriorOk = false;
// //     // Comprobación segura: nos aseguramos de que OpAnteriorData no sea null antes de leer 'Estado'
// //     if (!row.OpAnteriorData || (row.OpAnteriorData && row.OpAnteriorData.Estado === '2')) {
// //         opAnteriorOk = true;
// //     }

// //     const tieneRegistroCalidad = !!row.CalidadData; // Esto es true si CalidadData no es null ni undefined
// //     const isAbierta = String(row.Estado).trim() === '1'; // Convertimos a string y quitamos espacios por seguridad

// //     // Depuración de las condiciones para la fila específica
// //     if (row.NumeroDocumento === '00966205-01') {
// //         console.group('--- DEBUG: Condiciones Evaluadas para 00966205-01 ---');
// //         console.log(`isAbastecida: ${isAbastecida}`);
// //         console.log(`hasStock: ${hasStock}`);
// //         console.log(`opAnteriorOk: ${opAnteriorOk}`);
// //         console.log(`tieneRegistroCalidad: ${tieneRegistroCalidad}`);
// //         console.log(`isAbierta: ${isAbierta}`);
// //         console.groupEnd();
// //     }

// //     // Estructura if-else idéntica a frmOperacionesSlitter.cs
// //     if (!isAbastecida || !opAnteriorOk || !hasStock) {
// //         return 'BLOQUEADA';
// //     } else if (row.Suspendida == 1) {
// //         return 'SUSPENDIDA';
// //     } else if (isAbierta && tieneRegistroCalidad) {
// //         return 'EN_CALIDAD'; // <-- ESTA ES LA CONDICIÓN PARA EL AMARILLO
// //     } else if (isAbierta) {
// //         return 'EN_PROCESO';
// //     } else {
// //         return 'LISTA';
// //     }
// // };









// const getRowStatus = (row) => {
//     // ===== CORRECCIÓN DE LA CONDICIÓN DEL IF =====
//     console.log("row.NumeroDocumento :", row.NumeroDocumento);
//     if (row.NumeroDocumento === '00966205-01') {
//         console.group('--- DEBUG: Fila 00966205-01 ---');
//         console.log('Datos recibidos del backend:', row);
//         console.log(`Valor de 'Estado':`, row.Estado, `(Tipo: ${typeof row.Estado})`);
//         console.log(`Valor de 'CalidadData':`, row.CalidadData);
//         console.log(`Valor de 'Suspendida':`, row.Suspendida);
//         console.log(`Valor de 'Abastecida':`, row.Abastecida);
//         console.log(`Valor de 'OpAnteriorData':`, row.OpAnteriorData);
//         console.log(`Valor de 'Stock':`, row.Stock);
//         console.groupEnd();
//     }
//     // ===========================================

//     // Lógica de decisión a prueba de errores
//     const isAbastecida = row.Abastecida === '0';
//     const hasStock = row.Stock && parseFloat(row.Stock) > 0;
    
//     let opAnteriorOk = false;
//     if (!row.OpAnteriorData || (row.OpAnteriorData && row.OpAnteriorData.Estado === '2')) {
//         opAnteriorOk = true;
//     }

//     const tieneRegistroCalidad = !!row.CalidadData;
//     const isAbierta = String(row.Estado).trim() === '1';

//     // Depuración de las condiciones para la fila específica
//     if (row.NumeroDocumento === '00966205-01') {
//         console.group('--- DEBUG: Condiciones Evaluadas para 00966205-01 ---');
//         console.log(`isAbastecida: ${isAbastecida}`);
//         console.log(`hasStock: ${hasStock}`);
//         console.log(`opAnteriorOk: ${opAnteriorOk}`);
//         console.log(`tieneRegistroCalidad: ${tieneRegistroCalidad}`);
//         console.log(`isAbierta: ${isAbierta}`);
//         console.groupEnd();
//     }

//     // Estructura if-else idéntica a frmOperacionesSlitter.cs
//     if (!isAbastecida || !opAnteriorOk || !hasStock) {
//         return 'BLOQUEADA';
//     } else if (row.Suspendida == 1) {
//         return 'SUSPENDIDA';
//     } else if (isAbierta && tieneRegistroCalidad) {
//         return 'EN_CALIDAD'; // <-- ESTA ES LA CONDICIÓN PARA EL AMARILLO
//     } else if (isAbierta) {
//         return 'EN_PROCESO';
//     } else {
//         return 'LISTA';
//     }
// };






// const Operaciones = () => {
//     const { maquinaId } = useParams();
//     const navigate = useNavigate();
//     const { theme } = useContext(ThemeContext);
//     const { user } = useAuth();

//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [toggleCleared, setToggleCleared] = useState(false);

//     const maquinaInfo = useMemo(() => maquinas.find(m => m.id === maquinaId) || { nombre: 'Desconocida' }, [maquinaId]);

//     const fetchOperaciones = async () => {
//         if (!maquinaId) return;
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/operaciones/${maquinaId}`);
//             setOperaciones(response.data);
//         } catch (error) {
//             Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error');
//             setOperaciones([]);
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     useEffect(() => {
//         fetchOperaciones();
//         const interval = setInterval(fetchOperaciones, 300000);
//         return () => clearInterval(interval);
//     }, [maquinaId]);

//     const handleRowSelected = React.useCallback(state => {
//         setSelectedRows(state.selectedRows);
//     }, []);

//     const handleProcesar = async () => {
//         if (selectedRows.length === 0) {
//             Swal.fire('Atención', 'Debe seleccionar al menos una operación para procesar.', 'warning');
//             return;
//         }
//         if (maquinaId.startsWith('SL')) {
//             const firstSerieLote = selectedRows[0].Origen_Lote.substring(0, 11);
//             if (!selectedRows.every(row => row.Origen_Lote.substring(0, 11) === firstSerieLote)) {
//                  Swal.fire('Error de validación', 'Para Slitter, todas las operaciones seleccionadas deben ser de la misma SERIE/LOTE.', 'error');
//                  return;
//             }
//         }
//         if (maquinaId === 'EMB') {
//             const firstSerie = selectedRows[0].Origen_Lote.substring(0, 5);
//             const firstPedido = selectedRows[0].NumeroPedido;
//             let esValido = true;
//             for(const row of selectedRows) {
//                 if (row.Origen_Lote.substring(0, 5) !== firstSerie) {
//                     esValido = false;
//                     break;
//                 }
//                 if (row.NumeroPedido !== firstPedido) {
//                     if (row.Origen_Lote.substring(0, 11) !== selectedRows[0].Origen_Lote.substring(0, 11)) {
//                          esValido = false;
//                          break;
//                     }
//                 }
//             }
//             if(!esValido) {
//                 Swal.fire('Error de validación', 'Para Embalaje, las operaciones deben ser de la misma SERIE y PEDIDO, o de la misma SERIE/LOTE si son de pedidos distintos.', 'error');
//                 return;
//             }
//         }
        
//         const operacionesNombres = selectedRows.map(r => r.NumeroDocumento).join(' / ');
//         Swal.fire({
//             title: 'Confirmar Multi-Operación',
//             html: `Se procesarán las siguientes operaciones:<br><b>${operacionesNombres}</b><br>¿Desea continuar?`,
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Sí, procesar',
//             cancelButtonText: 'Cancelar'
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 const operacionesData = selectedRows.map(r => ({
//                     id: r.Operacion_ID,
//                     nroBatch: r.NroBatch
//                 }));
//                 try {
//                     const response = await axiosInstance.post('/registracion/operaciones/procesar', {
//                         operacionesData,
//                         usuario: user.nombre,
//                         maquinaId: maquinaId
//                     });
//                     Swal.fire('Éxito', `Multi-Operación #${response.data.multiOperacionId} creada.`, 'success');
//                     setToggleCleared(!toggleCleared);
//                     setSelectedRows([]);
//                     await fetchOperaciones();
//                 } catch (error) {
//                     Swal.fire('Error', error.response?.data?.error || 'No se pudo procesar la selección.', 'error');
//                 }
//             }
//         });
//     };

//     const formatCustomDate = (dateString) => {
//         if (!dateString || typeof dateString !== 'string' || dateString.length < 12) return 'N/A';
//         try {
//           const year = dateString.substring(0, 4); 
//           const month = dateString.substring(4, 6); 
//           const day = dateString.substring(6, 8);
//           const hour = dateString.substring(8, 10); 
//           const minute = dateString.substring(10, 12);
//           const second = dateString.length >= 14 ? dateString.substring(12, 14) : '00';
//           return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
//         } catch (e) { return 'Fecha Inválida'; }
//     };

//     const columns = useMemo(() => [
//         { name: 'Nº Op.', selector: row => row.NumeroDocumento, sortable: true, width: '120px' },
//         { name: 'Serie/Lote', selector: row => row.Origen_Lote.substring(0, 11), sortable: true, width: '110px' },
//         { name: 'Nro. MultiOp', selector: row => row.NumeroMultiOperacion, sortable: true, width: '110px' },
//         { name: 'Cortes', selector: row => row.Operacion_Cuchillas, width: '150px', style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
//         { name: 'Prog', selector: row => parseFloat(row.KilosProgramadosEntrantes || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Stock', selector: row => parseFloat(row.Stock || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Batch', selector: row => row.NroBatch, sortable: true, width: '90px' },
//         { name: 'Balanza', selector: row => parseFloat(row.Kilos_Balanza || 0).toFixed(0), sortable: true, right: true, width: '90px' },
//         { name: 'Abas', cell: row => row.Abastecida === '0' ? 'OK' : '', center: true, width: '70px' },
//         { name: 'Op.Ant.', cell: row => (row.OpAnteriorData && row.OpAnteriorData.Estado === '2') || !row.OpAnteriorData ? 'OK' : '', center: true, width: '80px' },
//         { name: 'Cali', cell: row => <CaliIcon iconType={row.caliIcon} />, center: true, width: '60px' },
//         { name: 'Ancho', selector: row => row.Ancho, sortable: true, right: true, width: '80px' },
//         { name: 'Flia.', selector: row => row.Familia, sortable: true, center: true, width: '70px' },
//         { name: 'Esp.', selector: row => row.Espesor, sortable: true, right: true, width: '70px' },
//         { name: 'Fecha Inicio', selector: row => row.batch_FechaInicio, format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, width: '170px' },
//         { name: 'Consulta', cell: (row) => <button className="btn btn-sm btn-info" onClick={() => navigate(`/registracion/detalle/${row.Operacion_ID}`)}>Ver</button>, ignoreRowClick: true },
//         { name: 'Tarea', selector: row => row.Tarea, sortable: true },
//         { name: 'Paq/Ata', selector: row => row.Paquetes, sortable: true, center: true, width: '80px' },
//         { name: 'Hoj/Roll', selector: row => row.Rollos, sortable: true, center: true, width: '80px' },
//     ], [navigate]);
    
//     const conditionalRowStyles = [
//         { when: row => getRowStatus(row) === 'BLOQUEADA', style: { backgroundColor: 'var(--danger)', color: 'white' } },
//         { when: row => getRowStatus(row) === 'LISTA', style: { backgroundColor: 'var(--success)', color: 'white' } },
//         { when: row => getRowStatus(row) === 'EN_PROCESO', style: { backgroundColor: 'var(--secondary)', color: 'white' } },
//         { when: row => getRowStatus(row) === 'EN_CALIDAD', style: { backgroundColor: 'var(--warning)', color: 'black' } },
//         { when: row => getRowStatus(row) === 'SUSPENDIDA', style: { backgroundColor: '#e9ecef', color: 'black' } },
//     ];

//     return (
//         <>
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="d-flex justify-content-between align-items-center">
//                         <h1><b>SRP - Operaciones Pendientes {maquinaInfo.nombre}</b></h1>
//                         <button className="btn btn-secondary" onClick={() => navigate('/registracion')}>
//                             <i className="fas fa-arrow-left mr-2"></i>Volver a Máquinas
//                         </button>
//                     </div>
//                 </div>
//             </div>
//             <div className="content">
//                 <div className="container-fluid">
//                     <div className="card card-primary card-outline">
//                         <div className="card-body p-0">
//                             <DataTable
//                                 columns={columns}
//                                 data={operaciones}
//                                 progressPending={loading}
//                                 progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div><div className="mt-2">Loading...</div></div>}
//                                 noDataComponent={<div className='py-5 text-center text-muted'>No hay operaciones pendientes para esta máquina.</div>}
//                                 pagination
//                                 paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
//                                 striped
//                                 highlightOnHover
//                                 selectableRows
//                                 onSelectedRowsChange={handleRowSelected}
//                                 clearSelectedRows={toggleCleared}
//                                 conditionalRowStyles={conditionalRowStyles}
//                                 theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//                             />
//                         </div>
//                         <div className="card-footer text-right">
//                            <button className="btn btn-primary btn-lg" onClick={handleProcesar} disabled={selectedRows.length === 0 || loading}>
//                                 PROCESAR
//                            </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Operaciones;








// // /src/pages/Operaciones.jsx -- VERSIÓN FINAL CON LÓGICA DE COLORES

// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import maquinas from '../data/maquinas.json';

// createTheme('adminLteDark', {
//   text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//   background: { default: '#343a40' },
//   divider: { default: '#454d55' },
//   action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//   striped: { default: '#3a4047', text: '#FFFFFF' },
//   highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// const CaliIcon = ({ iconType }) => {
//     const styles = { width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: 'white' };
//     switch (iconType) {
//         case 'rojo-fondo': return <div style={{...styles, backgroundColor: 'red'}}></div>;
//         case 'verde-fondo': return <div style={{...styles, backgroundColor: 'green'}}></div>;
//         case 'gris-fondo': return <div style={{...styles, backgroundColor: 'grey'}}></div>;
//         case 'blanco-fondo': return <div style={{...styles, backgroundColor: 'white'}}></div>;
//         case 'rojo-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-times-circle text-danger"></i></div>;
//         case 'verde-tilde-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-check-circle text-success"></i></div>;
//         default: return null;
//     }
// };

// const Operaciones = () => {
//     const { maquinaId } = useParams();
//     const navigate = useNavigate();
//     const { theme } = useContext(ThemeContext);
//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [toggleCleared, setToggleCleared] = useState(false);

//     const maquinaInfo = useMemo(() => maquinas.find(m => m.id === maquinaId) || { nombre: 'Desconocida' }, [maquinaId]);

//     const fetchOperaciones = async () => {
//         if (!maquinaId) return;
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/operaciones/${maquinaId}`);
//             setOperaciones(response.data);
//         } catch (error) {
//             Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error');
//             setOperaciones([]);
//         } finally { setLoading(false); }
//     };
    
//     useEffect(() => {
//         fetchOperaciones();
//         const interval = setInterval(fetchOperaciones, 300000);
//         return () => clearInterval(interval);
//     }, [maquinaId]);

//     const handleRowSelected = React.useCallback(state => { setSelectedRows(state.selectedRows); }, []);

//     const handleProcesar = async () => { /* Tu código sin cambios */ };
//     const formatCustomDate = (dateString) => {
//         if (!dateString || typeof dateString !== 'string' || dateString.length < 12) return 'N/A';
//         try {
//           const year = dateString.substring(0, 4); const month = dateString.substring(4, 6); const day = dateString.substring(6, 8);
//           const hour = dateString.substring(8, 10); const minute = dateString.substring(10, 12); const second = dateString.length >= 14 ? dateString.substring(12, 14) : '00';
//           return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
//         } catch (e) { return 'Fecha Inválida'; }
//     };

//     const columns = useMemo(() => [
//         { name: 'Nº Op.', selector: row => row.NumeroDocumento, sortable: true, width: '120px' },
//         { name: 'Serie/Lote', selector: row => row.Origen_Lote ? row.Origen_Lote.substring(0, 11) : '', sortable: true, width: '110px' },
//         { name: 'Nro. MultiOp', selector: row => row.NumeroMultiOperacion, sortable: true, width: '110px' },
//         { name: 'Cortes', selector: row => row.Operacion_Cuchillas, width: '150px', style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
//         { name: 'Prog', selector: row => parseFloat(row.KilosProgramadosEntrantes || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Stock', selector: row => parseFloat(row.Stock || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Batch', selector: row => row.NroBatch, sortable: true, width: '90px' },
//         { name: 'Balanza', selector: row => parseFloat(row.Kilos_Balanza || 0).toFixed(0), sortable: true, right: true, width: '90px' },
//         { name: 'Abas', cell: row => row.Abastecida === '0' ? 'OK' : '', center: true, width: '70px' },
//         { name: 'Op.Ant.', cell: row => (!row.OpAnteriorData || row.OpAnteriorData.Estado === '2') ? (row.OpAnteriorData ? 'OK' : 'OK-R') : '', center: true, width: '80px' },
//         { name: 'Cali', cell: row => <CaliIcon iconType={row.caliIcon} />, center: true, width: '60px' },
//         { name: 'Ancho', selector: row => row.Operacion_TotalAncho, sortable: true, right: true, width: '80px' },
//         { name: 'Flia.', selector: row => row.Codigo_Producto ? row.Codigo_Producto.substring(8,10) : '', sortable: true, center: true, width: '70px' },
//         { name: 'Esp.', selector: row => row.Codigo_Producto ? (parseFloat(row.Codigo_Producto.substring(14, 18)) / 1000).toFixed(3) : '', sortable: true, right: true, width: '70px' },
//         { name: 'Fecha Inicio', selector: row => row.batch_FechaInicio, format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, width: '170px' },
//         { name: 'Consulta', cell: (row) => <button className="btn btn-sm btn-info" onClick={() => navigate(`/registracion/detalle/${row.Operacion_ID}`)}>Ver</button>, ignoreRowClick: true },
//         { name: 'Tarea', selector: row => row.Tarea, sortable: true },
//         { name: 'Paq/Ata', selector: row => row.CantidadPaquetes, sortable: true, center: true, width: '80px' },
//         { name: 'Hoj/Roll', selector: row => row.CantidadRollos, sortable: true, center: true, width: '80px' },
//     ], [navigate]);
    
//     // const conditionalRowStyles = [
//     //     {
//     //         when: row => {
//     //             const isAbastecida = row.Abastecida === '0';
//     //             const hasStock = row.Stock && parseFloat(row.Stock) > 0;
//     //             let opAnteriorOk = !row.OpAnteriorData || row.OpAnteriorData.Estado === '2';
//     //             return !isAbastecida || !opAnteriorOk || !hasStock;
//     //         },
//     //         style: { backgroundColor: 'var(--danger)', color: 'white' }
//     //     },
//     //     {
//     //         when: row => row.Suspendida == 1,
//     //         style: { backgroundColor: '#e9ecef', color: 'black' }
//     //     },
//     //     {
//     //         when: row => {
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             return isAbierta && tieneRegistroCalidad;
//     //         },
//     //         style: { backgroundColor: 'var(--warning)', color: 'black' }
//     //     },
//     //     {
//     //         when: row => {
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             return isAbierta && !tieneRegistroCalidad;
//     //         },
//     //         style: { backgroundColor: 'var(--secondary)', color: 'white' }
//     //     },
//     //     {
//     //         when: row => {
//     //             const isAbastecida = row.Abastecida === '0';
//     //             const hasStock = row.Stock && parseFloat(row.Stock) > 0;
//     //             let opAnteriorOk = !row.OpAnteriorData || row.OpAnteriorData.Estado === '2';
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             return isAbastecida && hasStock && opAnteriorOk && !isAbierta && row.Suspendida != 1;
//     //         },
//     //         style: { backgroundColor: 'var(--success)', color: 'white' }
//     //     },
//     // ];


//     const conditionalRowStyles = [
//         {
//             when: row => {
//                 // Lógica para ROJO
//                 const isAbastecida = row.Abastecida === '0';
//                 const hasStock = row.Stock && parseFloat(row.Stock) > 0;
//                 const opAnteriorOk = !row.OpAnteriorData || row.OpAnteriorData.Estado === '2';
//                 return !isAbastecida || !opAnteriorOk || !hasStock;
//             },
//             style: { backgroundColor: 'var(--danger)', color: 'white' },
//         },
//         {
//             // Lógica para AMARILLO (se evalúa después del rojo)
//             when: row => {
//                 const tieneRegistroCalidad = !!row.CalidadData;
//                 const isAbierta = String(row.Estado).trim() === '1';
//                 return isAbierta && tieneRegistroCalidad;
//             },
//             style: { backgroundColor: 'var(--warning)', color: 'black' },
//         },
//         {
//             // Lógica para GRIS (se evalúa después del amarillo)
//             when: row => String(row.Estado).trim() === '1',
//             style: { backgroundColor: 'var(--secondary)', color: 'white' },
//         },
//         {
//             // Lógica para VERDE (es el caso por defecto si nada de lo anterior se cumple)
//             when: row => true,
//             style: { backgroundColor: 'var(--success)', color: 'white' },
//         },
//     ];



//     return (
//         <>
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="d-flex justify-content-between align-items-center">
//                         <h1><b>SRP - Operaciones Pendientes {maquinaInfo.nombre}</b></h1>
//                         <button className="btn btn-secondary" onClick={() => navigate('/registracion')}> <i className="fas fa-arrow-left mr-2"></i>Volver a Máquinas </button>
//                     </div>
//                 </div>
//             </div>
//             <div className="content">
//                 <div className="container-fluid">
//                     <div className="card card-primary card-outline">
//                         <div className="card-body p-0">
//                             <DataTable columns={columns} data={operaciones} progressPending={loading}
//                                 progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div><div className="mt-2">Loading...</div></div>}
//                                 noDataComponent={<div className='py-5 text-center text-muted'>No hay operaciones pendientes para esta máquina.</div>}
//                                 pagination paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
//                                 striped highlightOnHover selectableRows onSelectedRowsChange={handleRowSelected}
//                                 clearSelectedRows={toggleCleared} conditionalRowStyles={conditionalRowStyles}
//                                 theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//                             />
//                         </div>
//                         <div className="card-footer text-right">
//                            <button className="btn btn-primary btn-lg" onClick={handleProcesar} disabled={selectedRows.length === 0 || loading}> PROCESAR </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Operaciones;







// // /src/pages/Operaciones.jsx -- VERSIÓN FINAL, COMPLETA Y FUNCIONAL CON DEPURACIÓN

// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import maquinas from '../data/maquinas.json';

// createTheme('adminLteDark', {
//   text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//   background: { default: '#343a40' },
//   divider: { default: '#454d55' },
//   action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//   striped: { default: '#3a4047', text: '#FFFFFF' },
//   highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// const CaliIcon = ({ iconType }) => {
//     // ... este componente no cambia
//     const styles = { width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: 'white' };
//     switch (iconType) {
//         case 'rojo-fondo': return <div style={{...styles, backgroundColor: 'red'}}></div>;
//         case 'verde-fondo': return <div style={{...styles, backgroundColor: 'green'}}></div>;
//         case 'gris-fondo': return <div style={{...styles, backgroundColor: 'grey'}}></div>;
//         case 'blanco-fondo': return <div style={{...styles, backgroundColor: 'white'}}></div>;
//         case 'rojo-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-times-circle text-danger"></i></div>;
//         case 'verde-tilde-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-check-circle text-success"></i></div>;
//         default: return null;
//     }
// };

// const getRowStatus = (row) => {
//     // Log de depuración para la fila específica
//     if (row.NumeroDocumento === '00966205-01') {
//         console.group('--- DEBUG: Fila 00966205-01 ---');
//         console.log('Datos recibidos del backend:', row);
//         console.log(`Valor de 'Estado':`, row.Estado, `(Tipo: ${typeof row.Estado})`);
//         console.log(`Valor de 'CalidadData':`, row.CalidadData);
//         console.groupEnd();
//     }

//     const isAbastecida = row.Abastecida === '0';
//     const hasStock = row.Stock && parseFloat(row.Stock) > 0;
//     let opAnteriorOk = !row.OpAnteriorData || (row.OpAnteriorData && row.OpAnteriorData.Estado === '2');
//     const tieneRegistroCalidad = !!row.CalidadData;
//     const isAbierta = String(row.Estado).trim() === '1';

//     if (row.NumeroDocumento === '00966205-01') {
//         console.group('--- DEBUG: Condiciones Evaluadas para 00966205-01 ---');
//         console.log(`isAbastecida: ${isAbastecida}`);
//         console.log(`hasStock: ${hasStock}`);
//         console.log(`opAnteriorOk: ${opAnteriorOk}`);
//         console.log(`tieneRegistroCalidad: ${tieneRegistroCalidad}`);
//         console.log(`isAbierta: ${isAbierta}`);
//         console.groupEnd();
//     }

//     if (!isAbastecida || !opAnteriorOk || !hasStock) return 'BLOQUEADA';
//     if (row.Suspendida == 1) return 'SUSPENDIDA';
//     if (isAbierta && tieneRegistroCalidad) return 'EN_CALIDAD';
//     if (isAbierta) return 'EN_PROCESO';
//     return 'LISTA';
// };

// const Operaciones = () => {
//     const { maquinaId } = useParams();
//     const navigate = useNavigate();
//     const { theme } = useContext(ThemeContext);
//     const { user } = useAuth();
//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [toggleCleared, setToggleCleared] = useState(false);
//     const maquinaInfo = useMemo(() => maquinas.find(m => m.id === maquinaId) || { nombre: 'Desconocida' }, [maquinaId]);

//     const fetchOperaciones = async () => {
//         if (!maquinaId) return;
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/operaciones/${maquinaId}`);
//             setOperaciones(response.data);
//         } catch (error) {
//             Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error');
//             setOperaciones([]);
//         } finally { setLoading(false); }
//     };
    
//     useEffect(() => {
//         fetchOperaciones();
//         const interval = setInterval(fetchOperaciones, 300000);
//         return () => clearInterval(interval);
//     }, [maquinaId]);

//     const handleRowSelected = React.useCallback(state => { setSelectedRows(state.selectedRows); }, []);
//     const handleProcesar = async () => { /* ... Tu lógica para procesar ... */ };
//     const formatCustomDate = (dateString) => {
//         if (!dateString || typeof dateString !== 'string' || dateString.length < 12) return 'N/A';
//         try {
//           const year = dateString.substring(0, 4); const month = dateString.substring(4, 6); const day = dateString.substring(6, 8);
//           const hour = dateString.substring(8, 10); const minute = dateString.substring(10, 12); const second = dateString.length >= 14 ? dateString.substring(12, 14) : '00';
//           return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
//         } catch (e) { return 'Fecha Inválida'; }
//     };

//     const columns = useMemo(() => [
//         { name: 'Nº Op.', selector: row => row.NumeroDocumento, sortable: true, width: '120px' },
//         { name: 'Serie/Lote', selector: row => row.Origen_Lote ? row.Origen_Lote.substring(0, 11) : '', sortable: true, width: '110px' },
//         { name: 'Nro. MultiOp', selector: row => row.NumeroMultiOperacion, sortable: true, width: '110px' },
//         { name: 'Cortes', selector: row => row.Operacion_Cuchillas, width: '150px', style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
//         { name: 'Prog', selector: row => parseFloat(row.KilosProgramadosEntrantes || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Stock', selector: row => parseFloat(row.Stock || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Batch', selector: row => row.NroBatch, sortable: true, width: '90px' },
//         { name: 'Balanza', selector: row => parseFloat(row.Kilos_Balanza || 0).toFixed(0), sortable: true, right: true, width: '90px' },
//         { name: 'Abas', cell: row => row.Abastecida === '0' ? 'OK' : '', center: true, width: '70px' },
//         { name: 'Op.Ant.', cell: row => (!row.OpAnteriorData || row.OpAnteriorData.Estado === '2') ? (row.OpAnteriorData ? 'OK' : 'OK-R') : '', center: true, width: '80px' },
//         { name: 'Cali', cell: row => <CaliIcon iconType={row.caliIcon} />, center: true, width: '60px' },
//         { name: 'Ancho', selector: row => row.Operacion_TotalAncho, sortable: true, right: true, width: '80px' },
//         { name: 'Flia.', selector: row => row.Codigo_Producto ? row.Codigo_Producto.substring(8,10) : '', sortable: true, center: true, width: '70px' },
//         { name: 'Esp.', selector: row => row.Codigo_Producto ? (parseFloat(row.Codigo_Producto.substring(14, 18)) / 1000).toFixed(3) : '', sortable: true, right: true, width: '70px' },
//         { name: 'Fecha Inicio', selector: row => row.batch_FechaInicio, format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, width: '170px' },
//         { name: 'Consulta', cell: (row) => <button className="btn btn-sm btn-info" onClick={() => navigate(`/registracion/detalle/${row.Operacion_ID}`)}>Ver</button>, ignoreRowClick: true },
//         { name: 'Tarea', selector: row => row.Tarea, sortable: true },
//         { name: 'Paq/Ata', selector: row => row.CantidadPaquetes, sortable: true, center: true, width: '80px' },
//         { name: 'Hoj/Roll', selector: row => row.CantidadRollos, sortable: true, center: true, width: '80px' },
//     ], [navigate]);
    
//     const conditionalRowStyles = [
//         { when: row => getRowStatus(row) === 'BLOQUEADA', style: { backgroundColor: 'var(--danger)', color: 'white' } },
//         { when: row => getRowStatus(row) === 'LISTA', style: { backgroundColor: 'var(--success)', color: 'white' } },
//         { when: row => getRowStatus(row) === 'EN_PROCESO', style: { backgroundColor: 'var(--secondary)', color: 'white' } },
//         { when: row => getRowStatus(row) === 'EN_CALIDAD', style: { backgroundColor: 'var(--warning)', color: 'black' } },
//         { when: row => getRowStatus(row) === 'SUSPENDIDA', style: { backgroundColor: '#e9ecef', color: 'black' } },
//     ];

//     return (
//         <>
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="d-flex justify-content-between align-items-center">
//                         <h1><b>SRP - Operaciones Pendientes {maquinaInfo.nombre}</b></h1>
//                         <button className="btn btn-secondary" onClick={() => navigate('/registracion')}> <i className="fas fa-arrow-left mr-2"></i>Volver a Máquinas </button>
//                     </div>
//                 </div>
//             </div>
//             <div className="content">
//                 <div className="container-fluid">
//                     <div className="card card-primary card-outline">
//                         <div className="card-body p-0">
//                             <DataTable
//                                 columns={columns}
//                                 data={operaciones}
//                                 progressPending={loading}
//                                 progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div><div className="mt-2">Loading...</div></div>}
//                                 noDataComponent={<div className='py-5 text-center text-muted'>No hay operaciones pendientes para esta máquina.</div>}
//                                 pagination
//                                 paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
//                                 striped
//                                 highlightOnHover
//                                 selectableRows
//                                 onSelectedRowsChange={handleRowSelected}
//                                 clearSelectedRows={toggleCleared}
//                                 conditionalRowStyles={conditionalRowStyles}
//                                 theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//                             />
//                         </div>
//                         <div className="card-footer text-right">
//                            <button className="btn btn-primary btn-lg" onClick={handleProcesar} disabled={selectedRows.length === 0 || loading}> PROCESAR </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Operaciones;






// // /src/pages/Operaciones.jsx -- VERSIÓN FINAL Y COMPLETA

// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import maquinas from '../data/maquinas.json';

// createTheme('adminLteDark', {
//   text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//   background: { default: '#343a40' },
//   divider: { default: '#454d55' },
//   action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//   striped: { default: '#3a4047', text: '#FFFFFF' },
//   highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// const CaliIcon = ({ iconType }) => { /* ... sin cambios ... */ };

// const Operaciones = () => {
//     const { maquinaId } = useParams();
//     const navigate = useNavigate();
//     const { theme } = useContext(ThemeContext);
//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [toggleCleared, setToggleCleared] = useState(false);

//     const maquinaInfo = useMemo(() => maquinas.find(m => m.id === maquinaId) || { nombre: 'Desconocida' }, [maquinaId]);

//     const fetchOperaciones = async () => {
//         if (!maquinaId) return;
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/operaciones/${maquinaId}`);
//             setOperaciones(response.data);
//         } catch (error) {
//             Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error');
//             setOperaciones([]);
//         } finally { setLoading(false); }
//     };
    
//     useEffect(() => {
//         fetchOperaciones();
//         const interval = setInterval(fetchOperaciones, 300000);
//         return () => clearInterval(interval);
//     }, [maquinaId]);

//     const handleRowSelected = React.useCallback(state => { setSelectedRows(state.selectedRows); }, []);

//     const handleProcesar = async () => { /* ... sin cambios ... */ };
//     const formatCustomDate = (dateString) => { /* ... sin cambios ... */ };

//     const columns = useMemo(() => [
//         { name: 'Nº Op.', selector: row => row.NumeroDocumento, sortable: true, width: '120px' },
//         { name: 'Serie/Lote', selector: row => row.Origen_Lote ? row.Origen_Lote.substring(0, 11) : '', sortable: true, width: '110px' },
//         { name: 'Nro. MultiOp', selector: row => row.NumeroMultiOperacion, sortable: true, width: '110px' },
//         { name: 'Cortes', selector: row => row.Operacion_Cuchillas, width: '150px', style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
//         { name: 'Prog', selector: row => parseFloat(row.KilosProgramadosEntrantes || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Stock', selector: row => parseFloat(row.Stock || 0).toFixed(0), sortable: true, right: true, width: '80px' },
//         { name: 'Batch', selector: row => row.NroBatch, sortable: true, width: '90px' },
//         { name: 'Balanza', selector: row => parseFloat(row.Kilos_Balanza || 0).toFixed(0), sortable: true, right: true, width: '90px' },
//         { name: 'Abas', cell: row => row.Abastecida === '0' ? 'OK' : '', center: true, width: '70px' },
//         { name: 'Op.Ant.', cell: row => (!row.OpAnteriorData || row.OpAnteriorData.Estado === '2') ? (row.OpAnteriorData ? 'OK' : 'OK-R') : '', center: true, width: '80px' },
//         { name: 'Cali', cell: row => <CaliIcon iconType={row.caliIcon} />, center: true, width: '60px' },
//         { name: 'Ancho', selector: row => row.Operacion_TotalAncho, sortable: true, right: true, width: '80px' },
//         { name: 'Flia.', selector: row => row.Codigo_Producto ? row.Codigo_Producto.substring(8,10) : '', sortable: true, center: true, width: '70px' },
//         { name: 'Esp.', selector: row => row.Codigo_Producto ? (parseFloat(row.Codigo_Producto.substring(14, 18)) / 1000).toFixed(3) : '', sortable: true, right: true, width: '70px' },
//         { name: 'Fecha Inicio', selector: row => row.batch_FechaInicio, format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, width: '170px' },
//         { name: 'Consulta', cell: (row) => <button className="btn btn-sm btn-info" onClick={() => navigate(`/registracion/detalle/${row.Operacion_ID}`)}>Ver</button>, ignoreRowClick: true },
//         { name: 'Tarea', selector: row => row.Tarea, sortable: true },
//         { name: 'Paq/Ata', selector: row => row.CantidadPaquetes, sortable: true, center: true, width: '80px' },
//         { name: 'Hoj/Roll', selector: row => row.CantidadRollos, sortable: true, center: true, width: '80px' },
//     ], [navigate]);
    
//     // ===== LÓGICA DE COLORES FINAL Y DIRECTA =====
//     // const conditionalRowStyles = [
//     //     {
//     //         when: row => { // Lógica para ROJO
//     //             const isAbastecida = row.Abastecida === '0';
//     //             const hasStock = row.Stock && parseFloat(row.Stock) > 0;
//     //             const opAnteriorOk = !row.OpAnteriorData || row.OpAnteriorData.Estado === '2';
//     //             return !isAbastecida || !opAnteriorOk || !hasStock;
//     //         },
//     //         style: { backgroundColor: 'var(--danger)', color: 'white' },
//     //     },
//     //     { // Lógica para AMARILLO
//     //         when: row => {
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             return isAbierta && tieneRegistroCalidad;
//     //         },
//     //         style: { backgroundColor: 'var(--warning)', color: 'black' },
//     //     },
//     //     { // Lógica para GRIS OSCURO
//     //         when: row => {
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             return isAbierta && !tieneRegistroCalidad;
//     //         },
//     //         style: { backgroundColor: 'var(--secondary)', color: 'white' },
//     //     },
//     //     { // Lógica para GRIS CLARO (SUSPENDIDA)
//     //         when: row => row.Suspendida == 1,
//     //         style: { backgroundColor: '#e9ecef', color: 'black' },
//     //     },
//     //     { // Lógica para VERDE (el resto de los casos)
//     //         when: row => true,
//     //         style: { backgroundColor: 'var(--success)', color: 'white' },
//     //     },
//     // ];




//     // const conditionalRowStyles = [
//     //     { // 1. ROJO (Máxima prioridad)
//     //         when: row => {
//     //             const isAbastecida = row.Abastecida === '0';
//     //             const hasStock = row.Stock && parseFloat(row.Stock) > 0;
//     //             const opAnteriorOk = !row.OpAnteriorData || row.OpAnteriorData.Estado === '2';
//     //             return !isAbastecida || !opAnteriorOk || !hasStock;
//     //         },
//     //         style: { backgroundColor: 'var(--danger)', color: 'white' },
//     //     },
//     //     { // 2. AMARILLO (Segunda prioridad)
//     //         when: row => {
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             return isAbierta && tieneRegistroCalidad;
//     //         },
//     //         style: { backgroundColor: 'var(--warning)', color: 'black' },
//     //     },
//     //     { // 3. GRIS OSCURO (Tercera prioridad)
//     //         when: row => {
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             return isAbierta && !tieneRegistroCalidad;
//     //         },
//     //         style: { backgroundColor: 'var(--secondary)', color: 'white' },
//     //     },
//     //     { // 4. GRIS CLARO (Cuarta prioridad)
//     //         when: row => row.Suspendida == 1,
//     //         style: { backgroundColor: '#e9ecef', color: 'black' },
//     //     },
//     //     { // 5. VERDE (Caso por defecto, si nada de lo anterior se cumple)
//     //         when: row => true,
//     //         style: { backgroundColor: 'var(--success)', color: 'white' },
//     //     },
//     // ];



//     const conditionalRowStyles = [
//         {
//             when: row => {
//                 // Definimos todas las variables una vez
//                 const isAbastecida = row.Abastecida === '0';
//                 const hasStock = row.Stock && parseFloat(row.Stock) > 0;
//                 const opAnteriorOk = !row.OpAnteriorData || (row.OpAnteriorData && row.OpAnteriorData.Estado === '2');
//                 const tieneRegistroCalidad = !!row.CalidadData;
//                 const isAbierta = String(row.Estado).trim() === '1';

//                 // Imprimimos el estado para CADA fila
//                 console.log(`DEBUG Fila ${row.NumeroDocumento}:`, {
//                     isAbastecida, hasStock, opAnteriorOk, tieneRegistroCalidad, isAbierta, Suspendida: row.Suspendida
//                 });

//                 // Esta función solo decide si la fila es ROJA
//                 return !isAbastecida || !opAnteriorOk || !hasStock;
//             },
//             style: { backgroundColor: 'var(--danger)', color: 'white' },
//         },
//         {
//             when: row => {
//                 const tieneRegistroCalidad = !!row.CalidadData;
//                 const isAbierta = String(row.Estado).trim() === '1';
//                 // Solo decide si es AMARILLA
//                 return isAbierta && tieneRegistroCalidad;
//             },
//             style: { backgroundColor: 'var(--warning)', color: 'black' },
//         },
//         {
//             when: row => {
//                 const tieneRegistroCalidad = !!row.CalidadData;
//                 const isAbierta = String(row.Estado).trim() === '1';
//                 // Solo decide si es GRIS
//                 return isAbierta && !tieneRegistroCalidad;
//             },
//             style: { backgroundColor: 'var(--secondary)', color: 'white' },
//         },
//         {
//             when: row => row.Suspendida == 1,
//             style: { backgroundColor: '#e9ecef', color: 'black' },
//         },
//         {
//             when: row => true,
//             style: { backgroundColor: 'var(--success)', color: 'white' },
//         },
//     ];






//     return (
//         <>
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="d-flex justify-content-between align-items-center">
//                         <h1><b>SRP - Operaciones Pendientes {maquinaInfo.nombre}</b></h1>
//                         <button className="btn btn-secondary" onClick={() => navigate('/registracion')}> <i className="fas fa-arrow-left mr-2"></i>Volver a Máquinas </button>
//                     </div>
//                 </div>
//             </div>
//             <div className="content">
//                 <div className="container-fluid">
//                     <div className="card card-primary card-outline">
//                         <div className="card-body p-0">
//                             <DataTable
//                                 columns={columns}
//                                 data={operaciones}
//                                 progressPending={loading}
//                                 progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div><div className="mt-2">Loading...</div></div>}
//                                 noDataComponent={<div className='py-5 text-center text-muted'>No hay operaciones pendientes para esta máquina.</div>}
//                                 pagination
//                                 paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de' }}
//                                 striped
//                                 highlightOnHover
//                                 selectableRows
//                                 onSelectedRowsChange={handleRowSelected}
//                                 clearSelectedRows={toggleCleared}
//                                 conditionalRowStyles={conditionalRowStyles}
//                                 theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//                             />
//                         </div>
//                         <div className="card-footer text-right">
//                            <button className="btn btn-primary btn-lg" onClick={handleProcesar} disabled={selectedRows.length === 0 || loading}> PROCESAR </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Operaciones;











// // /src/pages/Operaciones.jsx -- VERSIÓN FINAL CON DEPURACIÓN EXHAUSTIVA EN EL FRONTEND

// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import maquinas from '../data/maquinas.json';

// createTheme('adminLteDark', {
//   text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//   background: { default: '#343a40' },
//   divider: { default: '#454d55' },
//   action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//   striped: { default: '#3a4047', text: '#FFFFFF' },
//   highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// const formatNumber = (num, decimals = 0) => {
//     const number = parseFloat(num);
//     if (isNaN(number)) return '0';
//     return number.toLocaleString('es-AR', {
//         minimumFractionDigits: decimals,
//         maximumFractionDigits: decimals,
//     });
// };

// const Operaciones = () => {
//     const { maquinaId } = useParams();
//     const navigate = useNavigate();
//     const { theme } = useContext(ThemeContext);
//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [toggleCleared, setToggleCleared] = useState(false);

//     const maquinaInfo = useMemo(() => maquinas.find(m => m.id === maquinaId) || { nombre: 'Desconocida' }, [maquinaId]);

//     const fetchOperaciones = async () => {
//         if (!maquinaId) return;
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/operaciones/${maquinaId}`);
//             setOperaciones(response.data);
//         } catch (error) {
//             Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error');
//             setOperaciones([]);
//         } finally { setLoading(false); }
//     };
    
//     useEffect(() => {
//         fetchOperaciones();
//     }, [maquinaId]);

//     const handleRowSelected = React.useCallback(state => { setSelectedRows(state.selectedRows); }, []);
//     const handleProcesar = async () => { /* Tu lógica de procesar */ };
//     const formatCustomDate = (dateString) => {
//         if (!dateString || typeof dateString !== 'string' || dateString.length < 12) return 'N/A';
//         try {
//           const year = dateString.substring(0, 4); const month = dateString.substring(4, 6); const day = dateString.substring(6, 8);
//           const hour = dateString.substring(8, 10); const minute = dateString.substring(10, 12);
//           return `${day}/${month}/${year} ${hour}:${minute}`;
//         } catch (e) { return 'Fecha Inválida'; }
//     };

//     const columns = useMemo(() => [
//         { name: 'Nº Op.', selector: row => row.NumeroDocumento, sortable: true, width: '120px' },
//         { name: 'Serie/Lote', selector: row => row.Origen_Lote ? row.Origen_Lote.substring(0, 11) : '', sortable: true, width: '110px' },
//         { name: 'Nro. MultiOp', selector: row => row.NumeroMultiOperacion, sortable: true, width: '110px', omit: !maquinaId.startsWith('SL') },
//         { name: 'Cortes', selector: row => row.Operacion_Cuchillas, width: '150px', style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
//         { name: 'Prog', selector: row => formatNumber(row.KilosProgramadosEntrantes), sortable: true },
//         { name: 'Stock', selector: row => formatNumber(row.Stock), sortable: true },
//         { name: 'Batch', selector: row => row.NroBatch, sortable: true },
//         { name: 'Balanza', selector: row => formatNumber(row.Kilos_Balanza), sortable: true },
//         { name: 'Abas', cell: row => row.Abastecida === '0' ? 'OK' : '' },
//         { name: 'Op.Ant.', cell: row => (!row.OpAnteriorData || row.OpAnteriorData.Estado === '2') ? (row.OpAnteriorData ? 'OK' : 'OK-R') : '' },
//         { name: 'Fecha Inicio', selector: row => row.batch_FechaInicio, format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, width: '170px' },
//         { name: 'Consulta', cell: (row) => <button className="btn btn-sm btn-info" onClick={() => navigate(`/registracion/detalle/${row.Operacion_ID}`)}>Ver</button>, ignoreRowClick: true },
//     ], [navigate, maquinaId]);
    
//     // ===== LÓGICA DE COLORES CON DEPURACIÓN EXHAUSTIVA =====
//     // const conditionalRowStyles = [
//     //     {
//     //         when: row => {
//     //             // Definimos las variables una vez para cada condición y para el log
//     //             const isAbastecida = row.Abastecida === '0';
//     //             const hasStock = row.Stock && parseFloat(row.Stock) > 0;
//     //             const opAnteriorOk = !row.OpAnteriorData || (row.OpAnteriorData && row.OpAnteriorData.Estado === '2');
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';

//     //             console.log("row.NumeroDocumento" , row.NumeroDocumento);

//     //             // Imprimimos el estado para la fila que nos interesa
//     //             if (row.NumeroDocumento === '00966205-01') {
//     //                 console.group(`--- DEBUG para ${row.NumeroDocumento} ---`);
//     //                 console.log('Datos crudos:', row);
//     //                 console.log(`isAbastecida: ${isAbastecida}`);
//     //                 console.log(`hasStock: ${hasStock}`);
//     //                 console.log(`opAnteriorOk: ${opAnteriorOk}`);
//     //                 console.log(`tieneRegistroCalidad: ${tieneRegistroCalidad}`);
//     //                 console.log(`isAbierta: ${isAbierta}`);
//     //                 console.log(`Suspendida: ${row.Suspendida}`);
//     //                 console.groupEnd();
//     //             }
                
//     //             return !isAbastecida || !opAnteriorOk || !hasStock; // Condición para ROJO
//     //         },
//     //         style: { backgroundColor: 'var(--danger)', color: 'white' },
//     //     },
//     //     {
//     //         when: row => {
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             return isAbierta && tieneRegistroCalidad; // Condición para AMARILLO
//     //         },
//     //         style: { backgroundColor: 'var(--warning)', color: 'black' },
//     //     },
//     //     {
//     //         when: row => {
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             return isAbierta && !tieneRegistroCalidad; // Condición para GRIS
//     //         },
//     //         style: { backgroundColor: 'var(--secondary)', color: 'white' },
//     //     },
//     //     {
//     //         when: row => row.Suspendida == 1, // Condición para GRIS CLARO
//     //         style: { backgroundColor: '#e9ecef', color: 'black' },
//     //     },
//     //     {
//     //         when: row => true, // Condición para VERDE (por defecto)
//     //         style: { backgroundColor: 'var(--success)', color: 'white' },
//     //     },
//     // ];


//     // const conditionalRowStyles = [
//     //     {
//     //         when: row => {
//     //             // Definimos las variables una vez para cada condición
//     //             const isAbastecida = row.Abastecida === '0';
//     //             const hasStock = row.Stock && parseFloat(row.Stock) > 0;
//     //             const opAnteriorOk = !row.OpAnteriorData || (row.OpAnteriorData && row.OpAnteriorData.Estado === '2');
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';

//     //             // ===== INICIO DE LA CORRECCIÓN CLAVE =====
//     //             // Imprimimos la evaluación para CADA fila en la consola
//     //             console.log(`DEBUG Fila ${row.NumeroDocumento}:`, {
//     //                 isAbastecida, hasStock, opAnteriorOk, tieneRegistroCalidad, isAbierta, Suspendida: row.Suspendida
//     //             });
//     //             // ===== FIN DE LA CORRECCIÓN CLAVE =====

//     //             return !isAbastecida || !opAnteriorOk || !hasStock;
//     //         },
//     //         style: { backgroundColor: 'var(--danger)', color: 'white' },
//     //     },
//     //     {
//     //         when: row => {
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             return isAbierta && tieneRegistroCalidad;
//     //         },
//     //         style: { backgroundColor: 'var(--warning)', color: 'black' },
//     //     },
//     //     {
//     //         when: row => {
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             return isAbierta && !tieneRegistroCalidad;
//     //         },
//     //         style: { backgroundColor: 'var(--secondary)', color: 'white' },
//     //     },
//     //     {
//     //         when: row => row.Suspendida == 1,
//     //         style: { backgroundColor: '#e9ecef', color: 'black' },
//     //     },
//     //     {
//     //         when: row => true,
//     //         style: { backgroundColor: 'var(--success)', color: 'white' },
//     //     },
//     // ];


//     // const conditionalRowStyles = [
//     //     {
//     //         when: row => { // Condición para ROJO
//     //             const isAbastecida = row.Abastecida === '0';
//     //             const hasStock = row.Stock && parseFloat(row.Stock) > 0;
//     //             const opAnteriorOk = !row.OpAnteriorData || (row.OpAnteriorData && row.OpAnteriorData.Estado === '2');
//     //             return !isAbastecida || !opAnteriorOk || !hasStock;
//     //         },
//     //         style: { backgroundColor: 'var(--danger)', color: 'white' },
//     //     },
//     //     {
//     //         when: row => { // Condición para AMARILLO
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             // LOG DE DEPURACIÓN PARA LA FILA PROBLEMÁTICA
//     //             if (row.NumeroDocumento === '00966205-01-000') {
//     //                 console.log(`DEBUG AMARILLO para ${row.NumeroDocumento}: isAbierta=${isAbierta}, tieneRegistroCalidad=${tieneRegistroCalidad}`);
//     //             }
//     //             return isAbierta && tieneRegistroCalidad;
//     //         },
//     //         style: { backgroundColor: 'var(--warning)', color: 'black' },
//     //     },
//     //     {
//     //         when: row => { // Condición para GRIS
//     //             const tieneRegistroCalidad = !!row.CalidadData;
//     //             const isAbierta = String(row.Estado).trim() === '1';
//     //             // Tiene que estar abierta PERO NO tener registro de calidad
//     //             return isAbierta && !tieneRegistroCalidad;
//     //         },
//     //         style: { backgroundColor: 'var(--secondary)', color: 'white' },
//     //     },
//     //     {
//     //         when: row => row.Suspendida == 1, // Condición para GRIS CLARO
//     //         style: { backgroundColor: '#e9ecef', color: 'black' },
//     //     },
//     //     {
//     //         when: row => true, // Condición para VERDE (por defecto)
//     //         style: { backgroundColor: 'var(--success)', color: 'white' },
//     //     },
//     // ];





// //   const conditionalRowStyles = [
// //         {
// //             when: row => {
// //                 const isAbastecida = row.Abastecida === '0';
// //                 const hasStock = row.Stock && parseFloat(row.Stock) > 0;
// //                 const opAnteriorOk = !row.OpAnteriorData || (row.OpAnteriorData && row.OpAnteriorData.Estado === '2');
// //                 const tieneRegistroCalidad = !!row.CalidadData;
// //                 const isAbierta = String(row.Estado).trim() === '1';
                
// //                 // Mantenemos el console.log para verificación
// //                 console.log(`DEBUG Fila ${row.NumeroDocumento}:`, {isAbastecida, hasStock, opAnteriorOk, tieneRegistroCalidad, isAbierta});

// //                 return !isAbastecida || !opAnteriorOk || !hasStock;
// //             },
// //             style: { backgroundColor: 'var(--danger)', color: 'white' },
// //         },
// //         {
// //             when: row => String(row.Estado).trim() === '1' && !!row.CalidadData,
// //             style: { backgroundColor: 'var(--warning)', color: 'black' },
// //         },
// //         {
// //             when: row => String(row.Estado).trim() === '1' && !row.CalidadData,
// //             style: { backgroundColor: 'var(--secondary)', color: 'white' },
// //         },
// //         {
// //             when: row => row.Suspendida == 1,
// //             style: { backgroundColor: '#e9ecef', color: 'black' },
// //         },
// //         {
// //             when: row => true,
// //             style: { backgroundColor: 'var(--success)', color: 'white' },
// //         },
// //     ];

  





// const conditionalRowStyles = [
//         {
//             when: row => {
//                 const isAbastecida = row.Abastecida === '0';
//                 const hasStock = row.Stock && parseFloat(row.Stock) > 0;
//                 const opAnteriorOk = !row.OpAnteriorData || (row.OpAnteriorData && row.OpAnteriorData.Estado === '2');
//                 const result = !isAbastecida || !opAnteriorOk || !hasStock;
//                 console.log(`DEBUG Fila ${row.NumeroDocumento} -> Condición ROJO: ${result}`);
//                 return result;
//             },
//             style: { backgroundColor: 'var(--danger)', color: 'white' },
//         },
//         {
//             when: row => {
//                 const tieneRegistroCalidad = !!row.CalidadData;
//                 const isAbierta = String(row.Estado).trim() === '1';
//                 const result = isAbierta && tieneRegistroCalidad;
//                 console.log(`DEBUG Fila ${row.NumeroDocumento} -> Condición AMARILLO: ${result} (isAbierta=${isAbierta}, tieneCalidad=${tieneRegistroCalidad})`);
//                 return result;
//             },
//             style: { backgroundColor: 'var(--warning)', color: 'black' },
//         },
//         {
//             when: row => {
//                 const tieneRegistroCalidad = !!row.CalidadData;
//                 const isAbierta = String(row.Estado).trim() === '1';
//                 const result = isAbierta && !tieneRegistroCalidad;
//                 console.log(`DEBUG Fila ${row.NumeroDocumento} -> Condición GRIS: ${result}`);
//                 return result;
//             },
//             style: { backgroundColor: 'var(--secondary)', color: 'white' },
//         },
//         {
//             when: row => {
//                 const result = row.Suspendida == 1;
//                 console.log(`DEBUG Fila ${row.NumeroDocumento} -> Condición SUSPENDIDA: ${result}`);
//                 return result;
//             },
//             style: { backgroundColor: '#e9ecef', color: 'black' },
//         },
//         {
//             when: row => true,
//             style: { backgroundColor: 'var(--success)', color: 'white' },
//         },
//     ];


//     return (
//         <>
//             <div className="content-header">
//                 <div className="container-fluid">
//                     <div className="d-flex justify-content-between align-items-center">
//                         <h1><b>SRP - Operaciones Pendientes {maquinaInfo.nombre}</b></h1>
//                         <button className="btn btn-secondary" onClick={() => navigate('/registracion')}> <i className="fas fa-arrow-left mr-2"></i>Volver a Máquinas </button>
//                     </div>
//                 </div>
//             </div>
//             <div className="content">
//                 <div className="container-fluid">
//                     <div className="card card-primary card-outline">
//                         <div className="card-body p-0">
//                             <DataTable
//                                 columns={columns}
//                                 data={operaciones}
//                                 progressPending={loading}
//                                 progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div><div className="mt-2">Loading...</div></div>}
//                                 noDataComponent={<div className='py-5 text-center text-muted'>No hay operaciones pendientes para esta máquina.</div>}
//                                 pagination
//                                 striped
//                                 highlightOnHover
//                                 selectableRows
//                                 onSelectedRowsChange={handleRowSelected}
//                                 clearSelectedRows={toggleCleared}
//                                 conditionalRowStyles={conditionalRowStyles}
//                                 theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//                             />
//                         </div>
//                         <div className="card-footer text-right">
//                            <button className="btn btn-primary btn-lg" onClick={handleProcesar} disabled={selectedRows.length === 0 || loading}> PROCESAR </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Operaciones;















// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import DataTable, { createTheme } from 'react-data-table-component';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';
// import maquinas from '../data/maquinas.json';

// createTheme('adminLteDark', {
//   text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.7)' },
//   background: { default: '#343a40' },
//   divider: { default: '#454d55' },
//   action: { button: 'rgba(255,255,255,.54)', hover: 'rgba(255,255,255,.08)', disabled: 'rgba(255,255,255,.12)' },
//   striped: { default: '#3a4047', text: '#FFFFFF' },
//   highlightOnHover: { default: '#454d55', text: '#FFFFFF' },
// }, 'dark');

// const formatNumber = (num, decimals = 0) => {
//   const number = parseFloat(num);
//   if (isNaN(number)) return '0';
//   return number.toLocaleString('es-AR', {
//     minimumFractionDigits: decimals,
//     maximumFractionDigits: decimals,
//   });
// };

// const Operaciones = () => {
//     const { maquinaId } = useParams();
//     const navigate = useNavigate();
//     const { theme } = useContext(ThemeContext);
//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [toggleCleared, setToggleCleared] = useState(false);

//     const maquinaInfo = useMemo(() => maquinas.find(m => m.id === maquinaId) || { nombre: 'Desconocida' }, [maquinaId]);

//     const fetchOperaciones = async () => {
//     if (!maquinaId) return;
//     setLoading(true);
//     try {
//         const response = await axiosInstance.get(`/registracion/operaciones/${maquinaId}`);
//         // console.log('Datos recibidos de operaciones:', JSON.stringify(response.data, null, 2));
//         setOperaciones(response.data);
//     } catch (error) {
//         Swal.fire('Error', 'No se pudieron cargar las operaciones.', 'error');
//         setOperaciones([]);
//     } finally { setLoading(false); }
//     };

//     useEffect(() => {
//         fetchOperaciones();
//     }, [maquinaId]);

//     const handleRowSelected = React.useCallback(state => { setSelectedRows(state.selectedRows); }, []);
//     const handleProcesar = async () => { /* Tu lógica de procesar */ };
//     const formatCustomDate = (dateString) => {
//     if (!dateString || typeof dateString !== 'string' || dateString.length < 12) return 'N/A';
//     try {
//         const year = dateString.substring(0, 4); const month = dateString.substring(4, 6); const day = dateString.substring(6, 8);
//         const hour = dateString.substring(8, 10); const minute = dateString.substring(10, 12);
//         return `${day}/${month}/${year} ${hour}:${minute}`;
//     } catch (e) { return 'Fecha Inválida'; }
//     };

//     const columns = useMemo(() => [
//         { name: 'Nº Op.', selector: row => row.NumeroDocumento, sortable: true, width: '120px' },
//         { name: 'Serie/Lote', selector: row => row.Origen_Lote ? row.Origen_Lote.substring(0, 11) : '', sortable: true, width: '110px' },
//         { name: 'Nro. MultiOp', selector: row => row.NumeroMultiOperacion, sortable: true, width: '110px', omit: !maquinaId.startsWith('SL') },
//         { name: 'Cortes', selector: row => row.Operacion_Cuchillas, width: '150px', style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
//         { name: 'Prog', selector: row => formatNumber(row.KilosProgramadosEntrantes), sortable: true },
//         { name: 'Stock', selector: row => formatNumber(row.Stock), sortable: true },
//         { name: 'Batch', selector: row => row.NroBatch, sortable: true },
//         { name: 'Balanza', selector: row => formatNumber(row.Kilos_Balanza), sortable: true },
//         { name: 'Abas', cell: row => row.Abastecida === '0' ? 'OK' : '' },
//         { name: 'Op.Ant.', cell: row => (!row.OpAnteriorData || row.OpAnteriorData.Estado === '2') ? (row.OpAnteriorData ? 'OK' : 'OK-R') : '' },
//         { name: 'Fecha Inicio', selector: row => row.batch_FechaInicio, format: row => formatCustomDate(row.batch_FechaInicio), sortable: true, width: '170px' },
//         { name: 'Consulta', cell: (row) => <button className="btn btn-sm btn-info" onClick={() => navigate(`/registracion/detalle/${row.Operacion_ID}`)}>Ver</button>, ignoreRowClick: true },
//     ], [navigate, maquinaId]);

// //   const conditionalRowStyles = [
// //     // Rojo: Sin stock, no abastecida o sin operación anterior válida
// //     {
// //       when: row => {
// //         const hasStock = row.Stock && parseFloat(row.Stock) > 0;
// //         const isAbastecida = row.Abastecida === '0';
// //         const opAnteriorOk = !row.OpAnteriorData || (row.OpAnteriorData && row.OpAnteriorData.Estado === '2');
// //         const result = !hasStock || !isAbastecida || !opAnteriorOk;
// //         console.log(`DEBUG Fila ${row.NumeroDocumento} -> Condición ROJO: ${result} (Stock=${hasStock}, Abastecida=${isAbastecida}, OpAnterior=${opAnteriorOk})`);
// //         return result;
// //       },
// //       style: { backgroundColor: 'var(--danger)', color: 'white' },
// //     },
// //     // Amarillo: Abierta y con registro en calidad
// //     {
// //       when: row => {
// //         const isAbierta = String(row.Estado).trim() === '1';
// //         const tieneCalidad = !!row.CalidadData;
// //         const result = isAbierta && tieneCalidad;
// //         console.log(`DEBUG Fila ${row.NumeroDocumento} -> Condición AMARILLO: ${result} (Abierta=${isAbierta}, Calidad=${tieneCalidad})`);
// //         return result;
// //       },
// //       style: { backgroundColor: 'var(--warning)', color: 'black' },
// //     },
// //     // Gris: Abierta sin calidad o con multioperación
// //     {
// //       when: row => {
// //         const isAbierta = String(row.Estado).trim() === '1';
// //         const tieneCalidad = !!row.CalidadData;
// //         const tieneMultiOp = !!row.NumeroMultiOperacion;
// //         const result = isAbierta && !tieneCalidad && !tieneMultiOp;
// //         console.log(`DEBUG Fila ${row.NumeroDocumento} -> Condición GRIS: ${result} (Abierta=${isAbierta}, Calidad=${tieneCalidad}, MultiOp=${tieneMultiOp})`);
// //         return result;
// //       },
// //       style: { backgroundColor: 'var(--secondary)', color: 'white' },
// //     },
// //     // Azul claro (Aquamarine): Suspendida
// //     {
// //       when: row => {
// //         const isSuspendida = row.Suspendida === 1;
// //         console.log(`DEBUG Fila ${row.NumeroDocumento} -> Condición SUSPENDIDA: ${isSuspendida}`);
// //         return isSuspendida;
// //       },
// //       style: { backgroundColor: '#e9ecef', color: 'black' }, // Aquamarine aproximado con #e9ecef
// //     },
// //     // Verde: Lista (cumple todas las condiciones y no está en los casos anteriores)
// //     {
// //       when: row => true, // Default para las que cumplen todas las condiciones
// //       style: { backgroundColor: 'var(--success)', color: 'white' },
// //     },
// //   ];


// // const conditionalRowStyles = [
// //   // Rojo
// //   {
// //     when: row => {
// //       const hasStock = row.Stock && parseFloat(row.Stock) > 0;
// //       const isAbastecida = row.Abastecida === '0';
// //       const opAnteriorOk = !row.OpAnteriorData || (row.OpAnteriorData && row.OpAnteriorData.Estado === '2');
// //       const result = !hasStock || !isAbastecida || !opAnteriorOk;
// //       console.log(`DEBUG Fila ${row.NumeroDocumento} -> ROJO: ${result} | Vars: Stock=${row.Stock}, Abastecida=${row.Abastecida}, OpAnteriorData=${JSON.stringify(row.OpAnteriorData)}`);
// //       return result;
// //     },
// //     style: { backgroundColor: 'var(--danger)', color: 'white' },
// //   },
// //   // Amarillo
// //   {
// //     when: row => {
// //       const isAbierta = String(row.Estado).trim() === '1';
// //       const tieneCalidad = !!row.CalidadData && Object.keys(row.CalidadData).length > 0;
// //       const result = isAbierta && tieneCalidad;
// //       console.log(`DEBUG Fila ${row.NumeroDocumento} -> AMARILLO: ${result} | Vars: Estado=${row.Estado}, CalidadData=${JSON.stringify(row.CalidadData)}`);
// //       return result;
// //     },
// //     style: { backgroundColor: 'var(--warning)', color: 'black' },
// //   },
// //   // Gris
// //   {
// //     when: row => {
// //       const isAbierta = String(row.Estado).trim() === '1';
// //       const tieneCalidad = !!row.CalidadData && Object.keys(row.CalidadData).length > 0;
// //       const tieneMultiOp = !!row.NumeroMultiOperacion && row.NumeroMultiOperacion !== '';
// //       const result = isAbierta && !tieneCalidad && !tieneMultiOp;
// //       console.log(`DEBUG Fila ${row.NumeroDocumento} -> GRIS: ${result} | Vars: Estado=${row.Estado}, CalidadData=${JSON.stringify(row.CalidadData)}, NumeroMultiOperacion=${row.NumeroMultiOperacion}`);
// //       return result;
// //     },
// //     style: { backgroundColor: 'var(--secondary)', color: 'white' },
// //   },
// //   // Suspendida
// //   {
// //     when: row => {
// //       const isSuspendida = row.Suspendida === 1;
// //       console.log(`DEBUG Fila ${row.NumeroDocumento} -> SUSPENDIDA: ${isSuspendida} | Vars: Suspendida=${row.Suspendida}`);
// //       return isSuspendida;
// //     },
// //     style: { backgroundColor: '#e9ecef', color: 'black' },
// //   },
// //   // Verde (default)
// //   {
// //     when: row => true,
// //     style: { backgroundColor: 'var(--success)', color: 'white' },
// //   },
// // ];




//     const conditionalRowStyles = [];
//     let loggedRows = new Set();

//     conditionalRowStyles.push({
//     when: row => {
//         console.log("!loggedRows.has(row.NumeroDocumento) Rojo", !loggedRows.has(row.NumeroDocumento));
//         if (!loggedRows.has(row.NumeroDocumento)) {
//         const stock = row.Stock ? parseFloat(row.Stock) : 0;
//         const hasStock = !isNaN(stock) && stock <= 0;
//         const isAbastecida = row.Abastecida === '0';
//         const result = hasStock && !isAbastecida; // Rojo solo si no hay stock y no está abastecida
//         console.log(`Fila ${row.NumeroDocumento} | Rojo - Vars: Stock=${stock}, Abastecida=${row.Abastecida} | Color esperado: ${result ? 'Rojo' : 'Ninguno'}`);
//         loggedRows.add(row.NumeroDocumento);
//         return result;
//         }
//         return false;
//     },
//     style: {
//         backgroundColor: '#dc3545 !important',
//         color: 'white !important',
//         '&:hover': { backgroundColor: '#dc3545 !important' } // Forzar hover también
//     },
//     });

//     conditionalRowStyles.push({
//     when: row => {
//         if (!loggedRows.has(row.NumeroDocumento)) {
//         const estado = String(row.Estado || '').trim();
//         const isAbierta = estado === '1';
//         const calidadData = row.CalidadData || null;
//         const tieneCalidad = calidadData && Object.keys(calidadData).length > 0;
//         const result = isAbierta && tieneCalidad;
//         console.log(`Fila ${row.NumeroDocumento} | Amarillo - Vars: Estado=${estado}, Calidad=${JSON.stringify(calidadData)} | Color esperado: ${result ? 'Amarillo' : 'Ninguno'}`);
//         loggedRows.add(row.NumeroDocumento);
//         return result;
//         }
//         return false;
//     },
//     style: {
//         backgroundColor: '#ffc107 !important',
//         color: 'black !important',
//         '&:hover': { backgroundColor: '#ffc107 !important' }
//     },
//     });

//     conditionalRowStyles.push({
//     when: row => {
//         if (!loggedRows.has(row.NumeroDocumento)) {
//         const estado = String(row.Estado || '').trim();
//         const isAbierta = estado === '1';
//         const calidadData = row.CalidadData || null;
//         const tieneCalidad = calidadData && Object.keys(calidadData).length > 0;
//         const result = isAbierta && !tieneCalidad;
//         console.log(`Fila ${row.NumeroDocumento} | Gris - Vars: Estado=${estado}, Calidad=${JSON.stringify(calidadData)} | Color esperado: ${result ? 'Gris' : 'Ninguno'}`);
//         loggedRows.add(row.NumeroDocumento);
//         return result;
//         }
//         return false;
//     },
//     style: {
//         backgroundColor: '#6c757d !important',
//         color: 'white !important',
//         '&:hover': { backgroundColor: '#6c757d !important' }
//     },
//     });

//     conditionalRowStyles.push({
//     when: row => {
//         if (!loggedRows.has(row.NumeroDocumento)) {
//         const suspendida = row.Suspendida || 0;
//         const result = suspendida === 1;
//         console.log(`Fila ${row.NumeroDocumento} | Suspendida - Vars: Suspendida=${suspendida} | Color esperado: ${result ? 'Suspendida' : 'Ninguno'}`);
//         loggedRows.add(row.NumeroDocumento);
//         return result;
//         }
//         return false;
//     },
//     style: {
//         backgroundColor: '#e9ecef !important',
//         color: 'black !important',
//         '&:hover': { backgroundColor: '#e9ecef !important' }
//     },
//     });

//     conditionalRowStyles.push({
//     when: row => true,
//     style: {
//         backgroundColor: '#28a745',
//         color: 'white',
//         '&:hover': { backgroundColor: '#28a745' }
//     },
//     });

    

//     return (
//         <>
//         <div className="content-header">
//             <div className="container-fluid">
//             <div className="d-flex justify-content-between align-items-center">
//                 <h1><b>SRP - Operaciones Pendientes {maquinaInfo.nombre}</b></h1>
//                 <button className="btn btn-secondary" onClick={() => navigate('/registracion')}>
//                 <i className="fas fa-arrow-left mr-2"></i>Volver a Máquinas
//                 </button>
//             </div>
//             </div>
//         </div>
//         <div className="content">
//             <div className="container-fluid">
//             <div className="card card-primary card-outline">
//                 <div className="card-body p-0">
//                 <DataTable
//                     columns={columns}
//                     data={operaciones}
//                     progressPending={loading}
//                     progressComponent={<div className="py-5 text-center"><div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div><div className="mt-2">Loading...</div></div>}
//                     noDataComponent={<div className='py-5 text-center text-muted'>No hay operaciones pendientes para esta máquina.</div>}
//                     pagination
//                     striped
//                     highlightOnHover
//                     selectableRows
//                     onSelectedRowsChange={handleRowSelected}
//                     clearSelectedRows={toggleCleared}
//                     conditionalRowStyles={conditionalRowStyles}
//                     theme={theme === 'dark' ? 'adminLteDark' : 'default'}
//                 />
//                 </div>
//                 <div className="card-footer text-right">
//                 <button className="btn btn-primary btn-lg" onClick={handleProcesar} disabled={selectedRows.length === 0 || loading}>
//                     PROCESAR
//                 </button>
//                 </div>
//             </div>
//             </div>
//         </div>
//         </>
//     );
// };

// export default Operaciones;
// // src/pages/OperacionesEmbalaje.jsx
// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axiosInstance';
// import Swal from 'sweetalert2';
// import DataTable from 'react-data-table-component';
// import { ThemeContext } from '../context/ThemeContext';
// import { useAuth } from '../context/AuthContext';

// // Icono de Calidad cuadrado como en el original
// const CaliIcon = ({ iconType }) => {
//     const styles = {
//         width: '18px', height: '18px',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         borderRadius: '0px', border: '1px solid #333'
//     };
//     switch (iconType) {
//         case 'rojo-fondo': return <div style={{...styles, backgroundColor: 'red'}}></div>;
//         case 'verde-fondo': return <div style={{...styles, backgroundColor: 'green'}}></div>;
//         case 'gris-fondo': return <div style={{...styles, backgroundColor: 'grey'}}></div>;
//         case 'amarillo-fondo': return <div style={{...styles, backgroundColor: 'yellow'}}></div>; 
//         case 'blanco-fondo': return <div style={{...styles, backgroundColor: 'white', border: '1px solid #ccc'}}></div>;
//         case 'rojo-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-times-circle text-danger" style={{fontSize: '12px'}}></i></div>;
//         case 'verde-tilde-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-check-circle text-success" style={{fontSize: '12px'}}></i></div>;
//         default: return null;
//     };
// };

// // LÓGICA DE COLORES IDÉNTICA AL VB.NET
// const calcularEstadoYColorVB = (row) => {
//     const tieneStock = row.Stock && parseFloat(row.Stock) > 0;
//     const estaAbastecida = row.Abastecida === '0'; // '0' = sí abastecida
//     const estadoOp = row.Estado; // '0' = cerrada, '1' = abierta
//     const estaSuspendida = row.Suspendida == 1;
//     const estadoAnterior = row.EstadoAnterior; // '0' = abierta, '2' = cerrada
//     const suspendidaAnterior = row.SuspendidaAnterior == 1;
//     const tieneCalidad = row.TieneCalidad;
//     const dictamenCalidad = row.DictamenCalidad; // null, 0, 1, 2
//     const esPreembalaje = row.Preembalaje === '1';
    
//     // Verificar tolerancia (solo para operaciones cerradas)
//     let fueraTolerancia = false;
//     if (estadoOp === '0' && tieneStock && row.Kilos_Balanza > 0) {
//         const stock = parseFloat(row.Stock);
//         const pesada = parseFloat(row.Kilos_Balanza);
//         const opAnteriorOk = row.OpAnteriorStatus === 'OK' || row.OpAnteriorStatus === 'OK-R';
//         const toleranciaPorcentaje = opAnteriorOk && row.OpAnteriorStatus === 'OK-R' ? 0.05 : 0.01;
//         let margenTolerancia = stock * toleranciaPorcentaje;
//         if (margenTolerancia < 1) margenTolerancia = 1;
        
//         if (pesada > stock + margenTolerancia || pesada < stock - margenTolerancia) {
//             fueraTolerancia = true;
//         }
//     }

//     // LÓGICA IDÉNTICA AL VB.NET PARA EMBALAJE
//     if (estaSuspendida) {
//         // Suspendida = blanco
//         return { 
//             backgroundColor: '#FFFFFF', 
//             color: 'black', 
//             caliIcon: 'blanco-fondo',
//             seleccionable: false,
//             preembalajeText: ''
//         };
//     }
    
//     if (tieneStock && estaAbastecida && (row.OpAnteriorStatus === 'OK' || row.OpAnteriorStatus === 'OK-R')) {
//         // En condiciones normales de registrar
//         if (estadoOp === '1' && tieneCalidad && dictamenCalidad === 0) {
//             // Abierta y en calidad (sin dictamen)
//             return { 
//                 backgroundColor: '#FFFF00', 
//                 color: 'black', 
//                 caliIcon: 'rojo-icono',
//                 seleccionable: false,
//                 preembalajeText: ''
//             };
//         } else if (estadoOp === '1' && tieneCalidad && (dictamenCalidad === 1 || dictamenCalidad === 2)) {
//             // Abierta y calidad dictaminada
//             return { 
//                 backgroundColor: '#EEE8AA', 
//                 color: 'black', 
//                 caliIcon: 'verde-tilde-icono',
//                 seleccionable: false,
//                 preembalajeText: ''
//             };
//         } else if (estadoOp === '1' && !tieneCalidad) {
//             // Abierta y no en calidad = gris
//             return { 
//                 backgroundColor: '#808080', 
//                 color: 'white', 
//                 caliIcon: 'gris-fondo',
//                 seleccionable: true,
//                 preembalajeText: ''
//             };
//         } else {
//             // Cerrada y en condiciones
//             if (fueraTolerancia) {
//                 // Fuera de tolerancia = amarillo
//                 return { 
//                     backgroundColor: '#FFFF00', 
//                     color: 'black', 
//                     caliIcon: 'amarillo-fondo',
//                     seleccionable: false,
//                     preembalajeText: ''
//                 };
//             } else {
//                 // Lista para embalaje = verde
//                 return { 
//                     backgroundColor: '#00FF00', 
//                     color: 'black', 
//                     caliIcon: 'verde-fondo',
//                     seleccionable: true,
//                     preembalajeText: ''
//                 };
//             }
//         }
//     } else {
//         // NO en condiciones normales - LÓGICA ESPECIAL DE EMBALAJE
        
//         // CORRECCIÓN CLAVE: estadoAnterior !== '0' (no estadoAnterior === '0')
//         // Si la operación anterior está ABIERTA (EstadoAnterior != '0') Y no está suspendida anteriormente
//         // → ES PREEMBALAJE (se puede procesar antes de que termine la anterior)
//         if (estadoAnterior !== '0' && !suspendidaAnterior) {
//             if (estadoOp === '1' && !tieneCalidad) {
//                 // Abierta en preembalaje = gris claro
//                 return { 
//                     backgroundColor: '#E0E0E0', 
//                     color: 'black', 
//                     caliIcon: 'gris-fondo',
//                     seleccionable: true,
//                     preembalajeText: '+ PESO' // SOLO APARECE EN GRIS CLARO
//                 };
//             } else {
//                 // Cerrada en preembalaje = lawn green
//                 return { 
//                     backgroundColor: '#7CFC00', 
//                     color: 'black', 
//                     caliIcon: 'verde-fondo',
//                     seleccionable: true,
//                     preembalajeText: '' // SIN TEXTO EN VERDE LAWN
//                 };
//             }
//         } else {
//             // Bloqueada = rojo
//             return { 
//                 backgroundColor: '#FF0000', 
//                 color: 'white', 
//                 caliIcon: 'rojo-fondo',
//                 seleccionable: false,
//                 preembalajeText: ''
//             };
//         }
//     }
// };

// const OperacionesEmbalaje = () => {
//     const { maquinaId } = useParams();
//     const navigate = useNavigate();
//     const { theme } = useContext(ThemeContext);
//     const { user } = useAuth();

//     const [operaciones, setOperaciones] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedRows, setSelectedRows] = useState([]);

//     const fetchOperaciones = async () => {
//         setLoading(true);
//         try {
//             const response = await axiosInstance.get(`/registracion/operaciones/embalaje/${maquinaId}`);
//             setOperaciones(response.data);
//         } catch (error) {
//             console.error("Error al cargar operaciones:", error);
//             Swal.fire('Error', 'Error al cargar datos.', 'error');
//             setOperaciones([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchOperaciones();
//         const interval = setInterval(fetchOperaciones, 30000);
//         return () => clearInterval(interval);
//     }, [maquinaId]);

//     const formatNumber = (num) => {
//         if (num == null || num === '') return '0';
//         const parsed = parseFloat(num);
//         return parsed.toLocaleString('es-AR', { 
//             minimumFractionDigits: 0, 
//             maximumFractionDigits: 0 
//         });
//     };

//     const formatCustomDate = (dateString) => {
//         if (!dateString || typeof dateString !== 'string' || dateString.length < 8) return 'N/A';
//         try {
//             const year = dateString.substring(0, 4); 
//             const month = dateString.substring(4, 6); 
//             const day = dateString.substring(6, 8);
//             return `${day}/${month}/${year}`;
//         } catch (e) { 
//             return 'Fecha Inválida'; 
//         }
//     };

//     const handleRowClicked = (row) => {
//         const estado = calcularEstadoYColorVB(row);
        
//         if (estado.seleccionable || row.Estado === '1') {
//             // Permitir apertura si está en proceso o es seleccionable
//             navigate(`/registracion/detalle/${row.Operacion_ID}`, { 
//                 state: { 
//                     operationStatus: estado,
//                     origen: "OperacionesEmbalaje"
//                 } 
//             });
//         }
//     };

//     const handleProcesar = async () => {
//         if (selectedRows.length === 0) {
//             return Swal.fire('Atención', 'Debe seleccionar al menos una operación para procesar.', 'warning');
//         }

//         const primeraOperacion = selectedRows[0];
//         const serieLoteBase = primeraOperacion.Origen_Lote?.substring(0, 5);
//         const numeroPedidoBase = primeraOperacion.NumeroPedido;
//         const anchoBase = primeraOperacion.CodProdPedido?.substring(19, 4) || '0000';

//         let hayError = false;
//         let mensajeError = '';
        
//         for (const row of selectedRows) {
//             const serieLote = row.Origen_Lote?.substring(0, 5);
//             const numeroPedido = row.NumeroPedido;
//             const ancho = row.CodProdPedido?.substring(19, 4) || '0000';
            
//             if (serieLote !== serieLoteBase || numeroPedido !== numeroPedidoBase) {
//                 hayError = true;
//                 mensajeError = 'Las operaciones seleccionadas deben ser del mismo PEDIDO y la misma SERIE o de la misma SERIE/LOTE (en caso de ser PEDIDOS distintos) y Siempre los ANCHOS deben ser iguales';
//                 break;
//             }
            
//             if (ancho !== anchoBase) {
//                 hayError = true;
//                 mensajeError = 'Los anchos de las operaciones seleccionadas deben ser iguales';
//                 break;
//             }
//         }

//         if (hayError) {
//             return Swal.fire('Error de Validación', mensajeError, 'error');
//         }

//         const operacionesNombres = selectedRows.map(r => r.NumeroDocumento).join(' / ');
//         const result = await Swal.fire({
//             title: 'Confirma MULTIOPERACION',
//             html: `Se abrirán las Operaciones:<br>${operacionesNombres}<br>CONFIRMA?`,
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonText: 'Sí',
//             cancelButtonText: 'No'
//         });

//         if (result.isConfirmed) {
//             const operacionesData = selectedRows.map(row => ({
//                 id: row.Operacion_ID,
//                 nroBatch: row.NroBatch
//             }));
//             try {
//                 Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
//                 const response = await axiosInstance.post('/registracion/operaciones/procesar', { operacionesData });
//                 Swal.close();
//                 await Swal.fire('Éxito', `Multi-Operación #${response.data.multiOperacionId} creada.`, 'success');
//                 fetchOperaciones();
//             } catch (error) {
//                 console.error('Error al procesar operaciones:', error);
//                 Swal.fire('Error', error.response?.data?.error || 'No se pudo procesar la selección.', 'error');
//             }
//         }
//     };

//     const columns = useMemo(() => [
//         { name: 'Nro. Pedido', selector: row => row.NumeroPedido || '', sortable: true, width: '90px', wrap: true },
//         { name: 'Nro. Item', selector: row => row.NumeroItem || '', sortable: true, width: '70px', wrap: true },
//         { name: 'Nº Operación', selector: row => row.NumeroDocumento || '', sortable: true, width: '130px', wrap: true },
//         { name: 'Serie/Lote', selector: row => row.Origen_Lote?.substring(0, 11) || '', sortable: true, width: '110px', wrap: true },
//         { name: 'Nro. MultiOp.', selector: row => row.NumeroMultiOperacion || '', sortable: true, width: '100px', wrap: true },
//         { name: 'Prog.', selector: row => formatNumber(row.KilosProgramadosEntrantes), right: true, width: '70px' },
//         { name: 'Stock', selector: row => formatNumber(row.Stock), right: true, width: '70px' },
//         { name: 'Batch', selector: row => row.NroBatch || '', sortable: true, width: '80px', wrap: true },
//         { name: 'Balanza', selector: row => formatNumber(row.Kilos_Balanza), right: true, width: '80px' },
//         { name: 'Abas', selector: row => row.Abastecida === '0' ? 'OK' : '', width: '60px', center: true },
//         { name: 'OpAnt', selector: row => row.OpAnteriorStatus || '', width: '60px', center: true },
//         { name: 'Clientes', selector: row => row.Clientes || '', width: '150px', wrap: true },
//         { name: 'Cali', cell: row => <CaliIcon iconType={calcularEstadoYColorVB(row).caliIcon} />, width: '50px', center: true },
//         { name: 'Ancho', selector: row => formatNumber(row.Ancho), right: true, width: '70px' },
//         { name: 'Flia.', selector: row => row.Familia || '', width: '50px', center: true },
//         { name: 'Esp.', selector: row => row.Espesor || '', width: '60px', right: true },
//         { name: 'Fecha Inicio', 
//           selector: row => row.batch_FechaInicio, 
//           format: row => formatCustomDate(row.batch_FechaInicio), 
//           sortable: true, 
//           width: '100px' },
//         { name: 'Consulta', 
//           cell: row => (
//             <button 
//               className="btn btn-xs btn-default border" 
//               onClick={(e) => {
//                 e.stopPropagation();
//                 navigate(`/registracion/detalle/${row.Operacion_ID}`, { 
//                     state: { operationStatus: calcularEstadoYColorVB(row), origen: "OperacionesEmbalaje" } 
//                 });
//               }}
//             >
//               Ver
//             </button>
//           ), 
//           width: '80px', 
//           center: true 
//         },
//         { name: 'Preembalaje', 
//           selector: row => calcularEstadoYColorVB(row).preembalajeText, 
//           width: '100px', 
//           center: true 
//         },
//         { name: 'Tarea', selector: row => row.Tarea || '', width: '120px', wrap: true },
//         { name: 'Pag/Ata', selector: row => row.CantidadPaquetes || '', width: '70px', center: true },
//         { name: 'Hoj/Roll', selector: row => row.CantidadRollos || '', width: '80px', center: true },
//         { name: 'Cod Prod Pedido', selector: row => row.CodProdPedido || '', width: '150px', wrap: true }
//     ], [navigate]);

//     // ESTILOS DE FILA - LÓGICA IDÉNTICA AL VB.NET
//     const conditionalRowStyles = [
//         {
//             when: row => {
//                 const estado = calcularEstadoYColorVB(row);
//                 return estado.backgroundColor === '#FF0000'; // Rojo - BLOQUEADA
//             },
//             style: { backgroundColor: '#FF0000', color: 'white' }
//         },
//         {
//             when: row => {
//                 const estado = calcularEstadoYColorVB(row);
//                 return estado.backgroundColor === '#7CFC00'; // LawnGreen - Preembalaje cerrada
//             },
//             style: { backgroundColor: '#7CFC00', color: 'black' }
//         },
//         {
//             when: row => {
//                 const estado = calcularEstadoYColorVB(row);
//                 return estado.backgroundColor === '#00FF00'; // Verde - LISTA
//             },
//             style: { backgroundColor: '#00FF00', color: 'black' }
//         },
//         {
//             when: row => {
//                 const estado = calcularEstadoYColorVB(row);
//                 return estado.backgroundColor === '#E0E0E0'; // Gris claro - Preembalaje abierta
//             },
//             style: { backgroundColor: '#E0E0E0', color: 'black' }
//         },
//         {
//             when: row => {
//                 const estado = calcularEstadoYColorVB(row);
//                 return estado.backgroundColor === '#808080'; // Gris - EN_PROCESO
//             },
//             style: { backgroundColor: '#808080', color: 'white' }
//         },
//         {
//             when: row => {
//                 const estado = calcularEstadoYColorVB(row);
//                 return estado.backgroundColor === '#FFFF00'; // Amarillo - Tolerancia/Calidad
//             },
//             style: { backgroundColor: '#FFFF00', color: 'black' }
//         },
//         {
//             when: row => {
//                 const estado = calcularEstadoYColorVB(row);
//                 return estado.backgroundColor === '#EEE8AA'; // PaleGoldenrod - Calidad dictaminada
//             },
//             style: { backgroundColor: '#EEE8AA', color: 'black' }
//         },
//         {
//             when: row => {
//                 const estado = calcularEstadoYColorVB(row);
//                 return estado.backgroundColor === '#FFFFFF'; // Blanco - SUSPENDIDA
//             },
//             style: { backgroundColor: '#FFFFFF', color: 'black' }
//         }
//     ];

//     const customStyles = {
//         table: { style: { backgroundColor: 'white' } },
//         headRow: { style: { backgroundColor: 'white', color: 'black', fontWeight: 'bold', fontSize: '11px', fontStyle: 'italic', minHeight: '30px' } },
//         rows: { style: { minHeight: '26px', fontSize: '12px', borderBottom: '1px solid #ccc' } },
//         cells: { style: { padding: '2px' } }
//     };

//     const selectableRowDisabled = (row) => {
//         const estado = calcularEstadoYColorVB(row);
//         return !estado.seleccionable;
//     };

//     return (
//         <div style={{backgroundColor: '#800000', minHeight: '100vh', padding: '10px'}}>
//             <div className="container-fluid">
//                 {/* Header Superior */}
//                 <div className="d-flex justify-content-between align-items-start mb-2" style={{color: 'white'}}>
//                     <div>
//                         <h6 className="m-0"><i>REGISTRACION - Producción</i></h6>
//                         <h5 className="m-0"><b>SRP - Operaciones Pendientes Embalaje</b></h5>
//                     </div>
//                     <div className="text-center">
//                         <span style={{background: 'black', color: 'red', padding: '2px 30px', fontWeight: 'bold', fontSize: '20px'}}>Embalaje</span>
//                     </div>
//                     <div className="d-flex flex-column align-items-end">
//                         <span>Usuario: {user?.nombre || 'Desconocido'}</span>
//                         <button className="btn btn-sm btn-light mt-1" onClick={() => navigate('/registracion')}>
//                             <i className="fas fa-door-open" style={{fontSize: '24px', color: '#B8860B'}}></i>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Tabla de Datos */}
//                 <div className="card" style={{borderRadius: '0px'}}>
//                     <div className="card-body p-0 border">
//                         <DataTable
//                             columns={columns}
//                             data={operaciones}
//                             progressPending={loading}
//                             progressComponent={<div className="py-5"><div className="spinner-border text-primary"></div></div>}
//                             conditionalRowStyles={conditionalRowStyles}
//                             customStyles={customStyles}
//                             fixedHeader
//                             fixedHeaderScrollHeight="60vh"
//                             selectableRows
//                             onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
//                             noDataComponent={<div className="p-3">No hay datos</div>}
//                             pagination
//                             paginationPerPage={10}
//                             paginationRowsPerPageOptions={[10, 25, 50, 100]}
//                             paginationComponentOptions={{
//                                 rowsPerPageText: 'Filas por página:',
//                                 rangeSeparatorText: 'de',
//                                 selectAllRowsItem: true,
//                                 selectAllRowsItemText: 'Todos'
//                             }}
//                             highlightOnHover
//                             selectableRowDisabled={selectableRowDisabled}
//                             onRowClicked={handleRowClicked}
//                         />
//                     </div>
//                 </div>

//                 {/* REFERENCIAS DE COLORES */}
//                 <div className="row mt-2 text-white" style={{fontSize: '11px', fontWeight: 'bold'}}>
//                     <div className="col-md-9">
//                         <div className="row">
//                             <div className="col-4 d-flex align-items-center mb-1">
//                                 <div style={{width: '20px', height: '14px', background: 'green', border: '1px solid white', marginRight: '5px'}}></div>
//                                 <span>Cerrada - Lista para Embalaje</span>
//                             </div>
//                             <div className="col-4 d-flex align-items-center mb-1">
//                                 <div style={{width: '20px', height: '14px', background: 'grey', border: '1px solid white', marginRight: '5px'}}></div>
//                                 <span>Abierta - En proceso de Embalaje</span>
//                             </div>
//                             <div className="col-4 d-flex align-items-center mb-1">
//                                 <div style={{width: '20px', height: '14px', background: 'yellow', border: '1px solid white', marginRight: '5px'}}></div>
//                                 <span>En Calidad o fuera de tolerancia</span>
//                             </div>
//                             <div className="col-4 d-flex align-items-center">
//                                 <div style={{width: '20px', height: '14px', background: 'lawngreen', border: '1px solid white', marginRight: '5px'}}></div>
//                                 <span>Cerrada - Preembalaje</span>
//                             </div>
//                             <div className="col-4 d-flex align-items-center">
//                                 <div style={{width: '20px', height: '14px', background: 'white', border: '1px solid #ccc', marginRight: '5px'}}></div>
//                                 <span>Abierta - En proceso de Preembalaje</span>
//                             </div>
//                             <div className="col-4 d-flex align-items-center">
//                                 <div style={{width: '20px', height: '14px', background: 'red', border: '1px solid white', marginRight: '5px'}}></div>
//                                 <span>No puede procesarse</span>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="col-md-3 text-right">
//                         <button className="btn btn-light btn-lg px-5" 
//                                 style={{borderRadius: '0px', fontWeight: 'bold', color: 'black', fontSize: '18px'}}
//                                 onClick={handleProcesar}
//                                 disabled={selectedRows.length === 0 || loading}>
//                             PROCESAR
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OperacionesEmbalaje;











// src/pages/OperacionesEmbalaje.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Icono de Calidad cuadrado como en el original
const CaliIcon = ({ iconType }) => {
    const styles = {
        width: '18px', height: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '0px', border: '1px solid #333'
    };
    switch (iconType) {
        case 'rojo-fondo': return <div style={{...styles, backgroundColor: 'red'}}></div>;
        case 'verde-fondo': return <div style={{...styles, backgroundColor: 'green'}}></div>;
        case 'gris-fondo': return <div style={{...styles, backgroundColor: 'grey'}}></div>;
        case 'amarillo-fondo': return <div style={{...styles, backgroundColor: 'yellow'}}></div>; 
        case 'blanco-fondo': return <div style={{...styles, backgroundColor: 'white', border: '1px solid #ccc'}}></div>;
        case 'rojo-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-times-circle text-danger" style={{fontSize: '12px'}}></i></div>;
        case 'verde-tilde-icono': return <div style={{...styles, backgroundColor: 'yellow'}}><i className="fas fa-check-circle text-success" style={{fontSize: '12px'}}></i></div>;
        default: return null;
    };
};

// LÓGICA DE COLORES IDÉNTICA AL VB.NET
const calcularEstadoYColorVB = (row) => {
    const tieneStock = row.Stock && parseFloat(row.Stock) > 0;
    const estaAbastecida = row.Abastecida === '0'; // '0' = sí abastecida
    const estadoOp = row.Estado; // '0' = cerrada, '1' = abierta
    const estaSuspendida = row.Suspendida == 1;
    const estadoAnterior = row.EstadoAnterior; // '0' = abierta, '2' = cerrada
    const suspendidaAnterior = row.SuspendidaAnterior == 1;
    const tieneCalidad = row.TieneCalidad;
    const dictamenCalidad = row.DictamenCalidad; // null, 0, 1, 2
    const esPreembalaje = row.Preembalaje === '1';
    
    // Verificar tolerancia (solo para operaciones cerradas)
    let fueraTolerancia = false;
    if (estadoOp === '0' && tieneStock && row.Kilos_Balanza > 0) {
        const stock = parseFloat(row.Stock);
        const pesada = parseFloat(row.Kilos_Balanza);
        const opAnteriorOk = row.OpAnteriorStatus === 'OK' || row.OpAnteriorStatus === 'OK-R';
        const toleranciaPorcentaje = opAnteriorOk && row.OpAnteriorStatus === 'OK-R' ? 0.05 : 0.01;
        let margenTolerancia = stock * toleranciaPorcentaje;
        if (margenTolerancia < 1) margenTolerancia = 1;
        
        if (pesada > stock + margenTolerancia || pesada < stock - margenTolerancia) {
            fueraTolerancia = true;
        }
    }

    // LÓGICA IDÉNTICA AL VB.NET PARA EMBALAJE
    if (estaSuspendida) {
        // Suspendida = blanco
        return { 
            backgroundColor: '#FFFFFF', 
            color: 'black', 
            caliIcon: 'blanco-fondo',
            seleccionable: false,
            preembalajeText: ''
        };
    }
    
    if (tieneStock && estaAbastecida && (row.OpAnteriorStatus === 'OK' || row.OpAnteriorStatus === 'OK-R')) {
        // En condiciones normales de registrar
        if (estadoOp === '1' && tieneCalidad && dictamenCalidad === 0) {
            // Abierta y en calidad (sin dictamen)
            return { 
                backgroundColor: '#FFFF00', 
                color: 'black', 
                caliIcon: 'rojo-icono',
                seleccionable: false,
                preembalajeText: ''
            };
        } else if (estadoOp === '1' && tieneCalidad && (dictamenCalidad === 1 || dictamenCalidad === 2)) {
            // Abierta y calidad dictaminada
            return { 
                backgroundColor: '#EEE8AA', 
                color: 'black', 
                caliIcon: 'verde-tilde-icono',
                seleccionable: false,
                preembalajeText: ''
            };
        } else if (estadoOp === '1' && !tieneCalidad) {
            // Abierta y no en calidad = gris
            return { 
                backgroundColor: '#808080', 
                color: 'white', 
                caliIcon: 'gris-fondo',
                seleccionable: true,
                preembalajeText: ''
            };
        } else {
            // Cerrada y en condiciones
            if (fueraTolerancia) {
                // Fuera de tolerancia = amarillo
                return { 
                    backgroundColor: '#FFFF00', 
                    color: 'black', 
                    caliIcon: 'amarillo-fondo',
                    seleccionable: false,
                    preembalajeText: ''
                };
            } else {
                // Lista para embalaje = verde
                return { 
                    backgroundColor: '#00FF00', 
                    color: 'black', 
                    caliIcon: 'verde-fondo',
                    seleccionable: true,
                    preembalajeText: ''
                };
            }
        }
    } else {
        // NO en condiciones normales - LÓGICA ESPECIAL DE EMBALAJE
        
        // CORRECCIÓN CLAVE: estadoAnterior !== '0' (no estadoAnterior === '0')
        // Si la operación anterior está ABIERTA (EstadoAnterior != '0') Y no está suspendida anteriormente
        // → ES PREEMBALAJE (se puede procesar antes de que termine la anterior)
        if (estadoAnterior !== '0' && !suspendidaAnterior) {
            if (estadoOp === '1' && !tieneCalidad) {
                // Abierta en preembalaje = gris claro
                return { 
                    backgroundColor: '#E0E0E0', 
                    color: 'black', 
                    caliIcon: 'gris-fondo',
                    seleccionable: true,
                    preembalajeText: '+ PESO' // SOLO APARECE EN GRIS CLARO
                };
            } else {
                // Cerrada en preembalaje = lawn green
                return { 
                    backgroundColor: '#7CFC00', 
                    color: 'black', 
                    caliIcon: 'verde-fondo',
                    seleccionable: true,
                    preembalajeText: '' // SIN TEXTO EN VERDE LAWN
                };
            }
        } else {
            // Bloqueada = rojo
            return { 
                backgroundColor: '#FF0000', 
                color: 'white', 
                caliIcon: 'rojo-fondo',
                seleccionable: false,
                preembalajeText: ''
            };
        }
    }
};

const OperacionesEmbalaje = () => {
    const { maquinaId } = useParams();
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const { user } = useAuth();

    const [operaciones, setOperaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);

    const fetchOperaciones = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/registracion/operaciones/embalaje/${maquinaId}`);
            setOperaciones(response.data);
        } catch (error) {
            console.error("Error al cargar operaciones:", error);
            Swal.fire('Error', 'Error al cargar datos.', 'error');
            setOperaciones([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOperaciones();
        const interval = setInterval(fetchOperaciones, 30000);
        return () => clearInterval(interval);
    }, [maquinaId]);

    const formatNumber = (num) => {
        if (num == null || num === '') return '0';
        const parsed = parseFloat(num);
        return parsed.toLocaleString('es-AR', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        });
    };

    const formatCustomDate = (dateString) => {
        if (!dateString || typeof dateString !== 'string' || dateString.length < 8) return 'N/A';
        try {
            const year = dateString.substring(0, 4); 
            const month = dateString.substring(4, 6); 
            const day = dateString.substring(6, 8);
            return `${day}/${month}/${year}`;
        } catch (e) { 
            return 'Fecha Inválida'; 
        }
    };

    // const handleRowClicked = (row) => {
    //     const estado = calcularEstadoYColorVB(row);
        
    //     // ✅ Verificar por ESTADO en lugar de color
    //     // Gris claro (#E0E0E0): Preembalaje abierta
    //     const esPreembalajeAbierta = row.Estado === '1' && !row.TieneCalidad && 
    //                                 row.EstadoAnterior !== '0' && !row.SuspendidaAnterior;
        
    //     // Gris oscuro (#808080): Abierta sin calidad (no es preembalaje)
    //     const esAbiertaSinCalidad = row.Estado === '1' && !row.TieneCalidad && 
    //                                 (row.EstadoAnterior === '0' || row.SuspendidaAnterior);
        
    //     // Amarillo (#FFFF00): En calidad o fuera de tolerancia
    //     const esEnCalidad = row.Estado === '1' && row.TieneCalidad && row.DictamenCalidad === 0;
    //     const esFueraTolerancia = row.Estado === '0' && row.Stock && parseFloat(row.Stock) > 0 && 
    //                             row.Kilos_Balanza > 0 && 
    //                             (() => {
    //                                 const stock = parseFloat(row.Stock);
    //                                 const pesada = parseFloat(row.Kilos_Balanza);
    //                                 const opAnteriorOk = row.OpAnteriorStatus === 'OK' || row.OpAnteriorStatus === 'OK-R';
    //                                 const toleranciaPorcentaje = opAnteriorOk && row.OpAnteriorStatus === 'OK-R' ? 0.05 : 0.01;
    //                                 let margenTolerancia = stock * toleranciaPorcentaje;
    //                                 if (margenTolerancia < 1) margenTolerancia = 1;
    //                                 return pesada > stock + margenTolerancia || pesada < stock - margenTolerancia;
    //                             })();
        
    //     // ✅ Solo permitir click en estos estados
    //     if (esPreembalajeAbierta || esAbiertaSinCalidad || esEnCalidad || esFueraTolerancia) {
    //         navigate(`/registracion/detalle/${row.Operacion_ID}`, { 
    //             state: { 
    //                 operationStatus: estado,
    //                 origen: "OperacionesEmbalaje"
    //             } 
    //         });
    //     }
    //     // Si no cumple ninguna condición, no hace nada
    // };



    const handleRowClicked = (row) => {
        const estado = calcularEstadoYColorVB(row);
        
        const esPreembalajeAbierta = row.Estado === '1' && !row.TieneCalidad && 
                                    row.EstadoAnterior !== '0' && !row.SuspendidaAnterior;
        const esAbiertaSinCalidad = row.Estado === '1' && !row.TieneCalidad && 
                                    (row.EstadoAnterior === '0' || row.SuspendidaAnterior);
        const esEnCalidad = row.Estado === '1' && row.TieneCalidad && row.DictamenCalidad === 0;
        const esFueraTolerancia = row.Estado === '0' && row.Stock && parseFloat(row.Stock) > 0 && 
                                row.Kilos_Balanza > 0 && 
                                (() => {
                                    const stock = parseFloat(row.Stock);
                                    const pesada = parseFloat(row.Kilos_Balanza);
                                    const opAnteriorOk = row.OpAnteriorStatus === 'OK' || row.OpAnteriorStatus === 'OK-R';
                                    const toleranciaPorcentaje = opAnteriorOk && row.OpAnteriorStatus === 'OK-R' ? 0.05 : 0.01;
                                    let margenTolerancia = stock * toleranciaPorcentaje;
                                    if (margenTolerancia < 1) margenTolerancia = 1;
                                    return pesada > stock + margenTolerancia || pesada < stock - margenTolerancia;
                                })();
        
        if (esPreembalajeAbierta || esAbiertaSinCalidad || esEnCalidad || esFueraTolerancia) {
            navigate(`/registracion/editar-embalaje/${row.Operacion_ID}`, { 
                state: { 
                    operationStatus: estado,
                    origen: "OperacionesEmbalaje"
                } 
            });
        }
    };

    const handleProcesar = async () => {
        if (selectedRows.length === 0) {
            return Swal.fire('Atención', 'Debe seleccionar al menos una operación para procesar.', 'warning');
        }

        const primeraOperacion = selectedRows[0];
        const serieLoteBase = primeraOperacion.Origen_Lote?.substring(0, 5);
        const numeroPedidoBase = primeraOperacion.NumeroPedido;
        const anchoBase = primeraOperacion.CodProdPedido?.substring(19, 4) || '0000';

        let hayError = false;
        let mensajeError = '';
        
        for (const row of selectedRows) {
            const serieLote = row.Origen_Lote?.substring(0, 5);
            const numeroPedido = row.NumeroPedido;
            const ancho = row.CodProdPedido?.substring(19, 4) || '0000';
            
            if (serieLote !== serieLoteBase || numeroPedido !== numeroPedidoBase) {
                hayError = true;
                mensajeError = 'Las operaciones seleccionadas deben ser del mismo PEDIDO y la misma SERIE o de la misma SERIE/LOTE (en caso de ser PEDIDOS distintos) y Siempre los ANCHOS deben ser iguales';
                break;
            }
            
            if (ancho !== anchoBase) {
                hayError = true;
                mensajeError = 'Los anchos de las operaciones seleccionadas deben ser iguales';
                break;
            }
        }

        if (hayError) {
            return Swal.fire('Error de Validación', mensajeError, 'error');
        }

        const operacionesNombres = selectedRows.map(r => r.NumeroDocumento).join(' / ');
        const result = await Swal.fire({
            title: 'Confirma MULTIOPERACION',
            html: `Se abrirán las Operaciones:<br>${operacionesNombres}<br>CONFIRMA?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });

        if (result.isConfirmed) {
            const operacionesData = selectedRows.map(row => ({
                id: row.Operacion_ID,
                nroBatch: row.NroBatch
            }));
            try {
                Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                const response = await axiosInstance.post('/registracion/operaciones/procesar', { operacionesData });
                Swal.close();
                await Swal.fire('Éxito', `Multi-Operación #${response.data.multiOperacionId} creada.`, 'success');
                fetchOperaciones();
            } catch (error) {
                console.error('Error al procesar operaciones:', error);
                Swal.fire('Error', error.response?.data?.error || 'No se pudo procesar la selección.', 'error');
            }
        }
    };

    const columns = useMemo(() => [
        { name: 'Nro. Pedido', selector: row => row.NumeroPedido || '', sortable: true, width: '90px', wrap: true },
        { name: 'Nro. Item', selector: row => row.NumeroItem || '', sortable: true, width: '70px', wrap: true },
        { name: 'Nº Operación', selector: row => row.NumeroDocumento || '', sortable: true, width: '130px', wrap: true },
        { name: 'Serie/Lote', selector: row => row.Origen_Lote?.substring(0, 11) || '', sortable: true, width: '110px', wrap: true },
        { name: 'Nro. MultiOp.', selector: row => row.NumeroMultiOperacion || '', sortable: true, width: '100px', wrap: true },
        { name: 'Prog.', selector: row => formatNumber(row.KilosProgramadosEntrantes), right: true, width: '70px' },
        { name: 'Stock', selector: row => formatNumber(row.Stock), right: true, width: '70px' },
        { name: 'Batch', selector: row => row.NroBatch || '', sortable: true, width: '80px', wrap: true },
        { name: 'Balanza', selector: row => formatNumber(row.Kilos_Balanza), right: true, width: '80px' },
        { name: 'Abas', selector: row => row.Abastecida === '0' ? 'OK' : '', width: '60px', center: true },
        { name: 'OpAnt', selector: row => row.OpAnteriorStatus || '', width: '60px', center: true },
        { name: 'Clientes', selector: row => row.Clientes || '', width: '150px', wrap: true },
        { name: 'Cali', cell: row => <CaliIcon iconType={calcularEstadoYColorVB(row).caliIcon} />, width: '50px', center: true },
        { name: 'Ancho', selector: row => formatNumber(row.Ancho), right: true, width: '70px' },
        { name: 'Flia.', selector: row => row.Familia || '', width: '50px', center: true },
        { name: 'Esp.', selector: row => row.Espesor || '', width: '60px', right: true },
        { name: 'Fecha Inicio', 
          selector: row => row.batch_FechaInicio, 
          format: row => formatCustomDate(row.batch_FechaInicio), 
          sortable: true, 
          width: '100px' },
        { name: 'Consulta', 
          cell: row => (
            <button 
              className="btn btn-xs btn-default border" 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/registracion/detalle/${row.Operacion_ID}`, { 
                    state: { operationStatus: calcularEstadoYColorVB(row), origen: "OperacionesEmbalaje" } 
                });
              }}
            >
              Ver
            </button>
          ), 
          width: '80px', 
          center: true 
        },
        { name: 'Preembalaje', 
          selector: row => calcularEstadoYColorVB(row).preembalajeText, 
          width: '100px', 
          center: true 
        },
        { name: 'Tarea', selector: row => row.Tarea || '', width: '120px', wrap: true },
        { name: 'Pag/Ata', selector: row => row.CantidadPaquetes || '', width: '70px', center: true },
        { name: 'Hoj/Roll', selector: row => row.CantidadRollos || '', width: '80px', center: true },
        { name: 'Cod Prod Pedido', selector: row => row.CodProdPedido || '', width: '150px', wrap: true }
    ], [navigate]);

    // ESTILOS DE FILA - LÓGICA IDÉNTICA AL VB.NET
    const conditionalRowStyles = [
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#FF0000'; // Rojo - BLOQUEADA
            },
            style: { backgroundColor: '#FF0000', color: 'white' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#7CFC00'; // LawnGreen - Preembalaje cerrada
            },
            style: { backgroundColor: '#7CFC00', color: 'black' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#00FF00'; // Verde - LISTA
            },
            style: { backgroundColor: '#00FF00', color: 'black' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#E0E0E0'; // Gris claro - Preembalaje abierta
            },
            style: { backgroundColor: '#E0E0E0', color: 'black' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#808080'; // Gris - EN_PROCESO
            },
            style: { backgroundColor: '#808080', color: 'white' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#FFFF00'; // Amarillo - Tolerancia/Calidad
            },
            style: { backgroundColor: '#FFFF00', color: 'black' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#EEE8AA'; // PaleGoldenrod - Calidad dictaminada
            },
            style: { backgroundColor: '#EEE8AA', color: 'black' }
        },
        {
            when: row => {
                const estado = calcularEstadoYColorVB(row);
                return estado.backgroundColor === '#FFFFFF'; // Blanco - SUSPENDIDA
            },
            style: { backgroundColor: '#FFFFFF', color: 'black' }
        }
    ];

    const customStyles = {
        table: { style: { backgroundColor: 'white' } },
        headRow: { style: { backgroundColor: 'white', color: 'black', fontWeight: 'bold', fontSize: '11px', fontStyle: 'italic', minHeight: '30px' } },
        rows: { style: { minHeight: '26px', fontSize: '12px', borderBottom: '1px solid #ccc' } },
        cells: { style: { padding: '2px' } }
    };

    const selectableRowDisabled = (row) => {
        const estado = calcularEstadoYColorVB(row);
        return !estado.seleccionable;
    };

    return (
        <div style={{backgroundColor: '#800000', minHeight: '100vh', padding: '10px'}}>
            <div className="container-fluid">
                {/* Header Superior */}
                <div className="d-flex justify-content-between align-items-start mb-2" style={{color: 'white'}}>
                    <div>
                        <h6 className="m-0"><i>REGISTRACION - Producción</i></h6>
                        <h5 className="m-0"><b>SRP - Operaciones Pendientes Embalaje</b></h5>
                    </div>
                    <div className="text-center">
                        <span style={{background: 'black', color: 'red', padding: '2px 30px', fontWeight: 'bold', fontSize: '20px'}}>Embalaje</span>
                    </div>
                    <div className="d-flex flex-column align-items-end">
                        <span>Usuario: {user?.nombre || 'Desconocido'}</span>
                        <button className="btn btn-sm btn-light mt-1" onClick={() => navigate('/registracion')}>
                            <i className="fas fa-door-open" style={{fontSize: '24px', color: '#B8860B'}}></i>
                        </button>
                    </div>
                </div>

                {/* Tabla de Datos */}
                <div className="card" style={{borderRadius: '0px'}}>
                    <div className="card-body p-0 border">
                        <DataTable
                            columns={columns}
                            data={operaciones}
                            progressPending={loading}
                            progressComponent={<div className="py-5"><div className="spinner-border text-primary"></div></div>}
                            conditionalRowStyles={conditionalRowStyles}
                            customStyles={customStyles}
                            fixedHeader
                            fixedHeaderScrollHeight="60vh"
                            selectableRows
                            onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                            noDataComponent={<div className="p-3">No hay datos</div>}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                                selectAllRowsItem: true,
                                selectAllRowsItemText: 'Todos'
                            }}
                            highlightOnHover
                            selectableRowDisabled={selectableRowDisabled}
                            onRowClicked={handleRowClicked}
                        />
                    </div>
                </div>

                {/* REFERENCIAS DE COLORES */}
                <div className="row mt-2 text-white" style={{fontSize: '11px', fontWeight: 'bold'}}>
                    <div className="col-md-9">
                        <div className="row">
                            <div className="col-4 d-flex align-items-center mb-1">
                                <div style={{width: '20px', height: '14px', background: 'green', border: '1px solid white', marginRight: '5px'}}></div>
                                <span>Cerrada - Lista para Embalaje</span>
                            </div>
                            <div className="col-4 d-flex align-items-center mb-1">
                                <div style={{width: '20px', height: '14px', background: 'grey', border: '1px solid white', marginRight: '5px'}}></div>
                                <span>Abierta - En proceso de Embalaje</span>
                            </div>
                            <div className="col-4 d-flex align-items-center mb-1">
                                <div style={{width: '20px', height: '14px', background: 'yellow', border: '1px solid white', marginRight: '5px'}}></div>
                                <span>En Calidad o fuera de tolerancia</span>
                            </div>
                            <div className="col-4 d-flex align-items-center">
                                <div style={{width: '20px', height: '14px', background: 'lawngreen', border: '1px solid white', marginRight: '5px'}}></div>
                                <span>Cerrada - Preembalaje</span>
                            </div>
                            <div className="col-4 d-flex align-items-center">
                                <div style={{width: '20px', height: '14px', background: 'white', border: '1px solid #ccc', marginRight: '5px'}}></div>
                                <span>Abierta - En proceso de Preembalaje</span>
                            </div>
                            <div className="col-4 d-flex align-items-center">
                                <div style={{width: '20px', height: '14px', background: 'red', border: '1px solid white', marginRight: '5px'}}></div>
                                <span>No puede procesarse</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 text-right">
                        <button className="btn btn-light btn-lg px-5" 
                                style={{borderRadius: '0px', fontWeight: 'bold', color: 'black', fontSize: '18px'}}
                                onClick={handleProcesar}
                                disabled={selectedRows.length === 0 || loading}>
                            PROCESAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperacionesEmbalaje;
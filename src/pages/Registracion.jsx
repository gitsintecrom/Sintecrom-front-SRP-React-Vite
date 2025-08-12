// import React from "react";

// const Registracion = () => {
//   return (
//     <>
//       <div className="content-header">
//         <div className="container-fluid">
//           <h1 className="m-0">Registracion</h1>
//         </div>
//       </div>
//       <div className="content">
//         <div className="container-fluid">
//           <p>Aquí iría la información de la Registracion.</p>
//         </div>
//       </div>
//     </>
//   );
// };
// export default Registracion;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Swal from 'sweetalert2';

const Registracion = () => {
    const [maquinas, setMaquinas] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance.get('/registracion/maquinas')
            .then(response => {
                setMaquinas(response.data);
            })
            .catch(error => {
                console.error("Error fetching maquinas:", error);
                Swal.fire('Error', 'No se pudieron cargar las máquinas.', 'error');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleMachineClick = (maquinaId) => {
        navigate(`/registracion/operaciones/${maquinaId}`);
    };

    const renderMachineGroup = (title, machineList = []) => (
        <div className="col-md-4 col-lg-3">
            <div className="card card-outline card-danger h-100">
                <div className="card-header text-center">
                    <h3 className="card-title font-weight-bold">{title}</h3>
                </div>
                <div className="card-body d-flex flex-column" style={{ gap: '1rem' }}>
                    {machineList.map(m => (
                        <button key={m.id} onClick={() => handleMachineClick(m.id)} className={`btn ${m.color} btn-lg`}>
                           {m.nombre.replace(title.slice(0, -1), '').trim()}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
    
    // Un botón único para grupos de 1
     const renderSingleMachine = (title, machine) => (
         <div className="col-md-4 col-lg-3">
             <div className="card card-outline card-danger h-100">
                <div className="card-body d-flex align-items-center justify-content-center">
                     <button key={machine.id} onClick={() => handleMachineClick(machine.id)} className={`btn ${machine.color} btn-lg`} style={{width: '100%', height: '80px'}}>
                         {machine.nombre}
                     </button>
                 </div>
             </div>
         </div>
     );

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center vh-100">Cargando máquinas...</div>;
    }

    return (
        <>
            <div className="content-header">
                <div className="container-fluid"><h1><b>REGISTRACION - Selección de Máquinas</b></h1></div>
            </div>
            <div className="content">
                <div className="container-fluid">
                    <div className="row">
                        {maquinas.SLITTER && renderMachineGroup("SLITTER", maquinas.SLITTER)}
                        {maquinas.PLANCHA && renderMachineGroup("PLANCHA", maquinas.PLANCHA)}
                        {maquinas.OTROS && (
                            <div className="col-md-4 col-lg-3">
                                <div className="d-flex flex-column h-100" style={{ gap: '1rem' }}>
                                    {maquinas.OTROS.map(m => (
                                         <button key={m.id} onClick={() => handleMachineClick(m.id)} className={`btn ${m.color} btn-lg flex-grow-1`}>
                                             {m.nombre}
                                         </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Registracion;
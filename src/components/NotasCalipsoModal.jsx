// // src/components/NotasCalipsoModal.jsx

// import React from 'react';
// import './NotasCalipsoModal.css';

// const NotasCalipsoModal = ({ notes, onClose }) => {
//     return (
//         <div className="modal-overlay">
//             <div className="modal-content">
//                 <h2>Notas Calipso</h2>
//                 <div className="notes-container">
//                     <textarea readOnly value={notes || 'No hay notas disponibles.'} />
//                 </div>
//                 <button onClick={onClose}>Cerrar</button>
//             </div>
//         </div>
//     );
// };

// export default NotasCalipsoModal;


import React, { useEffect, useState } from 'react';
import './NotasCalipsoModal.css';

const NotasCalipsoModal = ({ notes, onClose }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    useEffect(() => {
        // Función para verificar el tema actual
        const checkTheme = () => {
            const darkMode = document.body.classList.contains('dark-mode');
            setIsDarkMode(darkMode);
            console.log('🎨 Tema detectado:', darkMode ? 'Oscuro' : 'Claro');
        };
        
        // Verificar al montar el componente
        checkTheme();
        
        // Crear un observer para detectar cambios en la clase del body
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    checkTheme();
                }
            });
        });
        
        // Observar cambios en los atributos del body
        observer.observe(document.body, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });
        
        // Cleanup
        return () => observer.disconnect();
    }, []);
    
    return (
        <div className="modal-overlay">
            <div className={`modal-content ${isDarkMode ? 'dark' : 'light'}`}>
                <h2 className={`modal-title ${isDarkMode ? 'dark' : 'light'}`}>
                    Notas Calipso
                </h2>
                <div className="notes-container">
                    <textarea 
                        readOnly 
                        value={notes || 'No hay notas disponibles.'}
                        className={`notes-textarea ${isDarkMode ? 'dark' : 'light'}`}
                    />
                </div>
                <button 
                    onClick={onClose}
                    className={`modal-button ${isDarkMode ? 'dark' : 'light'}`}
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default NotasCalipsoModal;
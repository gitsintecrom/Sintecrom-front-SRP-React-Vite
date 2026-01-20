// // src/utils/printUtils.js
// import React from 'react';
// import { createRoot } from 'react-dom/client';

// /**
//  * Imprime un componente React en una ventana emergente.
//  * @param {React.ComponentType} Component - El componente a imprimir (ej: PrintLabel)
//  * @param {Object} props - Props para el componente
//  */
// export const printReactComponent = (Component, props) => {
//     // Abrir ventana de impresión limpia
//     const printWindow = window.open('', '_blank', 'width=800,height=600');
//     if (!printWindow) {
//         alert('Por favor, permite las ventanas emergentes para imprimir.');
//         return;
//     }

//     printWindow.document.write(`
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <title>Etiqueta - Imprimiendo</title>
//             <meta charset="utf-8" />
//             <style>
//                 body {
//                     margin: 0;
//                     padding: 0;
//                     font-family: Arial, sans-serif;
//                 }
//                 @media print {
//                     body {
//                         -webkit-print-color-adjust: exact;
//                         print-color-adjust: exact;
//                     }
//                 }
//             </style>
//         </head>
//         <body>
//             <div id="print-root"></div>
//         </body>
//         </html>
//     `);
//     printWindow.document.close();

//     // Renderizar el componente
//     const root = createRoot(printWindow.document.getElementById('print-root'));
//     root.render(<Component {...props} />);

//     // Imprimir y limpiar
//     const printAndClose = () => {
//         printWindow.focus();
//         printWindow.print();
//         printWindow.close();
//         root.unmount();
//     };

//     // Esperar a que se renderice (ajusta el tiempo si el diseño es complejo)
//     setTimeout(printAndClose, 600);
// };





// // src/utils/printUtils.js
// import React from 'react';
// import { createRoot } from 'react-dom/client';

// /**
//  * Imprime un componente React en una ventana emergente.
//  * @param {React.ComponentType} Component - El componente a imprimir (ej: PrintLabel)
//  * @param {Object} props - Props para el componente
//  */
// export const printReactComponent = (Component, props) => {
//     // Abrir ventana de impresión limpia
//     const printWindow = window.open('', '_blank', 'width=800,height=600');
//     if (!printWindow) {
//         alert('Por favor, permite las ventanas emergentes para imprimir.');
//         return;
//     }

//     printWindow.document.write(`
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <title>Etiqueta - Imprimiendo</title>
//             <meta charset="utf-8" />
//             <style>
//                 body {
//                     margin: 0;
//                     padding: 0;
//                     font-family: Arial, sans-serif;
//                 }
//                 @media print {
//                     body {
//                         -webkit-print-color-adjust: exact;
//                         print-color-adjust: exact;
//                     }
//                 }
//             </style>
//         </head>
//         <body>
//             <div id="print-root"></div>
//         </body>
//         </html>
//     `);
//     printWindow.document.close();

//     // Renderizar el componente
//     const root = createRoot(printWindow.document.getElementById('print-root'));
//     root.render(<Component {...props} />);

//     // Imprimir y limpiar
//     const printAndClose = () => {
//         printWindow.focus();
//         printWindow.print();
//         printWindow.close();
//         root.unmount();
//     };

//     // Esperar a que se renderice
//     setTimeout(printAndClose, 600);
// };







// src/utils/printUtils.js
import React from 'react';
import { createRoot } from 'react-dom/client';

export const printReactComponent = (Component, props) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        alert('Por favor, permite las ventanas emergentes para imprimir.');
        return;
    }

    printWindow.document.write('<!DOCTYPE html>');
    printWindow.document.write('<html>');
    printWindow.document.write('<head>');
    printWindow.document.write('<title>Etiqueta - Imprimiendo</title>');
    printWindow.document.write('<meta charset="utf-8" />');
    printWindow.document.write('<style>');
    printWindow.document.write('body { margin: 0; padding: 0; font-family: Arial, sans-serif; }');
    printWindow.document.write('@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head>');
    printWindow.document.write('<body>');
    printWindow.document.write('<div id="print-root"></div>');
    printWindow.document.write('</body>');
    printWindow.document.write('</html>');

    printWindow.document.close();

    const root = createRoot(printWindow.document.getElementById('print-root'));
    root.render(<Component {...props} />);

    const printAndClose = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        root.unmount();
    };

    setTimeout(printAndClose, 600);
};
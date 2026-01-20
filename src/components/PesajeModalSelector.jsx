// src/components/PesajeModalSelector.jsx
import React from 'react';
import PesajeNormalModal from './modals/PesajeNormalModal';
import SobranteModal from './modals/SobranteModal';
import ScrapSeriadoModal from './modals/ScrapSeriadoModal';
import ScrapNoSeriadoModal from './modals/ScrapNoSeriadoModal';

const PesajeModalSelector = ({ lineaData, ...props }) => {
    if (lineaData?.bScrap && lineaData?.bScrapNoSeriado) {
        return <ScrapNoSeriadoModal lineaData={lineaData} {...props} />;
    } else if (lineaData?.bScrap) {
        return <ScrapSeriadoModal lineaData={lineaData} {...props} />;
    } else if (lineaData?.bSobrante) {
        return <SobranteModal lineaData={lineaData} {...props} />;
    } else {
        return <PesajeNormalModal lineaData={lineaData} {...props} />;
    }
};

export default PesajeModalSelector;
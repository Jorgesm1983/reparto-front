import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useLastLocation = (token) => {
    
    const location = useLocation();

    useEffect(() => {
        if (!token && location.pathname !== '/login') {
            // Guarda la ruta solo si no hay un token y no está en la ruta de login
            localStorage.setItem('lastVisitedPath', location.pathname);
        }
    }, [token, location]);
};

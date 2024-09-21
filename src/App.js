import React from 'react';
import { useState } from 'react'; 

import DeliveryForm from './components/DeliveryForm';
import Login from './components/login'; 

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    // Función para cerrar sesión
    const handleLogout = () => {
        localStorage.removeItem('token'); // Elimina el token del localStorage
        setToken('');  // Actualiza el estado para desloguear al usuario
    };

    return (
        <div className="container mt-5">
            {!token ? (
                <Login setToken={setToken} />
            ) : (
                <div>
                    <DeliveryForm />
                    {/* Contenedor para centrar el botón */}
                    <div className="d-flex justify-content-center mt-3">
                        <button onClick={handleLogout} className="btn btn-danger">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;

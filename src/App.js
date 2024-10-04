import React from 'react';
import { useState } from 'react'; 

import DeliveryForm from './components/DeliveryForm';
import Login from './components/login'; 

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    // Función para cerrar sesión
    const handleLogout = () => {
        localStorage.removeItem('token'); // Elimina el token del localStorage
        setToken('null');  // Actualiza el estado para desloguear al usuario
        window.location.href = '/login';  // Redirige al usuario a la página de login
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
                        <button onClick={(e) => {
                                e.preventDefault();  // Evita que se cierre la sesión inmediatamente
                                if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                                // Si el usuario confirma, llama a la función para cerrar sesión
                                handleLogout();
                                }
                            }} className="btn btn-danger">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;

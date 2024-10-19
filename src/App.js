import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login';
import DeliveryForm from './components/DeliveryForm';
import AdminPage from './components/AdminPage';
import { useLastLocation } from './hooks/useLastLocation';
import axios from 'axios';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);


    useEffect(() => {
        // Verificar la sesión en el backend
        const checkSession = async () => {
            try {
                const response = await axios.get('http://192.168.1.40:8000/api/check-session/', {
                    withCredentials: true,  // Asegura que las cookies de sesión se envíen
                });
                if (response.status !== 200) {
                    // Redirigir al login si la sesión ha expirado
                    handleLogout();
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    // Si obtenemos un 401, redirigimos al login
                    handleLogout();
                } else {
                    console.error('Error verificando la sesión:', error);
                }
            }
        };

        // Ejecutar la verificación de sesión cada minuto (60000 ms)
        const interval = setInterval(() => {
            if (token) {
                checkSession();
            }
        }, 900000); // Cada 60 segundos

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(interval);
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('lastVisitedPath');
        setToken(null);
        window.location.href = '/login';
    };



    return (
        <Router>
            <div className="container mt-5">
                <AuthRoutes token={token} setToken={setToken} handleLogout={handleLogout} />
                {/* Mostrar el botón de cerrar sesión solo si hay un token */}
                {token && (
                    <div className="d-flex justify-content-center mt-3">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                                    handleLogout();
                                }
                            }}
                            className="btn btn-danger"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </Router>
    );
}

function AuthRoutes({ token, setToken, handleLogout }) {
    // Usa el hook para manejar la última ubicación antes del login solo si hay un `Router` disponible
    useLastLocation(token);

    return token ? (
        <Routes>
            <Route path="/delivery-form" element={<DeliveryForm />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/delivery-form" />} />
        </Routes>
    ) : (
        <Routes>
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default App;

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login';
import DeliveryForm from './components/DeliveryForm';
import AdminPage from './components/AdminPage';
import { useLastLocation } from './hooks/useLastLocation';
import axios from 'axios';
import EmailFailures from './components/EmailFailures';  // Página de fallos de emails
import UnsatisfiedDeliveries from './components/UnsatisfiedDeliveries';  // Página de albaranes insatisfechos
import Dashboard from './components/Dashboard'; 

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);


    useEffect(() => {
        // Verificar la sesión en el backend
        const checkSession = async () => {
            try {
                const response = await axios.get('http://192.168.1.36:8000/api/check-session/', {
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
            {/* Ruta principal que será el formulario de entrega */}
            <Route path="/" element={<DeliveryForm />} />
            
            {/* Rutas autenticadas */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Ruta protegida para el Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Ruta para Fallos de Emails */}
            <Route path="/email-failures" element={<EmailFailures />} />
            
            {/* Ruta para Albaranes sin incidencia pero con insatisfacción */}
            <Route path="/unsatisfied-deliveries" element={<UnsatisfiedDeliveries />} />
            
            {/* Redirigir cualquier otra ruta no definida a / (formulario de entrega) */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    ) : (
        <Routes>
            {/* Redirigir al login si no hay token */}
            <Route path="/login" element={<Login setToken={setToken} />} />

            {/* Si no hay token, redirigir cualquier otra ruta al login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;

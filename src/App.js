import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login';
import DeliveryForm from './components/DeliveryForm';
import AdminPage from './components/AdminPage';
import { useLastLocation } from './hooks/useLastLocation';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('lastVisitedPath');
        setToken(null);
        window.location.href = '/login';
    };

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

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

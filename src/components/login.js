import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const csrfToken = Cookies.get('csrftoken');
            const response = await axios.post(
                'http://192.168.1.40:8000/api/login/',
                { username, password },
                {
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );

            const token = response.data.token;
            if (token) {
                setToken(token);
                localStorage.setItem('token', token);

                // Lee la última ruta visitada antes de iniciar sesión
                const lastVisitedPath = localStorage.getItem('lastVisitedPath') || '/delivery-form';
                console.log('Redirigiendo a:', lastVisitedPath);
                // Limpiar la última ruta almacenada después de redirigir
                localStorage.removeItem('lastVisitedPath');

                // Redirigir al usuario a la última ruta deseada
                navigate(lastVisitedPath, { replace: true });
            } else {
                setError('No se recibió un token de autenticación.');
            }
        } catch (err) {
            setError('Error al iniciar sesión. Verifica tus credenciales.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header">
                    Iniciar Sesión
                </div>
                <div className="card-body">
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="username">Usuario</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Introduce tu usuario"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Introduce tu contraseña"
                                required
                            />
                        </div>
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary">
                            Iniciar Sesión
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;

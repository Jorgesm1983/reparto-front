// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
const Dashboard = () => {



    // Función para redirigir con filtros

    // Estados para guardar los datos de albaranes
    const [pendingAlbaranes, setPendingAlbaranes] = useState(0);
    const [treatedAlbaranes, setTreatedAlbaranes] = useState(0);
    const [unresolvedAlbaranes, setUnresolvedAlbaranes] = useState(0);

    // Efecto para obtener datos de los albaranes cuando se monta el componente
    useEffect(() => {
        const fetchAlbaranesData = async () => {
            try {
                // Petición para obtener los albaranes pendientes de tratar
                const pendingResponse = await axios.get('http://192.168.1.40:8000/api/albaranes-pendientes/');
                setPendingAlbaranes(pendingResponse.data.count); // Asume que la respuesta tiene el formato { count: <numero> }

                // Petición para obtener los albaranes tratados pendientes de resolución
                const treatedResponse = await axios.get('http://192.168.1.40:8000/api/albaranes-tratados/');
                setTreatedAlbaranes(treatedResponse.data.count);

                // Petición para obtener los albaranes sin resolver
                const unresolvedResponse = await axios.get('http://192.168.1.40:8000/api/albaranes-no-resueltos/');
                setUnresolvedAlbaranes(unresolvedResponse.data.count);
            } catch (error) {
                console.error('Error al obtener datos de albaranes:', error);
            }
        };

        fetchAlbaranesData(); // Llamamos a la función que obtiene los datos
    }, []); // Se ejecuta una vez al montar el componente

    return (
        <div className="container mt-5">
            {/* Título mejorado con estilo minimalista */}
            <div className="dashboard-header">
                <h1>Panel Principal</h1>
                <div className="underline"></div> {/* Línea decorativa sutil */}
            </div>
            <div className="row mt-4">
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <i className="bi bi-person-circle icon-large mb-3"></i> {/* Icono de Admin */}
                            <h5 className="card-title">Admin</h5>
                                    {/* Link para redirigir a los albaranes pendientes */}
                                    <div className="albaranes-stats">
                                        <Link to="/admin?status=pendiente_tratar&dateFrom=2024-01-01" className="pending">
                                            <span className="stat-number">{pendingAlbaranes}</span>
                                            <span className="stat-text">Pendientes</span>
                                        </Link>

                                        <Link to="/admin?status=tratado_pendiente_resolucion&dateFrom=2024-01-01" className="treated">
                                            <span className="stat-number">{treatedAlbaranes}</span>
                                            <span className="stat-text">Tratados</span>
                                        </Link>

                                        <Link to="/admin?status=no_resuelto&dateFrom=2024-01-01" className="unresolved">
                                            <span className="stat-number">{unresolvedAlbaranes}</span>
                                            <span className="stat-text">No Resueltos</span>
                                        </Link>
                                    </div>
                            <Link to="/admin" className="btn btn-primary">
                                <i className="bi bi-arrow-right-circle"></i> Ir al Admin
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <i className="bi bi-envelope-exclamation icon-large mb-3"></i> {/* Icono de Fallos de Emails */}
                            <h5 className="card-title">Fallos de Emails</h5>
                            <p className="card-text">Ver información sobre los fallos en los correos electrónicos.</p>
                            <Link to="/email-failures" className="btn btn-warning">
                                <i className="bi bi-envelope"></i> Fallos de Emails
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <i className="bi bi-exclamation-triangle icon-large mb-3"></i> {/* Icono de Albaranes con Insatisfacción */}
                            <h5 className="card-title">Albaranes con Insatisfacción</h5>
                            <p className="card-text">Ver los albaranes sin incidencias pero con insatisfacción del cliente.</p>
                            <Link to="/unsatisfied-deliveries" className="btn btn-danger">
                                <i className="bi bi-exclamation-triangle-fill"></i> Albaranes Insatisfechos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

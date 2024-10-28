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
    const [pendingEmails, setPendingEmails] = useState(0); // Estado para guardar el número de correos no contactados
    const [notTreatedCustomers, setNotTreatedCustomers] = useState(0); // Estado para guardar el número de clientes insatisfechos no tratados

    // Efecto para obtener datos de los albaranes cuando se monta el componente
    useEffect(() => {
        const fetchAlbaranesData = async () => {
            try {
                // Petición para obtener los albaranes pendientes de tratar
                const pendingResponse = await axios.get('http://192.168.1.40:8000/api/albaranes-pendientes/');
                setPendingAlbaranes(pendingResponse.data.count);
    
                const treatedResponse = await axios.get('http://192.168.1.40:8000/api/albaranes-tratados/');
                setTreatedAlbaranes(treatedResponse.data.count);
    
                const unresolvedResponse = await axios.get('http://192.168.1.40:8000/api/albaranes-no-resueltos/');
                setUnresolvedAlbaranes(unresolvedResponse.data.count);
    
                // Petición para obtener el número de correos no contactados
                const pendingEmailsResponse = await axios.get('http://192.168.1.40:8000/api/count_pending_emails/');
                setPendingEmails(pendingEmailsResponse.data.pending_count); // Asume que la respuesta tiene el formato { pending_count: <numero> }

                const notTreatedResponse = await axios.get('http://192.168.1.40:8000/api/count_unsatisfied_customers/');
                setNotTreatedCustomers(notTreatedResponse.data.not_treated_count); // Asume que la respuesta tiene el formato { not_treated_count: <numero> }

            } catch (error) {
                console.error('Error al obtener datos:', error);
            }
        };
    
        fetchAlbaranesData(); // Llamamos a la función que obtiene los datos // Llamamos a la función que obtiene los datos
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
                            <h5 className="card-title">Entregas</h5>
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
                                <i className="bi bi-arrow-right-circle"></i> Gestión Albaranes
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <i className="bi bi-envelope-exclamation icon-large mb-3"></i> {/* Icono de Fallos de Emails */}
                            <h5 className="card-title">Notificaciones</h5>
                            <div className="albaranes-stats">
                                <Link to="/email-failures?status=pendiente_contacto" className="pending">
                                    <span className="stat-number">{pendingEmails}</span>
                                    <span className="stat-text">No Contactados</span>
                                </Link>
                            </div>
                            <Link to="/email-failures" className="btn btn-primary">
                                <i className="bi bi-envelope"></i> Gestión Contactos
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <i className="bi bi-exclamation-triangle icon-large mb-3"></i> {/* Icono de Albaranes con Insatisfacción */}
                            <h5 className="card-title">Clientes Insatisfechos</h5>
                            <div className="albaranes-stats">
                                <Link to="/unsatisfied-deliveries?status_satisfaction=no_tratado" className="not-treated">
                                    <span className="stat-number">{notTreatedCustomers}</span>
                                    <span className="stat-text">No Tratados</span>
                                </Link>
                            </div>
                            <Link to="/unsatisfied-deliveries" className="btn btn-primary">
                                <i className="bi bi-exclamation-triangle-fill"></i> Gestión Clientes
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

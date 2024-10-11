import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPage.css';

const AdminPage = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
    const [incidentNumber, setIncidentNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchRecentDeliveries();
    }, []);

    const fetchRecentDeliveries = async () => {
        try {
            const response = await axios.get('http://192.168.1.40:8000/api/recent_deliveries/', {
                withCredentials: true,
            });
            const sortedDeliveries = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setDeliveries(sortedDeliveries);
        } catch (error) {
            console.error('Error al obtener los albaranes:', error);
            setError('Error al obtener los albaranes.');
        } finally {
            setLoading(false);
        }
    };

    const handleIncidentNumberChange = (event) => {
        setIncidentNumber(event.target.value);
    };

    const handleIncidentSubmit = async (deliveryId) => {
        if (!incidentNumber) {
            setError('Debe ingresar un número de incidencia.');
            return;
        }

        try {
            await axios.post(
                `http://192.168.1.40:8000/api/update_incident/${deliveryId}/`, 
                { incident_number: incidentNumber },
                { withCredentials: true }
            );
            setSuccess('Número de incidencia asignado correctamente.');
            setError('');
            fetchRecentDeliveries();
        } catch (error) {
            setError('Error al asignar el número de incidencia.');
            console.error(error);
        }
    };

    const toggleDeliveryDetails = (deliveryId) => {
        setSelectedDeliveryId((prevId) => (prevId === deliveryId ? null : deliveryId));
    };

    const isDeliverySelected = (deliveryId) => {
        return selectedDeliveryId === deliveryId;
    };

    return (
        <div className="admin-dashboard">
            <h2>Administración de Albaranes</h2>
            {loading ? (
                <p>Cargando albaranes...</p>
            ) : (
                <div className="delivery-list">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Albarán</th>
                                <th>Cliente</th>
                                <th>Tipo de Visita</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.map((delivery) => (
                                <React.Fragment key={delivery.id}>
                                    <tr
                                        className={delivery.has_issue ? 'issue-highlight' : ''}
                                        onClick={() => toggleDeliveryDetails(delivery.id)}
                                    >
                                        <td>{delivery.fiscal_year}/{delivery.delivery_number}</td>
                                        <td>{delivery.customer_name}</td>
                                        <td>{delivery.visit_type}</td>
                                        <td>{delivery.status}</td>
                                        <td>{new Date(delivery.created_at).toLocaleString()}</td>
                                    </tr>
                                    {isDeliverySelected(delivery.id) && (
                                        <tr className="delivery-details-row">
                                            <td colSpan="5">
                                                <div className="delivery-details">
                                                    <h3>Detalles del Albarán</h3>
                                                    <p><strong>Cliente:</strong> {delivery.customer_name}</p>
                                                    <p><strong>Observaciones:</strong> {delivery.observations || 'Ninguna'}</p>

                                                    <h4>Imágenes de la Entrega</h4>
                                                    <div className="image-thumbnails">
                                                        {delivery.delivery_images.map((img, index) => (
                                                            <img
                                                                key={index}
                                                                src={img.url}
                                                                alt={`Entrega ${index + 1}`}
                                                                className="thumbnail"
                                                                onClick={() => window.open(img.url, '_blank')}
                                                            />
                                                        ))}
                                                    </div>

                                                    <h4>Fotos de la Incidencia</h4>
                                                    <div className="image-thumbnails">
                                                        {delivery.issue_photos.map((img, index) => (
                                                            <img
                                                                key={index}
                                                                src={img.url}
                                                                alt={`Incidencia ${index + 1}`}
                                                                className="thumbnail"
                                                                onClick={() => window.open(img.url, '_blank')}
                                                            />
                                                        ))}
                                                    </div>

                                                    {delivery.has_issue && (
                                                        <div className="incident-form">
                                                            <label htmlFor="incident-number">Número de Incidencia:</label>
                                                            <input
                                                                type="text"
                                                                id="incident-number"
                                                                value={incidentNumber}
                                                                onChange={handleIncidentNumberChange}
                                                                className="form-control"
                                                            />
                                                            <button 
                                                                onClick={() => handleIncidentSubmit(delivery.id)}
                                                                className="btn btn-primary"
                                                            >
                                                                Asignar Número de Incidencia
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
        </div>
    );
};

export default AdminPage;

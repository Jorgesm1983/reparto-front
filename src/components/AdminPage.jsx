import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import './AdminPage.css';

// Función para construir la URL de las imágenes de entrega e incidencia
const constructImageUrl = (imageUrl) => {
    // Si la URL ya es completa (incluye http o https), la devolvemos tal cual.
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }
    // De lo contrario, construimos la URL usando la base de la ruta.
    return `http://192.168.1.40:8000${imageUrl}`;
};

const AdminPage = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
    const [incidentNumber, setIncidentNumber] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const DELIVERY_IMAGE_BASE_PATH = 'http://192.168.1.40:8000/media/deliveries/';
    const ISSUE_IMAGE_BASE_PATH = 'http://192.168.1.40:8000/media/issues/';

    useEffect(() => {
        fetchRecentDeliveries();
    }, []);

    const fetchRecentDeliveries = async () => {
        try {
            const response = await axios.get('http://192.168.1.40:8000/api/recent_deliveries/', {
                withCredentials: true,
            });
            console.log('Datos de la API:', response.data);
            setDeliveries(response.data);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
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
        console.log(`Toggling delivery details for ID: ${deliveryId}`);
        setSelectedDeliveryId(prevId => (prevId === deliveryId ? null : deliveryId));
    };

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <div className="admin-container">
            <h2>Administración de Albaranes</h2>
            {loading ? (
                <div>Cargando albaranes...</div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : (
                <div className="delivery-list">
                    {deliveries.length > 0 ? (
                        deliveries.map((delivery) => (
                            <div key={delivery.id} className={`delivery-item ${delivery.has_issue ? 'issue-highlight' : ''}`}>
                                <div className="delivery-summary" onClick={() => toggleDeliveryDetails(delivery.id)}>
                                    <span>Albarán: {delivery.fiscal_year}/{delivery.delivery_number} </span>
                                    <span>Cliente: {delivery.client_number_display} - {delivery.customer_name} </span>
                                    <span>Tipo de visita: {delivery.visit_type} </span>
                                    <span>Estado: {delivery.status} </span>
                                    <span>Fecha: {formatDateTime(delivery.created_at)} </span>
                                    {delivery.has_issue && (
                                        <span className="text-danger">Incidencia </span>
                                    )}
                                    {delivery.observations && (
                                        <span className="text-muted">Observaciones: {delivery.observations} </span>
                                    )}
                                </div>
                                {selectedDeliveryId === delivery.id && (
                                    <div className="delivery-details">
                                        <h4>Imágenes de la entrega</h4>
                                        {console.log('Imágenes de la entrega:', delivery.delivery_images)}
                                        <ImageGallery 
                                            items={delivery.delivery_images ? delivery.delivery_images.map((img) => {
                                                console.log('Procesando imagen de entrega:', img.image);
                                                const imageUrl = img.image.startsWith('http')
                                                ? img.image
                                                : constructImageUrl(
                                                    ISSUE_IMAGE_BASE_PATH,
                                                    delivery.fiscal_year,
                                                    delivery.delivery_number,
                                                    img.image
                                                );
                                    
                                            return {
                                                original: imageUrl,
                                                thumbnail: imageUrl,
                                            };
                                        }) : []}
                                    />
                                        <h4>Fotos de la incidencia</h4>
                                        {console.log('Fotos de la incidencia:', delivery.issue_photos)}
                                        <ImageGallery 
                                            items={delivery.issue_photos ? delivery.issue_photos.map((img) => {
                                                console.log('Procesando foto de incidencia:', img.image);
                                                const imageUrl = img.image.startsWith('http')
                                                ? img.image
                                                : constructImageUrl(
                                                    ISSUE_IMAGE_BASE_PATH,
                                                    delivery.fiscal_year,
                                                    delivery.delivery_number,
                                                    img.image
                                                );
                                    
                                            return {
                                                original: imageUrl,
                                                thumbnail: imageUrl,
                                            };
                                        }) : []}
                                    />
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
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No se encontraron albaranes recientes.</p>
                    )}
                </div>
            )}
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
        </div>
    );
};

export default AdminPage;

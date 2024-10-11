import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import Lightbox from 'yet-another-react-lightbox';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'yet-another-react-lightbox/dist/styles.css';
import './AdminPage.css';
import Cookies from 'js-cookie';

const NextArrow = ({ onClick }) => (
    <div className="custom-arrow custom-next" onClick={onClick}>
        &rarr;
    </div>
);

const PrevArrow = ({ onClick }) => (
    <div className="custom-arrow custom-prev" onClick={onClick}>
        &larr;
    </div>
);

const getSliderSettings = (imagesLength) => ({
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1, // Siempre mostrar una sola imagen
    slidesToScroll: 1,
    arrows: imagesLength > 1,
    nextArrow: imagesLength > 1 ? <NextArrow /> : null,
    prevArrow: imagesLength > 1 ? <PrevArrow /> : null,
    adaptiveHeight: true,
    variableWidth: false,
    responsive: [
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: imagesLength > 1,
            }
        }
    ]
});


const AdminPage = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
    const [incidentNumber, setIncidentNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState([]);

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
            const csrfToken = Cookies.get('csrftoken');
            await axios.post(
                `http://192.168.1.40:8000/api/update_incident/${deliveryId}/`,
                { incident_number: incidentNumber },
                {
                    withCredentials: true,
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                }
            );
        } catch (error) {
            setError('Error al asignar el número de incidencia.');
            console.error(error);
        }
        setSuccess('Número de incidencia asignado correctamente.');
        setError('');
        fetchRecentDeliveries();
    };

    const toggleDeliveryDetails = (deliveryId) => {
        setSelectedDeliveryId((prevId) => (prevId === deliveryId ? null : deliveryId));
    };

    const openLightbox = (images) => {
        setLightboxImages(images.map((img) => ({ src: img.url || img.image })));
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const renderImages = (images) => (
        images.map((img, index) => (
            <div key={img.url || img.image} className="image-slide">
                <img
                    src={img.url || img.image}
                    alt={`Imagen ${index + 1}`}
                    className="thumbnail"
                    onClick={() => openLightbox(images)}
                />
            </div>
        ))
    );

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
                                        <td>{delivery.client_number_display} - {delivery.customer_name}</td>
                                        <td>{delivery.visit_type}</td>
                                        <td>{delivery.status}</td>
                                        <td>{new Date(delivery.created_at).toLocaleString()}</td>
                                    </tr>
                                    {selectedDeliveryId === delivery.id && (
                                        <tr className="delivery-details-row">
                                            <td colSpan="5">
                                                <div className="delivery-details">
                                                    <h4>Observaciones:</h4>
                                                    <p>{delivery.observations || 'Ninguna'}</p>
                                                    
                                                    <h4>Productos con Incidencia:</h4>
                                                    <ul>
                                                        {delivery.issues.map((issue, index) => (
                                                            <li key={index}>
                                                                E-{issue} Descripción del producto
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    <div className="image-containers">
                                                        <div className="image-slider">
                                                            <h4>Finalización Entrega</h4>
                                                            <Slider {...getSliderSettings(delivery.delivery_images.length)}>
                                                                {renderImages(delivery.delivery_images)}
                                                            </Slider>
                                                        </div>
                                                        <div className="image-slider">
                                                            <h4>Fotos de la Incidencia</h4>
                                                            <Slider {...getSliderSettings(delivery.issue_photos.length)}>
                                                                {renderImages(delivery.issue_photos)}
                                                            </Slider>
                                                        </div>
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
            {lightboxOpen && (
                <Lightbox
                    open={lightboxOpen}
                    close={closeLightbox}
                    slides={lightboxImages}
                />
            )}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
        </div>
    );
};

export default AdminPage;

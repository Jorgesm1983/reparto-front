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
    slidesToShow: 1,
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
    const [lightboxStartIndex, setLightboxStartIndex] = useState(0);


    useEffect(() => {
        fetchRecentDeliveries();
    }, []);

    const fetchRecentDeliveries = async () => {
        try {
            setLoading(true);
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
        const delivery = deliveries.find(d => d.id === deliveryId);

        if (delivery.incident_number) {
            const confirmOverwrite = window.confirm('El albarán ya tiene un número de incidencia asignado. ¿Desea sobrescribirlo?');
            if (!confirmOverwrite) return;
        }

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
            setSuccess('Número de incidencia asignado correctamente.');
            setError('');
            setIncidentNumber(''); // Limpiar el campo de entrada después de la asignación
            await fetchRecentDeliveries(); // Refrescar la lista para asegurar que el estado se actualiza
        } catch (error) {
            setError('Error al asignar el número de incidencia.');
            console.error(error);
        }
    };

    // Lógica actualizada para cambiar el estado al hacer clic en un albarán
    const toggleDeliveryDetails = (deliveryId) => {
        // Verificar si se hace clic sobre el mismo albarán para alternar el estado
        if (selectedDeliveryId === deliveryId) {
            setSelectedDeliveryId(null); // Si ya está seleccionado, cerrarlo
        } else {
            setSelectedDeliveryId(deliveryId); // Seleccionar el nuevo albarán
        }
    };

    const openLightbox = (images, index) => {
        setLightboxImages(images.map((img) => ({ src: img.url || img.image })));
        setLightboxOpen(true);
        setLightboxStartIndex(index);
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
                    onClick={() => openLightbox(images, index)}
                />
            </div>
        ))
    );

    const renderProductsWithIssue = (delivery) => (
        <ul>
            {delivery.issues.map((issue, index) => (
                <li key={index}>
                     {delivery.product_descriptions[index] || 'Descripción no disponible'}
                </li>
            ))}
        </ul>
    );

    // const renderStatusIcon = (status) => {
    //     switch (status) {
    //         case 'finalizado':
    //             return <div className="status-circle status-green"></div>;
    //         case 'tratado_pendiente_resolucion':
    //             return <div className="status-circle status-yellow"></div>;
    //         case 'pendiente_tratar':
    //         default:
    //             return <div className="status-circle status-red"></div>;
    //     }
    // };

    const renderStatusClass = (status) => {
        switch (status) {
            case 'finalizado':
                return 'status-green';
            case 'tratado_pendiente_resolucion':
                return 'status-yellow';
            case 'pendiente_tratar':
            default:
                return 'status-red';
        }
    };

    return (
        <div className="admin-dashboard">
            <h2>Administración de Albaranes</h2>
            {loading ? (
                <p>Cargando albaranes...</p>
            ) : (
                <div className="card-container">
                    {deliveries.map((delivery) => (
                        <div className={`card ${renderStatusClass(delivery.status)}`} key={delivery.id}>
                        <div className="card-header" onClick={() => toggleDeliveryDetails(delivery.id)}>
                            <h5>Albarán {delivery.fiscal_year}/{delivery.delivery_number}</h5>
                            
                        </div>
                            <div className="card-body">
                                <p><strong>Cliente:</strong> {delivery.client_number_display} {delivery.customer_name}</p>
                                <p><strong>Transportista:</strong> {delivery.username}</p>
                                <p><strong>Tipo de Visita:</strong> {delivery.visit_type_display}</p>
                                <p><strong>Estado:</strong> {delivery.status_display}</p>
                                <p><strong>Fecha:</strong> {new Date(delivery.created_at).toLocaleString()}</p>
                                {delivery.incident_number && (
                                    <p><strong>Número de Incidencia:</strong> {delivery.incident_number}</p>
                                )}
                                {selectedDeliveryId === delivery.id && (
                                    <>
                                        {/* Solo mostrar "Productos con Incidencia" si hay incidencias */}
                                        {delivery.has_issue && (
                                            <>
                                                <p><strong>Nº Producto/s: </strong> {renderProductsWithIssue(delivery)}</p>
                                            </>
                                        )}

                                        <div className="image-containers">
                                            <div className="image-slider">
                                                <h4>Finalización Entrega</h4>
                                                <Slider {...getSliderSettings(delivery.delivery_images.length)}>
                                                    {renderImages(delivery.delivery_images)}
                                                </Slider>
                                            </div>

                                            {/* Solo mostrar las "Fotos de la Incidencia" si hay incidencias */}
                                            {delivery.has_issue && (
                                                <div className="image-slider">
                                                    <h4>Fotos de la Incidencia</h4>
                                                    <Slider {...getSliderSettings(delivery.issue_photos.length)}>
                                                        {renderImages(delivery.issue_photos)}
                                                    </Slider>
                                                </div>
                                            )}
                                        </div>

                                        {delivery.has_issue && (
                                            <div className="incident-form">
                                                <label htmlFor="incident-number">Número de Incidencia:</label>
                                                <div className="incident-input-container">
                                                    <input
                                                        type="text"
                                                        id="incident-number"
                                                        value={incidentNumber}
                                                        onChange={handleIncidentNumberChange}
                                                        className="form-control incident-input"
                                                        maxLength="4" // Limitar la entrada a 4 caracteres
                                                    />
                                                    <button
                                                        onClick={() => handleIncidentSubmit(delivery.id)}
                                                        className="btn btn-primary assign-button"
                                                    >
                                                        Asignar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {lightboxOpen && (
                <Lightbox
                    open={lightboxOpen}
                    close={closeLightbox}
                    slides={lightboxImages}
                    index={lightboxStartIndex} // Mostrar las imágenes correspondientes en la Lightbox
                />
            )}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
        </div>
    );
};

export default AdminPage;

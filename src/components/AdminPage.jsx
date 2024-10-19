import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import Lightbox from 'yet-another-react-lightbox';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'yet-another-react-lightbox/dist/styles.css';
import './AdminPage.css';
import Cookies from 'js-cookie';
import Pagination from './Pagination'; // Ajusta la ruta según sea necesario
import Select from 'react-select'; // Si usas react-select, por ejemplo
import { useNavigate } from 'react-router-dom';  // Asegúrate de importar useNavigate
import 'bootstrap-icons/font/bootstrap-icons.css';

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
    dots: true,
    infinite: imagesLength > 1,
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

    // Nuevos estados
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('cards');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransportistas, setSelectedTransportistas] = useState([]); // Transportistas seleccionados
    const itemsPerPage = 12;
    const navigate = useNavigate();  // Inicializa el hook useNavigate
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        transportista: '',
        visitType: '',
        status: '',
        hasIncidentNumber: '',
        hasObservations: '',
    
    });

    const transportistaOptions = Array.from(new Set(deliveries.map(d => d.username))) // Obtener solo nombres únicos
    .map(username => ({ value: username, label: username }));

        // Función para manejar los cambios en los filtros
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value,
        });
    };

    // Manejar la selección de transportistas
    const handleTransportistaChange = (selectedOptions) => {
        setSelectedTransportistas(selectedOptions);
    };


    const fetchRecentDeliveries = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            // Añadir los filtros seleccionados por el usuario
            if (filters.dateFrom) {
                params.append('dateFrom', filters.dateFrom);
            }
            if (filters.dateTo) {
                params.append('dateTo', filters.dateTo);
            }
            if (filters.visitType) {
                params.append('visit_type', filters.visitType);
            }
            if (filters.status) {
                params.append('status', filters.status);
            }
            if (filters.hasIssue) {
                params.append('has_issue', filters.hasIssue);
            }

            // Realizar la petición con los filtros aplicados
            const response = await axios.get(`http://192.168.1.40:8000/api/recent_deliveries/?${params.toString()}`, {
                withCredentials: true,
            });


            // Manejo del caso de error desde el backend
            if (response.data.error) {
                setError(response.data.error);  // Mostrar el error del backend en el frontend
            } else {
                setDeliveries(response.data);  // Si no hay error, actualiza las entregas
                setError('');  // Limpia cualquier error anterior
            }
         } catch (error) {
            console.error('Error al obtener los albaranes:', error);
            setError('Error al obtener los albaranes.');
        } finally {
            setLoading(false);
        }
    }, [filters]); // Dependencias: solo se ejecutará cuando cambien los filtros

    useEffect(() => {
        fetchRecentDeliveries();
    }, [fetchRecentDeliveries]); // Añadimos fetchRecentDeliveries como dependencia

    
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

    const toggleDeliveryDetails = (deliveryId) => {
        if (selectedDeliveryId === deliveryId) {
            setSelectedDeliveryId(null); 
        } else {
            setSelectedDeliveryId(deliveryId); 
        }
    };

    const openLightbox = (images, index) => {
        console.log('Images for Lightbox:', images); // Asegúrate de que las imágenes sean las correctas
        setLightboxImages(images.map((img) => ({ src: img.url || img.image })));
        setLightboxOpen(true);
        setLightboxStartIndex(index);
        
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const renderImages = (images) => (
        images.map((img, index) => (
            <div key={`${img.url || img.image}-${index}`} className="image-slide">
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



    const renderStatusClass = (status) => {
        switch (status) {
            case 'finalizado':
                return 'status-green';
            case 'tratado_pendiente_resolucion':
                return 'status-yellow';
            case 'no_resuelto':
                return 'status-orange';
            case 'pendiente_tratar':
            default:
                return 'status-red';
        }
    };

     const filteredDeliveries = deliveries
    .filter((delivery) => {
        // Búsqueda por término ingresado (nombre de cliente, número de cliente, número de albarán)
        const searchTermMatch = (
            (delivery.customer_name && delivery.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
            (delivery.client_number_display && delivery.client_number_display.toString().includes(searchTerm)) || 
            (delivery.delivery_number && delivery.delivery_number.toString().includes(searchTerm))
        );
    
        // Filtros por fechas, transportista, tipo de visita, estado, etc.
        const dateFromMatch = filters.dateFrom ? new Date(delivery.created_at) >= new Date(filters.dateFrom) : true;
        const dateToMatch = filters.dateTo ? new Date(delivery.created_at) <= new Date(filters.dateTo) : true;
        const transportistaMatch = selectedTransportistas.length > 0
                ? selectedTransportistas.some(t => t.value === delivery.username)
                : true;
        const visitTypeMatch = filters.visitType ? delivery.visit_type === filters.visitType : true;
        const statusMatch = filters.status ? delivery.status === filters.status : true;
        const hasIncidentNumberMatch = filters.hasIncidentNumber === 'yes' 
            ? !!delivery.incident_number 
            : filters.hasIncidentNumber === 'no' 
            ? !delivery.incident_number 
            : true;
        
        const hasObservationsMatch = filters.hasObservations === 'yes'
            ? !!delivery.observations 
            : filters.hasObservations === 'no' 
            ? !delivery.observations 
            : true;

        // Retornar solo si coincide con la búsqueda y los filtros
        return searchTermMatch && dateFromMatch && dateToMatch && transportistaMatch && visitTypeMatch && statusMatch && hasIncidentNumberMatch && hasObservationsMatch;
    })
    .sort((a, b) => {
        // Ordenar según la selección del usuario
        if (filters.orderByDate === 'asc') {
            return new Date(a.created_at) - new Date(b.created_at);
        } else {
            return new Date(b.created_at) - new Date(a.created_at);
        }
    });

    

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDeliveries = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    

return (
    <div className="admin-dashboard">
        {/* Header container */}
        <div className="header-container">
            <button className="list-view-button" onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}>
                {viewMode === 'cards' ? 'Vista de Lista' : 'Vista de Tarjetas'}
            </button>
            <h2>Gestión entregas</h2>
            <input 
                type="text" 
                className="search-bar" 
                placeholder="Buscar..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />

                    {/* Botón de retorno al Dashboard */}
                    <button className="btn btn-secondary" onClick={() => navigate('/Dashboard.js')}>
                    <i className="bi bi-house-fill"></i> {/* Icono de Bootstrap de una casa */}
                    Dashboard
                    </button>
        </div>

        {/* Content wrapper */}
        <div className="content-wrapper">
            {/* Barra lateral de filtros */}
            <div className="filters-sidebar">
                <h4>Filtros</h4>
                <label>Rango de Fechas:</label>
                <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
                <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />

                <label>Ordenar por Fecha:</label>
                <select name="orderByDate" value={filters.orderByDate} onChange={handleFilterChange}>
                    <option value="desc">Más reciente</option>
                    <option value="asc">Más antiguo</option>
                </select>

                <label>Transportista:</label>
                <Select
                    isMulti
                    name="transportista"
                    options={transportistaOptions}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={handleTransportistaChange}
                    value={selectedTransportistas}
                />

                <label>Tipo de Visita:</label>
                <select name="visitType" value={filters.visitType} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    <option value="delivery">Entrega</option>
                    <option value="verification">Verificación</option>
                    <option value="resolution">Resolución</option>
                </select>

                <label>Estado:</label>
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    <option value="pendiente_tratar">Pendiente de Tratar</option>
                    <option value="tratado_pendiente_resolucion">Tratado Pendiente de Resolución</option>
                    <option value="finalizado">Finalizado</option>
                </select>

                <label>Número de Incidencia:</label>
                <select name="hasIncidentNumber" value={filters.hasIncidentNumber} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    <option value="yes">Sí</option>
                    <option value="no">No</option>
                </select>

                <label>Observaciones:</label>
                <select name="hasObservations" value={filters.hasObservations} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    <option value="yes">Sí</option>
                    <option value="no">No</option>
                </select>
            </div>

            {/* Contenido principal */}
            <div className="content">
                {loading ? (
                    <p>Cargando albaranes...</p>
                ) : viewMode === 'cards' ? (
                    <div className="card-container">
                        {currentDeliveries.map((delivery) => (
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
                                            {delivery.has_issue && (
                                                <>
                                                    <p><strong>Nº Producto/s: </strong></p> {renderProductsWithIssue(delivery)}
                                                </>
                                            )}

                                            {delivery.observations && (
                                                <div className="observations-section">
                                                    <h4>Observaciones:</h4>
                                                    <p>{delivery.observations}</p>
                                                </div>
                                            )}

                                            <div className="image-containers">
                                                <div className="image-slider">
                                                    <h4>Finalización Entrega</h4>
                                                    <Slider {...getSliderSettings(delivery.delivery_images.length)}>
                                                        {renderImages(delivery.delivery_images)}
                                                    </Slider>
                                                </div>

                                                {delivery.visit_type === 'verification' && !delivery.is_resolved && delivery.issue_photos.length > 0 && (
                                                    <div className="image-slider">
                                                        <h4>Fotos de la Incidencia</h4>
                                                        <Slider {...getSliderSettings(delivery.issue_photos.length)}>
                                                            {renderImages(delivery.issue_photos)}
                                                        </Slider>
                                                    </div>
                                                )}

                                                {delivery.visit_type === 'resolution' && !delivery.is_resolved && delivery.issue_photos.length > 0 && (
                                                    <div className="image-slider">
                                                        <h4>Fotos de la Incidencia</h4>
                                                        <Slider {...getSliderSettings(delivery.issue_photos.length)}>
                                                            {renderImages(delivery.issue_photos)}
                                                        </Slider>
                                                    </div>
                                                )}

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
                                                            maxLength="4"
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
                ) : (
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
                            {currentDeliveries.map((delivery) => (
                                <tr key={delivery.id}>
                                    <td>{delivery.delivery_number}</td>
                                    <td>{delivery.client_number_display} {delivery.customer_name}</td> 
                                    <td>{delivery.visit_type}</td>
                                    <td>{delivery.status}</td>
                                    <td>{new Date(delivery.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Paginación */}
                <Pagination
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredDeliveries.length}
                    paginate={paginate}
                />

                {lightboxOpen && (
                    <Lightbox
                        open={lightboxOpen}
                        close={closeLightbox}
                        slides={lightboxImages}
                        index={lightboxStartIndex}
                    />
                )}
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
            </div>
        </div>
    </div>
);

}     

export default AdminPage;

// cuando en el filtro de fechas ponemos uno más antiguo de lo que hay creado se genera un error, modificar selector fecha para que sólo 
// permita elegir hasta donde hay disponible.

// Verificar si ocurre lo mismo con el transportista
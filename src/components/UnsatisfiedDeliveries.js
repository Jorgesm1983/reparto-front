import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './UnsatisfiedCustomers.css'; // Estilos personalizados

const UnsatisfiedCustomersPage = () => {
    const [unsatisfiedDeliveries, setUnsatisfiedDeliveries] = useState([]);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        clientNumber: '',
        status_satisfaction: ''
    });
    const [page, setPage] = useState(1);
    const [numPages, setNumPages] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [expanded, setExpanded] = useState(null); // Para controlar qué observación está expandida
    const location = useLocation(); // Obtener la URL actual
    const navigate = useNavigate();  // Usar navigate para actualizar la URL

    // Flag para prevenir actualizaciones innecesarias
    const [initialized, setInitialized] = useState(false);

    // Función para leer parámetros de la URL al cargar la página
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlFilters = {
            dateFrom: params.get('dateFrom') || '',
            dateTo: params.get('dateTo') || '',
            clientNumber: params.get('client_number') || '',
            status_satisfaction: params.get('status_satisfaction') || ''
        };
        const pageFromUrl = parseInt(params.get('page'), 10) || 1;

        if (!initialized) {
            // Si aún no hemos inicializado los filtros desde la URL, lo hacemos aquí
            setFilters(urlFilters);
            setPage(pageFromUrl);
            setInitialized(true);  // Marcamos como inicializado para prevenir ciclos
        }
    }, [location.search, initialized]);

    // Función para manejar los cambios de los filtros
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value
        }));
    };

    // Función para actualizar la URL con los filtros seleccionados
    const updateUrlWithFilters = useCallback(() => {
        const params = new URLSearchParams();
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.set('dateTo', filters.dateTo);
        if (filters.clientNumber) params.set('client_number', filters.clientNumber);
        if (filters.status_satisfaction) params.set('status_satisfaction', filters.status_satisfaction);
        params.set('page', page);

        const currentUrl = `?${params.toString()}`;
        if (location.search !== currentUrl) {
            navigate(currentUrl, { replace: true }); // Solo actualiza la URL si es diferente
        }
    }, [filters, page, navigate, location.search]);

    // Actualiza la URL cuando los filtros o la página cambian
    useEffect(() => {
        if (initialized) {  // Solo actualizamos la URL si ya hemos inicializado los filtros desde la URL
            updateUrlWithFilters();
        }
    }, [filters, page, updateUrlWithFilters, initialized]);

    // Función para obtener los albaranes insatisfechos
    useEffect(() => {
        const fetchUnsatisfiedDeliveries = async () => {
            try {
                const params = new URLSearchParams();
                params.append('page', page);  // Añadir la paginación
                if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
                if (filters.dateTo) params.append('dateTo', filters.dateTo);
                if (filters.clientNumber) params.append('client_number', filters.clientNumber);
                if (filters.status_satisfaction) params.append('status_satisfaction', filters.status_satisfaction);

                const response = await axios.get(`http://192.168.1.40:8000/api/unsatisfied_customers/?${params.toString()}&ordering=-created_at`);
                
                setUnsatisfiedDeliveries(response.data.results);
                setPage(response.data.page);
                setNumPages(response.data.num_pages);
            } catch (error) {
                console.error('Error al obtener los clientes insatisfechos:', error);
                setError('Error al obtener los clientes insatisfechos');
            }
        };

        if (initialized) {  // Solo hacemos la petición si los filtros han sido inicializados
            fetchUnsatisfiedDeliveries();
        }
    }, [filters, page, initialized]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleObservationChange = (id, newObservation) => {
        const updatedDeliveries = unsatisfiedDeliveries.map((delivery) =>
            delivery.id === id ? { ...delivery, observations: newObservation } : delivery
        );
        setUnsatisfiedDeliveries(updatedDeliveries);
    };

    const saveObservation = async (id) => {
        try {
            const delivery = unsatisfiedDeliveries.find((d) => d.id === id);
            await axios.put(`http://192.168.1.40:8000/api/update_unsatisfied_observation/${id}/`, {
                observations: delivery.observations
            });

            const updatedDeliveries = unsatisfiedDeliveries.map((d) =>
                d.id === id ? { ...d, status_satisfaction: 'tratado' } : d
            );
            setUnsatisfiedDeliveries(updatedDeliveries);
            setSuccess('Observaciones guardadas con éxito');
        } catch (error) {
            console.error('Error al guardar observaciones:', error);
            setError('Error al guardar observaciones');
        }
    };

    const getStatusLabel = (status_satisfaction) => {
        return status_satisfaction === 'tratado' ? 'Tratado' : 'No Tratado';
    };

    const toggleExpanded = (id) => {
        setExpanded((prevExpanded) => (prevExpanded === id ? null : id));
    };

    return (
        <div className="unsatisfied-customers-page">
            <div className="header-container">
                <h2>Clientes Insatisfechos</h2>
                <Link to="/dashboard" className="btn btn-secondary">
                    <i className="bi bi-house-fill"></i> Dashboard
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="content-wrapper">
                <div className="filters-sidebar">
                    <h4>Filtros</h4>
                    <label>Fecha desde:</label>
                    <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />

                    <label>Fecha hasta:</label>
                    <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />

                    <label>Número de Cliente:</label>
                    <input type="text" name="clientNumber" value={filters.clientNumber} onChange={handleFilterChange} />

                    <label>Estado:</label>
                    <select name="status_satisfaction" value={filters.status_satisfaction} onChange={handleFilterChange}>
                        <option value="">Todos</option>
                        <option value="no_tratado">No Tratado</option>
                        <option value="tratado">Tratado</option>
                    </select>
                </div>

                <div className="content">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Albarán</th>
                                <th>Cliente</th>
                                <th>Observaciones</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unsatisfiedDeliveries.map((delivery) => (
                                <tr key={delivery.id}>
                                    <td>{`${delivery.fiscal_year}/${delivery.delivery_number}`}</td>
                                    <td>{delivery.client_number_display ? `${delivery.client_number_display} - ${delivery.customer_name}` : delivery.customer_name}</td>
                                    <td>
                                        {expanded === delivery.id ? (
                                            <textarea
                                                value={delivery.observations || ''}
                                                onChange={(e) => handleObservationChange(delivery.id, e.target.value)}
                                                onBlur={() => toggleExpanded(null)}
                                                style={{ width: '100%' }}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={delivery.observations || ''}
                                                onClick={() => toggleExpanded(delivery.id)}
                                                readOnly
                                                style={{ width: '100%' }}
                                            />
                                        )}
                                    </td>
                                    <td>{getStatusLabel(delivery.status_satisfaction)}</td>
                                    <td>{new Date(delivery.created_at).toLocaleString()}</td>
                                    <td>
                                        <button className="btn btn-secondary" onClick={() => saveObservation(delivery.id)}>
                                            Guardar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="pagination">
                        {Array.from({ length: numPages }, (_, index) => (
                            <button
                                key={index + 1}
                                className={page === index + 1 ? 'active' : ''}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnsatisfiedCustomersPage;

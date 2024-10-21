import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmailFailure.css'; // Estilos personalizados para esta página
import { useNavigate} from 'react-router-dom';  // Asegúrate de importar useNavigate

const EmailFailuresPage = () => {
    // Definir el estado para los fallos de emails, motivos, y mensajes de error/éxito
    const [emailFailures, setEmailFailures] = useState([]);
    const [reasons, setReasons] = useState([]);  // Estado para los motivos
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    // Definir los filtros en el estado
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        emailType: '',
        clientNumber: '',
        status: '',
        reason: ''  // Filtro para motivos
    });

    // Función para manejar cambios en los filtros (inputs del formulario)
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    // Fetch inicial de los fallos de emails
    useEffect(() => {
        const fetchEmailFailures = async () => {
            try {
                const params = new URLSearchParams();
                if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
                if (filters.dateTo) params.append('dateTo', filters.dateTo);
                if (filters.emailType) params.append('email_type', filters.emailType);
                if (filters.clientNumber) params.append('client_number', filters.clientNumber);
                if (filters.status) params.append('status', filters.status);
                if (filters.reason) params.append('reason', filters.reason);

                const response = await axios.get(`http://192.168.1.40:8000/api/email_failures/?${params.toString()}`);
                setEmailFailures(response.data);
            } catch (error) {
                console.error('Error al obtener los fallos de emails:', error);
                setError('Error al obtener los fallos de emails.');
            }
        };

        fetchEmailFailures();
    }, [filters]); // Re-fetch when filters change

    // Fetch de los motivos (reasons) para alimentar el filtro
    useEffect(() => {
        const fetchReasons = async () => {
            try {
                const response = await axios.get('http://192.168.1.40:8000/api/email_failures/reasons/'); // Ajusta la ruta según tu API
                setReasons(response.data);  // Guardamos los motivos en el estado
            } catch (error) {
                console.error('Error al obtener los motivos:', error);
                setError('Error al obtener los motivos.');
            }
        };

        fetchReasons();
    }, []);  // Esto solo se ejecuta una vez al cargar el componente

    // Maneja el cambio de estado de contacto del email fallido
    const handleStatusChange = (id, newStatus) => {
        axios.put(`http://tu_api/update_failure/${id}/`, { status: newStatus })
        .then(() => {
            // Vuelve a obtener los datos o actualiza el estado local
            setEmailFailures(prevFailures =>
                prevFailures.map(failure =>
                    failure.id === id ? { ...failure, status: newStatus } : failure
                )
            );
        });
};

    // Maneja el cambio de email en el campo editable
    const handleEmailChange = (id, newEmail) => {
        const updatedFailures = emailFailures.map(failure =>
            failure.id === id ? { ...failure, email: newEmail } : failure
        );
        setEmailFailures(updatedFailures);
    };

    // Enviar el email después de corregir la dirección
    const resendEmail = async (id) => {
        try {
            const response = await axios.post(`http://192.168.1.40:8000/api/resend_email/${id}/`);
            console.log("Correo reenviado con éxito:", response.data);
        } catch (error) {
            console.error("Error al reenviar el correo:", error.response);
        }
    };

    // Actualiza el email y el estado de contacto en la base de datos
    const saveChanges = async (id) => {
        try {
            const failure = emailFailures.find(f => f.id === id);
            
            await axios.put(`http://192.168.1.40:8000/api/update_failure/${id}/`, {
                new_email: failure.email,
                status: failure.contact_status,  // Asegúrate de que este valor sea correcto
            });
            setSuccess('Cambios guardados correctamente.');
        } catch (error) {
            console.error('Error al guardar los cambios:', error);
            setError('Error al guardar los cambios.');
        }
    };

    return (
        <div className="email-failures-page">
            <div className="header-container"> {/* Contenedor para el título y el botón */}
                <h2>Fallos de Envío de Emails</h2>
                <button className="btn btn-secondary dashboard-btn" onClick={() => navigate('/Dashboard')}>
                    <i className="bi bi-house-fill"></i> {/* Icono de Bootstrap de una casa */}
                    Dashboard
                </button>
            </div>

            {/* Mostrar el mensaje de error si existe */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Mostrar el mensaje de éxito si existe */}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="content-wrapper">
                {/* Barra lateral de filtros */}
                <div className="filters-sidebar">
                    <h4>Filtros</h4>
                    
                    <label>Fecha desde:</label>
                    <input type="date" name="dateFrom" onChange={handleFilterChange} />
                    
                    <label>Fecha hasta:</label>
                    <input type="date" name="dateTo" onChange={handleFilterChange} />
                    
                    <label>Tipo de Email:</label>
                    <select name="emailType" onChange={handleFilterChange}>
                        <option value="">Todos</option>
                        <option value="albaran_incidencia">Albarán con Incidencia</option>
                        <option value="registro_incidencia">Registro de Incidencia</option>
                        <option value="resolucion_incidencia">Resolución de Incidencia</option>
                    </select>

                    <label>Motivo:</label>
                    <select name="reason" onChange={handleFilterChange}>
                        <option value="">Todos</option>
                        {reasons.map((reason, index) => (
                            <option key={index} value={reason}>{reason}</option>
                        ))}
                    </select>
                    
                    <label>Número de Cliente:</label>
                    <input type="text" name="clientNumber" onChange={handleFilterChange} />
                    
                    <label>Estado:</label>
                    <select name="status" onChange={handleFilterChange}>
                        <option value="">Todos</option>
                        <option value="pending">Pendiente de Contacto</option>
                        <option value="contacted">Contactado</option>
                    </select>
                </div>

                {/* Contenido principal */}
                <div className="content">
                    {/* Tabla de fallos de emails */}
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Albarán</th>
                                <th>Cliente</th>
                                <th>Email</th>
                                <th>Tipo de Email</th>
                                <th>Motivo</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emailFailures.map((failure) => (
                                <tr key={failure.id}>
                                    <td>{failure.albaran}</td>
                                    <td>{failure.client_number}</td>
                                    <td>
                                        <input 
                                            type="email"
                                            onChange={(e) => handleEmailChange(failure.id, e.target.value)}
                                            placeholder={failure.customer_email || 'Introduce un nuevo correo'}  // Aquí añades el email como placeholder
                                        />
                                    </td>
                                    <td>{failure.email_type}</td>
                                    <td>{failure.reason}</td>
                                    <td>
                                        <select
                                            value={failure.status}  
                                            onChange={(e) => handleStatusChange(failure.id, e.target.value)}  
                                        >
                                            <option value="pending">No Contactado</option> 
                                            <option value="contacted">Contactado</option>  
                                        </select>
                                    </td>

                                    <td>{failure.created_at}</td> {/* Mostrar la fecha de inserción */}
                                    <td className="action-buttons">
                                        <button className="btn btn-primary" onClick={() => resendEmail(failure.id)}>
                                            Reenviar
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => saveChanges(failure.id)}>
                                            Guardar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmailFailuresPage;

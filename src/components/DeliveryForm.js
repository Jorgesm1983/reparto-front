import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

function DeliveryForm() {
    const [visitType, setVisitType] = useState('');
    const [fiscalYear, setFiscalYear] = useState('');
    const [deliveryNumber, setDeliveryNumber] = useState('');
    const [clientNumber, setClientNumber] = useState('');
    const [clientName, setClientName] = useState(''); // Nuevo estado para el nombre del cliente
    const [clientConformity, setClientConformity] = useState('Sí');
    const [hasIssue, setHasIssue] = useState('No');
    const [observations, setObservations] = useState('');
    const [issues, setIssues] = useState(['']);
    const [productDescriptions, setProductDescriptions] = useState([]); // Estado para las descripciones de productos
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [touched, setTouched] = useState({});
    const [completionPhotos, setCompletionPhotos] = useState([]);
    const [issuePhotos, setIssuePhotos] = useState([]);
    const [is_resolved, setIssueResolved] = useState('No');  // Mantenemos el valor en cadena
    // const validIssues = issues.filter(issue => issue !== '' && !isNaN(issue)).map(issue => parseInt(issue, 10));
    const completionPhotosRef = useRef(null);
    const issuePhotosRef = useRef(null);
    
// Función para buscar el nombre del cliente basado en el número de cliente
const fetchClientName = async (clientNumber) => {
    
    try {
        const csrfToken = Cookies.get('csrftoken'); // Asegúrate de obtener el token CSRF desde las cookies
        const response = await axios.get(`http://192.168.1.40:8000/api/customer/${clientNumber}/`, {
            headers: {
                'X-CSRFToken': csrfToken, // Incluye el CSRF token si es necesario
            },
            withCredentials: true, // Esto asegura que las cookies de sesión se envíen con la solicitud
        });
        if (response.data.name) {
            setClientName(response.data.name); // Asignamos el nombre del cliente si lo encontramos
        } else {
            setClientName('Cliente no encontrado'); // Limpiamos el nombre si no se encuentra
        }
    } catch (error) {
        console.error('Error obteniendo el nombre del cliente:', error);
        setClientName('Cliente no encontrado'); // Limpiamos el nombre en caso de error
    }
};

// Función para manejar el cambio en el número de cliente
const handleClientNumberChange = (event) => {
    const clientNumberValue = event.target.value;
    setClientNumber(clientNumberValue);

    // Solo buscar si el valor tiene al menos un dígito y es válido
    if (clientNumberValue && !isNaN(clientNumberValue)) {
        fetchClientName(clientNumberValue);
    } else {
        setClientName('');
    }
};

// Función para buscar la descripción del producto basado en el número de producto
const fetchProductDescription = async (index, value) => {
    
    try {
        const csrfToken = Cookies.get('csrftoken'); // Asegúrate de obtener el token CSRF desde las cookies
        const response = await axios.get(`http://192.168.1.40:8000/api/product/${value}/`, {
            headers: {
                'X-CSRFToken': csrfToken, // Incluye el CSRF token si es necesario
            },
            withCredentials: true, // Esto asegura que las cookies de sesión se envíen con la solicitud
        });
        if (response.data.description) {
            const newProductDescriptions = [...productDescriptions];
            newProductDescriptions[index] = response.data.description; // Guardamos la descripción del producto
            setProductDescriptions(newProductDescriptions);
        } else {
            const newProductDescriptions = [...productDescriptions];
            newProductDescriptions[index] = ''; // Limpiamos si no se encuentra la descripción
            setProductDescriptions(newProductDescriptions);
        }
    } catch (error) {
        console.error('Error obteniendo la descripción del producto:', error);
        const newProductDescriptions = [...productDescriptions];
        newProductDescriptions[index] = ''; // Limpiamos en caso de error
        setProductDescriptions(newProductDescriptions);
    }
};

    // Función para manejar el cambio en los productos afectados
    const handleIssueChange = (index, value) => {
        // const intValue = parseInt(value, 10);
        const newIssues = [...issues];
        newIssues[index] = value; // Convertir a entero
        setIssues(newIssues);

        // Solo buscar si el valor es válido
        if (value && !isNaN(value)) {
            fetchProductDescription(index, value);  // Buscar la descripción del producto
        } else {
            const newProductDescriptions = [...productDescriptions];
            newProductDescriptions[index] = '';  // Limpiar la descripción si el valor no es válido
            setProductDescriptions(newProductDescriptions);
        }
    };


    const validateForm = useCallback(() => {
        const newErrors = {};

        if (touched.fiscalYear && !/^\d{4}$/.test(fiscalYear)) {
            newErrors.fiscalYear = 'El año fiscal debe tener 4 dígitos.';
        }

        if (touched.deliveryNumber && !/^\d+$/.test(deliveryNumber)) {
            newErrors.deliveryNumber = 'El campo del albarán solo puede contener números.';
        }

        if (touched.clientNumber && !/^\d+$/.test(clientNumber)) {
            newErrors.clientNumber = 'El número de cliente solo puede contener números.';
        }

        if (touched.issues && !/^\d+$/.test(issues)) {
            newErrors.issues = 'El número de producto solo puede contener números.';
        }
        if (
            (visitType === 'delivery' && (clientConformity === 'No' || hasIssue === 'Sí')) ||
            ((visitType === 'verification' || visitType === 'resolution') && is_resolved === 'No') ||
            ((visitType === 'verification' || visitType === 'resolution') && clientConformity === 'No') // Nueva validación para "verification" y "resolution"
        ) {
            if (!observations) {
                newErrors.observations = 'Las observaciones son obligatorias en este caso.';
            }
        }

        if (visitType === 'delivery' && hasIssue === 'Sí' && issues.every(issue => issue === '')) {
            newErrors.issues = 'Debe ingresar al menos un número de producto si hay una incidencia.';
        }

        

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [touched, fiscalYear, deliveryNumber, clientNumber, clientConformity, hasIssue, observations, issues, visitType, is_resolved]);

    useEffect(() => {
        validateForm();
    }, [clientConformity, hasIssue, observations, visitType, is_resolved, validateForm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setTouched({
            fiscalYear: true,
            deliveryNumber: true,
            clientNumber: true,
            observations: true,
        });

        if (!validateForm()) {
            console.log('Errores de validación', errors);
            return;
        }

        const formData = new FormData();
        formData.append('visit_type', visitType);
        formData.append('fiscal_year', fiscalYear);
        formData.append('delivery_number', deliveryNumber);
        formData.append('client_number', clientNumber);
        formData.append('client_conformity', clientConformity === 'Sí');
        formData.append('has_issue', hasIssue === 'Sí');
        formData.append('observations', observations);
        formData.append('is_resolved', is_resolved === 'Sí');  // Convertir a booleano
        completionPhotos.forEach((photo, index) => {
            formData.append('uploaded_delivery_images', photo);
            console.log(`Añadiendo imagen de entrega [${index}]:`, photo);
        });
        
        // Si hay problemas y se seleccionaron productos con incidencia, agregarlos a `issues`
        if (hasIssue === 'Sí' && issues.length > 0) {
            issues.forEach((issue, index) => {
                if (!isNaN(issue)) {
                    formData.append('issues', issue);
                    console.log(`Añadiendo problema [${index}]:`, issue);
                }
            });
        }
        
        // Agregar fotos de incidencia a `uploaded_issue_photos` si hay incidencia o si no está resuelto
        if (hasIssue === 'Sí' || is_resolved === 'No') {
            
            issuePhotos.forEach((photo, index) => {
                formData.append('uploaded_issue_photos', photo);
                console.log(`Añadiendo foto de incidencia [${index}]:`, photo);
            });
        }
        
        try {
            const csrfToken = Cookies.get('csrftoken'); // Obtener el CSRF token de las cookies
            const response = await axios.post('http://192.168.1.40:8000/api/deliveries/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrfToken, // Incluye el token CSRF para la protección
                },
                withCredentials: true, 
            });
        
            console.log('Respuesta del servidor:', response.data);
            setMessage('Entrega registrada con éxito.');
            setTimeout(() => {
                resetForm();
            }, 1000);
        
        } catch (error) {
            console.error('Error registrando la entrega:', error);
            setMessage('Error al registrar la entrega. Intenta de nuevo.');
        }
        
    };

    const resetForm = () => {
        setVisitType('');
        setFiscalYear('');
        setDeliveryNumber('');
        setClientNumber('');
        setClientConformity('Sí');
        setHasIssue('No');
        setObservations('');
        setIssues(['']);
        setCompletionPhotos([]);
        setIssuePhotos([]);
        setIssueResolved('No');  // Resetear el valor en cadena
        setErrors({});
        setMessage('');
        setTouched({});
        setClientName('');  // Limpiar el nombre del cliente
        setProductDescriptions([]);  // Limpiar las descripciones de los productos

        if (completionPhotosRef.current) {
            completionPhotosRef.current.value = '';
        }
        if (issuePhotosRef.current) {
            issuePhotosRef.current.value = '';
        }
    };


    return (
        
        <div className="container mt-5">
            <div class="logo-container">
                <img src="/logo.png" alt="Logo de la empresa"></img>
                </div>
            <div className="card">
                
                <div className="card-header">
                    Formulario de Entrega
                </div>
                {message && (
                    <div className={`alert ${message.includes('éxito') ? 'alert-success' : 'alert-danger'}`}>
                        {message}
                    </div>
                )}
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="visitType">Tipo de Visita</label>
                            <select
                                id="visitType"
                                className="form-control"
                                value={visitType}
                                onChange={(e) => setVisitType(e.target.value)}
                                required
                            >
                                <option value="">Selecciona el tipo de visita</option>
                                <option value="delivery">Entrega</option>
                                <option value="verification">Verificación</option>
                                <option value="resolution">Resolución</option>
                            </select>
                        </div>
    
                        {visitType && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="clientNumber">Número de Cliente</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.clientNumber ? 'is-invalid' : ''}`}
                                        id="clientNumber"
                                        value={clientNumber}  // Solo el número de cliente es editable
                                        onChange={handleClientNumberChange}
                                        onBlur={() => setTouched(prev => ({ ...prev, clientNumber: true }))}
                                        placeholder="Número de Cliente"
                                        required
                                    />
                                    {clientName && (
                                    <input
                                        type="text"
                                        className="form-control mt-2"
                                        value={clientName}
                                        readOnly  // Hacemos que el nombre no sea editable
                                    />
                                )}
                                    {errors.clientNumber && <div className="invalid-feedback">{errors.clientNumber}</div>}
                                </div>
    
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="fiscalYear">Año Fiscal</label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.fiscalYear ? 'is-invalid' : ''}`}
                                            id="fiscalYear"
                                            value={fiscalYear}
                                            onChange={(e) => setFiscalYear(e.target.value)}
                                            onBlur={() => setTouched(prev => ({ ...prev, fiscalYear: true }))}
                                            placeholder="Ej: 2024"
                                        />
                                        {errors.fiscalYear && <div className="invalid-feedback">{errors.fiscalYear}</div>}
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="deliveryNumber">Número del Albarán</label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.deliveryNumber ? 'is-invalid' : ''}`}
                                            id="deliveryNumber"
                                            value={deliveryNumber}
                                            onChange={(e) => setDeliveryNumber(e.target.value)}
                                            onBlur={() => setTouched(prev => ({ ...prev, deliveryNumber: true }))}
                                            placeholder="Ej: 12345"
                                        />
                                        {errors.deliveryNumber && <div className="invalid-feedback">{errors.deliveryNumber}</div>}
                                    </div>
                                </div>
    
                                
    
                                {visitType === 'delivery' && (
                                    <>
                                        <fieldset className="form-group">
                                            <legend>¿Hay Incidencia?</legend>
                                            <div className="radio-group" >
                                                
                                                    <div className="custom-control custom-radio">
                                                        <input
                                                            type="radio"
                                                            id="hasIssueYes"
                                                            name="hasIssue"
                                                            className="custom-control-input"
                                                            value="Sí"
                                                            checked={hasIssue === 'Sí'}
                                                            onChange={(e) => setHasIssue(e.target.value)}
                                                        />
                                                        <label className="custom-control-label" htmlFor="hasIssueYes">Sí</label>
                                                    </div>
                                                
                                               
                                                    <div className="custom-control custom-radio">
                                                        <input
                                                            type="radio"
                                                            id="hasIssueNo"
                                                            name="hasIssue"
                                                            className="custom-control-input"
                                                            value="No"
                                                            checked={hasIssue === 'No'}
                                                            onChange={(e) => setHasIssue(e.target.value)}
                                                        />
                                                        <label className="custom-control-label" htmlFor="hasIssueNo">No</label>
                                                    </div>
                                                
                                            </div>
                                        </fieldset>
    
                                        {hasIssue === 'Sí' && (
                                            <>
                                                <div className="form-group">
                                                    <label htmlFor="issuePhotos">Foto de Incidencia</label>
                                                    <input
                                                        type="file"
                                                        id="issuePhotos"
                                                        className="form-control-file"
                                                        multiple
                                                        ref={issuePhotosRef}
                                                        onChange={(e) => setIssuePhotos([...e.target.files])}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="issues">Números de Productos Afectados</label>
                                                    {issues.map((issue, index) => (
                                                        <div key={index} className="product-item-row align-items-center mb-2">
                                                             <div className="form-group product-input-group">
                                                                <input
                                                                    type="number"
                                                                    className={`form-control ${errors.issues ? 'is-invalid' : ''}`}
                                                                    value={issue || ''}  // El número del producto es editable  // El número del producto es editable
                                                                    onChange={(e) => handleIssueChange(index, e.target.value)}  // Pasamos solo el número ingresado
                                                                    inputMode="numeric"  // Muestra un teclado numérico en dispositivos móviles
                                                                    pattern="[0-9]*"  // Acepta solo números
                                                                    placeholder="Número de producto"
                                                                    style={{ width: '100%' }}
                                                                />
                                                                {productDescriptions[index] && (
                                                                <input
                                                                    type="text"
                                                                    className="form-control mt-2"
                                                                    value={productDescriptions[index]}  // Mostrar la descripción del producto
                                                                    readOnly  // Hacemos que la descripción no sea editable
                                                                />
                                                            )}
                                                            </div>
                                                               
                                                                {/* Botón "+" para añadir un artículo */}
                                                                <div className="form-group d-flex justify-content-start align-items-center button-group">
                                                                {index === issues.length - 1 && (                                        
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-success product-add-btn"
                                                                        onClick={() => setIssues([...issues, ''])}
                                                                        style={{ width: '40px', height: '40px', marginRight: '5px', marginLeft: '5px' }}
                                                                    >
                                                                        +
                                                                    </button>
                                                                )}
                                                          

                                                            {/* Mostrar el botón "-" solo para el último artículo a partir del segundo */}

                                                            {index === issues.length - 1 && index > 0 && (
                                                            
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger product-remove-btn"
                                                                    onClick={() => setIssues(issues.filter((_, i) => i !== index))}
                                                                    style={{ width: '40px', height: '40px' }}
                                                                >
                                                                    -
                                                                </button>
                                                          
                                                            )}
                                                        </div>
                                                        </div>
                                                    ))}
                                                    
                                                    {errors.issues && <div className="invalid-feedback">{errors.issues}</div>}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
    
                                {(visitType === 'verification' || visitType === 'resolution') && (
                                    <>
                                        <fieldset className="form-group">
                                            <legend>¿Solucionado?</legend>
                                            <div className="radio-group">
                                               
                                                    <div className="custom-control custom-radio">
                                                        <input
                                                            type="radio"
                                                            id="issueResolvedYes"
                                                            name="is_resolved"
                                                            className="custom-control-input"
                                                            value="Sí"
                                                            checked={is_resolved === 'Sí'}
                                                            onChange={(e) => setIssueResolved(e.target.value)}
                                                        />
                                                        <label className="custom-control-label" htmlFor="issueResolvedYes">Sí</label>
                                                    </div>
                                                
                                                
                                                    <div className="custom-control custom-radio">
                                                        <input
                                                            type="radio"
                                                            id="issueResolvedNo"
                                                            name="is_resolved"
                                                            className="custom-control-input"
                                                            value="No"
                                                            checked={is_resolved === 'No'}
                                                            onChange={(e) => setIssueResolved(e.target.value)}
                                                        />
                                                        <label className="custom-control-label" htmlFor="issueResolvedNo">No</label>
                                                    </div>
                                                
                                            </div>
                                        </fieldset>
    
                                        {is_resolved === 'No' && (
                                            <div className="form-group">
                                                <label htmlFor="issuePhotos">Foto de Incidencia</label>
                                                <input
                                                    type="file"
                                                    id="issuePhotos"
                                                    className="form-control-file"
                                                    multiple
                                                    ref={issuePhotosRef}
                                                    onChange={(e) => setIssuePhotos([...e.target.files])}
                                                    required
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Alineamos los campos Cliente Conforme e Incidencia en paralelo */}
                                <fieldset className="form-group">
                                    <legend>¿Cliente Conforme?</legend>
                                    <div className="radio-group">
                                        
                                            <div className="custom-control custom-radio">
                                                <input
                                                    type="radio"
                                                    id="clientConformityYes"
                                                    name="clientConformity"
                                                    className="custom-control-input"
                                                    value="Sí"
                                                    checked={clientConformity === 'Sí'}
                                                    onChange={(e) => setClientConformity(e.target.value)}
                                                />
                                                <label className="custom-control-label" htmlFor="clientConformityYes">Sí</label>
                                            
                                        </div>
                                      
                                            <div className="custom-control custom-radio">
                                                <input
                                                    type="radio"
                                                    id="clientConformityNo"
                                                    name="clientConformity"
                                                    className="custom-control-input"
                                                    value="No"
                                                    checked={clientConformity === 'No'}
                                                    onChange={(e) => setClientConformity(e.target.value)}
                                                />
                                                <label className="custom-control-label" htmlFor="clientConformityNo">No</label>
                                            </div>
                                        
                                    </div>
                                </fieldset>
    
                                <div className="form-group file">
                                    <label htmlFor="completionPhotos">Foto de Finalización</label>
                                    <input
                                        type="file"
                                        id="completionPhotos"
                                        className="form-control-file"
                                        multiple
                                        ref={completionPhotosRef}
                                        onChange={(e) => setCompletionPhotos([...e.target.files])}
                                        required

                                    />
                                    
                                </div>
    
                                <div className="form-group">
                                    <label htmlFor="observations">Observaciones</label>
                                    <textarea
                                        id="observations"
                                        className={`form-control ${errors.observations ? 'is-invalid' : ''}`}
                                        value={observations}
                                        onChange={(e) => setObservations(e.target.value)}
                                        onBlur={() => setTouched(prev => ({ ...prev, observations: true }))}
                                        rows="4"
                                    />
                                    {errors.observations && <div className="invalid-feedback">{errors.observations}</div>}
                                </div>
                            </>
                        )}
    
                        <button type="submit" className="btn btn-primary btn-block">Enviar</button>
                    </form>
                </div>
            </div>
        </div>
    );
}    
export default DeliveryForm;



// en pantalla pequeña cuando se carga la descripción del artículo se descuadran los botones de añadir o eliminar.
// Darle una vuelta al botón de subida de archivo.

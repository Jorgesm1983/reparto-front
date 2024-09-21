
// import React, { useState, useEffect, useRef, useCallback} from 'react';
// import axios from 'axios';

// function DeliveryForm() {
//     const [fiscalYear, setFiscalYear] = useState('');
//     const [deliveryNumber, setDeliveryNumber] = useState('');
//     const [clientConformity, setClientConformity] = useState('Sí');
//     const [hasIssue, setHasIssue] = useState('No');
//     const [observations, setObservations] = useState('');
//     const [issues, setIssues] = useState(['']);
//     const [errors, setErrors] = useState({});
//     const [message, setMessage] = useState('');
//     const [touched, setTouched] = useState({});
//     const [completionPhotos, setCompletionPhotos] = useState([]);
//     const [issuePhotos, setIssuePhotos] = useState([]);

//     const completionPhotosRef = useRef(null);
//     const issuePhotosRef = useRef(null);

//     const handleIssueChange = (index, value) => {
//         const newIssues = [...issues];
//         newIssues[index] = value;
//         setIssues(newIssues);
//     };

//     const validateForm = useCallback(() => {
//         const newErrors = {};

//         if (touched.fiscalYear && !/^\d{4}$/.test(fiscalYear)) {
//             newErrors.fiscalYear = 'El año fiscal debe tener 4 dígitos.';
//         }

//         if (touched.deliveryNumber && !/^\d+$/.test(deliveryNumber)) {
//             newErrors.deliveryNumber = 'El campo del albarán solo puede contener números.';
//         }

//         if ((clientConformity === 'No' || hasIssue === 'Sí') && !observations) {
//             newErrors.observations = 'Las observaciones son obligatorias si el cliente no está conforme o hay una incidencia.';
//         }

//         if (hasIssue === 'Sí' && issues.every(issue => issue === '')) {
//             newErrors.issues = 'Debe ingresar al menos un número de producto si hay una incidencia.';
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     }, [touched, fiscalYear, deliveryNumber, clientConformity, hasIssue, observations, issues]); 

//     useEffect(() => {
//         validateForm();
//     }, [clientConformity, hasIssue, observations, validateForm]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setTouched({
//             fiscalYear: true,
//             deliveryNumber: true,
//             observations: true,
//         });

//         if (!validateForm()) {
//             console.log('Errores de validación', errors);
//             return;
//         }

//         const formData = new FormData();
//         formData.append('fiscal_year', fiscalYear);
//         formData.append('delivery_number', deliveryNumber);
//         formData.append('client_conformity', clientConformity === 'Sí');
//         formData.append('has_issue', hasIssue === 'Sí');
//         formData.append('observations', observations);

//         formData.append('issues', JSON.stringify(issues.filter(issue => issue !== '')));

//         completionPhotos.forEach(photo => formData.append('delivery_images', photo));
//         if (hasIssue === 'Sí') {
//             issuePhotos.forEach(photo => formData.append('issue_photos', photo));
//         }

//         try {
//             await axios.post('http://localhost:8000/api/deliveries/', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                     'X-Requested-With': 'XMLHttpRequest',
//                 }
//             });

//             setMessage('Entrega registrada con éxito.');
//             setTimeout(() => {
//                 resetForm();
//             }, 1000);

//         } catch (error) {
//             console.error('Error registrando la entrega:', error);
//             setMessage('Error al registrar la entrega. Intenta de nuevo.');
//         }
//     };

//     const resetForm = () => {
//         setFiscalYear('');
//         setDeliveryNumber('');
//         setClientConformity('Sí');
//         setHasIssue('No');
//         setObservations('');
//         setIssues(['']);
//         setCompletionPhotos([]);
//         setIssuePhotos([]);
//         setErrors({});
//         setMessage('');
//         setTouched({});

//         if (completionPhotosRef.current) {
//             completionPhotosRef.current.value = '';
//         }
//         if (issuePhotosRef.current) {
//             issuePhotosRef.current.value = '';
//         }
//     };

//     return (
//         <div className="container mt-5">
//             <div className="card">
//                 <div className="card-header">
//                     Formulario de Entrega
//                 </div>
//                 {message && (
//                     <div className={`alert ${message.includes('éxito') ? 'alert-success' : 'alert-danger'}`}>
//                         {message}
//                     </div>
//                 )}
//                 <div className="card-body">
//                     <form onSubmit={handleSubmit}>
//                         <div className="form-row">
//                             <div className="form-group col-md-6">
//                                 <label htmlFor="fiscalYear">Año Fiscal</label>
//                                 <input
//                                     type="text"
//                                     className={`form-control ${errors.fiscalYear ? 'is-invalid' : ''}`}
//                                     id="fiscalYear"
//                                     value={fiscalYear}
//                                     onChange={(e) => setFiscalYear(e.target.value)}
//                                     onBlur={() => setTouched(prev => ({ ...prev, fiscalYear: true }))}
//                                     placeholder="Ej: 2024"
//                                 />
//                                 {errors.fiscalYear && <div className="invalid-feedback">{errors.fiscalYear}</div>}
//                             </div>
//                             <div className="form-group col-md-6">
//                                 <label htmlFor="deliveryNumber">Número del Albarán</label>
//                                 <input
//                                     type="text"
//                                     className={`form-control ${errors.deliveryNumber ? 'is-invalid' : ''}`}
//                                     id="deliveryNumber"
//                                     value={deliveryNumber}
//                                     onChange={(e) => setDeliveryNumber(e.target.value)}
//                                     onBlur={() => setTouched(prev => ({ ...prev, deliveryNumber: true }))}
//                                     placeholder="Ej: 12345"
//                                 />
//                                 {errors.deliveryNumber && <div className="invalid-feedback">{errors.deliveryNumber}</div>}
//                             </div>
//                         </div>
//                         <fieldset className="form-group">
//                             <legend>Conformidad del Cliente</legend>
//                             <div className="form-row">
//                                 <div className="form-group col-md-6">
//                                     <div className="custom-control custom-radio">
//                                         <input
//                                             type="radio"
//                                             id="clientConformityYes"
//                                             name="clientConformity"
//                                             className="custom-control-input"
//                                             value="Sí"
//                                             checked={clientConformity === 'Sí'}
//                                             onChange={(e) => setClientConformity(e.target.value)}
//                                         />
//                                         <label className="custom-control-label" htmlFor="clientConformityYes">Sí</label>
//                                     </div>
//                                 </div>
//                                 <div className="form-group col-md-6">
//                                     <div className="custom-control custom-radio">
//                                         <input
//                                             type="radio"
//                                             id="clientConformityNo"
//                                             name="clientConformity"
//                                             className="custom-control-input"
//                                             value="No"
//                                             checked={clientConformity === 'No'}
//                                             onChange={(e) => setClientConformity(e.target.value)}
//                                         />
//                                         <label className="custom-control-label" htmlFor="clientConformityNo">No</label>
//                                     </div>
//                                 </div>
//                             </div>
//                         </fieldset>
//                         <fieldset className="form-group">
//                             <legend>Incidencia</legend>
//                             <div className="form-row">
//                                 <div className="form-group col-md-6">
//                                     <div className="custom-control custom-radio">
//                                         <input
//                                             type="radio"
//                                             id="hasIssueYes"
//                                             name="hasIssue"
//                                             className="custom-control-input"
//                                             value="Sí"
//                                             checked={hasIssue === 'Sí'}
//                                             onChange={(e) => setHasIssue(e.target.value)}
//                                         />
//                                         <label className="custom-control-label" htmlFor="hasIssueYes">Sí</label>
//                                     </div>
//                                 </div>
//                                 <div className="form-group col-md-6">
//                                     <div className="custom-control custom-radio">
//                                         <input
//                                             type="radio"
//                                             id="hasIssueNo"
//                                             name="hasIssue"
//                                             className="custom-control-input"
//                                             value="No"
//                                             checked={hasIssue === 'No'}
//                                             onChange={(e) => setHasIssue(e.target.value)}
//                                         />
//                                         <label className="custom-control-label" htmlFor="hasIssueNo">No</label>
//                                     </div>
//                                 </div>
//                             </div>
//                         </fieldset>
//                         {hasIssue === 'Sí' && (
//                             <>
//                                 <div className="form-group">
//                                     <label htmlFor="issues">Número(s) de Producto con Incidencia</label>
//                                     {issues.map((issue, index) => (
//                                         <div key={index} className="input-group mb-2">
//                                             <input
//                                                 type="text"
//                                                 className="form-control"
//                                                 value={issue}
//                                                 onChange={(e) => handleIssueChange(index, e.target.value)}
//                                                 placeholder={`Producto ${index + 1}`}
//                                             />
//                                             <div className="input-group-append">
//                                                 <button
//                                                     type="button"
//                                                     className="btn btn-outline-secondary"
//                                                     onClick={() => setIssues([...issues, ''])}
//                                                 >
//                                                     +
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                                 {errors.issues && <div className="text-danger">{errors.issues}</div>}
//                                 <div className="form-group">
//                                     <label htmlFor="issuePhotos">Fotos de Incidencia (opcional)</label>
//                                     <input
//                                         type="file" name="issue_photos"
//                                         className={`form-control-file ${errors.issuePhotos ? 'is-invalid' : ''}`}
//                                         id="issuePhotos"
//                                         ref={issuePhotosRef}
//                                         multiple
//                                         onChange={(e) => setIssuePhotos([...e.target.files])}
//                                     />
//                                 </div>
//                             </>
//                         )}
//                         <div className="form-group">
//                             <label htmlFor="completionPhotos">Fotos de Finalización de Trabajo (obligatorio)</label>
//                             <input
//                                 type="file" name="delivery_image"
//                                 className={`form-control-file ${errors.completionPhotos ? 'is-invalid' : ''}`}
//                                 id="completionPhotos"
//                                 ref={completionPhotosRef}
//                                 multiple
//                                 onChange={(e) => setCompletionPhotos([...e.target.files])}
//                                 required
//                             />
//                             {errors.completionPhotos && <div className="invalid-feedback">{errors.completionPhotos}</div>}
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="observations">Observaciones</label>
//                             <textarea
//                                 className={`form-control ${errors.observations ? 'is-invalid' : ''}`}
//                                 id="observations"
//                                 value={observations}
//                                 onChange={(e) => setObservations(e.target.value)}
//                                 onBlur={() => setTouched(prev => ({ ...prev, observations: true }))}
//                             />
//                             {errors.observations && <div className="invalid-feedback">{errors.observations}</div>}
//                         </div>
//                         <button type="submit" className="btn btn-primary">Enviar</button>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default DeliveryForm;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

function DeliveryForm() {
    const [visitType, setVisitType] = useState('');
    const [fiscalYear, setFiscalYear] = useState('');
    const [deliveryNumber, setDeliveryNumber] = useState('');
    const [clientNumber, setClientNumber] = useState('');
    const [clientConformity, setClientConformity] = useState('Sí');
    const [hasIssue, setHasIssue] = useState('No');
    const [observations, setObservations] = useState('');
    const [issues, setIssues] = useState([0]);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [touched, setTouched] = useState({});
    const [completionPhotos, setCompletionPhotos] = useState([]);
    const [issuePhotos, setIssuePhotos] = useState([]);
    const [is_resolved, setIssueResolved] = useState('No');  // Mantenemos el valor en cadena
    // const validIssues = issues.filter(issue => issue !== '' && !isNaN(issue)).map(issue => parseInt(issue, 10));
    const completionPhotosRef = useRef(null);
    const issuePhotosRef = useRef(null);
    

    const handleIssueChange = (index, value) => {
        const newIssues = [...issues];
        newIssues[index] = parseInt(value, 10); // Convertir a entero
        setIssues(newIssues);
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

        if (
            (visitType === 'delivery' && (clientConformity === 'No' || hasIssue === 'Sí')) ||
            ((visitType === 'verification' || visitType === 'resolution') && is_resolved === 'No')
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
        completionPhotos.forEach(photo => formData.append('delivery_images', photo));

        if (hasIssue === 'Sí' && issues.length > 0) {
            issues.forEach(issue => {
                if (!isNaN(issue)) {
                    formData.append('issues', issue);
                }
            });
        }  
        if (hasIssue === 'Sí' || is_resolved === 'No') {
            issuePhotos.forEach(photo => formData.append('issue_photos', photo));
        }

        try {
            await axios.post('http://localhost:8000/api/deliveries/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

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

        if (completionPhotosRef.current) {
            completionPhotosRef.current.value = '';
        }
        if (issuePhotosRef.current) {
            issuePhotosRef.current.value = '';
        }
    };


    return (
        <div className="container mt-5">
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
                                        type="text"
                                        className={`form-control ${errors.clientNumber ? 'is-invalid' : ''}`}
                                        id="clientNumber"
                                        value={clientNumber}
                                        onChange={(e) => setClientNumber(e.target.value)}
                                        onBlur={() => setTouched(prev => ({ ...prev, clientNumber: true }))}
                                        placeholder="Número de Cliente"
                                    />
                                    {errors.clientNumber && <div className="invalid-feedback">{errors.clientNumber}</div>}
                                </div>
    
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="fiscalYear">Año Fiscal</label>
                                        <input
                                            type="text"
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
                                            type="text"
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
    
                                {/* Alineamos los campos Cliente Conforme e Incidencia en paralelo */}
                                <fieldset className="form-group">
                                    <legend>¿Cliente Conforme?</legend>
                                    <div className="form-row">
                                        <div className="form-group col-md-6">
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
                                        </div>
                                        <div className="form-group col-md-6">
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
                                    </div>
                                </fieldset>
    
                                {visitType === 'delivery' && (
                                    <>
                                        <fieldset className="form-group">
                                            <legend>¿Hay Incidencia?</legend>
                                            <div className="form-row">
                                                <div className="form-group col-md-6">
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
                                                </div>
                                                <div className="form-group col-md-6">
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
                                                                    value={issue || ''}
                                                                    onChange={(e) => handleIssueChange(index, e.target.value)}
                                                                    placeholder="Número de producto"
                                                                    style={{ width: '100%' }}
                                                                />
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
                                            <div className="form-row">
                                                <div className="form-group col-md-6">
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
                                                </div>
                                                <div className="form-group col-md-6">
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
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
    
                                <div className="form-group">
                                    <label htmlFor="completionPhotos">Foto de Finalización</label>
                                    <input
                                        type="file"
                                        id="completionPhotos"
                                        className="form-control-file"
                                        multiple
                                        ref={completionPhotosRef}
                                        onChange={(e) => setCompletionPhotos([...e.target.files])}
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
    
                        <button type="submit" className="btn btn-primary">Enviar</button>
                    </form>
                </div>
            </div>
        </div>
    );
}    
export default DeliveryForm;

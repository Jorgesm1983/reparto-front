// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// // import 'bootstrap/dist/css/bootstrap.min.css'; // Importa Bootstrap
// // import './style.css'; // Asegúrate de importar tu CSS

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
//     const [finalPhoto, setFinalPhoto] = useState(null);
//     const [issuePhotos, setIssuePhotos] = useState([]);

//       const handleIssueChange = (index, value) => {
//         const newIssues = [...issues];
//         newIssues[index] = value;
//         setIssues(newIssues);
//     };

//     const handleFinalPhotoChange = (e) => {
//         setFinalPhoto(e.target.files[0]);
//     };

//     const handleIssuePhotoChange = (e) => {
//         setIssuePhotos([...issuePhotos, ...e.target.files]);
//     };

//     const validateForm = () => {
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

//         if (!finalPhoto) {
//             newErrors.finalPhoto = 'Debe subir una foto de finalización de trabajo.';
//         }

//         if (hasIssue === 'Sí' && issuePhotos.length === 0) {
//             newErrors.issuePhotos = 'Debe subir al menos una foto adicional si hay una incidencia.';
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     useEffect(() => {
//         validateForm();
//     }, [clientConformity, hasIssue, observations, finalPhoto, issuePhotos]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setTouched({
//             fiscalYear: true,
//             deliveryNumber: true,
//             observations: true,
//             finalPhoto: true,
//             issuePhotos: true,
//         });

//         if (!validateForm()) {
//             return;
//         }

//         const formData = new FormData();
//         formData.append('fiscal_year', fiscalYear);
//         formData.append('delivery_number', deliveryNumber);
//         formData.append('client_conformity', clientConformity === 'Sí');
//         formData.append('has_issue', hasIssue === 'Sí');
//         formData.append('observations', observations);
//         formData.append('issues', JSON.stringify(issues.filter(issue => issue !== '')));


//         if (finalPhoto) {
//             formData.append('final_photo', finalPhoto);
//         }

//         if (issuePhotos.length > 0) {
//             issuePhotos.forEach((file, index) => {
//                 formData.append(`issue_photos[${index}]`, file);
//             });
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
//             }, 1500);

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
//         setErrors({});
//         setMessage('');
//         setTouched({});
//         setFinalPhoto(null);
//         setIssuePhotos([]);
//     };

//     const handleBlur = (field) => {
//         setTouched(prev => ({ ...prev, [field]: true }));
//     };

//     return (
//         <div className="container mt-5">
//             <div className="card">
//                 <div className="card-header">
//                     Formulario de Entrega
//                 </div>
//                 <div className="card-body">
//                     {message && (
//                         <div className={`alert ${message.includes('éxito') ? 'alert-success' : 'alert-danger'}`}>
//                             {message}
//                         </div>
//                     )}
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
//                                     onBlur={() => handleBlur('fiscalYear')}
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
//                                     onBlur={() => handleBlur('deliveryNumber')}
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
//                             <div className="form-group">
//                                 <label>Números de Producto con Incidencia</label>
//                                 {issues.map((issue, index) => (
//                                     <div key={index} className="input-group mb-2">
//                                         <input
//                                             type="text"
//                                             className={`form-control ${errors.issues ? 'is-invalid' : ''}`}
//                                             value={issue}
//                                             onChange={(e) => handleIssueChange(index, e.target.value)}
//                                             placeholder="Número de producto"
//                                         />
//                                         <div className="input-group-append">
//                                             <button
//                                                 type="button"
//                                                 className="btn btn-outline-secondary"
//                                                 onClick={() => setIssues([...issues, ''])}
//                                             >
//                                                 +
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 {errors.issues && <div className="invalid-feedback">{errors.issues}</div>}
//                             </div>
//                         )}
//                         <div className="form-group">
//                             <label htmlFor="finalPhoto">Foto de Finalización de Trabajo</label>
//                             <input
//                                 type="file"
//                                 className={`form-control ${errors.finalPhoto ? 'is-invalid' : ''}`}
//                                 id="finalPhoto"
//                                 onChange={handleFinalPhotoChange}
//                             />
//                             {errors.finalPhoto && <div className="invalid-feedback">{errors.finalPhoto}</div>}
//                         </div>
//                         {hasIssue === 'Sí' && (
//                             <div className="form-group">
//                                 <label htmlFor="issuePhotos">Fotos Adicionales de Incidencia</label>
//                                 <input
//                                     type="file"
//                                     className={`form-control ${errors.issuePhotos ? 'is-invalid' : ''}`}
//                                     id="issuePhotos"
//                                     multiple
//                                     onChange={handleIssuePhotoChange}
//                                 />
//                                 {errors.issuePhotos && <div className="invalid-feedback">{errors.issuePhotos}</div>}
//                             </div>
//                         )}
//                         <div className="form-group">
//                             <label htmlFor="observations">Observaciones</label>
//                             <textarea
//                                 className={`form-control ${errors.observations ? 'is-invalid' : ''}`}
//                                 id="observations"
//                                 value={observations}
//                                 onChange={(e) => setObservations(e.target.value)}
//                                 onBlur={() => handleBlur('observations')}
//                                 rows="3"
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



// codigo que funciona correctamente

// 

// import React, { useState, useEffect, useRef } from 'react';
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

//     const validateForm = () => {
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
//     };

//     useEffect(() => {
//         validateForm();
//     }, [clientConformity, hasIssue, observations]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setTouched({
//             fiscalYear: true,
//             deliveryNumber: true,
//             observations: true,
//         });

//         if (!validateForm()) {
//             return;
//         }

//         const formData = new FormData();
//         formData.append('fiscal_year', fiscalYear);
//         formData.append('delivery_number', deliveryNumber);
//         formData.append('client_conformity', clientConformity === 'Sí');
//         formData.append('has_issue', hasIssue === 'Sí');
//         formData.append('observations', observations);

//         formData.append('issues', JSON.stringify(issues.filter(issue => issue !== '')));
//         // issues.filter(issue => issue !== '').forEach((issue, index) => formData.append(`issues[${index}]`, issue));
       
//         completionPhotos.forEach(photo => formData.append('completion_photos', photo));
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
//                                         type="file"
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
//                                 type="file"
//                                 className={`form-control-file ${errors.completionPhotos ? 'is-invalid' : ''}`}
//                                 id="completionPhotos"
//                                 ref={completionPhotosRef}
//                                 multiple
//                                 onChange={(e) => setCompletionPhotos([...e.target.files])}
//                                 required
//                             />
//                             {errors.completionPhotos && <div className="invalid-feedback">{errors.completionPhotos}</div>}
//                         </div>
//                         {(clientConformity === 'No' || hasIssue === 'Sí') && (
//                             <div className="form-group">
//                                 <label htmlFor="observations">Observaciones</label>
//                                 <textarea
//                                     className={`form-control ${errors.observations ? 'is-invalid' : ''}`}
//                                     id="observations"
//                                     value={observations}
//                                     onChange={(e) => setObservations(e.target.value)}
//                                     onBlur={() => setTouched(prev => ({ ...prev, observations: true }))}
//                                 />
//                                 {errors.observations && <div className="invalid-feedback">{errors.observations}</div>}
//                             </div>
//                         )}
//                         <button type="submit" className="btn btn-primary">Enviar</button>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default DeliveryForm;

import React, { useState, useEffect, useRef, useCallback} from 'react';
import axios from 'axios';

function DeliveryForm() {
    const [fiscalYear, setFiscalYear] = useState('');
    const [deliveryNumber, setDeliveryNumber] = useState('');
    const [clientConformity, setClientConformity] = useState('Sí');
    const [hasIssue, setHasIssue] = useState('No');
    const [observations, setObservations] = useState('');
    const [issues, setIssues] = useState(['']);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [touched, setTouched] = useState({});
    const [completionPhotos, setCompletionPhotos] = useState([]);
    const [issuePhotos, setIssuePhotos] = useState([]);

    const completionPhotosRef = useRef(null);
    const issuePhotosRef = useRef(null);

    const handleIssueChange = (index, value) => {
        const newIssues = [...issues];
        newIssues[index] = value;
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

        if ((clientConformity === 'No' || hasIssue === 'Sí') && !observations) {
            newErrors.observations = 'Las observaciones son obligatorias si el cliente no está conforme o hay una incidencia.';
        }

        if (hasIssue === 'Sí' && issues.every(issue => issue === '')) {
            newErrors.issues = 'Debe ingresar al menos un número de producto si hay una incidencia.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [touched, fiscalYear, deliveryNumber, clientConformity, hasIssue, observations, issues]); 

    useEffect(() => {
        validateForm();
    }, [clientConformity, hasIssue, observations, validateForm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({
            fiscalYear: true,
            deliveryNumber: true,
            observations: true,
        });

        if (!validateForm()) {
            console.log('Errores de validación', errors);
            return;
        }

        const formData = new FormData();
        formData.append('fiscal_year', fiscalYear);
        formData.append('delivery_number', deliveryNumber);
        formData.append('client_conformity', clientConformity === 'Sí');
        formData.append('has_issue', hasIssue === 'Sí');
        formData.append('observations', observations);
        issues.forEach(issue => {
            if (issue) {
                formData.append('issues', issue);
            }
        });

        // formData.append('issues', JSON.stringify(issues.filter(issue => issue !== '')));

        completionPhotos.forEach(photo => formData.append('delivery_images', photo));
        if (hasIssue === 'Sí') {
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
        setFiscalYear('');
        setDeliveryNumber('');
        setClientConformity('Sí');
        setHasIssue('No');
        setObservations('');
        setIssues(['']);
        setCompletionPhotos([]);
        setIssuePhotos([]);
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
                        <fieldset className="form-group">
                            <legend>Conformidad del Cliente</legend>
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
                        <fieldset className="form-group">
                            <legend>Incidencia</legend>
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
                                    <label htmlFor="issues">Número(s) de Producto con Incidencia</label>
                                    {issues.map((issue, index) => (
                                        <div key={index} className="input-group mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={issue}
                                                onChange={(e) => handleIssueChange(index, e.target.value)}
                                                placeholder={`Producto ${index + 1}`}
                                            />
                                            <div className="input-group-append">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => setIssues([...issues, ''])}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.issues && <div className="text-danger">{errors.issues}</div>}
                                <div className="form-group">
                                    <label htmlFor="issuePhotos">Fotos de Incidencia (opcional)</label>
                                    <input
                                        type="file" name="issue_photos"
                                        className={`form-control-file ${errors.issuePhotos ? 'is-invalid' : ''}`}
                                        id="issuePhotos"
                                        ref={issuePhotosRef}
                                        multiple
                                        onChange={(e) => setIssuePhotos([...e.target.files])}
                                    />
                                </div>
                            </>
                        )}
                        <div className="form-group">
                            <label htmlFor="completionPhotos">Fotos de Finalización de Trabajo (obligatorio)</label>
                            <input
                                type="file" name="delivery_image"
                                className={`form-control-file ${errors.completionPhotos ? 'is-invalid' : ''}`}
                                id="completionPhotos"
                                ref={completionPhotosRef}
                                multiple
                                onChange={(e) => setCompletionPhotos([...e.target.files])}
                                required
                            />
                            {errors.completionPhotos && <div className="invalid-feedback">{errors.completionPhotos}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="observations">Observaciones</label>
                            <textarea
                                className={`form-control ${errors.observations ? 'is-invalid' : ''}`}
                                id="observations"
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                onBlur={() => setTouched(prev => ({ ...prev, observations: true }))}
                            />
                            {errors.observations && <div className="invalid-feedback">{errors.observations}</div>}
                        </div>
                        <button type="submit" className="btn btn-primary">Enviar</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default DeliveryForm;


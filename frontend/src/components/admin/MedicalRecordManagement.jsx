import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const MedicalRecordManagement = () => {
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    
    // Filter states
    const [patientFilter, setPatientFilter] = useState('');
    const [recordTypeFilter, setRecordTypeFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');
    
    // Form data
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        appointmentId: '',
        recordType: 'GENERAL_CHECKUP',
        diagnosis: '',
        symptoms: '',
        treatment: '',
        notes: '',
        prescription: '',
        testResults: '',
        medicalHistory: '',
        recordDate: new Date().toISOString().split('T')[0],
        nextAppointment: ''
    });
    
    useEffect(() => {
        fetchMedicalRecords();
        fetchPatients();
        fetchDoctors();
        fetchAppointments();
    }, []);
    
    const fetchMedicalRecords = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.get('/api/medical-records');
            
            console.log('Medical records data received:', response.data);
            setMedicalRecords(response.data || []);
            setError('');
        } catch (err) {
            console.error('Error fetching medical records:', err);
            const errorMessage = err.response?.data?.message || 
                                err.message || 
                                'Failed to load medical records. Please try again later.';
            setError(`Error: ${errorMessage}`);
            setMedicalRecords([]); // Set empty array instead of undefined
        } finally {
            setIsLoading(false);
        }
    };
    
    const fetchPatients = async () => {
        try {
            const response = await api.get('/api/patients');
            
            if (response.data) {
                setPatients(response.data);
            }
        } catch (err) {
            console.error('Error fetching patients:', err);
        }
    };
    
    const fetchDoctors = async () => {
        try {
            const response = await api.get('/api/doctors');
            
            if (response.data) {
                setDoctors(response.data);
            }
        } catch (err) {
            console.error('Error fetching doctors:', err);
        }
    };
    
    const fetchAppointments = async () => {
        try {
            const response = await api.get('/api/appointments');
            
            if (response.data) {
                setAppointments(response.data);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const openAddModal = () => {
        setFormData({
            patientId: '',
            doctorId: '',
            appointmentId: '',
            recordType: 'GENERAL_CHECKUP',
            diagnosis: '',
            symptoms: '',
            treatment: '',
            notes: '',
            prescription: '',
            testResults: '',
            medicalHistory: '',
            recordDate: new Date().toISOString().split('T')[0],
            nextAppointment: ''
        });
        setShowAddModal(true);
    };
    
    const openEditModal = (record) => {
        setSelectedRecord(record);
        
        let recordDate = '';
        let nextAppointment = '';
        
        try {
            if (record.recordDate) {
                const recordDateObj = new Date(record.recordDate);
                if (!isNaN(recordDateObj.getTime())) {
                    recordDate = recordDateObj.toISOString().split('T')[0];
                }
            }
            
            if (record.nextAppointment) {
                const nextAppointmentObj = new Date(record.nextAppointment);
                if (!isNaN(nextAppointmentObj.getTime())) {
                    nextAppointment = nextAppointmentObj.toISOString().split('T')[0];
                }
            }
        } catch (error) {
            console.error("Date parsing error:", error);
        }
        
        setFormData({
            patientId: record.patientId || '',
            doctorId: record.doctorId || '',
            appointmentId: record.appointmentId || '',
            recordType: record.recordType || 'GENERAL_CHECKUP',
            diagnosis: record.diagnosis || '',
            symptoms: record.symptoms || '',
            treatment: record.treatment || '',
            notes: record.notes || '',
            prescription: record.prescription || '',
            testResults: record.testResults || '',
            medicalHistory: record.medicalHistory || '',
            recordDate: recordDate,
            nextAppointment: nextAppointment
        });
        setShowEditModal(true);
    };
    
    const openViewModal = (record) => {
        setSelectedRecord(record);
        setShowViewModal(true);
    };
    
    const handleAddRecord = async (e) => {
        e.preventDefault();
        // Format dates to include time component for LocalDateTime
        const formattedData = {
            ...formData,
            recordDate: formData.recordDate ? `${formData.recordDate}T00:00:00` : null,
            nextAppointment: formData.nextAppointment ? `${formData.nextAppointment}T00:00:00` : null
        };
        
        try {
            const response = await api.post('/api/medical-records', formattedData);
            
            if (response.status === 201 || response.status === 200) {
                fetchMedicalRecords();
                setShowAddModal(false);
                alert('Medical record added successfully!');
            }
        } catch (err) {
            console.error('Error adding medical record:', err);
            alert(err.response?.data?.message || 'Failed to add medical record. Please try again.');
        }
    };
    
    const handleUpdateRecord = async (e) => {
        e.preventDefault();
        if (!selectedRecord || !selectedRecord.recordId) {
            console.error('Cannot update record: No record selected or record ID is missing');
            alert('Error: Cannot update medical record - record ID is missing.');
            return;
        }
        
        // Format dates to include time component for LocalDateTime
        const formattedData = {
            ...formData,
            recordDate: formData.recordDate ? `${formData.recordDate}T00:00:00` : null,
            nextAppointment: formData.nextAppointment ? `${formData.nextAppointment}T00:00:00` : null
        };
        
        try {
            console.log(`Updating medical record with ID: ${selectedRecord.recordId}`);
            const response = await api.put(`/api/medical-records/${selectedRecord.recordId}`, formattedData);
            
            if (response.status === 200) {
                fetchMedicalRecords();
                setShowEditModal(false);
                alert('Medical record updated successfully!');
            }
        } catch (err) {
            console.error('Error updating medical record:', err);
            alert(err.response?.data?.message || 'Failed to update medical record. Please try again.');
        }
    };
    
    const handleDeleteRecord = async (recordId) => {
        if (window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
            try {
                const response = await api.delete(`/api/medical-records/${recordId}`);
                
                if (response.status === 204 || response.status === 200) {
                    fetchMedicalRecords();
                    alert('Medical record deleted successfully!');
                }
            } catch (err) {
                console.error('Error deleting medical record:', err);
                alert(err.response?.data?.message || 'Failed to delete medical record. Please try again.');
            }
        }
    };
    
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    };
    
    const getRecordTypeClass = (recordType) => {
        const classes = {
            'GENERAL_CHECKUP': 'status-pending',
            'EMERGENCY': 'status-rejected',
            'FOLLOW_UP': 'status-completed',
            'SURGERY': 'status-rejected',
            'LAB_TEST': 'status-pending',
            'IMAGING': 'status-pending',
            'VACCINATION': 'status-completed',
            'CONSULTATION': 'status-completed'
        };
        return classes[recordType] || 'status-pending';
    };
    
    const getPatientName = (patientId) => {
        const patient = patients.find(p => p.patientId === patientId);
        return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
    };
    
    const getDoctorName = (doctorId) => {
        const doctor = doctors.find(d => d.doctorId === doctorId);
        return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor';
    };
    
    const getFilteredRecords = () => {
        return medicalRecords.filter(record => {
            // Filter by patient
            if (patientFilter && record.patientId !== patientFilter) {
                return false;
            }
            
            // Filter by record type
            if (recordTypeFilter !== 'ALL' && record.recordType !== recordTypeFilter) {
                return false;
            }
            
            // Filter by date
            if (dateFilter && record.recordDate) {
                const recordDate = new Date(record.recordDate).toISOString().split('T')[0];
                if (recordDate !== dateFilter) {
                    return false;
                }
            }
            
            return true;
        });
    };
    
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading medical records...</p>
            </div>
        );
    }
    
    return (
        <div className="management-section">
            <div className="management-header">
                <div className="filters-container">
                    <h3>Filters</h3>
                    <div className="filters">
                        <div className="filter-group">
                            <label>Patient:</label>
                            <select 
                                className="filter-select"
                                value={patientFilter}
                                onChange={(e) => setPatientFilter(e.target.value)}
                            >
                                <option value="">All Patients</option>
                                {patients.map(patient => (
                                    <option key={patient.patientId} value={patient.patientId}>
                                        {patient.firstName} {patient.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Record Type:</label>
                            <select 
                                className="filter-select"
                                value={recordTypeFilter}
                                onChange={(e) => setRecordTypeFilter(e.target.value)}
                            >
                                <option value="ALL">All Types</option>
                                <option value="GENERAL_CHECKUP">General Checkup</option>
                                <option value="EMERGENCY">Emergency</option>
                                <option value="FOLLOW_UP">Follow-up</option>
                                <option value="SURGERY">Surgery</option>
                                <option value="LAB_TEST">Lab Test</option>
                                <option value="IMAGING">Imaging</option>
                                <option value="VACCINATION">Vaccination</option>
                                <option value="CONSULTATION">Consultation</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Date:</label>
                            <input 
                                type="date" 
                                className="filter-date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <button className="add-btn" onClick={openAddModal}>
                    <i className="fas fa-plus"></i>
                    New Medical Record
                </button>
            </div>
            
            {error && (
                <div className="error-container">
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                    <button 
                        className="retry-btn" 
                        onClick={() => {
                            setError('');
                            fetchMedicalRecords();
                        }}
                    >
                        <i className="fas fa-sync"></i> Retry
                    </button>
                </div>
            )}
            
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Record ID</th>
                            <th>Patient</th>
                            <th>Doctor</th>
                            <th>Record Type</th>
                            <th>Diagnosis</th>
                            <th>Record Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getFilteredRecords().length > 0 ? (
                            getFilteredRecords().map(record => (
                                <tr key={record.recordId}>
                                    <td>{record.recordId}</td>
                                    <td>{getPatientName(record.patientId)}</td>
                                    <td>{getDoctorName(record.doctorId)}</td>
                                    <td>
                                        <span className={`status-badge ${getRecordTypeClass(record.recordType)}`}>
                                            {record.recordType?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>{record.diagnosis || 'N/A'}</td>
                                    <td>{formatDate(record.recordDate)}</td>
                                    <td className="actions-cell">
                                        <button 
                                            className="action-btn view" 
                                            onClick={() => openViewModal(record)}
                                            title="View Details"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button 
                                            className="action-btn edit" 
                                            onClick={() => openEditModal(record)}
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="action-btn delete" 
                                            onClick={() => handleDeleteRecord(record.recordId)}
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">No medical records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Add Medical Record Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container large-modal">
                        <div className="modal-header">
                            <h3>Add New Medical Record</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddRecord}>
                                <div className="form-section">
                                    <h4>Basic Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="patientId">Patient*</label>
                                            <select
                                                id="patientId"
                                                name="patientId"
                                                value={formData.patientId}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Patient</option>
                                                {patients.map(patient => (
                                                    <option key={patient.patientId} value={patient.patientId}>
                                                        {patient.firstName} {patient.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="doctorId">Doctor*</label>
                                            <select
                                                id="doctorId"
                                                name="doctorId"
                                                value={formData.doctorId}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Doctor</option>
                                                {doctors.map(doctor => (
                                                    <option key={doctor.doctorId} value={doctor.doctorId}>
                                                        Dr. {doctor.firstName} {doctor.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="appointmentId">Related Appointment</label>
                                            <select
                                                id="appointmentId"
                                                name="appointmentId"
                                                value={formData.appointmentId}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Appointment</option>
                                                {appointments.map(appointment => (
                                                    <option key={appointment.appointmentId} value={appointment.appointmentId}>
                                                        {formatDate(appointment.appointmentDate)} - {appointment.reason?.substring(0, 30)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="recordType">Record Type*</label>
                                            <select
                                                id="recordType"
                                                name="recordType"
                                                value={formData.recordType}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="GENERAL_CHECKUP">General Checkup</option>
                                                <option value="EMERGENCY">Emergency</option>
                                                <option value="FOLLOW_UP">Follow-up</option>
                                                <option value="SURGERY">Surgery</option>
                                                <option value="LAB_TEST">Lab Test</option>
                                                <option value="IMAGING">Imaging</option>
                                                <option value="VACCINATION">Vaccination</option>
                                                <option value="CONSULTATION">Consultation</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="recordDate">Record Date*</label>
                                            <input
                                                type="date"
                                                id="recordDate"
                                                name="recordDate"
                                                value={formData.recordDate}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="nextAppointment">Next Appointment</label>
                                            <input
                                                type="date"
                                                id="nextAppointment"
                                                name="nextAppointment"
                                                value={formData.nextAppointment}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Medical Details</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="diagnosis">Diagnosis</label>
                                            <input
                                                type="text"
                                                id="diagnosis"
                                                name="diagnosis"
                                                value={formData.diagnosis}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group wide">
                                            <label htmlFor="symptoms">Symptoms</label>
                                            <textarea
                                                id="symptoms"
                                                name="symptoms"
                                                value={formData.symptoms}
                                                onChange={handleInputChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div className="form-group wide">
                                            <label htmlFor="treatment">Treatment</label>
                                            <textarea
                                                id="treatment"
                                                name="treatment"
                                                value={formData.treatment}
                                                onChange={handleInputChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div className="form-group wide">
                                            <label htmlFor="prescription">Prescription</label>
                                            <textarea
                                                id="prescription"
                                                name="prescription"
                                                value={formData.prescription}
                                                onChange={handleInputChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div className="form-group wide">
                                            <label htmlFor="testResults">Test Results</label>
                                            <textarea
                                                id="testResults"
                                                name="testResults"
                                                value={formData.testResults}
                                                onChange={handleInputChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div className="form-group wide">
                                            <label htmlFor="notes">Additional Notes</label>
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div className="form-group wide">
                                            <label htmlFor="medicalHistory">Medical History</label>
                                            <textarea
                                                id="medicalHistory"
                                                name="medicalHistory"
                                                value={formData.medicalHistory}
                                                onChange={handleInputChange}
                                                rows="4"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">
                                        <i className="fas fa-save"></i> Add Medical Record
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Medical Record Modal */}
            {showEditModal && selectedRecord && (
                <div className="modal-overlay">
                    <div className="modal-container large-modal">
                        <div className="modal-header">
                            <h3>Edit Medical Record</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleUpdateRecord}>
                                <div className="form-section">
                                    <h4>Basic Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="patientId">Patient*</label>
                                            <select
                                                id="patientId"
                                                name="patientId"
                                                value={formData.patientId}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Patient</option>
                                                {patients.map(patient => (
                                                    <option key={patient.patientId} value={patient.patientId}>
                                                        {patient.firstName} {patient.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="doctorId">Doctor*</label>
                                            <select
                                                id="doctorId"
                                                name="doctorId"
                                                value={formData.doctorId}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Doctor</option>
                                                {doctors.map(doctor => (
                                                    <option key={doctor.doctorId} value={doctor.doctorId}>
                                                        Dr. {doctor.firstName} {doctor.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="appointmentId">Related Appointment</label>
                                            <select
                                                id="appointmentId"
                                                name="appointmentId"
                                                value={formData.appointmentId}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Appointment</option>
                                                {appointments.map(appointment => (
                                                    <option key={appointment.appointmentId} value={appointment.appointmentId}>
                                                        {formatDate(appointment.appointmentDate)} - {appointment.reason?.substring(0, 30)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="recordType">Record Type*</label>
                                            <select
                                                id="recordType"
                                                name="recordType"
                                                value={formData.recordType}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="GENERAL_CHECKUP">General Checkup</option>
                                                <option value="EMERGENCY">Emergency</option>
                                                <option value="FOLLOW_UP">Follow-up</option>
                                                <option value="SURGERY">Surgery</option>
                                                <option value="LAB_TEST">Lab Test</option>
                                                <option value="IMAGING">Imaging</option>
                                                <option value="VACCINATION">Vaccination</option>
                                                <option value="CONSULTATION">Consultation</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="recordDate">Record Date*</label>
                                            <input
                                                type="date"
                                                id="recordDate"
                                                name="recordDate"
                                                value={formData.recordDate}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="nextAppointment">Next Appointment</label>
                                            <input
                                                type="date"
                                                id="nextAppointment"
                                                name="nextAppointment"
                                                value={formData.nextAppointment}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Medical Details</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="diagnosis">Diagnosis</label>
                                            <input
                                                type="text"
                                                id="diagnosis"
                                                name="diagnosis"
                                                value={formData.diagnosis}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group wide">
                                            <label htmlFor="symptoms">Symptoms</label>
                                            <textarea
                                                id="symptoms"
                                                name="symptoms"
                                                value={formData.symptoms}
                                                onChange={handleInputChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div className="form-group wide">
                                            <label htmlFor="treatment">Treatment</label>
                                            <textarea
                                                id="treatment"
                                                name="treatment"
                                                value={formData.treatment}
                                                onChange={handleInputChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div className="form-group wide">
                                            <label htmlFor="prescription">Prescription</label>
                                            <textarea
                                                id="prescription"
                                                name="prescription"
                                                value={formData.prescription}
                                                onChange={handleInputChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div className="form-group wide">
                                            <label htmlFor="testResults">Test Results</label>
                                            <textarea
                                                id="testResults"
                                                name="testResults"
                                                value={formData.testResults}
                                                onChange={handleInputChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div className="form-group wide">
                                            <label htmlFor="notes">Additional Notes</label>
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                        <div className="form-group wide">
                                            <label htmlFor="medicalHistory">Medical History</label>
                                            <textarea
                                                id="medicalHistory"
                                                name="medicalHistory"
                                                value={formData.medicalHistory}
                                                onChange={handleInputChange}
                                                rows="4"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">
                                        <i className="fas fa-save"></i> Update Medical Record
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* View Medical Record Modal */}
            {showViewModal && selectedRecord && (
                <div className="modal-overlay">
                    <div className="modal-container large-modal">
                        <div className="modal-header">
                            <h3>Medical Record Details</h3>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-sections">
                                <div className="detail-section">
                                    <h4><i className="fas fa-info-circle"></i> Basic Information</h4>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Record ID:</span>
                                            <span className="detail-value">{selectedRecord.recordId}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Patient:</span>
                                            <span className="detail-value">{getPatientName(selectedRecord.patientId)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Doctor:</span>
                                            <span className="detail-value">{getDoctorName(selectedRecord.doctorId)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Record Type:</span>
                                            <span className="detail-value">
                                                <span className={`status-badge ${getRecordTypeClass(selectedRecord.recordType)}`}>
                                                    {selectedRecord.recordType?.replace('_', ' ')}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Record Date:</span>
                                            <span className="detail-value">{formatDate(selectedRecord.recordDate)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Next Appointment:</span>
                                            <span className="detail-value">{formatDate(selectedRecord.nextAppointment)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Created At:</span>
                                            <span className="detail-value">{formatDate(selectedRecord.createdAt)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Last Updated:</span>
                                            <span className="detail-value">{formatDate(selectedRecord.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h4><i className="fas fa-stethoscope"></i> Medical Details</h4>
                                    <div className="details-grid">
                                        <div className="detail-item wide">
                                            <span className="detail-label">Diagnosis:</span>
                                            <span className="detail-value">{selectedRecord.diagnosis || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item wide">
                                            <span className="detail-label">Symptoms:</span>
                                            <div className="detail-text">{selectedRecord.symptoms || 'N/A'}</div>
                                        </div>
                                        <div className="detail-item wide">
                                            <span className="detail-label">Treatment:</span>
                                            <div className="detail-text">{selectedRecord.treatment || 'N/A'}</div>
                                        </div>
                                        <div className="detail-item wide">
                                            <span className="detail-label">Prescription:</span>
                                            <div className="detail-text">{selectedRecord.prescription || 'N/A'}</div>
                                        </div>
                                        <div className="detail-item wide">
                                            <span className="detail-label">Test Results:</span>
                                            <div className="detail-text">{selectedRecord.testResults || 'N/A'}</div>
                                        </div>
                                        <div className="detail-item wide">
                                            <span className="detail-label">Additional Notes:</span>
                                            <div className="detail-text">{selectedRecord.notes || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h4><i className="fas fa-history"></i> Medical History</h4>
                                    <div className="detail-text">
                                        {selectedRecord.medicalHistory || 'No medical history information available.'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-actions">
                                <button 
                                    className="cancel-btn"
                                    onClick={() => setShowViewModal(false)}
                                >
                                    Close
                                </button>
                                <button 
                                    className="edit-btn"
                                    onClick={() => {
                                        setShowViewModal(false);
                                        openEditModal(selectedRecord);
                                    }}
                                >
                                    <i className="fas fa-edit"></i> Edit Record
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalRecordManagement; 
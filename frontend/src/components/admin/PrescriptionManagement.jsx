import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const PrescriptionManagement = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');
    
    // Add search terms for patient and doctor filters
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [doctorSearchTerm, setDoctorSearchTerm] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    
    // Selected prescription for operations
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    
    // Form data
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        medicalRecordId: '',
        prescriptionDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        status: 'ACTIVE',
        notes: '',
        isRefillable: false,
        totalRefills: 0,
        medications: [
            {
                medicationName: '',
                dosage: '',
                frequency: '',
                instructions: '',
                quantity: 1,
                duration: ''
            }
        ]
    });

    useEffect(() => {
        fetchPrescriptions();
        fetchPatients();
        fetchDoctors();
        fetchMedicalRecords();
        fetchMedications();
    }, []);

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/prescriptions');
            
            if (response.data) {
                setPrescriptions(response.data);
                setError('');
            }
        } catch (err) {
            console.error('Error fetching prescriptions:', err);
            setError('Failed to load prescriptions. Please try again.');
        } finally {
            setLoading(false);
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

    const fetchMedicalRecords = async () => {
        try {
            const response = await api.get('/api/medical-records');
            
            if (response.data) {
                setMedicalRecords(response.data);
            }
        } catch (err) {
            console.error('Error fetching medical records:', err);
        }
    };

    const fetchMedications = async () => {
        try {
            const response = await api.get('/api/medications');
            
            if (response.data) {
                setMedications(response.data);
            }
        } catch (err) {
            console.error('Error fetching medications:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleMedicationChange = (index, field, value) => {
        const updatedMedications = [...formData.medications];
        updatedMedications[index] = {
            ...updatedMedications[index],
            [field]: value
        };
        
        setFormData({
            ...formData,
            medications: updatedMedications
        });
    };

    const addMedicationField = () => {
        setFormData({
            ...formData,
            medications: [
                ...formData.medications,
                {
                    medicationName: '',
                    dosage: '',
                    frequency: '',
                    instructions: '',
                    quantity: 1,
                    duration: ''
                }
            ]
        });
    };

    const removeMedicationField = (index) => {
        const updatedMedications = [...formData.medications];
        updatedMedications.splice(index, 1);
        
        setFormData({
            ...formData,
            medications: updatedMedications
        });
    };

    const openAddModal = () => {
        setFormData({
            patientId: '',
            doctorId: '',
            medicalRecordId: '',
            prescriptionDate: new Date().toISOString().split('T')[0],
            expiryDate: '',
            status: 'ACTIVE',
            notes: '',
            isRefillable: false,
            totalRefills: 0,
            medications: [
                {
                    medicationName: '',
                    dosage: '',
                    frequency: '',
                    instructions: '',
                    quantity: 1,
                    duration: ''
                }
            ]
        });
        setShowAddModal(true);
    };

    const openEditModal = (prescription) => {
        setSelectedPrescription(prescription);
        
        // Convert prescription to form data format
        const expiryDate = prescription.expiryDate ? new Date(prescription.expiryDate).toISOString().split('T')[0] : '';
        const prescriptionDate = prescription.prescriptionDate ? new Date(prescription.prescriptionDate).toISOString().split('T')[0] : '';
        
        setFormData({
            patientId: prescription.patientId || '',
            doctorId: prescription.doctorId || '',
            medicalRecordId: prescription.medicalRecordId || '',
            prescriptionDate: prescriptionDate,
            expiryDate: expiryDate,
            status: prescription.status || 'ACTIVE',
            notes: prescription.notes || '',
            isRefillable: prescription.isRefillable || false,
            totalRefills: prescription.totalRefills || 0,
            medications: prescription.medications && prescription.medications.length > 0 
                ? prescription.medications.map(med => ({
                    medicationName: med.medicationName || '',
                    dosage: med.dosage || '',
                    frequency: med.frequency || '',
                    instructions: med.instructions || '',
                    quantity: med.quantity || 1,
                    duration: med.duration || ''
                }))
                : [
                    {
                        medicationName: '',
                        dosage: '',
                        frequency: '',
                        instructions: '',
                        quantity: 1,
                        duration: ''
                    }
                ]
        });
        
        setShowEditModal(true);
    };

    const openViewModal = (prescription) => {
        setSelectedPrescription(prescription);
        setShowViewModal(true);
    };

    const handleAddPrescription = async (e) => {
        e.preventDefault();
        try {
            // Ensure expiryDate is set if not provided
            const payload = { ...formData };
            if (!payload.expiryDate) {
                // Default expiry to 30 days from prescription date
                const prescDate = new Date(payload.prescriptionDate);
                prescDate.setDate(prescDate.getDate() + 30);
                payload.expiryDate = prescDate.toISOString().split('T')[0];
            }
            
            const response = await api.post('/api/prescriptions', payload);
            
            if (response.data) {
                setPrescriptions([...prescriptions, response.data]);
                setShowAddModal(false);
                alert('Prescription added successfully!');
            }
        } catch (err) {
            console.error('Error adding prescription:', err);
            alert(err.response?.data?.message || 'Failed to add prescription. Please try again.');
        }
    };

    const handleUpdatePrescription = async (e) => {
        e.preventDefault();
        if (!selectedPrescription) return;
        
        try {
            const response = await api.put(`/api/prescriptions/${selectedPrescription.prescriptionId}`, formData);
            
            if (response.data) {
                const updatedPrescriptions = prescriptions.map(presc => 
                    presc.prescriptionId === selectedPrescription.prescriptionId ? response.data : presc
                );
                setPrescriptions(updatedPrescriptions);
                setShowEditModal(false);
                alert('Prescription updated successfully!');
            }
        } catch (err) {
            console.error('Error updating prescription:', err);
            alert(err.response?.data?.message || 'Failed to update prescription. Please try again.');
        }
    };

    const handleUpdateStatus = async (prescriptionId, newStatus) => {
        try {
            const response = await api.put(`/api/prescriptions/${prescriptionId}/status/${newStatus}`);
            
            if (response.data) {
                const updatedPrescriptions = prescriptions.map(presc => 
                    presc.prescriptionId === prescriptionId ? response.data : presc
                );
                setPrescriptions(updatedPrescriptions);
                alert(`Prescription status updated to ${newStatus}`);
            }
        } catch (err) {
            console.error('Error updating prescription status:', err);
            alert(err.response?.data?.message || 'Failed to update status. Please try again.');
        }
    };

    const handleDeletePrescription = async (prescriptionId) => {
        if (window.confirm('Are you sure you want to delete this prescription?')) {
            try {
                const response = await api.delete(`/api/prescriptions/${prescriptionId}`);
                
                if (response.status === 204 || response.status === 200) {
                    const updatedPrescriptions = prescriptions.filter(presc => presc.prescriptionId !== prescriptionId);
                    setPrescriptions(updatedPrescriptions);
                    alert('Prescription deleted successfully!');
                }
            } catch (err) {
                console.error('Error deleting prescription:', err);
                alert(err.response?.data?.message || 'Failed to delete prescription. Please try again.');
            }
        }
    };

    const handleRefillPrescription = async (prescriptionId) => {
        try {
            const response = await api.post(`/api/prescriptions/${prescriptionId}/refill`);
            
            if (response.data) {
                const updatedPrescriptions = prescriptions.map(presc => 
                    presc.prescriptionId === prescriptionId ? response.data : presc
                );
                setPrescriptions(updatedPrescriptions);
                alert('Prescription refilled successfully!');
            }
        } catch (err) {
            console.error('Error refilling prescription:', err);
            alert(err.response?.data?.message || 'Failed to refill prescription. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'ACTIVE': return 'status-active';
            case 'COMPLETED': return 'status-completed';
            case 'EXPIRED': return 'status-expired';
            case 'CANCELLED': return 'status-cancelled';
            default: return '';
        }
    };

    const getPatientName = (patientId) => {
        const patient = patients.find(p => p.patientId === patientId);
        return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
    };

    const getDoctorName = (doctorId) => {
        const doctor = doctors.find(d => d.doctorId === doctorId);
        return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor';
    };

    const getFilteredPrescriptions = () => {
        return prescriptions.filter(prescription => {
            // Apply status filter
            if (statusFilter !== 'ALL' && prescription.status !== statusFilter) {
                return false;
            }
            
            // Apply date filter
            if (dateFilter && prescription.prescriptionDate) {
                const prescDate = new Date(prescription.prescriptionDate).toISOString().split('T')[0];
                if (prescDate !== dateFilter) {
                    return false;
                }
            }
            
            // Apply search term to patient name, doctor name, or prescription ID
            if (searchTerm) {
                const patientName = getPatientName(prescription.patientId).toLowerCase();
                const doctorName = getDoctorName(prescription.doctorId).toLowerCase();
                const prescriptionId = prescription.prescriptionId?.toString().toLowerCase() || '';
                
                return patientName.includes(searchTerm.toLowerCase()) || 
                       doctorName.includes(searchTerm.toLowerCase()) ||
                       prescriptionId.includes(searchTerm.toLowerCase());
            }
            
            return true;
        });
    };

    // Add this function to filter patients by search term
    const getFilteredPatients = () => {
        if (!patientSearchTerm.trim()) return patients;
        const term = patientSearchTerm.toLowerCase();
        return patients.filter(
            p =>
                (p.patientId && p.patientId.toLowerCase().includes(term)) ||
                (p.firstName && p.firstName.toLowerCase().includes(term)) ||
                (p.lastName && p.lastName.toLowerCase().includes(term))
        );
    };

    // Add this function to filter doctors by search term
    const getFilteredDoctors = () => {
        if (!doctorSearchTerm.trim()) return doctors;
        const term = doctorSearchTerm.toLowerCase();
        return doctors.filter(
            d =>
                (d.doctorId && d.doctorId.toLowerCase().includes(term)) ||
                (d.firstName && d.firstName.toLowerCase().includes(term)) ||
                (d.lastName && d.lastName.toLowerCase().includes(term))
        );
    };

    // If data is still loading, show a loading spinner
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading prescriptions...</p>
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
                            <label>Status:</label>
                            <select 
                                className="filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="EXPIRED">Expired</option>
                                <option value="CANCELLED">Cancelled</option>
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
                        <div className="filter-group">
                            <label>Search:</label>
                            <div className="search-input-container">
                                <input
                                    type="text"
                                    placeholder="Search by ID, patient or doctor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <i className="fas fa-search search-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="add-btn" onClick={openAddModal}>
                    <i className="fas fa-plus"></i>
                    New Prescription
                </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Expiry</th>
                            <th>Status</th>
                            <th>Refillable</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getFilteredPrescriptions().length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-data">No prescriptions found</td>
                            </tr>
                        ) : (
                            getFilteredPrescriptions().map(prescription => (
                                <tr key={prescription.prescriptionId}>
                                    <td>{prescription.prescriptionId}</td>
                                    <td>{getPatientName(prescription.patientId)}</td>
                                    <td>{getDoctorName(prescription.doctorId)}</td>
                                    <td>{formatDate(prescription.prescriptionDate)}</td>
                                    <td>{formatDate(prescription.expiryDate)}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(prescription.status)}`}>
                                            {prescription.status}
                                        </span>
                                    </td>
                                    <td>
                                        {prescription.isRefillable ? (
                                            <span className="refill-info">
                                                Yes ({prescription.refillsRemaining}/{prescription.totalRefills})
                                            </span>
                                        ) : (
                                            <span>No</span>
                                        )}
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className="action-btn view-btn" 
                                            onClick={() => openViewModal(prescription)}
                                            title="View Prescription"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button 
                                            className="action-btn edit-btn" 
                                            onClick={() => openEditModal(prescription)}
                                            title="Edit Prescription"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="action-btn delete-btn" 
                                            onClick={() => handleDeletePrescription(prescription.prescriptionId)}
                                            title="Delete Prescription"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Add Prescription Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container large-modal">
                        <div className="modal-header">
                            <h3>Add New Prescription</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddPrescription}>
                                <div className="form-section">
                                    <div className="form-group">
                                        <label htmlFor="patientSearch">Patient* (ID or Name)</label>
                                        <div className="searchable-dropdown">
                                            <div className="search-input-container">
                                                <input
                                                    type="text"
                                                    id="patientSearch"
                                                    placeholder="Search by patient ID or name..."
                                                    value={patientSearchTerm}
                                                    onChange={(e) => setPatientSearchTerm(e.target.value)}
                                                    className="search-input"
                                                />
                                                <i className="fas fa-search search-icon"></i>
                                            </div>
                                            <select
                                                id="patientId"
                                                name="patientId"
                                                value={formData.patientId}
                                                onChange={handleInputChange}
                                                required
                                                className="dropdown-select"
                                            >
                                                <option value="">Select Patient</option>
                                                {getFilteredPatients().map(patient => (
                                                    <option key={patient.patientId} value={patient.patientId}>
                                                        {patient.patientId} - {patient.firstName} {patient.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="doctorSearch">Doctor* (ID or Name)</label>
                                        <div className="searchable-dropdown">
                                            <div className="search-input-container">
                                                <input
                                                    type="text"
                                                    id="doctorSearch"
                                                    placeholder="Search by doctor ID or name..."
                                                    value={doctorSearchTerm}
                                                    onChange={(e) => setDoctorSearchTerm(e.target.value)}
                                                    className="search-input"
                                                />
                                                <i className="fas fa-search search-icon"></i>
                                            </div>
                                            <select
                                                id="doctorId"
                                                name="doctorId"
                                                value={formData.doctorId}
                                                onChange={handleInputChange}
                                                required
                                                className="dropdown-select"
                                            >
                                                <option value="">Select Doctor</option>
                                                {getFilteredDoctors().map(doctor => (
                                                    <option key={doctor.doctorId} value={doctor.doctorId}>
                                                        {doctor.doctorId} - Dr. {doctor.firstName} {doctor.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* The rest of the modal remains unchanged */}
                                <div className="form-section">
                                    <h4>Prescription Details</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="prescriptionDate">Prescription Date*</label>
                                            <input
                                                type="date"
                                                id="prescriptionDate"
                                                name="prescriptionDate"
                                                value={formData.prescriptionDate}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="expiryDate">Expiry Date</label>
                                            <input
                                                type="date"
                                                id="expiryDate"
                                                name="expiryDate"
                                                value={formData.expiryDate}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="status">Status*</label>
                                            <select
                                                id="status"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="EXPIRED">Expired</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <div className="checkbox-group">
                                                <input
                                                    type="checkbox"
                                                    id="isRefillable"
                                                    name="isRefillable"
                                                    checked={formData.isRefillable}
                                                    onChange={handleInputChange}
                                                />
                                                <label htmlFor="isRefillable">Refillable</label>
                                            </div>
                                            {formData.isRefillable && (
                                                <div className="refill-count">
                                                    <label>Total Refills:</label>
                                                    <input
                                                        type="number"
                                                        id="totalRefills"
                                                        name="totalRefills"
                                                        value={formData.totalRefills}
                                                        onChange={handleInputChange}
                                                        min="1"
                                                        required={formData.isRefillable}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="notes">Notes</label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                    ></textarea>
                                </div>
                                <h4>Medications</h4>
                                {formData.medications.map((medication, index) => (
                                    <div className="medication-item" key={index}>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Medication Name:</label>
                                                <input
                                                    type="text"
                                                    value={medication.medicationName}
                                                    onChange={(e) => handleMedicationChange(index, 'medicationName', e.target.value)}
                                                    required
                                                    list="medications-list"
                                                />
                                                <datalist id="medications-list">
                                                    {medications.map(med => (
                                                        <option key={med.id} value={med.name} />
                                                    ))}
                                                </datalist>
                                            </div>
                                            <div className="form-group">
                                                <label>Dosage:</label>
                                                <input
                                                    type="text"
                                                    value={medication.dosage}
                                                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                                    required
                                                    placeholder="e.g., 10mg"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Frequency:</label>
                                                <input
                                                    type="text"
                                                    value={medication.frequency}
                                                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                                                    required
                                                    placeholder="e.g., Twice daily"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Duration:</label>
                                                <input
                                                    type="text"
                                                    value={medication.duration}
                                                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                                                    placeholder="e.g., 7 days"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Quantity:</label>
                                                <input
                                                    type="number"
                                                    value={medication.quantity}
                                                    onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    min="1"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Instructions:</label>
                                                <input
                                                    type="text"
                                                    value={medication.instructions}
                                                    onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                                                    placeholder="e.g., Take with food"
                                                />
                                            </div>
                                        </div>
                                        {formData.medications.length > 1 && (
                                            <button 
                                                type="button" 
                                                className="remove-medication-btn"
                                                onClick={() => removeMedicationField(index)}
                                            >
                                                <i className="fas fa-trash-alt"></i> Remove Medication
                                            </button>
                                        )}
                                        <hr />
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    className="add-medication-btn"
                                    onClick={addMedicationField}
                                >
                                    <i className="fas fa-plus"></i> Add Another Medication
                                </button>
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">Add Prescription</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Prescription Modal */}
            {showEditModal && selectedPrescription && (
                <div className="modal-overlay">
                    <div className="modal-container large-modal">
                        <div className="modal-header">
                            <h3>Edit Prescription #{selectedPrescription.prescriptionId}</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleUpdatePrescription}>
                                <div className="form-group">
                                    <label>Patient:</label>
                                    <select 
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
                                    <label>Doctor:</label>
                                    <select 
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

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Medical Record:</label>
                                        <select 
                                            name="medicalRecordId" 
                                            value={formData.medicalRecordId} 
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Medical Record (optional)</option>
                                            {medicalRecords
                                                .filter(record => !formData.patientId || record.patientId === formData.patientId)
                                                .map(record => (
                                                    <option key={record.recordId} value={record.recordId}>
                                                        Record #{record.recordId} - {formatDate(record.createdAt)}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Prescription Date:</label>
                                        <input 
                                            type="date" 
                                            name="prescriptionDate"
                                            value={formData.prescriptionDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Expiry Date:</label>
                                        <input 
                                            type="date" 
                                            name="expiryDate"
                                            value={formData.expiryDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Status:</label>
                                        <select 
                                            name="status" 
                                            value={formData.status} 
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="EXPIRED">Expired</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <div className="checkbox-group">
                                            <input 
                                                type="checkbox" 
                                                id="isRefillable" 
                                                name="isRefillable"
                                                checked={formData.isRefillable}
                                                onChange={handleInputChange}
                                            />
                                            <label htmlFor="isRefillable">Refillable</label>
                                        </div>
                                        {formData.isRefillable && (
                                            <div className="refill-count">
                                                <label>Total Refills:</label>
                                                <input 
                                                    type="number" 
                                                    name="totalRefills"
                                                    value={formData.totalRefills}
                                                    onChange={handleInputChange}
                                                    min="1"
                                                    required={formData.isRefillable}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Notes:</label>
                                    <textarea 
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                    ></textarea>
                                </div>

                                <h4>Medications</h4>
                                {formData.medications.map((medication, index) => (
                                    <div className="medication-item" key={index}>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Medication Name:</label>
                                                <input
                                                    type="text"
                                                    value={medication.medicationName}
                                                    onChange={(e) => handleMedicationChange(index, 'medicationName', e.target.value)}
                                                    required
                                                    list="medications-list"
                                                />
                                                <datalist id="medications-list">
                                                    {medications.map(med => (
                                                        <option key={med.id} value={med.name} />
                                                    ))}
                                                </datalist>
                                            </div>
                                            <div className="form-group">
                                                <label>Dosage:</label>
                                                <input
                                                    type="text"
                                                    value={medication.dosage}
                                                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                                    required
                                                    placeholder="e.g., 10mg"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Frequency:</label>
                                                <input
                                                    type="text"
                                                    value={medication.frequency}
                                                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                                                    required
                                                    placeholder="e.g., Twice daily"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Duration:</label>
                                                <input
                                                    type="text"
                                                    value={medication.duration}
                                                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                                                    placeholder="e.g., 7 days"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Quantity:</label>
                                                <input
                                                    type="number"
                                                    value={medication.quantity}
                                                    onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    min="1"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Instructions:</label>
                                                <input
                                                    type="text"
                                                    value={medication.instructions}
                                                    onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                                                    placeholder="e.g., Take with food"
                                                />
                                            </div>
                                        </div>
                                        {formData.medications.length > 1 && (
                                            <button 
                                                type="button" 
                                                className="remove-medication-btn"
                                                onClick={() => removeMedicationField(index)}
                                            >
                                                <i className="fas fa-trash-alt"></i> Remove Medication
                                            </button>
                                        )}
                                        <hr />
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    className="add-medication-btn"
                                    onClick={addMedicationField}
                                >
                                    <i className="fas fa-plus"></i> Add Another Medication
                                </button>

                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">Update Prescription</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Prescription Modal */}
            {showViewModal && selectedPrescription && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Prescription #{selectedPrescription.prescriptionId}</h3>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h4>Prescription Information</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Patient:</label>
                                        <div>{getPatientName(selectedPrescription.patientId)}</div>
                                    </div>
                                    <div className="form-group">
                                        <label>Doctor:</label>
                                        <div>{getDoctorName(selectedPrescription.doctorId)}</div>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Prescription Date:</label>
                                        <div>{formatDate(selectedPrescription.prescriptionDate)}</div>
                                    </div>
                                    <div className="form-group">
                                        <label>Expiry Date:</label>
                                        <div>{formatDate(selectedPrescription.expiryDate)}</div>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Status:</label>
                                        <div>
                                            <span className={`status-badge ${getStatusClass(selectedPrescription.status)}`}>
                                                {selectedPrescription.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Refillable:</label>
                                        <div>
                                            {selectedPrescription.isRefillable ? (
                                                <span className="refill-info">
                                                    Yes ({selectedPrescription.refillsRemaining}/{selectedPrescription.totalRefills})
                                                </span>
                                            ) : (
                                                <span>No</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {selectedPrescription.notes && (
                                    <div className="form-group">
                                        <label>Notes:</label>
                                        <div className="prescription-notes">{selectedPrescription.notes}</div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="detail-section">
                                <h4>Medications</h4>
                                <div className="medications-list">
                                    {selectedPrescription.medications && selectedPrescription.medications.map((med, index) => (
                                        <div className="medication-card" key={index}>
                                            <h5>{med.medicationName}</h5>
                                            <p><strong>Dosage:</strong> {med.dosage}</p>
                                            <p><strong>Frequency:</strong> {med.frequency}</p>
                                            <p><strong>Quantity:</strong> {med.quantity}</p>
                                            {med.duration && <p><strong>Duration:</strong> {med.duration}</p>}
                                            {med.instructions && <p><strong>Instructions:</strong> {med.instructions}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="detail-footer">
                                <button 
                                    type="button" 
                                    className="close-modal-btn"
                                    onClick={() => setShowViewModal(false)}
                                >
                                    Close
                                </button>
                                {selectedPrescription.status === 'ACTIVE' && (
                                    <button 
                                        type="button" 
                                        className="submit-btn"
                                        onClick={() => {
                                            handleUpdateStatus(selectedPrescription.prescriptionId, 'COMPLETED');
                                            setShowViewModal(false);
                                        }}
                                    >
                                        Mark as Completed
                                    </button>
                                )}
                                {selectedPrescription.isRefillable && 
                                 selectedPrescription.refillsRemaining > 0 && 
                                 selectedPrescription.status === 'ACTIVE' && (
                                    <button 
                                        type="button" 
                                        className="submit-btn"
                                        onClick={() => {
                                            handleRefillPrescription(selectedPrescription.prescriptionId);
                                            setShowViewModal(false);
                                        }}
                                    >
                                        Refill Prescription
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrescriptionManagement; 
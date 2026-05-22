import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import './PatientManagement.css';

const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        gender: '',
        dateOfBirth: '',
        bloodGroup: '',
        height: '',
        weight: '',
        allergies: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        insuranceProvider: '',
        insuranceId: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setIsLoading(true);
        setError('');
        try {
            console.log('Fetching patients from API...');
            // Note that the endpoint already includes /api in the controller
            const response = await api.get('/api/patients');
            
            console.log('Patient data received:', response.data);
            setPatients(response.data || []);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching patients:', err);
            const errorMessage = err.response?.data?.message || 
                                err.message || 
                                'Failed to load patients. Please try again later.';
            setError(`Error: ${errorMessage}`);
            setIsLoading(false);
            setPatients([]); // Set empty array instead of undefined
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openAddModal = () => {
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            address: '',
            gender: '',
            dateOfBirth: '',
            bloodGroup: '',
            height: '',
            weight: '',
            allergies: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            insuranceProvider: '',
            insuranceId: ''
        });
        setShowAddModal(true);
    };

    const openEditModal = (patient) => {
        setSelectedPatient(patient);
        let dateOfBirth = '';
        
        try {
            if (patient.dateOfBirth) {
                const dobDate = new Date(patient.dateOfBirth);
                if (!isNaN(dobDate.getTime())) {
                    dateOfBirth = dobDate.toISOString().split('T')[0];
                }
            }
        } catch (error) {
            console.error("Date parsing error:", error);
        }
        
        setFormData({
            email: patient.email || '',
            firstName: patient.firstName || '',
            lastName: patient.lastName || '',
            phoneNumber: patient.phoneNumber || '',
            address: patient.address || '',
            gender: patient.gender || '',
            dateOfBirth: dateOfBirth,
            bloodGroup: patient.bloodGroup || '',
            height: patient.height || '',
            weight: patient.weight || '',
            allergies: patient.allergies || '',
            emergencyContactName: patient.emergencyContactName || '',
            emergencyContactPhone: patient.emergencyContactPhone || '',
            insuranceProvider: patient.insuranceProvider || '',
            insuranceId: patient.insuranceId || ''
        });
        setShowEditModal(true);
    };

    const openViewModal = (patient) => {
        setSelectedPatient(patient);
        setShowViewModal(true);
    };

    const handleAddPatient = async (e) => {
        e.preventDefault();
        try {
            const patientData = {
                ...formData
            };
            
                const response = await api.post('/api/patients', patientData);
            if (response.status === 201 || response.status === 200) {
                setShowAddModal(false);
                fetchPatients();
                alert('Patient added successfully!');
            }
        } catch (err) {
            console.error('Error adding patient:', err);
            alert(err.response?.data?.message || 'Failed to add patient. Please try again.');
        }
    };

    const handleUpdatePatient = async (e) => {
        e.preventDefault();
        if (!selectedPatient) return;
        
        try {
            const patientData = {
                ...formData
            };
            
            const response = await api.put(`/api/patients/${selectedPatient.patientId}`, patientData);
            if (response.status === 200) {
                setShowEditModal(false);
                fetchPatients();
                alert('Patient updated successfully!');
            }
        } catch (err) {
            console.error('Error updating patient:', err);
            alert(err.response?.data?.message || 'Failed to update patient. Please try again.');
        }
    };

    const handleDeletePatient = async (patientId) => {
        if (window.confirm('Are you sure you want to delete this patient?')) {
            try {
                const response = await api.delete(`/api/patients/${patientId}`);
                if (response.status === 200 || response.status === 204) {
                    fetchPatients();
                    alert('Patient deleted successfully!');
                }
            } catch (err) {
                console.error('Error deleting patient:', err);
                alert(err.response?.data?.message || 'Failed to delete patient. Please try again.');
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

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading patients...</p>
            </div>
        );
    }

    return (
        <div className="management-section">
            <div className="management-header">
                <h2>Patient Management</h2>
                <button className="add-btn" onClick={openAddModal}>
                    <i className="fas fa-plus"></i> Add New Patient
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
                            fetchPatients();
                        }}
                    >
                        <i className="fas fa-sync"></i> Retry
                    </button>
                </div>
            )}
            
            <div className="management-content">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Blood Group</th>
                            <th>Gender</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.length > 0 ? (
                            patients.map(patient => (
                            <tr key={patient.patientId}>
                                <td>{patient.patientId}</td>
                                <td>{patient.firstName} {patient.lastName}</td>
                                <td>{patient.email}</td>
                                <td>{patient.phoneNumber || 'N/A'}</td>
                                <td>{patient.bloodGroup || 'N/A'}</td>
                                <td>{patient.gender || 'N/A'}</td>
                                <td className="actions-cell">
                                        <button 
                                            className="action-btn view-btn" 
                                            title="View Details"
                                            onClick={() => openViewModal(patient)}
                                        >
                                        <i className="fas fa-eye"></i>
                                    </button>
                                        <button 
                                            className="action-btn edit-btn" 
                                            title="Edit"
                                            onClick={() => openEditModal(patient)}
                                        >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                        <button 
                                            className="action-btn delete-btn" 
                                            title="Delete"
                                            onClick={() => handleDeletePatient(patient.patientId)}
                                        >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">No patients found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Add Patient Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Add New Patient</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                        <form onSubmit={handleAddPatient}>
                            <div className="form-section">
                                <h4>Account Information</h4>
                                    <div className="form-grid">
                                    <div className="form-group">
                                            <label htmlFor="email">Email*</label>
                                        <input 
                                            type="email" 
                                                id="email"
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleInputChange} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                            <label htmlFor="password">Password*</label>
                                        <input 
                                            type="password" 
                                                id="password"
                                            name="password" 
                                            value={formData.password} 
                                            onChange={handleInputChange} 
                                            required 
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="form-section">
                                <h4>Personal Information</h4>
                                    <div className="form-grid">
                                    <div className="form-group">
                                            <label htmlFor="firstName">First Name*</label>
                                        <input 
                                            type="text" 
                                                id="firstName"
                                            name="firstName" 
                                            value={formData.firstName} 
                                            onChange={handleInputChange} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                            <label htmlFor="lastName">Last Name*</label>
                                        <input 
                                            type="text" 
                                                id="lastName"
                                            name="lastName" 
                                            value={formData.lastName} 
                                            onChange={handleInputChange} 
                                            required 
                                        />
                                    </div>
                                        <div className="form-group">
                                            <label htmlFor="gender">Gender</label>
                                            <select
                                                id="gender"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                </div>
                                    <div className="form-group">
                                            <label htmlFor="dateOfBirth">Date of Birth</label>
                                        <input 
                                                type="date"
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phoneNumber">Phone Number</label>
                                            <input
                                                type="text"
                                                id="phoneNumber"
                                            name="phoneNumber" 
                                            value={formData.phoneNumber} 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                            <label htmlFor="address">Address</label>
                                        <input 
                                                type="text"
                                                id="address"
                                                name="address"
                                                value={formData.address}
                                            onChange={handleInputChange} 
                                        />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Medical Information</h4>
                                    <div className="form-grid">
                                    <div className="form-group">
                                            <label htmlFor="bloodGroup">Blood Group</label>
                                        <select 
                                                id="bloodGroup"
                                                name="bloodGroup"
                                                value={formData.bloodGroup}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Blood Group</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="height">Height (cm)</label>
                                            <input
                                                type="number"
                                                id="height"
                                                name="height"
                                                value={formData.height}
                                                onChange={handleInputChange}
                                                min="0"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="weight">Weight (kg)</label>
                                            <input
                                                type="number"
                                                id="weight"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="allergies">Allergies</label>
                                        <textarea
                                            id="allergies"
                                            name="allergies"
                                            value={formData.allergies}
                                            onChange={handleInputChange}
                                            rows="3"
                                        ></textarea>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Emergency Contact</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="emergencyContactName">Contact Name</label>
                                            <input
                                                type="text"
                                                id="emergencyContactName"
                                                name="emergencyContactName"
                                                value={formData.emergencyContactName}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="emergencyContactPhone">Contact Phone</label>
                                            <input
                                                type="text"
                                                id="emergencyContactPhone"
                                                name="emergencyContactPhone"
                                                value={formData.emergencyContactPhone}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Insurance Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="insuranceProvider">Insurance Provider</label>
                                            <input
                                                type="text"
                                                id="insuranceProvider"
                                                name="insuranceProvider"
                                                value={formData.insuranceProvider}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="insuranceId">Insurance ID</label>
                                            <input
                                                type="text"
                                                id="insuranceId"
                                                name="insuranceId"
                                                value={formData.insuranceId}
                                                onChange={handleInputChange}
                                            />
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
                                        Add Patient
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Patient Modal */}
            {showEditModal && selectedPatient && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Edit Patient</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleUpdatePatient}>
                                <div className="form-section">
                                    <h4>Personal Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="firstName">First Name*</label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="lastName">Last Name*</label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">Email*</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="gender">Gender</label>
                                            <select
                                                id="gender"
                                            name="gender" 
                                            value={formData.gender} 
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                            <label htmlFor="dateOfBirth">Date of Birth</label>
                                            <input
                                                type="date"
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phoneNumber">Phone Number</label>
                                            <input
                                                type="text"
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="address">Address</label>
                                            <input
                                                type="text"
                                                id="address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Medical Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="bloodGroup">Blood Group</label>
                                        <select 
                                                id="bloodGroup"
                                            name="bloodGroup" 
                                            value={formData.bloodGroup} 
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Blood Group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                        <div className="form-group">
                                            <label htmlFor="height">Height (cm)</label>
                                            <input
                                                type="number"
                                                id="height"
                                                name="height"
                                                value={formData.height}
                                                onChange={handleInputChange}
                                                min="0"
                                            />
                                </div>
                                        <div className="form-group">
                                            <label htmlFor="weight">Weight (kg)</label>
                                            <input
                                                type="number"
                                                id="weight"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="allergies">Allergies</label>
                                    <textarea 
                                            id="allergies"
                                            name="allergies"
                                            value={formData.allergies}
                                        onChange={handleInputChange} 
                                            rows="3"
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div className="form-section">
                                    <h4>Emergency Contact</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="emergencyContactName">Contact Name</label>
                                        <input 
                                            type="text" 
                                                id="emergencyContactName"
                                                name="emergencyContactName"
                                                value={formData.emergencyContactName}
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                        <div className="form-group">
                                            <label htmlFor="emergencyContactPhone">Contact Phone</label>
                                        <input 
                                            type="text" 
                                                id="emergencyContactPhone"
                                                name="emergencyContactPhone"
                                                value={formData.emergencyContactPhone}
                                            onChange={handleInputChange} 
                                        />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Insurance Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="insuranceProvider">Insurance Provider</label>
                                        <input 
                                            type="text" 
                                                id="insuranceProvider"
                                                name="insuranceProvider"
                                                value={formData.insuranceProvider}
                                            onChange={handleInputChange} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="insuranceId">Insurance ID</label>
                                            <input
                                                type="text"
                                                id="insuranceId"
                                                name="insuranceId"
                                                value={formData.insuranceId}
                                                onChange={handleInputChange}
                                            />
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
                                        Update Patient
                                </button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* View Patient Modal */}
            {showViewModal && selectedPatient && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Patient Details</h3>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-sections">
                                <div className="profile-header">
                                    <div className="profile-avatar">
                                        <i className="fas fa-user fa-3x"></i>
                                    </div>
                                    <div className="profile-info">
                                        <h3>{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                                        <p>Patient ID: {selectedPatient.patientId}</p>
                                        {selectedPatient.bloodGroup && (
                                            <span className="blood-group-badge">Blood Group: {selectedPatient.bloodGroup}</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h4><i className="fas fa-id-card"></i> Basic Information</h4>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Email:</span>
                                            <span className="detail-value">{selectedPatient.email}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Phone:</span>
                                            <span className="detail-value">{selectedPatient.phoneNumber || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Address:</span>
                                            <span className="detail-value">{selectedPatient.address || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Date of Birth:</span>
                                            <span className="detail-value">{selectedPatient.dateOfBirth ? formatDate(selectedPatient.dateOfBirth) : 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Gender:</span>
                                            <span className="detail-value">{selectedPatient.gender || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h4><i className="fas fa-notes-medical"></i> Medical Information</h4>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Blood Group:</span>
                                            <span className="detail-value">{selectedPatient.bloodGroup || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Height:</span>
                                            <span className="detail-value">{selectedPatient.height ? `${selectedPatient.height} cm` : 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Weight:</span>
                                            <span className="detail-value">{selectedPatient.weight ? `${selectedPatient.weight} kg` : 'N/A'}</span>
                                        </div>
                                        <div className="detail-item wide">
                                            <span className="detail-label">Allergies:</span>
                                            <span className="detail-value">{selectedPatient.allergies || 'None reported'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h4><i className="fas fa-phone-alt"></i> Emergency Contact</h4>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Name:</span>
                                            <span className="detail-value">{selectedPatient.emergencyContactName || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Phone:</span>
                                            <span className="detail-value">{selectedPatient.emergencyContactPhone || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h4><i className="fas fa-file-medical"></i> Insurance Information</h4>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Provider:</span>
                                            <span className="detail-value">{selectedPatient.insuranceProvider || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Policy Number:</span>
                                            <span className="detail-value">{selectedPatient.insuranceId || 'N/A'}</span>
                                        </div>
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
                                        openEditModal(selectedPatient);
                                    }}
                                >
                                    <i className="fas fa-edit"></i> Edit Patient
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientManagement; 
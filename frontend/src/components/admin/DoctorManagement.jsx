import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        gender: '',
        dateOfBirth: '',
        departmentId: '',
        specialization: '',
        licenseNumber: '',
        qualification: '',
        experience: ''
    });

    useEffect(() => {
        fetchDoctors();
        fetchDepartments();
    }, []);

    const fetchDoctors = async () => {
        setIsLoading(true);
        setError('');
        try {
            console.log("Fetching doctors from:", '/api/doctors');
            const response = await api.get('/api/doctors');
            console.log("Doctors response:", response.data);
            setDoctors(response.data);
        } catch (err) {
            console.error('Error fetching doctors:', err);
            const errorMessage = err.response ? 
                `Failed to load doctors. Status: ${err.response.status}, Message: ${err.response.statusText}` : 
                'Failed to load doctors. Server might be unreachable. Please try again later.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/api/departments');
            setDepartments(response.data);
        } catch (err) {
            console.error('Error fetching departments:', err);
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
            departmentId: '',
            specialization: '',
            licenseNumber: '',
            qualification: '',
            experience: ''
        });
        setShowAddModal(true);
    };
    
    const openEditModal = (doctor) => {
        setSelectedDoctor(doctor);
        let dateOfBirth = '';
        
        try {
            if (doctor.dateOfBirth) {
                const dobDate = new Date(doctor.dateOfBirth);
                if (!isNaN(dobDate.getTime())) {
                    dateOfBirth = dobDate.toISOString().split('T')[0];
                }
            }
        } catch (error) {
            console.error("Date parsing error:", error);
        }
        
        setFormData({
            email: doctor.email || '',
            firstName: doctor.firstName || '',
            lastName: doctor.lastName || '',
            phoneNumber: doctor.phoneNumber || '',
            address: doctor.address || '',
            gender: doctor.gender || '',
            dateOfBirth: dateOfBirth,
            departmentId: doctor.departmentId || '',
            specialization: doctor.specialization || '',
            experience: doctor.experience || '',
            qualification: doctor.qualification || '',
            licenseNumber: doctor.licenseNumber || '',
            consultationFee: doctor.consultationFee || ''
        });
        setShowEditModal(true);
    };
    
    const openViewModal = (doctor) => {
        setSelectedDoctor(doctor);
        setShowViewModal(true);
    };

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        try {
            // Convert date string to backend expected ISO_LOCAL_DATE_TIME (no timezone)
            const dateOfBirth = formData.dateOfBirth
                ? new Date(formData.dateOfBirth).toISOString().slice(0, 19) // yyyy-MM-ddTHH:mm:ss
                : null;
            
            const doctorData = {
                ...formData,
                dateOfBirth,
                departmentId: formData.departmentId ? Number(formData.departmentId) : null,
                experienceYears: formData.experience ? Number(formData.experience) : null
            };
            
            console.log("Creating doctor with data:", doctorData);
            const response = await api.post('/api/doctors', doctorData);
            console.log("Doctor creation response:", response.data);
            setShowAddModal(false);
            fetchDoctors(); // Refresh the list
            alert('Doctor added successfully!');
        } catch (err) {
            console.error('Error adding doctor:', err);
            alert(err.response?.data?.message || 'Failed to add doctor. Please try again.');
        }
    };
    
    const handleUpdateDoctor = async (e) => {
        e.preventDefault();
        if (!selectedDoctor) return;
        
        try {
            // Convert date string to backend expected ISO_LOCAL_DATE_TIME (no timezone)
            const dateOfBirth = formData.dateOfBirth
                ? new Date(formData.dateOfBirth).toISOString().slice(0, 19)
                : null;
            
            const doctorData = {
                ...formData,
                dateOfBirth,
                departmentId: formData.departmentId ? Number(formData.departmentId) : null,
                experienceYears: formData.experience ? Number(formData.experience) : null
            };
            
            const response = await api.put(`/api/doctors/${selectedDoctor.doctorId}`, doctorData);
            setShowEditModal(false);
            fetchDoctors(); // Refresh the list
            alert('Doctor updated successfully!');
        } catch (err) {
            console.error('Error updating doctor:', err);
            alert(err.response?.data?.message || 'Failed to update doctor. Please try again.');
        }
    };

    const handleDeleteDoctor = async (doctorId) => {
        if (window.confirm('Are you sure you want to delete this doctor?')) {
            try {
                console.log(`Deleting doctor: ${doctorId}`);
                const response = await api.delete(`/api/doctors/${doctorId}`);
                
                if (response.status === 200 || response.status === 204) {
                    console.log(`Doctor ${doctorId} deleted successfully`);
                    fetchDoctors(); // Refresh the list
                    alert('Doctor deleted successfully!');
                } else {
                    throw new Error('Unexpected response status');
                }
            } catch (err) {
                console.error('Error deleting doctor:', err);
                if (err.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    alert(err.response.data?.error || err.response.data?.message || 'Failed to delete doctor. Please try again.');
                } else if (err.request) {
                    // The request was made but no response was received
                    alert('No response from server. Please check your connection and try again.');
                } else {
                    // Something happened in setting up the request that triggered an Error
                    alert('Error setting up the request. Please try again.');
                }
            }
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (error) {
            return dateString;
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading doctors...</p>
            </div>
        );
    }

    return (
        <div className="management-section">
            <div className="management-header">
                <h2>Doctor Management</h2>
                <button className="add-btn" onClick={openAddModal}>
                    <i className="fas fa-plus"></i> Add New Doctor
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
                            fetchDoctors();
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
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Specialization</th>
                            <th>Department</th>
                            <th>License #</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.length > 0 ? (
                            doctors.map(doctor => (
                                <tr key={doctor.doctorId}>
                                    <td>{doctor.doctorId}</td>
                                    <td>Dr. {doctor.firstName} {doctor.lastName}</td>
                                    <td>{doctor.email}</td>
                                    <td>{doctor.specialization || 'N/A'}</td>
                                    <td>{doctor.department ? doctor.department.name : 'N/A'}</td>
                                    <td>{doctor.licenseNumber || 'N/A'}</td>
                                    <td className="actions-cell">
                                        <button 
                                            className="action-btn view-btn" 
                                            title="View Details"
                                            onClick={() => openViewModal(doctor)}
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button 
                                            className="action-btn edit-btn" 
                                            title="Edit"
                                            onClick={() => openEditModal(doctor)}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="action-btn delete-btn" 
                                            title="Delete"
                                            onClick={() => handleDeleteDoctor(doctor.doctorId)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">No doctors found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Add Doctor Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Add New Doctor</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddDoctor}>
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
                                    <h4>Professional Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="departmentId">Department</label>
                                            <select 
                                                id="departmentId"
                                                name="departmentId" 
                                                value={formData.departmentId} 
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map(dept => (
                                                    <option key={dept.departmentId} value={dept.departmentId}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="specialization">Specialization*</label>
                                            <input 
                                                type="text" 
                                                id="specialization"
                                                name="specialization" 
                                                value={formData.specialization} 
                                                onChange={handleInputChange} 
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="licenseNumber">License Number*</label>
                                            <input 
                                                type="text" 
                                                id="licenseNumber"
                                                name="licenseNumber" 
                                                value={formData.licenseNumber} 
                                                onChange={handleInputChange} 
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="qualification">Qualification*</label>
                                            <input 
                                                type="text" 
                                                id="qualification"
                                                name="qualification" 
                                                value={formData.qualification} 
                                                onChange={handleInputChange} 
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="experience">Years of Experience</label>
                                            <input 
                                                type="number" 
                                                id="experience"
                                                name="experience" 
                                                value={formData.experience} 
                                                onChange={handleInputChange} 
                                                min="0"
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
                                        <i className="fas fa-save"></i> Add Doctor
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Doctor Modal */}
            {showEditModal && selectedDoctor && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Edit Doctor</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleUpdateDoctor}>
                                <div className="form-section">
                                    <h4>Account Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="email">Email*</label>
                                            <input 
                                                type="email" 
                                                id="edit-email"
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleInputChange} 
                                                required 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password">New Password (leave blank to keep current)</label>
                                            <input 
                                                type="password" 
                                                id="edit-password"
                                                name="password" 
                                                value={formData.password} 
                                                onChange={handleInputChange}
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
                                                id="edit-firstName"
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
                                                id="edit-lastName"
                                                name="lastName" 
                                                value={formData.lastName} 
                                                onChange={handleInputChange} 
                                                required 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="gender">Gender</label>
                                            <select
                                                id="edit-gender"
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
                                                id="edit-dateOfBirth"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phoneNumber">Phone Number</label>
                                            <input
                                                type="text"
                                                id="edit-phoneNumber"
                                                name="phoneNumber" 
                                                value={formData.phoneNumber} 
                                                onChange={handleInputChange} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="address">Address</label>
                                            <input 
                                                type="text"
                                                id="edit-address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange} 
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Professional Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="departmentId">Department</label>
                                            <select 
                                                id="edit-departmentId"
                                                name="departmentId" 
                                                value={formData.departmentId} 
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map(dept => (
                                                    <option key={dept.departmentId} value={dept.departmentId}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="specialization">Specialization*</label>
                                            <input 
                                                type="text" 
                                                id="edit-specialization"
                                                name="specialization" 
                                                value={formData.specialization} 
                                                onChange={handleInputChange} 
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="licenseNumber">License Number*</label>
                                            <input 
                                                type="text" 
                                                id="edit-licenseNumber"
                                                name="licenseNumber" 
                                                value={formData.licenseNumber} 
                                                onChange={handleInputChange} 
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="qualification">Qualification*</label>
                                            <input 
                                                type="text" 
                                                id="edit-qualification"
                                                name="qualification" 
                                                value={formData.qualification} 
                                                onChange={handleInputChange} 
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="experience">Years of Experience</label>
                                            <input 
                                                type="number" 
                                                id="edit-experience"
                                                name="experience" 
                                                value={formData.experience} 
                                                onChange={handleInputChange} 
                                                min="0"
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
                                        <i className="fas fa-save"></i> Update Doctor
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* View Doctor Modal */}
            {showViewModal && selectedDoctor && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Doctor Details</h3>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-sections">
                                <div className="profile-header">
                                    <div className="profile-avatar">
                                        <i className="fas fa-user-md fa-3x"></i>
                                    </div>
                                    <div className="profile-info">
                                        <h3>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h3>
                                        <p className="specialization">{selectedDoctor.specialization || 'No Specialization'}</p>
                                        {selectedDoctor.department && (
                                            <span className="department-badge">{selectedDoctor.department.name}</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h4><i className="fas fa-id-card"></i> Basic Information</h4>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Doctor ID:</span>
                                            <span className="detail-value">{selectedDoctor.doctorId}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Email:</span>
                                            <span className="detail-value">{selectedDoctor.email}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Phone:</span>
                                            <span className="detail-value">{selectedDoctor.phoneNumber || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Address:</span>
                                            <span className="detail-value">{selectedDoctor.address || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Date of Birth:</span>
                                            <span className="detail-value">{selectedDoctor.dateOfBirth ? formatDate(selectedDoctor.dateOfBirth) : 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Gender:</span>
                                            <span className="detail-value">{selectedDoctor.gender || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h4><i className="fas fa-stethoscope"></i> Professional Information</h4>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Department:</span>
                                            <span className="detail-value">{selectedDoctor.department ? selectedDoctor.department.name : 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Specialization:</span>
                                            <span className="detail-value">{selectedDoctor.specialization || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">License Number:</span>
                                            <span className="detail-value">{selectedDoctor.licenseNumber || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Qualification:</span>
                                            <span className="detail-value">{selectedDoctor.qualification || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Years of Experience:</span>
                                            <span className="detail-value">{selectedDoctor.experienceYears || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Consultation Fee:</span>
                                            <span className="detail-value">{selectedDoctor.consultationFee ? `$${selectedDoctor.consultationFee}` : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {selectedDoctor.bio && (
                                    <div className="detail-section">
                                        <h4><i className="fas fa-book-open"></i> Biography</h4>
                                        <p className="bio-text">{selectedDoctor.bio}</p>
                                    </div>
                                )}
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
                                        openEditModal(selectedDoctor);
                                    }}
                                >
                                    <i className="fas fa-edit"></i> Edit Doctor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorManagement; 
import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        headDoctorId: ''
    });
    const [doctors, setDoctors] = useState([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

    useEffect(() => {
        fetchDepartments();
        fetchDoctors();
    }, []);

    // Fetch all departments
    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/departments');
            if (response.data) {
                setDepartments(response.data);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError('Failed to load departments. Please try again later.');
            setLoading(false);
        }
    };

    // Fetch doctors for head doctor selection
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

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Open add department modal
    const openAddModal = () => {
        setFormData({
            name: '',
            description: '',
            headDoctorId: ''
        });
        setShowAddModal(true);
    };

    // Open edit department modal
    const openEditModal = (department) => {
        setFormData({
            name: department.name,
            description: department.description,
            headDoctorId: department.headDoctorId || ''
        });
        setSelectedDepartmentId(department.id);
        setShowEditModal(true);
    };

    // Handle add department form submission
    const handleAddDepartment = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/departments', formData);
            
            if (response.status === 201 || response.status === 200) {
                fetchDepartments();
                setShowAddModal(false);
                alert('Department added successfully!');
            }
        } catch (err) {
            console.error('Error adding department:', err);
            alert(err.response?.data || 'Failed to add department. Please try again.');
        }
    };

    // Handle edit department form submission
    const handleUpdateDepartment = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(
                `/api/departments/${selectedDepartmentId}`,
                formData
            );
            if (response.status === 200) {
                fetchDepartments();
                setShowEditModal(false);
                alert('Department updated successfully!');
            }
        } catch (err) {
            console.error('Error updating department:', err);
            alert(err.response?.data || 'Failed to update department. Please try again.');
        }
    };

    // Handle delete department
    const handleDeleteDepartment = async (departmentId) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                const response = await api.delete(`/api/departments/${departmentId}`);
                
                if (response.status === 200 || response.status === 204) {
                    fetchDepartments();
                    alert('Department deleted successfully!');
                }
            } catch (err) {
                console.error('Error deleting department:', err);
                // Show backend error message if available
                const backendMsg = err.response?.data || 'Failed to delete department. Please try again.';
                alert(typeof backendMsg === 'string' ? backendMsg : JSON.stringify(backendMsg));
            }
        }
    };

    // Get doctor name by ID
    const getDoctorName = (doctorId) => {
        if (!doctorId) return 'None';
        const doctor = doctors.find(doc => doc.doctorId === doctorId);
        return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading departments...</p>
            </div>
        );
    }

    return (
        <div className="management-section">
            <div className="management-header">
                <h2>Department Management</h2>
                <button className="add-btn" onClick={openAddModal}>
                    <i className="fas fa-plus"></i> Add New Department
                </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="management-content">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Head Doctor</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.length > 0 ? (
                            departments.map(department => (
                                <tr key={department.id}>
                                    <td>{department.id}</td>
                                    <td>{department.name}</td>
                                    <td>{department.description}</td>
                                    <td>{getDoctorName(department.headDoctorId)}</td>
                                    <td className="actions-cell">
                                        <button 
                                            className="action-btn edit-btn" 
                                            title="Edit"
                                            onClick={() => openEditModal(department)}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="action-btn delete-btn" 
                                            title="Delete"
                                            onClick={() => handleDeleteDepartment(department.id)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-data">No departments found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Add Department Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Add New Department</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddDepartment}>
                                <div className="form-section">
                                    <h4>Department Information</h4>
                                    <div className="form-group">
                                        <label htmlFor="name">Department Name*</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="description">Description*</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                            rows="4"
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="headDoctorId">Head Doctor</label>
                                            <select 
                                            id="headDoctorId"
                                            name="headDoctorId"
                                            value={formData.headDoctorId}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">None</option>
                                            {doctors.map(doctor => (
                                                <option key={doctor.doctorId} value={doctor.doctorId}>
                                                    Dr. {doctor.firstName} {doctor.lastName}
                                                </option>
                                            ))}
                                        </select>
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
                                        Add Department
                                </button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Department Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Edit Department</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleUpdateDepartment}>
                                <div className="form-section">
                                    <h4>Department Information</h4>
                                    <div className="form-group">
                                        <label htmlFor="name">Department Name*</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="description">Description*</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                            rows="4"
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="headDoctorId">Head Doctor</label>
                                        <select
                                            id="headDoctorId"
                                            name="headDoctorId"
                                            value={formData.headDoctorId}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">None</option>
                                            {doctors.map(doctor => (
                                                <option key={doctor.doctorId} value={doctor.doctorId}>
                                                    Dr. {doctor.firstName} {doctor.lastName}
                                                </option>
                                            ))}
                                        </select>
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
                                        Update Department
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentManagement; 
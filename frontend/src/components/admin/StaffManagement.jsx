import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        departmentId: '',
        position: '',
        hireDate: new Date().toISOString().split('T')[0],
        isAdmin: false
    });

    useEffect(() => {
        fetchStaff();
        fetchDepartments();
    }, []);

    const fetchStaff = async () => {
        setIsLoading(true);
        setError('');
        try {
            console.log('Fetching staff from API...');
            const response = await api.get('/api/staff/profiles');
            
            console.log('Staff data received:', response.data);
            setStaff(response.data || []);
                setError('');
        } catch (err) {
            console.error('Error fetching staff:', err);
            const errorMessage = err.response?.data?.message || 
                                err.message || 
                                'Failed to load staff data. Please try again later.';
            setError(`Error: ${errorMessage}`);
            setStaff([]); // Set empty array instead of undefined
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            console.log('Fetching departments from API...');
            const response = await api.get('/api/departments');
            
            console.log('Departments data received:', response.data);
            setDepartments(response.data || []);
        } catch (err) {
            console.error('Error fetching departments:', err);
            // We don't set a general error here as it's not critical for the page to function
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleOpenAddModal = () => {
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            address: '',
            dateOfBirth: '',
            gender: '',
            departmentId: '',
            position: '',
            hireDate: new Date().toISOString().split('T')[0],
            isAdmin: false
        });
        setShowAddModal(true);
    };

    const handleOpenEditModal = (staffMember) => {
        setSelectedStaff(staffMember);
        let dateOfBirth = '';
        let hireDate = '';
        
        try {
            if (staffMember.dateOfBirth) {
                const dobDate = new Date(staffMember.dateOfBirth);
                if (!isNaN(dobDate.getTime())) {
                    dateOfBirth = dobDate.toISOString().split('T')[0];
                }
            }
            
            if (staffMember.hireDate) {
                const hireDateObj = new Date(staffMember.hireDate);
                if (!isNaN(hireDateObj.getTime())) {
                    hireDate = hireDateObj.toISOString().split('T')[0];
                }
            }
        } catch (error) {
            console.error("Date parsing error:", error);
        }

        setFormData({
            email: staffMember.email || '',
            firstName: staffMember.firstName || '',
            lastName: staffMember.lastName || '',
            phoneNumber: staffMember.phoneNumber || '',
            address: staffMember.address || '',
            position: staffMember.position || '',
            departmentId: staffMember.departmentId || '',
            hireDate: hireDate,
            gender: staffMember.gender || '',
            dateOfBirth: dateOfBirth,
            admin: staffMember.admin || false
        });
        setShowEditModal(true);
    };

    const handleViewStaff = (staffMember) => {
        setSelectedStaff(staffMember);
        setShowViewModal(true);
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        
        try {
            console.log('Adding new staff member with data:', formData);
            const response = await api.post('/api/staff/create', formData);
            
            if (response.status === 201 || response.status === 200) {
                // Refresh the staff list
                fetchStaff();
                setShowAddModal(false);
                
                // Success notification
                alert(`Staff member added successfully! Staff ID: ${response.data.roleId}`);
            }
        } catch (err) {
            console.error('Error adding staff:', err);
            alert(err.response?.data?.message || 'Failed to add staff member. Please try again.');
        }
    };

    const handleUpdateStaff = async (e) => {
        e.preventDefault();
        if (!selectedStaff) return;
        
        try {
            console.log('Updating staff member with data:', formData);
            const response = await api.put(`/api/staff/${selectedStaff.staffId}`, formData);
            
            if (response.status === 200) {
                setShowEditModal(false);
                fetchStaff();
                alert('Staff member updated successfully!');
            }
        } catch (err) {
            console.error('Error updating staff:', err);
            alert(err.response?.data?.message || 'Failed to update staff member. Please try again.');
        }
    };

    const handleDeleteStaff = async (staffId) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                console.log(`Deleting staff member with ID: ${staffId}`);
                const response = await api.delete(`/api/staff/${staffId}`);
                
                if (response.status === 200 || response.status === 204) {
                    // Refresh the staff list
                    fetchStaff();
                    
                    // Success notification
                    alert('Staff member deleted successfully!');
                }
            } catch (err) {
                console.error('Error deleting staff:', err);
                alert(err.response?.data?.message || 'Failed to delete staff member. Please try again.');
            }
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    };

    const getAdminStatusClass = (isAdmin) => {
        return isAdmin ? 'status-completed' : 'status-pending';
    };

    const getFilteredStaff = () => {
        return staff.filter(staffMember => {
            // Filter by status (admin/staff)
            if (statusFilter !== 'ALL') {
                const isAdmin = staffMember.admin;
                if (statusFilter === 'ADMIN' && !isAdmin) return false;
                if (statusFilter === 'STAFF' && isAdmin) return false;
            }
            
            // Filter by hire date if date filter is set
            if (dateFilter && staffMember.hireDate) {
                const hireDate = new Date(staffMember.hireDate).toISOString().split('T')[0];
                if (hireDate !== dateFilter) {
                    return false;
                }
            }
            
            return true;
        });
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading staff data...</p>
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
                                <option value="ALL">All Staff</option>
                                <option value="ADMIN">Admin</option>
                                <option value="STAFF">Staff</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Hire Date:</label>
                            <input 
                                type="date" 
                                className="filter-date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <button className="add-btn" onClick={handleOpenAddModal}>
                    <i className="fas fa-plus"></i>
                    New Staff
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
                            fetchStaff();
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
                            <th>Staff ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Position</th>
                            <th>Department</th>
                            <th>Hire Date</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getFilteredStaff().length > 0 ? (
                            getFilteredStaff().map(staffMember => (
                                <tr key={staffMember.staffId}>
                                    <td>{staffMember.staffId}</td>
                                    <td>{`${staffMember.firstName} ${staffMember.lastName}`}</td>
                                    <td>{staffMember.email}</td>
                                    <td>{staffMember.position || 'N/A'}</td>
                                    <td>{staffMember.departmentName || 'N/A'}</td>
                                    <td>{formatDate(staffMember.hireDate)}</td>
                                    <td>
                                        <span className={`status-badge ${getAdminStatusClass(staffMember.admin)}`}>
                                            {staffMember.admin ? 'Admin' : 'Staff'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className="action-btn view" 
                                            onClick={() => handleViewStaff(staffMember)}
                                            title="View Details"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button 
                                            className="action-btn edit" 
                                            onClick={() => handleOpenEditModal(staffMember)}
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="action-btn delete" 
                                            onClick={() => handleDeleteStaff(staffMember.staffId)}
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="no-data">No staff members found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Add New Staff Member</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddStaff}>
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
                                        <div className="form-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="isAdmin"
                                                    checked={formData.isAdmin}
                                                    onChange={handleInputChange}
                                                />
                                                Is Admin
                                            </label>
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
                                            <label htmlFor="phoneNumber">Phone</label>
                                            <input
                                                type="tel"
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
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Professional Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="departmentId">Department*</label>
                                            <select
                                                id="departmentId"
                                                name="departmentId"
                                                value={formData.departmentId}
                                                onChange={handleInputChange}
                                                required
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
                                            <label htmlFor="position">Position*</label>
                                            <input
                                                type="text"
                                                id="position"
                                                name="position"
                                                value={formData.position}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="hireDate">Hire Date*</label>
                                            <input
                                                type="date"
                                                id="hireDate"
                                                name="hireDate"
                                                value={formData.hireDate}
                                                onChange={handleInputChange}
                                                required
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
                                    <button type="submit" className="submit-btn">Add Staff</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Staff Modal */}
            {showEditModal && selectedStaff && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Edit Staff Member</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleUpdateStaff}>
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
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="isAdmin"
                                                    checked={formData.isAdmin}
                                                    onChange={handleInputChange}
                                                />
                                                Is Admin
                                            </label>
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
                                            <label htmlFor="phoneNumber">Phone</label>
                                            <input
                                                type="tel"
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
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Professional Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="departmentId">Department*</label>
                                            <select
                                                id="departmentId"
                                                name="departmentId"
                                                value={formData.departmentId}
                                                onChange={handleInputChange}
                                                required
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
                                            <label htmlFor="position">Position*</label>
                                            <input
                                                type="text"
                                                id="position"
                                                name="position"
                                                value={formData.position}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="hireDate">Hire Date*</label>
                                            <input
                                                type="date"
                                                id="hireDate"
                                                name="hireDate"
                                                value={formData.hireDate}
                                                onChange={handleInputChange}
                                                required
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
                                    <button type="submit" className="submit-btn">Update Staff</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* View Staff Modal */}
            {showViewModal && selectedStaff && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Staff Details</h3>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="staff-profile">
                                <div className="profile-header">
                                    <div className="profile-avatar">
                                        <i className="fas fa-user-circle"></i>
                                    </div>
                                    <div className="profile-title">
                                        <h3>{`${selectedStaff.firstName} ${selectedStaff.lastName}`}</h3>
                                        <p>{selectedStaff.position}</p>
                                        <span className={`role-badge ${selectedStaff.admin ? 'admin' : 'staff'}`}>
                                            {selectedStaff.admin ? 'Admin' : 'Staff'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="staff-details">
                                    <div className="details-section">
                                        <h4>Basic Information</h4>
                                        <div className="details-grid">
                                            <div className="detail-item">
                                                <span className="detail-label">Staff ID:</span>
                                                <span className="detail-value">{selectedStaff.staffId}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Email:</span>
                                                <span className="detail-value">{selectedStaff.email}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Phone:</span>
                                                <span className="detail-value">{selectedStaff.phoneNumber || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Address:</span>
                                                <span className="detail-value">{selectedStaff.address || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Date of Birth:</span>
                                                <span className="detail-value">{selectedStaff.dateOfBirth ? formatDate(selectedStaff.dateOfBirth) : 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Gender:</span>
                                                <span className="detail-value">{selectedStaff.gender || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="details-section">
                                        <h4>Professional Information</h4>
                                        <div className="details-grid">
                                            <div className="detail-item">
                                                <span className="detail-label">Department:</span>
                                                <span className="detail-value">{selectedStaff.departmentName || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Position:</span>
                                                <span className="detail-value">{selectedStaff.position}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Hire Date:</span>
                                                <span className="detail-value">{selectedStaff.hireDate ? formatDate(selectedStaff.hireDate) : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="modal-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setShowViewModal(false)}
                                    >
                                        Close
                                    </button>
                                    <button 
                                        type="button" 
                                        className="edit-btn"
                                        onClick={() => {
                                            setShowViewModal(false);
                                            handleOpenEditModal(selectedStaff);
                                        }}
                                    >
                                        Edit Staff
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement; 
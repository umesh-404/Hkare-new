import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    specialization: '',
    departmentId: '',
    licenseNumber: '',
    experienceYears: '',
    qualification: '',
    availability: ''
  });

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/doctors');
      setDoctors(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again later.');
    } finally {
      setLoading(false);
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const cleanDoctorFormData = (data) => ({
    ...data,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim(),
    password: data.password.trim(),
    phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : '',
    specialization: data.specialization ? data.specialization.trim() : '',
    departmentId: data.departmentId ? Number(data.departmentId) : '',
    licenseNumber: data.licenseNumber.trim(),
    experienceYears: data.experienceYears ? Number(data.experienceYears) : 0,
    qualification: data.qualification ? data.qualification.trim() : '',
    availability: data.availability ? data.availability.trim() : ''
  });

  const validateDoctorForm = (data) => {
    if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim() || !data.licenseNumber.trim() || !data.password.trim()) {
      return 'First name, last name, email, password, and license number are required.';
    }
    return '';
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    const validationError = validateDoctorForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    const payload = cleanDoctorFormData(formData);
    try {
      await api.post('/api/doctors', payload);
      setShowAddModal(false);
      fetchDoctors();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        specialization: '',
        departmentId: '',
        licenseNumber: '',
        experienceYears: '',
        qualification: '',
        availability: ''
      });
      setError('');
    } catch (err) {
      console.error('Error adding doctor:', err);
      setError(err.response?.data?.message || 'Failed to add doctor. Please try again.');
    }
  };

  const handleEditDoctor = async (e) => {
    e.preventDefault();
    const validationError = validateDoctorForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    const payload = cleanDoctorFormData(formData);
    try {
      await api.put(`/api/doctors/${currentDoctor.doctorId}`, payload);
      setShowEditModal(false);
      fetchDoctors();
      setError('');
    } catch (err) {
      console.error('Error updating doctor:', err);
      setError(err.response?.data?.message || 'Failed to update doctor. Please try again.');
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await api.delete(`/api/doctors/${doctorId}`);
        fetchDoctors();
      } catch (err) {
        console.error('Error deleting doctor:', err);
        setError('Failed to delete doctor. Please try again.');
      }
    }
  };

  const getFilteredDoctors = () => {
    return doctors.filter(doctor => {
      // Filter by department
      if (departmentFilter !== 'ALL' && doctor.departmentId !== departmentFilter) {
        return false;
      }
      
      // Filter by specialty
      if (specialtyFilter !== 'ALL' && doctor.specialization !== specialtyFilter) {
        return false;
      }
      
      // Search term filter
      if (searchTerm) {
        const searchString = `${doctor.firstName} ${doctor.lastName} ${doctor.specialization}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      }
      
      return true;
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading doctors...</p>
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
              <label>Department:</label>
              <select 
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Specialty:</label>
              <select 
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Specialties</option>
                <option value="CARDIOLOGY">Cardiology</option>
                <option value="NEUROLOGY">Neurology</option>
                <option value="ORTHOPEDICS">Orthopedics</option>
                <option value="PEDIATRICS">Pediatrics</option>
                <option value="GENERAL">General Medicine</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Search:</label>
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <i className="fas fa-search search-icon"></i>
              </div>
            </div>
          </div>
        </div>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus"></i> Add Doctor
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Specialization</th>
              <th>Department</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredDoctors().length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No doctors found</td>
              </tr>
            ) : (
              getFilteredDoctors().map(doctor => (
                <tr key={doctor.doctorId}>
                  <td>{doctor.doctorId}</td>
                  <td>Dr. {doctor.firstName} {doctor.lastName}</td>
                  <td>{doctor.specialization || 'General'}</td>
                  <td>
                    {departments.find(d => d.departmentId === doctor.departmentId)?.name || 'Not Assigned'}
                  </td>
                  <td>{doctor.phoneNumber || doctor.email}</td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view" 
                      onClick={() => {
                        setCurrentDoctor(doctor);
                        setShowEditModal(true);
                        setFormData({
                          firstName: doctor.firstName,
                          lastName: doctor.lastName,
                          email: doctor.email,
                          password: '',
                          phoneNumber: doctor.phoneNumber,
                          specialization: doctor.specialization,
                          departmentId: doctor.departmentId,
                          licenseNumber: doctor.licenseNumber,
                          experienceYears: doctor.experience,
                          qualification: doctor.qualifications,
                          availability: doctor.availability
                        });
                      }}
                      title="Edit Doctor"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDeleteDoctor(doctor.doctorId)}
                      title="Delete Doctor"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
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
                  <h4>Personal Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name*</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name*</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email*</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password*</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Professional Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Specialization</label>
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Specialization</option>
                        <option value="CARDIOLOGY">Cardiology</option>
                        <option value="NEUROLOGY">Neurology</option>
                        <option value="ORTHOPEDICS">Orthopedics</option>
                        <option value="PEDIATRICS">Pediatrics</option>
                        <option value="GENERAL">General Medicine</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <select
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
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>License Number*</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Years of Experience</label>
                      <input
                        type="number"
                        name="experienceYears"
                        value={formData.experienceYears}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Qualification</label>
                    <textarea
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Enter doctor's qualification..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Availability</label>
                    <textarea
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Enter doctor's availability schedule..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <i className="fas fa-save"></i> Add Doctor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && currentDoctor && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit Doctor: Dr. {currentDoctor.firstName} {currentDoctor.lastName}</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditDoctor}>
                <div className="form-section">
                  <h4>Personal Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name*</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name*</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email*</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password*</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Professional Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Specialization</label>
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Specialization</option>
                        <option value="CARDIOLOGY">Cardiology</option>
                        <option value="NEUROLOGY">Neurology</option>
                        <option value="ORTHOPEDICS">Orthopedics</option>
                        <option value="PEDIATRICS">Pediatrics</option>
                        <option value="GENERAL">General Medicine</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <select
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
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>License Number*</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Years of Experience</label>
                      <input
                        type="number"
                        name="experienceYears"
                        value={formData.experienceYears}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Qualification</label>
                    <textarea
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Enter doctor's qualification..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Availability</label>
                    <textarea
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Enter doctor's availability schedule..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <i className="fas fa-save"></i> Update Doctor
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

export default DoctorManagement; 
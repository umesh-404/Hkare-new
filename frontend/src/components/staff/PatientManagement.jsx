import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [ageFilter, setAgeFilter] = useState('ALL');

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
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
    setLoading(true);
    try {
      const response = await api.get('/api/patients');
      setPatients(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const cleanPatientFormData = (data) => {
    const cleaned = {};
    if (data.firstName) cleaned.firstName = data.firstName.trim();
    if (data.lastName) cleaned.lastName = data.lastName.trim();
    if (data.email) cleaned.email = data.email.trim();
    if (data.password) cleaned.password = data.password.trim();
    if (data.phoneNumber) cleaned.phoneNumber = data.phoneNumber.trim();
    if (data.address) cleaned.address = data.address.trim();
    if (data.dateOfBirth) cleaned.dateOfBirth = data.dateOfBirth.length === 10 ? `${data.dateOfBirth}T00:00:00` : data.dateOfBirth;
    if (data.gender) cleaned.gender = data.gender;
    if (data.bloodGroup) cleaned.bloodGroup = data.bloodGroup;
    if (data.height !== '' && data.height !== undefined && data.height !== null) cleaned.height = Number(data.height);
    if (data.weight !== '' && data.weight !== undefined && data.weight !== null) cleaned.weight = Number(data.weight);
    if (data.allergies) cleaned.allergies = data.allergies.trim();
    if (data.emergencyContactName) cleaned.emergencyContactName = data.emergencyContactName.trim();
    if (data.emergencyContactPhone) cleaned.emergencyContactPhone = data.emergencyContactPhone.trim();
    if (data.insuranceProvider) cleaned.insuranceProvider = data.insuranceProvider.trim();
    if (data.insuranceId) cleaned.insuranceId = data.insuranceId.trim();
    return cleaned;
  };

  const validatePatientForm = (data) => {
    if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim() || !data.password.trim()) {
      return 'First name, last name, email, and password are required.';
    }
    return '';
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    const validationError = validatePatientForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    const payload = cleanPatientFormData(formData);
    try {
      await api.post('/api/patients', payload);
      setShowAddModal(false);
      fetchPatients();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        height: '',
        weight: '',
        allergies: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        insuranceProvider: '',
        insuranceId: ''
      });
      setError('');
    } catch (err) {
      console.error('Error adding patient:', err);
      setError(err.response?.data?.message || 'Failed to add patient. Please try again.');
    }
  };

  const cleanPatientUpdateData = (data) => {
    const cleaned = {};
    if (data.firstName) cleaned.firstName = data.firstName.trim();
    if (data.lastName) cleaned.lastName = data.lastName.trim();
    if (data.email) cleaned.email = data.email.trim();
    if (data.password && data.password.trim()) cleaned.password = data.password.trim();
    if (data.phoneNumber) cleaned.phoneNumber = data.phoneNumber.trim();
    if (data.address) cleaned.address = data.address.trim();
    if (data.dateOfBirth) cleaned.dateOfBirth = data.dateOfBirth.length === 10 ? `${data.dateOfBirth}T00:00:00` : data.dateOfBirth;
    if (data.gender) cleaned.gender = data.gender;
    if (data.bloodGroup) cleaned.bloodGroup = data.bloodGroup;
    if (data.height !== '' && data.height !== undefined && data.height !== null) cleaned.height = Number(data.height);
    if (data.weight !== '' && data.weight !== undefined && data.weight !== null) cleaned.weight = Number(data.weight);
    if (data.allergies) cleaned.allergies = data.allergies.trim();
    if (data.emergencyContactName) cleaned.emergencyContactName = data.emergencyContactName.trim();
    if (data.emergencyContactPhone) cleaned.emergencyContactPhone = data.emergencyContactPhone.trim();
    if (data.insuranceProvider) cleaned.insuranceProvider = data.insuranceProvider.trim();
    if (data.insuranceId) cleaned.insuranceId = data.insuranceId.trim();
    return cleaned;
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    const payload = cleanPatientUpdateData(formData);
    try {
      await api.put(`/api/patients/${currentPatient.patientId}`, payload);
      setShowEditModal(false);
      fetchPatients();
      setError('');
    } catch (err) {
      console.error('Error updating patient:', err);
      setError(err.response?.data?.message || 'Failed to update patient. Please try again.');
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/api/patients/${patientId}`);
        fetchPatients();
      } catch (err) {
        console.error('Error deleting patient:', err);
        setError('Failed to delete patient. Please try again.');
      }
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getFilteredPatients = () => {
    return patients.filter(patient => {
      // Filter by gender
      if (genderFilter !== 'ALL' && patient.gender !== genderFilter) {
        return false;
      }
      
      // Filter by age group
      if (ageFilter !== 'ALL') {
        const age = calculateAge(patient.dateOfBirth);
        switch (ageFilter) {
          case 'CHILD':
            if (age >= 18) return false;
            break;
          case 'ADULT':
            if (age < 18 || age >= 60) return false;
            break;
          case 'SENIOR':
            if (age < 60) return false;
            break;
          default:
            break;
        }
      }
      
      // Search term filter
      if (searchTerm) {
        const searchString = `${patient.firstName} ${patient.lastName} ${patient.patientId}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      }
      
      return true;
    });
  };

  const safeDateInput = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  if (loading) {
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
        <div className="filters-container">
          <h3>Filters</h3>
          <div className="filters">
            <div className="filter-group">
              <label>Gender:</label>
              <select 
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Age Group:</label>
              <select 
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Ages</option>
                <option value="CHILD">Child (0-17)</option>
                <option value="ADULT">Adult (18-59)</option>
                <option value="SENIOR">Senior (60+)</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Search:</label>
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search patients..."
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
          <i className="fas fa-plus"></i> Add Patient
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Contact</th>
              <th>Blood Group</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredPatients().length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No patients found</td>
              </tr>
            ) : (
              getFilteredPatients().map(patient => (
                <tr key={patient.patientId}>
                  <td>{patient.patientId}</td>
                  <td>{patient.firstName} {patient.lastName}</td>
                  <td>{calculateAge(patient.dateOfBirth) || 'N/A'}</td>
                  <td>{patient.gender || 'N/A'}</td>
                  <td>{patient.phoneNumber || patient.email}</td>
                  <td>{patient.bloodGroup || 'N/A'}</td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view" 
                      onClick={() => {
                        setCurrentPatient(patient);
                        setShowEditModal(true);
                        setFormData({
                          firstName: patient.firstName,
                          lastName: patient.lastName,
                          email: patient.email,
                          phoneNumber: patient.phoneNumber,
                          address: patient.address,
                          dateOfBirth: safeDateInput(patient.dateOfBirth),
                          gender: patient.gender,
                          bloodGroup: patient.bloodGroup,
                          height: patient.height,
                          weight: patient.weight,
                          allergies: patient.allergies,
                          emergencyContactName: patient.emergencyContactName,
                          emergencyContactPhone: patient.emergencyContactPhone,
                          insuranceProvider: patient.insuranceProvider,
                          insuranceId: patient.insuranceId
                        });
                      }}
                      title="Edit Patient"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDeletePatient(patient.patientId)}
                      title="Delete Patient"
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
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
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
                  
                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="2"
                    ></textarea>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Medical Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Blood Group</label>
                      <select
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
                      <label>Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Allergies</label>
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="List any known allergies..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Emergency Contact</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Insurance Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Insurance Provider</label>
                      <input
                        type="text"
                        name="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Insurance ID</label>
                      <input
                        type="text"
                        name="insuranceId"
                        value={formData.insuranceId}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <i className="fas fa-save"></i> Add Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && currentPatient && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit Patient: {currentPatient.firstName} {currentPatient.lastName}</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditPatient}>
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
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
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
                  
                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="2"
                    ></textarea>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Medical Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Blood Group</label>
                      <select
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
                      <label>Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Allergies</label>
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="List any known allergies..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Emergency Contact</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Insurance Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Insurance Provider</label>
                      <input
                        type="text"
                        name="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Insurance ID</label>
                      <input
                        type="text"
                        name="insuranceId"
                        value={formData.insuranceId}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <i className="fas fa-save"></i> Update Patient
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

export default PatientManagement; 
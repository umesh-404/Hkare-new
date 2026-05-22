import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const Profile = ({ userData }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
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
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (userData) {
      // Fetch detailed patient profile
      const fetchPatientDetails = async () => {
        try {
          const response = await api.get(`/api/patients/${userData.roleId}`);
          const patientData = response.data;
          
          // Format date of birth if exists
          let formattedDob = '';
          if (patientData.user?.dateOfBirth) {
            const dob = new Date(patientData.user.dateOfBirth);
            formattedDob = dob.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          }
          
          setFormData({
            firstName: patientData.firstName || '',
            lastName: patientData.lastName || '',
            email: patientData.user?.email || '',
            phoneNumber: patientData.user?.phoneNumber || '',
            address: patientData.user?.address || '',
            dateOfBirth: formattedDob,
            gender: patientData.user?.gender || '',
            bloodGroup: patientData.bloodGroup || '',
            height: patientData.height?.toString() || '',
            weight: patientData.weight?.toString() || '',
            allergies: patientData.allergies || '',
            emergencyContactName: patientData.emergencyContactName || '',
            emergencyContactPhone: patientData.emergencyContactPhone || '',
            insuranceProvider: patientData.insuranceProvider || '',
            insuranceId: patientData.insuranceId || ''
          });
        } catch (err) {
          console.error('Error fetching patient details:', err);
          setError('Failed to load profile information. Please try again later.');
          
          // Fall back to basic user data if available
          if (userData) {
            setFormData(prevData => ({
              ...prevData,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || ''
            }));
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchPatientDetails();
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      // Prepare data for API
      const updateData = {
        ...formData,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null
      };
      
      // Send update request
      await api.put(`/api/patients/${userData.roleId}`, updateData);
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !formData.firstName) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-header-left">
            <i className="fas fa-id-card"></i>
            <h3>Patient Profile</h3>
          </div>
          <div className="profile-header-right">
            <button 
              className={`profile-edit-btn ${isEditing ? 'cancel' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <i className="fas fa-times"></i> Cancel
                </>
              ) : (
                <>
                  <i className="fas fa-edit"></i> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="profile-message error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
        
        {successMessage && (
          <div className="profile-message success">
            <i className="fas fa-check-circle"></i> {successMessage}
          </div>
        )}
        
        <div className="profile-card-body">
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-section">
              <h4 className="profile-section-title">Basic Information</h4>
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>Patient ID</label>
                  <input 
                    type="text" 
                    value={userData?.roleId || ''} 
                    disabled 
                    className="profile-form-field" 
                  />
                </div>
                <div className="profile-form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    disabled={true} // Email cannot be changed
                    className="profile-form-field" 
                  />
                </div>
              </div>
              
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                    required
                  />
                </div>
                <div className="profile-form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                    required
                  />
                </div>
              </div>
              
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phoneNumber" 
                    value={formData.phoneNumber} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
                <div className="profile-form-group">
                  <label>Date of Birth</label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    value={formData.dateOfBirth} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
              </div>
              
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>Gender</label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="profile-form-group wide">
                  <label>Address</label>
                  <textarea 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                    rows="2"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="profile-section">
              <h4 className="profile-section-title">Medical Information</h4>
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>Blood Group</label>
                  <select 
                    name="bloodGroup" 
                    value={formData.bloodGroup} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field"
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
                <div className="profile-form-group">
                  <label>Height (cm)</label>
                  <input 
                    type="number" 
                    name="height" 
                    value={formData.height} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
                <div className="profile-form-group">
                  <label>Weight (kg)</label>
                  <input 
                    type="number" 
                    name="weight" 
                    value={formData.weight} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
              </div>
              
              <div className="profile-form-row">
                <div className="profile-form-group wide">
                  <label>Allergies</label>
                  <textarea 
                    name="allergies" 
                    value={formData.allergies} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                    rows="2"
                    placeholder="List any known allergies..."
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="profile-section">
              <h4 className="profile-section-title">Emergency Contact</h4>
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>Contact Name</label>
                  <input 
                    type="text" 
                    name="emergencyContactName" 
                    value={formData.emergencyContactName} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
                <div className="profile-form-group">
                  <label>Contact Phone</label>
                  <input 
                    type="tel" 
                    name="emergencyContactPhone" 
                    value={formData.emergencyContactPhone} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
              </div>
            </div>
            
            <div className="profile-section">
              <h4 className="profile-section-title">Insurance Information</h4>
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>Insurance Provider</label>
                  <input 
                    type="text" 
                    name="insuranceProvider" 
                    value={formData.insuranceProvider} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
                <div className="profile-form-group">
                  <label>Insurance ID</label>
                  <input 
                    type="text" 
                    name="insuranceId" 
                    value={formData.insuranceId} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
              </div>
            </div>
            
            {isEditing && (
              <div className="profile-actions">
                <button type="submit" className="profile-save-btn">
                  <i className="fas fa-save"></i> Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
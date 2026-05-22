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
    specialization: '',
    qualification: '',
    experienceYears: '',
    licenseNumber: '',
    consultationFee: '',
    bio: '',
    departmentId: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // Fetch departments for dropdown
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/api/departments');
        setDepartments(response.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (userData) {
      // Fetch detailed doctor profile
      const fetchDoctorDetails = async () => {
        try {
          const response = await api.get(`/api/doctors/${userData.roleId}`);
          const doctorData = response.data;
          
          // Format date of birth if exists
          let formattedDob = '';
          if (doctorData.user?.dateOfBirth) {
            const dob = new Date(doctorData.user.dateOfBirth);
            formattedDob = dob.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          }
          
          setFormData({
            firstName: doctorData.firstName || '',
            lastName: doctorData.lastName || '',
            email: doctorData.user?.email || '',
            phoneNumber: doctorData.user?.phoneNumber || '',
            address: doctorData.user?.address || '',
            dateOfBirth: formattedDob,
            gender: doctorData.user?.gender || '',
            specialization: doctorData.specialization || '',
            qualification: doctorData.qualification || '',
            experienceYears: doctorData.experienceYears?.toString() || '',
            licenseNumber: doctorData.licenseNumber || '',
            consultationFee: doctorData.consultationFee?.toString() || '',
            bio: doctorData.bio || '',
            departmentId: doctorData.department?.departmentId?.toString() || ''
          });
        } catch (err) {
          console.error('Error fetching doctor details:', err);
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
      
      fetchDoctorDetails();
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
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : null,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
        dateOfBirth: formData.dateOfBirth ? `${formData.dateOfBirth}` : null
      };
      
      // Send update request
      await api.put(`/api/doctors/${userData.roleId}`, updateData);
      
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
            <i className="fas fa-user-md"></i>
            <h3>Doctor Profile</h3>
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
                  <label>Doctor ID</label>
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
              <h4 className="profile-section-title">Professional Information</h4>
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>Specialization</label>
                  <input 
                    type="text" 
                    name="specialization" 
                    value={formData.specialization} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
                <div className="profile-form-group">
                  <label>Department</label>
                  <select 
                    name="departmentId" 
                    value={formData.departmentId} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field"
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
              
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>Experience (Years)</label>
                  <input 
                    type="number" 
                    name="experienceYears" 
                    value={formData.experienceYears} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
                <div className="profile-form-group">
                  <label>Consultation Fee</label>
                  <input 
                    type="number" 
                    name="consultationFee" 
                    value={formData.consultationFee} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
              </div>
              
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>Qualification</label>
                  <input 
                    type="text" 
                    name="qualification" 
                    value={formData.qualification} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
                <div className="profile-form-group">
                  <label>License Number</label>
                  <input 
                    type="text" 
                    name="licenseNumber" 
                    value={formData.licenseNumber} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                  />
                </div>
              </div>
              
              <div className="profile-form-row">
                <div className="profile-form-group wide">
                  <label>Professional Bio</label>
                  <textarea 
                    name="bio" 
                    value={formData.bio} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="profile-form-field" 
                    rows="4"
                  ></textarea>
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
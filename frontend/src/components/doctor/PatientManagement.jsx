import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const PatientManagement = ({ doctorId }) => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (doctorId) {
      fetchPatients(doctorId);
    }
  }, [doctorId]);

  const fetchPatients = async (doctorId) => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch only patients assigned to this doctor
      const response = await api.get('/api/patients'); 
      setPatients(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "N/A";
    }
  };

  const getFilteredPatients = () => {
    return patients.filter(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) || 
             (patient.patientId && patient.patientId.toString().includes(searchTerm));
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
        <div className="search-container">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>DOB</th>
              <th>Gender</th>
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
                  <td>{patient.phoneNumber || patient.user?.phoneNumber || 'N/A'}</td>
                  <td>{formatDate(patient.dateOfBirth || patient.user?.dateOfBirth)}</td>
                  <td>{patient.gender || patient.user?.gender || 'N/A'}</td>
                  <td>{patient.bloodGroup || 'N/A'}</td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view" 
                      onClick={() => handleViewPatient(patient)}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
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
              <div className="patient-details">
                <div className="detail-section">
                  <h4>Personal Information</h4>
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Patient ID:</label>
                      <p>{selectedPatient.patientId}</p>
                    </div>
                    <div className="detail-group">
                      <label>Name:</label>
                      <p>{selectedPatient.firstName} {selectedPatient.lastName}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Date of Birth:</label>
                      <p>{formatDate(selectedPatient.dateOfBirth || selectedPatient.user?.dateOfBirth)}</p>
                    </div>
                    <div className="detail-group">
                      <label>Gender:</label>
                      <p>{selectedPatient.gender || selectedPatient.user?.gender || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Phone:</label>
                      <p>{selectedPatient.phoneNumber || selectedPatient.user?.phoneNumber || 'N/A'}</p>
                    </div>
                    <div className="detail-group">
                      <label>Email:</label>
                      <p>{selectedPatient.email || selectedPatient.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="detail-row">
                    <div className="detail-group wide">
                      <label>Address:</label>
                      <p>{selectedPatient.address || selectedPatient.user?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Medical Information</h4>
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Blood Group:</label>
                      <p>{selectedPatient.bloodGroup || 'N/A'}</p>
                    </div>
                    <div className="detail-group">
                      <label>Height:</label>
                      <p>{selectedPatient.height ? `${selectedPatient.height} cm` : 'N/A'}</p>
                    </div>
                    <div className="detail-group">
                      <label>Weight:</label>
                      <p>{selectedPatient.weight ? `${selectedPatient.weight} kg` : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-group wide">
                      <label>Allergies:</label>
                      <p>{selectedPatient.allergies || 'None reported'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Emergency Contact</h4>
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Name:</label>
                      <p>{selectedPatient.emergencyContactName || 'N/A'}</p>
                    </div>
                    <div className="detail-group">
                      <label>Phone:</label>
                      <p>{selectedPatient.emergencyContactPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Insurance Information</h4>
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Provider:</label>
                      <p>{selectedPatient.insuranceProvider || 'N/A'}</p>
                    </div>
                    <div className="detail-group">
                      <label>Policy ID:</label>
                      <p>{selectedPatient.insuranceId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="close-btn" 
                  onClick={() => setShowViewModal(false)}
                >
                  Close
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
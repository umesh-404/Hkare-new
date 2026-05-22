import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const MedicalRecordView = ({ patientId }) => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (patientId) {
      fetchMedicalRecords(patientId);
    }
  }, [patientId]);

  const fetchMedicalRecords = async (patientId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/medical-records/patient/${patientId}`);
      setMedicalRecords(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setError('Failed to load medical records. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not Specified";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Date Error";
    }
  };

  const getRecordTypeClass = (recordType) => {
    const classes = {
      'GENERAL_CHECKUP': 'status-pending',
      'EMERGENCY': 'status-rejected',
      'FOLLOW_UP': 'status-completed',
      'SURGERY': 'status-rejected',
      'LAB_TEST': 'status-pending',
      'IMAGING': 'status-pending',
      'VACCINATION': 'status-completed',
      'CONSULTATION': 'status-completed'
    };
    return classes[recordType] || 'status-pending';
  };

  const getDoctorName = (doctorId) => {
    // This would typically fetch doctor info from context or make an API call
    // For simplicity, returning placeholder text
    return doctorId ? `Dr. ${doctorId}` : 'Unknown Doctor';
  };

  const getFilteredRecords = () => {
    return medicalRecords.filter(record => {
      // Filter by record type
      if (recordTypeFilter !== 'ALL' && record.recordType !== recordTypeFilter) {
        return false;
      }
      
      // Filter by date
      if (dateFilter && record.recordDate) {
        const recordDate = new Date(record.recordDate).toISOString().split('T')[0];
        if (recordDate !== dateFilter) {
          return false;
        }
      }
      
      // Apply search term to doctor name, diagnosis, or record ID
      if (searchTerm) {
        const doctorName = getDoctorName(record.doctorId).toLowerCase();
        const recordId = record.recordId?.toString().toLowerCase() || '';
        const diagnosis = record.diagnosis?.toLowerCase() || '';
        
        return doctorName.includes(searchTerm.toLowerCase()) || 
               recordId.includes(searchTerm.toLowerCase()) ||
               diagnosis.includes(searchTerm.toLowerCase());
      }
      
      return true;
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading medical records...</p>
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
              <label>Record Type:</label>
              <select 
                className="filter-select"
                value={recordTypeFilter}
                onChange={(e) => setRecordTypeFilter(e.target.value)}
              >
                <option value="ALL">All Types</option>
                <option value="GENERAL_CHECKUP">General Checkup</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="FOLLOW_UP">Follow-up</option>
                <option value="SURGERY">Surgery</option>
                <option value="LAB_TEST">Lab Test</option>
                <option value="IMAGING">Imaging</option>
                <option value="VACCINATION">Vaccination</option>
                <option value="CONSULTATION">Consultation</option>
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
                  placeholder="Search by doctor, ID, or diagnosis..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <i className="fas fa-search search-icon"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Doctor</th>
              <th>Record Type</th>
              <th>Diagnosis</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredRecords().length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No medical records found</td>
              </tr>
            ) : (
              getFilteredRecords().map(record => (
                <tr key={record.recordId}>
                  <td>{record.recordId}</td>
                  <td>{formatDate(record.recordDate)}</td>
                  <td>{getDoctorName(record.doctorId)}</td>
                  <td>
                    <span className={`status-badge ${getRecordTypeClass(record.recordType)}`}>
                      {record.recordType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{record.diagnosis ? record.diagnosis.substring(0, 30) + (record.diagnosis.length > 30 ? '...' : '') : 'Not recorded'}</td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view" 
                      onClick={() => handleViewRecord(record)}
                      title="View Details"
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

      {/* View Medical Record Modal */}
      {showViewModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Medical Record Details</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="medical-record-details">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Record ID:</label>
                      <p>{selectedRecord.recordId}</p>
                    </div>
                    <div className="detail-group">
                      <label>Doctor Name:</label>
                      <p>{getDoctorName(selectedRecord.doctorId)}</p>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Record Type:</label>
                      <span className={`status-badge ${getRecordTypeClass(selectedRecord.recordType)}`}>
                        {selectedRecord.recordType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="detail-group">
                      <label>Record Date:</label>
                      <p>{formatDate(selectedRecord.recordDate)}</p>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-group wide">
                      <label>Next Appointment:</label>
                      <p>{formatDate(selectedRecord.nextAppointment)}</p>
                    </div>
                  </div>
                </div>
                <div className="detail-section">
                  <h4>Medical Details</h4>
                  <div className="medical-details-grid">
                    <div className="detail-card">
                      <label>Symptoms:</label>
                      <p>{selectedRecord.symptoms || 'None recorded'}</p>
                    </div>
                    <div className="detail-card">
                      <label>Diagnosis:</label>
                      <p>{selectedRecord.diagnosis || 'None recorded'}</p>
                    </div>
                  </div>
                  <div className="medical-details-grid">
                    <div className="detail-card">
                      <label>Treatment:</label>
                      <p>{selectedRecord.treatment || 'None recorded'}</p>
                    </div>
                    <div className="detail-card">
                      <label>Prescription:</label>
                      <p>{selectedRecord.prescription || 'None recorded'}</p>
                    </div>
                  </div>
                  <div className="medical-details-grid">
                    <div className="detail-card">
                      <label>Test Results:</label>
                      <p>{selectedRecord.testResults || 'None recorded'}</p>
                    </div>
                    <div className="detail-card">
                      <label>Notes:</label>
                      <p>{selectedRecord.notes || 'None recorded'}</p>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-group wide">
                      <label>Medical History:</label>
                      <p>{selectedRecord.medicalHistory || 'None recorded'}</p>
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button onClick={() => setShowViewModal(false)} className="secondary-btn">
                    Close
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

export default MedicalRecordView; 
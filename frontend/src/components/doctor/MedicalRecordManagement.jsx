import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const MedicalRecordManagement = ({ doctorId }) => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Filter states
  const [patientFilter, setPatientFilter] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    recordType: 'GENERAL_CHECKUP',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: '',
    prescription: '',
    testResults: '',
    medicalHistory: '',
    recordDate: new Date().toISOString().split('T')[0],
    nextAppointment: ''
  });

  useEffect(() => {
    if (doctorId) {
      fetchMedicalRecords(doctorId);
      fetchPatients();
    }
  }, [doctorId]);

  const fetchMedicalRecords = async (doctorId) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/medical-records/doctor/${doctorId}`);
      setMedicalRecords(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setError('Failed to load medical records. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients');
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const formatToLocalDateTime = (dateStr) => {
    if (!dateStr) return null;
    // If already has time, return as is
    if (dateStr.length > 10) return dateStr;
    return dateStr + 'T00:00:00';
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      const newRecord = {
        ...formData,
        doctorId: doctorId,
        recordDate: formatToLocalDateTime(formData.recordDate),
        nextAppointment: formatToLocalDateTime(formData.nextAppointment)
      };
      
      const response = await api.post('/api/medical-records', newRecord);
      setMedicalRecords([...medicalRecords, response.data]);
      setShowAddModal(false);
      alert('Medical record added successfully!');
    } catch (err) {
      console.error('Error adding medical record:', err);
      alert(err.response?.data?.message || 'Failed to add medical record. Please try again.');
    }
  };

  const safeDateInput = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    try {
      const updatedRecord = {
        ...formData,
        doctorId: doctorId,
        recordDate: formatToLocalDateTime(formData.recordDate),
        nextAppointment: formatToLocalDateTime(formData.nextAppointment)
      };
      
      const response = await api.put(`/api/medical-records/${selectedRecord.recordId}`, updatedRecord);
      
      setMedicalRecords(medicalRecords.map(record => 
        record.recordId === selectedRecord.recordId ? response.data : record
      ));
      
      setShowEditModal(false);
      alert('Medical record updated successfully!');
    } catch (err) {
      console.error('Error updating medical record:', err);
      alert(err.response?.data?.message || 'Failed to update medical record. Please try again.');
    }
  };

  const openAddModal = () => {
    setFormData({
      patientId: '',
      doctorId: doctorId,
      recordType: 'GENERAL_CHECKUP',
      diagnosis: '',
      symptoms: '',
      treatment: '',
      notes: '',
      prescription: '',
      testResults: '',
      medicalHistory: '',
      recordDate: new Date().toISOString().split('T')[0],
      nextAppointment: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setFormData({
      patientId: record.patientId || '',
      doctorId: record.doctorId || doctorId,
      recordType: record.recordType || 'GENERAL_CHECKUP',
      diagnosis: record.diagnosis || '',
      symptoms: record.symptoms || '',
      treatment: record.treatment || '',
      notes: record.notes || '',
      prescription: record.prescription || '',
      testResults: record.testResults || '',
      medicalHistory: record.medicalHistory || '',
      recordDate: safeDateInput(record.recordDate),
      nextAppointment: safeDateInput(record.nextAppointment)
    });
    setShowEditModal(true);
  };

  const openViewModal = (record) => {
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

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.patientId === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getFilteredRecords = () => {
    return medicalRecords.filter(record => {
      // Filter by patient
      if (patientFilter && record.patientId !== patientFilter) {
        return false;
      }
      
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
      
      // Apply search term to patient name, diagnosis, or record ID
      if (searchTerm) {
        const patientName = getPatientName(record.patientId).toLowerCase();
        const recordId = record.recordId?.toString().toLowerCase() || '';
        const diagnosis = record.diagnosis?.toLowerCase() || '';
        
        return patientName.includes(searchTerm.toLowerCase()) || 
               recordId.includes(searchTerm.toLowerCase()) ||
               diagnosis.includes(searchTerm.toLowerCase());
      }
      
      return true;
    });
  };

  if (isLoading) {
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
              <label>Patient:</label>
              <select 
                className="filter-select"
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
              >
                <option value="">All Patients</option>
                {patients.map(patient => (
                  <option key={patient.patientId} value={patient.patientId}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>
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
                  placeholder="Search by patient, ID, or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>
        </div>
        <button className="add-btn" onClick={openAddModal}>
          <i className="fas fa-plus"></i>
          New Medical Record
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Record Type</th>
              <th>Date</th>
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
                  <td>{getPatientName(record.patientId)}</td>
                  <td>
                    <span className={`status-badge ${getRecordTypeClass(record.recordType)}`}>
                      {record.recordType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{formatDate(record.recordDate)}</td>
                  <td>{record.diagnosis ? record.diagnosis.substring(0, 30) + (record.diagnosis.length > 30 ? '...' : '') : 'N/A'}</td>
                  <td className="actions-cell">
                    <button
                      className="action-btn view" 
                      onClick={() => openViewModal(record)}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="action-btn edit" 
                      onClick={() => openEditModal(record)}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Medical Record Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Add New Medical Record</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddRecord}>
                <div className="form-section">
                  <h4>Basic Information</h4>
                  <div className="form-group">
                    <label htmlFor="patientId">Patient*</label>
                    <select
                      id="patientId"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Patient</option>
                      {patients.map(patient => (
                        <option key={patient.patientId} value={patient.patientId}>
                          {patient.firstName} {patient.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="recordType">Record Type*</label>
                    <select
                      id="recordType"
                      name="recordType"
                      value={formData.recordType}
                      onChange={handleInputChange}
                      required
                    >
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
                  
                  <div className="form-group">
                    <label htmlFor="recordDate">Record Date*</label>
                    <input
                      type="date"
                      id="recordDate"
                      name="recordDate"
                      value={formData.recordDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="nextAppointment">Next Appointment</label>
                    <input
                      type="date"
                      id="nextAppointment"
                      name="nextAppointment"
                      value={formData.nextAppointment}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Medical Details</h4>
                  <div className="form-group">
                    <label htmlFor="symptoms">Symptoms</label>
                    <textarea
                      id="symptoms"
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="diagnosis">Diagnosis</label>
                    <textarea
                      id="diagnosis"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="treatment">Treatment</label>
                    <textarea
                      id="treatment"
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="prescription">Prescription</label>
                    <textarea
                      id="prescription"
                      name="prescription"
                      value={formData.prescription}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="testResults">Test Results</label>
                    <textarea
                      id="testResults"
                      name="testResults"
                      value={formData.testResults}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="medicalHistory">Medical History</label>
                    <textarea
                      id="medicalHistory"
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Add Medical Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Medical Record Modal */}
      {showEditModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit Medical Record</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateRecord}>
                {/* Same form fields as Add Modal */}
                <div className="form-section">
                  <h4>Basic Information</h4>
                  <div className="form-group">
                    <label htmlFor="patientId">Patient*</label>
                    <select
                      id="patientId"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Patient</option>
                      {patients.map(patient => (
                        <option key={patient.patientId} value={patient.patientId}>
                          {patient.firstName} {patient.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="recordType">Record Type*</label>
                    <select
                      id="recordType"
                      name="recordType"
                      value={formData.recordType}
                      onChange={handleInputChange}
                      required
                    >
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
                  
                  <div className="form-group">
                    <label htmlFor="recordDate">Record Date*</label>
                    <input
                      type="date"
                      id="recordDate"
                      name="recordDate"
                      value={formData.recordDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="nextAppointment">Next Appointment</label>
                    <input
                      type="date"
                      id="nextAppointment"
                      name="nextAppointment"
                      value={formData.nextAppointment}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Medical Details</h4>
                  <div className="form-group">
                    <label htmlFor="symptoms">Symptoms</label>
                    <textarea
                      id="symptoms"
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="diagnosis">Diagnosis</label>
                    <textarea
                      id="diagnosis"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="treatment">Treatment</label>
                    <textarea
                      id="treatment"
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="prescription">Prescription</label>
                    <textarea
                      id="prescription"
                      name="prescription"
                      value={formData.prescription}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="testResults">Test Results</label>
                    <textarea
                      id="testResults"
                      name="testResults"
                      value={formData.testResults}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="medicalHistory">Medical History</label>
                    <textarea
                      id="medicalHistory"
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Update Medical Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
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
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-row">
                  <div className="detail-group">
                    <label>Record ID:</label>
                    <p>{selectedRecord.recordId}</p>
                  </div>
                  <div className="detail-group">
                    <label>Patient:</label>
                    <p>{getPatientName(selectedRecord.patientId)}</p>
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
                  <div className="detail-group">
                    <label>Next Appointment:</label>
                    <p>{formatDate(selectedRecord.nextAppointment)}</p>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Medical Details</h4>
                <div className="detail-row">
                  <div className="detail-group wide">
                    <label>Symptoms:</label>
                    <p>{selectedRecord.symptoms || 'None recorded'}</p>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group wide">
                    <label>Diagnosis:</label>
                    <p>{selectedRecord.diagnosis || 'None recorded'}</p>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group wide">
                    <label>Treatment:</label>
                    <p>{selectedRecord.treatment || 'None recorded'}</p>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group wide">
                    <label>Prescription:</label>
                    <p>{selectedRecord.prescription || 'None recorded'}</p>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group wide">
                    <label>Test Results:</label>
                    <p>{selectedRecord.testResults || 'None recorded'}</p>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group wide">
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
                <button onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedRecord);
                }} className="primary-btn">
                  Edit Record
                </button>
                <button onClick={() => setShowViewModal(false)} className="secondary-btn">
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

export default MedicalRecordManagement; 
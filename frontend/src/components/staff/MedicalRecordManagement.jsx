import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const MedicalRecordManagement = () => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    recordType: 'GENERAL_CHECKUP',
    recordDate: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    testResults: '',
    notes: '',
    nextAppointment: '',
    medicalHistory: ''
  });

  useEffect(() => {
    fetchMedicalRecords();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchMedicalRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/medical-records');
      setMedicalRecords(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setError('Failed to load medical records. Please try again later.');
    } finally {
      setLoading(false);
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

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/api/doctors');
      setDoctors(response.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/medical-records', formData);
      setShowAddModal(false);
      fetchMedicalRecords();
      setFormData({
        patientId: '',
        doctorId: '',
        recordType: 'GENERAL_CHECKUP',
        recordDate: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        prescription: '',
        testResults: '',
        notes: '',
        nextAppointment: '',
        medicalHistory: ''
      });
    } catch (err) {
      console.error('Error adding medical record:', err);
      setError('Failed to add medical record. Please try again.');
    }
  };

  const cleanMedicalRecordData = (data) => {
    const cleaned = {};
    if (data.patientId) cleaned.patientId = data.patientId;
    if (data.doctorId) cleaned.doctorId = data.doctorId;
    if (data.recordType) cleaned.recordType = data.recordType;
    if (data.recordDate) cleaned.recordDate = data.recordDate.length === 10 ? `${data.recordDate}T00:00:00` : data.recordDate;
    if (data.symptoms) cleaned.symptoms = data.symptoms.trim();
    if (data.diagnosis) cleaned.diagnosis = data.diagnosis.trim();
    if (data.treatment) cleaned.treatment = data.treatment.trim();
    if (data.prescription) cleaned.prescription = data.prescription.trim();
    if (data.testResults) cleaned.testResults = data.testResults.trim();
    if (data.notes) cleaned.notes = data.notes.trim();
    if (data.nextAppointment) cleaned.nextAppointment = data.nextAppointment.length === 10 ? `${data.nextAppointment}T00:00:00` : data.nextAppointment;
    if (data.medicalHistory) cleaned.medicalHistory = data.medicalHistory.trim();
    return cleaned;
  };

  const handleEditRecord = async (e) => {
    e.preventDefault();
    try {
      const payload = cleanMedicalRecordData(formData);
      await api.put(`/api/medical-records/${currentRecord.recordId}`, payload);
      setShowEditModal(false);
      fetchMedicalRecords();
    } catch (err) {
      console.error('Error updating medical record:', err);
      setError('Failed to update medical record. Please try again.');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await api.delete(`/api/medical-records/${recordId}`);
        fetchMedicalRecords();
      } catch (err) {
        console.error('Error deleting medical record:', err);
        setError('Failed to delete medical record. Please try again.');
      }
    }
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
      
      // Search term filter
      if (searchTerm) {
        const patient = patients.find(p => p.patientId === record.patientId);
        const doctor = doctors.find(d => d.doctorId === record.doctorId);
        const searchString = `${patient?.firstName} ${patient?.lastName} ${doctor?.firstName} ${doctor?.lastName} ${record.diagnosis}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
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
                value={recordTypeFilter}
                onChange={(e) => setRecordTypeFilter(e.target.value)}
                className="filter-select"
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
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-date"
              />
            </div>
            <div className="filter-group">
              <label>Search:</label>
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search records..."
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
          <i className="fas fa-plus"></i> Add Medical Record
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Type</th>
              <th>Diagnosis</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredRecords().length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No medical records found</td>
              </tr>
            ) : (
              getFilteredRecords().map(record => {
                const patient = patients.find(p => p.patientId === record.patientId);
                const doctor = doctors.find(d => d.doctorId === record.doctorId);
                return (
                  <tr key={record.recordId}>
                    <td>{record.recordId}</td>
                    <td>{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</td>
                    <td>{doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Not Assigned'}</td>
                    <td>{formatDate(record.recordDate)}</td>
                    <td>
                      <span className={`status-badge ${getRecordTypeClass(record.recordType)}`}>
                        {record.recordType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>{record.diagnosis ? record.diagnosis.substring(0, 30) + (record.diagnosis.length > 30 ? '...' : '') : 'Not recorded'}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view" 
                        onClick={() => {
                          setCurrentRecord(record);
                          setShowEditModal(true);
                          setFormData({
                            patientId: record.patientId,
                            doctorId: record.doctorId,
                            recordType: record.recordType,
                            recordDate: record.recordDate,
                            symptoms: record.symptoms,
                            diagnosis: record.diagnosis,
                            treatment: record.treatment,
                            prescription: record.prescription,
                            testResults: record.testResults,
                            notes: record.notes,
                            nextAppointment: record.nextAppointment,
                            medicalHistory: record.medicalHistory
                          });
                        }}
                        title="Edit Record"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDeleteRecord(record.recordId)}
                        title="Delete Record"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })
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
                  <div className="form-row">
                    <div className="form-group">
                      <label>Patient*</label>
                      <select
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
                      <label>Doctor*</label>
                      <select
                        name="doctorId"
                        value={formData.doctorId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map(doctor => (
                          <option key={doctor.doctorId} value={doctor.doctorId}>
                            Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialization})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Record Type*</label>
                      <select
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
                      <label>Record Date*</label>
                      <input
                        type="date"
                        name="recordDate"
                        value={formData.recordDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Symptoms*</label>
                    <textarea
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      placeholder="Describe the patient's symptoms..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Diagnosis*</label>
                    <textarea
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      placeholder="Enter the diagnosis..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Treatment</label>
                    <textarea
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Describe the treatment plan..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Prescription</label>
                    <textarea
                      name="prescription"
                      value={formData.prescription}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter prescription details..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Test Results</label>
                    <textarea
                      name="testResults"
                      value={formData.testResults}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter any test results..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Additional notes..."
                    ></textarea>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Next Appointment</label>
                      <input
                        type="date"
                        name="nextAppointment"
                        value={formData.nextAppointment}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Medical History</label>
                    <textarea
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Relevant medical history..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <i className="fas fa-save"></i> Add Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Medical Record Modal */}
      {showEditModal && currentRecord && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit Medical Record</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditRecord}>
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Patient*</label>
                      <select
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
                      <label>Doctor*</label>
                      <select
                        name="doctorId"
                        value={formData.doctorId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map(doctor => (
                          <option key={doctor.doctorId} value={doctor.doctorId}>
                            Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialization})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Record Type*</label>
                      <select
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
                      <label>Record Date*</label>
                      <input
                        type="date"
                        name="recordDate"
                        value={formData.recordDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Symptoms*</label>
                    <textarea
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      placeholder="Describe the patient's symptoms..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Diagnosis*</label>
                    <textarea
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      placeholder="Enter the diagnosis..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Treatment</label>
                    <textarea
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Describe the treatment plan..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Prescription</label>
                    <textarea
                      name="prescription"
                      value={formData.prescription}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter prescription details..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Test Results</label>
                    <textarea
                      name="testResults"
                      value={formData.testResults}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter any test results..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Additional notes..."
                    ></textarea>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Next Appointment</label>
                      <input
                        type="date"
                        name="nextAppointment"
                        value={formData.nextAppointment}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Medical History</label>
                    <textarea
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Relevant medical history..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <i className="fas fa-save"></i> Update Record
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

export default MedicalRecordManagement; 
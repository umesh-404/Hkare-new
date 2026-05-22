import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const PrescriptionManagement = ({ doctorId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Selected prescription for operations
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    prescriptionDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    status: 'ACTIVE',
    notes: '',
    isRefillable: false,
    totalRefills: 0,
    medications: [
      {
        medicationName: '',
        dosage: '',
        frequency: '',
        instructions: '',
        quantity: 1,
        duration: ''
      }
    ]
  });

  useEffect(() => {
    if (doctorId) {
      fetchPrescriptions(doctorId);
      fetchPatients();
      fetchMedications();
    }
  }, [doctorId]);

  const fetchPrescriptions = async (doctorId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/prescriptions/doctor/${doctorId}`);
      setPrescriptions(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Failed to load prescriptions. Please try again later.');
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

  const fetchMedications = async () => {
    try {
      const response = await api.get('/api/medications');
      setMedications(response.data);
    } catch (err) {
      console.error('Error fetching medications:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      medications: updatedMedications
    });
  };

  const addMedicationField = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        {
          medicationName: '',
          dosage: '',
          frequency: '',
          instructions: '',
          quantity: 1,
          duration: ''
        }
      ]
    });
  };

  const removeMedicationField = (index) => {
    const updatedMedications = [...formData.medications];
    updatedMedications.splice(index, 1);
    
    setFormData({
      ...formData,
      medications: updatedMedications
    });
  };

  const openAddModal = () => {
    setFormData({
      patientId: '',
      doctorId: doctorId,
      prescriptionDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      status: 'ACTIVE',
      notes: '',
      isRefillable: false,
      totalRefills: 0,
      medications: [
        {
          medicationName: '',
          dosage: '',
          frequency: '',
          instructions: '',
          quantity: 1,
          duration: ''
        }
      ]
    });
    setShowAddModal(true);
  };

  const openEditModal = (prescription) => {
    setSelectedPrescription(prescription);
    
    // Convert prescription to form data format
    const expiryDate = prescription.expiryDate ? new Date(prescription.expiryDate).toISOString().split('T')[0] : '';
    const prescriptionDate = prescription.prescriptionDate ? new Date(prescription.prescriptionDate).toISOString().split('T')[0] : '';
    
    setFormData({
      patientId: prescription.patientId || '',
      doctorId: prescription.doctorId || doctorId,
      prescriptionDate: prescriptionDate,
      expiryDate: expiryDate,
      status: prescription.status || 'ACTIVE',
      notes: prescription.notes || '',
      isRefillable: prescription.isRefillable || false,
      totalRefills: prescription.totalRefills || 0,
      medications: prescription.medications && prescription.medications.length > 0 
        ? prescription.medications.map(med => ({
            medicationName: med.medicationName || '',
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            instructions: med.instructions || '',
            quantity: med.quantity || 1,
            duration: med.duration || ''
          }))
        : [
            {
              medicationName: '',
              dosage: '',
              frequency: '',
              instructions: '',
              quantity: 1,
              duration: ''
            }
          ]
    });
    
    setShowEditModal(true);
  };

  const openViewModal = (prescription) => {
    setSelectedPrescription(prescription);
    setShowViewModal(true);
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    
    try {
      const prescriptionData = {
        ...formData,
        doctorId: doctorId
      };
      
      const response = await api.post('/api/prescriptions', prescriptionData);
      
      setPrescriptions([...prescriptions, response.data]);
      setShowAddModal(false);
      alert('Prescription created successfully!');
    } catch (err) {
      console.error('Error creating prescription:', err);
      alert(err.response?.data?.message || 'Failed to create prescription. Please try again.');
    }
  };

  const handleUpdatePrescription = async (e) => {
    e.preventDefault();
    
    try {
      const prescriptionData = {
        ...formData,
        doctorId: doctorId
      };
      
      const response = await api.put(`/api/prescriptions/${selectedPrescription.prescriptionId}`, prescriptionData);
      
      setPrescriptions(prescriptions.map(p => 
        p.prescriptionId === selectedPrescription.prescriptionId ? response.data : p
      ));
      
      setShowEditModal(false);
      alert('Prescription updated successfully!');
      
      // Refresh data from server
      fetchPrescriptions(doctorId);
    } catch (err) {
      console.error('Error updating prescription:', err);
      alert(err.response?.data?.message || 'Failed to update prescription. Please try again.');
    }
  };

  const handleProcessRefill = async (prescriptionId) => {
    try {
      await api.post(`/api/prescriptions/${prescriptionId}/refill`);
      
      // Refresh prescriptions after refill
      fetchPrescriptions(doctorId);
      alert('Prescription refilled successfully!');
    } catch (err) {
      console.error('Error processing refill:', err);
      alert(err.response?.data?.message || 'Failed to process refill. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'COMPLETED':
        return 'status-completed';
      case 'EXPIRED':
        return 'status-expired';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.patientId === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getFilteredPrescriptions = () => {
    return prescriptions.filter(prescription => {
      // Apply status filter
      if (statusFilter !== 'ALL' && prescription.status !== statusFilter) {
        return false;
      }
      
      // Apply date filter
      if (dateFilter && prescription.prescriptionDate) {
        const prescDate = new Date(prescription.prescriptionDate).toISOString().split('T')[0];
        if (prescDate !== dateFilter) {
          return false;
        }
      }
      
      // Apply search term to patient name or prescription ID
      if (searchTerm) {
        const patientName = getPatientName(prescription.patientId).toLowerCase();
        const prescriptionId = prescription.prescriptionId?.toString().toLowerCase() || '';
        
        return patientName.includes(searchTerm.toLowerCase()) || 
               prescriptionId.includes(searchTerm.toLowerCase());
      }
      
      return true;
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading prescriptions...</p>
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
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
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
                  placeholder="Search by patient or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <i className="fas fa-search search-icon"></i>
              </div>
            </div>
          </div>
        </div>
        <button className="add-btn" onClick={openAddModal}>
          <i className="fas fa-plus"></i>
          New Prescription
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Refillable</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredPrescriptions().length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No prescriptions found</td>
              </tr>
            ) : (
              getFilteredPrescriptions().map(prescription => (
                <tr key={prescription.prescriptionId}>
                  <td>{prescription.prescriptionId}</td>
                  <td>{getPatientName(prescription.patientId)}</td>
                  <td>{formatDate(prescription.prescriptionDate)}</td>
                  <td>{formatDate(prescription.expiryDate)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(prescription.status)}`}>
                      {prescription.status}
                    </span>
                  </td>
                  <td>
                    {prescription.isRefillable ? (
                      <span className="refill-info">
                        Yes ({prescription.refillsRemaining}/{prescription.totalRefills})
                      </span>
                    ) : (
                      <span>No</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="action-btn view" 
                      onClick={() => openViewModal(prescription)}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="action-btn edit" 
                      onClick={() => openEditModal(prescription)}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    {prescription.status === 'ACTIVE' && prescription.isRefillable && prescription.refillsRemaining > 0 && (
                      <button 
                        className="action-btn refill" 
                        onClick={() => handleProcessRefill(prescription.prescriptionId)}
                        title="Process Refill"
                      >
                        <i className="fas fa-sync"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Prescription Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Add New Prescription</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddPrescription}>
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
                    <label htmlFor="prescriptionDate">Prescription Date*</label>
                    <input
                      type="date"
                      id="prescriptionDate"
                      name="prescriptionDate"
                      value={formData.prescriptionDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date*</label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status">Status*</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isRefillable"
                        checked={formData.isRefillable}
                        onChange={handleInputChange}
                      />
                      Refillable
                    </label>
                    
                    {formData.isRefillable && (
                      <div className="refill-count">
                        <label htmlFor="totalRefills">Total Refills:</label>
                        <input
                          type="number"
                          id="totalRefills"
                          name="totalRefills"
                          min="1"
                          value={formData.totalRefills}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}
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
                </div>
                
                <div className="form-section">
                  <h4>Medications</h4>
                  {formData.medications.map((medication, index) => (
                    <div key={index} className="medication-item">
                      <div className="form-group">
                        <label>Medication Name*</label>
                        <input
                          type="text"
                          value={medication.medicationName}
                          onChange={(e) => handleMedicationChange(index, 'medicationName', e.target.value)}
                          required
                          list="medications-list"
                        />
                        <datalist id="medications-list">
                          {medications.map(med => (
                            <option key={med.medicationId} value={med.name} />
                          ))}
                        </datalist>
                      </div>
                      
                      <div className="form-group">
                        <label>Dosage*</label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          required
                          placeholder="e.g., 10mg"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Frequency*</label>
                        <input
                          type="text"
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          required
                          placeholder="e.g., 3 times daily"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={medication.quantity}
                          onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Duration</label>
                        <input
                          type="text"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          placeholder="e.g., 7 days"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Instructions</label>
                        <textarea
                          value={medication.instructions}
                          onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                          rows="2"
                          placeholder="Special instructions for taking this medication"
                        ></textarea>
                      </div>
                      
                      {formData.medications.length > 1 && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeMedicationField(index)}
                        >
                          <i className="fas fa-minus-circle"></i> Remove Medication
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    className="add-btn"
                    onClick={addMedicationField}
                  >
                    <i className="fas fa-plus-circle"></i> Add Medication
                  </button>
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Create Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Prescription Modal */}
      {showEditModal && selectedPrescription && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit Prescription</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdatePrescription}>
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
                    <label htmlFor="prescriptionDate">Prescription Date*</label>
                    <input
                      type="date"
                      id="prescriptionDate"
                      name="prescriptionDate"
                      value={formData.prescriptionDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date*</label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status">Status*</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isRefillable"
                        checked={formData.isRefillable}
                        onChange={handleInputChange}
                      />
                      Refillable
                    </label>
                    
                    {formData.isRefillable && (
                      <div className="refill-count">
                        <label htmlFor="totalRefills">Total Refills:</label>
                        <input
                          type="number"
                          id="totalRefills"
                          name="totalRefills"
                          min="1"
                          value={formData.totalRefills}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}
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
                </div>
                
                <div className="form-section">
                  <h4>Medications</h4>
                  {formData.medications.map((medication, index) => (
                    <div key={index} className="medication-item">
                      <div className="form-group">
                        <label>Medication Name*</label>
                        <input
                          type="text"
                          value={medication.medicationName}
                          onChange={(e) => handleMedicationChange(index, 'medicationName', e.target.value)}
                          required
                          list="medications-list"
                        />
                        <datalist id="medications-list">
                          {medications.map(med => (
                            <option key={med.medicationId} value={med.name} />
                          ))}
                        </datalist>
                      </div>
                      
                      <div className="form-group">
                        <label>Dosage*</label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          required
                          placeholder="e.g., 10mg"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Frequency*</label>
                        <input
                          type="text"
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          required
                          placeholder="e.g., 3 times daily"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={medication.quantity}
                          onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Duration</label>
                        <input
                          type="text"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          placeholder="e.g., 7 days"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Instructions</label>
                        <textarea
                          value={medication.instructions}
                          onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                          rows="2"
                          placeholder="Special instructions for taking this medication"
                        ></textarea>
                      </div>
                      
                      {formData.medications.length > 1 && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeMedicationField(index)}
                        >
                          <i className="fas fa-minus-circle"></i> Remove Medication
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    className="add-btn"
                    onClick={addMedicationField}
                  >
                    <i className="fas fa-plus-circle"></i> Add Medication
                  </button>
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Update Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* View Prescription Modal */}
      {showViewModal && selectedPrescription && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Prescription Details</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-row">
                  <div className="detail-group">
                    <label>Prescription ID:</label>
                    <p>{selectedPrescription.prescriptionId}</p>
                  </div>
                  <div className="detail-group">
                    <label>Patient:</label>
                    <p>{getPatientName(selectedPrescription.patientId)}</p>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group">
                    <label>Prescription Date:</label>
                    <p>{formatDate(selectedPrescription.prescriptionDate)}</p>
                  </div>
                  <div className="detail-group">
                    <label>Expiry Date:</label>
                    <p>{formatDate(selectedPrescription.expiryDate)}</p>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group">
                    <label>Status:</label>
                    <span className={`status-badge ${getStatusClass(selectedPrescription.status)}`}>
                      {selectedPrescription.status}
                    </span>
                  </div>
                  <div className="detail-group">
                    <label>Refillable:</label>
                    <p>
                      {selectedPrescription.isRefillable ? (
                        <span>Yes ({selectedPrescription.refillsRemaining}/{selectedPrescription.totalRefills})</span>
                      ) : (
                        <span>No</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group wide">
                    <label>Notes:</label>
                    <p>{selectedPrescription.notes || 'None'}</p>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Medications</h4>
                {selectedPrescription.medications && selectedPrescription.medications.map((med, index) => (
                  <div key={index} className="medication-item">
                    <div className="detail-row">
                      <div className="detail-group">
                        <label>Medication:</label>
                        <p>{med.medicationName}</p>
                      </div>
                      <div className="detail-group">
                        <label>Dosage:</label>
                        <p>{med.dosage}</p>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-group">
                        <label>Frequency:</label>
                        <p>{med.frequency}</p>
                      </div>
                      <div className="detail-group">
                        <label>Quantity:</label>
                        <p>{med.quantity}</p>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-group">
                        <label>Duration:</label>
                        <p>{med.duration || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-group wide">
                        <label>Instructions:</label>
                        <p>{med.instructions || 'None'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="modal-actions">
                <button onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedPrescription);
                }} className="primary-btn">
                  Edit Prescription
                </button>
                {selectedPrescription.status === 'ACTIVE' && 
                 selectedPrescription.isRefillable && 
                 selectedPrescription.refillsRemaining > 0 && (
                  <button 
                    onClick={() => {
                      handleProcessRefill(selectedPrescription.prescriptionId);
                      setShowViewModal(false);
                    }} 
                    className="refill-btn"
                  >
                    Process Refill
                  </button>
                )}
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

export default PrescriptionManagement; 
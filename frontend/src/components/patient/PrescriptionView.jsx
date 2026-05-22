import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const PrescriptionView = ({ patientId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // Refill request state
  const [refillReason, setRefillReason] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchPrescriptions(patientId);
    }
  }, [patientId]);

  const fetchPrescriptions = async (patientId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/prescriptions/patient/${patientId}`);
      setPrescriptions(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Failed to load prescriptions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefillRequest = async () => {
    if (!selectedPrescription) return;
    
    setIsRequesting(true);
    try {
      await api.post(`/api/prescriptions/${selectedPrescription.prescriptionId}/refill-request`, {
        reason: refillReason
      });
      
      setRequestSuccess(true);
      setTimeout(() => {
        setShowRefillModal(false);
        setRefillReason('');
        setRequestSuccess(false);
        fetchPrescriptions(patientId); // Refresh prescriptions
      }, 2000);
      
    } catch (err) {
      console.error('Error requesting refill:', err);
      setError(err.response?.data?.message || 'Failed to request refill. Please try again.');
    } finally {
      setIsRequesting(false);
    }
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'COMPLETED':
        return 'status-completed';
      case 'EXPIRED':
        return 'status-expired';
      case 'REFILL_REQUESTED':
        return 'status-pending';
      default:
        return '';
    }
  };

  const getDoctorName = (doctorId) => {
    // This would typically fetch doctor info from context or make an API call
    // For simplicity, returning placeholder text
    return doctorId ? `Dr. ${doctorId}` : 'Unknown Doctor';
  };

  const getFilteredPrescriptions = () => {
    return prescriptions.filter(prescription => {
      // Filter by status
      if (statusFilter !== 'ALL' && prescription.status !== statusFilter) {
        return false;
      }
      
      // Filter by date
      if (dateFilter && prescription.prescriptionDate) {
        const prescDate = new Date(prescription.prescriptionDate).toISOString().split('T')[0];
        if (prescDate !== dateFilter) {
          return false;
        }
      }
      
      // Apply search term to doctor name or medication names
      if (searchTerm) {
        const doctorName = getDoctorName(prescription.doctorId).toLowerCase();
        const medicationNames = prescription.medications 
          ? prescription.medications.map(m => m.medicationName.toLowerCase()).join(' ') 
          : '';
        
        return doctorName.includes(searchTerm.toLowerCase()) || 
               medicationNames.includes(searchTerm.toLowerCase());
      }
      
      return true;
    });
  };

  const canRequestRefill = (prescription) => {
    return (
      prescription.status === 'ACTIVE' &&
      prescription.isRefillable &&
      prescription.refillsRemaining > 0 &&
      prescription.status !== 'REFILL_REQUESTED'
    );
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
                <option value="REFILL_REQUESTED">Refill Requested</option>
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
                  placeholder="Search by doctor, medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              <th>Prescribed Date</th>
              <th>Doctor</th>
              <th>Medications</th>
              <th>Expiry Date</th>
              <th>Status</th>
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
                  <td>{formatDate(prescription.prescriptionDate)}</td>
                  <td>{getDoctorName(prescription.doctorId)}</td>
                  <td>
                    {prescription.medications && prescription.medications.length > 0 
                      ? prescription.medications.map(med => med.medicationName).join(', ').substring(0, 30) + 
                        (prescription.medications.map(med => med.medicationName).join(', ').length > 30 ? '...' : '')
                      : 'No medications listed'}
                  </td>
                  <td>{formatDate(prescription.expiryDate)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(prescription.status)}`}>
                      {prescription.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view" 
                      onClick={() => {
                        setSelectedPrescription(prescription);
                        setShowViewModal(true);
                      }}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    {canRequestRefill(prescription) && (
                      <button 
                        className="action-btn refill" 
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setShowRefillModal(true);
                        }}
                        title="Request Refill"
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
              <div className="prescription-details">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Prescription ID:</label>
                      <p>{selectedPrescription.prescriptionId}</p>
                    </div>
                    <div className="detail-group">
                      <label>Status:</label>
                      <span className={`status-badge ${getStatusClass(selectedPrescription.status)}`}>
                        {selectedPrescription.status}
                      </span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Prescribed By:</label>
                      <p>{getDoctorName(selectedPrescription.doctorId)}</p>
                    </div>
                    <div className="detail-group">
                      <label>Prescribed Date:</label>
                      <p>{formatDate(selectedPrescription.prescriptionDate)}</p>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Expiry Date:</label>
                      <p>{formatDate(selectedPrescription.expiryDate)}</p>
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
                </div>
                <div className="detail-section">
                  <h4>Medications</h4>
                  {selectedPrescription.medications && selectedPrescription.medications.length > 0 ? (
                    <div className="medications-list">
                      {selectedPrescription.medications.map((medication, index) => (
                        <div key={index} className="medication-item">
                          <h5>{medication.medicationName}</h5>
                          <div className="medication-details">
                            <div className="detail-row">
                              <div className="detail-group">
                                <label>Dosage:</label>
                                <p>{medication.dosage || 'Not specified'}</p>
                              </div>
                              <div className="detail-group">
                                <label>Frequency:</label>
                                <p>{medication.frequency || 'Not specified'}</p>
                              </div>
                            </div>
                            <div className="detail-row">
                              <div className="detail-group">
                                <label>Duration:</label>
                                <p>{medication.duration || 'Not specified'}</p>
                              </div>
                              <div className="detail-group">
                                <label>Quantity:</label>
                                <p>{medication.quantity || 'Not specified'}</p>
                              </div>
                            </div>
                            <div className="detail-row">
                              <div className="detail-group wide">
                                <label>Instructions:</label>
                                <p>{medication.instructions || 'No special instructions'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No medications listed for this prescription.</p>
                  )}
                </div>
                {selectedPrescription.notes && (
                  <div className="detail-section">
                    <h4>Additional Notes</h4>
                    <p>{selectedPrescription.notes}</p>
                  </div>
                )}
                <div className="modal-actions">
                  {canRequestRefill(selectedPrescription) && (
                    <button 
                      onClick={() => {
                        setShowViewModal(false);
                        setShowRefillModal(true);
                      }} 
                      className="primary-btn"
                    >
                      <i className="fas fa-sync"></i> Request Refill
                    </button>
                  )}
                  <button onClick={() => setShowViewModal(false)} className="secondary-btn">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refill Request Modal */}
      {showRefillModal && selectedPrescription && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Request Prescription Refill</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowRefillModal(false);
                  setRefillReason('');
                }}
                disabled={isRequesting}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {requestSuccess ? (
                <div className="success-message">
                  <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>Refill Requested!</h3>
                  <p>Your refill request has been submitted successfully.</p>
                </div>
              ) : (
                <>
                  <div className="prescription-summary">
                    <h4>Prescription Summary</h4>
                    <p><strong>Medications:</strong></p>
                    <ul>
                      {selectedPrescription.medications.map((med, index) => (
                        <li key={index}>{med.medicationName} - {med.dosage}</li>
                      ))}
                    </ul>
                    <p><strong>Refills Remaining:</strong> {selectedPrescription.refillsRemaining}/{selectedPrescription.totalRefills}</p>
                  </div>
                  
                  <div className="form-group">
                    <label>Reason for Refill Request:</label>
                    <textarea
                      value={refillReason}
                      onChange={(e) => setRefillReason(e.target.value)}
                      rows="4"
                      placeholder="Please provide a reason for requesting a refill..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="modal-actions">
                    <button 
                      onClick={handleRefillRequest} 
                      className="primary-btn"
                      disabled={isRequesting || !refillReason.trim()}
                    >
                      {isRequesting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sync"></i> Submit Request
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        setShowRefillModal(false);
                        setRefillReason('');
                      }} 
                      className="secondary-btn"
                      disabled={isRequesting}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionView; 
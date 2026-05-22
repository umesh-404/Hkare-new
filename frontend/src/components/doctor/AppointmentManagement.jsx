import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const AppointmentManagement = ({ doctorId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Selected appointment for operations
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Form data for editing appointments
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (doctorId) {
      fetchAppointments(doctorId);
      fetchPatients();
    }
  }, [doctorId]);

  const fetchAppointments = async (doctorId) => {
    setLoading(true);
    try {
      // Fetch only appointments for this doctor
      const response = await api.get(`/api/appointments/doctor/${doctorId}`);
      setAppointments(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again later.');
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleOpenEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      status: appointment.status || 'SCHEDULED',
      notes: appointment.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    try {
      const updatedAppointment = {
        ...selectedAppointment,
        status: formData.status,
        notes: formData.notes
      };
      
      await api.put(`/api/appointments/${selectedAppointment.appointmentId}`, updatedAppointment);
      
      setAppointments(appointments.map(app => 
        app.appointmentId === selectedAppointment.appointmentId ? updatedAppointment : app
      ));
      
      setShowEditModal(false);
      alert('Appointment updated successfully!');
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert(err.response?.data?.message || 'Failed to update appointment. Please try again.');
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'N/A';
    }
  };

  const formatTimeOnly = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'N/A';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'status-scheduled';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'NO_SHOW':
        return 'status-no-show';
      default:
        return '';
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.patientId === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      // Filter by status
      if (statusFilter !== 'ALL' && appointment.status !== statusFilter) {
        return false;
      }
      
      // Filter by date
      if (dateFilter && appointment.appointmentDate) {
        if (appointment.appointmentDate !== dateFilter) {
          return false;
        }
      }
      
      // Filter by search term (patient name or ID)
      if (searchTerm) {
        const patientName = getPatientName(appointment.patientId).toLowerCase();
        const patientId = appointment.patientId?.toString() || '';
        
        return patientName.includes(searchTerm.toLowerCase()) || 
               patientId.includes(searchTerm);
      }
      
      return true;
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading appointments...</p>
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
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="NO_SHOW">No Show</option>
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
                  placeholder="Search by patient..."
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
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredAppointments().length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No appointments found</td>
              </tr>
            ) : (
              getFilteredAppointments().map(appointment => (
                <tr key={appointment.appointmentId}>
                  <td>{appointment.appointmentId}</td>
                  <td>{getPatientName(appointment.patientId)}</td>
                  <td>{appointment.appointmentDate || 'N/A'}</td>
                  <td>{formatTimeOnly(appointment.startTime)}</td>
                  <td>{appointment.reason || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view" 
                      onClick={() => handleViewAppointment(appointment)}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="action-btn edit" 
                      onClick={() => handleOpenEditModal(appointment)}
                      title="Update Status"
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
      
      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Appointment Details</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Appointment Information</h4>
                <div className="detail-row">
                  <div className="detail-group">
                    <label>Appointment ID:</label>
                    <p>{selectedAppointment.appointmentId}</p>
                  </div>
                  <div className="detail-group">
                    <label>Status:</label>
                    <span className={`status-badge ${getStatusClass(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group">
                    <label>Date:</label>
                    <p>{selectedAppointment.appointmentDate || 'N/A'}</p>
                  </div>
                  <div className="detail-group">
                    <label>Time:</label>
                    <p>{formatTimeOnly(selectedAppointment.startTime)}</p>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group wide">
                    <label>Reason for Visit:</label>
                    <p>{selectedAppointment.reason || 'No reason provided'}</p>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group wide">
                    <label>Notes:</label>
                    <p>{selectedAppointment.notes || 'No notes available'}</p>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Patient Information</h4>
                <div className="detail-row">
                  <div className="detail-group">
                    <label>Patient:</label>
                    <p>{getPatientName(selectedAppointment.patientId)}</p>
                  </div>
                  <div className="detail-group">
                    <label>Patient ID:</label>
                    <p>{selectedAppointment.patientId}</p>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button onClick={() => {
                  setShowViewModal(false);
                  handleOpenEditModal(selectedAppointment);
                }} className="primary-btn">
                  Edit Appointment
                </button>
                <button onClick={() => setShowViewModal(false)} className="secondary-btn">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Update Appointment Status</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateAppointment}>
                <div className="form-section">
                  <h4>Appointment Details</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Patient:</label>
                      <input 
                        type="text" 
                        value={getPatientName(selectedAppointment.patientId)} 
                        disabled 
                      />
                    </div>
                    <div className="form-group">
                      <label>Date & Time:</label>
                      <input 
                        type="text" 
                        value={`${selectedAppointment.appointmentDate || 'N/A'} ${selectedAppointment.startTime || ''}`} 
                        disabled 
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="status">Status:*</label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="NO_SHOW">No Show</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="notes">Notes:</label>
                    <textarea 
                      id="notes"
                      name="notes"
                      value={formData.notes}
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
                    Update Appointment
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

export default AppointmentManagement; 
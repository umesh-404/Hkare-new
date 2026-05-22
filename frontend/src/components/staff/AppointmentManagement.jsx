import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'GENERAL_CHECKUP',
    reasonForVisit: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/appointments');
      setAppointments(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again later.');
    } finally {
      setLoading(false);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/appointments', {
        ...formData,
        status: 'SCHEDULED'
      });
      setShowAddModal(false);
      fetchAppointments();
      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        appointmentType: 'GENERAL_CHECKUP',
        reasonForVisit: '',
        notes: ''
      });
    } catch (err) {
      console.error('Error adding appointment:', err);
      setError('Failed to add appointment. Please try again.');
    }
  };

  const handleEditAppointment = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/appointments/${currentAppointment.appointmentId}`, {
        ...formData,
        status: currentAppointment.status
      });
      setShowEditModal(false);
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment. Please try again.');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await api.delete(`/api/appointments/${appointmentId}`);
        fetchAppointments();
      } catch (err) {
        console.error('Error deleting appointment:', err);
        setError('Failed to delete appointment. Please try again.');
      }
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}/status`, {
        status: newStatus
      });
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status. Please try again.');
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

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      return timeString.substring(0, 5); // Format HH:mm
    } catch (error) {
      console.error('Error formatting time:', error);
      return "N/A";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'status-pending';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-rejected';
      case 'IN_PROGRESS':
        return 'status-active';
      case 'NO_SHOW':
        return 'status-expired';
      default:
        return '';
    }
  };

  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      // Filter by status
      if (statusFilter !== 'ALL' && appointment.status !== statusFilter) {
        return false;
      }
      
      // Filter by date
      if (dateFilter && appointment.appointmentDate) {
        const apptDate = new Date(appointment.appointmentDate).toISOString().split('T')[0];
        if (apptDate !== dateFilter) {
          return false;
        }
      }
      
      // Search term filter
      if (searchTerm) {
        const patient = patients.find(p => p.patientId === appointment.patientId);
        const doctor = doctors.find(d => d.doctorId === appointment.doctorId);
        const searchString = `${patient?.firstName} ${patient?.lastName} ${doctor?.firstName} ${doctor?.lastName} ${appointment.appointmentType}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      }
      
      return true;
    });
  };

  // Generate available time slots (9 AM to 5 PM with 30 min intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i < 17; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Calculate min date (today) and max date (3 months from now) for date picker
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
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
                  placeholder="Search appointments..."
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
          <i className="fas fa-plus"></i> Add Appointment
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
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredAppointments().length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No appointments found</td>
              </tr>
            ) : (
              getFilteredAppointments().map(appointment => {
                const patient = patients.find(p => p.patientId === appointment.patientId);
                const doctor = doctors.find(d => d.doctorId === appointment.doctorId);
                return (
                  <tr key={appointment.appointmentId}>
                    <td>{appointment.appointmentId}</td>
                    <td>{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</td>
                    <td>{doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor'}</td>
                    <td>{formatDate(appointment.appointmentDate)}</td>
                    <td>{formatTime(appointment.appointmentTime)}</td>
                    <td>{appointment.appointmentType}</td>
                    <td>
                      <select
                        className={`status-badge ${getStatusClass(appointment.status)}`}
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment.appointmentId, e.target.value)}
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="NO_SHOW">No Show</option>
                      </select>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view" 
                        onClick={() => {
                          setCurrentAppointment(appointment);
                          setShowEditModal(true);
                          setFormData({
                            patientId: appointment.patientId,
                            doctorId: appointment.doctorId,
                            appointmentDate: appointment.appointmentDate,
                            appointmentTime: appointment.appointmentTime,
                            appointmentType: appointment.appointmentType,
                            reasonForVisit: appointment.reasonForVisit,
                            notes: appointment.notes
                          });
                        }}
                        title="Edit Appointment"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDeleteAppointment(appointment.appointmentId)}
                        title="Delete Appointment"
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

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Add New Appointment</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddAppointment}>
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
                      <label>Date*</label>
                      <input
                        type="date"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleInputChange}
                        min={today}
                        max={maxDateStr}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Time*</label>
                      <select
                        name="appointmentTime"
                        value={formData.appointmentTime}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Appointment Type*</label>
                    <select
                      name="appointmentType"
                      value={formData.appointmentType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="GENERAL_CHECKUP">General Checkup</option>
                      <option value="FOLLOW_UP">Follow-up</option>
                      <option value="CONSULTATION">Consultation</option>
                      <option value="VACCINATION">Vaccination</option>
                      <option value="LAB_TEST">Lab Test</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Reason for Visit*</label>
                    <textarea
                      name="reasonForVisit"
                      value={formData.reasonForVisit}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      placeholder="Please describe the reason for this appointment..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Any additional notes..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <i className="fas fa-save"></i> Add Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && currentAppointment && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit Appointment</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditAppointment}>
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
                      <label>Date*</label>
                      <input
                        type="date"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleInputChange}
                        min={today}
                        max={maxDateStr}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Time*</label>
                      <select
                        name="appointmentTime"
                        value={formData.appointmentTime}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Appointment Type*</label>
                    <select
                      name="appointmentType"
                      value={formData.appointmentType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="GENERAL_CHECKUP">General Checkup</option>
                      <option value="FOLLOW_UP">Follow-up</option>
                      <option value="CONSULTATION">Consultation</option>
                      <option value="VACCINATION">Vaccination</option>
                      <option value="LAB_TEST">Lab Test</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Reason for Visit*</label>
                    <textarea
                      name="reasonForVisit"
                      value={formData.reasonForVisit}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      placeholder="Please describe the reason for this appointment..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Any additional notes..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <i className="fas fa-save"></i> Update Appointment
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
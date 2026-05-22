import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const AppointmentManagement = ({ patientId }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    patientId: patientId,
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'GENERAL_CHECKUP',
    reasonForVisit: '',
    notes: ''
  });
  
  // Cancel appointment state
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchAppointments(patientId);
      fetchDoctors();
    }
  }, [patientId]);

  const fetchAppointments = async (patientId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/appointments/patient/${patientId}`);
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

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setIsBooking(true);
    setError('');
    
    try {
      const appointmentData = {
        ...bookingForm,
        patientId: patientId,
        status: 'SCHEDULED'
      };
      
      const response = await api.post('/api/appointments', appointmentData);
      
      setAppointments(prev => [...prev, response.data]);
      setBookingSuccess(true);
      
      setTimeout(() => {
        setBookingSuccess(false);
        setShowBookModal(false);
        setBookingForm({
          patientId: patientId,
          doctorId: '',
          appointmentDate: '',
          appointmentTime: '',
          appointmentType: 'GENERAL_CHECKUP',
          reasonForVisit: '',
          notes: ''
        });
      }, 2000);
      
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    setIsCancelling(true);
    try {
      await api.put(`/api/appointments/${selectedAppointment.appointmentId}/status`, {
        status: 'CANCELLED',
        cancellationReason: cancelReason
      });
      
      setAppointments(appointments.map(apt => 
        apt.appointmentId === selectedAppointment.appointmentId 
          ? { ...apt, status: 'CANCELLED', cancellationReason: cancelReason } 
          : apt
      ));
      
      setShowCancelModal(false);
      setCancelReason('');
      alert('Appointment cancelled successfully.');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert(err.response?.data?.message || 'Failed to cancel appointment. Please try again.');
    } finally {
      setIsCancelling(false);
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

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
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

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.doctorId === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor';
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
      
      // Filter by search term
      if (searchTerm) {
        const doctorName = getDoctorName(appointment.doctorId).toLowerCase();
        const apptType = appointment.appointmentType?.toLowerCase() || '';
        
        return doctorName.includes(searchTerm.toLowerCase()) || 
               apptType.includes(searchTerm.toLowerCase());
      }
      
      return true;
    });
  };

  const canCancelAppointment = (appointment) => {
    if (appointment.status !== 'SCHEDULED') return false;
    
    const now = new Date();
    const apptDateTime = new Date(appointment.appointmentDate);
    if (appointment.appointmentTime) {
      const [hours, minutes] = appointment.appointmentTime.split(':');
      apptDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    const hoursDifference = (apptDateTime - now) / (1000 * 60 * 60);
    return hoursDifference >= 24;
  };

  // Calculate min date (today) and max date (3 months from now) for date picker
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

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
                  placeholder="Search by doctor, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <i className="fas fa-search search-icon"></i>
              </div>
            </div>
          </div>
        </div>
        <button className="add-btn" onClick={() => setShowBookModal(true)}>
          <i className="fas fa-plus"></i> Book New Appointment
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Time</th>
              <th>Doctor</th>
              <th>Type</th>
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
                  <td>{formatDate(appointment.appointmentDate)}</td>
                  <td>{formatTime(appointment.appointmentTime)}</td>
                  <td>{getDoctorName(appointment.doctorId)}</td>
                  <td>{appointment.appointmentType || 'General'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view" 
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowViewModal(true);
                      }}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    {canCancelAppointment(appointment) && (
                      <button 
                        className="action-btn delete" 
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowCancelModal(true);
                        }}
                        title="Cancel Appointment"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
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
              <div className="appointment-details">
                <div className="detail-section">
                  <h4>Basic Information</h4>
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
                      <p>{formatDate(selectedAppointment.appointmentDate)}</p>
                    </div>
                    <div className="detail-group">
                      <label>Time:</label>
                      <p>{formatTime(selectedAppointment.appointmentTime)}</p>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-group">
                      <label>Doctor:</label>
                      <p>{getDoctorName(selectedAppointment.doctorId)}</p>
                    </div>
                    <div className="detail-group">
                      <label>Type:</label>
                      <p>{selectedAppointment.appointmentType || 'General'}</p>
                    </div>
                  </div>
                </div>
                <div className="detail-section">
                  <h4>Additional Information</h4>
                  <div className="detail-row">
                    <div className="detail-group wide">
                      <label>Reason for Visit:</label>
                      <p>{selectedAppointment.reasonForVisit || 'Not specified'}</p>
                    </div>
                  </div>
                  {selectedAppointment.status === 'CANCELLED' && (
                    <div className="detail-row">
                      <div className="detail-group wide">
                        <label>Cancellation Reason:</label>
                        <p>{selectedAppointment.cancellationReason || 'Not specified'}</p>
                      </div>
                    </div>
                  )}
                  {selectedAppointment.notes && (
                    <div className="detail-row">
                      <div className="detail-group wide">
                        <label>Notes:</label>
                        <p>{selectedAppointment.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  {canCancelAppointment(selectedAppointment) && (
                    <button 
                      onClick={() => {
                        setShowViewModal(false);
                        setShowCancelModal(true);
                      }} 
                      className="danger-btn"
                    >
                      <i className="fas fa-times"></i> Cancel Appointment
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

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Book New Appointment</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowBookModal(false)}
                disabled={isBooking}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {bookingSuccess ? (
              <div className="modal-body success-message">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3>Appointment Booked!</h3>
                <p>Your appointment has been scheduled successfully.</p>
              </div>
            ) : (
              <div className="modal-body">
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleBookAppointment}>
                  <div className="form-section">
                    <h4>Appointment Details</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Doctor*</label>
                        <select
                          name="doctorId"
                          value={bookingForm.doctorId}
                          onChange={handleBookingInputChange}
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
                      
                      <div className="form-group">
                        <label>Appointment Type*</label>
                        <select
                          name="appointmentType"
                          value={bookingForm.appointmentType}
                          onChange={handleBookingInputChange}
                          required
                        >
                          <option value="GENERAL_CHECKUP">General Checkup</option>
                          <option value="FOLLOW_UP">Follow-up</option>
                          <option value="CONSULTATION">Consultation</option>
                          <option value="VACCINATION">Vaccination</option>
                          <option value="LAB_TEST">Lab Test</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Date*</label>
                        <input
                          type="date"
                          name="appointmentDate"
                          value={bookingForm.appointmentDate}
                          onChange={handleBookingInputChange}
                          min={today}
                          max={maxDateStr}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Time*</label>
                        <select
                          name="appointmentTime"
                          value={bookingForm.appointmentTime}
                          onChange={handleBookingInputChange}
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
                      <label>Reason for Visit*</label>
                      <textarea
                        name="reasonForVisit"
                        value={bookingForm.reasonForVisit}
                        onChange={handleBookingInputChange}
                        required
                        rows="3"
                        placeholder="Please describe briefly why you're making this appointment..."
                      ></textarea>
                    </div>
                    
                    <div className="form-group">
                      <label>Additional Notes</label>
                      <textarea
                        name="notes"
                        value={bookingForm.notes}
                        onChange={handleBookingInputChange}
                        rows="2"
                        placeholder="Any additional information for the doctor or staff..."
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <p className="info-text">
                      <i className="fas fa-info-circle"></i>
                      Please note that all appointments are subject to confirmation by the hospital staff.
                    </p>
                  </div>
                  
                  <div className="modal-actions">
                    <button 
                      type="button"
                      onClick={() => setShowBookModal(false)} 
                      className="secondary-btn"
                      disabled={isBooking}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="primary-btn"
                      disabled={isBooking}
                    >
                      {isBooking ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Booking...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-calendar-check"></i>
                          Book Appointment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Cancel Appointment</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                disabled={isCancelling}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this appointment?</p>
              <div className="form-group">
                <label>Reason for Cancellation:</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows="4"
                  placeholder="Please provide a reason for cancelling this appointment..."
                  required
                ></textarea>
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={handleCancelAppointment} 
                  className="danger-btn"
                  disabled={isCancelling || !cancelReason.trim()}
                >
                  {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
                </button>
                <button 
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }} 
                  className="secondary-btn"
                  disabled={isCancelling}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement; 
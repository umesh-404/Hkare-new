import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const AppointmentManagement = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    
    // Form data for adding/editing appointments
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        status: 'SCHEDULED',
        reason: '',
        notes: '',
        appointmentFee: '',
        isPaid: false
    });
    
    // Selected appointment for view/edit/delete operations
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    
    // Filter states
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');

    // Add these new state variables within the AppointmentManagement component
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [doctorSearchTerm, setDoctorSearchTerm] = useState('');

    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
        fetchPatients();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/appointments');
            if (response.data) {
                setAppointments(response.data);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Failed to load appointments. Please try again later.');
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await api.get('/api/doctors');
            
            if (response.data) {
                setDoctors(response.data);
            }
        } catch (err) {
            console.error('Error fetching doctors:', err);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get('/api/patients');
            
            if (response.data) {
                setPatients(response.data);
            }
        } catch (err) {
            console.error('Error fetching patients:', err);
            // Don't set error state here to avoid UI disruption in payment management
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleOpenAddModal = () => {
        // Reset form data
        setFormData({
            patientId: '',
            doctorId: '',
            appointmentDate: '',
            appointmentTime: '',
            status: 'SCHEDULED',
            reason: '',
            notes: '',
            appointmentFee: '',
            isPaid: false
        });
        // Reset search terms
        setPatientSearchTerm('');
        setDoctorSearchTerm('');
        setShowAddModal(true);
    };

    const handleOpenEditModal = (appointment) => {
        setSelectedAppointment(appointment);
        
        // Parse dates properly
        let date = '';
        let time = '';
        
        try {
            if (appointment.appointmentDate) {
                date = appointment.appointmentDate;
            }
            
            if (appointment.startTime) {
                time = appointment.startTime;
            }
        } catch (error) {
            console.error("Date parsing error:", error);
        }
        
        setFormData({
            patientId: appointment.patientId || '',
            doctorId: appointment.doctorId || '',
            appointmentDate: date,
            appointmentTime: time,
            status: appointment.status || 'SCHEDULED',
            reason: appointment.reason || '',
            notes: appointment.notes || '',
            appointmentFee: appointment.appointmentFee ? appointment.appointmentFee.toString() : '',
            isPaid: appointment.isPaid || false
        });
        setShowEditModal(true);
    };

    const handleViewAppointment = (appointment) => {
        setSelectedAppointment(appointment);
        setShowViewModal(true);
    };

    const handleAddAppointment = async (e) => {
        e.preventDefault();
        try {
            // Format date and time to correct string formats
            let formattedDate = formData.appointmentDate;
            let formattedTime = formData.appointmentTime;
            // If date is a Date object, convert to yyyy-MM-dd
            if (formattedDate instanceof Date) {
                formattedDate = formattedDate.toISOString().split('T')[0];
            }
            // If time is a Date object, convert to HH:mm
            if (formattedTime instanceof Date) {
                formattedTime = formattedTime.toTimeString().slice(0,5);
            }
            const appointmentData = {
                ...formData,
                appointmentDate: formattedDate,
                startTime: formattedTime,
                endTime: formattedTime // For simplicity, setting end time same as start time
            };
            const response = await api.post('/api/appointments', appointmentData);
            if (response.status === 201 || response.status === 200) {
                setShowAddModal(false);
                fetchAppointments();
                alert('Appointment added successfully!');
            }
        } catch (err) {
            console.error('Error adding appointment:', err);
            alert(err.response?.data?.message || 'Failed to add appointment. Please try again.');
        }
    };

    const handleUpdateAppointment = async (e) => {
        e.preventDefault();
        if (!selectedAppointment) return;
        try {
            // Format date and time to correct string formats
            let formattedDate = formData.appointmentDate;
            let formattedTime = formData.appointmentTime;
            // If date is a Date object, convert to yyyy-MM-dd
            if (formattedDate instanceof Date) {
                formattedDate = formattedDate.toISOString().split('T')[0];
            }
            // If time is a Date object, convert to HH:mm
            if (formattedTime instanceof Date) {
                formattedTime = formattedTime.toTimeString().slice(0,5);
            }
            const appointmentData = {
                ...formData,
                appointmentDate: formattedDate,
                startTime: formattedTime,
                endTime: formattedTime // For simplicity, setting end time same as start time
            };
            const response = await api.put(`/api/appointments/${selectedAppointment.appointmentId}`, appointmentData);
            if (response.status === 200) {
                setShowEditModal(false);
                fetchAppointments();
                alert('Appointment updated successfully!');
            }
        } catch (err) {
            console.error('Error updating appointment:', err);
            alert(err.response?.data?.message || 'Failed to update appointment. Please try again.');
        }
    };

    const handleDeleteAppointment = async (id) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                const response = await api.delete(`/api/appointments/${id}`);
                
                if (response.status === 200 || response.status === 204) {
                    alert('Appointment cancelled successfully!');
                    fetchAppointments();
                }
            } catch (err) {
                console.error('Error cancelling appointment:', err);
                alert('Failed to cancel appointment. Please try again.');
            }
        }
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) {
            return { date: 'Not set', time: 'Not set' };
        }
        try {
            const dateTime = new Date(dateTimeStr);
            if (isNaN(dateTime.getTime())) {
                return { date: 'Invalid Date', time: 'Invalid Time' };
            }
            return {
                date: dateTime.toLocaleDateString(),
                time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        } catch (error) {
            console.error('Error formatting date/time:', error);
            return { date: 'Invalid Date', time: 'Invalid Time' };
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
            
            return true;
        });
    };
    
    // If data is still loading, show a loading spinner
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading appointments...</p>
            </div>
        );
    }

    // Add these helper functions to filter patients and doctors
    const getFilteredPatients = () => {
        if (!patientSearchTerm) return patients;
        
        return patients.filter(patient => 
            patient.patientId.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
            `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(patientSearchTerm.toLowerCase())
        );
    };

    const getFilteredDoctors = () => {
        if (!doctorSearchTerm) return doctors;
        
        return doctors.filter(doctor => 
            doctor.doctorId.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
            `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(doctorSearchTerm.toLowerCase())
        );
    };

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
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="CANCELLED">Cancelled</option>
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
                    </div>
                </div>
                <button className="add-btn" onClick={handleOpenAddModal}>
                    <i className="fas fa-plus"></i>
                    New Appointment
                </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Reason</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getFilteredAppointments().length > 0 ? (
                            getFilteredAppointments().map(appointment => {
                                let date = 'Not set';
                                let time = 'Not set';
                                
                                // Format date correctly if it exists
                                if (appointment.appointmentDate) {
                                    try {
                                        const dateObj = new Date(appointment.appointmentDate);
                                        if (!isNaN(dateObj.getTime())) {
                                            date = dateObj.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            });
                                        } else {
                                            date = appointment.appointmentDate;
                                        }
                                    } catch (err) {
                                        date = appointment.appointmentDate;
                                    }
                                }
                                
                                // Format time correctly if it exists
                                if (appointment.startTime) {
                                    try {
                                        // If it's just a time string like "13:45"
                                        if (appointment.startTime.includes(':')) {
                                            time = appointment.startTime;
                                        } else {
                                            // If it's a full datetime string
                                            const timeObj = new Date(`2000-01-01T${appointment.startTime}`);
                                            if (!isNaN(timeObj.getTime())) {
                                                time = timeObj.toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                });
                                            } else {
                                                time = appointment.startTime;
                                            }
                                        }
                                    } catch (err) {
                                        time = appointment.startTime;
                                    }
                                }
                                
                                return (
                                    <tr key={appointment.appointmentId}>
                                        <td>{appointment.appointmentId}</td>
                                        <td>{appointment.patientName || 'Unknown Patient'}</td>
                                        <td>{appointment.doctorName || 'Unknown Doctor'}</td>
                                        <td>{date}</td>
                                        <td>{time}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                                                {appointment.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td>{appointment.reason || ''}</td>
                                        <td className="actions-cell">
                                            <button 
                                                className="action-btn view" 
                                                onClick={() => handleViewAppointment(appointment)}
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button 
                                                className="action-btn edit" 
                                                onClick={() => handleOpenEditModal(appointment)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                className="action-btn delete" 
                                                onClick={() => handleDeleteAppointment(appointment.appointmentId)}
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="no-data">No appointments found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Add Appointment Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Schedule New Appointment</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddAppointment}>
                                <div className="form-section">
                                    <div className="form-group">
                                        <label htmlFor="patientSearch">Patient* (ID or Name)</label>
                                        <div className="searchable-dropdown">
                                            <div className="search-input-container">
                                                <input
                                                    type="text"
                                                    id="patientSearch"
                                                    placeholder="Search by patient ID or name..."
                                                    value={patientSearchTerm}
                                                    onChange={(e) => setPatientSearchTerm(e.target.value)}
                                                    className="search-input"
                                                />
                                                <i className="fas fa-search search-icon"></i>
                                            </div>
                                            <select
                                                id="patientId"
                                                name="patientId"
                                                value={formData.patientId}
                                                onChange={handleInputChange}
                                                required
                                                className="dropdown-select"
                                            >
                                                <option value="">Select Patient</option>
                                                {getFilteredPatients().map(patient => (
                                                    <option key={patient.patientId} value={patient.patientId}>
                                                        {patient.patientId} - {patient.firstName} {patient.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="doctorSearch">Doctor* (ID or Name)</label>
                                        <div className="searchable-dropdown">
                                            <div className="search-input-container">
                                                <input
                                                    type="text"
                                                    id="doctorSearch"
                                                    placeholder="Search by doctor ID or name..."
                                                    value={doctorSearchTerm}
                                                    onChange={(e) => setDoctorSearchTerm(e.target.value)}
                                                    className="search-input"
                                                />
                                                <i className="fas fa-search search-icon"></i>
                                            </div>
                                            <select
                                                id="doctorId"
                                                name="doctorId"
                                                value={formData.doctorId}
                                                onChange={handleInputChange}
                                                required
                                                className="dropdown-select"
                                            >
                                                <option value="">Select Doctor</option>
                                                {getFilteredDoctors().map(doctor => (
                                                    <option key={doctor.doctorId} value={doctor.doctorId}>
                                                        {doctor.doctorId} - Dr. {doctor.firstName} {doctor.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="appointmentDate">Date*</label>
                                            <input
                                                type="date"
                                                id="appointmentDate"
                                                name="appointmentDate"
                                                value={formData.appointmentDate}
                                                onChange={handleInputChange}
                                                required
                                                className="date-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="appointmentTime">Time*</label>
                                            <input
                                                type="time"
                                                id="appointmentTime"
                                                name="appointmentTime"
                                                value={formData.appointmentTime}
                                                onChange={handleInputChange}
                                                required
                                                className="time-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="status">Status*</label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            required
                                            className="status-select"
                                        >
                                            <option value="SCHEDULED">Scheduled</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="CANCELLED">Cancelled</option>
                                            <option value="NO_SHOW">No Show</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="reason">Reason*</label>
                                        <input 
                                            type="text" 
                                            id="reason"
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleInputChange} 
                                            required
                                            className="text-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="notes">Notes</label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="textarea-input"
                                        ></textarea>
                                </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="appointmentFee">Fee ($)</label>
                                            <input
                                                type="number"
                                                id="appointmentFee"
                                                name="appointmentFee"
                                                value={formData.appointmentFee || ''}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                                className="number-input"
                                            />
                                        </div>
                                        <div className="form-group checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="isPaid"
                                                    checked={formData.isPaid || false}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        isPaid: e.target.checked
                                                    })}
                                                    className="checkbox-input"
                                                />
                                                <span>Paid</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">
                                        Schedule Appointment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Appointment Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Edit Appointment</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleUpdateAppointment}>
                                <div className="form-section">
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
                                        <label htmlFor="doctorId">Doctor*</label>
                                        <select
                                            id="doctorId"
                                            name="doctorId"
                                            value={formData.doctorId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Doctor</option>
                                            {doctors.map(doctor => (
                                                <option key={doctor.doctorId} value={doctor.doctorId}>
                                                    Dr. {doctor.firstName} {doctor.lastName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="appointmentDate">Date*</label>
                                        <input
                                            type="date"
                                            id="appointmentDate"
                                            name="appointmentDate"
                                            value={formData.appointmentDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="appointmentTime">Time*</label>
                                        <input
                                            type="time"
                                            id="appointmentTime"
                                            name="appointmentTime"
                                            value={formData.appointmentTime}
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
                                            <option value="COMPLETED">Completed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="reason">Reason*</label>
                                        <input
                                            type="text"
                                            id="reason"
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleInputChange}
                                            required
                                        />
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
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setShowEditModal(false)}
                                    >
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
            
            {/* View Appointment Modal */}
            {showViewModal && selectedAppointment && (
                <div className="modal-overlay">
                    <div className="modal-container view-appointment-modal">
                        <div className="modal-header">
                            <h3>Appointment Details</h3>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="appointment-details">
                                <div className="appointment-id-section">
                                    <span className="appointment-id">Appointment ID: {selectedAppointment.appointmentId}</span>
                                    <span className={`status-badge large ${getStatusClass(selectedAppointment.status)}`}>
                                        {selectedAppointment.status || 'Not set'}
                                    </span>
                                </div>

                                <div className="detail-section">
                                    <h4 className="section-title"><i className="fas fa-calendar-alt"></i> Appointment Information</h4>
                                    <div className="detail-content">
                                        <div className="detail-row">
                                            <span className="detail-label">Date:</span>
                                            <span className="detail-value">
                                                {formatDateTime(selectedAppointment.appointmentDate).date || 'Not set'}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Time:</span>
                                            <span className="detail-value">
                                                {formatDateTime(selectedAppointment.startTime).time || 'Not set'}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Reason:</span>
                                            <span className="detail-value">{selectedAppointment.reason || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Notes:</span>
                                            <span className="detail-value">{selectedAppointment.notes || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Fee:</span>
                                            <span className="detail-value">{selectedAppointment.appointmentFee ? `$${selectedAppointment.appointmentFee}` : 'Not set'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Payment Status:</span>
                                            <span className="detail-value">
                                                <span className={`payment-badge ${selectedAppointment.isPaid ? 'paid' : 'unpaid'}`}>
                                                    {selectedAppointment.isPaid ? 'Paid' : 'Unpaid'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h4 className="section-title"><i className="fas fa-user-injured"></i> Patient Information</h4>
                                    <div className="detail-content">
                                        <div className="detail-row">
                                            <span className="detail-label">Patient ID:</span>
                                            <span className="detail-value">{selectedAppointment.patientId || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Name:</span>
                                            <span className="detail-value">{selectedAppointment.patientName || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Email:</span>
                                            <span className="detail-value">{selectedAppointment.patientEmail || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Phone:</span>
                                            <span className="detail-value">{selectedAppointment.patientPhone || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h4 className="section-title"><i className="fas fa-user-md"></i> Doctor Information</h4>
                                    <div className="detail-content">
                                        <div className="detail-row">
                                            <span className="detail-label">Doctor ID:</span>
                                            <span className="detail-value">{selectedAppointment.doctorId || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Name:</span>
                                            <span className="detail-value">{selectedAppointment.doctorName || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Specialization:</span>
                                            <span className="detail-value">{selectedAppointment.doctorSpecialization || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button 
                                    className="edit-appointment-btn"
                                    onClick={() => {
                                        setShowViewModal(false);
                                        handleOpenEditModal(selectedAppointment);
                                    }}
                                >
                                    <i className="fas fa-edit"></i> Edit Appointment
                                </button>
                                <button 
                                    className="close-button"
                                    onClick={() => setShowViewModal(false)}
                                >
                                    <i className="fas fa-times"></i> Close
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
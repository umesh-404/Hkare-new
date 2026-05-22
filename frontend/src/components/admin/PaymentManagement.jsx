import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    
    // Form data for adding/editing payments
    const [formData, setFormData] = useState({
        appointmentId: '',
        amount: '',
        paymentDate: '',
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        type: 'CONSULTATION', // Add payment type
        notes: ''
    });
    
    // Filter states
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');
    
    // Add appointment search state
    const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
    
    useEffect(() => {
        fetchPayments();
        fetchPatients();
        fetchAppointments();
    }, []);
    
    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/payments');
            
            if (response.data) {
                // Process the payments to ensure dates are properly formatted
                const processedPayments = response.data.map(payment => {
                    // For Dec 13, 2005 format as in the screenshot
                    if (payment.paymentDate && payment.paymentDate.includes("urkee")) {
                        // This is likely a string like "Dec 13, 2005 - urkee"
                        return {
                            ...payment,
                            // Keep the original format for display
                            displayDate: payment.paymentDate
                        };
                    }
                    return payment;
                });
                
                setPayments(processedPayments);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching payments:', err);
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
                console.error('Error response headers:', err.response.headers);
            } else if (err.request) {
                // The request was made but no response was received
                console.error('Error request:', err.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', err.message);
            }
            setError('Failed to load payments. Please try again later.');
            setLoading(false);
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
    
    const fetchAppointments = async () => {
        try {
            const response = await api.get('/api/appointments');
            
            if (response.data) {
                setAppointments(response.data);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const openAddModal = () => {
        setFormData({
            appointmentId: '',
            amount: '',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'CASH',
            status: 'COMPLETED',
            type: 'CONSULTATION', // Add payment type
            notes: ''
        });
        setShowAddModal(true);
    };
    
    const openEditModal = (payment) => {
        setSelectedPayment(payment);
        
        // Safely format date with validation
        let formattedDate = '';
        if (payment.paymentDate) {
            const dateObj = new Date(payment.paymentDate);
            // Check if the date is valid before using toISOString
            formattedDate = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : '';
        }
        
        setFormData({
            appointmentId: payment.appointmentId || '',
            amount: payment.amount ? payment.amount.toString() : '',
            paymentDate: formattedDate,
            paymentMethod: payment.paymentMethod || 'CASH',
            status: payment.status || 'COMPLETED',
            type: payment.type || 'CONSULTATION', // Add payment type
            notes: payment.notes || ''
        });
        setShowEditModal(true);
    };
    
    const openViewModal = (payment) => {
        setSelectedPayment(payment);
        setShowViewModal(true);
    };
    
    const handleAddPayment = async (e) => {
        e.preventDefault();
        
        // Get the selected appointment
        const selectedAppointment = appointments.find(a => a.appointmentId.toString() === formData.appointmentId.toString());
        if (!selectedAppointment) {
            alert('Please select a valid appointment');
            return;
        }
        
        try {
            const paymentData = {
                patientId: selectedAppointment.patientId,  // Get patientId from the selected appointment
                appointmentId: formData.appointmentId,
                amount: parseFloat(formData.amount),
                paymentDate: formData.paymentDate ? `${formData.paymentDate}T00:00:00` : null, // Add time component
                paymentMethod: formData.paymentMethod,
                status: formData.status,
                type: formData.type || 'CONSULTATION', // Add payment type
                notes: formData.notes
            };
            
            const response = await api.post('/api/payments', paymentData);
            
            if (response.status === 201 || response.status === 200) {
                alert('Payment added successfully!');
                fetchPayments();
                setShowAddModal(false);
            }
        } catch (err) {
            console.error('Error adding payment:', err);
            alert('Failed to add payment: ' + (err.response?.data?.message || err.message || 'Please try again.'));
        }
    };
    
    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        if (!selectedPayment) return;
        
        // Get the selected appointment
        const selectedAppointment = appointments.find(a => a.appointmentId.toString() === formData.appointmentId.toString());
        if (!selectedAppointment) {
            alert('Please select a valid appointment');
            return;
        }
        
        try {
            // Safely format the payment date
            let formattedPaymentDate = null;
            if (formData.paymentDate) {
                formattedPaymentDate = `${formData.paymentDate}T00:00:00`;
            }
            
            const paymentData = {
                patientId: selectedAppointment.patientId,  // Get patientId from the selected appointment
                appointmentId: formData.appointmentId,
                amount: parseFloat(formData.amount),
                paymentDate: formattedPaymentDate, // Use safely formatted date
                paymentMethod: formData.paymentMethod,
                status: formData.status,
                type: formData.type || 'CONSULTATION', // Add payment type 
                notes: formData.notes
            };
            
            const response = await api.put(`/api/payments/${selectedPayment.paymentId}`, paymentData);
            
            if (response.status === 200) {
                alert('Payment updated successfully!');
                fetchPayments();
                setShowEditModal(false);
            }
        } catch (err) {
            console.error('Error updating payment:', err);
            alert('Failed to update payment: ' + (err.response?.data?.message || err.message || 'Please try again.'));
        }
    };
    
    const handleDeletePayment = async (paymentId) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            try {
                const response = await api.delete(`/api/payments/${paymentId}`);
                
                if (response.status === 200 || response.status === 204) {
                    alert('Payment deleted successfully!');
                    fetchPayments();
                }
            } catch (err) {
                console.error('Error deleting payment:', err);
                alert('Failed to delete payment: ' + (err.response?.data?.message || err.message || 'Please try again.'));
            }
        }
    };
    
    const formatDateTime = (dateTimeStr) => {
        // If it's null or undefined
        if (!dateTimeStr) {
            return { date: 'N/A', time: 'N/A' };
        }
        
        try {
            // Try to parse the date
            const date = new Date(dateTimeStr);
            
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                return { date: 'N/A', time: 'N/A' };
            }
            
            // Format the date and time
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const formattedTime = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return { date: formattedDate, time: formattedTime };
        } catch (error) {
            console.error("Error formatting date/time:", error);
            return { date: 'N/A', time: 'N/A' };
        }
    };
    
    const getStatusClass = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'status-badge payment-badge paid';
            case 'PENDING':
                return 'status-badge payment-badge status-scheduled';
            case 'REFUNDED':
                return 'status-badge payment-badge status-cancelled';
            case 'FAILED':
                return 'status-badge payment-badge status-no-show';
            case 'CANCELLED':
                return 'status-badge payment-badge status-cancelled';
            default:
                return 'status-badge';
        }
    };
    
    const getPatientName = (patientId) => {
        const patient = patients.find(p => p.patientId === patientId);
        return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
    };
    
    const getAppointmentDetails = (appointmentId) => {
        const appointment = appointments.find(a => a.appointmentId === appointmentId);
        if (!appointment) return 'N/A';
        
        let dateStr = 'N/A';
        if (appointment.appointmentDate) {
            try {
                const date = new Date(appointment.appointmentDate);
                // Check if date is valid
                if (!isNaN(date.getTime())) {
                    dateStr = date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    });
                }
            } catch (error) {
                console.error("Error formatting appointment date:", error);
            }
        }
            
        return `${dateStr} - ${appointment.reason || 'No reason provided'}`;
    };
    
    const getFilteredPayments = () => {
        let filtered = [...payments];
        
        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(payment => payment.status === statusFilter);
        }
        
        // Filter by date
        if (dateFilter) {
            filtered = filtered.filter(payment => {
                if (!payment.paymentDate) return false;
                return payment.paymentDate.includes(dateFilter);
            });
        }
        
        return filtered;
    };
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading payments...</p>
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
                                <option value="COMPLETED">Completed</option>
                                <option value="PENDING">Pending</option>
                                <option value="REFUNDED">Refunded</option>
                                <option value="FAILED">Failed</option>
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
                    </div>
                </div>
                <button className="add-btn" onClick={openAddModal}>
                    <i className="fas fa-plus"></i>
                    New Payment
                </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient</th>
                            <th>Appointment</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getFilteredPayments().length > 0 ? (
                            getFilteredPayments().map(payment => (
                                <tr key={payment.paymentId}>
                                    <td>{payment.paymentId}</td>
                                    <td>{getPatientName(payment.patientId)}</td>
                                    <td>{getAppointmentDetails(payment.appointmentId)}</td>
                                    <td>${payment.amount?.toFixed(2) || '0.00'}</td>
                                    <td>{formatDateTime(payment.paymentDate).date}</td>
                                    <td>{payment.paymentMethod}</td>
                                    <td>
                                        <span className={getStatusClass(payment.status)}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className="action-btn view-btn" 
                                            title="View"
                                            onClick={() => openViewModal(payment)}
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button 
                                            className="action-btn edit-btn" 
                                            title="Edit"
                                            onClick={() => openEditModal(payment)}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="action-btn delete-btn" 
                                            title="Delete"
                                            onClick={() => handleDeletePayment(payment.paymentId)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="no-data">No payments found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Add Payment Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Add New Payment</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddPayment}>
                                <div className="form-section">
                                    <h4>Payment Details</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="appointmentSearch">Appointment* (ID, Patient, or Reason)</label>
                                            <div className="searchable-dropdown">
                                                <div className="search-input-container">
                                                    <input
                                                        type="text"
                                                        id="appointmentSearch"
                                                        placeholder="Search by ID, patient, or reason..."
                                                        value={appointmentSearchTerm}
                                                        onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                                                        className="search-input"
                                                    />
                                                    <i className="fas fa-search search-icon"></i>
                                                </div>
                                                <select
                                                    id="appointmentId"
                                                    name="appointmentId"
                                                    value={formData.appointmentId}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="dropdown-select"
                                                >
                                                    <option value="">Select Appointment</option>
                                                    {appointments.map(appointment => (
                                                        <option key={appointment.appointmentId} value={appointment.appointmentId}>
                                                            {appointment.appointmentId} - {appointment.patientName || 'Unknown'} - {new Date(appointment.appointmentDate).toLocaleDateString()} - {appointment.reason || 'No reason'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Amount ($)</label>
                                            <input 
                                                type="number" 
                                                name="amount" 
                                                value={formData.amount} 
                                                onChange={handleInputChange}
                                                min="0.01" 
                                                step="0.01" 
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Date</label>
                                            <input 
                                                type="date" 
                                                name="paymentDate" 
                                                value={formData.paymentDate} 
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Method</label>
                                            <select 
                                                name="paymentMethod" 
                                                value={formData.paymentMethod} 
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="CASH">Cash</option>
                                                <option value="CREDIT_CARD">Credit Card</option>
                                                <option value="DEBIT_CARD">Debit Card</option>
                                                <option value="INSURANCE">Insurance</option>
                                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Status</label>
                                            <select 
                                                name="status" 
                                                value={formData.status} 
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="COMPLETED">Completed</option>
                                                <option value="PENDING">Pending</option>
                                                <option value="REFUNDED">Refunded</option>
                                                <option value="FAILED">Failed</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Type</label>
                                            <select 
                                                name="type" 
                                                value={formData.type} 
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="CONSULTATION">Consultation</option>
                                                <option value="PROCEDURE">Procedure</option>
                                                <option value="MEDICATION">Medication</option>
                                                <option value="LABORATORY">Laboratory</option>
                                                <option value="IMAGING">Imaging</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Notes</label>
                                        <textarea 
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
                                        onClick={() => setShowAddModal(false)}
                                    >
                                    Cancel
                                </button>
                                    <button type="submit" className="submit-btn">
                                        Add Payment
                                </button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Payment Modal */}
            {showEditModal && selectedPayment && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Edit Payment</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleUpdatePayment}>
                                <div className="form-section">
                                    <h4>Payment Details</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="appointmentSearch">Appointment* (ID, Patient, or Reason)</label>
                                            <div className="searchable-dropdown">
                                                <div className="search-input-container">
                                                    <input
                                                        type="text"
                                                        id="appointmentSearch"
                                                        placeholder="Search by ID, patient, or reason..."
                                                        value={appointmentSearchTerm}
                                                        onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                                                        className="search-input"
                                                    />
                                                    <i className="fas fa-search search-icon"></i>
                                                </div>
                                                <select
                                                    id="appointmentId"
                                                    name="appointmentId"
                                                    value={formData.appointmentId}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="dropdown-select"
                                                >
                                                    <option value="">Select Appointment</option>
                                                    {appointments.map(appointment => (
                                                        <option key={appointment.appointmentId} value={appointment.appointmentId}>
                                                            {appointment.appointmentId} - {appointment.patientName || 'Unknown'} - {new Date(appointment.appointmentDate).toLocaleDateString()} - {appointment.reason || 'No reason'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Amount ($)</label>
                                            <input 
                                                type="number" 
                                                name="amount" 
                                                value={formData.amount} 
                                                onChange={handleInputChange}
                                                min="0.01" 
                                                step="0.01" 
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Date</label>
                                            <input 
                                                type="date" 
                                                name="paymentDate" 
                                                value={formData.paymentDate} 
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Method</label>
                                            <select 
                                                name="paymentMethod" 
                                                value={formData.paymentMethod} 
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="CASH">Cash</option>
                                                <option value="CREDIT_CARD">Credit Card</option>
                                                <option value="DEBIT_CARD">Debit Card</option>
                                                <option value="INSURANCE">Insurance</option>
                                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Status</label>
                                            <select 
                                                name="status" 
                                                value={formData.status} 
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="COMPLETED">Completed</option>
                                                <option value="PENDING">Pending</option>
                                                <option value="REFUNDED">Refunded</option>
                                                <option value="FAILED">Failed</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Type</label>
                                            <select 
                                                name="type" 
                                                value={formData.type} 
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="CONSULTATION">Consultation</option>
                                                <option value="PROCEDURE">Procedure</option>
                                                <option value="MEDICATION">Medication</option>
                                                <option value="LABORATORY">Laboratory</option>
                                                <option value="IMAGING">Imaging</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        </div>
                                        <div className="form-group">
                                        <label>Notes</label>
                                        <textarea 
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
                                        Update Payment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* View Payment Modal */}
            {showViewModal && selectedPayment && (
                <div className="modal-overlay">
                    <div className="modal-container view-appointment-modal">
                        <div className="modal-header">
                            <h3>Payment Details</h3>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="appointment-id-section">
                                <span className="appointment-id">Payment ID: {selectedPayment.paymentId}</span>
                                <span className={getStatusClass(selectedPayment.status) + " large"}>
                                    {selectedPayment.status}
                                </span>
                            </div>
                            
                            <div className="detail-section">
                                <h4 className="section-title">
                                    <i className="fas fa-money-bill-wave"></i> Payment Information
                                </h4>
                                <div className="detail-content">
                                    <div className="detail-row">
                                        <span className="detail-label">Amount:</span>
                                        <span className="detail-value">
                                            ${selectedPayment.amount?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Payment Date:</span>
                                        <span className="detail-value">
                                            {formatDateTime(selectedPayment.paymentDate).date || 'Not set'}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Payment Method:</span>
                                        <span className="detail-value">
                                            {selectedPayment.paymentMethod || 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Payment Type:</span>
                                        <span className="detail-value">
                                            {selectedPayment.type || 'Consultation'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="detail-section">
                                <h4 className="section-title">
                                    <i className="fas fa-user"></i> Patient Information
                                </h4>
                                <div className="detail-content">
                                    <div className="detail-row">
                                        <span className="detail-label">Patient:</span>
                                        <span className="detail-value">
                                            {getPatientName(selectedPayment.patientId)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="detail-section">
                                <h4 className="section-title">
                                    <i className="fas fa-calendar-check"></i> Appointment Information
                                </h4>
                                <div className="detail-content">
                                    <div className="detail-row">
                                        <span className="detail-label">Appointment:</span>
                                        <span className="detail-value">
                                            {getAppointmentDetails(selectedPayment.appointmentId)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {selectedPayment.notes && (
                                <div className="detail-section">
                                    <h4 className="section-title">
                                        <i className="fas fa-sticky-note"></i> Notes
                                    </h4>
                                    <div className="detail-content">
                                        <div className="detail-row">
                                            <span className="detail-value">
                                                {selectedPayment.notes}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="modal-actions">
                                <button 
                                    className="close-button"
                                    onClick={() => setShowViewModal(false)}
                                >
                                    <i className="fas fa-times"></i> Close
                                </button>
                                <button 
                                    className="edit-appointment-btn"
                                    onClick={() => {
                                        setShowViewModal(false);
                                        openEditModal(selectedPayment);
                                    }}
                                >
                                    <i className="fas fa-edit"></i> Edit Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement; 
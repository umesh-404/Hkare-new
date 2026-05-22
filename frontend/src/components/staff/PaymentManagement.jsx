import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    patientId: '',
    amount: '',
    paymentType: 'CONSULTATION',
    paymentMethod: 'CASH',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchPatients();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/payments');
      setPayments(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments. Please try again later.');
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInitializePayment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/payments', {
        ...formData,
        status: 'PENDING'
      });
      setShowAddModal(false);
      fetchPayments();
      setFormData({
        patientId: '',
        amount: '',
        paymentType: 'CONSULTATION',
        paymentMethod: 'CASH',
        description: '',
        dueDate: ''
      });
    } catch (err) {
      console.error('Error initializing payment:', err);
      setError('Failed to initialize payment. Please try again.');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PAID':
        return 'status-completed';
      case 'PENDING':
        return 'status-pending';
      case 'OVERDUE':
        return 'status-rejected';
      case 'CANCELLED':
        return 'status-expired';
      default:
        return '';
    }
  };

  const getFilteredPayments = () => {
    return payments.filter(payment => {
      // Filter by status
      if (statusFilter !== 'ALL' && payment.status !== statusFilter) {
        return false;
      }
      
      // Filter by date
      if (dateFilter && payment.dueDate) {
        const paymentDate = new Date(payment.dueDate).toISOString().split('T')[0];
        if (paymentDate !== dateFilter) {
          return false;
        }
      }
      
      // Search term filter
      if (searchTerm) {
        const patient = patients.find(p => p.patientId === payment.patientId);
        const searchString = `${patient?.firstName} ${patient?.lastName} ${payment.paymentType} ${payment.description}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      }
      
      return true;
    });
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Due Date:</label>
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
                  placeholder="Search payments..."
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
          <i className="fas fa-plus"></i> Initialize Payment
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Method</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredPayments().length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No payments found</td>
              </tr>
            ) : (
              getFilteredPayments().map(payment => {
                const patient = patients.find(p => p.patientId === payment.patientId);
                return (
                  <tr key={payment.paymentId}>
                    <td>{payment.paymentId}</td>
                    <td>{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>{payment.paymentType}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>{formatDate(payment.dueDate)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Initialize Payment Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Initialize New Payment</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleInitializePayment}>
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
                      <label>Amount*</label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="Enter amount..."
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Payment Type*</label>
                      <select
                        name="paymentType"
                        value={formData.paymentType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="CONSULTATION">Consultation</option>
                        <option value="TREATMENT">Treatment</option>
                        <option value="MEDICATION">Medication</option>
                        <option value="LAB_TEST">Lab Test</option>
                        <option value="PROCEDURE">Procedure</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Payment Method*</label>
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
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter payment description..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Due Date*</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <i className="fas fa-file-invoice-dollar"></i> Initialize Payment
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

export default PaymentManagement; 
import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const MedicationManagement = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMedication, setCurrentMedication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    manufacturer: '',
    dosageForm: '',
    strength: '',
    unitOfMeasurement: '',
    stockQuantity: '',
    reorderLevel: '',
    unitPrice: '',
    expiryDate: '',
    storageConditions: '',
    prescriptionRequired: false,
    sideEffects: '',
    contraindications: ''
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/medications');
      setMedications(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching medications:', err);
      setError('Failed to load medications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/medications', formData);
      setShowAddModal(false);
      fetchMedications();
      setFormData({
        name: '',
        category: '',
        description: '',
        manufacturer: '',
        dosageForm: '',
        strength: '',
        unitOfMeasurement: '',
        stockQuantity: '',
        reorderLevel: '',
        unitPrice: '',
        expiryDate: '',
        storageConditions: '',
        prescriptionRequired: false,
        sideEffects: '',
        contraindications: ''
      });
    } catch (err) {
      console.error('Error adding medication:', err);
      setError('Failed to add medication. Please try again.');
    }
  };

  const handleEditMedication = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/medications/${currentMedication.medicationId}`, formData);
      setShowEditModal(false);
      fetchMedications();
    } catch (err) {
      console.error('Error updating medication:', err);
      setError('Failed to update medication. Please try again.');
    }
  };

  const handleDeleteMedication = async (medicationId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await api.delete(`/api/medications/${medicationId}`);
        fetchMedications();
      } catch (err) {
        console.error('Error deleting medication:', err);
        setError('Failed to delete medication. Please try again.');
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

  const getStockStatus = (quantity, reorderLevel) => {
    if (quantity <= 0) return 'OUT_OF_STOCK';
    if (quantity <= reorderLevel) return 'LOW_STOCK';
    return 'IN_STOCK';
  };

  const getStockStatusClass = (status) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return 'status-rejected';
      case 'LOW_STOCK':
        return 'status-pending';
      case 'IN_STOCK':
        return 'status-completed';
      default:
        return '';
    }
  };

  const getFilteredMedications = () => {
    return medications.filter(medication => {
      // Filter by category
      if (categoryFilter !== 'ALL' && medication.category !== categoryFilter) {
        return false;
      }
      
      // Filter by stock status
      if (stockFilter !== 'ALL') {
        const status = getStockStatus(medication.stockQuantity, medication.reorderLevel);
        if (status !== stockFilter) {
          return false;
        }
      }
      
      // Search term filter
      if (searchTerm) {
        const searchString = `${medication.name} ${medication.manufacturer} ${medication.category}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      }
      
      return true;
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading medications...</p>
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
              <label>Category:</label>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Categories</option>
                <option value="ANTIBIOTICS">Antibiotics</option>
                <option value="PAINKILLERS">Painkillers</option>
                <option value="ANTIDEPRESSANTS">Antidepressants</option>
                <option value="ANTIVIRALS">Antivirals</option>
                <option value="VACCINES">Vaccines</option>
                <option value="SUPPLEMENTS">Supplements</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Stock Status:</label>
              <select 
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Status</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Search:</label>
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search medications..."
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
          <i className="fas fa-plus"></i> Add Medication
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Unit Price</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredMedications().length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No medications found</td>
              </tr>
            ) : (
              getFilteredMedications().map(medication => (
                <tr key={medication.medicationId}>
                  <td>{medication.medicationId}</td>
                  <td>{medication.name}</td>
                  <td>{medication.category}</td>
                  <td>
                    <span className={`status-badge ${getStockStatusClass(getStockStatus(medication.stockQuantity, medication.reorderLevel))}`}>
                      {medication.stockQuantity} {medication.unitOfMeasurement}
                    </span>
                  </td>
                  <td>${medication.unitPrice}</td>
                  <td>{formatDate(medication.expiryDate)}</td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view" 
                      onClick={() => {
                        setCurrentMedication(medication);
                        setShowEditModal(true);
                        setFormData({
                          name: medication.name,
                          category: medication.category,
                          description: medication.description,
                          manufacturer: medication.manufacturer,
                          dosageForm: medication.dosageForm,
                          strength: medication.strength,
                          unitOfMeasurement: medication.unitOfMeasurement,
                          stockQuantity: medication.stockQuantity,
                          reorderLevel: medication.reorderLevel,
                          unitPrice: medication.unitPrice,
                          expiryDate: medication.expiryDate,
                          storageConditions: medication.storageConditions,
                          prescriptionRequired: medication.prescriptionRequired,
                          sideEffects: medication.sideEffects,
                          contraindications: medication.contraindications
                        });
                      }}
                      title="Edit Medication"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDeleteMedication(medication.medicationId)}
                      title="Delete Medication"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Add New Medication</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddMedication}>
                <div className="form-section">
                  <h4>Basic Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name*</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category*</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="ANTIBIOTICS">Antibiotics</option>
                        <option value="PAINKILLERS">Painkillers</option>
                        <option value="ANTIDEPRESSANTS">Antidepressants</option>
                        <option value="ANTIVIRALS">Antivirals</option>
                        <option value="VACCINES">Vaccines</option>
                        <option value="SUPPLEMENTS">Supplements</option>
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
                      placeholder="Enter medication description..."
                    ></textarea>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Manufacturer*</label>
                      <input
                        type="text"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Dosage Form*</label>
                      <select
                        name="dosageForm"
                        value={formData.dosageForm}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Form</option>
                        <option value="TABLET">Tablet</option>
                        <option value="CAPSULE">Capsule</option>
                        <option value="LIQUID">Liquid</option>
                        <option value="INJECTION">Injection</option>
                        <option value="CREAM">Cream</option>
                        <option value="OINTMENT">Ointment</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Specifications</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Strength*</label>
                      <input
                        type="text"
                        name="strength"
                        value={formData.strength}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 500mg"
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit of Measurement*</label>
                      <input
                        type="text"
                        name="unitOfMeasurement"
                        value={formData.unitOfMeasurement}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., tablets, ml"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Stock Quantity*</label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Reorder Level*</label>
                      <input
                        type="number"
                        name="reorderLevel"
                        value={formData.reorderLevel}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Unit Price*</label>
                      <input
                        type="number"
                        name="unitPrice"
                        value={formData.unitPrice}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date*</label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Additional Information</h4>
                  <div className="form-group">
                    <label>Storage Conditions</label>
                    <textarea
                      name="storageConditions"
                      value={formData.storageConditions}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Enter storage requirements..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="prescriptionRequired"
                        checked={formData.prescriptionRequired}
                        onChange={handleInputChange}
                      />
                      <span>Prescription Required</span>
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label>Side Effects</label>
                    <textarea
                      name="sideEffects"
                      value={formData.sideEffects}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="List potential side effects..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Contraindications</label>
                    <textarea
                      name="contraindications"
                      value={formData.contraindications}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="List contraindications..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <i className="fas fa-save"></i> Add Medication
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Medication Modal */}
      {showEditModal && currentMedication && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit Medication: {currentMedication.name}</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditMedication}>
                <div className="form-section">
                  <h4>Basic Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name*</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category*</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="ANTIBIOTICS">Antibiotics</option>
                        <option value="PAINKILLERS">Painkillers</option>
                        <option value="ANTIDEPRESSANTS">Antidepressants</option>
                        <option value="ANTIVIRALS">Antivirals</option>
                        <option value="VACCINES">Vaccines</option>
                        <option value="SUPPLEMENTS">Supplements</option>
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
                      placeholder="Enter medication description..."
                    ></textarea>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Manufacturer*</label>
                      <input
                        type="text"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Dosage Form*</label>
                      <select
                        name="dosageForm"
                        value={formData.dosageForm}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Form</option>
                        <option value="TABLET">Tablet</option>
                        <option value="CAPSULE">Capsule</option>
                        <option value="LIQUID">Liquid</option>
                        <option value="INJECTION">Injection</option>
                        <option value="CREAM">Cream</option>
                        <option value="OINTMENT">Ointment</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Specifications</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Strength*</label>
                      <input
                        type="text"
                        name="strength"
                        value={formData.strength}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 500mg"
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit of Measurement*</label>
                      <input
                        type="text"
                        name="unitOfMeasurement"
                        value={formData.unitOfMeasurement}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., tablets, ml"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Stock Quantity*</label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Reorder Level*</label>
                      <input
                        type="number"
                        name="reorderLevel"
                        value={formData.reorderLevel}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Unit Price*</label>
                      <input
                        type="number"
                        name="unitPrice"
                        value={formData.unitPrice}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date*</label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4>Additional Information</h4>
                  <div className="form-group">
                    <label>Storage Conditions</label>
                    <textarea
                      name="storageConditions"
                      value={formData.storageConditions}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Enter storage requirements..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="prescriptionRequired"
                        checked={formData.prescriptionRequired}
                        onChange={handleInputChange}
                      />
                      <span>Prescription Required</span>
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label>Side Effects</label>
                    <textarea
                      name="sideEffects"
                      value={formData.sideEffects}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="List potential side effects..."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Contraindications</label>
                    <textarea
                      name="contraindications"
                      value={formData.contraindications}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="List contraindications..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <i className="fas fa-save"></i> Update Medication
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

export default MedicationManagement; 
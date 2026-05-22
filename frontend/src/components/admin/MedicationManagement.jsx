import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const MedicationManagement = () => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    
    // Form data for adding/editing medications
    const [formData, setFormData] = useState({
        name: '',
        genericName: '',
        brand: '',
        manufacturer: '',
        type: '',
        dosageForm: '',
        strength: '',
        stockQuantity: '',
        requiresPrescription: false,
        description: '',
        sideEffects: '',
        contraindications: '',
        price: ''
    });
    
    // Selected medication for edit/delete operations
    const [selectedMedication, setSelectedMedication] = useState(null);
    
    // Stock update form
    const [stockForm, setStockForm] = useState({
        medicationId: '',
        quantity: '',
        updateType: 'ADD' // ADD or SUBTRACT
    });

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/medications');
            
            if (response.data) {
                setMedications(response.data);
                setError('');
            }
        } catch (err) {
            console.error('Error fetching medications:', err);
            setError('Failed to load medications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleStockInputChange = (e) => {
        const { name, value } = e.target;
        setStockForm({
            ...stockForm,
            [name]: value
        });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const openAddModal = () => {
        setFormData({
            name: '',
            genericName: '',
            brand: '',
            manufacturer: '',
            type: '',
            dosageForm: '',
            strength: '',
            stockQuantity: '',
            requiresPrescription: false,
            description: '',
            sideEffects: '',
            contraindications: '',
            price: ''
        });
        setShowAddModal(true);
    };

    const openEditModal = (medication) => {
        setSelectedMedication(medication);
        setFormData({
            name: medication.name,
            genericName: medication.genericName,
            brand: medication.brand || '',
            manufacturer: medication.manufacturer || '',
            type: medication.type || '',
            dosageForm: medication.dosageForm || '',
            strength: medication.strength || '',
            stockQuantity: medication.stockQuantity.toString(),
            requiresPrescription: medication.requiresPrescription,
            description: medication.description || '',
            sideEffects: medication.sideEffects || '',
            contraindications: medication.contraindications || '',
            price: medication.price ? medication.price.toString() : ''
        });
        setShowEditModal(true);
    };

    const openStockModal = (medication) => {
        setSelectedMedication(medication);
        setStockForm({
            medicationId: medication.medicationId,
            quantity: '',
            updateType: 'ADD'
        });
        setShowStockModal(true);
    };

    const handleAddMedication = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/medications', formData);
            
            if (response.data) {
                setMedications([...medications, response.data]);
                setShowAddModal(false);
                alert('Medication added successfully!');
            }
        } catch (err) {
            console.error('Error adding medication:', err);
            alert(err.response?.data?.message || 'Failed to add medication. Please try again.');
        }
    };

    const handleUpdateMedication = async (e) => {
        e.preventDefault();
        if (!selectedMedication) return;
        
        try {
            const response = await api.put(`/api/medications/${selectedMedication.medicationId}`, formData);
            
            if (response.data) {
                const updatedMedications = medications.map(med => 
                    med.medicationId === selectedMedication.medicationId ? response.data : med
                );
                setMedications(updatedMedications);
                setShowEditModal(false);
                alert('Medication updated successfully!');
            }
        } catch (err) {
            console.error('Error updating medication:', err);
            alert(err.response?.data?.message || 'Failed to update medication. Please try again.');
        }
    };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        if (!selectedMedication) return;
        
        try {
            const endpoint = `/api/medications/${selectedMedication.medicationId}/stock`;
            const payload = {
                quantity: parseInt(stockForm.quantity),
                action: stockForm.updateType
            };
            
            const response = await api.patch(endpoint, payload);
            
            if (response.data) {
                const updatedMedications = medications.map(med => 
                    med.medicationId === selectedMedication.medicationId ? response.data : med
                );
                
                setMedications(updatedMedications);
                setShowStockModal(false);
                alert('Stock updated successfully!');
            }
        } catch (err) {
            console.error('Error updating stock:', err);
            alert(err.response?.data?.message || 'Failed to update stock. Please try again.');
        }
    };

    const handleDeleteMedication = async (medicationId) => {
        if (window.confirm('Are you sure you want to delete this medication?')) {
            try {
                const response = await api.delete(`/api/medications/${medicationId}`);
                
                setMedications(medications.filter(med => med.medicationId !== medicationId));
                alert('Medication deleted successfully!');
            } catch (err) {
                console.error('Error deleting medication:', err);
                alert(err.response?.data?.message || 'Failed to delete medication. Please try again.');
            }
        }
    };

    // Filter medications based on search term
    const filteredMedications = medications.filter(med => {
        const searchLower = searchTerm.toLowerCase();
        return (
            med.name.toLowerCase().includes(searchLower) ||
            (med.genericName && med.genericName.toLowerCase().includes(searchLower)) ||
            (med.brand && med.brand.toLowerCase().includes(searchLower))
        );
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading medications...</p>
            </div>
        );
    }

    return (
        <div className="medications-container">
            <div className="medications-header">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search medications..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    <i className="fas fa-search search-icon"></i>
                </div>
                <button className="add-btn" onClick={openAddModal}>
                    <i className="fas fa-plus"></i> Add Medication
                </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="medications-list">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Generic Name</th>
                            <th>Type</th>
                            <th>Dosage Form</th>
                            <th>Stock</th>
                            <th>Requires Rx</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMedications.length > 0 ? (
                            filteredMedications.map(med => (
                                <tr key={med.medicationId} className={med.stockQuantity < 10 ? "low-stock" : ""}>
                                    <td>{med.name}</td>
                                    <td>{med.genericName || 'N/A'}</td>
                                    <td>{med.type || 'N/A'}</td>
                                    <td>{med.dosageForm || 'N/A'}</td>
                                    <td className={med.stockQuantity < 10 ? "low-stock-cell" : ""}>
                                        {med.stockQuantity}
                                        {med.stockQuantity < 10 && 
                                            <span className="low-stock-warning">
                                                <i className="fas fa-exclamation-triangle"></i> Low
                                            </span>
                                        }
                                    </td>
                                    <td>
                                        {med.requiresPrescription ? 
                                            <span className="requires-rx">Yes</span> : 
                                            <span className="no-rx">No</span>
                                        }
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className="action-btn edit-btn" 
                                            title="Edit"
                                            onClick={() => openEditModal(med)}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="action-btn stock-btn" 
                                            title="Update Stock"
                                            onClick={() => openStockModal(med)}
                                        >
                                            <i className="fas fa-cubes"></i>
                                        </button>
                                        <button 
                                            className="action-btn delete-btn" 
                                            title="Delete"
                                            onClick={() => handleDeleteMedication(med.medicationId)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    {searchTerm ? 'No medications match your search' : 'No medications found'}
                                </td>
                            </tr>
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
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="name">Name*</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="genericName">Generic Name*</label>
                                            <input
                                                type="text"
                                                id="genericName"
                                                name="genericName"
                                                value={formData.genericName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="brand">Brand</label>
                                            <input
                                                type="text"
                                                id="brand"
                                                name="brand"
                                                value={formData.brand}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="manufacturer">Manufacturer</label>
                                            <input
                                                type="text"
                                                id="manufacturer"
                                                name="manufacturer"
                                                value={formData.manufacturer}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Medication Details</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="type">Type*</label>
                                            <select
                                                id="type"
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                <option value="ANALGESIC">Analgesic</option>
                                                <option value="ANTIBIOTIC">Antibiotic</option>
                                                <option value="ANTIDEPRESSANT">Antidepressant</option>
                                                <option value="ANTIVIRAL">Antiviral</option>
                                                <option value="ANTIHISTAMINE">Antihistamine</option>
                                                <option value="STEROID">Steroid</option>
                                                <option value="VACCINE">Vaccine</option>
                                                <option value="VITAMIN">Vitamin</option>
                                                <option value="MINERAL">Mineral</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="dosageForm">Dosage Form*</label>
                                            <select
                                                id="dosageForm"
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
                                                <option value="TOPICAL">Topical</option>
                                                <option value="INHALER">Inhaler</option>
                                                <option value="SUPPOSITORY">Suppository</option>
                                                <option value="PATCH">Patch</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="strength">Strength</label>
                                            <input
                                                type="text"
                                                id="strength"
                                                name="strength"
                                                value={formData.strength}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 500mg, 10ml"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="price">Price</label>
                                            <input
                                                type="number"
                                                id="price"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="stockQuantity">Initial Stock*</label>
                                            <input
                                                type="number"
                                                id="stockQuantity"
                                                name="stockQuantity"
                                                value={formData.stockQuantity}
                                                onChange={handleInputChange}
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="requiresPrescription"
                                                    checked={formData.requiresPrescription}
                                                    onChange={handleInputChange}
                                                />
                                                Requires Prescription
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Additional Information</h4>
                                    <div className="form-group">
                                        <label htmlFor="description">Description</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="sideEffects">Side Effects</label>
                                        <textarea
                                            id="sideEffects"
                                            name="sideEffects"
                                            value={formData.sideEffects}
                                            onChange={handleInputChange}
                                            rows="3"
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="contraindications">Contraindications</label>
                                        <textarea
                                            id="contraindications"
                                            name="contraindications"
                                            value={formData.contraindications}
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
                                    <button type="submit" className="submit-btn">Add Medication</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Medication Modal */}
            {showEditModal && selectedMedication && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Edit Medication</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleUpdateMedication}>
                                <div className="form-section">
                                    <h4>Basic Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="edit-name">Name*</label>
                                            <input
                                                type="text"
                                                id="edit-name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="edit-genericName">Generic Name*</label>
                                            <input
                                                type="text"
                                                id="edit-genericName"
                                                name="genericName"
                                                value={formData.genericName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="edit-brand">Brand</label>
                                            <input
                                                type="text"
                                                id="edit-brand"
                                                name="brand"
                                                value={formData.brand}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="edit-manufacturer">Manufacturer</label>
                                            <input
                                                type="text"
                                                id="edit-manufacturer"
                                                name="manufacturer"
                                                value={formData.manufacturer}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Medication Details</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="edit-type">Type*</label>
                                            <select
                                                id="edit-type"
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                <option value="ANALGESIC">Analgesic</option>
                                                <option value="ANTIBIOTIC">Antibiotic</option>
                                                <option value="ANTIDEPRESSANT">Antidepressant</option>
                                                <option value="ANTIVIRAL">Antiviral</option>
                                                <option value="ANTIHISTAMINE">Antihistamine</option>
                                                <option value="STEROID">Steroid</option>
                                                <option value="VACCINE">Vaccine</option>
                                                <option value="VITAMIN">Vitamin</option>
                                                <option value="MINERAL">Mineral</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="edit-dosageForm">Dosage Form*</label>
                                            <select
                                                id="edit-dosageForm"
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
                                                <option value="TOPICAL">Topical</option>
                                                <option value="INHALER">Inhaler</option>
                                                <option value="SUPPOSITORY">Suppository</option>
                                                <option value="PATCH">Patch</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="edit-strength">Strength</label>
                                            <input
                                                type="text"
                                                id="edit-strength"
                                                name="strength"
                                                value={formData.strength}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 500mg, 10ml"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="edit-price">Price</label>
                                            <input
                                                type="number"
                                                id="edit-price"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="requiresPrescription"
                                                    checked={formData.requiresPrescription}
                                                    onChange={handleInputChange}
                                                />
                                                Requires Prescription
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-section">
                                    <h4>Additional Information</h4>
                                    <div className="form-group">
                                        <label htmlFor="edit-description">Description</label>
                                        <textarea
                                            id="edit-description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="edit-sideEffects">Side Effects</label>
                                        <textarea
                                            id="edit-sideEffects"
                                            name="sideEffects"
                                            value={formData.sideEffects}
                                            onChange={handleInputChange}
                                            rows="3"
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="edit-contraindications">Contraindications</label>
                                        <textarea
                                            id="edit-contraindications"
                                            name="contraindications"
                                            value={formData.contraindications}
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
                                    <button type="submit" className="submit-btn">Update Medication</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Update Stock Modal */}
            {showStockModal && selectedMedication && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Update Stock: {selectedMedication.name}</h3>
                            <button className="close-btn" onClick={() => setShowStockModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="stock-info">
                                <p>Current Stock: <strong>{selectedMedication.stockQuantity}</strong></p>
                            </div>
                            
                            <form onSubmit={handleUpdateStock}>
                                <div className="form-section">
                                    <div className="form-group">
                                        <label htmlFor="updateType">Action</label>
                                        <select
                                            id="updateType"
                                            name="updateType"
                                            value={stockForm.updateType}
                                            onChange={handleStockInputChange}
                                            required
                                        >
                                            <option value="ADD">Add to Stock</option>
                                            <option value="SUBTRACT">Remove from Stock</option>
                                        </select>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="quantity">Quantity</label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            value={stockForm.quantity}
                                            onChange={handleStockInputChange}
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setShowStockModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">Update Stock</button>
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
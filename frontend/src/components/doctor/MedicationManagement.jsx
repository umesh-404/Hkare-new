import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const MedicationManagement = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getFilteredMedications = () => {
    return medications.filter(med => {
      const searchLower = searchTerm.toLowerCase();
      return (
        med.name?.toLowerCase().includes(searchLower) ||
        (med.genericName && med.genericName.toLowerCase().includes(searchLower)) ||
        (med.brand && med.brand.toLowerCase().includes(searchLower))
      );
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
        <div className="search-container">
          <input
            type="text"
            placeholder="Search medications..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Generic Name</th>
              <th>Brand</th>
              <th>Type</th>
              <th>Dosage Form</th>
              <th>Requires Prescription</th>
              <th>Stock</th>
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
                  <td>{medication.name}</td>
                  <td>{medication.genericName || 'N/A'}</td>
                  <td>{medication.brand || 'N/A'}</td>
                  <td>{medication.type || 'N/A'}</td>
                  <td>{medication.dosageForm || 'N/A'}</td>
                  <td>{medication.requiresPrescription ? 'Yes' : 'No'}</td>
                  <td className={medication.isLowStock ? 'low-stock' : ''}>
                    {medication.stockQuantity || 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicationManagement; 
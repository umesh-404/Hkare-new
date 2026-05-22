import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/departments');
      setDepartments(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDepartments = () => {
    if (!searchTerm) return departments;
    
    return departments.filter(department => {
      const searchString = `${department.name} ${department.description} ${department.headDoctorName}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading departments...</p>
      </div>
    );
  }

  return (
    <div className="management-section">
      <div className="management-header">
        <div className="search-container">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Head Doctor</th>
              <th>Staff Count</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredDepartments().length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No departments found</td>
              </tr>
            ) : (
              getFilteredDepartments().map(department => (
                <tr key={department.id}>
                  <td>{department.id}</td>
                  <td>{department.name}</td>
                  <td>{department.description}</td>
                  <td>{department.headDoctorName || 'Not Assigned'}</td>
                  <td>{department.staffCount || 0}</td>
                  <td>
                    <span className={`status-badge ${department.isActive ? 'status-completed' : 'status-inactive'}`}>
                      {department.isActive ? 'Active' : 'Inactive'}
                    </span>
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

export default DepartmentManagement; 
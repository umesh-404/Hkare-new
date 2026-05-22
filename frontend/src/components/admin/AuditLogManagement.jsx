import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { FaSearch, FaCalendar, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import './AdminPage.css';

const AuditLogManagement = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [username, setUsername] = useState('');
    const [entityType, setEntityType] = useState('');
    const [entityId, setEntityId] = useState('');
    const [action, setAction] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });

    const fetchAuditLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '/api/audit-logs';
            if (filter === 'user' && username) {
                url = `/api/audit-logs/user/${username}`;
            } else if (filter === 'entity' && entityType && entityId) {
                url = `/api/audit-logs/entity?entityType=${entityType}&entityId=${entityId}`;
            } else if (filter === 'action' && action) {
                url = `/api/audit-logs/action/${action}`;
            } else if (filter === 'date-range' && dateRange.start && dateRange.end) {
                url = `/api/audit-logs/date-range?start=${dateRange.start}&end=${dateRange.end}`;
            }
            const response = await api.get(url);
            setAuditLogs(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch audit logs. Please try again later.');
            console.error('Error fetching audit logs:', err);
            setAuditLogs([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAuditLogs();
    }, [filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        if (newFilter === 'all') {
            setUsername('');
            setEntityType('');
            setEntityId('');
            setAction('');
            setDateRange({ start: '', end: '' });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAuditLogs();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading audit logs...</p>
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
                            <label>Filter Type:</label>
                            <select 
                                className="filter-select"
                                value={filter}
                                onChange={(e) => handleFilterChange(e.target.value)}
                            >
                                <option value="all">All Logs</option>
                                <option value="user">By User</option>
                                <option value="entity">By Entity</option>
                                <option value="action">By Action</option>
                                <option value="date-range">By Date Range</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-container">
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                    <button 
                        className="submit-btn" 
                        onClick={() => {
                            setError('');
                            fetchAuditLogs();
                        }}
                    >
                        <i className="fas fa-sync"></i> Retry
                    </button>
                </div>
            )}

            <div className="filter-controls">
                {filter === 'user' && (
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="submit-btn">
                            <FaSearch /> Search
                        </button>
                    </form>
                )}

                {filter === 'entity' && (
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Entity Type"
                            value={entityType}
                            onChange={(e) => setEntityType(e.target.value)}
                            className="search-input"
                        />
                        <input
                            type="text"
                            placeholder="Entity ID"
                            value={entityId}
                            onChange={(e) => setEntityId(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="submit-btn">
                            <FaFilter /> Filter
                        </button>
                    </form>
                )}

                {filter === 'action' && (
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Enter action"
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="submit-btn">
                            <FaSearch /> Search
                        </button>
                    </form>
                )}

                {filter === 'date-range' && (
                    <form onSubmit={handleSearch} className="date-range-form">
                        <div className="date-inputs">
                            <input
                                type="datetime-local"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="date-input"
                            />
                            <span>to</span>
                            <input
                                type="datetime-local"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="date-input"
                            />
                        </div>
                        <button type="submit" className="submit-btn">
                            <FaCalendar /> Apply Filter
                        </button>
                    </form>
                )}
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Username</th>
                            <th>Action</th>
                            <th>Entity Type</th>
                            <th>Entity ID</th>
                            <th>IP Address</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(auditLogs) && auditLogs.length > 0 ? (
                            auditLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td>{log.username}</td>
                                    <td>{log.action}</td>
                                    <td>{log.entityType}</td>
                                    <td>{log.entityId}</td>
                                    <td>{log.ipAddress}</td>
                                    <td>
                                        <div className="details-cell">
                                            {log.details}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">No audit logs found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogManagement; 
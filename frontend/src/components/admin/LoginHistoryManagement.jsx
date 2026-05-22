import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { FaSearch, FaCalendar, FaExclamationTriangle } from 'react-icons/fa';
import './AdminPage.css';

const LoginHistoryManagement = () => {
    const [loginHistory, setLoginHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [username, setUsername] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });

    const fetchLoginHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '/api/login-history';
            if (filter === 'user' && username) {
                url = `/api/login-history/user/${username}`;
            } else if (filter === 'date-range' && dateRange.start && dateRange.end) {
                url = `/api/login-history/date-range?start=${dateRange.start}&end=${dateRange.end}`;
            }
            const response = await api.get(url);
            setLoginHistory(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch login history. Please try again later.');
            console.error('Error fetching login history:', err);
            setLoginHistory([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLoginHistory();
    }, [filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        if (newFilter === 'all') {
            setUsername('');
            setDateRange({ start: '', end: '' });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLoginHistory();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading login history...</p>
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
                                <option value="all">All History</option>
                                <option value="user">By User</option>
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
                    <button className="submit-btn" onClick={() => { setError(''); fetchLoginHistory(); }}>
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
                            <th>IP Address</th>
                            <th>User Agent</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(loginHistory) && loginHistory.length > 0 ? (
                            loginHistory.map((login) => (
                                <tr key={login.id}>
                                    <td>{new Date(login.loginTime).toLocaleString()}</td>
                                    <td>{login.username}</td>
                                    <td>{login.ipAddress}</td>
                                    <td>{login.userAgent}</td>
                                    <td>
                                        <span className={`status-badge ${login.loginSuccess ? 'status-completed' : 'status-pending'}`}>
                                            {login.loginSuccess ? 'Success' : 'Failed'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-data">No login history found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoginHistoryManagement; 
import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { FaSearch, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './StaffPage.css';

const NotificationManagement = ({ staffId }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [recipientType, setRecipientType] = useState('STAFF');
    const [recipientId, setRecipientId] = useState('');
    const [senderUsername, setSenderUsername] = useState('');
    const [priority, setPriority] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        recipientType: 'STAFF',
        recipientId: '',
        senderUsername: staffId || '',
        priority: 'NORMAL',
    });

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '/api/notifications';
            if (filter === 'recipient' && recipientId) {
                url = `/api/notifications/recipient/${recipientType}/${recipientId}`;
            } else if (filter === 'sender' && senderUsername) {
                url = `/api/notifications/sender/${senderUsername}`;
            } else if (filter === 'priority' && priority) {
                url = `/api/notifications/priority/${priority}`;
            }
            const response = await api.get(url);
            setNotifications(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch notifications. Please try again later.');
            setNotifications([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        if (newFilter === 'all') {
            setRecipientId('');
            setSenderUsername('');
            setPriority('');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchNotifications();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateNotification = async (e) => {
        e.preventDefault();
        try {
            const notificationData = {
                ...formData,
                senderUsername: staffId,
                createdAt: new Date().toISOString(),
                isRead: false
            };
            await api.post('/api/notifications', notificationData);
            setShowAddModal(false);
            setFormData({
                title: '',
                message: '',
                recipientType: 'STAFF',
                recipientId: '',
                senderUsername: staffId || '',
                priority: 'NORMAL',
            });
            fetchNotifications();
        } catch (err) {
            setError('Failed to create notification. Please try again.');
            console.error('Error creating notification:', err);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.put(`/api/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (err) {
            setError('Failed to mark notification as read. Please try again.');
            console.error('Error marking notification as read:', err);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            try {
                await api.delete(`/api/notifications/${notificationId}`);
                fetchNotifications();
            } catch (err) {
                setError('Failed to delete notification. Please try again.');
                console.error('Error deleting notification:', err);
            }
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="loading-spinner"></div><p>Loading notifications...</p></div>;
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
                                <option value="all">All Notifications</option>
                                <option value="recipient">By Recipient</option>
                                <option value="sender">By Sender</option>
                                <option value="priority">By Priority</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button className="add-btn" onClick={() => setShowAddModal(true)}>
                    <i className="fas fa-plus"></i>
                    New Notification
                </button>
            </div>

            {error && (
                <div className="error-container">
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                    <button className="submit-btn" onClick={() => { setError(''); fetchNotifications(); }}>
                        <i className="fas fa-sync"></i> Retry
                    </button>
                </div>
            )}

            <div className="filter-controls">
                {filter === 'recipient' && (
                    <form onSubmit={handleSearch} className="search-form">
                        <select
                            value={recipientType}
                            onChange={(e) => setRecipientType(e.target.value)}
                            className="search-input"
                        >
                            <option value="ADMIN">Admin</option>
                            <option value="DOCTOR">Doctor</option>
                            <option value="PATIENT">Patient</option>
                            <option value="STAFF">Staff</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Enter recipient ID"
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="submit-btn">
                            <FaSearch /> Search
                        </button>
                    </form>
                )}

                {filter === 'sender' && (
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Enter sender username"
                            value={senderUsername}
                            onChange={(e) => setSenderUsername(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="submit-btn">
                            <FaSearch /> Search
                        </button>
                    </form>
                )}

                {filter === 'priority' && (
                    <form onSubmit={handleSearch} className="search-form">
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="search-input"
                        >
                            <option value="">Select Priority</option>
                            <option value="HIGH">High</option>
                            <option value="NORMAL">Normal</option>
                            <option value="LOW">Low</option>
                        </select>
                        <button type="submit" className="submit-btn">
                            <FaSearch /> Search
                        </button>
                    </form>
                )}
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Created At</th>
                            <th>Recipient Type</th>
                            <th>Recipient ID</th>
                            <th>Sender</th>
                            <th>Title</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(notifications) && notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <tr key={notification.id}>
                                    <td>{new Date(notification.createdAt).toLocaleString()}</td>
                                    <td>{notification.recipientType}</td>
                                    <td>{notification.recipientId}</td>
                                    <td>{notification.senderUsername}</td>
                                    <td>{notification.title}</td>
                                    <td>
                                        <span className={`status-badge ${notification.priority.toLowerCase()}`}>
                                            {notification.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${notification.isRead ? 'status-completed' : 'status-pending'}`}>
                                            {notification.isRead ? 'Read' : 'Unread'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="action-btn view"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            title="Mark as Read"
                                            disabled={notification.isRead}
                                        >
                                            <i className="fas fa-check"></i>
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDeleteNotification(notification.id)}
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="no-data">No notifications found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Notification Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Create New Notification</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleCreateNotification}>
                                <div className="form-section">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="recipientType">Recipient Type*</label>
                                            <select
                                                id="recipientType"
                                                name="recipientType"
                                                value={formData.recipientType}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="ADMIN">Admin</option>
                                                <option value="DOCTOR">Doctor</option>
                                                <option value="PATIENT">Patient</option>
                                                <option value="STAFF">Staff</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="recipientId">Recipient ID*</label>
                                            <input
                                                type="text"
                                                id="recipientId"
                                                name="recipientId"
                                                value={formData.recipientId}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="senderUsername">Sender Username</label>
                                            <input
                                                type="text"
                                                id="senderUsername"
                                                name="senderUsername"
                                                value={formData.senderUsername}
                                                onChange={handleInputChange}
                                                disabled
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="title">Title*</label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="priority">Priority*</label>
                                            <select
                                                id="priority"
                                                name="priority"
                                                value={formData.priority}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="HIGH">High</option>
                                                <option value="NORMAL">Normal</option>
                                                <option value="LOW">Low</option>
                                            </select>
                                        </div>
                                        <div className="form-group full-width">
                                            <label htmlFor="message">Message*</label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                required
                                                rows="4"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">Send Notification</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationManagement; 
import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './DoctorPage.css';

const NotificationManagement = ({ doctorId }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch notifications for this doctor
            const url = `/api/notifications/recipient/DOCTOR/${doctorId}`;
            const response = await api.get(url);
            setNotifications(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to fetch notifications. Please try again later.');
            setNotifications([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (doctorId) fetchNotifications();
    }, [doctorId]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.put(`/api/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Error marking notification as read:', err);
            setError('Failed to mark notification as read.');
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="loading-spinner"></div><p>Loading notifications...</p></div>;
    }

    return (
        <div className="notification-section">
            <h2>Notifications</h2>
            {error && (
                <div className="error-message">
                    <FaExclamationTriangle /> {error}
                </div>
            )}
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Message</th>
                            <th>Sender</th>
                            <th>Priority</th>
                            <th>Created At</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(notifications) && notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <tr key={notification.id} className={notification.read ? '' : 'unread'}>
                                    <td>{notification.title}</td>
                                    <td>{notification.message}</td>
                                    <td>{notification.senderUsername}</td>
                                    <td>{notification.priority}</td>
                                    <td>{new Date(notification.createdAt).toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${notification.read ? 'read' : 'unread'}`}>
                                            {notification.read ? 'Read' : 'Unread'}
                                        </span>
                                    </td>
                                    <td>
                                        {!notification.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="action-btn mark-read"
                                                title="Mark as Read"
                                            >
                                                <FaCheck />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">No notifications found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NotificationManagement; 
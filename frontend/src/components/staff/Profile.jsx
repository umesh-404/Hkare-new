import React, { useState, useEffect } from 'react';

const Profile = ({ userData }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    });
    const [changePassword, setChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (userData) {
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phoneNumber: userData.phoneNumber || ''
            });
        }
    }, [userData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (isEditing) {
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phoneNumber: userData.phoneNumber || ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            setIsEditing(false);
            const updatedUserData = {
                ...userData,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber
            };
            localStorage.setItem('user', JSON.stringify(updatedUserData));
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
        } catch (error) {
            setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ text: 'New passwords do not match!', type: 'error' });
            return;
        }
        // For demo: just show success
        setMessage({ text: 'Password updated successfully!', type: 'success' });
        setChangePassword(false);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 3000);
    };

    if (!userData) {
        return (
            <div className="profile-container">
                <div className="error-message">No user data available.</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}
            <div className="profile-header">
                <div className="profile-avatar">
                    <i className="fas fa-user-tie"></i>
                </div>
                <div className="profile-title">
                    <h3>{userData.firstName} {userData.lastName}</h3>
                    <p className="role-badge">Staff</p>
                </div>
                <div className="profile-actions">
                    <button className="edit-profile-btn" onClick={handleEditToggle}>
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                    {!isEditing && (
                        <button className="change-password-btn" onClick={() => setChangePassword(true)}>
                            Change Password
                        </button>
                    )}
                </div>
            </div>
            <div className="profile-content">
                {!isEditing ? (
                    <div className="profile-info">
                        <div className="info-group">
                            <h4>Personal Information</h4>
                            <div className="info-row">
                                <span className="info-label">ID:</span>
                                <span className="info-value">{userData.staffId || userData.roleId || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Full Name:</span>
                                <span className="info-value">{userData.firstName} {userData.lastName}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{userData.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Phone:</span>
                                <span className="info-value">{userData.phoneNumber || 'Not provided'}</span>
                            </div>
                        </div>
                        <div className="info-group">
                            <h4>Account Information</h4>
                            <div className="info-row">
                                <span className="info-label">Role:</span>
                                <span className="info-value">Staff</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Last Login:</span>
                                <span className="info-value">
                                    {userData.loginTime ? new Date(userData.loginTime).toLocaleString() : 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="edit-profile-form">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="save-btn">Save</button>
                        </div>
                    </form>
                )}
                {changePassword && (
                    <form onSubmit={handlePasswordSubmit} className="change-password-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="save-btn">Update Password</button>
                            <button type="button" className="cancel-btn" onClick={() => setChangePassword(false)}>Cancel</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile; 
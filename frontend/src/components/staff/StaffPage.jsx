import React, { useState, useEffect } from 'react';
import './StaffPage.css';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Import modular components
import DoctorManagement from './DoctorManagement';
import PatientManagement from './PatientManagement';
import AppointmentManagement from './AppointmentManagement';
import MedicalRecordManagement from './MedicalRecordManagement';
import MedicationManagement from './MedicationManagement';
import NotificationManagement from './NotificationManagement';
import PaymentManagement from './PaymentManagement';
import DepartmentManagement from './DepartmentManagement';
import Profile from './Profile';

const StaffPage = () => {
    const [activeSection, setActiveSection] = useState("dashboard");
    const navigate = useNavigate();
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Apply specific body class for this page
        document.body.classList.add('staff-page-body');
        
        // Cleanup function to remove the class when component unmounts
        return () => {
            document.body.classList.remove('staff-page-body');
        };
    }, []);

    useEffect(() => {
        // Get user data from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            // Redirect to login if no user data found
            navigate('/staff-login');
            return;
        }
        setUserData(user);
    }, [navigate]);

    const handleLogout = () => {
        setShowLogoutPopup(true);
        setTimeout(() => {
            localStorage.removeItem('user'); // Clear user data
            localStorage.removeItem('token'); // Clear auth token
            setShowLogoutPopup(false);
            navigate('/staff-login');
        }, 1500);
    };

    const renderContent = () => {
        switch (activeSection) {
            case "dashboard":
                return <Dashboard />;
            case "doctors":
                return <DoctorManagement />;
            case "patients":
                return <PatientManagement />;
            case "appointments":
                return <AppointmentManagement />;
            case "medical-records":
                return <MedicalRecordManagement />;
            case "medications":
                return <MedicationManagement />;
            case "notifications":
                return <NotificationManagement />;
            case "payments":
                return <PaymentManagement />;
            case "departments":
                return <DepartmentManagement />;
            case "profile":
                return <Profile userData={userData} />;
            default:
                return <div>Select a section from the sidebar</div>;
        }
    };

    const getIconForSection = (section) => {
        const icons = {
            'dashboard': 'fa-tachometer-alt',
            'doctors': 'fa-user-md',
            'patients': 'fa-users',
            'appointments': 'fa-calendar-check',
            'medical-records': 'fa-file-medical',
            'medications': 'fa-pills',
            'notifications': 'fa-bell',
            'payments': 'fa-credit-card',
            'departments': 'fa-hospital',
            'profile': 'fa-user-circle'
        };
        return icons[section] || 'fa-circle';
    };

    return (
        <div className="staff-page">
            {/* Header */}
            <header className="staff-header">
                <div className="header-left">
                    <img src="/main-logo.png" alt="Hospital Logo" className="header-logo" />
                </div>
                <div className="header-right">
                    <div className="user-info" onClick={() => setActiveSection("profile")} style={{ cursor: 'pointer' }}>
                        <i className="fas fa-user user-icon"></i>
                        <span className="user-name">{userData ? `${userData.firstName} ${userData.lastName}` : 'Staff Member'}</span>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </header>

            {/* Logout Overlay */}
            {showLogoutPopup && (
                <div className="overlay">
                    <div className="loading-text">
                        <div className="spinner"></div>
                        Logging You Out...
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className="sidebar">
                {[
                    { name: "Dashboard", section: "dashboard" },
                    { name: "Doctors", section: "doctors" },
                    { name: "Patients", section: "patients" },
                    { name: "Appointments", section: "appointments" },
                    { name: "Medical Records", section: "medical-records" },
                    { name: "Medications", section: "medications" },
                    { name: "Notifications", section: "notifications" },
                    { name: "Payments", section: "payments" },
                    { name: "Departments", section: "departments" },
                    { name: "Profile", section: "profile" }
                ].map((item) => (
                    <button
                        key={item.name}
                        className={`nav-button ${activeSection === item.section ? "active" : ""}`}
                        onClick={() => setActiveSection(item.section)}
                    >
                        <i className={`fas ${getIconForSection(item.section)}`}></i>
                        {item.name}
                    </button>
                ))}
            </aside>

            {/* Content */}
            <main className="content">
                <div className="content-container">
                    <h2 className="page-title">
                        <i className={`fas ${getIconForSection(activeSection)}`}></i>
                        {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace('-', ' ')}
                    </h2>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

// Dashboard Section with Analytics and Graphs
const Dashboard = () => {
    // Sample data for the graph
    const graphData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Patient Visits',
                data: [65, 59, 80, 81, 56, 55],
                fill: false,
                borderColor: '#0066ff',
                tension: 0.4,
                pointBackgroundColor: '#0066ff'
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#e0e0e0'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="dashboard-section">
            <div className="analytics-overview">
                <h2>Analytics Overview</h2>
                <div className="analytics-cards">
                    <div className="analytics-card">
                        <h4>Total Patients</h4>
                        <p>150</p>
                    </div>
                    <div className="analytics-card">
                        <h4>Appointments Today</h4>
                        <p>30</p>
                    </div>
                    <div className="analytics-card">
                        <h4>Pending Prescriptions</h4>
                        <p>5</p>
                    </div>
                </div>
            </div>
            <div className="graph-section">
                <h2>Monthly Patient Visits</h2>
                <div className="graph-container">
                    <Line data={graphData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default StaffPage;

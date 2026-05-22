import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
// Import all sidebar section components
import StaffManagement from './StaffManagement';
import DoctorManagement from './DoctorManagement';
import PatientManagement from './PatientManagement';
import AppointmentManagement from './AppointmentManagement';
import PaymentManagement from './PaymentManagement';
import DepartmentManagement from './DepartmentManagement';
import MedicalRecordManagement from './MedicalRecordManagement';
import PrescriptionManagement from './PrescriptionManagement';
import MedicationManagement from './MedicationManagement';
import NotificationManagement from './NotificationManagement';
import LoginHistoryManagement from './LoginHistoryManagement';
import AuditLogManagement from './AuditLogManagement';
import Profile from './Profile';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AdminPage = () => {
    const [activeSection, setActiveSection] = useState("dashboard");
    const navigate = useNavigate();
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Apply specific body class for this page
        document.body.classList.add('admin-page-body');
        
        // Cleanup function to remove the class when component unmounts
        return () => {
            document.body.classList.remove('admin-page-body');
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
            setShowLogoutPopup(false);
            navigate('/staff-login');
        }, 1500);
    };

    const renderContent = () => {
        switch (activeSection) {
            case "dashboard":
                return <Dashboard />;
            case "staff":
                return <StaffManagement />;
            case "doctors":
                return <DoctorManagement />;
            case "patients":
                return <PatientManagement />;
            case "appointments":
                return <AppointmentManagement />;
            case "payments":
                return <PaymentManagement />;
            case "departments":
                return <DepartmentManagement />;
            case "medical-records":
                return <MedicalRecordManagement />;
            case "prescriptions":
                return <PrescriptionManagement />;
            case "medications":
                return <MedicationManagement />;
            case "notifications":
                return <NotificationManagement />;
            case "login-history":
                return <LoginHistoryManagement />;
            case "audit-logs":
                return <AuditLogManagement />;
            case "profile":
                return <Profile userData={userData} />;
            default:
                return <div>Select a section from the sidebar</div>;
        }
    };

    // Get nav items for admin dashboard
    const getNavItems = () => {
        return [
            { name: "Dashboard", icon: "fa-tachometer-alt" },
            { name: "Staff", icon: "fa-users-cog" },
            { name: "Doctors", icon: "fa-user-md" },
            { name: "Patients", icon: "fa-hospital-user" },
            { name: "Appointments", icon: "fa-calendar-check" },
            { name: "Payments", icon: "fa-credit-card" },
            { name: "Departments", icon: "fa-hospital" },
            { name: "Medical Records", icon: "fa-file-medical" },
            { name: "Prescriptions", icon: "fa-prescription" },
            { name: "Medications", icon: "fa-pills" },
            { name: "Notifications", icon: "fa-bell" },
            { name: "Login History", icon: "fa-history" },
            { name: "Audit Logs", icon: "fa-clipboard-list" },
            { name: "Profile", icon: "fa-user-circle" },
        ];
    };

    return (
        <div className="admin-page">
            {/* Header */}
            <header className="admin-header">
                <div className="header-left">
                    <img src="/main-logo.png" alt="Hospital Logo" className="header-logo" />
                </div>
                <div className="header-right">
                    <div className="user-info" onClick={() => setActiveSection("profile")} style={{ cursor: 'pointer' }}>
                        <i className="fas fa-user-shield user-icon"></i>
                        <span className="user-name">{userData ? `${userData.firstName} ${userData.lastName}` : 'Administrator'}</span>
                    </div>
                    <button 
                        className="logout-button" 
                        onClick={handleLogout}
                    >
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
                {getNavItems().map(
                    (item) => (
                        <button
                            key={item.name}
                            className={`nav-button ${activeSection === item.name.toLowerCase().replace(' ', '-') ? "active" : ""}`}
                            onClick={() => setActiveSection(item.name.toLowerCase().replace(' ', '-'))}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            {item.name}
                        </button>
                    )
                )}
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

const getIconForSection = (section) => {
    const icons = {
        'dashboard': 'fa-tachometer-alt',
        'staff': 'fa-users-cog',
        'doctors': 'fa-user-md',
        'patients': 'fa-hospital-user',
        'appointments': 'fa-calendar-check',
        'payments': 'fa-credit-card',
        'departments': 'fa-hospital',
        'medical-records': 'fa-file-medical',
        'prescriptions': 'fa-prescription',
        'medications': 'fa-pills',
        'notifications': 'fa-bell',
        'login-history': 'fa-history',
        'audit-logs': 'fa-clipboard-list',
        'profile': 'fa-user-circle',
    };
    return icons[section] || 'fa-circle';
};

// Dashboard Section with Analytics and Graphs
const Dashboard = () => {
    // Sample data for patient visits graph
    const patientVisitsData = {
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
    
    // Sample data for revenue graph
    const revenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Revenue',
                data: [12500, 15000, 13800, 16200, 14500, 17500],
                backgroundColor: '#4CAF50',
                borderColor: '#388E3C',
                borderWidth: 1
            }
        ]
    };

    const lineOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
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
    
    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        return `$${context.raw.toLocaleString()}`;
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#e0e0e0'
                },
                ticks: {
                    callback: function(value) {
                        return '$' + value.toLocaleString();
                    }
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
            {/* Analytics Cards */}
            <div className="analytics-overview">
                <h3>Hospital Overview</h3>
                <div className="analytics-cards">
                    <div className="analytics-card">
                        <div className="card-icon">
                            <i className="fas fa-hospital-user"></i>
                        </div>
                        <div className="card-content">
                            <h4>Active Patients</h4>
                            <p>287</p>
                            <span className="trend up">
                                <i className="fas fa-arrow-up"></i> 12% from last month
                            </span>
                        </div>
                    </div>
                    
                    <div className="analytics-card">
                        <div className="card-icon">
                            <i className="fas fa-user-md"></i>
                        </div>
                        <div className="card-content">
                            <h4>Active Doctors</h4>
                            <p>43</p>
                            <span className="trend up">
                                <i className="fas fa-arrow-up"></i> 5% from last month
                            </span>
                        </div>
                    </div>
                    
                    <div className="analytics-card">
                        <div className="card-icon">
                            <i className="fas fa-calendar-check"></i>
                        </div>
                        <div className="card-content">
                            <h4>Today's Appointments</h4>
                            <p>32</p>
                            <span className="trend down">
                                <i className="fas fa-arrow-down"></i> 3% from yesterday
                            </span>
                        </div>
                    </div>
                    
                    <div className="analytics-card">
                        <div className="card-icon">
                            <i className="fas fa-money-bill-wave"></i>
                        </div>
                        <div className="card-content">
                            <h4>Monthly Revenue</h4>
                            <p>$85,720</p>
                            <span className="trend up">
                                <i className="fas fa-arrow-up"></i> 8% from last month
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Charts */}
            <div className="dashboard-charts">
                <div className="chart-container">
                    <h3>Patient Visits</h3>
                    <div className="chart-wrapper">
                        <Line data={patientVisitsData} options={lineOptions} />
                    </div>
                </div>
                
                <div className="chart-container">
                    <h3>Monthly Revenue</h3>
                    <div className="chart-wrapper">
                        <Bar data={revenueData} options={barOptions} />
                    </div>
                </div>
            </div>
            
            {/* Recent Activity */}
            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-user-plus"></i>
                        </div>
                        <div className="activity-details">
                            <h4>New Doctor Added</h4>
                            <p>Dr. Rajesh Kumar joined Cardiology department</p>
                            <span className="activity-time">Today, 10:30 AM</span>
                        </div>
                    </div>
                    
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-credit-card"></i>
                        </div>
                        <div className="activity-details">
                            <h4>Payment Received</h4>
                            <p>Payment of $450 received from patient Anjali Patel</p>
                            <span className="activity-time">Today, 9:15 AM</span>
                        </div>
                    </div>
                    
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-calendar-plus"></i>
                        </div>
                        <div className="activity-details">
                            <h4>New Appointment</h4>
                            <p>Appointment scheduled for patient Priya Sharma with Dr. Neha Gupta</p>
                            <span className="activity-time">Yesterday, 4:45 PM</span>
                        </div>
                    </div>
                    
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-hospital"></i>
                        </div>
                        <div className="activity-details">
                            <h4>Department Updated</h4>
                            <p>Pediatrics department information updated</p>
                            <span className="activity-time">Yesterday, 2:30 PM</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage; 
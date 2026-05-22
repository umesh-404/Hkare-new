import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientPage.css";

// Import components
import Dashboard from "./Dashboard";
import AppointmentManagement from "./AppointmentManagement";
import MedicalRecordView from "./MedicalRecordView";
import PrescriptionView from "./PrescriptionView";
import Profile from "./Profile";
import NotificationManagement from "./NotificationManagement";

const PatientPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      // Redirect to login if no user data found
      navigate('/patient-login');
      return;
    }
    setUserData(user);
  }, [navigate]);

  useEffect(() => {
    // Apply specific body class for this page
    document.body.classList.add('patient-page-body');
    
    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('patient-page-body');
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutPopup(true);
    setTimeout(() => {
      localStorage.removeItem('user'); // Clear user data
      localStorage.removeItem('token'); // Clear auth token
      setShowLogoutPopup(false);
      navigate("/patient-login");
    }, 1500);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard patientId={userData?.roleId} />;
      case "appointments":
        return <AppointmentManagement patientId={userData?.roleId} />;
      case "medical-records":
        return <MedicalRecordView patientId={userData?.roleId} />;
      case "prescriptions":
        return <PrescriptionView patientId={userData?.roleId} />;
      case "notifications":
        return <NotificationManagement patientId={userData?.roleId} />;
      case "profile":
        return <Profile userData={userData} />;
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  const getIconForSection = (section) => {
    const icons = {
      'dashboard': 'fa-tachometer-alt',
      'appointments': 'fa-calendar-check',
      'medical-records': 'fa-file-medical',
      'prescriptions': 'fa-prescription',
      'notifications': 'fa-bell',
      'profile': 'fa-user-circle'
    };
    return icons[section] || "fa-circle";
  };

  return (
    <div className="patient-page">
      {/* Header */}
      <header className="patient-header">
        <div className="header-left">
          <img 
            src="/main-logo.png" 
            alt="Hospital Logo" 
            className="header-logo"
          />
        </div>
        <div className="header-right">
          <div className="user-info" onClick={() => setActiveSection("profile")} style={{ cursor: 'pointer' }}>
            <i className="fas fa-user user-icon"></i>
            <span className="user-name">{userData ? `${userData.firstName} ${userData.lastName}` : 'Patient'}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </header>

      {/* Logout Popup */}
      {showLogoutPopup && (
        <div className="login-overlay">
          <div className="loading-spinner"></div>
          <p>Logging you out...</p>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        {[
          { name: "Dashboard", icon: "fa-tachometer-alt" },
          { name: "Appointments", icon: "fa-calendar-check" },
          { name: "Medical Records", icon: "fa-file-medical" },
          { name: "Prescriptions", icon: "fa-prescription" },
          { name: "Notifications", icon: "fa-bell" },
          { name: "Profile", icon: "fa-user-circle" }
        ].map((item) => (
          <button
            key={item.name}
            className={`nav-button ${
              activeSection === item.name.toLowerCase().replace(" ", "-") ? "active" : ""
            }`}
            onClick={() => setActiveSection(item.name.toLowerCase().replace(" ", "-"))}
          >
            <i className={`fas ${item.icon}`}></i>
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

export default PatientPage;

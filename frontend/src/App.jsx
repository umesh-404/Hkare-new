import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css'
import HomePage from './components/home_page/HomePage'
import DoctorLogin from './components/login_pages/DoctorLogin'
import PatientLogin from './components/login_pages/PatientLogin'
import StaffLogin from './components/login_pages/StaffLogin'
import DoctorPage from './components/doctor/DoctorPage'
import PatientPage from './components/patient/PatientPage'
import StaffPage from './components/staff/StaffPage'
import AdminPage from './components/admin/AdminPage'

// Session checker that wraps protected routes
const ProtectedRoute = ({ element, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // If role doesn't match, redirect to appropriate dashboard
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'DOCTOR') {
      return <Navigate to="/doctor-dashboard" replace />;
    } else if (user.role === 'PATIENT') {
      return <Navigate to="/patient-dashboard" replace />;
    } else if (user.role === 'STAFF') {
      return <Navigate to="/staff-dashboard" replace />;
    } else if (user.role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    }
  }
  
  return element;
};

// Login route wrapper that prevents authenticated users from accessing login pages
const LoginRouteGuard = ({ element }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // If user is logged in, redirect to their dashboard
  if (user) {
    if (user.role === 'DOCTOR') {
      return <Navigate to="/doctor-dashboard" replace />;
    } else if (user.role === 'PATIENT') {
      return <Navigate to="/patient-dashboard" replace />;
    } else if (user.role === 'STAFF') {
      return <Navigate to="/staff-dashboard" replace />;
    } else if (user.role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    }
  }
  
  return element;
};

function App() {
  // Check session validity on app load
  useEffect(() => {
    const checkSessionValidity = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.loginTime) {
          const currentTime = new Date().getTime();
          const sessionTime = user.loginTime;
          
          // Session timeout after 12 hours (43200000 ms)
          if (currentTime - sessionTime > 43200000) {
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error("Error checking session validity:", error);
        // If there's an error parsing the user data, clear it
        localStorage.removeItem('user');
      }
    };
    
    checkSessionValidity();
    
    // Check session validity periodically
    const intervalId = setInterval(checkSessionValidity, 15 * 60 * 1000); // Every 15 minutes
    
    // Block navigation to login pages using browser history
    const blockNavigationToLoginPages = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const loginPages = ['/doctor-login', '/patient-login', '/staff-login'];
        if (loginPages.includes(window.location.pathname)) {
          const dashboardUrl = `/${user.role.toLowerCase()}-dashboard`;
          window.history.replaceState(null, '', dashboardUrl);
          window.location.href = dashboardUrl;
        }
      }
    };
    
    // Apply when page loads
    blockNavigationToLoginPages();
    
    // Add event listener for popstate (browser back/forward buttons)
    window.addEventListener('popstate', blockNavigationToLoginPages);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('popstate', blockNavigationToLoginPages);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctor-login" element={<LoginRouteGuard element={<DoctorLogin />} />} />
        <Route path="/patient-login" element={<LoginRouteGuard element={<PatientLogin />} />} />
        <Route path="/staff-login" element={<LoginRouteGuard element={<StaffLogin />} />} />
        <Route 
          path="/doctor-dashboard" 
          element={<ProtectedRoute element={<DoctorPage />} allowedRole="DOCTOR" />} 
        />
        <Route 
          path="/patient-dashboard" 
          element={<ProtectedRoute element={<PatientPage />} allowedRole="PATIENT" />} 
        />
        <Route 
          path="/staff-dashboard" 
          element={<ProtectedRoute element={<StaffPage />} allowedRole="STAFF" />} 
        />
        <Route 
          path="/admin-dashboard" 
          element={<ProtectedRoute element={<AdminPage />} allowedRole="ADMIN" />} 
        />
      </Routes>
    </Router>
  );
}

export default App

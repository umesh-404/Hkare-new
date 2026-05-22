import './PatientLogin.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/client';
import SimpleCaptcha from './SimpleCaptcha';

const PatientLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: ''
  });
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'DOCTOR') {
        navigate('/doctor-dashboard');
      } else if (user.role === 'PATIENT') {
        navigate('/patient-dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff-dashboard');
      }
    }
  }, [navigate]);

  useEffect(() => {
    // Check if there's a success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('This feature is under implementation. Please contact support if you need assistance.');
  };

  const recordLoginHistory = async ({ username, success, failureReason }) => {
    try {
      await api.post('/api/login-history', {
        username,
        ipAddress: '',
        userAgent: navigator.userAgent,
        loginSuccess: success,
        failureReason: failureReason || null,
      });
    } catch (err) {
      console.error('Failed to record login history', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!isCaptchaValid) {
      setError('Please complete the captcha verification');
      return;
    }
    
    setShowLoginOverlay(true);
    setOverlayMessage('Logging in...');
    
    try {
      console.log('Sending login request:', formData);
      const response = await api.post('/api/auth/patient/login', formData);
      console.log('Login response:', response.data);
      console.log('authenticated value:', response.data.authenticated);
      
      // Additional debugging to see all properties
      for (const key in response.data) {
        console.log(`${key}: ${response.data[key]}`);
      }
      
      if (response.data.authenticated === true) {
        // FIRST: Store JWT token and user data in localStorage
        // (must happen before any subsequent API calls so the interceptor uses the new token)
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        const userData = {
          ...response.data,
          role: 'PATIENT',
          loginTime: new Date().getTime()
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // THEN: Record login history (now the fresh token is available)
        await recordLoginHistory({ username: formData.identifier, success: true });
        
        console.log('Navigating to /patient-dashboard');
        setOverlayMessage('Login successful! Redirecting...');
        
        // Use React Router navigate instead of direct location change
        setTimeout(() => {
          navigate('/patient-dashboard');
        }, 1500);
      } else {
        await recordLoginHistory({ username: formData.identifier, success: false, failureReason: response.data.message });
        console.log('Authentication failed:', response.data.message);
        setShowLoginOverlay(false);
        setError(response.data.message || 'Authentication failed');
      }
    } catch (err) {
      await recordLoginHistory({ username: formData.identifier, success: false, failureReason: err.response?.data?.message || err.message || 'Failed to connect to the server' });
      console.error('Login error:', err);
      setShowLoginOverlay(false);
      setError(err.response?.data?.message || err.message || 'Failed to connect to the server');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Basic validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setShowLoginOverlay(true);
    setOverlayMessage('Registering...');
    
    try {
      // Prepare data for API
      const registrationData = {
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        phoneNumber: registerData.phoneNumber || null,
        dateOfBirth: registerData.dateOfBirth ? new Date(registerData.dateOfBirth).toISOString() : null,
        gender: registerData.gender || null
      };
      
      // Send registration request
      const response = await api.post('/api/auth/patient/register', registrationData);
      
      setShowLoginOverlay(false);
      
      if (response.data.success) {
        setSuccessMessage(`Registration successful! Your Patient ID is: ${response.data.roleId}. Please use this ID and your password to login.`);
        setIsRegistering(false);
        // Reset form data
        setRegisterData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          dateOfBirth: '',
          gender: ''
        });
      } else {
        setError(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setShowLoginOverlay(false);
      setError(err.response?.data?.message || err.message || 'An error occurred during registration.');
    }
  };

  return (
    <>
      <header className="login-header">
        <img src="/main-logo.png" alt="Hospital Logo" className="header-logo" />
        <a href="#" onClick={() => navigate('/')} className="home-link">
          Go Back to Home
          <i className="fa-solid fa-right-from-bracket"></i>
        </a>
      </header>

      {/* Login Overlay */}
      {showLoginOverlay && (
        <div className="login-overlay">
          <div className="overlay-content">
            <div className="spinner"></div>
            <p>{overlayMessage}</p>
          </div>
        </div>
      )}

      <div className="login-container">
        <div className="login-section">
          {/* Left Side - Features */}
          <div className="features-section">
            <h3 className="features-title">Patient Portal Features</h3>
            
            <div className="feature-item">
              <i className="fa-solid fa-calendar-plus feature-icon"></i>
              <div className="feature-text">
                <h4>Book Appointments</h4>
                <p>Schedule appointments with doctors at your convenience</p>
              </div>
            </div>

            <div className="feature-item">
              <i className="fa-solid fa-file-medical feature-icon"></i>
              <div className="feature-text">
                <h4>Medical Records</h4>
                <p>Access your complete medical history and test results</p>
              </div>
            </div>

            <div className="feature-item">
              <i className="fa-solid fa-pills feature-icon"></i>
              <div className="feature-text">
                <h4>Prescription History</h4>
                <p>View and download your prescriptions and medications</p>
              </div>
            </div>

            <div className="feature-item">
              <i className="fa-solid fa-comments feature-icon"></i>
              <div className="feature-text">
                <h4>Online Consultation</h4>
                <p>Connect with doctors through virtual consultations</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Register Form */}
          <div className="login-card">
            <h2 className="login-title">
              {isRegistering ? 'Patient Registration' : 'Patient Login'}
            </h2>
            <p className="login-subtitle">
              {isRegistering 
                ? 'Please complete the form to create your account' 
                : 'Please enter your details to login'}
            </p>
            
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            
            {error && (
              <div className="error-message">{error}</div>
            )}
            
            {!isRegistering ? (
              // Login Form
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="identifier">Patient ID or Email</label>
                  <input 
                    type="text" 
                    id="identifier" 
                    name="identifier" 
                    placeholder="Enter your Patient ID or email" 
                    required 
                    value={formData.identifier}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    placeholder="Enter your password" 
                    required 
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <SimpleCaptcha onCaptchaChange={setIsCaptchaValid} />

                <div className="form-links">
                  <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    setIsRegistering(true);
                    setError('');
                    setSuccessMessage('');
                  }}>New User?</a>
                </div>

                <button type="submit" className="login-button">LOGIN</button>
              </form>
            ) : (
              // Registration Form
              <form onSubmit={handleRegisterSubmit} className="login-form register-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="Enter your email" 
                    required 
                    value={registerData.email}
                    onChange={handleRegisterChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      name="firstName" 
                      placeholder="First name" 
                      required 
                      value={registerData.firstName}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      name="lastName" 
                      placeholder="Last name" 
                      required 
                      value={registerData.lastName}
                      onChange={handleRegisterChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phoneNumber" 
                      name="phoneNumber" 
                      placeholder="Phone number" 
                      value={registerData.phoneNumber}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input 
                      type="date" 
                      id="dateOfBirth" 
                      name="dateOfBirth" 
                      value={registerData.dateOfBirth}
                      onChange={handleRegisterChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select 
                    id="gender" 
                    name="gender" 
                    value={registerData.gender}
                    onChange={handleRegisterChange}
                    className="gender-select"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="register-password">Password</label>
                  <input 
                    type="password" 
                    id="register-password" 
                    name="password" 
                    placeholder="Create a password" 
                    required 
                    value={registerData.password}
                    onChange={handleRegisterChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    placeholder="Confirm your password" 
                    required 
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                  />
                </div>

                <div className="form-links">
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    setIsRegistering(false);
                    setError('');
                    setSuccessMessage('');
                  }}>Already have an account? Login</a>
                </div>

                <button type="submit" className="login-button">REGISTER</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientLogin;

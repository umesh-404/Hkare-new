import React, { useState, useEffect } from 'react';
import api from '../../api/client';
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

const Dashboard = ({ patientId }) => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    activePrescriptions: 0,
    lastVisit: null
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sample data for health metrics graph
  const healthMetricsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Weight (kg)',
        data: [75, 74.5, 74, 73.8, 73.5, 73],
        borderColor: '#4CAF50',
        tension: 0.4
      },
      {
        label: 'Blood Pressure (systolic)',
        data: [130, 128, 125, 127, 126, 124],
        borderColor: '#2196F3',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Health Metrics Trend'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchDashboardData(patientId);
    }
  }, [patientId]);

  const fetchDashboardData = async (patientId) => {
    setLoading(true);
    try {
      // Fetch appointments
      const appointmentsResponse = await api.get(`/api/appointments/patient/${patientId}`);
      const appointments = appointmentsResponse.data;
      
      // Get upcoming appointments
      const upcoming = appointments
        .filter(apt => apt.status === 'SCHEDULED')
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 3);
      
      setUpcomingAppointments(upcoming);
      
      // Fetch prescriptions
      const prescriptionsResponse = await api.get(`/api/prescriptions/patient/${patientId}`);
      const prescriptions = prescriptionsResponse.data;
      
      // Get active prescriptions
      const active = prescriptions
        .filter(presc => presc.status === 'ACTIVE')
        .sort((a, b) => new Date(b.prescriptionDate) - new Date(a.prescriptionDate))
        .slice(0, 3);
      
      setRecentPrescriptions(active);
      
      // Fetch medical records
      const recordsResponse = await api.get(`/api/medical-records/patient/${patientId}`);
      const records = recordsResponse.data;
      
      // Get recent records
      const recent = records
        .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate))
        .slice(0, 3);
      
      setRecentRecords(recent);
      
      // Set dashboard statistics
      setStats({
        totalAppointments: appointments.length,
        upcomingAppointments: appointments.filter(apt => apt.status === 'SCHEDULED').length,
        activePrescriptions: prescriptions.filter(presc => presc.status === 'ACTIVE').length,
        lastVisit: records.length > 0 ? records[0].recordDate : null
      });
      
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "N/A";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      {error && <div className="error-message">{error}</div>}
      
      {/* Statistics Cards */}
      <div className="analytics-overview">
        <h3>Health Overview</h3>
        <div className="analytics-cards">
          <div className="analytics-card">
            <div className="card-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="card-content">
              <h4>Total Appointments</h4>
              <p>{stats.totalAppointments}</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="card-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="card-content">
              <h4>Upcoming Appointments</h4>
              <p>{stats.upcomingAppointments}</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="card-icon">
              <i className="fas fa-prescription"></i>
            </div>
            <div className="card-content">
              <h4>Active Prescriptions</h4>
              <p>{stats.activePrescriptions}</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="card-icon">
              <i className="fas fa-stethoscope"></i>
            </div>
            <div className="card-content">
              <h4>Last Visit</h4>
              <p>{formatDate(stats.lastVisit)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Health Metrics Chart */}
      <div className="dashboard-section-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>
              <i className="fas fa-chart-line"></i> Health Metrics
            </h3>
          </div>
          <div className="dashboard-card-body">
            <Line data={healthMetricsData} options={chartOptions} />
          </div>
        </div>
      </div>
      
      {/* Upcoming Appointments */}
      <div className="dashboard-section-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>
              <i className="fas fa-calendar-alt"></i> Upcoming Appointments
            </h3>
          </div>
          <div className="dashboard-card-body">
            {upcomingAppointments.length === 0 ? (
              <div className="no-data-message">
                <p>No upcoming appointments scheduled.</p>
              </div>
            ) : (
              <div className="appointments-list">
                {upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="appointment-item">
                    <div className="appointment-date">
                      <i className="far fa-calendar"></i>
                      <span>{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="appointment-time">
                      <i className="far fa-clock"></i>
                      <span>{formatTime(appointment.appointmentTime)}</span>
                    </div>
                    <div className="appointment-doctor">
                      <i className="fas fa-user-md"></i>
                      <span>Dr. {appointment.doctorName || "Unknown"}</span>
                    </div>
                    <div className="appointment-type">
                      <i className="fas fa-stethoscope"></i>
                      <span>{appointment.appointmentType || "General Check-up"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Prescriptions */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>
              <i className="fas fa-prescription"></i> Active Prescriptions
            </h3>
          </div>
          <div className="dashboard-card-body">
            {recentPrescriptions.length === 0 ? (
              <div className="no-data-message">
                <p>No active prescriptions.</p>
              </div>
            ) : (
              <div className="prescriptions-list">
                {recentPrescriptions.map((prescription, index) => (
                  <div key={index} className="prescription-item">
                    <div className="prescription-date">
                      <i className="far fa-calendar"></i>
                      <span>Prescribed: {formatDate(prescription.prescriptionDate)}</span>
                    </div>
                    <div className="prescription-doctor">
                      <i className="fas fa-user-md"></i>
                      <span>Dr. {prescription.doctorName || "Unknown"}</span>
                    </div>
                    <div className="prescription-meds">
                      <i className="fas fa-pills"></i>
                      <span>
                        {prescription.medications && prescription.medications.length > 0
                          ? prescription.medications.map(med => med.medicationName).join(', ')
                          : 'No medications listed'}
                      </span>
                    </div>
                    <div className="prescription-expiry">
                      <i className="fas fa-hourglass-end"></i>
                      <span>Expires: {formatDate(prescription.expiryDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Medical Records */}
      <div className="dashboard-section-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>
              <i className="fas fa-file-medical"></i> Recent Medical Records
            </h3>
          </div>
          <div className="dashboard-card-body">
            {recentRecords.length === 0 ? (
              <div className="no-data-message">
                <p>No recent medical records found.</p>
              </div>
            ) : (
              <div className="records-list">
                {recentRecords.map((record, index) => (
                  <div key={index} className="record-item">
                    <div className="record-date">
                      <i className="far fa-calendar"></i>
                      <span>{formatDate(record.recordDate)}</span>
                    </div>
                    <div className="record-doctor">
                      <i className="fas fa-user-md"></i>
                      <span>Dr. {record.doctorName || "Unknown"}</span>
                    </div>
                    <div className="record-type">
                      <i className="fas fa-file-medical"></i>
                      <span>{record.recordType.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="record-diagnosis">
                      <i className="fas fa-stethoscope"></i>
                      <span>{record.diagnosis || 'No diagnosis recorded'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Health Tips */}
      <div className="health-tips-section">
        <h3><i className="fas fa-heartbeat"></i> Health Tips & Reminders</h3>
        <div className="health-tips-container">
          <div className="health-tip">
            <i className="fas fa-pills tip-icon"></i>
            <h4>Medication Reminder</h4>
            <p>Remember to take your prescribed medications on time and follow the prescribed dosage.</p>
          </div>
          <div className="health-tip">
            <i className="fas fa-apple-alt tip-icon"></i>
            <h4>Healthy Diet</h4>
            <p>Maintain a balanced diet rich in fruits, vegetables, and whole grains.</p>
          </div>
          <div className="health-tip">
            <i className="fas fa-walking tip-icon"></i>
            <h4>Regular Exercise</h4>
            <p>Aim for at least 30 minutes of moderate physical activity most days of the week.</p>
          </div>
          <div className="health-tip">
            <i className="fas fa-bed tip-icon"></i>
            <h4>Adequate Rest</h4>
            <p>Get 7-9 hours of quality sleep each night for optimal health and recovery.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
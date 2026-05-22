import React, { useState, useEffect } from 'react';
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

const Dashboard = ({ doctorId }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    pendingPrescriptions: 0,
    completedAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sample data for patient visits graph
  const patientVisitsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Patient Visits',
        data: [15, 22, 18, 25, 20, 28],
        fill: false,
        borderColor: '#0066ff',
        tension: 0.4,
        pointBackgroundColor: '#0066ff'
      }
    ]
  };
  
  // Sample data for appointment types
  const appointmentTypesData = {
    labels: ['Follow-up', 'New Patient', 'Emergency', 'Consultation', 'Checkup'],
    datasets: [
      {
        label: 'Appointment Types',
        data: [25, 18, 5, 15, 37],
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#F44336',
          '#FF9800',
          '#9C27B0'
        ],
        borderColor: '#fff',
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
  
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchDashboardData(doctorId);
    }
  }, [doctorId]);

  const fetchDashboardData = async (doctorId) => {
    setLoading(true);
    try {
      // Fetch statistics for the dashboard
      const today = new Date().toISOString().split('T')[0];
      
      // In a real application, these would be API calls to get actual counts
      // For now, we'll simulate the data for demonstration purposes
      
      // Example API calls (commented out for now)
      /*
      const patientsResponse = await axios.get(`http://localhost:8080/api/patients/doctor/${doctorId}/count`);
      const todayAppointmentsResponse = await axios.get(`http://localhost:8080/api/appointments/doctor/${doctorId}?date=${today}`);
      const pendingPrescriptionsResponse = await axios.get(`http://localhost:8080/api/prescriptions/doctor/${doctorId}?status=pending`);
      const completedAppointmentsResponse = await axios.get(`http://localhost:8080/api/appointments/doctor/${doctorId}/completed`);
      
      setStats({
        totalPatients: patientsResponse.data,
        appointmentsToday: todayAppointmentsResponse.data.length,
        pendingPrescriptions: pendingPrescriptionsResponse.data.length,
        completedAppointments: completedAppointmentsResponse.data
      });
      */
      
      // Simulated data for demonstration
      setStats({
        totalPatients: 78,
        appointmentsToday: 8,
        pendingPrescriptions: 5,
        completedAppointments: 345
      });
      
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      {error && <div className="error-message">{error}</div>}
      
      {/* Statistics Cards */}
      <div className="analytics-overview">
        <h3>Doctor Overview</h3>
        <div className="analytics-cards">
          <div className="analytics-card">
            <div className="card-icon">
              <i className="fas fa-hospital-user"></i>
            </div>
            <div className="card-content">
              <h4>My Patients</h4>
              <p>{stats.totalPatients}</p>
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
              <p>{stats.appointmentsToday}</p>
              <span className="trend neutral">
                <i className="fas fa-equals"></i> Same as yesterday
              </span>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="card-icon">
              <i className="fas fa-prescription"></i>
            </div>
            <div className="card-content">
              <h4>Pending Prescriptions</h4>
              <p>{stats.pendingPrescriptions}</p>
              <span className="trend down">
                <i className="fas fa-arrow-down"></i> 2 fewer than yesterday
              </span>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="card-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="card-content">
              <h4>Completed Consultations</h4>
              <p>{stats.completedAppointments}</p>
              <span className="trend up">
                <i className="fas fa-arrow-up"></i> 8 more this week
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Monthly Patient Visits</h3>
          <div className="chart-wrapper">
            <Line data={patientVisitsData} options={lineOptions} />
          </div>
        </div>
        
        <div className="chart-container">
          <h3>Appointment Types</h3>
          <div className="chart-wrapper">
            <Bar data={appointmentTypesData} options={pieOptions} />
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
            <div className="activity-content">
              <p>New patient referral from Dr. Sharma</p>
              <span className="activity-time">30 minutes ago</span>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-file-medical"></i>
            </div>
            <div className="activity-content">
              <p>Updated medical records for patient ID 12345</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="activity-content">
              <p>Completed appointment with Anjali Gupta</p>
              <span className="activity-time">Yesterday</span>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-prescription"></i>
            </div>
            <div className="activity-content">
              <p>Issued prescription for Rahul Patel</p>
              <span className="activity-time">Yesterday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
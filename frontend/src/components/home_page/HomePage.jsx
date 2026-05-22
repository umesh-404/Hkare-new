import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage-New.css";

const HomePage = () => {
    const navigate = useNavigate();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [redirectTarget, setRedirectTarget] = useState('');
    const [loginNotification, setLoginNotification] = useState({ show: false, message: '', type: '' });
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [logoutRedirectRole, setLogoutRedirectRole] = useState('');
    const [showEmergencyNumbers, setShowEmergencyNumbers] = useState(false);

    const teamMembers = [
        { name: "Dr. Sri Karthikey", role: "Chief Medical Officer", initials: "SK", color: "#1a6db5" },
        { name: "Dr. Pradeep", role: "Head of Cardiology", initials: "PR", color: "#0e8a6e" },
        { name: "Dr. Akhil", role: "Head of Neurology", initials: "AK", color: "#7c3aed" },
        { name: "Dr. Karthik", role: "Chief of Surgery", initials: "KA", color: "#c2410c" },
        { name: "Dr. Agastha", role: "Head of Paediatrics", initials: "AG", color: "#0369a1" },
    ];

    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.role) {
                setLoggedInUser(user);
            }
        } catch (error) {
            localStorage.removeItem('user');
        }
    }, []);

    const handleLogout = (redirectToLogin = false, role = '') => {
        setIsRedirecting(true);
        setRedirectTarget('logout');
        setTimeout(() => {
            localStorage.removeItem('user');
            setLoggedInUser(null);
            if (redirectToLogin && role) {
                navigate(`/${role.toLowerCase()}-login`);
            } else {
                setIsRedirecting(false);
                window.location.reload();
            }
        }, 1500);
    };

    const handleLoginClick = (role) => {
        if (loggedInUser) {
            const currentRole = loggedInUser.role;
            if (currentRole === role.toUpperCase()) {
                setLoginNotification({ show: true, message: `You are already logged in as ${currentRole}. Redirecting to dashboard...`, type: 'info' });
                setIsRedirecting(true);
                setRedirectTarget(role);
                setTimeout(() => { navigate(`/${role.toLowerCase()}-dashboard`); }, 2000);
                return;
            } else {
                setLogoutRedirectRole(role);
                setShowLogoutConfirm(true);
                return;
            }
        }
        setIsRedirecting(true);
        setRedirectTarget(role);
        setTimeout(() => { navigate(`/${role.toLowerCase()}-login`); }, 1200);
    };

    // Custom smooth scrolling function for slower, graceful scroll
    const handleNavigation = (e, targetId) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            const startPosition = window.pageYOffset;
            const distance = offsetPosition - startPosition;
            const duration = 1200; // 1.2 seconds for slow scroll
            let start = null;

            window.requestAnimationFrame(function step(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                // easeInOutCubic formula for smooth start and end
                const ease = progress < duration / 2 
                    ? 4 * Math.pow(progress / duration, 3) 
                    : 1 - Math.pow(-2 * progress / duration + 2, 3) / 2;
                
                window.scrollTo(0, startPosition + distance * ease);
                
                if (progress < duration) {
                    window.requestAnimationFrame(step);
                } else {
                    window.scrollTo(0, offsetPosition);
                }
            });
        }
    };

    return (
        <>
            {isRedirecting && (
                <div className="redirect-overlay">
                    <div className="loading-spinner"></div>
                    <p>{redirectTarget === 'logout' ? 'Logging out...' : `Redirecting to ${redirectTarget.toLowerCase()} login...`}</p>
                </div>
            )}

            {loginNotification.show && (
                <div className={`login-notification ${loginNotification.type}`}>
                    <i className={`fas ${loginNotification.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}></i>
                    <p>{loginNotification.message}</p>
                </div>
            )}

            {showLogoutConfirm && (
                <div className="popup-overlay">
                    <div className="popup-content logout-confirm">
                        <h2>You are already logged in</h2>
                        <p>You are currently logged in as <strong>{loggedInUser?.role}</strong>. Would you like to logout and switch?</p>
                        <div className="logout-actions">
                            <button className="logout-btn" onClick={() => handleLogout(true, logoutRedirectRole)}>
                                Logout &amp; go to {logoutRedirectRole} Login
                            </button>
                            <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="home-page-new">

                {/* ── STICKY EMERGENCY SIDEBAR ── */}
                <div className={`emergency-sidebar ${showEmergencyNumbers ? 'open' : ''}`}>
                    <div className="emergency-panel">
                        <button className="close-emergency" onClick={() => setShowEmergencyNumbers(false)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <div className="emergency-list">
                            <a href="tel:+918885365773"><span>MAIN:</span> +91 8885365773</a>
                            <a href="tel:+919492134488"><span>AMBULANCE:</span> +91 9492134488</a>
                            <a href="tel:+918885678360"><span>TRAUMA:</span> +91 8885678360</a>
                            <a href="tel:+918978727901"><span>ICU:</span> +91 8978727901</a>
                            <a href="tel:+919948328877"><span>BLOOD BANK:</span> +91 9948328877</a>
                        </div>
                    </div>
                    <div 
                        className="emergency-tab" 
                        onClick={() => setShowEmergencyNumbers(!showEmergencyNumbers)}
                    >
                        E<br/>M<br/>E<br/>R<br/>G<br/>E<br/>N<br/>C<br/>Y
                    </div>
                </div>

                {/* ── HERO ── Full screen background image */}
                <section className="hkare-hero">
                    {/* Transparent header sits on top of hero */}
                    <header className="hkare-header">
                        <div className="header-wrapper">
                            {/* Empty space to keep flex layout balanced after removing logo */}
                            <div className="logo-placeholder"></div>
                            
                            <div className="header-right">
                                <nav className="header-nav">
                                    <a href="#portals" onClick={(e) => handleNavigation(e, 'portals')}>PORTALS</a>
                                    <a href="#services" onClick={(e) => handleNavigation(e, 'services')}>SERVICES</a>
                                    <a href="#team" onClick={(e) => handleNavigation(e, 'team')}>TEAM</a>
                                    <a href="#about" onClick={(e) => handleNavigation(e, 'about')}>ABOUT</a>
                                </nav>
                                <div className="contact-buttons-nav">
                                    <a href="tel:+918885365773" className="nav-call-btn">
                                        <i className="fa-solid fa-phone-volume"></i> 24/7: +91 8885365773
                                    </a>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Centered logo on hero */}
                    <div className="hero-center">
                        <img src="/main-logo.png" alt="HKare" className="hero-main-logo" />
                        <p className="hero-tagline">Advanced Healthcare. Compassionate Care.</p>
                        <div className="hero-scroll-hint">
                            <span>Access Your Portal</span>
                            <i className="fa-solid fa-chevron-down bounce"></i>
                        </div>
                    </div>
                </section>

                {/* ── PORTALS ── */}
                <section id="portals" className="hkare-portals">
                    <div className="portals-container">
                        <h2 className="section-title">Access Your Portal</h2>
                        <p className="section-sub">Select your role to log in and access your personalised dashboard</p>
                        <div className="portals-grid">
                            <div className="portal-card doctor-card" onClick={() => handleLoginClick('DOCTOR')}>
                                <div className="portal-icon-wrap">
                                    <i className="fa-solid fa-user-doctor"></i>
                                </div>
                                <h3>Doctor Portal</h3>
                                <p>Manage patients, appointments &amp; prescriptions</p>
                                <div className="portal-arrow"><i className="fa-solid fa-arrow-right"></i></div>
                            </div>

                            <div className="portal-card patient-card" onClick={() => handleLoginClick('PATIENT')}>
                                <div className="portal-icon-wrap">
                                    <i className="fa-solid fa-bed-pulse"></i>
                                </div>
                                <h3>Patient Portal</h3>
                                <p>View records, book appointments &amp; track health</p>
                                <div className="portal-arrow"><i className="fa-solid fa-arrow-right"></i></div>
                            </div>

                            <div className="portal-card staff-card" onClick={() => handleLoginClick('STAFF')}>
                                <div className="portal-icon-wrap">
                                    <i className="fa-solid fa-id-badge"></i>
                                </div>
                                <h3>Staff Portal</h3>
                                <p>Operations, scheduling &amp; hospital management</p>
                                <div className="portal-arrow"><i className="fa-solid fa-arrow-right"></i></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── SERVICES ── */}
                <section id="services" className="hkare-services">
                    <div className="container">
                        <h2 className="section-title light">Our Services</h2>
                        <p className="section-sub light">World-class healthcare delivered with precision and compassion</p>
                        <div className="services-grid">
                            {[
                                { icon: "fa-heart-pulse", title: "Comprehensive Care", desc: "Integrated primary care with preventive medicine and specialty services." },
                                { icon: "fa-user-doctor", title: "Expert Physicians", desc: "Board-certified doctors with extensive experience in their respective fields." },
                                { icon: "fa-stethoscope", title: "Personalised Treatment", desc: "Tailored treatment plans designed around your unique health goals." },
                                { icon: "fa-hospital", title: "Modern Facilities", desc: "State-of-the-art hospital infrastructure and cutting-edge medical technology." },
                                { icon: "fa-calendar-check", title: "24/7 Availability", desc: "Flexible scheduling with same-day emergency appointments available." },
                                { icon: "fa-lock", title: "Patient Privacy", desc: "HIPAA-compliant systems ensuring total security of your health data." },
                            ].map((s, i) => (
                                <div className="service-card" key={i}>
                                    <i className={`fa-solid ${s.icon}`}></i>
                                    <h3>{s.title}</h3>
                                    <p>{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── TEAM ── */}
                <section id="team" className="hkare-team">
                    <div className="container">
                        <h2 className="section-title">Meet Our Leadership</h2>
                        <p className="section-sub">The trusted experts driving excellence at HKare</p>
                        <div className="team-grid">
                            {teamMembers.map((doc, i) => (
                                <div className="team-card" key={i}>
                                    <div className="team-avatar" style={{ background: `linear-gradient(135deg, ${doc.color}cc, ${doc.color})` }}>
                                        <span>{doc.initials}</span>
                                    </div>
                                    <h3>{doc.name}</h3>
                                    <p className="team-role">{doc.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── ABOUT / WHY ── */}
                <section id="about" className="hkare-why">
                    <div className="container">
                        <h2 className="section-title light">Why Choose HKare?</h2>
                        <div className="why-grid">
                            {[
                                { n: "01", title: "Patient-Centered", desc: "Your health and comfort are always our top priority." },
                                { n: "02", title: "Integrated Services", desc: "Seamless coordination across all hospital departments." },
                                { n: "03", title: "Innovation-Driven", desc: "Leveraging the latest medical research and technology." },
                                { n: "04", title: "Compassionate Team", desc: "Dedicated staff offering both clinical and emotional support." },
                            ].map((w, i) => (
                                <div className="why-card" key={i}>
                                    <span className="why-number">{w.n}</span>
                                    <h3>{w.title}</h3>
                                    <p>{w.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="hkare-footer">
                    <div className="container">
                        <div className="footer-grid">
                            <div className="footer-col">
                                <img src="/main-logo.png" alt="HKare" className="footer-logo" />
                                <p>Your trusted partner in health and wellness.</p>
                            </div>
                            <div className="footer-col">
                                <h4>Quick Links</h4>
                                <ul>
                                    <li><a href="#portals" onClick={(e) => handleNavigation(e, 'portals')}>Portals</a></li>
                                    <li><a href="#services" onClick={(e) => handleNavigation(e, 'services')}>Services</a></li>
                                    <li><a href="#team" onClick={(e) => handleNavigation(e, 'team')}>Team</a></li>
                                    <li><a href="#about" onClick={(e) => handleNavigation(e, 'about')}>About</a></li>
                                </ul>
                            </div>
                            <div className="footer-col">
                                <h4>Contact</h4>
                                <p>📧 HKare@gmail.com</p>
                                <p>📞 +91 8885365773</p>
                            </div>
                        </div>
                        <div className="footer-bottom">
                            <p>&copy; 2026 HKare Hospital. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
};

export default HomePage;
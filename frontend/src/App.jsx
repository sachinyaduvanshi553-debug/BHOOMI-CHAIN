import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicVerify from './pages/PublicVerify';
import Marketplace from './pages/Marketplace';
import Certificate from './pages/Certificate';
import CitizenDashboard from './pages/CitizenDashboard';
import RegistrarDashboard from './pages/RegistrarDashboard';
import BankDashboard from './pages/BankDashboard';
import CourtDashboard from './pages/CourtDashboard';

// Simple Error Boundary to catch runtime crashes
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4444', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ fontWeight: 800 }}>Application Exception</h1>
                    <p style={{ color: '#aaa', marginTop: '1rem', maxWidth: '500px' }}>{this.state.error?.toString()}</p>
                    <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="btn btn-primary" style={{ marginTop: '2rem' }}>Reset Session & Restart</button>
                </div>
            );
        }
        return this.props.children;
    }
}

const App = () => {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <BrowserRouter>
                    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                        <Navbar />
                        <main style={{ flex: 1 }}>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/verify" element={<PublicVerify />} />
                                <Route path="/register" element={<Register />} />

                                {/* Role-Based Protected Routes */}
                                <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
                                    <Route path="/citizen" element={<CitizenDashboard />} />
                                    <Route path="/marketplace" element={<Marketplace />} />
                                    <Route path="/certificate/:landID" element={<Certificate />} />
                                </Route>

                                <Route element={<ProtectedRoute allowedRoles={['registrar']} />}>
                                    <Route path="/registrar" element={<RegistrarDashboard />} />
                                </Route>

                                <Route element={<ProtectedRoute allowedRoles={['bank']} />}>
                                    <Route path="/bank" element={<BankDashboard />} />
                                </Route>

                                <Route element={<ProtectedRoute allowedRoles={['court']} />}>
                                    <Route path="/court" element={<CourtDashboard />} />
                                </Route>

                                {/* Dashboard Redirection Proxy */}
                                <Route path="/dashboard" element={<DashboardRedirect />} />

                                <Route path="/unauthorized" element={
                                    <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
                                        <h1 className="glow-text" style={{ fontSize: '5rem', fontWeight: 800 }}>403</h1>
                                        <h2 style={{ marginBottom: '1rem' }}>Access Denied</h2>
                                        <p style={{ color: 'hsl(var(--text-dim))' }}>Security Protocol: Your identity does not have administrative clearance for this zone.</p>
                                        <button onClick={() => window.history.back()} className="btn btn-outline" style={{ marginTop: '2rem' }}>Back to Safety</button>
                                    </div>
                                } />

                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </main>
                    </div>
                </BrowserRouter>
            </AuthProvider>
        </ErrorBoundary>
    );
};

// Specialized component for smart dashboard routing
const DashboardRedirect = () => {
    const auth = useAuth();
    if (!auth || auth.loading) {
        return (
            <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
                <div className="badge badge-pending">Synchronizing Ledger...</div>
            </div>
        );
    }

    const { user, isAuthenticated } = auth;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    switch (user.role) {
        case 'citizen': return <Navigate to="/citizen" replace />;
        case 'registrar': return <Navigate to="/registrar" replace />;
        case 'bank': return <Navigate to="/bank" replace />;
        case 'court': return <Navigate to="/court" replace />;
        default: return <Navigate to="/login" replace />;
    }
};

export default App;

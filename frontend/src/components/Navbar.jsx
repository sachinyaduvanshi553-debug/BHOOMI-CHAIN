import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Don't show complex nav on Landing Page if not logged in
    const isLanding = location.pathname === '/';

    return (
        <nav style={{
            padding: '1.25rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: isLanding ? 'transparent' : 'hsl(var(--bg) / 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: isLanding ? 'none' : '1px solid var(--border)'
        }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'white', fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'hsl(var(--primary))' }}>Bhoomi</span>Chain
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {!isAuthenticated ? (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/login" className="btn btn-outline" style={{ padding: '0.6rem 1.25rem' }}>Login</Link>
                        <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>Get Started</Link>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', opacity: location.pathname.includes('dashboard') ? 1 : 0.6 }}>Dashboard</Link>
                            <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', opacity: 0.6 }}>Certificate</Link>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{user.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--primary))', fontWeight: 600, textTransform: 'uppercase' }}>{user.role}</div>
                            </div>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '0.75rem' }}>
                                Sign Out
                            </button>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

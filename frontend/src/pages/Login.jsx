import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.user, data.token);

            // Navigate to respective dashboard
            switch (data.user.role) {
                case 'citizen': navigate('/citizen'); break;
                case 'registrar': navigate('/registrar'); break;
                case 'bank': navigate('/bank'); break;
                case 'court': navigate('/court'); break;
                default: navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>BhoomiChain</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Blockchain-Based Land Registry</p>
                </div>

                {error && (
                    <div className="badge badge-error" style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'center', padding: '0.75rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="e.g. ramesh@bhoomichain.in"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'hsl(var(--text-dim))' }}>
                    <p>New to BhoomiChain? <Link to="/register" style={{ color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: 600 }}>Create Account</Link></p>
                    <hr style={{ margin: '1.5rem 0', opacity: 0.1 }} />
                    <p>Demo Credentials (see database/seed.js):</p>
                    <code style={{ fontSize: '0.75rem', display: 'block', marginTop: '0.5rem' }}>
                        citizen: ramesh@bhoomichain.in / Citizen@1234
                    </code>
                </div>
            </div>
        </div>
    );
};

export default Login;

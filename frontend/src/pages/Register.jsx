import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'citizen',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/register', formData);
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
            setError(err.response?.data?.message || 'Registration failed. Please check details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Account</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Join the BhoomiChain Land Registry</p>
                </div>

                {error && (
                    <div className="badge badge-error" style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'center', padding: '0.75rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <input
                            name="name"
                            className="input"
                            placeholder="e.g. Ramesh Singh"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            className="input"
                            placeholder="ramesh@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            name="password"
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">System Role</label>
                        <select
                            name="role"
                            className="input"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="citizen">Citizen (Owner)</option>
                            <option value="registrar">Registrar (Admin)</option>
                            <option value="bank">Bank (Lien Auth)</option>
                            <option value="court">Court (Litigation Auth)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1.5rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Blockchain Identity...' : 'Register'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'hsl(var(--text-dim))' }}>
                    Already have an account? <Link to="/login" style={{ color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;

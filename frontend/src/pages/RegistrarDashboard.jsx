import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RegistrarDashboard = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        landID: '',
        ownerEmail: '',
        area: '',
        geoCoordinates: '',
        value: '',
    });
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: 'pending', msg: 'Broadcasting to Blockchain nodes...' });

        const data = new FormData();
        data.append('landID', formData.landID);
        data.append('owner', formData.ownerEmail);
        data.append('area', formData.area);
        data.append('geoCoordinates', formData.geoCoordinates);
        data.append('value', formData.value);
        if (file) data.append('document', file);

        try {
            const res = await api.post('/land/register-land', data);
            const txID = res.data.data?.txID || 'N/A';
            setStatus({ type: 'success', msg: `Successfully Registered! Block ID: ${txID.substring(0, 12)}...` });
            setFormData({ landID: '', ownerEmail: '', area: '', geoCoordinates: '', value: '' });
            setFile(null);
        } catch (err) {
            console.error('Registration Error:', err);
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Transaction Failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade">
            <header style={{ marginBottom: '3rem' }}>
                <h1 className="glow-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Authority Operations</h1>
                <p style={{ color: 'hsl(var(--text-dim))' }}>Registrar Office: <span style={{ color: 'hsl(var(--primary))' }}>North Region Hub</span></p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', alignItems: 'start' }}>
                {/* --- Registration Form --- */}
                <div className="glass-panel" style={{ padding: '3rem' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Initialize New Land Asset</h2>
                        <p style={{ color: 'hsl(var(--text-dim))' }}>Enter the legal specifications for on-chain minting.</p>
                    </div>

                    {status.msg && (
                        <div className={`badge badge-${status.type}`} style={{ width: '100%', marginBottom: '2rem', padding: '1rem', justifyContent: 'center' }}>
                            {status.type === 'pending' && <span className="spinner" style={{ marginRight: '0.75rem' }}></span>}
                            {status.msg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="label">Unique Land ID</label>
                            <input className="input" placeholder="e.g. BLR-IND-7782" value={formData.landID} onChange={e => setFormData({ ...formData, landID: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="label">Owner Identity (Email)</label>
                            <input className="input" placeholder="owner@email.com" value={formData.ownerEmail} onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="label">Area (Sq. Yards)</label>
                            <input className="input" placeholder="1200" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="label">Geo-Coordinates</label>
                            <input className="input" placeholder="12.9716° N, 77.5946° E" value={formData.geoCoordinates} onChange={e => setFormData({ ...formData, geoCoordinates: e.target.value })} required />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="label">Legal Title Deed (PDF)</label>
                            <div style={{ position: 'relative' }}>
                                <input type="file" className="input" style={{ opacity: 0, position: 'absolute', zIndex: 2, cursor: 'pointer' }} onChange={e => setFile(e.target.files[0])} />
                                <div className="input" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'hsl(var(--primary) / 0.05)', borderColor: 'hsl(var(--primary) / 0.3)' }}>
                                    <span>📁</span> {file ? file.name : 'Choose signed deed...'}
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2', marginTop: '1rem', padding: '1.25rem' }} disabled={loading}>
                            {loading ? 'Processing Blockchain Tx...' : 'Finalize Ledger Entry'}
                        </button>
                    </form>
                </div>

                {/* --- Sidebar Info --- */}
                <aside>
                    <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid hsl(var(--primary))' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Protocol Check</h3>
                        <ul style={{ paddingLeft: '1.25rem', color: 'hsl(var(--text-dim))', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                            <li>Verify 7/12 records manually</li>
                            <li>Ensure Geo-hash uniqueness</li>
                            <li>Signed by Zonal Registrar</li>
                        </ul>
                    </div>

                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Live Network Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <NetworkStat label="Nodes Online" value="12" color="var(--secondary)" />
                            <NetworkStat label="Avg Block Time" value="214ms" color="var(--primary)" />
                            <NetworkStat label="Queue Capacity" value="98%" color="var(--secondary)" />
                        </div>
                    </div>
                </aside>
            </div>

            <style>{`
                .spinner { width: 14px; height: 14px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; display: inline-block; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const NetworkStat = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-dim))' }}>{label}</span>
        <span style={{ fontWeight: 700, color: `hsl(${color})` }}>{value}</span>
    </div>
);

export default RegistrarDashboard;

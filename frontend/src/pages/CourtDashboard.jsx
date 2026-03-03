import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CourtDashboard = () => {
    const { user } = useAuth();
    const [landID, setLandID] = useState('');
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    const handleLitigation = async (isActive) => {
        setLoading(true);
        setStatus({ type: 'pending', msg: `Updating Judicial Ledger...` });
        try {
            await api.post(`/court/litigation`, { landID, status: isActive, details: reason });
            setStatus({ type: 'success', msg: `Land Asset ${isActive ? 'Frozen' : 'Released'} by Court Order` });
            setLandID('');
            setReason('');
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Judicial Protocol Error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade">
            <header style={{ marginBottom: '3rem' }}>
                <h1 className="glow-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Judicial Oversight</h1>
                <p style={{ color: 'hsl(var(--text-dim))' }}>District Court Authority: <span style={{ color: 'hsl(var(--primary))' }}>Registry Litigation Cell</span></p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 400px', gap: '3rem' }}>
                <div className="glass-panel" style={{ padding: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Litigation Management</h2>

                    {status.msg && (
                        <div className={`badge badge-${status.type}`} style={{ width: '100%', marginBottom: '2rem', padding: '1rem', justifyContent: 'center' }}>
                            {status.msg}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="label">Disputed Asset ID</label>
                        <input className="input" placeholder="e.g. BHOOMI-BLR-123" value={landID} onChange={e => setLandID(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="label">Court Order Justification</label>
                        <textarea className="input" style={{ minHeight: '120px', resize: 'vertical' }} placeholder="Case No. 445/2026: Stay order issued due to inheritance dispute..." value={reason} onChange={e => setReason(e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button onClick={() => handleLitigation(true)} className="btn" style={{ flex: 1, background: 'hsl(0 100% 60% / 0.15)', color: '#ff6b6b', border: '1px solid #ff6b6b' }} disabled={loading}>
                            Issue Stay Order (Freeze)
                        </button>
                        <button onClick={() => handleLitigation(false)} className="btn btn-outline" style={{ flex: 1 }} disabled={loading}>
                            Lift Litigation Status
                        </button>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Active Disputes</h3>
                    <div className="glass-panel" style={{ background: 'transparent', borderStyle: 'dashed', padding: '1.5rem', fontSize: '0.85rem' }}>
                        <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                            <div style={{ fontWeight: 800 }}>BHOOMI-DXB-998</div>
                            <div style={{ color: 'hsl(var(--text-dim))' }}>Case: Inheritance Dispute</div>
                        </div>
                        <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                            <div style={{ fontWeight: 800 }}>BHOOMI-MYS-002</div>
                            <div style={{ color: 'hsl(var(--text-dim))' }}>Case: Boundary Violation</div>
                        </div>
                        <div style={{ textAlign: 'center', color: 'hsl(var(--primary))', fontWeight: 600 }}>+ 14 more pending cases</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourtDashboard;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BankDashboard = () => {
    const { user } = useAuth();
    const [landID, setLandID] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    const handleLien = async (type) => {
        setLoading(true);
        setStatus({ type: 'pending', msg: `Communicating with Ledger...` });
        try {
            await api.post(`/bank/${type}`, { landID, loanDetails: { amount, bankName: 'SBI Central' } });
            setStatus({ type: 'success', msg: `Asset ${type === 'mortgage' ? 'Collateralized' : 'Released'} Successfully` });
            setLandID('');
            setAmount('');
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Authorization Denied' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade">
            <header style={{ marginBottom: '3rem' }}>
                <h1 className="glow-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Financial Lien Portal</h1>
                <p style={{ color: 'hsl(var(--text-dim))' }}>Authorized Financial Institution: <span style={{ color: 'hsl(var(--primary))' }}>State Bank of India</span></p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 400px', gap: '3rem' }}>
                <div className="glass-panel" style={{ padding: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Collateral Management</h2>

                    {status.msg && (
                        <div className={`badge badge-${status.type}`} style={{ width: '100%', marginBottom: '2rem', padding: '1rem', justifyContent: 'center' }}>
                            {status.msg}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="label">On-Chain Asset ID</label>
                        <input className="input" placeholder="e.g. BHOOMI-BLR-123" value={landID} onChange={e => setLandID(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="label">Loan Appraisal Value (₹)</label>
                        <input className="input" placeholder="5,000,000" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button onClick={() => handleLien('mortgage')} className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                            Impose Mortgage Lien
                        </button>
                        <button onClick={() => handleLien('release')} className="btn btn-outline" style={{ flex: 1 }} disabled={loading}>
                            Release Collateral
                        </button>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Lien Analytics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <MetricItem label="Active Mortgages" value="452" trend="+12%" />
                        <MetricItem label="Total Exposure" value="₹4.2 Cr" trend="+5.4%" />
                        <MetricItem label="Default Risk" value="Low" trend="Stable" />
                    </div>
                    <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'hsl(var(--primary) / 0.05)', borderRadius: '1rem', fontSize: '0.85rem', color: 'hsl(var(--text-dim))' }}>
                        ⚖️ Note: Imposing a lien restricts all on-chain title transfers until the bank releases the smart contract lock.
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricItem = ({ label, value, trend }) => (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--text-dim))', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            <span>{label}</span>
            <span style={{ color: 'hsl(var(--secondary))' }}>{trend}</span>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{value}</div>
    </div>
);

export default BankDashboard;

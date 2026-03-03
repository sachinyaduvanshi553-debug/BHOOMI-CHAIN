import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Marketplace = () => {
    const { user } = useAuth();
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', msg: '' });

    useEffect(() => {
        fetchMarketplace();
    }, []);

    const fetchMarketplace = async () => {
        try {
            const res = await api.get('/land/marketplace/all');
            setLands(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (landID) => {
        if (!window.confirm(`Are you sure you want to purchase asset ${landID}? This transaction is immutable.`)) return;

        setLoading(true);
        setStatus({ type: 'pending', msg: 'Executing Atomic Swap on Ledger...' });

        try {
            await api.post('/land/buy-land', { landID });
            setStatus({ type: 'success', msg: 'Asset Purchased Successfully! Ownership transferred.' });
            fetchMarketplace();
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Transaction Failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade">
            <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
                <h1 className="glow-text" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Asset Marketplace</h1>
                <p style={{ color: 'hsl(var(--text-dim))', fontSize: '1.1rem' }}>
                    Browse and acquire verified land parcels directly on the blockchain.
                </p>
            </header>

            {status.msg && (
                <div className={`badge badge-${status.type}`} style={{ width: '100%', marginBottom: '3rem', padding: '1.25rem', justifyContent: 'center', fontSize: '1rem' }}>
                    {status.msg}
                </div>
            )}

            {loading && lands.length === 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
                    {[1, 2, 3].map(i => <div key={i} className="glass-card" style={{ height: '300px', opacity: 0.1, animation: 'pulse 1.5s infinite' }}></div>)}
                </div>
            ) : lands.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
                    {lands.map((land, i) => (
                        <div key={i} className="glass-card animate-slide-up" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ height: '160px', background: 'hsl(var(--primary) / 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', borderBottom: '1px solid var(--border)' }}>
                                🏘️
                            </div>
                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--primary))', letterSpacing: '0.1em' }}>LEDGER ID</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{land.landID}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-dim))' }}>ASKING PRICE</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--secondary))' }}>₹{land.askingPrice.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'hsl(var(--text-dim))' }}>Coordinates</span>
                                        <span style={{ fontWeight: 600 }}>{land.geoCoordinates}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'hsl(var(--text-dim))' }}>Verification Status</span>
                                        <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>✅ TITLE CLEAR</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1rem' }}
                                    onClick={() => handleBuy(land.landID)}
                                    disabled={loading}
                                >
                                    Purchase Asset
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '6rem', border: '1px dashed var(--border)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🏜️</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Marketplace Empty</h2>
                    <p style={{ color: 'hsl(var(--text-dim))', maxWidth: '400px', margin: '0 auto' }}>
                        No land parcels are currently listed for sale. Check back soon for new listings directly from verified owners.
                    </p>
                </div>
            )}

            <style>{`
                @keyframes pulse { 0% { opacity: 0.1; } 50% { opacity: 0.2; } 100% { opacity: 0.1; } }
            `}</style>
        </div>
    );
};

export default Marketplace;

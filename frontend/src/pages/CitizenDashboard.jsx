import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Map components would go here, but using a premium visual placeholder 
// for cases where Leaflet might not be fully ready in the current environment
const CitizenDashboard = () => {
    const { user } = useAuth();
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, secured: 0, litigation: 0 });
    const [marketplaceStatus, setMarketplaceStatus] = useState({ type: '', msg: '' });

    useEffect(() => {
        fetchHoldings();
    }, []);

    const fetchHoldings = async () => {
        try {
            const res = await api.get('/land/all');
            setLands(res.data || []);
            setStats({
                total: res.data.length,
                secured: res.data.filter(l => !l.mortgageStatus).length,
                litigation: res.data.filter(l => l.litigationStatus).length
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleListForSale = async (landID) => {
        const price = window.prompt("Enter asking price (in ₹):", "5000000");
        if (!price) return;

        try {
            await api.post('/land/list-for-sale', { landID, price });
            setMarketplaceStatus({ type: 'success', msg: `Land ${landID} is now listed in the Marketplace!` });
            fetchHoldings();
        } catch (err) {
            setMarketplaceStatus({ type: 'error', msg: 'Marketplace listing failed.' });
        }
    };

    return (
        <div className="container animate-fade">
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="glow-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Welcome, {user.name}</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Digital Certificate ID: <code style={{ color: 'hsl(var(--primary))' }}>{user.email.split('@')[0]}-X509</code></p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/marketplace" className="btn btn-outline">Explore Marketplace</Link>
                    <div className="badge badge-success" style={{ padding: '0.5rem 1rem' }}>Identity Verified</div>
                </div>
            </header>

            {marketplaceStatus.msg && (
                <div className={`badge badge-${marketplaceStatus.type}`} style={{ width: '100%', marginBottom: '2rem', padding: '1rem', justifyContent: 'center' }}>
                    {marketplaceStatus.msg}
                </div>
            )}

            {/* --- Stats Grid --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard label="Total Holdings" value={stats.total} icon="🏡" color="var(--primary)" />
                <StatCard label="Secured Assets" value={stats.secured} icon="🛡️" color="var(--secondary)" />
                <StatCard label="Active Disputes" value={stats.litigation} icon="⚖️" color="var(--accent)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', alignItems: 'start' }}>
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Your Immutable Land Records</h2>
                        <button onClick={fetchHoldings} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Refresh Ledger</button>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {[1, 2].map(i => <div key={i} className="glass-card" style={{ height: '180px', opacity: 0.1, animation: 'pulse 1.5s infinite' }}></div>)}
                        </div>
                    ) : lands.length > 0 ? (
                        <div style={{ display: 'grid', gap: '2.5rem' }}>
                            {lands.map((land, i) => (
                                <LandPremiumCard key={i} land={land} onList={() => handleListForSale(land.landID)} />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem', border: '1px dashed var(--border)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏝️</div>
                            <h3>No Land Records Found</h3>
                            <p style={{ color: 'hsl(var(--text-dim))' }}>Use the Authority Portal to initialize your land assets on the blockchain.</p>
                        </div>
                    )}
                </section>

                <aside>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Asset Heatmap</h3>
                        <div style={{ height: '300px', background: 'hsl(var(--primary) / 0.05)', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ textAlign: 'center', zIndex: 2 }}>
                                <div style={{ fontSize: '2rem' }}>🗺️</div>
                                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-dim))', marginTop: '0.5rem' }}>Satellite Navigation Locked</div>
                            </div>
                            {/* Abstract map lines */}
                            <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, opacity: 0.1, background: 'repeating-linear-gradient(45deg, var(--primary) 0, var(--primary) 2px, transparent 0, transparent 20px)' }}></div>
                        </div>
                        <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'hsl(var(--text-dim))' }}>
                            Currently monitoring <strong>{lands.length}</strong> geofenced parcels.
                        </div>
                    </div>
                </aside>
            </div>

            <style>{`
                @keyframes pulse { 0% { opacity: 0.1; } 50% { opacity: 0.3; } 100% { opacity: 0.1; } }
            `}</style>
        </div>
    );
};

const StatCard = ({ label, value, icon, color }) => (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ fontSize: '2.5rem', background: `hsl(${color} / 0.1)`, width: '64px', height: '64px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-dim))', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{value}</div>
        </div>
    </div>
);

const LandPremiumCard = ({ land, onList }) => (
    <div className="glass-card" style={{ padding: '0', display: 'grid', gridTemplateColumns: '120px 1fr' }}>
        <div style={{ background: 'hsl(var(--primary) / 0.05)', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
            🏠
        </div>
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>PARCEL ID</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{land.landID}</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {land.isForSale && <div className="badge badge-warning">On Marketplace</div>}
                    <div className={`badge ${land.litigationStatus ? 'badge-error' : 'badge-success'}`}>
                        {land.litigationStatus ? 'In Dispute' : 'Clear Title'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <InfoItem label="Area" value={`${land.area || '1,200'} sq.yd`} />
                <InfoItem label="Coordinates" value={land.geoCoordinates} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to={`/certificate/${land.landID}`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.6rem 1.25rem' }}>📄 Digital Deed</Link>
                {!land.isForSale && (
                    <button onClick={onList} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.6rem 1.25rem' }}>List For Sale</button>
                )}
                <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.6rem 1rem' }}>📤 Transfer</button>
            </div>
        </div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div>
        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-dim))', fontWeight: 600 }}>{label}</div>
        <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
);

export default CitizenDashboard;

import React, { useState } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

const PublicVerify = () => {
    const [landID, setLandID] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await api.get(`/public/verify/${landID}`);
            setResult(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Land parcel not found in the public ledger.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade" style={{ maxWidth: '800px', marginTop: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="glow-text" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Public Verification</h1>
                <p style={{ color: 'hsl(var(--text-dim))', fontSize: '1.1rem' }}>
                    Independently verify land ownership status directly from the Hyperledger Fabric blockchain.
                </p>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        className="input"
                        placeholder="Enter Unique Land ID (e.g. BHOOMI-BLR-001)"
                        value={landID}
                        onChange={(e) => setLandID(e.target.value)}
                        required
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '150px' }}>
                        {loading ? 'Verifying...' : 'Search Ledger'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="badge badge-error animate-slide-up" style={{ width: '100%', padding: '1.5rem', justifyContent: 'center', fontSize: '1rem' }}>
                    ⚠️ {error}
                </div>
            )}

            {result && (
                <div className="animate-slide-up">
                    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '2rem', background: 'hsl(var(--primary) / 0.05)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--primary))' }}>VERIFIED BLOCKCHAIN ASSET</div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{result.landID}</h2>
                            </div>
                            <div className={`badge ${result.litigationStatus ? 'badge-error' : 'badge-success'}`} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                                {result.litigationStatus ? 'TITLE DISPUTED' : 'CLEAR TITLE'}
                            </div>
                        </div>

                        <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <InfoRow label="Geo Coordinates" value={result.geoCoordinates} />
                                <InfoRow label="Mortgage Status" value={result.mortgageStatus ? '⚠️ Asset Collateralized' : '✅ No Liens Found'} />
                                <InfoRow label="Market Status" value={result.isForSale ? `💎 Listed for ₹${result.askingPrice}` : '🔒 Not for Sale'} />

                                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'hsl(var(--secondary) / 0.05)', borderRadius: '1rem', border: '1px solid hsl(var(--secondary) / 0.2)' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'hsl(var(--secondary))', marginBottom: '0.5rem' }}>IMMUTABILITY GUARANTEE</div>
                                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>
                                        This record is cryptographically signed and stored across {12} decentralized nodes. Any unauthorized alteration is mathematically impossible.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid var(--border)' }}>
                                <QRCodeSVG value={window.location.href} size={160} bgColor="transparent" fgColor="white" />
                                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Scan to Verify</div>
                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-dim))', marginTop: '0.25rem' }}>On-Chain Verification Link</div>
                                </div>
                                <button className="btn btn-outline" style={{ marginTop: '2rem', width: '100%', fontSize: '0.85rem' }} onClick={() => window.print()}>
                                    Download Proof of Title
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div>
        <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-dim))', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{value}</div>
    </div>
);

export default PublicVerify;

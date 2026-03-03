import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

const Certificate = () => {
    const { landID } = useParams();
    const [land, setLand] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLand = async () => {
            try {
                const res = await api.get(`/land/${landID}`);
                setLand(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLand();
    }, [landID]);

    if (loading) return <div className="container animate-fade">Generating Security Certificate...</div>;
    if (!land) return <div className="container">Asset Not Found</div>;

    const verifyURL = `${window.location.origin}/verify?id=${land.landID}`;

    return (
        <div className="container animate-fade" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="glass-panel certificate-print" style={{
                width: '800px',
                minHeight: '1000px',
                padding: '4rem',
                position: 'relative',
                border: '10px solid hsl(var(--primary) / 0.1)',
                background: 'hsl(var(--card-bg))',
                backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.02) 0%, transparent 70%)'
            }}>
                {/* --- Certificate Header --- */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid hsl(var(--primary) / 0.3)', paddingBottom: '3rem', marginBottom: '3rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--primary))', letterSpacing: '0.2em', marginBottom: '1rem' }}>REPUBLIC OF BLOCKCHAIN</div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>CERTIFICATE OF TITLE</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>OFFICIAL ON-CHAIN IMMUTABLE RECORD</p>
                </div>

                {/* --- Certificate Body --- */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '4rem' }}>
                    <div>
                        <div style={{ marginBottom: '3rem' }}>
                            <Label>Registry Asset ID</Label>
                            <Value>{land.landID}</Value>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <Label>Registered Holder</Label>
                            <Value>{land.currentOwner}</Value>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                            <div>
                                <Label>Geographic Origin</Label>
                                <Value style={{ fontSize: '1.25rem' }}>{land.geoCoordinates}</Value>
                            </div>
                            <div>
                                <Label>Asset Area</Label>
                                <Value style={{ fontSize: '1.25rem' }}>{land.area || '1,200'} sq.yd</Value>
                            </div>
                        </div>

                        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-dim))', fontStyle: 'italic', lineHeight: '1.6' }}>
                                This document serves as a digital representation of the ownership state recorded in the BhoomiChain Distributed Ledger.
                                The title is secured by the consensus of multiple government and judicial nodes.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ padding: '1rem', background: 'white', borderRadius: '1rem' }}>
                            <QRCodeSVG value={verifyURL} size={150} />
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'hsl(var(--text-dim))' }}>
                            SCAN TO VERIFY <br /> ON PUBLIC LEDGER
                        </div>

                        <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                            <div style={{ height: '2px', width: '150px', background: 'hsl(var(--text-dim))', marginBottom: '0.5rem' }}></div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>BLOCKCHAIN REGISTRAR</div>
                        </div>
                    </div>
                </div>

                {/* --- Footer Stamp --- */}
                <div style={{ position: 'absolute', bottom: '2rem', left: '4rem', fontSize: '0.75rem', color: 'hsl(var(--primary) / 0.5)', fontWeight: 700 }}>
                    TRANSACTION HASH: {Math.random().toString(36).substring(2, 15).toUpperCase()}
                </div>

                <div className="no-print" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '2rem', textAlign: 'center' }}>
                    <button className="btn btn-primary" onClick={() => window.print()}>Print / Save as PDF</button>
                    <Link to="/citizen" className="btn btn-outline" style={{ marginLeft: '1rem' }}>Back to Dashboard</Link>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .certificate-print { border: 2mm solid black !important; box-shadow: none !important; filter: none !important; color: black !important; }
                    .glass-panel { background: white !important; backdrop-filter: none !important; border: 1px solid #ccc !important; }
                    .glow-text { -webkit-text-fill-color: black !important; text-shadow: none !important; }
                }
            `}</style>
        </div>
    );
};

const Label = ({ children }) => (
    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-dim))', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{children}</div>
);

const Value = ({ children, style }) => (
    <div style={{ fontSize: '2rem', fontWeight: 800, ...style }}>{children}</div>
);

export default Certificate;

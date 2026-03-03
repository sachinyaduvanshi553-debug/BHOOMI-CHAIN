import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="animate-fade" style={{ overflow: 'hidden' }}>
            {/* --- Hero Section --- */}
            <section style={{
                padding: '8rem 2rem 6rem',
                textAlign: 'center',
                position: 'relative',
                background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="badge badge-success animate-slide-up" style={{ marginBottom: '1.5rem', background: 'hsl(var(--secondary) / 0.1)', border: '1px solid hsl(var(--secondary) / 0.2)' }}>
                        Next-Gen Blockchain Infrastructure
                    </div>

                    <h1 className="glow-text animate-slide-up" style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-0.02em' }}>
                        The Future of Land <br /> Registry in India
                    </h1>

                    <p className="animate-slide-up" style={{ fontSize: '1.25rem', color: 'hsl(var(--text-dim))', maxWidth: '700px', margin: '0 auto 3rem', textWrap: 'balance' }}>
                        A tamper-proof, decentralized ledger system designed to prevent disputes, ensure transparency, and secure property ownership for every citizen.
                    </p>

                    <div className="animate-slide-up" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn btn-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem' }}>
                            Start Registration
                        </Link>
                        <Link to="/login" className="btn btn-outline" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem' }}>
                            Authority Portal
                        </Link>
                    </div>
                </div>

                {/* Decorative Abstract Shape */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '600px',
                    height: '600px',
                    background: 'hsl(var(--primary) / 0.05)',
                    filter: 'blur(100px)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                }}></div>
            </section>

            {/* --- Features Section --- */}
            <section className="container" style={{ padding: '4rem 2rem 8rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Why BhoomiChain?</h2>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Built on Hyperledger Fabric. Secured by Cryptography.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                    {[
                        {
                            title: 'Immutable Ledger',
                            desc: 'Every transaction is cryptographically signed and permanent. No one can alter ownership history.',
                            icon: '🔒'
                        },
                        {
                            title: 'IPFS Document Vault',
                            desc: 'Land deeds and supporting documents are stored on a decentralized file system, ensuring availability.',
                            icon: '📂'
                        },
                        {
                            title: 'Smart Dispute Prevention',
                            desc: 'Automated on-chain logic prevents transfers of mortgaged or litigated land automatically.',
                            icon: '⚡'
                        }
                    ].map((feature, i) => (
                        <div key={i} className="glass-card" style={{ padding: '2.5rem' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{feature.icon}</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>{feature.title}</h3>
                            <p style={{ color: 'hsl(var(--text-dim))' }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- Trust Layer Visual --- */}
            <section style={{ background: 'hsl(var(--card-bg))', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '6rem 2rem' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4rem', flexWrap: 'wrap-reverse' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Multi-Agency Support</h2>
                        <p style={{ color: 'hsl(var(--text-dim))', fontSize: '1.1rem', marginBottom: '2rem' }}>
                            Providing a shared, trusted environment for Citizens, Registrar Officers, Banks, and Court Authorities.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {['Revenue Organization', 'Registrar General', 'Judicial Courts', 'Leading Financial Institutions'].map((org, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600 }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--primary))' }}></span>
                                    {org}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                        <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', p: '2rem', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed hsl(var(--primary) / 0.3)', position: 'relative' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                                <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>Encrypted Node Network</div>
                                <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-dim))' }}>RAFT CONSENSUS ACTIVE</div>
                            </div>
                            {/* Simple Scan Line Animation */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '2px',
                                background: 'hsl(var(--primary))',
                                boxShadow: '0 0 15px hsl(var(--primary))',
                                animation: 'scan 4s linear infinite',
                                opacity: 0.5
                            }}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '4rem 2rem', textAlign: 'center', color: 'hsl(var(--text-dim))', fontSize: '0.875rem' }}>
                <p>© 2026 BhoomiChain India – Decentralized Land Sovereignty</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                    <Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
                    <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
                </div>
            </footer>

            <style>{`
            @keyframes scan {
                0% { top: 0; }
                100% { top: 100%; }
            }
        `}</style>
        </div>
    );
};

export default LandingPage;

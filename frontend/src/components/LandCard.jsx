import React from 'react';

const LandCard = ({ land, actions }) => {
    return (
        <div className="glass-panel animate-fade" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{land.landID}</h3>
                    <p style={{ color: 'hsl(var(--text-dim))', fontSize: '0.875rem' }}>Owner: {land.currentOwner}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    {land.mortgageStatus && <span className="badge badge-warning">Mortgaged</span>}
                    {land.litigationStatus && <span className="badge badge-error">Litigation</span>}
                    {!land.mortgageStatus && !land.litigationStatus && <span className="badge badge-success">Clear Title</span>}
                </div>
            </div>

            <div style={{ fontSize: '0.875rem', marginBottom: '1.5rem', display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'hsl(var(--text-dim))' }}>Coordinates:</span>
                    <span style={{ fontWeight: 500 }}>{land.geoCoordinates}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'hsl(var(--text-dim))' }}>Last Updated:</span>
                    <span>{new Date(land.timestamp).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'hsl(var(--text-dim))' }}>Doc Hash:</span>
                    <code style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))' }}>{land.documentHash.substring(0, 12)}...</code>
                </div>
            </div>

            {actions && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid hsl(var(--border))' }}>
                    {actions}
                </div>
            )}
        </div>
    );
};

export default LandCard;

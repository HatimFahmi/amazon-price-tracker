'use client';
import { useState } from 'react';

// Helper to format time ago
function getTimeAgo(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    // SQLite assumes UTC usually, but `new Date` parses based on string format.
    // DEFAULT CURRENT_TIMESTAMP in SQLite is UTC. JS Date(string) handles 'Z' or ISO format.
    // SQLite 'YYYY-MM-DD HH:MM:SS' is treated as local by JS unless 'Z' is appended.
    // Let's assume the DB returns a string that we treat as UTC.
    const now = new Date();

    // Need to handle timezone carefully. Simplest is to treat everything as UTC if missing offset.
    // Or just rely on relative diff.
    const seconds = Math.floor((now - new Date(dateString + 'Z')) / 1000);

    // Create a backup if the + 'Z' makes it invalid or if it was already valid ISO
    let diff = seconds;
    if (isNaN(seconds)) {
        diff = Math.floor((now - new Date(dateString)) / 1000);
    }

    if (diff < 60) return 'Just now';
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function ProductCard({ product, onRefresh }) {
    const [loading, setLoading] = useState(false);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            await onRefresh(product.id);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '10px' }}>
                <img
                    src={product.image || 'https://placehold.co/400x400?text=No+Image'}
                    alt={product.title}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400?text=No+Image'; }}
                />
            </div>
            <div className="card-content">
                <h3 className="card-title" title={product.title}>{product.title || 'Loading title...'}</h3>
                <div className="card-price">{product.current_price || 'N/A'}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    Updated: {getTimeAgo(product.updated_at || product.created_at)}
                </div>
                <div className="card-actions">
                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                        View on Amazon
                    </a>
                    <button onClick={handleRefresh} className="refresh-btn" disabled={loading} title="Refresh Price">
                        {loading ? (
                            <span className="spin" style={{ display: 'inline-block' }}>⟳</span>
                        ) : (
                            '⟳'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

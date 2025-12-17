'use client';
import { useState, useEffect } from 'react';

// Helper to format time ago
function getTimeAgo(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - new Date(dateString + 'Z')) / 1000);
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

import PriceChart from './PriceChart';

export default function ProductCard({ product, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleHistory = async () => {
        if (!showHistory && history.length === 0) {
            setLoadingHistory(true);
            try {
                const res = await fetch(`/api/products/${product.id}/history`);
                const data = await res.json();
                setHistory(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingHistory(false);
            }
        }
        setShowHistory(!showHistory);
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            await onRefresh(product.id);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{
            gridColumn: showHistory ? 'span 2' : 'auto',
            flexDirection: showHistory ? 'row' : 'column',
            maxWidth: showHistory ? '100%' : 'auto'
        }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <a href={product.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                                Amazon
                            </a>
                            <button onClick={toggleHistory} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                {showHistory ? 'Hide' : 'History'}
                            </button>
                        </div>
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

            {showHistory && (
                <div style={{ flex: 1.5, borderLeft: '1px solid #334155', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 className="card-title" style={{ margin: 0 }}>Price History</h3>
                        {/* Close button for history if desired, or toggling 'History' button works too */}
                    </div>
                    {loadingHistory ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading history...</div>
                    ) : (
                        <div style={{ flex: 1, minHeight: '300px' }}>
                            <PriceChart data={history} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

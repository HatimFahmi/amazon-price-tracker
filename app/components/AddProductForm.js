'use client';
import { useState } from 'react';

export default function AddProductForm({ onAdd }) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onAdd(url);
            setUrl('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <form onSubmit={handleSubmit} className="input-group">
                <input
                    type="url"
                    placeholder="Paste Amazon.ae Product URL here..."
                    className="input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Track Price'}
                </button>
            </form>
            {error && <div style={{ color: 'var(--error)', marginTop: '0.5rem' }}>{error}</div>}
        </div>
    );
}

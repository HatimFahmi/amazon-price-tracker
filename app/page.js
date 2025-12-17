'use client';
import { useState, useEffect } from 'react';
import ProductCard from './components/ProductCard';
import AddProductForm from './components/AddProductForm';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (url) => {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add product');
        setProducts([data, ...products]);
    };

    const handleRefreshProduct = async (id) => {
        const res = await fetch(`/api/products/${id}/refresh`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            setProducts(products.map(p => p.id === id ? { ...p, current_price: data.price, title: data.title, image: data.image, updated_at: new Date().toISOString() } : p));
        }
    };

    const [refreshingAll, setRefreshingAll] = useState(false);

    const handleRefreshAll = async () => {
        setRefreshingAll(true);
        try {
            const res = await fetch('/api/products/refresh-all', { method: 'POST' });
            if (res.ok) {
                // Ideally we should re-fetch all products after bulk refresh to get latest data
                await fetchProducts();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshingAll(false);
        }
    };

    return (
        <main className="container">
            <header className="header">
                <h1 className="title">Amazon.ae Tracker</h1>
                <button
                    onClick={handleRefreshAll}
                    className="btn btn-outline"
                    disabled={refreshingAll || loading || products.length === 0}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {refreshingAll ? <span className="spin">⟳</span> : '⟳'} Refresh All
                </button>
            </header>

            <AddProductForm onAdd={handleAddProduct} />

            {loading ? (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading tracked products...</div>
            ) : products.length === 0 ? (
                <div className="empty-state">
                    <h2>No products tracked yet</h2>
                    <p>Add an Amazon.ae URL above to start tracking prices.</p>
                </div>
            ) : (
                <div className="grid">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} onRefresh={handleRefreshProduct} />
                    ))}
                </div>
            )}
        </main>
    );
}

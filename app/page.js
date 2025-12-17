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
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('updated_desc');

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

    // Filter and Sort Logic
    const filteredProducts = products
        .filter(product => {
            if (!searchQuery) return true;
            return (product.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':
                    return (parseFloat(a.current_price?.replace(/[^0-9.]/g, '') || 0) - parseFloat(b.current_price?.replace(/[^0-9.]/g, '') || 0));
                case 'price_desc':
                    return (parseFloat(b.current_price?.replace(/[^0-9.]/g, '') || 0) - parseFloat(a.current_price?.replace(/[^0-9.]/g, '') || 0));
                case 'title_asc':
                    return (a.title || '').localeCompare(b.title || '');
                case 'updated_desc':
                    return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
                default:
                    return 0;
            }
        });

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

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input"
                    style={{ flex: 2 }}
                />
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input"
                    style={{ flex: 1, cursor: 'pointer' }}
                >
                    <option value="updated_desc">Recently Updated</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="title_asc">Name: A-Z</option>
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading tracked products...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                    {searchQuery ? (
                        <>
                            <h2>No products match your search</h2>
                            <p>Try a different keyword.</p>
                        </>
                    ) : (
                        <>
                            <h2>No products tracked yet</h2>
                            <p>Add an Amazon.ae URL above to start tracking prices.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onRefresh={handleRefreshProduct} />
                    ))}
                </div>
            )}
        </main>
    );
}

import { NextResponse } from 'next/server';
import { getAllProducts, refreshProduct } from '@/lib/products';

export async function POST() {
    try {
        const products = getAllProducts();

        // Simple queue system with concurrency limit
        const CONCURRENCY_LIMIT = 3;
        const results = [];
        const errors = [];

        // Helper to process chunk
        const processChunk = async (chunk) => {
            const promises = chunk.map(async (product) => {
                try {
                    console.log(`Queue: Refreshing ${product.id}`);
                    await refreshProduct(product.id);
                    results.push(product.id);
                } catch (err) {
                    console.error(`Failed to refresh product ${product.id}:`, err);
                    errors.push({ id: product.id, error: err.message });
                }
            });
            await Promise.all(promises);
        };

        // Split into chunks of CONCURRENCY_LIMIT
        for (let i = 0; i < products.length; i += CONCURRENCY_LIMIT) {
            const chunk = products.slice(i, i + CONCURRENCY_LIMIT);
            await processChunk(chunk);
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${products.length} products`,
            refreshed: results,
            errors: errors
        });

    } catch (error) {
        console.error('Bulk refresh error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

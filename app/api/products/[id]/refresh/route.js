import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { scrapeAmazonProduct } from '@/lib/scraper';

export async function POST(request, context) {
    try {
        const params = await context.params;
        const { id } = params;

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const data = await scrapeAmazonProduct(product.url);
        if (!data) {
            return NextResponse.json({ error: 'Failed to scrape product' }, { status: 500 });
        }

        const { price, image, title } = data;

        // Update product
        db.prepare('UPDATE products SET current_price = ?, image = ?, title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(price, image, title, id);

        // Add history
        if (price) {
            const lastHistory = db.prepare('SELECT price FROM price_history WHERE product_id = ? ORDER BY scraped_at DESC LIMIT 1').get(id);
            // Only add history if price changed or it's been a while? For now, always add on manual refresh.
            // Actually, preventing duplicate entries for same price might be good to save space, but explicit refresh implies desire to record check.
            db.prepare('INSERT INTO price_history (product_id, price) VALUES (?, ?)').run(id, price);
        }

        return NextResponse.json({ success: true, price, title, image });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

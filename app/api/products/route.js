import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { scrapeAmazonProduct } from '@/lib/scraper';

export async function GET() {
    try {
        const products = db.prepare('SELECT * FROM products ORDER BY COALESCE(updated_at, created_at) DESC').all();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Check if product already exists
        const existing = db.prepare('SELECT * FROM products WHERE url = ?').get(url);
        if (existing) {
            return NextResponse.json({ error: 'Product already tracked' }, { status: 400 });
        }

        // Scrape initial data
        const data = await scrapeAmazonProduct(url);
        if (!data) {
            return NextResponse.json({ error: 'Failed to scrape product. Check URL or try again.' }, { status: 500 });
        }

        const { title, price, image } = data;

        // Insert into DB
        const insert = db.prepare('INSERT INTO products (url, title, image, current_price) VALUES (?, ?, ?, ?)');
        const info = insert.run(url, title || 'Unknown', image, price);

        // Insert history
        if (price) {
            db.prepare('INSERT INTO price_history (product_id, price) VALUES (?, ?)').run(info.lastInsertRowid, price);
        }

        return NextResponse.json({
            id: info.lastInsertRowid,
            url,
            title,
            image,
            current_price: price
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

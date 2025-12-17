import db from '@/lib/db';
import { scrapeAmazonProduct } from '@/lib/scraper';

export async function refreshProduct(id) {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
        throw new Error('Product not found');
    }

    const data = await scrapeAmazonProduct(product.url);
    if (!data) {
        throw new Error('Failed to scrape product');
    }

    const { price, image, title } = data;

    // Update product
    db.prepare('UPDATE products SET current_price = ?, image = ?, title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(price, image, title, id);

    // Add history
    if (price) {
        db.prepare('INSERT INTO price_history (product_id, price) VALUES (?, ?)').run(id, price);
    }

    return { price, title, image, updated_at: new Date().toISOString() };
}

export function getAllProducts() {
    return db.prepare('SELECT * FROM products').all();
}

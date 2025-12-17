import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, context) {
    try {
        const params = await context.params;
        const { id } = params;

        const history = db.prepare('SELECT price, scraped_at FROM price_history WHERE product_id = ? ORDER BY scraped_at ASC').all(id);

        return NextResponse.json(history);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

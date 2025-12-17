import { NextResponse } from 'next/server';
import { refreshProduct } from '@/lib/products';

export async function POST(request, context) {
    try {
        const params = await context.params;
        const { id } = params;

        const result = await refreshProduct(id);

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        const status = error.message === 'Product not found' ? 404 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}

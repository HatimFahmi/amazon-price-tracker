import cron from 'node-cron';
import { getAllProducts, refreshProduct } from './lib/products';

export async function register() {
    // Only run on server
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('Registering background tasks...');

        // Prevent duplicate cron jobs during hot reloads in development
        if (!global.scheduledPriceCheck) {
            console.log('Initializing hourly price check cron job.');

            // Schedule task to run every hour
            // Cron syntax: minute hour day-of-month month day-of-week
            // '0 * * * *' = at minute 0 of every hour
            global.scheduledPriceCheck = cron.schedule('0 * * * *', async () => {
                console.log(`[${new Date().toISOString()}] Running automated price check...`);
                try {
                    const products = getAllProducts(); // This needs to be safe to call here
                    console.log(`Found ${products.length} products to check.`);

                    for (const product of products) {
                        try {
                            await refreshProduct(product.id);
                            // Add a small delay to be polite to Amazon servers
                            await new Promise(r => setTimeout(r, 2000));
                        } catch (err) {
                            console.error(`Failed to auto-refresh product ${product.id}:`, err);
                        }
                    }
                    console.log(`[${new Date().toISOString()}] Automated check complete.`);
                } catch (err) {
                    console.error('Error in automated price check:', err);
                }
            });

            global.scheduledPriceCheck.start();
        }
    }
}

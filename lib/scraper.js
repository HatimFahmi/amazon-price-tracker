const puppeteer = require('puppeteer');

async function scrapeAmazonProduct(url) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set User-Agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Selectors for Amazon.ae
        // Title
        const title = await page.$eval('#productTitle', el => el.innerText.trim()).catch(() => null);

        // Price
        // Strategy: Look for the main price block
        let price = await page.$eval('.a-price .a-offscreen', el => el.innerText).catch(() => null);

        // Fallback for different layouts
        if (!price) {
            price = await page.$eval('#priceblock_ourprice', el => el.innerText).catch(() => null);
        }
        if (!price) {
            price = await page.$eval('#priceblock_dealprice', el => el.innerText).catch(() => null);
        }
        if (!price) {
            // Sometimes price is in a different structure on mobile view or specific categories
            price = await page.$eval('.a-price-whole', el => el.innerText).catch(() => null);
            const fraction = await page.$eval('.a-price-fraction', el => el.innerText).catch(() => '');
            if (price) price = price + '.' + fraction;
        }

        // Image
        // Often in #landingImage or #imgTagWrapperId img
        let image = await page.$eval('#landingImage', el => el.src).catch(() => null);
        if (!image) {
            image = await page.$eval('#imgBlkFront', el => el.src).catch(() => null);
        }

        return { title, price, image };
    } catch (error) {
        console.error('Error scraping:', error);
        return null; // Return null on failure
    } finally {
        await browser.close();
    }
}

module.exports = { scrapeAmazonProduct };

import './globals.css';

export const metadata = {
    title: 'Amazon AE Price Tracker',
    description: 'Track prices of your favorite items on Amazon.ae',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}

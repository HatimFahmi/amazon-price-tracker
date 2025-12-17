'use client';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function PriceChart({ data }) {
    if (!data || data.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No history data available</div>;
    }

    // Parse price string "AED 1,234.00" to number 1234.00
    const chartData = data.map(item => {
        const numericPrice = parseFloat(item.price.replace(/[^\d.]/g, ''));
        return {
            date: new Date(item.scraped_at).toLocaleDateString(),
            fullDate: new Date(item.scraped_at).toLocaleString(),
            price: numericPrice,
            originalPrice: item.price
        };
    });

    return (
        <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
            <ResponsiveContainer>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        style={{ fontSize: '0.8rem' }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        style={{ fontSize: '0.8rem' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                        itemStyle={{ color: '#8b5cf6' }}
                        labelStyle={{ color: '#94a3b8' }}
                        formatter={(value, name, props) => [props.payload.originalPrice, 'Price']}
                        labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                    />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#8b5cf6"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

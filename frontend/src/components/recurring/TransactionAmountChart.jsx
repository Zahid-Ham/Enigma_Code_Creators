import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

/**
 * Builds chronological monthly data points from transactions
 */
function buildChartData(relationship) {
  const txs = relationship?.transactions || [];
  if (!txs.length) {
    // Default fallback line if no direct transaction list
    const avg = relationship?.average_amount || 4250;
    return [
      { month: 'Apr 2026', amount: avg, date: '04 Apr 2026' },
      { month: 'May 2026', amount: avg, date: '04 May 2026' },
      { month: 'Jun 2026', amount: avg, date: '04 Jun 2026' },
      { month: 'Jul 2026', amount: avg, date: '04 Jul 2026' },
      { month: 'Aug 2026', amount: avg, date: '04 Aug 2026' },
      { month: 'Sep 2026', amount: avg, date: '04 Sep 2026' },
    ];
  }

  // Sort ascending by date
  const sorted = [...txs].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return sorted.map((t) => {
    let monthLabel = t.date;
    try {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    } catch {}

    return {
      month: monthLabel,
      amount: t.amount,
      date: t.date,
      description: t.description,
    };
  });
}

/**
 * Custom Tooltip Component
 */
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="chart-custom-tooltip">
        <div className="tooltip-amount">₹ {Number(data.amount).toLocaleString('en-IN')}</div>
        <div className="tooltip-date">{data.date || data.month}</div>
      </div>
    );
  }
  return null;
}

/**
 * TransactionAmountChart Component
 */
export default function TransactionAmountChart({ relationship }) {
  const chartData = buildChartData(relationship);
  const latestPoint = chartData[chartData.length - 1];

  // Calculate Y-axis domain
  const amounts = chartData.map((d) => d.amount);
  const minAmt = Math.min(...amounts, 0);
  const maxAmt = Math.max(...amounts, 5000);
  const yMax = Math.ceil((maxAmt * 1.3) / 1000) * 1000;

  return (
    <div className="transaction-chart-card" aria-label="Transaction Amount Trend Chart">
      <div className="chart-header-row">
        <div className="chart-header-left">
          <h4 className="chart-title">Transaction Amount Trend</h4>
        </div>
        {latestPoint && (
          <div className="chart-header-right">
            <span className="chart-current-amount">₹ {Number(latestPoint.amount).toLocaleString('en-IN')}</span>
            <span className="chart-current-date">{latestPoint.date || latestPoint.month}</span>
          </div>
        )}
      </div>

      <div className="chart-container-wrap">
        <ResponsiveContainer width="100%" height={170}>
          <LineChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE4" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#718096' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, yMax]}
              tick={{ fontSize: 11, fill: '#718096' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => (val === 0 ? '₹0' : `₹${(val / 1000).toFixed(0)}k`)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#28704D"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#28704D', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: '#183B2B', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { IconPieChart, CategoryIcon } from '../Icons';

const PALETTE = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f43f5e', // Rose
    '#64748b'  // Slate
];

function CategoryPieChart({ data = [] }) {
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const chartData = (data || []).filter(d => d.total > 0);
    const total = chartData.reduce((sum, d) => sum + d.total, 0);

    if (!total || chartData.length === 0) {
        return (
            <div className="dash-card glass-panel category-chart-card">
                <div className="dash-card-header">
                    <h2><IconPieChart size={18} style={{ color: 'var(--brand-primary)' }} /> Category Distribution</h2>
                </div>
                <div className="empty-state" style={{ padding: '24px 12px' }}>
                    <div className="empty-state-icon" style={{ width: '48px', height: '48px' }}>
                        <IconPieChart size={24} />
                    </div>
                    <p style={{ fontSize: '0.8125rem' }}>No expense records available yet to chart spending patterns.</p>
                </div>
            </div>
        );
    }

    // Generate donut slices using SVG circle stroke-dasharray
    let cumulativePercent = 0;
    const radius = 38;
    const circumference = 2 * Math.PI * radius;

    const slices = chartData.map((item, index) => {
        const fraction = item.total / total;
        const strokeDasharray = `${fraction * circumference} ${circumference}`;
        const strokeDashoffset = -cumulativePercent * circumference;
        cumulativePercent += fraction;
        const color = PALETTE[index % PALETTE.length];
        const isHovered = hoveredCategory === item.category;

        return (
            <circle
                key={item.category}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={isHovered ? "14" : "11"}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                    filter: isHovered ? `drop-shadow(0 0 6px ${color})` : 'none'
                }}
                onMouseEnter={() => setHoveredCategory(item.category)}
                onMouseLeave={() => setHoveredCategory(null)}
            />
        );
    });

    const activeItem = chartData.find(d => d.category === hoveredCategory);

    return (
        <div className="dash-card glass-panel category-chart-card">
            <div className="dash-card-header">
                <div>
                    <h2><IconPieChart size={18} style={{ color: 'var(--brand-primary)' }} /> Category Distribution</h2>
                    <p className="dash-card-subtitle">Breakdown of outflow by category</p>
                </div>
            </div>

            <div className="chart-container">
                {/* SVG Donut Visual */}
                <div className="donut-svg-wrapper">
                    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Background track circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke="var(--bg-pill)"
                            strokeWidth="11"
                        />
                        {slices}
                    </svg>

                    {/* Centered Total / Hover Label */}
                    <div className="donut-center-label">
                        <span className="center-title">
                            {activeItem ? activeItem.category : 'Total Out'}
                        </span>
                        <span className="center-val">
                            ₹{(activeItem ? activeItem.total : total).toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>

                {/* Legend List */}
                <div className="chart-legend">
                    {chartData.map((d, index) => {
                        const color = PALETTE[index % PALETTE.length];
                        const pct = Math.round((d.total / total) * 100);
                        const isHovered = hoveredCategory === d.category;

                        return (
                            <div
                                key={d.category}
                                className="legend-item"
                                style={{
                                    background: isHovered ? 'var(--bg-pill-active)' : 'transparent',
                                    borderRadius: '8px'
                                }}
                                onMouseEnter={() => setHoveredCategory(d.category)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                <div className="legend-left">
                                    <span
                                        className="legend-color-dot"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="legend-cat-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <CategoryIcon category={d.category} size={13} /> {d.category}
                                    </span>
                                </div>
                                <div className="legend-right">
                                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                                        ₹{d.total.toLocaleString('en-IN')}
                                    </span>
                                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                                        {pct}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default CategoryPieChart;

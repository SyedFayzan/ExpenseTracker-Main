import React, { useState, useMemo } from 'react';
import {
    IconFlame,
    IconCalendar,
    IconLightbulb,
    IconCheckCircle,
    IconRepeat,
    CategoryIcon
} from '../Icons';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatLocalDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function ExpenseHeatmap({ heatmapData = [], expenses = [], year = new Date().getFullYear(), setYear, isLoading = false }) {
    const [selectedDay, setSelectedDay] = useState(null);
    const [hoveredDay, setHoveredDay] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });

    const currentActualYear = new Date().getFullYear();

    // Map all data combining backend aggregation and real-time frontend transactions
    const dataMap = useMemo(() => {
        const map = new Map();

        // 1. First populate from active expenses array (guarantees instant real-time updates)
        (expenses || []).forEach(item => {
            if (item.amount < 0) {
                const dateObj = new Date(item.createdAt || Date.now());
                const dateStr = formatLocalDateStr(dateObj);
                const absAmt = Math.abs(item.amount);

                if (!map.has(dateStr)) {
                    map.set(dateStr, {
                        date: dateStr,
                        totalSpent: absAmt,
                        count: 1,
                        transactions: [item]
                    });
                } else {
                    const existing = map.get(dateStr);
                    existing.totalSpent += absAmt;
                    existing.count += 1;
                    existing.transactions.push(item);
                }
            }
        });

        // 2. Merge backend heatmapData if not already in map
        (heatmapData || []).forEach(item => {
            if (!map.has(item.date)) {
                map.set(item.date, item);
            }
        });

        return map;
    }, [heatmapData, expenses]);

    // Build the full 53-week calendar matrix for the requested year
    const { calendarWeeks, monthLabels, maxSpend, totalYearSpent, activeDaysCount, maxSpendDay } = useMemo(() => {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        const weeks = [];
        const mLabels = [];
        let currentWeek = new Array(7).fill(null);

        let max = 0;
        let maxDay = null;
        let totalYear = 0;
        let activeCount = 0;
        const activeSpends = [];

        // Compute metrics for the active year from dataMap
        Array.from(dataMap.values()).forEach(d => {
            if (d.date && d.date.startsWith(String(year)) && d.totalSpent > 0) {
                totalYear += d.totalSpent;
                activeCount++;
                activeSpends.push(d.totalSpent);
                if (d.totalSpent > max) {
                    max = d.totalSpent;
                    maxDay = d;
                }
            }
        });

        // Determine percentile thresholds for intensity
        activeSpends.sort((a, b) => a - b);
        const p25 = activeSpends[Math.floor(activeSpends.length * 0.25)] || max * 0.25 || 250;
        const p50 = activeSpends[Math.floor(activeSpends.length * 0.50)] || max * 0.50 || 750;
        const p75 = activeSpends[Math.floor(activeSpends.length * 0.75)] || max * 0.75 || 2000;

        let lastMonth = -1;
        let currentDay = new Date(start);

        while (currentDay <= end) {
            const dayOfWeek = currentDay.getDay(); // 0 = Sun, 6 = Sat
            const currentMonth = currentDay.getMonth();
            const dateStr = formatLocalDateStr(currentDay);
            const entry = dataMap.get(dateStr);

            // Record month label at start of month
            if (currentMonth !== lastMonth) {
                mLabels.push({
                    month: MONTH_NAMES[currentMonth],
                    weekIndex: weeks.length
                });
                lastMonth = currentMonth;
            }

            const totalSpent = entry ? entry.totalSpent : 0;
            const count = entry ? entry.count : 0;
            const transactions = entry ? entry.transactions : [];

            // Compute intensity level 0 - 4
            let level = 0;
            if (totalSpent > 0) {
                if (totalSpent <= p25) level = 1;
                else if (totalSpent <= p50) level = 2;
                else if (totalSpent <= p75) level = 3;
                else level = 4;
            }

            currentWeek[dayOfWeek] = {
                date: dateStr,
                dateObj: new Date(currentDay),
                dayOfWeek,
                totalSpent,
                count,
                transactions,
                level
            };

            if (dayOfWeek === 6 || currentDay.getTime() === end.getTime()) {
                weeks.push(currentWeek);
                currentWeek = new Array(7).fill(null);
            }

            currentDay.setDate(currentDay.getDate() + 1);
        }

        return {
            calendarWeeks: weeks,
            monthLabels: mLabels,
            maxSpend: max,
            totalYearSpent: totalYear,
            activeDaysCount: activeCount,
            maxSpendDay: maxDay,
            p25, p50, p75
        };
    }, [year, dataMap]);

    const handleMouseEnter = (day, e) => {
        if (!day) return;
        setHoveredDay(day);
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
            visible: true
        });
    };

    const handleMouseLeave = () => {
        setTooltipPos(prev => ({ ...prev, visible: false }));
        setHoveredDay(null);
    };

    const formatDateHeading = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const dailyAverage = activeDaysCount > 0 ? Math.round(totalYearSpent / activeDaysCount) : 0;

    return (
        <div className="dash-card glass-panel heatmap-card">
            {/* Header & Year Switcher Toolbar */}
            <div className="dash-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2><IconFlame size={18} style={{ color: 'var(--expense-color)' }} /> Expense Activity Heatmap</h2>
                    <p className="dash-card-subtitle">
                        Daily spending density and contribution ledger for {year}
                    </p>
                </div>

                {/* Year Navigation Controls */}
                <div className="heatmap-year-controls">
                    <button
                        type="button"
                        className="btn btn-secondary btn-year-nav"
                        onClick={() => { setSelectedDay(null); setYear(prev => prev - 1); }}
                        title="View previous year"
                    >
                        ◀ {year - 1}
                    </button>

                    <div className="current-year-badge">
                        <IconCalendar size={13} />
                        <strong>{year}</strong>
                        {year === currentActualYear && (
                            <span className="badge badge-neutral" style={{ fontSize: '0.625rem', padding: '1px 5px' }}>Current</span>
                        )}
                    </div>

                    <button
                        type="button"
                        className="btn btn-secondary btn-year-nav"
                        onClick={() => { setSelectedDay(null); setYear(prev => prev + 1); }}
                        title="View next year"
                    >
                        {year + 1} ▶
                    </button>

                    {year !== currentActualYear && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => { setSelectedDay(null); setYear(currentActualYear); }}
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                            Today ({currentActualYear})
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Summary KPIs for Selected Year */}
            <div className="heatmap-summary-row">
                <div className="heatmap-summary-stat">
                    <span className="stat-label">Total Spent ({year})</span>
                    <span className="stat-value" style={{ color: 'var(--expense-color)' }}>
                        ₹{totalYearSpent.toLocaleString('en-IN')}
                    </span>
                </div>
                <div className="heatmap-summary-stat">
                    <span className="stat-label">Active Spending Days</span>
                    <span className="stat-value">
                        {activeDaysCount} <span className="stat-sub">/ {year % 4 === 0 ? 366 : 365} days</span>
                    </span>
                </div>
                <div className="heatmap-summary-stat">
                    <span className="stat-label">Daily Active Average</span>
                    <span className="stat-value">
                        ₹{dailyAverage.toLocaleString('en-IN')} <span className="stat-sub">/ active day</span>
                    </span>
                </div>
                <div className="heatmap-summary-stat">
                    <span className="stat-label">Peak Single Day</span>
                    <span className="stat-value" style={{ color: 'var(--warning-color)' }}>
                        ₹{maxSpend.toLocaleString('en-IN')}
                    </span>
                    {maxSpendDay && (
                        <span className="stat-sub">{formatDateHeading(maxSpendDay.date)}</span>
                    )}
                </div>
            </div>

            {/* Heatmap Matrix Visual Grid */}
            <div className="heatmap-grid-scroll-wrapper">
                <div className="heatmap-matrix-container">
                    {/* Top Month Labels Header */}
                    <div className="heatmap-months-header">
                        <div className="weekday-spacer"></div>
                        <div className="heatmap-months-track">
                            {monthLabels.map((m, idx) => (
                                <span
                                    key={idx}
                                    className="heatmap-month-label"
                                    style={{ gridColumnStart: m.weekIndex + 1 }}
                                >
                                    {m.month}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Main Grid: Weekdays on left + Matrix Cells */}
                    <div className="heatmap-body-row">
                        {/* Weekday Labels Column */}
                        <div className="heatmap-weekdays-col">
                            {WEEKDAYS.map((w, idx) => (
                                <span key={idx} className="heatmap-weekday-label">
                                    {idx % 2 === 1 ? w : ''}
                                </span>
                            ))}
                        </div>

                        {/* 53 Columns of 7 Days */}
                        <div className="heatmap-weeks-grid">
                            {calendarWeeks.map((week, weekIdx) => (
                                <div key={weekIdx} className="heatmap-week-col">
                                    {week.map((day, dayIdx) => {
                                        if (!day) {
                                            return <div key={dayIdx} className="heatmap-cell empty-placeholder" />;
                                        }

                                        const isSelected = selectedDay && selectedDay.date === day.date;
                                        const isToday = day.date === formatLocalDateStr(new Date());

                                        return (
                                            <div
                                                key={day.date}
                                                className={`heatmap-cell level-${day.level} ${isSelected ? 'cell-selected' : ''} ${isToday ? 'cell-today' : ''}`}
                                                onMouseEnter={(e) => handleMouseEnter(day, e)}
                                                onMouseLeave={handleMouseLeave}
                                                onClick={() => setSelectedDay(day)}
                                                role="button"
                                                tabIndex={0}
                                                aria-label={`${day.date}: ₹${day.totalSpent}`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Legend */}
                    <div className="heatmap-footer-toolbar">
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <IconLightbulb size={13} style={{ color: 'var(--warning-color)' }} /> Click any square to view itemized transactions for that day
                        </span>

                        <div className="heatmap-legend">
                            <span className="legend-text">Less</span>
                            <div className="heatmap-cell level-0" title="₹0 spent" />
                            <div className="heatmap-cell level-1" title="Light spending" />
                            <div className="heatmap-cell level-2" title="Moderate spending" />
                            <div className="heatmap-cell level-3" title="High spending" />
                            <div className="heatmap-cell level-4" title="Peak spending" />
                            <span className="legend-text">More</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Custom Tooltip */}
            {tooltipPos.visible && hoveredDay && (
                <div
                    className="heatmap-tooltip animate-fade-in"
                    style={{
                        left: `${tooltipPos.x}px`,
                        top: `${tooltipPos.y}px`
                    }}
                >
                    <div className="tooltip-date">
                        {hoveredDay.dateObj.toLocaleDateString('en-IN', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </div>
                    <div className="tooltip-amount">
                        {hoveredDay.totalSpent > 0 ? (
                            <><strong>₹{hoveredDay.totalSpent.toLocaleString('en-IN')}</strong> spent ({hoveredDay.count} {hoveredDay.count === 1 ? 'transaction' : 'transactions'})</>
                        ) : (
                            <span style={{ color: 'var(--text-muted)' }}>No expense activity (₹0)</span>
                        )}
                    </div>
                </div>
            )}

            {/* Selected Day Transaction Breakdown Drawer */}
            {selectedDay && (
                <div className="heatmap-day-details-card animate-fade-in">
                    <div className="day-details-header">
                        <div className="day-details-title-wrap">
                            <span className="day-icon" style={{ display: 'flex', alignItems: 'center' }}>
                                <IconCalendar size={16} />
                            </span>
                            <div>
                                <h4>{formatDateHeading(selectedDay.date)}</h4>
                                <span className="dash-card-subtitle">
                                    {selectedDay.count > 0 ? (
                                        <>Total Spent: <strong style={{ color: 'var(--expense-color)' }}>₹{selectedDay.totalSpent.toLocaleString('en-IN')}</strong> across {selectedDay.count} transaction{selectedDay.count > 1 ? 's' : ''}</>
                                    ) : (
                                        'No expenses recorded on this date'
                                    )}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="search-clear-btn"
                            onClick={() => setSelectedDay(null)}
                            title="Close day details"
                        >
                            ✕ Close
                        </button>
                    </div>

                    {selectedDay.transactions && selectedDay.transactions.length > 0 ? (
                        <div className="day-tx-list">
                            {selectedDay.transactions.map((tx, idx) => {
                                const timeStr = new Date(tx.createdAt || Date.now()).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });

                                return (
                                    <div key={tx._id || idx} className="day-tx-item">
                                        <div className="day-tx-left">
                                            <div className="tx-cat-icon">
                                                <CategoryIcon category={tx.category} size={16} />
                                            </div>
                                            <div className="tx-meta">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span className="tx-title">{tx.text}</span>
                                                    {tx.isRecurring && (
                                                        <span className="badge badge-recurring" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                            <IconRepeat size={10} /> Monthly
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="tx-submeta">
                                                    <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                        <CategoryIcon category={tx.category} size={10} /> {tx.category || 'Other'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{timeStr}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <span className="tx-amount expense">
                                            -₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                	);
                            })}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '16px 8px' }}>
                            <div className="empty-state-icon" style={{ width: '32px', height: '32px' }}>
                                <IconCheckCircle size={18} />
                            </div>
                            <p style={{ fontSize: '0.75rem' }}>No spending on {formatDateHeading(selectedDay.date)}. Great financial discipline!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ExpenseHeatmap;

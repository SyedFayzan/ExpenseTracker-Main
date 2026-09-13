import React, { useState } from 'react';
import {
    IconTarget,
    IconEdit,
    IconPlus,
    IconAlertCircle,
    IconAlertTriangle,
    IconCheckCircle
} from '../Icons';

const BUDGET_PRESETS = [10000, 25000, 50000, 75000, 100000];

function BudgetTracker({ budgetStatus = {}, updateBudget }) {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const {
        monthlyBudget = 0,
        spentThisMonth = 0,
        remaining = 0,
        percentUsed = 0,
        isOverBudget = false
    } = budgetStatus || {};

    const handleSave = (e) => {
        e.preventDefault();
        const value = Number(inputValue);
        if (isNaN(value) || value < 0) return;
        updateBudget(value);
        setEditing(false);
        setInputValue('');
    };

    const handlePresetClick = (amt) => {
        updateBudget(amt);
        setEditing(false);
    };

    const barWidth = Math.min(percentUsed, 100);
    const barColor = isOverBudget
        ? 'var(--expense-color)'
        : percentUsed >= 80
            ? 'var(--warning-color)'
            : 'var(--income-color)';

    // Estimate days left in current month
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);
    const dailySafeSpend = remaining > 0 ? Math.round(remaining / daysLeft) : 0;

    return (
        <div className="dash-card glass-panel budget-card">
            <div className="dash-card-header">
                <div>
                    <h2><IconTarget size={18} style={{ color: 'var(--warning-color)' }} /> Monthly Budget Target</h2>
                    <p className="dash-card-subtitle">Track spending velocity against monthly limits</p>
                </div>
                {!editing && (
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            setInputValue(monthlyBudget ? String(monthlyBudget) : '');
                            setEditing(true);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        {monthlyBudget > 0 ? (
                            <><IconEdit size={13} /> Adjust</>
                        ) : (
                            <><IconPlus size={13} /> Set Budget</>
                        )}
                    </button>
                )}
            </div>

            {editing ? (
                <form onSubmit={handleSave} className="budget-edit-box animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="form-field">
                        <label>Monthly Spending Target (₹)</label>
                        <div className="input-with-prefix">
                            <span className="input-prefix-icon">₹</span>
                            <input
                                type="number"
                                min="0"
                                placeholder="Enter monthly budget..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="budget-presets">
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Presets:</span>
                        {BUDGET_PRESETS.map((amt) => (
                            <button
                                key={amt}
                                type="button"
                                className="quick-amt-chip"
                                onClick={() => handlePresetClick(amt)}
                            >
                                ₹{(amt / 1000)}k
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            Save Budget
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setEditing(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : monthlyBudget > 0 ? (
                <div className="budget-progress-box">
                    {/* Progress Meter Bar */}
                    <div className="budget-meter-track">
                        <div
                            className="budget-meter-fill"
                            style={{
                                width: `${barWidth}%`,
                                backgroundColor: barColor,
                                boxShadow: `0 0 10px ${barColor}`
                            }}
                        />
                    </div>

                    {/* Metric Details */}
                    <div className="budget-metrics-row">
                        <span>Spent: ₹{spentThisMonth.toLocaleString('en-IN')} ({percentUsed}%)</span>
                        <span style={{ color: remaining >= 0 ? 'var(--income-color)' : 'var(--expense-color)' }}>
                            {remaining >= 0 ? `₹${remaining.toLocaleString('en-IN')} left` : `₹${Math.abs(remaining).toLocaleString('en-IN')} over`}
                        </span>
                    </div>

                    {/* Status Alert Callout */}
                    {isOverBudget ? (
                        <div className="budget-callout alert-danger">
                            <IconAlertCircle size={16} />
                            <div>
                                <strong>Over Budget!</strong> You've exceeded your monthly limit by ₹{Math.abs(remaining).toLocaleString('en-IN')}.
                            </div>
                        </div>
                    ) : percentUsed >= 80 ? (
                        <div className="budget-callout alert-warning">
                            <IconAlertTriangle size={16} />
                            <div>
                                <strong>Caution:</strong> {percentUsed}% of budget consumed with {daysLeft} days remaining.
                            </div>
                        </div>
                    ) : (
                        <div className="budget-callout alert-safe">
                            <IconCheckCircle size={16} />
                            <div>
                                <strong>On Track:</strong> Safe daily spending allowance is <strong>₹{dailySafeSpend.toLocaleString('en-IN')}</strong>/day.
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="empty-state" style={{ padding: '20px 10px' }}>
                    <div className="empty-state-icon" style={{ width: '48px', height: '48px' }}>
                        <IconTarget size={24} />
                    </div>
                    <p style={{ fontSize: '0.8125rem' }}>No monthly budget set. Set a budget to receive alerts and pace your spending.</p>
                </div>
            )}
        </div>
    );
}

export default BudgetTracker;

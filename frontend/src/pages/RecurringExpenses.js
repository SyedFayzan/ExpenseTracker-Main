import React, { useState } from 'react';
import {
    IconRepeat,
    IconRefreshCw,
    IconPlus,
    IconClock,
    IconCheck,
    IconCheckCircle,
    IconPause,
    IconPlay,
    IconTrash,
    CategoryIcon
} from '../Icons';

const CATEGORIES = [
    { id: 'Rent', label: 'Housing & Rent' },
    { id: 'Utilities', label: 'Bills & Utilities' },
    { id: 'Entertainment', label: 'Subscriptions & Streaming' },
    { id: 'Transport', label: 'Transport / EMI' },
    { id: 'Food', label: 'Food & Dining' },
    { id: 'Shopping', label: 'Shopping' },
    { id: 'Other', label: 'Other Commitment' }
];

const PRESETS = [
    { text: 'House Rent', amount: 15000, category: 'Rent' },
    { text: 'Netflix Subscription', amount: 649, category: 'Entertainment' },
    { text: 'Spotify Premium', amount: 119, category: 'Entertainment' },
    { text: 'Electricity & Wifi', amount: 2500, category: 'Utilities' },
    { text: 'Car EMI', amount: 12000, category: 'Transport' },
    { text: 'Gym Membership', amount: 1500, category: 'Other' }
];

function RecurringExpenses({
    recurringList = [],
    monthlyCommitment = 0,
    addRecurringExpense,
    toggleRecurringExpense,
    deleteRecurringExpense,
    processRecurringNow
}) {
    const [isAdding, setIsAdding] = useState(false);
    const [text, setText] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Rent');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [actionId, setActionId] = useState(null);

    const handleCreate = async (e) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!text.trim() || isNaN(numAmount) || numAmount <= 0) return;

        setIsSubmitting(true);
        try {
            await addRecurringExpense({
                text: text.trim(),
                amount: -Math.abs(numAmount),
                category: category || 'Rent',
                interval: 'monthly',
                addInitial: true
            });
            setText('');
            setAmount('');
            setIsAdding(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApplyPreset = (preset) => {
        setText(preset.text);
        setAmount(String(preset.amount));
        setCategory(preset.category);
        setIsAdding(true);
    };

    const handleToggle = async (item) => {
        setActionId(item._id);
        try {
            await toggleRecurringExpense(item._id, !item.isActive);
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Cancel and delete this monthly recurring schedule? (Past transactions in ledger will remain safe)')) {
            setActionId(id);
            try {
                await deleteRecurringExpense(id);
            } finally {
                setActionId(null);
            }
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await processRecurringNow();
        } finally {
            setIsSyncing(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Pending';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const activeCount = recurringList.filter(r => r.isActive).length;

    // Find next upcoming due date among active recurring items
    const nextUpcoming = recurringList
        .filter(r => r.isActive && r.nextDueDate)
        .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())[0];

    return (
        <div className="dash-card glass-panel recurring-card">
            <div className="dash-card-header">
                <div>
                    <h2><IconRepeat size={18} style={{ color: 'var(--brand-primary)' }} /> Monthly Recurring Schedules</h2>
                    <p className="dash-card-subtitle">
                        Auto-adds fixed expenses (Rent, Subscriptions, EMI) each month
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleSync}
                        disabled={isSyncing}
                        title="Check and auto-add any due recurring expenses now"
                        style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <IconRefreshCw size={13} className={isSyncing ? "spin-icon" : ""} />
                        <span>{isSyncing ? 'Syncing...' : 'Sync Auto-Add'}</span>
                    </button>
                    {!isAdding && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setIsAdding(true)}
                            style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <IconPlus size={13} /> Add Schedule
                        </button>
                    )}
                </div>
            </div>

            {/* Recurring Overview KPI Banner */}
            <div className="recurring-hero-banner">
                <div className="recurring-stat-item">
                    <span className="stat-label">Monthly Fixed Commitments</span>
                    <span className="stat-value" style={{ color: 'var(--expense-color)' }}>
                        ₹{monthlyCommitment.toLocaleString('en-IN')} <span className="stat-sub">/ month</span>
                    </span>
                </div>
                <div className="recurring-stat-item">
                    <span className="stat-label">Active Schedules</span>
                    <span className="stat-value">
                        {activeCount} <span className="stat-sub">of {recurringList.length} active</span>
                    </span>
                </div>
            </div>

            {/* Next Due Alert */}
            {nextUpcoming && (
                <div className="recurring-next-alert">
                    <span className="alert-icon" style={{ display: 'flex', alignItems: 'center' }}>
                        <IconClock size={16} />
                    </span>
                    <div className="alert-body">
                        <strong>Next scheduled auto-add:</strong> {nextUpcoming.text} (₹{Math.abs(nextUpcoming.amount).toLocaleString('en-IN')}) on <strong>{formatDate(nextUpcoming.nextDueDate)}</strong>
                    </div>
                </div>
            )}

            {/* Quick Add Form / Mode */}
            {isAdding && (
                <form onSubmit={handleCreate} className="recurring-form animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <IconRepeat size={14} style={{ color: 'var(--brand-primary)' }} /> New Monthly Recurring Rule
                        </strong>
                        <button
                            type="button"
                            className="search-clear-btn"
                            onClick={() => setIsAdding(false)}
                        >
                            ✕ Cancel
                        </button>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label>Amount (₹/month)</label>
                            <div className="input-with-prefix">
                                <span className="input-prefix-icon">₹</span>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Description / Subscription</label>
                            <input
                                type="text"
                                placeholder="e.g. Netflix, Apartment Rent, Gym..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Category</label>
                        <div className="category-chips-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`cat-chip ${category === cat.id ? 'selected' : ''}`}
                                    onClick={() => setCategory(cat.id)}
                                >
                                    <span className="cat-emoji" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <CategoryIcon category={cat.id} size={15} />
                                    </span>
                                    <span>{cat.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick presets */}
                    <div className="form-field">
                        <label>Suggested Quick Templates</label>
                        <div className="quick-amounts">
                            {PRESETS.map((p, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="quick-amt-chip"
                                    onClick={() => handleApplyPreset(p)}
                                >
                                    {p.text} (₹{p.amount})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                            <IconCheck size={15} /> {isSubmitting ? 'Saving...' : 'Schedule Monthly Expense'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setIsAdding(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* List of Recurring Expenses */}
            <div className="recurring-list">
                {recurringList.length === 0 ? (
                    <div className="empty-state" style={{ padding: '24px 12px' }}>
                        <div className="empty-state-icon">
                            <IconRepeat size={20} />
                        </div>
                        <h4>No recurring expenses yet</h4>
                        <p>Mark any expense as "repeats monthly" (Rent, Netflix, EMI, Wifi) or click "+ Add Schedule" above.</p>
                        <div className="quick-amounts" style={{ justifyContent: 'center', marginTop: '10px' }}>
                            {PRESETS.slice(0, 3).map((p, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="quick-amt-chip"
                                    onClick={() => handleApplyPreset(p)}
                                >
                                    + {p.text}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    recurringList.map((item) => {
                        const isProcessing = actionId === item._id;

                        return (
                            <div
                                key={item._id}
                                className={`recurring-item animate-fade-in ${!item.isActive ? 'item-paused' : ''}`}
                            >
                                <div className="recurring-item-left">
                                    <div className="tx-cat-icon">
                                        <CategoryIcon category={item.category} size={16} />
                                    </div>
                                    <div className="recurring-item-info">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span className="recurring-name">{item.text}</span>
                                            <span className={`badge ${item.isActive ? 'badge-income' : 'badge-neutral'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                {item.isActive ? (
                                                    <><IconCheckCircle size={10} /> Active</>
                                                ) : (
                                                    <><IconPause size={10} /> Paused</>
                                                )}
                                            </span>
                                        </div>
                                        <div className="recurring-item-dates">
                                            <span>{item.category}</span>
                                            <span>•</span>
                                            <span>Next auto-add: <strong>{formatDate(item.nextDueDate)}</strong></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="recurring-item-right">
                                    <div className="recurring-amt-box">
                                        <span className="recurring-amt">
                                            ₹{Math.abs(item.amount).toLocaleString('en-IN')}
                                        </span>
                                        <span className="recurring-freq">/ month</span>
                                    </div>

                                    <div className="recurring-item-actions">
                                        <button
                                            type="button"
                                            className="btn-icon-sm"
                                            onClick={() => handleToggle(item)}
                                            disabled={isProcessing}
                                            title={item.isActive ? 'Pause recurring auto-add' : 'Resume recurring auto-add'}
                                        >
                                            {item.isActive ? <IconPause size={13} /> : <IconPlay size={13} />}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-icon-sm btn-delete"
                                            onClick={() => handleDelete(item._id)}
                                            disabled={isProcessing}
                                            title="Cancel and remove schedule"
                                        >
                                            <IconTrash size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default RecurringExpenses;

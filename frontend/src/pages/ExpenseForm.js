import React, { useState } from 'react';
import { handleError } from '../utils';
import {
    IconZap,
    IconTrendingDown,
    IconTrendingUp,
    IconRepeat,
    IconCheck,
    IconArrowDownRight,
    IconArrowUpRight,
    CategoryIcon
} from '../Icons';

const CATEGORIES = [
    { id: 'Food', label: 'Food & Dining' },
    { id: 'Transport', label: 'Transport' },
    { id: 'Rent', label: 'Housing & Rent' },
    { id: 'Shopping', label: 'Shopping' },
    { id: 'Utilities', label: 'Bills & Utilities' },
    { id: 'Entertainment', label: 'Entertainment' },
    { id: 'Salary', label: 'Salary & Inflow' },
    { id: 'Other', label: 'Miscellaneous' }
];

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

function ExpenseForm({ addTransaction }) {
    const [txType, setTxType] = useState('expense'); // 'expense' or 'income'
    const [text, setText] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [isRecurring, setIsRecurring] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);

        if (!text.trim()) {
            return handleError('Please provide a description for the transaction');
        }
        if (isNaN(numAmount) || numAmount <= 0) {
            return handleError('Please enter a valid positive amount');
        }

        // Expenses are stored as negative numbers in backend, Income as positive numbers
        const finalAmount = txType === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);

        setIsSubmitting(true);
        try {
            await addTransaction({
                text: text.trim(),
                amount: finalAmount,
                category: category || (txType === 'income' ? 'Salary' : 'Other'),
                isRecurring: txType === 'expense' && isRecurring,
                recurringInterval: 'monthly'
            });
            // Reset form
            setText('');
            setAmount('');
            setIsRecurring(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTypeChange = (type) => {
        setTxType(type);
        if (type === 'income') {
            setIsRecurring(false);
            if (category === 'Food') setCategory('Salary');
        } else if (type === 'expense') {
            if (category === 'Salary') setCategory('Food');
        }
    };

    return (
        <div className="dash-card glass-panel transaction-creator-card">
            <div className="dash-card-header">
                <div>
                    <h2><IconZap size={18} style={{ color: 'var(--brand-primary)' }} /> New Transaction</h2>
                    <p className="dash-card-subtitle">Record cash flow and categorize spending in real time</p>
                </div>
            </div>

            {/* Segmented Type Switch */}
            <div className="tx-type-switch">
                <button
                    type="button"
                    className={`tx-type-btn ${txType === 'expense' ? 'active-expense' : ''}`}
                    onClick={() => handleTypeChange('expense')}
                >
                    <IconTrendingDown size={15} /> Expense Outflow
                </button>
                <button
                    type="button"
                    className={`tx-type-btn ${txType === 'income' ? 'active-income' : ''}`}
                    onClick={() => handleTypeChange('income')}
                >
                    <IconTrendingUp size={15} /> Income Inflow
                </button>
            </div>

            <form onSubmit={handleSubmit} className="tx-form">
                <div className="form-row">
                    {/* Amount Input */}
                    <div className="form-field">
                        <label htmlFor="tx-amount">Amount (₹)</label>
                        <div className="input-with-prefix">
                            <span className="input-prefix-icon">₹</span>
                            <input
                                id="tx-amount"
                                type="number"
                                step="any"
                                min="1"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Description Input */}
                    <div className="form-field">
                        <label htmlFor="tx-text">Description / Reference</label>
                        <input
                            id="tx-text"
                            type="text"
                            placeholder="e.g., House Rent, Netflix, Car EMI, Groceries..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Quick Amount Suggestion Chips */}
                <div className="form-field">
                    <label>Quick Preset Amounts</label>
                    <div className="quick-amounts">
                        {QUICK_AMOUNTS.map((amt) => (
                            <button
                                key={amt}
                                type="button"
                                className="quick-amt-chip"
                                onClick={() => setAmount(String(amt))}
                            >
                                +₹{amt.toLocaleString('en-IN')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Visual Category Grid */}
                <div className="form-field">
                    <div className="category-picker-label">
                        <label>Category Tag</label>
                        <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CategoryIcon category={category} size={12} /> {category}
                        </span>
                    </div>
                    <div className="category-chips-grid">
                        {CATEGORIES.map((cat) => (
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

                {/* Recurring Monthly Checkbox / Toggle */}
                {txType === 'expense' && (
                    <div
                        className={`recurring-toggle-box ${isRecurring ? 'active' : ''}`}
                        onClick={() => setIsRecurring(!isRecurring)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setIsRecurring(!isRecurring); }}
                    >
                        <div className="recurring-toggle-left">
                            <div className="recurring-checkbox-custom">
                                {isRecurring && <IconCheck size={13} color="#ffffff" />}
                            </div>
                            <div className="recurring-label-wrap">
                                <span className="recurring-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <IconRepeat size={14} style={{ color: 'var(--brand-primary)' }} /> Repeats Monthly (Rent, Subscriptions, EMI)
                                </span>
                                <span className="recurring-subtitle">Automatically logs this expense each month</span>
                            </div>
                        </div>
                        <span className={`recurring-status-pill ${isRecurring ? 'pill-active' : ''}`}>
                            {isRecurring ? 'Auto-Add ON' : 'One-time'}
                        </span>
                    </div>
                )}

                {/* Submit Action Button */}
                <button
                    type="submit"
                    className={`btn ${txType === 'expense' ? 'btn-danger' : 'btn-primary'}`}
                    disabled={isSubmitting}
                    style={{
                        padding: '14px',
                        fontSize: '0.9375rem',
                        fontWeight: '700',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    {isSubmitting ? (
                        'Processing...'
                    ) : txType === 'expense' ? (
                        isRecurring ? (
                            <><IconRepeat size={16} /> Record & Schedule Monthly</>
                        ) : (
                            <><IconArrowDownRight size={16} /> Record Expense</>
                        )
                    ) : (
                        <><IconArrowUpRight size={16} /> Record Income</>
                    )}
                </button>
            </form>
        </div>
    );
}

export default ExpenseForm;

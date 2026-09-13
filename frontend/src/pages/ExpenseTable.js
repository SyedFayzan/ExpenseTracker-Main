import React, { useState, useMemo } from 'react';
import {
    IconReceipt,
    IconDownload,
    IconSearch,
    IconTrash,
    IconRepeat,
    IconTrendingDown,
    IconTrendingUp,
    CategoryIcon
} from '../Icons';

const ExpenseTable = ({ expenses = [], deleteExpens }) => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, EXPENSE, INCOME, RECURRING
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, amount-desc, amount-asc
    const [deletingId, setDeletingId] = useState(null);

    const exportCSV = () => {
        const rows = [['Description', 'Category', 'Amount (INR)', 'Type', 'Recurring', 'Date', 'Time']];
        (expenses || []).forEach(e => {
            const dateObj = new Date(e.createdAt || Date.now());
            const type = e.amount >= 0 ? 'Income' : 'Expense';
            const recurring = e.isRecurring ? 'Yes (Monthly)' : 'No';
            rows.push([
                `"${(e.text || '').replace(/"/g, '""')}"`,
                e.category || 'Other',
                e.amount,
                type,
                recurring,
                dateObj.toLocaleDateString('en-IN'),
                dateObj.toLocaleTimeString('en-IN')
            ]);
        });
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `finpulse_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    };

    // Filter and sort transactions
    const filteredExpenses = useMemo(() => {
        let list = [...(expenses || [])];

        // Search text
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(e => {
                const textMatch = (e.text || '').toLowerCase().includes(q);
                const catMatch = (e.category || '').toLowerCase().includes(q);
                const dateStr = new Date(e.createdAt || Date.now()).toLocaleDateString('en-IN');
                const isRecMatch = e.isRecurring && ('recurring monthly auto').includes(q);
                return textMatch || catMatch || dateStr.includes(q) || isRecMatch;
            });
        }

        // Type filter
        if (typeFilter === 'EXPENSE') {
            list = list.filter(e => e.amount < 0);
        } else if (typeFilter === 'INCOME') {
            list = list.filter(e => e.amount > 0);
        } else if (typeFilter === 'RECURRING') {
            list = list.filter(e => e.isRecurring);
        }

        // Category filter
        if (categoryFilter !== 'ALL') {
            list = list.filter(e => (e.category || 'Other') === categoryFilter);
        }

        // Sorting
        list.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            if (sortBy === 'newest') return dateB - dateA;
            if (sortBy === 'oldest') return dateA - dateB;
            if (sortBy === 'amount-desc') return Math.abs(b.amount) - Math.abs(a.amount);
            if (sortBy === 'amount-asc') return Math.abs(a.amount) - Math.abs(b.amount);
            return 0;
        });

        return list;
    }, [expenses, search, typeFilter, categoryFilter, sortBy]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            setDeletingId(id);
            try {
                await deleteExpens(id);
            } finally {
                setDeletingId(null);
            }
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Recent';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Extract unique categories present in current dataset
    const availableCategories = useMemo(() => {
        const set = new Set((expenses || []).map(e => e.category || 'Other'));
        return Array.from(set);
    }, [expenses]);

    const recurringCount = (expenses || []).filter(e => e.isRecurring).length;

    return (
        <div className="dash-card glass-panel transaction-feed-card">
            <div className="dash-card-header">
                <div>
                    <h2><IconReceipt size={18} style={{ color: 'var(--brand-primary)' }} /> Transaction Ledger</h2>
                    <p className="dash-card-subtitle">
                        Showing {filteredExpenses.length} of {expenses.length} records
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={exportCSV}
                    title="Export filtered records to CSV"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <IconDownload size={14} /> Export CSV
                </button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="table-toolbar">
                <div className="toolbar-top-row">
                    <div className="search-input-wrapper">
                        <span className="search-icon">
                            <IconSearch size={14} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search description, category, date, recurring..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                className="search-clear-btn"
                                onClick={() => setSearch('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ maxWidth: '170px' }}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="amount-desc">Highest Amount</option>
                        <option value="amount-asc">Lowest Amount</option>
                    </select>
                </div>

                {/* Filter Pills */}
                <div className="filter-pills-row">
                    <button
                        type="button"
                        className={`filter-pill ${typeFilter === 'ALL' && categoryFilter === 'ALL' ? 'active' : ''}`}
                        onClick={() => { setTypeFilter('ALL'); setCategoryFilter('ALL'); }}
                    >
                        All Transactions
                    </button>
                    <button
                        type="button"
                        className={`filter-pill ${typeFilter === 'EXPENSE' ? 'active' : ''}`}
                        onClick={() => setTypeFilter(typeFilter === 'EXPENSE' ? 'ALL' : 'EXPENSE')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                        <IconTrendingDown size={13} /> Expenses Only
                    </button>
                    <button
                        type="button"
                        className={`filter-pill ${typeFilter === 'INCOME' ? 'active' : ''}`}
                        onClick={() => setTypeFilter(typeFilter === 'INCOME' ? 'ALL' : 'INCOME')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                        <IconTrendingUp size={13} /> Income Only
                    </button>
                    {recurringCount > 0 && (
                        <button
                            type="button"
                            className={`filter-pill ${typeFilter === 'RECURRING' ? 'active' : ''}`}
                            onClick={() => setTypeFilter(typeFilter === 'RECURRING' ? 'ALL' : 'RECURRING')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                            <IconRepeat size={13} /> Recurring ({recurringCount})
                        </button>
                    )}

                    {availableCategories.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                            onClick={() => setCategoryFilter(categoryFilter === cat ? 'ALL' : cat)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                            <CategoryIcon category={cat} size={13} /> {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions List */}
            <div className="tx-list">
                {filteredExpenses.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <IconReceipt size={20} />
                        </div>
                        <h4>No transactions found</h4>
                        <p>Try clearing your search or add a new transaction using the form above.</p>
                    </div>
                ) : (
                    filteredExpenses.map((expense) => {
                        const isIncome = expense.amount > 0;
                        const cat = expense.category || 'Other';
                        const formattedAmt = `₹${Math.abs(expense.amount).toLocaleString('en-IN')}`;

                        return (
                            <div key={expense._id} className="tx-item animate-fade-in">
                                <div className="tx-left">
                                    <div className="tx-cat-icon" title={cat}>
                                        <CategoryIcon category={cat} size={16} />
                                    </div>
                                    <div className="tx-meta">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span className="tx-title">{expense.text}</span>
                                            {expense.isRecurring && (
                                                <span className="badge badge-recurring" title="Monthly recurring auto-expense" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                    <IconRepeat size={10} /> Monthly
                                                </span>
                                            )}
                                        </div>
                                        <div className="tx-submeta">
                                            <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                <CategoryIcon category={cat} size={10} /> {cat}
                                            </span>
                                            <span>•</span>
                                            <span>{formatDate(expense.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="tx-right">
                                    <span className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
                                        {isIncome ? `+${formattedAmt}` : `-${formattedAmt}`}
                                    </span>
                                    <button
                                        type="button"
                                        className="tx-delete-btn"
                                        title="Delete transaction"
                                        disabled={deletingId === expense._id}
                                        onClick={() => handleDelete(expense._id)}
                                    >
                                        <IconTrash size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ExpenseTable;
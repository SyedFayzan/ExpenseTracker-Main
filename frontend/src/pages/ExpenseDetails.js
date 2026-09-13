import React from 'react';
import {
    IconDiamond,
    IconTrendingUp,
    IconTrendingDown,
    IconTarget,
    IconArrowUpRight,
    IconArrowDownRight,
    IconAlertCircle,
    IconCheckCircle
} from '../Icons';

function ExpenseDetails({ incomeAmt = 0, expenseAmt = 0, budgetStatus = {} }) {
    const netBalance = incomeAmt - expenseAmt;
    const savingsRate = incomeAmt > 0 ? Math.round(((incomeAmt - expenseAmt) / incomeAmt) * 100) : 0;

    const { monthlyBudget = 0, spentThisMonth = 0, percentUsed = 0, isOverBudget = false } = budgetStatus || {};

    const formatCurrency = (val) => {
        return `₹${Math.abs(val).toLocaleString('en-IN')}`;
    };

    const budgetBarColor = isOverBudget
        ? 'var(--expense-color)'
        : percentUsed >= 80
            ? 'var(--warning-color)'
            : 'var(--income-color)';

    return (
        <section className="kpi-grid">
            {/* 1. Net Balance Card */}
            <div className="kpi-card glass-panel kpi-balance">
                <div className="kpi-header">
                    <span className="kpi-label">Total Net Balance</span>
                    <div className="kpi-icon-bubble">
                        <IconDiamond size={17} />
                    </div>
                </div>
                <div className="kpi-amount">
                    {netBalance < 0 ? `-${formatCurrency(netBalance)}` : formatCurrency(netBalance)}
                </div>
                <div className="kpi-footer">
                    <span className={`kpi-trend ${netBalance >= 0 ? 'trend-positive' : 'trend-negative'}`}>
                        {netBalance >= 0 ? (
                            <><IconArrowUpRight size={14} /> Positive</>
                        ) : (
                            <><IconArrowDownRight size={14} /> Deficit</>
                        )}
                    </span>
                    <span className="badge badge-neutral">
                        Savings: {savingsRate}%
                    </span>
                </div>
            </div>

            {/* 2. Total Income Card */}
            <div className="kpi-card glass-panel kpi-income">
                <div className="kpi-header">
                    <span className="kpi-label">Monthly Income</span>
                    <div className="kpi-icon-bubble">
                        <IconTrendingUp size={17} />
                    </div>
                </div>
                <div className="kpi-amount" style={{ color: 'var(--income-color)' }}>
                    +{formatCurrency(incomeAmt)}
                </div>
                <div className="kpi-footer">
                    <span className="kpi-trend trend-positive">
                        <IconArrowUpRight size={14} /> Inflow
                    </span>
                    <span className="badge badge-income">Received</span>
                </div>
            </div>

            {/* 3. Total Expenses Card */}
            <div className="kpi-card glass-panel kpi-expense">
                <div className="kpi-header">
                    <span className="kpi-label">Monthly Expenses</span>
                    <div className="kpi-icon-bubble">
                        <IconTrendingDown size={17} />
                    </div>
                </div>
                <div className="kpi-amount" style={{ color: 'var(--expense-color)' }}>
                    -{formatCurrency(expenseAmt)}
                </div>
                <div className="kpi-footer">
                    <span className="kpi-trend trend-negative">
                        <IconArrowDownRight size={14} /> Outflow
                    </span>
                    <span className="badge badge-expense">Spent</span>
                </div>
            </div>

            {/* 4. Budget Health Card */}
            <div className="kpi-card glass-panel kpi-budget" style={{ position: 'relative' }}>
                <div className="kpi-header">
                    <span className="kpi-label">Budget Health</span>
                    <div className="kpi-icon-bubble" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning-color)' }}>
                        <IconTarget size={17} />
                    </div>
                </div>
                <div className="kpi-amount" style={{ fontSize: '1.45rem', color: isOverBudget ? 'var(--expense-color)' : 'var(--text-primary)' }}>
                    {monthlyBudget > 0 ? (
                        <>₹{spentThisMonth.toLocaleString('en-IN')} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>/ ₹{monthlyBudget.toLocaleString('en-IN')}</span></>
                    ) : (
                        <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No Budget Set</span>
                    )}
                </div>
                <div className="kpi-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px', paddingTop: '8px' }}>
                    {monthlyBudget > 0 ? (
                        <>
                            <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(percentUsed, 100)}%`, height: '100%', backgroundColor: budgetBarColor, transition: 'width 0.4s ease' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', alignItems: 'center' }}>
                                <span>{percentUsed}% Used</span>
                                <span style={{ color: isOverBudget ? 'var(--expense-color)' : 'var(--income-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {isOverBudget ? (
                                        <><IconAlertCircle size={13} /> Over Budget</>
                                    ) : (
                                        <><IconCheckCircle size={13} /> Within Limit</>
                                    )}
                                </span>
                            </div>
                        </>
                    ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Set a target to track progress</span>
                    )}
                </div>
            </div>
        </section>
    );
}

export default ExpenseDetails;
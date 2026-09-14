import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APIUrl, handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExpenseTable from './ExpenseTable';
import ExpenseDetails from './ExpenseDetails';
import ExpenseForm from './ExpenseForm';
import BudgetTracker from './BudgetTracker';
import CategoryPieChart from './CategoryPieChart';
import ChatBot from './ChatBot';
import RecurringExpenses from './RecurringExpenses';
import ExpenseHeatmap from './ExpenseHeatmap';
import {
    IconZap,
    IconSun,
    IconMoon,
    IconLogOut,
    IconCalendar,
    IconPieChart,
    IconTarget,
    IconRepeat,
    IconFlame,
    IconBot
} from '../Icons';

function Home() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [incomeAmt, setIncomeAmt] = useState(0);
    const [expenseAmt, setExpenseAmt] = useState(0);
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'budget', 'recurring', 'heatmap', 'chatbot'
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : false; // Default to sleek light or dark
    });
    const [budgetStatus, setBudgetStatus] = useState({
        monthlyBudget: 0,
        spentThisMonth: 0,
        remaining: 0,
        percentUsed: 0,
        isOverBudget: false
    });
    const [categoryData, setCategoryData] = useState([]);
    const [recurringList, setRecurringList] = useState([]);
    const [monthlyCommitment, setMonthlyCommitment] = useState(0);
    const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear());
    const [heatmapData, setHeatmapData] = useState([]);
    const [isHeatmapLoading, setIsHeatmapLoading] = useState(false);

    const navigate = useNavigate();

    // Initialize Theme
    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser') || 'User');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        handleSuccess('Successfully logged out');
        setTimeout(() => {
            navigate('/login');
        }, 800);
    };

    // Recalculate income & expense totals
    useEffect(() => {
        const list = expenses || [];
        const amounts = list.map(item => item.amount);
        const income = amounts.filter(item => item > 0)
            .reduce((acc, item) => (acc += item), 0);
        const exp = amounts.filter(item => item < 0)
            .reduce((acc, item) => (acc += item), 0) * -1;
        setIncomeAmt(income);
        setExpenseAmt(exp);
    }, [expenses]);

    const deleteExpens = async (id) => {
        try {
            const url = `${APIUrl}/expenses/${id}`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                },
                method: "DELETE"
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message || 'Transaction removed');
            setExpenses(result.data || []);
            fetchBudgetStatus();
            fetchCategoryBreakdown();
            fetchHeatmapData(heatmapYear);
        } catch (err) {
            handleError(err);
        }
    };

    const fetchExpenses = async () => {
        try {
            const url = `${APIUrl}/expenses`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                }
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            setExpenses(result.data || []);
        } catch (err) {
            handleError(err);
        }
    };

    const addTransaction = async (data) => {
        try {
            const url = `${APIUrl}/expenses`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token') || '',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(data)
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message || 'Transaction recorded');
            setExpenses(result.data || []);
            fetchBudgetStatus();
            fetchCategoryBreakdown();
            fetchRecurringExpenses();
            fetchHeatmapData(heatmapYear);
        } catch (err) {
            handleError(err);
        }
    };

    const fetchBudgetStatus = async () => {
        try {
            const url = `${APIUrl}/expenses/budget`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                }
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            if (result?.data) {
                setBudgetStatus(result.data);
            }
        } catch (err) {
            handleError(err);
        }
    };

    const updateBudget = async (monthlyBudget) => {
        try {
            const url = `${APIUrl}/expenses/budget`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token') || '',
                    'Content-Type': 'application/json'
                },
                method: "PUT",
                body: JSON.stringify({ monthlyBudget })
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message || 'Monthly budget saved');
            fetchBudgetStatus();
        } catch (err) {
            handleError(err);
        }
    };

    const fetchCategoryBreakdown = async () => {
        try {
            const url = `${APIUrl}/expenses/categories`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                }
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            if (result?.data) setCategoryData(result.data);
        } catch (err) {
            handleError(err);
        }
    };

    const fetchRecurringExpenses = async () => {
        try {
            const url = `${APIUrl}/expenses/recurring`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                }
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            if (result?.data) {
                setRecurringList(result.data || []);
                setMonthlyCommitment(result.monthlyCommitment || 0);
            }
        } catch (err) {
            handleError(err);
        }
    };

    const fetchHeatmapData = async (targetYear = heatmapYear) => {
        setIsHeatmapLoading(true);
        try {
            const url = `${APIUrl}/expenses/heatmap?year=${targetYear}`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                }
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            if (result?.data) {
                setHeatmapData(result.data || []);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setIsHeatmapLoading(false);
        }
    };

    const addRecurringExpense = async (data) => {
        try {
            const url = `${APIUrl}/expenses/recurring`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token') || '',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(data)
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message || 'Recurring expense scheduled');
            if (result.expenses) setExpenses(result.expenses);
            fetchRecurringExpenses();
            fetchExpenses();
            fetchBudgetStatus();
            fetchCategoryBreakdown();
            fetchHeatmapData(heatmapYear);
        } catch (err) {
            handleError(err);
        }
    };

    const toggleRecurringExpense = async (id, isActive) => {
        try {
            const url = `${APIUrl}/expenses/recurring/${id}`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token') || '',
                    'Content-Type': 'application/json'
                },
                method: "PUT",
                body: JSON.stringify({ isActive })
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message || 'Recurring status updated');
            fetchRecurringExpenses();
        } catch (err) {
            handleError(err);
        }
    };

    const deleteRecurringExpense = async (id) => {
        try {
            const url = `${APIUrl}/expenses/recurring/${id}`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                },
                method: "DELETE"
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message || 'Recurring schedule removed');
            fetchRecurringExpenses();
        } catch (err) {
            handleError(err);
        }
    };

    const processRecurringNow = async () => {
        try {
            const url = `${APIUrl}/expenses/recurring/process`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token') || ''
                },
                method: "POST"
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message || 'Recurring expenses processed');
            if (result.data) setExpenses(result.data);
            if (result.recurringList) setRecurringList(result.recurringList);
            fetchBudgetStatus();
            fetchCategoryBreakdown();
            fetchRecurringExpenses();
            fetchHeatmapData(heatmapYear);
        } catch (err) {
            handleError(err);
        }
    };

    useEffect(() => {
        fetchExpenses();
        fetchBudgetStatus();
        fetchCategoryBreakdown();
        fetchRecurringExpenses();
        fetchHeatmapData(heatmapYear);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchHeatmapData(heatmapYear);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [heatmapYear]);

    // Get greeting according to local time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const formattedDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const userInitial = (loggedInUser || 'U').charAt(0).toUpperCase();

    return (
        <div className="App">
            {/* Top Navigation Bar */}
            <header className="app-navbar">
                <div className="brand-section">
                    <div className="brand-icon-wrapper">
                        <IconZap size={20} color="#ffffff" />
                    </div>
                    <div className="brand-title">
                        Vaultix <span className="brand-tag">PRO</span>
                    </div>
                </div>

                <div className="nav-actions">
                    {/* Dark/Light Mode Toggle */}
                    <button
                        type="button"
                        className="btn-icon"
                        onClick={toggleTheme}
                        title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {isDarkMode ? <IconSun size={17} /> : <IconMoon size={17} />}
                    </button>

                    {/* User Profile Pill */}
                    <div className="user-profile-badge">
                        <div className="user-avatar">{userInitial}</div>
                        <span className="user-name">{loggedInUser}</span>
                        <div className="user-status-dot" title="Active session"></div>
                    </div>

                    {/* Logout Button */}
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleLogout}
                        style={{ padding: '6px 12px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <IconLogOut size={14} /> Logout
                    </button>
                </div>
            </header>

            {/* Main Dashboard Container */}
            <main className="dashboard-container">
                {/* Hero Greeting Section */}
                <section className="dashboard-hero">
                    <div className="hero-welcome">
                        <h1>{getGreeting()}, {loggedInUser}</h1>
                        <p>Real-time financial analytics, budget pacing, and intelligent ledger.</p>
                    </div>
                    <div className="hero-quick-stats">
                        <div className="date-pill">
                            <IconCalendar size={13} />
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                </section>

                {/* 4-Card Executive KPI Overview Summary */}
                <ExpenseDetails
                    incomeAmt={incomeAmt}
                    expenseAmt={expenseAmt}
                    budgetStatus={budgetStatus}
                />

                {/* 2-Column Balanced Dashboard Layout */}
                <div className="dashboard-grid">
                    {/* Left Column: Transaction Creator & Ledger */}
                    <div className="dashboard-col-left">
                        <ExpenseForm addTransaction={addTransaction} />
                        <ExpenseTable
                            expenses={expenses}
                            deleteExpens={deleteExpens}
                        />
                    </div>

                    {/* Right Column: Tabbed Insights & AI Intelligence Suite */}
                    <div className="dashboard-col-right">
                        {/* Tab Selector Bar */}
                        <div className="dash-card glass-panel" style={{ padding: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                                <button
                                    type="button"
                                    className={`filter-pill ${activeTab === 'analytics' ? 'active' : ''}`}
                                    style={{ textAlign: 'center', justifyContent: 'center', padding: '8px 2px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    onClick={() => setActiveTab('analytics')}
                                >
                                    <IconPieChart size={13} /> Categories
                                </button>
                                <button
                                    type="button"
                                    className={`filter-pill ${activeTab === 'budget' ? 'active' : ''}`}
                                    style={{ textAlign: 'center', justifyContent: 'center', padding: '8px 2px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    onClick={() => setActiveTab('budget')}
                                >
                                    <IconTarget size={13} /> Budget
                                </button>
                                <button
                                    type="button"
                                    className={`filter-pill ${activeTab === 'recurring' ? 'active' : ''}`}
                                    style={{ textAlign: 'center', justifyContent: 'center', padding: '8px 2px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    onClick={() => setActiveTab('recurring')}
                                >
                                    <IconRepeat size={13} /> Recurring
                                </button>
                                <button
                                    type="button"
                                    className={`filter-pill ${activeTab === 'heatmap' ? 'active' : ''}`}
                                    style={{ textAlign: 'center', justifyContent: 'center', padding: '8px 2px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    onClick={() => setActiveTab('heatmap')}
                                >
                                    <IconFlame size={13} /> Heatmap
                                </button>
                                <button
                                    type="button"
                                    className={`filter-pill ${activeTab === 'chatbot' ? 'active' : ''}`}
                                    style={{ textAlign: 'center', justifyContent: 'center', padding: '8px 2px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    onClick={() => setActiveTab('chatbot')}
                                >
                                    <IconBot size={13} /> AI Advisor
                                </button>
                            </div>
                        </div>

                        {/* Active Tab View */}
                        {activeTab === 'analytics' && (
                            <div className="animate-fade-in">
                                <CategoryPieChart data={categoryData} />
                            </div>
                        )}

                        {activeTab === 'budget' && (
                            <div className="animate-fade-in">
                                <BudgetTracker
                                    budgetStatus={budgetStatus}
                                    updateBudget={updateBudget}
                                />
                            </div>
                        )}

                        {activeTab === 'recurring' && (
                            <div className="animate-fade-in">
                                <RecurringExpenses
                                    recurringList={recurringList}
                                    monthlyCommitment={monthlyCommitment}
                                    addRecurringExpense={addRecurringExpense}
                                    toggleRecurringExpense={toggleRecurringExpense}
                                    deleteRecurringExpense={deleteRecurringExpense}
                                    processRecurringNow={processRecurringNow}
                                />
                            </div>
                        )}

                        {activeTab === 'heatmap' && (
                            <div className="animate-fade-in">
                                <ExpenseHeatmap
                                    heatmapData={heatmapData}
                                    expenses={expenses}
                                    year={heatmapYear}
                                    setYear={setHeatmapYear}
                                    isLoading={isHeatmapLoading}
                                />
                            </div>
                        )}

                        {activeTab === 'chatbot' && (
                            <div className="animate-fade-in">
                                <ChatBot />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <ToastContainer
                position="top-right"
                theme={isDarkMode ? 'dark' : 'light'}
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
            />
        </div>
    );
}

export default Home;
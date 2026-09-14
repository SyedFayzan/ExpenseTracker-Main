import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { APIUrl, handleError, handleSuccess } from '../utils';
import '../login.css';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    });
    const [shake, setShake] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const theme = darkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const { name, email, password } = signupInfo;

        if (!name || !email || !password) {
            triggerShake();
            return handleError('Name, email, and password are required');
        }

        setIsLoading(true);
        try {
            const url = `${APIUrl}/auth/signup`;
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupInfo)
            });

            const result = await response.json();
            const { success, message, error } = result;

            if (success) {
                handleSuccess(message || 'Account created successfully!');
                setTimeout(() => navigate('/login'), 1000);
            } else {
                triggerShake();
                const details = error?.details?.[0]?.message || message || 'Signup failed';
                handleError(details);
            }
        } catch (err) {
            triggerShake();
            handleError('Something went wrong. Please check your backend connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`login-page ${darkMode ? 'dark-theme' : 'light-theme'}`}>
            <div className="login-background"></div>

            {/* Theme Toggle Button */}
            <button
                type="button"
                className="btn-icon auth-theme-toggle"
                onClick={toggleDarkMode}
                aria-label={`Switch to ${darkMode ? 'Light' : 'Dark'} mode`}
                title={`Switch to ${darkMode ? 'Light' : 'Dark'} mode`}
            >
                {darkMode ? '☀️' : '🌙'}
            </button>

            <div className={`login-container ${shake ? 'shake-animation' : ''}`}>
                <div className="auth-brand">
                    <div className="auth-logo-icon">⚡</div>
                    <h1>Join Vaultix</h1>
                    <p>Start tracking your financial future with smart analytics</p>
                </div>

                <form onSubmit={handleSignup} className="login-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <div className="form-input-box">
                            <span className="form-input-icon">👤</span>
                            <input
                                onChange={handleChange}
                                value={signupInfo.name}
                                type="text"
                                name="name"
                                id="name"
                                placeholder="Syed Fayzen"
                                autoComplete="name"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="form-input-box">
                            <span className="form-input-icon">✉️</span>
                            <input
                                onChange={handleChange}
                                value={signupInfo.email}
                                type="email"
                                name="email"
                                id="email"
                                placeholder="name@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Create Password</label>
                        <div className="form-input-box">
                            <span className="form-input-icon">🔒</span>
                            <input
                                onChange={handleChange}
                                value={signupInfo.password}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="spinner-icon"></span>
                        ) : (
                            'Create Free Account ➔'
                        )}
                    </button>
                </form>

                <div className="auth-footer-link">
                    Already have an account? <Link to="/login">Sign In here</Link>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                theme={darkMode ? 'dark' : 'light'}
                autoClose={3000}
            />
        </div>
    );
}

export default Signup;

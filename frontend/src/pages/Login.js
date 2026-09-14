import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { APIUrl, handleError, handleSuccess } from '../utils';
import '../login.css';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;

        if (!email || !password) {
            triggerShake();
            return handleError('Email and password are required');
        }

        setIsLoading(true);

        try {
            const url = `${APIUrl}/auth/login`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });

            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;

            if (success) {
                handleSuccess(message || 'Login successful');
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);

                setTimeout(() => {
                    navigate('/home');
                }, 800);
            } else {
                triggerShake();
                const details = error?.details?.[0]?.message || message || 'Login failed';
                handleError(details);
            }
        } catch (err) {
            console.error("❌ Error during login:", err);
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
                    <h1>Vaultix</h1>
                    <p>Welcome back! Sign in to access your wealth portal</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="form-input-box">
                            <span className="form-input-icon">✉️</span>
                            <input
                                onChange={handleChange}
                                value={loginInfo.email}
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
                        <label htmlFor="password">Password</label>
                        <div className="form-input-box">
                            <span className="form-input-icon">🔒</span>
                            <input
                                onChange={handleChange}
                                value={loginInfo.password}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"
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

                    <div className="form-options">
                        <label className="remember-me-checkbox">
                            <input type="checkbox" id="remember" name="remember" />
                            <span>Remember this device</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="spinner-icon"></span>
                        ) : (
                            'Sign In to Dashboard ➔'
                        )}
                    </button>
                </form>

                <div className="auth-footer-link">
                    Don't have an account? <Link to="/signup">Create one for free</Link>
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

export default Login;
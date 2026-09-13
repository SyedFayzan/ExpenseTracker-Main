import React, { useState, useRef, useEffect } from 'react';
import { APIUrl, handleError } from '../utils';
import {
    IconBot,
    IconUser,
    IconLightbulb,
    IconTarget,
    IconUtensils,
    IconTrendingUp
} from '../Icons';

const SUGGESTED_PROMPTS = [
    { text: 'Give me 3 smart ways to cut expenses', icon: IconLightbulb },
    { text: 'How is my monthly budget health?', icon: IconTarget },
    { text: 'Tips to reduce food & dining spend', icon: IconUtensils },
    { text: 'How to invest ₹10,000 monthly?', icon: IconTrendingUp }
];

function ChatBot() {
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: 'Hello! I am your FinPulse AI Wealth Advisor. Ask me anything about your finances, budget optimization, or spending habits.'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const sendMsg = async (queryText) => {
        const textToSend = queryText || input;
        if (!textToSend.trim() || loading) return;

        const userMsg = textToSend.trim();
        setMessages(m => [...m, { role: 'user', text: userMsg }]);
        if (!queryText) setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${APIUrl}/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token') || ''
                },
                body: JSON.stringify({ message: userMsg })
            });

            const result = await response.json();
            if (!result.success) {
                handleError(result.message || 'AI Assistant unavailable');
                setMessages(m => [...m, { role: 'bot', text: 'Sorry, I ran into an issue retrieving advice. Please try again in a moment.' }]);
                return;
            }

            setMessages(m => [...m, { role: 'bot', text: result.data.reply }]);
        } catch (err) {
            handleError(err);
            setMessages(m => [...m, { role: 'bot', text: 'Network connection issue. Please check your server connectivity.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        sendMsg();
    };

    return (
        <div className="dash-card glass-panel ai-assistant-card">
            <div className="dash-card-header">
                <div>
                    <h2><IconBot size={18} style={{ color: 'var(--info-color)' }} /> FinPulse AI Advisor</h2>
                    <p className="dash-card-subtitle">Intelligent financial insights & saving strategies</p>
                </div>
                <span className="badge badge-neutral" style={{ color: 'var(--info-color)' }}>
                    ● Online
                </span>
            </div>

            <div className="chatbot-panel">
                {/* Chat Bubble Log */}
                <div className="chatbot-messages-box">
                    {messages.map((m, i) => (
                        <div key={i} className={`chat-bubble ${m.role}`}>
                            <div className="chat-avatar">
                                {m.role === 'bot' ? <IconBot size={13} /> : <IconUser size={13} />}
                            </div>
                            <div className="chat-content">
                                {m.text}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="chat-bubble bot">
                            <div className="chat-avatar">
                                <IconBot size={13} />
                            </div>
                            <div className="chat-content" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <span>Analyzing financial data</span>
                                <span className="spinner-icon" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Prompts */}
                <div className="chat-prompts-row">
                    {SUGGESTED_PROMPTS.map((item, idx) => {
                        const IconComp = item.icon;
                        return (
                            <button
                                key={idx}
                                type="button"
                                className="chat-prompt-pill"
                                onClick={() => sendMsg(item.text)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                                <IconComp size={12} />
                                <span>{item.text}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Input Bar */}
                <form onSubmit={handleFormSubmit} className="chat-input-bar">
                    <input
                        type="text"
                        placeholder="Ask advice on budgets, investments, cutting costs..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !input.trim()}
                        style={{ padding: '10px 16px' }}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChatBot;

const UserModel = require('../Models/User');

const chat = async (req, res) => {
    const { message } = req.body;
    if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message is required", success: false });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({
            message: "OpenRouter API key is not configured on the server",
            success: false
        });
    }

    try {
        const userId = req.user?._id;
        let financialContext = "";

        if (userId) {
            try {
                const user = await UserModel.findById(userId).select('name monthlyBudget expenses');
                if (user) {
                    const expenses = user.expenses || [];
                    const totalIncome = expenses.filter(e => e.amount > 0).reduce((acc, e) => acc + e.amount, 0);
                    const totalExpenses = expenses.filter(e => e.amount < 0).reduce((acc, e) => acc + Math.abs(e.amount), 0);
                    const recentTxs = expenses.slice(-5).map(e => `${e.text} (${e.category || 'Other'}): ₹${e.amount}`).join(', ');

                    financialContext = `User Financial Snapshot:
- Name: ${user.name}
- Monthly Budget: ₹${user.monthlyBudget || 0}
- Total Income Recorded: ₹${totalIncome}
- Total Expenses Recorded: ₹${totalExpenses}
- Net Balance: ₹${totalIncome - totalExpenses}
- Recent Transactions: ${recentTxs || 'None yet'}`;
                }
            } catch (dbErr) {
                console.error("Error fetching financial context for chat:", dbErr);
            }
        }

        const systemPrompt = `You are FinPulse AI, an intelligent, empathetic financial advisor and wealth strategist embedded in the FinPulse Expense Tracker web app.
Your goals:
1. Provide concise, clear, and actionable advice on budgeting, expense reduction, savings, and investments.
2. If financial context is provided below, reference it constructively to give specific answers (using INR / ₹ currency).
3. Keep answers helpful, readable, and under 3-4 paragraphs unless detailed breakdown is requested.

${financialContext ? `--- Current Financial Context ---\n${financialContext}\n----------------------------------` : ''}`;

        const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
                'X-Title': 'FinPulse Expense Tracker'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message.trim() }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenRouter API Error:", data);
            return res.status(response.status).json({
                message: data?.error?.message || "AI request to OpenRouter failed",
                success: false
            });
        }

        const reply = data?.choices?.[0]?.message?.content || "I am currently unable to process your request. Please try again.";
        return res.status(200).json({
            message: "Chat reply generated",
            success: true,
            data: { reply }
        });
    } catch (err) {
        console.error("Chat Controller Exception:", err);
        return res.status(500).json({
            message: "Something went wrong while communicating with AI service",
            error: err.message,
            success: false
        });
    }
};

module.exports = { chat };

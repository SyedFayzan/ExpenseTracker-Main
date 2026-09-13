const mongoose = require('mongoose');
const UserModel = require("../Models/User");

/**
 * Calculates the next due date by adding interval (default 1 month)
 */
const calculateNextDueDate = (currentDate, interval = 'monthly') => {
    const d = new Date(currentDate);
    if (interval === 'monthly') {
        const originalDay = d.getDate();
        d.setMonth(d.getMonth() + 1);
        // Handle end-of-month rollover (e.g. Jan 31 -> Feb 28)
        if (d.getDate() !== originalDay) {
            d.setDate(0);
        }
    }
    return d;
};

/**
 * Checks and automatically generates due recurring transactions into the user's ledger
 */
const processRecurringExpensesHelper = async (userId) => {
    try {
        const user = await UserModel.findById(userId);
        if (!user || !user.recurringExpenses || user.recurringExpenses.length === 0) {
            return user;
        }

        const now = new Date();
        let hasModifications = false;

        for (const recurring of user.recurringExpenses) {
            if (!recurring.isActive) continue;

            let nextDue = new Date(recurring.nextDueDate || recurring.startDate);

            // If nextDueDate has passed or is now, auto-add expense for each elapsed month
            while (nextDue <= now) {
                user.expenses.push({
                    text: recurring.text,
                    amount: recurring.amount,
                    category: recurring.category || 'Other',
                    createdAt: new Date(nextDue),
                    isRecurring: true,
                    recurringInterval: recurring.interval || 'monthly',
                    recurringExpenseId: recurring._id
                });

                recurring.lastProcessedDate = new Date(nextDue);
                nextDue = calculateNextDueDate(nextDue, recurring.interval || 'monthly');
                recurring.nextDueDate = nextDue;
                hasModifications = true;
            }
        }

        if (hasModifications) {
            await user.save();
        }

        return user;
    } catch (err) {
        console.error("Auto Recurring Processor Helper Error:", err);
        return null;
    }
};

const addTransaction = async (req, res) => {
    const { _id } = req.user;
    const { text, amount, category, isRecurring, recurringInterval, createdAt } = req.body;
    try {
        const transactionItem = {
            text,
            amount,
            category: category || 'Other',
            createdAt: createdAt ? new Date(createdAt) : new Date(),
            isRecurring: Boolean(isRecurring),
            recurringInterval: recurringInterval || 'monthly'
        };

        if (isRecurring) {
            const nextDue = calculateNextDueDate(new Date(), recurringInterval || 'monthly');
            const recurringSchedule = {
                text,
                amount,
                category: category || 'Other',
                interval: recurringInterval || 'monthly',
                startDate: new Date(),
                lastProcessedDate: new Date(),
                nextDueDate: nextDue,
                isActive: true,
                createdAt: new Date()
            };

            const user = await UserModel.findById(_id);
            if (!user) {
                return res.status(404).json({ message: "User not found", success: false });
            }

            // Create recurring schedule
            user.recurringExpenses.push(recurringSchedule);
            const createdRecurringRule = user.recurringExpenses[user.recurringExpenses.length - 1];

            // Add the initial transaction record to expenses
            transactionItem.recurringExpenseId = createdRecurringRule._id;
            user.expenses.push(transactionItem);

            await user.save();

            return res.status(200).json({
                message: "Recurring expense recorded and scheduled successfully",
                success: true,
                data: user.expenses || []
            });
        }

        const userData = await UserModel.findByIdAndUpdate(
            _id,
            { $push: { expenses: transactionItem } },
            { new: true } // Returns the updated document
        );
        res.status(200).json({
            message: "Expense added successfully",
            success: true,
            data: userData?.expenses || []
        });
    } catch (err) {
        console.error("Add Transaction Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message || err,
            success: false
        });
    }
};

const getAllTransactions = async (req, res) => {
    const { _id } = req.user;
    try {
        await processRecurringExpensesHelper(_id);
        const userData = await UserModel.findById(_id).select('expenses');
        res.status(200).json({
            message: "Fetched Expenses successfully",
            success: true,
            data: userData?.expenses || []
        });
    } catch (err) {
        console.error("Get All Transactions Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message || err,
            success: false
        });
    }
};

const deleteTransaction = async (req, res) => {
    const { _id } = req.user;
    const expenseId = req.params.expenseId;
    try {
        const userData = await UserModel.findByIdAndUpdate(
            _id,
            { $pull: { expenses: { _id: expenseId } } },
            { new: true }
        );
        res.status(200).json({
            message: "Expense Deleted successfully",
            success: true,
            data: userData?.expenses || []
        });
    } catch (err) {
        console.error("Delete Transaction Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message || err,
            success: false
        });
    }
};

/**
 * MongoDB Aggregation Pipeline for Monthly Budget Analytics
 * Uses $match, $project, $filter, and $reduce directly in MongoDB
 */
const getBudgetStatus = async (req, res) => {
    const { _id } = req.user;
    try {
        await processRecurringExpensesHelper(_id);
        const userObjectId = mongoose.isValidObjectId(_id) ? new mongoose.Types.ObjectId(_id) : _id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const result = await UserModel.aggregate([
            // Stage 1: Match the authenticated user
            { $match: { _id: userObjectId } },

            // Stage 2: Filter expenses array within MongoDB to include only outflow transactions for current calendar month
            {
                $project: {
                    monthlyBudget: { $ifNull: ["$monthlyBudget", 0] },
                    currentMonthExpenses: {
                        $filter: {
                            input: { $ifNull: ["$expenses", []] },
                            as: "expense",
                            cond: {
                                $and: [
                                    { $lt: ["$$expense.amount", 0] },
                                    { $gte: ["$$expense.createdAt", startOfMonth] },
                                    { $lte: ["$$expense.createdAt", endOfMonth] }
                                ]
                            }
                        }
                    }
                }
            },

            // Stage 3: Reduce and compute total spent this month
            {
                $project: {
                    monthlyBudget: 1,
                    spentThisMonth: {
                        $reduce: {
                            input: "$currentMonthExpenses",
                            initialValue: 0,
                            in: { $add: ["$$value", { $abs: "$$this.amount" }] }
                        }
                    }
                }
            },

            // Stage 4: Project final calculated KPIs (with safe denominator protection against divide-by-zero)
            {
                $project: {
                    _id: 0,
                    monthlyBudget: 1,
                    spentThisMonth: 1,
                    remaining: { $subtract: ["$monthlyBudget", "$spentThisMonth"] },
                    percentUsed: {
                        $cond: {
                            if: { $gt: ["$monthlyBudget", 0] },
                            then: {
                                $round: [
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    "$spentThisMonth",
                                                    { $cond: [{ $gt: ["$monthlyBudget", 0] }, "$monthlyBudget", 1] }
                                                ]
                                             },
                                            100
                                        ]
                                    }
                                ]
                            },
                            else: 0
                        }
                    },
                    isOverBudget: {
                        $and: [
                            { $gt: ["$monthlyBudget", 0] },
                            { $gt: ["$spentThisMonth", "$monthlyBudget"] }
                        ]
                    }
                }
            }
        ]);

        const data = result[0] || {
            monthlyBudget: 0,
            spentThisMonth: 0,
            remaining: 0,
            percentUsed: 0,
            isOverBudget: false
        };

        res.status(200).json({
            message: "Fetched budget status successfully",
            success: true,
            data
        });
    } catch (err) {
        console.error("Get Budget Status Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message || err,
            success: false
        });
    }
};

const setBudget = async (req, res) => {
    const { _id } = req.user;
    const { monthlyBudget } = req.body;
    if (typeof monthlyBudget !== 'number' || monthlyBudget < 0) {
        return res.status(400).json({
            message: "monthlyBudget must be a non-negative number",
            success: false
        });
    }
    try {
        await UserModel.findByIdAndUpdate(_id, { monthlyBudget });
        res.status(200).json({
            message: "Budget updated successfully",
            success: true,
            data: { monthlyBudget }
        });
    } catch (err) {
        console.error("Set Budget Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message || err,
            success: false
        });
    }
};

/**
 * MongoDB Aggregation Pipeline for Category Spending Breakdown
 * Uses $match -> $unwind -> $match -> $group -> $sort -> $project
 */
const getCategoryBreakdown = async (req, res) => {
    const { _id } = req.user;
    try {
        await processRecurringExpensesHelper(_id);
        const userObjectId = mongoose.isValidObjectId(_id) ? new mongoose.Types.ObjectId(_id) : _id;

        const breakdown = await UserModel.aggregate([
            // Stage 1: Match authenticated user document
            { $match: { _id: userObjectId } },

            // Stage 2: Deconstruct expenses array into individual documents
            { $unwind: "$expenses" },

            // Stage 3: Match only expenses (outflow amounts < 0)
            { $match: { "expenses.amount": { $lt: 0 } } },

            // Stage 4: Group by category and compute aggregate spending & transaction count
            {
                $group: {
                    _id: { $ifNull: ["$expenses.category", "Other"] },
                    total: { $sum: { $abs: "$expenses.amount" } },
                    count: { $sum: 1 }
                }
            },

            // Stage 5: Sort by highest spending first
            { $sort: { total: -1 } },

            // Stage 6: Project clean field names matching frontend contract
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    total: 1,
                    count: 1
                }
            }
        ]);

        res.status(200).json({
            message: "Fetched category breakdown successfully",
            success: true,
            data: breakdown || []
        });
    } catch (err) {
        console.error("Get Category Breakdown Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message || err,
            success: false
        });
    }
};

/**
 * Recurring Expenses Endpoints
 */
const getRecurringExpenses = async (req, res) => {
    const { _id } = req.user;
    try {
        const user = await processRecurringExpensesHelper(_id);
        const recurringList = user?.recurringExpenses || [];

        // Calculate total monthly recurring commitment (fixed outflow)
        const monthlyCommitment = recurringList
            .filter(r => r.isActive && r.amount < 0)
            .reduce((acc, r) => acc + Math.abs(r.amount), 0);

        res.status(200).json({
            message: "Fetched recurring expenses successfully",
            success: true,
            data: recurringList,
            monthlyCommitment
        });
    } catch (err) {
        console.error("Get Recurring Expenses Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message || err,
            success: false
        });
    }
};

const addRecurringExpense = async (req, res) => {
    const { _id } = req.user;
    const { text, amount, category, interval = 'monthly', addInitial = true } = req.body;
    try {
        const user = await UserModel.findById(_id);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const nextDue = calculateNextDueDate(new Date(), interval);
        const recurringRule = {
            text,
            amount,
            category: category || 'Other',
            interval,
            startDate: new Date(),
            lastProcessedDate: new Date(),
            nextDueDate: nextDue,
            isActive: true,
            createdAt: new Date()
        };

        user.recurringExpenses.push(recurringRule);
        const createdRule = user.recurringExpenses[user.recurringExpenses.length - 1];

        if (addInitial) {
            user.expenses.push({
                text,
                amount,
                category: category || 'Other',
                createdAt: new Date(),
                isRecurring: true,
                recurringInterval: interval,
                recurringExpenseId: createdRule._id
            });
        }

        await user.save();

        res.status(200).json({
            message: "Recurring expense schedule created successfully",
            success: true,
            data: user.recurringExpenses,
            expenses: user.expenses
        });
    } catch (err) {
        console.error("Add Recurring Expense Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message || err,
            success: false
        });
    }
};

const toggleRecurringExpense = async (req, res) => {
    const { _id } = req.user;
    const { recurringId } = req.params;
    const { isActive, text, amount, category } = req.body;
    try {
        const user = await UserModel.findById(_id);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const item = user.recurringExpenses.id(recurringId);
        if (!item) {
            return res.status(404).json({ message: "Recurring expense not found", success: false });
        }

        if (typeof isActive === 'boolean') item.isActive = isActive;
        if (text) item.text = text;
        if (typeof amount === 'number') item.amount = amount;
        if (category) item.category = category;

        await user.save();

        res.status(200).json({
            message: `Recurring expense ${item.isActive ? 'activated' : 'paused'} successfully`,
            success: true,
            data: user.recurringExpenses
        });
    } catch (err) {
        console.error("Toggle Recurring Expense Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message || err,
            success: false
        });
    }
};

const deleteRecurringExpense = async (req, res) => {
    const { _id } = req.user;
    const { recurringId } = req.params;
    try {
        const user = await UserModel.findByIdAndUpdate(
            _id,
            { $pull: { recurringExpenses: { _id: recurringId } } },
            { new: true }
        );
        res.status(200).json({
            message: "Recurring expense schedule removed successfully",
            success: true,
            data: user?.recurringExpenses || []
        });
    } catch (err) {
        console.error("Delete Recurring Expense Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message || err,
            success: false
        });
    }
};

const processRecurringExpensesManually = async (req, res) => {
    const { _id } = req.user;
    try {
        const user = await processRecurringExpensesHelper(_id);
        res.status(200).json({
            message: "Recurring expenses processed and synced successfully",
            success: true,
            data: user?.expenses || [],
            recurringList: user?.recurringExpenses || []
        });
    } catch (err) {
        console.error("Process Recurring Expenses Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message || err,
            success: false
        });
    }
};

/**
 * MongoDB Aggregation Pipeline for Daily Expense Activity Heatmap
 * Uses $match -> $unwind -> $match -> $group -> $project -> $sort
 */
const getExpenseHeatmap = async (req, res) => {
    const { _id } = req.user;
    const requestedYear = parseInt(req.query.year, 10) || new Date().getFullYear();
    try {
        await processRecurringExpensesHelper(_id);
        const userObjectId = mongoose.isValidObjectId(_id) ? new mongoose.Types.ObjectId(_id) : _id;

        const heatmapData = await UserModel.aggregate([
            // Stage 1: Match the authenticated user
            { $match: { _id: userObjectId } },

            // Stage 2: Unwind the expenses array into individual transaction documents
            { $unwind: "$expenses" },

            // Stage 3: Match only outflow expenses
            {
                $match: {
                    "expenses.amount": { $lt: 0 }
                }
            },

            // Stage 4: Group by day formatted as YYYY-MM-DD using safe date conversion
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: { $ifNull: ["$expenses.createdAt", new Date()] }
                        }
                    },
                    totalSpent: { $sum: { $abs: "$expenses.amount" } },
                    count: { $sum: 1 },
                    transactions: {
                        $push: {
                            _id: "$expenses._id",
                            text: "$expenses.text",
                            amount: "$expenses.amount",
                            category: "$expenses.category",
                            createdAt: { $ifNull: ["$expenses.createdAt", new Date()] },
                            isRecurring: { $ifNull: ["$expenses.isRecurring", false] }
                        }
                    }
                }
            },

            // Stage 5: Filter for dates in requested year
            {
                $match: {
                    _id: { $regex: `^${requestedYear}` }
                }
            },

            // Stage 6: Project clean output fields
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    totalSpent: 1,
                    count: 1,
                    transactions: 1
                }
            },

            // Stage 7: Sort chronologically
            { $sort: { date: 1 } }
        ]);

        // Compute high-level summary KPIs for the year
        const totalYearSpent = heatmapData.reduce((acc, curr) => acc + curr.totalSpent, 0);
        const totalTransactions = heatmapData.reduce((acc, curr) => acc + curr.count, 0);
        const activeDaysCount = heatmapData.length;
        const maxDaySpend = heatmapData.length > 0 ? Math.max(...heatmapData.map(d => d.totalSpent)) : 0;

        res.status(200).json({
            message: "Fetched expense heatmap successfully",
            success: true,
            year: requestedYear,
            totalYearSpent,
            totalTransactions,
            activeDaysCount,
            maxDaySpend,
            data: heatmapData || []
        });
    } catch (err) {
        console.error("Get Expense Heatmap Error:", err);
        return res.status(500).json({
            message: "Something went wrong",
            error: err.message || err,
            success: false
        });
    }
};

module.exports = {
    addTransaction,
    getAllTransactions,
    deleteTransaction,
    getBudgetStatus,
    setBudget,
    getCategoryBreakdown,
    getRecurringExpenses,
    addRecurringExpense,
    toggleRecurringExpense,
    deleteRecurringExpense,
    processRecurringExpensesManually,
    getExpenseHeatmap
};
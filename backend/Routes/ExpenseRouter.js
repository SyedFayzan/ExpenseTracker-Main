const express = require('express');
const {
    getAllTransactions,
    addTransaction,
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
} = require('../Controllers/ExpenseController');
const router = express.Router();

router.get('/', getAllTransactions);
router.post('/', addTransaction);
router.get('/budget', getBudgetStatus);
router.put('/budget', setBudget);
router.get('/categories', getCategoryBreakdown);
router.get('/recurring', getRecurringExpenses);
router.post('/recurring', addRecurringExpense);
router.post('/recurring/process', processRecurringExpensesManually);
router.put('/recurring/:recurringId', toggleRecurringExpense);
router.delete('/recurring/:recurringId', deleteRecurringExpense);
router.get('/heatmap', getExpenseHeatmap);
router.delete('/:expenseId', deleteTransaction);

module.exports = router;
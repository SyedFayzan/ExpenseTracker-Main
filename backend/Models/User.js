const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    monthlyBudget: {
        type: Number,
        default: 0
    },
    expenses: [
        {
            text: {
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            category: {
                type: String,
                default: 'Other'
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            isRecurring: {
                type: Boolean,
                default: false
            },
            recurringInterval: {
                type: String,
                default: 'monthly'
            },
            recurringExpenseId: {
                type: Schema.Types.ObjectId,
                default: null
            }
        }
    ],
    recurringExpenses: [
        {
            text: {
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            category: {
                type: String,
                default: 'Other'
            },
            interval: {
                type: String,
                default: 'monthly'
            },
            startDate: {
                type: Date,
                default: Date.now
            },
            lastProcessedDate: {
                type: Date,
                default: Date.now
            },
            nextDueDate: {
                type: Date,
                required: true
            },
            isActive: {
                type: Boolean,
                default: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
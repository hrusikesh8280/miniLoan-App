// models/Loan.js
const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  term: {
    type: Number,
    required: true,
  },
  repayments: [
    {
      date: Date,
      amount: Number,
      status: {
        type: String,
        enum: ['PENDING', 'PAID'],
        default: 'PENDING',
      },
    },
  ],
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'PAID'],
    default: 'PENDING',
  },
});

module.exports = mongoose.model('Loan', loanSchema);

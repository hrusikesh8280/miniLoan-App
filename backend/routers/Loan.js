const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');

// Route to create a new loan
router.post('/create', async (req, res) => {
  try {
    const { amount, term } = req.body;

    const weeklyRepayment = amount / term;
    
    const repayments = [];
    const startDate = new Date();
    for (let i = 0; i < term; i++) {
        const dueDate = new Date(startDate);
        dueDate.setDate(startDate.getDate() + i * 7); 
        repayments.push({
          date: dueDate,
          amount: weeklyRepayment,
          status: 'PENDING',
        });
    }

    const loan = new Loan({
      amount,
      term,
      repayments,
    });

    await loan.save();

    res.status(201).json({ message: 'Loan created successfully', loan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to view all loans
router.get('/all', async (req, res) => {
  try {
    const loans = await Loan.find();
    res.status(200).json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to view a specific loan by ID
router.get('/:id', async (req, res) => {
  try {
    const loanId = req.params.id;
    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    res.status(200).json(loan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to approve a loan (for admin)
router.patch('/approve/:loanId', async (req, res) => {
  try {
    const loanId = req.params.loanId;
    const loan = await Loan.findByIdAndUpdate(
      loanId,
      { status: 'APPROVED' },
      { new: true }
    );

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    res.status(200).json({ message: 'Loan approved successfully', loan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to add a repayment
router.post('/repay/:loanId', async (req, res) => {
    try {
      const loanId = req.params.loanId;
      const { amount } = req.body;

      const loan = await Loan.findById(loanId);

      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      const nextRepayment = loan.repayments.find((repayment) => repayment.status === 'PENDING');

      if (!nextRepayment) {
        return res.status(400).json({ error: 'All repayments are already paid' });
      }
      
      if (amount >= nextRepayment.amount) {
        nextRepayment.status = 'PAID';

        const allRepaymentsPaid = loan.repayments.every((repayment) => repayment.status === 'PAID');
        if (allRepaymentsPaid) {
          loan.status = 'PAID';
        }
        await loan.save();

        res.status(200).json({ message: 'Repayment added and updated successfully', loan });
      } else {
        res.status(400).json({ error: 'Repayment amount is less than the scheduled amount' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;

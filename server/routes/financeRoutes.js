const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

router.use(protect);

// Overview & Stats
router.get('/stats', requirePermission('canViewFinanceDashboard'), financeController.getFinanceStats);

// Expenses
router.post('/expenses', requirePermission('canManageExpenses'), financeController.createExpense);
router.get('/expenses', requirePermission('canViewFinanceDashboard'), financeController.getExpenses);
router.put('/expenses/:id/status', requirePermission('canManageExpenses'), financeController.updateExpenseStatus);

// Payroll
router.post('/payroll/generate', requirePermission('canGeneratePayroll'), financeController.generateMonthlyPayroll);
router.get('/payroll', requirePermission('canViewPayroll'), financeController.getPayroll);
router.put('/payroll/:id/status', requirePermission('canDisbursePayroll'), financeController.updatePayrollStatus);

// Invoices
router.post('/invoices', requirePermission('canManageInvoices'), financeController.createInvoice);
router.get('/invoices', requirePermission('canViewFinanceDashboard'), financeController.getInvoices);
router.put('/invoices/:id/status', requirePermission('canManageInvoices'), financeController.updateInvoiceStatus);
router.get('/projects/:projectId/bill-preview', requirePermission('canManageInvoices'), financeController.getProjectTimesheetBill);

// Finance Management (Superadmin mostly)
router.get('/management/projects', requirePermission('canConfigureRates'), financeController.getProjectsForFinance);
router.put('/management/projects/:projectId', requirePermission('canConfigureRates'), financeController.updateProjectBilling);
router.get('/management/users', requirePermission('canConfigureCompensation'), financeController.getUsersForFinance);
router.put('/management/users/:userId/compensation', requirePermission('canConfigureCompensation'), financeController.updateUserCompensation);

module.exports = router;

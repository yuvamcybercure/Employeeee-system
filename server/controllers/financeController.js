const Expense = require('../models/Expense');
const Payroll = require('../models/Payroll');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const taxUtils = require('../utils/taxUtils');

// Expenses
exports.createExpense = async (req, res) => {
    try {
        const { title, category, amount, taxRate, date, description, status, paymentMethod } = req.body;
        const { subtotal, taxAmount, total } = taxUtils.calculateGST(amount, taxRate || 0);

        const expense = await Expense.create({
            organizationId: req.user.organizationId,
            title,
            category,
            amount: subtotal,
            taxAmount,
            totalAmount: total,
            date,
            description,
            status,
            paymentMethod,
            processedBy: req.user._id
        });

        res.status(201).json({ success: true, expense });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ organizationId: req.user.organizationId })
            .populate('processedBy', 'name')
            .sort({ date: -1 });
        res.json({ success: true, expenses });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Payroll
exports.generateMonthlyPayroll = async (req, res) => {
    try {
        const { month, year } = req.body;
        const users = await User.find({ organizationId: req.user.organizationId, isActive: true });
        const payrolls = [];

        // Date range for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        for (const user of users) {
            const structure = user.salaryStructure || {};
            let gross = structure.baseSalary || 0;

            if (structure.compensationType === 'hourly') {
                const Timesheet = require('../models/Timesheet');
                const logs = await Timesheet.find({
                    userId: user._id,
                    date: { $gte: startDate.toISOString().split('T')[0], $lte: endDate.toISOString().split('T')[0] },
                    status: 'completed'
                });

                const totalHours = logs.reduce((acc, log) => acc + (log.totalMilliseconds / (1000 * 60 * 60)), 0);
                gross = totalHours * (structure.hourlyRate || 0);
            }

            const pf = structure.pf || 0;
            const esi = structure.esi || 0;
            const pt = structure.professionalTax || 0;
            const tds = (gross * (structure.tdsPercentage || 0)) / 100;

            const netPay = taxUtils.calculateNetPay(gross, { pf, esi, professionalTax: pt, tds });

            const pr = await Payroll.findOneAndUpdate(
                { userId: user._id, month, year },
                {
                    organizationId: req.user.organizationId,
                    baseSalary: structure.baseSalary || 0,
                    grossSalary: gross,
                    deductions: { pf, esi, professionalTax: pt, tds },
                    netPayable: netPay,
                    status: 'draft'
                },
                { upsert: true, new: true }
            );
            payrolls.push(pr);
        }

        res.json({ success: true, count: payrolls.length, payrolls });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getPayroll = async (req, res) => {
    try {
        const { month, year } = req.query;
        const filter = { organizationId: req.user.organizationId };
        if (month) filter.month = month;
        if (year) filter.year = year;

        const payrolls = await Payroll.find(filter).populate('userId', 'name employeeId department bankDetails');
        res.json({ success: true, payrolls });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Invoices
exports.createInvoice = async (req, res) => {
    try {
        const { projectId, client, items, taxRate, dueDate, notes, terms } = req.body;

        let subtotal = 0;
        const processedItems = items.map(item => {
            const amt = item.quantity * item.rate;
            subtotal += amt;
            return { ...item, amount: amt };
        });

        const { taxAmount, total } = taxUtils.calculateGST(subtotal, taxRate || 18);
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

        const invoice = await Invoice.create({
            organizationId: req.user.organizationId,
            projectId,
            invoiceNumber,
            client,
            items: processedItems,
            subtotal,
            taxRate: taxRate || 18,
            taxAmount,
            grandTotal: total,
            balanceDue: total,
            dueDate,
            notes,
            terms
        });

        res.status(201).json({ success: true, invoice });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ organizationId: req.user.organizationId }).populate('projectId', 'name');
        res.json({ success: true, invoices });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProjectTimesheetBill = async (req, res) => {
    try {
        const { projectId } = req.params;
        const Project = require('../models/Project');
        const Timesheet = require('../models/Timesheet');

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const logs = await Timesheet.find({
            projectId,
            status: 'completed',
            billable: true
        }).populate('userId', 'name');

        // Group by task or just summarize
        const totalHours = logs.reduce((acc, log) => acc + (log.totalMilliseconds / (1000 * 60 * 60)), 0);
        const amount = totalHours * (project.billingRate || 0);

        res.json({
            success: true,
            data: {
                projectName: project.name,
                totalHours,
                billingRate: project.billingRate,
                suggestedTotal: amount,
                items: logs.map(l => ({
                    description: `${l.task} - ${l.userId.name}`,
                    quantity: (l.totalMilliseconds / (1000 * 60 * 60)).toFixed(2),
                    rate: project.billingRate,
                    amount: ((l.totalMilliseconds / (1000 * 60 * 60)) * (project.billingRate || 0)).toFixed(2)
                }))
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProjectsForFinance = async (req, res) => {
    try {
        const Project = require('../models/Project');
        const projects = await Project.find({ organizationId: req.user.organizationId })
            .select('name client billingType billingRate status');
        res.json({ success: true, projects });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProjectBilling = async (req, res) => {
    try {
        const Project = require('../models/Project');
        const { projectId } = req.params;
        const { billingType, billingRate } = req.body;
        const project = await Project.findByIdAndUpdate(projectId, { billingType, billingRate }, { new: true });
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUsersForFinance = async (req, res) => {
    try {
        const users = await User.find({ organizationId: req.user.organizationId, isActive: true })
            .select('name employeeId salaryStructure department designation');
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUserCompensation = async (req, res) => {
    try {
        const { userId } = req.params;
        const { salaryStructure } = req.body;
        const user = await User.findByIdAndUpdate(userId, { salaryStructure }, { new: true });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Stats for Graphs
exports.getFinanceStats = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        // Monthly breakdown
        const expensesMonthly = await Expense.aggregate([
            { $match: { organizationId, status: 'paid' } },
            { $group: { _id: { month: { $month: "$date" } }, total: { $sum: "$totalAmount" } } }
        ]);

        const revenueMonthly = await Invoice.aggregate([
            { $match: { organizationId, status: 'paid' } },
            { $group: { _id: { month: { $month: "$createdAt" } }, total: { $sum: "$grandTotal" } } }
        ]);

        // Summary Statistics
        const totalRevenue = await Invoice.aggregate([
            { $match: { organizationId, status: 'paid' } },
            { $group: { _id: null, total: { $sum: "$grandTotal" }, tax: { $sum: "$taxAmount" } } }
        ]);

        const totalExpenses = await Expense.aggregate([
            { $match: { organizationId, status: 'paid' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, tax: { $sum: "$taxAmount" } } }
        ]);

        const totalPayroll = await Payroll.aggregate([
            { $match: { organizationId, status: 'paid' } },
            { $group: { _id: null, total: { $sum: "$netPayable" }, tax: { $sum: "$deductions.tds" } } }
        ]);

        const summary = {
            grossRevenue: totalRevenue[0]?.total || 0,
            totalTax: (totalRevenue[0]?.tax || 0) + (totalExpenses[0]?.tax || 0) + (totalPayroll[0]?.tax || 0),
            netProfit: (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0) - (totalPayroll[0]?.total || 0),
            taxBreakdown: {
                gst: (totalRevenue[0]?.tax || 0) + (totalExpenses[0]?.tax || 0),
                tds: totalPayroll[0]?.tax || 0,
                other: 0
            }
        };

        res.json({ success: true, stats: { expenses: expensesMonthly, revenue: revenueMonthly, summary } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateExpenseStatus = async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.user.organizationId },
            { status: req.body.status },
            { new: true }
        );
        res.json({ success: true, expense });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateInvoiceStatus = async (req, res) => {
    try {
        const invoice = await Invoice.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.user.organizationId },
            { status: req.body.status },
            { new: true }
        );
        res.json({ success: true, invoice });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatePayrollStatus = async (req, res) => {
    try {
        const payroll = await Payroll.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.user.organizationId },
            { status: req.body.status },
            { new: true }
        );
        res.json({ success: true, payroll });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

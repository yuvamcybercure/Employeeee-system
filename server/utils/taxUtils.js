/**
 * Utility for Indian Taxation (GST, TDS, etc.)
 */

// GST calculation (Default 18%)
exports.calculateGST = (amount, rate = 18) => {
    const tax = (amount * rate) / 100;
    return {
        subtotal: parseFloat(amount.toFixed(2)),
        taxRate: rate,
        taxAmount: parseFloat(tax.toFixed(2)),
        total: parseFloat((amount + tax).toFixed(2))
    };
};

// TDS calculation
exports.calculateTDS = (amount, percentage = 10) => {
    const tds = (amount * percentage) / 100;
    return parseFloat(tds.toFixed(2));
};

// Yearly Income Tax Slabs (Simplified 2024-25 Regime)
exports.calculateIncomeTax = (annualGross) => {
    let tax = 0;
    const income = annualGross;

    if (income <= 300000) tax = 0;
    else if (income <= 600000) tax = (income - 300000) * 0.05;
    else if (income <= 900000) tax = 15000 + (income - 600000) * 0.10;
    else if (income <= 1200000) tax = 45000 + (income - 900000) * 0.15;
    else if (income <= 1500000) tax = 90000 + (income - 1200000) * 0.20;
    else tax = 150000 + (income - 1500000) * 0.30;

    // Add 4% Cess
    tax += tax * 0.04;
    return parseFloat(tax.toFixed(2));
};

// Employee Net Pay calculation
exports.calculateNetPay = (gross, deductions = {}) => {
    const { pf = 0, esi = 0, professionalTax = 0, tds = 0, other = 0 } = deductions;
    const totalDeductions = pf + esi + professionalTax + tds + other;
    return parseFloat((gross - totalDeductions).toFixed(2));
};

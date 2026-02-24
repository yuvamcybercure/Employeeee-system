const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// GET /api/reports/attendance-pdf
exports.generateAttendancePDF = async (req, res) => {
    try {
        const { month, year } = req.query;
        const pad = String(month).padStart(2, '0');
        const records = await Attendance.find({
            organizationId: req.user.organizationId._id,
            date: { $gte: `${year}-${pad}-01`, $lte: `${year}-${pad}-31` }
        }).populate('userId', 'name employeeId department');

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Attendance_${month}_${year}.pdf`);
        doc.pipe(res);

        doc.fontSize(20).text(`Attendance Report - ${month}/${year}`, { align: 'center' });
        doc.moveDown();

        records.forEach(rec => {
            doc.fontSize(12).text(`${rec.date} | ${rec.userId.name} (${rec.userId.employeeId}) | In: ${rec.clockIn.time.toLocaleTimeString()} | Out: ${rec.clockOut?.time?.toLocaleTimeString() || 'N/A'} | Status: ${rec.status}`);
        });

        doc.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/reports/attendance-excel
exports.generateAttendanceExcel = async (req, res) => {
    try {
        const { month, year } = req.query;
        const pad = String(month).padStart(2, '0');
        const records = await Attendance.find({
            organizationId: req.user.organizationId._id,
            date: { $gte: `${year}-${pad}-01`, $lte: `${year}-${pad}-31` }
        }).populate('userId', 'name employeeId department');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Attendance');
        sheet.columns = [
            { header: 'Date', key: 'date', width: 12 },
            { header: 'Employee', key: 'name', width: 20 },
            { header: 'ID', key: 'employeeId', width: 10 },
            { header: 'Clock In', key: 'clockIn', width: 20 },
            { header: 'Clock Out', key: 'clockOut', width: 20 },
            { header: 'Status', key: 'status', width: 10 },
        ];

        records.forEach(rec => {
            sheet.addRow({
                date: rec.date,
                name: rec.userId.name,
                employeeId: rec.userId.employeeId,
                clockIn: rec.clockIn.time,
                clockOut: rec.clockOut?.time || 'N/A',
                status: rec.status
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Attendance_${month}_${year}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

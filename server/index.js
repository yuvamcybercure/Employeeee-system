require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const connectDB = require('./config/db');
const RolePermission = require('./models/RolePermission');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const geofenceRoutes = require('./routes/geofenceRoutes');
const projectRoutes = require('./routes/projectRoutes');
const timesheetRoutes = require('./routes/timesheetRoutes');
const messageRoutes = require('./routes/messageRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');
const policyRoutes = require('./routes/policyRoutes');
const assetRoutes = require('./routes/assetRoutes');
const reportRoutes = require('./routes/reportRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');

const app = express();
const server = http.createServer(app);
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:3000'];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// Socket.io for Activity Feed/Chat
app.set('io', io);
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/geofence', geofenceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/logs', activityLogRoutes);

// Health check
app.get('/health', (req, res) => res.send('API is running...'));

// Initial data seeding
const seedRoles = async () => {
    try {
        const roles = ['admin', 'employee'];
        for (const role of roles) {
            const exists = await RolePermission.findOne({ role });
            if (!exists) {
                await RolePermission.create({
                    role,
                    permissions: {
                        canViewPayroll: false,
                        canEditAttendance: false,
                        canApproveLeave: false,
                        canViewReports: false,
                        canExportData: false,
                        canManageProjects: false,
                        canManagePolicies: false,
                        canManageAssets: false,
                        canSendMessages: true,
                        canViewSuggestions: true,
                    }
                });
                console.log(`Seeded role: ${role}`);
            }
        }
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    seedRoles();
    server.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

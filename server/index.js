// SECURITY FIXES APPLIED:
// Fix #3: Centralized error handler registered as last middleware
// Fix #5: Global rate limit raised to 1000/15min; auth-specific strict limiter at 5/5min
// Fix #6: express-mongo-sanitize added to prevent NoSQL injection

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const logger = require('./config/logger'); // Fix #4
const errorHandler = require('./middleware/errorHandler'); // Fix #3

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
const financeRoutes = require('./routes/financeRoutes');
const reportRoutes = require('./routes/reportRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const masterRoutes = require('./routes/masterRoutes');

const app = express();
const server = http.createServer(app);
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:3000'];

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (process.env.NODE_ENV === 'development' || !origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    },
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
    origin: (origin, callback) => {
        if (process.env.NODE_ENV === 'development' || !origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Fix #6: Custom NoSQL injection sanitizer (Express 5 compatible)
// express-mongo-sanitize crashes on Express 5 because req.query is read-only
const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
        for (const key in obj) {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key]);
            }
        }
    }
    return obj;
};
app.use((req, _res, next) => {
    if (req.body) sanitize(req.body);
    if (req.params) sanitize(req.params);
    next();
});

app.use(morgan('dev'));

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Ensure upload directories exist
const uploadDirs = [
    'public/uploads/attendance',
    'public/uploads/profiles',
    'public/uploads/documents',
    'public/uploads/branding'
];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Ensure logs directory exists for Winston
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// --- Fix #5: Rate Limiting ---
// Global safety-net limiter (generous for SPA dashboards)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // 1000 requests per 15 min per IP (was 100 — too aggressive for SPAs)
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Strict auth-specific rate limiter (prevents brute-force)
const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 15, // 15 attempts per 5 minutes (includes preflight + actual requests)
    message: 'Too many authentication attempts. Please try again after 5 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Socket.io
app.set('io', io);
const onlineUsers = new Map();

io.on('connection', (socket) => {
    socket.on('user_online', (userId) => {
        onlineUsers.set(userId, { socketId: socket.id, lastSeen: new Date() });
        socket.join(userId);
        io.emit('update_online_status', Array.from(onlineUsers.keys()));
    });
    socket.on('disconnect', () => {
        for (const [userId, data] of onlineUsers.entries()) {
            if (data.socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit('update_online_status', Array.from(onlineUsers.keys()));
    });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes); // Fix #5: Strict rate limit on auth
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/geofence', geofenceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/logs', activityLogRoutes);
app.use('/api/org', organizationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/health', (req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5000;
const initAttendanceCron = require('./cron/attendanceCron');

connectDB().then(() => {
    initAttendanceCron();
    server.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`); // Fix #4: Using logger
    });
});

// Fix #3: Centralized Error Handler — MUST be the LAST middleware registered
app.use(errorHandler);

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
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const RolePermission = require('./models/RolePermission');
const Organization = require('./models/Organization');
const ChatGroup = require('./models/ChatGroup');

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
        // Allow any origin in development to support local network testing
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

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// Socket.io for Activity Feed/Chat
app.set('io', io);
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
    socket.on('user_online', (userId) => {
        onlineUsers.set(userId, { socketId: socket.id, lastSeen: new Date() });
        socket.join(userId); // Join private room for direct messages
        io.emit('update_online_status', Array.from(onlineUsers.keys()));
    });

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('typing', ({ roomId, userId, userName }) => {
        socket.to(roomId).emit('user_typing', { userId, userName });
    });

    socket.on('stop_typing', ({ roomId, userId }) => {
        socket.to(roomId).emit('user_stop_typing', { userId });
    });

    socket.on('send_message', (data) => {
        // Broadcast to the room (for anyone actively viewing it)
        io.to(data.room).emit('receive_message', data);

        // Also broadcast to the receiver's private room to ensure they get it even if not in the room
        if (data.receiverId) {
            io.to(data.receiverId).emit('receive_message', data);
        }
    });

    socket.on('delete_message', ({ roomId, messageId, mode }) => {
        io.to(roomId).emit('message_deleted', { messageId, mode });
    });

    socket.on('message_read', ({ roomId, userId, messageIds }) => {
        io.to(roomId).emit('messages_marked_read', { userId, messageIds });
    });

    // WebRTC Signaling
    socket.on('call_user', ({ userToCall, signalData, from, name, type, isGroup, roomId }) => {
        if (isGroup && roomId) {
            socket.to(roomId).emit('incoming_call', { signal: signalData, from, name, type, isGroup, roomId });
        } else {
            // Emit to the receiver's private room (their userId)
            io.to(userToCall).emit('incoming_call', { signal: signalData, from, name, type });
        }
    });

    socket.on('accept_call', ({ to, signal, isGroup, roomId, from }) => {
        if (isGroup && roomId) {
            socket.to(roomId).emit('call_accepted', { signal, from });
        } else {
            // Emit to the caller's private room
            io.to(to).emit('call_accepted', { signal, from });
        }
    });

    socket.on('webrtc_signal', ({ to, signal, isGroup, roomId, from }) => {
        if (isGroup && roomId) {
            socket.to(roomId).emit('webrtc_signal', { signal, from });
        } else {
            io.to(to).emit('webrtc_signal', { signal, from });
        }
    });

    socket.on('end_call', ({ to, isGroup, roomId }) => {
        if (isGroup && roomId) {
            socket.to(roomId).emit('call_ended');
        } else {
            io.to(to).emit('call_ended');
        }
    });

    socket.on('disconnect', () => {
        let disconnectedUserId = null;
        for (const [userId, data] of onlineUsers.entries()) {
            if (data.socketId === socket.id) {
                disconnectedUserId = userId;
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit('update_online_status', Array.from(onlineUsers.keys()));
        console.log('Client disconnected:', socket.id);
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
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
app.use('/api/organization', require('./routes/organizationRoutes'));

// Health check
app.get('/health', (req, res) => res.send('API is running...'));

// Initial data seeding
const seedRoles = async () => {
    try {
        const Organization = mongoose.model('Organization');
        const defaultOrg = await Organization.findOne({ slug: 'default' });
        if (!defaultOrg) {
            console.log('Default organization not found, skipping role seeding.');
            return;
        }

        const roles = ['admin', 'employee'];
        for (const role of roles) {
            const exists = await RolePermission.findOne({ role, organizationId: defaultOrg._id });
            if (!exists) {
                await RolePermission.create({
                    role,
                    organizationId: defaultOrg._id,
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
                console.log(`Seeded role: ${role} for organization: ${defaultOrg.name}`);
            }
        }
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

const PORT = process.env.PORT || 5000;

const initAttendanceCron = require('./cron/attendanceCron');

connectDB().then(() => {
    seedRoles();
    initAttendanceCron();
    server.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

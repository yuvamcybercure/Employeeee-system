const Project = require('../models/Project');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const { logActivity } = require('../middleware/logger');

// GET /api/projects
exports.getProjects = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const projects = await Project.find({ organizationId: orgId })
            .populate('managerId', 'name profilePhoto')
            .populate('teamMembers', 'name profilePhoto')
            .sort({ createdAt: -1 });
        res.json({ success: true, projects });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/projects/:id
exports.getProjectById = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const project = await Project.findOne({ _id: req.params.id, organizationId: orgId })
            .populate('managerId', 'name profilePhoto email')
            .populate('teamMembers', 'name profilePhoto email department designation')
            .populate('tasks.assignedTo', 'name profilePhoto')
            .populate('tasks.createdBy', 'name')
            .populate('tasks.comments.userId', 'name profilePhoto');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/projects
exports.createProject = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.status(400).json({ message: 'Must be in an organization context to create project' });
        }
        const project = await Project.create({
            ...req.body,
            organizationId: orgId,
            managerId: req.body.managerId || req.user._id
        });

        // --- Push Notification (Team Members) ---
        if (project.teamMembers?.length > 0) {
            const members = await User.find({ _id: { $in: project.teamMembers } });
            const tokens = members.map(m => m.expoPushToken).filter(t => !!t);
            if (tokens.length > 0) {
                notificationService.sendPushNotification(tokens, {
                    title: 'New Project Assigned',
                    body: `You have been added to the project: ${project.name}`,
                    data: { projectId: project._id, type: 'project' }
                });
            }
        }

        await logActivity(req.user._id, 'CREATE_PROJECT', 'projects', { name: project.name }, req, project._id, 'Project');
        res.status(201).json({ success: true, project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/projects/:id
exports.updateProject = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, organizationId: orgId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!project) return res.status(404).json({ message: 'Project not found' });
        await logActivity(req.user._id, 'UPDATE_PROJECT', 'projects', { projectId: req.params.id }, req, project._id, 'Project');
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        await logActivity(req.user._id, 'DELETE_PROJECT', 'projects', { projectId: req.params.id }, req);
        res.json({ success: true, message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/projects/:id/tasks
exports.addTask = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, organizationId: orgId },
            { $push: { tasks: { ...req.body, createdBy: req.user._id } } },
            { new: true },
        ).populate('tasks.assignedTo tasks.createdBy');

        // --- Push Notification (Assigned User) ---
        const task = project.tasks[project.tasks.length - 1];
        if (task && task.assignedTo) {
            const assignedUser = await User.findById(task.assignedTo);
            if (assignedUser?.expoPushToken) {
                notificationService.sendPushNotification(assignedUser.expoPushToken, {
                    title: 'New Task Assigned',
                    body: `Task "${task.title}" assigned to you in ${project.name}`,
                    data: { projectId: project._id, type: 'task' }
                });
            }
        }

        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/projects/:id/tasks/:taskId
exports.updateTask = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const updateFields = {};
        Object.keys(req.body).forEach(k => { updateFields[`tasks.$.${k}`] = req.body[k]; });
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, organizationId: orgId, 'tasks._id': req.params.taskId },
            { $set: updateFields },
            { new: true },
        );
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/projects/:id/tasks/:taskId/comments
exports.addComment = async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
            {
                _id: req.params.id,
                organizationId: req.user.organizationId?._id || req.user.organizationId,
                'tasks._id': req.params.taskId
            },
            {
                $push: {
                    'tasks.$.comments': {
                        userId: req.user._id,
                        text: req.body.text
                    }
                }
            },
            { new: true }
        ).populate('tasks.comments.userId', 'name profilePhoto email');

        if (!project) return res.status(404).json({ message: 'Project or Task not found' });
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

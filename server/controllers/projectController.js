const Project = require('../models/Project');
const { logActivity } = require('../middleware/logger');

// GET /api/projects
exports.getProjects = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'employee') {
            filter = { $or: [{ managerId: req.user._id }, { teamMembers: req.user._id }] };
        }
        const projects = await Project.find(filter)
            .populate('managerId', 'name profilePhoto')
            .populate('teamMembers', 'name profilePhoto department')
            .sort({ updatedAt: -1 });
        res.json({ success: true, projects });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/projects/:id
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('managerId', 'name profilePhoto')
            .populate('teamMembers', 'name profilePhoto department')
            .populate('tasks.assignedTo', 'name profilePhoto');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/projects
exports.createProject = async (req, res) => {
    try {
        const project = await Project.create({ ...req.body, managerId: req.body.managerId || req.user._id });
        await logActivity(req.user._id, 'CREATE_PROJECT', 'projects', { name: project.name }, req, project._id, 'Project');
        res.status(201).json({ success: true, project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/projects/:id
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $push: { tasks: req.body } },
            { new: true },
        );
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/projects/:id/tasks/:taskId
exports.updateTask = async (req, res) => {
    try {
        const updateFields = {};
        Object.keys(req.body).forEach(k => { updateFields[`tasks.$.${k}`] = req.body[k]; });
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, 'tasks._id': req.params.taskId },
            { $set: updateFields },
            { new: true },
        );
        res.json({ success: true, project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

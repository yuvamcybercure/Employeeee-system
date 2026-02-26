const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', requirePermission('canManageProjects'), projectController.createProject);
router.patch('/:id', requirePermission('canManageProjects'), projectController.updateProject);
router.delete('/:id', requirePermission('canManageProjects'), projectController.deleteProject);

// Task management
router.post('/:id/tasks', projectController.addTask);
router.patch('/:id/tasks/:taskId', projectController.updateTask);
router.post('/:id/tasks/:taskId/comments', projectController.addComment);

module.exports = router;

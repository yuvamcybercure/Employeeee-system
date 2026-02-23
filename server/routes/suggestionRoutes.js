const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', suggestionController.getSuggestions);
router.post('/', suggestionController.createSuggestion);
router.patch('/:id/upvote', suggestionController.upvoteSuggestion);
router.patch('/:id/respond', requirePermission('canViewSuggestions'), suggestionController.respondToSuggestion);

module.exports = router;

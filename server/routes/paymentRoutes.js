const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

module.exports = router;

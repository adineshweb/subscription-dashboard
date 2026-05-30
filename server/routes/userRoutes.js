const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/', authenticateUser, userController.getProfile);
router.put('/', authenticateUser, userController.updateProfile);

module.exports = router;

const express = require('express');
const { AuthController, loginValidation } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login do usuário
 * @access  Public
 */
router.post('/login', loginValidation, AuthController.login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar se o token é válido
 * @access  Private
 */
router.get('/verify', authenticateToken, AuthController.verify);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout do usuário
 * @access  Private
 */
router.post('/logout', authenticateToken, AuthController.logout);

module.exports = router;

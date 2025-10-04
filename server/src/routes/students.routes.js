const express = require('express');
const { StudentsController } = require('../controllers/students.controller');

const router = express.Router();

/**
 * @route   POST /api/students
 * @desc    Cadastrar novo estudante
 * @access  Public
 */
router.post('/', StudentsController.create);

/**
 * @route   GET /api/students
 * @desc    Listar todos os estudantes
 * @access  Public
 */
router.get('/', StudentsController.list);

/**
 * @route   GET /api/students/:id
 * @desc    Obter estudante por ID
 * @access  Public
 */
router.get('/:id', StudentsController.getById);

module.exports = router;
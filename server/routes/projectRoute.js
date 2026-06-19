const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  publishProject
} = require('../controllers/projectController')

router.post('/', protect, createProject)
router.get('/', protect, getUserProjects)
router.get('/:id', getProjectById)
router.put('/:id', protect, updateProject)
router.delete('/:id', protect, deleteProject)
router.put('/:id/publish', protect, publishProject)

module.exports = router
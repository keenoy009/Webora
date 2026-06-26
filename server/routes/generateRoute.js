const express = require('express')
const router = express.Router()
const { generateWebsite } = require('../controllers/generateController')
const protect = require('../middleware/authMiddleware')
const checkUsageLimit = require('../middleware/rateLimitMiddleware')

router.post('/generate', protect, checkUsageLimit, generateWebsite)

module.exports = router
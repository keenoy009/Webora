const User = require('../models/User')

const CREDITS_PER_GENERATION = 1

const checkUsageLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.credits < CREDITS_PER_GENERATION) {
      return res.status(429).json({
        message: 'You have run out of credits. Please upgrade your plan to continue.'
      })
    }

    user.credits -= CREDITS_PER_GENERATION
    await user.save()

    req.updatedCredits = user.credits

    next()

  } catch (error) {
    console.error('Usage limit check error:', error)
    next()
  }
}

module.exports = checkUsageLimit
const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Project', projectSchema)
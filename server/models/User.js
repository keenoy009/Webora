const mongoose = require('mongoose')

// This defines how a user looks in our database
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true // name is compulsory
  },
  email: {
    type: String,
    required: true,
    unique: true // no two users can have same email
  },
  password: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    default: 15 // every new user gets 15 free credits
  }
}, { 
  timestamps: true // automatically adds createdAt and updatedAt
})

module.exports = mongoose.model('User', userSchema)
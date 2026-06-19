const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const generateRoute = require('./routes/generateRoute')
const authRoute = require('./routes/authRoute')
const projectRoute = require('./routes/projectRoute')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', generateRoute)
app.use('/api/auth', authRoute)
app.use('/api/projects', projectRoute)

const { getPublishedProjects } = require('./controllers/projectController')

app.get('/api/community', getPublishedProjects)

app.get('/', (req, res) => {
  res.send('Webora API is running!')
})

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((err) => console.log('MongoDB connection error:', err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
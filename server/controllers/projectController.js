const Project = require('../models/Project')

const createProject = async (req, res) => {
  const { title, prompt, code } = req.body
  const userId = req.userId

  try {
    const project = await Project.create({
      user: userId,
      title,
      prompt,
      code
    })

    res.status(201).json(project)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error creating project' })
  }
}

const getUserProjects = async (req, res) => {
  const userId = req.userId

  try {
    const projects = await Project.find({ user: userId }).sort({ createdAt: -1 })
    res.json(projects)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error fetching projects' })
  }
}

const getProjectById = async (req, res) => {
  const { id } = req.params

  try {
    const project = await Project.findById(id)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }
    res.json(project)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error fetching project' })
  }
}

const updateProject = async (req, res) => {
  const { id } = req.params
  const { code, prompt } = req.body

  try {
    const project = await Project.findByIdAndUpdate(
      id,
      { code, prompt },
      { new: true }
    )
    res.json(project)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error updating project' })
  }
}

const deleteProject = async (req, res) => {
  const { id } = req.params

  try {
    await Project.findByIdAndDelete(id)
    res.json({ message: 'Project deleted successfully' })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error deleting project' })
  }
}
const publishProject = async (req, res) => {
  const { id } = req.params

  try {
    const project = await Project.findByIdAndUpdate(
      id,
      { isPublished: true },
      { new: true }
    )
    res.json(project)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error publishing project' })
  }
}

const getPublishedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isPublished: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
    res.json(projects)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error fetching published projects' })
  }
}

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  publishProject,
  getPublishedProjects
}
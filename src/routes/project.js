const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const Project = require('../models/Project');
const User = require('../models/User');

// Create a new project
router.post('/projects', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !members) {
      return res.status(400).json({ message: 'Name and members are required' });
    }

    const project = new Project({
      name,
      members,
      createdBy: req.user.id, // Admin who creates the project
    });

    await project.save();

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Update project members
router.put('/projects/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { members } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.members = members;

    await project.save();

    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Fetch all projects
router.get('/projects', authenticate,authorizeAdmin, async (req, res) => {
  try {
    const projects = await Project.find().populate('members', 'fullName userName');
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

router.get('/projects/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'fullName userName');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ message: 'Failed to fetch project details' });
  }
});

// Add a team member to a project
router.put('/projects/:projectId/add-member',authenticate,authorizeAdmin, async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is already a member
    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member of the project' });
    }

    project.members.push(userId);
    await project.save();

    res.status(200).json({ message: 'Member added successfully', project });
  } catch (error) {
    console.error('Error adding member to project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove a team member from a project
router.put('/projects/:projectId/remove-member',authenticate,authorizeAdmin, async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Remove the member
    project.members = project.members.filter((member) => member.toString() !== userId);

    await project.save();

    res.status(200).json({ message: 'Member removed successfully', project });
  } catch (error) {
    console.error('Error removing member from project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;

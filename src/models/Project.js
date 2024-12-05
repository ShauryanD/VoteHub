const mongoose = require('mongoose');

// Define schema for a Project
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Project name
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Team members
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who created the project
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

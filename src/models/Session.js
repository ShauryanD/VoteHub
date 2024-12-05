// models/Session.js
const mongoose = require('mongoose');

// Define schema for options within each question
const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 }
});

// Define schema for each question
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [optionSchema]
});

// Define schema for the session
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  questions: [questionSchema],
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  creator: { type: String, required: true },  // Socket ID or user ID of the creator
  voters: [{ type: String }],  // List of UUIDs or user identifiers
  allowMultipleVotes: { type: Boolean, default: false },
  votesRevealed:{type: Boolean, default:false}
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;

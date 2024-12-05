const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true }
});


const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [optionSchema]  
});

// Define schema for templates
const templateSchema = new mongoose.Schema({
  title: { type: String, required: true },  
  questions: [questionSchema],
  description: { type: String, required: true }, 
});

// Compile model from schema
const Template = mongoose.model('Template', templateSchema);

module.exports = Template;

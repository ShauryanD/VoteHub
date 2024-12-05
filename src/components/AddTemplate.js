import React, { useState } from 'react';
import { Container, Button, TextField, Typography, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import './AddTemplate.css';
import Swal from "sweetalert2";

const agileSizingOptions = {
  "T-Shirt Sizing": ["S", "M", "L", "XL"],
  "Fibonacci Sizing": ["1", "2", "3", "5", "8", "13"],
  "Custom": [],  // Allow for custom options entry
};

function AddTemplate({ settemplateRefresh,authToken }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sizingType, setSizingType] = useState("Custom");
  const [questions, setQuestions] = useState([{ questionText: '', options: '' }]);
  const navigate = useNavigate();

  const handleSizingTypeChange = (event) => {
    const selectedType = event.target.value;
    setSizingType(selectedType);
    if (selectedType !== "Custom") {
      // Prefill options for all questions based on selected sizing type
      const prefilledOptions = agileSizingOptions[selectedType].join(", ");
      setQuestions(questions.map((q) => ({ ...q, options: prefilledOptions })));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedQuestions = questions.map((question) => ({
      questionText: question.questionText,
      options: question.options.split(',').map(opt => ({ text: opt.trim() })),
    }));

    const newTemplate = { title: name, description, questions: formattedQuestions };

    try {
      const response = await axios.post('http://localhost:4000/api/templates/add-template', newTemplate, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      
      settemplateRefresh((prev)=> !prev)
      navigate('/');
    } catch (error) {
      console.error('Error adding template:', error.message);
      Swal.fire({
        icon: "error",
        text: "There was an error adding the template.",
      });
      // alert('There was an error adding the template.');
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', options: sizingType === "Custom" ? '' : agileSizingOptions[sizingType].join(", ") }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  return (
    <Container className="add-template-page">
      <Typography style={{
        textAlign:"center"
      }} variant="h4" gutterBottom>Add or update template</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Template Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: '20px' }}
          required
        />
        
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginBottom: '20px' }}
          required
        />

        <FormControl fullWidth style={{ marginBottom: '20px' }}>
          <InputLabel>Agile Sizing Type</InputLabel>
          <Select
            value={sizingType}
            onChange={handleSizingTypeChange}
            label="Agile Sizing Type"
          >
            {Object.keys(agileSizingOptions).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Typography variant="h6">Questions:</Typography>
        {questions.map((question, index) => (
          <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', position: "relative" }}>
            <TextField
              label={`Question ${index + 1}`}
              variant="outlined"
              fullWidth
              value={question.questionText}
              onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
              style={{ marginBottom: '10px', width: "90%" }}
              required
            />
            <TextField
              label="Options (comma-separated)"
              variant="outlined"
              fullWidth
              value={question.options}
              onChange={(e) => handleQuestionChange(index, 'options', e.target.value)}
              style={{ marginBottom: '10px', width: "90%" }}
              required
              disabled={sizingType !== "Custom"}  // Disable input if not Custom
            />
            <IconButton
              style={{
                position: "absolute",
                top: "35%",
                right: "40px"
              }}
              aria-label="delete"
              color="error"
              onClick={() => handleRemoveQuestion(index)}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        ))}
        
        <Button variant="outlined" color="primary" onClick={handleAddQuestion} style={{ marginBottom: '20px' }}>
          Add Another Question
        </Button>

        <Button variant="contained" color="primary" type="submit" fullWidth>
          Add Template
        </Button>
      </form>
    </Container>
  );
}

export default AddTemplate;

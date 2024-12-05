import React from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { Container, Card, CardContent, Typography, Grid, Button,IconButton } from '@mui/material';
import './TemplatePage.css';  // Assuming you have your CSS file to retain the previous styles
import axios from 'axios';

function TemplatePage({ templates, setTemplates,authToken }) { // Accept setTemplates to update the list
  const navigate = useNavigate();

  const handleTemplateSelect = (template) => {
    // Redirect to the create session page and pass the selected template state
    navigate('/create', { state: { template } });
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await axios.delete(`http://localhost:4000/api/templates/${templateId}`,{
        headers: {
          'Authorization':`Bearer ${authToken}`
        }
      });
      // Update the templates state after successful deletion
      setTemplates(prevTemplates => {
        console.log("Here")
        return prevTemplates.filter(template => template._id !== templateId);
      })
      console.log(`Template ${templateId} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <Container className="template-page">
      <Typography variant="h4" gutterBottom>
        Templates
      </Typography>
      <Grid container spacing={3}>
        {templates.map((template, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card style={{
                position:"relative"
              }} className="template-card">
              <CardContent >
                <Typography variant="h5" gutterBottom>
                  {template.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {template.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleTemplateSelect(template)}  // Redirect to session creation on click
                  style={{ marginRight: '8px' }}
                >
                  Use Template
                </Button>
                <IconButton
                  style={{
                    position:"absolute",
                    bottom:"2px",
                    right:"2px"
                  }}
                  aria-label="delete"
                  onClick={() => handleDeleteTemplate(template._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default TemplatePage;

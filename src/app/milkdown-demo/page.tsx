'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
} from '@mui/material';
import { MilkdownEditor } from '@/components/forms/MilkdownEditor';

/**
 * Demo page for testing Milkdown Crepe editor integration
 */
export default function MilkdownDemoPage() {
  const sampleContent = `# Sample APD Content

## Executive Summary

This is a sample **APD Executive Summary** with some formatting:

- Bullet point 1 with *italic text*
- Bullet point 2 with **bold text**
- Bullet point 3 with ~~strikethrough~~

### Project Objectives

1. Implement new MMIS functionality
2. Enhance user experience  
3. Ensure regulatory compliance

> This is a blockquote with important information about the project.
> 
> It can span multiple lines and include **formatting**.

#### Technical Details

Here's a table of project costs:

| Category | Federal Share | State Share | Total |
|----------|---------------:|------------:|------:|
| Personnel | $450,000 | $50,000 | $500,000 |
| Hardware | $270,000 | $30,000 | $300,000 |
| Software | $180,000 | $20,000 | $200,000 |

\`\`\`javascript
// Code block example
const projectBudget = {
  federal: 900000,
  state: 100000,
  total: 1000000,
  ffpRate: 0.9
};

function calculateFFP(total, rate) {
  return total * rate;
}
\`\`\`

For more information, visit [CMS.gov](https://cms.gov).

---

**Note**: Try using the toolbar above to format text, or use keyboard shortcuts like:
- **Ctrl+B** for bold
- **Ctrl+I** for italic  
- **Ctrl+K** for links
- **/** for slash commands`;

  const [content, setContent] = useState('');
  const [validationContent, setValidationContent] = useState('');
  const [readOnlyContent, setReadOnlyContent] = useState(sampleContent);
  const [showContent, setShowContent] = useState(false);

  const handleContentChange = (markdown: string) => {
    setContent(markdown);
  };

  const handleValidationContentChange = (markdown: string) => {
    console.log('Validation content changed:', markdown);
    setValidationContent(markdown);
  };

  const handleReadOnlyContentChange = (markdown: string) => {
    setReadOnlyContent(markdown);
  };

  // Validation functions
  const validateContent = (text: string) => {
    const validations = {
      minLength: text.trim().length >= 10,
      hasHelloWorld: text.toLowerCase().includes('hello world'),
      hasTimeAndMaterials: text.toLowerCase().includes('time and materials'),
      hasNumbers: /\d/.test(text),
    };

    const isValid = Object.values(validations).every(Boolean);

    return { validations, isValid };
  };

  // Get current validation results
  const { validations, isValid } = validateContent(validationContent);

  // External validation logic - checks content every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      // Get content directly from the validation editor DOM
      const validationEditor = document.querySelector(
        '[aria-label="Executive Summary"] .ProseMirror'
      );
      if (validationEditor) {
        const currentText = validationEditor.textContent || '';
        if (currentText !== validationContent) {
          console.log('External validation detected change:', currentText);
          setValidationContent(currentText);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [validationContent]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Milkdown Editor Demo
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        This page demonstrates the Milkdown Crepe editor integration for
        eAPD-Next. The editor provides a rich text editing experience for
        markdown content.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This is a development demo. The editor will be integrated into APD forms
        for sections requiring rich text content like Executive Summary and
        Statement of Needs.
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="outlined" onClick={() => setContent(sampleContent)}>
          Load Sample Content
        </Button>
        <Button variant="outlined" onClick={() => setContent('')}>
          Clear Content
        </Button>
        <Button variant="outlined" onClick={() => setShowContent(!showContent)}>
          {showContent ? 'Hide' : 'Show'} Raw Markdown
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        {/* Basic Editor */}
        <Card sx={{ flex: 1, overflow: 'visible' }}>
          <CardContent sx={{ overflow: 'visible', pb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Basic Editor
            </Typography>
            <Box sx={{ position: 'relative', overflow: 'visible' }}>
              <MilkdownEditor
                label="APD Content"
                defaultValue={content}
                onChange={handleContentChange}
                placeholder="Start writing your APD content here..."
                helperText="Use markdown syntax for formatting. The editor provides a WYSIWYG experience."
              />
            </Box>
          </CardContent>
        </Card>

        {/* Raw Markdown Output */}
        {showContent && (
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Raw Markdown Output
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                }}
              >
                {content || 'No content yet...'}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        {/* Required Field with Multi-Layer Validation */}
        <Card sx={{ flex: 1, overflow: 'visible' }}>
          <CardContent sx={{ overflow: 'visible', pb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Required Field with Multi-Layer Validation
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Demo Instructions:</strong> This editor demonstrates
                multiple validation layers. Try typing content that includes all
                required elements to see the validation change in real-time.
              </Typography>
            </Alert>

            {/* Validation Status */}
            <Alert severity={isValid ? 'success' : 'warning'} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Validation Status:</strong>{' '}
                {isValid ? 'All checks passed!' : 'Some validations failed'}
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Typography
                  component="li"
                  variant="body2"
                  sx={{
                    color: validations.minLength
                      ? 'success.main'
                      : 'error.main',
                  }}
                >
                  ✓ Minimum 10 characters: {validationContent.trim().length}{' '}
                  chars
                  {validations.minLength ? ' ✅' : ' ❌'}
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  sx={{
                    color: validations.hasHelloWorld
                      ? 'success.main'
                      : 'error.main',
                  }}
                >
                  ✓ Contains "Hello World":{' '}
                  {validations.hasHelloWorld ? ' ✅' : ' ❌'}
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  sx={{
                    color: validations.hasTimeAndMaterials
                      ? 'success.main'
                      : 'error.main',
                  }}
                >
                  ✓ Contains "time and materials":{' '}
                  {validations.hasTimeAndMaterials ? ' ✅' : ' ❌'}
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  sx={{
                    color: validations.hasNumbers
                      ? 'success.main'
                      : 'error.main',
                  }}
                >
                  ✓ Contains numbers: {validations.hasNumbers ? ' ✅' : ' ❌'}
                </Typography>
              </Box>
            </Alert>

            <Box sx={{ position: 'relative', overflow: 'visible' }}>
              <MilkdownEditor
                label="Executive Summary"
                required
                error={!isValid}
                onChange={handleValidationContentChange}
                helperText={
                  !isValid
                    ? 'Please ensure all validation requirements are met (see above)'
                    : 'All validation checks passed! ✅'
                }
                placeholder="Try typing: Hello World! This project uses time and materials approach with a budget of $500,000."
              />
            </Box>
          </CardContent>
        </Card>

        {/* Raw Markdown Output for Validation Editor */}
        {showContent && (
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Raw Markdown Output
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                }}
              >
                {validationContent || 'No content yet...'}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        {/* Read-Only Editor */}
        <Card sx={{ flex: 1, overflow: 'visible' }}>
          <CardContent sx={{ overflow: 'visible', pb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Read-Only Editor
            </Typography>
            <Box sx={{ position: 'relative', overflow: 'visible' }}>
              <MilkdownEditor
                label="Template Preview"
                defaultValue={sampleContent}
                onChange={handleReadOnlyContentChange}
                readOnly
                helperText="This content is read-only and cannot be edited"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Raw Markdown Output for Read-Only Editor */}
        {showContent && (
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Raw Markdown Output
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                }}
              >
                {readOnlyContent || sampleContent || 'No content yet...'}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
}

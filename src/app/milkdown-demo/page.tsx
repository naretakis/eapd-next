'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
} from '@mui/material';
import {
  MilkdownEditor,
  MilkdownEditorRef,
} from '@/components/forms/MilkdownEditor';

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
  const [showContent, setShowContent] = useState(false);

  // Refs for accessing editor instances
  const basicEditorRef = useRef<MilkdownEditorRef>(null);
  const validationEditorRef = useRef<MilkdownEditorRef>(null);
  const readOnlyEditorRef = useRef<MilkdownEditorRef>(null);

  // State for raw markdown content from editors
  const [basicRawContent, setBasicRawContent] = useState('');
  const [validationRawContent, setValidationRawContent] = useState('');
  const [readOnlyRawContent, setReadOnlyRawContent] = useState('');

  // Standardized content change handlers using ref-based approach
  const handleContentChange = useCallback((markdown: string) => {
    setContent(markdown);
  }, []);

  const handleValidationChange = useCallback((markdown: string) => {
    // Strip markdown formatting for validation
    const plainText = markdown.replace(/[#*_`~\[\]()]/g, '').trim();
    setValidationContent(plainText);
  }, []);

  // Function to update raw markdown content from all editors
  const updateRawContent = useCallback(() => {
    if (basicEditorRef.current) {
      const basicContent = basicEditorRef.current.getMarkdown();
      setBasicRawContent(basicContent);
    }

    if (validationEditorRef.current) {
      const validationContent = validationEditorRef.current.getMarkdown();
      setValidationRawContent(validationContent);
    }

    if (readOnlyEditorRef.current) {
      const readOnlyContent = readOnlyEditorRef.current.getMarkdown();
      setReadOnlyRawContent(readOnlyContent);
    }
  }, []);

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

  // Set up standardized content change listeners for all editors
  useEffect(() => {
    let basicCleanup: (() => void) | undefined;
    let validationCleanup: (() => void) | undefined;

    // Function to set up listeners when editors are ready
    const setupListeners = () => {
      // Basic editor content change listener
      if (basicEditorRef.current && !basicCleanup) {
        basicCleanup =
          basicEditorRef.current.onContentChange(handleContentChange);
      }

      // Validation editor content change listener
      if (validationEditorRef.current && !validationCleanup) {
        validationCleanup = validationEditorRef.current.onContentChange(
          handleValidationChange
        );
      }
    };

    // Try to set up listeners immediately
    setupListeners();

    // If editors aren't ready yet, try again after a delay
    const timer = setTimeout(() => {
      setupListeners();
    }, 500);

    // Also try periodically until both are set up
    const interval = setInterval(() => {
      if (!basicCleanup || !validationCleanup) {
        setupListeners();
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      basicCleanup?.();
      validationCleanup?.();
    };
  }, [handleContentChange, handleValidationChange]);

  // Initialize raw content when editors are ready and update periodically
  useEffect(() => {
    if (showContent) {
      // Initial update after a delay to let editors initialize
      const initialTimer = setTimeout(() => {
        updateRawContent();
      }, 1000);

      // Periodic updates every 3 seconds when showing content (less aggressive)
      const interval = setInterval(() => {
        updateRawContent();
      }, 3000);

      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
      };
    }

    // Return empty cleanup function when showContent is false
    return () => {};
  }, [showContent, updateRawContent]);

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

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={() => {
            basicEditorRef.current?.replaceAllContent(sampleContent);
            setContent(sampleContent); // Update display state for raw content view
          }}
        >
          Load Sample Content
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            basicEditorRef.current?.replaceAllContent('');
            setContent(''); // Update display state for raw content view
          }}
        >
          Clear Content
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            if (!showContent) {
              // Update raw content when showing
              updateRawContent();
            }
            setShowContent(!showContent);
          }}
        >
          {showContent ? 'Hide' : 'Show'} Raw Markdown
        </Button>

        {/* New utility buttons */}
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            if (basicEditorRef.current) {
              const outline = basicEditorRef.current.getOutline();
              console.log('Document Outline:', outline);
              alert(
                `Document has ${outline.length} sections. Check console for details.`
              );
            }
          }}
        >
          Show Outline
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            if (basicEditorRef.current) {
              basicEditorRef.current.insertContent(
                '\n\n## New Section\n\n[Content to be added]\n\n'
              );
            }
          }}
        >
          Insert Section
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            if (basicEditorRef.current) {
              const html = basicEditorRef.current.getHTML();
              console.log('HTML Export:', html);
              // Create a new window to show the HTML preview
              const previewWindow = window.open('', '_blank');
              if (previewWindow) {
                previewWindow.document.write(`
                  <html>
                    <head><title>APD Preview</title></head>
                    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                      ${html}
                    </body>
                  </html>
                `);
                previewWindow.document.close();
              }
            }
          }}
        >
          HTML Preview
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
                ref={basicEditorRef}
                label="APD Content"
                defaultValue="" // Don't use content state to avoid circular dependency
                placeholder="Start writing your APD content here..."
                helperText="Use markdown syntax for formatting. The editor provides a WYSIWYG experience."
                pollingInterval={500} // Responsive polling for demo
                enablePolling={true}
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
                {basicRawContent || 'No content yet...'}
              </Box>
              <Button
                variant="text"
                size="small"
                onClick={updateRawContent}
                sx={{ mt: 1 }}
              >
                Refresh Content
              </Button>
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
                  ✓ Contains &quot;Hello World&quot;:{' '}
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
                  ✓ Contains &quot;time and materials&quot;:{' '}
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
                ref={validationEditorRef}
                label="Executive Summary"
                required
                error={!isValid}
                helperText={
                  !isValid
                    ? 'Please ensure all validation requirements are met (see above)'
                    : 'All validation checks passed! ✅'
                }
                placeholder="Try typing: Hello World! This project uses time and materials approach with a budget of $500,000."
                pollingInterval={1000} // Slower polling for validation-heavy context
                enablePolling={true}
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
                {validationRawContent || 'No content yet...'}
              </Box>
              <Button
                variant="text"
                size="small"
                onClick={updateRawContent}
                sx={{ mt: 1 }}
              >
                Refresh Content
              </Button>
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
                ref={readOnlyEditorRef}
                label="Template Preview"
                defaultValue={sampleContent}
                readOnly
                helperText="This content is read-only and cannot be edited"
                enablePolling={false} // No polling needed for read-only
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
                {readOnlyRawContent || sampleContent || 'No content yet...'}
              </Box>
              <Button
                variant="text"
                size="small"
                onClick={updateRawContent}
                sx={{ mt: 1 }}
              >
                Refresh Content
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
}

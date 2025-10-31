'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { TemplateService, TemplateParsingResult } from '@/templates/parsers';

/**
 * Template Parser Demo Page
 *
 * Demonstrates the template parsing functionality with sample APD templates.
 * Shows how markdown templates are converted to structured form definitions
 * with Milkdown editor configurations.
 */
export default function TemplateParserDemo() {
  const [selectedTemplate, setSelectedTemplate] = useState('sample-papd');
  const [customTemplate, setCustomTemplate] = useState('');
  const [parseResult, setParseResult] = useState<TemplateParsingResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTemplates = {
    'sample-papd': {
      name: 'Sample PAPD Template',
      content: `---
State: California
Document Type: PAPD
Version: 1.0
---

# Planning APD (PAPD) Template

## 1. Executive Summary

> [!info]+
> Provide a brief overview of the project intent, including the type of system being developed or enhanced.

[Insert written content here]

### 1.1 Project Overview

[Insert written content here]

## 2. Project Management Plan

> [!info]+
> Describe the project organization, approach, and key activities for the planning phase.

[Insert written content here]

### 2.1 Key Personnel

| Role | Name | Time Commitment | Annual Salary | Benefits | Total Cost |
|------|------|----------------|---------------|----------|------------|
| Project Director | [Name] | 100% | $120,000 | $36,000 | $156,000 |
| Technical Lead | [Name] | 75% | $95,000 | $28,500 | $123,500 |

## 3. Proposed Budget

> [!info]+
> Provide detailed budget information with FFP calculations.

### 3.1 Budget Summary

| Category | Federal Share (90%) | State Share (10%) | Total |
|----------|-------------------|------------------|-------|
| Personnel | $450,000 | $50,000 | $500,000 |
| Hardware | $270,000 | $30,000 | $300,000 |
| **Total** | **$720,000** | **$80,000** | **$800,000** |`,
    },
    'sample-iapd': {
      name: 'Sample IAPD Template',
      content: `---
State: Texas
Document Type: IAPD
Version: 2.0
---

# Implementation APD (IAPD) Template

## 1. Executive Summary

> [!info]+
> Summarize the implementation project and reference the approved PAPD.

[Insert written content here]

## 2. Analysis of Alternatives Summary

> [!info]+
> Provide a summary of the Analysis of Alternatives conducted during the planning phase.

[Insert written content here]

### 2.1 Recommended Solution

[Insert written content here]

## 3. Implementation Timeline

> [!info]+
> Detailed project timeline with milestones and deliverables.

| Phase | Start Date | End Date | Key Deliverables |
|-------|------------|----------|------------------|
| Phase 1: Design | 01/01/2024 | 06/30/2024 | System Design Document |
| Phase 2: Development | 07/01/2024 | 12/31/2024 | Core System Implementation |`,
    },
  };

  const handleParseTemplate = async () => {
    setLoading(true);
    setError(null);
    setParseResult(null);

    try {
      const templateService = new TemplateService();
      const content =
        selectedTemplate === 'custom'
          ? customTemplate
          : sampleTemplates[selectedTemplate as keyof typeof sampleTemplates]
              .content;

      const result = await templateService.parseTemplate(content, 'PAPD', {
        enableMilkdown: true,
        generateSchema: true,
        analyzeContent: true,
        validationLevel: 'comprehensive',
      });

      setParseResult(result);
    } catch (err) {
      console.error('Template parsing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Template Parser Demo
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        This demo shows how APD markdown templates are parsed into structured
        form definitions with intelligent content type detection and Milkdown
        editor configurations.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Development Demo:</strong> This demonstrates the template
          parsing engine that converts markdown APD templates into dynamic forms
          with rich text editing capabilities.
        </Typography>
      </Alert>

      {/* Template Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Template to Parse
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Template</InputLabel>
              <Select
                value={selectedTemplate}
                label="Template"
                onChange={e => setSelectedTemplate(e.target.value)}
              >
                <MenuItem value="sample-papd">Sample PAPD</MenuItem>
                <MenuItem value="sample-iapd">Sample IAPD</MenuItem>
                <MenuItem value="custom">Custom Template</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={handleParseTemplate}
              disabled={loading}
            >
              {loading ? 'Parsing...' : 'Parse Template'}
            </Button>
          </Box>

          {selectedTemplate === 'custom' && (
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Custom Template (Markdown)"
              value={customTemplate}
              onChange={e => setCustomTemplate(e.target.value)}
              placeholder="Enter your markdown template here..."
              sx={{ mb: 2 }}
            />
          )}

          {selectedTemplate !== 'custom' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Preview:{' '}
                {
                  sampleTemplates[
                    selectedTemplate as keyof typeof sampleTemplates
                  ].name
                }
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
                  maxHeight: 300,
                  overflow: 'auto',
                }}
              >
                {
                  sampleTemplates[
                    selectedTemplate as keyof typeof sampleTemplates
                  ].content
                }
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Parsing Error:</strong> {error}
          </Typography>
        </Alert>
      )}

      {/* Parse Results */}
      {parseResult && (
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Template Structure */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Parsed Template Structure
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Template Metadata
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    label={`Type: ${parseResult.template?.type || 'Unknown'}`}
                    size="small"
                  />
                  <Chip
                    label={`Sections: ${parseResult.template?.sections?.length || 0}`}
                    size="small"
                  />
                  <Chip
                    label={`Fields: ${parseResult.template?.sections?.reduce((total, section) => total + (section.fields?.length || 0), 0) || 0}`}
                    size="small"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Sections Found
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {parseResult.template?.sections?.map(
                  (section, index: number) => (
                    <Typography
                      component="li"
                      variant="body2"
                      key={index}
                      sx={{ mb: 0.5 }}
                    >
                      <strong>{section.title}</strong>
                      {section.fields && ` (${section.fields.length} fields)`}
                    </Typography>
                  )
                ) || (
                  <Typography variant="body2" color="text.secondary">
                    No sections found
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Content Analysis */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Content Analysis
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Detected Content Types
              </Typography>
              <Box sx={{ mb: 2 }}>
                {parseResult.contentAnalyses &&
                parseResult.contentAnalyses.size > 0 ? (
                  Array.from(parseResult.contentAnalyses.entries()).map(
                    ([fieldPath, analysis], index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 1,
                          p: 1,
                          backgroundColor: 'grey.50',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2">
                          <strong>{fieldPath}:</strong> {analysis.contentType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Confidence:{' '}
                          {Math.round((analysis.confidence || 0) * 100)}%
                        </Typography>
                      </Box>
                    )
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No content analysis available
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Milkdown Configurations
              </Typography>
              <Box>
                {parseResult.milkdownConfigs &&
                parseResult.milkdownConfigs.size > 0 ? (
                  Array.from(parseResult.milkdownConfigs.entries()).map(
                    ([fieldPath, config]) => (
                      <Box
                        key={fieldPath}
                        sx={{
                          mb: 1,
                          p: 1,
                          backgroundColor: 'grey.50',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2">
                          <strong>{fieldPath}:</strong>{' '}
                          {config.contentType || 'basic'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Plugins:{' '}
                          {config.plugins?.map(p => p.name).join(', ') ||
                            'none'}
                        </Typography>
                      </Box>
                    )
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No Milkdown configurations generated
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Features Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Template Parser Features
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              <strong>Intelligent Content Detection:</strong> Automatically
              detects budget tables, personnel tables, regulatory references
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              <strong>Milkdown Integration:</strong> Generates appropriate
              editor configurations with plugins
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              <strong>Schema Generation:</strong> Creates TypeScript interfaces
              and validation rules
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              <strong>APD-Specific Features:</strong> Supports PAPD, IAPD, and
              OAPD template types
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

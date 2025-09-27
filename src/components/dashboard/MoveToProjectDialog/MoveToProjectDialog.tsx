'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  DriveFileMove as MoveIcon,
} from '@mui/icons-material';
import { Project } from '@/types/apd';

interface MoveToProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onMove: (targetProjectId: string | null, newProjectName?: string) => void;
  documentName: string;
  currentProjectName?: string;
  availableProjects: Project[];
  loading?: boolean;
}

/**
 * Move to Project Dialog Component
 *
 * Modal dialog for moving documents between projects with options to:
 * - Move to existing project (dropdown selection)
 * - Move to new project (create new project)
 * - Move to ungrouped (no project)
 *
 * Features:
 * - Clean dropdown interface for existing projects
 * - Option to create new project with validation
 * - Clear indication of current project
 * - Form validation and error handling
 * - Material-UI Dialog with proper accessibility
 * - Responsive design optimized for desktop
 *
 * @param open - Whether the dialog is open
 * @param onClose - Callback to close the dialog
 * @param onMove - Callback when document is moved (projectId, newProjectName?)
 * @param documentName - Name of the document being moved
 * @param currentProjectName - Current project name (if any)
 * @param availableProjects - List of available projects to move to
 * @param loading - Whether move operation is in progress
 */
export const MoveToProjectDialog: React.FC<MoveToProjectDialogProps> = ({
  open,
  onClose,
  onMove,
  documentName,
  currentProjectName,
  availableProjects,
  loading = false,
}) => {
  // Form state
  const [moveMode, setMoveMode] = useState<'existing' | 'new' | 'ungrouped'>(
    'existing'
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setMoveMode('existing');
      setSelectedProjectId('');
      setNewProjectName('');
      setError('');
    }
  }, [open]);

  // Validation
  const validateForm = (): boolean => {
    setError('');

    if (moveMode === 'existing' && !selectedProjectId) {
      setError('Please select a project');
      return false;
    }

    if (moveMode === 'new') {
      if (!newProjectName.trim()) {
        setError('Please enter a project name');
        return false;
      }
      if (newProjectName.length < 3) {
        setError('Project name must be at least 3 characters');
        return false;
      }
      // Check if project name already exists
      if (
        availableProjects.some(
          p => p.name.toLowerCase() === newProjectName.toLowerCase()
        )
      ) {
        setError('A project with this name already exists');
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleMove = () => {
    if (!validateForm()) {
      return;
    }

    switch (moveMode) {
      case 'existing':
        onMove(selectedProjectId);
        break;
      case 'new':
        onMove(null, newProjectName.trim());
        break;
      case 'ungrouped':
        onMove(null);
        break;
    }
  };

  // Filter out current project from available projects
  const filteredProjects = availableProjects.filter(
    p => p.name !== currentProjectName
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="move-to-project-dialog-title"
    >
      <DialogTitle
        id="move-to-project-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MoveIcon color="primary" />
          <Typography variant="h6" component="span">
            Move Document
          </Typography>
        </Box>
        <IconButton
          aria-label="close dialog"
          onClick={onClose}
          disabled={loading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Document Info */}
          <Box>
            <Typography variant="body1" gutterBottom>
              <strong>Document:</strong> {documentName}
            </Typography>
            {currentProjectName && (
              <Typography variant="body2" color="text.secondary">
                <strong>Current Project:</strong> {currentProjectName}
              </Typography>
            )}
            {!currentProjectName && (
              <Typography variant="body2" color="text.secondary">
                <strong>Current Status:</strong> Ungrouped
              </Typography>
            )}
          </Box>

          {/* Move Options */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Move to:
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={moveMode}
                onChange={e =>
                  setMoveMode(
                    e.target.value as 'existing' | 'new' | 'ungrouped'
                  )
                }
                sx={{ gap: 2 }}
              >
                {/* Existing Project */}
                <FormControlLabel
                  value="existing"
                  control={<Radio />}
                  label="Existing Project"
                  disabled={filteredProjects.length === 0}
                />
                {moveMode === 'existing' && (
                  <Box sx={{ ml: 4, mb: 1 }}>
                    {filteredProjects.length > 0 ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>Select Project</InputLabel>
                        <Select
                          value={selectedProjectId}
                          label="Select Project"
                          onChange={e => setSelectedProjectId(e.target.value)}
                        >
                          {filteredProjects.map(project => (
                            <MenuItem key={project.id} value={project.id}>
                              <Box>
                                <Typography variant="body1">
                                  {project.name}
                                </Typography>
                                {project.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {project.description}
                                  </Typography>
                                )}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                      >
                        No other projects available
                      </Typography>
                    )}
                  </Box>
                )}

                {/* New Project */}
                <FormControlLabel
                  value="new"
                  control={<Radio />}
                  label="New Project"
                />
                {moveMode === 'new' && (
                  <Box sx={{ ml: 4, mb: 1 }}>
                    <TextField
                      label="Project Name"
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="Enter new project name"
                      helperText="A new project will be created with this name"
                    />
                  </Box>
                )}

                {/* Ungrouped */}
                <FormControlLabel
                  value="ungrouped"
                  control={<Radio />}
                  label="Ungrouped (No Project)"
                />
                {moveMode === 'ungrouped' && (
                  <Box sx={{ ml: 4, mb: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: 'italic' }}
                    >
                      Document will not be associated with any project
                    </Typography>
                  </Box>
                )}
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Error Display */}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleMove}
          variant="contained"
          disabled={loading}
          startIcon={<MoveIcon />}
        >
          {loading ? 'Moving...' : 'Move Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveToProjectDialog;

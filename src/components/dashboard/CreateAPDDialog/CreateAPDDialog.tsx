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
  Box,
  Typography,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
  Alert,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  ChecklistRtl as ChecklistIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { APDType, Project, APDListItem } from '@/types/apd';

interface CreateAPDDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateAPDData) => void;
  projects: Project[];
  availableAPDs?: APDListItem[];
  loading?: boolean;
  preselectedProjectId?: string | null;
}

export interface CreateAPDData {
  type: APDType;
  projectName: string;
  projectId?: string | undefined;
  stateName: string;
  stateAgency: string;
  primaryContactName: string;
  primaryContactEmail: string;
  benefitsMultiplePrograms: boolean;
  // For sub-documents
  parentAPDId?: string;
}

/**
 * Create APD Dialog Component
 *
 * Modal dialog for creating new APDs with type selection and validation.
 *
 * Features:
 * - APD type selection with descriptions and help text
 * - Project name input with auto-complete suggestions
 * - Project association (new or existing)
 * - Basic metadata collection
 * - Form validation with real-time feedback
 * - Material-UI Dialog with proper accessibility
 * - Responsive design optimized for desktop
 *
 * Learning Notes:
 * - Uses Material-UI Dialog components for modal interface
 * - Implements form validation with useState hooks
 * - Provides auto-complete for project selection
 * - Shows APD type information with icons and descriptions
 * - Follows Material Design principles for form layout
 * - Includes proper accessibility attributes
 *
 * @param open - Whether the dialog is open
 * @param onClose - Callback to close the dialog
 * @param onCreate - Callback when APD is created
 * @param projects - Existing projects for selection
 * @param loading - Whether creation is in progress
 */
export const CreateAPDDialog: React.FC<CreateAPDDialogProps> = ({
  open,
  onClose,
  onCreate,
  projects,
  availableAPDs = [],
  loading = false,
  preselectedProjectId = null,
}) => {
  // Form state
  const [formData, setFormData] = useState<CreateAPDData>({
    type: 'PAPD',
    projectName: '',
    stateName: '',
    stateAgency: '',
    primaryContactName: '',
    primaryContactEmail: '',
    benefitsMultiplePrograms: false,
  });

  // Parent APD selection for sub-documents
  const [selectedParentAPDId, setSelectedParentAPDId] = useState<string>('');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Project selection mode
  const [projectMode, setProjectMode] = useState<'new' | 'existing'>('new');

  // Helper function to check if document type is a sub-document
  const isSubDocument = (type: APDType): boolean => {
    return ['AoA', 'Acquisition Checklist'].includes(type);
  };

  // Get available parent APDs for the selected project
  const getAvailableParentAPDs = (): APDListItem[] => {
    if (!availableAPDs) return [];

    // Filter to only show APDs (not sub-documents) in the same project
    return availableAPDs.filter(
      apd =>
        ['PAPD', 'IAPD', 'OAPD'].includes(apd.type) &&
        apd.projectName === formData.projectName
    );
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      // If a project is preselected, set up for existing project mode
      if (preselectedProjectId) {
        const preselectedProject = projects.find(
          p => p.id === preselectedProjectId
        );
        setFormData({
          type: 'PAPD',
          projectName: preselectedProject?.name || '',
          projectId: preselectedProjectId,
          stateName: '',
          stateAgency: '',
          primaryContactName: '',
          primaryContactEmail: '',
          benefitsMultiplePrograms: false,
        });
        setProjectMode('existing');
      } else {
        setFormData({
          type: 'PAPD',
          projectName: '',
          stateName: '',
          stateAgency: '',
          primaryContactName: '',
          primaryContactEmail: '',
          benefitsMultiplePrograms: false,
        });
        setProjectMode('new');
      }
      setErrors({});
      setTouched({});
      setSelectedParentAPDId('');
    }
  }, [open, preselectedProjectId, projects]);

  // APD type information
  const apdTypeInfo = {
    PAPD: {
      icon: <DescriptionIcon color="primary" />,
      title: 'Planning APD (PAPD)',
      description:
        'Initial planning and design phase funding request. Used to request federal funding for the planning activities of a Medicaid IT project.',
      ffpRate: '90% Federal / 10% State',
      whenToUse: 'Before detailed system design begins',
    },
    IAPD: {
      icon: <AssignmentIcon color="secondary" />,
      title: 'Implementation APD (IAPD)',
      description:
        'Detailed implementation phase funding request. Contains comprehensive project plans, technical specifications, and budget breakdowns.',
      ffpRate: '90% Federal for DDI, 75% for Operations',
      whenToUse: 'After planning phase, during implementation',
    },
    OAPD: {
      icon: <SettingsIcon color="success" />,
      title: 'Operational APD (OAPD)',
      description:
        'Ongoing operations and maintenance funding request. Covers operational costs, maintenance activities, and performance metrics.',
      ffpRate: '75% Federal / 25% State for Operations',
      whenToUse: 'For ongoing system operations and maintenance',
    },
    AoA: {
      icon: <AnalyticsIcon color="info" />,
      title: 'Analysis of Alternatives (AoA)',
      description:
        'Systematic evaluation of different solution options. Required for planning phase to demonstrate consideration of alternatives.',
      ffpRate: '90% Federal / 10% State',
      whenToUse: 'During planning phase for solution evaluation',
    },
    'Acquisition Checklist': {
      icon: <ChecklistIcon color="warning" />,
      title: 'Acquisition Checklist',
      description:
        'Procurement compliance checklist. Supports CMS review and approval prior to solicitation release.',
      ffpRate: 'Varies by project phase',
      whenToUse: 'Before releasing procurement solicitations',
    },
  };

  // Validation functions
  const validateField = (name: string, value: unknown) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'projectName':
        if (typeof value !== 'string' || !value.trim()) {
          newErrors.projectName = 'Project name is required';
        } else if (value.length < 3) {
          newErrors.projectName = 'Project name must be at least 3 characters';
        } else {
          delete newErrors.projectName;
        }
        break;

      case 'projectId':
        if (projectMode === 'existing' && !value) {
          newErrors.projectId = 'Please select an existing project';
        } else {
          delete newErrors.projectId;
        }
        break;

      case 'parentAPDId':
        if (isSubDocument(formData.type) && !value) {
          newErrors.parentAPDId =
            'Please select a parent APD for this sub-document';
        } else {
          delete newErrors.parentAPDId;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Handle field changes
  const handleFieldChange = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate all fields
    const fieldsToValidate = ['projectName'];

    if (projectMode === 'existing') {
      fieldsToValidate.push('projectId');
    }

    // Add parent APD validation for sub-documents
    if (isSubDocument(formData.type)) {
      fieldsToValidate.push('parentAPDId');
      validateField('parentAPDId', selectedParentAPDId);
      setTouched(prev => ({ ...prev, parentAPDId: true }));
    }

    fieldsToValidate.forEach(field => {
      if (field === 'parentAPDId') return; // Already validated above
      validateField(field, formData[field as keyof CreateAPDData]);
      setTouched(prev => ({ ...prev, [field]: true }));
    });

    // Check if form is valid
    const hasErrors = fieldsToValidate.some(field => errors[field]);
    if (hasErrors) {
      return;
    }

    // Submit form with default values for removed fields
    const submitData = {
      ...formData,
      stateName: 'State Name', // Default placeholder
      stateAgency: 'State Agency', // Default placeholder
      primaryContactName: 'Primary Contact', // Default placeholder
      primaryContactEmail: 'contact@state.gov', // Default placeholder
      benefitsMultiplePrograms: false,
      // Include parent APD for sub-documents
      ...(isSubDocument(formData.type) &&
        selectedParentAPDId && {
          parentAPDId: selectedParentAPDId,
        }),
    };
    if (projectMode === 'new') {
      delete submitData.projectId;
    }

    onCreate(submitData);
  };

  // Get project suggestions for autocomplete
  const projectSuggestions = projects.map(project => ({
    label: project.name,
    value: project.id,
    description: project.description,
  }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="create-apd-dialog-title"
    >
      <DialogTitle
        id="create-apd-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon color="primary" />
          <Typography variant="h6" component="span">
            Create New Document
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
          {/* Document Type Selection */}
          <Box>
            <Typography variant="h6" gutterBottom>
              1. Select Document Type
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={formData.type}
                onChange={e =>
                  handleFieldChange('type', e.target.value as APDType)
                }
                sx={{ gap: 1 }}
              >
                {Object.entries(apdTypeInfo).map(([type, info]) => (
                  <Card
                    key={type}
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 2,
                      },
                      ...(formData.type === type && {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50',
                      }),
                    }}
                    onClick={() => handleFieldChange('type', type as APDType)}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <FormControlLabel
                        value={type}
                        control={<Radio />}
                        label={
                          <Box sx={{ ml: 1, width: '100%' }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              {info.icon}
                              <Typography variant="subtitle1" fontWeight={600}>
                                {info.title}
                              </Typography>
                              <Chip
                                label={info.ffpRate}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {info.description}
                            </Typography>
                            <Typography variant="caption" color="primary">
                              When to use: {info.whenToUse}
                            </Typography>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          <Divider />

          {/* Project Information */}
          <Box>
            <Typography variant="h6" gutterBottom>
              2. Project Information
            </Typography>

            {/* Project Mode Selection */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <RadioGroup
                row
                value={projectMode}
                onChange={e =>
                  setProjectMode(e.target.value as 'new' | 'existing')
                }
              >
                <FormControlLabel
                  value="new"
                  control={<Radio />}
                  label="Create new project"
                />
                <FormControlLabel
                  value="existing"
                  control={<Radio />}
                  label="Add to existing project"
                />
              </RadioGroup>
            </FormControl>

            {projectMode === 'new' ? (
              <TextField
                label="Project Name"
                value={formData.projectName}
                onChange={e => handleFieldChange('projectName', e.target.value)}
                error={!!(touched.projectName && errors.projectName)}
                helperText={
                  touched.projectName && errors.projectName
                    ? errors.projectName
                    : 'Enter a descriptive name for your project'
                }
                fullWidth
                required
              />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Autocomplete
                  options={projectSuggestions}
                  getOptionLabel={option => option.label}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">{option.label}</Typography>
                        {option.description && (
                          <Typography variant="body2" color="text.secondary">
                            {option.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  onChange={(_, value) => {
                    handleFieldChange('projectId', value?.value || '');
                    handleFieldChange('projectName', value?.label || '');
                  }}
                  renderInput={params => {
                    // Filter out undefined properties to satisfy exactOptionalPropertyTypes
                    const cleanParams = Object.fromEntries(
                      Object.entries(params).filter(
                        ([, value]) => value !== undefined
                      )
                    );
                    return (
                      <TextField
                        {...cleanParams}
                        label="Select Project"
                        error={!!(touched.projectId && errors.projectId)}
                        helperText={
                          touched.projectId && errors.projectId
                            ? errors.projectId
                            : 'Choose an existing project to add this APD to'
                        }
                        required
                      />
                    );
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Parent APD Selection for Sub-Documents */}
          {isSubDocument(formData.type) && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" gutterBottom>
                  3. Link to Parent APD
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {formData.type === 'AoA'
                    ? 'Analysis of Alternatives documents should be linked to the APD they support.'
                    : 'Acquisition Checklists should be linked to the APD they support.'}
                </Typography>

                {getAvailableParentAPDs().length > 0 ? (
                  <Autocomplete
                    options={getAvailableParentAPDs()}
                    getOptionLabel={option =>
                      `${option.type}: ${option.projectName}`
                    }
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: '100%',
                          }}
                        >
                          <Chip
                            label={option.type}
                            color={
                              option.type === 'PAPD'
                                ? 'primary'
                                : option.type === 'IAPD'
                                  ? 'secondary'
                                  : 'success'
                            }
                            size="small"
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1">
                              {option.projectName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.completionStatus}% complete •{' '}
                              {option.currentVersion}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    onChange={(_, value) => {
                      setSelectedParentAPDId(value?.id || '');
                      setTouched(prev => ({ ...prev, parentAPDId: true }));
                      validateField('parentAPDId', value?.id || '');
                    }}
                    renderInput={params => {
                      const cleanParams = Object.fromEntries(
                        Object.entries(params).filter(
                          ([, value]) => value !== undefined
                        )
                      );
                      return (
                        <TextField
                          {...cleanParams}
                          label="Select Parent APD"
                          error={!!(touched.parentAPDId && errors.parentAPDId)}
                          helperText={
                            touched.parentAPDId && errors.parentAPDId
                              ? errors.parentAPDId
                              : `Choose the APD that this ${formData.type} supports`
                          }
                          required
                        />
                      );
                    }}
                  />
                ) : (
                  <Alert severity="warning">
                    <Typography variant="body1" gutterBottom>
                      No parent APDs available
                    </Typography>
                    <Typography variant="body2">
                      You need to create at least one APD (PAPD, IAPD, or OAPD)
                      in this project before creating sub-documents.
                      Sub-documents must be linked to a parent APD.
                    </Typography>
                  </Alert>
                )}
              </Box>
            </>
          )}

          {/* Information Alert */}
          <Alert severity="info">
            <Typography variant="body2">
              {isSubDocument(formData.type)
                ? `After creating your ${formData.type}, it will be automatically linked to the selected parent APD and you'll be taken to the guided editor.`
                : "After creating your APD, you'll be taken to the guided editor where you can complete all sections step-by-step with contextual help and validation."}
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            loading ||
            (isSubDocument(formData.type) &&
              getAvailableParentAPDs().length === 0)
          }
          startIcon={<AddIcon />}
        >
          {loading
            ? 'Creating...'
            : isSubDocument(formData.type)
              ? 'Create & Link Document'
              : 'Create Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAPDDialog;

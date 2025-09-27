'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Link as LinkIcon,
  Analytics as AnalyticsIcon,
  ChecklistRtl as ChecklistIcon,
} from '@mui/icons-material';
import { APDListItem } from '@/types/apd';

interface LinkSubDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onLink: (parentAPDId: string, childDocumentId: string) => void;
  parentAPD: APDListItem | null;
  availableSubDocuments: APDListItem[];
  loading?: boolean;
}

/**
 * Link Sub-Document Dialog Component
 *
 * Modal dialog for linking sub-documents (AoA, Acquisition Checklists) to parent APDs.
 *
 * Features:
 * - Shows parent APD information
 * - Dropdown selection of available sub-documents
 * - Filters out already linked documents
 * - Clear visual indicators for document types
 * - Form validation and error handling
 * - Material-UI Dialog with proper accessibility
 *
 * @param open - Whether the dialog is open
 * @param onClose - Callback to close the dialog
 * @param onLink - Callback when documents are linked (parentAPDId, childDocumentId)
 * @param parentAPD - The parent APD to link sub-documents to
 * @param availableSubDocuments - List of available sub-documents to link
 * @param loading - Whether link operation is in progress
 */
export const LinkSubDocumentDialog: React.FC<LinkSubDocumentDialogProps> = ({
  open,
  onClose,
  onLink,
  parentAPD,
  availableSubDocuments,
  loading = false,
}) => {
  const [selectedSubDocumentId, setSelectedSubDocumentId] =
    useState<string>('');
  const [error, setError] = useState<string>('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedSubDocumentId('');
      setError('');
    }
  }, [open]);

  // Filter out sub-documents that are already linked to this parent
  const unlinkedSubDocuments = availableSubDocuments.filter(
    subDoc =>
      ['AoA', 'Acquisition Checklist'].includes(subDoc.type) &&
      (!subDoc.parentAPDId || subDoc.parentAPDId !== parentAPD?.id)
  );

  // Validation
  const validateForm = (): boolean => {
    setError('');

    if (!selectedSubDocumentId) {
      setError('Please select a sub-document to link');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleLink = () => {
    if (!parentAPD || !validateForm()) {
      return;
    }

    onLink(parentAPD.id, selectedSubDocumentId);
  };

  // Get document type icon
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'AoA':
        return <AnalyticsIcon color="info" />;
      case 'Acquisition Checklist':
        return <ChecklistIcon color="warning" />;
      default:
        return null;
    }
  };

  if (!parentAPD) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="link-subdocument-dialog-title"
    >
      <DialogTitle
        id="link-subdocument-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkIcon color="primary" />
          <Typography variant="h6" component="span">
            Link Sub-Document
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
          {/* Parent APD Info */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Parent APD
            </Typography>
            <Box
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
                backgroundColor: 'grey.50',
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <Chip label={parentAPD.type} color="primary" size="small" />
                <Typography variant="body1" fontWeight={600}>
                  {parentAPD.projectName}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Current sub-documents: {parentAPD.childDocumentIds?.length || 0}
              </Typography>
            </Box>
          </Box>

          {/* Sub-Document Selection */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Sub-Document to Link
            </Typography>

            {unlinkedSubDocuments.length > 0 ? (
              <FormControl fullWidth>
                <InputLabel>Sub-Document</InputLabel>
                <Select
                  value={selectedSubDocumentId}
                  label="Sub-Document"
                  onChange={e => setSelectedSubDocumentId(e.target.value)}
                >
                  {unlinkedSubDocuments.map(subDoc => (
                    <MenuItem key={subDoc.id} value={subDoc.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          width: '100%',
                        }}
                      >
                        {getDocumentIcon(subDoc.type)}
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">
                            {subDoc.projectName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {subDoc.type} • {subDoc.completionStatus}% complete
                          </Typography>
                        </Box>
                        <Chip
                          label={subDoc.currentVersion}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Alert severity="info">
                <Typography variant="body1" gutterBottom>
                  No available sub-documents to link
                </Typography>
                <Typography variant="body2">
                  All Analysis of Alternatives and Acquisition Checklists in
                  this project are already linked to APDs, or there are no
                  sub-documents available.
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Information */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>About Sub-Documents:</strong>
              <br />• <strong>Analysis of Alternatives (AoA)</strong> documents
              evaluate different solution options
              <br />• <strong>Acquisition Checklists</strong> support
              procurement compliance and CMS review
              <br />• Sub-documents are typically required for specific APD
              phases and help organize related documentation
            </Typography>
          </Alert>

          {/* Error Display */}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleLink}
          variant="contained"
          disabled={loading || unlinkedSubDocuments.length === 0}
          startIcon={<LinkIcon />}
        >
          {loading ? 'Linking...' : 'Link Sub-Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkSubDocumentDialog;

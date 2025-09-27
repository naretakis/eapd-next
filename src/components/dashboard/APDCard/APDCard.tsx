'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Tooltip,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  FileCopy as DuplicateIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  History as HistoryIcon,
  MoreVert as MoreIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompleteIcon,
  Warning as WarningIcon,
  Commit as CommitIcon,
  DriveFileMove as MoveIcon,
} from '@mui/icons-material';
import { APDListItem, APDType } from '@/types/apd';

interface APDCardProps {
  apd: APDListItem;
  onEdit: (apdId: string) => void;
  onView: (apdId: string) => void;
  onDuplicate: (apdId: string) => void;
  onDelete: (apdId: string) => void;
  onExport: (apdId: string) => void;
  onViewHistory: (apdId: string) => void;
  onMoveToProject?: (apdId: string) => void;
  showProjectName?: boolean;
}

/**
 * APD Card Component
 *
 * Displays individual APD information in a card format with action buttons.
 *
 * Features:
 * - APD type, name, and status display
 * - Completion progress indicator
 * - Version information with uncommitted changes indicator
 * - Action buttons for edit, view, duplicate, delete, export, version history
 * - Responsive design optimized for desktop
 * - Accessibility support with proper ARIA labels
 * - Material-UI styling with hover effects
 *
 * Learning Notes:
 * - Uses Material-UI Card components for consistent styling
 * - Implements dropdown menu for secondary actions
 * - Shows completion status with progress bar
 * - Displays version control information
 * - Follows Material Design principles for card layouts
 *
 * @param apd - APD data to display
 * @param onEdit - Callback for edit action
 * @param onView - Callback for view action
 * @param onDuplicate - Callback for duplicate action
 * @param onDelete - Callback for delete action
 * @param onExport - Callback for export action
 * @param onViewHistory - Callback for version history action
 * @param showProjectName - Whether to show project name (for ungrouped view)
 */
export const APDCard: React.FC<APDCardProps> = ({
  apd,
  onEdit,
  onView,
  onDuplicate,
  onDelete,
  onExport,
  onViewHistory,
  onMoveToProject,
  showProjectName = false,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleMenuAction = (action: () => void) => {
    action();
    handleMenuClose();
  };

  // Get APD type color and label
  const getAPDTypeInfo = (type: APDType) => {
    switch (type) {
      case 'PAPD':
        return { color: 'primary' as const, label: 'Planning APD' };
      case 'IAPD':
        return { color: 'secondary' as const, label: 'Implementation APD' };
      case 'OAPD':
        return { color: 'success' as const, label: 'Operational APD' };
      case 'AoA':
        return { color: 'info' as const, label: 'Analysis of Alternatives' };
      case 'Acquisition Checklist':
        return { color: 'warning' as const, label: 'Acquisition Checklist' };
      default:
        return { color: 'default' as const, label: type };
    }
  };

  const typeInfo = getAPDTypeInfo(apd.type);

  // Format last modified date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get completion status info
  const getCompletionInfo = () => {
    if (apd.isComplete) {
      return {
        icon: <CompleteIcon color="success" fontSize="small" />,
        text: 'Complete',
        color: 'success' as const,
      };
    } else if (apd.completionStatus > 50) {
      return {
        icon: <ScheduleIcon color="warning" fontSize="small" />,
        text: 'In Progress',
        color: 'warning' as const,
      };
    } else {
      return {
        icon: <WarningIcon color="error" fontSize="small" />,
        text: 'Not Started',
        color: 'error' as const,
      };
    }
  };

  const completionInfo = getCompletionInfo();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header with APD Type and Actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Chip
            label={typeInfo.label}
            color={typeInfo.color}
            size="small"
            sx={{ fontWeight: 500 }}
          />
          <Tooltip title="More actions">
            <IconButton
              size="small"
              onClick={handleMenuClick}
              aria-label="more actions"
              aria-controls={menuOpen ? 'apd-actions-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? 'true' : undefined}
            >
              <MoreIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* APD Name */}
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 600,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6em',
          }}
        >
          {apd.projectName}
        </Typography>

        {/* Project Name (if shown) */}
        {showProjectName && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontStyle: 'italic' }}
          >
            Project: {apd.projectName}
          </Typography>
        )}

        {/* Completion Status */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {completionInfo.icon}
              <Typography variant="body2" color="text.secondary">
                {completionInfo.text}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {apd.completionStatus}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={apd.completionStatus}
            color={completionInfo.color}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'grey.200',
            }}
          />
        </Box>

        {/* Version Information */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CommitIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {apd.currentVersion}
            </Typography>
            {apd.hasUncommittedChanges && (
              <Chip
                label="Uncommitted"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: '20px' }}
              />
            )}
          </Box>
          <Tooltip title="View version history">
            <IconButton
              size="small"
              onClick={() => onViewHistory(apd.id)}
              aria-label="view version history"
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Last Modified */}
        <Typography variant="caption" color="text.secondary">
          Last modified: {formatDate(apd.lastModified)}
        </Typography>
      </CardContent>

      {/* Primary Actions */}
      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => onEdit(apd.id)}
          variant="contained"
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
        <Button
          size="small"
          startIcon={<ViewIcon />}
          onClick={() => onView(apd.id)}
          variant="outlined"
        >
          View
        </Button>
      </CardActions>

      {/* Actions Menu */}
      <Menu
        id="apd-actions-menu"
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'more-actions-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleMenuAction(() => onDuplicate(apd.id))}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction(() => onExport(apd.id))}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export</ListItemText>
        </MenuItem>
        {onMoveToProject && (
          <MenuItem
            onClick={() => handleMenuAction(() => onMoveToProject(apd.id))}
          >
            <ListItemIcon>
              <MoveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Move to Project</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => handleMenuAction(() => onDelete(apd.id))}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default APDCard;

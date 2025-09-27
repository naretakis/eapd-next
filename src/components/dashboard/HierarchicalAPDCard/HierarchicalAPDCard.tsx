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
  Collapse,
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
  Link as LinkIcon,
  LinkOff as UnlinkIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SubdirectoryArrowRight as SubDocIcon,
} from '@mui/icons-material';
import { APDListItem, APDType } from '@/types/apd';

interface HierarchicalAPDCardProps {
  apd: APDListItem;
  childDocuments?: APDListItem[];
  isChildDocument?: boolean;
  compactMode?: boolean;
  onEdit: (apdId: string) => void;
  onView: (apdId: string) => void;
  onDuplicate: (apdId: string) => void;
  onDelete: (apdId: string) => void;
  onExport: (apdId: string) => void;
  onViewHistory: (apdId: string) => void;
  onMoveToProject?: (apdId: string) => void;
  onLinkSubDocument?: (parentAPDId: string) => void;
  onUnlinkSubDocument?: (parentAPDId: string, childDocumentId: string) => void;
  onLinkToAPD?: (subDocumentId: string) => void; // New prop for linking sub-documents to APDs
  showProjectName?: boolean;
}

/**
 * Hierarchical APD Card Component
 *
 * Displays APD information with support for parent-child relationships.
 * Parent APDs can show their sub-documents (AoA, Acquisition Checklists) in a nested layout.
 *
 * Features:
 * - Hierarchical display of parent APDs and sub-documents
 * - Visual indicators for document relationships
 * - Expandable/collapsible sub-document sections
 * - All standard APD card functionality
 * - Link/unlink sub-document actions
 * - Distinct styling for parent vs child documents
 *
 * @param apd - APD data to display
 * @param childDocuments - Sub-documents related to this APD
 * @param isChildDocument - Whether this card represents a sub-document
 * @param onEdit - Callback for edit action
 * @param onView - Callback for view action
 * @param onDuplicate - Callback for duplicate action
 * @param onDelete - Callback for delete action
 * @param onExport - Callback for export action
 * @param onViewHistory - Callback for version history action
 * @param onMoveToProject - Callback for move to project action
 * @param onLinkSubDocument - Callback for linking sub-documents
 * @param onUnlinkSubDocument - Callback for unlinking sub-documents
 * @param showProjectName - Whether to show project name (for ungrouped view)
 */
export const HierarchicalAPDCard: React.FC<HierarchicalAPDCardProps> = ({
  apd,
  childDocuments = [],
  isChildDocument = false,
  compactMode = false,
  onEdit,
  onView,
  onDuplicate,
  onDelete,
  onExport,
  onViewHistory,
  onMoveToProject,
  onLinkSubDocument,
  onUnlinkSubDocument,
  onLinkToAPD,
  showProjectName = false,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [childMenuAnchorEl, setChildMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [selectedChildDocId, setSelectedChildDocId] = React.useState<
    string | null
  >(null);
  const [childrenExpanded, setChildrenExpanded] = React.useState(true);
  const menuOpen = Boolean(menuAnchorEl);
  const childMenuOpen = Boolean(childMenuAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleChildMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    childDocId: string
  ) => {
    setChildMenuAnchorEl(event.currentTarget);
    setSelectedChildDocId(childDocId);
  };

  const handleChildMenuClose = () => {
    setChildMenuAnchorEl(null);
    setSelectedChildDocId(null);
  };

  const handleChildMenuAction = (action: () => void) => {
    action();
    handleChildMenuClose();
  };

  const handleMenuAction = (action: () => void) => {
    action();
    handleMenuClose();
  };

  // Get APD type color and label
  const getAPDTypeInfo = (type: APDType) => {
    switch (type) {
      case 'PAPD':
        return { color: 'primary' as const, label: 'Planning APD', icon: '📋' };
      case 'IAPD':
        return {
          color: 'secondary' as const,
          label: 'Implementation APD',
          icon: '🔧',
        };
      case 'OAPD':
        return {
          color: 'success' as const,
          label: 'Operational APD',
          icon: '⚙️',
        };
      case 'AoA':
        return {
          color: 'info' as const,
          label: 'Analysis of Alternatives',
          icon: '📊',
        };
      case 'Acquisition Checklist':
        return {
          color: 'warning' as const,
          label: 'Acquisition Checklist',
          icon: '✅',
        };
      default:
        return { color: 'default' as const, label: type, icon: '📄' };
    }
  };

  const typeInfo = getAPDTypeInfo(apd.type);
  const isParentAPD = ['PAPD', 'IAPD', 'OAPD'].includes(apd.type);
  const hasChildren = !isChildDocument && childDocuments.length > 0; // Child documents can't have sub-documents

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
  const getCompletionInfo = (document = apd) => {
    if (document.isComplete) {
      return {
        icon: <CompleteIcon color="success" fontSize="small" />,
        text: 'Complete',
        color: 'success' as const,
      };
    } else if (document.completionStatus > 50) {
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
    <Box>
      {/* Main APD Card */}
      <Card
        sx={{
          height: 'auto',
          minHeight: isChildDocument ? 'auto' : '280px', // Consistent minimum height for main APDs
          minWidth: isChildDocument ? 'auto' : '300px', // Consistent minimum width for main APDs
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: isChildDocument ? 'translateX(4px)' : 'translateY(-2px)',
            boxShadow: 4,
          },
          // Different styling for child documents
          ...(isChildDocument && {
            ml: 3,
            borderLeft: '3px solid',
            borderLeftColor: 'primary.main',
            backgroundColor: 'grey.50',
          }),
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          {/* Header with APD Type and Actions */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isChildDocument && (
                <SubDocIcon fontSize="small" color="action" />
              )}
              <Chip
                label={`${typeInfo.icon} ${typeInfo.label}`}
                color={typeInfo.color}
                size="small"
                sx={{ fontWeight: 500 }}
              />
              {hasChildren && !isChildDocument && (
                <Chip
                  label={`${childDocuments.length} sub-doc${childDocuments.length !== 1 ? 's' : ''}`}
                  size="small"
                  variant="outlined"
                  color="info"
                />
              )}
            </Box>
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
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            Last modified: {formatDate(apd.lastModified)}
          </Typography>
        </CardContent>

        {/* Primary Actions */}
        <CardActions
          sx={{
            pt: 0,
            px: 2,
            pb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '56px', // Ensure consistent height
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => onEdit(apd.id)}
              variant="contained"
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
          </Box>

          {/* Sub-Documents Toggle Button or Spacer */}
          <Box
            sx={{
              minWidth: '120px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            {hasChildren ? (
              <Button
                size="small"
                onClick={() => setChildrenExpanded(!childrenExpanded)}
                startIcon={
                  childrenExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                sx={{
                  textTransform: 'none',
                  minWidth: 'auto',
                  whiteSpace: 'nowrap',
                  fontSize: '0.8rem',
                }}
                variant="outlined"
                color="primary"
              >
                Sub-Docs ({childDocuments.length})
              </Button>
            ) : (
              // Invisible spacer to maintain consistent width
              <Box sx={{ width: '120px' }} />
            )}
          </Box>
        </CardActions>

        {/* Actions Menu */}
        <Menu
          id="apd-actions-menu"
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          slotProps={{
            paper: {
              'aria-labelledby': 'more-actions-button',
            },
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
          {isParentAPD && onLinkSubDocument && (
            <MenuItem
              onClick={() => handleMenuAction(() => onLinkSubDocument(apd.id))}
            >
              <ListItemIcon>
                <LinkIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Link Sub-Document</ListItemText>
            </MenuItem>
          )}
          {!isParentAPD && onLinkToAPD && (
            <MenuItem
              onClick={() => handleMenuAction(() => onLinkToAPD(apd.id))}
            >
              <ListItemIcon>
                <LinkIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Link to APD</ListItemText>
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

        {/* Child Document Actions Menu */}
        <Menu
          id="child-doc-actions-menu"
          anchorEl={childMenuAnchorEl}
          open={childMenuOpen}
          onClose={handleChildMenuClose}
          slotProps={{
            paper: {
              'aria-labelledby': 'child-doc-more-actions-button',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {selectedChildDocId && [
            <MenuItem
              key="duplicate"
              onClick={() =>
                handleChildMenuAction(() => onDuplicate(selectedChildDocId))
              }
            >
              <ListItemIcon>
                <DuplicateIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Duplicate</ListItemText>
            </MenuItem>,
            <MenuItem
              key="export"
              onClick={() =>
                handleChildMenuAction(() => onExport(selectedChildDocId))
              }
            >
              <ListItemIcon>
                <ExportIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export</ListItemText>
            </MenuItem>,
            ...(onMoveToProject
              ? [
                  <MenuItem
                    key="move"
                    onClick={() =>
                      handleChildMenuAction(() =>
                        onMoveToProject(selectedChildDocId)
                      )
                    }
                  >
                    <ListItemIcon>
                      <MoveIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Move to Project</ListItemText>
                  </MenuItem>,
                ]
              : []),
            ...(onLinkToAPD
              ? [
                  <MenuItem
                    key="link"
                    onClick={() =>
                      handleChildMenuAction(() =>
                        onLinkToAPD(selectedChildDocId)
                      )
                    }
                  >
                    <ListItemIcon>
                      <LinkIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Link to APD</ListItemText>
                  </MenuItem>,
                ]
              : []),
            ...(onUnlinkSubDocument
              ? [
                  <MenuItem
                    key="unlink"
                    onClick={() =>
                      handleChildMenuAction(() =>
                        onUnlinkSubDocument(apd.id, selectedChildDocId)
                      )
                    }
                  >
                    <ListItemIcon>
                      <UnlinkIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Unlink from {typeInfo.label}</ListItemText>
                  </MenuItem>,
                ]
              : []),
            <Divider key="divider" />,
            <MenuItem
              key="delete"
              onClick={() =>
                handleChildMenuAction(() => onDelete(selectedChildDocId))
              }
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>,
          ]}
        </Menu>
      </Card>

      {/* Child Documents */}
      {hasChildren && (
        <Collapse in={childrenExpanded}>
          {compactMode ? (
            /* Compact mode: Show child documents as distinct compact cards */
            <Box
              sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              {childDocuments.map(childDoc => {
                const childCompletionInfo = getCompletionInfo(childDoc);
                return (
                  <Card
                    key={childDoc.id}
                    sx={{
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'grey.300',
                      borderLeft: '4px solid',
                      borderLeftColor:
                        getAPDTypeInfo(childDoc.type).color === 'primary'
                          ? 'primary.main'
                          : getAPDTypeInfo(childDoc.type).color === 'secondary'
                            ? 'secondary.main'
                            : getAPDTypeInfo(childDoc.type).color === 'success'
                              ? 'success.main'
                              : getAPDTypeInfo(childDoc.type).color === 'info'
                                ? 'info.main'
                                : getAPDTypeInfo(childDoc.type).color ===
                                    'warning'
                                  ? 'warning.main'
                                  : 'grey.400',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateX(2px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      {/* Header with type and actions */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <SubDocIcon fontSize="small" color="action" />
                          <Chip
                            label={
                              getAPDTypeInfo(childDoc.type).icon +
                              ' ' +
                              getAPDTypeInfo(childDoc.type).label
                            }
                            size="small"
                            color={getAPDTypeInfo(childDoc.type).color}
                            sx={{ fontSize: '0.7rem' }}
                          />
                          {childDoc.hasUncommittedChanges && (
                            <Chip
                              label="Uncommitted"
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ fontSize: '0.65rem', height: '18px' }}
                            />
                          )}
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Tooltip title="Edit sub-document">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(childDoc.id)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="View version history">
                            <IconButton
                              size="small"
                              onClick={() => onViewHistory(childDoc.id)}
                            >
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More actions">
                            <IconButton
                              size="small"
                              onClick={event =>
                                handleChildMenuClick(event, childDoc.id)
                              }
                            >
                              <MoreIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* Document name */}
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}
                      >
                        {childDoc.projectName}
                      </Typography>

                      {/* Completion status with progress bar */}
                      <Box sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            {childCompletionInfo.icon}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {childCompletionInfo.text}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {childDoc.completionStatus}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={childDoc.completionStatus}
                          color={childCompletionInfo.color}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'grey.200',
                          }}
                        />
                      </Box>

                      {/* Version and last modified info */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <CommitIcon
                            fontSize="small"
                            color="action"
                            sx={{ fontSize: '14px' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {childDoc.currentVersion}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(childDoc.lastModified)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          ) : (
            /* Full mode: Show child documents as full cards */
            <Box sx={{ mt: 1, ml: 2 }}>
              {childDocuments.map(childDoc => (
                <Box key={childDoc.id} sx={{ mb: 1 }}>
                  <HierarchicalAPDCard
                    apd={childDoc}
                    isChildDocument={true}
                    compactMode={false}
                    onEdit={onEdit}
                    onView={onView}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onExport={onExport}
                    onViewHistory={onViewHistory}
                    onMoveToProject={onMoveToProject || (() => {})}
                    onUnlinkSubDocument={onUnlinkSubDocument || (() => {})}
                    onLinkToAPD={onLinkToAPD || (() => {})}
                    showProjectName={showProjectName}
                  />
                  {/* Unlink button for child documents */}
                  {onUnlinkSubDocument && (
                    <Box sx={{ ml: 3, mt: 1 }}>
                      <Button
                        size="small"
                        startIcon={<UnlinkIcon />}
                        onClick={() => onUnlinkSubDocument(apd.id, childDoc.id)}
                        color="warning"
                        sx={{ textTransform: 'none' }}
                      >
                        Unlink from {typeInfo.label}
                      </Button>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Collapse>
      )}
    </Box>
  );
};

export default HierarchicalAPDCard;

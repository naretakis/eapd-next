'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Project, APDListItem } from '@/types/apd';
import { HierarchicalAPDCard } from '../HierarchicalAPDCard';

interface ProjectGroupProps {
  project: Project;
  apds: APDListItem[];
  onEditAPD: (apdId: string) => void;
  onViewAPD: (apdId: string) => void;
  onDuplicateAPD: (apdId: string) => void;
  onDeleteAPD: (apdId: string) => void;
  onExportAPD: (apdId: string) => void;
  onViewHistory: (apdId: string) => void;
  onMoveToProject?: (apdId: string) => void;
  onEditProject?: ((projectId: string) => void) | undefined;
  onAddAPDToProject?: ((projectId: string) => void) | undefined;
  onLinkSubDocument?: (parentAPDId: string) => void;
  onUnlinkSubDocument?: (parentAPDId: string, childDocumentId: string) => void;
  onLinkToAPD?: (subDocumentId: string) => void;
  defaultExpanded?: boolean;
}

/**
 * Project Group Component
 *
 * Displays a group of APDs organized by project in an expandable accordion.
 *
 * Features:
 * - Collapsible project sections with APD counts
 * - Project metadata display (name, description)
 * - Grid layout of APD cards within each project
 * - Project management actions (edit project, add APD)
 * - Completion statistics for the project
 * - Responsive design optimized for desktop
 *
 * Learning Notes:
 * - Uses Material-UI Accordion for collapsible sections
 * - Implements responsive grid layout for APD cards
 * - Shows project-level statistics and metadata
 * - Provides project management capabilities
 * - Follows Material Design principles for grouping
 *
 * @param project - Project information
 * @param apds - APDs belonging to this project
 * @param onEditAPD - Callback for editing an APD
 * @param onViewAPD - Callback for viewing an APD
 * @param onDuplicateAPD - Callback for duplicating an APD
 * @param onDeleteAPD - Callback for deleting an APD
 * @param onExportAPD - Callback for exporting an APD
 * @param onViewHistory - Callback for viewing APD version history
 * @param onEditProject - Callback for editing project details
 * @param onAddAPDToProject - Callback for adding new APD to project
 * @param defaultExpanded - Whether the accordion should be expanded by default
 */
export const ProjectGroup: React.FC<ProjectGroupProps> = ({
  project,
  apds,
  onEditAPD,
  onViewAPD,
  onDuplicateAPD,
  onDeleteAPD,
  onExportAPD,
  onViewHistory,
  onMoveToProject,
  onEditProject,
  onAddAPDToProject,
  onLinkSubDocument,
  onUnlinkSubDocument,
  onLinkToAPD,
  defaultExpanded = false,
}) => {
  // State for controlling accordion expansion
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Calculate project statistics
  const totalAPDs = apds.length;
  const completedAPDs = apds.filter(apd => apd.isComplete).length;
  const inProgressAPDs = apds.filter(
    apd => !apd.isComplete && apd.completionStatus > 0
  ).length;
  const notStartedAPDs = totalAPDs - completedAPDs - inProgressAPDs;

  // Calculate average completion
  const averageCompletion =
    totalAPDs > 0
      ? Math.round(
          apds.reduce((sum, apd) => sum + apd.completionStatus, 0) / totalAPDs
        )
      : 0;

  // Get APD type counts
  const apdTypeCounts = apds.reduce(
    (counts, apd) => {
      counts[apd.type] = (counts[apd.type] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>
  );

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Helper function to organize APDs hierarchically
  const organizeAPDsHierarchically = (
    apdList: APDListItem[]
  ): APDListItem[] => {
    const organized: APDListItem[] = [];
    const processed = new Set<string>();

    // Define APD type order
    const apdTypeOrder = { PAPD: 1, IAPD: 2, OAPD: 3 };

    // First, add all parent APDs (PAPD, IAPD, OAPD) with their children, sorted by type
    apdList
      .filter(apd => ['PAPD', 'IAPD', 'OAPD'].includes(apd.type))
      .sort(
        (a, b) =>
          (apdTypeOrder[a.type as keyof typeof apdTypeOrder] || 999) -
          (apdTypeOrder[b.type as keyof typeof apdTypeOrder] || 999)
      )
      .forEach(parentAPD => {
        if (processed.has(parentAPD.id)) return;

        organized.push(parentAPD);
        processed.add(parentAPD.id);

        // Add child documents immediately after their parent
        if (
          parentAPD.childDocumentIds &&
          parentAPD.childDocumentIds.length > 0
        ) {
          parentAPD.childDocumentIds.forEach(childId => {
            const childDoc = apdList.find(apd => apd.id === childId);
            if (childDoc && !processed.has(childDoc.id)) {
              organized.push(childDoc);
              processed.add(childDoc.id);
            }
          });
        }
      });

    // Then add any remaining sub-documents that don't have parents
    apdList
      .filter(apd => ['AoA', 'Acquisition Checklist'].includes(apd.type))
      .forEach(subDoc => {
        if (!processed.has(subDoc.id)) {
          organized.push(subDoc);
          processed.add(subDoc.id);
        }
      });

    return organized;
  };

  return (
    <Box
      sx={{
        mb: 2,
        boxShadow: 2,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Project Header with Actions */}
      <Box
        sx={{
          backgroundColor: 'grey.50',
          borderRadius: expanded ? '8px 8px 0 0' : '8px',
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Project Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={totalAPDs} color="primary">
              <FolderIcon color="primary" />
            </Badge>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {project.name}
              </Typography>
              {project.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {project.description}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Project Statistics and Actions */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {/* APD Type Counts */}
            {Object.entries(apdTypeCounts).map(([type, count]) => (
              <Chip
                key={type}
                label={`${type}: ${count}`}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}

            {/* Completion Stats */}
            <Chip
              label={`${averageCompletion}% avg`}
              size="small"
              color={averageCompletion >= 80 ? 'success' : 'warning'}
            />

            {/* Project Actions */}
            {onEditProject && (
              <Tooltip title="Edit project">
                <IconButton
                  size="small"
                  onClick={() => onEditProject(project.id)}
                  aria-label="edit project"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onAddAPDToProject && (
              <Tooltip title="Add Document to Project">
                <IconButton
                  size="small"
                  onClick={() => onAddAPDToProject(project.id)}
                  aria-label="add document to project"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>

      {/* Expand/Collapse Button */}
      <Box
        sx={{
          backgroundColor: 'grey.100',
          borderTop: '1px solid',
          borderColor: 'grey.300',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'grey.200',
          },
        }}
        onClick={handleToggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleExpanded();
          }
        }}
        aria-expanded={expanded}
        aria-controls={`project-${project.id}-content`}
        id={`project-${project.id}-header`}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          {expanded ? 'Click to collapse' : 'Click to expand'} • {totalAPDs}{' '}
          Documents
        </Typography>
        <ExpandMoreIcon
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease-in-out',
          }}
        />
      </Box>

      {/* Collapsible Content */}
      <Box
        id={`project-${project.id}-content`}
        sx={{
          display: expanded ? 'block' : 'none',
          backgroundColor: 'background.paper',
          p: 3,
        }}
      >
        {/* Detailed Statistics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Project Status: {completedAPDs} completed, {inProgressAPDs} in
            progress, {notStartedAPDs} not started
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Created:{' '}
            {new Intl.DateTimeFormat('en-US').format(project.createdAt)}
            {project.updatedAt.getTime() !== project.createdAt.getTime() && (
              <>
                {' '}
                • Updated:{' '}
                {new Intl.DateTimeFormat('en-US').format(project.updatedAt)}
              </>
            )}
          </Typography>
        </Box>

        {/* Compact Hierarchical APD Cards */}
        {apds.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {organizeAPDsHierarchically(apds).map(apd => {
              // Only render parent APDs here, children will be rendered by HierarchicalAPDCard
              if (apd.parentAPDId) return null;

              const childDocuments = apds.filter(
                child => child.parentAPDId === apd.id
              );

              return (
                <HierarchicalAPDCard
                  key={apd.id}
                  apd={apd}
                  childDocuments={childDocuments}
                  onEdit={onEditAPD}
                  onView={onViewAPD}
                  onDuplicate={onDuplicateAPD}
                  onDelete={onDeleteAPD}
                  onExport={onExportAPD}
                  onViewHistory={onViewHistory}
                  onMoveToProject={onMoveToProject || (() => {})}
                  onLinkSubDocument={onLinkSubDocument || (() => {})}
                  onUnlinkSubDocument={onUnlinkSubDocument || (() => {})}
                  onLinkToAPD={onLinkToAPD || (() => {})}
                  showProjectName={false} // Don't show project name within project group
                  compactMode={true} // NEW: Enable compact mode
                />
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body1" gutterBottom>
              No APDs in this project yet
            </Typography>
            <Typography variant="body2">
              {onAddAPDToProject
                ? 'Click the + button above to add an APD to this project.'
                : 'Create a new APD and assign it to this project.'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProjectGroup;

'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Folder as ProjectIcon,
  Description as APDIcon,
} from '@mui/icons-material';
import { APDListItem, APDType, Project } from '@/types/apd';

import { HierarchicalAPDCard } from '../HierarchicalAPDCard';
import { ProjectGroup } from '../ProjectGroup';

interface APDListProps {
  apds: APDListItem[];
  projects: Array<{
    project: Project;
    apds: APDListItem[];
  }>;
  ungroupedAPDs: APDListItem[];
  loading?: boolean;
  onEditAPD: (apdId: string) => void;
  onViewAPD: (apdId: string) => void;
  onDuplicateAPD: (apdId: string) => void;
  onDeleteAPD: (apdId: string) => void;
  onExportAPD: (apdId: string) => void;
  onViewHistory: (apdId: string) => void;
  onMoveToProject?: (apdId: string) => void;
  onEditProject?: (projectId: string) => void;
  onAddAPDToProject?: (projectId: string) => void;
  onLinkSubDocument?: (parentAPDId: string) => void;
  onUnlinkSubDocument?: (parentAPDId: string, childDocumentId: string) => void;
  onLinkToAPD?: (subDocumentId: string) => void;
}

type ViewMode = 'grouped' | 'list';
type SortBy = 'name' | 'date' | 'status' | 'type' | 'version';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'complete' | 'incomplete';

/**
 * APD List Component
 *
 * Main component for displaying and managing APDs with filtering, sorting, and grouping.
 *
 * Features:
 * - Project grouping with expandable sections
 * - Search and filtering capabilities
 * - Multiple view modes (grouped by project, flat list)
 * - Sorting by various criteria
 * - Version information display
 * - Responsive grid layout
 * - Empty states and loading handling
 *
 * Learning Notes:
 * - Uses React hooks for state management (useState, useMemo)
 * - Implements complex filtering and sorting logic
 * - Provides multiple view modes for different user preferences
 * - Handles both grouped and ungrouped APD display
 * - Follows Material Design patterns for data display
 *
 * @param apds - All APDs for statistics and filtering
 * @param projects - Projects with their associated APDs
 * @param ungroupedAPDs - APDs not assigned to any project
 * @param loading - Whether data is being loaded
 * @param onEditAPD - Callback for editing an APD
 * @param onViewAPD - Callback for viewing an APD
 * @param onDuplicateAPD - Callback for duplicating an APD
 * @param onDeleteAPD - Callback for deleting an APD
 * @param onExportAPD - Callback for exporting an APD
 * @param onViewHistory - Callback for viewing version history
 * @param onEditProject - Callback for editing project details
 * @param onAddAPDToProject - Callback for adding APD to project
 */
export const APDList: React.FC<APDListProps> = ({
  apds,
  projects,
  ungroupedAPDs,
  loading = false,
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
}) => {
  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<APDType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');

  // Filter and sort APDs
  const filteredAndSortedAPDs = useMemo(() => {
    let filtered = [...apds];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        apd =>
          apd.projectName.toLowerCase().includes(query) ||
          apd.type.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(apd => apd.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apd =>
        filterStatus === 'complete' ? apd.isComplete : !apd.isComplete
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.projectName.localeCompare(b.projectName);
          break;
        case 'date':
          comparison = a.lastModified.getTime() - b.lastModified.getTime();
          break;
        case 'status':
          comparison = a.completionStatus - b.completionStatus;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'version':
          comparison = a.currentVersion.localeCompare(b.currentVersion);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [apds, searchQuery, filterType, filterStatus, sortBy, sortDirection]);

  // Filter projects and ungrouped APDs based on current filters
  const filteredProjects = useMemo(() => {
    return projects
      .map(({ project, apds: projectAPDs }) => ({
        project,
        apds: projectAPDs.filter(apd =>
          filteredAndSortedAPDs.some(filtered => filtered.id === apd.id)
        ),
      }))
      .filter(({ apds: projectAPDs }) => projectAPDs.length > 0);
  }, [projects, filteredAndSortedAPDs]);

  const filteredUngroupedAPDs = useMemo(() => {
    return ungroupedAPDs.filter(apd =>
      filteredAndSortedAPDs.some(filtered => filtered.id === apd.id)
    );
  }, [ungroupedAPDs, filteredAndSortedAPDs]);

  // Statistics
  const totalAPDs = apds.length;
  const completedAPDs = apds.filter(apd => apd.isComplete).length;
  const totalProjects = projects.length;

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading APDs...</Typography>
      </Box>
    );
  }

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
    <Box>
      {/* Header with Statistics */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              APDs
            </Typography>
            <Chip
              label={`${totalAPDs} total`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${completedAPDs} completed`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`${totalProjects} projects`}
              color="info"
              variant="outlined"
            />
          </Box>

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
            aria-label="view mode"
          >
            <ToggleButton value="grouped" aria-label="grouped view">
              <ProjectIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <APDIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Filters and Search */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '2fr 1fr 1fr 1fr 1fr',
            },
            gap: 2,
            mb: 2,
          }}
        >
          {/* Search */}
          <TextField
            placeholder="Search APDs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Type Filter */}
          <FormControl size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              label="Type"
              onChange={e => setFilterType(e.target.value as APDType | 'all')}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="PAPD">PAPD</MenuItem>
              <MenuItem value="IAPD">IAPD</MenuItem>
              <MenuItem value="OAPD">OAPD</MenuItem>
              <MenuItem value="AoA">AoA</MenuItem>
              <MenuItem value="Acquisition Checklist">
                Acquisition Checklist
              </MenuItem>
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={e => setFilterStatus(e.target.value as FilterStatus)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="complete">Complete</MenuItem>
              <MenuItem value="incomplete">Incomplete</MenuItem>
            </Select>
          </FormControl>

          {/* Sort By */}
          <FormControl size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={e => setSortBy(e.target.value as SortBy)}
            >
              <MenuItem value="date">Date Modified</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="status">Completion</MenuItem>
              <MenuItem value="type">Type</MenuItem>
              <MenuItem value="version">Version</MenuItem>
            </Select>
          </FormControl>

          {/* Sort Direction */}
          <FormControl size="small">
            <InputLabel>Order</InputLabel>
            <Select
              value={sortDirection}
              label="Order"
              onChange={e => setSortDirection(e.target.value as SortDirection)}
            >
              <MenuItem value="desc">Descending</MenuItem>
              <MenuItem value="asc">Ascending</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Active Filters Display */}
        {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Active filters:
            </Typography>
            {searchQuery && (
              <Chip
                label={`Search: "${searchQuery}"`}
                size="small"
                onDelete={() => setSearchQuery('')}
              />
            )}
            {filterType !== 'all' && (
              <Chip
                label={`Type: ${filterType}`}
                size="small"
                onDelete={() => setFilterType('all')}
              />
            )}
            {filterStatus !== 'all' && (
              <Chip
                label={`Status: ${filterStatus}`}
                size="small"
                onDelete={() => setFilterStatus('all')}
              />
            )}
            <Button
              size="small"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterStatus('all');
              }}
            >
              Clear All
            </Button>
          </Box>
        )}
      </Box>

      {/* Content */}
      {filteredAndSortedAPDs.length === 0 ? (
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            No APDs found
          </Typography>
          <Typography>
            {apds.length === 0
              ? 'You haven\'t created any documents yet. Click "Create New Document" to get started.'
              : 'No APDs match your current filters. Try adjusting your search criteria.'}
          </Typography>
        </Alert>
      ) : (
        <Box>
          {viewMode === 'grouped' ? (
            /* Grouped View */
            <Box>
              {/* Projects */}
              {filteredProjects.map(({ project, apds: projectAPDs }) => (
                <ProjectGroup
                  key={project.id}
                  project={project}
                  apds={projectAPDs}
                  onEditAPD={onEditAPD}
                  onViewAPD={onViewAPD}
                  onDuplicateAPD={onDuplicateAPD}
                  onDeleteAPD={onDeleteAPD}
                  onExportAPD={onExportAPD}
                  onViewHistory={onViewHistory}
                  onMoveToProject={onMoveToProject || (() => {})}
                  onEditProject={onEditProject}
                  onAddAPDToProject={onAddAPDToProject}
                  onLinkSubDocument={onLinkSubDocument || (() => {})}
                  onUnlinkSubDocument={onUnlinkSubDocument || (() => {})}
                  defaultExpanded={filteredProjects.length <= 3}
                />
              ))}

              {/* Ungrouped APDs */}
              {filteredUngroupedAPDs.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <APDIcon />
                    Ungrouped APDs ({filteredUngroupedAPDs.length})
                  </Typography>
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
                    {organizeAPDsHierarchically(filteredUngroupedAPDs).map(
                      apd => {
                        // Only render parent APDs here, children will be rendered by HierarchicalAPDCard
                        if (apd.parentAPDId) return null;

                        const childDocuments = filteredUngroupedAPDs.filter(
                          child => child.parentAPDId === apd.id
                        );

                        return (
                          <HierarchicalAPDCard
                            key={apd.id}
                            apd={apd}
                            childDocuments={childDocuments}
                            compactMode={true}
                            onEdit={onEditAPD}
                            onView={onViewAPD}
                            onDuplicate={onDuplicateAPD}
                            onDelete={onDeleteAPD}
                            onExport={onExportAPD}
                            onViewHistory={onViewHistory}
                            onMoveToProject={onMoveToProject || (() => {})}
                            onLinkSubDocument={onLinkSubDocument || (() => {})}
                            onUnlinkSubDocument={
                              onUnlinkSubDocument || (() => {})
                            }
                            onLinkToAPD={onLinkToAPD || (() => {})}
                            showProjectName={true}
                          />
                        );
                      }
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            /* List View */
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
              {organizeAPDsHierarchically(filteredAndSortedAPDs).map(apd => {
                // Only render parent APDs here, children will be rendered by HierarchicalAPDCard
                if (apd.parentAPDId) return null;

                const childDocuments = filteredAndSortedAPDs.filter(
                  child => child.parentAPDId === apd.id
                );

                return (
                  <HierarchicalAPDCard
                    key={apd.id}
                    apd={apd}
                    childDocuments={childDocuments}
                    compactMode={true}
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
                    showProjectName={true}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default APDList;

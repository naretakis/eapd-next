'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Fab, Alert, AlertTitle } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DashboardLayout } from '../DashboardLayout';
import { APDList } from '../APDList';
import { CreateAPDDialog, CreateAPDData } from '../CreateAPDDialog';
import { MoveToProjectDialog } from '../MoveToProjectDialog';
import { LinkSubDocumentDialog } from '../LinkSubDocumentDialog';
import { apdService } from '@/services/apdService';
import { storageService } from '@/services/database';
import { APDListItem, Project } from '@/types/apd';

/**
 * Main Dashboard Component
 *
 * Central dashboard for APD management with integrated components.
 *
 * Features:
 * - APD list display with project grouping
 * - Create new APD functionality
 * - APD management actions (edit, view, duplicate, delete, export)
 * - Version history access
 * - Project management
 * - Loading states and error handling
 *
 * Learning Notes:
 * - Integrates all dashboard components
 * - Manages state for APDs and projects
 * - Handles APD lifecycle operations
 * - Provides error handling and loading states
 * - Uses service layer for data operations
 *
 * @returns Dashboard component
 */
export const Dashboard: React.FC = () => {
  // State management
  const [apds, setAPDs] = useState<APDListItem[]>([]);
  const [projects, setProjects] = useState<
    Array<{
      project: Project;
      apds: APDListItem[];
    }>
  >([]);
  const [ungroupedAPDs, setUngroupedAPDs] = useState<APDListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveDocumentId, setMoveDocumentId] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkParentAPD, setLinkParentAPD] = useState<APDListItem | null>(null);
  const [linking, setLinking] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize storage service if needed
      await storageService.initialize();

      // Load APDs and projects
      const [apdList, projectGroups] = await Promise.all([
        apdService.getAllAPDs(),
        apdService.getAPDsByProject(),
      ]);

      setAPDs(apdList);
      setProjects(projectGroups.projects);
      setUngroupedAPDs(projectGroups.ungrouped);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(
        'Failed to load dashboard data. Please try refreshing the page.'
      );
    } finally {
      setLoading(false);
    }
  };

  // APD Actions
  const handleCreateAPD = async (data: CreateAPDData) => {
    try {
      setCreating(true);

      // Create project if needed
      let projectId = data.projectId;
      if (!projectId && data.projectName) {
        const project = await apdService.createProject(data.projectName);
        projectId = project.id;
      }

      // Create APD
      const apd = await apdService.createAPD(
        data.type,
        {
          stateName: data.stateName,
          stateAgency: data.stateAgency,
          primaryContact: {
            name: data.primaryContactName,
            title: '',
            email: data.primaryContactEmail,
            phone: '',
          },
          projectName: data.projectName,
          benefitsMultiplePrograms: data.benefitsMultiplePrograms,
        },
        projectId ? { projectId } : {}
      );

      // Link to parent APD if this is a sub-document
      if (
        data.parentAPDId &&
        ['AoA', 'Acquisition Checklist'].includes(data.type)
      ) {
        await apdService.linkSubDocument(data.parentAPDId, apd.id);
      }

      // Close dialog and refresh data
      setCreateDialogOpen(false);
      setSelectedProjectId(null);
      await loadDashboardData();

      // Navigate to APD editor (TODO: implement navigation)
      console.log('Navigate to APD editor:', apd.id);
    } catch (err) {
      console.error('Failed to create APD:', err);
      setError('Failed to create APD. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleEditAPD = (apdId: string) => {
    // TODO: Navigate to APD editor
    console.log('Edit APD:', apdId);
  };

  const handleViewAPD = (apdId: string) => {
    // TODO: Navigate to APD viewer
    console.log('View APD:', apdId);
  };

  const handleDuplicateAPD = async (apdId: string) => {
    try {
      await apdService.duplicateAPD(apdId);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to duplicate APD:', err);
      setError('Failed to duplicate APD. Please try again.');
    }
  };

  const handleDeleteAPD = async (apdId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this APD? This action cannot be undone.'
      )
    ) {
      try {
        await apdService.deleteAPD(apdId);
        await loadDashboardData();
      } catch (err) {
        console.error('Failed to delete APD:', err);
        setError('Failed to delete APD. Please try again.');
      }
    }
  };

  const handleExportAPD = (apdId: string) => {
    // TODO: Implement export functionality
    console.log('Export APD:', apdId);
  };

  const handleViewHistory = (apdId: string) => {
    // TODO: Implement version history viewer
    console.log('View history for APD:', apdId);
  };

  const handleEditProject = (projectId: string) => {
    const project = projects.find(p => p.project.id === projectId)?.project;
    if (project) {
      const newName = window.prompt('Enter new project name:', project.name);
      if (newName && newName.trim() && newName !== project.name) {
        updateProjectName(projectId, newName.trim());
      }
    }
  };

  const updateProjectName = async (projectId: string, newName: string) => {
    try {
      await apdService.updateProject(projectId, { name: newName });
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to update project name:', err);
      setError('Failed to update project name. Please try again.');
    }
  };

  const handleAddAPDToProject = (projectId: string) => {
    // Set the project for the create dialog and open it
    setSelectedProjectId(projectId);
    setCreateDialogOpen(true);
  };

  const handleMoveToProject = (apdId: string) => {
    setMoveDocumentId(apdId);
    setMoveDialogOpen(true);
  };

  const handleMoveConfirm = async (
    targetProjectId: string | null,
    newProjectName?: string
  ) => {
    if (!moveDocumentId) return;

    try {
      setMoving(true);

      // Remove from current project if it has one
      const currentProject = projects.find(p =>
        p.apds.some(apd => apd.id === moveDocumentId)
      );

      if (currentProject) {
        await apdService.removeAPDFromProject(
          moveDocumentId,
          currentProject.project.id
        );
      }

      // Handle different move scenarios
      if (newProjectName) {
        // Create new project and add document to it
        const newProject = await apdService.createProject(newProjectName);
        await apdService.addAPDToProject(moveDocumentId, newProject.id);
      } else if (targetProjectId) {
        // Add to existing project
        await apdService.addAPDToProject(moveDocumentId, targetProjectId);
      }
      // If neither targetProjectId nor newProjectName, document becomes ungrouped

      // Close dialog and refresh data
      setMoveDialogOpen(false);
      setMoveDocumentId(null);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to move APD to project:', err);
      setError('Failed to move APD to project. Please try again.');
    } finally {
      setMoving(false);
    }
  };

  const handleLinkSubDocument = (parentAPDId: string) => {
    const parentAPD = apds.find(apd => apd.id === parentAPDId);
    if (parentAPD) {
      setLinkParentAPD(parentAPD);
      setLinkDialogOpen(true);
    }
  };

  const handleLinkConfirm = async (
    parentAPDId: string,
    childDocumentId: string
  ) => {
    try {
      setLinking(true);
      await apdService.linkSubDocument(parentAPDId, childDocumentId);

      // Close dialog and refresh data
      setLinkDialogOpen(false);
      setLinkParentAPD(null);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to link sub-document:', err);
      setError('Failed to link sub-document. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkSubDocument = async (
    parentAPDId: string,
    childDocumentId: string
  ) => {
    if (
      window.confirm(
        'Are you sure you want to unlink this sub-document? It will become a standalone document.'
      )
    ) {
      try {
        await apdService.unlinkSubDocument(parentAPDId, childDocumentId);
        await loadDashboardData();
      } catch (err) {
        console.error('Failed to unlink sub-document:', err);
        setError('Failed to unlink sub-document. Please try again.');
      }
    }
  };

  return (
    <DashboardLayout
      title="APD Management Dashboard"
      subtitle="Create, manage, and export APDs for state Medicaid agencies"
      loading={loading}
      error={error || undefined}
    >
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {/* Quick Actions */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ mr: 2 }}
            >
              Create New Document
            </Button>
          </Box>

          {/* APD List */}
          <APDList
            apds={apds}
            projects={projects}
            ungroupedAPDs={ungroupedAPDs}
            onEditAPD={handleEditAPD}
            onViewAPD={handleViewAPD}
            onDuplicateAPD={handleDuplicateAPD}
            onDeleteAPD={handleDeleteAPD}
            onExportAPD={handleExportAPD}
            onViewHistory={handleViewHistory}
            onMoveToProject={handleMoveToProject}
            onEditProject={handleEditProject}
            onAddAPDToProject={handleAddAPDToProject}
            onLinkSubDocument={handleLinkSubDocument}
            onUnlinkSubDocument={handleUnlinkSubDocument}
          />

          {/* Floating Action Button for Mobile */}
          <Fab
            color="primary"
            aria-label="create new document"
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              display: { xs: 'flex', sm: 'none' },
            }}
          >
            <AddIcon />
          </Fab>
        </>
      )}

      {/* Create APD Dialog */}
      <CreateAPDDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setSelectedProjectId(null);
        }}
        onCreate={handleCreateAPD}
        projects={projects.map(p => p.project)}
        availableAPDs={apds}
        loading={creating}
        preselectedProjectId={selectedProjectId}
      />

      {/* Move to Project Dialog */}
      {moveDocumentId && (
        <MoveToProjectDialog
          open={moveDialogOpen}
          onClose={() => {
            setMoveDialogOpen(false);
            setMoveDocumentId(null);
          }}
          onMove={handleMoveConfirm}
          documentName={
            apds.find(apd => apd.id === moveDocumentId)?.projectName ||
            'Unknown Document'
          }
          currentProjectName={
            projects.find(p => p.apds.some(apd => apd.id === moveDocumentId))
              ?.project.name || 'Ungrouped'
          }
          availableProjects={projects.map(p => p.project)}
          loading={moving}
        />
      )}

      {/* Link Sub-Document Dialog */}
      {linkParentAPD && (
        <LinkSubDocumentDialog
          open={linkDialogOpen}
          onClose={() => {
            setLinkDialogOpen(false);
            setLinkParentAPD(null);
          }}
          onLink={handleLinkConfirm}
          parentAPD={linkParentAPD}
          availableSubDocuments={apds.filter(
            apd =>
              ['AoA', 'Acquisition Checklist'].includes(apd.type) &&
              apd.projectName === linkParentAPD.projectName // Same project
          )}
          loading={linking}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;

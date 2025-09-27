import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Dashboard } from './Dashboard';
import { apdService } from '@/services/apdService';
import { storageService } from '@/services/database';
import theme from '@/theme/theme';
import { APDListItem, Project } from '@/types/apd';

// Mock the services
jest.mock('@/services/apdService');
jest.mock('@/services/database');

// Mock the child components
jest.mock('../DashboardLayout', () => ({
  DashboardLayout: ({
    children,
    title,
    subtitle,
    loading,
    error,
  }: {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    loading?: boolean;
    error?: string;
  }) => (
    <div data-testid="dashboard-layout">
      <div data-testid="dashboard-title">{title}</div>
      <div data-testid="dashboard-subtitle">{subtitle}</div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      {children}
    </div>
  ),
}));

jest.mock('../APDList', () => ({
  APDList: ({
    apds,
    projects,
    ungroupedAPDs,
    onEditAPD,
    onViewAPD,
    onDuplicateAPD,
    onDeleteAPD,
  }: {
    apds: unknown[];
    projects: unknown[];
    ungroupedAPDs: unknown[];
    onEditAPD: (id: string) => void;
    onViewAPD: (id: string) => void;
    onDuplicateAPD: (id: string) => void;
    onDeleteAPD: (id: string) => void;
  }) => (
    <div data-testid="apd-list">
      <div data-testid="apd-count">{apds.length}</div>
      <div data-testid="project-count">{projects.length}</div>
      <div data-testid="ungrouped-count">{ungroupedAPDs.length}</div>
      {apds.map((apd: APDListItem) => (
        <div key={apd.id} data-testid={`apd-${apd.id}`}>
          <button onClick={() => onEditAPD(apd.id)}>Edit {apd.id}</button>
          <button onClick={() => onViewAPD(apd.id)}>View {apd.id}</button>
          <button onClick={() => onDuplicateAPD(apd.id)}>
            Duplicate {apd.id}
          </button>
          <button onClick={() => onDeleteAPD(apd.id)}>Delete {apd.id}</button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../CreateAPDDialog', () => ({
  CreateAPDDialog: ({
    open,
    onClose,
    onCreate,
    projects,
    loading,
  }: {
    open: boolean;
    onClose: () => void;
    onCreate: (data: unknown) => void;
    projects: unknown[];
    loading: boolean;
  }) => (
    <div
      data-testid="create-apd-dialog"
      style={{ display: open ? 'block' : 'none' }}
    >
      <button onClick={onClose}>Close</button>
      <button
        onClick={() =>
          onCreate({
            type: 'PAPD',
            projectName: 'Test Project',
            stateName: 'Test State',
            stateAgency: 'Test Agency',
            primaryContactName: 'Test Contact',
            primaryContactEmail: 'test@example.com',
            benefitsMultiplePrograms: false,
          })
        }
        disabled={loading}
      >
        Create APD
      </button>
      <div data-testid="dialog-projects-count">{projects.length}</div>
    </div>
  ),
}));

const mockApdService = apdService as jest.Mocked<typeof apdService>;
const mockStorageService = storageService as jest.Mocked<typeof storageService>;

// Test data
const mockAPDs: APDListItem[] = [
  {
    id: 'apd-1',
    type: 'PAPD',
    projectName: 'Test APD 1',
    isComplete: false,
    completionStatus: 25,
    currentVersion: 'v1.0',
    hasUncommittedChanges: false,
    lastModified: new Date('2023-01-01'),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 'apd-2',
    type: 'IAPD',
    projectName: 'Test APD 2',
    isComplete: true,
    completionStatus: 100,
    currentVersion: 'v2.0',
    hasUncommittedChanges: true,
    lastModified: new Date('2023-01-02'),
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
];

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Test Project 1',
    description: 'Test project description',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
];

const mockProjectGroups = {
  projects: [
    {
      project: mockProjects[0],
      apds: [mockAPDs[0]],
    },
  ],
  ungrouped: [mockAPDs[1]],
};

// Helper function to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockStorageService.initialize.mockResolvedValue(undefined);
    mockApdService.getAllAPDs.mockResolvedValue(mockAPDs);
    mockApdService.getAPDsByProject.mockResolvedValue(mockProjectGroups);

    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard with correct title and subtitle', async () => {
      renderWithTheme(<Dashboard />);

      expect(screen.getByTestId('dashboard-title')).toHaveTextContent(
        'APD Management Dashboard'
      );
      expect(screen.getByTestId('dashboard-subtitle')).toHaveTextContent(
        'Create, manage, and export APDs for state Medicaid agencies'
      );
    });

    it('should show loading state initially', () => {
      renderWithTheme(<Dashboard />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should render main content after loading', async () => {
      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Create New Document')).toBeInTheDocument();
      expect(screen.getByTestId('apd-list')).toBeInTheDocument();
    });

    it('should render floating action button for mobile', async () => {
      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      const fab = screen.getByLabelText('create new document');
      expect(fab).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should load dashboard data on mount', async () => {
      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(mockStorageService.initialize).toHaveBeenCalled();
        expect(mockApdService.getAllAPDs).toHaveBeenCalled();
        expect(mockApdService.getAPDsByProject).toHaveBeenCalled();
      });
    });

    it('should display loaded APDs and projects', async () => {
      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('apd-count')).toHaveTextContent('2');
        expect(screen.getByTestId('project-count')).toHaveTextContent('1');
        expect(screen.getByTestId('ungrouped-count')).toHaveTextContent('1');
      });
    });

    it('should handle loading errors gracefully', async () => {
      const errorMessage = 'Failed to load data';
      mockApdService.getAllAPDs.mockRejectedValue(new Error(errorMessage));

      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Failed to load dashboard data. Please try refreshing the page.'
        );
      });
    });
  });

  describe('Create APD Dialog', () => {
    it('should open create dialog when button is clicked', async () => {
      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      const createButton = screen.getByText('Create New Document');
      fireEvent.click(createButton);

      expect(screen.getByTestId('create-apd-dialog')).toBeVisible();
    });

    it('should open create dialog when FAB is clicked', async () => {
      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      const fab = screen.getByLabelText('create new document');
      fireEvent.click(fab);

      expect(screen.getByTestId('create-apd-dialog')).toBeVisible();
    });

    it('should close create dialog', async () => {
      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Open dialog
      const createButton = screen.getByText('Create New Document');
      fireEvent.click(createButton);

      // Close dialog
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(screen.getByTestId('create-apd-dialog')).not.toBeVisible();
    });

    it('should pass projects to create dialog', async () => {
      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      const createButton = screen.getByText('Create New Document');
      fireEvent.click(createButton);

      expect(screen.getByTestId('dialog-projects-count')).toHaveTextContent(
        '1'
      );
    });
  });

  describe('APD Creation', () => {
    it('should create APD with new project', async () => {
      const mockCreatedAPD = { id: 'new-apd', ...mockAPDs[0] };
      const mockCreatedProject = { id: 'new-project', ...mockProjects[0] };

      mockApdService.createProject.mockResolvedValue(mockCreatedProject);
      mockApdService.createAPD.mockResolvedValue(mockCreatedAPD);

      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Open dialog and create APD
      const createButton = screen.getByText('Create New Document');
      fireEvent.click(createButton);

      const createAPDButton = screen.getByText('Create APD');
      fireEvent.click(createAPDButton);

      await waitFor(() => {
        expect(mockApdService.createProject).toHaveBeenCalledWith(
          'Test Project'
        );
        expect(mockApdService.createAPD).toHaveBeenCalledWith(
          'PAPD',
          {
            stateName: 'Test State',
            stateAgency: 'Test Agency',
            primaryContact: {
              name: 'Test Contact',
              title: '',
              email: 'test@example.com',
              phone: '',
            },
            projectName: 'Test Project',
            benefitsMultiplePrograms: false,
          },
          { projectId: 'new-project' }
        );
      });
    });

    it('should handle APD creation errors', async () => {
      mockApdService.createProject.mockRejectedValue(
        new Error('Creation failed')
      );

      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Open dialog and create APD
      const createButton = screen.getByText('Create New Document');
      fireEvent.click(createButton);

      const createAPDButton = screen.getByText('Create APD');
      fireEvent.click(createAPDButton);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Failed to create APD. Please try again.'
        );
      });
    });
  });

  describe('APD Actions', () => {
    beforeEach(async () => {
      renderWithTheme(<Dashboard />);
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('should handle edit APD action', () => {
      const editButton = screen.getByText('Edit apd-1');
      fireEvent.click(editButton);

      expect(console.log).toHaveBeenCalledWith('Edit APD:', 'apd-1');
    });

    it('should handle view APD action', () => {
      const viewButton = screen.getByText('View apd-1');
      fireEvent.click(viewButton);

      expect(console.log).toHaveBeenCalledWith('View APD:', 'apd-1');
    });

    it('should handle duplicate APD action', async () => {
      mockApdService.duplicateAPD.mockResolvedValue(mockAPDs[0]);

      const duplicateButton = screen.getByText('Duplicate apd-1');
      fireEvent.click(duplicateButton);

      await waitFor(() => {
        expect(mockApdService.duplicateAPD).toHaveBeenCalledWith('apd-1');
      });
    });

    it('should handle duplicate APD errors', async () => {
      mockApdService.duplicateAPD.mockRejectedValue(
        new Error('Duplicate failed')
      );

      const duplicateButton = screen.getByText('Duplicate apd-1');
      fireEvent.click(duplicateButton);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Failed to duplicate APD. Please try again.'
        );
      });
    });

    it('should handle delete APD action with confirmation', async () => {
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      mockApdService.deleteAPD.mockResolvedValue(undefined);

      const deleteButton = screen.getByText('Delete apd-1');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete this APD? This action cannot be undone.'
        );
        expect(mockApdService.deleteAPD).toHaveBeenCalledWith('apd-1');
      });

      // Restore window.confirm
      window.confirm = originalConfirm;
    });

    it('should not delete APD if user cancels confirmation', async () => {
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => false);

      const deleteButton = screen.getByText('Delete apd-1');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(mockApdService.deleteAPD).not.toHaveBeenCalled();
      });

      // Restore window.confirm
      window.confirm = originalConfirm;
    });

    it('should handle delete APD errors', async () => {
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      mockApdService.deleteAPD.mockRejectedValue(new Error('Delete failed'));

      const deleteButton = screen.getByText('Delete apd-1');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Failed to delete APD. Please try again.'
        );
      });

      // Restore window.confirm
      window.confirm = originalConfirm;
    });
  });

  describe('Error Handling', () => {
    it('should display error alert when error occurs', async () => {
      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Trigger an error by trying to duplicate with a failing service
      mockApdService.duplicateAPD.mockRejectedValue(new Error('Test error'));

      const duplicateButton = screen.getByText('Duplicate apd-1');
      fireEvent.click(duplicateButton);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent('Error');
        expect(errorAlert).toHaveTextContent(
          'Failed to duplicate APD. Please try again.'
        );
      });
    });

    it('should allow dismissing error alert', async () => {
      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Trigger an error
      mockApdService.duplicateAPD.mockRejectedValue(new Error('Test error'));

      const duplicateButton = screen.getByText('Duplicate apd-1');
      fireEvent.click(duplicateButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Find and click the close button
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      expect(screen.getByLabelText('create new document')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      renderWithTheme(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      const createButton = screen.getByText('Create New Document');
      createButton.focus();
      expect(document.activeElement).toBe(createButton);
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme/theme';
import { ProjectGroup } from '../ProjectGroup';
import type { APDListItem, Project } from '@/types/apd';

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

// Mock project data
const mockProject: Project = {
  id: 'project-1',
  name: 'Test Project',
  description: 'Test project description',
  apdIds: ['apd-1', 'apd-2'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

// Mock APD data
const mockAPDs: APDListItem[] = [
  {
    id: 'apd-1',
    type: 'PAPD',
    projectName: 'Test Project',
    lastModified: new Date('2024-01-15'),
    completionStatus: 75,
    isComplete: false,
    currentVersion: '1.0',
    hasUncommittedChanges: true,
    parentAPDId: '',
    childDocumentIds: [],
  },
  {
    id: 'apd-2',
    type: 'IAPD',
    projectName: 'Test Project',
    lastModified: new Date('2024-01-20'),
    completionStatus: 100,
    isComplete: true,
    currentVersion: '2.0',
    hasUncommittedChanges: false,
    parentAPDId: '',
    childDocumentIds: [],
  },
];

const mockHandlers = {
  onEditAPD: jest.fn(),
  onViewAPD: jest.fn(),
  onDuplicateAPD: jest.fn(),
  onDeleteAPD: jest.fn(),
  onExportAPD: jest.fn(),
  onViewHistory: jest.fn(),
};

const defaultProps = {
  project: mockProject,
  apds: mockAPDs,
  ...mockHandlers,
};

describe('ProjectGroup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render project name and APD count', () => {
      render(
        <TestWrapper>
          <ProjectGroup {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('2 APDs')).toBeInTheDocument();
    });

    it('should render singular APD count', () => {
      render(
        <TestWrapper>
          <ProjectGroup {...defaultProps} apds={[mockAPDs[0]]} />
        </TestWrapper>
      );

      expect(screen.getByText('1 APD')).toBeInTheDocument();
    });

    it('should render expand/collapse button', () => {
      render(
        <TestWrapper>
          <ProjectGroup {...defaultProps} />
        </TestWrapper>
      );

      const expandButton = screen.getByLabelText('Expand Test Project');
      expect(expandButton).toBeInTheDocument();
    });

    it('should start in collapsed state', () => {
      render(
        <TestWrapper>
          <ProjectGroup {...defaultProps} />
        </TestWrapper>
      );

      // APD cards should not be visible initially
      expect(screen.queryByText('PAPD')).not.toBeInTheDocument();
    });

    it('should render with default expanded state when specified', () => {
      render(
        <TestWrapper>
          <ProjectGroup {...defaultProps} defaultExpanded={true} />
        </TestWrapper>
      );

      // APD cards should be visible
      expect(screen.getByText('PAPD')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should expand when expand button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <ProjectGroup {...defaultProps} />
        </TestWrapper>
      );

      const expandButton = screen.getByLabelText('Expand Test Project');
      await user.click(expandButton);

      // APD cards should now be visible
      expect(screen.getByText('PAPD')).toBeInTheDocument();
      expect(screen.getByText('IAPD')).toBeInTheDocument();
    });

    it('should collapse when collapse button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <ProjectGroup {...defaultProps} defaultExpanded={true} />
        </TestWrapper>
      );

      // Initially expanded
      expect(screen.getByText('PAPD')).toBeInTheDocument();

      const collapseButton = screen.getByLabelText('Collapse Test Project');
      await user.click(collapseButton);

      // Should be collapsed now
      expect(screen.queryByText('PAPD')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no APDs', () => {
      render(
        <TestWrapper>
          <ProjectGroup {...defaultProps} apds={[]} />
        </TestWrapper>
      );

      expect(screen.getByText('0 APDs')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <ProjectGroup {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Expand Test Project')).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <ProjectGroup {...defaultProps} />
        </TestWrapper>
      );

      const expandButton = screen.getByLabelText('Expand Test Project');

      // Focus and activate with keyboard
      expandButton.focus();
      await user.keyboard('{Enter}');

      // Should expand
      expect(screen.getByText('PAPD')).toBeInTheDocument();
    });
  });
});

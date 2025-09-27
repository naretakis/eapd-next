import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme/theme';
import { APDList } from '../APDList';
import type { APDListItem, GroupedAPDs } from '@/types/database';

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

// Mock data
const mockAPDs: APDListItem[] = [
  {
    id: 'apd-1',
    title: 'Test APD 1',
    type: 'HITECH',
    status: 'draft',
    projectName: 'Project A',
    lastModified: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    isComplete: false,
    version: '1.0',
    hasWorkingCopy: true,
  },
  {
    id: 'apd-2',
    title: 'Test APD 2',
    type: 'PAPD',
    status: 'submitted',
    projectName: 'Project A',
    lastModified: new Date('2024-01-20'),
    createdAt: new Date('2024-01-10'),
    isComplete: true,
    version: '2.0',
    hasWorkingCopy: false,
  },
  {
    id: 'apd-3',
    title: 'Ungrouped APD',
    type: 'HITECH',
    status: 'draft',
    lastModified: new Date('2024-01-25'),
    createdAt: new Date('2024-01-20'),
    isComplete: false,
    version: '1.0',
    hasWorkingCopy: true,
  },
];

const mockGroupedAPDs: GroupedAPDs = {
  projects: [
    {
      name: 'Project A',
      apds: [mockAPDs[0], mockAPDs[1]],
    },
  ],
  ungrouped: [mockAPDs[2]],
};

const mockHandlers = {
  onEdit: jest.fn(),
  onView: jest.fn(),
  onDuplicate: jest.fn(),
  onDelete: jest.fn(),
  onExport: jest.fn(),
};

const defaultProps = {
  apds: mockAPDs,
  groupedAPDs: mockGroupedAPDs,
  loading: false,
  ...mockHandlers,
};

describe('APDList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render APD list with grouped projects', () => {
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('2 APDs')).toBeInTheDocument();
      expect(screen.getByText('Individual APDs')).toBeInTheDocument();
      expect(screen.getByText('1 APD')).toBeInTheDocument();
    });

    it('should render view toggle buttons', () => {
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Group by project')).toBeInTheDocument();
      expect(screen.getByLabelText('List view')).toBeInTheDocument();
      expect(screen.getByTestId('AccountTreeIcon')).toBeInTheDocument();
      expect(screen.getByTestId('ViewListIcon')).toBeInTheDocument();
    });

    it('should render sort controls', () => {
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Sort by:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('lastModified')).toBeInTheDocument();
    });

    it('should render filter controls', () => {
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Filter:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('all')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(
        <TestWrapper>
          <APDList {...defaultProps} loading={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Loading APDs...')).toBeInTheDocument();
    });

    it('should show empty state when no APDs', () => {
      render(
        <TestWrapper>
          <APDList
            {...defaultProps}
            apds={[]}
            groupedAPDs={{ projects: [], ungrouped: [] }}
          />
        </TestWrapper>
      );

      expect(screen.getByText('No APDs found')).toBeInTheDocument();
      expect(
        screen.getByText('Create your first APD to get started')
      ).toBeInTheDocument();
    });
  });

  describe('View Toggle', () => {
    it('should start in grouped view by default', () => {
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      const groupButton = screen.getByLabelText('Group by project');
      expect(groupButton).toHaveAttribute('aria-pressed', 'true');

      const listButton = screen.getByLabelText('List view');
      expect(listButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should switch to list view when list button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      const listButton = screen.getByLabelText('List view');
      await user.click(listButton);

      expect(listButton).toHaveAttribute('aria-pressed', 'true');

      const groupButton = screen.getByLabelText('Group by project');
      expect(groupButton).toHaveAttribute('aria-pressed', 'false');

      // Should show individual APD cards instead of project groups
      expect(screen.getByText('Test APD 1')).toBeInTheDocument();
      expect(screen.getByText('Test APD 2')).toBeInTheDocument();
      expect(screen.getByText('Ungrouped APD')).toBeInTheDocument();
    });

    it('should switch back to grouped view when group button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      // First switch to list view
      const listButton = screen.getByLabelText('List view');
      await user.click(listButton);

      // Then switch back to grouped view
      const groupButton = screen.getByLabelText('Group by project');
      await user.click(groupButton);

      expect(groupButton).toHaveAttribute('aria-pressed', 'true');
      expect(listButton).toHaveAttribute('aria-pressed', 'false');

      // Should show project groups again
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Individual APDs')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should render sort options', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      const sortSelect = screen.getByDisplayValue('lastModified');
      await user.click(sortSelect);

      expect(screen.getByText('Last Modified')).toBeInTheDocument();
      expect(screen.getByText('Created Date')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should change sort order', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      const sortSelect = screen.getByDisplayValue('lastModified');
      await user.click(sortSelect);

      const titleOption = screen.getByText('Title');
      await user.click(titleOption);

      expect(screen.getByDisplayValue('title')).toBeInTheDocument();
    });

    it('should toggle sort direction', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      const sortDirectionButton = screen.getByLabelText('Sort direction');
      expect(screen.getByTestId('ArrowDownwardIcon')).toBeInTheDocument();

      await user.click(sortDirectionButton);

      expect(screen.getByTestId('ArrowUpwardIcon')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should render filter options', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      const filterSelect = screen.getByDisplayValue('all');
      await user.click(filterSelect);

      expect(screen.getByText('All APDs')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('Under Review')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('HITECH')).toBeInTheDocument();
      expect(screen.getByText('PAPD')).toBeInTheDocument();
    });

    it('should filter by status', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      // Switch to list view to see individual APDs
      const listButton = screen.getByLabelText('List view');
      await user.click(listButton);

      const filterSelect = screen.getByDisplayValue('all');
      await user.click(filterSelect);

      const draftOption = screen.getByText('Draft');
      await user.click(draftOption);

      expect(screen.getByDisplayValue('draft')).toBeInTheDocument();

      // Should only show draft APDs
      expect(screen.getByText('Test APD 1')).toBeInTheDocument();
      expect(screen.getByText('Ungrouped APD')).toBeInTheDocument();
      expect(screen.queryByText('Test APD 2')).not.toBeInTheDocument(); // Submitted APD should be hidden
    });

    it('should filter by type', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      // Switch to list view
      const listButton = screen.getByLabelText('List view');
      await user.click(listButton);

      const filterSelect = screen.getByDisplayValue('all');
      await user.click(filterSelect);

      const hitechOption = screen.getByText('HITECH');
      await user.click(hitechOption);

      expect(screen.getByDisplayValue('HITECH')).toBeInTheDocument();

      // Should only show HITECH APDs
      expect(screen.getByText('Test APD 1')).toBeInTheDocument();
      expect(screen.getByText('Ungrouped APD')).toBeInTheDocument();
      expect(screen.queryByText('Test APD 2')).not.toBeInTheDocument(); // PAPD should be hidden
    });
  });

  describe('Search', () => {
    it('should render search input', () => {
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Search APDs...')).toBeInTheDocument();
      expect(screen.getByTestId('SearchIcon')).toBeInTheDocument();
    });

    it('should filter APDs by search term', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      // Switch to list view
      const listButton = screen.getByLabelText('List view');
      await user.click(listButton);

      const searchInput = screen.getByPlaceholderText('Search APDs...');
      await user.type(searchInput, 'Ungrouped');

      // Should only show matching APDs
      expect(screen.getByText('Ungrouped APD')).toBeInTheDocument();
      expect(screen.queryByText('Test APD 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Test APD 2')).not.toBeInTheDocument();
    });

    it('should clear search when input is cleared', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      // Switch to list view
      const listButton = screen.getByLabelText('List view');
      await user.click(listButton);

      const searchInput = screen.getByPlaceholderText('Search APDs...');
      await user.type(searchInput, 'Ungrouped');

      // Clear search
      await user.clear(searchInput);

      // Should show all APDs again
      expect(screen.getByText('Test APD 1')).toBeInTheDocument();
      expect(screen.getByText('Test APD 2')).toBeInTheDocument();
      expect(screen.getByText('Ungrouped APD')).toBeInTheDocument();
    });
  });

  describe('APD Actions', () => {
    it('should pass action handlers to APD cards in list view', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      // Switch to list view
      const listButton = screen.getByLabelText('List view');
      await user.click(listButton);

      // Find and click an APD action
      const apdActionButtons = screen.getAllByLabelText('APD actions');
      await user.click(apdActionButtons[0]);

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      expect(mockHandlers.onEdit).toHaveBeenCalledWith('apd-1');
    });

    it('should pass action handlers to project groups', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      // Expand a project group
      const expandButton = screen.getByLabelText('Expand Project A');
      await user.click(expandButton);

      // Find and click an APD action within the group
      const apdActionButtons = screen.getAllByLabelText('APD actions');
      await user.click(apdActionButtons[0]);

      const viewButton = screen.getByText('View');
      await user.click(viewButton);

      expect(mockHandlers.onView).toHaveBeenCalledWith('apd-1');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for view toggle', async () => {
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      const listButton = screen.getByLabelText('List view');

      // Focus the button
      listButton.focus();
      expect(listButton).toHaveFocus();

      // Activate with Enter
      fireEvent.keyDown(listButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(listButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should support keyboard navigation for search', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search APDs...');

      // Focus and type
      searchInput.focus();
      expect(searchInput).toHaveFocus();

      await user.type(searchInput, 'test');
      expect(searchInput).toHaveValue('test');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Group by project')).toBeInTheDocument();
      expect(screen.getByLabelText('List view')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort direction')).toBeInTheDocument();
      expect(screen.getByLabelText('Search APDs')).toBeInTheDocument();
    });

    it('should have proper roles and structure', () => {
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      expect(
        screen.getByRole('group', { name: /view options/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('combobox', { name: /sort by/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('combobox', { name: /filter/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('should announce loading state to screen readers', () => {
      render(
        <TestWrapper>
          <APDList {...defaultProps} loading={true} />
        </TestWrapper>
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Loading APDs...');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty grouped APDs gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <APDList
              {...defaultProps}
              groupedAPDs={{ projects: [], ungrouped: [] }}
            />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle malformed APD data gracefully', () => {
      const malformedAPD = {
        ...mockAPDs[0],
        lastModified: new Date('invalid'),
        createdAt: new Date('invalid'),
      };

      expect(() => {
        render(
          <TestWrapper>
            <APDList {...defaultProps} apds={[malformedAPD]} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of APDs efficiently', async () => {
      const manyAPDs = Array.from({ length: 100 }, (_, i) => ({
        ...mockAPDs[0],
        id: `apd-${i}`,
        title: `APD ${i}`,
      }));

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} apds={manyAPDs} />
        </TestWrapper>
      );

      // Switch to list view
      const listButton = screen.getByLabelText('List view');
      await user.click(listButton);

      // Should render efficiently without performance issues
      expect(screen.getByText('APD 0')).toBeInTheDocument();
      expect(screen.getByText('APD 99')).toBeInTheDocument();
    });

    it('should debounce search input', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search APDs...');

      // Type quickly
      await user.type(searchInput, 'test', { delay: 50 });

      // Should handle rapid typing without issues
      expect(searchInput).toHaveValue('test');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <APDList {...defaultProps} />
        </TestWrapper>
      );

      // Should still render all controls
      expect(screen.getByLabelText('Group by project')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search APDs...')).toBeInTheDocument();
    });
  });
});

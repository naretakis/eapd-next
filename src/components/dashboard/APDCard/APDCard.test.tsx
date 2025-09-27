import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { APDCard } from './APDCard';
import theme from '@/theme/theme';
import { APDListItem } from '@/types/apd';

// Helper function to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

// Mock APD data
const mockAPD: APDListItem = {
  id: 'apd-1',
  type: 'PAPD',
  projectName: 'Test APD Project',
  isComplete: false,
  completionStatus: 65,
  currentVersion: 'v1.2.0',
  hasUncommittedChanges: true,
  lastModified: new Date('2023-06-15T10:30:00Z'),
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-06-15T10:30:00Z'),
};

const mockCompleteAPD: APDListItem = {
  ...mockAPD,
  id: 'apd-2',
  type: 'IAPD',
  isComplete: true,
  completionStatus: 100,
  hasUncommittedChanges: false,
};

const mockNotStartedAPD: APDListItem = {
  ...mockAPD,
  id: 'apd-3',
  type: 'OAPD',
  isComplete: false,
  completionStatus: 25,
  hasUncommittedChanges: false,
};

// Mock handlers
const mockHandlers = {
  onEdit: jest.fn(),
  onView: jest.fn(),
  onDuplicate: jest.fn(),
  onDelete: jest.fn(),
  onExport: jest.fn(),
  onViewHistory: jest.fn(),
};

describe('APDCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render APD card with basic information', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      expect(screen.getByText('Planning APD')).toBeInTheDocument();
      expect(screen.getByText('Test APD Project')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText('v1.2.0')).toBeInTheDocument();
    });

    it('should display correct APD type information', () => {
      const { rerender } = renderWithTheme(
        <APDCard apd={mockAPD} {...mockHandlers} />
      );

      expect(screen.getByText('Planning APD')).toBeInTheDocument();

      rerender(
        <ThemeProvider theme={theme}>
          <APDCard apd={mockCompleteAPD} {...mockHandlers} />
        </ThemeProvider>
      );

      expect(screen.getByText('Implementation APD')).toBeInTheDocument();
    });

    it('should show project name when showProjectName is true', () => {
      renderWithTheme(
        <APDCard apd={mockAPD} {...mockHandlers} showProjectName={true} />
      );

      expect(screen.getByText(/Project: Test APD Project/)).toBeInTheDocument();
    });

    it('should not show project name when showProjectName is false', () => {
      renderWithTheme(
        <APDCard apd={mockAPD} {...mockHandlers} showProjectName={false} />
      );

      expect(screen.queryByText(/Project:/)).not.toBeInTheDocument();
    });

    it('should display formatted last modified date', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      expect(screen.getByText(/Last modified:/)).toBeInTheDocument();
      expect(screen.getByText(/Jun 15, 2023/)).toBeInTheDocument();
    });
  });

  describe('Completion Status', () => {
    it('should show "Complete" status for completed APDs', () => {
      renderWithTheme(<APDCard apd={mockCompleteAPD} {...mockHandlers} />);

      expect(screen.getByText('Complete')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should show "In Progress" status for partially completed APDs', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
    });

    it('should show "Not Started" status for low completion APDs', () => {
      renderWithTheme(<APDCard apd={mockNotStartedAPD} {...mockHandlers} />);

      expect(screen.getByText('Not Started')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should display progress bar with correct value', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '65');
    });
  });

  describe('Version Information', () => {
    it('should display current version', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      expect(screen.getByText('v1.2.0')).toBeInTheDocument();
    });

    it('should show uncommitted changes indicator when present', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      expect(screen.getByText('Uncommitted')).toBeInTheDocument();
    });

    it('should not show uncommitted changes indicator when not present', () => {
      renderWithTheme(<APDCard apd={mockCompleteAPD} {...mockHandlers} />);

      expect(screen.queryByText('Uncommitted')).not.toBeInTheDocument();
    });

    it('should have version history button', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const historyButton = screen.getByLabelText('view version history');
      expect(historyButton).toBeInTheDocument();
    });
  });

  describe('Primary Actions', () => {
    it('should render Edit and View buttons', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
    });

    it('should call onEdit when Edit button is clicked', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      expect(mockHandlers.onEdit).toHaveBeenCalledWith('apd-1');
    });

    it('should call onView when View button is clicked', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      expect(mockHandlers.onView).toHaveBeenCalledWith('apd-1');
    });

    it('should call onViewHistory when version history button is clicked', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const historyButton = screen.getByLabelText('view version history');
      fireEvent.click(historyButton);

      expect(mockHandlers.onViewHistory).toHaveBeenCalledWith('apd-1');
    });
  });

  describe('Actions Menu', () => {
    it('should open actions menu when more actions button is clicked', async () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const moreButton = screen.getByLabelText('more actions');
      fireEvent.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText('Duplicate')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });
    });

    it('should close actions menu when clicking outside', async () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const moreButton = screen.getByLabelText('more actions');
      fireEvent.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText('Duplicate')).toBeInTheDocument();
      });

      // Click outside the menu
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Duplicate')).not.toBeInTheDocument();
      });
    });

    it('should call onDuplicate when Duplicate menu item is clicked', async () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const moreButton = screen.getByLabelText('more actions');
      fireEvent.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText('Duplicate')).toBeInTheDocument();
      });

      const duplicateItem = screen.getByText('Duplicate');
      fireEvent.click(duplicateItem);

      expect(mockHandlers.onDuplicate).toHaveBeenCalledWith('apd-1');
    });

    it('should call onExport when Export menu item is clicked', async () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const moreButton = screen.getByLabelText('more actions');
      fireEvent.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      const exportItem = screen.getByText('Export');
      fireEvent.click(exportItem);

      expect(mockHandlers.onExport).toHaveBeenCalledWith('apd-1');
    });

    it('should call onDelete when Delete menu item is clicked', async () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const moreButton = screen.getByLabelText('more actions');
      fireEvent.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });

      const deleteItem = screen.getByText('Delete');
      fireEvent.click(deleteItem);

      expect(mockHandlers.onDelete).toHaveBeenCalledWith('apd-1');
    });

    it('should close menu after selecting an action', async () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const moreButton = screen.getByLabelText('more actions');
      fireEvent.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText('Duplicate')).toBeInTheDocument();
      });

      const duplicateItem = screen.getByText('Duplicate');
      fireEvent.click(duplicateItem);

      await waitFor(() => {
        expect(screen.queryByText('Duplicate')).not.toBeInTheDocument();
      });
    });
  });

  describe('APD Type Variations', () => {
    const apdTypes = [
      { type: 'PAPD' as const, label: 'Planning APD' },
      { type: 'IAPD' as const, label: 'Implementation APD' },
      { type: 'OAPD' as const, label: 'Operational APD' },
      { type: 'AoA' as const, label: 'Analysis of Alternatives' },
      {
        type: 'Acquisition Checklist' as const,
        label: 'Acquisition Checklist',
      },
    ];

    apdTypes.forEach(({ type, label }) => {
      it(`should display correct label for ${type}`, () => {
        const testAPD = { ...mockAPD, type };
        renderWithTheme(<APDCard apd={testAPD} {...mockHandlers} />);

        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('Hover Effects', () => {
    it('should have hover styles applied to card', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const card =
        screen.getByRole('article') ||
        screen.getByTestId('apd-card') ||
        document.querySelector('[class*="MuiCard-root"]');

      expect(card).toHaveStyle({
        transition: 'all 0.2s ease-in-out',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      expect(screen.getByLabelText('more actions')).toBeInTheDocument();
      expect(screen.getByLabelText('view version history')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for menu', async () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const moreButton = screen.getByLabelText('more actions');
      expect(moreButton).toHaveAttribute('aria-haspopup', 'true');
      expect(moreButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(moreButton);

      await waitFor(() => {
        expect(moreButton).toHaveAttribute('aria-expanded', 'true');
        expect(moreButton).toHaveAttribute('aria-controls', 'apd-actions-menu');
      });
    });

    it('should support keyboard navigation', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      const editButton = screen.getByText('Edit');
      editButton.focus();
      expect(document.activeElement).toBe(editButton);

      const viewButton = screen.getByText('View');
      viewButton.focus();
      expect(document.activeElement).toBe(viewButton);
    });

    it('should have semantic HTML structure', () => {
      renderWithTheme(<APDCard apd={mockAPD} {...mockHandlers} />);

      // Check for heading element
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test APD Project');

      // Check for progress bar
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long project names', () => {
      const longNameAPD = {
        ...mockAPD,
        projectName:
          'This is a very long project name that should be truncated properly to fit within the card layout without breaking the design',
      };

      renderWithTheme(<APDCard apd={longNameAPD} {...mockHandlers} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveStyle({
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      });
    });

    it('should handle edge completion percentages', () => {
      const zeroPercentAPD = { ...mockAPD, completionStatus: 0 };
      const { rerender } = renderWithTheme(
        <APDCard apd={zeroPercentAPD} {...mockHandlers} />
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('Not Started')).toBeInTheDocument();

      const hundredPercentAPD = {
        ...mockAPD,
        completionStatus: 100,
        isComplete: true,
      };
      rerender(
        <ThemeProvider theme={theme}>
          <APDCard apd={hundredPercentAPD} {...mockHandlers} />
        </ThemeProvider>
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('should handle missing or invalid dates gracefully', () => {
      const invalidDateAPD = {
        ...mockAPD,
        lastModified: new Date('invalid-date'),
      };

      // This should not throw an error
      expect(() => {
        renderWithTheme(<APDCard apd={invalidDateAPD} {...mockHandlers} />);
      }).not.toThrow();
    });
  });
});

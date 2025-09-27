import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { CreateAPDDialog } from './CreateAPDDialog';
import theme from '@/theme/theme';
import { Project } from '@/types/apd';

// Helper function to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

// Mock projects data
const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Existing Project 1',
    description: 'Description for project 1',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 'project-2',
    name: 'Existing Project 2',
    description: 'Description for project 2',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
];

// Mock handlers
const mockHandlers = {
  onClose: jest.fn(),
  onCreate: jest.fn(),
};

const defaultProps = {
  open: true,
  projects: mockProjects,
  loading: false,
  ...mockHandlers,
};

describe('CreateAPDDialog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog when open', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create New Document')).toBeInTheDocument();
    });

    it('should not render dialog when closed', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} open={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render all APD type options', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      expect(screen.getByText('Planning APD (PAPD)')).toBeInTheDocument();
      expect(screen.getByText('Implementation APD (IAPD)')).toBeInTheDocument();
      expect(screen.getByText('Operational APD (OAPD)')).toBeInTheDocument();
      expect(
        screen.getByText('Analysis of Alternatives (AoA)')
      ).toBeInTheDocument();
      expect(screen.getByText('Acquisition Checklist')).toBeInTheDocument();
    });

    it('should have PAPD selected by default', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const papdRadio = screen.getByRole('radio', { name: /Planning APD/ });
      expect(papdRadio).toBeChecked();
    });

    it('should render form sections', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      expect(screen.getByText('1. Select APD Type')).toBeInTheDocument();
      expect(screen.getByText('2. Project Information')).toBeInTheDocument();
      expect(screen.getByText('3. Basic Information')).toBeInTheDocument();
    });
  });

  describe('APD Type Selection', () => {
    it('should allow selecting different APD types', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const iapdRadio = screen.getByRole('radio', {
        name: /Implementation APD/,
      });
      await user.click(iapdRadio);

      expect(iapdRadio).toBeChecked();
    });

    it('should display APD type information', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      expect(
        screen.getByText(/Initial planning and design phase funding request/)
      ).toBeInTheDocument();
      expect(screen.getByText('90% Federal / 10% State')).toBeInTheDocument();
      expect(
        screen.getByText(/Before detailed system design begins/)
      ).toBeInTheDocument();
    });

    it('should update APD type information when selection changes', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const iapdRadio = screen.getByRole('radio', {
        name: /Implementation APD/,
      });
      await user.click(iapdRadio);

      expect(
        screen.getByText(/Detailed implementation phase funding request/)
      ).toBeInTheDocument();
      expect(
        screen.getByText('90% Federal for DDI, 75% for Operations')
      ).toBeInTheDocument();
    });
  });

  describe('Project Information', () => {
    it('should have "Create new project" selected by default', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const newProjectRadio = screen.getByRole('radio', {
        name: /Create new project/,
      });
      expect(newProjectRadio).toBeChecked();
    });

    it('should show project name field for new project', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
    });

    it('should switch to existing project mode', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const existingProjectRadio = screen.getByRole('radio', {
        name: /Add to existing project/,
      });
      await user.click(existingProjectRadio);

      expect(existingProjectRadio).toBeChecked();
      expect(screen.getByLabelText('Select Project')).toBeInTheDocument();
    });

    it('should show autocomplete for existing projects', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const existingProjectRadio = screen.getByRole('radio', {
        name: /Add to existing project/,
      });
      await user.click(existingProjectRadio);

      const autocomplete = screen.getByLabelText('Select Project');
      await user.click(autocomplete);

      expect(screen.getByText('Existing Project 1')).toBeInTheDocument();
      expect(screen.getByText('Existing Project 2')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText('Project name is required')
        ).toBeInTheDocument();
        expect(screen.getByText('State name is required')).toBeInTheDocument();
        expect(
          screen.getByText('State agency is required')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Primary contact name is required')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Primary contact email is required')
        ).toBeInTheDocument();
      });

      expect(mockHandlers.onCreate).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const emailField = screen.getByLabelText('Primary Contact Email');
      await user.type(emailField, 'invalid-email');

      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeInTheDocument();
      });
    });

    it('should validate project name length', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const projectNameField = screen.getByLabelText('Project Name');
      await user.type(projectNameField, 'ab');

      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText('Project name must be at least 3 characters')
        ).toBeInTheDocument();
      });
    });

    it('should validate existing project selection', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const existingProjectRadio = screen.getByRole('radio', {
        name: /Add to existing project/,
      });
      await user.click(existingProjectRadio);

      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please select an existing project')
        ).toBeInTheDocument();
      });
    });

    it('should clear validation errors when fields are corrected', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const projectNameField = screen.getByLabelText('Project Name');

      // Trigger validation error
      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText('Project name is required')
        ).toBeInTheDocument();
      });

      // Fix the error
      await user.type(projectNameField, 'Valid Project Name');

      await waitFor(() => {
        expect(
          screen.queryByText('Project name is required')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText('Project Name'), 'Test Project');
      await user.type(screen.getByLabelText('State Name'), 'Test State');
      await user.type(screen.getByLabelText('State Agency'), 'Test Agency');
      await user.type(
        screen.getByLabelText('Primary Contact Name'),
        'John Doe'
      );
      await user.type(
        screen.getByLabelText('Primary Contact Email'),
        'john@example.com'
      );
    };

    it('should submit form with valid data for new project', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      await fillValidForm(user);

      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockHandlers.onCreate).toHaveBeenCalledWith({
          type: 'PAPD',
          projectName: 'Test Project',
          stateName: 'Test State',
          stateAgency: 'Test Agency',
          primaryContactName: 'John Doe',
          primaryContactEmail: 'john@example.com',
          benefitsMultiplePrograms: false,
        });
      });
    });

    it('should submit form with existing project selection', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      // Switch to existing project mode
      const existingProjectRadio = screen.getByRole('radio', {
        name: /Add to existing project/,
      });
      await user.click(existingProjectRadio);

      // Select a project
      const autocomplete = screen.getByLabelText('Select Project');
      await user.click(autocomplete);
      await user.click(screen.getByText('Existing Project 1'));

      // Fill other required fields
      await user.type(screen.getByLabelText('State Name'), 'Test State');
      await user.type(screen.getByLabelText('State Agency'), 'Test Agency');
      await user.type(
        screen.getByLabelText('Primary Contact Name'),
        'John Doe'
      );
      await user.type(
        screen.getByLabelText('Primary Contact Email'),
        'john@example.com'
      );

      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockHandlers.onCreate).toHaveBeenCalledWith({
          type: 'PAPD',
          projectName: 'Existing Project 1',
          projectId: 'project-1',
          stateName: 'Test State',
          stateAgency: 'Test Agency',
          primaryContactName: 'John Doe',
          primaryContactEmail: 'john@example.com',
          benefitsMultiplePrograms: false,
        });
      });
    });

    it('should include benefitsMultiplePrograms when checked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      await fillValidForm(user);

      const benefitsCheckbox = screen.getByRole('radio', {
        name: /This project benefits multiple programs/,
      });
      await user.click(benefitsCheckbox);

      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockHandlers.onCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            benefitsMultiplePrograms: true,
          })
        );
      });
    });

    it('should submit with different APD types', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      // Select IAPD
      const iapdRadio = screen.getByRole('radio', {
        name: /Implementation APD/,
      });
      await user.click(iapdRadio);

      await fillValidForm(user);

      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockHandlers.onCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'IAPD',
          })
        );
      });
    });
  });

  describe('Dialog Controls', () => {
    it('should close dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const closeButton = screen.getByLabelText('close dialog');
      await user.click(closeButton);

      expect(mockHandlers.onClose).toHaveBeenCalled();
    });

    it('should close dialog when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockHandlers.onClose).toHaveBeenCalled();
    });

    it('should disable buttons when loading', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} loading={true} />);

      expect(screen.getByLabelText('close dialog')).toBeDisabled();
      expect(screen.getByText('Cancel')).toBeDisabled();
      expect(screen.getByText('Creating...')).toBeDisabled();
    });

    it('should show loading state in create button', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} loading={true} />);

      expect(screen.getByText('Creating...')).toBeInTheDocument();
      expect(screen.queryByText('Create Document')).not.toBeInTheDocument();
    });
  });

  describe('Form Reset', () => {
    it('should reset form when dialog opens', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(
        <CreateAPDDialog {...defaultProps} open={false} />
      );

      // Open dialog and fill form
      rerender(
        <ThemeProvider theme={theme}>
          <CreateAPDDialog {...defaultProps} open={true} />
        </ThemeProvider>
      );

      await user.type(screen.getByLabelText('Project Name'), 'Test Project');

      // Close and reopen dialog
      rerender(
        <ThemeProvider theme={theme}>
          <CreateAPDDialog {...defaultProps} open={false} />
        </ThemeProvider>
      );

      rerender(
        <ThemeProvider theme={theme}>
          <CreateAPDDialog {...defaultProps} open={true} />
        </ThemeProvider>
      );

      // Form should be reset
      expect(screen.getByLabelText('Project Name')).toHaveValue('');
      expect(screen.getByRole('radio', { name: /Planning APD/ })).toBeChecked();
      expect(
        screen.getByRole('radio', { name: /Create new project/ })
      ).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toHaveAttribute(
        'aria-labelledby',
        'create-apd-dialog-title'
      );
      expect(screen.getByLabelText('close dialog')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      // Tab through form elements
      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByLabelText('close dialog')
      );

      await user.tab();
      expect(document.activeElement).toBe(
        screen.getByRole('radio', { name: /Planning APD/ })
      );
    });

    it('should have proper form labels and descriptions', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
      expect(
        screen.getByText('Enter a descriptive name for your project')
      ).toBeInTheDocument();
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CreateAPDDialog {...defaultProps} />);

      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      await waitFor(() => {
        const projectNameField = screen.getByLabelText('Project Name');
        expect(projectNameField).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty projects array', () => {
      renderWithTheme(<CreateAPDDialog {...defaultProps} projects={[]} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle projects with missing descriptions', async () => {
      const user = userEvent.setup();
      const projectsWithoutDescriptions = [
        {
          id: 'project-1',
          name: 'Project Without Description',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      renderWithTheme(
        <CreateAPDDialog
          {...defaultProps}
          projects={projectsWithoutDescriptions}
        />
      );

      const existingProjectRadio = screen.getByRole('radio', {
        name: /Add to existing project/,
      });
      await user.click(existingProjectRadio);

      const autocomplete = screen.getByLabelText('Select Project');
      await user.click(autocomplete);

      expect(
        screen.getByText('Project Without Description')
      ).toBeInTheDocument();
    });

    it('should handle very long project names in autocomplete', async () => {
      const user = userEvent.setup();
      const projectsWithLongNames = [
        {
          id: 'project-1',
          name: 'This is a very long project name that should be handled gracefully in the autocomplete dropdown',
          description: 'Description',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      renderWithTheme(
        <CreateAPDDialog {...defaultProps} projects={projectsWithLongNames} />
      );

      const existingProjectRadio = screen.getByRole('radio', {
        name: /Add to existing project/,
      });
      await user.click(existingProjectRadio);

      const autocomplete = screen.getByLabelText('Select Project');
      await user.click(autocomplete);

      expect(
        screen.getByText(/This is a very long project name/)
      ).toBeInTheDocument();
    });
  });
});

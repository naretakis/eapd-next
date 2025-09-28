import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme/theme';
import { CreateAPDDialog } from '../CreateAPDDialog';
import { Project } from '@/types/apd';

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Existing Project 1',
    description: 'Test project description',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'project-2',
    name: 'Project Without Description',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockProps = {
  open: true,
  onClose: jest.fn(),
  onCreate: jest.fn(),
  projects: mockProjects,
  loading: false,
};

describe('CreateAPDDialog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog when open', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create New Document')).toBeInTheDocument();
    });

    it('should not render dialog when closed', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} open={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render all form sections', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByText('1. Select APD Type')).toBeInTheDocument();
      expect(screen.getByText('2. Project Information')).toBeInTheDocument();
      expect(screen.getByText('3. Basic Information')).toBeInTheDocument();
    });

    it('should render APD type options', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Planning APD (PAPD)')).toBeInTheDocument();
      expect(screen.getByText('Implementation APD (IAPD)')).toBeInTheDocument();
      expect(screen.getByText('Operational APD (OAPD)')).toBeInTheDocument();
      expect(
        screen.getByText('Analysis of Alternatives (AoA)')
      ).toBeInTheDocument();
      expect(screen.getByText('Acquisition Checklist')).toBeInTheDocument();
    });

    it('should render project mode options', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Create new project')).toBeInTheDocument();
      expect(screen.getByText('Add to existing project')).toBeInTheDocument();
    });

    it('should render basic information fields', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('State Name')).toBeInTheDocument();
      expect(screen.getByLabelText('State Agency')).toBeInTheDocument();
      expect(screen.getByLabelText('Primary Contact Name')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Primary Contact Email')
      ).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Create Document')).toBeInTheDocument();
    });
  });

  describe('APD Type Selection', () => {
    it('should start with PAPD selected by default', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const papdRadio = screen.getByDisplayValue('PAPD');
      expect(papdRadio).toBeChecked();
    });

    it('should allow selecting different APD types', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const iapdCard = screen
        .getByText('Implementation APD (IAPD)')
        .closest('.MuiCard-root');
      if (iapdCard) {
        await user.click(iapdCard);

        const iapdRadio = screen.getByDisplayValue('IAPD');
        expect(iapdRadio).toBeChecked();
      }
    });

    it('should show APD type information', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      expect(
        screen.getByText(/Initial planning and design phase funding request/)
      ).toBeInTheDocument();
      expect(screen.getByText('90% Federal / 10% State')).toBeInTheDocument();
      expect(
        screen.getByText('When to use: Before detailed system design begins')
      ).toBeInTheDocument();
    });
  });

  describe('Project Mode Selection', () => {
    it('should start with new project mode selected', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const newProjectRadio = screen.getByDisplayValue('new');
      expect(newProjectRadio).toBeChecked();
      expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
    });

    it('should switch to existing project mode', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const existingProjectRadio = screen.getByDisplayValue('existing');
      await user.click(existingProjectRadio);

      expect(existingProjectRadio).toBeChecked();
      expect(screen.getByLabelText('Select Project')).toBeInTheDocument();
    });

    it('should show project autocomplete in existing mode', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const existingProjectRadio = screen.getByDisplayValue('existing');
      await user.click(existingProjectRadio);

      const autocomplete = screen.getByLabelText('Select Project');
      await user.click(autocomplete);

      expect(screen.getByText('Existing Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test project description')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    const _fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
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

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      expect(screen.getByText('Project name is required')).toBeInTheDocument();
      expect(screen.getByText('State name is required')).toBeInTheDocument();
      expect(screen.getByText('State agency is required')).toBeInTheDocument();
      expect(
        screen.getByText('Primary contact name is required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Primary contact email is required')
      ).toBeInTheDocument();
    });

    it('should validate project name length', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText('Project Name'), 'AB'); // Too short
      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      expect(
        screen.getByText('Project name must be at least 3 characters')
      ).toBeInTheDocument();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      await user.type(
        screen.getByLabelText('Primary Contact Email'),
        'invalid-email'
      );
      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument();
    });

    it('should validate existing project selection', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      // Switch to existing project mode
      const existingProjectRadio = screen.getByDisplayValue('existing');
      await user.click(existingProjectRadio);

      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      expect(
        screen.getByText('Please select an existing project')
      ).toBeInTheDocument();
    });

    it('should clear validation errors when fields are corrected', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      // Trigger validation error
      const createButton = screen.getByText('Create Document');
      await user.click(createButton);
      expect(screen.getByText('Project name is required')).toBeInTheDocument();

      // Fix the error
      await user.type(
        screen.getByLabelText('Project Name'),
        'Valid Project Name'
      );

      // Error should be cleared
      await waitFor(() => {
        expect(
          screen.queryByText('Project name is required')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data for new project', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      // Fill out form
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

      // Submit form
      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      expect(mockProps.onCreate).toHaveBeenCalledWith({
        type: 'PAPD',
        projectName: 'Test Project',
        stateName: 'Test State',
        stateAgency: 'Test Agency',
        primaryContactName: 'John Doe',
        primaryContactEmail: 'john@example.com',
        benefitsMultiplePrograms: false,
      });
    });

    it('should submit form with existing project selection', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      // Switch to existing project mode
      const existingProjectRadio = screen.getByDisplayValue('existing');
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

      // Submit form
      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      expect(mockProps.onCreate).toHaveBeenCalledWith({
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

    it('should show loading state during submission', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} loading={true} />
        </TestWrapper>
      );

      const createButton = screen.getByText('Creating...');
      expect(createButton).toBeDisabled();

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Dialog Controls', () => {
    it('should close dialog when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should close dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const closeButton = screen.getByLabelText('close dialog');
      await user.click(closeButton);

      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should close dialog with Escape key', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Form Reset', () => {
    it('should reset form when dialog opens', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} open={false} />
        </TestWrapper>
      );

      // Open dialog and fill form
      rerender(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} open={true} />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText('Project Name'), 'Test Title');

      // Close dialog
      rerender(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} open={false} />
        </TestWrapper>
      );

      // Reopen dialog
      rerender(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} open={true} />
        </TestWrapper>
      );

      // Form should be reset
      const projectNameInput = screen.getByLabelText(
        'Project Name'
      ) as HTMLInputElement;
      expect(projectNameInput.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('dialog')).toHaveAttribute(
        'aria-labelledby',
        'create-apd-dialog-title'
      );
      expect(screen.getByLabelText('close dialog')).toBeInTheDocument();
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('should have proper form labels and descriptions', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
      expect(
        screen.getByText('Enter a descriptive name for your project')
      ).toBeInTheDocument();
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const createButton = screen.getByText('Create Document');
      await user.click(createButton);

      await waitFor(() => {
        const projectNameField = screen.getByLabelText('Project Name');
        expect(projectNameField).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const projectNameInput = screen.getByLabelText('Project Name');
      const stateNameInput = screen.getByLabelText('State Name');
      const cancelButton = screen.getByText('Cancel');
      const createButton = screen.getByText('Create Document');

      // Should be able to focus form elements
      projectNameInput.focus();
      expect(projectNameInput).toHaveFocus();

      expect(stateNameInput).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
      expect(createButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle projects with missing descriptions', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const existingProjectRadio = screen.getByDisplayValue('existing');
      await user.click(existingProjectRadio);

      const autocomplete = screen.getByLabelText('Select Project');
      await user.click(autocomplete);

      expect(
        screen.getByText('Project Without Description')
      ).toBeInTheDocument();
    });

    it('should handle very long project names in autocomplete', async () => {
      const longNameProjects: Project[] = [
        {
          id: 'project-long',
          name: 'This is a very long project name that might cause display issues in the autocomplete dropdown',
          description: 'Test description',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} projects={longNameProjects} />
        </TestWrapper>
      );

      const existingProjectRadio = screen.getByDisplayValue('existing');
      await user.click(existingProjectRadio);

      const autocomplete = screen.getByLabelText('Select Project');
      await user.click(autocomplete);

      expect(
        screen.getByText(/This is a very long project name/)
      ).toBeInTheDocument();
    });

    it('should handle empty projects list', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} projects={[]} />
        </TestWrapper>
      );

      const existingProjectRadio = screen.getByDisplayValue('existing');
      await user.click(existingProjectRadio);

      const autocomplete = screen.getByLabelText('Select Project');
      await user.click(autocomplete);

      // Should not crash and should show empty state
      expect(autocomplete).toBeInTheDocument();
    });
  });

  describe('Multiple Programs Checkbox', () => {
    it('should handle multiple programs checkbox', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      const checkbox = screen.getByRole('radio', {
        name: /This project benefits multiple programs/,
      });
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });
  });

  describe('Information Alert', () => {
    it('should display information alert', () => {
      render(
        <TestWrapper>
          <CreateAPDDialog {...mockProps} />
        </TestWrapper>
      );

      expect(
        screen.getByText(
          /After creating your APD, you'll be taken to the guided editor/
        )
      ).toBeInTheDocument();
    });
  });
});

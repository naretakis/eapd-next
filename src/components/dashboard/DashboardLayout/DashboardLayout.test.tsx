import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { DashboardLayout } from './DashboardLayout';
import theme from '@/theme/theme';

// Mock the child components
jest.mock('@/components/common/Layout', () => ({
  __esModule: true,
  default: ({
    children,
    title,
    showNavigation,
  }: {
    children: React.ReactNode;
    title?: string;
    showNavigation?: boolean;
  }) => (
    <div data-testid="layout">
      <div data-testid="layout-title">{title}</div>
      <div data-testid="layout-navigation">
        {showNavigation ? 'nav-shown' : 'nav-hidden'}
      </div>
      {children}
    </div>
  ),
}));

jest.mock('@/components/common/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

jest.mock('@/components/common/LoadingSpinner', () => ({
  LoadingSpinner: ({ message }: { message?: string }) => (
    <div data-testid="loading-spinner">{message}</div>
  ),
}));

// Helper function to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('DashboardLayout Component', () => {
  beforeEach(() => {
    // Mock console.log to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      renderWithTheme(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render with custom title and subtitle', () => {
      renderWithTheme(
        <DashboardLayout title="Custom Title" subtitle="Custom Subtitle">
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
    });

    it('should render without subtitle when not provided', () => {
      renderWithTheme(
        <DashboardLayout title="Title Only">
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.queryByText('Custom Subtitle')).not.toBeInTheDocument();
    });

    it('should pass correct props to Layout component', () => {
      renderWithTheme(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByTestId('layout-title')).toHaveTextContent('eAPD-Next');
      expect(screen.getByTestId('layout-navigation')).toHaveTextContent(
        'nav-shown'
      );
    });
  });

  describe('Breadcrumbs', () => {
    it('should render default breadcrumbs with home', () => {
      renderWithTheme(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('should render custom breadcrumbs', () => {
      const breadcrumbs = [
        { label: 'Projects', href: '/projects' },
        { label: 'Current Project' },
      ];

      renderWithTheme(
        <DashboardLayout breadcrumbs={breadcrumbs}>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Current Project')).toBeInTheDocument();
    });

    it('should handle breadcrumb clicks', () => {
      const breadcrumbs = [{ label: 'Projects', href: '/projects' }];

      renderWithTheme(
        <DashboardLayout breadcrumbs={breadcrumbs}>
          <div>Test Content</div>
        </DashboardLayout>
      );

      const projectsLink = screen.getByText('Projects');
      projectsLink.click();

      expect(console.log).toHaveBeenCalledWith('Navigate to:', '/projects');
    });

    it('should not render breadcrumbs when only home exists', () => {
      renderWithTheme(
        <DashboardLayout breadcrumbs={[]}>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Should not render breadcrumbs navigation when only home exists
      expect(
        screen.queryByLabelText('dashboard navigation')
      ).not.toBeInTheDocument();
    });
  });

  describe('Version Information', () => {
    it('should show version information by default', () => {
      renderWithTheme(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText('v0.2.0')).toBeInTheDocument();
    });

    it('should hide version information when showVersionInfo is false', () => {
      renderWithTheme(
        <DashboardLayout showVersionInfo={false}>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
    });

    it('should show environment chip for non-production', () => {
      // Mock environment variable
      const originalEnv = process.env.NEXT_PUBLIC_ENVIRONMENT;
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'development';

      renderWithTheme(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText('DEVELOPMENT')).toBeInTheDocument();

      // Restore environment variable
      process.env.NEXT_PUBLIC_ENVIRONMENT = originalEnv;
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      renderWithTheme(
        <DashboardLayout loading={true}>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });

    it('should show content when loading is false', () => {
      renderWithTheme(
        <DashboardLayout loading={false}>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error alert when error is provided', () => {
      renderWithTheme(
        <DashboardLayout error="Something went wrong">
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should not display error alert when no error', () => {
      renderWithTheme(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show content even when error is present', () => {
      renderWithTheme(
        <DashboardLayout error="Something went wrong">
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Help Information', () => {
    it('should display help information alert', () => {
      renderWithTheme(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText('APD Management Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText(/Create, manage, and export APDs/)
      ).toBeInTheDocument();
    });
  });

  describe('Dashboard Header', () => {
    it('should render dashboard icon', () => {
      renderWithTheme(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      const dashboardIcon = document.querySelector(
        '[data-testid="DashboardIcon"]'
      );
      expect(dashboardIcon).toBeInTheDocument();
    });

    it('should render title as h1 element', () => {
      renderWithTheme(
        <DashboardLayout title="Test Dashboard">
          <div>Test Content</div>
        </DashboardLayout>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Test Dashboard');
    });
  });

  describe('Layout Structure', () => {
    it('should use proper container and spacing', () => {
      renderWithTheme(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Check that Container component is used
      const container = document.querySelector('.MuiContainer-root');
      expect(container).toBeInTheDocument();
    });

    it('should apply proper styling to content area', () => {
      renderWithTheme(
        <DashboardLayout>
          <div data-testid="content">Test Content</div>
        </DashboardLayout>
      );

      const contentArea = screen.getByTestId('content').parentElement;
      expect(contentArea).toHaveStyle({ minHeight: '400px' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const breadcrumbs = [{ label: 'Test', href: '/test' }];

      renderWithTheme(
        <DashboardLayout breadcrumbs={breadcrumbs}>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByLabelText('dashboard navigation')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      renderWithTheme(
        <DashboardLayout title="Main Dashboard">
          <div>Test Content</div>
        </DashboardLayout>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Main Dashboard');
    });

    it('should have semantic HTML structure', () => {
      renderWithTheme(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Check for proper alert roles
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should handle different screen sizes', () => {
      renderWithTheme(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Check that responsive container is used
      const container = document.querySelector('.MuiContainer-maxWidthXl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      renderWithTheme(<DashboardLayout>{null}</DashboardLayout>);

      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      renderWithTheme(
        <DashboardLayout>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </DashboardLayout>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should handle very long titles', () => {
      const longTitle =
        'This is a very long dashboard title that should be handled gracefully without breaking the layout';

      renderWithTheme(
        <DashboardLayout title={longTitle}>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle breadcrumbs with icons', () => {
      const breadcrumbs = [
        {
          label: 'Projects',
          href: '/projects',
          icon: <span data-testid="custom-icon">📁</span>,
        },
      ];

      renderWithTheme(
        <DashboardLayout breadcrumbs={breadcrumbs}>
          <div>Test Content</div>
        </DashboardLayout>
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });
});

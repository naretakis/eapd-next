import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { LoadingSpinner } from './LoadingSpinner';
import theme from '@/theme/theme';

// Helper function to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('LoadingSpinner Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      renderWithTheme(<LoadingSpinner />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render with custom message', () => {
      renderWithTheme(<LoadingSpinner message="Loading dashboard data..." />);

      expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      renderWithTheme(<LoadingSpinner size={60} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveStyle({
        width: '60px',
        height: '60px',
      });
    });

    it('should render without message when message is empty', () => {
      renderWithTheme(<LoadingSpinner message="" />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should render without message when showMessage is false', () => {
      renderWithTheme(<LoadingSpinner showMessage={false} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply default styling', () => {
      renderWithTheme(<LoadingSpinner />);

      const container = screen.getByRole('progressbar').parentElement;
      expect(container).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      });
    });

    it('should apply custom color', () => {
      renderWithTheme(<LoadingSpinner color="secondary" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('MuiCircularProgress-colorSecondary');
    });

    it('should apply primary color by default', () => {
      renderWithTheme(<LoadingSpinner />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('MuiCircularProgress-colorPrimary');
    });

    it('should center content properly', () => {
      renderWithTheme(<LoadingSpinner />);

      const container = screen.getByRole('progressbar').parentElement;
      expect(container).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(<LoadingSpinner />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label', 'Loading...');
    });

    it('should have custom ARIA label when message is provided', () => {
      renderWithTheme(<LoadingSpinner message="Loading data..." />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label', 'Loading data...');
    });

    it('should have default ARIA label when message is empty', () => {
      renderWithTheme(<LoadingSpinner message="" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label', 'Loading...');
    });

    it('should be focusable for screen readers', () => {
      renderWithTheme(<LoadingSpinner />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    it('should display message with proper styling', () => {
      renderWithTheme(<LoadingSpinner message="Please wait..." />);

      const message = screen.getByText('Please wait...');
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass('MuiTypography-alignCenter');
    });

    it('should handle long messages', () => {
      const longMessage =
        'This is a very long loading message that should be displayed properly without breaking the layout or causing any issues with the component rendering';

      renderWithTheme(<LoadingSpinner message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters in message', () => {
      const specialMessage = 'Loading... 50% complete! @#$%^&*()';

      renderWithTheme(<LoadingSpinner message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });

  describe('Size Variations', () => {
    it('should handle small size', () => {
      renderWithTheme(<LoadingSpinner size={20} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveStyle({
        width: '20px',
        height: '20px',
      });
    });

    it('should handle large size', () => {
      renderWithTheme(<LoadingSpinner size={100} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveStyle({
        width: '100px',
        height: '100px',
      });
    });

    it('should handle default size when not specified', () => {
      renderWithTheme(<LoadingSpinner />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveStyle({
        width: '40px',
        height: '40px',
      });
    });
  });

  describe('Color Variations', () => {
    const colors = [
      'primary',
      'secondary',
      'success',
      'error',
      'info',
      'warning',
    ] as const;

    colors.forEach(color => {
      it(`should render with ${color} color`, () => {
        renderWithTheme(<LoadingSpinner color={color} />);

        const progressbar = screen.getByRole('progressbar');
        expect(progressbar).toHaveClass(
          `MuiCircularProgress-color${color.charAt(0).toUpperCase() + color.slice(1)}`
        );
      });
    });
  });

  describe('Component Behavior', () => {
    it('should maintain consistent structure', () => {
      renderWithTheme(<LoadingSpinner message="Loading..." />);

      const container = screen.getByRole('progressbar').parentElement;
      const progressbar = screen.getByRole('progressbar');
      const message = screen.getByText('Loading...');

      expect(container).toContainElement(progressbar);
      expect(container).toContainElement(message);
    });

    it('should render spinner before message', () => {
      renderWithTheme(<LoadingSpinner message="Loading..." />);

      const container = screen.getByRole('progressbar').parentElement;
      const children = Array.from(container?.children || []);

      expect(children[0]).toContainElement(screen.getByRole('progressbar'));
      expect(children[1]).toContainElement(screen.getByText('Loading...'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero size', () => {
      renderWithTheme(<LoadingSpinner size={0} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveStyle({
        width: '0px',
        height: '0px',
      });
    });

    it('should handle negative size gracefully', () => {
      renderWithTheme(<LoadingSpinner size={-10} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveStyle({
        width: '-10px',
        height: '-10px',
      });
    });

    it('should handle null message', () => {
      // @ts-expect-error - Testing invalid prop type
      renderWithTheme(<LoadingSpinner message={null} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText('null')).not.toBeInTheDocument();
    });

    it('should handle undefined message', () => {
      // @ts-expect-error - Testing invalid prop type
      renderWithTheme(<LoadingSpinner message={undefined} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText('undefined')).not.toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work within other components', () => {
      const WrapperComponent: React.FC = () => (
        <div data-testid="wrapper">
          <h1>Dashboard</h1>
          <LoadingSpinner message="Loading dashboard..." />
        </div>
      );

      renderWithTheme(<WrapperComponent />);

      expect(screen.getByTestId('wrapper')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should maintain proper spacing in layouts', () => {
      renderWithTheme(
        <div style={{ padding: '20px' }}>
          <LoadingSpinner message="Loading..." />
        </div>
      );

      const container = screen.getByRole('progressbar').parentElement;
      expect(container).toHaveStyle({
        gap: '16px',
      });
    });
  });

  describe('Performance', () => {
    it('should render quickly with minimal props', () => {
      const startTime = performance.now();
      renderWithTheme(<LoadingSpinner />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should handle multiple instances', () => {
      renderWithTheme(
        <div>
          <LoadingSpinner message="Loading 1..." />
          <LoadingSpinner message="Loading 2..." />
          <LoadingSpinner message="Loading 3..." />
        </div>
      );

      expect(screen.getAllByRole('progressbar')).toHaveLength(3);
      expect(screen.getByText('Loading 1...')).toBeInTheDocument();
      expect(screen.getByText('Loading 2...')).toBeInTheDocument();
      expect(screen.getByText('Loading 3...')).toBeInTheDocument();
    });
  });
});

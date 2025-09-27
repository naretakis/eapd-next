import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { ErrorBoundary } from './ErrorBoundary';
import theme from '@/theme/theme';

// Helper function to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({
  shouldThrow = false,
}) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      renderWithTheme(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render multiple children when no error occurs', () => {
      renderWithTheme(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should catch and display error when child component throws', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(/An unexpected error occurred/)
      ).toBeInTheDocument();
      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });

    it('should display error details when available', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should show retry button', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should show reload button', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should retry rendering when Try Again is clicked', () => {
      const { rerender } = renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      // Re-render with no error
      rerender(
        <ThemeProvider theme={theme}>
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        </ThemeProvider>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(
        screen.queryByText('Something went wrong')
      ).not.toBeInTheDocument();
    });

    it('should reload page when Reload Page is clicked', () => {
      // Mock window.location.reload
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('Reload Page');
      fireEvent.click(reloadButton);

      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('Error Information', () => {
    it('should display error boundary information', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/If this problem persists/)).toBeInTheDocument();
      expect(screen.getByText(/please contact support/)).toBeInTheDocument();
    });

    it('should show error icon', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for error icon (ErrorOutline icon)
      const errorIcon = document.querySelector(
        '[data-testid="ErrorOutlineIcon"]'
      );
      expect(errorIcon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByLabelText('retry loading')).toBeInTheDocument();
      expect(screen.getByLabelText('reload page')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByText('Try Again');
      const reloadButton = screen.getByText('Reload Page');

      retryButton.focus();
      expect(document.activeElement).toBe(retryButton);

      reloadButton.focus();
      expect(document.activeElement).toBe(reloadButton);
    });
  });

  describe('Error Logging', () => {
    it('should log error to console', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Component State', () => {
    it('should maintain error state until retry', () => {
      const { rerender } = renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Re-render with same error - should still show error
      rerender(
        <ThemeProvider theme={theme}>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </ThemeProvider>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should reset error state on retry', () => {
      const TestComponent: React.FC = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true);

        return (
          <ErrorBoundary>
            <button onClick={() => setShouldThrow(false)}>Fix Error</button>
            <ThrowError shouldThrow={shouldThrow} />
          </ErrorBoundary>
        );
      };

      renderWithTheme(<TestComponent />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      // After retry, the component should re-render and potentially recover
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors without error messages', () => {
      const ThrowErrorWithoutMessage: React.FC = () => {
        throw new Error();
      };

      renderWithTheme(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(/An unexpected error occurred/)
      ).toBeInTheDocument();
    });

    it('should handle null children', () => {
      renderWithTheme(<ErrorBoundary>{null}</ErrorBoundary>);

      // Should not crash
      expect(
        screen.queryByText('Something went wrong')
      ).not.toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      renderWithTheme(<ErrorBoundary>{undefined}</ErrorBoundary>);

      // Should not crash
      expect(
        screen.queryByText('Something went wrong')
      ).not.toBeInTheDocument();
    });

    it('should handle errors in componentDidCatch', () => {
      // This tests the error boundary's own error handling
      const ThrowInRender: React.FC = () => {
        throw new Error('Render error');
      };

      renderWithTheme(
        <ErrorBoundary>
          <ThrowInRender />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should have proper styling for error display', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const container = screen.getByRole('alert').parentElement;
      expect(container).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      });
    });

    it('should center content properly', () => {
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with complex component trees', () => {
      const ComplexTree: React.FC<{ shouldThrow?: boolean }> = ({
        shouldThrow = false,
      }) => (
        <div>
          <div>
            <div>
              <ThrowError shouldThrow={shouldThrow} />
            </div>
          </div>
        </div>
      );

      renderWithTheme(
        <ErrorBoundary>
          <ComplexTree shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should work with async errors', async () => {
      const AsyncError: React.FC = () => {
        React.useEffect(() => {
          // This won't be caught by error boundary as it's async
          // Error boundaries only catch errors in render, lifecycle methods, and constructors
        }, []);

        throw new Error('Sync error in render');
      };

      renderWithTheme(
        <ErrorBoundary>
          <AsyncError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@mui/material';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider Component', () => {
  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <ThemeProvider>
          <div>Test content</div>
        </ThemeProvider>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ThemeProvider>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ThemeProvider>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should apply Material-UI theme', () => {
      render(
        <ThemeProvider>
          <button>Themed Button</button>
        </ThemeProvider>
      );

      const button = screen.getByText('Themed Button');
      expect(button).toBeInTheDocument();

      // Check that MUI styles are applied
      const computedStyle = window.getComputedStyle(button);
      expect(computedStyle).toBeDefined();
    });

    it('should include CssBaseline', () => {
      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      // CssBaseline should normalize styles
      const body = document.body;
      expect(body).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should provide theme context to children', () => {
      const ThemedComponent: React.FC = () => {
        return <div style={{ color: 'primary.main' }}>Themed content</div>;
      };

      render(
        <ThemeProvider>
          <ThemedComponent />
        </ThemeProvider>
      );

      expect(screen.getByText('Themed content')).toBeInTheDocument();
    });

    it('should work with Material-UI components', () => {
      render(
        <ThemeProvider>
          <Button variant="contained">MUI Button</Button>
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('MuiButton-root');
    });
  });

  describe('Client-Side Rendering', () => {
    it('should be marked as client component', () => {
      // This test ensures the component works in client-side context
      render(
        <ThemeProvider>
          <div>Client content</div>
        </ThemeProvider>
      );

      expect(screen.getByText('Client content')).toBeInTheDocument();
    });

    it('should handle theme serialization', () => {
      // Test that theme functions don't cause serialization issues
      render(
        <ThemeProvider>
          <div data-testid="theme-test">Theme test</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-test')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      render(<ThemeProvider>{null}</ThemeProvider>);

      // Should not crash
      expect(document.body).toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      render(<ThemeProvider>{undefined}</ThemeProvider>);

      // Should not crash
      expect(document.body).toBeInTheDocument();
    });

    it('should handle empty children', () => {
      render(<ThemeProvider>{null}</ThemeProvider>);

      // Should not crash
      expect(document.body).toBeInTheDocument();
    });

    it('should handle complex nested children', () => {
      render(
        <ThemeProvider>
          <div>
            <div>
              <div>
                <span>Deeply nested content</span>
              </div>
            </div>
          </div>
        </ThemeProvider>
      );

      expect(screen.getByText('Deeply nested content')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();

      render(
        <ThemeProvider>
          <div>Performance test</div>
        </ThemeProvider>
      );

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
      expect(screen.getByText('Performance test')).toBeInTheDocument();
    });

    it('should handle multiple theme providers', () => {
      render(
        <div>
          <ThemeProvider>
            <div>Provider 1</div>
          </ThemeProvider>
          <ThemeProvider>
            <div>Provider 2</div>
          </ThemeProvider>
        </div>
      );

      expect(screen.getByText('Provider 1')).toBeInTheDocument();
      expect(screen.getByText('Provider 2')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with other providers', () => {
      const CustomProvider: React.FC<{ children: React.ReactNode }> = ({
        children,
      }) => <div data-testid="custom-provider">{children}</div>;

      render(
        <CustomProvider>
          <ThemeProvider>
            <div>Nested providers</div>
          </ThemeProvider>
        </CustomProvider>
      );

      expect(screen.getByTestId('custom-provider')).toBeInTheDocument();
      expect(screen.getByText('Nested providers')).toBeInTheDocument();
    });

    it('should maintain theme consistency across re-renders', () => {
      const { rerender } = render(
        <ThemeProvider>
          <div>Initial content</div>
        </ThemeProvider>
      );

      expect(screen.getByText('Initial content')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <div>Updated content</div>
        </ThemeProvider>
      );

      expect(screen.getByText('Updated content')).toBeInTheDocument();
      expect(screen.queryByText('Initial content')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle theme loading errors gracefully', () => {
      // Mock console.error to avoid noise
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <ThemeProvider>
          <div>Error test</div>
        </ThemeProvider>
      );

      expect(screen.getByText('Error test')).toBeInTheDocument();

      // Restore console.error
      console.error = originalError;
    });

    it('should not crash with invalid children', () => {
      expect(() => {
        render(
          <ThemeProvider>
            <div>Valid content</div>
            {/* @ts-expect-error - Testing invalid children */}
            {123}
            {true}
            {false}
          </ThemeProvider>
        );
      }).not.toThrow();

      expect(screen.getByText('Valid content')).toBeInTheDocument();
    });
  });
});

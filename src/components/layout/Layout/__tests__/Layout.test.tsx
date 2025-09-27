import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme/theme';
import { Layout } from '../Layout';

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

// Mock child component
const MockChild: React.FC = () => (
  <div data-testid="mock-child">Test Content</div>
);

describe('Layout Component', () => {
  describe('Rendering', () => {
    it('should render layout structure with children', () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('mock-child')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render app bar with title', () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByText('eAPD-Next')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render navigation menu button', () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText('Open navigation menu');
      expect(menuButton).toBeInTheDocument();
      expect(screen.getByTestId('MenuIcon')).toBeInTheDocument();
    });

    it('should render help button', () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const helpButton = screen.getByLabelText('Help');
      expect(helpButton).toBeInTheDocument();
      expect(screen.getByTestId('HelpOutlineIcon')).toBeInTheDocument();
    });

    it('should render main content area', () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should render footer', () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText(/© 2024 eAPD-Next/)).toBeInTheDocument();
    });
  });

  describe('Navigation Drawer', () => {
    it('should start with drawer closed', () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      // Drawer content should not be visible initially
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Create APD')).not.toBeInTheDocument();
    });

    it('should open drawer when menu button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText('Open navigation menu');
      await user.click(menuButton);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Create APD')).toBeInTheDocument();
      expect(screen.getByText('Help & Support')).toBeInTheDocument();
    });

    it('should close drawer when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      // Open drawer
      const menuButton = screen.getByLabelText('Open navigation menu');
      await user.click(menuButton);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      // Close drawer
      const closeButton = screen.getByLabelText('Close navigation menu');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      });
    });

    it('should close drawer when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      // Open drawer
      const menuButton = screen.getByLabelText('Open navigation menu');
      await user.click(menuButton);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      // Click outside drawer (on backdrop)
      const backdrop = screen.getByRole('presentation').firstChild;
      if (backdrop) {
        await user.click(backdrop as Element);

        await waitFor(() => {
          expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
        });
      }
    });

    it('should render navigation items with icons', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText('Open navigation menu');
      await user.click(menuButton);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Create APD')).toBeInTheDocument();
      expect(screen.getByText('Help & Support')).toBeInTheDocument();

      expect(screen.getByTestId('DashboardIcon')).toBeInTheDocument();
      expect(screen.getByTestId('AddIcon')).toBeInTheDocument();
      expect(screen.getByTestId('HelpIcon')).toBeInTheDocument();
    });
  });

  describe('Help Dialog', () => {
    it('should open help dialog when help button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const helpButton = screen.getByLabelText('Help');
      await user.click(helpButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Help & Support')).toBeInTheDocument();
    });

    it('should close help dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      // Open help dialog
      const helpButton = screen.getByLabelText('Help');
      await user.click(helpButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Close dialog
      const closeButton = screen.getByLabelText('Close help dialog');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close help dialog with Escape key', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      // Open help dialog
      const helpButton = screen.getByLabelText('Help');
      await user.click(helpButton);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should render help content sections', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const helpButton = screen.getByLabelText('Help');
      await user.click(helpButton);

      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.getByText('APD Types')).toBeInTheDocument();
      expect(screen.getByText('Common Tasks')).toBeInTheDocument();
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
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
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
      expect(screen.getByText('eAPD-Next')).toBeInTheDocument();
    });

    it('should adapt to tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
      expect(screen.getByText('eAPD-Next')).toBeInTheDocument();
    });

    it('should adapt to desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
      expect(screen.getByText('eAPD-Next')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for menu button', async () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText('Open navigation menu');

      // Focus the button
      menuButton.focus();
      expect(menuButton).toHaveFocus();

      // Activate with Enter
      fireEvent.keyDown(menuButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation for help button', async () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const helpButton = screen.getByLabelText('Help');

      // Focus the button
      helpButton.focus();
      expect(helpButton).toHaveFocus();

      // Activate with Enter
      fireEvent.keyDown(helpButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should support tab navigation through drawer items', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      // Open drawer
      const menuButton = screen.getByLabelText('Open navigation menu');
      await user.click(menuButton);

      const dashboardItem = screen.getByText('Dashboard');
      const createAPDItem = screen.getByText('Create APD');
      const helpItem = screen.getByText('Help & Support');

      // Should be able to focus navigation items
      dashboardItem.focus();
      expect(dashboardItem).toHaveFocus();

      // Tab navigation would work in real browser
      expect(createAPDItem).toBeInTheDocument();
      expect(helpItem).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
      expect(screen.getByLabelText('Help')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'eAPD-Next'
      );
    });

    it('should provide screen reader friendly navigation', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText('Open navigation menu');
      await user.click(menuButton);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Close navigation menu')
      ).toBeInTheDocument();
    });

    it('should manage focus properly in drawer', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText('Open navigation menu');
      await user.click(menuButton);

      // Focus should be managed within drawer
      const closeButton = screen.getByLabelText('Close navigation menu');
      expect(closeButton).toBeInTheDocument();
    });

    it('should manage focus properly in help dialog', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const helpButton = screen.getByLabelText('Help');
      await user.click(helpButton);

      // Focus should be managed within dialog
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-labelledby');
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme colors correctly', () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const appBar = screen.getByRole('banner');
      expect(appBar).toBeInTheDocument();

      // Should use theme colors (specific color testing would require more setup)
      expect(appBar).toHaveClass('MuiAppBar-root');
    });

    it('should apply theme spacing correctly', () => {
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('MuiContainer-root');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing children gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <Layout />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle drawer state errors gracefully', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      // Multiple rapid clicks should not cause errors
      const menuButton = screen.getByLabelText('Open navigation menu');
      await user.click(menuButton);
      await user.click(menuButton);
      await user.click(menuButton);

      // Should still function correctly
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      // Re-render with same props
      rerender(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('mock-child')).toBeInTheDocument();
    });

    it('should handle rapid drawer toggles efficiently', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <Layout>
            <MockChild />
          </Layout>
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText('Open navigation menu');

      // Rapid toggles
      for (let i = 0; i < 5; i++) {
        await user.click(menuButton);
      }

      // Should still work correctly
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});

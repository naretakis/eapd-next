import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Layout } from './Layout';
import theme from '@/theme/theme';

// Mock console.log to avoid noise in tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

// Helper function to render component with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Layout Component', () => {
  afterEach(() => {
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('renders with default title', () => {
    renderWithTheme(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    expect(
      screen.getByRole('heading', { name: /eapd-next/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    renderWithTheme(
      <Layout title="Custom Title">
        <div>Test content</div>
      </Layout>
    );

    expect(
      screen.getByRole('heading', { name: /custom title/i })
    ).toBeInTheDocument();
  });

  it('shows navigation elements by default', () => {
    renderWithTheme(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    expect(screen.getByLabelText(/open navigation menu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/go to dashboard/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/get help/i)).toBeInTheDocument();
  });

  it('hides navigation when showNavigation is false', () => {
    renderWithTheme(
      <Layout showNavigation={false}>
        <div>Test content</div>
      </Layout>
    );

    expect(
      screen.queryByLabelText(/open navigation menu/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/go to dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/get help/i)).not.toBeInTheDocument();
  });

  it('handles menu button click', () => {
    renderWithTheme(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const menuButton = screen.getByLabelText(/open navigation menu/i);
    fireEvent.click(menuButton);

    expect(mockConsoleLog).toHaveBeenCalledWith('Menu clicked');
  });

  it('handles home button click', () => {
    renderWithTheme(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const homeButton = screen.getByLabelText(/go to dashboard/i);
    fireEvent.click(homeButton);

    expect(mockConsoleLog).toHaveBeenCalledWith('Home clicked');
  });

  it('handles help button click', () => {
    renderWithTheme(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const helpButton = screen.getByLabelText(/get help/i);
    fireEvent.click(helpButton);

    expect(mockConsoleLog).toHaveBeenCalledWith('Help clicked');
  });

  it('displays version in footer', () => {
    renderWithTheme(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    expect(screen.getByText(/eapd-next v/i)).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    renderWithTheme(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    // Check for proper semantic elements
    expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
  });

  it('has accessible button labels', () => {
    renderWithTheme(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    // All buttons should have accessible labels
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });
});

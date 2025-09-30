import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MilkdownEditor } from './MilkdownEditor';
import theme from '@/theme/theme';

// Mock Milkdown modules since they require DOM manipulation and complex setup
jest.mock('@milkdown/crepe', () => ({
  Crepe: jest.fn().mockImplementation(() => ({
    create: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn(),
    editor: {
      action: jest.fn().mockReturnValue(''),
    },
  })),
}));

// Mock CSS imports
jest.mock('@milkdown/crepe/theme/common/style.css', () => ({}));
jest.mock('@milkdown/crepe/theme/frame.css', () => ({}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('MilkdownEditor', () => {
  it('should render with default props', () => {
    renderWithTheme(<MilkdownEditor />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render with label', () => {
    renderWithTheme(<MilkdownEditor label="Project Description" />);

    expect(screen.getByText('Project Description')).toBeInTheDocument();
  });

  it('should show required indicator when required', () => {
    renderWithTheme(<MilkdownEditor label="Required Field" required />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should display helper text', () => {
    const helperText = 'Enter a detailed description';
    renderWithTheme(
      <MilkdownEditor label="Description" helperText={helperText} />
    );

    expect(screen.getByText(helperText)).toBeInTheDocument();
  });

  it('should apply error styling when error prop is true', () => {
    renderWithTheme(
      <MilkdownEditor
        label="Error Field"
        error
        helperText="This field has an error"
      />
    );

    const helperText = screen.getByText('This field has an error');
    expect(helperText).toHaveStyle({ color: 'rgb(211, 47, 47)' }); // error.main color
  });

  it('should be accessible with proper ARIA attributes', () => {
    renderWithTheme(
      <MilkdownEditor
        label="Accessible Editor"
        required
        helperText="Helper text"
      />
    );

    const textbox = screen.getByRole('textbox');
    expect(textbox).toHaveAttribute('aria-label', 'Accessible Editor');
    expect(textbox).toHaveAttribute('aria-required', 'true');
    expect(textbox).toHaveAttribute(
      'aria-describedby',
      'Accessible Editor-helper-text'
    );
  });
});

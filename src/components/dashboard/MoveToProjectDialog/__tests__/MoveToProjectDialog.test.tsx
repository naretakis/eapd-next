import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers';
import { MoveToProjectDialog } from '../MoveToProjectDialog';
import { Project } from '@/types/apd';

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Test Project 1',
    description: 'Test description',
    apdIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'project-2',
    name: 'Test Project 2',
    apdIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('MoveToProjectDialog', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onMove: jest.fn(),
    documentName: 'Test Document',
    availableProjects: mockProjects,
  };

  it('renders when open', () => {
    renderWithTheme(<MoveToProjectDialog {...defaultProps} />);

    expect(screen.getByText('Move Document')).toBeInTheDocument();
    expect(screen.getByText('Test Document')).toBeInTheDocument();
  });

  it('shows existing projects in dropdown', () => {
    renderWithTheme(<MoveToProjectDialog {...defaultProps} />);

    expect(screen.getByText('Existing Project')).toBeInTheDocument();
  });

  it('shows new project option', () => {
    renderWithTheme(<MoveToProjectDialog {...defaultProps} />);

    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('shows ungrouped option', () => {
    renderWithTheme(<MoveToProjectDialog {...defaultProps} />);

    expect(screen.getByText('Ungrouped (No Project)')).toBeInTheDocument();
  });
});

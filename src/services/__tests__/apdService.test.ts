/**
 * APD Service Tests
 *
 * Comprehensive tests for the APD service business logic including
 * creation, validation, project grouping, and workflow management.
 */

import { APDService } from '../apdService';
import { APD, APDType, Project } from '../../types/apd';
import { APDTemplate } from '../../types/template';
import { storageService } from '../database';

// Mock the storage service
jest.mock('../database', () => ({
  storageService: {
    storeAPD: jest.fn(),
    getAPD: jest.fn(),
    updateAPD: jest.fn(),
    deleteAPD: jest.fn(),
    getAllAPDs: jest.fn(),
    getTemplate: jest.fn(),
    getTemplatesByType: jest.fn(),
    storeProject: jest.fn(),
    getProject: jest.fn(),
    updateProject: jest.fn(),
    getAllProjects: jest.fn(),
  },
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

describe('APDService', () => {
  let apdService: APDService;

  const mockTemplate: APDTemplate = {
    id: 'papd-template-v1',
    type: 'PAPD',
    version: '1.0',
    name: 'Planning APD Template',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        fields: [
          {
            id: 'project-overview',
            name: 'projectOverview',
            label: 'Project Overview',
            type: 'textarea',
            required: true,
            defaultValue: '',
          },
        ],
        isRequired: true,
        order: 1,
      },
    ],
    validationRules: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProject: Project = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test project description',
    apdIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    apdService = new APDService();
    jest.clearAllMocks();
  });

  describe('createAPD', () => {
    beforeEach(() => {
      (storageService.getTemplatesByType as jest.Mock).mockResolvedValue([
        mockTemplate,
      ]);
      (storageService.storeAPD as jest.Mock).mockResolvedValue(undefined);
    });

    it('should create a new APD with template', async () => {
      const metadata = {
        stateName: 'Test State',
        stateAgency: 'Test Agency',
        projectName: 'Test Project',
      };

      const result = await apdService.createAPD('PAPD', metadata);

      expect(result).toMatchObject({
        id: 'mock-uuid-123',
        type: 'PAPD',
        metadata: expect.objectContaining(metadata),
      });
      expect(result.sections).toHaveProperty('executive-summary');
      expect(storageService.storeAPD).toHaveBeenCalledWith(result);
    });

    it('should create APD with specific template', async () => {
      (storageService.getTemplate as jest.Mock).mockResolvedValue(mockTemplate);

      const result = await apdService.createAPD(
        'PAPD',
        {},
        { templateId: 'papd-template-v1' }
      );

      expect(storageService.getTemplate).toHaveBeenCalledWith(
        'papd-template-v1'
      );
      expect(result.sections).toHaveProperty('executive-summary');
    });

    it('should copy from existing APD', async () => {
      const sourceAPD: APD = {
        id: 'source-apd',
        type: 'PAPD',
        metadata: {
          stateName: 'Source State',
          stateAgency: 'Source Agency',
          primaryContact: {
            name: 'John Doe',
            title: 'Manager',
            email: 'john@test.gov',
            phone: '555-1234',
          },
          documentType: 'PAPD',
          benefitsMultiplePrograms: false,
          projectName: 'Source Project',
        },
        sections: {
          'executive-summary': {
            sectionId: 'executive-summary',
            title: 'Executive Summary',
            content: { projectOverview: 'Source overview' },
            isComplete: true,
            lastModified: new Date(),
          },
        },
        validationState: {
          isValid: true,
          errors: [],
          warnings: [],
          lastValidated: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        currentVersion: 'v1.0',
        versions: [],
      };

      (storageService.getAPD as jest.Mock).mockResolvedValue(sourceAPD);

      const result = await apdService.createAPD(
        'PAPD',
        {},
        { copyFromAPDId: 'source-apd' }
      );

      expect(result.sections).toEqual(sourceAPD.sections);
    });

    it('should associate with project', async () => {
      (storageService.getProject as jest.Mock).mockResolvedValue(mockProject);
      (storageService.updateProject as jest.Mock).mockResolvedValue(undefined);

      await apdService.createAPD('PAPD', {}, { projectId: 'project-1' });

      expect(storageService.getProject).toHaveBeenCalledWith('project-1');
      expect(storageService.updateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          apdIds: ['mock-uuid-123'],
        })
      );
    });
  });

  describe('getAPD', () => {
    it('should retrieve APD by ID', async () => {
      const mockAPD = { id: 'test-apd', type: 'PAPD' } as APD;
      (storageService.getAPD as jest.Mock).mockResolvedValue(mockAPD);

      const result = await apdService.getAPD('test-apd');

      expect(result).toEqual(mockAPD);
      expect(storageService.getAPD).toHaveBeenCalledWith('test-apd');
    });

    it('should return null for non-existent APD', async () => {
      (storageService.getAPD as jest.Mock).mockResolvedValue(null);

      const result = await apdService.getAPD('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateAPD', () => {
    const mockAPD: APD = {
      id: 'test-apd',
      type: 'PAPD',
      metadata: {
        stateName: 'Test State',
        stateAgency: 'Test Agency',
        primaryContact: {
          name: 'John Doe',
          title: 'Manager',
          email: 'john@test.gov',
          phone: '555-1234',
        },
        documentType: 'PAPD',
        benefitsMultiplePrograms: false,
        projectName: 'Test Project',
      },
      sections: {},
      validationState: {
        isValid: true,
        errors: [],
        warnings: [],
        lastValidated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      currentVersion: 'v1.0',
      versions: [],
    };

    beforeEach(() => {
      (storageService.updateAPD as jest.Mock).mockResolvedValue(undefined);
      (storageService.getTemplatesByType as jest.Mock).mockResolvedValue([
        mockTemplate,
      ]);
    });

    it('should update APD with validation', async () => {
      const result = await apdService.updateAPD(mockAPD, true);

      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.validationState.lastValidated).toBeInstanceOf(Date);
      expect(storageService.updateAPD).toHaveBeenCalledWith(result);
    });

    it('should update APD without validation', async () => {
      const result = await apdService.updateAPD(mockAPD, false);

      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(storageService.updateAPD).toHaveBeenCalledWith(result);
    });
  });

  describe('deleteAPD', () => {
    beforeEach(() => {
      (storageService.getAllProjects as jest.Mock).mockResolvedValue([
        { ...mockProject, apdIds: ['test-apd', 'other-apd'] },
      ]);
      (storageService.updateProject as jest.Mock).mockResolvedValue(undefined);
      (storageService.deleteAPD as jest.Mock).mockResolvedValue(undefined);
    });

    it('should delete APD and remove from projects', async () => {
      await apdService.deleteAPD('test-apd');

      expect(storageService.updateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          apdIds: ['other-apd'],
        })
      );
      expect(storageService.deleteAPD).toHaveBeenCalledWith('test-apd');
    });
  });

  describe('duplicateAPD', () => {
    const sourceAPD: APD = {
      id: 'source-apd',
      type: 'PAPD',
      metadata: {
        stateName: 'Source State',
        stateAgency: 'Source Agency',
        primaryContact: {
          name: 'John Doe',
          title: 'Manager',
          email: 'john@test.gov',
          phone: '555-1234',
        },
        documentType: 'PAPD',
        benefitsMultiplePrograms: false,
        projectName: 'Source Project',
      },
      sections: {},
      validationState: {
        isValid: true,
        errors: [],
        warnings: [],
        lastValidated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      currentVersion: 'v1.0',
      versions: [],
    };

    beforeEach(() => {
      (storageService.getAPD as jest.Mock).mockResolvedValue(sourceAPD);
      (storageService.getTemplatesByType as jest.Mock).mockResolvedValue([
        mockTemplate,
      ]);
      (storageService.storeAPD as jest.Mock).mockResolvedValue(undefined);
    });

    it('should duplicate existing APD', async () => {
      const newMetadata = { projectName: 'Duplicated Project' };

      const result = await apdService.duplicateAPD('source-apd', newMetadata);

      expect(result.id).toBe('mock-uuid-123');
      expect(result.metadata.projectName).toBe('Duplicated Project');
      expect(result.metadata.stateName).toBe('Source State');
    });

    it('should throw error for non-existent source APD', async () => {
      (storageService.getAPD as jest.Mock).mockResolvedValue(null);

      await expect(apdService.duplicateAPD('non-existent')).rejects.toThrow(
        'Failed to duplicate APD'
      );
    });
  });

  describe('getAllAPDs', () => {
    const mockAPDs = [
      {
        id: 'apd-1',
        type: 'PAPD' as APDType,
        projectName: 'Project A',
        lastModified: new Date('2023-01-01'),
        completionStatus: 80,
        isComplete: false,
        currentVersion: 'v1.0',
        hasUncommittedChanges: false,
      },
      {
        id: 'apd-2',
        type: 'IAPD' as APDType,
        projectName: 'Project B',
        lastModified: new Date('2023-02-01'),
        completionStatus: 100,
        isComplete: true,
        currentVersion: 'v1.0',
        hasUncommittedChanges: false,
      },
    ];

    beforeEach(() => {
      (storageService.getAllAPDs as jest.Mock).mockResolvedValue(mockAPDs);
    });

    it('should get all APDs without filters', async () => {
      const result = await apdService.getAllAPDs();

      expect(result).toEqual(mockAPDs);
    });

    it('should filter by type', async () => {
      const result = await apdService.getAllAPDs({ type: 'PAPD' });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('PAPD');
    });

    it('should filter by status', async () => {
      const result = await apdService.getAllAPDs({ status: 'complete' });

      expect(result).toHaveLength(1);
      expect(result[0].isComplete).toBe(true);
    });

    it('should filter by query', async () => {
      const result = await apdService.getAllAPDs({ query: 'Project A' });

      expect(result).toHaveLength(1);
      expect(result[0].projectName).toBe('Project A');
    });

    it('should filter by date range', async () => {
      const result = await apdService.getAllAPDs({
        dateRange: {
          start: new Date('2023-01-15'),
          end: new Date('2023-02-15'),
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('apd-2');
    });
  });

  describe('validateAPD', () => {
    const mockAPD: APD = {
      id: 'test-apd',
      type: 'PAPD',
      metadata: {
        stateName: '',
        stateAgency: 'Test Agency',
        primaryContact: {
          name: 'John Doe',
          title: 'Manager',
          email: 'invalid-email',
          phone: '555-1234',
        },
        documentType: 'PAPD',
        benefitsMultiplePrograms: false,
        projectName: 'Test Project',
      },
      sections: {
        'executive-summary': {
          sectionId: 'executive-summary',
          title: 'Executive Summary',
          content: { projectOverview: '' },
          isComplete: false,
          lastModified: new Date(),
        },
      },
      validationState: {
        isValid: false,
        errors: [],
        warnings: [],
        lastValidated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      currentVersion: 'v1.0',
      versions: [],
    };

    beforeEach(() => {
      (storageService.getTemplatesByType as jest.Mock).mockResolvedValue([
        mockTemplate,
      ]);
      (storageService.getAllAPDs as jest.Mock).mockResolvedValue([]);
    });

    it('should validate APD and return errors', async () => {
      const result = await apdService.validateAPD(mockAPD);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fieldId: 'stateName',
            message: 'State name is required',
          }),
          expect.objectContaining({
            fieldId: 'primaryContact.email',
            message: 'Primary contact email is not valid',
          }),
          expect.objectContaining({
            fieldId: 'projectOverview',
            message: 'Required field "Project Overview" is empty',
          }),
        ])
      );
    });

    it('should validate business rules', async () => {
      const iapdAPD = { ...mockAPD, type: 'IAPD' as APDType };

      const result = await apdService.validateAPD(iapdAPD);

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: 'IAPD should typically have a corresponding PAPD',
          }),
        ])
      );
    });
  });

  describe('Project Management', () => {
    beforeEach(() => {
      (storageService.storeProject as jest.Mock).mockResolvedValue(undefined);
      (storageService.getProject as jest.Mock).mockResolvedValue(mockProject);
      (storageService.updateProject as jest.Mock).mockResolvedValue(undefined);
    });

    it('should create a new project', async () => {
      const result = await apdService.createProject(
        'New Project',
        'Description'
      );

      expect(result).toMatchObject({
        id: 'mock-uuid-123',
        name: 'New Project',
        description: 'Description',
        apdIds: [],
      });
      expect(storageService.storeProject).toHaveBeenCalledWith(result);
    });

    it('should add APD to project', async () => {
      await apdService.addAPDToProject('apd-1', 'project-1');

      expect(storageService.updateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          apdIds: expect.arrayContaining(['apd-1']),
        })
      );
    });

    it('should remove APD from project', async () => {
      const projectWithAPDs = { ...mockProject, apdIds: ['apd-1', 'apd-2'] };
      (storageService.getProject as jest.Mock).mockResolvedValue(
        projectWithAPDs
      );

      await apdService.removeAPDFromProject('apd-1', 'project-1');

      expect(storageService.updateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          apdIds: ['apd-2'],
        })
      );
    });
  });

  describe('getAPDsByProject', () => {
    const mockAPDs = [
      {
        id: 'apd-1',
        type: 'PAPD' as APDType,
        projectName: 'Project A',
        lastModified: new Date(),
        completionStatus: 80,
        isComplete: false,
        currentVersion: 'v1.0',
        hasUncommittedChanges: false,
      },
      {
        id: 'apd-2',
        type: 'IAPD' as APDType,
        projectName: 'Project B',
        lastModified: new Date(),
        completionStatus: 100,
        isComplete: true,
        currentVersion: 'v1.0',
        hasUncommittedChanges: false,
      },
    ];

    const mockProjects = [{ ...mockProject, apdIds: ['apd-1'] }];

    beforeEach(() => {
      (storageService.getAllAPDs as jest.Mock).mockResolvedValue(mockAPDs);
      (storageService.getAllProjects as jest.Mock).mockResolvedValue(
        mockProjects
      );
    });

    it('should group APDs by project', async () => {
      const result = await apdService.getAPDsByProject();

      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].apds).toHaveLength(1);
      expect(result.projects[0].apds[0].id).toBe('apd-1');
      expect(result.ungrouped).toHaveLength(1);
      expect(result.ungrouped[0].id).toBe('apd-2');
    });
  });

  describe('getCompletionStats', () => {
    const mockAPDs = [
      {
        id: 'apd-1',
        type: 'PAPD' as APDType,
        projectName: 'Project A',
        lastModified: new Date(),
        completionStatus: 80,
        isComplete: false,
        currentVersion: 'v1.0',
        hasUncommittedChanges: false,
      },
      {
        id: 'apd-2',
        type: 'PAPD' as APDType,
        projectName: 'Project B',
        lastModified: new Date(),
        completionStatus: 100,
        isComplete: true,
        currentVersion: 'v1.0',
        hasUncommittedChanges: false,
      },
      {
        id: 'apd-3',
        type: 'IAPD' as APDType,
        projectName: 'Project C',
        lastModified: new Date(),
        completionStatus: 100,
        isComplete: true,
        currentVersion: 'v1.0',
        hasUncommittedChanges: false,
      },
    ];

    beforeEach(() => {
      (storageService.getAllAPDs as jest.Mock).mockResolvedValue(mockAPDs);
    });

    it('should calculate completion statistics', async () => {
      const result = await apdService.getCompletionStats();

      expect(result).toEqual({
        total: 3,
        completed: 2,
        inProgress: 1,
        byType: {
          PAPD: { total: 2, completed: 1 },
          IAPD: { total: 1, completed: 1 },
          OAPD: { total: 0, completed: 0 },
          AoA: { total: 0, completed: 0 },
          'Acquisition Checklist': { total: 0, completed: 0 },
        },
      });
    });
  });
});

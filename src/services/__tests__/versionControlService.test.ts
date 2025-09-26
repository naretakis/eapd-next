/**
 * Version Control Service Tests
 *
 * Tests for the version control functionality including working copies,
 * commits, version history, and change tracking.
 */

import { VersionControlService } from '../versionControlService';
import { APD, APDVersion, APDWorkingCopy, FieldChange } from '../../types/apd';
import { storageService } from '../database';

// Mock the storage service
jest.mock('../database', () => ({
  storageService: {
    getWorkingCopy: jest.fn(),
    storeWorkingCopy: jest.fn(),
    updateWorkingCopy: jest.fn(),
    getAPD: jest.fn(),
    updateAPD: jest.fn(),
    storeVersion: jest.fn(),
    getVersion: jest.fn(),
    getVersionHistory: jest.fn(),
    getFieldChanges: jest.fn(),
  },
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

describe('VersionControlService', () => {
  let versionControlService: VersionControlService;

  const mockAPD: APD = {
    id: 'test-apd-1',
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
    sections: {
      'executive-summary': {
        sectionId: 'executive-summary',
        title: 'Executive Summary',
        content: { overview: 'Test overview' },
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
    currentVersion: 'version-1',
    versions: [],
  };

  const mockWorkingCopy: APDWorkingCopy = {
    id: 'working-copy-1',
    apdId: 'test-apd-1',
    baseVersionId: 'version-1',
    sections: {
      'executive-summary': {
        sectionId: 'executive-summary',
        title: 'Executive Summary',
        content: { overview: 'Modified overview' },
        isComplete: true,
        lastModified: new Date(),
      },
    },
    changes: [
      {
        id: 'change-1',
        fieldPath: 'sections.executive-summary.content.overview',
        fieldLabel: 'Overview',
        oldValue: 'Test overview',
        newValue: 'Modified overview',
        changeType: 'modified',
        timestamp: new Date(),
        section: 'executive-summary',
      },
    ],
    lastModified: new Date(),
    hasUncommittedChanges: true,
  };

  const mockVersion: APDVersion = {
    id: 'version-2',
    apdId: 'test-apd-1',
    versionNumber: 'v1.1',
    commitMessage: 'Updated overview',
    author: 'Test User',
    timestamp: new Date(),
    sections: mockWorkingCopy.sections,
    changesSinceLastVersion: mockWorkingCopy.changes,
    parentVersionId: 'version-1',
  };

  beforeEach(() => {
    versionControlService = new VersionControlService();
    jest.clearAllMocks();
  });

  describe('getWorkingCopy', () => {
    it('should return existing working copy', async () => {
      (storageService.getWorkingCopy as jest.Mock).mockResolvedValue(
        mockWorkingCopy
      );

      const result = await versionControlService.getWorkingCopy('test-apd-1');

      expect(result).toEqual(mockWorkingCopy);
      expect(storageService.getWorkingCopy).toHaveBeenCalledWith('test-apd-1');
    });

    it('should create new working copy if none exists', async () => {
      (storageService.getWorkingCopy as jest.Mock).mockResolvedValue(null);
      (storageService.getAPD as jest.Mock).mockResolvedValue(mockAPD);
      (storageService.storeWorkingCopy as jest.Mock).mockResolvedValue(
        undefined
      );

      const result = await versionControlService.getWorkingCopy('test-apd-1');

      expect(result).toMatchObject({
        id: 'mock-uuid-123',
        apdId: 'test-apd-1',
        baseVersionId: 'version-1',
        hasUncommittedChanges: false,
      });
      expect(storageService.storeWorkingCopy).toHaveBeenCalled();
    });

    it('should throw error if APD not found', async () => {
      (storageService.getWorkingCopy as jest.Mock).mockResolvedValue(null);
      (storageService.getAPD as jest.Mock).mockResolvedValue(null);

      await expect(
        versionControlService.getWorkingCopy('non-existent')
      ).rejects.toThrow('Failed to get working copy for APD');
    });
  });

  describe('updateWorkingCopy', () => {
    beforeEach(() => {
      (storageService.getWorkingCopy as jest.Mock).mockResolvedValue(
        mockWorkingCopy
      );
      (storageService.updateWorkingCopy as jest.Mock).mockResolvedValue(
        undefined
      );
    });

    it('should update working copy with changes', async () => {
      const changes = {
        sections: {
          'executive-summary': {
            ...mockWorkingCopy.sections['executive-summary'],
            content: { overview: 'Updated overview again' },
          },
        },
      };

      const result = await versionControlService.updateWorkingCopy(
        'test-apd-1',
        changes
      );

      expect(result.hasUncommittedChanges).toBe(true);
      expect(result.lastModified).toBeInstanceOf(Date);
      expect(storageService.updateWorkingCopy).toHaveBeenCalledWith(result);
    });
  });

  describe('commitChanges', () => {
    beforeEach(() => {
      (storageService.getAPD as jest.Mock).mockResolvedValue(mockAPD);
      (storageService.getWorkingCopy as jest.Mock).mockResolvedValue(
        mockWorkingCopy
      );
      (storageService.getVersionHistory as jest.Mock).mockResolvedValue([
        { versionNumber: 'v1.0', timestamp: new Date('2023-01-01') },
      ]);
      (storageService.storeVersion as jest.Mock).mockResolvedValue(undefined);
      (storageService.updateAPD as jest.Mock).mockResolvedValue(undefined);
      (storageService.updateWorkingCopy as jest.Mock).mockResolvedValue(
        undefined
      );
    });

    it('should commit changes and create new version', async () => {
      const commitOptions = {
        message: 'Updated overview',
        author: 'Test User',
      };

      const result = await versionControlService.commitChanges(
        'test-apd-1',
        commitOptions
      );

      expect(result).toMatchObject({
        id: 'mock-uuid-123',
        apdId: 'test-apd-1',
        versionNumber: 'v1.1',
        commitMessage: 'Updated overview',
        author: 'Test User',
      });
      expect(storageService.storeVersion).toHaveBeenCalledWith(result);
      expect(storageService.updateAPD).toHaveBeenCalled();
      expect(storageService.updateWorkingCopy).toHaveBeenCalled();
    });

    it('should throw error if no uncommitted changes', async () => {
      const workingCopyWithoutChanges = {
        ...mockWorkingCopy,
        hasUncommittedChanges: false,
      };
      (storageService.getWorkingCopy as jest.Mock).mockResolvedValue(
        workingCopyWithoutChanges
      );

      await expect(
        versionControlService.commitChanges('test-apd-1', {
          message: 'Test commit',
          author: 'Test User',
        })
      ).rejects.toThrow('Failed to commit changes for APD');
    });

    it('should generate correct version numbers', async () => {
      const existingVersions = [
        { versionNumber: 'v1.0', timestamp: new Date('2023-01-01') },
        { versionNumber: 'v1.5', timestamp: new Date('2023-02-01') },
        { versionNumber: 'v1.2', timestamp: new Date('2023-01-15') },
      ];
      (storageService.getVersionHistory as jest.Mock).mockResolvedValue(
        existingVersions
      );

      const result = await versionControlService.commitChanges('test-apd-1', {
        message: 'Test commit',
        author: 'Test User',
      });

      expect(result.versionNumber).toBe('v1.6'); // Should be latest + 1
    });
  });

  describe('getVersionHistory', () => {
    it('should return version history', async () => {
      const mockVersions = [mockVersion];
      (storageService.getVersionHistory as jest.Mock).mockResolvedValue(
        mockVersions
      );

      const result =
        await versionControlService.getVersionHistory('test-apd-1');

      expect(result).toEqual(mockVersions);
      expect(storageService.getVersionHistory).toHaveBeenCalledWith(
        'test-apd-1'
      );
    });
  });

  describe('getVersion', () => {
    it('should return specific version', async () => {
      (storageService.getVersion as jest.Mock).mockResolvedValue(mockVersion);

      const result = await versionControlService.getVersion('version-2');

      expect(result).toEqual(mockVersion);
      expect(storageService.getVersion).toHaveBeenCalledWith('version-2');
    });

    it('should return null for non-existent version', async () => {
      (storageService.getVersion as jest.Mock).mockResolvedValue(null);

      const result = await versionControlService.getVersion('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('compareVersions', () => {
    const version1: APDVersion = {
      id: 'version-1',
      apdId: 'test-apd-1',
      versionNumber: 'v1.0',
      commitMessage: 'Initial version',
      author: 'Test User',
      timestamp: new Date(),
      sections: {
        'executive-summary': {
          sectionId: 'executive-summary',
          title: 'Executive Summary',
          content: { overview: 'Original overview' },
          isComplete: true,
          lastModified: new Date(),
        },
      },
      changesSinceLastVersion: [],
      parentVersionId: undefined,
    };

    const version2: APDVersion = {
      ...mockVersion,
      sections: {
        'executive-summary': {
          sectionId: 'executive-summary',
          title: 'Executive Summary',
          content: { overview: 'Modified overview' },
          isComplete: true,
          lastModified: new Date(),
        },
      },
    };

    beforeEach(() => {
      (storageService.getVersion as jest.Mock).mockImplementation(
        (id: string) => {
          if (id === 'version-1') return Promise.resolve(version1);
          if (id === 'version-2') return Promise.resolve(version2);
          return Promise.resolve(null);
        }
      );
    });

    it('should compare versions and generate diff', async () => {
      const result = await versionControlService.compareVersions(
        'test-apd-1',
        'version-1',
        'version-2'
      );

      expect(result).toMatchObject({
        fromVersion: 'version-1',
        toVersion: 'version-2',
        summary: {
          sectionsModified: ['executive-summary'],
          fieldsModified: 1,
        },
      });
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0]).toMatchObject({
        fieldPath: 'sections.executive-summary.content.overview',
        changeType: 'modified',
        oldValue: 'Original overview',
        newValue: 'Modified overview',
      });
    });

    it('should throw error for non-existent versions', async () => {
      await expect(
        versionControlService.compareVersions(
          'test-apd-1',
          'non-existent',
          'version-2'
        )
      ).rejects.toThrow('Failed to compare versions');
    });
  });

  describe('revertToVersion', () => {
    beforeEach(() => {
      (storageService.getAPD as jest.Mock).mockResolvedValue(mockAPD);
      (storageService.getVersion as jest.Mock).mockResolvedValue(mockVersion);
      (storageService.storeWorkingCopy as jest.Mock).mockResolvedValue(
        undefined
      );
      (storageService.updateAPD as jest.Mock).mockResolvedValue(undefined);
    });

    it('should revert to specific version', async () => {
      const result = await versionControlService.revertToVersion(
        'test-apd-1',
        'version-2'
      );

      expect(result).toMatchObject({
        id: 'mock-uuid-123',
        apdId: 'test-apd-1',
        baseVersionId: 'version-2',
        hasUncommittedChanges: true,
      });
      expect(result.sections).toEqual(mockVersion.sections);
      expect(storageService.storeWorkingCopy).toHaveBeenCalled();
      expect(storageService.updateAPD).toHaveBeenCalled();
    });

    it('should preserve working copy if requested', async () => {
      const result = await versionControlService.revertToVersion(
        'test-apd-1',
        'version-2',
        { preserveWorkingCopy: true }
      );

      expect(result.hasUncommittedChanges).toBe(false);
      expect(storageService.updateAPD).not.toHaveBeenCalled();
    });

    it('should create backup if requested', async () => {
      (storageService.getWorkingCopy as jest.Mock).mockResolvedValue(
        mockWorkingCopy
      );
      (storageService.getVersionHistory as jest.Mock).mockResolvedValue([
        mockVersion,
      ]);
      (storageService.storeVersion as jest.Mock).mockResolvedValue(undefined);
      (storageService.updateWorkingCopy as jest.Mock).mockResolvedValue(
        undefined
      );

      await versionControlService.revertToVersion('test-apd-1', 'version-2', {
        createBackup: true,
      });

      expect(storageService.storeVersion).toHaveBeenCalled();
    });
  });

  describe('createWorkingCopyFromVersion', () => {
    beforeEach(() => {
      (storageService.getVersion as jest.Mock).mockResolvedValue(mockVersion);
      (storageService.storeWorkingCopy as jest.Mock).mockResolvedValue(
        undefined
      );
    });

    it('should create working copy from version', async () => {
      const result = await versionControlService.createWorkingCopyFromVersion(
        'test-apd-1',
        'version-2'
      );

      expect(result).toMatchObject({
        id: 'mock-uuid-123',
        apdId: 'test-apd-1',
        baseVersionId: 'version-2',
        hasUncommittedChanges: false,
      });
      expect(result.sections).toEqual(mockVersion.sections);
      expect(storageService.storeWorkingCopy).toHaveBeenCalled();
    });

    it('should throw error for non-existent version', async () => {
      (storageService.getVersion as jest.Mock).mockResolvedValue(null);

      await expect(
        versionControlService.createWorkingCopyFromVersion(
          'test-apd-1',
          'non-existent'
        )
      ).rejects.toThrow('Failed to create working copy from version');
    });
  });

  describe('getCurrentChanges', () => {
    it('should get current changes for APD', async () => {
      const mockChanges = [mockWorkingCopy.changes[0]];
      (storageService.getFieldChanges as jest.Mock).mockResolvedValue(
        mockChanges
      );

      const result =
        await versionControlService.getCurrentChanges('test-apd-1');

      expect(result).toEqual(mockChanges);
      expect(storageService.getFieldChanges).toHaveBeenCalledWith('test-apd-1');
    });
  });

  describe('generateChangeHighlights', () => {
    it('should generate change highlights', () => {
      const changes = [mockWorkingCopy.changes[0]];

      const result = versionControlService.generateChangeHighlights(changes);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        fieldPath: 'sections.executive-summary.content.overview',
        changeType: 'modified',
        displayType: 'inline',
      });
      expect(result[0].tooltip).toContain('Modified "Overview"');
    });
  });

  describe('generateInlineDiff', () => {
    it('should generate inline diff for text changes', () => {
      const change = mockWorkingCopy.changes[0];

      const result = versionControlService.generateInlineDiff(change);

      expect(result).toMatchObject({
        fieldPath: 'sections.executive-summary.content.overview',
        oldText: 'Test overview',
        newText: 'Modified overview',
      });
      expect(result.diffHtml).toContain('diff-deleted');
      expect(result.diffHtml).toContain('diff-added');
    });
  });
});

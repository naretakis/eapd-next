/**
 * APD Service Layer with Business Logic
 *
 * This service provides high-level business logic for APD management,
 * including creation, validation, project grouping, and workflow management.
 *
 * Features:
 * - APD lifecycle management (create, update, delete, duplicate)
 * - Real-time validation with business rules
 * - Project grouping and organization
 * - Template-based APD creation
 * - Completion status tracking
 */

import { v4 as uuidv4 } from 'uuid';
import {
  APD,
  APDType,
  APDListItem,
  Project,
  APDMetadata,
  APDSectionData,
  ValidationState,
  ValidationError,
  ValidationWarning,
} from '../types/apd';
import { APDTemplate, TemplateSection } from '../types/template';
import { storageService } from './database';
import { StorageError, StorageErrorCode } from '../types/database';

export interface CreateAPDOptions {
  projectId?: string;
  templateId?: string;
  copyFromAPDId?: string;
}

export interface APDValidationOptions {
  validateCompleteness?: boolean;
  validateConsistency?: boolean;
  validateBusinessRules?: boolean;
}

export interface ProjectGroupingOptions {
  groupBy?: 'project' | 'type' | 'status' | 'date';
  sortBy?: 'name' | 'date' | 'status';
  sortDirection?: 'asc' | 'desc';
}

export interface APDSearchOptions {
  query?: string;
  type?: APDType;
  projectId?: string;
  status?: 'complete' | 'incomplete' | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Main APD Service Class
 */
export class APDService {
  /**
   * Create a new APD with optional template and project association
   */
  async createAPD(
    type: APDType,
    metadata: Partial<APDMetadata>,
    options: CreateAPDOptions = {}
  ): Promise<APD> {
    try {
      const apdId = uuidv4();
      const now = new Date();

      // Get template if specified
      let template: APDTemplate | null = null;
      if (options.templateId) {
        template = await storageService.getTemplate(options.templateId);
        if (!template) {
          throw new Error(`Template not found: ${options.templateId}`);
        }
      } else {
        // Get default template for APD type
        const templates = await storageService.getTemplatesByType(type);
        template =
          templates.find(t => t.version === '1.0') || templates[0] || null;
      }

      // Initialize sections from template
      const sections: Record<string, APDSectionData> = {};
      if (template) {
        for (const templateSection of template.sections) {
          sections[templateSection.id] = {
            sectionId: templateSection.id,
            title: templateSection.title,
            content: this.initializeSectionContent(templateSection),
            isComplete: false,
            lastModified: now,
          };
        }
      }

      // Create APD
      const apd: APD = {
        id: apdId,
        type,
        metadata: {
          stateName: '',
          stateAgency: '',
          primaryContact: {
            name: '',
            title: '',
            email: '',
            phone: '',
          },
          documentType: type,
          benefitsMultiplePrograms: false,
          projectName: '',
          ...metadata,
        },
        sections,
        validationState: {
          isValid: false,
          errors: [],
          warnings: [],
          lastValidated: now,
        },
        createdAt: now,
        updatedAt: now,
        currentVersion: 'v1.0',
        versions: [],
      };

      // Copy from existing APD if specified
      if (options.copyFromAPDId) {
        const sourceAPD = await storageService.getAPD(options.copyFromAPDId);
        if (sourceAPD) {
          apd.sections = { ...sourceAPD.sections };
          apd.metadata = { ...sourceAPD.metadata, ...metadata };
        }
      }

      // Store the APD
      await storageService.storeAPD(apd);

      // Associate with project if specified
      if (options.projectId) {
        await this.addAPDToProject(apdId, options.projectId);
      }

      return apd;
    } catch (error) {
      throw new StorageError(
        `Failed to create APD: ${(error as Error).message}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Get APD by ID with validation
   */
  async getAPD(id: string): Promise<APD | null> {
    try {
      return await storageService.getAPD(id);
    } catch (error) {
      throw new StorageError(
        `Failed to get APD: ${id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Update APD with validation and change tracking
   */
  async updateAPD(apd: APD, validateBeforeSave: boolean = true): Promise<APD> {
    try {
      // Validate if requested
      if (validateBeforeSave) {
        const validationResult = await this.validateAPD(apd);
        apd.validationState = validationResult;
      }

      // Update timestamp
      apd.updatedAt = new Date();

      // Store the updated APD
      await storageService.updateAPD(apd);

      return apd;
    } catch (error) {
      throw new StorageError(
        `Failed to update APD: ${apd.id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Delete APD and clean up related data
   */
  async deleteAPD(id: string): Promise<void> {
    try {
      // Remove from projects
      const projects = await storageService.getAllProjects();
      for (const project of projects) {
        if (project.apdIds.includes(id)) {
          project.apdIds = project.apdIds.filter(apdId => apdId !== id);
          project.updatedAt = new Date();
          await storageService.updateProject(project);
        }
      }

      // Delete the APD (this also deletes related version data)
      await storageService.deleteAPD(id);
    } catch (error) {
      throw new StorageError(
        `Failed to delete APD: ${id}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Duplicate an existing APD
   */
  async duplicateAPD(
    sourceId: string,
    newMetadata?: Partial<APDMetadata>
  ): Promise<APD> {
    try {
      const sourceAPD = await storageService.getAPD(sourceId);
      if (!sourceAPD) {
        throw new Error(`Source APD not found: ${sourceId}`);
      }

      return await this.createAPD(
        sourceAPD.type,
        { ...sourceAPD.metadata, ...newMetadata },
        { copyFromAPDId: sourceId }
      );
    } catch (error) {
      throw new StorageError(
        `Failed to duplicate APD: ${sourceId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Get all APDs with optional filtering and sorting
   */
  async getAllAPDs(options: APDSearchOptions = {}): Promise<APDListItem[]> {
    try {
      let apds = await storageService.getAllAPDs();

      // Apply filters
      if (options.type) {
        apds = apds.filter(apd => apd.type === options.type);
      }

      if (options.status && options.status !== 'all') {
        apds = apds.filter(apd =>
          options.status === 'complete' ? apd.isComplete : !apd.isComplete
        );
      }

      if (options.projectId) {
        const project = await storageService.getProject(options.projectId);
        if (project) {
          apds = apds.filter(apd => project.apdIds.includes(apd.id));
        }
      }

      if (options.query) {
        const query = options.query.toLowerCase();
        apds = apds.filter(
          apd =>
            apd.projectName.toLowerCase().includes(query) ||
            apd.type.toLowerCase().includes(query)
        );
      }

      if (options.dateRange) {
        apds = apds.filter(
          apd =>
            apd.lastModified >= options.dateRange!.start &&
            apd.lastModified <= options.dateRange!.end
        );
      }

      return apds;
    } catch (error) {
      throw new StorageError(
        'Failed to get APDs',
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Validate APD with comprehensive business rules
   */
  async validateAPD(
    apd: APD,
    options: APDValidationOptions = {}
  ): Promise<ValidationState> {
    const opts = {
      validateCompleteness: true,
      validateConsistency: true,
      validateBusinessRules: true,
      ...options,
    };

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Get template for validation rules
      const templates = await storageService.getTemplatesByType(apd.type);
      const template = templates.find(t => t.version === '1.0') || templates[0];

      // Validate metadata
      this.validateMetadata(apd.metadata, errors, warnings);

      // Validate sections
      if (template && opts.validateCompleteness) {
        this.validateSectionCompleteness(apd, template, errors, warnings);
      }

      // Validate consistency
      if (opts.validateConsistency) {
        this.validateDataConsistency(apd, errors, warnings);
      }

      // Validate business rules
      if (opts.validateBusinessRules) {
        await this.validateBusinessRules(apd, errors, warnings);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        lastValidated: new Date(),
      };
    } catch (error) {
      errors.push({
        fieldId: 'validation',
        sectionId: 'system',
        message: `Validation failed: ${(error as Error).message}`,
        severity: 'error',
      });

      return {
        isValid: false,
        errors,
        warnings,
        lastValidated: new Date(),
      };
    }
  }

  /**
   * Create a new project for grouping APDs
   */
  async createProject(name: string, description?: string): Promise<Project> {
    try {
      const project: Project = {
        id: uuidv4(),
        name,
        description: description || undefined,
        apdIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await storageService.storeProject(project);
      return project;
    } catch (error) {
      throw new StorageError(
        `Failed to create project: ${name}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Update project information
   */
  async updateProject(
    projectId: string,
    updates: Partial<Pick<Project, 'name' | 'description'>>
  ): Promise<Project> {
    try {
      const project = await storageService.getProject(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      const updatedProject: Project = {
        id: project.id,
        name: updates.name ?? project.name,
        description: updates.description ?? project.description,
        apdIds: project.apdIds,
        createdAt: project.createdAt,
        updatedAt: new Date(),
      };

      // If the project name is being updated, we need to update all APDs in this project
      if (updates.name && updates.name !== project.name) {
        await this.updateAPDsProjectName(project.apdIds, updates.name);
      }

      await storageService.updateProject(updatedProject);
      return updatedProject;
    } catch (error) {
      throw new StorageError(
        `Failed to update project: ${projectId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Update project name in all APDs that belong to a project
   * @private
   */
  private async updateAPDsProjectName(
    apdIds: string[],
    newProjectName: string
  ): Promise<void> {
    try {
      // Get all APDs that belong to this project
      const apdsToUpdate = await Promise.all(
        apdIds.map(apdId => storageService.getAPD(apdId))
      );

      // Update each APD's metadata.projectName
      const updatePromises = apdsToUpdate
        .filter((apd): apd is APD => apd !== null)
        .map(async apd => {
          const updatedAPD: APD = {
            ...apd,
            metadata: {
              ...apd.metadata,
              projectName: newProjectName,
            },
            updatedAt: new Date(),
          };

          return storageService.updateAPD(updatedAPD);
        });

      await Promise.all(updatePromises);
    } catch (error) {
      throw new StorageError(
        `Failed to update APDs project name: ${newProjectName}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Add APD to a project
   */
  async addAPDToProject(apdId: string, projectId: string): Promise<void> {
    try {
      const project = await storageService.getProject(projectId);
      if (!project) {
        throw new Error(`Project not found: ${projectId}`);
      }

      if (!project.apdIds.includes(apdId)) {
        project.apdIds.push(apdId);
        project.updatedAt = new Date();
        await storageService.updateProject(project);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to add APD to project: ${apdId} -> ${projectId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Remove APD from a project
   */
  async removeAPDFromProject(apdId: string, projectId: string): Promise<void> {
    try {
      const project = await storageService.getProject(projectId);
      if (!project) {
        throw new Error(`Project not found: ${projectId}`);
      }

      project.apdIds = project.apdIds.filter(id => id !== apdId);
      project.updatedAt = new Date();
      await storageService.updateProject(project);
    } catch (error) {
      throw new StorageError(
        `Failed to remove APD from project: ${apdId} -> ${projectId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Link a sub-document (AoA or Acquisition Checklist) to a parent APD
   */
  async linkSubDocument(
    parentAPDId: string,
    childDocumentId: string
  ): Promise<void> {
    try {
      const [parentAPD, childDocument] = await Promise.all([
        storageService.getAPD(parentAPDId),
        storageService.getAPD(childDocumentId),
      ]);

      if (!parentAPD) {
        throw new Error(`Parent APD not found: ${parentAPDId}`);
      }

      if (!childDocument) {
        throw new Error(`Child document not found: ${childDocumentId}`);
      }

      // Validate that parent is an APD and child is a sub-document
      if (!['PAPD', 'IAPD', 'OAPD'].includes(parentAPD.type)) {
        throw new Error(
          `Parent document must be an APD, got: ${parentAPD.type}`
        );
      }

      if (!['AoA', 'Acquisition Checklist'].includes(childDocument.type)) {
        throw new Error(
          `Child document must be AoA or Acquisition Checklist, got: ${childDocument.type}`
        );
      }

      // Update parent APD to include child
      const updatedParent: APD = {
        ...parentAPD,
        childDocumentIds: [
          ...(parentAPD.childDocumentIds || []),
          childDocumentId,
        ],
        updatedAt: new Date(),
      };

      // Update child document to reference parent
      const updatedChild: APD = {
        ...childDocument,
        parentAPDId: parentAPDId,
        updatedAt: new Date(),
      };

      await Promise.all([
        storageService.updateAPD(updatedParent),
        storageService.updateAPD(updatedChild),
      ]);
    } catch (error) {
      throw new StorageError(
        `Failed to link sub-document: ${childDocumentId} -> ${parentAPDId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Unlink a sub-document from its parent APD
   */
  async unlinkSubDocument(
    parentAPDId: string,
    childDocumentId: string
  ): Promise<void> {
    if (!parentAPDId || !childDocumentId) {
      throw new Error('Parent APD ID and child document ID are required');
    }

    try {
      const [parentAPD, childDocument] = (await Promise.all([
        storageService.getAPD(parentAPDId as string),
        storageService.getAPD(childDocumentId as string),
      ])) as [APD | null, APD | null];

      if (!parentAPD || !childDocument) {
        return; // Already unlinked or documents don't exist
      }

      // Update parent APD to remove child
      const updatedParent: APD = {
        ...parentAPD,
        childDocumentIds: (parentAPD.childDocumentIds || []).filter(
          id => id !== childDocumentId
        ),
        updatedAt: new Date(),
      };

      // Update child document to remove parent reference
      const { parentAPDId, ...childWithoutParent } = childDocument;
      const updatedChild: APD = {
        ...childWithoutParent,
        updatedAt: new Date(),
      };

      await Promise.all([
        storageService.updateAPD(updatedParent),
        storageService.updateAPD(updatedChild),
      ]);
    } catch (error) {
      throw new StorageError(
        `Failed to unlink sub-document: ${childDocumentId} -> ${parentAPDId}`,
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Get APDs grouped by projects with hierarchical sub-document organization
   */
  async getAPDsByProject(options: ProjectGroupingOptions = {}): Promise<{
    projects: Array<{
      project: Project;
      apds: APDListItem[];
    }>;
    ungrouped: APDListItem[];
  }> {
    try {
      // TODO: Implement filtering/sorting options
      void options;
      const [allAPDs, allProjects] = await Promise.all([
        this.getAllAPDs(),
        storageService.getAllProjects(),
      ]);

      const projectGroups = [];
      const ungroupedAPDs = [...allAPDs];

      for (const project of allProjects) {
        const projectAPDs = allAPDs.filter(apd =>
          project.apdIds.includes(apd.id)
        );

        // Organize APDs hierarchically (parent APDs with their sub-documents)
        const organizedAPDs = this.organizeAPDsHierarchically(projectAPDs);

        // Remove from ungrouped list
        projectAPDs.forEach(apd => {
          const index = ungroupedAPDs.findIndex(u => u.id === apd.id);
          if (index > -1) {
            ungroupedAPDs.splice(index, 1);
          }
        });

        projectGroups.push({
          project,
          apds: organizedAPDs,
        });
      }

      // Organize ungrouped APDs hierarchically as well
      const organizedUngroupedAPDs =
        this.organizeAPDsHierarchically(ungroupedAPDs);

      return {
        projects: projectGroups,
        ungrouped: organizedUngroupedAPDs,
      };
    } catch (error) {
      throw new StorageError(
        'Failed to get APDs by project',
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  /**
   * Organize APDs hierarchically with parent APDs followed by their sub-documents
   * @private
   */
  private organizeAPDsHierarchically(apds: APDListItem[]): APDListItem[] {
    const organized: APDListItem[] = [];
    const processed = new Set<string>();

    // First, add all parent APDs (PAPD, IAPD, OAPD) with their children
    apds
      .filter(apd => ['PAPD', 'IAPD', 'OAPD'].includes(apd.type))
      .forEach(parentAPD => {
        if (processed.has(parentAPD.id)) return;

        organized.push(parentAPD);
        processed.add(parentAPD.id);

        // Add child documents immediately after their parent
        if (
          parentAPD.childDocumentIds &&
          parentAPD.childDocumentIds.length > 0
        ) {
          parentAPD.childDocumentIds.forEach(childId => {
            const childDoc = apds.find(apd => apd.id === childId);
            if (childDoc && !processed.has(childDoc.id)) {
              organized.push(childDoc);
              processed.add(childDoc.id);
            }
          });
        }
      });

    // Then add any remaining sub-documents that don't have parents
    apds
      .filter(apd => ['AoA', 'Acquisition Checklist'].includes(apd.type))
      .forEach(subDoc => {
        if (!processed.has(subDoc.id)) {
          organized.push(subDoc);
          processed.add(subDoc.id);
        }
      });

    return organized;
  }

  /**
   * Get completion statistics
   */
  async getCompletionStats(): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    byType: Record<APDType, { total: number; completed: number }>;
  }> {
    try {
      const apds = await this.getAllAPDs();

      const stats = {
        total: apds.length,
        completed: apds.filter(apd => apd.isComplete).length,
        inProgress: apds.filter(apd => !apd.isComplete).length,
        byType: {} as Record<APDType, { total: number; completed: number }>,
      };

      // Calculate by type
      const types: APDType[] = [
        'PAPD',
        'IAPD',
        'OAPD',
        'AoA',
        'Acquisition Checklist',
      ];
      for (const type of types) {
        const typeAPDs = apds.filter(apd => apd.type === type);
        stats.byType[type] = {
          total: typeAPDs.length,
          completed: typeAPDs.filter(apd => apd.isComplete).length,
        };
      }

      return stats;
    } catch (error) {
      throw new StorageError(
        'Failed to get completion stats',
        StorageErrorCode.TRANSACTION_FAILED,
        error as Error
      );
    }
  }

  // Private helper methods

  private initializeSectionContent(
    templateSection: TemplateSection
  ): Record<string, unknown> {
    const content: Record<string, unknown> = {};

    if (templateSection.fields) {
      for (const field of templateSection.fields) {
        content[field.name] =
          field.defaultValue || this.getDefaultValueForFieldType(field.type);
      }
    }

    return content;
  }

  private getDefaultValueForFieldType(fieldType: string): unknown {
    switch (fieldType) {
      case 'text':
      case 'textarea':
        return '';
      case 'number':
      case 'currency':
      case 'percentage':
        return 0;
      case 'date':
        return null;
      case 'checkbox':
        return false;
      case 'select':
      case 'radio':
        return '';
      case 'table':
        return [];
      default:
        return '';
    }
  }

  private validateMetadata(
    metadata: APDMetadata,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // TODO: Implement warning validations
    void warnings;

    if (!metadata.stateName?.trim()) {
      errors.push({
        fieldId: 'stateName',
        sectionId: 'metadata',
        message: 'State name is required',
        severity: 'error',
      });
    }

    if (!metadata.stateAgency?.trim()) {
      errors.push({
        fieldId: 'stateAgency',
        sectionId: 'metadata',
        message: 'State agency is required',
        severity: 'error',
      });
    }

    if (!metadata.projectName?.trim()) {
      errors.push({
        fieldId: 'projectName',
        sectionId: 'metadata',
        message: 'Project name is required',
        severity: 'error',
      });
    }

    if (!metadata.primaryContact?.name?.trim()) {
      errors.push({
        fieldId: 'primaryContact.name',
        sectionId: 'metadata',
        message: 'Primary contact name is required',
        severity: 'error',
      });
    }

    if (!metadata.primaryContact?.email?.trim()) {
      errors.push({
        fieldId: 'primaryContact.email',
        sectionId: 'metadata',
        message: 'Primary contact email is required',
        severity: 'error',
      });
    } else if (!this.isValidEmail(metadata.primaryContact.email)) {
      errors.push({
        fieldId: 'primaryContact.email',
        sectionId: 'metadata',
        message: 'Primary contact email is not valid',
        severity: 'error',
      });
    }
  }

  private validateSectionCompleteness(
    apd: APD,
    template: APDTemplate,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // TODO: Implement warning validations for section completeness
    void warnings;

    for (const templateSection of template.sections) {
      const apdSection = apd.sections[templateSection.id];

      if (!apdSection) {
        if (templateSection.isRequired) {
          errors.push({
            fieldId: templateSection.id,
            sectionId: templateSection.id,
            message: `Required section "${templateSection.title}" is missing`,
            severity: 'error',
          });
        }
        continue;
      }

      // Validate required fields in section
      if (templateSection.fields) {
        for (const field of templateSection.fields) {
          if (field.required) {
            const value = apdSection.content[field.name];
            if (this.isEmpty(value)) {
              errors.push({
                fieldId: field.name,
                sectionId: templateSection.id,
                message: `Required field "${field.label}" is empty`,
                severity: 'error',
              });
            }
          }
        }
      }
    }
  }

  private validateDataConsistency(
    apd: APD,
    _errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Check for data consistency across sections
    // This is where business-specific validation rules would go

    // Example: Validate that project names are consistent
    const projectNames = new Set<string>();
    Object.values(apd.sections).forEach(section => {
      const projectName = section.content.projectName;
      if (typeof projectName === 'string' && projectName.trim()) {
        projectNames.add(projectName);
      }
    });

    if (projectNames.size > 1) {
      warnings.push({
        fieldId: 'projectName',
        sectionId: 'consistency',
        message: 'Project names are inconsistent across sections',
        type: 'consistency',
      });
    }
  }

  private async validateBusinessRules(
    apd: APD,
    _errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    // APD-specific business rules validation

    // Example: IAPD should have a corresponding PAPD
    if (apd.type === 'IAPD') {
      const allAPDs = await this.getAllAPDs();
      const relatedPAPD = allAPDs.find(
        a => a.projectName === apd.metadata.projectName && a.type === 'PAPD'
      );

      if (!relatedPAPD) {
        warnings.push({
          fieldId: 'type',
          sectionId: 'business-rules',
          message: 'IAPD should typically have a corresponding PAPD',
          type: 'best-practice',
        });
      }
    }

    // Example: Budget validation for different APD types
    if (apd.type === 'PAPD' || apd.type === 'IAPD') {
      const budgetSection = apd.sections['budget-tables'];
      const totalCost = budgetSection?.content.totalCost;
      if (
        budgetSection &&
        typeof totalCost === 'number' &&
        totalCost > 10000000
      ) {
        warnings.push({
          fieldId: 'totalCost',
          sectionId: 'budget-tables',
          message: 'Projects over $10M may require additional CMS approval',
          type: 'best-practice',
        });
      }
    }
  }

  private isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const apdService = new APDService();

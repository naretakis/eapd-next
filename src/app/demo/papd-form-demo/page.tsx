'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';
import {
  MilkdownEditor,
  MilkdownEditorRef,
} from '@/components/forms/MilkdownEditor';

/**
 * PAPD Form Demo - Demonstrates dynamic form generation with Milkdown integration
 *
 * This demo shows how to build APD forms using:
 * - Material-UI components for structured data (front matter, contact info)
 * - Milkdown editors for rich text content (executive summary, project plans)
 * - Section navigation with state preservation
 * - Mixed field types working together
 */

type AssuranceState = 'unset' | 'yes' | 'no';

type AssuranceField =
  | 'cfr433'
  | 'cfr75'
  | 'cfr95'
  | 'cfr495_350'
  | 'cfr495_346'
  | 'cfr495_360'
  | 'cfr431_300'
  | 'cfr164';

interface PAPDFormData {
  // Front matter fields
  state: string;
  agency: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  submissionDate: string;
  documentType: string;
  multiplePrograms: string;
  version: string;

  // Rich text content
  executiveSummary: string;
  projectManagementPlan: string;
  statementOfNeeds: string;
  proposedActivitySchedule: string;
  proposedBudget: string;

  // Assurances and Compliance with three-state system
  assurances: {
    cfr433: AssuranceState;
    cfr75: AssuranceState;
    cfr95: AssuranceState;
    cfr495_350: AssuranceState;
    cfr495_346: AssuranceState;
    cfr495_360: AssuranceState;
    cfr431_300: AssuranceState;
    cfr164: AssuranceState;
  };
  assuranceExplanations: {
    cfr433: string;
    cfr75: string;
    cfr95: string;
    cfr495_350: string;
    cfr495_346: string;
    cfr495_360: string;
    cfr431_300: string;
    cfr164: string;
  };
}

const initialFormData: PAPDFormData = {
  state: '',
  agency: '',
  contactName: '',
  contactTitle: '',
  contactEmail: '',
  contactPhone: '',
  submissionDate: '',
  documentType: 'PAPD',
  multiplePrograms: 'N',
  version: '1.0',
  executiveSummary: '',
  projectManagementPlan: '',
  statementOfNeeds: '',
  proposedActivitySchedule: '',
  proposedBudget: '',
  assurances: {
    cfr433: 'unset',
    cfr75: 'unset',
    cfr95: 'unset',
    cfr495_350: 'unset',
    cfr495_346: 'unset',
    cfr495_360: 'unset',
    cfr431_300: 'unset',
    cfr164: 'unset',
  },
  assuranceExplanations: {
    cfr433: '',
    cfr75: '',
    cfr95: '',
    cfr495_350: '',
    cfr495_346: '',
    cfr495_360: '',
    cfr431_300: '',
    cfr164: '',
  },
};

const steps = [
  'Administrative Information',
  'Executive Summary',
  'Project Management Plan',
  'Statement of Needs',
  'Proposed Activity Schedule',
  'Proposed Budget',
  'Assurances and Compliance',
  'Final Review',
];

export default function PAPDFormDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<PAPDFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [sectionCompletionStatus, setSectionCompletionStatus] = useState<
    Record<number, 'complete' | 'error' | 'incomplete'>
  >({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    'saved'
  );
  const [dataLoadedFromStorage, setDataLoadedFromStorage] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('papd-form-demo-data');
    const savedStep = localStorage.getItem('papd-form-demo-step');

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        setDataLoadedFromStorage(true);
      } catch (error) {
        console.warn('Failed to load saved form data:', error);
      }
    }

    if (savedStep) {
      try {
        const parsedStep = parseInt(savedStep, 10);
        if (parsedStep >= 0 && parsedStep < steps.length) {
          setActiveStep(parsedStep);
        }
      } catch (error) {
        console.warn('Failed to load saved step:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('papd-form-demo-data', JSON.stringify(formData));
  }, [formData]);

  // Save active step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('papd-form-demo-step', activeStep.toString());
  }, [activeStep]);

  // Refs for Milkdown editors
  const executiveSummaryRef = useRef<MilkdownEditorRef>(null);
  const projectPlanRef = useRef<MilkdownEditorRef>(null);
  const statementNeedsRef = useRef<MilkdownEditorRef>(null);
  const activityScheduleRef = useRef<MilkdownEditorRef>(null);
  const budgetRef = useRef<MilkdownEditorRef>(null);

  // Validation functions
  const validateAdministrativeFields = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.agency.trim())
      errors.agency = 'State Medicaid Agency is required';
    if (!formData.contactName.trim())
      errors.contactName = 'Primary Contact Name is required';
    if (!formData.contactTitle.trim())
      errors.contactTitle = 'Contact Job Title is required';
    if (!formData.contactEmail.trim())
      errors.contactEmail = 'Contact Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.contactEmail))
      errors.contactEmail = 'Valid email is required';
    if (!formData.contactPhone.trim())
      errors.contactPhone = 'Contact Phone is required';
    if (!formData.submissionDate.trim())
      errors.submissionDate = 'Submission Date is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const validateAssurances = useCallback(() => {
    const errors: Record<string, string> = {};

    // Check if any assurance is 'unset' (all must be answered)
    Object.entries(formData.assurances).forEach(([key, value]) => {
      if (value === 'unset') {
        errors[`${key}_status`] = 'Response required for all compliance items';
      } else if (
        value === 'no' &&
        !formData.assuranceExplanations[
          key as keyof typeof formData.assuranceExplanations
        ].trim()
      ) {
        errors[`${key}_explanation`] = 'Explanation required when answer is No';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle Material-UI field changes
  const handleFieldChange = useCallback(
    (field: keyof PAPDFormData, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));

      // Clear validation error for this field
      if (validationErrors[field]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  // Handle assurance state changes (unset -> yes -> no -> unset)
  const handleAssuranceChange = useCallback((field: AssuranceField) => {
    setFormData(prev => {
      const currentState = prev.assurances[field];
      let newState: AssuranceState;

      switch (currentState) {
        case 'unset':
          newState = 'yes';
          break;
        case 'yes':
          newState = 'no';
          break;
        case 'no':
          newState = 'unset';
          break;
        default:
          newState = 'unset';
      }

      return {
        ...prev,
        assurances: {
          ...prev.assurances,
          [field]: newState,
        },
      };
    });
  }, []);

  // Handle explanation changes
  const handleExplanationChange = useCallback(
    (field: AssuranceField, value: string) => {
      setFormData(prev => ({
        ...prev,
        assuranceExplanations: {
          ...prev.assuranceExplanations,
          [field]: value,
        },
      }));
    },
    []
  );

  // Handle Milkdown content changes
  const handleExecutiveSummaryChange = useCallback((content: string) => {
    setSaveStatus('unsaved');
    setFormData(prev => ({
      ...prev,
      executiveSummary: content,
    }));
  }, []);

  const handleProjectPlanChange = useCallback((content: string) => {
    setSaveStatus('unsaved');
    setFormData(prev => ({
      ...prev,
      projectManagementPlan: content,
    }));
  }, []);

  const handleStatementNeedsChange = useCallback((content: string) => {
    setSaveStatus('unsaved');
    setFormData(prev => ({
      ...prev,
      statementOfNeeds: content,
    }));
  }, []);

  const handleActivityScheduleChange = useCallback((content: string) => {
    setSaveStatus('unsaved');
    setFormData(prev => ({
      ...prev,
      proposedActivitySchedule: content,
    }));
  }, []);

  const handleBudgetChange = useCallback((content: string) => {
    setSaveStatus('unsaved');
    setFormData(prev => ({
      ...prev,
      proposedBudget: content,
    }));
  }, []);

  // Set up Milkdown content change listeners
  useEffect(() => {
    let executiveCleanup: (() => void) | undefined;
    let projectCleanup: (() => void) | undefined;
    let statementCleanup: (() => void) | undefined;
    let activityCleanup: (() => void) | undefined;
    let budgetCleanup: (() => void) | undefined;

    const timer = setTimeout(() => {
      if (executiveSummaryRef.current) {
        executiveCleanup = executiveSummaryRef.current.onContentChange(
          handleExecutiveSummaryChange
        );
      }
      if (projectPlanRef.current) {
        projectCleanup = projectPlanRef.current.onContentChange(
          handleProjectPlanChange
        );
      }
      if (statementNeedsRef.current) {
        statementCleanup = statementNeedsRef.current.onContentChange(
          handleStatementNeedsChange
        );
      }
      if (activityScheduleRef.current) {
        activityCleanup = activityScheduleRef.current.onContentChange(
          handleActivityScheduleChange
        );
      }
      if (budgetRef.current) {
        budgetCleanup = budgetRef.current.onContentChange(handleBudgetChange);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      executiveCleanup?.();
      projectCleanup?.();
      statementCleanup?.();
      activityCleanup?.();
      budgetCleanup?.();
    };
  }, [
    handleExecutiveSummaryChange,
    handleProjectPlanChange,
    handleStatementNeedsChange,
    handleActivityScheduleChange,
    handleBudgetChange,
  ]);

  // Navigation handlers
  // Section completion tracking
  const updateSectionStatus = useCallback(
    (stepIndex: number, status: 'complete' | 'error' | 'incomplete') => {
      setSectionCompletionStatus(prev => ({
        ...prev,
        [stepIndex]: status,
      }));
    },
    []
  );

  // Check section completion
  const checkSectionCompletion = useCallback(
    (stepIndex: number) => {
      switch (stepIndex) {
        case 0: // Administrative
          const adminValid = validateAdministrativeFields();
          updateSectionStatus(0, adminValid ? 'complete' : 'error');
          return adminValid;
        case 1: // Executive Summary
          const hasExecutive = formData.executiveSummary.trim().length > 0;
          updateSectionStatus(1, hasExecutive ? 'complete' : 'incomplete');
          return true; // Don't block navigation for content sections
        case 2: // Project Management
          const hasProject = formData.projectManagementPlan.trim().length > 0;
          updateSectionStatus(2, hasProject ? 'complete' : 'incomplete');
          return true;
        case 3: // Statement of Needs
          const hasStatement = formData.statementOfNeeds.trim().length > 0;
          updateSectionStatus(3, hasStatement ? 'complete' : 'incomplete');
          return true;
        case 4: // Activity Schedule
          const hasSchedule =
            formData.proposedActivitySchedule.trim().length > 0;
          updateSectionStatus(4, hasSchedule ? 'complete' : 'incomplete');
          return true;
        case 5: // Budget
          const hasBudget = formData.proposedBudget.trim().length > 0;
          updateSectionStatus(5, hasBudget ? 'complete' : 'incomplete');
          return true;
        case 6: // Assurances
          const assurancesValid = validateAssurances();
          updateSectionStatus(6, assurancesValid ? 'complete' : 'error');
          return assurancesValid;
        default:
          return true;
      }
    },
    [
      formData,
      validateAdministrativeFields,
      validateAssurances,
      updateSectionStatus,
    ]
  );

  // Update section completion status when form data changes
  useEffect(() => {
    // Check all sections for completion status
    for (let i = 0; i < steps.length - 1; i++) {
      // Exclude final review step
      checkSectionCompletion(i);
    }
  }, [formData, checkSectionCompletion]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Simple markdown to HTML converter for preview
  const convertMarkdownToHtml = (markdown: string) => {
    return (
      markdown
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Bold and italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^\- (.*$)/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
        // Wrap consecutive list items
        .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
        .replace(/<\/ul>\s*<ul>/g, '')
        // Tables - basic table detection
        .replace(/\|(.+)\|/g, (match, content) => {
          const cells = content.split('|').map((cell: string) => cell.trim());
          const isHeader = match.includes('---');
          if (isHeader) return ''; // Skip separator rows
          const cellTag = cells.some(
            (cell: string) => cell.includes('CFR') || cell.includes('Reference')
          )
            ? 'th'
            : 'td';
          return `<tr>${cells.map((cell: string) => `<${cellTag}>${cell}</${cellTag}>`).join('')}</tr>`;
        })
        // Wrap table rows
        .replace(
          /(<tr>.*<\/tr>)/g,
          '<table border="1" style="border-collapse: collapse; width: 100%; margin: 1em 0;"><tbody>$1</tbody></table>'
        )
        .replace(/<\/table>\s*<table[^>]*>/g, '')
        // Blockquotes
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
        // Code blocks
        .replace(/```[\s\S]*?```/g, '<pre><code>$&</code></pre>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        // Wrap in paragraphs
        .replace(/^(?!<[h|u|o|t|b|p])(.+)$/gm, '<p>$1</p>')
        // Clean up empty paragraphs
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<[^>]+>)<\/p>/g, '$1')
    );
  };

  // Navigation handlers
  // Save current editor content before navigation
  const saveCurrentEditorContent = useCallback(() => {
    let contentChanged = false;

    switch (activeStep) {
      case 1: // Executive Summary
        if (executiveSummaryRef.current) {
          const content = executiveSummaryRef.current.getMarkdown();
          if (content !== formData.executiveSummary) {
            setSaveStatus('saving');
            setFormData(prev => ({ ...prev, executiveSummary: content }));
            contentChanged = true;
          }
        }
        break;
      case 2: // Project Management Plan
        if (projectPlanRef.current) {
          const content = projectPlanRef.current.getMarkdown();
          if (content !== formData.projectManagementPlan) {
            setSaveStatus('saving');
            setFormData(prev => ({ ...prev, projectManagementPlan: content }));
            contentChanged = true;
          }
        }
        break;
      case 3: // Statement of Needs
        if (statementNeedsRef.current) {
          const content = statementNeedsRef.current.getMarkdown();
          if (content !== formData.statementOfNeeds) {
            setSaveStatus('saving');
            setFormData(prev => ({ ...prev, statementOfNeeds: content }));
            contentChanged = true;
          }
        }
        break;
      case 4: // Activity Schedule
        if (activityScheduleRef.current) {
          const content = activityScheduleRef.current.getMarkdown();
          if (content !== formData.proposedActivitySchedule) {
            setSaveStatus('saving');
            setFormData(prev => ({
              ...prev,
              proposedActivitySchedule: content,
            }));
            contentChanged = true;
          }
        }
        break;
      case 5: // Budget
        if (budgetRef.current) {
          const content = budgetRef.current.getMarkdown();
          if (content !== formData.proposedBudget) {
            setSaveStatus('saving');
            setFormData(prev => ({ ...prev, proposedBudget: content }));
            contentChanged = true;
          }
        }
        break;
    }

    if (contentChanged) {
      // Show saved status after a brief delay
      setTimeout(() => setSaveStatus('saved'), 500);
    }
  }, [activeStep, formData]);

  // Periodic auto-save for current editor
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (saveStatus === 'unsaved') {
        saveCurrentEditorContent();
      }
    }, 3000); // Auto-save every 3 seconds if there are unsaved changes

    return () => clearInterval(autoSaveInterval);
  }, [saveCurrentEditorContent, saveStatus]);

  const handleNext = () => {
    // Save current editor content before navigation
    saveCurrentEditorContent();

    // Validate current step before proceeding
    if (!checkSectionCompletion(activeStep)) {
      return; // Don't proceed if validation fails
    }

    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    setTimeout(scrollToTop, 100); // Small delay to ensure state update
  };

  const handleBack = () => {
    // Save current editor content before navigation
    saveCurrentEditorContent();

    setActiveStep(prev => Math.max(prev - 1, 0));
    setTimeout(scrollToTop, 100);
  };

  const handleStepClick = (step: number) => {
    // Save current editor content before navigation
    saveCurrentEditorContent();

    // Check completion of current step before switching
    checkSectionCompletion(activeStep);
    setActiveStep(step);
    setTimeout(scrollToTop, 100);
  };

  // Clear all form data
  const clearAllData = () => {
    setFormData(initialFormData);
    setActiveStep(0);
    setValidationErrors({});
    setSectionCompletionStatus({});
    setSaveStatus('saved');
    setDataLoadedFromStorage(false);

    // Clear localStorage
    localStorage.removeItem('papd-form-demo-data');
    localStorage.removeItem('papd-form-demo-step');

    // Clear Milkdown editors
    setTimeout(() => {
      if (executiveSummaryRef.current) {
        executiveSummaryRef.current.replaceAllContent('');
      }
      if (projectPlanRef.current) {
        projectPlanRef.current.replaceAllContent('');
      }
      if (statementNeedsRef.current) {
        statementNeedsRef.current.replaceAllContent('');
      }
      if (activityScheduleRef.current) {
        activityScheduleRef.current.replaceAllContent('');
      }
      if (budgetRef.current) {
        budgetRef.current.replaceAllContent('');
      }
    }, 100);
  };

  // Load sample content for demo
  const loadSampleContent = () => {
    setFormData({
      state: 'California',
      agency: 'California Department of Health Care Services',
      contactName: 'Jane Smith',
      contactTitle: 'MMIS Project Director',
      contactEmail: 'jane.smith@dhcs.ca.gov',
      contactPhone: '916-555-0123',
      submissionDate: '2024-03-15',
      documentType: 'PAPD',
      multiplePrograms: 'Y',
      version: '1.0',
      executiveSummary: `# Executive Summary

This Planning APD (PAPD) requests federal funding for the **California Medicaid Management Information System (CA-MMIS) Modernization Project**. 

## Project Overview

The CA-MMIS Modernization Project will replace the current legacy system with a modern, modular solution that meets all CMS requirements for enhanced funding. This project will:

- Implement a new **claims processing system** with improved performance
- Enhance **provider enrollment and management** capabilities  
- Improve **program integrity** and fraud detection
- Ensure **MITA compliance** and architectural alignment

## Funding Request

This PAPD requests **$2.5 million** in enhanced federal funding (90% FFP) for planning activities over 18 months, including:

- Requirements analysis and system design
- Analysis of Alternatives (AoA) 
- Procurement planning and vendor selection
- Project management and oversight

The project will benefit California's Medicaid program by improving operational efficiency, reducing administrative costs, and enhancing service delivery to over 14 million beneficiaries.`,
      projectManagementPlan: `# Project Management Plan

## Project Organization

The CA-MMIS Modernization Project will be managed by the **DHCS Information Technology Division** with support from contracted vendors and CMS.

### Key Personnel and Costs

The following table outlines the key personnel, their time commitments, and associated costs for the planning phase:

| Role | Name | Time Commitment | Annual Salary | Benefits (30%) | Total Cost |
|------|------|----------------|---------------|----------------|------------|
| **State Personnel** |
| Project Director | Jane Smith | 100% | $120,000 | $36,000 | $156,000 |
| Technical Lead | John Doe | 75% | $95,000 | $28,500 | $92,625 |
| Business Analyst | Mary Johnson | 50% | $75,000 | $22,500 | $48,750 |
| Procurement Specialist | Bob Wilson | 25% | $80,000 | $24,000 | $26,000 |
| **Contractor Personnel** |
| Senior Consultant | TBD - Vendor A | 100% | $150,000 | N/A | $150,000 |
| Systems Architect | TBD - Vendor A | 75% | $140,000 | N/A | $105,000 |
| Requirements Analyst | TBD - Vendor B | 50% | $110,000 | N/A | $55,000 |
| **Total Project Costs** | | | | | **$633,375** |

## Project Approach

Our approach follows **CMS best practices** and **MITA guidelines**:

1. **Stakeholder Engagement**: Regular meetings with business users, IT staff, and external partners
2. **Agile Methodology**: Iterative development with frequent deliverables and feedback
3. **Risk Management**: Proactive identification and mitigation of project risks
4. **Quality Assurance**: Comprehensive testing and validation at each phase

## Major Activities

### Phase 1: Requirements Analysis (Months 1-6)
- Conduct current state assessment
- Define functional and technical requirements
- Develop system architecture framework

### Phase 2: Analysis of Alternatives (Months 4-9)  
- Evaluate COTS vs. custom development options
- Assess vendor capabilities and solutions
- Conduct cost-benefit analysis

### Phase 3: Procurement Planning (Months 7-12)
- Develop RFP documentation
- Define evaluation criteria and process
- Prepare contract templates and terms

## Success Metrics

- On-time delivery of all planning deliverables
- Stakeholder satisfaction scores > 85%
- Budget variance < 5%
- CMS approval of all required documents`,
      statementOfNeeds: `# Statement of Needs and Objectives

## Current System Overview

California's Medicaid Management Information System (CA-MMIS) serves over 14 million beneficiaries and processes approximately 200 million claims annually, representing over $100 billion in healthcare expenditures. The current system, implemented in 1995, has served the state well but now faces significant challenges that impact program efficiency and effectiveness.

The existing infrastructure was designed for a different era of healthcare delivery and technology capabilities. As California's Medicaid program has evolved to include managed care expansion, value-based payment models, and integrated care delivery systems, the limitations of the legacy system have become increasingly apparent. These challenges not only affect day-to-day operations but also limit the state's ability to implement innovative program improvements and respond to federal policy changes.

## Current System Challenges

The existing CA-MMIS system faces several critical challenges that impact program operations:

### Technical Issues
- **Legacy architecture** built on outdated technology (COBOL, mainframe) that is difficult to maintain and enhance
- **Limited scalability** unable to handle growing transaction volumes, particularly during peak enrollment periods
- **Integration difficulties** with modern systems and data exchanges, including HIEs and federal data hubs
- **Maintenance costs** consuming 75% of IT budget, leaving limited resources for innovation and improvements

### Operational Challenges  
- **Slow claims processing** averaging 14 days vs. industry standard of 7 days, impacting provider cash flow
- **Manual workarounds** required for complex claim scenarios, increasing administrative burden and error rates
- **Limited reporting** capabilities hindering program oversight and performance measurement
- **Provider complaints** about system usability and performance, affecting provider participation and satisfaction

The cumulative impact of these challenges has resulted in increased administrative costs, delayed payments to providers, and reduced program effectiveness. Without modernization, these issues will continue to worsen as the system ages and becomes increasingly difficult to maintain.

## Project Objectives

This modernization project will address these challenges through a comprehensive system replacement that leverages modern technology and best practices:

### Primary Objectives
1. **Replace legacy system** with modern, modular architecture that supports current and future program needs
2. **Improve processing speed** to meet CMS timeliness standards and industry benchmarks
3. **Enhance system reliability** with 99.9% uptime target and robust disaster recovery capabilities
4. **Reduce operational costs** by 30% over 5 years through improved efficiency and reduced maintenance

### Secondary Objectives
1. **Improve user experience** for providers and staff through intuitive interfaces and streamlined workflows
2. **Enhance data analytics** and reporting capabilities to support evidence-based decision making
3. **Strengthen program integrity** and fraud detection through advanced analytics and real-time monitoring
4. **Enable future innovations** through API-first design and cloud-native architecture

## Expected Benefits

### Quantitative Benefits
- **$15M annual savings** in operational costs through improved efficiency and reduced maintenance
- **50% reduction** in claims processing time, improving provider cash flow and satisfaction
- **90% decrease** in system downtime incidents, ensuring consistent service availability
- **25% improvement** in provider satisfaction scores based on system usability and performance

### Qualitative Benefits
- Enhanced program oversight and accountability through improved reporting and analytics
- Improved beneficiary access to services through faster processing and better provider experience
- Better compliance with federal requirements and ability to adapt to policy changes
- Increased staff productivity and morale through modern tools and streamlined processes

## Alignment with State Priorities

This project directly supports California's strategic priorities and aligns with broader state initiatives:

- **Digital Government Initiative**: Modernizing legacy systems to improve citizen services and government efficiency
- **Health Equity Goals**: Improving access to Medicaid services and reducing disparities in care delivery
- **Fiscal Responsibility**: Reducing long-term operational costs while improving service quality
- **Innovation Leadership**: Adopting cutting-edge technology solutions that can serve as a model for other states

The modernization effort will position California as a leader in Medicaid system innovation while ensuring the reliable, efficient delivery of services to the state's most vulnerable populations.`,
      proposedActivitySchedule: `# Proposed Activity Schedule for the Project

## High-Level Project Timeline

The CA-MMIS Modernization Planning Phase will span 18 months, with activities organized into three overlapping phases to ensure efficient resource utilization and timely delivery.

### Project Schedule Overview

| Activity | Start Date | End Date | Duration | Key Deliverables |
|----------|------------|----------|----------|------------------|
| **Phase 1: Requirements Analysis** | 04/01/2024 | 09/30/2024 | 6 months | Requirements Document, Current State Assessment |
| **Phase 2: Analysis of Alternatives** | 07/01/2024 | 12/31/2024 | 6 months | AoA Report, Vendor Evaluation |
| **Phase 3: Procurement Planning** | 10/01/2024 | 03/31/2025 | 6 months | RFP Documentation, Contract Templates |
| **Phase 4: Project Closeout** | 01/01/2025 | 03/31/2025 | 3 months | Final Reports, Transition Planning |

## Detailed Activity Descriptions

### Activity 1 - Requirements Analysis and Current State Assessment
**Duration**: April 1, 2024 - September 30, 2024

This activity will establish a comprehensive understanding of current system capabilities, business processes, and future requirements. Key tasks include:

- Conduct stakeholder interviews and workshops
- Document current system architecture and interfaces
- Analyze business processes and identify improvement opportunities
- Define functional and technical requirements for the new system
- Develop system architecture framework and design principles

**Deliverables**: Requirements Document, Current State Assessment Report, System Architecture Framework

### Activity 2 - Analysis of Alternatives (AoA)
**Duration**: July 1, 2024 - December 31, 2024

This activity will evaluate different approaches to meeting the identified requirements, including COTS solutions, custom development, and hybrid approaches.

- Research available COTS solutions and vendor capabilities
- Evaluate build vs. buy vs. hybrid alternatives
- Conduct cost-benefit analysis for each alternative
- Assess technical feasibility and implementation risks
- Develop recommendation with supporting rationale

**Deliverables**: Analysis of Alternatives Report, Vendor Capability Assessment, Cost-Benefit Analysis

### Activity 3 - Procurement Planning and RFP Development
**Duration**: October 1, 2024 - March 31, 2025

This activity will prepare all necessary procurement documentation and establish the framework for vendor selection.

- Develop comprehensive RFP documentation
- Define evaluation criteria and scoring methodology
- Prepare contract templates and terms
- Establish procurement timeline and process
- Coordinate with state procurement office and legal counsel

**Deliverables**: RFP Documentation, Evaluation Criteria, Contract Templates, Procurement Plan

### Activity 4 - Project Management and Oversight
**Duration**: April 1, 2024 - March 31, 2025

Ongoing project management activities throughout the planning phase to ensure successful delivery.

- Weekly project team meetings and status reporting
- Monthly steering committee meetings
- Quarterly CMS coordination calls
- Risk management and issue resolution
- Budget monitoring and financial reporting

**Deliverables**: Monthly Status Reports, Risk Management Plan, Final Project Report

## Resource Allocation Timeline

The following table shows the planned resource allocation across the project timeline:

| Quarter | Primary Activities | Peak Staffing | Key Focus Areas |
|---------|-------------------|---------------|-----------------|
| **Q2 2024** | Requirements Analysis | 8 FTE | Current state assessment, stakeholder interviews |
| **Q3 2024** | Requirements + AoA Overlap | 10 FTE | Requirements finalization, vendor research |
| **Q4 2024** | AoA + Procurement Planning | 12 FTE | Solution evaluation, RFP development |
| **Q1 2025** | Procurement + Closeout | 6 FTE | Contract preparation, project transition |

## Critical Success Factors

- **Stakeholder Engagement**: Active participation from business users and IT staff
- **CMS Coordination**: Regular communication and alignment with federal requirements
- **Vendor Collaboration**: Early engagement with potential solution providers
- **Risk Management**: Proactive identification and mitigation of project risks`,
      proposedBudget: `# Proposed Budget

## Budget Summary

The total budget for the CA-MMIS Modernization Planning Phase is **$2,500,000** over 18 months, with enhanced federal funding (90% FFP) requested for all planning activities.

### Federal Financial Participation Breakdown

| Cost Category | Federal Share (90%) | State Share (10%) | Total Cost |
|---------------|--------------------:|------------------:|-----------:|
| **State Personnel** | $285,938 | $31,771 | $317,709 |
| **Contractor Personnel** | $1,620,000 | $180,000 | $1,800,000 |
| **Hardware & Software** | $135,000 | $15,000 | $150,000 |
| **Travel & Training** | $67,500 | $7,500 | $75,000 |
| **Other Direct Costs** | $141,562 | $15,729 | $157,291 |
| **TOTAL** | **$2,250,000** | **$250,000** | **$2,500,000** |

## Detailed Budget Categories

### State Personnel Costs

| Position | FTE | Annual Salary | Benefits (30%) | 18-Month Cost |
|----------|-----|---------------:|---------------:|--------------:|
| Project Director | 1.0 | $120,000 | $36,000 | $234,000 |
| Technical Lead | 0.75 | $95,000 | $28,500 | $138,938 |
| Business Analyst | 0.5 | $75,000 | $22,500 | $73,125 |
| Procurement Specialist | 0.25 | $80,000 | $24,000 | $39,000 |
| **Subtotal State Personnel** | | | | **$485,063** |
| **18-Month Allocation** | | | | **$317,709** |

### Contractor Personnel Costs

| Service Category | Vendor | Monthly Cost | 18-Month Total |
|------------------|--------|-------------:|---------------:|
| Senior Management Consultant | Vendor A | $25,000 | $450,000 |
| Systems Architecture Services | Vendor A | $20,000 | $360,000 |
| Requirements Analysis Services | Vendor B | $15,000 | $270,000 |
| Procurement Support Services | Vendor C | $12,000 | $216,000 |
| Independent Verification & Validation | Vendor D | $28,000 | $504,000 |
| **Total Contractor Costs** | | | **$1,800,000** |

### Hardware and Software Costs

| Item | Quantity | Unit Cost | Total Cost |
|------|----------|----------:|-----------:|
| Project Management Software Licenses | 15 | $200/month × 18 | $54,000 |
| Requirements Management Tools | 10 | $300/month × 18 | $54,000 |
| Collaboration Platform | 25 | $50/month × 18 | $22,500 |
| Development/Testing Environment | 1 | $1,500/month × 18 | $27,000 |
| **Total Hardware/Software** | | | **$157,500** |
| **Budget Allocation** | | | **$150,000** |

### Travel and Training Costs

| Activity | Frequency | Cost per Trip | Total Cost |
|----------|-----------|---------------:|-----------:|
| CMS Coordination Meetings (Baltimore) | 4 trips | $3,500 | $14,000 |
| Vendor Site Visits | 6 trips | $2,500 | $15,000 |
| Conference Attendance (HIMSS, MITA) | 3 events | $4,000 | $12,000 |
| Training and Certification | 10 staff | $2,500 | $25,000 |
| Local Travel and Meetings | 18 months | $500/month | $9,000 |
| **Total Travel/Training** | | | **$75,000** |

### Other Direct Costs

| Category | Description | Total Cost |
|----------|-------------|----------:|
| Legal and Regulatory Review | Contract and compliance review | $45,000 |
| Financial Analysis Services | Cost-benefit analysis support | $35,000 |
| Communications and Outreach | Stakeholder engagement activities | $25,000 |
| Document Production | Reports, presentations, materials | $15,000 |
| Contingency (5%) | Risk mitigation reserve | $37,291 |
| **Total Other Costs** | | **$157,291** |

## Budget Justification

### Enhanced Federal Funding Request

This project qualifies for enhanced federal funding (90% FFP) under 42 CFR 433.112(b) as it supports the planning and design of a Medicaid Management Information System that will:

- Provide more efficient, economical, and effective administration of the State plan
- Meet all CMS system requirements and performance standards
- Support modular, flexible system development approaches
- Align with MITA maturity goals and architectural standards

### Cost-Effectiveness Analysis

The requested budget represents a cost-effective investment in planning activities that will:

- **Reduce Implementation Risk**: Thorough planning reduces costly changes during implementation
- **Optimize Solution Selection**: Comprehensive AoA ensures best value procurement
- **Accelerate Implementation**: Well-defined requirements enable faster development
- **Maximize Federal Funding**: Proper planning ensures continued enhanced FFP eligibility

### Budget Controls and Monitoring

- Monthly budget reviews and variance analysis
- Quarterly financial reporting to CMS
- Vendor cost monitoring and invoice validation
- Change control process for budget modifications

The proposed budget provides the necessary resources to complete all required planning activities while maintaining fiscal responsibility and maximizing the return on federal investment.`,
      assurances: {
        cfr433: 'yes',
        cfr75: 'yes',
        cfr95: 'yes',
        cfr495_350: 'yes',
        cfr495_346: 'yes',
        cfr495_360: 'yes',
        cfr431_300: 'yes',
        cfr164: 'yes',
      },
      assuranceExplanations: {
        cfr433: '',
        cfr75: '',
        cfr95: '',
        cfr495_350: '',
        cfr495_346: '',
        cfr495_360: '',
        cfr431_300: '',
        cfr164: '',
      },
    });

    // Update Milkdown editors with sample content
    setTimeout(() => {
      executiveSummaryRef.current?.replaceAllContent(formData.executiveSummary);
      projectPlanRef.current?.replaceAllContent(formData.projectManagementPlan);
      statementNeedsRef.current?.replaceAllContent(formData.statementOfNeeds);
      activityScheduleRef.current?.replaceAllContent(
        formData.proposedActivitySchedule
      );
      budgetRef.current?.replaceAllContent(formData.proposedBudget);
    }, 1500);
  };

  // Render current step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Administrative Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Basic information about the state, agency, and primary contact
                for this APD.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                }}
              >
                <TextField
                  label="State"
                  value={formData.state}
                  onChange={e => handleFieldChange('state', e.target.value)}
                  placeholder="Full State Name"
                  fullWidth
                  required
                  error={!!validationErrors.state}
                  helperText={validationErrors.state}
                />

                <TextField
                  label="State Medicaid Agency"
                  value={formData.agency}
                  onChange={e => handleFieldChange('agency', e.target.value)}
                  placeholder="Full State Medicaid Agency Name"
                  fullWidth
                  required
                  error={!!validationErrors.agency}
                  helperText={validationErrors.agency}
                />

                <TextField
                  label="Primary Contact Name"
                  value={formData.contactName}
                  onChange={e =>
                    handleFieldChange('contactName', e.target.value)
                  }
                  placeholder="Name of State Contact"
                  fullWidth
                  required
                  error={!!validationErrors.contactName}
                  helperText={validationErrors.contactName}
                />

                <TextField
                  label="Contact Job Title"
                  value={formData.contactTitle}
                  onChange={e =>
                    handleFieldChange('contactTitle', e.target.value)
                  }
                  placeholder="State Contact Job Title"
                  fullWidth
                  required
                  error={!!validationErrors.contactTitle}
                  helperText={validationErrors.contactTitle}
                />

                <TextField
                  label="Contact Email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={e =>
                    handleFieldChange('contactEmail', e.target.value)
                  }
                  placeholder="contact@agency.gov"
                  fullWidth
                  required
                  error={!!validationErrors.contactEmail}
                  helperText={validationErrors.contactEmail}
                />

                <TextField
                  label="Contact Phone"
                  value={formData.contactPhone}
                  onChange={e =>
                    handleFieldChange('contactPhone', e.target.value)
                  }
                  placeholder="xxx-xxx-xxxx"
                  fullWidth
                  required
                  error={!!validationErrors.contactPhone}
                  helperText={validationErrors.contactPhone}
                />

                <TextField
                  label="Date of Submission"
                  type="date"
                  value={formData.submissionDate}
                  onChange={e =>
                    handleFieldChange('submissionDate', e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  error={!!validationErrors.submissionDate}
                  helperText={validationErrors.submissionDate}
                />

                <FormControl fullWidth>
                  <InputLabel>Document Type</InputLabel>
                  <Select
                    value={formData.documentType}
                    label="Document Type"
                    onChange={e =>
                      handleFieldChange('documentType', e.target.value)
                    }
                  >
                    <MenuItem value="PAPD">PAPD</MenuItem>
                    <MenuItem value="IAPD">IAPD</MenuItem>
                    <MenuItem value="OAPD">OAPD</MenuItem>
                    <MenuItem value="AoA">AoA</MenuItem>
                    <MenuItem value="Acquisition Checklist">
                      Acquisition Checklist
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Multiple Programs Benefit</InputLabel>
                  <Select
                    value={formData.multiplePrograms}
                    label="Multiple Programs Benefit"
                    onChange={e =>
                      handleFieldChange('multiplePrograms', e.target.value)
                    }
                  >
                    <MenuItem value="Y">Yes</MenuItem>
                    <MenuItem value="N">No</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Document Version"
                  value={formData.version}
                  onChange={e => handleFieldChange('version', e.target.value)}
                  placeholder="1.0"
                  fullWidth
                />
              </Box>

              {Object.keys(validationErrors).length > 0 && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Validation Errors:</strong> Please fill in all
                    required fields before proceeding to the next section.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Executive Summary
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Instructions:</strong> Draft a brief executive summary
                  (one or two paragraphs) that presents the intent of this APD.
                  Include the funding type (MMIS or E&E), project name and year,
                  alignment with previous APDs, and how this project will
                  benefit Medicaid.
                </Typography>
              </Alert>

              <Box sx={{ position: 'relative', overflow: 'visible' }}>
                <MilkdownEditor
                  ref={executiveSummaryRef}
                  label="Executive Summary"
                  defaultValue={formData.executiveSummary}
                  placeholder="Draft a brief executive summary that presents the intent of this APD..."
                  helperText="Use rich text formatting to create a professional executive summary. Include project overview, funding request, and expected benefits."
                  pollingInterval={1000}
                  enablePolling={true}
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Management Plan
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>PAPD Requirements:</strong> Describe the project
                  organization, personnel roles, IT team approach, detailed
                  scope of activities, and high-level project schedule. Include
                  procurement details if applicable.
                </Typography>
              </Alert>

              <Box sx={{ position: 'relative', overflow: 'visible' }}>
                <MilkdownEditor
                  ref={projectPlanRef}
                  label="Project Management Plan"
                  defaultValue={formData.projectManagementPlan}
                  placeholder="Describe the project organization, including personnel roles and approach..."
                  helperText="Include project organization, key personnel, approach, major activities, and success metrics."
                  pollingInterval={1000}
                  enablePolling={true}
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statement of Needs and Objectives
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>PAPD Requirements:</strong> Describe the purpose and
                  objectives of the project. Provide a summary of project needs,
                  objectives, and anticipated benefits of the proposed
                  activities.
                </Typography>
              </Alert>

              <Box sx={{ position: 'relative', overflow: 'visible' }}>
                <MilkdownEditor
                  ref={statementNeedsRef}
                  label="Statement of Needs and Objectives"
                  defaultValue={formData.statementOfNeeds}
                  placeholder="Describe the purpose and objectives of the project to be accomplished..."
                  helperText="Include current system challenges, project objectives, expected benefits, and alignment with state priorities."
                  pollingInterval={1000}
                  enablePolling={true}
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Proposed Activity Schedule for the Project
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>PAPD Requirements:</strong> Provide a high-level
                  activity schedule describing the nature and scope of system
                  work and the methods used to execute the work. Include major
                  milestones, deliverables, and key dates.
                </Typography>
              </Alert>

              <Box sx={{ position: 'relative', overflow: 'visible' }}>
                <MilkdownEditor
                  ref={activityScheduleRef}
                  label="Proposed Activity Schedule"
                  defaultValue={formData.proposedActivitySchedule}
                  placeholder="Provide a high-level activity schedule with major milestones and deliverables..."
                  helperText="Include project timeline, key activities, resource allocation, and critical success factors. Use tables for schedule details."
                  pollingInterval={1000}
                  enablePolling={true}
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Proposed Budget
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>PAPD Requirements:</strong> Include the proposed
                  budget funding requested in this APD. List funding needs by
                  categories, cost elements, and amounts. Separate federal and
                  state costs by applicable FFP rates.
                </Typography>
              </Alert>

              <Box sx={{ position: 'relative', overflow: 'visible' }}>
                <MilkdownEditor
                  ref={budgetRef}
                  label="Proposed Budget"
                  defaultValue={formData.proposedBudget}
                  placeholder="Provide detailed budget information including federal and state cost breakdown..."
                  helperText="Include budget summary, detailed cost categories, and justification. Use tables for budget details and FFP calculations."
                  pollingInterval={1000}
                  enablePolling={true}
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assurances and Compliance
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>PAPD Requirements:</strong> Review each Code of
                  Federal Regulations (CFR) citation and indicate whether your
                  state will comply. Click the status button to cycle through:
                  Not Set → Yes → No → Not Set. All items must be answered, and
                  explanations are required when selecting &quot;No&quot;.
                </Typography>
              </Alert>

              <Box sx={{ display: 'grid', gap: 2 }}>
                {[
                  {
                    key: 'cfr433',
                    label: '42 CFR Part 433',
                    description: 'State fiscal administration',
                  },
                  {
                    key: 'cfr75',
                    label: '45 CFR Part 75',
                    description: 'Uniform administrative requirements',
                  },
                  {
                    key: 'cfr95',
                    label: '45 CFR Part 95',
                    description: 'General administration - ADP equipment',
                  },
                  {
                    key: 'cfr495_350',
                    label: '42 CFR § 495.350',
                    description:
                      'Access to records, reporting, and agency attestations',
                  },
                  {
                    key: 'cfr495_346',
                    label: '42 CFR § 495.346',
                    description: 'Reporting requirements',
                  },
                  {
                    key: 'cfr495_360',
                    label: '42 CFR § 495.360',
                    description:
                      'Software ownership rights and federal licenses',
                  },
                  {
                    key: 'cfr431_300',
                    label: '42 CFR § 431.300',
                    description:
                      'Information safeguarding and HIPAA compliance',
                  },
                  {
                    key: 'cfr164',
                    label: '45 CFR Part 164',
                    description: 'Security and privacy standards',
                  },
                ].map(item => {
                  const currentState =
                    formData.assurances[
                      item.key as keyof typeof formData.assurances
                    ];
                  const hasStatusError =
                    !!validationErrors[`${item.key}_status`];
                  const hasExplanationError =
                    !!validationErrors[`${item.key}_explanation`];

                  return (
                    <Card
                      key={item.key}
                      variant="outlined"
                      sx={{
                        border: hasStatusError ? '2px solid' : '1px solid',
                        borderColor: hasStatusError ? 'error.main' : 'grey.300',
                        backgroundColor: hasStatusError
                          ? 'error.50'
                          : 'background.paper',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: hasStatusError
                            ? 'error.main'
                            : 'primary.main',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            mb: hasStatusError ? 2 : 0,
                          }}
                        >
                          {/* CFR Information */}
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="primary.main"
                              gutterBottom
                            >
                              {item.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          </Box>

                          {/* Compliance Status Toggle */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 0.5 }}
                              >
                                Status
                              </Typography>

                              <IconButton
                                onClick={() =>
                                  handleAssuranceChange(
                                    item.key as keyof typeof formData.assurances
                                  )
                                }
                                size="large"
                                sx={{
                                  width: 48,
                                  height: 48,
                                  border: '2px solid',
                                  borderColor:
                                    currentState === 'yes'
                                      ? 'success.main'
                                      : currentState === 'no'
                                        ? 'error.main'
                                        : hasStatusError
                                          ? 'error.main'
                                          : 'grey.400',
                                  backgroundColor:
                                    currentState === 'yes'
                                      ? 'success.50'
                                      : currentState === 'no'
                                        ? 'error.50'
                                        : hasStatusError
                                          ? 'error.50'
                                          : 'grey.50',
                                  color:
                                    currentState === 'yes'
                                      ? 'success.main'
                                      : currentState === 'no'
                                        ? 'error.main'
                                        : hasStatusError
                                          ? 'error.main'
                                          : 'text.disabled',
                                  '&:hover': {
                                    backgroundColor:
                                      currentState === 'yes'
                                        ? 'success.100'
                                        : currentState === 'no'
                                          ? 'error.100'
                                          : 'grey.100',
                                    transform: 'scale(1.1)',
                                    boxShadow: 2,
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                              >
                                {currentState === 'yes' && (
                                  <CheckCircleIcon sx={{ fontSize: 24 }} />
                                )}
                                {currentState === 'no' && (
                                  <ErrorIcon sx={{ fontSize: 24 }} />
                                )}
                                {currentState === 'unset' && (
                                  <UncheckedIcon sx={{ fontSize: 24 }} />
                                )}
                              </IconButton>
                            </Box>

                            <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                              <Chip
                                label={
                                  currentState === 'yes'
                                    ? 'Yes'
                                    : currentState === 'no'
                                      ? 'No'
                                      : 'Not Set'
                                }
                                size="small"
                                color={
                                  currentState === 'yes'
                                    ? 'success'
                                    : currentState === 'no'
                                      ? 'error'
                                      : hasStatusError
                                        ? 'error'
                                        : 'default'
                                }
                                variant={
                                  currentState === 'unset'
                                    ? 'outlined'
                                    : 'filled'
                                }
                                sx={{
                                  fontWeight: 'bold',
                                  minWidth: 70,
                                  fontSize: '0.75rem',
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>

                        {/* Status Error Alert */}
                        {hasStatusError && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              {validationErrors[`${item.key}_status`]}
                            </Typography>
                          </Alert>
                        )}

                        {/* Explanation Field (only show when No is selected) */}
                        {currentState === 'no' && (
                          <Box
                            sx={{
                              mt: 2,
                              pt: 2,
                              borderTop: '1px solid',
                              borderColor: 'grey.200',
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              sx={{ mb: 1, color: 'error.main' }}
                            >
                              ⚠️ Explanation Required for Non-Compliance
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              placeholder="Please provide a detailed explanation for why the state cannot comply with this regulation, including any alternative measures or mitigation strategies..."
                              value={
                                formData.assuranceExplanations[
                                  item.key as keyof typeof formData.assuranceExplanations
                                ]
                              }
                              onChange={e =>
                                handleExplanationChange(
                                  item.key as keyof typeof formData.assuranceExplanations,
                                  e.target.value
                                )
                              }
                              error={hasExplanationError}
                              helperText={
                                hasExplanationError
                                  ? validationErrors[`${item.key}_explanation`]
                                  : 'Provide specific details about non-compliance and any mitigation measures.'
                              }
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'background.paper',
                                },
                              }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>

              {Object.keys(validationErrors).length > 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Please address the validation errors above before
                    proceeding.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Final Review - Complete PAPD Document
              </Typography>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Review Complete:</strong> Below is the complete PAPD
                  document showing both the rendered markdown (left) and raw
                  markdown source (right). This demonstrates how all form
                  sections combine into a cohesive document.
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, height: '600px' }}>
                {/* Rendered Markdown Preview */}
                <Card sx={{ flex: 1, overflow: 'hidden' }}>
                  <CardContent sx={{ height: '100%', overflow: 'auto', p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'white',
                        pb: 1,
                        borderBottom: '1px solid',
                        borderColor: 'grey.200',
                      }}
                    >
                      📄 Rendered Document Preview
                    </Typography>
                    <Box
                      sx={{
                        '& h1': {
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          mt: 2,
                          mb: 1,
                        },
                        '& h2': {
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          mt: 2,
                          mb: 1,
                        },
                        '& h3': {
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          mt: 1.5,
                          mb: 0.5,
                        },
                        '& p': { mb: 1 },
                        '& ul, & ol': { pl: 2, mb: 1 },
                        '& table': {
                          width: '100%',
                          borderCollapse: 'collapse',
                          mb: 2,
                        },
                        '& th, & td': {
                          border: '1px solid #ddd',
                          p: 1,
                          fontSize: '0.75rem',
                        },
                        '& th': {
                          backgroundColor: 'grey.100',
                          fontWeight: 'bold',
                        },
                        '& hr': { my: 2 },
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: `
                          <h1>${formData.state} Advanced Planning Document (MES APD)</h1>
                          
                          <h2>Executive Summary</h2>
                          ${convertMarkdownToHtml(formData.executiveSummary)}
                          
                          <h2>1. Project Management Plan</h2>
                          ${convertMarkdownToHtml(formData.projectManagementPlan)}
                          
                          <h2>2. Statement of Needs and Objectives</h2>
                          ${convertMarkdownToHtml(formData.statementOfNeeds)}
                          
                          <h2>7. Proposed Activity Schedule for the Project</h2>
                          ${convertMarkdownToHtml(formData.proposedActivitySchedule)}
                          
                          <h2>8. Proposed Budget</h2>
                          ${convertMarkdownToHtml(formData.proposedBudget)}
                          
                          <h2>12. Assurances and Compliance</h2>
                          <h3>CFR Attestation</h3>
                          <table border="1" style="border-collapse: collapse; width: 100%; margin: 1em 0;">
                            <thead>
                              <tr><th style="padding: 8px; background: #f5f5f5;">CFR Reference</th><th style="padding: 8px; background: #f5f5f5;">YES</th><th style="padding: 8px; background: #f5f5f5;">NO</th><th style="padding: 8px; background: #f5f5f5;">Explanation</th></tr>
                            </thead>
                            <tbody>
                              <tr><td style="padding: 8px;">42 CFR Part 433</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr433 === 'yes' ? 'X' : ''}</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr433 === 'no' ? 'X' : ''}</td><td style="padding: 8px;">${formData.assuranceExplanations.cfr433}</td></tr>
                              <tr><td style="padding: 8px;">45 CFR Part 75</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr75 === 'yes' ? 'X' : ''}</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr75 === 'no' ? 'X' : ''}</td><td style="padding: 8px;">${formData.assuranceExplanations.cfr75}</td></tr>
                              <tr><td style="padding: 8px;">45 CFR Part 95</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr95 === 'yes' ? 'X' : ''}</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr95 === 'no' ? 'X' : ''}</td><td style="padding: 8px;">${formData.assuranceExplanations.cfr95}</td></tr>
                              <tr><td style="padding: 8px;">42 CFR § 495.350</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr495_350 === 'yes' ? 'X' : ''}</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr495_350 === 'no' ? 'X' : ''}</td><td style="padding: 8px;">${formData.assuranceExplanations.cfr495_350}</td></tr>
                              <tr><td style="padding: 8px;">42 CFR § 495.346</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr495_346 === 'yes' ? 'X' : ''}</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr495_346 === 'no' ? 'X' : ''}</td><td style="padding: 8px;">${formData.assuranceExplanations.cfr495_346}</td></tr>
                              <tr><td style="padding: 8px;">42 CFR § 495.360</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr495_360 === 'yes' ? 'X' : ''}</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr495_360 === 'no' ? 'X' : ''}</td><td style="padding: 8px;">${formData.assuranceExplanations.cfr495_360}</td></tr>
                              <tr><td style="padding: 8px;">42 CFR § 431.300</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr431_300 === 'yes' ? 'X' : ''}</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr431_300 === 'no' ? 'X' : ''}</td><td style="padding: 8px;">${formData.assuranceExplanations.cfr431_300}</td></tr>
                              <tr><td style="padding: 8px;">45 CFR Part 164</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr164 === 'yes' ? 'X' : ''}</td><td style="padding: 8px; text-align: center;">${formData.assurances.cfr164 === 'no' ? 'X' : ''}</td><td style="padding: 8px;">${formData.assuranceExplanations.cfr164}</td></tr>
                            </tbody>
                          </table>
                          
                          <hr>
                          <p><em>Document generated by eAPD-Next on ${new Date().toLocaleDateString()}</em></p>
                        `,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Raw Markdown Source */}
                <Card sx={{ flex: 1, overflow: 'hidden' }}>
                  <CardContent sx={{ height: '100%', overflow: 'auto', p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'white',
                        pb: 1,
                        borderBottom: '1px solid',
                        borderColor: 'grey.200',
                      }}
                    >
                      📝 Raw Markdown Source
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        backgroundColor: 'grey.50',
                        p: 2,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0,
                        border: '1px solid',
                        borderColor: 'grey.300',
                      }}
                    >
                      {`---
State: ${formData.state}
State Medicaid Agency: ${formData.agency}
State Medicaid Agency Primary Contact: ${formData.contactName}
State Medicaid Agency Primary Contact Job Title: ${formData.contactTitle}
State Medicaid Agency Primary Contact Email Address: ${formData.contactEmail}
State Medicaid Agency Primary Contact Telephone Number: ${formData.contactPhone}
Date of Submission: ${formData.submissionDate}
Document Type: ${formData.documentType}
Do any initiatives described in this document benefit multiple Programs (Y/N): ${formData.multiplePrograms}
Version: ${formData.version}
---

# ${formData.state} Advanced Planning Document (MES APD)

## Table of Contents

[PLACEHOLDER FOR MARKDOWN TOC]

## Executive Summary

${formData.executiveSummary}

## 1. Project Management Plan

${formData.projectManagementPlan}

## 2. Statement of Needs and Objectives

${formData.statementOfNeeds}

## 7. Proposed Activity Schedule for the Project

${formData.proposedActivitySchedule}

## 8. Proposed Budget

${formData.proposedBudget}

## 12. Assurances and Compliance

### CFR Attestation

| CFR Reference | YES | NO | Explanation |
|---------------|-----|----|-----------| 
| 42 CFR Part 433 | ${formData.assurances.cfr433 === 'yes' ? 'X' : ''} | ${formData.assurances.cfr433 === 'no' ? 'X' : ''} | ${formData.assuranceExplanations.cfr433} |
| 45 CFR Part 75 | ${formData.assurances.cfr75 === 'yes' ? 'X' : ''} | ${formData.assurances.cfr75 === 'no' ? 'X' : ''} | ${formData.assuranceExplanations.cfr75} |
| 45 CFR Part 95 | ${formData.assurances.cfr95 === 'yes' ? 'X' : ''} | ${formData.assurances.cfr95 === 'no' ? 'X' : ''} | ${formData.assuranceExplanations.cfr95} |
| 42 CFR § 495.350 | ${formData.assurances.cfr495_350 === 'yes' ? 'X' : ''} | ${formData.assurances.cfr495_350 === 'no' ? 'X' : ''} | ${formData.assuranceExplanations.cfr495_350} |
| 42 CFR § 495.346 | ${formData.assurances.cfr495_346 === 'yes' ? 'X' : ''} | ${formData.assurances.cfr495_346 === 'no' ? 'X' : ''} | ${formData.assuranceExplanations.cfr495_346} |
| 42 CFR § 495.360 | ${formData.assurances.cfr495_360 === 'yes' ? 'X' : ''} | ${formData.assurances.cfr495_360 === 'no' ? 'X' : ''} | ${formData.assuranceExplanations.cfr495_360} |
| 42 CFR § 431.300 | ${formData.assurances.cfr431_300 === 'yes' ? 'X' : ''} | ${formData.assurances.cfr431_300 === 'no' ? 'X' : ''} | ${formData.assuranceExplanations.cfr431_300} |
| 45 CFR Part 164 | ${formData.assurances.cfr164 === 'yes' ? 'X' : ''} | ${formData.assurances.cfr164 === 'no' ? 'X' : ''} | ${formData.assuranceExplanations.cfr164} |

---

*Document generated by eAPD-Next on ${new Date().toLocaleDateString()}*`}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    const markdown = document.querySelector('pre')?.textContent;
                    if (markdown) {
                      navigator.clipboard.writeText(markdown);
                      alert('Markdown copied to clipboard!');
                    }
                  }}
                >
                  Copy Markdown
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    console.log('Complete PAPD Data:', formData);
                    alert('Complete form data logged to console.');
                  }}
                >
                  Export Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h3" component="h1">
          PAPD Form Demo
        </Typography>

        {/* Save Status Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {saveStatus === 'unsaved' && (
            <Chip
              label="● Unsaved changes"
              size="small"
              color="error"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
          {saveStatus === 'saving' && (
            <Chip
              label="Saving..."
              size="small"
              color="warning"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
          {saveStatus === 'saved' && (
            <Chip
              label="✓ Saved"
              size="small"
              color="success"
              variant="filled"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        This demo shows dynamic form generation with Milkdown integration for
        APD creation. It combines Material-UI components for structured data
        with Milkdown editors for rich text content.
        <strong>
          {' '}
          Content auto-saves every 3 seconds and when navigating between
          sections.
        </strong>
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Task 4.3 Demo:</strong> This demonstrates mixed field types
          (Material-UI + Milkdown), section navigation with state preservation,
          and real APD content structure.
        </Typography>
      </Alert>

      {dataLoadedFromStorage && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Previous form data has been restored from your browser&apos;s local
          storage.
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={loadSampleContent}>
          Load Sample PAPD Content
        </Button>

        <Button variant="outlined" color="error" onClick={clearAllData}>
          Clear All Data
        </Button>

        <Button
          variant="outlined"
          onClick={saveCurrentEditorContent}
          disabled={saveStatus === 'saved'}
          color={saveStatus === 'unsaved' ? 'warning' : 'primary'}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save Current Section'}
        </Button>

        <Button
          variant="outlined"
          onClick={() => {
            console.log('Current Form Data:', formData);
            alert('Form data logged to console. Check developer tools.');
          }}
        >
          Show Form Data
        </Button>
      </Box>

      {/* Enhanced Stepper Navigation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => {
              const status = sectionCompletionStatus[index];
              const isActive = index === activeStep;

              return (
                <Step key={label} completed={status === 'complete'}>
                  <StepLabel
                    onClick={() => handleStepClick(index)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleStepClick(index);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Go to step ${index + 1}: ${label}`}
                    sx={{
                      cursor: 'pointer',
                      '&:focus': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: '2px',
                      },
                      '& .MuiStepLabel-label': {
                        color:
                          status === 'error'
                            ? 'error.main'
                            : status === 'complete'
                              ? 'success.main'
                              : isActive
                                ? 'primary.main'
                                : 'text.secondary',
                        fontWeight: isActive ? 'bold' : 'normal',
                      },
                      '& .MuiStepLabel-root': {
                        backgroundColor: isActive
                          ? 'primary.light'
                          : 'transparent',
                        borderRadius: 1,
                        padding: 1,
                      },
                    }}
                    StepIconComponent={() => {
                      if (status === 'complete') {
                        return <CheckCircleIcon color="success" />;
                      } else if (status === 'error') {
                        return <ErrorIcon color="error" />;
                      } else if (isActive) {
                        return (
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: 'primary.main',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {index + 1}
                          </Box>
                        );
                      } else {
                        return <UncheckedIcon color="disabled" />;
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>

          {/* Status Legend */}
          <Box
            sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircleIcon color="success" fontSize="small" />
              <Typography variant="caption">Complete</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ErrorIcon color="error" fontSize="small" />
              <Typography variant="caption">Validation Error</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <UncheckedIcon color="disabled" fontSize="small" />
              <Typography variant="caption">Incomplete</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Box sx={{ mb: 3 }}>{renderStepContent()}</Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          variant="outlined"
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography variant="body2" sx={{ alignSelf: 'center', mr: 2 }}>
            Step {activeStep + 1} of {steps.length}
          </Typography>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={() => {
                console.log('Final Form Data:', formData);
                alert('PAPD form completed! Data logged to console.');
              }}
            >
              Complete PAPD
            </Button>
          ) : (
            <Button onClick={handleNext} variant="contained">
              Next
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Demo Features Information */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Enhanced Demo Features Demonstrated
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <Typography component="li" variant="body2">
              ✅ <strong>Mixed Field Types:</strong> Material-UI components
              (administrative info) + Milkdown editors (rich text sections)
            </Typography>
            <Typography component="li" variant="body2">
              ✅ <strong>Form Validation:</strong> Required field validation on
              administrative section with error display
            </Typography>
            <Typography component="li" variant="body2">
              ✅ <strong>Section Navigation:</strong> 8-step TurboTax-style
              stepper with validation-gated progression
            </Typography>
            <Typography component="li" variant="body2">
              ✅ <strong>Rich Content with Tables:</strong> Milkdown editors
              displaying complex tables (budget, schedule, personnel)
            </Typography>
            <Typography component="li" variant="body2">
              ✅ <strong>Compliance Checkboxes:</strong> CFR attestation table
              with conditional explanation fields
            </Typography>
            <Typography component="li" variant="body2">
              ✅ <strong>Final Document Generation:</strong> Complete markdown
              output combining all sections
            </Typography>
            <Typography component="li" variant="body2">
              ✅ <strong>Real APD Structure:</strong> Based on actual PAPD
              template with comprehensive content
            </Typography>
            <Typography component="li" variant="body2">
              ✅ <strong>State Management:</strong> All data preserved across
              navigation with real-time updates
            </Typography>
            <Typography component="li" variant="body2">
              ✅ <strong>Sample Content:</strong> Realistic California MMIS
              modernization project data
            </Typography>
            <Typography component="li" variant="body2">
              ✅ <strong>Export Capabilities:</strong> Copy markdown, export
              data, and document generation
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Key Sections Included:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <Typography component="li" variant="body2">
              <strong>Administrative Information</strong> - Material-UI fields
              with validation
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Executive Summary</strong> - Milkdown editor with project
              overview
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Project Management Plan</strong> - Milkdown editor with
              personnel cost table
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Statement of Needs</strong> - Milkdown editor with
              narrative and bullet content
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Activity Schedule</strong> - Milkdown editor with timeline
              tables and resource allocation
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Proposed Budget</strong> - Milkdown editor with
              comprehensive budget tables and FFP calculations
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Assurances & Compliance</strong> - Material-UI table with
              checkboxes and conditional validation
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Final Review</strong> - Complete markdown document
              generation and export
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

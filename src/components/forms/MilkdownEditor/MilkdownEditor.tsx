import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Crepe } from '@milkdown/crepe';
import {
  getMarkdown,
  getHTML,
  outline,
  insert,
  insertPos,
  replaceAll,
  replaceRange,
  forceUpdate,
} from '@milkdown/utils';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

export interface MilkdownEditorProps {
  /**
   * Initial markdown content for the editor
   */
  defaultValue?: string;
  /**
   * Label for the editor (for accessibility)
   */
  label?: string;
  /**
   * Whether the editor is in read-only mode
   */
  readOnly?: boolean;
  /**
   * Placeholder text when editor is empty
   */
  placeholder?: string;
  /**
   * Error state for validation
   */
  error?: boolean;
  /**
   * Helper text displayed below the editor
   */
  helperText?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Polling interval for content synchronization (in milliseconds)
   * Default: 1000ms for validation-heavy contexts, 500ms for responsive contexts
   */
  pollingInterval?: number;
  /**
   * Whether to enable automatic content synchronization via polling
   * Default: true
   */
  enablePolling?: boolean;
}

export interface MilkdownEditorRef {
  /**
   * Get the current markdown content from the editor
   */
  getMarkdown: () => string;
  /**
   * Get the editor instance
   */
  getEditor: () => Crepe | null;
  /**
   * Get HTML content for preview/export
   */
  getHTML: () => string;
  /**
   * Get document outline for navigation
   */
  getOutline: () => Array<{ text: string; level: number; id: string }>;
  /**
   * Insert content at current cursor position
   */
  insertContent: (content: string, inline?: boolean) => void;
  /**
   * Insert content at specific position
   */
  insertAtPosition: (
    content: string,
    position: number,
    inline?: boolean
  ) => void;
  /**
   * Replace all content
   */
  replaceAllContent: (content: string, flush?: boolean) => void;
  /**
   * Replace content in specific range
   */
  replaceRange: (content: string, range: { from: number; to: number }) => void;
  /**
   * Force editor update
   */
  forceUpdate: () => void;
  /**
   * Set up content change listener with callback
   * This is the standardized way to listen for content changes
   */
  onContentChange: (callback: (markdown: string) => void) => () => void;
  /**
   * Get the current content and trigger change callback if different
   * Used for immediate synchronization (e.g., on blur)
   */
  syncContent: () => string;
}

/**
 * Milkdown WYSIWYG editor component using Crepe
 * Provides a rich text editing experience for markdown content
 */
export const MilkdownEditor = forwardRef<
  MilkdownEditorRef,
  MilkdownEditorProps
>(
  (
    {
      defaultValue = '',
      label,
      readOnly = false,
      placeholder = 'Start writing...',
      error = false,
      helperText,
      required = false,
      pollingInterval = 1000,
      enablePolling = true,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const crepeRef = useRef<Crepe | null>(null);
    const contentChangeCallbackRef = useRef<
      ((markdown: string) => void) | null
    >(null);
    const lastContentRef = useRef<string>(defaultValue);
    const [, setIsInitialized] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    // Helper function to get cleaned markdown content
    const getCleanedMarkdown = useCallback(() => {
      if (!crepeRef.current?.editor) {
        return '';
      }
      try {
        const rawMarkdown = crepeRef.current.editor.action(getMarkdown());

        // Post-process the markdown to fix bullet list spacing issues
        const cleanedMarkdown = rawMarkdown
          // Remove extra blank lines between bullet list items (- * +)
          .replace(/^(\s*[-*+]\s+.+)\n\n+(?=\s*[-*+]\s+)/gm, '$1\n')
          // Also handle the case where there might be whitespace on the blank line
          .replace(/^(\s*[-*+]\s+.+)\n\s+\n+(?=\s*[-*+]\s+)/gm, '$1\n');

        return cleanedMarkdown;
      } catch (error) {
        console.warn('Failed to get markdown content:', error);
        return '';
      }
    }, []);

    // Expose methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        getMarkdown: getCleanedMarkdown,

        getHTML: () => {
          if (!crepeRef.current?.editor) {
            return '';
          }
          try {
            return crepeRef.current.editor.action(getHTML());
          } catch (error) {
            console.warn('Failed to get HTML content:', error);
            return '';
          }
        },

        getOutline: () => {
          if (!crepeRef.current?.editor) {
            return [];
          }
          try {
            return crepeRef.current.editor.action(outline());
          } catch (error) {
            console.warn('Failed to get outline:', error);
            return [];
          }
        },

        insertContent: (content: string, inline = false) => {
          if (!crepeRef.current?.editor) {
            console.warn('Editor not available for content insertion');
            return;
          }
          try {
            crepeRef.current.editor.action(insert(content, inline));
          } catch (error) {
            console.warn('Failed to insert content:', error);
          }
        },

        insertAtPosition: (
          content: string,
          position: number,
          inline = false
        ) => {
          if (!crepeRef.current?.editor) {
            console.warn('Editor not available for positioned insertion');
            return;
          }
          try {
            crepeRef.current.editor.action(
              insertPos(content, position, inline)
            );
          } catch (error) {
            console.warn('Failed to insert content at position:', error);
          }
        },

        replaceAllContent: (content: string, flush = false) => {
          if (!crepeRef.current?.editor) {
            console.warn('Editor not available for content replacement');
            return;
          }
          try {
            crepeRef.current.editor.action(replaceAll(content, flush));
            // Update our last content reference
            lastContentRef.current = content;
          } catch (error) {
            console.warn('Failed to replace all content:', error);
          }
        },

        replaceRange: (
          content: string,
          range: { from: number; to: number }
        ) => {
          if (!crepeRef.current?.editor) {
            console.warn('Editor not available for range replacement');
            return;
          }
          try {
            crepeRef.current.editor.action(replaceRange(content, range));
          } catch (error) {
            console.warn('Failed to replace range:', error);
          }
        },

        forceUpdate: () => {
          if (!crepeRef.current?.editor) {
            console.warn('Editor not available for force update');
            return;
          }
          try {
            crepeRef.current.editor.action(forceUpdate());
          } catch (error) {
            console.warn('Failed to force update:', error);
          }
        },

        getEditor: () => crepeRef.current,

        // Standardized content change handling
        onContentChange: (callback: (markdown: string) => void) => {
          contentChangeCallbackRef.current = callback;

          // Return cleanup function
          return () => {
            contentChangeCallbackRef.current = null;
          };
        },

        // Immediate content synchronization
        syncContent: () => {
          const currentContent = getCleanedMarkdown();
          if (currentContent !== lastContentRef.current) {
            lastContentRef.current = currentContent;
            if (contentChangeCallbackRef.current) {
              contentChangeCallbackRef.current(currentContent);
            }
          }
          return currentContent;
        },
      }),
      [getCleanedMarkdown]
    );
    useEffect(() => {
      let mounted = true;

      const initializeEditor = async () => {
        if (!editorRef.current || !mounted) return;

        try {
          // Clean up any existing editor first
          if (crepeRef.current) {
            crepeRef.current.destroy();
            crepeRef.current = null;
          }

          const crepe = new Crepe({
            root: editorRef.current,
            defaultValue: defaultValue || placeholder,
          });

          // Initialize the editor
          await crepe.create();

          if (!mounted) {
            crepe.destroy();
            return;
          }

          crepeRef.current = crepe;
          setIsInitialized(true);
          setInitError(null);

          // Initialize content reference
          lastContentRef.current = defaultValue || '';

          console.log('Crepe editor initialized successfully', { readOnly });

          // Add keyboard handler to ProseMirror element for tab navigation
          setTimeout(() => {
            const proseMirrorEl = editorRef.current?.querySelector(
              '.ProseMirror'
            ) as HTMLElement;
            if (proseMirrorEl && !readOnly) {
              const handleKeyDown = (e: KeyboardEvent) => {
                console.log(
                  'Key pressed in Milkdown:',
                  e.key,
                  e.metaKey,
                  e.ctrlKey
                );

                // Allow Escape to tab out of the editor
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();

                  console.log('Escape pressed, trying to focus next element');

                  // Find the next focusable element and focus it
                  const focusableElements = document.querySelectorAll(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
                  );
                  const focusableArray = Array.from(
                    focusableElements
                  ) as HTMLElement[];

                  // Find current editor in the tab order - look for the editor container
                  const editorContainer = editorRef.current;
                  let currentIndex = -1;

                  // First, try to find the editor container or any parent that contains it
                  for (let i = 0; i < focusableArray.length; i++) {
                    const element = focusableArray[i];
                    if (
                      element.contains(proseMirrorEl) ||
                      element === proseMirrorEl ||
                      (editorContainer && element.contains(editorContainer)) ||
                      element === editorContainer
                    ) {
                      currentIndex = i;
                      break;
                    }
                  }

                  let nextIndex = -1;
                  if (currentIndex >= 0) {
                    nextIndex = currentIndex + 1;
                  } else {
                    // Fallback: find the next focusable element by DOM position
                    // Get the editor's bounding rect to find elements after it
                    const editorRect = proseMirrorEl.getBoundingClientRect();

                    // Find focusable elements that come after this editor in DOM order
                    for (let i = 0; i < focusableArray.length; i++) {
                      const element = focusableArray[i];
                      const elementRect = element.getBoundingClientRect();

                      // Check if element is below the editor or to the right and below
                      if (
                        elementRect.top > editorRect.bottom ||
                        (elementRect.top >= editorRect.top &&
                          elementRect.left > editorRect.right)
                      ) {
                        nextIndex = i;

                        break;
                      }
                    }

                    // If still not found, just use the first button or input we can find
                    if (nextIndex === -1) {
                      for (let i = 0; i < focusableArray.length; i++) {
                        const element = focusableArray[i];
                        if (
                          element.tagName === 'BUTTON' ||
                          element.tagName === 'INPUT'
                        ) {
                          nextIndex = i;

                          break;
                        }
                      }
                    }
                  }

                  if (nextIndex >= 0 && nextIndex < focusableArray.length) {
                    focusableArray[nextIndex].focus();
                  } else if (nextIndex >= focusableArray.length) {
                    // Wrap to first element
                    focusableArray[0]?.focus();
                  }
                }
              };

              proseMirrorEl.addEventListener('keydown', handleKeyDown, true);

              // Store cleanup function
              const cleanup = () => {
                proseMirrorEl.removeEventListener(
                  'keydown',
                  handleKeyDown,
                  true
                );
              };

              // Store cleanup in a way we can access it later
              (proseMirrorEl as any)._tabNavigationCleanup = cleanup;
            }
          }, 500);

          // Set up onChange listener if provided - using a separate effect to avoid re-initialization
          // This will be handled in a separate useEffect to prevent editor re-creation

          // Force read-only state after initialization
          if (readOnly) {
            try {
              // Wait for the editor to fully initialize, then force read-only
              setTimeout(() => {
                if (crepe.editor && editorRef.current) {
                  // Also force read-only at DOM level
                  const container = editorRef.current;
                  const proseMirrorEl = container.querySelector('.ProseMirror');
                  if (proseMirrorEl) {
                    proseMirrorEl.setAttribute('contenteditable', 'false');
                    (proseMirrorEl as HTMLElement).style.cursor = 'default';
                    (proseMirrorEl as HTMLElement).style.pointerEvents = 'none';
                  }

                  // Hide any editing controls that might have appeared
                  const editingElements = container.querySelectorAll(
                    '.crepe-block-handle, .crepe-slash-menu, .block-handle, .drag-handle, .plus-button, [data-type="block-handle"], [data-type="slash-menu"]'
                  );
                  editingElements.forEach(el => {
                    (el as HTMLElement).style.display = 'none';
                  });
                }
              }, 200);
            } catch (err) {
              console.warn('Could not set read-only state:', err);
            }
          }
        } catch (err) {
          console.error('Failed to initialize Milkdown editor:', err);
          if (mounted) {
            setInitError(
              'Failed to initialize editor. Please refresh the page.'
            );
          }
        }
      };

      initializeEditor();

      // Cleanup function
      return () => {
        mounted = false;

        // Clean up keyboard event listener
        const proseMirrorEl = editorRef.current?.querySelector(
          '.ProseMirror'
        ) as HTMLElement;
        if (proseMirrorEl && (proseMirrorEl as any)._tabNavigationCleanup) {
          (proseMirrorEl as any)._tabNavigationCleanup();
        }

        if (crepeRef.current) {
          crepeRef.current.destroy();
          crepeRef.current = null;
        }
        setIsInitialized(false);
      };
    }, [defaultValue, readOnly, placeholder]); // Keep minimal dependencies

    // Standardized polling system for content synchronization
    useEffect(() => {
      if (!enablePolling || readOnly) {
        return;
      }

      // Wait a bit for editor to be fully initialized
      const startPolling = () => {
        const interval = setInterval(() => {
          if (crepeRef.current?.editor && contentChangeCallbackRef.current) {
            try {
              const currentContent = getCleanedMarkdown();
              if (currentContent !== lastContentRef.current) {
                lastContentRef.current = currentContent;
                contentChangeCallbackRef.current(currentContent);
              }
            } catch (error) {
              console.warn('Failed to sync content during polling:', error);
            }
          }
        }, pollingInterval);

        return interval;
      };

      // Start polling after a delay to ensure editor is ready
      const timer = setTimeout(() => {
        const interval = startPolling();

        // Store interval for cleanup
        return () => {
          clearInterval(interval);
        };
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }, [enablePolling, readOnly, pollingInterval]);

    // Blur event handler for immediate synchronization
    useEffect(() => {
      if (readOnly || !crepeRef.current) {
        return;
      }

      const handleBlur = () => {
        if (contentChangeCallbackRef.current) {
          try {
            const currentContent = getCleanedMarkdown();
            if (currentContent !== lastContentRef.current) {
              lastContentRef.current = currentContent;
              contentChangeCallbackRef.current(currentContent);
            }
          } catch (error) {
            console.warn('Failed to sync content on blur:', error);
          }
        }
      };

      // Add blur listener to the editor container
      const proseMirror = editorRef.current?.querySelector('.ProseMirror');
      if (proseMirror) {
        proseMirror.addEventListener('blur', handleBlur, true);

        return () => {
          proseMirror.removeEventListener('blur', handleBlur, true);
        };
      }

      // Return empty cleanup function if proseMirror is not found
      return () => {};
    }, [readOnly, getCleanedMarkdown]);

    return (
      <Box sx={{ width: '100%' }}>
        {label && (
          <Typography
            variant="body2"
            component="label"
            sx={{
              display: 'block',
              mb: 1,
              fontWeight: 500,
              color: error ? 'error.main' : 'text.primary',
            }}
          >
            {label}
            {required && (
              <Typography
                component="span"
                sx={{ color: 'error.main', ml: 0.5 }}
              >
                *
              </Typography>
            )}
          </Typography>
        )}

        {initError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {initError}
          </Alert>
        )}

        <Box
          ref={editorRef}
          onKeyDown={e => {
            // Allow Escape to tab out of the editor (most intuitive)
            // Also allow Cmd+Tab (Mac) / Ctrl+Tab (Windows) as alternative
            if (
              e.key === 'Escape' ||
              (e.key === 'Tab' && (e.metaKey || e.ctrlKey))
            ) {
              e.preventDefault();
              e.stopPropagation();

              // Find the next focusable element and focus it
              const focusableElements = document.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
              );
              const focusableArray = Array.from(
                focusableElements
              ) as HTMLElement[];

              // Find current editor in the tab order
              const editorElement = editorRef.current?.querySelector(
                '.ProseMirror'
              ) as HTMLElement;
              if (editorElement) {
                // Find the next element after this editor
                let nextIndex = -1;
                for (let i = 0; i < focusableArray.length; i++) {
                  if (
                    focusableArray[i].contains(editorElement) ||
                    focusableArray[i] === editorElement
                  ) {
                    nextIndex = e.shiftKey ? i - 1 : i + 1;
                    break;
                  }
                }

                if (nextIndex >= 0 && nextIndex < focusableArray.length) {
                  focusableArray[nextIndex].focus();
                } else if (!e.shiftKey && nextIndex >= focusableArray.length) {
                  // Wrap to first element
                  focusableArray[0]?.focus();
                } else if (e.shiftKey && nextIndex < 0) {
                  // Wrap to last element
                  focusableArray[focusableArray.length - 1]?.focus();
                }
              }
            }
          }}
          sx={{
            minHeight: 300,
            border: 1,
            borderColor: error ? 'error.main' : 'divider',
            borderRadius: 2,
            position: 'relative',
            overflow: 'visible',
            backgroundColor: readOnly ? 'grey.50' : 'background.paper',
            '&:focus-within': {
              borderColor: error
                ? 'error.main'
                : readOnly
                  ? 'divider'
                  : 'primary.main',
              borderWidth: readOnly ? 1 : 2,
            },
            // Error state styling
            ...(error && {
              borderColor: 'error.main',
              '&:focus-within': {
                borderColor: 'error.main',
                borderWidth: 2,
              },
            }),
            // Basic Crepe styling with Material-UI typography
            '& .crepe': {
              minHeight: 'inherit',
              borderRadius: 'inherit', // Inherit border radius from parent
              overflow: 'hidden', // Ensure clean corners
              fontFamily: [
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                'sans-serif',
              ].join(','),
            },
            '& .milkdown': {
              outline: 'none',
              minHeight: 250,
              padding: '16px',
              borderRadius: 'inherit', // Inherit border radius
              fontFamily: 'inherit',
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'text.primary',
            },
            // Basic content styling to match MUI theme
            '& .ProseMirror': {
              outline: 'none',
              borderRadius: 'inherit', // Inherit border radius for clean corners
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              color: 'inherit',
              cursor: readOnly ? 'default' : 'text',
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                fontWeight: 700,
                color: 'text.primary',
              },
              '& p': {
                color: 'text.primary',
                lineHeight: 1.6,
              },
              '& strong': {
                fontWeight: 600,
              },
              '& a': {
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark',
                },
              },
              // Table styling with proper alignment support
              '& table': {
                borderCollapse: 'collapse',
                width: '100%',
                margin: '16px 0',
                border: '1px solid',
                borderColor: 'divider',
              },
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                padding: '8px 12px',
                textAlign: 'left', // Default alignment
              },
              // Right-aligned columns (when markdown uses ---:)
              '& th[style*="text-align: right"], & td[style*="text-align: right"]':
                {
                  textAlign: 'right',
                },
              // Center-aligned columns (when markdown uses :---:)
              '& th[style*="text-align: center"], & td[style*="text-align: center"]':
                {
                  textAlign: 'center',
                },
              // Alternative selectors for different markdown parsers
              '& th.text-right, & td.text-right': {
                textAlign: 'right',
              },
              '& th.text-center, & td.text-center': {
                textAlign: 'center',
              },
              // Header styling
              '& th': {
                backgroundColor: 'grey.100',
                fontWeight: 600,
              },
            },
            // Read-only specific styles
            ...(readOnly && {
              pointerEvents: 'none',
              userSelect: 'text',
              '& .ProseMirror': {
                cursor: 'default !important',
                userSelect: 'text !important',
                pointerEvents: 'none !important',
              },
              // Hide toolbar and all editing UI
              '& .crepe-toolbar, & .milkdown-menu': {
                display: 'none !important',
              },
              // Hide all possible editing controls with various selectors
              '& .crepe-block-handle, & .crepe-slash-menu, & .block-handle, & .drag-handle, & .plus-button':
                {
                  display: 'none !important',
                },
              '& [data-type="block-handle"], & [data-type="slash-menu"], & [data-type="drag-handle"]':
                {
                  display: 'none !important',
                },
              // Hide floating UI elements
              '& [data-floating-ui-portal], & .floating-toolbar': {
                display: 'none !important',
              },
              // Hide any buttons or interactive elements (but not links)
              '& button, & .button, & [role="button"]': {
                display: 'none !important',
              },
              // Hide any elements with editing-related classes
              '& [class*="handle"], & [class*="menu"], & [class*="toolbar"]': {
                display: 'none !important',
              },
              // Disable all pointer events except text selection and links
              '& *': {
                pointerEvents: 'none !important',
              },
              // Re-enable text selection
              '& .ProseMirror, & .ProseMirror *': {
                userSelect: 'text !important',
                cursor: 'text !important',
              },
              // Re-enable pointer events for links to make them clickable
              '& .ProseMirror a': {
                pointerEvents: 'auto !important',
                cursor: 'pointer !important',
                textDecoration: 'underline',
                '&:hover': {
                  textDecoration: 'underline',
                  color: 'primary.dark',
                },
              },
              // Ensure headers are bold in read-only mode
              '& .ProseMirror h1, & .ProseMirror h2, & .ProseMirror h3, & .ProseMirror h4, & .ProseMirror h5, & .ProseMirror h6':
                {
                  fontWeight: '700 !important',
                  color: 'text.primary !important',
                },
              // Ensure table alignment works in read-only mode
              '& .ProseMirror th[style*="text-align: right"], & .ProseMirror td[style*="text-align: right"]':
                {
                  textAlign: 'right !important',
                },
              '& .ProseMirror th[style*="text-align: center"], & .ProseMirror td[style*="text-align: center"]':
                {
                  textAlign: 'center !important',
                },
            }),
          }}
          role="textbox"
          aria-label={label}
          aria-required={required}
          aria-invalid={error}
          aria-describedby={helperText ? `${label}-helper-text` : undefined}
        />

        {helperText && (
          <Typography
            id={`${label}-helper-text`}
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              color: error ? 'error.main' : 'text.secondary',
            }}
          >
            {helperText}
          </Typography>
        )}

        {!readOnly && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            Tip: Press Escape to move to the next field
          </Typography>
        )}
      </Box>
    );
  }
);

MilkdownEditor.displayName = 'MilkdownEditor';

export default MilkdownEditor;

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
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
   * Callback fired when the editor content changes
   */
  onChange?: (markdown: string) => void;
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
      onChange,
      label,
      readOnly = false,
      placeholder = 'Start writing...',
      error = false,
      helperText,
      required = false,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const crepeRef = useRef<Crepe | null>(null);
    const onChangeRef = useRef(onChange);
    const [, setIsInitialized] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    // Update the onChange ref when it changes
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // Expose methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        getMarkdown: () => {
          if (!crepeRef.current?.editor) {
            return '';
          }
          try {
            const rawMarkdown = crepeRef.current.editor.action(getMarkdown());

            // Post-process the markdown to fix bullet list spacing issues
            // The main issue is that Milkdown adds extra blank lines between bullet points
            const cleanedMarkdown = rawMarkdown
              // Remove extra blank lines between bullet list items (- * +)
              .replace(/^(\s*[-*+]\s+.+)\n\n+(?=\s*[-*+]\s+)/gm, '$1\n')
              // Also handle the case where there might be whitespace on the blank line
              .replace(/^(\s*[-*+]\s+.+)\n\s+\n+(?=\s*[-*+]\s+)/gm, '$1\n');

            // Debug logging to help troubleshoot (can be removed later)
            if (rawMarkdown !== cleanedMarkdown) {
              console.log('Bullet list spacing fixed:', {
                before: rawMarkdown.split('\n'),
                after: cleanedMarkdown.split('\n'),
              });
            }

            return cleanedMarkdown;
          } catch (error) {
            console.warn('Failed to get markdown content:', error);
            return '';
          }
        },

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
      }),
      []
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

          console.log('Crepe editor initialized successfully', { readOnly });

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
        if (crepeRef.current) {
          crepeRef.current.destroy();
          crepeRef.current = null;
        }
        setIsInitialized(false);
      };
    }, [defaultValue, readOnly, placeholder]); // Keep minimal dependencies

    // Separate effect for onChange handling to prevent editor re-initialization
    useEffect(() => {
      if (!onChangeRef.current || readOnly || !crepeRef.current) {
        return;
      }

      let debounceTimeout: NodeJS.Timeout;

      const handleChange = () => {
        // Clear previous timeout
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }

        // Debounce the onChange call to prevent excessive updates
        debounceTimeout = setTimeout(() => {
          if (crepeRef.current?.editor && onChangeRef.current) {
            try {
              const markdown = crepeRef.current.editor.action(getMarkdown());
              onChangeRef.current(markdown);
            } catch (error) {
              console.warn('Failed to get markdown for onChange:', error);
            }
          }
        }, 500); // 500ms debounce to be less aggressive
      };

      // Add event listeners to the ProseMirror editor
      const proseMirror = editorRef.current?.querySelector('.ProseMirror');
      if (proseMirror) {
        // Use more specific events to avoid excessive firing
        proseMirror.addEventListener('input', handleChange);
        proseMirror.addEventListener('paste', handleChange);

        // Cleanup function
        return () => {
          if (debounceTimeout) {
            clearTimeout(debounceTimeout);
          }
          proseMirror.removeEventListener('input', handleChange);
          proseMirror.removeEventListener('paste', handleChange);
        };
      }
    }, [readOnly]); // Only depend on readOnly, not on onChange

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
      </Box>
    );
  }
);

MilkdownEditor.displayName = 'MilkdownEditor';

export default MilkdownEditor;

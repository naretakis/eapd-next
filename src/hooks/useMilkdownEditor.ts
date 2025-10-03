/**
 * Custom hook for standardized Milkdown editor integration
 *
 * This hook provides a consistent pattern for using Milkdown editors
 * with ref-based content synchronization across the application.
 */

import { useRef, useEffect, useCallback } from 'react';
import { MilkdownEditorRef } from '@/components/forms/MilkdownEditor';

export interface UseMilkdownEditorOptions {
  /**
   * Initial content for the editor
   */
  initialContent?: string;
  /**
   * Callback fired when content changes
   */
  onContentChange?: (content: string) => void;
  /**
   * Whether the editor is read-only
   */
  readOnly?: boolean;
  /**
   * Polling interval for content synchronization
   * Default: 1000ms for validation contexts, 500ms for responsive contexts
   */
  pollingInterval?: number;
  /**
   * Whether to enable automatic polling
   * Default: true (disabled automatically for read-only editors)
   */
  enablePolling?: boolean;
}

export interface UseMilkdownEditorReturn {
  /**
   * Ref to attach to the MilkdownEditor component
   */
  editorRef: React.RefObject<MilkdownEditorRef>;
  /**
   * Get current content from the editor
   */
  getContent: () => string;
  /**
   * Force immediate content synchronization
   */
  syncContent: () => string;
  /**
   * Insert content at cursor position
   */
  insertContent: (content: string, inline?: boolean) => void;
  /**
   * Replace all editor content
   */
  replaceContent: (content: string) => void;
  /**
   * Get HTML representation of content
   */
  getHTML: () => string;
  /**
   * Get document outline
   */
  getOutline: () => Array<{ text: string; level: number; id: string }>;
}

/**
 * Custom hook for standardized Milkdown editor integration
 */
export const useMilkdownEditor = (
  options: UseMilkdownEditorOptions = {}
): UseMilkdownEditorReturn => {
  const {
    initialContent = '',
    onContentChange,
    readOnly = false,
    pollingInterval = 1000,
    enablePolling = !readOnly,
  } = options;

  const editorRef = useRef<MilkdownEditorRef>(null);

  // Set up content change listener using standardized approach
  useEffect(() => {
    if (!onContentChange || !editorRef.current) {
      return;
    }

    const cleanup = editorRef.current.onContentChange(onContentChange);
    return cleanup;
  }, [onContentChange]);

  // Utility functions
  const getContent = useCallback(() => {
    return editorRef.current?.getMarkdown() || '';
  }, []);

  const syncContent = useCallback(() => {
    return editorRef.current?.syncContent() || '';
  }, []);

  const insertContent = useCallback((content: string, inline = false) => {
    editorRef.current?.insertContent(content, inline);
  }, []);

  const replaceContent = useCallback((content: string) => {
    editorRef.current?.replaceAllContent(content);
  }, []);

  const getHTML = useCallback(() => {
    return editorRef.current?.getHTML() || '';
  }, []);

  const getOutline = useCallback(() => {
    return editorRef.current?.getOutline() || [];
  }, []);

  return {
    editorRef,
    getContent,
    syncContent,
    insertContent,
    replaceContent,
    getHTML,
    getOutline,
  };
};

export default useMilkdownEditor;

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Content Protection Hook
 * Prevents copying, right-click, and other content extraction methods
 * while maintaining accessibility and user experience
 * 
 * EXCLUDED: Admin portal (/admin) - full functionality for administrators
 */
export const useContentProtection = () => {
    const location = useLocation();

    useEffect(() => {
        // Skip protection on admin routes
        if (location.pathname.startsWith('/admin')) {
            return;
        }
        // Disable right-click context menu
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // Disable keyboard shortcuts for copying
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+S, Ctrl+U (view source)
            if (
                (e.ctrlKey || e.metaKey) &&
                (e.key === 'c' || e.key === 'x' || e.key === 'a' || e.key === 's' || e.key === 'u')
            ) {
                // Allow in input fields
                const target = e.target as HTMLElement;
                if (
                    target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable
                ) {
                    return;
                }
                e.preventDefault();
                return false;
            }

            // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J (developer tools)
            if (
                e.key === 'F12' ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
            ) {
                e.preventDefault();
                return false;
            }
        };

        // Disable text selection via mouse
        const handleSelectStart = (e: Event) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable ||
                target.classList.contains('allow-select')
            ) {
                return;
            }
            e.preventDefault();
            return false;
        };

        // Prevent drag events on images
        const handleDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
                e.preventDefault();
                return false;
            }
        };

        // Disable copy event
        const handleCopy = (e: ClipboardEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }
            e.preventDefault();
            return false;
        };

        // Disable cut event
        const handleCut = (e: ClipboardEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }
            e.preventDefault();
            return false;
        };

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('cut', handleCut);

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('cut', handleCut);
        };
    }, [location.pathname]);
};

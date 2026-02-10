import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Popover = ({ isOpen, onClose, children }: PopoverProps) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div
        ref={popoverRef}
        className="fixed z-50 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-2xl w-[200px] max-w-[calc(100vw-2rem)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)]">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Actions</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--bg-secondary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-2">{children}</div>
      </div>
    </>
  );
};

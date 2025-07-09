import React, { useEffect } from 'react';
import { Keyboard, X, HelpCircle } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  isOpen,
  onClose
}) => {
  const shortcuts: Shortcut[] = [
    // Navigation
    { key: 'Ctrl + 1', description: 'Przejdź do Dashboard', category: 'Nawigacja' },
    { key: 'Ctrl + 2', description: 'Przejdź do Analityki', category: 'Nawigacja' },
    { key: 'Ctrl + 3', description: 'Przejdź do Slotów', category: 'Nawigacja' },
    { key: 'Ctrl + 4', description: 'Przejdź do Rezerwacji', category: 'Nawigacja' },
    
    // Analytics
    { key: 'Ctrl + A', description: 'Przełącz na tab Analityka', category: 'Analityka' },
    { key: 'Ctrl + C', description: 'Przełącz na tab Klienci', category: 'Analityka' },
    { key: 'Ctrl + P', description: 'Przełącz na tab Prognozy', category: 'Analityka' },
    { key: 'Ctrl + S', description: 'Przełącz na tab Sezonowość', category: 'Analityka' },
    
    // Actions
    { key: 'Ctrl + E', description: 'Eksportuj dane', category: 'Akcje' },
    { key: 'Ctrl + R', description: 'Odśwież dane', category: 'Akcje' },
    { key: 'Ctrl + F', description: 'Wyszukaj', category: 'Akcje' },
    { key: 'Ctrl + D', description: 'Pokaż/ukryj szczegóły', category: 'Akcje' },
    
    // General
    { key: 'F1', description: 'Pokaż pomoc', category: 'Ogólne' },
    { key: 'Esc', description: 'Zamknij modal/okno', category: 'Ogólne' },
    { key: 'Ctrl + /', description: 'Pokaż skróty klawiszowe', category: 'Ogólne' },
  ];

  const categories = [...new Set(shortcuts.map(s => s.category))];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Skróty klawiszowe</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {categories.map((category) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">{category}</h3>
              <div className="grid gap-3">
                {shortcuts
                  .filter(shortcut => shortcut.category === category)
                  .map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Naciśnij Esc lub Ctrl + / aby zamknąć</span>
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span>Pomoc</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts; 